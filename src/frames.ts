export type FrameId =
  | 'none'
  | 'classic'
  | 'pink'
  | 'ocean'
  | 'rainbow'
  | 'starry'
  | 'polka'
  | 'heart'
  | 'neon'
  | 'polaroid'
  | 'flower';

export interface FrameOption {
  id: FrameId;
  label: string;
  preview: string; // tailwind gradient / color for picker swatch
}

export const FRAME_OPTIONS: FrameOption[] = [
  { id: 'none', label: 'None', preview: 'bg-slate-200' },
  { id: 'classic', label: 'Classic', preview: 'bg-gradient-to-br from-amber-700 to-yellow-500' },
  { id: 'pink', label: 'Pink', preview: 'bg-gradient-to-br from-pink-400 to-rose-300' },
  { id: 'ocean', label: 'Ocean', preview: 'bg-gradient-to-br from-sky-500 to-cyan-300' },
  { id: 'rainbow', label: 'Rainbow', preview: 'bg-gradient-to-r from-red-400 via-yellow-300 to-blue-400' },
  { id: 'starry', label: 'Starry', preview: 'bg-gradient-to-br from-indigo-900 to-purple-700' },
  { id: 'polka', label: 'Dots', preview: 'bg-white ring-2 ring-pink-300' },
  { id: 'heart', label: 'Heart', preview: 'bg-gradient-to-br from-red-400 to-pink-300' },
  { id: 'neon', label: 'Neon', preview: 'bg-gradient-to-br from-fuchsia-500 to-cyan-400' },
  { id: 'polaroid', label: 'Polaroid', preview: 'bg-white border-4 border-slate-200' },
  { id: 'flower', label: 'Flower', preview: 'bg-gradient-to-br from-lime-300 to-emerald-400' },
];

export const FRAME_STORAGE_KEY = 'babyartist-selected-frame';

export function loadStoredFrame(): FrameId {
  const stored = localStorage.getItem(FRAME_STORAGE_KEY);
  if (stored && FRAME_OPTIONS.some((f) => f.id === stored)) return stored as FrameId;
  return 'classic';
}
