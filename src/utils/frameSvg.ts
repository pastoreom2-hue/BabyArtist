import { FrameId } from '../frames';

export const FRAME_VIEWBOX = { w: 1200, h: 800 };
export const FRAME_HOLE = { x: 120, y: 100, w: 960, h: 600, rx: 42 };
export const POLAROID_HOLE = { x: 80, y: 60, w: 1040, h: 560, rx: 4 };

export function getArtHole(frameId: FrameId) {
  return frameId === 'polaroid' ? POLAROID_HOLE : FRAME_HOLE;
}

export function getFrameSvgMarkup(frameId: FrameId, uid: string): string {
  if (frameId === 'none') {
    const h = getArtHole(frameId);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <rect x="${h.x - 6}" y="${h.y - 6}" width="${h.w + 12}" height="${h.h + 12}" rx="${h.rx + 4}"
        fill="none" stroke="#facc15" stroke-width="12"/>
    </svg>`;
  }

  const maskId = `mask-${uid}`;
  const filterId = `shadow-${uid}`;

  const frameBody: Record<Exclude<FrameId, 'none'>, string> = {
    classic: `
      <rect x="28" y="28" width="1144" height="744" rx="68" fill="#8b5a2b"/>
      <rect x="48" y="48" width="1104" height="704" rx="60" fill="#d4a574"/>
      <rect x="68" y="68" width="1064" height="664" rx="52" fill="#f59e0b" opacity="0.85"/>
      <rect x="88" y="88" width="1024" height="624" rx="46" fill="#fde68a" opacity="0.35"/>`,
    pink: `
      <rect x="32" y="32" width="1136" height="736" rx="80" fill="#f472b6"/>
      <rect x="52" y="52" width="1096" height="696" rx="72" fill="#fbcfe8"/>
      <rect x="72" y="72" width="1056" height="656" rx="64" fill="#fff1f2"/>
      <circle cx="180" cy="160" r="28" fill="#fff" opacity="0.5"/>
      <circle cx="1020" cy="640" r="36" fill="#fff" opacity="0.4"/>`,
    ocean: `
      <rect x="30" y="30" width="1140" height="740" rx="56" fill="#0369a1"/>
      <rect x="50" y="50" width="1100" height="700" rx="48" fill="#0ea5e9"/>
      <rect x="70" y="70" width="1060" height="660" rx="40" fill="#7dd3fc" opacity="0.9"/>
      <path d="M0 720 Q200 680 400 720 T800 700 T1200 720 V800 H0Z" fill="#0284c7" opacity="0.6"/>
      <path d="M0 760 Q300 720 600 760 T1200 740 V800 H0Z" fill="#38bdf8" opacity="0.5"/>`,
    rainbow: `
      <rect x="24" y="24" width="1152" height="752" rx="64" fill="#ef4444"/>
      <rect x="36" y="36" width="1128" height="728" rx="58" fill="#f97316"/>
      <rect x="48" y="48" width="1104" height="704" rx="52" fill="#eab308"/>
      <rect x="60" y="60" width="1080" height="680" rx="46" fill="#22c55e"/>
      <rect x="72" y="72" width="1056" height="656" rx="40" fill="#3b82f6"/>
      <rect x="84" y="84" width="1032" height="632" rx="34" fill="#a855f7"/>
      <rect x="96" y="96" width="1008" height="608" rx="28" fill="#ec4899" opacity="0.85"/>`,
    starry: `
      <rect x="30" y="30" width="1140" height="740" rx="48" fill="#1e1b4b"/>
      <rect x="50" y="50" width="1100" height="700" rx="40" fill="#312e81"/>
      <rect x="70" y="70" width="1060" height="660" rx="32" fill="#4c1d95" opacity="0.9"/>
      <circle cx="200" cy="180" r="4" fill="#fef08a"/><circle cx="980" cy="200" r="2.5" fill="#fef08a"/>
      <circle cx="150" cy="620" r="4" fill="#fef08a"/><circle cx="1050" cy="580" r="2.5" fill="#fef08a"/>
      <circle cx="600" cy="120" r="4" fill="#fef08a"/><circle cx="400" cy="700" r="2.5" fill="#fef08a"/>
      <circle cx="850" cy="650" r="4" fill="#fef08a"/><circle cx="300" cy="400" r="2.5" fill="#fef08a"/>`,
    polka: `
      <rect x="32" y="32" width="1136" height="736" rx="56" fill="#fff"/>
      <rect x="52" y="52" width="1096" height="696" rx="48" fill="#fdf2f8"/>
      ${Array.from({ length: 48 })
        .map((_, i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          const colors = ['#f472b6', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa'];
          return `<circle cx="${80 + col * 140}" cy="${60 + row * 90}" r="14" fill="${colors[i % colors.length]}" opacity="0.85"/>`;
        })
        .join('')}`,
    heart: `
      <rect x="32" y="32" width="1136" height="736" rx="64" fill="#fb7185"/>
      <rect x="52" y="52" width="1096" height="696" rx="56" fill="#fda4af"/>
      <rect x="72" y="72" width="1056" height="656" rx="48" fill="#ffe4e6"/>
      <path d="M160 162 C140 152 125 158 160 194 C195 158 180 152 160 162Z" fill="#e11d48" opacity="0.85"/>
      <path d="M1040 162 C1020 152 1005 158 1040 194 C1075 158 1060 152 1040 162Z" fill="#e11d48" opacity="0.85"/>
      <path d="M160 662 C140 652 125 658 160 694 C195 658 180 652 160 662Z" fill="#e11d48" opacity="0.85"/>
      <path d="M1040 662 C1020 652 1005 658 1040 694 C1075 658 1060 652 1040 662Z" fill="#e11d48" opacity="0.85"/>`,
    neon: `
      <rect x="28" y="28" width="1144" height="744" rx="40" fill="#0f172a"/>
      <rect x="40" y="40" width="1120" height="720" rx="32" fill="none" stroke="#22d3ee" stroke-width="12"/>
      <rect x="56" y="56" width="1088" height="688" rx="24" fill="none" stroke="#e879f9" stroke-width="8"/>
      <rect x="72" y="72" width="1056" height="656" rx="20" fill="#1e293b" opacity="0.95"/>`,
    polaroid: `
      <rect x="60" y="40" width="1080" height="720" rx="8" fill="#f8fafc"/>
      <rect x="60" y="620" width="1080" height="140" fill="#f1f5f9"/>
      <text x="600" y="700" text-anchor="middle" fill="#94a3b8" font-size="36" font-family="system-ui,sans-serif" font-weight="700">BabyArtist</text>`,
    flower: `
      <rect x="32" y="32" width="1136" height="736" rx="56" fill="#86efac"/>
      <rect x="52" y="52" width="1096" height="696" rx="48" fill="#bbf7d0"/>
      <rect x="72" y="72" width="1056" height="656" rx="40" fill="#f0fdf4"/>`,
  };

  const h = frameId === 'polaroid' ? POLAROID_HOLE : FRAME_HOLE;
  const innerStroke =
    frameId === 'polaroid'
      ? `<rect x="${h.x}" y="${h.y}" width="${h.w}" height="${h.h}" rx="${h.rx}" fill="none" stroke="#e2e8f0" stroke-width="4"/>`
      : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
    <defs>
      <mask id="${maskId}">
        <rect width="1200" height="800" fill="#fff"/>
        <rect x="${h.x}" y="${h.y}" width="${h.w}" height="${h.h}" rx="${h.rx}" fill="#000"/>
      </mask>
      <filter id="${filterId}">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity="0.22"/>
      </filter>
    </defs>
    <g mask="url(#${maskId})" filter="url(#${filterId})">${frameBody[frameId]}</g>
    ${innerStroke}
    <rect x="${h.x - 8}" y="${h.y - 8}" width="${h.w + 16}" height="${h.h + 16}" rx="${h.rx + 4}"
      fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="6"/>
  </svg>`;
}
