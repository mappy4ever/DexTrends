/**
 * Animation Performance Optimization
 * GPU-accelerated animations and will-change optimizations
 */

import { cn } from '@/utils/cn';

/**
 * Will-change properties for different animation types
 */
export const willChangeClasses = {
  // Transform animations
  transform: 'will-change-transform',
  opacity: 'will-change-opacity',
  scale: 'will-change-transform',
  rotate: 'will-change-transform',
  
  // Combined animations
  transformOpacity: 'will-change-[transform,opacity]',
  all: 'will-change-[transform,opacity,filter]',
  
  // Scroll-based
  scroll: 'will-change-scroll',
  
  // Auto - browser decides
  auto: 'will-change-auto',
  
  // None - remove will-change after animation
  none: 'will-change-auto',
} as const;

/**
 * GPU-accelerated transform utilities
 */
export const gpuTransforms = {
  // 3D transforms force GPU acceleration
  gpu: 'transform-gpu translate-z-0',
  scale: 'transform-gpu scale-100',
  rotate: 'transform-gpu rotate-0',
  translate: 'transform-gpu translate-x-0 translate-y-0',
  
  // Backface visibility for smooth animations
  backface: 'backface-visibility-hidden',
  perspective: 'perspective-1000',
  preserve3d: 'transform-style-preserve-3d',
} as const;

/**
 * Performance-optimized animation classes
 */
export const performantAnimations = {
  // Hover animations (GPU-accelerated)
  hoverScale: cn(
    'transition-transform duration-200',
    'hover:scale-105',
    gpuTransforms.gpu,
    willChangeClasses.transform,
    'hover:will-change-transform',
    'active:scale-95'
  ),
  
  hoverLift: cn(
    'transition-all duration-200',
    'hover:-translate-y-1 hover:shadow-lg',
    gpuTransforms.gpu,
    willChangeClasses.transformOpacity
  ),
  
  hoverRotate: cn(
    'transition-transform duration-300',
    'hover:rotate-3',
    gpuTransforms.gpu,
    willChangeClasses.transform
  ),
  
  // Fade animations
  fadeIn: cn(
    'animate-fadeIn',
    willChangeClasses.opacity,
    'animation-fill-mode-both'
  ),
  
  fadeInUp: cn(
    'animate-fadeInUp',
    gpuTransforms.gpu,
    willChangeClasses.transformOpacity
  ),
  
  // Slide animations
  slideIn: cn(
    'animate-slideIn',
    gpuTransforms.gpu,
    willChangeClasses.transform
  ),
  
  // Card animations
  card3D: cn(
    gpuTransforms.preserve3d,
    gpuTransforms.backface,
    willChangeClasses.transform,
    'transition-transform duration-300'
  ),
  
  cardFlip: cn(
    gpuTransforms.preserve3d,
    'transition-transform duration-600',
    willChangeClasses.transform,
    '[transform-style:preserve-3d]',
    'hover:[transform:rotateY(180deg)]'
  ),
  
  // Loading animations
  spin: cn(
    'animate-spin',
    gpuTransforms.gpu,
    willChangeClasses.transform
  ),
  
  pulse: cn(
    'animate-pulse',
    willChangeClasses.opacity
  ),
  
  shimmer: cn(
    'animate-shimmer',
    'bg-gradient-to-r from-transparent via-white/10 to-transparent',
    'bg-[length:200%_100%]',
    willChangeClasses.auto
  ),
} as const;

/**
 * Remove will-change after animation completes
 */
export function optimizeWillChange(element: HTMLElement, duration: number = 200) {
  element.style.willChange = 'transform, opacity';
  
  setTimeout(() => {
    element.style.willChange = 'auto';
  }, duration);
}

/**
 * Request Animation Frame wrapper for smooth animations
 */
export function smoothAnimate(
  element: HTMLElement,
  properties: Record<string, string>,
  duration: number = 300
) {
  const start = performance.now();
  const initialStyles: Record<string, string> = {};
  
  // Store initial values
  Object.keys(properties).forEach(key => {
    initialStyles[key] = element.style.getPropertyValue(key);
  });
  
  // Add will-change
  element.style.willChange = Object.keys(properties).join(', ');
  
  function animate(currentTime: number) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    // Apply interpolated styles
    Object.entries(properties).forEach(([key, value]) => {
      if (typeof value === 'string' && value.includes('px')) {
        const initial = parseFloat(initialStyles[key] || '0');
        const target = parseFloat(value);
        const current = initial + (target - initial) * easeOut;
        element.style.setProperty(key, `${current}px`);
      } else {
        element.style.setProperty(key, value);
      }
    });
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Remove will-change after animation
      element.style.willChange = 'auto';
    }
  }
  
  requestAnimationFrame(animate);
}

/**
 * Batch DOM reads and writes for better performance
 */
export class DOMBatcher {
  private reads: (() => void)[] = [];
  private writes: (() => void)[] = [];
  private scheduled = false;
  
  read(fn: () => void) {
    this.reads.push(fn);
    this.schedule();
  }
  
  write(fn: () => void) {
    this.writes.push(fn);
    this.schedule();
  }
  
  private schedule() {
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }
  
  private flush() {
    const reads = [...this.reads];
    const writes = [...this.writes];
    
    this.reads = [];
    this.writes = [];
    this.scheduled = false;
    
    // Execute all reads first
    reads.forEach(fn => fn());
    
    // Then execute all writes
    writes.forEach(fn => fn());
  }
}

/**
 * FLIP animation technique for smooth layout changes
 */
export function flipAnimate(
  element: HTMLElement,
  callback: () => void,
  duration: number = 300
) {
  // First: record initial position
  const first = element.getBoundingClientRect();
  
  // Execute callback that changes layout
  callback();
  
  // Last: record final position
  const last = element.getBoundingClientRect();
  
  // Invert: calculate the delta
  const deltaX = first.left - last.left;
  const deltaY = first.top - last.top;
  const deltaW = first.width / last.width;
  const deltaH = first.height / last.height;
  
  // Play: animate from inverted position to final
  element.style.transformOrigin = 'top left';
  element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
  element.style.transition = 'none';
  
  // Force reflow
  element.offsetHeight;
  
  // Enable transitions and remove transform
  element.style.willChange = 'transform';
  element.style.transition = `transform ${duration}ms ease-out`;
  element.style.transform = '';
  
  // Cleanup
  setTimeout(() => {
    element.style.willChange = 'auto';
    element.style.transition = '';
    element.style.transformOrigin = '';
  }, duration);
}

/**
 * Reduce motion for accessibility
 */
export const reduceMotion = {
  check: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  classes: 'motion-reduce:transition-none motion-reduce:animate-none',
  
  apply: (animationClass: string) => {
    if (reduceMotion.check()) {
      return cn(animationClass, reduceMotion.classes);
    }
    return animationClass;
  }
} as const;

/**
 * CSS custom properties for animation timing
 */
export const animationTimings = {
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '700ms',
  slowest: '1000ms',
} as const;

/**
 * Easing functions
 */
export const easings = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

/**
 * Add to global CSS for custom animations:
 * 
 * @keyframes fadeInUp {
 *   from {
 *     opacity: 0;
 *     transform: translateY(20px);
 *   }
 *   to {
 *     opacity: 1;
 *     transform: translateY(0);
 *   }
 * }
 * 
 * @keyframes slideIn {
 *   from {
 *     transform: translateX(-100%);
 *   }
 *   to {
 *     transform: translateX(0);
 *   }
 * }
 */