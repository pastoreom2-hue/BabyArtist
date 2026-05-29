import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, signIn, logOut, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { DrawingCanvas } from './components/DrawingCanvas';
import { Toolbar } from './components/Toolbar';
import { ActivitySelector } from './components/ActivitySelector';
import { Gallery } from './components/Gallery';
import { FrameSelector } from './components/FrameSelector';
import { FramedArtwork } from './components/FramedArtwork';
import { ArtworkShareActions } from './components/ArtworkShareActions';
import { OnboardingTour } from './components/OnboardingTour';
import { GalleryShareGuide } from './components/GalleryShareGuide';
import { HelpModal } from './components/HelpModal';
import { HeaderIconButton } from './components/HeaderIconButton';
import { AdMobBanner, useAdBannerOffset } from './components/AdMobBanner';
import { AppNavBar } from './components/AppNavBar';
import { FRAME_STORAGE_KEY, FrameId, loadStoredFrame } from './frames';
import { isTourCompleted } from './onboardingTour';
import { ActivityType, ActivityLevel, Artwork, COLORS, DAILY_CHALLENGES, STICKERS, Sticker } from './types';
import { LogIn, LogOut, Palette, Image as ImageIcon, Heart, Sparkles, User as UserIcon, Maximize2, Minimize2, Music, Star, X, Share2, Trophy, Pen, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const [savedArt, setSavedArt] = useState<string[]>([]);
  const [view, setView] = useState<'draw' | 'gallery'>('draw');
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [activeTool, setActiveTool] = useState<'pen' | 'sticker'>('pen');
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(STICKERS[0]);
  const [dailyChallenge, setDailyChallenge] = useState("");
  const [isFullscreenUIHidden, setIsFullscreenUIHidden] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<FrameId>(loadStoredFrame);
  const [showTour, setShowTour] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const adBannerOffset = useAdBannerOffset(isFullscreen);
  const drawingAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const day = new Date().getDate();
    setDailyChallenge(DAILY_CHALLENGES[day % DAILY_CHALLENGES.length]);

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });

    const localArt = localStorage.getItem('colorjoy-art');
    if (localArt) {
      try {
        setSavedArt(JSON.parse(localArt));
      } catch (e) {
        console.error("Failed to load local art", e);
      }
    }

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(FRAME_STORAGE_KEY, selectedFrame);
  }, [selectedFrame]);

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
    const el = document.documentElement;
    
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement || 
      (document as any).webkitFullscreenElement || 
      isFullscreen
    );

    if (!isCurrentlyFullscreen) {
      if (el.requestFullscreen) {
        el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => setIsFullscreen(true));
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
        setIsFullscreen(true);
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      setIsFullscreen(false);
      setIsFullscreenUIHidden(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isCurrentlyFs);
      if (!isCurrentlyFs) {
        setIsFullscreenUIHidden(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    // Prevent multi-touch zooming and double-tap zoom on iOS
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    let lastTouchEnd = 0;
    const preventDoubleTap = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('touchend', preventDoubleTap, { passive: false });
    
    // THE NUCLEAR OPTION: Block all page scrolling/dragging on iPad
    const preventDrag = (e: TouchEvent) => {
      // Allow scrolling on elements with 'overflow-y-auto' or similar
      const target = e.target as HTMLElement;
      if (target.closest('.overflow-y-auto, .overflow-auto')) {
        return;
      }
      
      if (e.cancelable) {
        e.preventDefault();
      }
    };
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

  const handleSaveArtwork = async (dataUrl: string) => {
    const title = `Masterpiece ${savedArt.length + 1}`;
    const newArt = [dataUrl, ...savedArt].slice(0, 24);
    setSavedArt(newArt);
    localStorage.setItem('colorjoy-art', JSON.stringify(newArt));

    const dateTag = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: COLORS.map(c => c.value)
    });

    if (user) {
      try {
        await addDoc(collection(db, 'artworks'), {
          title,
          dataUrl,
          userId: user.uid,
          userName: user.displayName,
          createdAt: serverTimestamp(),
          dateTag,
          isShared: false
        });
      } catch (error) {
        console.error("Cloud save failed, but local save succeeded:", error);
      }
    }
  };

  const handlePhotoUpload = (dataUrl: string) => {
    void handleSaveArtwork(dataUrl);
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
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 text-[17px] sm:text-lg">
      <header
        className={`bg-white/95 backdrop-blur-sm sticky top-0 z-[100] border-b border-stone-200/70 shadow-sm ${isFullscreen ? 'hidden' : ''}`}
        style={{ ['--app-header-h' as string]: '8rem' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-pink-500 rounded-lg sm:rounded-xl text-white flex-shrink-0">
              <Palette className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.25} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-pink-500 tracking-tight truncate">
              BabyArtist
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            <HeaderIconButton
              icon={Music}
              onClick={toggleMusic}
              title={isMusicPlaying ? 'Stop Music' : 'Play Music'}
              active={isMusicPlaying}
              activeClass="bg-amber-100 text-amber-600 border-amber-200 animate-pulse"
              size="large"
            />
            <HeaderIconButton
              icon={HelpCircle}
              onClick={() => setIsHelpOpen(true)}
              title="Help"
              active={isHelpOpen}
              activeClass="bg-pink-100 text-pink-600 border-pink-200"
              size="large"
            />
            {user ? (
              <>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-stone-200 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500">
                    <UserIcon size={15} />
                  </div>
                )}
                <HeaderIconButton icon={LogOut} onClick={logOut} title="Logout" />
              </>
            ) : (
              <button
                type="button"
                onClick={signIn}
                className="h-10 sm:h-11 px-4 sm:px-6 flex items-center gap-2 rounded-full bg-stone-800 text-white text-base sm:text-lg font-bold hover:bg-stone-700 transition-colors"
              >
                <LogIn size={20} />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}
          </div>
        </div>

        <AppNavBar
          view={view}
          onViewChange={setView}
          onPhotoUpload={handlePhotoUpload}
        />
      </header>

      <main
        className={`${isFullscreen ? 'fixed inset-0 z-[100] bg-white w-screen h-screen m-0 p-0 max-w-none' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8'}`}
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
                    ? 'bg-white !fixed !inset-0 !left-0 !top-0 !w-screen !h-screen overflow-hidden z-[102] m-0 p-0 touch-none select-none' 
                    : 'gap-5 sm:gap-6'
                }`}
                style={isFullscreen ? { height: '100dvh', width: '100vw' } : {}}
              >
                {/* Fullscreen Overlay UI (Floating for all devices) */}
                {isFullscreen && (
                  <div className="contents">
                    <div 
                      className="absolute right-4 sm:right-8 z-[200] flex justify-end items-center gap-2 sm:gap-4 pointer-events-none landscape-compact-header"
                      style={{ top: 'calc(0.75rem + env(safe-area-inset-top))' }}
                    >
                      <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto scale-90 sm:scale-100 origin-right">
                        <button
                          onClick={() => setIsFullscreenUIHidden(!isFullscreenUIHidden)}
                          className={`p-2 sm:p-4 rounded-xl sm:rounded-[2rem] transition-all shadow-xl border-2 flex items-center gap-2 ${
                            isFullscreenUIHidden 
                              ? 'bg-blue-500 border-blue-600 text-white' 
                              : 'bg-white/90 backdrop-blur-md border-blue-100 text-blue-500'
                          }`}
                          title={isFullscreenUIHidden ? "Show Artist Tools" : "Focus on Drawing (Hide Tools)"}
                        >
                          <Pen size={isFullscreen && typeof window !== 'undefined' && window.innerWidth > 640 ? 24 : 20} className={isFullscreenUIHidden ? 'opacity-50' : 'opacity-100'} />
                        </button>
                        <button
                          onClick={toggleMusic}
                          className={`p-2 sm:p-4 rounded-xl sm:rounded-[2rem] transition-all shadow-xl border-2 flex items-center gap-2 ${
                            isMusicPlaying 
                              ? 'bg-yellow-400 border-yellow-500 text-white' 
                              : 'bg-white/90 backdrop-blur-md border-amber-100 text-amber-500'
                          }`}
                        >
                          <Music size={isFullscreen && typeof window !== 'undefined' && window.innerWidth > 640 ? 24 : 20} className={isMusicPlaying ? 'animate-bounce' : ''} />
                        </button>
                        <button
                          onClick={toggleFullscreen}
                          className="p-2 sm:p-4 bg-white/90 backdrop-blur-md text-blue-600 rounded-xl sm:rounded-[2rem] shadow-xl border-2 border-blue-100 hover:bg-blue-50 transition-all"
                        >
                          <Minimize2 size={isFullscreen && typeof window !== 'undefined' && window.innerWidth > 640 ? 24 : 20} />
                        </button>
                      </div>
                    </div>

                    {/* Floating Toolbar (Paint) */}
                    <div 
                      className={`absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-[200] w-48 sm:w-72 max-h-[85vh] overflow-y-auto scrollbar-hide py-2 sm:py-6 pointer-events-none landscape-compact-toolbar transition-all duration-300 ${
                        isFullscreenUIHidden ? 'opacity-0 -translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'
                      }`}
                      style={{ paddingLeft: 'env(safe-area-inset-left)' }}
                    >
                      <div className="pointer-events-auto shadow-2xl rounded-[1.5rem] sm:rounded-[3rem] scale-[0.85] sm:scale-100 origin-left">
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
                    </div>

                    {/* Compact Activity Switcher bottom-right */}
                    <div 
                      className={`absolute right-4 sm:right-8 z-[200] flex items-end gap-3 sm:gap-6 pointer-events-none landscape-compact-switcher transition-all duration-300 ${
                        isFullscreenUIHidden ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'
                      }`}
                      style={{ 
                        bottom: 'calc(0.5rem + env(safe-area-inset-bottom))',
                        paddingRight: 'env(safe-area-inset-right)'
                      }}
                    >
                       <div className="pointer-events-auto scale-[0.85] sm:scale-100 origin-bottom-right">
                         <ActivitySelector 
                            activeActivity={activeActivity} 
                            onActivityChange={setActiveActivity} 
                            activeLevel={activeLevel}
                            onLevelChange={setActiveLevel}
                            onShowChallenge={() => setIsChallengeOpen(true)}
                          />
                       </div>
                    </div>
                  </div>
                )}

                {/* Activity and Fullscreen Controls */}
                {!isFullscreen && (
                  <section className="rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 via-yellow-50 to-lime-50/80 px-3 py-3 sm:px-4 sm:py-3.5 shadow-sm">
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
                )}

                {/* Main Content Areas */}
                <div className={`flex-1 relative ${isFullscreen ? 'h-full w-full' : 'grid grid-cols-1 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8'}`}>
                  {!isFullscreen && (
                    <div className="lg:col-span-1 order-2 lg:order-1 flex flex-col gap-4">
                      <div className="rounded-2xl border border-stone-200/80 bg-white p-3 sm:p-4 shadow-sm">
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

                      <div className="hidden lg:block rounded-2xl border border-stone-200/80 bg-stone-50 p-4">
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
                  )}

                  <div className={`${isFullscreen ? 'h-full w-full absolute inset-0' : 'lg:col-span-3 order-1 lg:order-2 h-[50vh] landscape:h-[70vh] sm:h-[58vh] lg:h-auto'} relative`}>
                    <div className={`h-full ${isFullscreen ? '' : 'rounded-2xl border border-stone-200/80 bg-white p-2 sm:p-3 shadow-sm'}`}>
                    <DrawingCanvas
                      color={currentColor}
                      brushSize={brushSize}
                      onSave={handleSaveArtwork}
                      activityType={activeActivity}
                      level={activeLevel}
                      activeTool={activeTool}
                      selectedSticker={selectedSticker}
                      isFullscreen={isFullscreen}
                      onColorChange={setCurrentColor}
                    />
                    </div>

                    {/* Daily Challenge Modal - Centered over the Whiteboard */}
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
                                <p className="text-purple-100 font-bold text-xl">"{dailyChallenge}"</p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  confetti({ 
                                    particleCount: 100, 
                                    spread: 60, 
                                    origin: { y: 0.6 },
                                    colors: ['#FF69B4', '#8A2BE2', '#FFD700', '#00BFFF']
                                  });
                                  setIsChallengeOpen(false);
                                }}
                                className="px-8 py-3 bg-yellow-400 text-purple-900 rounded-xl font-black uppercase text-lg shadow-xl hover:bg-yellow-300 transition-all mt-2"
                              >
                                I'm Ready!
                              </motion.button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

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

              <div className="sticky z-40 mb-6" style={{ top: 'var(--app-header-h, 6.25rem)' }}>
                <FrameSelector selectedFrame={selectedFrame} onSelect={setSelectedFrame} />
              </div>

              <GalleryShareGuide
                selectedFrame={selectedFrame}
                previewUrl={savedArt[0] ?? artworks[0]?.dataUrl}
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
                            key={`local-${i}`}
                            whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                            className="bg-white p-3 rounded-2xl border-4 border-slate-800 shadow-[6px_6px_0px_0px_rgba(30,41,59,1)] group relative overflow-hidden"
                          >
                            <FramedArtwork
                              src={art}
                              alt={`Art ${i}`}
                              frameId={selectedFrame}
                              className="w-full aspect-square rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 rounded-lg">
                              <p className="text-white text-[10px] font-medium text-center">Frame · Share</p>
                              <ArtworkShareActions
                                dataUrl={art}
                                title={`Masterpiece ${i + 1}`}
                                frameId={selectedFrame}
                              />
                              <button
                                onClick={() => {
                                  const newArt = savedArt.filter((_, index) => index !== i);
                                  setSavedArt(newArt);
                                  localStorage.setItem('colorjoy-art', JSON.stringify(newArt));
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
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        currentView={view}
        onChangeView={setView}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

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
