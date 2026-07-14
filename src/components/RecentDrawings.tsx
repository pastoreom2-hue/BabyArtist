import React, { useCallback, useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import {
  deleteDrawingFromIdb,
  listDrawingsFromIdb,
  type StoredDrawing,
} from '../utils/artworkIdb';
import { displayTitleFromFilename } from '../utils/artworkNaming';
import { downloadDataUrl } from '../utils/downloadDataUrl';

interface RecentDrawingsProps {
  /** Bump to reload list after a save */
  refreshKey?: number;
}

/**
 * Horizontal "Recent Masterpieces" strip — reads from IndexedDB, newest first.
 */
export const RecentDrawings: React.FC<RecentDrawingsProps> = ({ refreshKey = 0 }) => {
  const [items, setItems] = useState<StoredDrawing[]>([]);
  const [preview, setPreview] = useState<StoredDrawing | null>(null);

  const reload = useCallback(async () => {
    try {
      const rows = await listDrawingsFromIdb();
      setItems(rows);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey]);

  if (items.length === 0) return null;

  return (
    <section
      className="border-t border-amber-100/80 bg-gradient-to-b from-white to-amber-50/40 px-3 sm:px-4 py-3"
      data-testid="recent-drawings"
      aria-label="Recent Masterpieces"
    >
      <div className="max-w-3xl mx-auto">
        <h3 className="text-xs sm:text-sm font-bold text-stone-700 mb-2 tracking-wide">
          Recent Masterpieces
        </h3>

        <div className="flex gap-2.5 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-thin">
          {items.map((art) => (
            <button
              key={art.id}
              type="button"
              onClick={() => setPreview(art)}
              className="snap-start flex-shrink-0 w-[5.5rem] sm:w-24 rounded-xl overflow-hidden border-2 border-stone-200 bg-white shadow-sm hover:border-pink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 transition-colors"
              title={displayTitleFromFilename(art.title)}
              aria-label={`Open ${displayTitleFromFilename(art.title)}`}
            >
              <img
                src={art.dataUrl}
                alt=""
                className="w-full aspect-square object-contain bg-stone-50"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-[10050] flex items-center justify-center bg-stone-900/55 p-4"
          role="dialog"
          aria-modal
          aria-label="Saved drawing preview"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 text-stone-500 hover:text-stone-800 border border-stone-200"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <img
              src={preview.dataUrl}
              alt={displayTitleFromFilename(preview.title)}
              className="w-full aspect-[4/3] object-contain bg-stone-50"
            />

            <div className="p-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-bold text-stone-800 truncate">
                  {displayTitleFromFilename(preview.title)}
                </p>
                <p className="text-[11px] text-stone-400">
                  {new Date(preview.savedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadDataUrl(preview.dataUrl, preview.title)}
                  className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteDrawingFromIdb(preview.id);
                    setPreview(null);
                    void reload();
                  }}
                  className="h-10 px-4 rounded-full border border-stone-200 text-stone-600 text-sm font-semibold hover:bg-stone-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
