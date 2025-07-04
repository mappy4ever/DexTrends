import React, { 
  useState, 
  useRef, 
  useCallback, 
  useEffect,
  createContext,
  useContext
} from 'react';
import { HapticFeedback, VisualFeedback } from './MicroInteractionSystem';

/**
 * Advanced Touch Gesture System for Mobile Interactions
 */

// Touch Gesture Context
const TouchGestureContext = createContext();

export const useTouchGesture = () => {
  const context = useContext(TouchGestureContext);
  if (!context) {
    throw new Error('useTouchGesture must be used within TouchGestureProvider');
  }
  return context;
};

// Touch Gesture Provider
export const TouchGestureProvider = ({ children }) => {
  const [activeGestures, setActiveGestures] = useState(new Map());
  const [globalSettings, setGlobalSettings] = useState({
    swipeThreshold: 50,
    velocityThreshold: 0.3,
    tapTimeout: 300,
    doubleTapTimeout: 300,
    longPressTimeout: 500,
    pinchThreshold: 0.1
  });
  
  const registerGesture = useCallback((id, config) => {
    setActiveGestures(prev => new Map(prev.set(id, config)));
  }, []);
  
  const unregisterGesture = useCallback((id) => {
    setActiveGestures(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);
  
  const updateSettings = useCallback((newSettings) => {
    setGlobalSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  const contextValue = {
    activeGestures,
    globalSettings,
    registerGesture,
    unregisterGesture,
    updateSettings
  };
  
  return (
    <TouchGestureContext.Provider value={contextValue}>
      {children}
    </TouchGestureContext.Provider>
  );
};

// Swipe Gesture Hook
export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocityThreshold = 0.3,
  preventDefault = true,
  enabled = true
} = {}) => {
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const startTime = useRef(null);
  const [isSwiping, setIsSwiping] = useState(false);
  
  const handleTouchStart = useCallback((event) => {
    if (!enabled) return;
    
    const touch = event.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    startTime.current = Date.now();
    setIsSwiping(false);
    
    if (preventDefault) {
      event.preventDefault();
    }
  }, [enabled, preventDefault]);
  
  const handleTouchMove = useCallback((event) => {
    if (!enabled || !touchStart.current) return;
    
    const touch = event.touches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    
    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > threshold && !isSwiping) {
      setIsSwiping(true);
      HapticFeedback.light();
    }
    
    if (preventDefault && isSwiping) {
      event.preventDefault();
    }
  }, [enabled, threshold, isSwiping, preventDefault]);
  
  const handleTouchEnd = useCallback((event) => {
    if (!enabled || !touchStart.current || !touchEnd.current) return;
    
    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = Date.now() - startTime.current;
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // Check if swipe meets threshold and velocity requirements
    if ((absX > threshold || absY > threshold) && velocity > velocityThreshold) {
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.(deltaX, velocity);
          HapticFeedback.medium();
        } else {
          onSwipeLeft?.(Math.abs(deltaX), velocity);
          HapticFeedback.medium();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.(deltaY, velocity);
          HapticFeedback.medium();
        } else {
          onSwipeUp?.(Math.abs(deltaY), velocity);
          HapticFeedback.medium();
        }
      }
    }
    
    // Reset
    touchStart.current = null;
    touchEnd.current = null;
    startTime.current = null;
    setIsSwiping(false);
    
    if (preventDefault) {
      event.preventDefault();
    }
  }, [enabled, threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, preventDefault]);
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    isSwiping
  };
};

// Tap Gesture Hook
export const useTapGesture = ({
  onTap,
  onDoubleTap,
  onLongPress,
  tapTimeout = 300,
  doubleTapTimeout = 300,
  longPressTimeout = 500,
  enabled = true
} = {}) => {
  const tapCount = useRef(0);
  const tapTimer = useRef(null);
  const longPressTimer = useRef(null);
  const touchStart = useRef(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  
  const handleTouchStart = useCallback((event) => {
    if (!enabled) return;
    
    const touch = event.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    
    setIsLongPressing(false);
    
    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        setIsLongPressing(true);
        onLongPress(event);
        HapticFeedback.strong();
      }, longPressTimeout);
    }
  }, [enabled, onLongPress, longPressTimeout]);
  
  const handleTouchMove = useCallback((event) => {
    if (!enabled || !touchStart.current) return;
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Cancel long press if moved too much
    if (distance > 10 && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, [enabled]);
  
  const handleTouchEnd = useCallback((event) => {
    if (!enabled || !touchStart.current) return;
    
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Skip tap processing if it was a long press
    if (isLongPressing) {
      setIsLongPressing(false);
      return;
    }
    
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - touchStart.current.time;
    
    // Check if it's a valid tap (small movement, short duration)
    if (distance < 10 && duration < tapTimeout) {
      tapCount.current += 1;
      
      if (onDoubleTap && tapCount.current === 1) {
        // Wait for potential double tap
        tapTimer.current = setTimeout(() => {
          if (tapCount.current === 1) {
            onTap?.(event);
            HapticFeedback.light();
          }
          tapCount.current = 0;
        }, doubleTapTimeout);
      } else if (onDoubleTap && tapCount.current === 2) {
        // Double tap detected
        clearTimeout(tapTimer.current);
        onDoubleTap(event);
        HapticFeedback.medium();
        tapCount.current = 0;
      } else if (!onDoubleTap) {
        // Single tap only
        onTap?.(event);
        HapticFeedback.light();
      }
    }
    
    touchStart.current = null;
  }, [enabled, tapTimeout, doubleTapTimeout, onTap, onDoubleTap, isLongPressing]);
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    isLongPressing
  };
};

