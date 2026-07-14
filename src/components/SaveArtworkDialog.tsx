import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Pencil, Save, X } from 'lucide-react';
import { displayTitleFromFilename, sanitizeArtworkFilename } from '../utils/artworkNaming';

interface SaveArtworkDialogProps {
  isOpen: boolean;
  previewUrl: string;
  defaultName: string;
  onCancel: () => void;
  onConfirm: (filename: string) => void | Promise<void>;
}

export const SaveArtworkDialog: React.FC<SaveArtworkDialogProps> = ({
  isOpen,
  previewUrl,
  defaultName,
  onCancel,
  onConfirm,
}) => {
  const [name, setName] = useState(defaultName);
  const [isRenaming, setIsRenaming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(defaultName);
    setIsRenaming(false);
    setSaving(false);
    setError(null);
  }, [isOpen, defaultName]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  const handleConfirm = async () => {
    setSaving(true);
    setError(null);
    try {
      await onConfirm(sanitizeArtworkFilename(name));
    } catch {
      setError("Oops! Let's try saving again");
      setSaving(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="save-artwork-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10002] flex items-end sm:items-center justify-center bg-stone-900/45 backdrop-blur-[2px] p-0 sm:p-4"
          onClick={onCancel}
          role="dialog"
          aria-modal
          aria-labelledby="save-artwork-title"
          data-testid="save-artwork-dialog"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-md bg-white shadow-2xl border border-stone-200 rounded-t-2xl sm:rounded-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={onCancel}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center gap-2.5 pr-8 mb-3">
                <div className="p-2 bg-pink-500 rounded-xl text-white">
                  <Save size={18} />
                </div>
                <div>
                  <h2 id="save-artwork-title" className="text-base font-bold text-stone-800">
                    Save Masterpiece
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">Pick a name, then save!</p>
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 overflow-hidden mb-4">
                <img
                  src={previewUrl}
                  alt="Artwork preview"
                  className="w-full aspect-[4/3] object-contain bg-white"
                />
              </div>

              <label className="block text-[10px] font-bold uppercase tracking-wide text-stone-400 mb-1.5">
                File name
              </label>

              {isRenaming ? (
                <input
                  type="text"
                  value={displayTitleFromFilename(name)}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setName(sanitizeArtworkFilename(name))}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-pink-200 focus:border-pink-400 outline-none text-sm font-semibold text-stone-800"
                  placeholder="My Beautiful Drawing"
                  autoFocus
                  data-testid="save-artwork-rename-input"
                  aria-label="Rename artwork"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <p
                    className="flex-1 min-w-0 truncate px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm font-semibold text-stone-700"
                    data-testid="save-artwork-filename"
                  >
                    {sanitizeArtworkFilename(name)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsRenaming(true)}
                    className="inline-flex items-center gap-1.5 flex-shrink-0 h-11 px-3 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
                    data-testid="save-artwork-rename-btn"
                  >
                    <Pencil size={14} />
                    Rename
                  </button>
                </div>
              )}

              {error && (
                <p
                  className="mt-3 text-sm font-semibold text-pink-600 bg-pink-50 border border-pink-100 rounded-xl px-3 py-2"
                  role="alert"
                  data-testid="save-artwork-error"
                >
                  {error}
                </p>
              )}
            </div>

            <div className="px-5 py-3 border-t border-stone-100 flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={saving}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white bg-pink-500 hover:bg-pink-600 disabled:opacity-60 transition-colors"
                data-testid="save-artwork-confirm"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
