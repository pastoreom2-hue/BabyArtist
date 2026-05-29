import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { ActivityType, ActivityLevel, Sticker } from '../types';
import { Trash2, Save } from 'lucide-react';
import { drawActivityTemplate, getActivityHint, getColorLegend } from '../activityTemplates';

interface DrawingCanvasProps {
  color: string;
  brushSize: number;
  onSave: (dataUrl: string) => void;
  activityType: ActivityType;
  level: ActivityLevel;
  activeTool: 'pen' | 'sticker';
  selectedSticker: Sticker | null;
  isFullscreen?: boolean;
  onColorChange?: (color: string) => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ 
  color, 
  brushSize, 
  onSave,
  activityType,
  level,
  activeTool,
  selectedSticker,
  isFullscreen,
  onColorChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(false);

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

  const resetDrawingCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.width;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    contextRef.current = ctx;
  }, []);

  const drawTemplate = useCallback(() => {
    const template = templateRef.current;
    const canvas = canvasRef.current;
    if (!template || !canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const width = parent.clientWidth;
    const height = parent.clientHeight;
    const ctx = template.getContext('2d');
    if (!ctx) return;

    if (activityType === 'free-draw') {
      ctx.clearRect(0, 0, template.width, template.height);
      return;
    }

    drawActivityTemplate(ctx, activityType, level, width, height);
  }, [activityType, level]);

  useEffect(() => {
    resetDrawingCanvas();
    drawTemplate();
  }, [activityType, level, resetDrawingCanvas, drawTemplate]);

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
  }, [activityType, level, isFullscreen, drawTemplate, resetDrawingCanvas]);

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
    resetDrawingCanvas();
  };

  const isActivityMode = activityType !== 'free-draw';
  const activityHint = getActivityHint(activityType, level);
  const colorLegend = activityType === 'color-by-number' ? getColorLegend(level === 1 ? 7 : 6) : [];

  const handleSave = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL());
    }
  };

  return (
    <div className="w-full h-full relative bg-white rounded-[2rem] shadow-2xl overflow-hidden border-2 border-gray-100 touch-none">
      <div className="absolute inset-2 sm:inset-4 border-[4px] sm:border-[10px] border-yellow-400 rounded-[0.8rem] sm:rounded-[1.2rem] pointer-events-none z-[998] shadow-sm" />

      <canvas
        ref={templateRef}
        className="absolute inset-0 z-[5] pointer-events-none"
      />
      <canvas
        ref={canvasRef}
        onMouseDown={handleInteraction}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className={`absolute inset-0 z-10 touch-none ${activeTool === 'sticker' ? 'cursor-copy' : 'cursor-crosshair'}`}
      />

      {isActivityMode && activityHint && (
        <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-[999] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm border-2 border-blue-200 rounded-xl px-3 py-2 shadow-md max-w-md">
            <p className="text-[10px] sm:text-xs font-black text-blue-700 uppercase tracking-wide mb-0.5">
              {activityType === 'color-by-number' ? 'Color by Number' : 'Shape Match'} · Lvl {level}
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-700">{activityHint}</p>
          </div>
        </div>
      )}

      {colorLegend.length > 0 && (
        <div className="absolute bottom-24 left-3 sm:bottom-28 sm:left-4 z-[999] pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-sm border-2 border-pink-200 rounded-xl p-2 shadow-lg">
            <p className="text-[9px] font-black text-pink-600 uppercase mb-1.5 px-1">Color Guide</p>
            <div className="flex flex-wrap gap-1 max-w-[10rem] sm:max-w-none">
              {colorLegend.map(({ number, name, value }) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => onColorChange?.(value)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg hover:bg-pink-50 transition-colors"
                  title={`Pick ${name} for #${number}`}
                >
                  <span
                    className="w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center shadow"
                    style={{ backgroundColor: value }}
                  >
                    {number}
                  </span>
                  <span className="text-[9px] font-bold text-gray-600 hidden sm:inline">{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
