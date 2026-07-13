import React from 'react';
import { Image as ImageIcon, Palette } from 'lucide-react';
import { NavBarButton } from './NavBarButton';
import { PhotoUploadButton } from './PhotoUploadButton';

interface AppNavBarProps {
  view: 'draw' | 'gallery';
  onViewChange: (view: 'draw' | 'gallery') => void;
  onPhotoUpload: (dataUrl: string) => void;
}

export const AppNavBar: React.FC<AppNavBarProps> = ({
  view,
  onViewChange,
  onPhotoUpload,
}) => (
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
      <PhotoUploadButton onUpload={onPhotoUpload} variant="nav" />
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
