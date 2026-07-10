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

const getPixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);

const getPointerCoordinates = (canvas: HTMLCanvasElement, e: PointerEvent) => {
  const rect = canvas.getBoundingClientRect();
  return {
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top,
  };
};

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
  const containerRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const pixelRatioRef = useRef(getPixelRatio());
  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(false);

  const configRef = useRef({ color, brushSize, activeTool, selectedSticker });

  useEffect(() => {
    configRef.current = { color, brushSize, activeTool, selectedSticker };
    if (isDrawingRef.current && contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize, activeTool, selectedSticker]);

  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

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

  const applyCanvasDimensions = useCallback(
    (width: number, height: number, preserveDrawing = true) => {
      const canvas = canvasRef.current;
      const template = templateRef.current;
      if (!canvas || !template || width <= 0 || height <= 0) return;

      const ratio = pixelRatioRef.current;
      let snapshot: HTMLCanvasElement | null = null;

      if (preserveDrawing && canvas.width > 0 && canvas.height > 0) {
        snapshot = document.createElement('canvas');
        snapshot.width = canvas.width;
        snapshot.height = canvas.height;
        snapshot.getContext('2d')?.drawImage(canvas, 0, 0);
      }

      [canvas, template].forEach((target) => {
        target.width = Math.round(width * ratio);
        target.height = Math.round(height * ratio);
        target.style.width = `${width}px`;
        target.style.height = `${height}px`;
      });

      const context = canvas.getContext('2d');
      if (context) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(ratio, ratio);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;

        if (snapshot) {
          context.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, width, height);
        }
      }

      const templateCtx = template.getContext('2d');
      if (templateCtx) {
        templateCtx.setTransform(1, 0, 0, 1, 0, 0);
        templateCtx.scale(ratio, ratio);
      }

      drawTemplate();
    },
    [drawTemplate],
  );

  const resetDrawingCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    applyCanvasDimensions(parent.clientWidth, parent.clientHeight, false);
  }, [applyCanvasDimensions]);

  const placeSticker = useCallback((e: PointerEvent) => {
    const { activeTool, selectedSticker: sticker } = configRef.current;
    if (activeTool !== 'sticker' || !sticker || !contextRef.current || !canvasRef.current) return;

    const { offsetX, offsetY } = getPointerCoordinates(canvasRef.current, e);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sticker.url;
    img.onload = () => {
      const size = 60;
      contextRef.current?.drawImage(img, offsetX - size / 2, offsetY - size / 2, size, size);
    };
  }, []);

  const startDrawing = useCallback((e: PointerEvent) => {
    if (!canvasRef.current) return;
    const { offsetX, offsetY } = getPointerCoordinates(canvasRef.current, e);
    const { color: currentColor, brushSize: currentSize } = configRef.current;
    const ctx = contextRef.current;

    if (ctx) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
    }

    isDrawingRef.current = true;
    setIsDrawing(true);
  }, []);

  const draw = useCallback((e: PointerEvent) => {
    if (!isDrawingRef.current || !canvasRef.current) return;

    const { activeTool, color: currentColor, brushSize: currentSize } = configRef.current;
    if (activeTool === 'sticker') return;

    const { offsetX, offsetY } = getPointerCoordinates(canvasRef.current, e);
    const ctx = contextRef.current;

    if (ctx) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    }
  }, []);

  const stopDrawing = useCallback(() => {
    if (configRef.current.activeTool === 'pen') {
      contextRef.current?.closePath();
    }
    isDrawingRef.current = false;
    setIsDrawing(false);
  }, []);

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (e.pointerType === 'touch' && e.cancelable) e.preventDefault();
      canvasRef.current?.setPointerCapture(e.pointerId);

      if (configRef.current.activeTool === 'sticker') {
        placeSticker(e);
      } else {
        startDrawing(e);
      }
    },
    [placeSticker, startDrawing],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDrawingRef.current) return;
      if (e.pointerType === 'touch' && e.cancelable) e.preventDefault();
      draw(e);
    },
    [draw],
  );

  const handlePointerEnd = useCallback((e: PointerEvent) => {
    const canvas = canvasRef.current;
    if (canvas?.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    stopDrawing();
  }, [stopDrawing]);

  useEffect(() => {
    resetDrawingCanvas();
  }, [activityType, level, resetDrawingCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const syncCanvasSize = (preserveDrawing = true) => {
      pixelRatioRef.current = getPixelRatio();
      const width = container.clientWidth;
      const height = container.clientHeight;
      applyCanvasDimensions(width, height, preserveDrawing);
    };

    syncCanvasSize(false);

    const resizeObserver = new ResizeObserver(() => {
      syncCanvasSize(true);
    });
    resizeObserver.observe(container);

    const onWindowResize = () => syncCanvasSize(true);
    window.addEventListener('resize', onWindowResize);

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerEnd);
    canvas.addEventListener('pointercancel', handlePointerEnd);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', onWindowResize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerEnd);
      canvas.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, [applyCanvasDimensions, handlePointerDown, handlePointerMove, handlePointerEnd, isFullscreen]);

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
    <div
      ref={containerRef}
      className={`canvas-container w-full h-full relative touch-none ${
        isFullscreen
          ? 'fs-canvas-inner bg-white'
          : 'rounded-[2rem] shadow-2xl overflow-hidden border-2 border-gray-100 bg-white'
      }`}
    >
      {!isFullscreen && (
        <div className="canvas-golden-frame absolute inset-2 sm:inset-4 border-[4px] sm:border-[10px] border-yellow-400 rounded-[0.8rem] sm:rounded-[1.2rem] pointer-events-none z-[998] shadow-sm" />
      )}

      <canvas ref={templateRef} className="absolute inset-0 z-[5] pointer-events-none" />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 z-10 touch-none ${
          activeTool === 'sticker' ? 'cursor-copy' : 'cursor-crosshair'
        }`}
      />

      {isActivityMode && activityHint && (
        <div
          className={`absolute z-[999] pointer-events-none ${
            isFullscreen
              ? 'fs-activity-hint'
              : 'top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4'
          }`}
        >
          <div className="bg-white/95 backdrop-blur-sm border-2 border-blue-200 rounded-xl px-3 py-2 shadow-md max-w-md">
            <p className="text-[10px] sm:text-xs font-black text-blue-700 uppercase tracking-wide mb-0.5">
              {activityType === 'color-by-number' ? 'Color by Number' : 'Shape Match'} · Lvl {level}
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-700">{activityHint}</p>
          </div>
        </div>
      )}

      {colorLegend.length > 0 && (
        <div
          className={`absolute z-[999] pointer-events-auto ${
            isFullscreen ? 'fs-color-legend' : 'bottom-24 left-3 sm:bottom-28 sm:left-4'
          }`}
        >
          <div className="bg-white/95 backdrop-blur-sm border-2 border-pink-200 rounded-xl p-2 shadow-lg">
            <p className="text-[9px] font-black text-pink-600 uppercase mb-1.5 px-1">Color Guide</p>
            <div className="flex flex-wrap gap-1 max-w-[10rem] sm:max-w-none">
              {colorLegend.map(({ number, name, value }) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => onColorChange?.(value)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg hover:bg-pink-50 transition-colors min-h-[44px] sm:min-h-0"
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

      <div
        className={`absolute z-[999] flex gap-2 sm:gap-4 pointer-events-auto ${
          isFullscreen
            ? 'fs-canvas-actions'
            : 'bottom-6 right-6 sm:bottom-12 sm:right-12 lg:bottom-16 lg:right-16'
        }`}
        data-testid="fs-canvas-actions"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClear}
          className="p-3 sm:p-4 lg:p-6 bg-white text-red-500 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-red-100 hover:bg-red-50 transition-all flex items-center justify-center ring-4 ring-white min-w-[44px] min-h-[44px]"
          title="Clear Canvas"
        >
          <Trash2 className="w-6 h-6 sm:w-8 sm:h-8" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSave}
          className="p-3 sm:p-4 lg:p-6 bg-pink-500 text-white rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-pink-600 hover:bg-pink-600 transition-all flex items-center justify-center ring-4 ring-white min-w-[44px] min-h-[44px]"
          title="Save Masterpiece"
        >
          <Save className="w-6 h-6 sm:w-8 sm:h-8" />
        </motion.button>
      </div>
    </div>
  );
};
