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
export const AnimationContext = createContext<AnimationContextValue>({
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

// NOTE: Hooks and utilities have been moved to separate files for Fast Refresh compatibility:
// - useAnimations hook: /hooks/useAnimations.ts
// - animationVariants & preloadAnimations: /utils/animation.ts

export default AnimationProvider;