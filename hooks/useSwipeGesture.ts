import { useState, useEffect, useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeConfig {
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
  trackTouch?: boolean;
  trackMouse?: boolean;
  rotationAngle?: number;
  swipeDuration?: number;
}

interface SwipeState {
  swiping: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  velocity: number;
  deltaX: number;
  deltaY: number;
}

const defaultConfig: SwipeConfig = {
  threshold: 50,
  preventDefaultTouchmoveEvent: false,
  trackTouch: true,
  trackMouse: false,
  rotationAngle: 0,
  swipeDuration: 250,
};

export function useSwipeGesture(
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
): [SwipeState, (element: HTMLElement | null) => void] {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    swiping: false,
    direction: null,
    velocity: 0,
    deltaX: 0,
    deltaY: 0,
  });

  const elementRef = useRef<HTMLElement | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const handledRef = useRef(false);

  const mergedConfig = { ...defaultConfig, ...config };

  const calculateDirection = useCallback((deltaX: number, deltaY: number) => {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  const handleSwipeEnd = useCallback((deltaX: number, deltaY: number, duration: number) => {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const velocity = Math.max(absX, absY) / duration;

    // Check if swipe exceeds threshold
    if (Math.max(absX, absY) > mergedConfig.threshold! && !handledRef.current) {
      const direction = calculateDirection(deltaX, deltaY);
      
      // Trigger appropriate handler
      switch (direction) {
        case 'left':
          handlers.onSwipeLeft?.();
          break;
        case 'right':
          handlers.onSwipeRight?.();
          break;
        case 'up':
          handlers.onSwipeUp?.();
          break;
        case 'down':
          handlers.onSwipeDown?.();
          break;
      }
      
      handledRef.current = true;
    }

    // Reset state
    setSwipeState({
      swiping: false,
      direction: null,
      velocity: 0,
      deltaX: 0,
      deltaY: 0,
    });
  }, [calculateDirection, handlers, mergedConfig.threshold]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    startXRef.current = clientX;
    startYRef.current = clientY;
    startTimeRef.current = Date.now();
    handledRef.current = false;
    
    setSwipeState({
      swiping: true,
      direction: null,
      velocity: 0,
      deltaX: 0,
      deltaY: 0,
    });
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!startTimeRef.current) return;

    const deltaX = clientX - startXRef.current;
    const deltaY = clientY - startYRef.current;
    const duration = Date.now() - startTimeRef.current;
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / Math.max(duration, 1);
    const direction = calculateDirection(deltaX, deltaY);

    setSwipeState({
      swiping: true,
      direction,
      velocity,
      deltaX,
      deltaY,
    });
  }, [calculateDirection]);

  const handleEnd = useCallback((clientX: number, clientY: number) => {
    if (!startTimeRef.current) return;

    const deltaX = clientX - startXRef.current;
    const deltaY = clientY - startYRef.current;
    const duration = Date.now() - startTimeRef.current;

    handleSwipeEnd(deltaX, deltaY, duration);
    startTimeRef.current = 0;
  }, [handleSwipeEnd]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (!mergedConfig.trackTouch) return;
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!mergedConfig.trackTouch) return;
      if (mergedConfig.preventDefaultTouchmoveEvent) {
        e.preventDefault();
      }
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!mergedConfig.trackTouch) return;
      const touch = e.changedTouches[0];
      handleEnd(touch.clientX, touch.clientY);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!mergedConfig.trackMouse) return;
      handleStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!mergedConfig.trackMouse || !swipeState.swiping) return;
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!mergedConfig.trackMouse) return;
      handleEnd(e.clientX, e.clientY);
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: !mergedConfig.preventDefaultTouchmoveEvent });
    element.addEventListener('touchmove', handleTouchMove, { passive: !mergedConfig.preventDefaultTouchmoveEvent });
    element.addEventListener('touchend', handleTouchEnd);
    
    if (mergedConfig.trackMouse) {
      element.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (mergedConfig.trackMouse) {
        element.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [handleStart, handleMove, handleEnd, mergedConfig, swipeState.swiping]);

  const setElement = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  return [swipeState, setElement];
}

// Simplified hook for common use cases
export function useSwipeNavigation(
  onNext: () => void,
  onPrevious: () => void,
  element?: HTMLElement | null
) {
  const [swipeState, setSwipeElement] = useSwipeGesture({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
  });

  useEffect(() => {
    if (element) {
      setSwipeElement(element);
    }
  }, [element, setSwipeElement]);

  return swipeState;
}