export const TOUR_STORAGE_KEY = 'babyartist-onboarding-complete';

export type TourView = 'draw' | 'saved' | 'gallery';

export interface TourStep {
  target: string;
  view: TourView;
  message: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: 'tour-step-1',
    view: 'draw',
    message: '📸 Gallery에서 저장된 그림을 보고, Send로 가족과 공유해 보세요!',
  },
  {
    target: 'tour-step-2',
    view: 'gallery',
    message: '🎨 원하는 예쁜 나무 액자를 슥슥 골라 입혀보세요!',
  },
  {
    target: 'tour-step-3',
    view: 'gallery',
    message: '👵 멀리 계신 할머니께 액자에 담긴 그림을 터치 한 번으로 바로 선물해 보세요!',
  },
];

export function isTourCompleted(): boolean {
  return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
}

export function markTourCompleted(): void {
  localStorage.setItem(TOUR_STORAGE_KEY, 'true');
}
