/**
 * Standardized Spacing System
 * Ensures consistent spacing throughout the application
 */

import { cn } from '@/utils/cn';

/**
 * Base spacing scale (using Tailwind's spacing scale)
 */
export const spacing = {
  0: 'p-0',
  0.5: 'p-0.5',  // 2px
  1: 'p-1',      // 4px
  1.5: 'p-1.5',  // 6px
  2: 'p-2',      // 8px
  2.5: 'p-2.5',  // 10px
  3: 'p-3',      // 12px
  4: 'p-4',      // 16px
  5: 'p-5',      // 20px
  6: 'p-6',      // 24px
  7: 'p-7',      // 28px
  8: 'p-8',      // 32px
  9: 'p-9',      // 36px
  10: 'p-10',    // 40px
  12: 'p-12',    // 48px
  14: 'p-14',    // 56px
  16: 'p-16',    // 64px
  20: 'p-20',    // 80px
} as const;

/**
 * Section spacing presets
 */
export const sectionSpacing = {
  // Vertical spacing between sections
  xs: 'py-4',      // 16px
  sm: 'py-6',      // 24px
  md: 'py-8',      // 32px
  lg: 'py-12',     // 48px
  xl: 'py-16',     // 64px
  '2xl': 'py-20',  // 80px
  
  // Mobile-optimized spacing
  mobile: 'py-4 md:py-8',
  mobileLight: 'py-3 md:py-6',
  mobileHeavy: 'py-6 md:py-12',
} as const;

/**
 * Container padding presets
 */
export const containerPadding = {
  // Standard container padding
  default: 'px-4 md:px-6',
  tight: 'px-3 md:px-4',
  comfortable: 'px-6 md:px-8',
  loose: 'px-8 md:px-12',
  
  // Full padding (all sides)
  allDefault: 'p-4 md:p-6',
  allTight: 'p-3 md:p-4',
  allComfortable: 'p-6 md:p-8',
  allLoose: 'p-8 md:p-12',
} as const;

/**
 * Component spacing presets
 */
export const componentSpacing = {
  // Card padding
  card: 'p-4 md:p-6',
  cardCompact: 'p-3 md:p-4',
  cardLoose: 'p-6 md:p-8',
  
  // Button padding
  buttonSm: 'px-3 py-2',
  buttonMd: 'px-4 py-2.5',
  buttonLg: 'px-6 py-3',
  
  // List item spacing
  listItem: 'py-3 px-4',
  listItemCompact: 'py-2 px-3',
  listItemLoose: 'py-4 px-6',
  
  // Form field spacing
  formField: 'mb-4',
  formFieldCompact: 'mb-3',
  formFieldLoose: 'mb-6',
  
  // Modal padding
  modal: 'p-6',
  modalHeader: 'px-6 py-4',
  modalBody: 'px-6 py-4',
  modalFooter: 'px-6 py-4',
} as const;

/**
 * Gap spacing for flexbox/grid
 */
export const gapSpacing = {
  xs: 'gap-1',    // 4px
  sm: 'gap-2',    // 8px
  md: 'gap-4',    // 16px
  lg: 'gap-6',    // 24px
  xl: 'gap-8',    // 32px
  '2xl': 'gap-12', // 48px
  
  // Responsive gaps
  responsive: 'gap-4 md:gap-6',
  responsiveTight: 'gap-2 md:gap-4',
  responsiveLoose: 'gap-6 md:gap-8',
} as const;

/**
 * Margin utilities
 */
export const marginSpacing = {
  // Bottom margins for stacking elements
  stackXs: 'mb-2',
  stackSm: 'mb-4',
  stackMd: 'mb-6',
  stackLg: 'mb-8',
  stackXl: 'mb-12',
  
  // Section margins
  sectionBottom: 'mb-8 md:mb-12',
  sectionTop: 'mt-8 md:mt-12',
  
  // Auto margins
  autoHorizontal: 'mx-auto',
  autoVertical: 'my-auto',
} as const;

/**
 * Get spacing classes for a component
 * @param preset - Spacing preset key
 * @param className - Additional classes
 */
export function getSpacing(
  preset: 
    | keyof typeof sectionSpacing 
    | keyof typeof containerPadding 
    | keyof typeof componentSpacing,
  className?: string
): string {
  const allPresets = {
    ...sectionSpacing,
    ...containerPadding,
    ...componentSpacing
  };
  
  return cn(allPresets[preset as keyof typeof allPresets], className);
}

/**
 * Common page layout classes
 */
export const pageLayouts = {
  // Main content container
  container: cn(
    'max-w-7xl mx-auto',
    containerPadding.default
  ),
  
  // Hero section
  hero: cn(
    'max-w-7xl mx-auto',
    containerPadding.default,
    sectionSpacing.lg
  ),
  
  // Content section
  section: cn(
    'max-w-7xl mx-auto',
    containerPadding.default,
    sectionSpacing.md
  ),
  
  // Card grid
  cardGrid: cn(
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    gapSpacing.responsive
  ),
  
  // Feature grid
  featureGrid: cn(
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    gapSpacing.responsive
  ),
} as const;

/**
 * Responsive spacing utilities
 */
export const responsiveSpacing = {
  // Padding that adapts to screen size
  adaptive: 'p-4 sm:p-6 md:p-8 lg:p-10',
  adaptiveTight: 'p-3 sm:p-4 md:p-5 lg:p-6',
  adaptiveLoose: 'p-6 sm:p-8 md:p-10 lg:p-12',
  
  // Section spacing that grows with screen size
  sectionAdaptive: 'py-6 sm:py-8 md:py-12 lg:py-16',
  
  // Container that respects safe areas on mobile
  safeContainer: 'px-4 md:px-6 safe-area-x',
} as const;