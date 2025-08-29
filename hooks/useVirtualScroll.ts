import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface VirtualScrollConfig<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number;
  scrollElement?: HTMLElement | null;
  gap?: number;
}

interface VirtualScrollState<T> {
  visibleItems: Array<{
    item: T;
    index: number;
    offsetTop: number;
  }>;
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  scrollTop: number;
}

export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
  scrollElement,
  gap = 0
}: VirtualScrollConfig<T>): VirtualScrollState<T> {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLElement | null>(scrollElement || null);
  const rafRef = useRef<number | undefined>(undefined);

  // Calculate item heights and positions
  const { heights, positions, totalHeight } = useMemo(() => {
    const heights: number[] = [];
    const positions: number[] = [];
    let totalHeight = 0;

    for (let i = 0; i < items.length; i++) {
      const height = typeof itemHeight === 'function' ? itemHeight(i) : itemHeight;
      heights.push(height);
      positions.push(totalHeight);
      totalHeight += height + (i < items.length - 1 ? gap : 0);
    }

    return { heights, positions, totalHeight };
  }, [items, itemHeight, gap]);

  // Calculate visible range
  const { startIndex, endIndex } = useMemo(() => {
    const viewportTop = scrollTop;
    const viewportBottom = scrollTop + containerHeight;

    // Binary search for start index
    let startIndex = 0;
    let left = 0;
    let right = positions.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const itemTop = positions[mid];
      const itemBottom = itemTop + heights[mid];
      
      if (itemBottom < viewportTop) {
        left = mid + 1;
      } else if (itemTop > viewportTop) {
        right = mid - 1;
      } else {
        startIndex = mid;
        break;
      }
    }
    
    startIndex = Math.max(0, Math.min(left, positions.length - 1) - overscan);

    // Find end index
    let endIndex = startIndex;
    for (let i = startIndex; i < positions.length; i++) {
      if (positions[i] > viewportBottom) {
        break;
      }
      endIndex = i;
    }
    
    endIndex = Math.min(positions.length - 1, endIndex + overscan);

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, positions, heights, overscan]);

  // Create visible items array
  const visibleItems = useMemo(() => {
    const visible = [];
    
    for (let i = startIndex; i <= endIndex; i++) {
      if (i < items.length) {
        visible.push({
          item: items[i],
          index: i,
          offsetTop: positions[i]
        });
      }
    }
    
    return visible;
  }, [items, startIndex, endIndex, positions]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const element = scrollElementRef.current || window;
      const newScrollTop = element === window 
        ? window.scrollY || document.documentElement.scrollTop
        : (element as HTMLElement).scrollTop;
      
      setScrollTop(newScrollTop);
    });
  }, []);

  // Attach scroll listener
  useEffect(() => {
    const element = scrollElement || window;
    scrollElementRef.current = element as HTMLElement;
    
    element.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial position
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [scrollElement, handleScroll]);

  return {
    visibleItems,
    totalHeight,
    startIndex,
    endIndex,
    scrollTop
  };
}

// Hook for window-based virtual scrolling
export function useWindowVirtualScroll<T>(
  items: T[],
  itemHeight: number | ((index: number) => number),
  overscan = 3,
  gap = 0
) {
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return useVirtualScroll({
    items,
    itemHeight,
    containerHeight: windowHeight,
    overscan,
    gap
  });
}

// Hook for container-based virtual scrolling
export function useContainerVirtualScroll<T>(
  items: T[],
  itemHeight: number | ((index: number) => number),
  containerRef: React.RefObject<HTMLElement>,
  overscan = 3,
  gap = 0
) {
  const [containerHeight, setContainerHeight] = useState(400);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(containerRef.current);
    setContainerHeight(containerRef.current.clientHeight);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return useVirtualScroll({
    items,
    itemHeight,
    containerHeight,
    scrollElement: containerRef.current,
    overscan,
    gap
  });
}