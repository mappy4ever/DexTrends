/**
 * Animation Provider - Lazy loads framer-motion to reduce initial bundle size
 * This provider should wrap components that need animation functionality
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { motion as Motion, AnimatePresence as AnimatePresenceType, useAnimation, useInView, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

interface AnimationContextValue {
  motion: typeof Motion | any;
  AnimatePresence: typeof AnimatePresenceType | any;
  useAnimation: typeof useAnimation | (() => null);
  useInView: typeof useInView | (() => boolean);
  useMotionValue: typeof useMotionValue | (() => null);
  useSpring: typeof useSpring | (() => null);
  useTransform: typeof useTransform | (() => null);
  useReducedMotion: typeof useReducedMotion | (() => boolean);
  isLoaded: boolean;
}

// Create context for animation components
const AnimationContext = createContext<AnimationContextValue>({
  motion: null,
  AnimatePresence: null,
  useAnimation: () => null,
  useInView: () => false,
  useMotionValue: () => null,
  useSpring: () => null,
  useTransform: () => null,
  useReducedMotion: () => false,
  isLoaded: false
});

// Static placeholders for when framer-motion is not loaded
const staticDiv = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => <div ref={ref} {...props} />);
const staticSpan = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>((props, ref) => <span ref={ref} {...props} />);
const staticButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => <button ref={ref} {...props} />);
const staticSection = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>((props, ref) => <section ref={ref} {...props} />);
const staticArticle = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>((props, ref) => <article ref={ref} {...props} />);
const staticA = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>((props, ref) => <a ref={ref} {...props} />);

const staticMotion = {
  div: staticDiv,
  span: staticSpan,
  button: staticButton,
  section: staticSection,
  article: staticArticle,
  a: staticA
};

const staticAnimatePresence: React.FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;

// Placeholder hooks that return sensible defaults
const placeholderHook = () => null;
const useReducedMotionPlaceholder = () => false;
const useInViewPlaceholder = () => true;

interface AnimationProviderProps {
  children: ReactNode;
  preload?: boolean;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children, preload = false }) => {
  const [animationAPI, setAnimationAPI] = useState<AnimationContextValue>({
    motion: staticMotion,
    AnimatePresence: staticAnimatePresence,
    useAnimation: placeholderHook,
    useInView: useInViewPlaceholder,
    useMotionValue: placeholderHook,
    useSpring: placeholderHook,
    useTransform: placeholderHook,
    useReducedMotion: useReducedMotionPlaceholder,
    isLoaded: false
  });

  useEffect(() => {
    if (preload || typeof window !== 'undefined') {
      // Load framer-motion dynamically
      import('framer-motion').then((framerMotion) => {
        setAnimationAPI({
          motion: framerMotion.motion,
          AnimatePresence: framerMotion.AnimatePresence,
          useAnimation: framerMotion.useAnimation,
          useInView: framerMotion.useInView,
          useMotionValue: framerMotion.useMotionValue,
          useSpring: framerMotion.useSpring,
          useTransform: framerMotion.useTransform,
          useReducedMotion: framerMotion.useReducedMotion,
          isLoaded: true
        });
      });
    }
  }, [preload]);

  return (
    <AnimationContext.Provider value={animationAPI}>
      {children}
    </AnimationContext.Provider>
  );
};

// Hook to use animation components
export const useAnimations = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimations must be used within AnimationProvider');
  }
  return context;
};

// Pre-built animation variants for common use cases
export const animationVariants: Record<string, any> = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },
  rotate: {
    initial: { opacity: 0, rotate: -180 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 180 }
  }
};

// Utility function to preload framer-motion
export const preloadAnimations = () => {
  if (typeof window !== 'undefined') {
    import('framer-motion');
  }
};

export default AnimationProvider;