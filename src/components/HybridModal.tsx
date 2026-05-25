import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Crown, Sparkles, Zap } from 'lucide-react';

interface HybridModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchAd: () => void;
  onBuyVip: () => void;
}

export const HybridModal: React.FC<HybridModalProps> = ({
  isOpen,
  onClose,
  onWatchAd,
  onBuyVip,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl border-4 border-white"
          >
            {/* Decorative header gradient */}
            <motion.div
              className="relative bg-gradient-to-br from-violet-500 via-pink-500 to-amber-400 px-8 pt-10 pb-16 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                aria-label="닫기"
              >
                <X size={20} />
              </button>

              <motion.div
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex p-4 mb-4 rounded-3xl bg-white/20 backdrop-blur-sm shadow-inner"
              >
                <Sparkles size={40} className="text-yellow-200" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                오늘의 그림 횟수를
                <br />
                모두 사용했어요!
              </h2>
              <p className="text-white/85 font-bold text-sm sm:text-base">
                아래 방법 중 하나를 선택해 계속 그려보세요
              </p>

              {/* Wave divider */}
              <div className="absolute -bottom-1 left-0 right-0 h-8 bg-white rounded-t-[2rem]" />
            </motion.div>

            {/* Action buttons */}
            <motion.div
              className="px-6 pb-8 pt-2 space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {/* Free: Watch ad */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onWatchAd}
                className="w-full group relative overflow-hidden flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 hover:border-emerald-400 transition-all shadow-md hover:shadow-lg"
              >
                <motion.div
                  className="flex-shrink-0 p-3 rounded-xl bg-emerald-500 text-white shadow-lg"
                  whileHover={{ rotate: 5 }}
                >
                  <Play size={24} fill="currentColor" />
                </motion.div>
                <motion.div className="flex-1 text-left">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 mb-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                    <Zap size={10} /> 무료
                  </span>
                  <p className="font-black text-emerald-800 text-base sm:text-lg leading-tight">
                    30초 광고 보고 무료 충전하기
                  </p>
                  <p className="text-emerald-600/70 text-xs font-bold mt-0.5">
                    광고 시청 후 1회 충전
                  </p>
                </motion.div>
              </motion.button>

              {/* Divider */}
              <motion.div
                className="flex items-center gap-3"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.25 }}
              >
                <motion.div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">또는</span>
                <motion.div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              </motion.div>

              {/* Premium: VIP pass */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBuyVip}
                className="w-full group relative overflow-hidden flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 border-2 border-amber-500 shadow-lg hover:shadow-xl transition-all"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                />
                <motion.div
                  className="relative flex-shrink-0 p-3 rounded-xl bg-amber-600 text-white shadow-lg"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Crown size={24} />
                </motion.div>
                <motion.div className="relative flex-1 text-left">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 mb-1 rounded-full bg-amber-600/20 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                    VIP
                  </span>
                  <p className="font-black text-amber-950 text-base sm:text-lg leading-tight">
                    평생 무제한 VIP 패스 구매
                  </p>
                  <p className="text-amber-900/70 text-xs font-bold mt-0.5">
                    단 한 번 결제 · $4.99
                  </p>
                </motion.div>
                <motion.span
                  className="relative flex-shrink-0 px-3 py-1.5 rounded-xl bg-white/90 text-amber-700 font-black text-sm shadow-md"
                  whileHover={{ scale: 1.1 }}
                >
                  $4.99
                </motion.span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onClose}
                className="w-full py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
              >
                나중에 할게요
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
