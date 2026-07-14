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
import { forceDownloadBlob } from './forceDownload';

export type ShareResult = 'shared' | 'downloaded' | 'cancelled';

export interface SharePrepareOptions {
  /** Called if conversion takes longer than preparingDelayMs (default 1000). */
  onPreparing?: () => void;
  /** When to show the preparing spinner. Default 1000ms. */
  preparingDelayMs?: number;
}

function getTestConvertDelayMs(): number {
  if (typeof window === 'undefined') return 0;
  const v = (window as unknown as { __BABYARTIST_SHARE_CONVERT_DELAY_MS?: number })
    .__BABYARTIST_SHARE_CONVERT_DELAY_MS;
  return typeof v === 'number' && v > 0 ? v : 0;
}

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

/**
 * Wait-and-verify: materialize File bytes and confirm size > 0 + OS-readable
 * before any share/mail intent runs.
 */
export async function waitAndVerifyShareableFile(
  file: File,
  blob: Blob
): Promise<{ blob: Blob; file: File; byteLength: number }> {
  if (!blob || blob.size <= 0) {
    throw new Error('Empty image blob');
  }

  // Physically read the blob so conversion/`toBlob` is fully flushed.
  const buffer = await blob.arrayBuffer();
  if (buffer.byteLength <= 0) {
    throw new Error('Empty image buffer');
  }

  const verifiedBlob = new Blob([buffer], { type: 'image/png' });
  const verifiedFile = new File([buffer], file.name || 'drawing-framed.png', {
    type: 'image/png',
    lastModified: Date.now(),
  });

  if (verifiedFile.size <= 0 || verifiedBlob.size <= 0) {
    throw new Error('Empty share file');
  }

  // Second read: proves the File is readable (what mail/OS attachment pipelines use).
  const recheck = await verifiedFile.arrayBuffer();
  if (recheck.byteLength <= 0 || recheck.byteLength !== verifiedFile.size) {
    throw new Error('Share file not readable');
  }

  return { blob: verifiedBlob, file: verifiedFile, byteLength: recheck.byteLength };
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
  if (buffer.byteLength <= 0) {
    throw new Error('Empty image buffer');
  }

  const file = new File([buffer], filename, {
    type: 'image/png',
    lastModified: Date.now(),
  });

  return { blob: new Blob([buffer], { type: 'image/png' }), file, filename, displayTitle };
}

/**
 * Convert → wait/verify size>0 → only then hand back a share-ready File.
 * Shows preparing UX via onPreparing if slower than ~1s.
 */
export async function prepareVerifiedShareFile(
  dataUrl: string,
  frameId: FrameId,
  title: string,
  opts: SharePrepareOptions = {}
): Promise<{ blob: Blob; file: File; filename: string; displayTitle: string; byteLength: number }> {
  const preparingDelayMs = opts.preparingDelayMs ?? 1000;
  let preparingTimer: ReturnType<typeof setTimeout> | undefined;

  if (opts.onPreparing) {
    preparingTimer = setTimeout(() => {
      opts.onPreparing?.();
    }, preparingDelayMs);
  }

  try {
    const testDelay = getTestConvertDelayMs();
    if (testDelay > 0) {
      await new Promise((r) => setTimeout(r, testDelay));
    }

    const created = await createFramedImageFile(dataUrl, frameId, title);
    const verified = await waitAndVerifyShareableFile(created.file, created.blob);

    return {
      blob: verified.blob,
      file: verified.file,
      filename: created.filename,
      displayTitle: created.displayTitle,
      byteLength: verified.byteLength,
    };
  } finally {
    if (preparingTimer) clearTimeout(preparingTimer);
  }
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
 * Never call share until file size has been verified > 0.
 */
export async function sharePngFile(
  file: File,
  blob: Blob,
  opts: { displayTitle: string; text?: string; downloadName: string }
): Promise<ShareResult> {
  if (file.size <= 0 || blob.size <= 0) {
    throw new Error('Empty share file');
  }

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
  if (!blob || blob.size <= 0) {
    throw new Error('Empty image blob');
  }
  forceDownloadBlob(blob, filename);
}

export async function shareFramedImage(
  dataUrl: string,
  frameId: FrameId,
  title: string,
  opts: SharePrepareOptions = {}
): Promise<ShareResult> {
  const { blob, file, displayTitle, byteLength } = await prepareVerifiedShareFile(
    dataUrl,
    frameId,
    title,
    opts
  );
  if (byteLength <= 0) throw new Error('Empty share file');

  return sharePngFile(file, blob, {
    displayTitle,
    text: '우리 아이의 멋진 작품이에요! BabyArtist에서 만들었어요.',
    downloadName: sanitizeArtworkFilename(title),
  });
}

export async function shareFramedImageByEmail(
  dataUrl: string,
  frameId: FrameId,
  title: string,
  opts: SharePrepareOptions = {}
): Promise<ShareResult> {
  const { blob, file, displayTitle, byteLength } = await prepareVerifiedShareFile(
    dataUrl,
    frameId,
    title,
    opts
  );
  if (byteLength <= 0) throw new Error('Empty share file');

  // Email apps that support Web Share files will receive a real attachment.
  // Intentionally after wait/verify — never open mail with an empty file.
  const result = await sharePngFile(file, blob, {
    displayTitle,
    text: `BabyArtist: ${displayTitle}`,
    downloadName: sanitizeArtworkFilename(title),
  });

  if (result === 'downloaded') {
    // mailto cannot attach binary files — open compose after verified download
    const subject = encodeURIComponent(`BabyArtist: ${displayTitle}`);
    const body = encodeURIComponent(
      '우리 아이의 그림을 보내드려요!\n\n방금 저장된 액자 이미지를 이메일에 첨부해 주세요.'
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return result;
}
