import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Camera } from 'lucide-react';

interface PhotoUploadButtonProps {
  onUpload: (dataUrl: string) => void;
  className?: string;
}

export const PhotoUploadButton: React.FC<PhotoUploadButtonProps> = ({
  onUpload,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpload(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <motion.label
      data-tour="tour-step-1"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-2xl font-black shadow-lg border-4 border-sky-300 cursor-pointer select-none ${className}`}
    >
      <Camera size={22} className="flex-shrink-0" />
      <span className="text-sm sm:text-base whitespace-nowrap">그림 올리기</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
        aria-label="아이 그림 사진 업로드"
      />
    </motion.label>
  );
};
