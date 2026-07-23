import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { motion } from 'motion/react';
import { ActivityType, ActivityLevel, Sticker } from '../types';
import { Trash2, Save, Send } from 'lucide-react';
import { drawActivityTemplate, getActivityHint, getColorLegend } from '../activityTemplates';

interface DrawingCanvasProps {
  color: string;
  brushSize: number;
  onSave: (dataUrl: string) => void;
  /** One-touch send — called with current canvas image (no typing). */
  onSend?: (dataUrl: string) => void;
  activityType: ActivityType;
  level: ActivityLevel;
  activeTool: 'pen' | 'sticker';
  selectedSticker: Sticker | null;
  isFullscreen?: boolean;
  onColorChange?: (color: string) => void;
  onDrawingStarted?: () => void;
  onDrawingCleared?: () => void;
  /** Disable send while a send is in progress */
  sendBusy?: boolean;
}

/** Imperative API for fullscreen chrome (save/trash live outside the canvas stacking context). */
export type DrawingCanvasHandle = {
  clear: () => void;
  exportDataUrl: () => string | null;
};

const getPixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);

const getPointerCoordinates = (canvas: HTMLCanvasElement, e: PointerEvent) => {
  const rect = canvas.getBoundingClientRect();
  return {
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top,
  };
};

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(function DrawingCanvas(
  {
    color,
    brushSize,
    onSave,
    onSend,
    activityType,
    level,
    activeTool,
    selectedSticker,
    isFullscreen,
    onColorChange,
    onDrawingStarted,
    onDrawingCleared,
    sendBusy = false,
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const pixelRatioRef = useRef(getPixelRatio());
  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(false);
  const hasStartedDrawingRef = useRef(false);
  const pendingResizeRef = useRef(false);
  const lastSizeRef = useRef({ w: 0, h: 0 });
  const onDrawingStartedRef = useRef(onDrawingStarted);
  onDrawingStartedRef.current = onDrawingStarted;

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
      ctx.clearRect(0, 0, width, height);
      return;
    }

    // Keep activity art inside the white board, clear of HUD / dock chrome
    const insets = isFullscreen
      ? { top: 72, right: 20, bottom: 48, left: 20 }
      : { top: 72, right: 24, bottom: 108, left: 24 };

    drawActivityTemplate(ctx, activityType, level, width, height, insets);
  }, [activityType, level, isFullscreen]);

  const applyCanvasDimensions = useCallback(
    (width: number, height: number, preserveDrawing = true) => {
      const canvas = canvasRef.current;
      const template = templateRef.current;
      if (!canvas || !template || width <= 0 || height <= 0) return;

      const ratio = pixelRatioRef.current;
      const nextW = Math.round(width * ratio);
      const nextH = Math.round(height * ratio);

      // Skip no-op resizes — iPad Safari fires tiny viewport jitters that wipe strokes.
      // Never skip when preserveDrawing is false (trash / activity reset must clear).
      if (
        preserveDrawing &&
        canvas.width === nextW &&
        canvas.height === nextH &&
        canvas.style.width === `${width}px` &&
        canvas.style.height === `${height}px`
      ) {
        return;
      }

      let snapshot: HTMLCanvasElement | null = null;

      if (preserveDrawing && canvas.width > 0 && canvas.height > 0) {
        snapshot = document.createElement('canvas');
        snapshot.width = canvas.width;
        snapshot.height = canvas.height;
        snapshot.getContext('2d')?.drawImage(canvas, 0, 0);
      }

      [canvas, template].forEach((target) => {
        target.width = nextW;
        target.height = nextH;
        target.style.width = `${width}px`;
        target.style.height = `${height}px`;
      });

      const context = canvas.getContext('2d');
      if (context) {
        // Restore in device-pixel space BEFORE scale — more reliable on iPad Safari.
        context.setTransform(1, 0, 0, 1, 0, 0);
        if (snapshot) {
          context.drawImage(
            snapshot,
            0,
            0,
            snapshot.width,
            snapshot.height,
            0,
            0,
            nextW,
            nextH,
          );
        }
        context.scale(ratio, ratio);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;
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

  const notifyDrawingStarted = useCallback(() => {
    if (hasStartedDrawingRef.current) return;
    hasStartedDrawingRef.current = true;
    onDrawingStartedRef.current?.();
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
    notifyDrawingStarted();
  }, [notifyDrawingStarted]);

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
      notifyDrawingStarted();
    };
  }, [notifyDrawingStarted]);

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

    // Apply any resize that was deferred mid-stroke (prevents wipe + shake on iPad).
    if (pendingResizeRef.current && containerRef.current) {
      pendingResizeRef.current = false;
      const { clientWidth: width, clientHeight: height } = containerRef.current;
      applyCanvasDimensions(width, height, true);
      lastSizeRef.current = { w: width, h: height };
    }
  }, [applyCanvasDimensions]);

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      // Block scroll/zoom steal so iPad doesn't bounce the page mid-stroke.
      if (e.cancelable) e.preventDefault();
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
      if (e.cancelable) e.preventDefault();
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
      if (width <= 0 || height <= 0) return;

      // Ignore sub-pixel / 1px jitter from iPad visual viewport chrome.
      const prev = lastSizeRef.current;
      if (
        preserveDrawing &&
        prev.w > 0 &&
        Math.abs(prev.w - width) < 2 &&
        Math.abs(prev.h - height) < 2
      ) {
        return;
      }

      // Never reset the bitmap while the finger/pencil is down.
      if (isDrawingRef.current) {
        pendingResizeRef.current = true;
        return;
      }

      applyCanvasDimensions(width, height, preserveDrawing);
      lastSizeRef.current = { w: width, h: height };
    };

    syncCanvasSize(false);

    const resizeObserver = new ResizeObserver(() => {
      syncCanvasSize(true);
    });
    resizeObserver.observe(container);

    const onWindowResize = () => syncCanvasSize(true);
    window.addEventListener('resize', onWindowResize);
    // iPad Safari: visual viewport changes when bars show/hide — don't thrash canvas.
    const onVvResize = () => {
      if (isDrawingRef.current) {
        pendingResizeRef.current = true;
        return;
      }
      // Only sync if container box actually changed; ignore pure visualViewport jitter.
      syncCanvasSize(true);
    };
    window.visualViewport?.addEventListener('resize', onVvResize);

    canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
    canvas.addEventListener('pointermove', handlePointerMove, { passive: false });
    canvas.addEventListener('pointerup', handlePointerEnd);
    // Don't treat cancel as instantly fatal for size — still end the stroke cleanly.
    canvas.addEventListener('pointercancel', handlePointerEnd);
    canvas.addEventListener('lostpointercapture', handlePointerEnd);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', onWindowResize);
      window.visualViewport?.removeEventListener('resize', onVvResize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerEnd);
      canvas.removeEventListener('pointercancel', handlePointerEnd);
      canvas.removeEventListener('lostpointercapture', handlePointerEnd);
    };
  }, [applyCanvasDimensions, handlePointerDown, handlePointerMove, handlePointerEnd, isFullscreen]);

  const handleClear = useCallback(() => {
    hasStartedDrawingRef.current = false;
    isDrawingRef.current = false;
    setIsDrawing(false);
    pendingResizeRef.current = false;
    onDrawingCleared?.();

    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (canvas && ctx) {
      // Explicit wipe in device pixels so trash works even if size is unchanged.
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    resetDrawingCanvas();
  }, [onDrawingCleared, resetDrawingCanvas]);

  const isActivityMode = activityType !== 'free-draw';
  const activityHint = getActivityHint(activityType, level);
  const colorLegend = activityType === 'color-by-number' ? getColorLegend(level === 1 ? 7 : 6) : [];

  const handleSave = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL());
    }
  };

  const handleSend = () => {
    if (sendBusy || !onSend || !canvasRef.current) return;
    onSend(canvasRef.current.toDataURL());
  };

  useImperativeHandle(
    ref,
    () => ({
      clear: handleClear,
      exportDataUrl: () => canvasRef.current?.toDataURL() ?? null,
    }),
    [handleClear],
  );

  return (
    <div
      ref={containerRef}
      className={`canvas-container w-full h-full relative touch-none overflow-hidden ${
        isFullscreen
          ? 'fs-canvas-inner bg-white'
          : 'rounded-[2rem] shadow-2xl border-2 border-gray-100 bg-white'
      }`}
      data-testid="drawing-canvas"
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

      <div className={`canvas-hud${isFullscreen ? '' : ' canvas-hud--framed'}`} data-testid="canvas-hud">
        {isActivityMode && activityHint && (
          <div className="canvas-hud__hint" data-testid="canvas-activity-hint">
            <div className="canvas-hud-card canvas-hud-card--hint">
              <p className="canvas-hud-card__eyebrow">
                {activityType === 'color-by-number' ? 'Color by Number' : 'Shape Match'} · Lvl {level}
              </p>
              <p className="canvas-hud-card__text">{activityHint}</p>
            </div>
          </div>
        )}

        {colorLegend.length > 0 && (
          <div className="canvas-hud__legend" data-testid="canvas-color-legend">
            <div className="canvas-hud-card canvas-hud-card--legend">
              <p className="canvas-hud-card__eyebrow canvas-hud-card__eyebrow--pink">Color Guide</p>
              <div className="canvas-hud-legend-row">
                {colorLegend.map(({ number, name, value }) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => onColorChange?.(value)}
                    className="canvas-hud-swatch"
                    title={`Pick ${name} for #${number}`}
                    aria-label={`Pick ${name} for number ${number}`}
                  >
                    <span className="canvas-hud-swatch__dot" style={{ backgroundColor: value }}>
                      {number}
                    </span>
                    <span className="canvas-hud-swatch__name">{name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* In fullscreen, save/send/trash render in fs-board__ui (above the dock stacking context). */}
        {!isFullscreen && (
          <div className="canvas-hud__actions" data-testid="fs-canvas-actions">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleClear}
              className="canvas-hud-action canvas-hud-action--trash"
              title="Clear Canvas"
              type="button"
            >
              <Trash2 className="canvas-hud-action__icon" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleSave}
              className="canvas-hud-action canvas-hud-action--save"
              title="Save Masterpiece"
              type="button"
            >
              <Save className="canvas-hud-action__icon" />
            </motion.button>
            {onSend && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleSend}
                disabled={sendBusy}
                className="canvas-hud-action canvas-hud-action--send"
                title="Send to Family"
                aria-label="Send to Family"
                type="button"
                data-testid="canvas-send-btn"
              >
                <Send className="canvas-hud-action__icon" strokeWidth={2.6} />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
