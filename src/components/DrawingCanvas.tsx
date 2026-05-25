import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ActivityType, ActivityLevel, Sticker } from '../types';
import { Trash2, Save } from 'lucide-react';
import { HybridModal } from './HybridModal';

const DAILY_CREDITS_KEY = 'babyartist-daily-credits';
const DEFAULT_DAILY_CREDITS = 0;

interface DrawingCanvasProps {
  color: string;
  brushSize: number;
  onSave: (dataUrl: string) => void;
  activityType: ActivityType;
  level: ActivityLevel;
  activeTool: 'pen' | 'sticker';
  selectedSticker: Sticker | null;
  isFullscreen?: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ 
  color, 
  brushSize, 
  onSave,
  activityType,
  level,
  activeTool,
  selectedSticker,
  isFullscreen
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dailyCredits, setDailyCredits] = useState(() => {
    const stored = localStorage.getItem(DAILY_CREDITS_KEY);
    return stored !== null ? Number(stored) : DEFAULT_DAILY_CREDITS;
  });
  const [isHybridModalOpen, setIsHybridModalOpen] = useState(false);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(DAILY_CREDITS_KEY, String(dailyCredits));
  }, [dailyCredits]);

  // Use refs for configuration to avoid re-binding native listeners and to ensures latest values are used
  const configRef = useRef({ color, brushSize, activeTool, selectedSticker });
  
  useEffect(() => {
    configRef.current = { color, brushSize, activeTool, selectedSticker };
    // Also apply to context immediately if drawing is already in progress
    if (isDrawingRef.current && contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize, activeTool, selectedSticker]);

  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const template = templateRef.current;
    if (!canvas || !template) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        
        [canvas, template].forEach(c => {
          c.width = width * 2;
          c.height = height * 2;
          c.style.width = `${width}px`;
          c.style.height = `${height}px`;
        });

        const context = canvas.getContext('2d');
        if (context) {
          context.scale(2, 2);
          context.lineCap = 'round';
          context.lineJoin = 'round';
          contextRef.current = context;
        }
        drawTemplate();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Native Non-Passive Event Listeners for iPad/Touch stability
    const onTouchStartNative = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      handleInteraction(e as any);
    };
    const onTouchMoveNative = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      draw(e as any);
    };
    const onTouchEndNative = (e: TouchEvent) => {
      stopDrawing();
    };

    canvas.addEventListener('touchstart', onTouchStartNative, { passive: false });
    canvas.addEventListener('touchmove', onTouchMoveNative, { passive: false });
    canvas.addEventListener('touchend', onTouchEndNative, { passive: false });

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('touchstart', onTouchStartNative);
      canvas.removeEventListener('touchmove', onTouchMoveNative);
      canvas.removeEventListener('touchend', onTouchEndNative);
    };
  }, [activityType, level, isFullscreen]);

  const drawTemplate = () => {
    const template = templateRef.current;
    if (!template) return;
    const ctx = template.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, template.width, template.height);
    ctx.save();
    ctx.scale(2, 2);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    const w = template.width / 2;
    const h = template.height / 2;

    if (activityType === 'shape-match') {
      if (level === 1) {
        drawCircle(ctx, w * 0.25, h * 0.5, 50);
        drawSquare(ctx, w * 0.5, h * 0.5, 80);
        drawTriangle(ctx, w * 0.75, h * 0.5, 80);
      } else if (level === 2) {
        drawCircle(ctx, w * 0.2, h * 0.3, 40);
        drawSquare(ctx, w * 0.5, h * 0.3, 60);
        drawTriangle(ctx, w * 0.8, h * 0.3, 60);
        drawStar(ctx, w * 0.35, h * 0.7, 40);
        drawHeart(ctx, w * 0.65, h * 0.7, 40);
      } else {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            drawCircle(ctx, w * (0.25 + i * 0.25), h * (0.25 + j * 0.25), 30);
          }
        }
      }
    } else if (activityType === 'color-by-number') {
      ctx.setLineDash([]);
      ctx.strokeStyle = '#cbd5e1';
      if (level === 1) {
        drawFlower(ctx, w * 0.5, h * 0.5, 100);
      } else if (level === 2) {
        ctx.font = 'bold 120px Outfit';
        ctx.textAlign = 'center';
        ctx.strokeText('A B C', w * 0.5, h * 0.4);
        ctx.strokeText('D E F', w * 0.5, h * 0.7);
      } else {
        drawRainbow(ctx, w * 0.5, h * 0.7, 150);
      }
    }

    ctx.restore();
  };

  const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  };
  const drawSquare = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
    ctx.strokeRect(x - s/2, y - s/2, s, s);
  };
  const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
    ctx.beginPath(); ctx.moveTo(x, y - s/2); ctx.lineTo(x + s/2, y + s/2); ctx.lineTo(x - s/2, y + s/2); ctx.closePath(); ctx.stroke();
  };
  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * r + x, -Math.sin((18 + i * 72) / 180 * Math.PI) * r + y);
      ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * (r/2) + x, -Math.sin((54 + i * 72) / 180 * Math.PI) * (r/2) + y);
    }
    ctx.closePath(); ctx.stroke();
  };
  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y + s/4);
    ctx.bezierCurveTo(x, y, x - s/2, y, x - s/2, y + s/4);
    ctx.bezierCurveTo(x - s/2, y + s/2, x, y + s*0.7, x, y + s);
    ctx.bezierCurveTo(x, y + s*0.7, x + s/2, y + s/2, x + s/2, y + s/4);
    ctx.bezierCurveTo(x + s/2, y, x, y, x, y + s/4);
    ctx.stroke();
  };
  const drawFlower = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      drawCircle(ctx, x + Math.cos(angle) * r/2, y + Math.sin(angle) * r/2, r/3);
    }
    drawCircle(ctx, x, y, r/4);
  };
  const drawRainbow = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.arc(x, y, r - i * 20, Math.PI, 0); ctx.stroke();
    }
  };

  const handleInteraction = (e: any) => {
    if (e.cancelable) e.preventDefault();
    if (configRef.current.activeTool === 'sticker') {
      placeSticker(e);
    } else {
      startDrawing(e);
    }
  };

  const placeSticker = (e: any) => {
    if (e.cancelable) e.preventDefault();
    const { activeTool, selectedSticker } = configRef.current;
    if (!selectedSticker || !contextRef.current) return;
    const { offsetX, offsetY } = getCoordinates(e);
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedSticker.url;
    img.onload = () => {
      const size = 60;
      contextRef.current?.drawImage(img, offsetX - size/2, offsetY - size/2, size, size);
    };
  };

  const startDrawing = (e: any) => {
    if (e.cancelable) e.preventDefault();
    const { offsetX, offsetY } = getCoordinates(e);
    const { color: currentSelectedColor, brushSize: currentSelectedSize } = configRef.current;

    const ctx = contextRef.current;
    if (ctx) {
      ctx.strokeStyle = currentSelectedColor;
      ctx.lineWidth = currentSelectedSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
    }
    isDrawingRef.current = true;
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (e.cancelable) e.preventDefault();
    const { activeTool, color: currentSelectedColor, brushSize: currentSelectedSize } = configRef.current;
    
    if (!isDrawingRef.current || activeTool === 'sticker') return;
    
    const { offsetX, offsetY } = getCoordinates(e);
    const ctx = contextRef.current;
    
    if (ctx) {
      // Re-apply style, width, and caps to be absolutely sure
      ctx.strokeStyle = currentSelectedColor;
      ctx.lineWidth = currentSelectedSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (configRef.current.activeTool === 'pen') {
      contextRef.current?.closePath();
    }
    isDrawingRef.current = false;
    setIsDrawing(false);
  };

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support for both React synthetic events and native DOM events
    const event = (e as any).nativeEvent || e;
    
    if (event instanceof MouseEvent) {
      return { offsetX: event.offsetX, offsetY: event.offsetY };
    } else if (event.touches && event.touches.length > 0) {
      const touch = event.touches[0];
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top
      };
    } else if (event.changedTouches && event.changedTouches.length > 0) {
      const touch = event.changedTouches[0];
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top
      };
    }
    
    return { offsetX: 0, offsetY: 0 };
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas && contextRef.current) {
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSave = () => {
    if (dailyCredits <= 0) {
      setIsHybridModalOpen(true);
      return;
    }

    if (canvasRef.current) {
      setDailyCredits((prev) => prev - 1);
      onSave(canvasRef.current.toDataURL());
    }
  };

  const handleWatchAd = () => {
    setDailyCredits((prev) => prev + 1);
    setIsHybridModalOpen(false);
  };

  const handleBuyVip = () => {
    // TODO: 실제 결제 연동 (Stripe / App Store 등)
    alert('VIP 패스 결제는 곧 지원될 예정이에요!');
  };

  return (
    <div className="w-full h-full relative bg-white rounded-[2rem] shadow-2xl overflow-hidden border-2 border-gray-100 touch-none">
      {/* The Yellow Frame - Responsive thickness */}
      <div className="absolute inset-2 sm:inset-4 border-[4px] sm:border-[10px] border-yellow-400 rounded-[0.8rem] sm:rounded-[1.2rem] pointer-events-none z-[998] shadow-sm" />
      
      <canvas
        ref={templateRef}
        className="absolute inset-0 z-0 pointer-events-none opacity-50"
      />
      <canvas
        ref={canvasRef}
        onMouseDown={handleInteraction}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className={`absolute inset-0 z-10 touch-none ${activeTool === 'sticker' ? 'cursor-copy' : 'cursor-crosshair'}`}
      />
      
      {dailyCredits > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 left-6 sm:top-8 sm:left-8 z-[999] px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border-2 border-pink-200 shadow-md"
        >
          <span className="text-xs sm:text-sm font-black text-pink-600">
            오늘 남은 횟수: {dailyCredits}
          </span>
        </motion.div>
      )}

      <HybridModal
        isOpen={isHybridModalOpen}
        onClose={() => setIsHybridModalOpen(false)}
        onWatchAd={handleWatchAd}
        onBuyVip={handleBuyVip}
      />

      {/* Floating Canvas Controls - Responsive sizing and positioning for iPad/iPhone */}
      <div className="absolute bottom-6 right-6 sm:bottom-12 sm:right-12 lg:bottom-16 lg:right-16 z-[999] flex gap-2 sm:gap-4 pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClear}
          className="p-3 sm:p-4 lg:p-6 bg-white text-red-500 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-red-100 hover:bg-red-50 transition-all flex items-center justify-center ring-4 ring-white"
          title="Clear Canvas"
        >
          <Trash2 className="w-6 h-6 sm:w-8 sm:h-8" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSave}
          className="p-3 sm:p-4 lg:p-6 bg-pink-500 text-white rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-pink-600 hover:bg-pink-600 transition-all flex items-center justify-center ring-4 ring-white"
          title="Save Masterpiece"
        >
          <Save className="w-6 h-6 sm:w-8 sm:h-8" />
        </motion.button>
      </div>
    </div>
  );
};
