import React, { createContext, useContext, useEffect, useState, ReactNode, CSSProperties, useCallback } from 'react';

import { 
  motion, 
  AnimatePresence, 
  useReducedMotion, 
  useAnimation, 
  useInView, 
  useSpring, 
  useTransform,
  useScroll,
  Transition,
  Variants,
  MotionValue
} from 'framer-motion';

// Types
interface AnimationPreferences {
  speed: number;
  pageTransitions: boolean;
  microInteractions: boolean;
  scrollAnimations: boolean;
}

interface AnimationContextValue {
  prefersReducedMotion: boolean | null;
  animationSpeed: number;
  enablePageTransitions: boolean;
  enableMicroInteractions: boolean;
  enableScrollAnimations: boolean;
  setAnimationSpeed: (speed: number) => void;
  setEnablePageTransitions: (enabled: boolean) => void;
  setEnableMicroInteractions: (enabled: boolean) => void;
  setEnableScrollAnimations: (enabled: boolean) => void;
}

interface EnhancedAnimationProviderProps {
  children: ReactNode;
}

// Enhanced Animation Context with more controls
export const AnimationContext = createContext<AnimationContextValue>({
  prefersReducedMotion: false,
  animationSpeed: 1,
  enablePageTransitions: true,
  enableMicroInteractions: true,
  enableScrollAnimations: true,
  setAnimationSpeed: () => {},
  setEnablePageTransitions: () => {},
  setEnableMicroInteractions: () => {},
  setEnableScrollAnimations: () => {},
});

// Hook interface for enhanced animation
interface UseEnhancedAnimationReturn {
  isAnimating: boolean;
  triggerAnimation: () => void;
  prefersReducedMotion: boolean;
  animationSpeed: number;
  enablePageTransitions: boolean;
  enableMicroInteractions: boolean;
  enableScrollAnimations: boolean;
  setAnimationSpeed: (speed: number) => void;
  setEnablePageTransitions: (enabled: boolean) => void;
  setEnableMicroInteractions: (enabled: boolean) => void;
  setEnableScrollAnimations: (enabled: boolean) => void;
}

// Hook for enhanced animation - returns animation context values
export const useEnhancedAnimation = (): UseEnhancedAnimationReturn => {
  const context = useContext(AnimationContext);
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerAnimation = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  }, []);

  return {
    isAnimating,
    triggerAnimation,
    prefersReducedMotion: context.prefersReducedMotion ?? false,
    animationSpeed: context.animationSpeed,
    enablePageTransitions: context.enablePageTransitions,
    enableMicroInteractions: context.enableMicroInteractions,
    enableScrollAnimations: context.enableScrollAnimations,
    setAnimationSpeed: context.setAnimationSpeed,
    setEnablePageTransitions: context.setEnablePageTransitions,
    setEnableMicroInteractions: context.setEnableMicroInteractions,
    setEnableScrollAnimations: context.setEnableScrollAnimations
  };
};

