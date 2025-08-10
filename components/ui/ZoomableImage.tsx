import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import TouchGestures from '../mobile/TouchGestures';
import OptimizedImage from './OptimizedImage';
import { FaTimes, FaExpand, FaCompress } from 'react-icons/fa';

interface ZoomableImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: (error: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  enableZoom?: boolean;
  maxZoom?: number;
  minZoom?: number;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  onLoad,
  onError,
  enableZoom = true,
  maxZoom = 3,
  minZoom = 1
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle double tap to open zoom modal
  const handleDoubleTap = useCallback(() => {
    if (enableZoom) {
      setIsZoomed(true);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [enableZoom]);

  // Handle pinch zoom
  const handlePinch = useCallback((detail: { scale: number; delta: number; center: { x: number; y: number } }) => {
    if (!isZoomed) return;
    
    const newScale = Math.max(minZoom, Math.min(maxZoom, detail.scale));
    setScale(newScale);
  }, [isZoomed, minZoom, maxZoom]);

  // Handle close
  const handleClose = useCallback(() => {
    setIsZoomed(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(maxZoom, prev + 0.5));
  }, [maxZoom]);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(minZoom, prev - 0.5));
  }, [minZoom]);

  // Handle pan gesture
  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    if (!isZoomed || scale === 1) return;
    
    setPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  }, [isZoomed, scale]);

  return (
    <>
      {/* Regular image with double tap to zoom */}
      <TouchGestures
        onDoubleTap={handleDoubleTap}
        enableDoubleTap={enableZoom}
        className={className}
      >
        <div className="relative group">
          <OptimizedImage
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            priority={priority}
            onLoad={onLoad}
            onError={onError}
          />
          
          {/* Zoom indicator on hover */}
          {enableZoom && (
            <div className="absolute top-2 right-2 p-2 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <FaExpand className="w-3 h-3" />
            </div>
          )}
        </div>
      </TouchGestures>

      {/* Zoom Modal */}
      {isZoomed && createPortal(
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 z-[9999] bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
              onClick={handleClose}
              aria-label="Close zoom"
            >
              <FaTimes className="w-6 h-6" />
            </button>

            {/* Zoom controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              <button
                className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors disabled:opacity-50"
                onClick={handleZoomOut}
                disabled={scale <= minZoom}
                aria-label="Zoom out"
              >
                <FaCompress className="w-5 h-5" />
              </button>
              
              <div className="px-4 py-3 bg-white/20 text-white rounded-full flex items-center">
                <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
              </div>
              
              <button
                className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors disabled:opacity-50"
                onClick={handleZoomIn}
                disabled={scale >= maxZoom}
                aria-label="Zoom in"
              >
                <FaExpand className="w-5 h-5" />
              </button>
            </div>

            {/* Zoomed image with touch gestures */}
            <TouchGestures
              onPinch={handlePinch}
              enablePinch
              className="w-full h-full flex items-center justify-center"
            >
              <motion.div
                ref={modalRef}
                className="relative"
                animate={{
                  scale,
                  x: position.x,
                  y: position.y
                }}
                drag={scale > 1}
                dragElastic={0.1}
                dragMomentum={false}
                onDrag={(e, info) => {
                  setPosition({
                    x: info.offset.x,
                    y: info.offset.y
                  });
                }}
                transition={{
                  scale: { type: "spring", stiffness: 300, damping: 30 },
                  default: { type: "tween", duration: 0 }
                }}
                style={{
                  cursor: scale > 1 ? 'move' : 'default'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={src}
                  alt={alt}
                  className="max-w-[90vw] max-h-[90vh] object-contain"
                  draggable={false}
                />
                
                {/* Visual feedback for pinch */}
                <AnimatePresence>
                  {scale > 1 && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="absolute inset-0 border-4 border-white/30 rounded-lg" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </TouchGestures>

            {/* Instructions */}
            <motion.div
              className="absolute top-20 left-1/2 -translate-x-1/2 text-white text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm opacity-75">
                {scale === 1 ? 'Pinch to zoom • Double tap to close' : 'Drag to pan • Pinch to zoom'}
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default ZoomableImage;