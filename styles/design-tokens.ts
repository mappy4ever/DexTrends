/**
 * Design Tokens for DexTrends UI/UX System
 * This file contains all standardized design values to ensure consistency
 * across the application. Import these tokens instead of using arbitrary values.
 */

// Border Radius Tokens
export const borderRadius = {
  none: '0px',         // Sharp edges - avoid using
  sm: '6px',          // Small elements (badges inner content)
  md: '8px',          // Badges, chips
  lg: '12px',         // Modals, dropdowns
  xl: '16px',         // Standard cards
  xxl: '24px',        // Hero cards, featured content
  full: '9999px'      // Buttons, circular elements
} as const;

// Tailwind Classes for Border Radius
export const borderRadiusClasses = {
  none: 'rounded-none',
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  xxl: 'rounded-3xl',
  full: 'rounded-full'
} as const;

// Spacing Scale
export const spacing = {
  0: '0',
  xs: '0.5rem',   // 8px - Tight spacing
  sm: '1rem',     // 16px - Default spacing
  md: '1.5rem',   // 24px - Comfortable spacing
  lg: '2rem',     // 32px - Section spacing
  xl: '3rem',     // 48px - Large sections
  xxl: '4rem'     // 64px - Hero sections
} as const;

// Typography Scale
export const typography = {
  // Font sizes with semantic naming
  display: 'text-5xl font-bold',      // Page titles
  h1: 'text-4xl font-bold',           // Section headers
  h2: 'text-3xl font-semibold',       // Subsection headers
  h3: 'text-2xl font-semibold',       // Card titles
  h4: 'text-xl font-medium',          // List headers
  body: 'text-base font-normal',      // Body text
  small: 'text-sm',                   // Secondary text
  tiny: 'text-xs',                    // Metadata
  
  // Color schemes with accessibility in mind
  colors: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-700 dark:text-gray-300',
    muted: 'text-gray-600 dark:text-gray-400',    // Minimum for important content
    disabled: 'text-gray-500 dark:text-gray-500'  // Only for disabled states
  }
} as const;

// Glass Morphism Effects
export const glassEffect = {
  // Light mode glass
  light: {
    background: 'bg-white/80',
    backdropFilter: 'backdrop-blur-xl',
    border: 'border border-white/20'
  },
  // Dark mode glass
  dark: {
    background: 'dark:bg-gray-900/80',
    backdropFilter: 'backdrop-blur-xl',
    border: 'dark:border-white/10'
  },
  // Combined classes
  combined: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10'
} as const;

// Shadow Tokens
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
  none: 'shadow-none'
} as const;

// Animation Durations
export const animations = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  verySlow: '1000ms'
} as const;

// Z-Index Scale
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70
} as const;

// Component-Specific Tokens
export const components = {
  // Button styles
  button: {
    primary: {
      base: 'px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium transition-all duration-300',
      rounded: borderRadiusClasses.full,
      hover: 'hover:shadow-lg hover:scale-105',
      active: 'active:scale-95'
    },
    secondary: {
      base: 'px-6 py-3 border-2 border-gray-300 dark:border-gray-600 font-medium transition-all duration-300',
      rounded: borderRadiusClasses.full,
      hover: 'hover:bg-gray-100 dark:hover:bg-gray-800',
      active: 'active:scale-95'
    }
  },
  
  // Card styles
  card: {
    standard: {
      base: 'bg-white dark:bg-gray-800 shadow-lg',
      rounded: borderRadiusClasses.xl,
      padding: 'p-6'
    },
    glass: {
      base: glassEffect.combined,
      rounded: borderRadiusClasses.xl,
      padding: 'p-6'
    },
    hero: {
      base: 'bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20',
      rounded: borderRadiusClasses.xxl,
      padding: 'p-8'
    }
  },
  
  // Modal styles
  modal: {
    backdrop: 'fixed inset-0 bg-black/50 backdrop-blur-sm',
    container: {
      base: 'bg-white dark:bg-gray-900 shadow-2xl',
      rounded: borderRadiusClasses.xl,
      padding: 'p-8'
    }
  },
  
  // Input styles
  input: {
    base: 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 transition-colors',
    rounded: borderRadiusClasses.lg,
    focus: 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
  },
  
  // Badge styles
  badge: {
    base: 'inline-flex items-center px-3 py-1 text-sm font-medium',
    rounded: borderRadiusClasses.md
  }
} as const;

// Breakpoints (matching Tailwind defaults)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Utility function to combine classes
export const combineClasses = (...classes: string[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Type exports for TypeScript
export type BorderRadiusKey = keyof typeof borderRadius;
export type SpacingKey = keyof typeof spacing;
export type TypographyKey = keyof typeof typography;
export type ShadowKey = keyof typeof shadows;
export type AnimationKey = keyof typeof animations;
export type ZIndexKey = keyof typeof zIndex;
export type BreakpointKey = keyof typeof breakpoints;