// Animation Provider with user preferences
export const EnhancedAnimationProvider: React.FC<EnhancedAnimationProviderProps> = ({ children }) => {
  const systemPrefersReducedMotion = useReducedMotion();
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [enablePageTransitions, setEnablePageTransitions] = useState(true);
  const [enableMicroInteractions, setEnableMicroInteractions] = useState(true);
  const [enableScrollAnimations, setEnableScrollAnimations] = useState(true);

  // Load preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('animationPreferences');
    if (savedPrefs) {
      const prefs: AnimationPreferences = JSON.parse(savedPrefs);
      setAnimationSpeed(prefs.speed || 1);
      setEnablePageTransitions(prefs.pageTransitions ?? true);
      setEnableMicroInteractions(prefs.microInteractions ?? true);
      setEnableScrollAnimations(prefs.scrollAnimations ?? true);
    }
  }, []);

  const value: AnimationContextValue = {
    prefersReducedMotion: systemPrefersReducedMotion,
    animationSpeed,
    enablePageTransitions,
    enableMicroInteractions,
    enableScrollAnimations,
    setAnimationSpeed,
    setEnablePageTransitions,
    setEnableMicroInteractions,
    setEnableScrollAnimations,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

// Premium easing curves
export const easings = {
  easeOutExpo: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeOutQuart: [0.25, 1, 0.5, 1] as [number, number, number, number],
  easeInOutQuart: [0.76, 0, 0.24, 1] as [number, number, number, number],
  easeInOutExpo: [0.87, 0, 0.13, 1] as [number, number, number, number],
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
  springBouncy: { type: "spring" as const, stiffness: 400, damping: 25 },
  springSmooth: { type: "spring" as const, stiffness: 200, damping: 35 },
};

// Page Transition Props
interface EnhancedPageTransitionProps {
  children: ReactNode;
  variant?: 'fade' | 'slideUp' | 'slideRight' | 'scale' | 'rotateIn';
  className?: string;
}

// Enhanced Page Transition with multiple variants
export const EnhancedPageTransition: React.FC<EnhancedPageTransitionProps> = ({ 
  children, 
  variant = 'fade', 
  className = '' 
}) => {
  const { prefersReducedMotion, animationSpeed, enablePageTransitions } = useEnhancedAnimation();

  if (!enablePageTransitions || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const pageVariants: Record<string, Variants> = {
    fade: {
      initial: { opacity: 0 },
      in: { opacity: 1 },
      out: { opacity: 0 }
    },
    slideUp: {
      initial: { opacity: 0, y: 30 },
      in: { opacity: 1, y: 0 },
      out: { opacity: 0, y: -30 }
    },
    slideRight: {
      initial: { opacity: 0, x: -30 },
      in: { opacity: 1, x: 0 },
      out: { opacity: 0, x: 30 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      in: { opacity: 1, scale: 1 },
      out: { opacity: 0, scale: 1.05 }
    },
    rotateIn: {
      initial: { opacity: 0, rotate: -5, scale: 0.95 },
      in: { opacity: 1, rotate: 0, scale: 1 },
      out: { opacity: 0, rotate: 5, scale: 1.05 }
    }
  };

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants[variant] || pageVariants.fade}
      transition={{
        ...easings.easeOutQuart,
        duration: 0.4 / animationSpeed,
      }}
    >
      {children}
    </motion.div>
  );
};

// Interactive Card Props
interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  enableTilt?: boolean;
  enableGlow?: boolean;
  glowColor?: string;
  onClick?: () => void;
  [key: string]: unknown;
}

// Advanced Card Interaction with 3D effects
export const InteractiveCard: React.FC<InteractiveCardProps> = ({ 
  children, 
  className = '',
  enableTilt = true,
  enableGlow = true,
  glowColor = 'rgba(59, 130, 246, 0.5)',
  onClick,
  ...props 
}) => {
  const { prefersReducedMotion, enableMicroInteractions } = useEnhancedAnimation();
  const [isHovered, setIsHovered] = useState(false);
  const springConfig = { stiffness: 300, damping: 30 };
  
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);
  const scale = useSpring(1, springConfig);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || prefersReducedMotion || !enableMicroInteractions) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((e.clientX - centerX) / 5);
    y.set((e.clientY - centerY) / 5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    scale.set(1);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    scale.set(1.02);
    setIsHovered(true);
  };

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        rotateX: enableTilt && enableMicroInteractions ? rotateX : 0,
        rotateY: enableTilt && enableMicroInteractions ? rotateY : 0,
        scale,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
      {...props}
    >
      {children}
      {enableGlow && enableMicroInteractions && isHovered && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: `radial-gradient(circle at center, ${glowColor}, transparent)`,
            filter: 'blur(20px)',
            zIndex: -1,
          }}
        />
      )}
    </motion.div>
  );
};

// Modal Props
interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: 'scale' | 'slide' | 'flip';
  className?: string;
}

