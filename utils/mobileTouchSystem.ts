/**
 * Mobile Touch Optimization System
 * Ensures optimal touch interactions and mobile-specific enhancements
 */

import { cn } from '@/utils/cn';

/**
 * Touch target sizes (minimum 48px for accessibility)
 */
export const touchTargets = {
  // Minimum sizes
  minimum: 'min-h-[48px] min-w-[48px]',
  small: 'min-h-[40px] min-w-[40px]', // Only for less important actions
  medium: 'min-h-[48px] min-w-[48px]',
  large: 'min-h-[56px] min-w-[56px]',
  
  // Button specific
  button: 'min-h-[48px] px-6 py-3',
  buttonSmall: 'min-h-[40px] px-4 py-2',
  buttonLarge: 'min-h-[56px] px-8 py-4',
  
  // Icon button
  iconButton: 'h-12 w-12 p-3',
  iconButtonSmall: 'h-10 w-10 p-2',
  iconButtonLarge: 'h-14 w-14 p-4',
  
  // List items
  listItem: 'min-h-[56px] px-4 py-3',
  
  // Navigation items
  navItem: 'min-h-[48px] px-4 py-3',
  tabItem: 'min-h-[48px] px-6 py-3',
} as const;

/**
 * Touch feedback styles
 */
export const touchFeedback = {
  // Tap feedback
  tap: cn(
    'active:scale-95',
    'active:opacity-90',
    'transition-all duration-150'
  ),
  
  // Press feedback
  press: cn(
    'active:scale-90',
    'active:opacity-80',
    'transition-all duration-150'
  ),
  
  // Ripple effect (requires JS implementation)
  ripple: 'relative overflow-hidden touch-ripple',
  
  // Highlight
  highlight: cn(
    'active:bg-gray-100',
    'dark:active:bg-gray-800',
    'transition-colors duration-150'
  ),
  
  // No feedback (for disabled states)
  none: 'pointer-events-none opacity-50',
} as const;

/**
 * Swipe gesture classes
 */
export const swipeGestures = {
  // Enable horizontal swipe
  horizontal: cn(
    'touch-pan-y',
    'overflow-x-auto',
    'scrollbar-hide',
    '-webkit-overflow-scrolling-touch'
  ),
  
  // Enable vertical swipe
  vertical: cn(
    'touch-pan-x',
    'overflow-y-auto',
    'scrollbar-hide',
    '-webkit-overflow-scrolling-touch'
  ),
  
  // Snap scrolling
  snapX: 'snap-x snap-mandatory',
  snapY: 'snap-y snap-mandatory',
  snapCenter: 'snap-center',
  snapStart: 'snap-start',
  snapEnd: 'snap-end',
} as const;

/**
 * Mobile viewport optimizations
 */
export const mobileViewport = {
  // Prevent zoom on input focus
  preventZoom: 'text-base', // 16px minimum
  
  // Safe area padding for notched devices
  safeTop: 'pt-safe',
  safeBottom: 'pb-safe',
  safeX: 'px-safe',
  safeAll: 'p-safe',
  
  // Fullscreen layouts
  fullHeight: 'h-screen supports-[height:100dvh]:h-[100dvh]',
  fullWidth: 'w-screen max-w-none',
  
  // Bottom sheet safe area
  bottomSheet: cn(
    'pb-safe',
    'rounded-t-2xl',
    'bg-white dark:bg-gray-900',
    'shadow-2xl'
  ),
} as const;

/**
 * Mobile-specific spacing
 */
export const mobileSpacing = {
  // Compact spacing for mobile
  compact: 'p-3 gap-3',
  default: 'p-4 gap-4',
  comfortable: 'p-5 gap-5',
  
  // List spacing
  listCompact: 'py-2 px-3',
  listDefault: 'py-3 px-4',
  listComfortable: 'py-4 px-5',
  
  // Card spacing
  cardCompact: 'p-3',
  cardDefault: 'p-4',
  cardComfortable: 'p-5',
} as const;

/**
 * Pull-to-refresh styles
 */
