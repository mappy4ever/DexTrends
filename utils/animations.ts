import { Variants, Transition, Easing } from 'framer-motion';

/**
 * Unified Animation System
 * 
 * Consistent, performant animations across the application
 * - Respects user preferences (prefers-reduced-motion)
 * - GPU-accelerated transforms only
 * - Spring physics for natural movement
 * - Stagger effects for lists
 */

// Check for reduced motion preference
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Animation durations
export const duration = {
  instant: 0,
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
  slowest: 1.2
};

// Spring configurations
export const spring = {
  default: {
    type: 'spring',
    stiffness: 400,
    damping: 30
  },
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 20
  },
  wobbly: {
    type: 'spring',
    stiffness: 180,
    damping: 12
  },
  stiff: {
    type: 'spring',
    stiffness: 500,
    damping: 35
  },
  slow: {
    type: 'spring',
    stiffness: 100,
    damping: 20
  }
} as const;

// Easing functions
export const ease = {
  inOut: [0.4, 0, 0.2, 1],
  out: [0, 0, 0.2, 1],
  in: [0.4, 0, 1, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.175, 0.885, 0.32, 1.275]
} as const;

/**
 * Fade animations
 */
export const fadeIn: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: duration.normal,
      ease: ease.out
    }
  }
};

export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: ease.out
    }
  }
};

export const fadeInDown: Variants = {
  hidden: { 
    opacity: 0,
    y: -20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: ease.out
    }
  }
};

/**
 * Scale animations
 */
export const scaleIn: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.9
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: spring.default
  }
};

export const scaleInBounce: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: spring.wobbly
  }
};

/**
 * Slide animations
 */
export const slideInLeft: Variants = {
  hidden: { 
    x: '-100%',
    opacity: 0
  },
  visible: { 
    x: 0,
    opacity: 1,
    transition: spring.default
  }
};

export const slideInRight: Variants = {
  hidden: { 
    x: '100%',
    opacity: 0
  },
  visible: { 
    x: 0,
    opacity: 1,
    transition: spring.default
  }
};

export const slideInBottom: Variants = {
  hidden: { 
    y: '100%',
    opacity: 0
  },
  visible: { 
    y: 0,
    opacity: 1,
    transition: spring.default
  }
};

/**
 * Rotate animations
 */
export const rotateIn: Variants = {
  hidden: { 
    opacity: 0,
    rotate: -180,
    scale: 0.5
  },
  visible: { 
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: spring.default
  }
};

/**
 * Stagger children animations
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: spring.gentle
  }
};

/**
 * Card hover animations
 */
export const cardHover = {
  rest: {
    scale: 1,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  hover: {
    scale: 1.02,
    y: -5,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
    transition: spring.gentle
  },
  tap: {
    scale: 0.98,
    transition: spring.stiff
  }
};

/**
 * Button animations
 */
export const buttonTap = {
  tap: {
    scale: 0.95,
    transition: {
      duration: duration.instant,
      ease: ease.out
    }
  }
};

export const buttonHover = {
  hover: {
    scale: 1.05,
    transition: spring.gentle
  }
};

/**
 * Page transitions
 */
export const pageTransition: Variants = {
  initial: { 
    opacity: 0,
    y: 30
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slow,
      ease: ease.out
    }
  },
  exit: { 
    opacity: 0,
    y: -30,
    transition: {
      duration: duration.normal,
      ease: ease.in
    }
  }
};

/**
 * Modal/overlay animations
 */
export const overlayAnimation: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: duration.fast,
      ease: ease.out
    }
  }
};

export const modalAnimation: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: spring.default
  }
};

/**
 * Skeleton loading animation
 */
export const skeletonPulse = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Pokemon-specific animations
 */
export const pokeBallBounce: Variants = {
  initial: { 
    y: -100,
    rotate: 0
  },
  animate: { 
    y: 0,
    rotate: 360,
    transition: {
      y: {
        type: 'spring',
        stiffness: 300,
        damping: 10,
        mass: 1
      },
      rotate: {
        duration: duration.slow,
        ease: ease.out
      }
    }
  }
};

