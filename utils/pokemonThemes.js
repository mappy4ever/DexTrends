// Unified Pokemon Theme System
// Consistent colors, gradients, and styling across all Pokemon components

export const pokemonTheme = {
  // Primary color palette
  colors: {
    primary: {
      blue: 'rgb(59, 130, 246)',     // blue-500
      purple: 'rgb(147, 51, 234)',   // purple-600
      red: 'rgb(239, 68, 68)',       // red-500
      yellow: 'rgb(245, 158, 11)',   // amber-500
      green: 'rgb(34, 197, 94)',     // emerald-500
      orange: 'rgb(249, 115, 22)',   // orange-500
    },
    // Dark theme variants
    dark: {
      blue: 'rgb(96, 165, 250)',     // blue-400
      purple: 'rgb(168, 85, 247)',   // purple-500
      red: 'rgb(248, 113, 113)',     // red-400
      yellow: 'rgb(251, 191, 36)',   // amber-400
      green: 'rgb(52, 211, 153)',    // emerald-400
      orange: 'rgb(251, 146, 60)',   // orange-400
    }
  },

  // Gradient combinations
  gradients: {
    hero: 'from-blue-500 via-purple-500 to-indigo-600',
    primary: 'from-blue-500 to-purple-600',
    secondary: 'from-red-500 to-orange-500',
    accent: 'from-emerald-500 to-teal-500',
    warm: 'from-orange-500 to-red-500',
    cool: 'from-blue-500 to-cyan-500',
    sunset: 'from-orange-400 via-red-500 to-purple-600',
    ocean: 'from-blue-400 via-blue-600 to-purple-600'
  },

  // Background patterns
  backgrounds: {
    hero: 'bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900',
    section: 'bg-white dark:bg-gray-800',
    card: 'bg-white dark:bg-gray-800',
    subtle: 'bg-gray-50 dark:bg-gray-900',
    overlay: 'bg-black/50'
  },

  // Typography scale
  typography: {
    hero: 'text-6xl md:text-7xl font-black',
    title: 'text-4xl md:text-5xl font-bold',
    subtitle: 'text-2xl md:text-3xl font-semibold',
    heading: 'text-xl md:text-2xl font-bold',
    body: 'text-base md:text-lg',
    caption: 'text-sm text-gray-600 dark:text-gray-400'
  },

  // Spacing scale
  spacing: {
    section: 'py-16 md:py-20',
    container: 'max-w-7xl mx-auto px-4 md:px-8',
    card: 'p-6 md:p-8',
    gap: 'gap-6 md:gap-8'
  },

  // Animation classes
  animations: {
    fadeIn: 'opacity-0 animate-fade-in',
    slideUp: 'translate-y-8 opacity-0 animate-slide-up',
    scaleIn: 'scale-95 opacity-0 animate-scale-in',
    hover: 'hover:scale-105 transition-transform duration-300',
    cardHover: 'hover:shadow-xl hover:-translate-y-2 transition-all duration-300'
  },

  // Component-specific styles
  components: {
    button: {
      primary: 'px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity',
      secondary: 'px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-opacity',
      outline: 'px-6 py-3 rounded-lg border-2 border-blue-500 text-blue-500 dark:text-blue-400 font-semibold hover:bg-blue-500 hover:text-white transition-colors'
    },
    card: {
      base: 'rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow',
      elevated: 'rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow',
      interactive: 'rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer'
    },
    badge: {
      primary: 'px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium',
      secondary: 'px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-medium',
      accent: 'px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium'
    }
  }
};

// Region-specific themes
export const regionThemes = {
  kanto: {
    gradient: 'from-red-500 to-blue-500',
    bg: 'from-red-100 to-blue-100 dark:from-red-900 dark:to-blue-900',
    accent: 'text-red-500 dark:text-red-400'
  },
  johto: {
    gradient: 'from-yellow-500 to-gray-500',
    bg: 'from-yellow-100 to-gray-100 dark:from-yellow-900 dark:to-gray-900',
    accent: 'text-yellow-500 dark:text-yellow-400'
  },
  hoenn: {
    gradient: 'from-emerald-500 to-blue-600',
    bg: 'from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900',
    accent: 'text-emerald-500 dark:text-emerald-400'
  },
  sinnoh: {
    gradient: 'from-indigo-500 to-purple-600',
    bg: 'from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900',
    accent: 'text-indigo-500 dark:text-indigo-400'
  },
  unova: {
    gradient: 'from-gray-600 to-black',
    bg: 'from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900',
    accent: 'text-gray-600 dark:text-gray-400'
  },
  kalos: {
    gradient: 'from-pink-500 to-purple-500',
    bg: 'from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900',
    accent: 'text-pink-500 dark:text-pink-400'
  },
  alola: {
    gradient: 'from-orange-500 to-teal-500',
    bg: 'from-orange-100 to-teal-100 dark:from-orange-900 dark:to-teal-900',
    accent: 'text-orange-500 dark:text-orange-400'
  },
  galar: {
    gradient: 'from-purple-600 to-red-600',
    bg: 'from-purple-100 to-red-100 dark:from-purple-900 dark:to-red-900',
    accent: 'text-purple-600 dark:text-purple-400'
  },
  paldea: {
    gradient: 'from-red-500 to-violet-600',
    bg: 'from-red-100 to-violet-100 dark:from-red-900 dark:to-violet-900',
    accent: 'text-red-500 dark:text-red-400'
  }
};

// Utility functions
export const getRegionTheme = (regionId) => {
  return regionThemes[regionId] || regionThemes.kanto;
};

export const getThemeClass = (theme, category, variant = 'base') => {
  return pokemonTheme[category]?.[variant] || '';
};

// Responsive utilities
export const responsive = {
  container: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  grid: {
    '1-2-3': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '1-2-4': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    '2-4': 'grid grid-cols-2 md:grid-cols-4',
    '1-3': 'grid grid-cols-1 lg:grid-cols-3'
  },
  text: {
    hero: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
    title: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
    subtitle: 'text-lg sm:text-xl md:text-2xl',
    body: 'text-sm sm:text-base md:text-lg'
  },
  spacing: {
    section: 'py-12 sm:py-16 md:py-20 lg:py-24',
    element: 'mb-4 sm:mb-6 md:mb-8',
    gap: 'gap-4 sm:gap-6 md:gap-8'
  }
};

export default pokemonTheme;