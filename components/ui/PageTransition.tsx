import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { cn } from '@/utils/cn';
import { pageTransitions } from '@/utils/microInteractionSystem';
import { performantAnimations } from '@/utils/animationPerformance';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  mode?: 'fade' | 'slide' | 'scale' | 'slideUp';
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className,
  mode = 'fade'
}) => {
  const router = useRouter();
  
  const transitions = {
    fade: pageTransitions.fadeIn,
    slide: pageTransitions.slideLeft,
    scale: pageTransitions.scaleIn,
    slideUp: pageTransitions.slideUp,
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={router.pathname}
        initial={transitions[mode].initial}
        animate={transitions[mode].animate}
        exit={transitions[mode].exit}
        transition={transitions[mode].transition}
        className={cn(performantAnimations.fadeIn, className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Stagger children animation wrapper
export const StaggerChildren: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}> = ({ children, className, delay = 0.1, stagger = 0.05 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={className}
      variants={{
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={pageTransitions.staggerItem}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Section transition for lazy loaded sections
export const SectionTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className, delay = 0 }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// Hero entrance animation
export const HeroTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Card entrance animation for grids
export const CardGridTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.03,
          },
        },
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { 
              opacity: 0, 
              scale: 0.8,
              y: 20 
            },
            visible: { 
              opacity: 1, 
              scale: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
              }
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Tab content transition
export const TabTransition: React.FC<{
  children: React.ReactNode;
  tabKey: string;
  className?: string;
}> = ({ children, tabKey, className }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Modal transition
export const ModalTransition: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
}> = ({ children, isOpen, className }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center p-4",
              className
            )}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Skeleton to content transition
export const SkeletonTransition: React.FC<{
  children: React.ReactNode;
  isLoading: boolean;
  skeleton: React.ReactNode;
  className?: string;
}> = ({ children, isLoading, skeleton, className }) => {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Scroll reveal animation
export const ScrollReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  delay?: number;
}> = ({ children, className, threshold = 0.1, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{ 
        duration: 0.6,
        delay,
        ease: [0.43, 0.13, 0.23, 0.96]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};