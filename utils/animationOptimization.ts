/**
 * Animation Optimization Utilities
 * Ensures 60fps animations on mobile devices
 */

// GPU-accelerated properties
export const GPU_ACCELERATED_PROPS = [
  'transform',
  'opacity',
  'filter',
  'backdrop-filter'
] as const;

// Will-change optimization manager
class WillChangeManager {
  private elements = new WeakMap<HTMLElement, string[]>();
  private timeouts = new WeakMap<HTMLElement, NodeJS.Timeout>();

  /**
   * Add will-change property with auto-cleanup
   */
  add(element: HTMLElement, properties: string[], duration = 1000) {
    if (!element) return;

    // Clear existing timeout
    const existingTimeout = this.timeouts.get(element);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Apply will-change
    element.style.willChange = properties.join(', ');
    this.elements.set(element, properties);

    // Auto-remove after animation
    const timeout = setTimeout(() => {
      this.remove(element);
    }, duration);
    
    this.timeouts.set(element, timeout);
  }

  /**
   * Remove will-change property
   */
  remove(element: HTMLElement) {
    if (!element) return;

    element.style.willChange = 'auto';
    this.elements.delete(element);
    
    const timeout = this.timeouts.get(element);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(element);
    }
  }

  /**
   * Clear all will-change properties
   */
  clear() {
    this.elements = new WeakMap();
    this.timeouts = new WeakMap();
  }
}

export const willChange = new WillChangeManager();

/**
 * Request Animation Frame throttle
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  callback: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T>;

  return (...args: Parameters<T>) => {
    lastArgs = args;
    
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        callback(...lastArgs);
        rafId = null;
      });
    }
  };
}

/**
 * Optimized scroll handler with passive events
 */
export function optimizedScrollHandler(
  element: HTMLElement | Window,
  handler: (e: Event) => void,
  options?: { throttle?: boolean; passive?: boolean }
) {
  const { throttle = true, passive = true } = options || {};
  
  const callback = throttle ? rafThrottle(handler) : handler;
  
  element.addEventListener('scroll', callback, { passive });
  
  return () => {
    element.removeEventListener('scroll', callback);
  };
}

/**
 * Batch DOM reads and writes
 */
class DOMBatcher {
  private reads: Array<() => void> = [];
  private writes: Array<() => void> = [];
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
    if (this.scheduled) return;
    
    this.scheduled = true;
    requestAnimationFrame(() => {
      this.flush();
    });
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

export const domBatch = new DOMBatcher();

/**
 * Create optimized spring animation
 */
export function createSpringAnimation(
  element: HTMLElement,
  property: string,
  from: number,
  to: number,
  options?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
    onComplete?: () => void;
  }
) {
  const {
    stiffness = 300,
    damping = 30,
    mass = 1,
    onComplete
  } = options || {};

  let velocity = 0;
  let current = from;
  let rafId: number;

  const step = () => {
    const force = (to - current) * stiffness;
    const damper = velocity * damping;
    const acceleration = (force - damper) / mass;
    
    velocity += acceleration * 0.016; // 60fps timestep
    current += velocity * 0.016;
    
    // Apply transform
    if (property === 'translateX') {
      element.style.transform = `translateX(${current}px)`;
    } else if (property === 'translateY') {
      element.style.transform = `translateY(${current}px)`;
    } else if (property === 'scale') {
      element.style.transform = `scale(${current})`;
    } else if (property === 'opacity') {
      element.style.opacity = String(current);
    }
    
    // Check if animation is complete
    if (Math.abs(velocity) < 0.01 && Math.abs(to - current) < 0.01) {
      if (onComplete) onComplete();
      return;
    }
    
    rafId = requestAnimationFrame(step);
  };
  
  // Start animation
  willChange.add(element, [property], 2000);
  rafId = requestAnimationFrame(step);
  
  // Return cleanup function
  return () => {
    cancelAnimationFrame(rafId);
    willChange.remove(element);
  };
}

/**
 * Intersection Observer for lazy animations
 */
export function lazyAnimate(
  elements: NodeListOf<HTMLElement> | HTMLElement[],
  animationClass: string,
  options?: IntersectionObserverInit
) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        
        // Use will-change for optimization
        willChange.add(element, ['transform', 'opacity'], 1000);
        
        // Add animation class
        element.classList.add(animationClass);
        
        // Unobserve after animation
        observer.unobserve(element);
      }
    });
  }, options || { threshold: 0.1, rootMargin: '50px' });

  Array.from(elements).forEach(el => observer.observe(el));
  
  return observer;
}

/**
 * Optimize CSS animations for mobile
 */
export function optimizeCSSAnimation(element: HTMLElement) {
  // Force GPU acceleration
  if (!element.style.transform) {
    element.style.transform = 'translateZ(0)';
  }
  
  // Add will-change for known animations
  const animations = window.getComputedStyle(element).animationName;
  if (animations && animations !== 'none') {
    willChange.add(element, ['transform', 'opacity'], 5000);
  }
  
  // Use CSS containment
  element.style.contain = 'layout style paint';
}

/**
 * Frame rate monitor for development
 */
export class FPSMonitor {
  private lastTime = performance.now();
  private frames = 0;
  private fps = 0;
  
  start(callback?: (fps: number) => void) {
    const measure = () => {
      this.frames++;
      
      const currentTime = performance.now();
      if (currentTime >= this.lastTime + 1000) {
        this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
        this.frames = 0;
        this.lastTime = currentTime;
        
        if (callback) callback(this.fps);
      }
      
      requestAnimationFrame(measure);
    };
    
    requestAnimationFrame(measure);
  }
  
  getFPS() {
    return this.fps;
  }
}

/**
 * Reduce motion for accessibility
 */
export function respectReducedMotion() {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Smooth number animation
 */
export function animateNumber(
  element: HTMLElement,
  from: number,
  to: number,
  duration = 1000,
  formatter?: (value: number) => string
) {
  const startTime = performance.now();
  
  const update = () => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out-cubic)
    const eased = 1 - Math.pow(1 - progress, 3);
    
    const current = from + (to - from) * eased;
    element.textContent = formatter ? formatter(current) : String(Math.round(current));
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };
  
  requestAnimationFrame(update);
}