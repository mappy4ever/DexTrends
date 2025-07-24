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

// Animation variants moved to animationVariants.ts to avoid Fast Refresh issues
// Re-export for convenience
export { fadeIn, slideUp, scaleIn } from './animationVariants';