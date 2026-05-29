/** Google AdMob banner unit ID — set in .env as VITE_ADMOB_BANNER_UNIT_ID */
export const ADMOB_BANNER_UNIT_ID =
  (import.meta.env.VITE_ADMOB_BANNER_UNIT_ID as string | undefined)?.trim() ?? '';

/** Standard mobile banner height (320×50) */
export const ADMOB_BANNER_HEIGHT_PX = 50;

export const ADMOB_CLIENT_ID =
  (import.meta.env.VITE_ADMOB_CLIENT_ID as string | undefined)?.trim() ?? '';

export const isAdMobConfigured = Boolean(ADMOB_BANNER_UNIT_ID && ADMOB_CLIENT_ID);
