export type ActivityType = 'free-draw' | 'color-by-number' | 'shape-match';
export type ActivityLevel = 1 | 2 | 3;

export interface Artwork {
  id?: string;
  title: string;
  dataUrl: string;
  userId: string;
  userName?: string;
  createdAt: any;
  dateTag?: string; // YYYY-MM-DD (local)
  isShared?: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface ColorOption {
  name: string;
  value: string;
}

export const COLORS: ColorOption[] = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Brown', value: '#78350f' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
];

export interface Sticker {
  id: string;
  url: string;
  name: string;
}

export const STICKERS: Sticker[] = [
  { id: 'star', url: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png', name: 'Star' },
  { id: 'heart', url: 'https://cdn-icons-png.flaticon.com/512/833/833472.png', name: 'Heart' },
  { id: 'sun', url: 'https://cdn-icons-png.flaticon.com/512/869/869869.png', name: 'Sun' },
  { id: 'cloud', url: 'https://cdn-icons-png.flaticon.com/512/414/414927.png', name: 'Cloud' },
  { id: 'rainbow', url: 'https://cdn-icons-png.flaticon.com/512/2583/2583988.png', name: 'Rainbow' },
  { id: 'cat', url: 'https://cdn-icons-png.flaticon.com/512/616/616408.png', name: 'Cat' },
  { id: 'dog', url: 'https://cdn-icons-png.flaticon.com/512/616/616409.png', name: 'Dog' },
  { id: 'rocket', url: 'https://cdn-icons-png.flaticon.com/512/1043/1043432.png', name: 'Rocket' },
];

export const DAILY_CHALLENGES = [
  "Draw a purple elephant wearing a hat!",
  "Draw a house made of candy!",
  "Draw a friendly robot from space!",
  "Draw a magical underwater castle!",
  "Draw a cat flying a rocket ship!",
  "Draw a garden full of giant flowers!",
  "Draw a happy sun wearing sunglasses!",
];
