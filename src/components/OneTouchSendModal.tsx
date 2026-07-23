import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Loader2, Send, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FrameId } from '../frames';
import {
  FamilyContact,
  familyRecipientLabel,
  hasFamilyRecipient,
} from '../utils/familyContact';
import { oneTouchSendDrawing } from '../utils/oneTouchSend';

interface OneTouchSendModalProps {
  isOpen: boolean;
  previewUrl: string;
  title: string;
  frameId: FrameId;
  contact: FamilyContact;
  onClose: () => void;
  onOpenSettings?: () => void;
}

/**
 * Post-save kid screen: huge "Send to Family" button + joyful success celebration.
 */
export const OneTouchSendModal: React.FC<OneTouchSendModalProps> = ({
  isOpen,
  previewUrl,
  title,
  frameId,
  contact,
  onClose,
  onOpenSettings,
}) => {
  const [busy, setBusy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successName, setSuccessName] = useState('Family');
  const [error, setError] = useState<string | null>(null);

  const label = familyRecipientLabel(contact);
  const ready = hasFamilyRecipient(contact);

  useEffect(() => {
    if (!isOpen) return;
    setBusy(false);
    setShowSuccess(false);
    setError(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  const handleSend = async () => {
    if (busy) return;
    if (!ready) {
      onOpenSettings?.();
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await oneTouchSendDrawing({
        dataUrl: previewUrl,
        title,
        frameId,
        contact,
      });

      if (result.aborted) return;
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong. Try again!');
        return;
      }

      setSuccessName(result.recipientLabel);
      setShowSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#ec4899', '#f472b6', '#fb7185', '#fbbf24', '#a78bfa'],
      });
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="one-touch-send-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10002] flex items-end sm:items-center justify-center bg-stone-900/45 backdrop-blur-[2px] p-0 sm:p-4"
          role="dialog"
          aria-modal
          aria-labelledby="one-touch-send-title"
          data-testid="one-touch-send-modal"
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22 }}
            className="relative w-full sm:max-w-md bg-white shadow-2xl border border-stone-200 rounded-t-3xl sm:rounded-3xl overflow-hidden"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="px-5 pt-5 pb-5">
              <div className="flex items-center gap-2.5 pr-8 mb-3">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-400 rounded-xl text-white">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 id="one-touch-send-title" className="text-lg font-black text-stone-800">
                    Masterpiece saved!
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">One tap to send it to family</p>
                </div>
              </div>

              <div className="rounded-2xl border border-pink-100 bg-pink-50/50 overflow-hidden mb-4">
                <img
                  src={previewUrl}
                  alt="Saved drawing"
                  className="w-full aspect-[4/3] object-contain bg-white"
                />
              </div>

              {!ready && (
                <p
                  className="mb-3 text-sm font-semibold text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2"
                  role="status"
                >
                  Ask a grown-up to add Grandma&apos;s email in Family Settings first.
                </p>
              )}

              {error && (
                <p
                  className="mb-3 text-sm font-semibold text-pink-600 bg-pink-50 border border-pink-100 rounded-xl px-3 py-2 whitespace-pre-line"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={busy}
                onClick={() => void handleSend()}
                data-testid="one-touch-send-btn"
                className="w-full min-h-[56px] sm:min-h-[60px] px-4 py-3.5 rounded-2xl text-white font-black text-lg sm:text-xl
                  bg-gradient-to-b from-pink-400 via-pink-500 to-rose-500
                  border-[3px] border-white/80 shadow-[0_5px_0_0_#be185d]
                  disabled:opacity-70 disabled:shadow-none
                  inline-flex items-center justify-center gap-2.5"
              >
                {busy ? (
                  <Loader2 size={26} className="animate-spin" />
                ) : (
                  <Send size={26} strokeWidth={2.5} />
                )}
                {ready ? `Send to ${label}` : 'Send to Family'}
              </motion.button>

              <div className="mt-3 flex gap-2">
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="flex-1 py-2.5 rounded-full text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors"
                    data-testid="one-touch-open-settings"
                  >
                    Family settings
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                  data-testid="one-touch-done"
                >
                  Done
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  key="send-success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-b from-pink-50 via-white to-rose-50 p-6"
                  data-testid="one-touch-success"
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute text-pink-400"
                      style={{ left: `${12 + i * 18}%` }}
                      initial={{ y: 40, opacity: 0, scale: 0.6 }}
                      animate={{ y: -80 - i * 12, opacity: [0, 1, 0], scale: [0.6, 1.2, 0.9] }}
                      transition={{ duration: 1.4, delay: i * 0.08, ease: 'easeOut' }}
                    >
                      <Heart size={28 + (i % 3) * 6} fill="currentColor" />
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="relative z-10 text-center"
                  >
                    <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg">
                      <Heart size={32} fill="currentColor" />
                    </div>
                    <p className="text-2xl font-black text-pink-600 mb-1">Yay!</p>
                    <p className="text-base font-bold text-stone-700">
                      Sent to {successName} successfully!
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
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
