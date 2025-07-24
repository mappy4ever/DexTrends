// Theme configuration and utilities
export const THEME = {
  // Color classes with dark mode support
  colors: {
    background: {
      primary: 'bg-white dark:bg-gray-900',
      secondary: 'bg-gray-50 dark:bg-gray-800',
      tertiary: 'bg-gray-100 dark:bg-gray-700',
      card: 'bg-white dark:bg-gray-800',
      translucent: 'bg-white/90 dark:bg-gray-800/90',
      hero: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'
    },
    text: {
      primary: 'text-gray-900 dark:text-white',
      secondary: 'text-gray-600 dark:text-gray-400',
      tertiary: 'text-gray-500 dark:text-gray-500',
      accent: 'text-blue-600 dark:text-blue-400',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      error: 'text-red-600 dark:text-red-400'
    },
    border: {
      default: 'border-gray-200 dark:border-gray-700',
      light: 'border-gray-100 dark:border-gray-800',
      strong: 'border-gray-300 dark:border-gray-600'
    }
  },
  
  // Typography scale
  typography: {
    h1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
    h2: 'text-3xl md:text-4xl lg:text-5xl font-bold',
    h3: 'text-2xl md:text-3xl font-bold',
    h4: 'text-xl md:text-2xl font-bold',
    h5: 'text-lg md:text-xl font-semibold',
    body: 'text-base',
    small: 'text-sm',
    xs: 'text-xs'
  },
  
  // Spacing system
  spacing: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-12 sm:py-16 lg:py-20',
    card: 'p-6 sm:p-8',
    cardCompact: 'p-4 sm:p-6'
  },
  
  // Shadow system with dark mode
  shadows: {
    sm: 'shadow-sm dark:shadow-none dark:ring-1 dark:ring-gray-700',
    md: 'shadow-md dark:shadow-none dark:ring-1 dark:ring-gray-700',
    lg: 'shadow-lg dark:shadow-none dark:ring-1 dark:ring-gray-600',
    xl: 'shadow-xl dark:shadow-none dark:ring-2 dark:ring-gray-600',
    '2xl': 'shadow-2xl dark:shadow-none dark:ring-2 dark:ring-gray-600'
  },
  
  // Border radius
  rounded: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full'
  },
  
  // Interactive states
  interactive: {
    hover: 'hover:scale-105 hover:shadow-lg transition-all duration-200',
    active: 'active:scale-95',
    focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    disabled: 'opacity-50 cursor-not-allowed'
  },
  
  // Animation durations
  animation: {
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-300',
    slower: 'duration-500'
  }
};

// Type-specific gradients with dark mode support
export const TYPE_GRADIENTS = {
  normal: 'from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800',
  fire: 'from-orange-400 to-red-600 dark:from-orange-600 dark:to-red-800',
  water: 'from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800',
  electric: 'from-yellow-300 to-yellow-500 dark:from-yellow-500 dark:to-yellow-700',
  grass: 'from-green-400 to-green-600 dark:from-green-600 dark:to-green-800',
  ice: 'from-cyan-300 to-blue-400 dark:from-cyan-500 dark:to-blue-600',
  fighting: 'from-red-600 to-red-800 dark:from-red-700 dark:to-red-900',
  poison: 'from-purple-500 to-purple-700 dark:from-purple-600 dark:to-purple-800',
  ground: 'from-yellow-600 to-yellow-800 dark:from-yellow-700 dark:to-yellow-900',
  flying: 'from-blue-300 to-indigo-400 dark:from-blue-500 dark:to-indigo-600',
  psychic: 'from-pink-400 to-pink-600 dark:from-pink-600 dark:to-pink-800',
  bug: 'from-green-500 to-lime-600 dark:from-green-600 dark:to-lime-700',
  rock: 'from-yellow-700 to-yellow-900 dark:from-yellow-800 dark:to-yellow-950',
  ghost: 'from-purple-600 to-purple-800 dark:from-purple-700 dark:to-purple-900',
  dragon: 'from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-800',
  dark: 'from-gray-700 to-gray-900 dark:from-gray-800 dark:to-black',
  steel: 'from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800',
  fairy: 'from-pink-300 to-pink-500 dark:from-pink-500 dark:to-pink-700'
};

// Helper function to build theme-aware class strings
export function themeClass(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Helper to get type gradient with fallback
export function getTypeGradient(type: string): string {
  return TYPE_GRADIENTS[type as keyof typeof TYPE_GRADIENTS] || TYPE_GRADIENTS.normal;
}

// Accessibility helpers
export function getHighContrastClass(isHighContrast: boolean, normalClass: string, highContrastClass: string): string {
  return isHighContrast ? highContrastClass : normalClass;
}

// Performance helpers
export function getAnimationClass(reduceMotion: boolean, animationClass: string): string {
  return reduceMotion ? '' : animationClass;
}