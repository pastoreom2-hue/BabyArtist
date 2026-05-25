import React from 'react';
import { motion } from 'motion/react';
import { ActivityType, ActivityLevel } from '../types';
import { Palette, Hash, Shapes, Star, Trophy } from 'lucide-react';

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
  onShowChallenge
}) => {
  const activities = [
    { id: 'free-draw', name: 'Free Draw', icon: Palette, color: 'bg-pink-500' },
    { id: 'color-by-number', name: 'Color by Number', icon: Hash, color: 'bg-blue-500' },
    { id: 'shape-match', name: 'Shape Match', icon: Shapes, color: 'bg-purple-500' },
  ];

  const levels: ActivityLevel[] = [1, 2, 3];

  return (
    <div className="flex flex-col gap-2 sm:gap-4">
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-2 scrollbar-hide">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const isActive = activeActivity === activity.id;
          
          return (
            <motion.button
              key={activity.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onActivityChange(activity.id as ActivityType)}
              className={`flex items-center gap-2 px-3 sm:px-6 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl font-black transition-all whitespace-nowrap border-2 sm:border-4 ${
                isActive 
                  ? `${activity.color} text-white border-white shadow-lg scale-105 z-10` 
                  : `${activity.color} text-white/80 border-transparent opacity-70`
              }`}
            >
              <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-base">{activity.name}</span>
            </motion.button>
          );
        })}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShowChallenge}
          className="flex items-center gap-2 px-3 sm:px-6 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl font-black transition-all whitespace-nowrap border-2 sm:border-4 bg-orange-400 text-white border-transparent opacity-80"
        >
          <Trophy className="w-4 h-4 sm:w-6 sm:h-6" />
          <span className="text-xs sm:text-base">Challenge</span>
        </motion.button>
      </div>

      {activeActivity !== 'free-draw' && (
        <div className="flex items-center gap-2 sm:gap-4 bg-white p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-sm border-2 sm:border-4 border-blue-100 w-fit">
          <span className="text-blue-600 font-black uppercase text-[10px] sm:text-xs ml-1 sm:ml-2">Lvl</span>
          <div className="flex gap-1.5 sm:gap-2">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => onLevelChange(lvl)}
                className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-black transition-all border-2 sm:border-4 text-xs sm:text-base ${
                  activeLevel === lvl 
                    ? 'bg-blue-500 border-blue-600 text-white shadow-sm' 
                    : 'bg-blue-50 border-blue-100 text-blue-300'
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
