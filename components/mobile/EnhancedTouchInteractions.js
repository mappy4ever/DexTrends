import React, { useState, useRef, useEffect, useCallback } from 'react';
import logger from '../../utils/logger';

/**
 * Enhanced Touch Interactions for Mobile
 * Provides advanced gesture support and haptic feedback
 */

// Touch gesture hook
export const useTouchGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onLongPress,
  onDoubleTap,
  swipeThreshold = 50,
  longPressDelay = 500,
  doubleTapDelay = 300,
  enableHaptics = true
}) => {
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const lastTapRef = useRef(0);
  const gestureStateRef = useRef({
    isLongPressing: false,
    isPinching: false,
    initialDistance: 0,
    initialScale: 1
  });

  // Haptic feedback utility
  const hapticFeedback = useCallback((type = 'light') => {
    if (!enableHaptics || !navigator.vibrate) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [50, 100, 50],
      selection: [5]
    };
    
    navigator.vibrate(patterns[type] || patterns.light);
  }, [enableHaptics]);

  // Calculate distance between two touch points
  const getDistance = useCallback((touch1, touch2) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    const now = Date.now();
    
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    };
    
    touchEndRef.current = null;
    gestureStateRef.current.isLongPressing = false;
    
    // Multi-touch (pinch) detection
    if (e.touches.length === 2) {
      gestureStateRef.current.isPinching = true;
      gestureStateRef.current.initialDistance = getDistance(e.touches[0], e.touches[1]);
      hapticFeedback('light');
    } else if (e.touches.length === 1) {
      // Double tap detection
      const timeSinceLastTap = now - lastTapRef.current;
      if (timeSinceLastTap < doubleTapDelay) {
        e.preventDefault();
        if (onDoubleTap) {
          onDoubleTap(e);
          hapticFeedback('medium');
        }
        lastTapRef.current = 0; // Reset to prevent triple tap
      } else {
        lastTapRef.current = now;
      }
      
      // Long press detection
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          if (touchStartRef.current && !gestureStateRef.current.isLongPressing) {
            gestureStateRef.current.isLongPressing = true;
            onLongPress(e);
            hapticFeedback('heavy');
          }
        }, longPressDelay);
      }
    }
  }, [onDoubleTap, onLongPress, doubleTapDelay, longPressDelay, getDistance, hapticFeedback]);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    
    // Handle pinch gestures
    if (e.touches.length === 2 && gestureStateRef.current.isPinching) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / gestureStateRef.current.initialDistance;
      
      if (onPinch) {
        onPinch({
          scale,
          center: {
            x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
            y: (e.touches[0].clientY + e.touches[1].clientY) / 2
          }
        });
      }
      return;
    }
    
    // Cancel long press if touch moves too much
    if (longPressTimerRef.current) {
      const moveDistance = Math.sqrt(
        Math.pow(touch.clientX - touchStartRef.current.x, 2) +
        Math.pow(touch.clientY - touchStartRef.current.y, 2)
      );
      
      if (moveDistance > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
    
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, [onPinch, getDistance]);

  // Handle touch end
  const handleTouchEnd = useCallback((e) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    gestureStateRef.current.isPinching = false;
    
    if (!touchStartRef.current || !touchEndRef.current) {
      touchStartRef.current = null;
      return;
    }
    
    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const deltaTime = touchEndRef.current.time - touchStartRef.current.time;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // Only trigger swipe if it was fast enough and long enough
    if (deltaTime < 1000 && (absX > swipeThreshold || absY > swipeThreshold)) {
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight(e);
          hapticFeedback('medium');
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft(e);
          hapticFeedback('medium');
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown(e);
          hapticFeedback('medium');
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp(e);
          hapticFeedback('medium');
        }
      }
    }
    
    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, swipeThreshold, hapticFeedback]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    hapticFeedback
  };
};

