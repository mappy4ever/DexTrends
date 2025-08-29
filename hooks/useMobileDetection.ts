import { useState, useEffect } from 'react';

/**
 * Custom hook for mobile viewport detection with SSR support
 * Returns mobile state and loading state for proper hydration
 */
export function useMobileDetection(breakpoint: number = 460) {
  // Start with false for SSR (show desktop by default)
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  
  useEffect(() => {
    // Mark that we're on the client
    setIsClient(true);
    
    // Function to check if viewport is mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < breakpoint;
      setIsMobile(mobile);
      return mobile;
    };

    // Initial check - immediate for fast response
    checkMobile();

    // Debounced resize handler for performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return {
    isMobile,
    isLoading: !isClient,
    // Safe for immediate use
    isMobileOrLoading: !isClient || isMobile
  };
}

/**
 * Hook for immediate mobile detection without state
 * Useful for one-time checks
 */
export function useIsMobileViewport(breakpoint: number = 460): boolean {
  if (typeof window === 'undefined') {
    // SSR: return false by default
    return false;
  }
  return window.innerWidth < breakpoint;
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
export const useIsMobile = () => useMediaQuery('(max-width: 460px)');
export const useIsTablet = () => useMediaQuery('(min-width: 461px) and (max-width: 768px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 769px)');