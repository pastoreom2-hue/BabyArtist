import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, signIn, logOut, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { DrawingCanvas, type DrawingCanvasHandle } from './components/DrawingCanvas';
import { Toolbar } from './components/Toolbar';
import { ActivitySelector } from './components/ActivitySelector';
import { Gallery } from './components/Gallery';
import { FrameSelector } from './components/FrameSelector';
import { FramedArtwork } from './components/FramedArtwork';
import { ArtworkShareActions } from './components/ArtworkShareActions';
import { OnboardingTour } from './components/OnboardingTour';
import { FullscreenDock } from './components/FullscreenDock';
import { GalleryShareGuide } from './components/GalleryShareGuide';
import { ShareHowToCard } from './components/ShareHowToCard';
import { HelpModal } from './components/HelpModal';
import { SaveArtworkDialog } from './components/SaveArtworkDialog';
import { HeaderIconButton, HeaderLoginButton } from './components/HeaderIconButton';
import { AdMobBanner, useAdBannerOffset } from './components/AdMobBanner';
import { AppNavBar, type AppView } from './components/AppNavBar';
import { SavedDrawingsPanel } from './components/SavedDrawingsPanel';
import { RecentDrawings } from './components/RecentDrawings';
import { InstallAppPrompt } from './components/InstallAppPrompt';
import { ProjectStoryHero } from './components/ProjectStoryHero';
import {
  migrateLocalStorageToIdbIfEmpty,
  saveDrawingToIdb,
} from './utils/artworkIdb';
import { FRAME_STORAGE_KEY, FrameId, loadStoredFrame } from './frames';
import { isTourCompleted } from './onboardingTour';
import { ActivityType, ActivityLevel, Artwork, COLORS, DAILY_CHALLENGES, STICKERS, Sticker } from './types';
import {
  generateTempArtworkName,
  loadLocalArtworks,
  persistLocalArtworks,
  sanitizeArtworkFilename,
  type LocalArtwork,
} from './utils/artworkNaming';
import { downloadDataUrl } from './utils/downloadDataUrl';
import { LogOut, Palette, Image as ImageIcon, Heart, Sparkles, User as UserIcon, Maximize2, Music, Star, X, Share2, Trophy, HelpCircle, Trash2, Save } from 'lucide-react';
import confetti from 'canvas-confetti';

const FRIENDLY_SAVE_ERROR = "Oops! Let's try saving again";

const isCoarsePointer = () =>
  window.matchMedia('(pointer: coarse)').matches ||
  window.matchMedia('(hover: none)').matches;

const canScrollWithin = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;

  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;

  let el: Element | null = target;
  while (el && el !== document.documentElement) {
    if (
      el.classList.contains('help-modal-scroll') ||
      el.classList.contains('scroll-region')
    ) {
      return true;
    }

    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      el.scrollHeight > el.clientHeight
    ) {
      return true;
    }

    el = el.parentElement;
  }

  // Document/viewport scroll (html or body) — common on mobile Safari/Chrome
  const scrollingEl = document.scrollingElement ?? document.documentElement;
  if (scrollingEl.scrollHeight > scrollingEl.clientHeight + 1) {
    return true;
  }

  return false;
};

/** Touch targets where page pan must stay blocked so drawing stays stable */
const isDrawSurfaceTouch = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('.canvas-container, .fullscreen-art-mode'));
};