// Pinch Gesture Hook
export const usePinchGesture = ({
  onPinchStart,
  onPinchMove,
  onPinchEnd,
  threshold = 0.1,
  enabled = true
} = {}) => {
  const initialDistance = useRef(null);
  const currentScale = useRef(1);
  const [isPinching, setIsPinching] = useState(false);
  
  const getDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  const handleTouchStart = useCallback((event) => {
    if (!enabled || event.touches.length !== 2) return;
    
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    initialDistance.current = getDistance(touch1, touch2);
    currentScale.current = 1;
    setIsPinching(true);
    
    onPinchStart?.(event);
    HapticFeedback.light();
    
    event.preventDefault();
  }, [enabled, onPinchStart]);
  
  const handleTouchMove = useCallback((event) => {
    if (!enabled || !isPinching || event.touches.length !== 2) return;
    
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const currentDistance = getDistance(touch1, touch2);
    const scale = currentDistance / initialDistance.current;
    
    if (Math.abs(scale - currentScale.current) > threshold) {
      currentScale.current = scale;
      onPinchMove?.(scale, event);
    }
    
    event.preventDefault();
  }, [enabled, isPinching, threshold, onPinchMove]);
  
  const handleTouchEnd = useCallback((event) => {
    if (!enabled || !isPinching) return;
    
    setIsPinching(false);
    onPinchEnd?.(currentScale.current, event);
    HapticFeedback.medium();
    
    initialDistance.current = null;
    currentScale.current = 1;
  }, [enabled, isPinching, onPinchEnd]);
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    isPinching,
    currentScale: currentScale.current
  };
};

