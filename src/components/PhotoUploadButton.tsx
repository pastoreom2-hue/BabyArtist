import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import { NavBarLabelButton } from './NavBarButton';

interface PhotoUploadButtonProps {
  onUpload: (dataUrl: string) => void;
  className?: string;
  variant?: 'standalone' | 'nav';
}

export const PhotoUploadButton: React.FC<PhotoUploadButtonProps> = ({
  onUpload,
  className = '',
  variant = 'nav',
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

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      capture="environment"
      className="hidden"
      onChange={handleChange}
      aria-label="Upload drawing photo"
    />
  );

  if (variant === 'nav') {
    return (
      <NavBarLabelButton
        icon={Camera}
        label="Upload Drawing"
        shortLabel="Upload"
        variant="upload"
        data-tour="tour-step-1"
        className={className}
      >
        {input}
      </NavBarLabelButton>
    );
  }

  return (
    <label
      data-tour="tour-step-1"
      className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-2xl font-black shadow-lg border-4 border-sky-300 cursor-pointer select-none ${className}`}
    >
      <Camera size={22} className="flex-shrink-0" />
      <span className="text-sm sm:text-base whitespace-nowrap">Upload Drawing</span>
      {input}
    </label>
  );
};
