import React from 'react';
import { motion } from 'motion/react';
import { Artwork } from '../types';
import { Share2, Trash2, Calendar, Download, Send } from 'lucide-react';
import { FramedArtwork } from './FramedArtwork';
import { FrameId } from '../frames';

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

function downloadDataUrl(dataUrl: string, filenameBase: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${filenameBase}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function shareToFamily(artwork: Artwork) {
  const shareUrl = artwork.id ? `${window.location.origin}/share/${artwork.id}` : undefined;

  if (navigator.share) {
    try {
      await navigator.share({
        title: artwork.title,
        text: '우리 아이의 멋진 작품을 공유해요!',
        url: shareUrl,
      });
      return;
    } catch {
      // ignore and fall back
    }
  }

  if (shareUrl) {
    await navigator.clipboard.writeText(shareUrl);
    alert('공유 링크를 클립보드에 복사했어요! 가족에게 보내주세요.');
  } else {
    alert('이 작품은 링크 공유를 지원하지 않아요. 먼저 클라우드에 저장해 주세요.');
  }
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

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                onClick={() =>
                  downloadDataUrl(
                    artwork.dataUrl,
                    (artwork.title || 'babyartist').replace(/\s+/g, '-')
                  )
                }
                className="p-4 bg-white text-slate-700 rounded-2xl hover:bg-slate-50 transition-all shadow-lg"
                title="이미지 내보내기"
              >
                <Download size={22} />
              </button>
              <button
                onClick={() => shareToFamily(artwork)}
                className="p-4 bg-white text-emerald-600 rounded-2xl hover:bg-emerald-50 transition-all shadow-lg"
                title="가족에게 보내기"
              >
                <Send size={22} />
              </button>
              <button
                onClick={() => onShare(artwork)}
                className="p-4 bg-white text-blue-500 rounded-2xl hover:bg-blue-50 transition-all shadow-lg"
                title="공유 링크"
              >
                <Share2 size={22} />
              </button>
              <button
                onClick={() => artwork.id && onDelete(artwork.id)}
                className="p-4 bg-white text-red-500 rounded-2xl hover:bg-red-50 transition-all shadow-lg"
                title="삭제"
              >
                <Trash2 size={22} />
              </button>
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