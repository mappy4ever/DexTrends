/**
 * Mobile Experience Optimization Utilities
 * 
 * Enhances touch interactions, haptic feedback, and mobile-specific optimizations
 */

import { useEffect, useCallback, useRef } from 'react';

// Minimum touch target size for accessibility (WCAG 2.1)
export const MIN_TOUCH_TARGET = 44;

/**
 * Haptic Feedback Support
 */
export const hapticFeedback = {
  // Light haptic for selections
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  // Medium haptic for actions
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },
  
  // Strong haptic for important actions
  strong: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30]);
    }
  },
  
  // Success pattern
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 20, 10]);
    }
  },
  
  // Error pattern
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 10, 50, 10, 50]);
    }
  },
  
  // Custom pattern
  custom: (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
};

/**
 * Touch-optimized event handlers
 */
export const useTouchOptimized = (
  onTap?: () => void,
  onLongPress?: () => void,
  options?: {
    haptic?: boolean;
    longPressDelay?: number;
    preventScroll?: boolean;
  }
) => {
  const longPressTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const isTouchMove = useRef(false);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isTouchMove.current = false;
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    
    if (options?.preventScroll) {
      e.preventDefault();
    }
    
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        if (!isTouchMove.current) {
          if (options?.haptic) {
            hapticFeedback.medium();
          }
          onLongPress();
        }
      }, options?.longPressDelay || 500);
    }
  }, [onLongPress, options]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const moveThreshold = 10;
    const deltaX = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
    
    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      isTouchMove.current = true;
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    }
  }, []);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    if (!isTouchMove.current && onTap) {
      if (options?.haptic) {
        hapticFeedback.light();
      }
      onTap();
    }
  }, [onTap, options]);
  
  const handleTouchCancel = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel
  };
};

/**
 * Ensure minimum touch target size
 */
export const touchTargetStyles = (size: number = MIN_TOUCH_TARGET) => ({
  minWidth: `${size}px`,
  minHeight: `${size}px`,
  position: 'relative' as const,
  '::before': {
    content: '""',
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: `${Math.max(size, MIN_TOUCH_TARGET)}px`,
    height: `${Math.max(size, MIN_TOUCH_TARGET)}px`,
    zIndex: -1
  }
});

/**
 * Touch-friendly CSS classes
 */
export const touchClasses = {
  // Minimum touch target
  target: 'min-w-[44px] min-h-[44px] relative',
  
  // Touch-optimized button
  button: 'min-w-[44px] min-h-[44px] tap-highlight-transparent active:scale-95 transition-transform',
  
  // Touch-optimized link
  link: 'inline-block min-w-[44px] min-h-[44px] py-2 px-3 -my-2 -mx-3',
  
  // Disable touch callout
  noCallout: 'touch-callout-none',
  
  // Smooth scrolling
  smoothScroll: 'scroll-smooth overflow-y-auto -webkit-overflow-scrolling-touch',
  
  // Prevent text selection
  noSelect: 'select-none user-select-none',
  
  // Fast tap response
  fastTap: 'touch-manipulation'
};

/**
 * Detect touch device
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

/**
 * Swipe gesture detection
 */
export const useSwipeGesture = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold: number = 50
) => {
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        hapticFeedback.light();
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        hapticFeedback.light();
        onSwipeLeft();
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
      if (deltaY > 0 && onSwipeDown) {
        hapticFeedback.light();
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        hapticFeedback.light();
        onSwipeUp();
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

/**
 * Pinch zoom gesture
 */
export const usePinchZoom = (
  onZoomIn?: () => void,
  onZoomOut?: () => void
) => {
  const initialDistance = useRef(0);
  
  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistance.current = getDistance(e.touches);
    }
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance.current > 0) {
      const currentDistance = getDistance(e.touches);
      const delta = currentDistance - initialDistance.current;
      
      if (Math.abs(delta) > 30) {
        if (delta > 0 && onZoomIn) {
          hapticFeedback.light();
          onZoomIn();
        } else if (delta < 0 && onZoomOut) {
          hapticFeedback.light();
          onZoomOut();
        }
        initialDistance.current = currentDistance;
      }
    }
  }, [onZoomIn, onZoomOut]);
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove
  };
};

/**
 * Prevent bounce scrolling on iOS
 */
export const preventBounceScroll = () => {
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const scrollable = target.closest('.scroll-container');
      
      if (!scrollable) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
};

/**
 * CSS for mobile optimizations
 */
export const mobileCSS = `
  /* Remove tap highlight */
  .tap-highlight-transparent {
    -webkit-tap-highlight-color: transparent;
  }
  
  /* Disable touch callout */
  .touch-callout-none {
    -webkit-touch-callout: none;
  }
  
  /* Fast tap */
  .touch-manipulation {
    touch-action: manipulation;
  }
  
  /* Smooth momentum scrolling */
  .momentum-scroll {
    -webkit-overflow-scrolling: touch;
    overflow-y: scroll;
  }
  
  /* Minimum touch targets */
  .touch-target::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 44px;
    min-height: 44px;
  }
`;

export default {
  hapticFeedback,
  useTouchOptimized,
  touchTargetStyles,
  touchClasses,
  isTouchDevice,
  useSwipeGesture,
  usePinchZoom,
  preventBounceScroll,
  MIN_TOUCH_TARGET,
  mobileCSS
};