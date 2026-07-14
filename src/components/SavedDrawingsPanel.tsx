import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Camera, Sparkles, Trash2 } from 'lucide-react';
import type { LocalArtwork } from '../utils/artworkNaming';
import { displayTitleFromFilename } from '../utils/artworkNaming';

interface SavedDrawingsPanelProps {
  artworks: LocalArtwork[];
  onAddPhoto: (dataUrl: string) => void;
  onDelete: (index: number) => void;
  onStartDrawing: () => void;
}

/** Same local gallery as Send Drawing, newest-first — browsable from Save Drawing. */
export const SavedDrawingsPanel: React.FC<SavedDrawingsPanelProps> = ({
  artworks,
  onAddPhoto,
  onDelete,
  onStartDrawing,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const sorted = [...artworks].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onAddPhoto(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div data-testid="saved-drawings-panel" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-4 border-b border-stone-200/80">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-800">Saved Drawings</h2>
          <p className="text-xs sm:text-sm text-stone-400 font-medium mt-0.5">
            Newest first · same pictures as Send Drawing
          </p>
        </div>
        <p className="text-xs sm:text-sm text-stone-500 font-semibold" data-testid="saved-drawings-count">
          {sorted.length} {sorted.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="saved-add-photo-btn"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-full font-bold text-sm text-white bg-gradient-to-b from-[#40C4FF] via-[#0091EA] to-[#1565C0] border-[3px] border-white/70 shadow-md hover:-translate-y-0.5 transition-transform"
        >
          <Camera size={18} strokeWidth={2.5} />
          Add Photo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleChange}
          aria-label="Add drawing photo"
        />
      </div>

      {sorted.length === 0 ? (
        <div
          className="bg-white p-10 rounded-3xl shadow-xl text-center flex flex-col items-center gap-5 border-4 border-blue-200"
          data-testid="saved-drawings-empty"
        >
          <div className="p-4 bg-blue-100 text-blue-500 rounded-full">
            <Sparkles size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-stone-800">No saved drawings yet</h3>
            <p className="text-stone-500 text-sm">
              Draw on the canvas and tap the pink Save button — or add a photo above.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartDrawing}
            className="px-8 py-3 bg-pink-500 text-white rounded-2xl font-bold text-lg hover:bg-pink-600 transition-all shadow-xl"
          >
            Start Drawing
          </button>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          data-testid="saved-drawings-grid"
        >
          {sorted.map((art, i) => (
            <motion.div
              key={`${art.savedAt}-${art.title}-${i}`}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-2.5 sm:p-3 rounded-2xl border-2 border-stone-200 shadow-sm relative group"
              data-testid="saved-drawing-item"
            >
              <img
                src={art.dataUrl}
                alt={displayTitleFromFilename(art.title)}
                className="w-full aspect-square object-contain rounded-xl bg-stone-50"
              />
              <p className="mt-2 text-xs font-semibold text-stone-700 truncate px-0.5">
                {displayTitleFromFilename(art.title)}
              </p>
              <p className="text-[10px] text-stone-400 px-0.5">
                {new Date(art.savedAt).toLocaleString()}
              </p>
              <button
                type="button"
                onClick={() => onDelete(artworks.indexOf(art))}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-w-[40px] min-h-[40px] flex items-center justify-center"
                title="Delete"
                aria-label={`Delete ${displayTitleFromFilename(art.title)}`}
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
