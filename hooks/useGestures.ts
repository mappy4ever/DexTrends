import { useCallback, useRef, useState } from 'react';
import { PanInfo, useAnimation } from 'framer-motion';

/**
 * Gesture-based Interaction Hooks
 * Provides smooth gesture controls for swipe, drag, and touch interactions
 */

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface DragBounds {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

// Swipe gesture hook
export const useSwipeGesture = (handlers: SwipeHandlers, threshold: number = 50) => {
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      
      // Determine swipe direction based on offset and velocity
      if (Math.abs(offset.x) > Math.abs(offset.y)) {
        // Horizontal swipe
        if (offset.x > threshold || velocity.x > 500) {
          handlers.onSwipeRight?.();
        } else if (offset.x < -threshold || velocity.x < -500) {
          handlers.onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (offset.y > threshold || velocity.y > 500) {
          handlers.onSwipeDown?.();
        } else if (offset.y < -threshold || velocity.y < -500) {
          handlers.onSwipeUp?.();
        }
      }
    },
    [handlers, threshold]
  );

  return {
    drag: true as const,
    dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
    dragElastic: 0.2,
    onDragEnd: handleDragEnd
  };
};

// Long press gesture hook
export const useLongPress = (
  callback: () => void,
  duration: number = 500
) => {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handlePressStart = useCallback((_e: React.PointerEvent) => {
    setIsLongPressing(false);
    timeoutRef.current = setTimeout(() => {
      setIsLongPressing(true);
      callback();
    }, duration);
  }, [callback, duration]);

  const handlePressEnd = useCallback((_e: React.PointerEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLongPressing(false);
  }, []);

  return {
    onPointerDown: handlePressStart,
    onPointerUp: handlePressEnd,
    onPointerLeave: handlePressEnd,
    isLongPressing
  };
};

// Pinch to zoom gesture hook
export const usePinchZoom = (
  minScale: number = 0.5,
  maxScale: number = 3
) => {
  const [scale, setScale] = useState(1);
  const initialDistance = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      initialDistance.current = distance;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance.current > 0) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const newScale = (distance / initialDistance.current) * scale;
      setScale(Math.min(Math.max(newScale, minScale), maxScale));
    }
  }, [scale, minScale, maxScale]);

  const handleTouchEnd = useCallback(() => {
    initialDistance.current = 0;
  }, []);

  const resetScale = useCallback(() => {
    setScale(1);
  }, []);

  return {
    scale,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    resetScale,
    style: {
      transform: `scale(${scale})`
    }
  };
};

// Drag to reorder hook
export const useDragReorder = <T extends { id: string | number }>(
  items: T[],
  onReorder: (items: T[]) => void
) => {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((item: T) => {
    setDraggedItem(item);
  }, []);

  const handleDragOver = useCallback((index: number) => {
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (draggedItem && dragOverIndex !== null) {
      const draggedIndex = items.findIndex(item => item.id === draggedItem.id);
      if (draggedIndex !== dragOverIndex) {
        const newItems = [...items];
        newItems.splice(draggedIndex, 1);
        newItems.splice(dragOverIndex, 0, draggedItem);
        onReorder(newItems);
      }
    }
    setDraggedItem(null);
    setDragOverIndex(null);
  }, [items, draggedItem, dragOverIndex, onReorder]);

  return {
    draggedItem,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
};

// Pull to refresh gesture hook
export const usePullToRefresh = (
  onRefresh: () => Promise<void>,
  threshold: number = 80
) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const controls = useAnimation();

  const handleDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y > 0 && window.scrollY === 0) {
        setIsPulling(true);
        setPullDistance(Math.min(info.offset.y, threshold * 1.5));
      }
    },
    [threshold]
  );

  const handleDragEnd = useCallback(
    async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y > threshold && !isRefreshing) {
        setIsRefreshing(true);
        await controls.start({
          y: threshold,
          transition: { type: "spring", stiffness: 200, damping: 20 }
        });
        
        await onRefresh();
        
        await controls.start({
          y: 0,
          transition: { type: "spring", stiffness: 200, damping: 20 }
        });
        setIsRefreshing(false);
      } else {
        await controls.start({
          y: 0,
          transition: { type: "spring", stiffness: 200, damping: 20 }
        });
      }
      setIsPulling(false);
      setPullDistance(0);
    },
    [threshold, isRefreshing, controls, onRefresh]
  );

  return {
    drag: "y" as const,
    dragConstraints: { top: 0, bottom: threshold * 1.5 },
    dragElastic: 0.5,
    onDrag: handleDrag,
    onDragEnd: handleDragEnd,
    animate: controls,
    isPulling,
    pullDistance,
    isRefreshing
  };
};

// Double tap gesture hook
export const useDoubleTap = (
  callback: () => void,
  delay: number = 300
) => {
  const [lastTap, setLastTap] = useState(0);

  const handleTap = useCallback((_e?: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTap < delay) {
      callback();
      setLastTap(0); // Reset to prevent triple tap
    } else {
      setLastTap(now);
    }
  }, [lastTap, delay, callback]);

  return {
    onTap: handleTap
  };
};

// Hover with delay hook
export const useHoverDelay = (
  onHoverStart: () => void,
  onHoverEnd: () => void,
  delay: number = 200
) => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleHoverStart = useCallback((_e?: React.MouseEvent) => {
    timeoutRef.current = setTimeout(onHoverStart, delay);
  }, [onHoverStart, delay]);

  const handleHoverEnd = useCallback((_e?: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onHoverEnd();
  }, [onHoverEnd]);

  return {
    onHoverStart: handleHoverStart,
    onHoverEnd: handleHoverEnd
  };
};

// Elastic drag hook for rubber band effect
export const useElasticDrag = (bounds: DragBounds = {}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  const handleDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setPosition(info.offset);
    },
    []
  );

  const handleDragEnd = useCallback(async () => {
    await controls.start({
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    });
    setPosition({ x: 0, y: 0 });
  }, [controls]);

  return {
    drag: true as const,
    dragConstraints: bounds,
    dragElastic: 0.2,
    onDrag: handleDrag,
    onDragEnd: handleDragEnd,
    animate: controls,
    position
  };
};