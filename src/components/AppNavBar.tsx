import React from 'react';
import { Image as ImageIcon, Palette, Save } from 'lucide-react';
import { NavBarButton } from './NavBarButton';

export type AppView = 'draw' | 'saved' | 'gallery';

interface AppNavBarProps {
  view: AppView;
  onViewChange: (view: AppView) => void;
}

export const AppNavBar: React.FC<AppNavBarProps> = ({ view, onViewChange }) => (
  <nav
    aria-label="Main menu"
    className="border-t border-amber-100 bg-gradient-to-b from-amber-50 via-yellow-50 to-lime-50/60 px-4 py-4 sm:py-5"
  >
    <div className="max-w-3xl mx-auto grid grid-cols-3 gap-2.5 sm:gap-4 items-stretch">
      <NavBarButton
        icon={Palette}
        label="Start Drawing"
        variant="draw"
        isActive={view === 'draw'}
        onClick={() => onViewChange('draw')}
      />
      <NavBarButton
        icon={Save}
        label="Save Drawing"
        variant="save"
        isActive={view === 'saved'}
        onClick={() => onViewChange('saved')}
        data-tour="tour-step-1"
      />
      <NavBarButton
        icon={ImageIcon}
        label="Send Drawing"
        variant="send"
        isActive={view === 'gallery'}
        onClick={() => onViewChange('gallery')}
      />
    </div>
  </nav>
);
