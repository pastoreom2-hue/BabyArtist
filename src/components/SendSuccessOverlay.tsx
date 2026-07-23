import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SendSuccessOverlayProps {
  isOpen: boolean;
  recipientLabel: string;
  onClose: () => void;
}

/** Joyful full-screen “Sent to Grandma!” celebration for kids. */
export const SendSuccessOverlay: React.FC<SendSuccessOverlayProps> = ({
  isOpen,
  recipientLabel,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#ec4899', '#f472b6', '#fb7185', '#fbbf24', '#a78bfa'],
    });
    const timer = window.setTimeout(onClose, 2800);
    return () => window.clearTimeout(timer);
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="send-success-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10004] flex flex-col items-center justify-center bg-gradient-to-b from-pink-50/95 via-white/95 to-rose-50/95 p-6"
          data-testid="send-success-overlay"
          onClick={onClose}
          role="status"
          aria-live="polite"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute text-pink-400 pointer-events-none"
              style={{ left: `${12 + i * 18}%` }}
              initial={{ y: 40, opacity: 0, scale: 0.6 }}
              animate={{ y: -100 - i * 14, opacity: [0, 1, 0], scale: [0.6, 1.25, 0.9] }}
              transition={{ duration: 1.5, delay: i * 0.08, ease: 'easeOut' }}
            >
              <Heart size={28 + (i % 3) * 6} fill="currentColor" />
            </motion.div>
          ))}

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="relative z-10 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg">
              <Heart size={32} fill="currentColor" />
            </div>
            <p className="text-2xl font-black text-pink-600 mb-1">Yay!</p>
            <p className="text-base font-bold text-stone-700">
              Sent to {recipientLabel} successfully!
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 min-h-[48px] px-8 rounded-full text-sm font-bold text-white bg-pink-500 hover:bg-pink-600"
            >
              Awesome!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
