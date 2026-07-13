import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share, X, Smartphone } from 'lucide-react';

const DISMISS_KEY = 'babyartist-pwa-install-dismissed';
const DISMISS_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isSafari(): boolean {
  const ua = navigator.userAgent;
  return /safari/i.test(ua) && !/crios|fxios|edgios|chrome|android/i.test(ua);
}

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_MS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

/**
 * Soft "Add to Home Screen" prompt:
 * - Chrome / Edge / Android: uses beforeinstallprompt when available
 * - iOS Safari: shows Share → Add to Home Screen instructions
 */
export const InstallAppPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'chrome' | 'ios' | null>(null);

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setMode('chrome');
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // iOS has no beforeinstallprompt — show instructional card after a short delay
    let iosTimer: number | undefined;
    if (isIos() && isSafari()) {
      iosTimer = window.setTimeout(() => {
        if (!isStandalone() && !wasDismissedRecently()) {
          setMode('ios');
          setVisible(true);
        }
      }, 2500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = () => {
    markDismissed();
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (choice.outcome === 'accepted') {
      setVisible(false);
    } else {
      dismiss();
    }
  };

  return (
    <AnimatePresence>
      {visible && mode && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          className="fixed left-3 right-3 z-[180] sm:left-auto sm:right-4 sm:w-[22rem]"
          style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' }}
          role="dialog"
          aria-label="Add BabyArtist to Home Screen"
        >
          <div className="rounded-2xl border border-amber-200 bg-white/95 backdrop-blur-md shadow-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-amber-100 bg-amber-50">
                <img
                  src="/icons/icon-192.png"
                  alt=""
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-stone-800 flex items-center gap-1.5">
                  <Smartphone size={16} className="text-pink-500" />
                  Add to Home Screen
                </p>
                {mode === 'chrome' ? (
                  <p className="mt-1 text-xs sm:text-sm text-stone-500 leading-relaxed">
                    Install <span className="font-bold text-pink-500">BabyArtist</span> like an app —
                    launch full-screen in one tap.
                  </p>
                ) : (
                  <p className="mt-1 text-xs sm:text-sm text-stone-500 leading-relaxed">
                    Tap <Share size={12} className="inline text-blue-500 align-[-2px]" />{' '}
                    <span className="font-semibold">Share</span>, then{' '}
                    <span className="font-semibold">Add to Home Screen</span>.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="p-1.5 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-3 flex gap-2">
              {mode === 'chrome' ? (
                <button
                  type="button"
                  onClick={() => void install()}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 transition-colors"
                >
                  <Download size={16} />
                  Install App
                </button>
              ) : (
                <button
                  type="button"
                  onClick={dismiss}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-full bg-stone-800 text-white text-sm font-bold hover:bg-stone-700 transition-colors"
                >
                  Got it
                </button>
              )}
              {mode === 'chrome' && (
                <button
                  type="button"
                  onClick={dismiss}
                  className="h-11 px-4 rounded-full border border-stone-200 text-stone-500 text-sm font-semibold hover:bg-stone-50"
                >
                  Later
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
