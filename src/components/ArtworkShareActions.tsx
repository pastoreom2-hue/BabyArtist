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
  onSuccess?: (recipientLabel: string) => void;
}

/**
 * Compact Send for gallery cards — primary kid Send lives on the drawing toolbar.
 */
export const ArtworkShareActions: React.FC<ArtworkShareActionsProps> = ({
  dataUrl,
  title,
  frameId,
  className = '',
  contact: contactProp,
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

  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 ${className}`}
      data-testid="artwork-share-actions"
    >
      <button
        type="button"
        disabled={busy}
        onClick={() => void handleSend()}
        title={`Send to ${label}`}
        aria-label={`Send to ${label}`}
        data-testid="share-send-btn"
        className="inline-flex items-center justify-center gap-1.5 h-10 min-w-[44px] px-4 rounded-full border border-white/30 bg-white/95 text-blue-600 text-xs font-bold shadow-sm hover:bg-blue-50 disabled:opacity-60 transition-colors"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        Send
      </button>
    </div>
  );
};
