import { useState, useEffect, useLayoutEffect } from 'react';

/**
 * Custom hook for mobile viewport detection with SSR support
 * Returns mobile state and loading state for proper hydration
 */
export function useMobileDetection(breakpoint: number = 430) {
  // Initialize with media query check if available (client-side)
  const getInitialMobile = () => {
    if (typeof window === 'undefined') return false;
    
    // Try media query first (most reliable)
    if (window.matchMedia) {
      return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
    }
    
    // Fallback to innerWidth
    return window.innerWidth <= breakpoint;
  };
  
  const [isMobile, setIsMobile] = useState<boolean>(getInitialMobile);
  const [isClient, setIsClient] = useState<boolean>(false);
  
  // Use useLayoutEffect for synchronous updates before paint
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
  
  useIsomorphicLayoutEffect(() => {
    // Mark that we're on the client
    setIsClient(true);
    
    // Function to check if viewport is mobile
    const checkMobile = () => {
      const mobile = window.innerWidth <= breakpoint;
      setIsMobile(mobile);
      return mobile;
    };

    // Immediate check on mount
    checkMobile();

    // Use matchMedia for better performance if available
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
      
      // Modern browsers
      const handler = (e: MediaQueryListEvent) => {
        setIsMobile(e.matches);
      };
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }
    }
    
    // Fallback to resize listener
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return {
    isMobile,
    isLoading: false, // We now have immediate detection
    // Safe for immediate use
    isMobileOrLoading: isMobile
  };
}

/**
 * Hook for immediate mobile detection without state
 * Useful for one-time checks
 */
export function useIsMobileViewport(breakpoint: number = 430): boolean {
  if (typeof window === 'undefined') {
    // SSR: return false by default
    return false;
  }
  return window.innerWidth <= breakpoint;
}

/**
 * Media query hook for more complex responsive logic
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Handler for changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } 
    // Legacy browsers  
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
    
    return undefined;
  }, [query]);
  
  return matches;
}

// Convenience hooks for common breakpoints
export const useIsMobile = () => useMediaQuery('(max-width: 430px)');
export const useIsTablet = () => useMediaQuery('(min-width: 431px) and (max-width: 768px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 769px)');