/**
 * Standardized Loading System
 * Provides consistent loading states, spinners, and skeletons across the application
 */

import { cn } from '@/utils/cn';

/**
 * Loading spinner sizes
 */
export const spinnerSizes = {
  xs: 'w-3 h-3',    // 12px
  sm: 'w-4 h-4',    // 16px
  md: 'w-6 h-6',    // 24px
  lg: 'w-8 h-8',    // 32px
  xl: 'w-12 h-12',  // 48px
} as const;

/**
 * Loading spinner component
 */
export function LoadingSpinner({
  size = 'md',
  className,
  color = 'border-purple-500',
}: {
  size?: keyof typeof spinnerSizes;
  className?: string;
  color?: string;
}) {
  return `
    <div className="${cn(
      'inline-block animate-spin rounded-full',
      'border-2 border-solid border-current border-r-transparent',
      'align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]',
      spinnerSizes[size],
      color,
      className
    )}" role="status">
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  `;
}

/**
 * Skeleton loader base styles
 */
export const skeletonBase = cn(
  'animate-pulse',
  'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
  'dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
  'bg-[length:200%_100%]',
  'animate-shimmer'
);

/**
 * Skeleton loader presets
 */
export const skeletonPresets = {
  // Text skeletons
  text: cn(skeletonBase, 'h-4 rounded'),
  textSm: cn(skeletonBase, 'h-3 rounded'),
  textLg: cn(skeletonBase, 'h-6 rounded'),
  heading: cn(skeletonBase, 'h-8 rounded'),
  
  // Card skeletons
  card: cn(skeletonBase, 'rounded-2xl'),
  cardSmall: cn(skeletonBase, 'h-32 rounded-2xl'),
  cardMedium: cn(skeletonBase, 'h-48 rounded-2xl'),
  cardLarge: cn(skeletonBase, 'h-64 rounded-2xl'),
  
  // Pokemon card skeleton
  pokemonCard: cn(skeletonBase, 'aspect-[5/7] rounded-2xl'),
  
  // Image skeletons
  image: cn(skeletonBase, 'aspect-square rounded-lg'),
  avatar: cn(skeletonBase, 'rounded-full'),
  
  // Button skeleton
  button: cn(skeletonBase, 'h-12 rounded-lg'),
  buttonSm: cn(skeletonBase, 'h-10 rounded-lg'),
  
  // Input skeleton
  input: cn(skeletonBase, 'h-12 rounded-lg'),
  
  // Table row skeleton
  tableRow: cn(skeletonBase, 'h-12'),
} as const;

/**
 * Get skeleton classes
 */
export function getSkeletonClasses(
  preset: keyof typeof skeletonPresets,
  className?: string
): string {
  return cn(skeletonPresets[preset], className);
}

/**
 * Loading states for different components
 */
export const loadingStates = {
  // Page loading
  page: {
    spinner: 'flex items-center justify-center min-h-[60vh]',
    skeleton: 'space-y-4 p-6',
  },
  
  // Card grid loading
  cardGrid: {
    container: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    skeleton: skeletonPresets.pokemonCard,
  },
  
  // List loading
  list: {
    container: 'space-y-2',
    skeleton: 'h-16 rounded-lg',
  },
  
  // Table loading
  table: {
    container: 'space-y-1',
    skeleton: 'h-12 rounded',
  },
  
  // Form loading
  form: {
    container: 'space-y-4',
    skeleton: 'h-12 rounded-lg',
  },
} as const;

/**
 * Loading overlay component
 */
export const loadingOverlay = cn(
  'absolute inset-0 z-50',
  'bg-white/80 dark:bg-black/80',
  'backdrop-blur-sm',
  'flex items-center justify-center'
);

/**
 * Progressive loading animation
 */
export const progressiveLoadingAnimation = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 },
} as const;

/**
 * Stagger children animation for loading lists
 */
export const staggerLoadingAnimation = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  },
} as const;

/**
 * Loading dots animation
 */
export const loadingDots = cn(
  'inline-flex items-center gap-1',
  '[&>span]:inline-block [&>span]:w-2 [&>span]:h-2',
  '[&>span]:bg-current [&>span]:rounded-full',
  '[&>span]:animate-bounce',
  '[&>span:nth-child(2)]:animation-delay-150',
  '[&>span:nth-child(3)]:animation-delay-300'
);

/**
 * Get loading component based on type
 */
export function getLoadingComponent(
  type: 'spinner' | 'skeleton' | 'dots' = 'spinner',
  options?: {
    size?: keyof typeof spinnerSizes;
    preset?: keyof typeof skeletonPresets;
    className?: string;
  }
): string {
  switch (type) {
    case 'spinner':
      return `<div className="${spinnerSizes[options?.size || 'md']} ${options?.className || ''}"></div>`;
    case 'skeleton':
      return `<div className="${skeletonPresets[options?.preset || 'text']} ${options?.className || ''}"></div>`;
    case 'dots':
      return `<div className="${loadingDots} ${options?.className || ''}"><span></span><span></span><span></span></div>`;
    default:
      return '';
  }
}

/**
 * CSS for shimmer animation (add to global styles)
 * @keyframes shimmer {
 *   0% { background-position: -200% 0; }
 *   100% { background-position: 200% 0; }
 * }
 * 
 * .animate-shimmer {
 *   animation: shimmer 2s linear infinite;
 * }
 * 
 * .animation-delay-150 {
 *   animation-delay: 150ms;
 * }
 * 
 * .animation-delay-300 {
 *   animation-delay: 300ms;
 * }
 */