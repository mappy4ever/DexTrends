/**
 * Standardized Border Radius System
 * Consistent corner rounding across the application
 */

export const borderRadius = {
  // Base radius values
  none: 'rounded-none',    // 0px
  sm: 'rounded',           // 4px
  md: 'rounded-md',        // 6px
  lg: 'rounded-lg',        // 8px
  xl: 'rounded-xl',        // 12px
  '2xl': 'rounded-2xl',    // 16px
  '3xl': 'rounded-3xl',    // 24px
  full: 'rounded-full',    // 9999px
  
  // Component-specific radius
  button: 'rounded-lg',       // 8px
  card: 'rounded-2xl',        // 16px
  modal: 'rounded-2xl',       // 16px
  input: 'rounded-lg',        // 8px
  badge: 'rounded-full',      // 9999px
  chip: 'rounded-full',       // 9999px
  dropdown: 'rounded-xl',     // 12px
  tooltip: 'rounded-lg',      // 8px
  
  // Special cases
  pokemonCard: 'rounded-2xl', // 16px - for Pokemon cards
  tcgCard: 'rounded-xl',      // 12px - for TCG cards (actual card shape)
  tcgSetCard: 'rounded-2xl',  // 16px - for TCG set preview cards
  imageCard: 'rounded-xl',    // 12px - for image-heavy cards
} as const;

/**
 * Get border radius class for a component
 * @param component - Component type
 * @param override - Optional override value
 */
export function getBorderRadius(
  component: keyof typeof borderRadius,
  override?: keyof typeof borderRadius
): string {
  if (override) {
    return borderRadius[override];
  }
  
  return borderRadius[component] || borderRadius.lg;
}

/**
 * CSS-in-JS radius values for dynamic styling
 */
export const radiusValues = {
  none: '0px',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
} as const;