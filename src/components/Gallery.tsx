import React from 'react';
import { motion } from 'motion/react';
import { Artwork } from '../types';
import { Share2, Trash2, Calendar } from 'lucide-react';

interface GalleryProps {
  artworks: Artwork[];
  onDelete: (id: string) => void;
  onShare: (artwork: Artwork) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ artworks, onDelete, onShare }) => {
  if (artworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-4 border-dashed border-blue-100">
        <p className="text-xl font-bold text-gray-300">No cloud artwork saved yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {artworks.map((artwork) => (
        <motion.div
          key={artwork.id}
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-4 border-white group relative"
        >
          <div className="aspect-video relative overflow-hidden bg-gray-50">
            <img 
              src={artwork.dataUrl} 
              alt={artwork.title} 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                onClick={() => onShare(artwork)}
                className="p-4 bg-white text-blue-500 rounded-2xl hover:bg-blue-50 transition-all shadow-lg"
                title="Share"
              >
                <Share2 size={24} />
              </button>
              <button
                onClick={() => artwork.id && onDelete(artwork.id)}
                className="p-4 bg-white text-red-500 rounded-2xl hover:bg-red-50 transition-all shadow-lg"
                title="Delete"
              >
                <Trash2 size={24} />
              </button>
            </div>
          </div>
          <div className="p-6 flex justify-between items-center bg-white">
            <div>
              <h4 className="font-black text-gray-800">{artwork.title}</h4>
              <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5 mt-1">
                <Calendar size={14} /> {artwork.createdAt ? new Date(artwork.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
              </p>
            </div>
            {artwork.isShared && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                Shared
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
