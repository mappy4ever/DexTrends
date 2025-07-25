import React, { useRef, useCallback, ReactNode } from 'react';

interface GestureConflictResolverProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  className?: string;
}

/**
 * Gesture Conflict Resolver
 * Intelligently handles gesture conflicts between swipe, scroll, and tap
 * Prevents accidental triggers and improves mobile UX
 */
export const GestureConflictResolver: React.FC<GestureConflictResolverProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  className = ''
}) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isScrollingRef = useRef(false);
  const hasMomentumRef = useRef(false);
  
  // Thresholds
  const SWIPE_THRESHOLD = 50;
  const VELOCITY_THRESHOLD = 0.5;
  const TAP_THRESHOLD = 10;
  const TAP_TIME_THRESHOLD = 200;
  const SCROLL_LOCK_ANGLE = 30; // degrees from vertical
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    isScrollingRef.current = false;
    hasMomentumRef.current = false;
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // Calculate angle of movement
    const angle = Math.abs(Math.atan2(deltaY, deltaX) * 180 / Math.PI);
    
    // Determine if scrolling (mostly vertical movement)
    if (!isScrollingRef.current && Math.abs(deltaY) > 5) {
      if (angle > (90 - SCROLL_LOCK_ANGLE) && angle < (90 + SCROLL_LOCK_ANGLE)) {
        isScrollingRef.current = true;
      }
    }
    
    // Track momentum
    const timeDelta = Date.now() - touchStartRef.current.time;
    const velocity = Math.abs(deltaX) / timeDelta;
    if (velocity > VELOCITY_THRESHOLD) {
      hasMomentumRef.current = true;
    }
  }, []);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const endTime = Date.now();
    
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: endTime
    };
    
    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const deltaTime = endTime - touchStartRef.current.time;
    const velocityX = Math.abs(deltaX) / deltaTime;
    
    // Check for tap
    if (
      Math.abs(deltaX) < TAP_THRESHOLD &&
      Math.abs(deltaY) < TAP_THRESHOLD &&
      deltaTime < TAP_TIME_THRESHOLD &&
      onTap
    ) {
      onTap();
      return;
    }
    
    // Check for swipe (only if not scrolling)
    if (
      !isScrollingRef.current &&
      Math.abs(deltaX) > SWIPE_THRESHOLD &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.5 &&
      (velocityX > VELOCITY_THRESHOLD || hasMomentumRef.current)
    ) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    // Reset refs
    touchStartRef.current = null;
    touchEndRef.current = null;
    isScrollingRef.current = false;
    hasMomentumRef.current = false;
  }, [onSwipeLeft, onSwipeRight, onTap]);
  
  return (
    <div
      className={`gesture-conflict-resolver ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: 'pan-y pinch-zoom'
      }}
    >
      {children}
    </div>
  );
};

export default GestureConflictResolver;