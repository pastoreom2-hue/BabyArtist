import React from 'react';
import { motion } from 'motion/react';
import { Artwork } from '../types';
import { Trash2, Calendar, Link2 } from 'lucide-react';
import { FramedArtwork } from './FramedArtwork';
import { FrameId } from '../frames';
import { ArtworkShareActions } from './ArtworkShareActions';

interface GalleryProps {
  artworks: Artwork[];
  selectedFrame: FrameId;
  onDelete: (id: string) => void;
  onShare: (artwork: Artwork) => void;
}

function getArtworkDateLabel(artwork: Artwork) {
  if (artwork.dateTag) return artwork.dateTag;
  const ts = (artwork as any)?.createdAt;
  if (ts?.seconds) return new Date(ts.seconds * 1000).toLocaleDateString();
  return 'Just now';
}

export const Gallery: React.FC<GalleryProps> = ({ artworks, selectedFrame, onDelete, onShare }) => {
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
            <FramedArtwork
              src={artwork.dataUrl}
              alt={artwork.title}
              frameId={selectedFrame}
              className="w-full h-full"
            />

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-3">
              <p className="text-white text-xs font-bold text-center drop-shadow">
                액자 포함 · SNS / 이메일 공유
              </p>
              <ArtworkShareActions
                dataUrl={artwork.dataUrl}
                title={artwork.title}
                frameId={selectedFrame}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onShare(artwork)}
                  className="p-2.5 bg-white/90 text-blue-600 rounded-xl hover:bg-white transition-all shadow"
                  title="공유 링크 복사"
                >
                  <Link2 size={18} />
                </button>
                <button
                  onClick={() => artwork.id && onDelete(artwork.id)}
                  className="p-2.5 bg-white/90 text-red-500 rounded-xl hover:bg-white transition-all shadow"
                  title="삭제"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 flex justify-between items-center bg-white">
            <div>
              <h4 className="font-black text-gray-800">{artwork.title}</h4>
              <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5 mt-1">
                <Calendar size={14} /> {getArtworkDateLabel(artwork)}
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
