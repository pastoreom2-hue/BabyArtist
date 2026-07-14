import React, { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { FrameId } from '../frames';
import { sanitizeArtworkFilename } from '../utils/artworkNaming';
import { downloadDataUrl } from '../utils/downloadDataUrl';
import { createFramedPngBlob } from '../utils/frameExport';

interface ArtworkShareActionsProps {
  dataUrl: string;
  title: string;
  frameId: FrameId;
  className?: string;
}

const MAIL_SUBJECT = 'Check out my new drawing!';
const MAIL_BODY =
  "I've saved my drawing and attached it. Please check the attachment!";

const KAKAO_ATTACH_TIP =
  '그림 파일이 저장됐어요!\n\n' +
  '카카오톡에서는 붙여넣기(Paste)가 안 됩니다.\n' +
  '채팅방 → + → 앨범/파일 에서 방금 저장된 사진을 첨부해 주세요.';

/** True phones/tablets where KakaoTalk can receive a shared File. */
function isMobileShareDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPad|iPod/i.test(ua)) return true;
  // iPadOS desktop UA
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
  return window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024;
}

function canShareFiles(file: File): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return false;
  }
  try {
    if (typeof navigator.canShare !== 'function') return true;
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function openMailto() {
  const href = `mailto:?subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${encodeURIComponent(MAIL_BODY)}`;
  window.location.href = href;
}

function downloadFramedBuffer(buffer: ArrayBuffer, name: string) {
  const url = URL.createObjectURL(new Blob([buffer], { type: 'image/png' }));
  downloadDataUrl(url, name);
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Hybrid Send (KakaoTalk-safe):
 * - Mobile: native share sheet with a real PNG File (pick KakaoTalk — do not pick Copy)
 * - PC: download PNG + tip to attach from album (paste never works in KakaoTalk)
 */
export const ArtworkShareActions: React.FC<ArtworkShareActionsProps> = ({
  dataUrl,
  title,
  frameId,
  className = '',
}) => {
  const [busy, setBusy] = useState(false);
  const filename = sanitizeArtworkFilename(title);

  const handleSend = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const blob = await createFramedPngBlob(dataUrl, frameId);
      const name = filename.replace(/\.png$/i, '') + '-framed.png';
      const buffer = await blob.arrayBuffer();
      if (buffer.byteLength === 0) throw new Error('Empty PNG');

      // Fresh File from bytes — required for KakaoTalk / mail attachments
      const file = new File([buffer], name, {
        type: 'image/png',
        lastModified: Date.now(),
      });
      if (file.size === 0) throw new Error('Empty PNG');

      const useNativeShare = isMobileShareDevice() && canShareFiles(file);

      if (useNativeShare) {
        try {
          // Files only — KakaoTalk receives the image; Copy is a dead-end for paste
          await navigator.share({ files: [file] });
          return;
        } catch (err) {
          if ((err as Error).name === 'AbortError') return;
          // Fall through to download backup
        }
      }

      // Desktop (or share failed): save file — never claim clipboard paste works
      downloadFramedBuffer(buffer, name);
      alert(KAKAO_ATTACH_TIP);
      // Optional email backup after user dismisses tip
      openMailto();
    } catch (e) {
      console.error(e);
      alert(
        '그림을 준비하지 못했어요. 다시 한 번 Send를 눌러 주세요.\n' +
          '그래도 안 되면 Download 대신 Save로 저장한 뒤 카카오톡에서 앨범 첨부를 이용해 주세요.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 ${className}`}
      data-testid="artwork-share-actions"
    >
      <button
        type="button"
        disabled={busy}
        onClick={() => void handleSend()}
        title="Send drawing"
        aria-label="Send drawing"
        data-testid="share-send-btn"
        className="inline-flex items-center justify-center gap-2 h-11 min-w-[44px] px-5 rounded-full border border-stone-200 bg-white text-pink-600 text-sm font-bold shadow-sm hover:bg-pink-50 hover:border-pink-200 disabled:opacity-60 transition-colors"
      >
        {busy ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        Send
      </button>
      <p className="text-[10px] text-stone-400 text-center max-w-[14rem] leading-snug">
        카카오톡: 공유 시트에서 카톡 선택 (Copy/붙여넣기 ❌ · 파일 첨부 ✅)
      </p>
    </div>
  );
};
