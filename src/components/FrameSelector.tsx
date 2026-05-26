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
      className="bg-gradient-to-r from-amber-50 via-white to-pink-50 rounded-2xl sm:rounded-3xl shadow-lg border-4 border-amber-200 p-4 sm:p-5"
      aria-label="액자 선택"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-amber-400 rounded-xl text-white shadow-md">
          <Frame size={20} />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-black text-amber-900">액자 선택</h3>
          <p className="text-[10px] sm:text-xs font-bold text-amber-700/80">
            갤러리 작품에 적용할 액자를 골라 보세요
          </p>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {FRAME_OPTIONS.map((frame) => {
          const isSelected = selectedFrame === frame.id;
          return (
            <motion.button
              key={frame.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(frame.id)}
              className={`relative flex-shrink-0 flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl border-2 transition-all min-w-[4.5rem] sm:min-w-[5rem] ${
                isSelected
                  ? 'border-pink-500 bg-pink-50 shadow-lg ring-2 ring-pink-300'
                  : 'border-amber-100 bg-white hover:border-amber-300 hover:bg-amber-50/50'
              }`}
              title={frame.label}
            >
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg shadow-inner ${frame.preview} ${
                  frame.id === 'polka'
                    ? 'bg-[radial-gradient(circle,#f472b6_18%,transparent_19%),radial-gradient(circle,#60a5fa_18%,transparent_19%)] bg-[length:12px_12px] bg-[position:0_0,6px_6px] bg-white'
                    : ''
                }`}
              />
              <span className="text-[10px] sm:text-xs font-black text-gray-700 leading-none">
                {frame.label}
              </span>
              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center ring-2 ring-white shadow">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};
