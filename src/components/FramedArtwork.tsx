import React from 'react';
import { DigitalFrameOverlay } from './DigitalFrameOverlay';
import { FrameId } from '../frames';

interface FramedArtworkProps {
  src: string;
  alt: string;
  frameId: FrameId;
  className?: string;
}

export const FramedArtwork: React.FC<FramedArtworkProps> = ({
  src,
  alt,
  frameId,
  className = 'aspect-video',
}) => {
  return (
    <div className={`relative overflow-hidden bg-gray-50 ${className}`}>
      {frameId === 'none' && (
        <div className="absolute inset-2 border-4 border-yellow-400 rounded-lg pointer-events-none z-20" />
      )}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-contain z-0"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 z-10 pointer-events-none opacity-95">
        <DigitalFrameOverlay frameId={frameId} />
      </div>
    </div>
  );
};
