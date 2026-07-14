import { FrameId } from '../frames';

/** Export canvas size — matches DigitalFrameOverlay viewBox */
export const FRAME_VIEWBOX = { w: 1200, h: 800 };

/** Art hole inside the frame (drawing sits here) */
export const ART_HOLE = { x: 120, y: 100, w: 960, h: 600, rx: 42 };

/**
 * SVG markup for the selected frame (drawn OVER the artwork on export).
 * Mirrors DigitalFrameOverlay visuals.
 */
export function getFrameSvgMarkup(frameId: FrameId, uid: string): string {
  if (frameId === 'none') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"></svg>`;
  }

  const maskId = `hole-${uid}`;
  const filterId = `shadow-${uid}`;
  const h = ART_HOLE;

  const wrap = (inner: string, extraDefs = '') =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <mask id="${maskId}">
          <rect width="1200" height="800" fill="#fff"/>
          <rect x="${h.x}" y="${h.y}" width="${h.w}" height="${h.h}" rx="${h.rx}" fill="#000"/>
        </mask>
        <filter id="${filterId}">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity="0.22"/>
        </filter>
        ${extraDefs}
      </defs>
      <g mask="url(#${maskId})" filter="url(#${filterId})">${inner}</g>
      <rect x="${h.x - 8}" y="${h.y - 8}" width="${h.w + 16}" height="${h.h + 16}" rx="${h.rx + 4}"
        fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="6"/>
    </svg>`;

  switch (frameId) {
    case 'classic':
      return wrap(`
        <rect x="28" y="28" width="1144" height="744" rx="68" fill="#8b5a2b"/>
        <rect x="48" y="48" width="1104" height="704" rx="60" fill="#d4a574"/>
        <rect x="68" y="68" width="1064" height="664" rx="52" fill="#f59e0b" opacity="0.85"/>
        <rect x="88" y="88" width="1024" height="624" rx="46" fill="#fde68a" opacity="0.35"/>`);
    case 'pink':
      return wrap(`
        <rect x="32" y="32" width="1136" height="736" rx="80" fill="#f472b6"/>
        <rect x="52" y="52" width="1096" height="696" rx="72" fill="#fbcfe8"/>
        <rect x="72" y="72" width="1056" height="656" rx="64" fill="#fff1f2"/>
        <circle cx="180" cy="160" r="28" fill="#fff" opacity="0.5"/>
        <circle cx="1020" cy="640" r="36" fill="#fff" opacity="0.4"/>`);
    case 'ocean':
      return wrap(`
        <rect x="30" y="30" width="1140" height="740" rx="56" fill="#0369a1"/>
        <rect x="50" y="50" width="1100" height="700" rx="48" fill="#0ea5e9"/>
        <rect x="70" y="70" width="1060" height="660" rx="40" fill="#7dd3fc" opacity="0.9"/>
        <path d="M0 720 Q200 680 400 720 T800 700 T1200 720 V800 H0Z" fill="#0284c7" opacity="0.6"/>
        <path d="M0 760 Q300 720 600 760 T1200 740 V800 H0Z" fill="#38bdf8" opacity="0.5"/>`);
    case 'rainbow':
      return wrap(`
        <rect x="24" y="24" width="1152" height="752" rx="64" fill="#ef4444"/>
        <rect x="36" y="36" width="1128" height="728" rx="58" fill="#f97316"/>
        <rect x="48" y="48" width="1104" height="704" rx="52" fill="#eab308"/>
        <rect x="60" y="60" width="1080" height="680" rx="46" fill="#22c55e"/>
        <rect x="72" y="72" width="1056" height="656" rx="40" fill="#3b82f6"/>
        <rect x="84" y="84" width="1032" height="632" rx="34" fill="#a855f7"/>
        <rect x="96" y="96" width="1008" height="608" rx="28" fill="#ec4899" opacity="0.85"/>`);
    case 'starry':
      return wrap(`
        <rect x="30" y="30" width="1140" height="740" rx="48" fill="#1e1b4b"/>
        <rect x="50" y="50" width="1100" height="700" rx="40" fill="#312e81"/>
        <rect x="70" y="70" width="1060" height="660" rx="32" fill="#4c1d95" opacity="0.9"/>
        <circle cx="200" cy="180" r="4" fill="#fef08a"/><circle cx="980" cy="200" r="2.5" fill="#fef08a"/>
        <circle cx="150" cy="620" r="4" fill="#fef08a"/><circle cx="1050" cy="580" r="2.5" fill="#fef08a"/>
        <circle cx="600" cy="120" r="4" fill="#fef08a"/><circle cx="400" cy="700" r="2.5" fill="#fef08a"/>
        <circle cx="850" cy="650" r="4" fill="#fef08a"/><circle cx="300" cy="400" r="2.5" fill="#fef08a"/>`);
    case 'polka': {
      const dots = Array.from({ length: 48 }, (_, i) => {
        const col = i % 8;
        const row = Math.floor(i / 8);
        const colors = ['#f472b6', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa'];
        return `<circle cx="${80 + col * 140}" cy="${60 + row * 90}" r="14" fill="${colors[i % colors.length]}" opacity="0.85"/>`;
      }).join('');
      return wrap(`
        <rect x="32" y="32" width="1136" height="736" rx="56" fill="#fff"/>
        <rect x="52" y="52" width="1096" height="696" rx="48" fill="#fdf2f8"/>
        ${dots}`);
    }
    case 'heart':
      return wrap(`
        <rect x="32" y="32" width="1136" height="736" rx="64" fill="#fb7185"/>
        <rect x="52" y="52" width="1096" height="696" rx="56" fill="#fda4af"/>
        <rect x="72" y="72" width="1056" height="656" rx="48" fill="#ffe4e6"/>
        <path d="M160 162 C140 140 125 158 160 182 C195 158 180 140 160 162Z" fill="#e11d48" opacity="0.85"/>
        <path d="M1040 162 C1020 140 1005 158 1040 182 C1075 158 1060 140 1040 162Z" fill="#e11d48" opacity="0.85"/>
        <path d="M160 662 C140 640 125 658 160 682 C195 658 180 640 160 662Z" fill="#e11d48" opacity="0.85"/>
        <path d="M1040 662 C1020 640 1005 658 1040 682 C1075 658 1060 640 1040 662Z" fill="#e11d48" opacity="0.85"/>`);
    case 'neon':
      return wrap(`
        <rect x="28" y="28" width="1144" height="744" rx="40" fill="#0f172a"/>
        <rect x="40" y="40" width="1120" height="720" rx="32" fill="none" stroke="#22d3ee" stroke-width="12"/>
        <rect x="56" y="56" width="1088" height="688" rx="24" fill="none" stroke="#e879f9" stroke-width="8"/>
        <rect x="72" y="72" width="1056" height="656" rx="20" fill="#1e293b" opacity="0.95"/>`);
    case 'polaroid':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
        <rect x="60" y="40" width="1080" height="720" rx="8" fill="#f8fafc"/>
        <rect x="80" y="60" width="1040" height="560" rx="4" fill="#fff" stroke="#e2e8f0" stroke-width="4"/>
        <rect x="60" y="620" width="1080" height="140" fill="#f1f5f9"/>
        <text x="600" y="700" text-anchor="middle" fill="#94a3b8" font-size="36"
          font-family="system-ui,sans-serif" font-weight="700">BabyArtist</text>
      </svg>`;
    case 'flower':
      return wrap(`
        <rect x="32" y="32" width="1136" height="736" rx="56" fill="#86efac"/>
        <rect x="52" y="52" width="1096" height="696" rx="48" fill="#bbf7d0"/>
        <rect x="72" y="72" width="1056" height="656" rx="40" fill="#f0fdf4"/>
        <g transform="translate(110 100)">
          <ellipse cx="30" cy="18" rx="14" ry="22" fill="#f472b6" transform="rotate(0 30 30)" opacity="0.9"/>
          <ellipse cx="30" cy="18" rx="14" ry="22" fill="#f472b6" transform="rotate(72 30 30)" opacity="0.9"/>
          <ellipse cx="30" cy="18" rx="14" ry="22" fill="#f472b6" transform="rotate(144 30 30)" opacity="0.9"/>
          <ellipse cx="30" cy="18" rx="14" ry="22" fill="#f472b6" transform="rotate(216 30 30)" opacity="0.9"/>
          <ellipse cx="30" cy="18" rx="14" ry="22" fill="#f472b6" transform="rotate(288 30 30)" opacity="0.9"/>
          <circle cx="30" cy="30" r="10" fill="#fbbf24"/>
        </g>`);
    default:
      return wrap(`<rect x="40" y="40" width="1120" height="720" rx="48" fill="#a8a29e"/>`);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (/^https?:\/\//i.test(src)) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function drawContained(
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
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

/**
 * Hidden temporary canvas: drawing + selected frame → PNG Blob.
 */
export async function createFramedPngBlob(
  dataUrl: string,
  frameId: FrameId
): Promise<Blob> {
  const { w, h } = FRAME_VIEWBOX;
  const hole = ART_HOLE;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  const art = await loadImage(dataUrl);
  if (frameId === 'polaroid') {
    drawContained(ctx, art, 80, 60, 1040, 560);
  } else if (frameId === 'none') {
    drawContained(ctx, art, 0, 0, w, h);
  } else {
    drawContained(ctx, art, hole.x, hole.y, hole.w, hole.h);
  }

  if (frameId !== 'none') {
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const svg = getFrameSvgMarkup(frameId, uid);
    const frameUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    const frameImg = await loadImage(frameUrl);
    ctx.drawImage(frameImg, 0, 0, w, h);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b && b.size > 0 ? resolve(b) : reject(new Error('Empty PNG'))),
      'image/png',
      0.92
    );
  });

  return blob.type === 'image/png' ? blob : new Blob([blob], { type: 'image/png' });
}

export async function createFramedPngFile(
  dataUrl: string,
  frameId: FrameId,
  filename: string
): Promise<File> {
  const blob = await createFramedPngBlob(dataUrl, frameId);
  const buffer = await blob.arrayBuffer();
  if (buffer.byteLength === 0) throw new Error('Empty PNG');
  const name = filename.replace(/\.png$/i, '') + '-framed.png';
  return new File([buffer], name, { type: 'image/png', lastModified: Date.now() });
}
