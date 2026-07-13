export type HelpLang = 'en' | 'ko';

export interface HelpBullet {
  label: string;
  text: string;
}

export interface HelpSection {
  number: number;
  title: string;
  intro?: string;
  bullets: HelpBullet[];
}

export interface PlatformSteps {
  title: string;
  steps: string[];
}

export interface HelpGuideCopy {
  modalTitle: string;
  modalSubtitle: string;
  closeLabel: string;
  sections: HelpSection[];
  homeScreen: {
    title: string;
    intro: string;
    iphone: PlatformSteps;
    android: PlatformSteps;
    bookmark: {
      title: string;
      iphone: PlatformSteps;
      android: PlatformSteps;
    };
  };
}

export const HELP_GUIDE: Record<HelpLang, HelpGuideCopy> = {
  en: {
    modalTitle: 'How to Use BabyArtist',
    modalSubtitle: 'A quick guide for moms & little artists',
    closeLabel: 'Got it!',
    sections: [
      {
        number: 1,
        title: 'Drawing, Matching & Levels',
        intro: 'Pick an activity at the top of Create, then tap the canvas to play.',
        bullets: [
          {
            label: 'Free Draw',
            text: 'Tap the pink **Free Draw** button and paint freely. Choose colors and brush size from the left toolbar — stickers are fun too!',
          },
          {
            label: 'Shape Match',
            text: 'Tap **Shape Match** and trace the dashed outlines with your finger. Match circles, stars, hearts & more!',
          },
          {
            label: 'Color by Number',
            text: 'Tap **Color by Number** and fill each numbered area. Use the **Color Guide** badges at the bottom of the canvas — tap a badge to pick that color instantly.',
          },
          {
            label: 'Levels 1 · 2 · 3',
            text: 'For Shape Match and Color by Number, tap the **Lvl** number buttons below the activity bar. Level 1 is gentle, Level 3 is a bigger challenge!',
          },
          {
            label: 'Stickers',
            text: 'In the left toolbar, tap **Stickers**, choose a cute sticker, then tap anywhere on the canvas to place it! **Stickers are special rewards!** Moms can give these to their little artists as a "prize" to encourage their creativity and hard work.',
          },
        ],
      },
      {
        number: 2,
        title: 'Upload a Photo of Artwork',
        intro: 'Already have a paper drawing? Snap a photo and add it to your gallery.',
        bullets: [
          {
            label: 'Save Drawing',
            text: 'Tap **Save Drawing** in the top menu bar to take a photo or choose one from your gallery.',
          },
          {
            label: 'Save from Canvas',
            text: 'Finished drawing on the app? Tap the pink **Save** button on the canvas — confetti means it worked!',
          },
          {
            label: 'Pretty Frames',
            text: 'Open **Send Drawing**, scroll the frame strip, and tap a wooden frame style to dress up any masterpiece.',
          },
        ],
      },
      {
        number: 3,
        title: 'Share with Grandma & Family',
        intro: 'Send framed art to grandma in one tap.',
        bullets: [
          {
            label: 'Share with Grandma',
            text: 'Go to **Send Drawing** → pick a frame → tap **Share**, **Email**, or **Download**. Grandma gets a beautiful framed picture instantly!',
          },
          {
            label: 'Quick Share Bar',
            text: 'Use the green **Share to Family** bar at the top of Gallery for instant SNS or email sharing.',
          },
          {
            label: 'Cloud Save (Optional)',
            text: 'Ask a grown-up to **Login** so artwork stays safe across phones and tablets.',
          },
        ],
      },
    ],
    homeScreen: {
      title: 'Pro Tip: Add to Home Screen',
      intro:
        'Opening a long web address every time is annoying. Pin BabyArtist like a real app — it launches full-screen in one tap!',
      iphone: {
        title: 'iPhone (Safari)',
        steps: [
          'Open this page in **Safari** (not inside another app).',
          'Tap the **Share** button (square with arrow) at the bottom.',
          'Scroll down and tap **Add to Home Screen**.',
          'Tap **Add** — BabyArtist appears on your home screen!',
        ],
      },
      android: {
        title: 'Android (Chrome)',
        steps: [
          'Open this page in **Chrome**.',
          'Tap the **⋮ menu** (top right).',
          'Tap **Add to Home screen** or **Install app**.',
          'Confirm — BabyArtist is now one tap away!',
        ],
      },
      bookmark: {
        title: 'Bookmark Shortcut',
        iphone: {
          title: 'iPhone bookmark',
          steps: [
            'In Safari, tap **Share** → **Add Bookmark**.',
            'Save to Favorites for quick access from the address bar.',
          ],
        },
        android: {
          title: 'Android bookmark',
          steps: [
            'In Chrome, tap **⋮** → tap the **★ star** (or **Bookmarks**).',
            'Pin it to your home screen bookmarks widget for fast access.',
          ],
        },
      },
    },
  },
  ko: {
    modalTitle: 'BabyArtist 사용법',
    modalSubtitle: '엄마와 아이를 위한 쉬운 가이드',
    closeLabel: '알겠어요!',
    sections: [
      {
        number: 1,
        title: '그림 그리기 · 매치하기 · 레벨',
        intro: 'Create 화면 상단에서 활동을 고른 뒤, 캔버스에 터치해서 시작해요.',
        bullets: [
          {
            label: '그림 그리기 (Free Draw)',
            text: '분홍색 **Free Draw** 버튼을 누르고 자유롭게 그려요. 왼쪽 도구에서 색과 붓 크기를 바꿀 수 있고, 스티커도 붙일 수 있어요!',
          },
          {
            label: '매치하기 (Shape Match)',
            text: '**Shape Match**를 누르고 점선 도형을 따라 그려요. 동그라미, 별, 하트 등 모양을 익히기 좋아요!',
          },
          {
            label: '숫자 색칠 (Color by Number)',
            text: '**Color by Number**를 선택하면 숫자가 적힌 칸을 색칠해요. 캔버스 **아래 Color Guide** 배지를 누르면 해당 색이 바로 선택돼요.',
          },
          {
            label: '레벨 1 · 2 · 3',
            text: 'Shape Match와 Color by Number에서는 활동 버튼 **아래 Lvl 숫자**를 눌러 난이도를 바꿔요. 1은 쉬움, 3은 도전!',
          },
          {
            label: '스티커',
            text: '왼쪽 도구에서 **Stickers**를 누르고 마음에 드는 스티커를 고른 뒤, 캔버스 아무 곳이나 터치하면 붙어요! **스티커는 우리 아이를 위한 특별한 상입니다!** 엄마가 아이의 멋진 작품 활동을 격려하고 칭찬해 주기 위해 주는 선물로 활용해 보세요.',
          },
        ],
      },
      {
        number: 2,
        title: '그림 예쁘게 찍어 올리기',
        intro: '종이에 그린 그림도 사진으로 담을 수 있어요.',
        bullets: [
          {
            label: '그림 올리기',
            text: '상단 메뉴의 **Save Drawing** 버튼으로 사진을 찍거나 앨범에서 고르세요.',
          },
          {
            label: '캔버스 저장',
            text: '앱에서 그린 그림은 캔버스의 분홍 **Save** 버튼을 누르면 갤러리에 저장돼요. 색종이가 터지면 성공!',
          },
          {
            label: '예쁜 액자',
            text: '**Send Drawing**으로 이동해 액자 줄을 슥슥 넘기며 나무 액자를 골라 입혀 보세요.',
          },
        ],
      },
      {
        number: 3,
        title: '할머니께 공유하기',
        intro: '액자에 담긴 그림을 할머니께 한 번에 보내요.',
        bullets: [
          {
            label: '할머니께 보내기',
            text: '**Send Drawing** → 액자 선택 → **Share**, **Email**, **Download** 버튼을 눌러요. 할머니께 액자 그림이 바로 전달돼요!',
          },
          {
            label: '빠른 공유 바',
            text: '갤러리 상단 초록 **가족에게 보내기** 바에서 카톡·SNS·이메일로 바로 공유할 수 있어요.',
          },
          {
            label: '클라우드 저장 (선택)',
            text: '어른이 **Login**하면 여러 기기에서 그림을 안전하게 보관할 수 있어요.',
          },
        ],
      },
    ],
    homeScreen: {
      title: '꿀팁: 홈 화면에 추가하기',
      intro:
        '긴 웹 주소를 매번 치기 번거롭죠? 앱처럼 홈 화면에 고정하면 한 번의 터치로 바로 열려요!',
      iphone: {
        title: '아이폰 (Safari)',
        steps: [
          '**Safari**에서 이 페이지를 열어요 (다른 앱 안의 브라우저 말고요).',
          '하단 **공유** 버튼(네모 + 화살표)을 눌러요.',
          '아래로 스크롤해 **홈 화면에 추가**를 선택해요.',
          '**추가**를 누르면 홈 화면에 BabyArtist 아이콘이 생겨요!',
        ],
      },
      android: {
        title: '안드로이드 (Chrome)',
        steps: [
          '**Chrome**에서 이 페이지를 열어요.',
          '오른쪽 위 **⋮ 메뉴**를 눌러요.',
          '**홈 화면에 추가** 또는 **앱 설치**를 선택해요.',
          '확인하면 BabyArtist가 앱처럼 바로 실행돼요!',
        ],
      },
      bookmark: {
        title: '즐겨찾기 꿀팁',
        iphone: {
          title: '아이폰 즐겨찾기',
          steps: [
            'Safari에서 **공유** → **북마크 추가**를 눌러요.',
            '즐겨찾기에 저장하면 주소창에서 빠르게 열 수 있어요.',
          ],
        },
        android: {
          title: '안드로이드 즐겨찾기',
          steps: [
            'Chrome **⋮** → **★ 별표**(또는 북마크)를 눌러요.',
            '홈 화면 북마크 위젯에 고정하면 더 빨리 접속할 수 있어요.',
          ],
        },
      },
    },
  },
};