export const pullToRefresh = {
  container: 'relative',
  indicator: cn(
    'absolute top-0 left-1/2 -translate-x-1/2',
    'transition-transform duration-300'
  ),
  pulling: 'translate-y-0',
  refreshing: 'translate-y-16 animate-spin',
} as const;

/**
 * Mobile navigation patterns
 */
export const mobileNav = {
  // Bottom navigation
  bottomNav: cn(
    'fixed bottom-0 left-0 right-0 z-40',
    'bg-white dark:bg-gray-900',
    'border-t border-gray-200 dark:border-gray-700',
    'pb-safe'
  ),
  
  // Drawer navigation
  drawer: cn(
    'fixed inset-y-0 left-0 z-50',
    'w-80 max-w-[85vw]',
    'bg-white dark:bg-gray-900',
    'shadow-2xl',
    'transform transition-transform duration-300'
  ),
  
  // Tab bar
  tabBar: cn(
    'flex items-center justify-around',
    'min-h-[56px]',
    'pb-safe'
  ),
} as const;

/**
 * Mobile form optimizations
 */
export const mobileForm = {
  // Input field
  input: cn(
    'min-h-[48px]',
    'text-base', // Prevent zoom
    'px-4 py-3',
    'rounded-lg',
    'touch-manipulation' // Disable double-tap zoom
  ),
  
  // Select field
  select: cn(
    'min-h-[48px]',
    'text-base',
    'px-4 py-3',
    'rounded-lg',
    'appearance-none'
  ),
  
  // Textarea
  textarea: cn(
    'min-h-[100px]',
    'text-base',
    'px-4 py-3',
    'rounded-lg',
    'resize-none'
  ),
  
  // Checkbox/Radio
  checkbox: cn(
    'h-6 w-6',
    'touch-manipulation'
  ),
  
  // Submit button
  submit: cn(
    'min-h-[56px]',
    'w-full',
    'text-base font-semibold',
    'rounded-lg',
    touchFeedback.tap
  ),
} as const;

/**
 * Performance optimizations for mobile
 */
export const mobilePerformance = {
  // GPU acceleration
  gpu: 'transform-gpu',
  
  // Will-change for animations
  willChange: 'will-change-transform',
  
  // Reduce motion for accessibility
  reduceMotion: 'motion-reduce:transition-none motion-reduce:animate-none',
  
  // Lazy loading
  lazy: 'loading-lazy',
  
  // Virtual scrolling marker
  virtual: 'data-virtual-scroll',
} as const;

/**
 * Get mobile-optimized classes
 */
export function getMobileClasses(
  components: Array<keyof typeof mobileComponents>,
  className?: string
): string {
  const classes = components.map(component => mobileComponents[component]);
  return cn(...classes, className);
}

/**
 * Combined mobile component presets
 */
export const mobileComponents = {
  // Mobile button
  button: cn(
    touchTargets.button,
    touchFeedback.tap,
    mobileForm.submit
  ),
  
  // Mobile card
  card: cn(
    mobileSpacing.cardDefault,
    'rounded-2xl',
    'shadow-sm',
    touchFeedback.highlight
  ),
  
  // Mobile list item
  listItem: cn(
    touchTargets.listItem,
    touchFeedback.highlight,
    'border-b border-gray-200 dark:border-gray-700'
  ),
  
  // Mobile input
  input: cn(
    mobileForm.input,
    'border border-gray-300 dark:border-gray-600',
    'focus:border-purple-500 dark:focus:border-purple-400'
  ),
  
  // Mobile modal
  modal: cn(
    mobileViewport.safeAll,
    'rounded-t-2xl',
    'bg-white dark:bg-gray-900'
  ),
} as const;

/**
 * CSS to add to global styles:
 * 
 * .touch-manipulation {
 *   touch-action: manipulation;
 * }
 * 
 * .touch-pan-x {
 *   touch-action: pan-x;
 * }
 * 
 * .touch-pan-y {
 *   touch-action: pan-y;
 * }
 * 
 * .scrollbar-hide {
 *   -ms-overflow-style: none;
 *   scrollbar-width: none;
 * }
 * 
 * .scrollbar-hide::-webkit-scrollbar {
 *   display: none;
 * }
 */