// Swipeable Card Component
export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onLongPress,
  onDoubleTap,
  className = '',
  swipeThreshold = 100,
  showSwipeHints = true,
  ...props
}) => {
  const [swipeState, setSwipeState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0
  });
  
  const cardRef = useRef(null);
  
  const touchGestures = useTouchGestures({
    onSwipeLeft: (e) => {
      setSwipeState(prev => ({ ...prev, isDragging: false }));
      if (onSwipeLeft) onSwipeLeft(e);
    },
    onSwipeRight: (e) => {
      setSwipeState(prev => ({ ...prev, isDragging: false }));
      if (onSwipeRight) onSwipeRight(e);
    },
    onSwipeUp: (e) => {
      setSwipeState(prev => ({ ...prev, isDragging: false }));
      if (onSwipeUp) onSwipeUp(e);
    },
    onSwipeDown: (e) => {
      setSwipeState(prev => ({ ...prev, isDragging: false }));
      if (onSwipeDown) onSwipeDown(e);
    },
    onLongPress,
    onDoubleTap,
    swipeThreshold
  });

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setSwipeState({
      isDragging: true,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0
    });
    touchGestures.onTouchStart(e);
  };

  const handleTouchMove = (e) => {
    if (!swipeState.isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeState.startX;
    const deltaY = touch.clientY - swipeState.startY;
    
    setSwipeState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX,
      deltaY
    }));
    
    touchGestures.onTouchMove(e);
  };

  const handleTouchEnd = (e) => {
    setSwipeState(prev => ({ ...prev, isDragging: false }));
    touchGestures.onTouchEnd(e);
  };

  // Calculate transform based on swipe
  const getTransform = () => {
    if (!swipeState.isDragging) return 'translate3d(0, 0, 0)';
    
    const { deltaX, deltaY } = swipeState;
    const dampening = 0.3; // Reduce movement for better feel
    
    return `translate3d(${deltaX * dampening}px, ${deltaY * dampening}px, 0)`;
  };

  // Calculate opacity based on swipe distance
  const getOpacity = () => {
    if (!swipeState.isDragging) return 1;
    
    const { deltaX, deltaY } = swipeState;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 200;
    
    return Math.max(0.5, 1 - (distance / maxDistance) * 0.5);
  };

  return (
    <div
      ref={cardRef}
      className={`swipeable-card ${className} ${swipeState.isDragging ? 'dragging' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: getTransform(),
        opacity: getOpacity(),
        transition: swipeState.isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease'
      }}
      {...props}
    >
      {children}
      
      {/* Swipe Hints */}
      {showSwipeHints && (
        <div className="swipe-hints">
          {onSwipeLeft && (
            <div className="swipe-hint left">
              <span>👈</span>
            </div>
          )}
          {onSwipeRight && (
            <div className="swipe-hint right">
              <span>👉</span>
            </div>
          )}
          {onSwipeUp && (
            <div className="swipe-hint up">
              <span>👆</span>
            </div>
          )}
          {onSwipeDown && (
            <div className="swipe-hint down">
              <span>👇</span>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .swipeable-card {
          position: relative;
          touch-action: pan-x pan-y;
          user-select: none;
          -webkit-user-select: none;
          will-change: transform, opacity;
        }
        
        .swipeable-card.dragging {
          z-index: 1000;
        }
        
        .swipe-hints {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .swipeable-card:hover .swipe-hints,
        .swipeable-card.dragging .swipe-hints {
          opacity: 1;
        }
        
        .swipe-hint {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 50%;
          color: white;
          font-size: 1.2rem;
          animation: hint-pulse 2s infinite;
        }
        
        .swipe-hint.left {
          top: 50%;
          left: 10px;
          transform: translateY(-50%);
        }
        
        .swipe-hint.right {
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
        }
        
        .swipe-hint.up {
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .swipe-hint.down {
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        @keyframes hint-pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .swipeable-card {
            transition: none !important;
          }
          
          .swipe-hint {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

// Pull-to-Refresh Component
export const PullToRefresh = ({
  children,
  onRefresh,
  threshold = 80,
  disabled = false,
  className = ''
}) => {
  const [pullState, setPullState] = useState({
    isPulling: false,
    isRefreshing: false,
    startY: 0,
    currentY: 0,
    pullDistance: 0
  });
  
  const containerRef = useRef(null);
  
  const handleTouchStart = (e) => {
    if (disabled || window.scrollY > 0) return;
    
    const touch = e.touches[0];
    setPullState(prev => ({
      ...prev,
      isPulling: true,
      startY: touch.clientY,
      currentY: touch.clientY
    }));
  };
  
  const handleTouchMove = (e) => {
    if (!pullState.isPulling || disabled) return;
    
    const touch = e.touches[0];
    const pullDistance = Math.max(0, touch.clientY - pullState.startY);
    
    if (pullDistance > 0) {
      e.preventDefault();
      setPullState(prev => ({
        ...prev,
        currentY: touch.clientY,
        pullDistance
      }));
    }
  };
  
  const handleTouchEnd = async () => {
    if (!pullState.isPulling || disabled) return;
    
    const { pullDistance } = pullState;
    
    if (pullDistance >= threshold) {
      setPullState(prev => ({ ...prev, isRefreshing: true }));
      
      try {
        if (onRefresh) {
          await onRefresh();
        }
      } finally {
        setPullState({
          isPulling: false,
          isRefreshing: false,
          startY: 0,
          currentY: 0,
          pullDistance: 0
        });
      }
    } else {
      setPullState(prev => ({ ...prev, isPulling: false, pullDistance: 0 }));
    }
  };
  
  const getTransform = () => {
    const { pullDistance, isRefreshing } = pullState;
    if (isRefreshing) return `translateY(${threshold}px)`;
    if (pullDistance > 0) return `translateY(${Math.min(pullDistance * 0.5, threshold)}px)`;
    return 'translateY(0)';
  };
  
  const getRefreshOpacity = () => {
    if (pullState.isRefreshing) return 1;
    return Math.min(pullState.pullDistance / threshold, 1);
  };
  
  return (
    <div
      ref={containerRef}
      className={`pull-to-refresh ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Refresh Indicator */}
      <div 
        className="refresh-indicator">
        style={{
          opacity: getRefreshOpacity(),
          transform: `translateY(${pullState.pullDistance > 0 ? 0 : -threshold}px)`
        }}
      >
        <div className={`refresh-spinner ${pullState.isRefreshing ? 'spinning' : ''}`}>
          <div className="pokeball-refresh">
            <div className="pokeball-half top"></div>
            <div className="pokeball-half bottom"></div>
            <div className="pokeball-center"></div>
          </div>
        </div>
        <div className="refresh-text">
          {pullState.isRefreshing 
            ? 'Refreshing...' 
            : pullState.pullDistance >= threshold 
              ? 'Release to refresh' 
              : 'Pull to refresh'
          }
        </div>
      </div>
      
      {/* Content */}
      <div 
        className="pull-content">
        style={{
          transform: getTransform(),
          transition: pullState.isPulling ? 'none' : 'transform 0.3s ease'
        }}
      >
        {children}
      </div>
      
      <style jsx>{`
        .pull-to-refresh {
          position: relative;
          overflow: hidden;
        }
        
        .refresh-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: ${threshold}px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(to bottom, #f9fafb, #ffffff);
          border-bottom: 1px solid #e5e7eb;
          transition: opacity 0.3s ease, transform 0.3s ease;
          z-index: 10;
        }
        
        .dark .refresh-indicator {
          background: linear-gradient(to bottom, #1f2937, #111827);
          border-bottom-color: #374151;
        }
        
        .refresh-spinner {
          margin-bottom: 0.5rem;
        }
        
        .pokeball-refresh {
          width: 30px;
          height: 30px;
          position: relative;
        }
        
        .spinning .pokeball-refresh {
          animation: pokeball-spin 1s linear infinite;
        }
        
        .pokeball-half {
          width: 30px;
          height: 15px;
          position: absolute;
        }
        
        .pokeball-half.top {
          background: #ef4444;
          border-radius: 30px 30px 0 0;
          top: 0;
        }
        
        .pokeball-half.bottom {
          background: #ffffff;
          border-radius: 0 0 30px 30px;
          bottom: 0;
          border: 2px solid #000000;
          border-top: none;
        }
        
        .pokeball-center {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 10px;
          height: 10px;
          background: #ffffff;
          border: 2px solid #000000;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
        
        .refresh-text {
          font-size: 0.875rem;
          color: #6b7280;
          text-align: center;
        }
        
        .dark .refresh-text {
          color: #9ca3af;
        }
        
        .pull-content {
          will-change: transform;
        }
        
        @keyframes pokeball-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .pull-content,
          .refresh-indicator {
            transition: none !important;
          }
          
          .pokeball-refresh {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default {
  useTouchGestures,
  SwipeableCard,
  PullToRefresh
};