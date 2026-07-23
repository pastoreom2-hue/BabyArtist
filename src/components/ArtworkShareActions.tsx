import React, { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { FrameId } from '../frames';
import {
  type FamilyContact,
  familyRecipientLabel,
  loadFamilyContact,
} from '../utils/familyContact';
import { oneTouchSendDrawing } from '../utils/oneTouchSend';

interface ArtworkShareActionsProps {
  dataUrl: string;
  title: string;
  frameId: FrameId;
  className?: string;
  contact?: FamilyContact;
  /** Larger kid-friendly CTA */
  variant?: 'default' | 'hero';
  onSuccess?: (recipientLabel: string) => void;
}

/**
 * Hybrid Send (KakaoTalk-safe) with optional One-Touch family preset:
 * - Mobile: native share sheet with a real PNG File
 * - Preset email/sms when configured by a parent
 * - PC: download PNG + tip
 */
export const ArtworkShareActions: React.FC<ArtworkShareActionsProps> = ({
  dataUrl,
  title,
  frameId,
  className = '',
  contact: contactProp,
  variant = 'default',
  onSuccess,
}) => {
  const [busy, setBusy] = useState(false);
  const contact = contactProp ?? loadFamilyContact();
  const label = familyRecipientLabel(contact);

  const handleSend = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await oneTouchSendDrawing({ dataUrl, title, frameId, contact });
      if (result.aborted) return;
      if (!result.ok) {
        alert(result.error ?? 'Could not send. Please try again.');
        return;
      }
      onSuccess?.(result.recipientLabel);
    } finally {
      setBusy(false);
    }
  };

  const isHero = variant === 'hero';

  return (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 ${className}`}
      data-testid="artwork-share-actions"
    >
      <button
        type="button"
        disabled={busy}
        onClick={() => void handleSend()}
        title={`Send to ${label}`}
        aria-label={`Send to ${label}`}
        data-testid="share-send-btn"
        className={
          isHero
            ? 'w-full inline-flex items-center justify-center gap-2.5 min-h-[52px] px-6 rounded-2xl border-[3px] border-white/80 bg-gradient-to-b from-pink-400 to-rose-500 text-white text-base font-black shadow-[0_4px_0_0_#be185d] disabled:opacity-60 transition-colors'
            : 'inline-flex items-center justify-center gap-2 h-11 min-w-[44px] px-5 rounded-full border border-stone-200 bg-white text-pink-600 text-sm font-bold shadow-sm hover:bg-pink-50 hover:border-pink-200 disabled:opacity-60 transition-colors'
        }
      >
        {busy ? <Loader2 size={isHero ? 22 : 18} className="animate-spin" /> : <Send size={isHero ? 22 : 18} />}
        {isHero ? `Send to ${label}` : 'Send'}
      </button>
      <p className="text-[10px] text-stone-400 text-center max-w-[16rem] leading-snug">
        {contact.email || contact.phone
          ? `One-touch → ${label}`
          : '모바일: 공유 → 카카오톡 · PC: 파일 저장 후 앨범 첨부'}
      </p>
    </div>
  );
};
