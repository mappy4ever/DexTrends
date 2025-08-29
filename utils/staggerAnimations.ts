import { Variants } from 'framer-motion';

/**
 * Staggered Animation System
 * Provides smooth, staggered animations for lists and grids
 */

// Stagger container variants
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Fast stagger for small lists
export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

// Slow stagger for emphasis
export const staggerSlow: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

// Grid stagger (2D stagger effect)
export const staggerGrid: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
      staggerDirection: 1
    }
  }
};

// Item variants for different animation types
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export const fadeInScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -30
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 30
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export const popIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotate: -5
  },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

export const flipIn: Variants = {
  hidden: {
    opacity: 0,
    rotateY: 90,
    scale: 0.9
  },
  show: {
    opacity: 1,
    rotateY: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

// Card-specific animations
export const cardHover = {
  rest: {
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.2,
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  hover: {
    scale: 1.05,
    rotate: 1,
    transition: {
      duration: 0.2,
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  tap: {
    scale: 0.98,
    rotate: 0,
    transition: {
      duration: 0.1,
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

// Floating animation for special elements
export const floatingAnimation: Variants = {
  initial: {
    y: 0
  },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};

// Pulse animation for attention
export const pulseAnimation: Variants = {
  initial: {
    scale: 1
  },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop",
      ease: "easeInOut"
    }
  }
};

// Shimmer effect for loading states
export const shimmerAnimation: Variants = {
  initial: {
    backgroundPosition: "-200% 0"
  },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Helper function to get stagger delay based on index
export const getStaggerDelay = (index: number, baseDelay: number = 0.1): number => {
  return index * baseDelay;
};

// Helper function for grid stagger (2D)
export const getGridStaggerDelay = (
  index: number,
  columns: number,
  baseDelay: number = 0.05
): number => {
  const row = Math.floor(index / columns);
  const col = index % columns;
  return (row + col) * baseDelay;
};

// Gesture animations for interactive elements
export const tapAnimation = {
  whileTap: { scale: 0.95 },
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 17
  }
};

export const hoverAnimation = {
  whileHover: { scale: 1.05 },
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 17
  }
};

// Complex entrance animation for hero sections
export const heroEntrance: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.43, 0.13, 0.23, 0.96],
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

// Exit animations
export const exitFadeOut: Variants = {
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

export const exitScaleDown: Variants = {
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

export const exitSlideDown: Variants = {
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};