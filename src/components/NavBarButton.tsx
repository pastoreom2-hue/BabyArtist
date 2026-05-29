import React from 'react';
import { LucideIcon } from 'lucide-react';

export type NavVariant = 'draw' | 'gallery' | 'upload';

const VARIANT_STYLES: Record<
  NavVariant,
  { active: string; inactive: string; iconActive: string; iconInactive: string }
> = {
  draw: {
    active: 'bg-pink-500 text-white border-pink-500 shadow-sm',
    inactive: 'bg-white text-stone-600 border-stone-200 hover:border-pink-200 hover:text-pink-600',
    iconActive: 'text-white',
    iconInactive: 'text-pink-400',
  },
  gallery: {
    active: 'bg-emerald-500 text-white border-emerald-500 shadow-sm',
    inactive: 'bg-white text-stone-600 border-stone-200 hover:border-emerald-200 hover:text-emerald-600',
    iconActive: 'text-white',
    iconInactive: 'text-emerald-400',
  },
  upload: {
    active: 'bg-sky-500 text-white border-sky-500 shadow-sm',
    inactive: 'bg-white text-stone-600 border-stone-200 hover:border-sky-200 hover:text-sky-600',
    iconActive: 'text-white',
    iconInactive: 'text-sky-400',
  },
};

/** Shared pill nav button — horizontal icon + label */
export const NAV_BTN_BASE =
  'inline-flex flex-row items-center justify-center gap-2 sm:gap-3 min-h-[3rem] sm:min-h-[3.25rem] px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-bold text-base sm:text-lg border transition-all select-none whitespace-nowrap w-full';

interface NavBarButtonProps {
  icon: LucideIcon;
  label: string;
  variant: NavVariant;
  isActive?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  'data-tour'?: string;
}

export const NavBarButton: React.FC<NavBarButtonProps> = ({
  icon: Icon,
  label,
  variant,
  isActive = false,
  onClick,
  type = 'button',
  className = '',
  'data-tour': dataTour,
}) => {
  const styles = VARIANT_STYLES[variant];
  const stateClass = isActive ? styles.active : styles.inactive;
  const iconClass = isActive ? styles.iconActive : styles.iconInactive;

  return (
    <button
      type={type}
      onClick={onClick}
      data-tour={dataTour}
      data-nav-btn=""
      className={`${NAV_BTN_BASE} ${stateClass} ${className}`}
    >
      <Icon size={20} className={`flex-shrink-0 sm:w-[22px] sm:h-[22px] ${iconClass}`} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );
};

interface NavBarLabelButtonProps {
  icon: LucideIcon;
  label: string;
  variant: NavVariant;
  className?: string;
  'data-tour'?: string;
  children: React.ReactNode;
}

export const NavBarLabelButton: React.FC<NavBarLabelButtonProps> = ({
  icon: Icon,
  label,
  variant,
  className = '',
  'data-tour': dataTour,
  children,
}) => {
  const styles = VARIANT_STYLES[variant];

  return (
    <label
      data-tour={dataTour}
      data-nav-btn=""
      className={`${NAV_BTN_BASE} ${styles.inactive} cursor-pointer ${className}`}
    >
      <Icon size={20} className={`flex-shrink-0 sm:w-[22px] sm:h-[22px] ${styles.iconInactive}`} strokeWidth={2.5} />
      <span>{label}</span>
      {children}
    </label>
  );
};