export const pokemonCardFlip: Variants = {
  front: {
    rotateY: 0,
    transition: spring.default
  },
  back: {
    rotateY: 180,
    transition: spring.default
  }
};

/**
 * Notification animations
 */
export const notificationSlide: Variants = {
  initial: { 
    x: '100%',
    opacity: 0
  },
  animate: { 
    x: 0,
    opacity: 1,
    transition: spring.default
  },
  exit: { 
    x: '100%',
    opacity: 0,
    transition: {
      duration: duration.fast,
      ease: ease.in
    }
  }
};

/**
 * List item animations with stagger
 */
export const listAnimation = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  },
  item: {
    hidden: { 
      opacity: 0,
      x: -20
    },
    show: { 
      opacity: 1,
      x: 0,
      transition: spring.gentle
    }
  }
};

/**
 * Utility function to create custom spring animation
 */
export const createSpring = (
  stiffness = 400,
  damping = 30,
  mass = 1
): Transition => ({
  type: 'spring',
  stiffness,
  damping,
  mass
});

/**
 * Utility function to create custom tween animation
 */
export const createTween = (
  duration = 0.3,
  ease: Easing = 'easeOut'
): Transition => ({
  type: 'tween',
  duration,
  ease
});

/**
 * Gesture animations
 */
export const swipeAnimation = {
  swipeRight: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: duration.normal,
      ease: ease.out
    }
  },
  swipeLeft: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: duration.normal,
      ease: ease.out
    }
  }
};

/**
 * Loading spinner animation
 */
export const spinnerRotate = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

/**
 * Progress bar animation
 */
export const progressAnimation = (progress: number) => ({
  initial: { width: '0%' },
  animate: { 
    width: `${progress}%`,
    transition: spring.gentle
  }
});

/**
 * Shake animation for errors
 */
export const shakeAnimation: Variants = {
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: duration.normal,
      ease: ease.out
    }
  }
};

/**
 * Glow/pulse animation for highlights
 */
export const glowPulse = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(168, 85, 247, 0.4)',
      '0 0 0 10px rgba(168, 85, 247, 0)',
      '0 0 0 0 rgba(168, 85, 247, 0)'
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: ease.out
    }
  }
};

/**
 * Create animation variants with reduced motion support
 */
export const createMotionSafeVariants = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    // Return instant transitions for users who prefer reduced motion
    const safeVariants: Variants = {};
    
    for (const key in variants) {
      if (typeof variants[key] === 'object' && 'transition' in variants[key]) {
        safeVariants[key] = {
          ...variants[key],
          transition: { duration: 0 }
        };
      } else {
        safeVariants[key] = variants[key];
      }
    }
    
    return safeVariants;
  }
  
  return variants;
};

/**
 * Hook for using animations with reduced motion support
 */
export const useMotionSafe = (variants: Variants) => {
  return createMotionSafeVariants(variants);
};

/**
 * Parallax scroll animation helper
 */
export const parallaxAnimation = (offset = 50) => ({
  initial: { y: -offset },
  animate: { y: offset },
  transition: {
    duration: 0,
    ease: 'linear'
  }
});

// Export all animations as a single object for easy access
export const animations = {
  fade: { fadeIn, fadeInUp, fadeInDown },
  scale: { scaleIn, scaleInBounce },
  slide: { slideInLeft, slideInRight, slideInBottom },
  rotate: { rotateIn },
  stagger: { staggerContainer, staggerItem },
  hover: { cardHover, buttonHover },
  tap: { buttonTap },
  page: { pageTransition },
  modal: { overlayAnimation, modalAnimation },
  pokemon: { pokeBallBounce, pokemonCardFlip },
  notification: { notificationSlide },
  list: { listAnimation },
  gesture: { swipeAnimation },
  loading: { skeletonPulse, spinnerRotate },
  special: { shakeAnimation, glowPulse },
  utils: { createSpring, createTween, createMotionSafeVariants, parallaxAnimation }
};