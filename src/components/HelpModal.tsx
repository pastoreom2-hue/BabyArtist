import React, { useState } from 'react';
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
} from 'lucide-react';
import { HELP_GUIDE, HelpLang } from '../helpGuideContent';

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
        <strong key={i} className="font-extrabold text-slate-800">
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
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-600">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-[10px] font-black flex items-center justify-center mt-0.5">
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
    <div className={`rounded-2xl border-2 p-3.5 ${accent}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className="flex-shrink-0 opacity-80" />
        <h5 className="text-sm font-extrabold text-slate-800">{title}</h5>
      </div>
      <StepList steps={steps} />
    </div>
  );
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [lang, setLang] = useState<HelpLang>('ko');
  const copy = HELP_GUIDE[lang];
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://babyartist.vercel.app';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal
          aria-labelledby="help-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] bg-white shadow-2xl border-4 border-pink-100 ${
              lang === 'ko' ? 'font-korean' : 'font-sans'
            }`}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-br from-pink-50 via-white to-blue-50 px-5 pt-5 pb-4 border-b border-pink-100">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              {/* Language tabs */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex p-1 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
                  {(['en', 'ko'] as HelpLang[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLang(code)}
                      className={`relative px-5 py-1.5 rounded-lg text-sm font-extrabold transition-colors ${
                        lang === code ? 'text-white' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {lang === code && (
                        <motion.span
                          layoutId="help-lang-tab"
                          className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-400 rounded-lg shadow-md"
                          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                        />
                      )}
                      <span className="relative z-10">{code === 'en' ? 'ENG' : '한글'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pr-8">
                <div className="p-2.5 bg-pink-500 rounded-2xl text-white shadow-md">
                  <HelpCircle size={22} />
                </div>
                <div>
                  <h2 id="help-modal-title" className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                    {copy.modalTitle}
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">{copy.modalSubtitle}</p>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-5 scrollbar-hide">
              <AnimatePresence mode="wait">
                <motion.div
                  key={lang}
                  initial={{ opacity: 0, x: lang === 'en' ? 12 : -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: lang === 'en' ? -12 : 12 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="space-y-5"
                >
                  {copy.sections.map((section, idx) => {
                    const Icon = SECTION_ICONS[idx] ?? Palette;
                    return (
                      <section
                        key={section.number}
                        className="rounded-2xl border-2 border-slate-100 bg-slate-50/60 p-4"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white border-2 border-pink-200 flex items-center justify-center shadow-sm">
                            <span className="text-sm font-black text-pink-500">{section.number}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Icon size={16} className="text-pink-500 flex-shrink-0" />
                              <h3 className="text-base font-extrabold text-slate-800">{section.title}</h3>
                            </div>
                            {section.intro && (
                              <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">{section.intro}</p>
                            )}
                          </div>
                        </div>

                        <ul className="space-y-3">
                          {section.bullets.map((bullet) => (
                            <li
                              key={bullet.label}
                              className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm"
                            >
                              <p className="text-xs font-black text-pink-600 uppercase tracking-wide mb-1">
                                {bullet.label}
                              </p>
                              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                {renderGuideText(bullet.text)}
                              </p>
                            </li>
                          ))}
                        </ul>

                        {idx === 0 && (
                          <div className="mt-3 flex gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-100 text-pink-700 text-[10px] font-black">
                              <Palette size={12} /> Draw
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-[10px] font-black">
                              <Shapes size={12} /> Match
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-[10px] font-black">
                              <Hash size={12} /> Lvl 1·2·3
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700 text-[10px] font-black">
                              <Sparkles size={12} /> Stickers
                            </span>
                          </div>
                        )}
                      </section>
                    );
                  })}

                  {/* Home screen tips */}
                  <section className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-100/40 via-amber-50 to-orange-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-amber-400 rounded-xl text-white">
                        <Smartphone size={18} />
                      </div>
                      <h3 className="text-base font-extrabold text-amber-900">{copy.homeScreen.title}</h3>
                    </div>
                    <p className="text-sm text-amber-800/90 font-medium leading-relaxed mb-3">
                      {copy.homeScreen.intro}
                    </p>

                    <div className="mb-3 px-3 py-2 bg-white/80 rounded-xl border border-amber-200">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-0.5">
                        {lang === 'en' ? 'Current address' : '현재 주소'}
                      </p>
                      <p className="text-xs font-bold text-slate-700 break-all">{appUrl}</p>
                    </div>

                    <div className="space-y-3">
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

                    <div className="mt-4 pt-4 border-t-2 border-amber-200/60">
                      <div className="flex items-center gap-2 mb-3">
                        <Bookmark size={16} className="text-amber-700" />
                        <h4 className="text-sm font-extrabold text-amber-900">{copy.homeScreen.bookmark.title}</h4>
                      </div>
                      <div className="space-y-3">
                        <PlatformCard
                          icon={Apple}
                          title={copy.homeScreen.bookmark.iphone.title}
                          steps={copy.homeScreen.bookmark.iphone.steps}
                          accent="border-slate-200 bg-white/90"
                        />
                        <PlatformCard
                          icon={Smartphone}
                          title={copy.homeScreen.bookmark.android.title}
                          steps={copy.homeScreen.bookmark.android.steps}
                          accent="border-slate-200 bg-white/90"
                        />
                      </div>
                    </div>
                  </section>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-white">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black rounded-xl shadow-lg text-sm sm:text-base"
              >
                {copy.closeLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Fixed top-right help trigger — always easy to reach */
export const HelpFab: React.FC<{ onClick: () => void; hidden?: boolean }> = ({
  onClick,
  hidden = false,
}) => {
  if (hidden) return null;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="fixed z-[9998] p-2.5 sm:p-3 rounded-full bg-white text-pink-500 hover:bg-pink-50 transition-colors shadow-lg border-2 border-pink-200 hover:border-pink-300 ring-4 ring-white/80"
      style={{
        top: 'calc(6.75rem + env(safe-area-inset-top, 0px))',
        right: 'calc(0.75rem + env(safe-area-inset-right, 0px))',
      }}
      title="Help / 도움말"
      aria-label="Open help guide"
    >
      <HelpCircle size={22} className="sm:w-6 sm:h-6" />
    </motion.button>
  );
};
