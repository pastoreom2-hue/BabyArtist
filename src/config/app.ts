/** Production app URL (Vercel) */
export const APP_URL =
  (import.meta.env.VITE_APP_URL as string | undefined)?.trim() ||
  'https://baby-artist-hg794xasr-greentown2s-projects.vercel.app';
