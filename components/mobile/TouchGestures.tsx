import React, { useEffect, useRef, useCallback } from 'react';
import logger from '../../utils/logger';
import hapticFeedback from '../../utils/hapticFeedback';

// Import mobile utils with error handling
let useMobileUtils: any;
try {
  useMobileUtils = require('../../utils/mobileUtils').useMobileUtils;
} catch (error) {
  useMobileUtils = () => ({ isTouch: true, utils: {} });
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
  velocityX: number;
  velocityY: number;
  lastMoveTime: number;
  isDragging: boolean;
  preventSwipe: boolean;
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
    direction: null,
    velocityX: 0,
    velocityY: 0,
    lastMoveTime: 0,
    isDragging: false,
    preventSwipe: false
  });
  
  // Velocity threshold for distinguishing swipe from scroll
  const VELOCITY_THRESHOLD = 0.5;
  const DIRECTION_THRESHOLD = 5; // pixels before determining direction
  const SCROLL_LOCK_ANGLE = 30; // degrees from vertical to lock as scroll

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || !isTouch) return;
    
    const touches = e.touches;
    const touch = touches[0];
    
    // Check if the target is scrollable
    const target = e.target as HTMLElement;
    const isScrollableElement = target.scrollHeight > target.clientHeight || 
                              target.closest('.scrollable') !== null;
    
    touchState.current = {
      ...touchState.current,
      startX: touch.clientX,
      startY: touch.clientY,
      endX: touch.clientX,
      endY: touch.clientY,
      startTime: Date.now(),
      lastMoveTime: Date.now(),
      touchCount: touches.length,
      isScrolling: false,
      direction: null,
      velocityX: 0,
      velocityY: 0,
      isDragging: false,
      preventSwipe: isScrollableElement
    };

    // Handle pinch start
    if (enablePinch && touches.length === 2) {
      const touch2 = touches[1];
      touchState.current.initialDistance = Math.hypot(
        touch2.clientX - touch.clientX,
        touch2.clientY - touch.clientY
      );
    }

    // Haptic feedback on touch start for gesture recognition
    if (touches.length === 1 && !isScrollableElement) {
      hapticFeedback.light();
    }
    
    logger.debug('Touch start', { 
      touchCount: touches.length, 
      position: { x: touch.clientX, y: touch.clientY } 
    });
  }, [disabled, isTouch, enablePinch]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || !isTouch || touchState.current.preventSwipe) return;
    
    const touches = e.touches;
    const touch = touches[0];
    const now = Date.now();
    
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    const moveDeltaX = touch.clientX - touchState.current.endX;
    const moveDeltaY = touch.clientY - touchState.current.endY;
    const timeDelta = now - touchState.current.lastMoveTime;
    
    // Calculate instantaneous velocity
    if (timeDelta > 0) {
      touchState.current.velocityX = moveDeltaX / timeDelta;
      touchState.current.velocityY = moveDeltaY / timeDelta;
    }
    
    // Determine scroll direction on first significant movement
    if (!touchState.current.direction && 
        (Math.abs(deltaX) > DIRECTION_THRESHOLD || Math.abs(deltaY) > DIRECTION_THRESHOLD)) {
      
      const angle = Math.abs(Math.atan2(deltaY, deltaX) * 180 / Math.PI);
      
      // Check if movement is mostly vertical (within SCROLL_LOCK_ANGLE degrees of vertical)
      if (angle > (90 - SCROLL_LOCK_ANGLE) && angle < (90 + SCROLL_LOCK_ANGLE)) {
        touchState.current.direction = 'vertical';
        touchState.current.isScrolling = true;
        touchState.current.preventSwipe = true;
      } else if (Math.abs(touchState.current.velocityX) > VELOCITY_THRESHOLD) {
        // Only consider horizontal if velocity is significant
        touchState.current.direction = 'horizontal';
        touchState.current.isDragging = true;
        // Prevent default to stop scrolling when swiping horizontally
        if (enableSwipe) {
          e.preventDefault();
        }
      } else {
        // Low velocity horizontal movement - likely scrolling
        touchState.current.direction = 'vertical';
        touchState.current.isScrolling = true;
      }
    }
    
    // Update position tracking
    touchState.current.endX = touch.clientX;
    touchState.current.endY = touch.clientY;
    touchState.current.lastMoveTime = now;

    // Handle pinch
    if (enablePinch && touches.length === 2) {
      const touch2 = touches[1];
      touchState.current.currentDistance = Math.hypot(
        touch2.clientX - touch.clientX,
        touch2.clientY - touch.clientY
      );

      const scale = touchState.current.currentDistance / touchState.current.initialDistance;
      
      if (onPinch) {
        // Haptic feedback for pinch thresholds
        if (Math.abs(scale - 1) > 0.2 && Math.abs(scale - 1) < 0.25) {
          hapticFeedback.selection();
        }
        
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
          hapticFeedback.doubleTap();
          onDoubleTap({
            x: touchState.current.endX,
            y: touchState.current.endY
          });
        }
        logger.debug('Double tap detected');
        return;
      }
      
      touchState.current.lastTap = endTime;
    }

    // Handle swipe with velocity-based detection
    if (enableSwipe && !touchState.current.isScrolling && !touchState.current.preventSwipe) {
      const velocityMagnitude = Math.sqrt(
        touchState.current.velocityX ** 2 + touchState.current.velocityY ** 2
      );
      
      // Check velocity threshold and gesture duration
      if (velocityMagnitude > VELOCITY_THRESHOLD || (duration < 300 && duration > 50)) {
        // Horizontal swipe
        if (absDeltaX >= swipeThreshold && absDeltaX > absDeltaY * 1.5) {
          hapticFeedback.swipe();
          if (deltaX > 0) {
            onSwipeRight && onSwipeRight({ distance: absDeltaX, duration });
            logger.debug('Swipe right detected', { 
              distance: absDeltaX, 
              velocity: touchState.current.velocityX 
            });
          } else {
            onSwipeLeft && onSwipeLeft({ distance: absDeltaX, duration });
            logger.debug('Swipe left detected', { 
              distance: absDeltaX, 
              velocity: touchState.current.velocityX 
            });
          }
        }
        // Vertical swipe (only if explicitly enabled and velocity is high)
        else if (absDeltaY >= swipeThreshold && absDeltaY > absDeltaX * 1.5 && 
                 Math.abs(touchState.current.velocityY) > VELOCITY_THRESHOLD * 1.5) {
          // Additional check to prevent accidental pull-to-refresh
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          
          if (deltaY > 0 && scrollTop === 0) {
            // Only trigger swipe down if not at top of page or velocity is very high
            if (Math.abs(touchState.current.velocityY) > VELOCITY_THRESHOLD * 2) {
              hapticFeedback.swipe();
              onSwipeDown && onSwipeDown({ distance: absDeltaY, duration });
              logger.debug('Swipe down detected', { 
                distance: absDeltaY, 
                velocity: touchState.current.velocityY 
              });
            }
          } else if (deltaY < 0) {
            hapticFeedback.swipe();
            onSwipeUp && onSwipeUp({ distance: absDeltaY, duration });
            logger.debug('Swipe up detected', { 
              distance: absDeltaY, 
              velocity: touchState.current.velocityY 
            });
          }
        }
      }
    }
  }, [disabled, isTouch, enableSwipe, enableDoubleTap, swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap]);

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
        touchAction: disabled ? 'auto' : enableSwipe ? 'pan-y pinch-zoom' : 'manipulation',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {children}
    </div>
  );
};

export default TouchGestures;