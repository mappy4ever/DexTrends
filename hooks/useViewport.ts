import { useState, useEffect } from 'react';

// Single source of truth for breakpoints
// Mobile: < 640px (Tailwind sm)
// Tablet: 640-1024px  
// Desktop: > 1024px

interface ViewportConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

export function useViewport(): ViewportConfig {
  const [viewport, setViewport] = useState<ViewportConfig>(() => {
    // Initial state for SSR
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1920,
        height: 1080,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      isMobile: width < 640,
      isTablet: width >= 640 && width < 1024,
      isDesktop: width >= 1024,
      width,
      height,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height,
      });
    };

    // Set initial values on mount
    handleResize();

    // Add event listener with debounce
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  return viewport;
}

// Export default for backward compatibility
export default useViewport;