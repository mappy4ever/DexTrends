import React, { lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for framer-motion components
export const motion = dynamic(
  () => import('framer-motion').then(mod => mod.motion as any),
  {
    ssr: false,
    loading: () => <div />,
  }
) as any;

export const AnimatePresence = dynamic(
  () => import('framer-motion').then(mod => mod.AnimatePresence as any),
  {
    ssr: false,
    loading: () => <div />,
  }
) as any;

// Create placeholder hook functions that return safe defaults
// These prevent the direct import of framer-motion hooks
export const useScroll = () => ({ scrollY: { current: 0 }, scrollX: { current: 0 } });
export const useTransform = (input: any, output: any) => ({ current: output?.[0] || 0 });
export const useSpring = (value: any) => ({ current: value });
export const useMotionValue = (initialValue: any) => ({ 
  current: initialValue,
  set: () => {},
  get: () => initialValue
});
export const useAnimation = () => ({ start: () => {}, stop: () => {}, set: () => {} });
export const useInView = () => false;
export const useReducedMotion = () => false;

// Export additional types and interfaces that might be imported
export interface PanInfo {
  point: { x: number; y: number };
  delta: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
}

export interface HTMLMotionProps<T extends keyof HTMLElementTagNameMap> {
  [key: string]: any;
}

export interface Variants {
  [key: string]: any;
}

export interface Transition {
  [key: string]: any;
}

export interface SpringOptions {
  [key: string]: any;
}

export interface MotionValue<T = any> {
  current: T;
  set: (value: T) => void;
  get: () => T;
}

// Re-export commonly used motion components with lazy loading
export const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => {
    const Component = mod.motion.div;
    return { default: Component };
  }),
  { 
    ssr: false,
    loading: () => <div /> 
  }
);

export const MotionSpan = dynamic(
  () => import('framer-motion').then(mod => {
    const Component = mod.motion.span;
    return { default: Component };
  }),
  { 
    ssr: false,
    loading: () => <span /> 
  }
);

export const MotionSection = dynamic(
  () => import('framer-motion').then(mod => {
    const Component = mod.motion.section;
    return { default: Component };
  }),
  { 
    ssr: false,
    loading: () => <section /> 
  }
);

// Export common variants and animations
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
};