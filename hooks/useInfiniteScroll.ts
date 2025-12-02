import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import logger from '../utils/logger';

export interface InfiniteScrollOptions {
  debounceMs?: number;
  useIntersectionObserver?: boolean;
  rootMargin?: string;
  onLoadMore?: (info: LoadMoreInfo) => void;
  maxItems?: number;
}

export interface LoadMoreInfo {
  visibleCount: number;
  totalItems: number;
  hasMore: boolean;
}

export interface InfiniteScrollReturn<T> {
  visibleItems: T[];
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
  loadMore: () => void;
  reset: () => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  visibleCount: number;
  totalCount: number;
  stats: {
    loadCount: number;
    progress: number;
  };
}

export const useInfiniteScroll = <T = any>(
  items: T[] = [], 
  initialVisible: number = 24, 
  itemsPerLoad: number = 24, 
  threshold: number = 1000,
  options: InfiniteScrollOptions = {}
): InfiniteScrollReturn<T> => {
  const {
    debounceMs = 100,
    useIntersectionObserver = true,
    rootMargin = '100px',
    onLoadMore = null,
    maxItems = Infinity
  } = options;

  const [visibleCount, setVisibleCount] = useState(initialVisible);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Performance refs
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const lastLoadTimeRef = useRef(0);
  const loadCountRef = useRef(0);

  // Memoize visible items to prevent unnecessary re-renders
  const visibleItems = useMemo(() => {
    const endIndex = Math.min(visibleCount, items.length, maxItems);
    return items.slice(0, endIndex);
  }, [items, visibleCount, maxItems]);

  const hasMore = visibleCount < Math.min(items.length, maxItems);

  // Fix BETA-006: Use refs for values accessed in observer callback
  // to prevent race conditions and avoid recreating observer on every state change
  const stateRef = useRef({ hasMore: false, isLoading: false, visibleCount: 0, itemsLength: 0 });

  // Keep state ref up to date
  useEffect(() => {
    stateRef.current = { hasMore, isLoading, visibleCount, itemsLength: items.length };
  }, [hasMore, isLoading, visibleCount, items.length]);

  // Optimized load more function
  const loadMore = useCallback(() => {
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    
    // Prevent rapid successive loads
    if (isLoading || !hasMore || timeSinceLastLoad < 50) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    lastLoadTimeRef.current = now;
    loadCountRef.current += 1;
    
    logger.debug(`Loading more items: batch ${loadCountRef.current}`, {
      currentVisible: visibleCount,
      totalItems: items.length,
      increment: itemsPerLoad
    });

    // Use requestAnimationFrame for smooth loading
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          const newCount = Math.min(visibleCount + itemsPerLoad, items.length, maxItems);
          setVisibleCount(newCount);
          
          if (onLoadMore) {
            onLoadMore({
              visibleCount: newCount,
              totalItems: items.length,
              hasMore: newCount < Math.min(items.length, maxItems)
            });
          }
        } catch (err) {
          logger.error('Error loading more items', { error: err });
          setError(err as Error);
        } finally {
          setIsLoading(false);
        }
      }, debounceMs);
    });
  }, [isLoading, hasMore, itemsPerLoad, items.length, visibleCount, maxItems, onLoadMore, debounceMs]);

  // Intersection Observer for better performance
  // Uses stateRef to avoid recreating observer on every state change (BETA-006 fix)
  useEffect(() => {
    if (!useIntersectionObserver || !sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Use ref to get latest state without causing observer recreation
        const { hasMore: currentHasMore, isLoading: currentIsLoading, visibleCount: currentVisible, itemsLength } = stateRef.current;
        // Add additional check to prevent shaking at the end
        if (entry.isIntersecting && currentHasMore && !currentIsLoading && currentVisible < itemsLength) {
          // Small delay to prevent rapid triggering
          setTimeout(() => {
            const state = stateRef.current;
            if (state.hasMore && !state.isLoading) {
              loadMore();
            }
          }, 50);
        }
      },
      {
        rootMargin,
        threshold: 0.1
      }
    );

    observer.observe(sentinelRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, rootMargin, useIntersectionObserver]); // Removed state values from deps

  // Fallback scroll listener with throttling
  useEffect(() => {
    if (useIntersectionObserver) {
      return;
    }

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.offsetHeight;
        
        if (scrollTop + windowHeight >= documentHeight - threshold && hasMore && !isLoading) {
          loadMore();
        }
      }, 16); // ~60fps throttling
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [loadMore, hasMore, isLoading, threshold, useIntersectionObserver]);

  // Reset visible count when items change
  useEffect(() => {
    const newInitialCount = Math.min(initialVisible, items.length);
    setVisibleCount(newInitialCount);
    setError(null);
    loadCountRef.current = 0;
    logger.debug('Infinite scroll reset', { 
      itemsLength: items.length, 
      initialVisible: newInitialCount 
    });
  }, [items.length, initialVisible]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Force load more for manual triggering
  const forceLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  // Reset function
  const reset = useCallback(() => {
    setVisibleCount(initialVisible);
    setIsLoading(false);
    setError(null);
    loadCountRef.current = 0;
  }, [initialVisible]);

  return {
    visibleItems,
    hasMore,
    isLoading,
    error,
    loadMore: forceLoadMore,
    reset,
    sentinelRef, // For intersection observer target
    visibleCount,
    totalCount: items.length,
    stats: {
      loadCount: loadCountRef.current,
      progress: Math.min(visibleCount / items.length, 1)
    }
  };
};