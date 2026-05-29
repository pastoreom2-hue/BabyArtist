import React from 'react';
import { Share2 } from 'lucide-react';
import { FrameId } from '../frames';
import { ArtworkShareActions } from './ArtworkShareActions';

const DEMO_ART =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#fef3c7"/>
      <circle cx="200" cy="130" r="60" fill="#f472b6"/>
      <text x="200" y="240" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" font-weight="bold" fill="#64748b">우리 아이 그림</text>
    </svg>`
  );

interface GalleryShareGuideProps {
  selectedFrame: FrameId;
  previewUrl?: string;
}

export const GalleryShareGuide: React.FC<GalleryShareGuideProps> = ({
  selectedFrame,
  previewUrl,
}) => {
  const shareUrl = previewUrl || DEMO_ART;

  return (
    <section
      data-tour="tour-step-3"
      className="mb-8 p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-white to-teal-50 rounded-2xl border-4 border-emerald-200 shadow-md"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-emerald-400 rounded-xl text-white">
          <Share2 size={18} />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-black text-emerald-900">가족에게 보내기</h3>
          <p className="text-[10px] sm:text-xs font-bold text-emerald-700/80">
            카톡 · 페이스북 · 이메일로 액자 그림을 공유해요
          </p>
        </div>
      </div>
      <ArtworkShareActions
        dataUrl={shareUrl}
        title="BabyArtist Masterpiece"
        frameId={selectedFrame}
      />
    </section>
  );
};
