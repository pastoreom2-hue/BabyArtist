import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Mail, Share2, Loader2 } from 'lucide-react';
import { FrameId } from '../frames';
import {
  createFramedImageBlob,
  downloadFramedImage,
  shareFramedImage,
  shareFramedImageByEmail,
} from '../utils/framedExport';

interface ArtworkShareActionsProps {
  dataUrl: string;
  title: string;
  frameId: FrameId;
  className?: string;
}

export const ArtworkShareActions: React.FC<ArtworkShareActionsProps> = ({
  dataUrl,
  title,
  frameId,
  className = '',
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<void>) => {
    setLoading(key);
    try {
      await fn();
    } catch (e) {
      console.error(e);
      alert('공유에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setLoading(null);
    }
  };

  const btnClass =
    'p-3 sm:p-4 rounded-2xl shadow-lg transition-all flex items-center justify-center disabled:opacity-60';

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        disabled={!!loading}
        title="카톡·페이스북·SNS로 보내기 (액자 포함)"
        onClick={() =>
          run('sns', async () => {
            const result = await shareFramedImage(dataUrl, frameId, title);
            if (result === 'downloaded') {
              alert(
                '액자가 들어간 이미지가 저장됐어요!\n카톡·페이스북·인스타 앱에서 사진을 선택해 보내주세요.'
              );
            }
          })
        }
        className={`${btnClass} bg-gradient-to-br from-emerald-400 to-teal-500 text-white hover:brightness-105`}
      >
        {loading === 'sns' ? <Loader2 size={22} className="animate-spin" /> : <Share2 size={22} />}
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        disabled={!!loading}
        title="이메일로 보내기 (액자 포함)"
        onClick={() =>
          run('email', () => shareFramedImageByEmail(dataUrl, frameId, title))
        }
        className={`${btnClass} bg-white text-blue-600 hover:bg-blue-50`}
      >
        {loading === 'email' ? <Loader2 size={22} className="animate-spin" /> : <Mail size={22} />}
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        disabled={!!loading}
        title="액자 이미지 저장"
        onClick={() =>
          run('save', async () => {
            const blob = await createFramedImageBlob(dataUrl, frameId);
            downloadFramedImage(blob, (title || 'babyartist').replace(/\s+/g, '-'));
          })
        }
        className={`${btnClass} bg-white text-slate-700 hover:bg-slate-50`}
      >
        {loading === 'save' ? <Loader2 size={22} className="animate-spin" /> : <Download size={22} />}
      </motion.button>
    </div>
  );
};
