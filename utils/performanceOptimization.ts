/**
 * Performance Optimization System
 * Utilities and patterns for optimal performance
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Dynamic import with loading fallback
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    ssr: options?.ssr ?? true,
  });
}

/**
 * Debounce function for search and input handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for scroll and resize handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Request Idle Callback wrapper for non-critical work
 */
export function whenIdle(callback: () => void, options?: IdleRequestOptions) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, options);
  } else {
    // Fallback for Safari
    setTimeout(callback, 1);
  }
}

/**
 * Batch DOM updates using requestAnimationFrame
 */
export function batchUpdate(updates: (() => void)[]) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

/**
 * Memory-efficient memoization
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  maxSize: number = 100
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    
    // Limit cache size
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Virtual list configuration
 */
export const virtualListConfig = {
  itemHeight: 280, // Pokemon card height
  overscan: 3, // Number of items to render outside viewport
  scrollDebounce: 50,
  scrollThrottle: 16, // ~60fps
};

/**
 * Image optimization settings
 */
export const imageOptimization = {
  // Quality settings
  quality: {
    thumbnail: 30,
    low: 50,
    medium: 75,
    high: 90,
  },
  
  // Sizes for responsive images
  sizes: {
    thumbnail: '(max-width: 640px) 100px, 150px',
    card: '(max-width: 640px) 150px, (max-width: 1024px) 200px, 250px',
    hero: '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px',
  },
  
  // Formats
  formats: ['webp', 'avif'] as const,
};

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private marks = new Map<string, number>();
  
  mark(name: string) {
    this.marks.set(name, performance.now());
  }
  
  measure(name: string, startMark: string, endMark?: string) {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();
    
    if (start && end) {
      const duration = end - start;
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }
      
      // Send to analytics in production
      if (typeof window !== 'undefined' && 'sendBeacon' in navigator) {
        // navigator.sendBeacon('/api/analytics/performance', JSON.stringify({
        //   name,
        //   duration,
        //   timestamp: Date.now()
        // }));
      }
      
      return duration;
    }
    
    return 0;
  }
  
  clear() {
    this.marks.clear();
  }
}

/**
 * Web Vitals tracking
 */
export function trackWebVitals() {
  if (typeof window === 'undefined') return;
  
  // First Contentful Paint
  const paintObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        console.log(`[Web Vitals] FCP: ${entry.startTime.toFixed(2)}ms`);
      }
    }
  });
  
  paintObserver.observe({ entryTypes: ['paint'] });
  
  // Largest Contentful Paint
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log(`[Web Vitals] LCP: ${lastEntry.startTime.toFixed(2)}ms`);
  });
  
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  
  // First Input Delay
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fid = (entry as any).processingStart - entry.startTime;
      console.log(`[Web Vitals] FID: ${fid.toFixed(2)}ms`);
    }
  });
  
  fidObserver.observe({ entryTypes: ['first-input'] });
  
  // Cumulative Layout Shift
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
        console.log(`[Web Vitals] CLS: ${clsValue.toFixed(3)}`);
      }
    }
  });
  
  clsObserver.observe({ entryTypes: ['layout-shift'] });
}

/**
 * Preload critical resources
 */
export function preloadCriticalAssets(assets: string[]) {
  if (typeof window === 'undefined') return;
  
  assets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (asset.endsWith('.css')) {
      link.as = 'style';
    } else if (asset.endsWith('.js')) {
      link.as = 'script';
    } else if (asset.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
      link.as = 'image';
    } else if (asset.match(/\.(woff|woff2)$/)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    }
    
    link.href = asset;
    document.head.appendChild(link);
  });
}

/**
 * Intersection Observer for lazy loading
 */
export function createLazyObserver(
  onIntersect: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onIntersect(entry);
        }
      });
    },
    {
      rootMargin: '50px',
      threshold: 0.01,
      ...options
    }
  );
}

/**
 * Prefetch on hover/focus
 */
export function prefetchOnInteraction(url: string) {
  const prefetch = () => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  };
  
  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  };
}

/**
 * Component code splitting boundaries
 */
export const CodeSplitBoundaries = {
  // Heavy components to lazy load
  Charts: () => lazyLoad(() => import('@/components/ui/charts/PriceHistoryChart')),
  Modal: () => lazyLoad(() => import('@/components/ui/modals/EnhancedCardModal')),
  CardComparison: () => lazyLoad(() => import('@/components/ui/cards/CardComparisonTool')),
  ThreeDCard: () => lazyLoad(() => import('@/components/ui/cards/Enhanced3DCard')),
  DataTable: () => lazyLoad(() => import('@/components/unified/UnifiedDataTable')),
  EvolutionTree: () => lazyLoad(() => import('@/components/ui/EvolutionTreeRenderer')),
  
  // Page-level splits
  CollectionDashboard: () => lazyLoad(() => import('@/components/ui/layout/CollectionDashboard')),
};

/**
 * Resource hints for better loading
 */
export const resourceHints = {
  // DNS prefetch for external APIs
  dnsPrefetch: [
    'https://api.pokemontcg.io',
    'https://pokeapi.co',
    'https://raw.githubusercontent.com',
    'https://images.pokemontcg.io',
  ],
  
  // Preconnect for critical origins
  preconnect: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ],
};

// Auto-initialize performance tracking in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  trackWebVitals();
}