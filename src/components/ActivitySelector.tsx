import React from 'react';
import { motion } from 'motion/react';
import { ActivityType, ActivityLevel } from '../types';
import { Palette, Hash, Shapes, Trophy, LucideIcon } from 'lucide-react';

interface ActivitySelectorProps {
  activeActivity: ActivityType;
  onActivityChange: (activity: ActivityType) => void;
  activeLevel: ActivityLevel;
  onLevelChange: (level: ActivityLevel) => void;
  onShowChallenge: () => void;
  variant?: 'default' | 'fullscreen';
}

const ACTIVITIES: {
  id: ActivityType;
  name: string;
  icon: LucideIcon;
  labelClass: string;
  iconClass: string;
  activeClass: string;
  inactiveClass: string;
}[] = [
  {
    id: 'free-draw',
    name: 'Free Draw',
    icon: Palette,
    labelClass: 'text-[#22C55E]',
    iconClass: 'text-[#22C55E]',
    activeClass: 'bg-white border-amber-200/80 shadow-sm',
    inactiveClass: 'bg-transparent border-transparent hover:bg-white/80 hover:border-lime-200/80',
  },
  {
    id: 'color-by-number',
    name: 'Color by Number',
    icon: Hash,
    labelClass: 'text-[#FBBF24]',
    iconClass: 'text-[#FBBF24]',
    activeClass: 'bg-white border-amber-200/80 shadow-sm',
    inactiveClass: 'bg-transparent border-transparent hover:bg-white/80 hover:border-lime-200/80',
  },
  {
    id: 'shape-match',
    name: 'Shape Match',
    icon: Shapes,
    labelClass: 'text-stone-800',
    iconClass: 'text-[#84CC16]',
    activeClass: 'bg-white border-amber-200/80 shadow-sm',
    inactiveClass: 'bg-transparent border-transparent hover:bg-white/80 hover:border-lime-200/80',
  },
];

const LEVEL_STYLES: Record<
  ActivityLevel,
  { circle: string; number: string; activeCircle: string; activeNumber: string }
> = {
  1: {
    circle: 'bg-amber-50 border-amber-200/70',
    number: 'text-[#16A34A]',
    activeCircle: 'bg-[#22C55E] border-[#22C55E]',
    activeNumber: 'text-white',
  },
  2: {
    circle: 'bg-rose-100/80 border-rose-200/70',
    number: 'text-[#4ADE80]',
    activeCircle: 'bg-[#4ADE80] border-[#4ADE80]',
    activeNumber: 'text-white',
  },
  3: {
    circle: 'bg-rose-100/80 border-rose-200/70',
    number: 'text-[#FB923C]',
    activeCircle: 'bg-[#FB923C] border-[#FB923C]',
    activeNumber: 'text-white',
  },
};

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  activeActivity,
  onActivityChange,
  activeLevel,
  onLevelChange,
  onShowChallenge,
  variant = 'default',
}) => {
  const levels: ActivityLevel[] = [1, 2, 3];
  const isFullscreen = variant === 'fullscreen';

  const NavButton: React.FC<{
    onClick: () => void;
    className: string;
    children: React.ReactNode;
  }> = ({ onClick, className, children }) =>
    isFullscreen ? (
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
    ) : (
      <motion.button whileTap={{ scale: 0.98 }} onClick={onClick} className={className}>
        {children}
      </motion.button>
    );

  return (
    <div className={`flex flex-col gap-2 ${isFullscreen ? 'items-center' : ''}`}>
      <div
        className={`flex gap-2 ${
          isFullscreen ? 'flex-wrap justify-center max-w-full' : 'flex-wrap'
        }`}
      >
        {ACTIVITIES.map((activity) => {
          const Icon = activity.icon;
          const isActive = activeActivity === activity.id;

          return (
            <NavButton
              key={activity.id}
              onClick={() => onActivityChange(activity.id)}
              className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full font-bold border transition-all whitespace-nowrap ${
                isFullscreen
                  ? 'px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-base'
                  : 'px-4 sm:px-5 py-2 sm:py-2.5 text-base sm:text-lg'
              } ${isActive ? activity.activeClass : activity.inactiveClass}`}
            >
              <Icon
                className={`shrink-0 ${isFullscreen ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-4 h-4 sm:w-5 sm:h-5'} ${activity.iconClass}`}
                strokeWidth={2.25}
              />
              <span className={activity.labelClass} data-testid="activity-label">{activity.name}</span>
            </NavButton>
          );
        })}

        <NavButton
          onClick={onShowChallenge}
          className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full font-bold border border-transparent text-[#FB7185] hover:bg-rose-50 hover:border-rose-200/80 transition-all whitespace-nowrap ${
            isFullscreen
              ? 'px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-base'
              : 'px-4 sm:px-5 py-2 sm:py-2.5 text-base sm:text-lg'
          }`}
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#FB7185] shrink-0" strokeWidth={2.25} />
          <span data-testid="activity-label">Challenge</span>
        </NavButton>
      </div>

      {activeActivity !== 'free-draw' && (
        <div className={`flex items-center gap-2 ${isFullscreen ? 'justify-center' : 'w-fit'}`}>
          <span className="text-xs sm:text-sm font-bold text-[#059669] uppercase tracking-wide">
            LVL
          </span>
          <div className="flex gap-1.5">
            {levels.map((lvl) => {
              const style = LEVEL_STYLES[lvl];
              const isActive = activeLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onLevelChange(lvl)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm sm:text-base font-bold transition-all border ${
                    isActive
                      ? `${style.activeCircle} ${style.activeNumber}`
                      : `${style.circle} ${style.number} hover:scale-105`
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
