import React from 'react';
import { LucideIcon } from 'lucide-react';

interface HeaderIconButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  title: string;
  active?: boolean;
  activeClass?: string;
  /** Music & Help use `large` for easier tapping */
  size?: 'default' | 'large';
}

const SIZE_CLASSES = {
  default: 'w-9 h-9 sm:w-10 sm:h-10',
  large: 'w-11 h-11 sm:w-12 sm:h-12',
} as const;

const ICON_SIZES = {
  default: 18,
  large: 24,
} as const;

/** Header icon — Music, Help, Logout */
export const HeaderIconButton: React.FC<HeaderIconButtonProps> = ({
  icon: Icon,
  onClick,
  title,
  active = false,
  activeClass = 'bg-amber-100 text-amber-600 border-amber-200',
  size = 'default',
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className={`${SIZE_CLASSES[size]} flex items-center justify-center rounded-full border-2 transition-all ${
      active
        ? activeClass
        : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100 hover:text-stone-700'
    }`}
  >
    <Icon size={ICON_SIZES[size]} strokeWidth={2.25} />
  </button>
);
