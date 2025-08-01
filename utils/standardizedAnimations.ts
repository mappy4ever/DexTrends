import { Variants, Transition } from 'framer-motion';

/**
 * Standardized animation configurations for Pokemon detail pages
 * Provides consistent timing, easing, and reduced-motion support
 */

// Base animation settings
export const ANIMATION_CONFIG = {
  // Standard durations (in seconds)
  durations: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    hover: 0.15,
  },
  
  // Standard easing curves
  easings: {
    smooth: [0.4, 0, 0.2, 1] as const,
    bounce: [0.68, -0.55, 0.265, 1.55] as const,
    sharp: [0.4, 0, 1, 1] as const,
    gentle: [0.25, 0.46, 0.45, 0.94] as const,
  },
  
  // Spring configurations
  springs: {
    gentle: { damping: 28, stiffness: 400, mass: 0.8 },
    bouncy: { damping: 18, stiffness: 600, mass: 0.6 },
    stiff: { damping: 35, stiffness: 500, mass: 0.5 },
  },
} as const;

// Check for reduced motion preference
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Base transition with reduced motion support
export const createTransition = (
  config: Partial<Transition> = {},
  respectReducedMotion = true
): Transition => {
  if (respectReducedMotion && prefersReducedMotion()) {
    return {
      duration: 0,
      ...config,
    };
  }
  
  return {
    type: 'spring',
    ...ANIMATION_CONFIG.springs.gentle,
    ...config,
  };
};

// Standard animation variants
export const POKEMON_ANIMATIONS: Record<string, Variants> = {
  // Fade in/out animations
  fadeIn: {
    hidden: { 
      opacity: 0,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
    visible: { 
      opacity: 1,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.normal })
    },
    exit: {
      opacity: 0,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
  },

  // Slide animations
  slideUp: {
    hidden: { 
      opacity: 0, 
      y: 20,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.normal })
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
  },

  slideDown: {
    hidden: { 
      opacity: 0, 
      y: -20,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.normal })
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
  },

  slideLeft: {
    hidden: { 
      opacity: 0, 
      x: 20,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.normal })
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
  },

  slideRight: {
    hidden: { 
      opacity: 0, 
      x: -20,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.normal })
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
  },

  // Scale animations
  scaleIn: {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.normal })
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
  },

  // Stagger animations for lists
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1,
      },
    },
  },

  staggerItem: {
    hidden: { 
      opacity: 0, 
      y: 20,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.normal })
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
  },

  // Tab switching animations
  tabSwitch: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
    exit: { 
      opacity: 0,
      transition: createTransition({ duration: ANIMATION_CONFIG.durations.fast })
    },
  },
};

// Hover and tap gestures with reduced motion support
export const POKEMON_GESTURES = {
  hover: {
    scale: prefersReducedMotion() ? 1 : 1.05,
    transition: createTransition({ duration: ANIMATION_CONFIG.durations.hover }),
  },
  tap: {
    scale: prefersReducedMotion() ? 1 : 0.95,
    transition: createTransition({ duration: ANIMATION_CONFIG.durations.hover }),
  },
  focus: {
    scale: prefersReducedMotion() ? 1 : 1.02,
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
    transition: createTransition({ duration: ANIMATION_CONFIG.durations.hover }),
  },
};

// Utility function to get animation props with reduced motion support
export const getAnimationProps = (
  animationType: keyof typeof POKEMON_ANIMATIONS,
  options: {
    respectReducedMotion?: boolean;
    delay?: number;
    duration?: number;
  } = {}
) => {
  const { respectReducedMotion = true, delay = 0, duration } = options;
  
  if (respectReducedMotion && prefersReducedMotion()) {
    return {
      initial: 'visible',
      animate: 'visible',
      exit: 'visible',
      variants: {
        visible: { opacity: 1 },
      },
    };
  }

  const variants = { ...POKEMON_ANIMATIONS[animationType] };
  
  // Apply custom delay or duration if provided
  if (delay > 0 || duration) {
    Object.keys(variants).forEach(key => {
      const variant = variants[key as keyof typeof variants];
      if (typeof variant === 'object' && 'transition' in variant) {
        variant.transition = {
          ...variant.transition,
          ...(delay > 0 && { delay }),
          ...(duration && { duration }),
        };
      }
    });
  }

  return {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    variants,
  };
};

// Pre-configured animation sets for common UI patterns
export const UI_ANIMATION_SETS = {
  card: {
    ...getAnimationProps('scaleIn'),
    whileHover: POKEMON_GESTURES.hover,
    whileTap: POKEMON_GESTURES.tap,
  },
  
  listItem: {
    ...getAnimationProps('slideUp'),
    whileHover: { x: prefersReducedMotion() ? 0 : 4 },
  },
  
  modal: {
    ...getAnimationProps('fadeIn'),
    transition: createTransition({ duration: ANIMATION_CONFIG.durations.normal }),
  },
  
  tab: {
    ...getAnimationProps('tabSwitch'),
  },
  
  button: {
    whileHover: POKEMON_GESTURES.hover,
    whileTap: POKEMON_GESTURES.tap,
    whileFocus: POKEMON_GESTURES.focus,
  },
};

export default {
  ANIMATION_CONFIG,
  POKEMON_ANIMATIONS,
  POKEMON_GESTURES,
  UI_ANIMATION_SETS,
  createTransition,
  getAnimationProps,
  prefersReducedMotion,
};