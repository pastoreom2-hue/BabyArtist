import { sanitizeArtworkFilename } from './artworkNaming';

/** Simple browser download via <a download> — no Blob/Web Share. */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const safe = sanitizeArtworkFilename(filename);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = safe.endsWith('.png') ? safe : `${safe}.png`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
