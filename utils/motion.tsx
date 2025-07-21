// Optimized framer-motion imports using LazyMotion for smaller bundle
import { LazyMotion, domAnimation, m } from 'framer-motion';
import type { ReactNode } from 'react';

// Export optimized motion components
export { m as motion } from 'framer-motion';
export { AnimatePresence } from 'framer-motion';

// LazyMotion provider component
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

// Common animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
};