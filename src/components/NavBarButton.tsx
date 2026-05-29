import React from 'react';
import { LucideIcon } from 'lucide-react';

export type NavVariant = 'draw' | 'gallery' | 'upload';

const VARIANT_STYLES: Record<
  NavVariant,
  { active: string; inactive: string; iconActive: string; iconInactive: string }
> = {
  draw: {
    active: 'bg-pink-500 border-pink-500 text-white shadow-md',
    inactive: 'bg-white border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300',
    iconActive: 'text-white',
    iconInactive: 'text-pink-500',
  },
  gallery: {
    active: 'bg-emerald-500 border-emerald-500 text-white shadow-md',
    inactive: 'bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300',
    iconActive: 'text-white',
    iconInactive: 'text-emerald-500',
  },
  upload: {
    active: 'bg-sky-500 border-sky-500 text-white shadow-md',
    inactive: 'bg-white border-sky-200 text-sky-600 hover:bg-sky-50 hover:border-sky-300',
    iconActive: 'text-white',
    iconInactive: 'text-sky-500',
  },
};

export const NAV_BTN_BASE =
  'flex flex-col items-center justify-center gap-1 px-2 sm:px-3 py-2 rounded-xl font-black text-[11px] sm:text-xs border-2 transition-all select-none w-full shadow-sm';

interface NavBarButtonProps {
  icon: LucideIcon;
  label: string;
  shortLabel?: string;
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
  shortLabel,
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
      <Icon size={16} className={`flex-shrink-0 sm:w-[18px] sm:h-[18px] ${iconClass}`} strokeWidth={2.5} />
      <span className="leading-tight text-center w-full truncate px-0.5">
        <span className="md:hidden">{shortLabel ?? label}</span>
        <span className="hidden md:inline">{label}</span>
      </span>
    </button>
  );
};

interface NavBarLabelButtonProps {
  icon: LucideIcon;
  label: string;
  shortLabel?: string;
  variant: NavVariant;
  className?: string;
  'data-tour'?: string;
  children: React.ReactNode;
}

/** Same look as NavBarButton but renders as <label> for file inputs */
export const NavBarLabelButton: React.FC<NavBarLabelButtonProps> = ({
  icon: Icon,
  label,
  shortLabel,
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
      <Icon size={16} className={`flex-shrink-0 sm:w-[18px] sm:h-[18px] ${styles.iconInactive}`} strokeWidth={2.5} />
      <span className="leading-tight text-center w-full truncate px-0.5">
        <span className="md:hidden">{shortLabel ?? label}</span>
        <span className="hidden md:inline">{label}</span>
      </span>
      {children}
    </label>
  );
};
