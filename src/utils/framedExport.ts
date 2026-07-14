import { FrameId } from '../frames';
import {
  FRAME_VIEWBOX,
  getArtHole,
  getFrameSvgMarkup,
} from './frameSvg';
import {
  displayTitleFromFilename,
  sanitizeArtworkFilename,
} from './artworkNaming';

export type ShareResult = 'shared' | 'downloaded' | 'cancelled';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set CORS for http(s); data: URLs can fail to paint with crossOrigin.
    if (/^https?:\/\//i.test(src)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load artwork image'));
    img.src = src;
  });
}

function drawImageContained(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const scale = Math.min(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/** Canvas → PNG Blob with an explicit MIME type (required for Web Share attachments). */
export async function createFramedImageBlob(
  dataUrl: string,
  frameId: FrameId
): Promise<Blob> {
  const { w, h } = FRAME_VIEWBOX;
  const hole = getArtHole(frameId);
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  const artwork = await loadImage(dataUrl);
  drawImageContained(ctx, artwork, hole.x, hole.y, hole.w, hole.h);

  const frameSvg = getFrameSvgMarkup(frameId, uid);
  const frameUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(frameSvg)}`;
  const frameImg = await loadImage(frameUrl);
  ctx.drawImage(frameImg, 0, 0, w, h);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Failed to export image'))),
      'image/png',
      0.92
    );
  });

  // Some browsers return Blob with empty type — normalize for canShare/File.
  if (blob.type === 'image/png') return blob;
  return new Blob([blob], { type: 'image/png' });
}

/** Build a real PNG File suitable for navigator.share({ files }). */
export async function createFramedImageFile(
  dataUrl: string,
  frameId: FrameId,
  title: string
): Promise<{ blob: Blob; file: File; filename: string; displayTitle: string }> {
  const blob = await createFramedImageBlob(dataUrl, frameId);
  const filename = sanitizeArtworkFilename(title).replace(/\.png$/i, '') + '-framed.png';
  const displayTitle = displayTitleFromFilename(sanitizeArtworkFilename(title));

  // ArrayBuffer construction is the most reliable for iOS Web Share attachments.
  const buffer = await blob.arrayBuffer();
  const file = new File([buffer], filename, {
    type: 'image/png',
    lastModified: Date.now(),
  });

  return { blob, file, filename, displayTitle };
}

export function canShareFiles(file: File): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return false;
  }
  try {
    if (typeof navigator.canShare !== 'function') {
      // Older share-capable browsers: attempt share; caller catches failures.
      return true;
    }
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

/**
 * Prefer files-only share (iOS often rejects files+text).
 * Fall back to title/text+files, then to download.
 */
export async function sharePngFile(
  file: File,
  blob: Blob,
  opts: { displayTitle: string; text?: string; downloadName: string }
): Promise<ShareResult> {
  if (canShareFiles(file)) {
    try {
      // 1) Files only — most reliable attachment path on mobile
      await navigator.share({ files: [file] });
      return 'shared';
    } catch (err) {
      if ((err as Error).name === 'AbortError') return 'cancelled';
      try {
        // 2) Retry with metadata when files-only is unsupported oddly
        await navigator.share({
          files: [file],
          title: opts.displayTitle,
          text: opts.text,
        });
        return 'shared';
      } catch (err2) {
        if ((err2 as Error).name === 'AbortError') return 'cancelled';
        // Fall through to download
      }
    }
  }

  downloadFramedImage(blob, opts.downloadName);
  return 'downloaded';
}

export function downloadFramedImage(blob: Blob, filename: string) {
  const safe = sanitizeArtworkFilename(filename);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safe.endsWith('.png') ? safe : `${safe}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function shareFramedImage(
  dataUrl: string,
  frameId: FrameId,
  title: string
): Promise<ShareResult> {
  const { blob, file, displayTitle } = await createFramedImageFile(dataUrl, frameId, title);
  return sharePngFile(file, blob, {
    displayTitle,
    text: '우리 아이의 멋진 작품이에요! BabyArtist에서 만들었어요.',
    downloadName: sanitizeArtworkFilename(title),
  });
}

export async function shareFramedImageByEmail(
  dataUrl: string,
  frameId: FrameId,
  title: string
): Promise<ShareResult> {
  const { blob, file, displayTitle } = await createFramedImageFile(dataUrl, frameId, title);

  // Email apps that support Web Share files will receive a real attachment.
  const result = await sharePngFile(file, blob, {
    displayTitle,
    text: `BabyArtist: ${displayTitle}`,
    downloadName: sanitizeArtworkFilename(title),
  });

  if (result === 'downloaded') {
    // mailto cannot attach binary files — open compose after download as last resort
    const subject = encodeURIComponent(`BabyArtist: ${displayTitle}`);
    const body = encodeURIComponent(
      '우리 아이의 그림을 보내드려요!\n\n방금 저장된 액자 이미지를 이메일에 첨부해 주세요.'
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return result;
}
