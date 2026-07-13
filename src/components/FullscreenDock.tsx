import React from 'react';
import { X } from 'lucide-react';
import { COLORS } from '../types';

/** Essential kid colors — subset for a slim fullscreen dock */
export const FS_CORE_COLORS = COLORS.filter((c) =>
  ['Red', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Black', 'White'].includes(c.name),
);

const FS_BRUSH_SIZES = [5, 10, 20, 40] as const;

interface FullscreenDockProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onExit: () => void;
}

export const FullscreenDock: React.FC<FullscreenDockProps> = ({
  currentColor,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  onExit,
}) => {
  return (
    <div className="fs-floating-dock" data-testid="fs-floating-dock" role="toolbar" aria-label="Fullscreen drawing tools">
      <div className="fs-dock-scroll">
        <div className="fs-dock-group fs-dock-colors" role="group" aria-label="Colors">
          {FS_CORE_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`fs-dock-swatch${currentColor === c.value ? ' is-active' : ''}${c.name === 'White' ? ' is-light' : ''}`}
              style={{ backgroundColor: c.value }}
              onClick={() => onColorChange(c.value)}
              title={c.name}
              aria-label={c.name}
              aria-pressed={currentColor === c.value}
            />
          ))}
        </div>

        <div className="fs-dock-divider" aria-hidden />

        <div className="fs-dock-group fs-dock-sizes" role="group" aria-label="Brush size">
          {FS_BRUSH_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              className={`fs-dock-size${brushSize === s ? ' is-active' : ''}`}
              onClick={() => onBrushSizeChange(s)}
              title={`Brush ${s}`}
              aria-label={`Brush size ${s}`}
              aria-pressed={brushSize === s}
            >
              <span
                className="fs-dock-size-dot"
                style={{ width: Math.max(5, s / 3.2), height: Math.max(5, s / 3.2) }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="fs-dock-divider fs-dock-divider--end" aria-hidden />

      <button
        type="button"
        className="fs-dock-exit"
        onClick={onExit}
        title="Exit Fullscreen"
        aria-label="Exit Fullscreen"
        data-testid="fs-exit-btn"
      >
        <X size={16} strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
};
