/**
 * Standardized Border Color System
 * Ensures consistent border colors across all components
 */

import { cn } from '@/utils/cn';

/**
 * Base border colors for different contexts
 */
export const borderColors = {
  // Default borders
  default: 'border-gray-200 dark:border-gray-700',
  subtle: 'border-gray-100 dark:border-gray-800',
  strong: 'border-gray-300 dark:border-gray-600',
  
  // Interactive states
  hover: 'hover:border-gray-300 dark:hover:border-gray-600',
  focus: 'focus:border-purple-500 dark:focus:border-purple-400',
  active: 'active:border-purple-600 dark:active:border-purple-500',
  
  // Component-specific
  card: 'border-gray-200 dark:border-gray-700',
  cardHover: 'hover:border-gray-300 dark:hover:border-gray-600',
  
  input: 'border-gray-300 dark:border-gray-600',
  inputFocus: 'focus:border-purple-500 dark:focus:border-purple-400',
  inputError: 'border-red-500 dark:border-red-400',
  
  divider: 'border-gray-200 dark:border-gray-700',
  
  // Status colors
  success: 'border-green-500 dark:border-green-400',
  warning: 'border-yellow-500 dark:border-yellow-400',
  error: 'border-red-500 dark:border-red-400',
  info: 'border-blue-500 dark:border-blue-400',
  
  // Transparent
  transparent: 'border-transparent',
  
  // Type-specific borders for Pokemon
  typeNormal: 'border-gray-400 dark:border-gray-500',
  typeFire: 'border-orange-500 dark:border-orange-400',
  typeWater: 'border-blue-500 dark:border-blue-400',
  typeElectric: 'border-yellow-400 dark:border-yellow-300',
  typeGrass: 'border-green-500 dark:border-green-400',
  typeIce: 'border-cyan-400 dark:border-cyan-300',
  typeFighting: 'border-red-600 dark:border-red-500',
  typePoison: 'border-purple-500 dark:border-purple-400',
  typeGround: 'border-yellow-600 dark:border-yellow-500',
  typeFlying: 'border-indigo-400 dark:border-indigo-300',
  typePsychic: 'border-pink-500 dark:border-pink-400',
  typeBug: 'border-lime-500 dark:border-lime-400',
  typeRock: 'border-yellow-700 dark:border-yellow-600',
  typeGhost: 'border-purple-600 dark:border-purple-500',
  typeDragon: 'border-indigo-600 dark:border-indigo-500',
  typeDark: 'border-gray-700 dark:border-gray-600',
  typeSteel: 'border-gray-500 dark:border-gray-400',
  typeFairy: 'border-pink-400 dark:border-pink-300',
} as const;

/**
 * Border width classes
 */
export const borderWidths = {
  none: 'border-0',
  thin: 'border',
  default: 'border-2',
  thick: 'border-4',
} as const;

/**
 * Border styles
 */
export const borderStyles = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
  double: 'border-double',
} as const;

/**
 * Get border classes for a component
 * @param color - Border color key
 * @param width - Border width
 * @param style - Border style
 * @param className - Additional classes
 */
export function getBorderClasses(
  color: keyof typeof borderColors = 'default',
  width: keyof typeof borderWidths = 'thin',
  style: keyof typeof borderStyles = 'solid',
  className?: string
): string {
  return cn(
    borderColors[color],
    borderWidths[width],
    borderStyles[style],
    className
  );
}

/**
 * Common border combinations
 */
export const borderPresets = {
  // Cards
  card: getBorderClasses('card', 'thin'),
  cardHover: cn(getBorderClasses('card', 'thin'), borderColors.cardHover),
  cardActive: getBorderClasses('strong', 'default'),
  
  // Inputs
  input: getBorderClasses('input', 'default'),
  inputFocus: cn(getBorderClasses('input', 'default'), borderColors.inputFocus),
  inputError: getBorderClasses('error', 'default'),
  
  // Sections
  section: getBorderClasses('divider', 'thin'),
  divider: cn('border-t', borderColors.divider),
  
  // Tables
  tableHeader: cn('border-b', borderColors.strong),
  tableRow: cn('border-b', borderColors.subtle),
  tableCell: borderColors.subtle,
  
  // Modals
  modal: getBorderClasses('default', 'thin'),
  modalHeader: cn('border-b', borderColors.default),
  modalFooter: cn('border-t', borderColors.default),
} as const;

/**
 * Type-specific border getter for Pokemon types
 * @param type - Pokemon type
 */
export function getTypeBorder(type: string): string {
  const typeKey = `type${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()}` as keyof typeof borderColors;
  return borderColors[typeKey] || borderColors.default;
}