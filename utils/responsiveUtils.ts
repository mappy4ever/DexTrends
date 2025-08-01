/**
 * Responsive utilities for testing and managing responsive behavior
 * across different device sizes and orientations
 */

// Standard breakpoints used throughout the app
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Device categories for testing
export const DEVICE_CATEGORIES = {
  mobile: { width: 375, height: 667, name: 'iPhone 8' },
  mobileLarge: { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
  tablet: { width: 768, height: 1024, name: 'iPad' },
  tabletLarge: { width: 1024, height: 1366, name: 'iPad Pro' },
  desktop: { width: 1280, height: 720, name: 'Desktop Small' },
  desktopLarge: { width: 1920, height: 1080, name: 'Desktop Large' },
} as const;

// Utility to get current breakpoint
export const getCurrentBreakpoint = (): keyof typeof BREAKPOINTS | null => {
  if (typeof window === 'undefined') return null;
  
  const width = window.innerWidth;
  
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return null; // Below sm breakpoint
};

// Check if current viewport matches a specific breakpoint or larger
export const isBreakpointOrLarger = (breakpoint: keyof typeof BREAKPOINTS): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS[breakpoint];
};

// Check if device is mobile-sized
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md;
};

// Check if device is tablet-sized
export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
};

// Check if device is desktop-sized
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.lg;
};

// Check if device supports touch
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Get device pixel ratio for high-DPI displays
export const getDevicePixelRatio = (): number => {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
};

// Check if device prefers dark mode
export const prefersDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Get safe area insets for devices with notches/dynamic islands
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined' || !CSS.supports('top: env(safe-area-inset-top)')) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
  };
};

// Test responsive behavior across different viewports
export const testResponsiveLayout = async (testCallback: (device: typeof DEVICE_CATEGORIES[keyof typeof DEVICE_CATEGORIES]) => void) => {
  if (typeof window === 'undefined') {
    console.warn('Responsive testing is only available in browser environment');
    return;
  }
  
  const originalSize = { width: window.innerWidth, height: window.innerHeight };
  
  for (const [category, device] of Object.entries(DEVICE_CATEGORIES)) {
    console.group(`Testing ${category} (${device.name})`);
    
    try {
      // Note: This would require browser dev tools or testing framework
      // to actually resize the viewport. This is more of a testing utility
      // that can be used with tools like Playwright or Cypress
      await testCallback(device);
      console.log(`✅ ${category} test completed`);
    } catch (error) {
      console.error(`❌ ${category} test failed:`, error);
    }
    
    console.groupEnd();
  }
  
  console.log('Responsive testing completed');
};

// Create responsive class names based on current breakpoint
export const createResponsiveClasses = (config: {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
}): string => {
  const classes = [config.base || ''];
  
  if (config.sm) classes.push(`sm:${config.sm}`);
  if (config.md) classes.push(`md:${config.md}`);
  if (config.lg) classes.push(`lg:${config.lg}`);
  if (config.xl) classes.push(`xl:${config.xl}`);
  if (config['2xl']) classes.push(`2xl:${config['2xl']}`);
  
  return classes.filter(Boolean).join(' ');
};

// Responsive layout validation checklist
export const RESPONSIVE_CHECKLIST = [
  'Text remains readable at all screen sizes',
  'Interactive elements are touch-friendly (min 44px)',
  'Images scale appropriately without pixelation',
  'Navigation is accessible on mobile',
  'Content flows logically on narrow screens',
  'No horizontal scrolling on mobile',
  'Loading states work across devices',
  'Animations respect reduced motion preferences',
  'Focus indicators are visible and functional',
  'Dark mode toggle works consistently',
] as const;

export default {
  BREAKPOINTS,
  DEVICE_CATEGORIES,
  RESPONSIVE_CHECKLIST,
  getCurrentBreakpoint,
  isBreakpointOrLarger,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  getDevicePixelRatio,
  prefersDarkMode,
  getSafeAreaInsets,
  testResponsiveLayout,
  createResponsiveClasses,
};