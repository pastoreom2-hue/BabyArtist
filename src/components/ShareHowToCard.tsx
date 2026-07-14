import React from 'react';
import { Download, Frame, Image as ImageIcon, Mail, Upload } from 'lucide-react';

const STEPS = [
  {
    icon: ImageIcon,
    en: 'Choose your drawing from the gallery.',
    ko: '보낼 그림을 갤러리에서 고릅니다.',
    tint: '#e0f2fe',
    ink: '#0284c7',
  },
  {
    icon: Frame,
    en: 'Pick the perfect frame for your art.',
    ko: '액자 중에서 가장 적합한 것을 고릅니다.',
    tint: '#ede9fe',
    ink: '#7c3aed',
  },
  {
    icon: Download,
    en: 'Download your framed masterpiece.',
    ko: '택한 그림을 다운로드합니다.',
    tint: '#fef3c7',
    ink: '#b45309',
  },
  {
    icon: Mail,
    en: 'Attach the file when sending an email.',
    ko: '메일 발송 시 다운로드한 파일을 첨부하세요.',
    tint: '#ffe4e6',
    ink: '#e11d48',
  },
  {
    icon: Upload,
    en: "For other apps, use the 'Upload' icon in the chat to select the file.",
    ko: "다른 앱에서는 대화창의 '파일 업로드' 기능을 통해 파일을 불러오세요.",
    tint: '#d1fae5',
    ink: '#047857',
  },
] as const;

/** Friendly bilingual guide — shown under Send Drawing / Gallery nav. */
export const ShareHowToCard: React.FC = () => (
  <section
    id="share-howto-card"
    className="share-howto-card"
    data-testid="share-howto-card"
    aria-labelledby="share-howto-title"
    style={{
      borderRadius: 20,
      padding: '1.15rem 1.2rem 1.25rem',
      background: 'linear-gradient(165deg, #fffbeb 0%, #fef3c7 42%, #fce7f3 100%)',
      border: '1px solid rgba(251, 191, 36, 0.45)',
      boxShadow: '0 8px 24px -12px rgba(180, 83, 9, 0.28)',
    }}
  >
    <h2
      id="share-howto-title"
      className="share-howto-card__title"
      style={{
        fontFamily: 'Poppins, Lato, Noto Sans KR, sans-serif',
        fontSize: '1.05rem',
        fontWeight: 700,
        lineHeight: 1.35,
        color: '#78350f',
        margin: '0 0 1rem',
      }}
    >
      How to Share Your Baby&apos;s Art
      <span
        className="share-howto-card__title-ko"
        style={{
          display: 'block',
          marginTop: 4,
          fontFamily: 'Lato, Noto Sans KR, sans-serif',
          fontSize: '0.92rem',
          fontWeight: 700,
          color: '#a16207',
        }}
      >
        우리 아기 그림 보내는 방법
      </span>
    </h2>

    <ol className="share-howto-card__list" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        return (
          <li
            key={i}
            className="share-howto-card__step"
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto auto 1fr',
              gap: '0.55rem 0.65rem',
              alignItems: 'start',
              padding: '0.65rem 0.7rem',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.78)',
              border: '1px solid rgba(255,255,255,0.95)',
            }}
          >
            <span
              className="share-howto-card__icon"
              aria-hidden
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 12,
                background: step.tint,
                color: step.ink,
                flexShrink: 0,
              }}
            >
              <Icon size={18} strokeWidth={2.25} />
            </span>
            <span
              className="share-howto-card__num"
              aria-hidden
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 12,
                fontWeight: 700,
                color: '#b45309',
                width: 18,
                lineHeight: '36px',
                textAlign: 'center',
              }}
            >
              {i + 1}
            </span>
            <div className="share-howto-card__text">
              <p
                className="share-howto-card__en"
                style={{
                  margin: 0,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#44403c',
                  lineHeight: 1.4,
                }}
              >
                {step.en}
              </p>
              <p
                className="share-howto-card__ko"
                style={{
                  margin: '4px 0 0',
                  fontFamily: 'Lato, Noto Sans KR, sans-serif',
                  fontSize: 13,
                  fontWeight: 400,
                  color: '#78716c',
                  lineHeight: 1.45,
                }}
              >
                {step.ko}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  </section>
);
