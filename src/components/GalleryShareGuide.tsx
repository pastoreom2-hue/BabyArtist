import React from 'react';
import { Send } from 'lucide-react';

/**
 * Short tip only — the real Send control lives on the drawing board
 * (blue paper-plane next to Save). Keeps the Send Drawing tab uncluttered.
 */
export const GalleryShareGuide: React.FC = () => (
  <section
    data-tour="tour-step-3"
    data-testid="gallery-share-tip"
    className="mb-6 px-3 py-3 rounded-2xl border border-sky-100 bg-sky-50/80"
  >
    <div className="flex items-start gap-2.5">
      <div className="p-1.5 rounded-lg bg-blue-500 text-white shrink-0">
        <Send size={16} strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-stone-800">Send from your drawing</h3>
        <p className="text-xs text-stone-500 mt-0.5 leading-snug">
          Tap the blue paper-plane next to Save on the whiteboard — one touch to family.
        </p>
      </div>
    </div>
  </section>
);
