import { useState, useEffect } from 'react';

/**
 * Breakpoints aligned with Tailwind config
 * These MUST match tailwind.config.mjs screens
 */
export const BREAKPOINTS = {
  xs: 480,   // Large phones
  sm: 640,   // Small tablets
  md: 768,   // Tablets
  lg: 1024,  // Desktop
  xl: 1280,  // Large desktop
  '2xl': 1536, // Extra large
} as const;

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface ViewportConfig {
  /** True if width < 640px (below sm breakpoint) */
  isMobile: boolean;
  /** True if width >= 640px and < 1024px */
  isTablet: boolean;
  /** True if width >= 1024px (lg breakpoint and above) */
  isDesktop: boolean;
  /** Current viewport width in pixels */
  width: number;
  /** Current viewport height in pixels */
  height: number;
  /** Current active breakpoint name */
  breakpoint: Breakpoint;
  /** Check if viewport is at or above a specific breakpoint */
  isAbove: (bp: Breakpoint) => boolean;
  /** Check if viewport is below a specific breakpoint */
  isBelow: (bp: Breakpoint) => boolean;
}

/**
 * Get the current breakpoint name based on width
 */
function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  if (width >= BREAKPOINTS.xs) return 'xs';
  return 'xs'; // Below xs is still considered xs for mobile
}

/**
 * Create viewport config object
 */
function createViewportConfig(width: number, height: number): ViewportConfig {
  const breakpoint = getBreakpoint(width);

  return {
    isMobile: width < BREAKPOINTS.sm,
    isTablet: width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    width,
    height,
    breakpoint,
    isAbove: (bp: Breakpoint) => width >= BREAKPOINTS[bp],
    isBelow: (bp: Breakpoint) => width < BREAKPOINTS[bp],
  };
}

export function useViewport(): ViewportConfig {
  const [viewport, setViewport] = useState<ViewportConfig>(() => {
    // Initial state for SSR - assume desktop
    if (typeof window === 'undefined') {
      return createViewportConfig(1920, 1080);
    }
    return createViewportConfig(window.innerWidth, window.innerHeight);
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport(createViewportConfig(window.innerWidth, window.innerHeight));
    };

    // Set initial values on mount
    handleResize();

    // Add event listener with debounce for performance
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100); // Reduced from 150ms for snappier response
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