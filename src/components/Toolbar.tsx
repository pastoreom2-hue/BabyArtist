import React from 'react';
import { motion } from 'motion/react';
import { COLORS, STICKERS, Sticker } from '../types';
import { Pen, Palette, Sparkles } from 'lucide-react';

interface ToolbarProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  selectedSticker: Sticker | null;
  onStickerChange: (sticker: Sticker | null) => void;
  activeTool: 'pen' | 'sticker';
  onToolChange: (tool: 'pen' | 'sticker') => void;
}

const SIZES = [5, 10, 20, 40];

export const Toolbar: React.FC<ToolbarProps> = ({
  currentColor,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  selectedSticker,
  onStickerChange,
  activeTool,
  onToolChange,
}) => {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 p-2 sm:p-3 w-full max-w-full box-border overflow-x-hidden">
      <div className="grid grid-cols-2 gap-2 w-full max-w-full">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onToolChange('pen')}
          className={`min-h-[44px] py-2.5 px-3 rounded-full border font-semibold uppercase text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTool === 'pen'
              ? 'bg-stone-800 border-stone-800 text-white shadow-sm'
              : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
          }`}
        >
          <Pen size={16} className="sm:w-5 sm:h-5 shrink-0" />
          <span className="hidden md:inline">Magic Pen</span>
          <span className="md:hidden">Pen</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onToolChange('sticker')}
          className={`min-h-[44px] py-2.5 px-3 rounded-full border font-semibold uppercase text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTool === 'sticker'
              ? 'bg-amber-400 border-amber-500 text-white shadow-sm'
              : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
          }`}
        >
          <Sparkles size={16} className="sm:w-5 sm:h-5 shrink-0" />
          <span className="hidden md:inline">Stickers</span>
          <span className="md:hidden">Sticker</span>
        </motion.button>
      </div>

      {activeTool === 'pen' ? (
        <>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-1.5 sm:gap-2 text-pink-600 font-black uppercase tracking-wider text-[10px] sm:text-sm">
              <Palette size={14} className="shrink-0" />
              <span>Colors</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2 lg:gap-2.5">
              {COLORS.map((c) => (
                <motion.button
                  key={c.value}
                  whileHover={{ scale: 1.12, rotate: 4 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => onColorChange(c.value)}
                  className={`aspect-square w-full max-w-[2.75rem] sm:max-w-none sm:w-10 sm:h-10 lg:w-11 lg:h-11 mx-auto rounded-full border-2 sm:border-[3px] transition-all ${
                    currentColor === c.value
                      ? 'border-pink-400 scale-110 shadow-lg ring-2 ring-pink-200'
                      : 'border-gray-100 hover:border-pink-200'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-3 border-t border-pink-100">
            <div className="text-pink-600 font-black uppercase tracking-wider text-[10px] sm:text-sm">
              Brush Size
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {SIZES.map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onBrushSizeChange(s)}
                  className={`min-h-[44px] sm:min-h-[3.25rem] flex items-center justify-center rounded-xl sm:rounded-2xl border-2 sm:border-[3px] transition-all ${
                    brushSize === s
                      ? 'bg-pink-500 border-pink-600 text-white shadow-md'
                      : 'bg-pink-50 border-pink-100 text-pink-300 hover:bg-pink-100'
                  }`}
                  aria-label={`Brush size ${s}`}
                >
                  <div
                    className={`rounded-full bg-current transition-all ${brushSize === s ? 'scale-110' : ''}`}
                    style={{ width: Math.max(4, s / 3.5), height: Math.max(4, s / 3.5) }}
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-600 font-black uppercase tracking-wider text-[10px] sm:text-sm">
            <Sparkles size={14} className="shrink-0" />
            <span>Pick a Sticker</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2 max-h-[40vh] md:max-h-none overflow-y-auto scroll-region pr-0.5">
            {STICKERS.map((sticker) => (
              <motion.button
                key={sticker.id}
                whileHover={{ scale: 1.08, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onStickerChange(sticker)}
                className={`min-h-[44px] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-[3px] transition-all ${
                  selectedSticker?.id === sticker.id
                    ? 'bg-yellow-100 border-yellow-400 shadow-md scale-105'
                    : 'bg-white border-gray-100 hover:border-yellow-200'
                }`}
                aria-label={sticker.name}
              >
                <img
                  src={sticker.url}
                  alt={sticker.name}
                  className="w-6 h-6 sm:w-8 sm:h-8 object-contain mx-auto"
                  referrerPolicy="no-referrer"
                />
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
