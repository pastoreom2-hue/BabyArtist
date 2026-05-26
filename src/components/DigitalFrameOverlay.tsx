import React from 'react';
import { FrameId } from '../frames';

interface DigitalFrameOverlayProps {
  frameId: FrameId;
}

const VB = '0 0 1200 800';
const HOLE = { x: 120, y: 100, w: 960, h: 600, rx: 42 };

function FrameMask({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox={VB}
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <mask id="frame-hole">
          <rect width="1200" height="800" fill="#fff" />
          <rect
            x={HOLE.x}
            y={HOLE.y}
            width={HOLE.w}
            height={HOLE.h}
            rx={HOLE.rx}
            fill="#000"
          />
        </mask>
        <filter id="frame-shadow">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.22" />
        </filter>
      </defs>
      <g mask="url(#frame-hole)" filter="url(#frame-shadow)">
        {children}
      </g>
      <rect
        x={HOLE.x - 8}
        y={HOLE.y - 8}
        width={HOLE.w + 16}
        height={HOLE.h + 16}
        rx={HOLE.rx + 4}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.45"
        strokeWidth="6"
      />
    </svg>
  );
}

export const DigitalFrameOverlay: React.FC<DigitalFrameOverlayProps> = ({ frameId }) => {
  if (frameId === 'none') return null;

  switch (frameId) {
    case 'classic':
      return (
        <FrameMask>
          <rect x="28" y="28" width="1144" height="744" rx="68" fill="#8b5a2b" />
          <rect x="48" y="48" width="1104" height="704" rx="60" fill="#d4a574" />
          <rect x="68" y="68" width="1064" height="664" rx="52" fill="#f59e0b" opacity="0.85" />
          <rect x="88" y="88" width="1024" height="624" rx="46" fill="#fde68a" opacity="0.35" />
        </FrameMask>
      );

    case 'pink':
      return (
        <FrameMask>
          <rect x="32" y="32" width="1136" height="736" rx="80" fill="#f472b6" />
          <rect x="52" y="52" width="1096" height="696" rx="72" fill="#fbcfe8" />
          <rect x="72" y="72" width="1056" height="656" rx="64" fill="#fff1f2" />
          <circle cx="180" cy="160" r="28" fill="#fff" opacity="0.5" />
          <circle cx="1020" cy="640" r="36" fill="#fff" opacity="0.4" />
        </FrameMask>
      );

    case 'ocean':
      return (
        <FrameMask>
          <rect x="30" y="30" width="1140" height="740" rx="56" fill="#0369a1" />
          <rect x="50" y="50" width="1100" height="700" rx="48" fill="#0ea5e9" />
          <rect x="70" y="70" width="1060" height="660" rx="40" fill="#7dd3fc" opacity="0.9" />
          <path
            d="M0 720 Q200 680 400 720 T800 700 T1200 720 V800 H0Z"
            fill="#0284c7"
            opacity="0.6"
          />
          <path
            d="M0 760 Q300 720 600 760 T1200 740 V800 H0Z"
            fill="#38bdf8"
            opacity="0.5"
          />
        </FrameMask>
      );

    case 'rainbow':
      return (
        <FrameMask>
          <rect x="24" y="24" width="1152" height="752" rx="64" fill="#ef4444" />
          <rect x="36" y="36" width="1128" height="728" rx="58" fill="#f97316" />
          <rect x="48" y="48" width="1104" height="704" rx="52" fill="#eab308" />
          <rect x="60" y="60" width="1080" height="680" rx="46" fill="#22c55e" />
          <rect x="72" y="72" width="1056" height="656" rx="40" fill="#3b82f6" />
          <rect x="84" y="84" width="1032" height="632" rx="34" fill="#a855f7" />
          <rect x="96" y="96" width="1008" height="608" rx="28" fill="#ec4899" opacity="0.85" />
        </FrameMask>
      );

    case 'starry':
      return (
        <FrameMask>
          <rect x="30" y="30" width="1140" height="740" rx="48" fill="#1e1b4b" />
          <rect x="50" y="50" width="1100" height="700" rx="40" fill="#312e81" />
          <rect x="70" y="70" width="1060" height="660" rx="32" fill="#4c1d95" opacity="0.9" />
          {[
            [200, 180],
            [980, 200],
            [150, 620],
            [1050, 580],
            [600, 120],
            [400, 700],
            [850, 650],
            [300, 400],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={i % 2 === 0 ? 4 : 2.5} fill="#fef08a" opacity="0.9" />
          ))}
        </FrameMask>
      );

    case 'polka':
      return (
        <FrameMask>
          <rect x="32" y="32" width="1136" height="736" rx="56" fill="#fff" />
          <rect x="52" y="52" width="1096" height="696" rx="48" fill="#fdf2f8" />
          {Array.from({ length: 48 }).map((_, i) => {
            const col = i % 8;
            const row = Math.floor(i / 8);
            const colors = ['#f472b6', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa'];
            return (
              <circle
                key={i}
                cx={80 + col * 140}
                cy={60 + row * 90}
                r="14"
                fill={colors[i % colors.length]}
                opacity="0.85"
              />
            );
          })}
        </FrameMask>
      );

    case 'heart':
      return (
        <FrameMask>
          <rect x="32" y="32" width="1136" height="736" rx="64" fill="#fb7185" />
          <rect x="52" y="52" width="1096" height="696" rx="56" fill="#fda4af" />
          <rect x="72" y="72" width="1056" height="656" rx="48" fill="#ffe4e6" />
          {[
            [160, 150],
            [1040, 150],
            [160, 650],
            [1040, 650],
          ].map(([x, y], i) => (
            <path
              key={i}
              d={`M${x} ${y + 12} C${x - 20} ${y - 10} ${x - 35} ${y + 8} ${x} ${y + 32} C${x + 35} ${y + 8} ${x + 20} ${y - 10} ${x} ${y + 12}Z`}
              fill="#e11d48"
              opacity="0.85"
            />
          ))}
        </FrameMask>
      );

    case 'neon':
      return (
        <FrameMask>
          <rect x="28" y="28" width="1144" height="744" rx="40" fill="#0f172a" />
          <rect
            x="40"
            y="40"
            width="1120"
            height="720"
            rx="32"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="12"
          />
          <rect
            x="56"
            y="56"
            width="1088"
            height="688"
            rx="24"
            fill="none"
            stroke="#e879f9"
            strokeWidth="8"
          />
          <rect x="72" y="72" width="1056" height="656" rx="20" fill="#1e293b" opacity="0.95" />
        </FrameMask>
      );

    case 'polaroid':
      return (
        <svg
          viewBox={VB}
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          preserveAspectRatio="none"
          aria-hidden
        >
          <rect x="60" y="40" width="1080" height="720" rx="8" fill="#f8fafc" />
          <rect x="80" y="60" width="1040" height="560" rx="4" fill="#fff" stroke="#e2e8f0" strokeWidth="4" />
          <rect x="60" y="620" width="1080" height="140" fill="#f1f5f9" />
          <text
            x="600"
            y="700"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="36"
            fontFamily="system-ui, sans-serif"
            fontWeight="700"
          >
            BabyArtist
          </text>
        </svg>
      );

    case 'flower':
      return (
        <FrameMask>
          <rect x="32" y="32" width="1136" height="736" rx="56" fill="#86efac" />
          <rect x="52" y="52" width="1096" height="696" rx="48" fill="#bbf7d0" />
          <rect x="72" y="72" width="1056" height="656" rx="40" fill="#f0fdf4" />
          {[
            [140, 130],
            [1060, 130],
            [140, 670],
            [1060, 670],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x - 30} ${y - 30})`}>
              {[0, 72, 144, 216, 288].map((rot) => (
                <ellipse
                  key={rot}
                  cx="30"
                  cy="18"
                  rx="14"
                  ry="22"
                  fill={['#f472b6', '#fbbf24', '#a78bfa', '#60a5fa'][i % 4]}
                  transform={`rotate(${rot} 30 30)`}
                  opacity="0.9"
                />
              ))}
              <circle cx="30" cy="30" r="10" fill="#fbbf24" />
            </g>
          ))}
        </FrameMask>
      );

    default:
      return null;
  }
};
