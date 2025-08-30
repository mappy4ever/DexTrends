/**
 * Standardized Safe Area System
 * Ensures proper spacing for notched devices (iPhone X+, newer Android)
 */

import { cn } from '@/utils/cn';

/**
 * Safe area padding classes
 */
export const safeAreaPadding = {
  // All sides
  all: 'safe-area-all',
  
  // Individual sides
  top: 'safe-area-top',
  right: 'safe-area-right',
  bottom: 'safe-area-bottom',
  left: 'safe-area-left',
  
  // Common combinations
  horizontal: 'safe-area-x',
  vertical: 'safe-area-y',
  
  // Component-specific
  header: 'pt-safe',
  footer: 'pb-safe',
  container: 'px-safe',
  screen: 'p-safe',
} as const;

/**
 * Get safe area classes for a component
 * @param areas - Safe area sides to apply
 * @param className - Additional classes
 */
export function getSafeAreaClasses(
  areas: keyof typeof safeAreaPadding | Array<keyof typeof safeAreaPadding>,
  className?: string
): string {
  const areaArray = Array.isArray(areas) ? areas : [areas];
  const classes = areaArray.map(area => safeAreaPadding[area]);
  
  return cn(...classes, className);
}

/**
 * Component-specific safe area presets
 */
export const safeAreaPresets = {
  // Mobile header (e.g., navigation bar)
  mobileHeader: cn(
    'pt-safe',
    'min-h-[44px]',
    'sticky top-0 z-50'
  ),
  
  // Mobile footer (e.g., tab bar)
  mobileFooter: cn(
    'pb-safe',
    'min-h-[48px]',
    'fixed bottom-0 left-0 right-0 z-40'
  ),
  
  // Full screen content
  fullScreen: cn(
    'min-h-screen',
    'safe-area-all'
  ),
  
  // Modal/sheet that covers safe areas
  modal: cn(
    'fixed inset-0',
    'safe-area-all'
  ),
  
  // Content container with horizontal safe areas
  container: cn(
    'w-full',
    'px-safe'
  ),
  
  // Floating action button position
  fab: cn(
    'fixed',
    'bottom-safe right-safe',
    'mb-4 mr-4'
  ),
} as const;

/**
 * React hook for detecting notch/safe area support
 */
export function useSafeAreaDetection() {
  if (typeof window === 'undefined') return false;
  
  // Check if CSS env() is supported
  const hasEnvSupport = CSS.supports('padding-top', 'env(safe-area-inset-top)');
  
  if (!hasEnvSupport) return false;
  
  // Check if any safe area values are non-zero
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  const safeTop = computedStyle.getPropertyValue('--safe-area-top');
  const safeBottom = computedStyle.getPropertyValue('--safe-area-bottom');
  
  return (
    (safeTop && safeTop !== '0px') ||
    (safeBottom && safeBottom !== '0px')
  );
}

/**
 * CSS variable names for safe areas
 */
export const safeAreaVars = {
  top: 'var(--safe-area-top, 0px)',
  right: 'var(--safe-area-right, 0px)',
  bottom: 'var(--safe-area-bottom, 0px)',
  left: 'var(--safe-area-left, 0px)',
} as const;

/**
 * Tailwind-compatible safe area utilities
 * Add these to your global CSS:
 * 
 * .safe-area-all {
 *   padding-top: env(safe-area-inset-top);
 *   padding-right: env(safe-area-inset-right);
 *   padding-bottom: env(safe-area-inset-bottom);
 *   padding-left: env(safe-area-inset-left);
 * }
 * 
 * .safe-area-top, .pt-safe {
 *   padding-top: env(safe-area-inset-top);
 * }
 * 
 * .safe-area-bottom, .pb-safe {
 *   padding-bottom: env(safe-area-inset-bottom);
 * }
 * 
 * .safe-area-left, .pl-safe {
 *   padding-left: env(safe-area-inset-left);
 * }
 * 
 * .safe-area-right, .pr-safe {
 *   padding-right: env(safe-area-inset-right);
 * }
 * 
 * .safe-area-x, .px-safe {
 *   padding-left: env(safe-area-inset-left);
 *   padding-right: env(safe-area-inset-right);
 * }
 * 
 * .safe-area-y, .py-safe {
 *   padding-top: env(safe-area-inset-top);
 *   padding-bottom: env(safe-area-inset-bottom);
 * }
 * 
 * .bottom-safe {
 *   bottom: env(safe-area-inset-bottom);
 * }
 * 
 * .right-safe {
 *   right: env(safe-area-inset-right);
 * }
 */