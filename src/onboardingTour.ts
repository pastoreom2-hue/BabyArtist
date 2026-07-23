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
    message: '📸 Send Drawing을 눌러 그림을 보내고, Gallery에서 저장된 작품을 보세요!',
  },
  {
    target: 'tour-step-2',
    view: 'gallery',
    message: '🎨 원하는 예쁜 나무 액자를 슥슥 골라 입혀보세요!',
  },
  {
    target: 'tour-step-3',
    view: 'gallery',
    message: '✈️ 그림판에서 Save 옆 파란 비행기(Send)를 누르면 가족에게 바로 보낼 수 있어요!',
  },
];

export function isTourCompleted(): boolean {
  return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
}

export function markTourCompleted(): void {
  localStorage.setItem(TOUR_STORAGE_KEY, 'true');
}
