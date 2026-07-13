import React from 'react';
import { LucideIcon } from 'lucide-react';

export type NavVariant = 'draw' | 'save' | 'send';

/**
 * Vivacious kid-friendly themes — candy-bright, playful, easy to love.
 */
const VARIANT_STYLES: Record<
  NavVariant,
  { fill: string; glow: string; active: string }
> = {
  draw: {
    // Juicy lime → bold mint green
    fill: 'bg-gradient-to-b from-[#4AFF7A] via-[#00E676] to-[#00A83B]',
    glow:
      'shadow-[0_5px_0_0_#007A2A,0_8px_18px_-4px_rgba(0,140,50,0.55)] hover:shadow-[0_7px_0_0_#007A2A,0_12px_22px_-4px_rgba(0,140,50,0.6)]',
    active: 'ring-[3px] ring-[#69F0AE] ring-offset-2 ring-offset-white',
  },
  save: {
    // Splashy sky → bold true blue
    fill: 'bg-gradient-to-b from-[#40C4FF] via-[#0091EA] to-[#1565C0]',
    glow:
      'shadow-[0_5px_0_0_#0D47A1,0_8px_18px_-4px_rgba(21,101,192,0.55)] hover:shadow-[0_7px_0_0_#0D47A1,0_12px_22px_-4px_rgba(21,101,192,0.6)]',
    active: 'ring-[3px] ring-[#80D8FF] ring-offset-2 ring-offset-white',
  },
  send: {
    // Candy pink → bold magenta
    fill: 'bg-gradient-to-b from-[#FF5EC8] via-[#FF2D95] to-[#E0006E]',
    glow:
      'shadow-[0_5px_0_0_#AD0058,0_8px_18px_-4px_rgba(224,0,110,0.6)] hover:shadow-[0_7px_0_0_#AD0058,0_12px_22px_-4px_rgba(224,0,110,0.65)]',
    active: 'ring-[3px] ring-[#FF80AB] ring-offset-2 ring-offset-white',
  },
};

/** Shared playful pill — identical size & bounce for all actions */
export const NAV_BTN_BASE =
  'group relative overflow-hidden inline-flex flex-row items-center justify-center gap-1.5 sm:gap-2 ' +
  'h-12 sm:h-[3.6rem] px-2.5 sm:px-5 ' +
  'rounded-full font-black text-[13px] sm:text-base tracking-normal text-white ' +
  'border-[3px] border-white/70 ' +
  'transition-all duration-200 ease-out select-none whitespace-nowrap w-full ' +
  'hover:-translate-y-1 active:translate-y-0.5 active:shadow-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2';

const ShineOverlay = () => (
  <>
    {/* Soft candy gloss — light enough that letters stay clear */}
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-1 top-1 h-[38%] rounded-full bg-gradient-to-b from-white/50 to-transparent"
    />
  </>
);

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

  return (
    <button
      type={type}
      onClick={onClick}
      data-tour={dataTour}
      data-nav-btn=""
      aria-current={isActive ? 'page' : undefined}
      className={`${NAV_BTN_BASE} ${styles.fill} ${styles.glow} ${isActive ? styles.active : ''} ${className}`}
    >
      <ShineOverlay />
      <Icon
        size={20}
        className="relative z-[1] flex-shrink-0 sm:w-[22px] sm:h-[22px]"
        strokeWidth={2.75}
      />
      <span className="relative z-[1] [text-shadow:0_1px_0_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.2)]">
        {label}
      </span>
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
      className={`${NAV_BTN_BASE} ${styles.fill} ${styles.glow} cursor-pointer ${className}`}
    >
      <ShineOverlay />
      <Icon
        size={20}
        className="relative z-[1] flex-shrink-0 sm:w-[22px] sm:h-[22px]"
        strokeWidth={2.75}
      />
      <span className="relative z-[1] [text-shadow:0_1px_0_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.2)]">
        {label}
      </span>
      {children}
    </label>
  );
};
