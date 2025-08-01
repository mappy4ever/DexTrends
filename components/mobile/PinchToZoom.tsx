import React, { useState, useRef, useCallback, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

interface PinchToZoomProps {
  children: ReactNode;
  minScale?: number;
  maxScale?: number;
  doubleTapScale?: number;
  disabled?: boolean;
  className?: string;
  onZoomChange?: (scale: number) => void;
}

export const PinchToZoom: React.FC<PinchToZoomProps> = ({
  children,
  minScale = 1,
  maxScale = 4,
  doubleTapScale = 2,
  disabled = false,
  className = '',
  onZoomChange
}) => {
  const [scale, setScale] = useState(1);
  const [isZooming, setIsZooming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const lastDistanceRef = useRef<number>(0);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Motion values for smooth animations
  const scaleMotion = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Calculate distance between two touch points
  const getTouchDistance = useCallback((touches: React.TouchList | TouchList) => {
    if (touches.length < 2) return 0;
    
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate center point between two touches
  const getTouchCenter = useCallback((touches: React.TouchList | TouchList) => {
    if (touches.length < 2) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  }, []);

  // Handle pinch gesture
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    
    if (e.touches.length === 2) {
      e.preventDefault();
      setIsZooming(true);
      lastDistanceRef.current = getTouchDistance(e.touches);
      centerRef.current = getTouchCenter(e.touches);
    }
  }, [disabled, getTouchDistance, getTouchCenter]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isZooming || e.touches.length !== 2 || disabled) return;
    
    e.preventDefault();
    
    const currentDistance = getTouchDistance(e.touches);
    const currentCenter = getTouchCenter(e.touches);
    
    if (lastDistanceRef.current > 0) {
      const delta = currentDistance / lastDistanceRef.current;
      const newScale = Math.max(minScale, Math.min(maxScale, scale * delta));
      
      // Calculate pan offset to keep zoom centered
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const offsetX = (currentCenter.x - centerRef.current.x) * (newScale / scale);
        const offsetY = (currentCenter.y - centerRef.current.y) * (newScale / scale);
        
        x.set(x.get() + offsetX);
        y.set(y.get() + offsetY);
      }
      
      setScale(newScale);
      scaleMotion.set(newScale);
      onZoomChange?.(newScale);
    }
    
    lastDistanceRef.current = currentDistance;
    centerRef.current = currentCenter;
  }, [isZooming, disabled, getTouchDistance, getTouchCenter, scale, minScale, maxScale, x, y, scaleMotion, onZoomChange]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setIsZooming(false);
      lastDistanceRef.current = 0;
      
      // Reset to original scale if zoomed out too far
      if (scale < minScale) {
        setScale(minScale);
        scaleMotion.set(minScale);
        x.set(0);
        y.set(0);
        onZoomChange?.(minScale);
      }
    }
  }, [scale, minScale, scaleMotion, x, y, onZoomChange]);

  // Handle double tap to zoom
  const handleDoubleTap = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    
    const currentTime = Date.now();
    const tapDelta = currentTime - lastTapRef.current;
    
    if (tapDelta < 300 && tapDelta > 0) {
      e.preventDefault();
      
      const touch = e.touches[0] || e.changedTouches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      
      if (rect) {
        const newScale = scale === 1 ? doubleTapScale : 1;
        
        if (newScale > 1) {
          // Zoom to tap point
          const offsetX = (rect.width / 2 - (touch.clientX - rect.left)) * (newScale - 1);
          const offsetY = (rect.height / 2 - (touch.clientY - rect.top)) * (newScale - 1);
          
          x.set(offsetX);
          y.set(offsetY);
        } else {
          // Reset position
          x.set(0);
          y.set(0);
        }
        
        setScale(newScale);
        scaleMotion.set(newScale);
        onZoomChange?.(newScale);
      }
    }
    
    lastTapRef.current = currentTime;
  }, [disabled, scale, doubleTapScale, x, y, scaleMotion, onZoomChange]);

  // Zoom indicator
  const showIndicator = scale > 1.1;
  const indicatorOpacity = useTransform(scaleMotion, [1, 1.1, maxScale], [0, 1, 1]);

  return (
    <div
      ref={containerRef}
      className={`pinch-to-zoom-container ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchEndCapture={handleDoubleTap}
    >
      <motion.div
        className="pinch-to-zoom-content"
        drag={scale > 1}
        dragConstraints={{
          left: scale > 1 ? -(scale - 1) * 200 : 0,
          right: scale > 1 ? (scale - 1) * 200 : 0,
          top: scale > 1 ? -(scale - 1) * 200 : 0,
          bottom: scale > 1 ? (scale - 1) * 200 : 0
        }}
        dragElastic={0.1}
        style={{
          scale: scaleMotion,
          x,
          y
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      >
        {children}
      </motion.div>

      {/* Zoom indicator */}
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            className="zoom-indicator"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ scale: 1 }}
            style={{ opacity: indicatorOpacity }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <span className="zoom-value">{Math.round(scale * 100)}%</span>
            <button
              className="zoom-reset"
              onClick={() => {
                setScale(1);
                scaleMotion.set(1);
                x.set(0);
                y.set(0);
                onZoomChange?.(1);
              }}
            >
              Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .pinch-to-zoom-container {
          position: relative;
          overflow: hidden;
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
        }

        .pinch-to-zoom-content {
          transform-origin: center;
          will-change: transform;
          cursor: grab;
        }

        .pinch-to-zoom-content:active {
          cursor: grabbing;
        }

        .zoom-indicator {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          color: white;
          font-size: 12px;
          pointer-events: none;
          z-index: 10;
        }

        .zoom-value {
          font-weight: 500;
        }

        .zoom-reset {
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 11px;
          cursor: pointer;
          pointer-events: auto;
          transition: all 0.2s ease;
        }

        .zoom-reset:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .zoom-reset:active {
          transform: scale(0.95);
        }

        /* Light mode variant */
        @media (prefers-color-scheme: light) {
          .zoom-indicator {
            background: rgba(255, 255, 255, 0.95);
            color: #1f2937;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          }

          .zoom-reset {
            background: rgba(0, 0, 0, 0.08);
            color: #1f2937;
          }

          .zoom-reset:hover {
            background: rgba(0, 0, 0, 0.12);
          }
        }

        /* Touch feedback */
        @media (hover: none) {
          .zoom-reset:active {
            background: rgba(255, 255, 255, 0.4);
          }
        }
      `}</style>
    </div>
  );
};