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

// Export hooks directly from framer-motion
// These can't be dynamically imported as they are hooks
export { useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

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