// Swipeable Card Component
export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 100,
  snapBackThreshold = 50,
  className = '',
  disabled = false,
  ...props
}) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, rotation: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef(null);
  
  const swipeGestures = useSwipeGesture({
    onSwipeLeft: (distance, velocity) => {
      if (disabled) return;
      
      setIsAnimating(true);
      setTransform({ x: -window.innerWidth, y: 0, rotation: -30 });
      
      setTimeout(() => {
        onSwipeLeft?.(distance, velocity);
        resetCard();
      }, 300);
    },
    onSwipeRight: (distance, velocity) => {
      if (disabled) return;
      
      setIsAnimating(true);
      setTransform({ x: window.innerWidth, y: 0, rotation: 30 });
      
      setTimeout(() => {
        onSwipeRight?.(distance, velocity);
        resetCard();
      }, 300);
    },
    onSwipeUp: (distance, velocity) => {
      if (disabled) return;
      
      setIsAnimating(true);
      setTransform({ x: 0, y: -window.innerHeight, rotation: 0 });
      
      setTimeout(() => {
        onSwipeUp?.(distance, velocity);
        resetCard();
      }, 300);
    },
    onSwipeDown: (distance, velocity) => {
      if (disabled) return;
      
      setIsAnimating(true);
      setTransform({ x: 0, y: window.innerHeight, rotation: 0 });
      
      setTimeout(() => {
        onSwipeDown?.(distance, velocity);
        resetCard();
      }, 300);
    },
    threshold: swipeThreshold,
    enabled: !disabled
  });
  
  const resetCard = useCallback(() => {
    setTransform({ x: 0, y: 0, rotation: 0 });
    setIsDragging(false);
    setIsAnimating(false);
  }, []);
  
  const handleTouchStart = useCallback((event) => {
    if (disabled) return;
    
    setIsDragging(true);
    setIsAnimating(false);
    swipeGestures.onTouchStart(event);
  }, [disabled, swipeGestures]);
  
  const handleTouchMove = useCallback((event) => {
    if (disabled || !isDragging) return;
    
    const touch = event.touches[0];
    const rect = cardRef.current?.getBoundingClientRect();
    
    if (rect) {
      const x = touch.clientX - rect.left - rect.width / 2;
      const y = touch.clientY - rect.top - rect.height / 2;
      const rotation = (x / rect.width) * 30; // Max 30 degrees rotation
      
      setTransform({ x: x * 0.5, y: y * 0.3, rotation });
    }
    
    swipeGestures.onTouchMove(event);
  }, [disabled, isDragging, swipeGestures]);
  
  const handleTouchEnd = useCallback((event) => {
    if (disabled) return;
    
    const absX = Math.abs(transform.x);
    const absY = Math.abs(transform.y);
    
    // Snap back if below threshold
    if (absX < snapBackThreshold && absY < snapBackThreshold) {
      resetCard();
    }
    
    swipeGestures.onTouchEnd(event);
  }, [disabled, transform, snapBackThreshold, resetCard, swipeGestures]);
  
  const getCardStyle = () => {
    return {
      transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotation}deg)`,
      transition: isAnimating ? 'transform 0.3s ease-out' : 'none',
      opacity: Math.max(0.5, 1 - (Math.abs(transform.x) + Math.abs(transform.y)) / 300)
    };
  };
  
  const getCardClasses = () => {
    const baseClasses = 'swipeable-card touch-none select-none';
    const stateClasses = [
      isDragging && 'dragging',
      isAnimating && 'animating',
      disabled && 'disabled cursor-not-allowed opacity-50'
    ].filter(Boolean).join(' ');
    
    return `${baseClasses} ${stateClasses} ${className}`;
  };
  
  return (
    <div
      ref={cardRef}
      className={getCardClasses()}
      style={getCardStyle()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {children}
      
      {/* Swipe Indicators */}
      {isDragging && (
        <>
          {transform.x > 20 && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium opacity-75">
              Like
            </div>
          )}
          {transform.x < -20 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium opacity-75">
              Pass
            </div>
          )}
          {transform.y < -20 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium opacity-75">
              Super Like
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Pull to Refresh Component
export const PullToRefresh = ({
  children,
  onRefresh,
  refreshThreshold = 80,
  loadingComponent,
  refreshingText = 'Pull to refresh',
  releasingText = 'Release to refresh',
  refreshingLoadingText = 'Refreshing...',
  className = '',
  disabled = false
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  
  const handleTouchStart = useCallback((event) => {
    if (disabled || isRefreshing) return;
    
    // Only start if scrolled to top
    if (window.scrollY === 0) {
      startY.current = event.touches[0].clientY;
      currentY.current = startY.current;
    }
  }, [disabled, isRefreshing]);
  
  const handleTouchMove = useCallback((event) => {
    if (disabled || isRefreshing || startY.current === 0) return;
    
    currentY.current = event.touches[0].clientY;
    const deltaY = currentY.current - startY.current;
    
    if (deltaY > 0) {
      // Prevent default scrolling
      event.preventDefault();
      
      // Apply resistance curve
      const resistance = Math.max(0, Math.min(1, deltaY / 200));
      const distance = deltaY * (1 - resistance);
      
      setPullDistance(distance);
      setCanRefresh(distance >= refreshThreshold);
      
      if (distance >= refreshThreshold && !canRefresh) {
        HapticFeedback.medium();
      }
    }
  }, [disabled, isRefreshing, refreshThreshold, canRefresh]);
  
  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return;
    
    if (canRefresh && pullDistance >= refreshThreshold) {
      setIsRefreshing(true);
      HapticFeedback.success();
      
      try {
        await onRefresh?.();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          setCanRefresh(false);
          startY.current = 0;
          currentY.current = 0;
        }, 500);
      }
    } else {
      // Snap back
      setPullDistance(0);
      setCanRefresh(false);
      startY.current = 0;
      currentY.current = 0;
    }
  }, [disabled, isRefreshing, canRefresh, pullDistance, refreshThreshold, onRefresh]);
  
  const getRefreshIndicatorStyle = () => {
    const progress = Math.min(1, pullDistance / refreshThreshold);
    const rotation = progress * 180;
    const scale = Math.min(1, progress);
    
    return {
      transform: `translateY(${pullDistance}px) rotate(${rotation}deg) scale(${scale})`,
      opacity: progress
    };
  };
  
  const getContainerStyle = () => {
    return {
      transform: `translateY(${pullDistance}px)`,
      transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
    };
  };
  
  const getStatusText = () => {
    if (isRefreshing) return refreshingLoadingText;
    if (canRefresh) return releasingText;
    return refreshingText;
  };
  
  return (
    <div
      ref={containerRef}
      className={`pull-to-refresh relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Refresh Indicator */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-10 flex flex-col items-center p-4" style={getRefreshIndicatorStyle()}>
        {loadingComponent || (
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 border-2 border-pokemon-red border-t-transparent rounded-full ${
              isRefreshing ? 'animate-spin' : ''
            }`} />
            <span className="text-sm text-gray-600 font-medium">
              {getStatusText()}
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div style={getContainerStyle()}>
        {children}
      </div>
    </div>
  );
};

// Swipeable List Item Component
export const SwipeableListItem = ({
  children,
  leftAction,
  rightAction,
  leftColor = 'bg-green-500',
  rightColor = 'bg-red-500',
  threshold = 80,
  className = '',
  disabled = false
}) => {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isActioned, setIsActioned] = useState(false);
  const itemRef = useRef(null);
  
  const swipeGestures = useSwipeGesture({
    onSwipeLeft: (distance, velocity) => {
      if (disabled || !rightAction) return;
      
      setIsActioned(true);
      rightAction.onAction?.();
      
      // Animate out
      setTimeout(() => {
        setSwipeDistance(-window.innerWidth);
      }, 100);
      
      // Reset
      setTimeout(() => {
        setSwipeDistance(0);
        setIsActioned(false);
      }, 500);
    },
    onSwipeRight: (distance, velocity) => {
      if (disabled || !leftAction) return;
      
      setIsActioned(true);
      leftAction.onAction?.();
      
      // Animate out
      setTimeout(() => {
        setSwipeDistance(window.innerWidth);
      }, 100);
      
      // Reset
      setTimeout(() => {
        setSwipeDistance(0);
        setIsActioned(false);
      }, 500);
    },
    threshold,
    enabled: !disabled
  });
  
  const getItemStyle = () => {
    return {
      transform: `translateX(${swipeDistance}px)`,
      transition: isActioned ? 'transform 0.3s ease-out' : 'transform 0.2s ease-out'
    };
  };
  
  const getActionOpacity = (side) => {
    const distance = Math.abs(swipeDistance);
    const progress = Math.min(1, distance / threshold);
    
    if (side === 'left' && swipeDistance > 0) return progress;
    if (side === 'right' && swipeDistance < 0) return progress;
    return 0;
  };
  
  return (
    <div className={`swipeable-list-item relative overflow-hidden ${className}`}>
      {/* Left Action */}
      {leftAction && (
        <div
          className={`absolute inset-y-0 left-0 w-20 ${leftColor} flex items-center justify-center text-white transition-opacity duration-200`}
          style={{ opacity: getActionOpacity('left') }}
        >
          <div className="flex flex-col items-center gap-1">
            {leftAction.icon}
            <span className="text-xs font-medium">{leftAction.label}</span>
          </div>
        </div>
      )}
      
      {/* Right Action */}
      {rightAction && (
        <div
          className={`absolute inset-y-0 right-0 w-20 ${rightColor} flex items-center justify-center text-white transition-opacity duration-200`}
          style={{ opacity: getActionOpacity('right') }}
        >
          <div className="flex flex-col items-center gap-1">
            {rightAction.icon}
            <span className="text-xs font-medium">{rightAction.label}</span>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div
        ref={itemRef}
        className="relative bg-white z-10">
        style={getItemStyle()}
        {...swipeGestures}
      >
        {children}
      </div>
    </div>
  );
};

// Combined Gesture Component
export const GestureArea = ({
  children,
  gestures = {},
  className = '',
  disabled = false,
  ...props
}) => {
  const combinedGestures = {
    ...useSwipeGesture(gestures.swipe || {}),
    ...useTapGesture(gestures.tap || {}),
    ...usePinchGesture(gestures.pinch || {})
  };
  
  const handleTouchStart = useCallback((event) => {
    if (disabled) return;
    
    // Call all gesture start handlers
    Object.values(combinedGestures)
      .filter(handler => typeof handler === 'function' && handler.name === 'handleTouchStart')
      .forEach(handler => handler(event));
  }, [disabled, combinedGestures]);
  
  const handleTouchMove = useCallback((event) => {
    if (disabled) return;
    
    // Call all gesture move handlers
    Object.values(combinedGestures)
      .filter(handler => typeof handler === 'function' && handler.name === 'handleTouchMove')
      .forEach(handler => handler(event));
  }, [disabled, combinedGestures]);
  
  const handleTouchEnd = useCallback((event) => {
    if (disabled) return;
    
    // Call all gesture end handlers
    Object.values(combinedGestures)
      .filter(handler => typeof handler === 'function' && handler.name === 'handleTouchEnd')
      .forEach(handler => handler(event));
  }, [disabled, combinedGestures]);
  
  return (
    <div
      className={`gesture-area ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {children}
    </div>
  );
};

export default {
  TouchGestureProvider,
  useSwipeGesture,
  useTapGesture,
  usePinchGesture,
  SwipeableCard,
  PullToRefresh,
  SwipeableListItem,
  GestureArea,
  useTouchGesture
};