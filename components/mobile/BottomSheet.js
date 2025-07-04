import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMobileUtils } from '../../utils/mobileUtils';
import logger from '../../utils/logger';

const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.3, 0.6, 0.9], // Snap points as percentage of screen height
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
  const { utils, screenSize } = useMobileUtils();
  const sheetRef = useRef(null);
  const contentRef = useRef(null);
  const [currentSnapPoint, setCurrentSnapPoint] = useState(initialSnapPoint);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);

  // Calculate sheet height based on snap point
  const getSheetHeight = useCallback((snapPoint) => {
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
  const findNearestSnapPoint = useCallback((currentHeight) => {
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
  const handleTouchStart = useCallback((e) => {
    if (!allowDrag) return;

    const touch = e.touches[0];
    setStartY(touch.clientY);
    setStartHeight(getSheetHeight(currentSnapPoint));
    setIsDragging(true);
    
    utils.hapticFeedback('light');
    logger.debug('Bottom sheet drag started');
  }, [allowDrag, currentSnapPoint, getSheetHeight, utils]);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !allowDrag) return;

    e.preventDefault();
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    const newOffset = Math.max(-startHeight, deltaY);
    
    setDragOffset(newOffset);
  }, [isDragging, allowDrag, startY, startHeight]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !allowDrag) return;

    const currentHeight = startHeight - dragOffset;
    const velocity = Math.abs(dragOffset) / 100; // Simplified velocity calculation
    
    // Determine if user is closing or snapping
    if (dragOffset > 100 && velocity > 0.5) {
      // Fast swipe down - close
      onClose();
    } else if (currentHeight < getSheetHeight(snapPoints[0]) * 0.5) {
      // Dragged below minimum - close
      onClose();
    } else {
      // Snap to nearest point
      const nearestPoint = findNearestSnapPoint(currentHeight);
      setCurrentSnapPoint(nearestPoint);
      
      if (onSnapPointChange) {
        onSnapPointChange(nearestPoint);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    utils.hapticFeedback('medium');
    
    logger.debug('Bottom sheet drag ended', { currentSnapPoint });
  }, [isDragging, allowDrag, dragOffset, startHeight, snapPoints, currentSnapPoint, onClose, findNearestSnapPoint, getSheetHeight, onSnapPointChange, utils]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (allowBackdropClose && e.target === e.currentTarget) {
      onClose();
    }
  }, [allowBackdropClose, onClose]);

  // Snap to specific point
  const snapTo = useCallback((point) => {
    if (snapPoints.includes(point)) {
      setCurrentSnapPoint(point);
      utils.hapticFeedback('light');
      
      if (onSnapPointChange) {
        onSnapPointChange(point);
      }
    }
  }, [snapPoints, utils, onSnapPointChange]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const sheetTransform = getSheetTransform();

  return (
    <div 
      className={`bottom-sheet-overlay ${overlayClassName}`}
      onClick={handleBackdropClick}
    >
      <div
        ref={sheetRef}
        className={`bottom-sheet ${className} ${isDragging ? 'dragging' : ''}`}
        style={{
          transform: `translateY(${sheetTransform}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          maxWidth,
          height: `${getSheetHeight(snapPoints[snapPoints.length - 1])}px`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        {showHandle && (
          <div className="bottom-sheet-handle">
            <div className="handle-bar"></div>
          </div>
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
                <button
                  key={index}
                  onClick={() => snapTo(point)}
                  className={`snap-indicator ${point === currentSnapPoint ? 'active' : ''}`}
                  aria-label={`Snap to ${Math.round(point * 100)}%`}
                />
              ))}
            </div>
            
            <button
              onClick={onClose}
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
      </div>

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
          background: white;
          border-radius: 16px 16px 0 0;
          width: 100%;
          max-width: 100%;
          box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          touch-action: none;
          user-select: none;
          position: relative;
          animation: sheetSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bottom-sheet.dragging {
          box-shadow: 0 -8px 48px rgba(0, 0, 0, 0.3);
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
          background: #d1d5db;
          border-radius: 2px;
          transition: all 0.2s ease;
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
          background: #d1d5db;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .snap-indicator:hover {
          background: #9ca3af;
          transform: scale(1.2);
        }

        .snap-indicator.active {
          background: #3b82f6;
          transform: scale(1.3);
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
            background: #1f2937;
            color: white;
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
    </div>
  );
};

// Hook for managing bottom sheet state
export const useBottomSheet = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [snapPoint, setSnapPoint] = useState(0.6);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    snapPoint,
    open,
    close,
    toggle,
    setSnapPoint
  };
};

export default BottomSheet;