const NURSERY_RHYMES = [
  { id: 'piano-twinkle', name: "Twinkle Twinkle Little Star (반짝반짝 작은 별)", url: 'https://www.mfiles.co.uk/mp3-downloads/twinkle-twinkle-little-star.mp3' },
  { id: 'piano-row', name: "Row Row Row Your Boat (노를 저어라)", url: 'https://www.mfiles.co.uk/mp3-downloads/row-row-row-your-boat.mp3' },
  { id: 'piano-mary', name: "Mary Had a Little Lamb (학교종이 땡땡땡)", url: 'https://www.mfiles.co.uk/mp3-downloads/mary-had-a-little-lamb.mp3' },
  { id: 'piano-london', name: "London Bridge (런던 다리가 무너져요)", url: 'https://www.mfiles.co.uk/mp3-downloads/london-bridge-is-falling-down.mp3' },
  { id: 'piano-macdonald', name: "Old MacDonald (맥도날드 할아버지)", url: 'https://www.mfiles.co.uk/mp3-downloads/old-macdonald-had-a-farm.mp3' },
  { id: 'piano-happy', name: "Happy Melody (기쁜 멜로디)", url: 'https://www.mfiles.co.uk/mp3-downloads/schumann-kinderszenen-op15-no1-of-foreign-lands-and-peoples.mp3' },
  { id: 'piano-christmas', name: "O Christmas Tree (소나무야)", url: 'https://www.mfiles.co.uk/mp3-downloads/o-christmas-tree.mp3' },
  { id: 'piano-lullaby', name: "Brahms Lullaby (자장가)", url: 'https://www.mfiles.co.uk/mp3-downloads/brahms-lullaby.mp3' },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeActivity, setActiveActivity] = useState<ActivityType>('free-draw');
  const [activeLevel, setActiveLevel] = useState<ActivityLevel>(1);
  const [currentColor, setCurrentColor] = useState(COLORS[0].value);
  const [brushSize, setBrushSize] = useState(10);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [savedArt, setSavedArt] = useState<LocalArtwork[]>([]);
  const [autoArtworkName, setAutoArtworkName] = useState('');
  const [pendingSave, setPendingSave] = useState<{ dataUrl: string; defaultName: string } | null>(null);
  const [saveBannerError, setSaveBannerError] = useState<string | null>(null);
  const [recentRefreshKey, setRecentRefreshKey] = useState(0);
  const [view, setView] = useState<AppView>(() => {
    if (typeof window === 'undefined') return 'draw';
    const path = window.location.pathname.replace(/\/+$/, '');
    if (path === '/gallery' || window.location.hash === '#gallery') return 'gallery';
    if (path === '/saved' || window.location.hash === '#saved') return 'saved';
    return 'draw';
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [activeTool, setActiveTool] = useState<'pen' | 'sticker'>('pen');
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(STICKERS[0]);
  const [dailyChallenge, setDailyChallenge] = useState("");
  const [selectedFrame, setSelectedFrame] = useState<FrameId>(loadStoredFrame);
  const [showTour, setShowTour] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const adBannerOffset = useAdBannerOffset(isFullscreen);
  const drawingAreaRef = useRef<HTMLDivElement>(null);
  const fullscreenCanvasRef = useRef<DrawingCanvasHandle>(null);

  useEffect(() => {
    const day = new Date().getDate();
    setDailyChallenge(DAILY_CHALLENGES[day % DAILY_CHALLENGES.length]);

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });

    const localArt = loadLocalArtworks();
    if (localArt.length) {
      setSavedArt(localArt);
    }

    void migrateLocalStorageToIdbIfEmpty(localArt).then(() => {
      setRecentRefreshKey((k) => k + 1);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(FRAME_STORAGE_KEY, selectedFrame);
  }, [selectedFrame]);

  // Keep URL in sync with the active view
  useEffect(() => {
    const next =
      view === 'gallery' ? '/gallery' : view === 'saved' ? '/saved' : '/';
    if (window.location.pathname !== next) {
      window.history.replaceState(null, '', next);
    }
    if (view === 'gallery') {
      window.scrollTo(0, 0);
      document.getElementById('root')?.scrollTo?.(0, 0);
      requestAnimationFrame(() => {
        document.getElementById('share-howto-card')?.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      });
    }
  }, [view]);

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname.replace(/\/+$/, '') || '/';
      if (path === '/gallery') setView('gallery');
      else if (path === '/saved') setView('saved');
      else setView('draw');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!isAuthReady || isTourCompleted()) return;
    const timer = window.setTimeout(() => setShowTour(true), 900);
    return () => window.clearTimeout(timer);
  }, [isAuthReady]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    const handleEnded = () => {
      setCurrentTrackIndex((prev) => (prev + 1) % NURSERY_RHYMES.length);
    };
    
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMusicPlaying) {
      const currentUrl = NURSERY_RHYMES[currentTrackIndex].url;
      if (audio.src !== currentUrl) {
        audio.src = currentUrl;
        audio.load();
      }
      
      audio.play().catch(e => {
        console.error("Audio play failed:", e);
        if (isMusicPlaying) {
          setTimeout(() => {
            setCurrentTrackIndex((prev) => (prev + 1) % NURSERY_RHYMES.length);
          }, 2000);
        }
      });
    } else {
      audio.pause();
    }
  }, [isMusicPlaying, currentTrackIndex]);

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setActiveTool('pen');
      setSelectedSticker(null);
      // CSS fullscreen first — reliable on iPhone (native FS is flaky / can wipe UI).
      setIsFullscreen(true);
      if (!isCoarsePointer()) {
        const el = document.documentElement;
        if (el.requestFullscreen) {
          el.requestFullscreen().catch(() => {});
        } else if ((el as any).webkitRequestFullscreen) {
          (el as any).webkitRequestFullscreen();
        }
      }
    } else {
      setIsFullscreen(false);
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen && (document as any).webkitFullscreenElement) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const nativeFs = !!(
        document.fullscreenElement || (document as any).webkitFullscreenElement
      );
      // On phones, CSS fullscreen owns state — ignore native FS exit events
      // (iOS often fires these and would hide the color dock / save controls).
      if (isCoarsePointer()) {
        if (nativeFs) setIsFullscreen(true);
        return;
      }
      setIsFullscreen(nativeFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    // Touch guards — coarse-pointer devices only (phones/tablets, not desktop mice)
    const preventZoom = (e: TouchEvent) => {
      if (!isCoarsePointer()) return;
      if (e.touches.length > 1) e.preventDefault();
    };
    
    let lastTouchEnd = 0;
    const preventDoubleTap = (e: TouchEvent) => {
      if (!isCoarsePointer()) return;
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    };

    const preventDrag = (e: TouchEvent) => {
      if (!isCoarsePointer()) return;
      // Only suppress page pan on the drawing surface / fullscreen art mode.
      // Elsewhere, allow natural vertical scrolling on mobile.
      if (!isDrawSurfaceTouch(e.target)) return;
      if (canScrollWithin(e.target)) return;
      if (e.cancelable) e.preventDefault();
    };

    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('touchend', preventDoubleTap, { passive: false });
    document.addEventListener('touchmove', preventDrag, { passive: false });
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('touchend', preventDoubleTap);
      document.removeEventListener('touchmove', preventDrag);
    };
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;

    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverscroll = body.style.overscrollBehavior;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    html.style.overscrollBehavior = 'none';

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      body.style.overscrollBehavior = prevBodyOverscroll;
      html.style.overscrollBehavior = '';
      window.scrollTo(scrollX, scrollY);
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!user) {
      setArtworks([]);
      return;
    }

    const q = query(
      collection(db, 'artworks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artwork));
      setArtworks(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'artworks');
    });

    return () => unsubscribe();
  }, [user]);

  const handleDrawingStarted = () => {
    setAutoArtworkName((prev) => prev || generateTempArtworkName());
  };

  const handleDrawingCleared = () => {
    setAutoArtworkName(generateTempArtworkName());
  };

  const openSaveDialog = (dataUrl: string) => {
    setSaveBannerError(null);
    const defaultName = sanitizeArtworkFilename(autoArtworkName || generateTempArtworkName());
    setPendingSave({ dataUrl, defaultName });
  };

  const handleSaveArtwork = async (dataUrl: string, filename?: string) => {
    const title = sanitizeArtworkFilename(filename || autoArtworkName || generateTempArtworkName());
    const dateTag = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const entry: LocalArtwork = {
      dataUrl,
      title,
      savedAt: new Date().toISOString(),
    };

    try {
      const newArt = [entry, ...savedArt].slice(0, 24);
      setSavedArt(newArt);
      persistLocalArtworks(newArt);

      await saveDrawingToIdb(dataUrl, title, Date.now());
      setRecentRefreshKey((k) => k + 1);

      downloadDataUrl(dataUrl, title);

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: COLORS.map((c) => c.value),
      });

      setView('gallery');

    if (user) {
      try {
        await addDoc(collection(db, 'artworks'), {
          title,
          dataUrl,
          userId: user.uid,
          userName: user.displayName,
          createdAt: serverTimestamp(),
            dateTag,
            isShared: false,
        });
      } catch (error) {
          console.error('Cloud save failed, but local save succeeded:', error);
        }
      }

      setPendingSave(null);
      setAutoArtworkName(generateTempArtworkName());
      setSaveBannerError(null);
    } catch (error) {
      console.error(error);
      setSaveBannerError(FRIENDLY_SAVE_ERROR);
      throw error;
    }
  };

  const handlePhotoUpload = (dataUrl: string) => {
    openSaveDialog(dataUrl);
  };

  const handleDeleteArtwork = async (id: string) => {
    if (!confirm('Are you sure you want to delete this drawing?')) return;
    try {
      await deleteDoc(doc(db, 'artworks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `artworks/${id}`);
    }
  };

  const handleShareArtwork = async (artwork: Artwork) => {
    try {
      if (!artwork.id) return;
      await updateDoc(doc(db, 'artworks', artwork.id), {
        isShared: !artwork.isShared
      });
      
      if (!artwork.isShared) {
        const shareUrl = `${window.location.origin}/share/${artwork.id}`;
        navigator.clipboard.writeText(shareUrl);
        alert('Sharing link copied to clipboard! Send it to family!');
      } else {
        alert('Artwork is now private.');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `artworks/${artwork.id}`);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={64} className="text-yellow-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-shell bg-stone-50 font-sans text-stone-800 text-[17px] sm:text-lg">
      <header
        className={`safe-top bg-white/95 backdrop-blur-sm sticky top-0 z-[100] border-b border-stone-200/70 shadow-sm ${isFullscreen ? 'hidden' : ''}`}
        style={{ ['--app-header-h' as string]: 'var(--app-header-height, 8rem)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-gradient-to-b from-pink-400 to-fuchsia-500 rounded-xl sm:rounded-2xl text-white flex-shrink-0 border-[2.5px] border-white shadow-[0_3px_0_0_#db2777]">
              <Palette className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.4} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight truncate bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              BabyArtist
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            <HeaderIconButton
              icon={Music}
              onClick={toggleMusic}
              title={isMusicPlaying ? 'Stop Music' : 'Play Music'}
              active={isMusicPlaying}
              tone="music"
              size="large"
            />
            <HeaderIconButton
              icon={HelpCircle}
              onClick={() => setIsHelpOpen(true)}
              title="Help"
              active={isHelpOpen}
              tone="help"
              size="large"
            />
            {user ? (
              <>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-[2.5px] border-pink-200 shadow-sm flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-fuchsia-100 to-pink-200 border-[2.5px] border-pink-200 flex items-center justify-center text-pink-600">
                    <UserIcon size={16} strokeWidth={2.5} />
                  </div>
                )}
                <HeaderIconButton
                  icon={LogOut}
                  onClick={logOut}
                  title="Logout"
                  tone="auth"
                  size="large"
                />
              </>
            ) : (
              <HeaderLoginButton onClick={signIn} />
            )}
          </div>
        </div>

        <AppNavBar view={view} onViewChange={setView} />
        {!isFullscreen && view === 'gallery' && (
          <div className="px-3 sm:px-4 pb-3 pt-1 max-w-3xl mx-auto w-full">
            <ShareHowToCard />
          </div>
        )}
        {!isFullscreen && <RecentDrawings refreshKey={recentRefreshKey} />}
      </header>

      <main
        className={`${
          isFullscreen
            ? 'fixed inset-0 z-[100] bg-white w-full h-[100svh] max-h-[100svh] m-0 p-0 max-w-none overscroll-none'
            : 'app-main'
        }`}
        style={{ paddingBottom: isFullscreen ? undefined : adBannerOffset }}
      >
        <AnimatePresence mode="wait">
          {view === 'draw' ? (
            <motion.div
              key="draw"
              initial={isFullscreen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex flex-col h-full ${isFullscreen ? '!transform-none !m-0 !p-0 !w-full !h-full relative z-[101]' : ''}`}
            >
              <div 
                ref={drawingAreaRef}
                className={`flex flex-col ${
                  isFullscreen 
                    ? 'fullscreen-art-mode !fixed !inset-0 !left-0 !top-0 !w-full overflow-hidden z-[102] m-0 p-0 touch-none select-none overscroll-none' 
                    : 'gap-5 sm:gap-6'
                }`}
                style={
                  isFullscreen
                    ? {
                        // svh = stable small viewport — avoids iPad chrome show/hide resize thrash
                        height: '100svh',
                        maxHeight: '100svh',
                        width: '100%',
                        minHeight: '-webkit-fill-available',
                        touchAction: 'none',
                        overscrollBehavior: 'none',
                      }
                    : undefined
                }
              >
                {!isFullscreen && (
                  <>
                    <ProjectStoryHero
                      onStartDrawing={() => {
                        document
                          .getElementById('drawing-studio')
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    />
                    <section
                      id="drawing-studio"
                      className="rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 via-yellow-50 to-lime-50/80 px-3 py-3 sm:px-4 sm:py-3.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                           <ActivitySelector 
                              activeActivity={activeActivity} 
                              onActivityChange={setActiveActivity} 
                              activeLevel={activeLevel}
                              onLevelChange={setActiveLevel}
                              onShowChallenge={() => setIsChallengeOpen(true)}
                            />
                         </div>
                        <button
                          type="button"
                          onClick={toggleFullscreen}
                          className="flex-shrink-0 inline-flex items-center gap-2 h-10 sm:h-11 px-4 sm:px-5 rounded-full bg-white border border-stone-200 text-stone-600 text-sm sm:text-base font-bold hover:border-stone-300 hover:bg-stone-50 transition-all"
                          title="Fullscreen Art Mode"
                        >
                          <Maximize2 size={18} />
                          <span className="hidden sm:inline">Fullscreen</span>
                        </button>
                      </div>
                    </section>
                  </>
                )}

                {isFullscreen ? (
                  <div className="fs-board" data-testid="fs-board">
                    <div className="fs-board__canvas">
                      <DrawingCanvas
                        ref={fullscreenCanvasRef}
                        color={currentColor}
                        brushSize={brushSize}
                        onSave={openSaveDialog}
                        onDrawingStarted={handleDrawingStarted}
                        onDrawingCleared={handleDrawingCleared}
                        activityType={activeActivity}
                        level={activeLevel}
                        activeTool={activeTool}
                        selectedSticker={selectedSticker}
                        isFullscreen={isFullscreen}
                        onColorChange={setCurrentColor}
                      />
                    </div>

                    {/* Slim essential tools dock — keeps canvas spacious */}
                    <div className="fs-board__ui" data-testid="fs-board-ui">
                      {/* Save/trash in UI layer (above dock) — visible on portrait iPhone */}
                      <div className="fs-canvas-actions" data-testid="fs-canvas-actions">
                        <button
                          type="button"
                          className="canvas-hud-action canvas-hud-action--trash"
                          title="Clear Canvas"
                          aria-label="Clear Canvas"
                          data-testid="fs-trash-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            fullscreenCanvasRef.current?.clear();
                          }}
                        >
                          <Trash2 className="canvas-hud-action__icon" aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="canvas-hud-action canvas-hud-action--save"
                          title="Save Masterpiece"
                          aria-label="Save Masterpiece"
                          onClick={() => {
                            const dataUrl = fullscreenCanvasRef.current?.exportDataUrl();
                            if (dataUrl) openSaveDialog(dataUrl);
                          }}
                        >
                          <Save className="canvas-hud-action__icon" />
                        </button>
                      </div>

                      <FullscreenDock
                        currentColor={currentColor}
                        onColorChange={(color) => {
                          setActiveTool('pen');
                          setSelectedSticker(null);
                          setCurrentColor(color);
                        }}
                        brushSize={brushSize}
                        onBrushSizeChange={(size) => {
                          setActiveTool('pen');
                          setSelectedSticker(null);
                          setBrushSize(size);
                        }}
                        onExit={toggleFullscreen}
                      />
                    </div>

                    <AnimatePresence>
                      {isChallengeOpen && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-[300] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]"
                        >
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-md p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-[2.5rem] shadow-2xl text-white border-4 border-white relative"
                          >
                    <button
                              type="button"
                              onClick={() => setIsChallengeOpen(false)}
                              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                            >
                              <X size={20} />
                    </button>
                            <div className="flex flex-col items-center text-center gap-4">
                              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
                                <Trophy size={48} className="text-yellow-300 animate-bounce" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Daily Challenge!</h2>
                                <p className="text-purple-100 font-bold text-xl">&quot;{dailyChallenge}&quot;</p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  confetti({
                                    particleCount: 100,
                                    spread: 60,
                                    origin: { y: 0.6 },
                                    colors: ['#FF69B4', '#8A2BE2', '#FFD700', '#00BFFF'],
                                  });
                                  setIsChallengeOpen(false);
                                }}
                                className="px-8 py-3 bg-yellow-400 text-purple-900 rounded-xl font-black uppercase text-lg shadow-xl hover:bg-yellow-300 transition-all mt-2"
                              >
                                I&apos;m Ready!
                              </motion.button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                <div className="app-draw-grid grid grid-cols-1 md:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 flex-1 relative">
                  <div className="app-sidebar-panel md:col-span-1 order-2 md:order-1 flex flex-col gap-4">
                    <div className="rounded-2xl border border-stone-200/80 bg-white p-3 sm:p-4 shadow-sm w-full max-w-full box-border overflow-x-hidden">
                        <Toolbar
                          currentColor={currentColor}
                          onColorChange={setCurrentColor}
                          brushSize={brushSize}
                          onBrushSizeChange={setBrushSize}
                          activeTool={activeTool}
                          onToolChange={setActiveTool}
                          selectedSticker={selectedSticker}
                          onStickerChange={setSelectedSticker}
                        />
                      </div>
                      
                    <div className="hidden md:block rounded-2xl border border-stone-200/80 bg-stone-50 p-4">
                      <h3 className="text-sm font-semibold text-stone-700 flex items-center gap-2 mb-2">
                        <Heart size={16} className="text-pink-400" /> Tip
                        </h3>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {activeTool === 'sticker'
                          ? 'Pick a sticker and tap the canvas to place it!'
                          : 'Draw anything you want — use magic colors!'}
                        </p>
                      </div>
                    </div>

                  <div className="md:col-span-3 order-1 md:order-2 draw-canvas-panel relative">
                    <div className="h-full rounded-2xl border border-stone-200/80 bg-white p-2 sm:p-3 shadow-sm">
                    <DrawingCanvas
                      color={currentColor}
                      brushSize={brushSize}
                        onSave={openSaveDialog}
                        onDrawingStarted={handleDrawingStarted}
                        onDrawingCleared={handleDrawingCleared}
                      activityType={activeActivity}
                      level={activeLevel}
                      activeTool={activeTool}
                      selectedSticker={selectedSticker}
                        isFullscreen={false}
                        onColorChange={setCurrentColor}
                    />
                    </div>

                    <AnimatePresence>
                      {isChallengeOpen && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-[200] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px] rounded-[2rem]"
                        >
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-md p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-[2.5rem] shadow-2xl text-white border-4 border-white relative"
                          >
                            <button 
                              type="button"
                              onClick={() => setIsChallengeOpen(false)}
                              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                            >
                              <X size={20} />
                            </button>
                            <div className="flex flex-col items-center text-center gap-4">
                              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
                                <Trophy size={48} className="text-yellow-300 animate-bounce" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Daily Challenge!</h2>
                                <p className="text-purple-100 font-bold text-xl">&quot;{dailyChallenge}&quot;</p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  confetti({ 
                                    particleCount: 100, 
                                    spread: 60, 
                                    origin: { y: 0.6 },
                                    colors: ['#FF69B4', '#8A2BE2', '#FFD700', '#00BFFF'],
                                  });
                                  setIsChallengeOpen(false);
                                }}
                                className="px-8 py-3 bg-yellow-400 text-purple-900 rounded-xl font-black uppercase text-lg shadow-xl hover:bg-yellow-300 transition-all mt-2"
                              >
                                I&apos;m Ready!
                              </motion.button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                )}

                <AnimatePresence>
                  {isSaving && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center"
                    >
                      <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Sparkles size={48} className="text-yellow-400" />
                        </motion.div>
                        <p className="text-xl font-black text-gray-800">Saving Masterpiece...</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : view === 'saved' ? (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SavedDrawingsPanel
                artworks={savedArt}
                onAddPhoto={handlePhotoUpload}
                onStartDrawing={() => setView('draw')}
                onDelete={(index) => {
                  const newArt = savedArt.filter((_, i) => i !== index);
                  setSavedArt(newArt);
                  persistLocalArtworks(newArt);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-stone-200/80">
                <h2 className="text-lg sm:text-xl font-bold text-stone-800">
                  Your Gallery
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 font-medium">
                  {savedArt.length + artworks.length} pieces
                </p>
              </div>

              <div className="sticky z-40 mb-6 scroll-region" style={{ top: 'var(--app-header-h, var(--app-header-height, 6.25rem))' }}>
                <FrameSelector selectedFrame={selectedFrame} onSelect={setSelectedFrame} />
              </div>

              <GalleryShareGuide
                selectedFrame={selectedFrame}
                previewUrl={savedArt[0]?.dataUrl ?? artworks[0]?.dataUrl}
              />
              
              {savedArt.length === 0 && artworks.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl shadow-xl text-center flex flex-col items-center gap-6 border-4 border-blue-200">
                  <div className="p-4 bg-blue-100 text-blue-500 rounded-full">
                    <Sparkles size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Your Gallery is Empty</h3>
                    <p className="text-gray-500">Go draw something and click the pink Save button!</p>
                  </div>
                  <button
                    onClick={() => setView('draw')}
                    className="px-8 py-3 bg-pink-500 text-white rounded-2xl font-bold text-lg hover:bg-pink-600 transition-all shadow-xl"
                  >
                    Start Drawing
                  </button>
                </div>
              ) : (
                <div className="space-y-12">
                  {/* Local Art */}
                  {savedArt.length > 0 && (
                    <section>
                      <h3 className="text-xl font-black text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Star className="text-yellow-400 fill-yellow-400" /> Recent Masterpieces
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {savedArt.map((art, i) => (
                          <motion.div
                            key={`local-${art.savedAt}-${i}`}
                            whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                            className="bg-white p-3 rounded-2xl border-4 border-slate-800 shadow-[6px_6px_0px_0px_rgba(30,41,59,1)] group relative overflow-hidden"
                          >
                            <FramedArtwork
                              src={art.dataUrl}
                              alt={art.title}
                              frameId={selectedFrame}
                              className="w-full aspect-square rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 rounded-lg">
                              <p className="text-white text-[10px] font-medium text-center truncate max-w-full px-1">
                                {art.title}
                              </p>
                              <ArtworkShareActions
                                dataUrl={art.dataUrl}
                                title={art.title}
                                frameId={selectedFrame}
                              />
                              <button 
                                onClick={() => {
                                  const newArt = savedArt.filter((_, index) => index !== i);
                                  setSavedArt(newArt);
                                  persistLocalArtworks(newArt);
                                }}
                                className="p-2 bg-red-500 text-white rounded-full border-2 border-slate-800 shadow-md text-xs font-bold"
                                title="Delete"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Cloud Art */}
                  {user && artworks.length > 0 && (
                    <section className="pt-8 border-t-4 border-slate-100">
                      <h3 className="text-xl font-black text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Heart className="text-pink-400 fill-pink-400" /> Cloud Gallery
                      </h3>
                      <Gallery 
                        artworks={artworks} 
                        selectedFrame={selectedFrame}
                        onDelete={handleDeleteArtwork} 
                        onShare={handleShareArtwork} 
                      />
                    </section>
                  )}
                  
                  {!user && (
                    <div className="mt-12 p-8 bg-blue-50 rounded-[2rem] border-4 border-blue-200 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500 text-white rounded-2xl">
                          <Sparkles size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-blue-900 uppercase">Want to save forever?</h4>
                          <p className="text-blue-700 text-sm">Ask an adult to log in to keep your art safe on all devices!</p>
                        </div>
                      </div>
                      <button
                        onClick={signIn}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg whitespace-nowrap"
                      >
                        Adult Login
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <OnboardingTour
        isOpen={showTour && !isFullscreen}
        onClose={() => setShowTour(false)}
        currentView={view}
        onChangeView={setView}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <SaveArtworkDialog
        isOpen={!!pendingSave}
        previewUrl={pendingSave?.dataUrl ?? ''}
        defaultName={pendingSave?.defaultName ?? generateTempArtworkName()}
        onCancel={() => setPendingSave(null)}
        onConfirm={async (filename) => {
          if (!pendingSave) return;
          await handleSaveArtwork(pendingSave.dataUrl, filename);
        }}
      />

      {saveBannerError && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10003] max-w-sm w-[calc(100%-2rem)] px-4 py-3 rounded-2xl bg-pink-600 text-white text-sm font-semibold shadow-xl text-center"
          role="alert"
          data-testid="save-error-banner"
        >
          {saveBannerError}
          <button
            type="button"
            className="ml-2 underline font-bold"
            onClick={() => setSaveBannerError(null)}
          >
            OK
          </button>
        </div>
      )}

      {!isFullscreen && <InstallAppPrompt />}

      <AdMobBanner hidden={isFullscreen} />

      {/* Footer */}
      <footer
        className="p-6 text-center text-gray-400 font-medium text-sm"
        style={{ paddingBottom: isFullscreen ? undefined : adBannerOffset }}
      >
        <p>© 2026 BabyArtist Kids Creative Studio • Made with ❤️ for little artists</p>
      </footer>
    </div>
  );
}
