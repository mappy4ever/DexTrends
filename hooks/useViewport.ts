import { useState, useEffect } from 'react';

// =============================================================================
// SINGLE SOURCE OF TRUTH FOR RESPONSIVE BREAKPOINTS
// =============================================================================
// These match Tailwind defaults for consistency:
// - Mobile: < 640px (sm breakpoint)
// - Tablet: 640-1024px (md-lg range)
// - Desktop: >= 1024px (lg+)
// =============================================================================

export const BREAKPOINTS = {
  sm: 640,   // Mobile → Tablet
  md: 768,   // Small tablet → Large tablet
  lg: 1024,  // Tablet → Desktop
  xl: 1280,  // Desktop → Large desktop
} as const;

// Z-index hierarchy for fixed elements (prevents overlap conflicts)
export const Z_INDEX = {
  base: 0,
  dropdown: 30,
  sticky: 35,
  fab: 40,           // FloatingActionBar
  bottomNav: 45,     // BottomNavigation (above FAB)
  modal: 50,
  toast: 55,
  tooltip: 60,
} as const;

// Safe area CSS classes for notched devices
export const SAFE_AREA = {
  top: 'pt-safe',
  bottom: 'pb-safe',
  horizontal: 'px-safe',
  all: 'p-safe',
} as const;

interface ViewportConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  isMounted: boolean; // For hydration-safe conditional rendering
}

export function useViewport(): ViewportConfig {
  const [isMounted, setIsMounted] = useState(false);
  const [viewport, setViewport] = useState<Omit<ViewportConfig, 'isMounted'>>({
    // SSR defaults to desktop to match server render
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1920,
    height: 1080,
  });

  useEffect(() => {
    setIsMounted(true);

    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({
        isMobile: width < BREAKPOINTS.sm,
        isTablet: width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg,
        width,
        height,
      });
    };

    // Set initial values on mount
    updateViewport();

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewport, 100);
    };

    window.addEventListener('resize', debouncedResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  return { ...viewport, isMounted };
}

// Hook for hydration-safe mobile rendering
// Returns null during SSR, actual value after mount
export function useMobileOnly(): boolean | null {
  const { isMobile, isMounted } = useViewport();
  if (!isMounted) return null;
  return isMobile;
}

// Export default for backward compatibility
export default useViewport;