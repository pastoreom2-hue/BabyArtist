/** Temporary + user-facing artwork names for Save / Send. */

export function generateTempArtworkName(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `my-art-${y}${m}${d}-${h}${min}${s}.png`;
}

/** Always returns a non-empty `*.png` filename safe for downloads / Web Share. */
export function sanitizeArtworkFilename(name: string | undefined | null): string {
  const raw = (name ?? '').trim();
  const fallback = generateTempArtworkName();
  if (!raw) return fallback;

  const withoutExt = raw.replace(/\.png$/i, '').trim();
  const safe = withoutExt
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${safe || fallback.replace(/\.png$/i, '')}.png`;
}

export function displayTitleFromFilename(filename: string): string {
  return filename.replace(/\.png$/i, '') || 'My Drawing';
}

export interface LocalArtwork {
  dataUrl: string;
  title: string;
  savedAt: string;
}

const LOCAL_ART_KEY = 'colorjoy-art';

export function loadLocalArtworks(): LocalArtwork[] {
  try {
    const raw = localStorage.getItem(LOCAL_ART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item): LocalArtwork | null => {
        if (typeof item === 'string') {
          return {
            dataUrl: item,
            title: generateTempArtworkName(),
            savedAt: new Date().toISOString(),
          };
        }
        if (item && typeof item === 'object' && typeof (item as LocalArtwork).dataUrl === 'string') {
          const art = item as Partial<LocalArtwork>;
          return {
            dataUrl: art.dataUrl!,
            title: sanitizeArtworkFilename(art.title),
            savedAt: art.savedAt || new Date().toISOString(),
          };
        }
        return null;
      })
      .filter((x): x is LocalArtwork => !!x)
      .slice(0, 24);
  } catch {
    return [];
  }
}

export function persistLocalArtworks(artworks: LocalArtwork[]) {
  localStorage.setItem(LOCAL_ART_KEY, JSON.stringify(artworks.slice(0, 24)));
}
