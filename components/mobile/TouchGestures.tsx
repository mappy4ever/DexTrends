import React, { useEffect, useRef, useCallback } from 'react';
import logger from '../../utils/logger';

// Import mobile utils with error handling
let useMobileUtils: any;
try {
  useMobileUtils = require('../../utils/mobileUtils').useMobileUtils;
} catch (error) {
  useMobileUtils = () => ({ isTouch: true, utils: { hapticFeedback: () => {} } });
}

interface SwipeEventDetail {
  distance: number;
  duration: number;
}

interface PinchEventDetail {
  scale: number;
  delta: number;
  center: {
    x: number;
    y: number;
  };
}

interface DoubleTapEventDetail {
  x: number;
  y: number;
}

interface TouchGesturesProps {
  children: React.ReactNode;
  onSwipeLeft?: (detail: SwipeEventDetail) => void;
  onSwipeRight?: (detail: SwipeEventDetail) => void;
  onSwipeUp?: (detail: SwipeEventDetail) => void;
  onSwipeDown?: (detail: SwipeEventDetail) => void;
  onPinch?: (detail: PinchEventDetail) => void;
  onDoubleTap?: (detail: DoubleTapEventDetail) => void;
  enableSwipe?: boolean;
  enablePinch?: boolean;
  enableDoubleTap?: boolean;
  swipeThreshold?: number;
  className?: string;
  disabled?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
  touchCount: number;
  lastTap: number;
  initialDistance: number;
  currentDistance: number;
  isScrolling: boolean;
  direction: 'horizontal' | 'vertical' | null;
}

const TouchGestures: React.FC<TouchGesturesProps> = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  onSwipeDown,
  onPinch,
  onDoubleTap,
  enableSwipe = true,
  enablePinch = false,
  enableDoubleTap = false,
  swipeThreshold = 50,
  className = '',
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isTouch, utils } = useMobileUtils();
  
  // Touch tracking
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    startTime: 0,
    touchCount: 0,
    lastTap: 0,
    initialDistance: 0,
    currentDistance: 0,
    isScrolling: false,
    direction: null
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || !isTouch) return;
    
    const touches = e.touches;
    const touch = touches[0];
    
    touchState.current = {
      ...touchState.current,
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      touchCount: touches.length,
      isScrolling: false,
      direction: null
    };

    // Handle pinch start
    if (enablePinch && touches.length === 2) {
      const touch2 = touches[1];
      touchState.current.initialDistance = Math.hypot(
        touch2.clientX - touch.clientX,
        touch2.clientY - touch.clientY
      );
    }

    logger.debug('Touch start', { 
      touchCount: touches.length, 
      position: { x: touch.clientX, y: touch.clientY } 
    });
  }, [disabled, isTouch, enablePinch]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || !isTouch) return;
    
    const touches = e.touches;
    const touch = touches[0];
    
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;

    // Determine scroll direction on first significant movement
    if (!touchState.current.direction && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        touchState.current.direction = 'horizontal';
      } else {
        touchState.current.direction = 'vertical';
        touchState.current.isScrolling = true;
      }
    }

    // Handle pinch
    if (enablePinch && touches.length === 2) {
      const touch2 = touches[1];
      touchState.current.currentDistance = Math.hypot(
        touch2.clientX - touch.clientX,
        touch2.clientY - touch.clientY
      );

      const scale = touchState.current.currentDistance / touchState.current.initialDistance;
      
      if (onPinch) {
        onPinch({
          scale,
          delta: touchState.current.currentDistance - touchState.current.initialDistance,
          center: {
            x: (touch.clientX + touch2.clientX) / 2,
            y: (touch.clientY + touch2.clientY) / 2
          }
        });
      }
    }

    touchState.current.endX = touch.clientX;
    touchState.current.endY = touch.clientY;
  }, [disabled, isTouch, enablePinch, onPinch]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (disabled || !isTouch) return;
    
    const endTime = Date.now();
    const duration = endTime - touchState.current.startTime;
    const deltaX = touchState.current.endX - touchState.current.startX;
    const deltaY = touchState.current.endY - touchState.current.startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Handle double tap
    if (enableDoubleTap && duration < 300 && absDeltaX < 20 && absDeltaY < 20) {
      const timeSinceLastTap = endTime - touchState.current.lastTap;
      
      if (timeSinceLastTap < 500) {
        if (onDoubleTap) {
          onDoubleTap({
            x: touchState.current.endX,
            y: touchState.current.endY
          });
        }
        utils.hapticFeedback('medium');
        logger.debug('Double tap detected');
        return;
      }
      
      touchState.current.lastTap = endTime;
    }

    // Handle swipe
    if (enableSwipe && !touchState.current.isScrolling && duration < 300) {
      // Horizontal swipe
      if (absDeltaX >= swipeThreshold && absDeltaX > absDeltaY * 2) {
        utils.hapticFeedback('light');
        
        if (deltaX > 0) {
          onSwipeRight && onSwipeRight({ distance: absDeltaX, duration });
          logger.debug('Swipe right detected', { distance: absDeltaX });
        } else {
          onSwipeLeft && onSwipeLeft({ distance: absDeltaX, duration });
          logger.debug('Swipe left detected', { distance: absDeltaX });
        }
      }
      // Vertical swipe
      else if (absDeltaY >= swipeThreshold && absDeltaY > absDeltaX * 2) {
        utils.hapticFeedback('light');
        
        if (deltaY > 0) {
          onSwipeDown && onSwipeDown({ distance: absDeltaY, duration });
          logger.debug('Swipe down detected', { distance: absDeltaY });
        } else {
          onSwipeUp && onSwipeUp({ distance: absDeltaY, duration });
          logger.debug('Swipe up detected', { distance: absDeltaY });
        }
      }
    }
  }, [disabled, isTouch, enableSwipe, enableDoubleTap, swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap, utils]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isTouch) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, isTouch]);

  return (
    <div
      ref={containerRef}
      className={`touch-gesture-container ${className}`}
      style={{
        touchAction: disabled ? 'auto' : enableSwipe ? 'pan-y' : 'manipulation'
      }}
    >
      {children}
    </div>
  );
};

export default TouchGestures;