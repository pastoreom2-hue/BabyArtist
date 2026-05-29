import React, { useEffect, useRef } from 'react';
import {
  ADMOB_BANNER_HEIGHT_PX,
  ADMOB_BANNER_UNIT_ID,
  ADMOB_CLIENT_ID,
  isAdMobConfigured,
} from '../config/admob';

declare global {
  interface Window {
    adsbygoogle?: { push: (config: Record<string, unknown>) => void };
  }
}

interface AdMobBannerProps {
  /** Hide during fullscreen drawing so it does not cover controls */
  hidden?: boolean;
}

/**
 * Fixed bottom banner slot for Google AdMob (web via AdSense).
 * Set VITE_ADMOB_CLIENT_ID and VITE_ADMOB_BANNER_UNIT_ID in .env to go live.
 */
export const AdMobBanner: React.FC<AdMobBannerProps> = ({ hidden = false }) => {
  const slotRef = useRef<HTMLElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!isAdMobConfigured || hidden || loadedRef.current) return;

    const loadAd = () => {
      try {
        window.adsbygoogle = window.adsbygoogle || { push: () => {} };
        window.adsbygoogle.push({});
        loadedRef.current = true;
      } catch (err) {
        console.warn('[AdMobBanner] Failed to load ad:', err);
      }
    };

    const existing = document.querySelector('script[data-admob-banner]');
    if (existing) {
      loadAd();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADMOB_CLIENT_ID}`;
    script.crossOrigin = 'anonymous';
    script.dataset.admobBanner = 'true';
    script.onload = loadAd;
    document.head.appendChild(script);
  }, [hidden]);

  if (hidden) return null;

  return (
    <aside
      className="fixed bottom-0 left-0 right-0 z-[9990] flex items-center justify-center bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_20px_rgba(15,23,42,0.08)]"
      style={{
        height: ADMOB_BANNER_HEIGHT_PX,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Advertisement"
    >
      {isAdMobConfigured ? (
        <ins
          ref={slotRef}
          className="adsbygoogle block"
          style={{ display: 'block', width: '320px', height: `${ADMOB_BANNER_HEIGHT_PX}px` }}
          data-ad-client={ADMOB_CLIENT_ID}
          data-ad-slot={ADMOB_BANNER_UNIT_ID}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="flex items-center gap-2 px-4 text-[10px] sm:text-xs font-bold text-slate-400 select-none">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase tracking-wider">
            Ad
          </span>
          <span>Banner Ad · set VITE_ADMOB_BANNER_UNIT_ID to enable</span>
        </div>
      )}
    </aside>
  );
};

/** Bottom padding so content is not hidden behind the banner */
export function useAdBannerOffset(hidden = false): string {
  if (hidden) return '0px';
  return `calc(${ADMOB_BANNER_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px))`;
}
