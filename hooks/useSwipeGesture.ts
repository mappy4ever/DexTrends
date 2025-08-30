import { useEffect, useRef } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeOptions {
  threshold?: number; // Minimum distance for swipe
  velocity?: number; // Minimum velocity for swipe
  preventDefault?: boolean;
  trackMouse?: boolean; // Also track mouse for testing
}

/**
 * Hook for handling swipe gestures
 * Works on touch devices without any device detection
 */
export function useSwipeGesture(
  elementRef: React.RefObject<HTMLElement | null>,
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
) {
  const {
    threshold = 50,
    velocity = 0.3,
    preventDefault = true,
    trackMouse = false
  } = options;

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartTime.current) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;
      const deltaTime = touchEndTime - touchStartTime.current;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const velocityX = absX / deltaTime;
      const velocityY = absY / deltaTime;

      // Horizontal swipe
      if (absX > absY && absX > threshold && velocityX > velocity) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
        if (preventDefault) e.preventDefault();
      }
      // Vertical swipe
      else if (absY > absX && absY > threshold && velocityY > velocity) {
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
        if (preventDefault) e.preventDefault();
      }

      // Reset
      touchStartX.current = 0;
      touchStartY.current = 0;
      touchStartTime.current = 0;
    };

    // Mouse events for testing
    const handleMouseDown = (e: MouseEvent) => {
      if (!trackMouse) return;
      touchStartX.current = e.clientX;
      touchStartY.current = e.clientY;
      touchStartTime.current = Date.now();
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!trackMouse || !touchStartTime.current) return;

      const deltaX = e.clientX - touchStartX.current;
      const deltaY = e.clientY - touchStartY.current;
      const deltaTime = Date.now() - touchStartTime.current;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const velocityX = absX / deltaTime;
      const velocityY = absY / deltaTime;

      if (absX > absY && absX > threshold && velocityX > velocity) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      } else if (absY > absX && absY > threshold && velocityY > velocity) {
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }

      touchStartX.current = 0;
      touchStartY.current = 0;
      touchStartTime.current = 0;
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault });
    
    if (trackMouse) {
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (trackMouse) {
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [elementRef, handlers, threshold, velocity, preventDefault, trackMouse]);
}