import { FrameId } from '../frames';
import {
  FamilyContact,
  familyRecipientLabel,
  hasFamilyRecipient,
  loadFamilyContact,
} from './familyContact';
import { sanitizeArtworkFilename } from './artworkNaming';
import { downloadDataUrl } from './downloadDataUrl';
import { createFramedPngBlob } from './frameExport';

const MAIL_SUBJECT = 'Check out my new drawing!';
const MAIL_BODY =
  "I've saved my drawing and attached it. Please check the attachment!";

const KAKAO_ATTACH_TIP =
  '그림 파일이 저장됐어요!\n\n' +
  '카카오톡에서는 붙여넣기(Paste)가 안 됩니다.\n' +
  '채팅방 → + → 앨범/파일 에서 방금 저장된 사진을 첨부해 주세요.';

export type OneTouchSendMethod = 'share' | 'email' | 'sms' | 'download';

export interface OneTouchSendResult {
  ok: boolean;
  method?: OneTouchSendMethod;
  recipientLabel: string;
  aborted?: boolean;
  error?: string;
}

function isMobileShareDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPad|iPod/i.test(ua)) return true;
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

function openMailto(email?: string) {
  const to = (email ?? '').trim();
  const href = `mailto:${to}?subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${encodeURIComponent(MAIL_BODY)}`;
  window.location.href = href;
}

function openSms(phone: string, label: string) {
  const digits = phone.replace(/[^\d+]/g, '');
  const body = encodeURIComponent(`I made a drawing for ${label} on BabyArtist! 💕`);
  // iOS uses &body=, Android often ?body=
  const sep = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? '&' : '?';
  window.location.href = `sms:${digits}${sep}body=${body}`;
}

function downloadFramedBuffer(buffer: ArrayBuffer, name: string) {
  const url = URL.createObjectURL(new Blob([buffer], { type: 'image/png' }));
  downloadDataUrl(url, name);
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export interface OneTouchSendOptions {
  dataUrl: string;
  title: string;
  frameId: FrameId;
  /** Override loaded contact (optional) */
  contact?: FamilyContact;
}

/**
 * One-Touch Send: share framed PNG to family without the child typing an address.
 * Prefers Web Share (mobile) → preset mailto/sms → download fallback.
 */
export async function oneTouchSendDrawing(options: OneTouchSendOptions): Promise<OneTouchSendResult> {
  const contact = options.contact ?? loadFamilyContact();
  const recipientLabel = familyRecipientLabel(contact);
  const filename = sanitizeArtworkFilename(options.title);

  try {
    const blob = await createFramedPngBlob(options.dataUrl, options.frameId);
    const name = filename.replace(/\.png$/i, '') + '-framed.png';
    const buffer = await blob.arrayBuffer();
    if (buffer.byteLength === 0) throw new Error('Empty PNG');

    const file = new File([buffer], name, {
      type: 'image/png',
      lastModified: Date.now(),
    });
    if (file.size === 0) throw new Error('Empty PNG');

    const useNativeShare = isMobileShareDevice() && canShareFiles(file);

    if (useNativeShare) {
      try {
        const shareData: ShareData = {
          files: [file],
          title: `Drawing for ${recipientLabel}`,
          text: `I made this for ${recipientLabel} on BabyArtist!`,
        };
        // Some browsers reject text+files; retry files-only
        try {
          if (typeof navigator.canShare === 'function' && !navigator.canShare(shareData)) {
            await navigator.share({ files: [file] });
          } else {
            await navigator.share(shareData);
          }
        } catch {
          await navigator.share({ files: [file] });
        }
        return { ok: true, method: 'share', recipientLabel };
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return { ok: false, aborted: true, recipientLabel };
        }
        // Fall through
      }
    }

    if (contact.email) {
      downloadFramedBuffer(buffer, name);
      openMailto(contact.email);
      return { ok: true, method: 'email', recipientLabel };
    }

    if (contact.phone) {
      downloadFramedBuffer(buffer, name);
      openSms(contact.phone, recipientLabel);
      return { ok: true, method: 'sms', recipientLabel };
    }

    downloadFramedBuffer(buffer, name);
    if (!hasFamilyRecipient(contact)) {
      alert(
        '부모님께 부탁해요!\n헤더의 가족 설정에서 이메일이나 전화번호를 저장하면\n한 번에 보낼 수 있어요.\n\n' +
          KAKAO_ATTACH_TIP
      );
      openMailto();
    } else {
      alert(KAKAO_ATTACH_TIP);
    }
    return { ok: true, method: 'download', recipientLabel };
  } catch (e) {
    console.error(e);
    return {
      ok: false,
      recipientLabel,
      error:
        '그림을 준비하지 못했어요. 다시 한 번 보내 주세요.\n그래도 안 되면 Save로 저장한 뒤 앨범에서 첨부해 주세요.',
    };
  }
}
