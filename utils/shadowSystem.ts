/**
 * Standardized Shadow System
 * Consistent elevation levels across the application
 */

export const shadows = {
  // Base shadows for different elevation levels
  none: 'shadow-none',
  xs: 'shadow-xs', // 0 1px 2px 0 rgba(0, 0, 0, 0.05)
  sm: 'shadow-sm', // 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
  md: 'shadow-md', // 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
  lg: 'shadow-lg', // 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
  xl: 'shadow-xl', // 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
  '2xl': 'shadow-2xl', // 0 25px 50px -12px rgba(0, 0, 0, 0.25)
  
  // Component-specific shadows
  card: 'shadow-sm hover:shadow-md transition-shadow duration-200',
  cardHover: 'shadow-md',
  cardActive: 'shadow-lg',
  
  button: 'shadow-sm hover:shadow-md active:shadow-sm transition-shadow duration-200',
  buttonPrimary: 'shadow-md hover:shadow-lg active:shadow-md transition-shadow duration-200',
  
  dropdown: 'shadow-lg',
  modal: 'shadow-2xl',
  
  input: 'shadow-sm focus:shadow-md transition-shadow duration-200',
  inputError: 'shadow-sm ring-2 ring-red-500/20',
  
  // Dark mode optimized shadows (with colored tint)
  cardDark: 'shadow-sm shadow-gray-900/50 hover:shadow-md hover:shadow-gray-900/50',
  buttonDark: 'shadow-sm shadow-gray-900/50 hover:shadow-md hover:shadow-gray-900/50',
} as const;

/**
 * Get shadow class for a component
 * @param component - Component type
 * @param state - Optional state (hover, active, etc.)
 * @param isDark - Whether dark mode is active
 */
export function getShadow(
  component: keyof typeof shadows,
  state?: 'default' | 'hover' | 'active' | 'focus',
  isDark?: boolean
): string {
  if (isDark && component === 'card') {
    return shadows.cardDark;
  }
  
  if (state === 'hover' && component === 'card') {
    return shadows.cardHover;
  }
  
  if (state === 'active' && component === 'card') {
    return shadows.cardActive;
  }
  
  return shadows[component] || shadows.sm;
}

/**
 * CSS-in-JS shadow values for dynamic styling
 */
export const shadowValues = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;