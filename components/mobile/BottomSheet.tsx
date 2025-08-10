import React, { useState, useRef, useCallback, useEffect, ReactNode, TouchEvent, MouseEvent } from 'react';
import { motion, AnimatePresence, PanInfo, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useBottomSheet } from './BottomSheet.hooks';
import { useMobileUtils } from '../../utils/mobileUtils';
import logger from '../../utils/logger';
import hapticFeedback from '../../utils/hapticFeedback';

// Re-export hook for backward compatibility
export { useBottomSheet } from './BottomSheet.hooks';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[]; // Snap points as percentage of screen height
  initialSnapPoint?: number;
  allowDrag?: boolean;
  allowBackdropClose?: boolean;
  showHandle?: boolean;
  showHeader?: boolean;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
  maxWidth?: string;
  onSnapPointChange?: (snapPoint: number) => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.3, 0.6, 0.9],
  initialSnapPoint = 0.6,
  allowDrag = true,
  allowBackdropClose = true,
  showHandle = true,
  showHeader = true,
  className = '',
  contentClassName = '',
  overlayClassName = '',
  maxWidth = '100%',
  onSnapPointChange
}) => {
  const { utils } = useMobileUtils();
  const screenSize = utils.screenSize;
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentSnapPoint, setCurrentSnapPoint] = useState(initialSnapPoint);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const [hasReachedThreshold, setHasReachedThreshold] = useState(false);
  const [lastSnapPoint, setLastSnapPoint] = useState(currentSnapPoint);
  
  // Motion values for smooth animations
  const y = useMotionValue(0);
  const handleY = useTransform(y, [0, 100], [0, 8]);
  const handleOpacity = useTransform(y, [0, 50], [0.5, 1]);
  const sheetScale = useTransform(y, [-100, 0, 100], [1.02, 1, 0.98]);

  // Calculate sheet height based on snap point
  const getSheetHeight = useCallback((snapPoint: number) => {
    return screenSize.height * snapPoint;
  }, [screenSize.height]);

  // Get current sheet transform
  const getSheetTransform = useCallback(() => {
    const targetHeight = getSheetHeight(currentSnapPoint);
    const offset = isDragging ? dragOffset : 0;
    const translateY = screenSize.height - targetHeight + offset;
    return Math.max(0, translateY);
  }, [currentSnapPoint, isDragging, dragOffset, getSheetHeight, screenSize.height]);

  // Find nearest snap point
  const findNearestSnapPoint = useCallback((currentHeight: number) => {
    const currentRatio = currentHeight / screenSize.height;
    let nearestPoint = snapPoints[0];
    let minDistance = Math.abs(currentRatio - nearestPoint);

    snapPoints.forEach(point => {
      const distance = Math.abs(currentRatio - point);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    });

    return nearestPoint;
  }, [snapPoints, screenSize.height]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!allowDrag) return;

    const touch = e.touches[0];
    setStartY(touch.clientY);
    setStartHeight(getSheetHeight(currentSnapPoint));
    setIsDragging(true);
    setHasReachedThreshold(false);
    
    // Haptic feedback on drag start
    hapticFeedback.light();
    
    logger.debug('Bottom sheet drag started');
  }, [allowDrag, currentSnapPoint, getSheetHeight]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !allowDrag) return;

    e.preventDefault();
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    const newOffset = Math.max(-startHeight, deltaY);
    
    setDragOffset(newOffset);
    
    // Haptic feedback when crossing snap thresholds
    const currentHeight = startHeight - newOffset;
    const nearestPoint = findNearestSnapPoint(currentHeight);
    
    if (nearestPoint !== lastSnapPoint) {
      hapticFeedback.selection();
      setLastSnapPoint(nearestPoint);
    }
    
    // Haptic feedback when reaching dismiss threshold
    if (newOffset > screenSize.height * 0.3 && !hasReachedThreshold) {
      hapticFeedback.warning();
      setHasReachedThreshold(true);
    }
  }, [isDragging, allowDrag, startY, startHeight, findNearestSnapPoint, lastSnapPoint, screenSize.height, hasReachedThreshold]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !allowDrag) return;

    const currentHeight = startHeight - dragOffset;
    const velocity = Math.abs(dragOffset) / 100; // Simplified velocity calculation
    
    // Determine if user is closing or snapping
    if (dragOffset > 100 && velocity > 0.5) {
      // Fast swipe down - close
      hapticFeedback.success();
      onClose();
    } else if (currentHeight < getSheetHeight(snapPoints[0]) * 0.5) {
      // Dragged below minimum - close
      hapticFeedback.success();
      onClose();
    } else {
      // Snap to nearest point
      const nearestPoint = findNearestSnapPoint(currentHeight);
      if (nearestPoint !== currentSnapPoint) {
        hapticFeedback.medium();
      }
      setCurrentSnapPoint(nearestPoint);
      setLastSnapPoint(nearestPoint);
      
      if (onSnapPointChange) {
        onSnapPointChange(nearestPoint);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    
    logger.debug('Bottom sheet drag ended', { currentSnapPoint });
  }, [isDragging, allowDrag, dragOffset, startHeight, snapPoints, currentSnapPoint, onClose, findNearestSnapPoint, getSheetHeight, onSnapPointChange]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (allowBackdropClose && e.target === e.currentTarget) {
      onClose();
    }
  }, [allowBackdropClose, onClose]);

  // Snap to specific point
  const snapTo = useCallback((point: number) => {
    if (snapPoints.includes(point)) {
      if (point !== currentSnapPoint) {
        hapticFeedback.selection();
      }
      setCurrentSnapPoint(point);
      setLastSnapPoint(point);
      
      if (onSnapPointChange) {
        onSnapPointChange(point);
      }
    }
  }, [snapPoints, onSnapPointChange, currentSnapPoint]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
    return undefined;
  }, [isOpen]);

  const sheetTransform = getSheetTransform();
  
  // Calculate current height as a percentage for framer-motion
  const currentHeight = (1 - currentSnapPoint) * 100;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className={`bottom-sheet-overlay ${overlayClassName}`}
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            className={`bottom-sheet ${className} ${isDragging ? 'dragging' : ''}`}
            style={{
              maxWidth,
              height: `${getSheetHeight(snapPoints[snapPoints.length - 1])}px`,
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1001,
              scale: sheetScale,
              y
            }}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ 
              y: `${currentHeight}%`,
              opacity: 1
            }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 400,
              mass: 0.8,
              opacity: { duration: 0.2 }
            }}
            drag={allowDrag ? "y" : false}
            dragConstraints={{
              top: -getSheetHeight(snapPoints[snapPoints.length - 1]) + 100,
              bottom: 0
            }}
            dragElastic={{
              top: 0.05,
              bottom: 0.3
            }}
            onDragStart={() => {
              setIsDragging(true);
              setHasReachedThreshold(false);
              document.body.style.cursor = 'grabbing';
              hapticFeedback.light();
            }}
            onDrag={(event, info: PanInfo) => {
              setDragOffset(info.offset.y);
              y.set(info.offset.y);
              
              // Haptic feedback when crossing snap thresholds
              const currentHeight = getSheetHeight(currentSnapPoint) - info.offset.y;
              const nearestPoint = findNearestSnapPoint(currentHeight);
              
              if (nearestPoint !== lastSnapPoint) {
                hapticFeedback.selection();
                setLastSnapPoint(nearestPoint);
              }
              
              // Haptic feedback when reaching dismiss threshold
              if (info.offset.y > screenSize.height * 0.3 && !hasReachedThreshold) {
                hapticFeedback.warning();
                setHasReachedThreshold(true);
              }
            }}
            onDragEnd={(event, info: PanInfo) => {
              const velocity = info.velocity.y;
              const offset = info.offset.y;
              document.body.style.cursor = '';
              
              // Enhanced velocity-based dismissal
              if (velocity > 800 || (velocity > 200 && offset > 150)) {
                hapticFeedback.success();
                onClose();
              } else if (offset > screenSize.height * 0.4) {
                hapticFeedback.success();
                onClose();
              } else {
                // Smooth snap to nearest point
                const currentHeight = getSheetHeight(currentSnapPoint) - offset;
                const nearestPoint = findNearestSnapPoint(currentHeight);
                if (nearestPoint !== currentSnapPoint) {
                  hapticFeedback.medium();
                }
                snapTo(nearestPoint);
              }
              setIsDragging(false);
              setDragOffset(0);
              setHasReachedThreshold(false);
              y.set(0);
            }}
          >
        {/* Drag Handle */}
        {showHandle && (
          <motion.div 
            className="bottom-sheet-handle"
            style={{ touchAction: 'none' }}
          >
            <motion.div 
              className="handle-bar"
              style={{
                scaleX: handleY,
                opacity: handleOpacity
              }}
            />
            <motion.div 
              className="handle-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: isDragging ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              Swipe to adjust
            </motion.div>
          </motion.div>
        )}

        {/* Header */}
        {showHeader && (title || showHandle) && (
          <div className="bottom-sheet-header">
            {title && (
              <h3 className="bottom-sheet-title">{title}</h3>
            )}
            
            {/* Snap Point Indicators */}
            <div className="snap-indicators">
              {snapPoints.map((point, index) => (
                <motion.button
                  key={index}
                  onClick={() => snapTo(point)}
                  className={`snap-indicator ${point === currentSnapPoint ? 'active' : ''}`}
                  aria-label={`Snap to ${Math.round(point * 100)}%`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onHoverStart={() => hapticFeedback.light()}
                  onTap={() => hapticFeedback.selection()}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: point === currentSnapPoint ? 1.3 : 1,
                    backgroundColor: point === currentSnapPoint ? '#3b82f6' : '#d1d5db'
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 25
                  }}
                />
              ))}
            </div>
            
            <button
              onClick={() => {
                hapticFeedback.light();
                onClose();
              }}
              className="bottom-sheet-close"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        {/* Content */}
        <div 
          ref={contentRef}
          className={`bottom-sheet-content ${contentClassName}`}
          style={{
            maxHeight: `${getSheetHeight(currentSnapPoint) - (showHeader ? 60 : 0) - (showHandle ? 20 : 0)}px`
          }}
        >
          {children}
        </div>

        {/* Resize Handle for Desktop */}
        <div className="bottom-sheet-resize-handle desktop-only">
          <div className="resize-bar"></div>
        </div>
      </motion.div>

      <style jsx>{`
        .bottom-sheet-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          animation: overlayFadeIn 0.3s ease;
        }

        .bottom-sheet {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px 24px 0 0;
          width: 100%;
          max-width: 100%;
          box-shadow: 
            0 -4px 32px rgba(0, 0, 0, 0.1),
            0 -2px 16px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          display: flex;
          flex-direction: column;
          touch-action: none;
          user-select: none;
          position: relative;
          transform-origin: bottom center;
          will-change: transform;
        }

        .bottom-sheet.dragging {
          box-shadow: 
            0 -8px 48px rgba(0, 0, 0, 0.15),
            0 -4px 24px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          transform: scale(1.01);
        }

        .bottom-sheet-handle {
          display: flex;
          justify-content: center;
          padding: 8px 0 4px;
          cursor: grab;
        }

        .bottom-sheet-handle:active {
          cursor: grabbing;
        }

        .handle-bar {
          width: 40px;
          height: 4px;
          background: rgba(156, 163, 175, 0.4);
          border-radius: 2px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .handle-hint {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
          pointer-events: none;
        }

        .bottom-sheet:hover .handle-bar,
        .bottom-sheet.dragging .handle-bar {
          background: #9ca3af;
          width: 50px;
        }

        .bottom-sheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          flex-shrink: 0;
        }

        .bottom-sheet-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
          flex: 1;
        }

        .snap-indicators {
          display: flex;
          gap: 6px;
          margin: 0 16px;
        }

        .snap-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          background: rgba(209, 213, 219, 0.6);
          cursor: pointer;
          position: relative;
          overflow: visible;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .snap-indicator::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.1);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .snap-indicator:hover::before {
          opacity: 1;
        }

        .snap-indicator:hover {
          background: #9ca3af;
          transform: scale(1.2);
        }

        .snap-indicator.active {
          background: #3b82f6;
          transform: scale(1.3);
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }

        .bottom-sheet-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: #f3f4f6;
          color: #6b7280;
          font-size: 20px;
          font-weight: 300;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .bottom-sheet-close:hover {
          background: #e5e7eb;
          color: #374151;
          transform: scale(1.1);
        }

        .bottom-sheet-content {
          flex: 1;
          overflow-y: auto;
          padding: 0 20px 20px;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }

        .bottom-sheet-resize-handle {
          position: absolute;
          top: -4px;
          left: 0;
          right: 0;
          height: 8px;
          cursor: ns-resize;
          display: none;
        }

        .resize-bar {
          width: 60px;
          height: 3px;
          background: #d1d5db;
          border-radius: 2px;
          margin: 0 auto;
          transition: all 0.2s ease;
        }

        .bottom-sheet-resize-handle:hover .resize-bar {
          background: #9ca3af;
          width: 80px;
        }

        @keyframes overlayFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes sheetSlideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .bottom-sheet {
            background: rgba(31, 41, 55, 0.95);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            box-shadow: 
              0 -4px 32px rgba(0, 0, 0, 0.3),
              0 -2px 16px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }

          .bottom-sheet-header {
            border-bottom-color: #374151;
          }

          .bottom-sheet-title {
            color: white;
          }

          .handle-bar {
            background: #4b5563;
          }

          .bottom-sheet:hover .handle-bar,
          .bottom-sheet.dragging .handle-bar {
            background: #6b7280;
          }

          .snap-indicator {
            background: #4b5563;
          }

          .snap-indicator:hover {
            background: #6b7280;
          }

          .bottom-sheet-close {
            background: #374151;
            color: #9ca3af;
          }

          .bottom-sheet-close:hover {
            background: #4b5563;
            color: #d1d5db;
          }

          .resize-bar {
            background: #4b5563;
          }

          .bottom-sheet-resize-handle:hover .resize-bar {
            background: #6b7280;
          }
        }

        /* Desktop adjustments */
        @media (min-width: 768px) {
          .bottom-sheet {
            max-width: 500px;
            border-radius: 16px;
            margin: 20px;
            animation: sheetScaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .bottom-sheet-overlay {
            align-items: center;
          }

          .bottom-sheet-resize-handle.desktop-only {
            display: block;
          }

          @keyframes sheetScaleIn {
            from {
              transform: scale(0.9);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .bottom-sheet-overlay,
          .bottom-sheet {
            animation: none !important;
          }

          .bottom-sheet {
            transition: none !important;
          }

          .handle-bar,
          .snap-indicator,
          .bottom-sheet-close,
          .resize-bar {
            transition: none !important;
          }

          .snap-indicator:hover,
          .bottom-sheet-close:hover {
            transform: none !important;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .bottom-sheet {
            border: 2px solid currentColor;
          }

          .bottom-sheet-header {
            border-bottom: 2px solid currentColor;
          }

          .handle-bar,
          .snap-indicator,
          .resize-bar {
            border: 1px solid currentColor;
          }
        }
      `}</style>
        </>
      )}
    </AnimatePresence>
  );
};

// Hook for managing bottom sheet state
interface UseBottomSheetReturn {
  isOpen: boolean;
  snapPoint: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setSnapPoint: React.Dispatch<React.SetStateAction<number>>;
}

export default BottomSheet;