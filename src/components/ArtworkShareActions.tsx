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
import { sanitizeArtworkFilename } from '../utils/artworkNaming';

interface ArtworkShareActionsProps {
  dataUrl: string;
  title: string;
  frameId: FrameId;
  className?: string;
}

const FRIENDLY_SAVE_ERROR = "Oops! Let's try saving again";

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
      alert(FRIENDLY_SAVE_ERROR);
    } finally {
      setLoading(null);
    }
  };

  const safeTitle = sanitizeArtworkFilename(title);

  const btnClass =
    'w-10 h-10 rounded-full border border-stone-200 bg-white shadow-sm transition-all flex items-center justify-center disabled:opacity-50 hover:border-stone-300';

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        disabled={!!loading}
        title="Share (framed)"
        onClick={() =>
          run('sns', async () => {
            const result = await shareFramedImage(dataUrl, frameId, safeTitle);
            if (result === 'downloaded') {
              alert('Framed image saved! Open your messaging app and attach the photo to share.');
            }
          })
        }
        className={`${btnClass} text-emerald-600 hover:bg-emerald-50`}
      >
        {loading === 'sns' ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        disabled={!!loading}
        title="Email (framed)"
        onClick={() => run('email', () => shareFramedImageByEmail(dataUrl, frameId, safeTitle))}
        className={`${btnClass} text-blue-600 hover:bg-blue-50`}
      >
        {loading === 'email' ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        disabled={!!loading}
        title="Download (framed)"
        onClick={() =>
          run('save', async () => {
            const blob = await createFramedImageBlob(dataUrl, frameId);
            downloadFramedImage(blob, safeTitle);
          })
        }
        className={`${btnClass} text-stone-600 hover:bg-stone-50`}
      >
        {loading === 'save' ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
      </motion.button>
    </div>
  );
};
