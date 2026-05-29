import React from 'react';
import { motion } from 'motion/react';
import { COLORS, STICKERS, Sticker } from '../types';
import { Eraser, Pen, Trash2, Palette, Sparkles, MousePointer2 } from 'lucide-react';

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
  currentColor, onColorChange, brushSize, onBrushSizeChange,
  selectedSticker, onStickerChange, activeTool, onToolChange
}) => {
  return (
    <div className="flex flex-col gap-3 p-1 sm:p-2">
      {/* Tool Selection */}
      <div className="flex gap-1.5 sm:gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToolChange('pen')}
          className={`flex-1 py-2 rounded-full border font-semibold uppercase text-[10px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
            activeTool === 'pen' ? 'bg-stone-800 border-stone-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-500'
          }`}
        >
          <Pen size={16} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Magic Pen</span>
          <span className="sm:hidden text-[7px]">Pen</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToolChange('sticker')}
          className={`flex-1 py-2 rounded-full border font-semibold uppercase text-[10px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
            activeTool === 'sticker' ? 'bg-amber-400 border-amber-500 text-white' : 'bg-stone-50 border-stone-200 text-stone-500'
          }`}
        >
          <Sparkles size={16} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Stickers</span>
          <span className="sm:hidden text-[7px]">Sticker</span>
        </motion.button>
      </div>

      {activeTool === 'pen' ? (
        <>
          {/* Colors */}
          <div className="space-y-1 sm:space-y-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-pink-600 font-black uppercase tracking-wider text-[9px] sm:text-sm">
              <Palette size={14} />
              <span>Colors</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 gap-1 sm:gap-3">
              {COLORS.map((c) => (
                <motion.button
                  key={c.value}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onColorChange(c.value)}
                  className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full border-2 sm:border-4 transition-all ${
                    currentColor === c.value 
                      ? 'border-pink-400 scale-110 shadow-lg' 
                      : 'border-gray-100 hover:border-pink-200'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div className="space-y-1 sm:space-y-4 pt-1.5 sm:pt-4 border-t-2 border-pink-50">
            <div className="text-pink-600 font-black uppercase tracking-wider text-[9px] sm:text-sm">Size</div>
            <div className="flex items-center justify-between gap-1.5 sm:gap-4">
              {SIZES.map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onBrushSizeChange(s)}
                  className={`flex-1 flex items-center justify-center h-8 sm:h-14 rounded-lg sm:rounded-2xl border-2 sm:border-4 transition-all ${
                    brushSize === s 
                      ? 'bg-pink-500 border-pink-600 text-white shadow-lg' 
                      : 'bg-pink-50 border-pink-100 text-pink-300 hover:bg-pink-100'
                  }`}
                >
                  <div 
                    className={`rounded-full bg-current transition-all ${brushSize === s ? 'scale-110' : ''}`} 
                    style={{ width: Math.max(3, s/4), height: Math.max(3, s/4) }} 
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-1 sm:space-y-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-600 font-black uppercase tracking-wider text-[9px] sm:text-sm">
            <Sparkles size={14} />
            <span>Stickers</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5 sm:gap-3">
            {STICKERS.map((sticker) => (
              <motion.button
                key={sticker.id}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onStickerChange(sticker)}
                className={`p-1 sm:p-2 rounded-lg sm:rounded-2xl border-2 sm:border-4 transition-all ${
                  selectedSticker?.id === sticker.id 
                    ? 'bg-yellow-100 border-yellow-400 shadow-lg scale-110' 
                    : 'bg-white border-gray-100 hover:border-yellow-200'
                }`}
              >
                <img src={sticker.url} alt={sticker.name} className="w-5 h-5 sm:w-8 sm:h-8 object-contain" referrerPolicy="no-referrer" />
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
