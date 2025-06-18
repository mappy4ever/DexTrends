import { useState, useEffect, useCallback } from 'react';

export const useInfiniteScroll = (
  items = [], 
  initialVisible = 24, 
  itemsPerLoad = 24, 
  threshold = 1000
) => {
  const [visibleCount, setVisibleCount] = useState(initialVisible);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(() => {
    if (visibleCount >= items.length || isLoading) return;
    
    setIsLoading(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + itemsPerLoad, items.length));
      setIsLoading(false);
    }, 300);
  }, [visibleCount, items.length, isLoading, itemsPerLoad]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - threshold
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, threshold]);

  // Reset visible count when items change (e.g., filtering)
  useEffect(() => {
    setVisibleCount(Math.min(initialVisible, items.length));
  }, [items.length, initialVisible]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return {
    visibleItems,
    hasMore,
    isLoading,
    loadMore,
    visibleCount,
    totalCount: items.length
  };
};