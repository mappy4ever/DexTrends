import { useState, useEffect, useRef, useCallback } from 'react';
import logger from '@/utils/logger';

interface PullToRefreshConfig {
  threshold?: number;
  maxPull?: number;
  refreshTimeout?: number;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

interface PullState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  shouldTrigger: boolean;
  pullProgress: number; // 0-1 for animation
}

export function usePullToRefresh({
  threshold = 80,
  maxPull = 150,
  refreshTimeout = 10000,
  onRefresh,
  disabled = false
}: PullToRefreshConfig) {
  const [pullState, setPullState] = useState<PullState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    shouldTrigger: false,
    pullProgress: 0
  });

  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const containerRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const calculatePullDistance = useCallback((deltaY: number) => {
    // Apply resistance formula for elastic feel
    const resistance = 2.5;
    const resistedDistance = deltaY / (1 + (deltaY / maxPull) * resistance);
    return Math.min(Math.max(0, resistedDistance), maxPull);
  }, [maxPull]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || pullState.isRefreshing) return;
    
    const touch = e.touches[0];
    startYRef.current = touch.clientY;
    currentYRef.current = touch.clientY;
    
    // Only start pull if at top of scrollable area
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop === 0) {
      setPullState(prev => ({ ...prev, isPulling: true }));
    }
  }, [disabled, pullState.isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pullState.isPulling || pullState.isRefreshing) return;
    
    const touch = e.touches[0];
    currentYRef.current = touch.clientY;
    const deltaY = currentYRef.current - startYRef.current;
    
    if (deltaY > 0) {
      // Prevent default to stop bounce scroll
      e.preventDefault();
      
      const pullDistance = calculatePullDistance(deltaY);
      const pullProgress = Math.min(pullDistance / threshold, 1);
      const shouldTrigger = pullDistance >= threshold;
      
      setPullState(prev => ({
        ...prev,
        pullDistance,
        pullProgress,
        shouldTrigger
      }));
    }
  }, [pullState.isPulling, pullState.isRefreshing, calculatePullDistance, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!pullState.isPulling || pullState.isRefreshing) return;
    
    if (pullState.shouldTrigger) {
      // Trigger refresh
      setPullState(prev => ({
        ...prev,
        isRefreshing: true,
        isPulling: false,
        pullDistance: threshold, // Keep at threshold during refresh
        pullProgress: 1
      }));
      
      // Add timeout protection
      timeoutRef.current = setTimeout(() => {
        setPullState({
          isPulling: false,
          pullDistance: 0,
          isRefreshing: false,
          shouldTrigger: false,
          pullProgress: 0
        });
      }, refreshTimeout);
      
      try {
        await onRefresh();
      } catch (error) {
        logger.error('Refresh failed:', { error });
      } finally {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Smooth return animation
        setPullState({
          isPulling: false,
          pullDistance: 0,
          isRefreshing: false,
          shouldTrigger: false,
          pullProgress: 0
        });
      }
    } else {
      // Return to initial state
      setPullState({
        isPulling: false,
        pullDistance: 0,
        isRefreshing: false,
        shouldTrigger: false,
        pullProgress: 0
      });
    }
  }, [pullState, threshold, refreshTimeout, onRefresh]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const container = containerRef.current || document.body;
    
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const setContainer = useCallback((element: HTMLElement | null) => {
    containerRef.current = element;
  }, []);

  return {
    pullState,
    setContainer,
    isActive: pullState.isPulling || pullState.isRefreshing,
    canRefresh: pullState.shouldTrigger,
    progress: pullState.pullProgress
  };
}