// Enhanced Modal with sophisticated animations
export const AnimatedModal: React.FC<AnimatedModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  variant = 'scale',
  className = '' 
}) => {
  const { prefersReducedMotion, animationSpeed } = useEnhancedAnimation();

  const modalVariants: Record<string, Variants> = {
    scale: {
      hidden: {
        opacity: 0,
        scale: prefersReducedMotion ? 1 : 0.8,
        y: prefersReducedMotion ? 0 : 20,
      },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
      }
    },
    slide: {
      hidden: {
        opacity: 0,
        y: prefersReducedMotion ? 0 : 100,
      },
      visible: {
        opacity: 1,
        y: 0,
      }
    },
    flip: {
      hidden: {
        opacity: 0,
        rotateX: prefersReducedMotion ? 0 : 90,
        scale: prefersReducedMotion ? 1 : 0.8,
      },
      visible: {
        opacity: 1,
        rotateX: 0,
        scale: 1,
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: 0.2 / animationSpeed }}
          />
          <motion.div
            className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${className}`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={modalVariants[variant] || modalVariants.scale}
            transition={{
              ...easings.springSmooth,
              duration: 0.3 / animationSpeed,
            }}
          >
            <div onClick={(e) => e.stopPropagation()}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Drawer Props
interface AnimatedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: 'right' | 'left' | 'top' | 'bottom';
  className?: string;
}

// Drawer Animation Component
export const AnimatedDrawer: React.FC<AnimatedDrawerProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  position = 'right',
  className = '' 
}) => {
  const { prefersReducedMotion, animationSpeed } = useEnhancedAnimation();

  const drawerVariants: Record<string, Variants> = {
    right: {
      hidden: { x: '100%' },
      visible: { x: 0 }
    },
    left: {
      hidden: { x: '-100%' },
      visible: { x: 0 }
    },
    top: {
      hidden: { y: '-100%' },
      visible: { y: 0 }
    },
    bottom: {
      hidden: { y: '100%' },
      visible: { y: 0 }
    }
  };

  const positionClasses = {
    right: 'right-0 top-0 h-full',
    left: 'left-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: 0.2 / animationSpeed }}
          />
          <motion.div
            className={`fixed ${positionClasses[position]} bg-white dark:bg-gray-900 shadow-2xl z-50 ${className}`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={drawerVariants[position]}
            transition={{
              ...easings.easeOutExpo,
              duration: prefersReducedMotion ? 0.01 : 0.4 / animationSpeed,
            }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Button Props
interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  [key: string]: unknown;
}

// Micro-interaction Button
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  className = '',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  ...props 
}) => {
  const { prefersReducedMotion, enableMicroInteractions } = useEnhancedAnimation();

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      className={`
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        rounded-lg font-medium transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileHover={!disabled && enableMicroInteractions && !prefersReducedMotion ? { scale: 1.05 } : {}}
      whileTap={!disabled && enableMicroInteractions && !prefersReducedMotion ? { scale: 0.95 } : {}}
      onClick={disabled ? undefined : onClick}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Toggle Props
interface AnimatedToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  label?: string;
}

