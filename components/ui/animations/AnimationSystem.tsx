import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Type definitions
interface AnimationContextType {
  prefersReducedMotion: boolean;
  pageTransitionEnabled: boolean;
  setPageTransitionEnabled?: (enabled: boolean) => void;
}

interface AnimationProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalAnimationProps {
  children: React.ReactNode;
  className?: string;
}

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

// Animation preferences context
const AnimationContext = createContext<AnimationContextType>({
  prefersReducedMotion: false,
  pageTransitionEnabled: true,
});

export const useAnimation = () => useContext(AnimationContext);

// Animation Provider
export const AnimationProvider = ({ children }: AnimationProps) => {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [pageTransitionEnabled, setPageTransitionEnabled] = useState(true);

  return (
    <AnimationContext.Provider value={{
      prefersReducedMotion,
      pageTransitionEnabled,
      setPageTransitionEnabled
    }}>
      {children}
    </AnimationContext.Provider>
  );
};

// Premium Page Transition Wrapper
export const PageTransition = ({ children, className = '' }: AnimationProps) => {
  const { prefersReducedMotion } = useAnimation();

  const pageVariants = {
    initial: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 24,
      scale: prefersReducedMotion ? 1 : 0.98,
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    out: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : -24,
      scale: prefersReducedMotion ? 1 : 1.02,
    }
  };

  const pageTransition = {
    type: 'tween',
    ease: [0.23, 1, 0.32, 1], // Premium easing
    duration: prefersReducedMotion ? 0.01 : 0.4,
  };

  return (
    <motion.div
      className={`min-h-screen ${className}`}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

// Staggered Container for multiple elements
interface StaggerContainerProps {
  children?: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  [key: string]: any;
}

export const StaggerContainer = ({ children, className = '', staggerDelay = 0.1, ...props }: StaggerContainerProps) => {
  const { prefersReducedMotion } = useAnimation();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
        delayChildren: prefersReducedMotion ? 0 : 0.1,
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Staggered Item
interface StaggerItemProps {
  children?: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  [key: string]: any;
}

export const StaggerItem = ({ children, className = '', direction = 'up', ...props }: StaggerItemProps) => {
  const { prefersReducedMotion } = useAnimation();

  const directions = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { x: 30, y: 0 },
    right: { x: -30, y: 0 },
  };

  const item = {
    hidden: {
      opacity: 0,
      ...directions[direction],
      scale: prefersReducedMotion ? 1 : 0.95,
    },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: prefersReducedMotion ? 0.01 : 0.5,
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={item}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Hover Card Animation
interface HoverCardProps {
  children?: React.ReactNode;
  className?: string;
  scale?: number;
  y?: number;
  rotateX?: number;
  rotateY?: number;
  [key: string]: any;
}

export const HoverCard = ({ children, className = '', scale = 1.02, y = -4, rotateX = 0, rotateY = 0, ...props }: HoverCardProps) => {
  const { prefersReducedMotion } = useAnimation();

  return (
    <motion.div
      className={className}
      whileHover={{
        scale: prefersReducedMotion ? 1 : scale,
        y: prefersReducedMotion ? 0 : y,
        rotateX: prefersReducedMotion ? 0 : rotateX,
        rotateY: prefersReducedMotion ? 0 : rotateY,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }
      }}
      whileTap={{
        scale: prefersReducedMotion ? 1 : 0.98,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Floating Animation
interface FloatingElementProps {
  children?: React.ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
  [key: string]: any;
}

export const FloatingElement = ({ children, className = '', amplitude = 10, duration = 3, ...props }: FloatingElementProps) => {
  const { prefersReducedMotion } = useAnimation();

  return (
    <motion.div
      className={className}
      animate={prefersReducedMotion ? {} : {
        y: [-amplitude/2, amplitude/2, -amplitude/2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Reveal Animation (for scroll-triggered animations)
interface RevealElementProps {
  children?: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  threshold?: number;
  [key: string]: any;
}

export const RevealElement = ({ children, className = '', direction = 'up', delay = 0, threshold = 0.1, ...props }: RevealElementProps) => {
  const { prefersReducedMotion } = useAnimation();

  const directions = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { x: 50, y: 0 },
    right: { x: -50, y: 0 },
  };

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...directions[direction],
        scale: prefersReducedMotion ? 1 : 0.9,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={{ 
        once: true, 
        amount: threshold,
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay: prefersReducedMotion ? 0 : delay,
        duration: prefersReducedMotion ? 0.01 : 0.6,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Pulse Animation
interface PulseElementProps {
  children?: React.ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
  [key: string]: any;
}

export const PulseElement = ({ children, className = '', scale = 1.05, duration = 2, ...props }: PulseElementProps) => {
  const { prefersReducedMotion } = useAnimation();

  return (
    <motion.div
      className={className}
      animate={prefersReducedMotion ? {} : {
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Loading Dots Animation
export const LoadingDots = ({ className = '', size = 'md' }: LoadingDotsProps) => {
  const { prefersReducedMotion } = useAnimation();

  const sizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: [-4, 4, -4],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
      }
    }
  };

  if (prefersReducedMotion) {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i: any) => (
          <div key={i} className={`${sizes[size]} bg-current rounded-full opacity-60`} />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i: any) => (
        <motion.div
          key={i}
          className={`${sizes[size]} bg-current rounded-full`}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: i * 0.2 }}
        />
      ))}
    </div>
  );
};

// Modal Animation Wrapper
export const ModalAnimation = ({ children, isOpen, onClose, className = '' }: { children?: React.ReactNode; isOpen?: boolean; onClose?: () => void; className?: string }) => {
  const { prefersReducedMotion } = useAnimation();

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.8,
      y: prefersReducedMotion ? 0 : 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: prefersReducedMotion ? 0.01 : 0.4,
      }
    },
    exit: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.8,
      y: prefersReducedMotion ? 0 : 50,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.2,
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-modal flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className={`relative ${className}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e: any) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Button Press Animation
interface PressableButtonProps {
  children?: React.ReactNode;
  className?: string;
  pressScale?: number;
  [key: string]: any;
}

export const PressableButton = ({ children, className = '', pressScale = 0.95, ...props }: PressableButtonProps) => {
  const { prefersReducedMotion } = useAnimation();

  return (
    <motion.button
      className={className}
      whileTap={{
        scale: prefersReducedMotion ? 1 : pressScale,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default {
  AnimationProvider,
  PageTransition,
  StaggerContainer,
  StaggerItem,
  HoverCard,
  FloatingElement,
  RevealElement,
  PulseElement,
  LoadingDots,
  ModalAnimation,
  PressableButton,
};