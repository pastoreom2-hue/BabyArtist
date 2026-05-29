import React from 'react';
import { Image as ImageIcon, PencilLine } from 'lucide-react';
import { NavBarButton } from './NavBarButton';
import { PhotoUploadButton } from './PhotoUploadButton';

interface AppNavBarProps {
  view: 'draw' | 'gallery';
  onViewChange: (view: 'draw' | 'gallery') => void;
  onPhotoUpload: (dataUrl: string) => void;
}

/** Full-width row: Start Drawing · Upload · Gallery — always visible below logo */
export const AppNavBar: React.FC<AppNavBarProps> = ({
  view,
  onViewChange,
  onPhotoUpload,
}) => (
  <nav
    aria-label="Main menu"
    className="w-full px-3 pb-3 pt-2 sm:px-4 sm:pb-4 border-t-2 border-pink-100 bg-gradient-to-r from-pink-50 via-white to-emerald-50 shadow-sm"
  >
    <div className="max-w-7xl mx-auto">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-2 sm:hidden">
        Menu
      </p>
      <div className="flex items-stretch gap-2 w-full">
        <NavBarButton
          icon={PencilLine}
          label="Start Drawing"
          shortLabel="Draw"
          variant="draw"
          isActive={view === 'draw'}
          onClick={() => onViewChange('draw')}
          className="flex-1 min-w-0 min-h-[3.25rem]"
        />
        <PhotoUploadButton
          onUpload={onPhotoUpload}
          variant="nav"
          className="flex-1 min-w-0 min-h-[3.25rem]"
        />
        <NavBarButton
          icon={ImageIcon}
          label="Gallery"
          shortLabel="Gallery"
          variant="gallery"
          isActive={view === 'gallery'}
          onClick={() => onViewChange('gallery')}
          className="flex-1 min-w-0 min-h-[3.25rem]"
        />
      </div>
    </div>
  </nav>
);
