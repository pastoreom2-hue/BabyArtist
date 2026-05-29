import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';
import { TOUR_STEPS, markTourCompleted } from '../onboardingTour';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'draw' | 'gallery';
  onChangeView: (view: 'draw' | 'gallery') => void;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 10;

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  currentView,
  onChangeView,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [bubblePlacement, setBubblePlacement] = useState<'bottom' | 'top'>('bottom');

  const step = TOUR_STEPS[stepIndex];
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  const measureTarget = useCallback(() => {
    if (!isOpen || !step) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) {
      setSpotlight(null);
      return;
    }
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      setSpotlight({
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      });
      setBubblePlacement(rect.top > window.innerHeight * 0.45 ? 'top' : 'bottom');
    });
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen) return;
    if (step && step.view !== currentView) {
      onChangeView(step.view);
    }
  }, [isOpen, stepIndex, step, currentView, onChangeView]);

  useEffect(() => {
    if (!isOpen || !step || step.view !== currentView) return;
    const timer = setTimeout(measureTarget, 380);
    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget, true);
    };
  }, [isOpen, stepIndex, currentView, step, measureTarget]);

  const handleNext = () => {
    if (isLast) {
      markTourCompleted();
      onClose();
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const handleSkip = () => {
    markTourCompleted();
    onClose();
  };

  if (!isOpen || !step) return null;

  const bubbleTop =
    spotlight && bubblePlacement === 'bottom'
      ? spotlight.top + spotlight.height + 16
      : undefined;
  const bubbleBottom =
    spotlight && bubblePlacement === 'top'
      ? window.innerHeight - spotlight.top + 16
      : undefined;

  return (
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000]"
        aria-modal
        role="dialog"
        aria-label="앱 사용 가이드"
      >
        {/* Dimmed backdrop with spotlight cutout via box-shadow trick */}
        {spotlight ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute rounded-2xl pointer-events-none"
            style={{
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.width,
              height: spotlight.height,
              boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.62)',
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-2xl border-4 border-pink-300 ring-4 ring-pink-200/50"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-slate-900/60" />
        )}

        {/* Speech bubble */}
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="absolute left-4 right-4 sm:left-auto sm:right-auto sm:max-w-md px-1 pointer-events-auto"
          style={{
            top: spotlight
              ? bubbleTop
              : '50%',
            bottom: spotlight ? bubbleBottom : undefined,
            transform: spotlight ? undefined : 'translateY(-50%)',
            left: spotlight ? Math.min(Math.max(spotlight.left, 16), window.innerWidth - 320) : undefined,
          }}
        >
          <div className="relative bg-white rounded-[1.75rem] shadow-2xl border-4 border-pink-100 p-5 sm:p-6 pointer-events-auto">
            {bubblePlacement === 'bottom' && (
              <div
                className="absolute -top-2.5 w-5 h-5 bg-white border-l-4 border-t-4 border-pink-100 rotate-45 rounded-sm"
                style={{ left: spotlight ? Math.min(spotlight.width / 2, 40) : 24 }}
              />
            )}
            {bubblePlacement === 'top' && (
              <div
                className="absolute -bottom-2.5 w-5 h-5 bg-white border-r-4 border-b-4 border-pink-100 rotate-45 rounded-sm"
                style={{ left: spotlight ? Math.min(spotlight.width / 2, 40) : 24 }}
              />
            )}

            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-pink-100 rounded-xl">
                  <Sparkles size={18} className="text-pink-500" />
                </div>
                <span className="text-xs font-black text-pink-500 uppercase tracking-wider">
                  {stepIndex + 1} / {TOUR_STEPS.length}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSkip}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="가이드 건너뛰기"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed mb-5">
              {step.message}
            </p>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                건너뛰기
              </button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-shadow text-sm sm:text-base"
              >
                {isLast ? '시작하기 ✨' : '다음 →'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
