/**
 * Micro-Interaction System
 * Provides delightful animations and feedback for user interactions
 */

import { cn } from '@/utils/cn';

/**
 * Hover effects for different components
 */
export const hoverEffects = {
  // Scale effects
  scaleSmall: 'hover:scale-[1.02] transition-transform duration-200',
  scaleMedium: 'hover:scale-105 transition-transform duration-200',
  scaleLarge: 'hover:scale-110 transition-transform duration-200',
  
  // Lift effects (shadow + translate)
  liftSmall: 'hover:-translate-y-0.5 hover:shadow-md transition-all duration-200',
  liftMedium: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200',
  liftLarge: 'hover:-translate-y-2 hover:shadow-xl transition-all duration-200',
  
  // Glow effects
  glow: 'hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-shadow duration-300',
  glowStrong: 'hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-shadow duration-300',
  
  // Border effects
  borderGrow: 'hover:border-2 transition-all duration-200',
  borderColor: 'hover:border-purple-500 dark:hover:border-purple-400 transition-colors duration-200',
  
  // Background effects
  bgFade: 'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200',
  bgGradient: 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-300',
} as const;

/**
 * Click/Tap animations
 */
export const clickAnimations = {
  // Scale down on click
  scaleClick: 'active:scale-95 transition-transform duration-150',
  
  // Pulse effect
  pulse: 'active:animate-pulse',
  
  // Ripple (requires JS implementation)
  ripple: 'relative overflow-hidden ripple-container',
  
  // Bounce
  bounce: 'active:animate-bounce',
} as const;

/**
 * Page transition animations
 */
export const pageTransitions = {
  // Fade transitions
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  
  // Slide transitions
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  // Scale transitions
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },
  
  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
} as const;

/**
 * Loading animations
 */
export const loadingAnimations = {
  // Spin
  spin: 'animate-spin',
  
  // Pulse
  pulse: 'animate-pulse',
  
  // Skeleton shimmer
  shimmer: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]',
  
  // Progress bar
  progress: 'animate-progress bg-gradient-to-r from-purple-500 to-pink-500',
} as const;

/**
 * Success/Error feedback animations
 */
export const feedbackAnimations = {
  // Success
  success: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
  
  // Error shake
  errorShake: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    },
  },
  
  // Warning pulse
  warningPulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 1, repeat: Infinity },
    },
  },
} as const;

/**
 * Scroll-triggered animations
 */
export const scrollAnimations = {
  // Fade in on scroll
  fadeInScroll: 'opacity-0 animate-[fadeIn_0.5s_ease-out_forwards] [animation-play-state:paused] [animation-delay:calc(var(--scroll)*1s)]',
  
  // Parallax
  parallax: 'transform translate-y-[calc(var(--scroll)*20px)]',
  
  // Reveal
  reveal: cn(
    'opacity-0 translate-y-10',
    'transition-all duration-700',
    '[&.in-view]:opacity-100 [&.in-view]:translate-y-0'
  ),
} as const;

/**
 * Icon animations
 */
export const iconAnimations = {
  // Rotate on hover
  rotateHover: 'hover:rotate-12 transition-transform duration-200',
  
  // Spin on hover
  spinHover: 'hover:rotate-180 transition-transform duration-300',
  
  // Wiggle
  wiggle: 'hover:animate-[wiggle_0.3s_ease-in-out]',
  
  // Heart beat
  heartbeat: 'hover:animate-[heartbeat_1s_ease-in-out_infinite]',
} as const;

/**
 * Card-specific animations
 */
export const cardAnimations = {
  // 3D tilt on hover
  tilt3D: 'hover:[transform:perspective(1000px)_rotateX(10deg)_rotateY(10deg)] transition-transform duration-300',
  
  // Flip card
  flip: '[transform-style:preserve-3d] hover:[transform:rotateY(180deg)] transition-transform duration-600',
  
  // Expand on hover
  expand: 'hover:scale-[1.02] hover:z-10 transition-all duration-300',
  
  // Shine effect
  shine: 'relative overflow-hidden hover:before:animate-[shine_0.5s]',
} as const;

/**
 * Button-specific animations
 */
export const buttonAnimations = {
  // Slide background
  slideBackground: cn(
    'relative overflow-hidden',
    'before:absolute before:inset-0 before:bg-purple-600',
    'before:translate-x-[-100%] hover:before:translate-x-0',
    'before:transition-transform before:duration-300'
  ),
  
  // Glow pulse
  glowPulse: 'hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:animate-pulse transition-shadow duration-300',
  
  // Border draw
  borderDraw: cn(
    'relative',
    'before:absolute before:inset-0 before:border-2 before:border-purple-500',
    'before:scale-x-0 hover:before:scale-x-100',
    'before:transition-transform before:duration-300'
  ),
} as const;

/**
 * Text animations
 */
export const textAnimations = {
  // Underline draw
  underlineDraw: cn(
    'relative',
    'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full',
    'after:bg-purple-500 after:scale-x-0 hover:after:scale-x-100',
    'after:transition-transform after:duration-300 after:origin-left'
  ),
  
  // Gradient shift
  gradientShift: 'bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent hover:from-pink-500 hover:to-purple-500 transition-all duration-500',
  
  // Letter spacing
  letterSpacing: 'hover:tracking-wider transition-all duration-300',
} as const;

/**
 * Modal/Overlay animations
 */
export const modalAnimations = {
  // Backdrop fade
  backdropFade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  
  // Modal slide up
  modalSlideUp: {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 },
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
  
  // Modal scale
  modalScale: {
    initial: { opacity: 0, scale: 0.75 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.75 },
    transition: { duration: 0.2 },
  },
} as const;

/**
 * Utility function to combine animations
 */
export function combineAnimations(...animations: string[]): string {
  return cn(...animations);
}

/**
 * CSS keyframes to add to global styles:
 * 
 * @keyframes fadeIn {
 *   from { opacity: 0; }
 *   to { opacity: 1; }
 * }
 * 
 * @keyframes wiggle {
 *   0%, 100% { transform: rotate(-3deg); }
 *   50% { transform: rotate(3deg); }
 * }
 * 
 * @keyframes heartbeat {
 *   0%, 100% { transform: scale(1); }
 *   50% { transform: scale(1.1); }
 * }
 * 
 * @keyframes shine {
 *   from { transform: translateX(-100%); }
 *   to { transform: translateX(200%); }
 * }
 * 
 * @keyframes progress {
 *   from { transform: translateX(-100%); }
 *   to { transform: translateX(0); }
 * }
 */