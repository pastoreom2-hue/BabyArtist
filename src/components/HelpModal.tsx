import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  HelpCircle,
  Palette,
  Camera,
  Share2,
  Smartphone,
  Bookmark,
  Apple,
  Hash,
  Shapes,
  Sparkles,
} from 'lucide-react';
import { HELP_GUIDE, HelpLang } from '../helpGuideContent';
import { APP_URL } from '../config/app';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTION_ICONS = [Palette, Camera, Share2] as const;

function renderGuideText(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-stone-800">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2 mt-2">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-stone-600">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-[10px] font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span>{renderGuideText(step)}</span>
        </li>
      ))}
    </ol>
  );
}

function PlatformCard({
  icon: Icon,
  title,
  steps,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  steps: string[];
  accent: string;
}) {
  return (
    <div className={`rounded-xl border p-3 ${accent}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className="flex-shrink-0 opacity-80" />
        <h5 className="text-sm font-semibold text-stone-800">{title}</h5>
      </div>
      <StepList steps={steps} />
    </div>
  );
}

function HelpIntroVideo() {
  return (
    <div className="help-intro-video" data-testid="help-intro-video">
      <video
        className="help-intro-video__media"
        src="/videos/help-guide.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="BabyArtist animated logo introduction"
      />
    </div>
  );
}

function HelpGuideBody({ lang, appUrl }: { lang: HelpLang; appUrl: string }) {
  const copy = HELP_GUIDE[lang];

  return (
    <div className="space-y-5">
      <HelpIntroVideo />

      {copy.sections.map((section, idx) => {
        const Icon = SECTION_ICONS[idx] ?? Palette;
        return (
          <section
            key={section.number}
            className="rounded-xl border border-stone-200 bg-stone-50/80 p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-pink-200 flex items-center justify-center">
                <span className="text-sm font-bold text-pink-500">{section.number}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Icon size={16} className="text-pink-500 flex-shrink-0" />
                  <h3 className="text-sm font-semibold text-stone-800">{section.title}</h3>
                </div>
                {section.intro && (
                  <p className="text-sm text-stone-500 mt-1 leading-relaxed">{section.intro}</p>
                )}
              </div>
            </div>

            <ul className="space-y-2">
              {section.bullets.map((bullet) => (
                <li
                  key={bullet.label}
                  className="bg-white rounded-lg p-3 border border-stone-100"
                >
                  <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-1">
                    {bullet.label}
                  </p>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {renderGuideText(bullet.text)}
                  </p>
                </li>
              ))}
            </ul>

            {idx === 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-pink-100 text-pink-700 text-[10px] font-semibold">
                  <Palette size={12} /> Draw
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-[10px] font-semibold">
                  <Shapes size={12} /> Match
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-[10px] font-semibold">
                  <Hash size={12} /> Lvl 1·2·3
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 text-[10px] font-semibold">
                  <Sparkles size={12} /> Stickers
                </span>
              </div>
            )}
          </section>
        );
      })}

      <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-amber-400 rounded-lg text-white">
            <Smartphone size={16} />
          </div>
          <h3 className="text-sm font-semibold text-amber-900">{copy.homeScreen.title}</h3>
        </div>
        <p className="text-sm text-amber-900/80 leading-relaxed mb-3">{copy.homeScreen.intro}</p>

        <div className="mb-3 px-3 py-2 bg-white rounded-lg border border-amber-200">
          <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-0.5">
            {lang === 'en' ? 'Current address' : '현재 주소'}
          </p>
          <p className="text-xs font-medium text-stone-700 break-all">{appUrl}</p>
        </div>

        <div className="space-y-2">
          <PlatformCard
            icon={Apple}
            title={copy.homeScreen.iphone.title}
            steps={copy.homeScreen.iphone.steps}
            accent="border-blue-200 bg-blue-50/80"
          />
          <PlatformCard
            icon={Smartphone}
            title={copy.homeScreen.android.title}
            steps={copy.homeScreen.android.steps}
            accent="border-emerald-200 bg-emerald-50/80"
          />
        </div>

        <div className="mt-4 pt-4 border-t border-amber-200/60">
          <div className="flex items-center gap-2 mb-2">
            <Bookmark size={16} className="text-amber-700" />
            <h4 className="text-sm font-semibold text-amber-900">{copy.homeScreen.bookmark.title}</h4>
          </div>
          <div className="space-y-2">
            <PlatformCard
              icon={Apple}
              title={copy.homeScreen.bookmark.iphone.title}
              steps={copy.homeScreen.bookmark.iphone.steps}
              accent="border-stone-200 bg-white"
            />
            <PlatformCard
              icon={Smartphone}
              title={copy.homeScreen.bookmark.android.title}
              steps={copy.homeScreen.bookmark.android.steps}
              accent="border-stone-200 bg-white"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [lang, setLang] = useState<HelpLang>('ko');
  const copy = HELP_GUIDE[lang];
  const appUrl = typeof window !== 'undefined' ? window.location.origin : APP_URL;

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="help-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center bg-stone-900/45 backdrop-blur-[2px]"
          onClick={onClose}
          role="dialog"
          aria-modal
          aria-labelledby="help-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full sm:max-w-lg sm:mx-4 flex flex-col bg-white shadow-2xl border border-stone-200 rounded-t-2xl sm:rounded-2xl overflow-hidden ${
              lang === 'ko' ? 'font-korean' : 'font-sans'
            }`}
            style={{ maxHeight: 'min(90dvh, 720px)' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-stone-100 bg-white">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="flex justify-center mb-3">
                <div className="inline-flex p-0.5 bg-stone-100 rounded-full border border-stone-200">
                  {(['en', 'ko'] as HelpLang[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLang(code)}
                      className={`px-4 py-1 rounded-full text-xs font-semibold transition-colors ${
                        lang === code
                          ? 'bg-white text-stone-800 shadow-sm'
                          : 'text-stone-400 hover:text-stone-600'
                      }`}
                    >
                      {code === 'en' ? 'ENG' : '한글'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 pr-8">
                <div className="p-2 bg-pink-500 rounded-xl text-white">
                  <HelpCircle size={18} />
                </div>
                <div>
                  <h2 id="help-modal-title" className="text-base font-bold text-stone-800">
                    {copy.modalTitle}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">{copy.modalSubtitle}</p>
                </div>
              </div>
            </div>

            {/* Body — scrollable, no nested motion */}
            <div
              className="help-modal-scroll flex-1 overflow-y-auto overscroll-contain px-5 py-4"
              style={{ minHeight: '200px', maxHeight: 'calc(min(90dvh, 720px) - 140px)' }}
            >
              <HelpGuideBody lang={lang} appUrl={appUrl} />
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-5 py-3 border-t border-stone-100 bg-white">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-stone-800 text-white font-semibold rounded-full text-sm hover:bg-stone-700 transition-colors"
              >
                {copy.closeLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
