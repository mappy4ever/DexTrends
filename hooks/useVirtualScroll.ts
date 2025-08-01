import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface UseVirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  itemCount: number;
  overscan?: number;
  getScrollElement?: () => HTMLElement | null;
}

interface VirtualScrollResult {
  visibleRange: {
    start: number;
    end: number;
  };
  totalHeight: number;
  offsetY: number;
  isScrolling: boolean;
  handleScroll: (e?: Event) => void;
}

export function useVirtualScroll({
  itemHeight,
  containerHeight,
  itemCount,
  overscan = 5,
  getScrollElement
}: UseVirtualScrollOptions): VirtualScrollResult {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);
    
    // Apply overscan
    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(itemCount, visibleEnd + overscan);
    
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan]);

  // Calculate total height for scrollbar
  const totalHeight = itemCount * itemHeight;
  
  // Calculate offset for visible items
  const offsetY = visibleRange.start * itemHeight;

  // Optimized scroll handler with RAF
  const handleScroll = useCallback((e?: Event) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const element = e?.target as HTMLElement || getScrollElement?.() || null;
      if (!element) return;

      const newScrollTop = element.scrollTop;
      setScrollTop(newScrollTop);
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set scrolling to false after scroll ends
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    });
  }, [getScrollElement]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    visibleRange,
    totalHeight,
    offsetY,
    isScrolling,
    handleScroll
  };
}

// Note: Intersection observer virtualization was removed in favor of simpler index-based approach
// The useVirtualScroll hook above can still be used for more advanced virtual scrolling needs