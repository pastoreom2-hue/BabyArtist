import { sanitizeArtworkFilename } from './artworkNaming';

/**
 * Trigger a file Save (Downloads) rather than Open / inline image preview.
 *
 * Notes:
 * - Desktop Chromium/Firefox/Edge: `download` + octet-stream usually saves silently.
 * - iOS Safari often cannot fully silent-save from the web; best-effort still uses
 *   `download` (not navigation / Open). Residual OS sheet possible.
 */
export function forceDownloadBlob(blob: Blob, filename: string): void {
  const safeName = sanitizeArtworkFilename(filename);

  const nav = window.navigator as Navigator & {
    msSaveBlob?: (b: Blob, defaultName?: string) => boolean;
  };
  // Legacy Edge: msSaveBlob = save; avoid msSaveOrOpenBlob (can show Open).
  if (typeof nav.msSaveBlob === 'function') {
    const ok = nav.msSaveBlob(asOctetStream(blob), safeName);
    if (ok) return;
  }

  const payload = asOctetStream(blob);
  const url = URL.createObjectURL(payload);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.setAttribute('download', safeName);
  a.download = safeName;
  // Set href after download attr so browsers treat as attachment, not navigation.
  a.href = url;
  a.rel = 'noopener';
  a.target = '_self';
  a.type = 'application/octet-stream';

  document.body.appendChild(a);
  a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  a.click();

  // Revoking immediately can cancel the download or fall back to Open — delay.
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 2500);
}

/** Convert a data URL (canvas export) into a PNG Blob for downloading. */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  if (blob.type === 'image/png') return blob;
  // Normalize type — keeps file association while we still download as octet-stream.
  return new Blob([blob], { type: blob.type || 'image/png' });
}

export async function forceDownloadDataUrl(dataUrl: string, filename: string): Promise<void> {
  const blob = await dataUrlToBlob(dataUrl);
  forceDownloadBlob(blob, filename);
}

function asOctetStream(blob: Blob): Blob {
  // application/octet-stream steers browsers toward Save, not Open/preview.
  if (blob.type === 'application/octet-stream') return blob;
  return new Blob([blob], { type: 'application/octet-stream' });
}
