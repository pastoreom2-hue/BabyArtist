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
    className="border-t border-stone-100 bg-stone-50/40 px-4 py-3 sm:py-4"
  >
    <div className="max-w-3xl mx-auto grid grid-cols-3 gap-3 sm:gap-5">
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
        label="Gallery"
        variant="gallery"
        isActive={view === 'gallery'}
        onClick={() => onViewChange('gallery')}
      />
    </div>
  </nav>
);