// Toggle Switch with Animation
export const AnimatedToggle: React.FC<AnimatedToggleProps> = ({ 
  checked, 
  onChange, 
  className = '',
  label = '' 
}) => {
  const { prefersReducedMotion, enableMicroInteractions } = useEnhancedAnimation();

  return (
    <label className={`flex items-center cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`
          w-12 h-6 rounded-full transition-colors
          ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}
        `}>
          <motion.div
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
            animate={{ x: checked ? 24 : 0 }}
            transition={
              prefersReducedMotion || !enableMicroInteractions
                ? { duration: 0.01 }
                : easings.springBouncy
            }
          />
        </div>
      </div>
      {label && <span className="ml-3">{label}</span>}
    </label>
  );
};

// Input Props
interface AnimatedInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
  [key: string]: unknown;
}

// Animated Input Field
export const AnimatedInput: React.FC<AnimatedInputProps> = ({ 
  value, 
  onChange, 
  placeholder = '',
  error = false,
  className = '',
  ...props 
}) => {
  const { enableMicroInteractions } = useEnhancedAnimation();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className="relative"
      animate={enableMicroInteractions ? {
        scale: isFocused ? 1.02 : 1,
      } : {}}
      transition={easings.spring}
    >
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full px-4 py-2 rounded-lg border transition-all
          ${error 
            ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
            : 'border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-5 left-0 text-red-500 text-sm"
        >
          Please fill out this field
        </motion.div>
      )}
    </motion.div>
  );
};

// Scroll Reveal Props
interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  delay?: number;
  threshold?: number;
  once?: boolean;
}

// Scroll-triggered Reveal Animation
export const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  className = '',
  direction = 'up',
  delay = 0,
  threshold = 0.1,
  once = true,
}) => {
  const { prefersReducedMotion, enableScrollAnimations, animationSpeed } = useEnhancedAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { 
    once, 
    amount: threshold 
  });

  if (!enableScrollAnimations || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const directions: Record<string, any> = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 },
    scale: { scale: 0.8 },
    fade: {},
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        ...directions[direction],
      }}
      animate={isInView ? {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      } : {}}
      transition={{
        ...easings.easeOutQuart,
        duration: 0.6 / animationSpeed,
        delay: delay / animationSpeed,
      }}
    >
      {children}
    </motion.div>
  );
};

// Loading Dots Props
interface EnhancedLoadingDotsProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

// Enhanced Loading Animation
export const EnhancedLoadingDots: React.FC<EnhancedLoadingDotsProps> = ({ 
  className = '', 
  size = 'md', 
  color = 'currentColor' 
}) => {
  const { prefersReducedMotion } = useEnhancedAnimation();

  const sizes = {
    sm: 8,
    md: 12,
    lg: 16,
  };

  const dotSize = sizes[size] || sizes.md;

  if (prefersReducedMotion) {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: color,
              opacity: 0.6,
            }}
            className="rounded-full"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
          }}
          className="rounded-full"
          animate={{
            y: [-dotSize/2, dotSize/2, -dotSize/2],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Skeleton Props
interface AnimatedSkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

// Skeleton Loading with shimmer effect
export const AnimatedSkeleton: React.FC<AnimatedSkeletonProps> = ({ 
  width = '100%', 
  height = '1rem', 
  className = '',
  variant = 'rectangular' 
}) => {
  const { prefersReducedMotion } = useEnhancedAnimation();

  const variantClasses = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded',
  };

  return (
    <div
      className={`
        relative overflow-hidden bg-gray-200 dark:bg-gray-700
        ${variantClasses[variant] || variantClasses.rectangular}
        ${className}
      `}
      style={{ width, height }}
    >
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
    </div>
  );
};

// Stagger List Props
interface StaggerListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

// List Stagger Animation
export const StaggerList: React.FC<StaggerListProps> = ({ 
  children, 
  className = '',
  staggerDelay = 0.05,
  initialDelay = 0,
}) => {
  const { prefersReducedMotion, animationSpeed } = useEnhancedAnimation();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay / animationSpeed,
            delayChildren: initialDelay / animationSpeed,
          }
        }
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ ease: easings.easeOutQuart, duration: 0.5 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Parallax Props
interface ParallaxElementProps {
  children: ReactNode;
  className?: string;
  offset?: number;
}

// Parallax Scroll Effect
export const ParallaxElement: React.FC<ParallaxElementProps> = ({ 
  children, 
  className = '',
  offset = 100,
}) => {
  const { prefersReducedMotion, enableScrollAnimations } = useEnhancedAnimation();
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  if (!enableScrollAnimations || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y }}
    >
      {children}
    </motion.div>
  );
};

// Export all components
export default {
  EnhancedAnimationProvider,
  EnhancedPageTransition,
  InteractiveCard,
  AnimatedModal,
  AnimatedDrawer,
  AnimatedButton,
  AnimatedToggle,
  AnimatedInput,
  ScrollReveal,
  EnhancedLoadingDots,
  AnimatedSkeleton,
  StaggerList,
  ParallaxElement,
  easings,
};