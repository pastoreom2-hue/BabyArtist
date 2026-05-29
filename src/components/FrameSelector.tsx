import React from 'react';
import { motion } from 'motion/react';
import { Frame, Check } from 'lucide-react';
import { FRAME_OPTIONS, FrameId } from '../frames';

interface FrameSelectorProps {
  selectedFrame: FrameId;
  onSelect: (id: FrameId) => void;
}

export const FrameSelector: React.FC<FrameSelectorProps> = ({ selectedFrame, onSelect }) => {
  return (
    <section
      data-tour="tour-step-2"
      className="rounded-2xl border border-stone-200/80 bg-white p-3 sm:p-4 shadow-sm"
      aria-label="Choose a frame"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-stone-100 rounded-lg text-stone-600">
          <Frame size={16} strokeWidth={2.25} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-stone-800">Choose Frame</h3>
          <p className="text-[10px] text-stone-400">Pick a style for your gallery</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FRAME_OPTIONS.map((frame) => {
          const isSelected = selectedFrame === frame.id;
          return (
            <motion.button
              key={frame.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(frame.id)}
              className={`relative flex-shrink-0 flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all ${
                isSelected
                  ? 'border-stone-400 bg-stone-50 shadow-sm ring-1 ring-stone-300'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
              title={frame.label}
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-stone-200/80 ${frame.preview} ${
                  frame.id === 'polka'
                    ? 'bg-[radial-gradient(circle,#f472b6_18%,transparent_19%),radial-gradient(circle,#60a5fa_18%,transparent_19%)] bg-[length:12px_12px] bg-[position:0_0,6px_6px] bg-white'
                    : ''
                }`}
              />
              <span className="text-[9px] font-medium text-stone-500 max-w-[3rem] truncate">
                {frame.label}
              </span>
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-stone-800 rounded-full flex items-center justify-center">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};
