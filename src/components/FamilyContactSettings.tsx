import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Save, Settings2, Shield, X } from 'lucide-react';
import {
  EMPTY_FAMILY_CONTACT,
  FamilyContact,
  clearFamilyContact,
  loadFamilyContact,
  saveFamilyContact,
} from '../utils/familyContact';

interface FamilyContactSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (contact: FamilyContact) => void;
}

/**
 * Parent-only preset for One-Touch Send (email / phone / display name).
 * Light gate: grown-up must confirm before editing.
 */
export const FamilyContactSettings: React.FC<FamilyContactSettingsProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [form, setForm] = useState<FamilyContact>(EMPTY_FAMILY_CONTACT);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(loadFamilyContact());
    setUnlocked(false);
    setSavedFlash(false);
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

  const handleSave = () => {
    const next = saveFamilyContact(form);
    setForm(next);
    setSavedFlash(true);
    onSaved?.(next);
    window.setTimeout(() => setSavedFlash(false), 1800);
  };

  const handleClear = () => {
    clearFamilyContact();
    setForm({ ...EMPTY_FAMILY_CONTACT });
    onSaved?.({ ...EMPTY_FAMILY_CONTACT });
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="family-settings-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10002] flex items-end sm:items-center justify-center bg-stone-900/45 backdrop-blur-[2px] p-0 sm:p-4"
          onClick={onClose}
          role="dialog"
          aria-modal
          aria-labelledby="family-settings-title"
          data-testid="family-contact-settings"
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
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center gap-2.5 pr-8 mb-3">
                <div className="p-2 bg-violet-500 rounded-xl text-white">
                  <Settings2 size={18} />
                </div>
                <div>
                  <h2 id="family-settings-title" className="text-base font-bold text-stone-800">
                    Family Send Settings
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">Grown-ups only · saved on this device</p>
                </div>
              </div>

              {!unlocked ? (
                <div
                  className="rounded-2xl border border-violet-100 bg-violet-50/80 p-4 space-y-3"
                  data-testid="family-settings-gate"
                >
                  <div className="flex items-start gap-2 text-violet-800">
                    <Shield size={18} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold leading-snug">
                      Kids should not change this. Tap below if you are a parent or grown-up.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUnlocked(true)}
                    className="w-full min-h-[48px] py-3 rounded-full text-sm font-bold text-white bg-violet-500 hover:bg-violet-600 transition-colors"
                    data-testid="family-settings-unlock"
                  >
                    I am a grown-up
                  </button>
                </div>
              ) : (
                <div className="space-y-3" data-testid="family-settings-form">
                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-stone-400 mb-1.5">
                      Call them
                    </span>
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                      placeholder="Grandma, Grandpa, Mom…"
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-stone-200 focus:border-violet-300 outline-none text-sm font-semibold text-stone-800"
                      data-testid="family-display-name"
                      autoComplete="name"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-stone-400 mb-1.5">
                      Email
                    </span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="grandma@email.com"
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-stone-200 focus:border-violet-300 outline-none text-sm font-semibold text-stone-800"
                      data-testid="family-email"
                      autoComplete="email"
                      inputMode="email"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-stone-400 mb-1.5">
                      Phone (optional)
                    </span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="+1 555 123 4567"
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-stone-200 focus:border-violet-300 outline-none text-sm font-semibold text-stone-800"
                      data-testid="family-phone"
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </label>

                  <p className="text-[11px] text-stone-500 leading-snug flex items-start gap-1.5">
                    <Heart size={12} className="text-pink-400 shrink-0 mt-0.5" />
                    After setup, kids tap the blue paper-plane next to Save — no typing
                    addresses.
                  </p>

                  {savedFlash && (
                    <p
                      className="text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2"
                      role="status"
                    >
                      Saved on this device!
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="flex-1 py-2.5 rounded-full text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                      data-testid="family-settings-clear"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex-[1.4] inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-semibold text-white bg-pink-500 hover:bg-pink-600 transition-colors"
                      data-testid="family-settings-save"
                    >
                      <Save size={16} />
                      Save contact
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
