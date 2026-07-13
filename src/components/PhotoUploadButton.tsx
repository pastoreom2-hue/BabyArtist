import React, { useRef } from 'react';
import { Save, Camera } from 'lucide-react';
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
      aria-label="Save drawing photo"
    />
  );

  if (variant === 'nav') {
    return (
      <NavBarLabelButton
        icon={Save}
        label="Save Drawing"
        variant="save"
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
      className={`group relative overflow-hidden inline-flex items-center justify-center gap-2 h-12 sm:h-[3.6rem] px-5 rounded-full font-black text-[13px] sm:text-base tracking-normal text-white border-[3px] border-white/70 bg-gradient-to-b from-[#40C4FF] via-[#0091EA] to-[#1565C0] shadow-[0_5px_0_0_#0D47A1,0_8px_18px_-4px_rgba(21,101,192,0.55)] hover:shadow-[0_7px_0_0_#0D47A1,0_12px_22px_-4px_rgba(21,101,192,0.6)] hover:-translate-y-1 active:translate-y-0.5 active:shadow-none transition-all duration-200 ease-out cursor-pointer select-none ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-1 top-1 h-[38%] rounded-full bg-gradient-to-b from-white/50 to-transparent"
      />
      <Camera size={20} className="relative z-[1] flex-shrink-0" strokeWidth={2.75} />
      <span className="relative z-[1] whitespace-nowrap [text-shadow:0_1px_0_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.2)]">
        Save Drawing
      </span>
      {input}
    </label>
  );
};
