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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
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

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to export image'))),
      'image/png',
      0.92
    );
  });
}

export function downloadFramedImage(blob: Blob, filename: string) {
  const safe = sanitizeArtworkFilename(filename);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safe;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function shareFramedImage(
  dataUrl: string,
  frameId: FrameId,
  title: string
): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const blob = await createFramedImageBlob(dataUrl, frameId);
  const safeName = sanitizeArtworkFilename(title);
  const displayTitle = displayTitleFromFilename(safeName);
  const file = new File([blob], safeName.replace(/\.png$/i, '') + '-framed.png', {
    type: 'image/png',
  });
  const shareText = '우리 아이의 멋진 작품이에요! BabyArtist에서 만들었어요.';

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: displayTitle,
        text: shareText,
        files: [file],
      });
      return 'shared';
    } catch (err) {
      if ((err as Error).name === 'AbortError') return 'cancelled';
    }
  }

  downloadFramedImage(blob, safeName);
  return 'downloaded';
}

export async function shareFramedImageByEmail(
  dataUrl: string,
  frameId: FrameId,
  title: string
): Promise<void> {
  const blob = await createFramedImageBlob(dataUrl, frameId);
  const safeName = sanitizeArtworkFilename(title);
  const displayTitle = displayTitleFromFilename(safeName);
  const file = new File([blob], safeName.replace(/\.png$/i, '') + '-framed.png', {
    type: 'image/png',
  });
  const subject = encodeURIComponent(`BabyArtist: ${displayTitle}`);
  const body = encodeURIComponent(
    '우리 아이의 그림을 보내드려요!\n\n(첨부 이미지는 저장된 파일을 이메일에 추가해 주세요.)'
  );

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: displayTitle,
        text: '우리 아이의 멋진 작품이에요!',
        files: [file],
      });
      return;
    } catch {
      // fall through
    }
  }

  downloadFramedImage(blob, safeName);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}
