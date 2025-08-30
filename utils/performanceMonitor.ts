import React from 'react';
import logger from './logger';

/**
 * Performance Monitoring System
 * 
 * Tracks:
 * - Page load times
 * - API response times  
 * - Component render performance
 * - Memory usage
 * - Bundle size impact
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    pageLoadTime?: number;
    timeToInteractive?: number;
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
    cumulativeLayoutShift?: number;
    firstInputDelay?: number;
    totalBlockingTime?: number;
  };
  resources: {
    jsSize: number;
    cssSize: number;
    imageSize: number;
    totalSize: number;
  };
  vitals?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private isEnabled: boolean;
  public vitals: Record<string, any> = {};
  private vitalsListeners: Set<(metric: any) => void> = new Set();

  constructor() {
    this.isEnabled = typeof window !== 'undefined' && 'performance' in window;
    
    if (this.isEnabled) {
      this.initializeObservers();
      this.trackInitialMetrics();
    }
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers() {
    // Observe Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          this.vitals.LCP = lastEntry.startTime;
          this.recordMetric({
            name: 'LCP',
            value: lastEntry.startTime,
            unit: 'ms',
            timestamp: Date.now()
          });
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        // LCP not supported
      }

      // Observe First Input Delay
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            const fidValue = entry.processingStart - entry.startTime;
            this.vitals.FID = fidValue;
            const fidMetric = {
              name: 'FID',
              value: fidValue,
              unit: 'ms',
              timestamp: Date.now()
            };
            this.recordMetric(fidMetric);
            this.notifyVitalsListeners(fidMetric);
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        // FID not supported
      }

      // Observe Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          this.vitals.CLS = clsValue;
          this.recordMetric({
            name: 'CLS',
            value: clsValue,
            unit: 'score',
            timestamp: Date.now()
          });
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        // CLS not supported
      }
    }
  }

  /**
   * Track initial page load metrics
   */
  private trackInitialMetrics() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      
      window.addEventListener('load', () => {
        // Page Load Time
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        this.recordMetric({
          name: 'PageLoadTime',
          value: pageLoadTime,
          unit: 'ms',
          timestamp: Date.now()
        });

        // Time to Interactive
        const tti = timing.domInteractive - timing.navigationStart;
        this.recordMetric({
          name: 'TTI',
          value: tti,
          unit: 'ms',
          timestamp: Date.now()
        });

        // First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
        if (fcp) {
          this.recordMetric({
            name: 'FCP',
            value: fcp.startTime,
            unit: 'ms',
            timestamp: Date.now()
          });
        }

        // Resource sizes
        this.trackResourceSizes();

        // Memory usage (if available)
        this.trackMemoryUsage();
      });
    }
  }

  /**
   * Track resource sizes
   */
  private trackResourceSizes() {
    if (!window.performance || !window.performance.getEntriesByType) return;

    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;
    let totalSize = 0;

    resources.forEach((resource) => {
      const size = resource.transferSize || 0;
      totalSize += size;

      if (resource.name.includes('.js')) {
        jsSize += size;
      } else if (resource.name.includes('.css')) {
        cssSize += size;
      } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)) {
        imageSize += size;
      }
    });

    this.recordMetric({
      name: 'TotalResourceSize',
      value: totalSize / 1024,
      unit: 'KB',
      timestamp: Date.now(),
      metadata: {
        jsSize: jsSize / 1024,
        cssSize: cssSize / 1024,
        imageSize: imageSize / 1024
      }
    });
  }

  /**
   * Track memory usage
   */
  private trackMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      this.recordMetric({
        name: 'MemoryUsage',
        value: memory.usedJSHeapSize / 1048576,
        unit: 'MB',
        timestamp: Date.now(),
        metadata: {
          totalJSHeapSize: memory.totalJSHeapSize / 1048576,
          jsHeapSizeLimit: memory.jsHeapSizeLimit / 1048576
        }
      });
    }
  }

  /**
   * Start a performance mark
   */
  mark(name: string) {
    if (!this.isEnabled) return;
    
    this.marks.set(name, performance.now());
    performance.mark(`${name}-start`);
  }

  /**
   * Measure performance between marks
   */
  measure(name: string, startMark?: string) {
    if (!this.isEnabled) return;

    const endTime = performance.now();
    const startTime = startMark 
      ? this.marks.get(startMark) 
      : this.marks.get(name);

    if (startTime) {
      const duration = endTime - startTime;
      
      performance.measure(name, `${startMark || name}-start`);
      
      this.recordMetric({
        name,
        value: duration,
        unit: 'ms',
        timestamp: Date.now()
      });

      return duration;
    }

    return null;
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Log significant metrics
    if (metric.value > 1000 && metric.unit === 'ms') {
      logger.warn(`Slow performance detected: ${metric.name}`, {
        value: metric.value,
        unit: metric.unit,
        metadata: metric.metadata
      });
    }
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName: string, renderTime: number) {
    this.recordMetric({
      name: `Component:${componentName}`,
      value: renderTime,
      unit: 'ms',
      timestamp: Date.now()
    });
  }

  /**
   * Track API call performance
   */
  trackApiCall(endpoint: string, duration: number, status: number) {
    this.recordMetric({
      name: `API:${endpoint}`,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: { status }
    });
  }

  /**
   * Generate performance report (alias for getReport)
   */
  generateReport(): PerformanceReport {
    return this.getReport();
  }

  /**
   * Get performance report
   */
  getReport(): PerformanceReport {
    const metrics = [...this.metrics];
    
    // Calculate summary
    const summary: PerformanceReport['summary'] = {};
    
    const pageLoadMetric = metrics.find(m => m.name === 'PageLoadTime');
    if (pageLoadMetric) summary.pageLoadTime = pageLoadMetric.value;
    
    const ttiMetric = metrics.find(m => m.name === 'TTI');
    if (ttiMetric) summary.timeToInteractive = ttiMetric.value;
    
    const fcpMetric = metrics.find(m => m.name === 'FCP');
    if (fcpMetric) summary.firstContentfulPaint = fcpMetric.value;
    
    const lcpMetric = metrics.find(m => m.name === 'LCP');
    if (lcpMetric) summary.largestContentfulPaint = lcpMetric.value;
    
    const clsMetric = metrics.find(m => m.name === 'CLS');
    if (clsMetric) summary.cumulativeLayoutShift = clsMetric.value;
    
    const fidMetric = metrics.find(m => m.name === 'FID');
    if (fidMetric) summary.firstInputDelay = fidMetric.value;

    // Get resource sizes
    const resourceMetric = metrics.find(m => m.name === 'TotalResourceSize');
    const resources = resourceMetric?.metadata || {
      jsSize: 0,
      cssSize: 0,
      imageSize: 0
    };

    return {
      metrics,
      summary,
      resources: {
        jsSize: resources.jsSize || 0,
        cssSize: resources.cssSize || 0,
        imageSize: resources.imageSize || 0,
        totalSize: resourceMetric?.value || 0
      },
      vitals: this.vitals
    };
  }

  /**
   * Send metrics to analytics service
   */
  sendMetrics() {
    const report = this.getReport();
    
    // Log locally
    logger.info('Performance Report', report);
    
    // Analytics service integration point
    // Uncomment when analytics endpoint is ready:
    // fetch('/api/analytics/performance', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(report)
    // }).catch(err => logger.error('Failed to send analytics:', { err }));
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
    this.marks.clear();
  }

  /**
   * Cleanup observers
   */
  // Stub methods for compatibility
  startTimer(name: string): number {
    this.mark(name);
    return performance.now();
  }

  endTimer(name: string, startTime: number): number {
    const duration = performance.now() - startTime;
    this.measure(name, name);
    return duration;
  }

  onVitalsChange(callback: (metric: any) => void): () => void {
    // Add callback to listeners
    this.vitalsListeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.vitalsListeners.delete(callback);
    };
  }
  
  private notifyVitalsListeners(metric: any) {
    this.vitalsListeners.forEach(listener => {
      try {
        listener(metric);
      } catch (error) {
        logger.error('Error in vitals listener:', { error });
      }
    });
  }

  getMetrics(): Record<string, any> {
    return {};
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Default export for backward compatibility
export default performanceMonitor;

// Export types and hooks for compatibility
export type Metric = PerformanceMetric;
export const usePerformanceMonitor = () => performanceMonitor;

/**
 * React Hook for performance tracking
 */
export function usePerformanceTracking(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // More than one frame (60fps)
        performanceMonitor.trackComponentRender(componentName, renderTime);
      }
    };
  }, [componentName]);
}

// Auto-send metrics periodically in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Send metrics every 5 minutes
  setInterval(() => {
    performanceMonitor.sendMetrics();
  }, 5 * 60 * 1000);
  
  // Send metrics before page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.sendMetrics();
  });
}