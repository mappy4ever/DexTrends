/**
 * Unified Glass Morphism Design System Constants
 * Ensures consistency across all glass components
 */

// Glass blur levels
export const GLASS_BLUR = {
  sm: 'backdrop-blur-sm',     // 4px
  md: 'backdrop-blur-md',     // 8px  
  lg: 'backdrop-blur-lg',     // 16px
  xl: 'backdrop-blur-xl',     // 24px
  '2xl': 'backdrop-blur-2xl', // 40px
  '3xl': 'backdrop-blur-3xl', // 64px
} as const;

// Glass background opacity
export const GLASS_OPACITY = {
  light: {
    subtle: 'bg-white/70 dark:bg-gray-800/70',
    medium: 'bg-white/80 dark:bg-gray-800/80',
    strong: 'bg-white/90 dark:bg-gray-800/90',
  },
  gradient: {
    subtle: 'bg-gradient-to-br from-white/70 via-purple-50/50 to-white/70 dark:from-gray-800/70 dark:via-purple-900/30 dark:to-gray-900/70',
    medium: 'bg-gradient-to-br from-white/80 via-purple-50/60 to-white/80 dark:from-gray-800/80 dark:via-purple-900/30 dark:to-gray-900/80',
    strong: 'bg-gradient-to-br from-white/90 via-purple-50/70 to-white/90 dark:from-gray-800/90 dark:via-purple-900/30 dark:to-gray-900/90',
  }
} as const;

// Glass borders
export const GLASS_BORDER = {
  subtle: 'border border-white/20 dark:border-gray-700/20',
  medium: 'border border-white/30 dark:border-gray-700/30',
  strong: 'border border-white/50 dark:border-gray-700/50',
} as const;

// Glass shadows
export const GLASS_SHADOW = {
  sm: 'shadow-sm',
  md: 'shadow-lg',
  lg: 'shadow-xl',
  xl: 'shadow-2xl',
  glow: 'shadow-[0_8px_32px_rgba(139,92,246,0.15)]',
  glowHover: 'hover:shadow-[0_16px_48px_rgba(139,92,246,0.25)]',
} as const;

// Glass rounded corners
export const GLASS_ROUNDED = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  full: 'rounded-full',
} as const;

// Animation transitions
export const GLASS_TRANSITION = {
  fast: 'transition-all duration-200 ease-out',
  medium: 'transition-all duration-300 ease-out',
  slow: 'transition-all duration-500 ease-out',
  smooth: 'transition-all duration-700 ease-in-out',
} as const;

// Hover effects
export const GLASS_HOVER = {
  none: '',
  shadowOnly: 'hover:shadow-2xl',
  subtle: 'hover:scale-[1.02] hover:shadow-xl',
  medium: 'hover:scale-[1.03] hover:shadow-2xl',
  lift: 'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl',
  glow: 'hover:shadow-[0_16px_48px_rgba(139,92,246,0.25)]',
} as const;

// Standard glass component classes
export const GLASS_STYLES = {
  // Basic glass card
  card: `
    ${GLASS_BLUR.xl}
    ${GLASS_OPACITY.gradient.medium}
    ${GLASS_BORDER.medium}
    ${GLASS_SHADOW.xl}
    ${GLASS_ROUNDED.xl}
    ${GLASS_TRANSITION.medium}
    ${GLASS_HOVER.subtle}
  `,
  
  // Glass container
  container: `
    ${GLASS_BLUR.xl}
    ${GLASS_OPACITY.light.medium}
    ${GLASS_BORDER.subtle}
    ${GLASS_SHADOW.lg}
    ${GLASS_ROUNDED.lg}
  `,
  
  // Glass orb
  orb: `
    ${GLASS_BLUR.xl}
    ${GLASS_OPACITY.light.strong}
    ${GLASS_BORDER.strong}
    ${GLASS_SHADOW.xl}
    ${GLASS_ROUNDED.full}
  `,
  
  // Glass button
  button: `
    ${GLASS_BLUR.md}
    ${GLASS_OPACITY.light.medium}
    ${GLASS_BORDER.medium}
    ${GLASS_SHADOW.md}
    ${GLASS_ROUNDED.lg}
    ${GLASS_TRANSITION.fast}
    ${GLASS_HOVER.lift}
  `,
  
  // Glass badge
  badge: `
    ${GLASS_BLUR.sm}
    ${GLASS_OPACITY.light.subtle}
    ${GLASS_BORDER.subtle}
    ${GLASS_SHADOW.sm}
    ${GLASS_ROUNDED.full}
  `,
} as const;

