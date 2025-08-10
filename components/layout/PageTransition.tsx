// Enhanced Page Transition Component - extracted from _app.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { pageVariants, defaultTransition, getRouteTransition, prefersReducedMotion } from '../../utils/pageTransitions';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const router = useRouter();
  const routeTransition = getRouteTransition(router.pathname);
  const variants = pageVariants[routeTransition.type];
  const reducedMotion = prefersReducedMotion();

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={router.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={variants}
        transition={defaultTransition}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};