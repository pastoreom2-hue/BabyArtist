import React, { useEffect, useMemo, useRef } from 'react';
import { Heart, Palette, Share2 } from 'lucide-react';

/** URL-safe public assets (spaces / casing break some browsers & caches). */
const LOGO_VIDEO_SRC = '/videos/logo-video.mp4';
const SENDING_VIDEO_SRC = '/videos/baby-sending-pictures.mp4';

function useAutoplayVideos(refs: React.RefObject<HTMLVideoElement | null>[]) {
  useEffect(() => {
    const playAll = () => {
      for (const ref of refs) {
        const video = ref.current;
        if (!video) continue;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        void video.play().catch(() => {
          // Autoplay can still be blocked until a user gesture; attributes keep retry path open.
        });
      }
    };

    playAll();

    const onVisible = () => {
      if (document.visibilityState === 'visible') playAll();
    };
    document.addEventListener('visibilitychange', onVisible);

    const videos = refs.map((r) => r.current).filter(Boolean) as HTMLVideoElement[];
    const onCanPlay = () => playAll();
    for (const v of videos) {
      v.addEventListener('canplay', onCanPlay);
      v.addEventListener('loadeddata', onCanPlay);
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      for (const v of videos) {
        v.removeEventListener('canplay', onCanPlay);
        v.removeEventListener('loadeddata', onCanPlay);
      }
    };
  }, [refs]);
}

interface ProjectStoryHeroProps {
  onStartDrawing?: () => void;
}

/**
 * Hero story strip: logo animation first, then baby-sending-to-grandparents,
 * with a Start Drawing CTA.
 */
export const ProjectStoryHero: React.FC<ProjectStoryHeroProps> = ({ onStartDrawing }) => {
  const logoRef = useRef<HTMLVideoElement>(null);
  const sendingRef = useRef<HTMLVideoElement>(null);
  const videoRefs = useMemo(() => [logoRef, sendingRef], []);

  useAutoplayVideos(videoRefs);

  return (
    <section className="story-hero" aria-label="BabyArtist story" data-testid="project-story-hero">
      <div className="story-hero__glow" aria-hidden />

      <div className="story-hero__intro">
        <p className="story-hero__brand">BabyArtist</p>
        <h2 className="story-hero__title">Little hands. Big smiles for grandma.</h2>
        <p className="story-hero__sub">
          Watch a tiny artist paint, then send the masterpiece home — joy delivered in one tap.
        </p>
      </div>

      <div className="story-hero__videos">
        <figure className="story-hero__clip">
          <video
            ref={logoRef}
            className="story-hero__media"
            src={LOGO_VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="Baby painting and BabyArtist logo animation"
            data-testid="story-video-logo"
          />
          <figcaption className="story-hero__caption">
            <Palette size={14} aria-hidden />
            Create
          </figcaption>
        </figure>

        <figure className="story-hero__clip">
          <video
            ref={sendingRef}
            className="story-hero__media"
            src={SENDING_VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="Baby sending a drawing and grandparents receiving it with joy"
            data-testid="story-video-sending"
          />
          <figcaption className="story-hero__caption">
            <Share2 size={14} aria-hidden />
            Share the love
            <Heart size={14} className="story-hero__heart" aria-hidden />
          </figcaption>
        </figure>
      </div>

      <div className="story-hero__cta">
        <button
          type="button"
          className="story-hero__download"
          onClick={onStartDrawing}
          data-testid="story-start-drawing"
        >
          <Palette size={18} strokeWidth={2.5} aria-hidden />
          Start Drawing
        </button>
      </div>
    </section>
  );
};
