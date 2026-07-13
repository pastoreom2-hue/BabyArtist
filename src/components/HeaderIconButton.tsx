import React from 'react';
import { LucideIcon } from 'lucide-react';

export type HeaderBtnTone = 'music' | 'help' | 'auth' | 'neutral';

interface HeaderIconButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  title: string;
  active?: boolean;
  /** Color family for child-friendly pastel chrome */
  tone?: HeaderBtnTone;
  /** Music & Help use `large` for easier tapping */
  size?: 'default' | 'large';
  className?: string;
}

const SIZE_CLASSES = {
  default: 'w-10 h-10 sm:w-11 sm:h-11',
  large: 'w-11 h-11 sm:w-[3.25rem] sm:h-[3.25rem]',
} as const;

const ICON_SIZES = {
  default: 18,
  large: 22,
} as const;

const TONE_STYLES: Record<
  HeaderBtnTone,
  { idle: string; active: string; icon: string }
> = {
  music: {
    idle:
      'bg-gradient-to-b from-amber-200 to-yellow-400 text-amber-800 border-amber-300 ' +
      'shadow-[0_3px_0_0_#f59e0b] hover:brightness-105 hover:-translate-y-0.5',
    active:
      'bg-gradient-to-b from-yellow-300 to-orange-400 text-white border-orange-300 ' +
      'shadow-[0_3px_0_0_#ea580c] animate-pulse',
    icon: '',
  },
  help: {
    idle:
      'bg-gradient-to-b from-sky-200 to-cyan-400 text-sky-800 border-sky-300 ' +
      'shadow-[0_3px_0_0_#0284c7] hover:brightness-105 hover:-translate-y-0.5',
    active:
      'bg-gradient-to-b from-cyan-300 to-teal-500 text-white border-teal-300 ' +
      'shadow-[0_3px_0_0_#0f766e]',
    icon: '',
  },
  auth: {
    idle:
      'bg-gradient-to-b from-fuchsia-200 to-pink-400 text-fuchsia-900 border-pink-300 ' +
      'shadow-[0_3px_0_0_#db2777] hover:brightness-105 hover:-translate-y-0.5',
    active:
      'bg-gradient-to-b from-pink-400 to-violet-500 text-white border-violet-300 ' +
      'shadow-[0_3px_0_0_#7c3aed]',
    icon: '',
  },
  neutral: {
    idle:
      'bg-gradient-to-b from-stone-100 to-stone-200 text-stone-600 border-stone-300 ' +
      'shadow-[0_3px_0_0_#a8a29e] hover:brightness-105 hover:-translate-y-0.5',
    active: 'bg-stone-300 text-stone-800 border-stone-400',
    icon: '',
  },
};

/** Header icon — Music, Help, Logout */
export const HeaderIconButton: React.FC<HeaderIconButtonProps> = ({
  icon: Icon,
  onClick,
  title,
  active = false,
  tone = 'neutral',
  size = 'default',
  className = '',
}) => {
  const styles = TONE_STYLES[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`${SIZE_CLASSES[size]} inline-flex items-center justify-center rounded-full border-[2.5px] transition-all duration-200 ease-out active:translate-y-0.5 active:shadow-none ${
        active ? styles.active : styles.idle
      } ${className}`}
    >
      <Icon
        size={ICON_SIZES[size]}
        strokeWidth={2.6}
        className="shrink-0 [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.55))]"
      />
    </button>
  );
};

interface HeaderLoginButtonProps {
  onClick: () => void;
  label?: string;
}

/** Colorful Login CTA matching the playful header system */
export const HeaderLoginButton: React.FC<HeaderLoginButtonProps> = ({
  onClick,
  label = 'Login',
}) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    aria-label={label}
    className="h-10 sm:h-11 px-4 sm:px-5 inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full font-black text-sm sm:text-base text-white border-[2.5px] border-white/80 bg-gradient-to-b from-[#FF8AD8] via-[#FF5CB3] to-[#E91E8C] shadow-[0_3px_0_0_#be185d] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-200 ease-out [text-shadow:0_1px_0_rgba(0,0,0,0.2)]"
  >
    <span className="hidden sm:inline">{label}</span>
    <span className="sm:hidden">Login</span>
  </button>
);