// Helper function to combine glass classes
export function glassClasses(...classes: string[]): string {
  return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

// Glass morphism component builder
export function createGlassStyle(options: {
  blur?: keyof typeof GLASS_BLUR;
  opacity?: 'subtle' | 'medium' | 'strong';
  gradient?: boolean;
  border?: keyof typeof GLASS_BORDER;
  shadow?: keyof typeof GLASS_SHADOW;
  rounded?: keyof typeof GLASS_ROUNDED;
  hover?: keyof typeof GLASS_HOVER;
  transition?: keyof typeof GLASS_TRANSITION;
}): string {
  const {
    blur = 'xl',
    opacity = 'medium',
    gradient = true,
    border = 'medium',
    shadow = 'xl',
    rounded = 'xl',
    hover = 'subtle',
    transition = 'medium',
  } = options;

  return glassClasses(
    GLASS_BLUR[blur],
    gradient ? GLASS_OPACITY.gradient[opacity] : GLASS_OPACITY.light[opacity],
    GLASS_BORDER[border],
    GLASS_SHADOW[shadow],
    GLASS_ROUNDED[rounded],
    GLASS_TRANSITION[transition],
    GLASS_HOVER[hover]
  );
}

// Color gradients for different types
export const TYPE_GRADIENTS = {
  fire: 'from-orange-400 to-red-600',
  water: 'from-blue-400 to-cyan-600',
  grass: 'from-green-400 to-emerald-600',
  electric: 'from-yellow-300 to-yellow-500',
  psychic: 'from-pink-400 to-purple-500',
  ice: 'from-cyan-300 to-blue-400',
  dragon: 'from-indigo-600 to-purple-800',
  dark: 'from-gray-700 to-gray-900',
  fairy: 'from-pink-300 to-pink-500',
  normal: 'from-gray-400 to-gray-600',
  fighting: 'from-red-600 to-red-800',
  flying: 'from-blue-300 to-indigo-400',
  poison: 'from-purple-500 to-purple-700',
  ground: 'from-yellow-600 to-orange-700',
  rock: 'from-yellow-700 to-yellow-900',
  bug: 'from-green-500 to-green-700',
  ghost: 'from-purple-600 to-purple-900',
  steel: 'from-gray-500 to-gray-700',
} as const;

// Accent colors for regions
export const REGION_ACCENTS = {
  kanto: 'from-red-500 to-blue-500',
  johto: 'from-yellow-500 to-gray-500',
  hoenn: 'from-emerald-500 to-blue-600',
  sinnoh: 'from-indigo-500 to-purple-600',
  unova: 'from-gray-600 to-black',
  kalos: 'from-pink-500 to-purple-500',
  alola: 'from-orange-500 to-teal-500',
  galar: 'from-purple-600 to-red-600',
  paldea: 'from-red-500 to-purple-600',
} as const;

export default {
  GLASS_BLUR,
  GLASS_OPACITY,
  GLASS_BORDER,
  GLASS_SHADOW,
  GLASS_ROUNDED,
  GLASS_TRANSITION,
  GLASS_HOVER,
  GLASS_STYLES,
  TYPE_GRADIENTS,
  REGION_ACCENTS,
  glassClasses,
  createGlassStyle,
};