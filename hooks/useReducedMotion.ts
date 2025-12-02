/**
 * useReducedMotion Hook
 *
 * Detects user's preference for reduced motion.
 * Returns true if user prefers reduced motion.
 *
 * Usage:
 * const prefersReducedMotion = useReducedMotion();
 *
 * With Framer Motion:
 * <motion.div
 *   animate={prefersReducedMotion ? {} : { scale: 1.1 }}
 * />
 */

import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function getInitialState(): boolean {
  // SSR safety
  if (typeof window === 'undefined') return false;
  return window.matchMedia(QUERY).matches;
}

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialState);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Get motion-safe animation variants for Framer Motion
 *
 * Usage:
 * const variants = getMotionVariants(prefersReducedMotion);
 * <motion.div variants={variants} initial="hidden" animate="visible" />
 */
export function getMotionVariants(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      hidden: { opacity: 1 },
      visible: { opacity: 1 },
      exit: { opacity: 1 },
    };
  }

  return {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2, ease: 'easeIn' }
    },
  };
}

/**
 * Get reduced transition config for Framer Motion
 */
export function getReducedTransition(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return { duration: 0 };
  }
  return { duration: 0.3, ease: 'easeOut' };
}

export default useReducedMotion;
