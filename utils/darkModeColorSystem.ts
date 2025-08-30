/**
 * Standardized Dark Mode Color System
 * Ensures consistent colors across light and dark modes
 */

import { cn } from '@/utils/cn';

/**
 * Semantic color mappings for consistent theming
 */
export const semanticColors = {
  // Background colors
  background: {
    primary: 'bg-white dark:bg-black',
    secondary: 'bg-gray-50 dark:bg-gray-950',
    tertiary: 'bg-gray-100 dark:bg-gray-900',
    elevated: 'bg-white dark:bg-gray-900',
    card: 'bg-white dark:bg-gray-800',
    modal: 'bg-white dark:bg-gray-900',
    overlay: 'bg-black/20 dark:bg-black/50',
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-800',
    active: 'active:bg-gray-100 dark:active:bg-gray-700',
  },
  
  // Text colors
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-700 dark:text-gray-300',
    tertiary: 'text-gray-600 dark:text-gray-400',
    muted: 'text-gray-500 dark:text-gray-500',
    disabled: 'text-gray-400 dark:text-gray-600',
    link: 'text-blue-600 dark:text-blue-400',
    error: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  },
  
  // Border colors (consistent with borderColorSystem.ts)
  border: {
    default: 'border-gray-200 dark:border-gray-700',
    strong: 'border-gray-300 dark:border-gray-600',
    subtle: 'border-gray-100 dark:border-gray-800',
    hover: 'hover:border-gray-300 dark:hover:border-gray-600',
    focus: 'focus:border-purple-500 dark:focus:border-purple-400',
    error: 'border-red-500 dark:border-red-400',
    success: 'border-green-500 dark:border-green-400',
  },
  
  // Component-specific colors
  component: {
    // Buttons
    buttonPrimary: 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600',
    buttonSecondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600',
    buttonGhost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
    
    // Inputs
    inputBg: 'bg-white dark:bg-gray-900',
    inputBorder: 'border-gray-300 dark:border-gray-600',
    inputFocus: 'focus:border-purple-500 dark:focus:border-purple-400',
    
    // Cards
    cardBg: 'bg-white dark:bg-gray-800',
    cardHover: 'hover:bg-gray-50 dark:hover:bg-gray-750',
    cardBorder: 'border-gray-200 dark:border-gray-700',
    
    // Badges
    badgeBg: 'bg-gray-100 dark:bg-gray-800',
    badgeText: 'text-gray-700 dark:text-gray-300',
    
    // Tooltips
    tooltipBg: 'bg-gray-900 dark:bg-gray-100',
    tooltipText: 'text-white dark:text-gray-900',
    
    // Modals
    modalOverlay: 'bg-black/50 dark:bg-black/70',
    modalBg: 'bg-white dark:bg-gray-900',
    
    // Tables
    tableHeader: 'bg-gray-50 dark:bg-gray-900',
    tableRow: 'bg-white dark:bg-gray-800',
    tableRowHover: 'hover:bg-gray-50 dark:hover:bg-gray-750',
    tableRowStriped: 'even:bg-gray-50 dark:even:bg-gray-850',
  },
} as const;

/**
 * Gray scale with proper dark mode mappings
 * Maps light grays to dark grays appropriately
 */
export const grayScale = {
  50: 'gray-50 dark:gray-950',
  100: 'gray-100 dark:gray-900',
  200: 'gray-200 dark:gray-800',
  300: 'gray-300 dark:gray-700',
  400: 'gray-400 dark:gray-600',
  500: 'gray-500 dark:gray-500',
  600: 'gray-600 dark:gray-400',
  700: 'gray-700 dark:gray-300',
  800: 'gray-800 dark:gray-200',
  900: 'gray-900 dark:gray-100',
  950: 'gray-950 dark:gray-50',
} as const;

/**
 * Get semantic color classes
 */
export function getSemanticColor(
  category: keyof typeof semanticColors,
  variant: string,
  className?: string
): string {
  const categoryColors = semanticColors[category] as Record<string, string>;
  return cn(categoryColors[variant] || '', className);
}

/**
 * Component presets using semantic colors
 */
export const componentPresets = {
  // Page layouts
  pageBackground: semanticColors.background.primary,
  pageSectionBg: semanticColors.background.secondary,
  
  // Headers
  headerBg: cn(semanticColors.background.primary, 'border-b', semanticColors.border.default),
  headerText: semanticColors.text.primary,
  
  // Navigation
  navBg: semanticColors.background.primary,
  navLink: cn(semanticColors.text.secondary, 'hover:text-gray-900 dark:hover:text-white'),
  navLinkActive: semanticColors.text.primary,
  
  // Cards
  card: cn(
    semanticColors.component.cardBg,
    'border',
    semanticColors.component.cardBorder,
    'shadow-sm hover:shadow-md',
    'transition-shadow duration-200'
  ),
  
  // Forms
  formInput: cn(
    semanticColors.component.inputBg,
    'border',
    semanticColors.component.inputBorder,
    semanticColors.component.inputFocus,
    semanticColors.text.primary
  ),
  
  // Buttons
  buttonPrimary: cn(
    semanticColors.component.buttonPrimary,
    'text-white',
    'transition-colors duration-200'
  ),
  buttonSecondary: cn(
    semanticColors.component.buttonSecondary,
    semanticColors.text.primary,
    'transition-colors duration-200'
  ),
  
  // Tables
  tableContainer: cn(
    semanticColors.background.card,
    'border',
    semanticColors.border.default,
    'rounded-lg overflow-hidden'
  ),
  tableHeader: cn(
    semanticColors.component.tableHeader,
    semanticColors.text.secondary,
    'font-semibold'
  ),
  tableRow: cn(
    semanticColors.component.tableRow,
    semanticColors.component.tableRowHover,
    'border-b',
    semanticColors.border.subtle
  ),
} as const;

/**
 * Contrast checker for accessibility
 */
export function hasGoodContrast(
  foreground: 'light' | 'dark',
  background: 'light' | 'dark'
): boolean {
  return foreground !== background;
}

/**
 * Get appropriate text color based on background
 */
export function getContrastText(isDarkBg: boolean): string {
  return isDarkBg ? 'text-white' : 'text-gray-900';
}

/**
 * Fix common dark mode issues
 * Use these patterns to ensure consistency
 */
export const darkModePatterns = {
  // Never use these
  avoid: [
    'text-black dark:text-white', // Too harsh contrast
    'bg-gray-50 dark:bg-gray-900', // Inconsistent depth
    'text-gray-800 dark:text-gray-200', // Better to use semantic colors
  ],
  
  // Use these instead
  recommended: [
    semanticColors.text.primary, // For main text
    semanticColors.text.secondary, // For secondary text
    semanticColors.background.card, // For card backgrounds
    semanticColors.border.default, // For borders
  ],
} as const;

/**
 * Extended gray colors for special cases
 * Custom gray shades not in Tailwind by default
 */
export const extendedGrays = {
  750: 'bg-gray-750', // Between 700 and 800
  850: 'bg-gray-850', // Between 800 and 900
} as const;

/**
 * Add these to tailwind.config.js:
 * 
 * extend: {
 *   colors: {
 *     gray: {
 *       750: '#2D3748',
 *       850: '#1A202C',
 *     }
 *   }
 * }
 */