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
import { FRAME_STORAGE_KEY, FrameId, loadStoredFrame } from './frames';
import { ActivityType, ActivityLevel, Artwork, COLORS, DAILY_CHALLENGES, STICKERS, Sticker } from './types';
import { LogIn, LogOut, Palette, Image as ImageIcon, Heart, Sparkles, User as UserIcon, Maximize2, Minimize2, Music, Volume2, VolumeX, Star, X, Share2, Trophy, Eye, EyeOff, Pen } from 'lucide-react';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    <div className="min-h-screen bg-yellow-50 font-sans text-gray-800">
      {/* Header - Hidden in Fullscreen to maximize canvas space */}
      <header className={`bg-white shadow-md p-3 sm:p-4 sticky top-0 z-50 ${isFullscreen ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center overflow-x-auto sm:overflow-visible gap-4 pb-1 sm:pb-0 scrollbar-hide">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="p-1.5 sm:p-2 bg-pink-500 rounded-lg sm:rounded-xl text-white">
              <Palette className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-pink-500 tracking-tight flex items-center">
              BabyArtist
              <span className="ml-2 text-xs sm:text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hidden xs:inline">
                - 우리 아이 그림판
              </span>
            </h1>
          </div>

          <nav className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <button
              onClick={() => setView('draw')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold transition-all text-sm sm:text-base whitespace-nowrap ${
                view === 'draw' ? 'bg-pink-100 text-pink-600' : 'text-pink-400 hover:bg-pink-50'
              }`}
            >
              <Palette size={18} /> <span className="hidden xs:inline">Create</span>
            </button>
            <button
              onClick={() => setView('gallery')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold transition-all text-sm sm:text-base whitespace-nowrap ${
                view === 'gallery' ? 'bg-emerald-100 text-emerald-600' : 'text-emerald-500 hover:bg-emerald-50'
              }`}
            >
              <ImageIcon size={18} /> <span className="hidden sm:inline">Gallery</span>
            </button>
            
            <div className="h-8 w-px bg-gray-200 mx-1 sm:mx-2" />

            <button
              onClick={toggleMusic}
              className={`p-1.5 sm:p-3 rounded-full transition-all shadow-md flex items-center gap-2 relative group ${
                isMusicPlaying ? 'bg-yellow-400 text-white' : 'bg-white text-amber-400 border-2 border-amber-100'
              }`}
              title={isMusicPlaying ? 'Stop Music' : 'Play Music'}
            >
              <Music size={20} className={isMusicPlaying ? 'animate-bounce' : ''} />
              <div className="flex flex-col items-start leading-tight">
                <span className="hidden lg:inline font-bold text-sm">
                  {isMusicPlaying ? "Art with Music" : 'Play Music'}
                </span>
                {isMusicPlaying && (
                  <span className="hidden lg:inline text-[10px] font-medium opacity-80">
                    Now: {NURSERY_RHYMES[currentTrackIndex].name}
                  </span>
                )}
              </div>
            </button>

            <div className="h-8 w-px bg-gray-200 mx-1 sm:mx-2" />

            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden lg:block text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Artist</p>
                  <p className="text-xs font-bold">{user.displayName}</p>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-pink-200 flex-shrink-0" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 flex-shrink-0">
                    <UserIcon size={18} />
                  </div>
                )}
                <button
                  onClick={logOut}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={signIn}
                className="flex items-center gap-2 px-3 sm:px-6 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg sm:rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg text-xs sm:text-base whitespace-nowrap"
              >
                <LogIn size={18} /> <span className="hidden sm:inline">Login</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className={`${isFullscreen ? 'fixed inset-0 z-[100] bg-white w-screen h-screen m-0 p-0 max-w-none' : 'max-w-7xl mx-auto p-4 sm:p-8 pb-24'}`}>
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
                    : 'gap-4 sm:gap-6'
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
                  <div className="flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <ActivitySelector 
                        activeActivity={activeActivity} 
                        onActivityChange={setActiveActivity} 
                        activeLevel={activeLevel}
                        onLevelChange={setActiveLevel}
                        onShowChallenge={() => setIsChallengeOpen(true)}
                      />
                    </div>
                    <button
                      onClick={toggleFullscreen}
                      className="flex-shrink-0 flex items-center justify-center p-3 sm:p-4 bg-white border-2 border-blue-200 rounded-xl sm:rounded-2xl font-bold text-blue-500 hover:bg-blue-50 transition-all shadow-md"
                      title="Fullscreen Art Mode"
                    >
                      <Maximize2 size={24} />
                      <span className="hidden sm:inline ml-2">Fullscreen</span>
                    </button>
                  </div>
                )}

                {/* Main Content Areas */}
                <div className={`flex-1 relative ${isFullscreen ? 'h-full w-full' : 'grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8'}`}>
                  {!isFullscreen && (
                    <div className="lg:col-span-1 order-2 lg:order-1 flex flex-col sm:flex-row lg:flex-col gap-4">
                      <div className="flex-1">
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
                      
                      <div className="p-4 sm:p-6 bg-white rounded-3xl shadow-lg border-4 border-pink-400 hidden lg:block">
                        <h3 className="text-base sm:text-lg font-bold text-pink-600 flex items-center gap-2 mb-2">
                          <Heart size={20} /> Fun Tip!
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {activeTool === 'sticker' ? "Pick a sticker and tap the canvas to place it!" : "Draw anything you want! use magic colors!"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className={`${isFullscreen ? 'h-full w-full absolute inset-0' : 'lg:col-span-3 order-1 lg:order-2 h-[50vh] landscape:h-[70vh] sm:h-[60vh] lg:h-auto'} relative`}>
                    <DrawingCanvas
                      color={currentColor}
                      brushSize={brushSize}
                      onSave={handleSaveArtwork}
                      activityType={activeActivity}
                      level={activeLevel}
                      activeTool={activeTool}
                      selectedSticker={selectedSticker}
                      isFullscreen={isFullscreen}
                    />

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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-purple-600 flex items-center gap-3">
                  <ImageIcon size={32} /> Your Gallery
                </h2>
                <p className="text-gray-500 font-bold">
                  {savedArt.length + artworks.length} Masterpieces
                </p>
              </div>

              <div className="sticky top-[4.5rem] z-40 mb-8">
                <FrameSelector selectedFrame={selectedFrame} onSelect={setSelectedFrame} />
              </div>
              
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
                            <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  const newArt = savedArt.filter((_, index) => index !== i);
                                  setSavedArt(newArt);
                                  localStorage.setItem('colorjoy-art', JSON.stringify(newArt));
                                }}
                                className="p-2 bg-red-500 text-white rounded-full border-2 border-slate-800 shadow-md"
                              >
                                <X size={16} />
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

      {/* Footer */}
      <footer className="p-8 text-center text-gray-400 font-medium">
        <p>© 2026 BabyArtist Kids Creative Studio • Made with ❤️ for little artists</p>
      </footer>
    </div>
  );
}
