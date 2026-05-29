import React from 'react';
import { motion } from 'motion/react';
import { ActivityType, ActivityLevel } from '../types';
import { Palette, Hash, Shapes, Trophy } from 'lucide-react';

interface ActivitySelectorProps {
  activeActivity: ActivityType;
  onActivityChange: (activity: ActivityType) => void;
  activeLevel: ActivityLevel;
  onLevelChange: (level: ActivityLevel) => void;
  onShowChallenge: () => void;
}

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  activeActivity,
  onActivityChange,
  activeLevel,
  onLevelChange,
  onShowChallenge,
}) => {
  const activities = [
    { id: 'free-draw', name: 'Free Draw', icon: Palette },
    { id: 'color-by-number', name: 'Color by Number', icon: Hash },
    { id: 'shape-match', name: 'Shape Match', icon: Shapes },
  ];

  const levels: ActivityLevel[] = [1, 2, 3];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const isActive = activeActivity === activity.id;

          return (
            <motion.button
              key={activity.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onActivityChange(activity.id as ActivityType)}
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-base sm:text-lg font-bold border transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white border-stone-300 text-stone-800 shadow-sm'
                  : 'bg-transparent border-transparent text-stone-500 hover:bg-white/70 hover:border-stone-200'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.25} />
              <span>{activity.name}</span>
            </motion.button>
          );
        })}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onShowChallenge}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-base sm:text-lg font-bold border border-transparent text-amber-600/90 hover:bg-amber-50 hover:border-amber-200 transition-all whitespace-nowrap"
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.25} />
          <span>Challenge</span>
        </motion.button>
      </div>

      {activeActivity !== 'free-draw' && (
        <div className="flex items-center gap-2 w-fit">
          <span className="text-xs sm:text-sm font-bold text-stone-400 uppercase tracking-wide">Level</span>
          <div className="flex gap-1.5">
            {levels.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => onLevelChange(lvl)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm sm:text-base font-bold transition-all border ${
                  activeLevel === lvl
                    ? 'bg-stone-800 border-stone-800 text-white'
                    : 'bg-white border-stone-200 text-stone-400 hover:border-stone-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
