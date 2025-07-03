import React, { useRef, useCallback, useState } from 'react';
import { useMobileUtils } from '../../utils/mobileUtils';
import logger from '../../utils/logger';

const EnhancedSwipeGestures = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  onSwipeDown,
  onPinchZoom,
  onDoubleTap,
  onLongPress,
  enableSwipe = true,
  enablePinch = false,
  enableDoubleTap = false,
  enableLongPress = false,
  swipeThreshold = 50,
  velocityThreshold = 0.3,
  className = '',
  disabled = false,
  showSwipeIndicators = true
}) => {
  const containerRef = useRef(null);
  const { isTouch, utils } = useMobileUtils();
  const [swipeState, setSwipeState] = useState({
    isActive: false,
    direction: null,
    progress: 0
  });
  
  // Enhanced touch tracking
  const touchState = useRef({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    endX: 0,
    endY: 0,
    startTime: 0,
    endTime: 0,
    touchCount: 0,
    lastTap: 0,
    longPressTimer: null,
    initialDistance: 0,
    currentDistance: 0,
    isScrolling: false,
    direction: null,
    velocity: { x: 0, y: 0 },
    hasTriggered: false
  });

  const calculateVelocity = useCallback((deltaX, deltaY, deltaTime) => {
    if (deltaTime === 0) return { x: 0, y: 0 };
    return {
      x: Math.abs(deltaX) / deltaTime,
      y: Math.abs(deltaY) / deltaTime
    };
  }, []);

  const updateSwipeIndicator = useCallback((direction, progress) => {
    if (!showSwipeIndicators) return;
    
    setSwipeState({
      isActive: progress > 0,
      direction,
      progress: Math.min(progress, 100)
    });
  }, [showSwipeIndicators]);

  const handleTouchStart = useCallback((e) => {
    if (disabled || !isTouch) return;
    
    const touches = e.touches;
    const touch = touches[0];
    
    touchState.current = {
      ...touchState.current,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: Date.now(),
      touchCount: touches.length,
      isScrolling: false,
      direction: null,
      hasTriggered: false
    };

    // Handle pinch start
    if (enablePinch && touches.length === 2) {
      const touch2 = touches[1];
      touchState.current.initialDistance = Math.hypot(
        touch2.clientX - touch.clientX,
        touch2.clientY - touch.clientY
      );
    }

    // Long press detection
    if (enableLongPress) {
      touchState.current.longPressTimer = setTimeout(() => {
        if (!touchState.current.hasTriggered) {
          utils.hapticFeedback('heavy');
          onLongPress && onLongPress({
            x: touch.clientX,
            y: touch.clientY
          });
          touchState.current.hasTriggered = true;
          logger.debug('Long press detected');
        }
      }, 500);
    }

    logger.debug('Enhanced touch start', { 
      touchCount: touches.length, 
      position: { x: touch.clientX, y: touch.clientY } 
    });
  }, [disabled, isTouch, enablePinch, enableLongPress, onLongPress, utils]);

  const handleTouchMove = useCallback((e) => {
    if (disabled || !isTouch) return;
    
    const touches = e.touches;
    const touch = touches[0];
    
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    const currentTime = Date.now();
    const deltaTime = currentTime - touchState.current.startTime;

    touchState.current.currentX = touch.clientX;
    touchState.current.currentY = touch.clientY;
    touchState.current.velocity = calculateVelocity(deltaX, deltaY, deltaTime);

    // Clear long press timer on movement
    if (touchState.current.longPressTimer && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      clearTimeout(touchState.current.longPressTimer);
      touchState.current.longPressTimer = null;
    }

    // Determine scroll direction on first significant movement
    if (!touchState.current.direction && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        touchState.current.direction = 'horizontal';
      } else {
        touchState.current.direction = 'vertical';
        touchState.current.isScrolling = true;
      }
    }

    // Update swipe indicators for horizontal swipes
    if (enableSwipe && touchState.current.direction === 'horizontal' && !touchState.current.isScrolling) {
      const progress = (Math.abs(deltaX) / swipeThreshold) * 100;
      const direction = deltaX > 0 ? 'right' : 'left';
      updateSwipeIndicator(direction, progress);
      
      // Provide haptic feedback at threshold
      if (Math.abs(deltaX) >= swipeThreshold && !touchState.current.hasTriggered) {
        utils.hapticFeedback('light');
        touchState.current.hasTriggered = true;
      }
    }

    // Handle pinch zoom
    if (enablePinch && touches.length === 2) {
      const touch2 = touches[1];
      touchState.current.currentDistance = Math.hypot(
        touch2.clientX - touch.clientX,
        touch2.clientY - touch.clientY
      );

      const scale = touchState.current.currentDistance / touchState.current.initialDistance;
      const delta = touchState.current.currentDistance - touchState.current.initialDistance;
      
      if (onPinchZoom) {
        onPinchZoom({
          scale,
          delta,
          center: {
            x: (touch.clientX + touch2.clientX) / 2,
            y: (touch.clientY + touch2.clientY) / 2
          },
          velocity: touchState.current.velocity
        });
      }
    }

    touchState.current.endX = touch.clientX;
    touchState.current.endY = touch.clientY;
  }, [disabled, isTouch, enableSwipe, enablePinch, swipeThreshold, onPinchZoom, utils, calculateVelocity, updateSwipeIndicator]);

  const handleTouchEnd = useCallback((e) => {
    if (disabled || !isTouch) return;
    
    // Clear long press timer
    if (touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
      touchState.current.longPressTimer = null;
    }

    const endTime = Date.now();
    const duration = endTime - touchState.current.startTime;
    const deltaX = touchState.current.endX - touchState.current.startX;
    const deltaY = touchState.current.endY - touchState.current.startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    touchState.current.endTime = endTime;

    // Reset swipe indicators
    updateSwipeIndicator(null, 0);

    // Handle double tap
    if (enableDoubleTap && duration < 300 && absDeltaX < 20 && absDeltaY < 20) {
      const timeSinceLastTap = endTime - touchState.current.lastTap;
      
      if (timeSinceLastTap < 500 && timeSinceLastTap > 50) {
        if (onDoubleTap) {
          onDoubleTap({
            x: touchState.current.endX,
            y: touchState.current.endY
          });
        }
        utils.hapticFeedback('medium');
        logger.debug('Enhanced double tap detected');
        return;
      }
      
      touchState.current.lastTap = endTime;
    }

    // Handle swipe with velocity consideration
    if (enableSwipe && !touchState.current.isScrolling && duration < 500) {
      const velocity = touchState.current.velocity;
      const meetsThreshold = absDeltaX >= swipeThreshold || absDeltaY >= swipeThreshold;
      const meetsVelocity = velocity.x >= velocityThreshold || velocity.y >= velocityThreshold;
      
      if (meetsThreshold || meetsVelocity) {
        // Horizontal swipe
        if (absDeltaX > absDeltaY * 1.5) {
          utils.hapticFeedback('medium');
          
          if (deltaX > 0) {
            onSwipeRight && onSwipeRight({ 
              distance: absDeltaX, 
              duration, 
              velocity: velocity.x,
              force: Math.min(absDeltaX / swipeThreshold, 3)
            });
            logger.debug('Enhanced swipe right', { distance: absDeltaX, velocity: velocity.x });
          } else {
            onSwipeLeft && onSwipeLeft({ 
              distance: absDeltaX, 
              duration, 
              velocity: velocity.x,
              force: Math.min(absDeltaX / swipeThreshold, 3)
            });
            logger.debug('Enhanced swipe left', { distance: absDeltaX, velocity: velocity.x });
          }
        }
        // Vertical swipe
        else if (absDeltaY > absDeltaX * 1.5) {
          utils.hapticFeedback('medium');
          
          if (deltaY > 0) {
            onSwipeDown && onSwipeDown({ 
              distance: absDeltaY, 
              duration, 
              velocity: velocity.y,
              force: Math.min(absDeltaY / swipeThreshold, 3)
            });
            logger.debug('Enhanced swipe down', { distance: absDeltaY, velocity: velocity.y });
          } else {
            onSwipeUp && onSwipeUp({ 
              distance: absDeltaY, 
              duration, 
              velocity: velocity.y,
              force: Math.min(absDeltaY / swipeThreshold, 3)
            });
            logger.debug('Enhanced swipe up', { distance: absDeltaY, velocity: velocity.y });
          }
        }
      }
    }
  }, [disabled, isTouch, enableSwipe, enableDoubleTap, swipeThreshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap, utils, updateSwipeIndicator]);

  return (
    <div
      ref={containerRef}
      className={`enhanced-swipe-container ${className} ${swipeState.isActive ? 'swipe-active' : ''}`}
      style={{
        touchAction: disabled ? 'auto' : enableSwipe ? 'pan-y' : 'manipulation',
        position: 'relative'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
      
      {/* Swipe Indicators */}
      {showSwipeIndicators && swipeState.isActive && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div 
            className={`swipe-indicator swipe-indicator-${swipeState.direction}`}
            style={{
              opacity: swipeState.progress / 100,
              transform: `scale(${0.8 + (swipeState.progress / 100) * 0.4})`
            }}
          >
            {swipeState.direction === 'left' && '👈'}
            {swipeState.direction === 'right' && '👉'}
            {swipeState.direction === 'up' && '👆'}
            {swipeState.direction === 'down' && '👇'}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .enhanced-swipe-container {
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
        
        .swipe-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: rgba(59, 130, 246, 0.9);
          border-radius: 50%;
          font-size: 24px;
          backdrop-filter: blur(10px);
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }
        
        .swipe-active {
          overflow: hidden;
        }
        
        .swipe-indicator-left {
          animation: swipe-pulse-left 0.3s ease-in-out;
        }
        
        .swipe-indicator-right {
          animation: swipe-pulse-right 0.3s ease-in-out;
        }
        
        .swipe-indicator-up {
          animation: swipe-pulse-up 0.3s ease-in-out;
        }
        
        .swipe-indicator-down {
          animation: swipe-pulse-down 0.3s ease-in-out;
        }
        
        @keyframes swipe-pulse-left {
          0% { transform: translateX(20px) scale(0.8); }
          50% { transform: translateX(-5px) scale(1.1); }
          100% { transform: translateX(0) scale(1); }
        }
        
        @keyframes swipe-pulse-right {
          0% { transform: translateX(-20px) scale(0.8); }
          50% { transform: translateX(5px) scale(1.1); }
          100% { transform: translateX(0) scale(1); }
        }
        
        @keyframes swipe-pulse-up {
          0% { transform: translateY(20px) scale(0.8); }
          50% { transform: translateY(-5px) scale(1.1); }
          100% { transform: translateY(0) scale(1); }
        }
        
        @keyframes swipe-pulse-down {
          0% { transform: translateY(-20px) scale(0.8); }
          50% { transform: translateY(5px) scale(1.1); }
          100% { transform: translateY(0) scale(1); }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .swipe-indicator {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedSwipeGestures;