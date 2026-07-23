import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { FrameId } from '../frames';
import { ArtworkShareActions } from './ArtworkShareActions';
import {
  type FamilyContact,
  familyRecipientLabel,
  loadFamilyContact,
} from '../utils/familyContact';

const DEMO_ART =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#fafaf9"/>
      <circle cx="200" cy="130" r="60" fill="#f472b6"/>
      <text x="200" y="240" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" font-weight="bold" fill="#78716c">My Drawing</text>
    </svg>`
  );

interface GalleryShareGuideProps {
  selectedFrame: FrameId;
  previewUrl?: string;
  familyContact?: FamilyContact;
}

export const GalleryShareGuide: React.FC<GalleryShareGuideProps> = ({
  selectedFrame,
  previewUrl,
  familyContact,
}) => {
  const shareUrl = previewUrl || DEMO_ART;
  const [successLabel, setSuccessLabel] = useState<string | null>(null);
  const contact = familyContact ?? loadFamilyContact();
  const label = familyRecipientLabel(contact);

  return (
    <section
      data-tour="tour-step-3"
      className="mb-6 p-3 sm:p-4 rounded-2xl border border-stone-200/80 bg-white shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-stone-100 rounded-lg text-stone-600">
          <Share2 size={16} strokeWidth={2.25} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-stone-800">Send to Family</h3>
          <p className="text-[10px] text-stone-400">
            {contact.email || contact.phone
              ? `One-touch send to ${label}`
              : '모바일: 공유 → 카카오톡 · PC: 파일 저장 후 앨범 첨부 (붙여넣기 불가)'}
          </p>
        </div>
      </div>
      <ArtworkShareActions
        dataUrl={shareUrl}
        title="BabyArtist Masterpiece.png"
        frameId={selectedFrame}
        contact={contact}
        variant="hero"
        onSuccess={(name) => {
          setSuccessLabel(name);
          window.setTimeout(() => setSuccessLabel(null), 3200);
        }}
      />
      {successLabel && (
        <p
          className="mt-3 text-center text-sm font-bold text-pink-600 bg-pink-50 border border-pink-100 rounded-xl px-3 py-2"
          role="status"
          data-testid="gallery-send-success"
        >
          Sent to {successLabel} successfully!
        </p>
      )}
    </section>
  );
};
