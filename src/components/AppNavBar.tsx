import React from 'react';
import { Image as ImageIcon, PencilLine } from 'lucide-react';
import { NavBarButton } from './NavBarButton';
import { PhotoUploadButton } from './PhotoUploadButton';

interface AppNavBarProps {
  view: 'draw' | 'gallery';
  onViewChange: (view: 'draw' | 'gallery') => void;
  onPhotoUpload: (dataUrl: string) => void;
}

/** Full-width row: Start Drawing · Upload · Gallery */
export const AppNavBar: React.FC<AppNavBarProps> = ({
  view,
  onViewChange,
  onPhotoUpload,
}) => (
  <div className="w-full px-3 pb-3 sm:px-4 sm:pb-4 border-t border-slate-100 bg-white/80">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-stretch gap-1.5 sm:gap-2 w-full">
        <NavBarButton
          icon={PencilLine}
          label="Start Drawing"
          shortLabel="Draw"
          variant="draw"
          isActive={view === 'draw'}
          onClick={() => onViewChange('draw')}
          className="flex-1 min-w-0"
        />
        <PhotoUploadButton
          onUpload={onPhotoUpload}
          variant="nav"
          className="flex-1 min-w-0"
        />
        <NavBarButton
          icon={ImageIcon}
          label="Gallery"
          shortLabel="Gallery"
          variant="gallery"
          isActive={view === 'gallery'}
          onClick={() => onViewChange('gallery')}
          className="flex-1 min-w-0"
        />
      </div>
    </div>
  </div>
);
