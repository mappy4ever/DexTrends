/**
 * GPU-Optimized Animation Utilities
 * 
 * These utilities ensure animations use GPU acceleration for better performance
 * by using transform3d and will-change CSS properties
 */

import { CSSProperties } from 'react';

// CSS properties that trigger GPU acceleration
export const gpuAcceleration: CSSProperties = {
  transform: 'translateZ(0)',
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden',
  perspective: 1000
};

// Optimized transform styles
export const transform3d = {
  scale: (value: number) => `scale3d(${value}, ${value}, 1)`,
  translate: (x: number, y: number) => `translate3d(${x}px, ${y}px, 0)`,
  rotate: (deg: number) => `rotate3d(0, 0, 1, ${deg}deg)`,
  translateX: (x: number) => `translate3d(${x}px, 0, 0)`,
  translateY: (y: number) => `translate3d(0, ${y}px, 0)`
};

// GPU-optimized motion variants for framer-motion
export const gpuOptimizedVariants = {
  fadeIn: {
    hidden: {
      opacity: 0,
      transform: 'translate3d(0, 0, 0)'
    },
    visible: {
      opacity: 1,
      transform: 'translate3d(0, 0, 0)',
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  },
  
  slideUp: {
    hidden: {
      opacity: 0,
      transform: 'translate3d(0, 20px, 0)'
    },
    visible: {
      opacity: 1,
      transform: 'translate3d(0, 0, 0)',
      transition: {
        duration: 0.4,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  },
  
  scaleIn: {
    hidden: {
      opacity: 0,
      transform: 'scale3d(0.9, 0.9, 1)'
    },
    visible: {
      opacity: 1,
      transform: 'scale3d(1, 1, 1)',
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  },
  
  hover: {
    rest: {
      transform: 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    hover: {
      transform: 'scale3d(1.05, 1.05, 1) translate3d(0, -2px, 0)',
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  }
};

// Utility classes for GPU acceleration
export const gpuClasses = {
  base: 'transform-gpu will-change-transform',
  hover: 'hover:transform-gpu hover:will-change-transform',
  animation: 'transform-gpu will-change-[transform,opacity]',
  scroll: 'transform-gpu will-change-scroll'
};

// Performance monitoring wrapper
export const withGPUAcceleration = (className: string = ''): string => {
  return `${className} ${gpuClasses.base}`.trim();
};

// Check if GPU acceleration is supported
export const isGPUAccelerationSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  return !!gl;
};

// Optimize scroll performance
export const optimizeScroll = (element: HTMLElement | null): void => {
  if (!element) return;
  
  element.style.willChange = 'scroll-position';
  element.style.transform = 'translateZ(0)';
  element.style.backfaceVisibility = 'hidden';
  element.style.perspective = '1000px';
};

// Clean up will-change after animation
export const cleanupAnimation = (element: HTMLElement | null): void => {
  if (!element) return;
  
  element.style.willChange = 'auto';
};

// Batch DOM updates for better performance
export const batchDOMUpdates = (updates: (() => void)[]): void => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};

// Debounce animations for better performance
export const debounceAnimation = (
  callback: () => void,
  delay: number = 16 // ~60fps
): (() => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
};

// Intersection Observer for lazy animations
export const createLazyAnimationObserver = (
  onIntersect: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null => {
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    return null;
  }
  
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        onIntersect(entry);
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
};

// CSS custom properties for GPU-optimized animations
export const gpuCSSVariables = `
  --gpu-transform: translateZ(0);
  --gpu-will-change: transform, opacity;
  --gpu-backface: hidden;
  --gpu-perspective: 1000;
`;

// Export all utilities
export default {
  gpuAcceleration,
  transform3d,
  gpuOptimizedVariants,
  gpuClasses,
  withGPUAcceleration,
  isGPUAccelerationSupported,
  optimizeScroll,
  cleanupAnimation,
  batchDOMUpdates,
  debounceAnimation,
  createLazyAnimationObserver,
  gpuCSSVariables
};