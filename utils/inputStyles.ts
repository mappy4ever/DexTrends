/**
 * Standardized Input Styles
 * Prevents mobile zoom by ensuring minimum 16px font size
 * Provides consistent styling across all input elements
 */

import { cn } from '@/utils/cn';

export const inputSizes = {
  sm: 'text-base px-3 py-2 min-h-[40px]', // 16px font minimum
  md: 'text-base px-4 py-2.5 min-h-[48px]', // 16px font
  lg: 'text-lg px-5 py-3 min-h-[56px]', // 18px font
  xl: 'text-lg px-6 py-4 min-h-[64px]', // 18px font
} as const;

export const inputVariants = {
  default: cn(
    'w-full',
    'text-base', // Minimum 16px to prevent zoom
    'bg-white dark:bg-gray-800',
    'border-2 border-gray-200 dark:border-gray-700',
    'rounded-lg',
    'shadow-sm',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
    'focus:outline-none focus:border-purple-500 dark:focus:border-purple-400',
    'focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20',
    'transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    '[&:not(:placeholder-shown)]:text-gray-900 dark:[&:not(:placeholder-shown)]:text-white'
  ),
  
  search: cn(
    'w-full',
    'text-base', // Minimum 16px
    'bg-white dark:bg-gray-800',
    'border-2 border-gray-200 dark:border-gray-700',
    'rounded-full',
    'shadow-lg',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
    'focus:outline-none focus:border-purple-500 dark:focus:border-purple-400',
    'focus:shadow-xl',
    'transition-all duration-200'
  ),
  
  minimal: cn(
    'w-full',
    'text-base', // Minimum 16px
    'bg-transparent',
    'border-b-2 border-gray-300 dark:border-gray-600',
    'rounded-none',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
    'focus:outline-none focus:border-purple-500 dark:focus:border-purple-400',
    'transition-colors duration-200'
  ),
  
  solid: cn(
    'w-full',
    'text-base', // Minimum 16px
    'bg-gray-100 dark:bg-gray-900',
    'border-2 border-transparent',
    'rounded-lg',
    'placeholder:text-gray-500 dark:placeholder:text-gray-400',
    'focus:outline-none focus:bg-white dark:focus:bg-gray-800',
    'focus:border-purple-500 dark:focus:border-purple-400',
    'transition-all duration-200'
  )
} as const;

/**
 * Get input classes with proper sizing to prevent mobile zoom
 * @param size - Size variant
 * @param variant - Style variant
 * @param className - Additional classes
 */
export function getInputClasses(
  size: keyof typeof inputSizes = 'md',
  variant: keyof typeof inputVariants = 'default',
  className?: string
): string {
  return cn(
    inputVariants[variant],
    inputSizes[size],
    className
  );
}

/**
 * Input wrapper classes for consistent spacing
 */
export const inputWrapperClasses = {
  default: 'relative w-full',
  withIcon: 'relative w-full',
  withLabel: 'space-y-2',
  group: 'space-y-4',
} as const;

/**
 * Input label classes
 */
export const inputLabelClasses = cn(
  'block',
  'text-sm font-medium',
  'text-gray-700 dark:text-gray-300',
  'mb-1'
);

/**
 * Input error classes
 */
export const inputErrorClasses = cn(
  'border-red-500 dark:border-red-400',
  'focus:border-red-500 dark:focus:border-red-400',
  'focus:ring-red-500/20 dark:focus:ring-red-400/20'
);

/**
 * Input helper text classes
 */
export const inputHelperClasses = cn(
  'mt-1',
  'text-sm',
  'text-gray-500 dark:text-gray-400'
);

/**
 * Textarea specific classes (maintains 16px minimum)
 */
export const textareaClasses = cn(
  'min-h-[100px]',
  'resize-y',
  'text-base' // Minimum 16px
);

/**
 * Select specific classes (maintains 16px minimum)
 */
export const selectClasses = cn(
  'appearance-none',
  'bg-no-repeat',
  'bg-right',
  'pr-10',
  'text-base', // Minimum 16px
  'cursor-pointer',
  '[&>option]:text-base' // Options also 16px
);

/**
 * Mobile-specific input adjustments
 */
export const mobileInputClasses = cn(
  'text-base', // Force 16px on mobile
  'touch-manipulation', // Disable double-tap zoom
  '[&::-webkit-inner-spin-button]:appearance-none',
  '[&::-webkit-outer-spin-button]:appearance-none',
  '[&[type="number"]]:appearance-textfield'
);