/**
 * Advanced performance monitoring and analytics system
 */

import logger from './logger';

// Performance metric types
interface Metric {
  name: string;
  value: number;
  timestamp: number;
  metadata: Record<string, any>;
  url: string;
}

interface MetricThresholds {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}

interface CustomMetric {
  description: string;
  start: (id?: string) => void;
  end: (id?: string, metadata?: Record<string, any>) => number | null;
  getActive: () => string[];
}

interface ConnectionInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface WebVitalsMetadata {
  threshold: number;
  good: boolean;
  needsImprovement: boolean;
  element?: Element;
  eventType?: string;
}

interface ResourceMetadata {
  url: string;
  size?: number;
  cached: boolean;
}

interface UserInteractionMetadata {
  type: string;
  count: number;
  timestamp: number;
}

interface MemoryMetadata {
  total: number;
  limit: number;
  percentage: number;
}

interface VitalReport {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  metadata: WebVitalsMetadata;
}

interface ResourceReport {
  count: number;
  average: number;
  total: number;
}

interface CustomMetricReport {
  description: string;
  count: number;
  average: number;
  min: number;
  max: number;
}

interface MemoryReport {
  used: number;
  total: number;
  limit: number;
  percentage: number;
}

interface PerformanceReport {
  timestamp: number;
  url: string;
  userAgent: string;
  connection: ConnectionInfo | null;
  vitals: Record<string, VitalReport>;
  resources: Record<string, ResourceReport>;
  custom: Record<string, CustomMetricReport>;
  memory: MemoryReport | null;
}

type VitalsCallback = (metric: Metric) => void;

// Extend the Performance interface to include memory property
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
  
  interface Navigator {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
  }
}

class PerformanceMonitor {
  private isClient: boolean;
  private isSupported: boolean;
  private metrics: Map<string, Metric[]>;
  private observers: Map<string, PerformanceObserver>;
  private thresholds: MetricThresholds;
  private vitalsCallbacks: Set<VitalsCallback>;
  private customMetrics: Map<string, CustomMetric>;
  private isEnabled: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    this.isSupported = this.isClient && 'performance' in window;
    this.metrics = new Map();
    this.observers = new Map();
    this.thresholds = {
      fcp: 2000, // First Contentful Paint
      lcp: 2500, // Largest Contentful Paint
      fid: 100,  // First Input Delay
      cls: 0.1,  // Cumulative Layout Shift
      ttfb: 600  // Time to First Byte
    };
    
    this.vitalsCallbacks = new Set();
    this.customMetrics = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
    
    if (this.isClient && this.isSupported) {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring(): void {
    try {
      // Monitor Core Web Vitals
      this.monitorWebVitals();
      
      // Monitor custom metrics
      this.monitorCustomMetrics();
      
      // Monitor resource loading
      this.monitorResourceLoading();
      
      // Monitor user interactions
      this.monitorUserInteractions();
      
      // Monitor memory usage
      this.monitorMemoryUsage();
      
      // Set up periodic reporting
      this.setupPeriodicReporting();
      
      logger.debug('Performance monitoring initialized');
    } catch (error) {
      logger.error('Failed to initialize performance monitoring', { error });
    }
  }

  private monitorWebVitals(): void {
    // First Contentful Paint (FCP)
    this.observePerformanceEntry('paint', (entries) => {
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.recordMetric('fcp', fcpEntry.startTime, {
          threshold: this.thresholds.fcp,
          good: fcpEntry.startTime < 1800,
          needsImprovement: fcpEntry.startTime < 3000
        });
      }
    });

    // Largest Contentful Paint (LCP)
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      if (entries.length > 0) {
        const lcpEntry = entries[entries.length - 1];
        this.recordMetric('lcp', lcpEntry.startTime, {
          threshold: this.thresholds.lcp,
          good: lcpEntry.startTime < 2500,
          needsImprovement: lcpEntry.startTime < 4000,
          element: (lcpEntry as any).element
        });
      }
    });

    // First Input Delay (FID)
    this.observePerformanceEntry('first-input', (entries) => {
      entries.forEach(entry => {
        const firstInputEntry = entry as any; // PerformanceEventTiming not available in all types
        if (firstInputEntry.processingStart) {
          const fid = firstInputEntry.processingStart - entry.startTime;
          this.recordMetric('fid', fid, {
            threshold: this.thresholds.fid,
            good: fid < 100,
            needsImprovement: fid < 300,
            eventType: entry.name
          });
        }
      });
    });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    this.observePerformanceEntry('layout-shift', (entries) => {
      entries.forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
      
      this.recordMetric('cls', clsValue, {
        threshold: this.thresholds.cls,
        good: clsValue < 0.1,
        needsImprovement: clsValue < 0.25
      });
    });

    // Time to First Byte (TTFB)
    if ('navigation' in performance) {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navTiming) {
        const ttfb = navTiming.responseStart - navTiming.requestStart;
        this.recordMetric('ttfb', ttfb, {
          threshold: this.thresholds.ttfb,
          good: ttfb < 800,
          needsImprovement: ttfb < 1800
        });
      }
    }
  }

  private monitorCustomMetrics(): void {
    // React component render times
    this.startCustomTimer('react-render', 'React component render performance');
    
    // API request times
    this.startCustomTimer('api-request', 'API request performance');
    
    // Image loading times
    this.startCustomTimer('image-load', 'Image loading performance');
    
    // Search performance
    this.startCustomTimer('search', 'Search operation performance');
    
    // Navigation performance
    this.startCustomTimer('navigation', 'Page navigation performance');
  }

  private monitorResourceLoading(): void {
    this.observePerformanceEntry('resource', (entries) => {
      entries.forEach(entry => {
        const resourceEntry = entry as PerformanceResourceTiming;
        if (resourceEntry.initiatorType === 'img') {
          this.recordMetric('image-load-time', resourceEntry.duration, {
            url: resourceEntry.name,
            size: resourceEntry.transferSize,
            cached: resourceEntry.transferSize === 0
          });
        } else if (resourceEntry.initiatorType === 'script') {
          this.recordMetric('script-load-time', resourceEntry.duration, {
            url: resourceEntry.name,
            size: resourceEntry.transferSize,
            cached: resourceEntry.transferSize === 0
          });
        } else if (resourceEntry.initiatorType === 'css') {
          this.recordMetric('css-load-time', resourceEntry.duration, {
            url: resourceEntry.name,
            size: resourceEntry.transferSize,
            cached: resourceEntry.transferSize === 0
          });
        }
      });
    });
  }

  private monitorUserInteractions(): void {
    // Track user engagement
    let interactionCount = 0;
    let lastInteractionTime = Date.now();
    
    const trackInteraction = (type: string) => {
      interactionCount++;
      const now = Date.now();
      const timeSinceLastInteraction = now - lastInteractionTime;
      lastInteractionTime = now;
      
      this.recordMetric('user-interaction', timeSinceLastInteraction, {
        type,
        count: interactionCount,
        timestamp: now
      });
    };

    // Track clicks
    document.addEventListener('click', () => trackInteraction('click'), { passive: true });
    
    // Track scrolling
    let scrollTimer: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => trackInteraction('scroll'), 100);
    }, { passive: true });
    
    // Track keyboard interactions
    document.addEventListener('keydown', () => trackInteraction('keyboard'), { passive: true });
  }

  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory!;
        this.recordMetric('memory-usage', memory.usedJSHeapSize, {
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
        });
      }, 30000); // Every 30 seconds
    }
  }

  private setupPeriodicReporting(): void {
    // Report metrics every 60 seconds
    setInterval(() => {
      this.generateReport();
    }, 60000);

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.generateReport();
    });

    // Report on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.generateReport();
      }
    });
  }

  private observePerformanceEntry(type: string, callback: (entries: PerformanceEntryList) => void): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ type, buffered: true } as PerformanceObserverInit);
      this.observers.set(type, observer);
    } catch (error) {
      logger.warn(`Failed to observe ${type} performance entries`, { error });
    }
  }

  recordMetric(name: string, value: number, metadata: Record<string, any> = {}): void {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
      url: window.location.pathname
    };

    // Store metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(metric);

    // Limit stored metrics
    const metrics = this.metrics.get(name)!;
    if (metrics.length > 100) {
      metrics.shift(); // Remove oldest
    }

    // Check thresholds and warn if needed
    if (this.thresholds[name as keyof MetricThresholds] && value > this.thresholds[name as keyof MetricThresholds]) {
      logger.warn(`Performance threshold exceeded for ${name}`, {
        value,
        threshold: this.thresholds[name as keyof MetricThresholds],
        metadata
      });
    }

    // Trigger callbacks
    this.vitalsCallbacks.forEach(callback => {
      try {
        callback(metric);
      } catch (error) {
        logger.error('Error in vitals callback', { error });
      }
    });

    if (this.isEnabled) {
      logger.debug(`Performance metric: ${name}`, { value, metadata });
    }
  }

  private startCustomTimer(name: string, description = ''): void {
    const timers = new Map<string, number>();
    
    this.customMetrics.set(name, {
      description,
      start: (id = 'default') => {
        timers.set(id, Date.now());
      },
      end: (id = 'default', metadata = {}) => {
        const startTime = timers.get(id);
        if (startTime) {
          const duration = Date.now() - startTime;
          this.recordMetric(name, duration, { id, ...metadata });
          timers.delete(id);
          return duration;
        }
        return null;
      },
      getActive: () => Array.from(timers.keys())
    });
  }

  // Public API methods
  startTimer(name: string, id = 'default'): void {
    const customMetric = this.customMetrics.get(name);
    if (customMetric) {
      customMetric.start(id);
    } else {
      logger.warn(`Custom metric ${name} not found`);
    }
  }

  endTimer(name: string, id = 'default', metadata: Record<string, any> = {}): number | null {
    const customMetric = this.customMetrics.get(name);
    if (customMetric) {
      return customMetric.end(id, metadata);
    } else {
      logger.warn(`Custom metric ${name} not found`);
      return null;
    }
  }

  measureFunction<T>(fn: () => T, name?: string, metadata: Record<string, any> = {}): T {
    const start = Date.now();
    const result = fn();
    const duration = Date.now() - start;
    
    this.recordMetric(name || 'function-execution', duration, metadata);
    
    return result;
  }

  async measureAsyncFunction<T>(fn: () => Promise<T>, name?: string, metadata: Record<string, any> = {}): Promise<T> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    
    this.recordMetric(name || 'async-function-execution', duration, metadata);
    
    return result;
  }

  onVitalsChange(callback: VitalsCallback): () => void {
    this.vitalsCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.vitalsCallbacks.delete(callback);
    };
  }

  getMetrics(name?: string): Metric[] | Record<string, Metric[]> {
    if (name) {
      return this.metrics.get(name) || [];
    }
    
    const allMetrics: Record<string, Metric[]> = {};
    for (const [key, values] of this.metrics.entries()) {
      allMetrics[key] = values;
    }
    return allMetrics;
  }

  getAverageMetric(name: string, timeWindow = 60000): number | null {
    const metrics = this.metrics.get(name) || [];
    const now = Date.now();
    const recentMetrics = metrics.filter(m => now - m.timestamp < timeWindow);
    
    if (recentMetrics.length === 0) return null;
    
    const sum = recentMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / recentMetrics.length;
  }

  generateReport(): PerformanceReport | null {
    if (!this.isEnabled) return null;

    const report: PerformanceReport = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      vitals: this.getWebVitalsReport(),
      resources: this.getResourceReport(),
      custom: this.getCustomMetricsReport(),
      memory: this.getMemoryReport()
    };

    logger.debug('Performance report generated', report);
    
    // Send to analytics if configured
    this.sendAnalytics(report);
    
    return report;
  }

  private getWebVitalsReport(): Record<string, VitalReport> {
    const vitals: Record<string, VitalReport> = {};
    
    ['fcp', 'lcp', 'fid', 'cls', 'ttfb'].forEach(metric => {
      const values = this.metrics.get(metric) || [];
      if (values.length > 0) {
        const latest = values[values.length - 1];
        vitals[metric] = {
          value: latest.value,
          rating: this.getRating(metric, latest.value),
          metadata: latest.metadata as WebVitalsMetadata
        };
      }
    });
    
    return vitals;
  }

  private getResourceReport(): Record<string, ResourceReport> {
    const resources: Record<string, ResourceReport> = {};
    
    ['image-load-time', 'script-load-time', 'css-load-time'].forEach(metric => {
      const values = this.metrics.get(metric) || [];
      if (values.length > 0) {
        resources[metric] = {
          count: values.length,
          average: values.reduce((acc, m) => acc + m.value, 0) / values.length,
          total: values.reduce((acc, m) => acc + ((m.metadata as ResourceMetadata).size || 0), 0)
        };
      }
    });
    
    return resources;
  }

  private getCustomMetricsReport(): Record<string, CustomMetricReport> {
    const custom: Record<string, CustomMetricReport> = {};
    
    for (const [name, metric] of this.customMetrics.entries()) {
      const values = this.metrics.get(name) || [];
      if (values.length > 0) {
        custom[name] = {
          description: metric.description,
          count: values.length,
          average: values.reduce((acc, m) => acc + m.value, 0) / values.length,
          min: Math.min(...values.map(m => m.value)),
          max: Math.max(...values.map(m => m.value))
        };
      }
    }
    
    return custom;
  }

  private getMemoryReport(): MemoryReport | null {
    if (!('memory' in performance)) return null;
    
    const memory = performance.memory!;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    };
  }

  private getConnectionInfo(): ConnectionInfo | null {
    if (!('connection' in navigator)) return null;
    
    const connection = navigator.connection!;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }

  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; needs: number }> = {
      fcp: { good: 1800, needs: 3000 },
      lcp: { good: 2500, needs: 4000 },
      fid: { good: 100, needs: 300 },
      cls: { good: 0.1, needs: 0.25 },
      ttfb: { good: 800, needs: 1800 }
    };
    
    const threshold = thresholds[metric];
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needs) return 'needs-improvement';
    return 'poor';
  }

  private sendAnalytics(report: PerformanceReport): void {
    // This could send to Google Analytics, custom analytics, etc.
    // For now, just log in development
    if (this.isEnabled) {
      console.group('🚀 Performance Report');
      console.log('Web Vitals:', report.vitals);
      console.log('Resources:', report.resources);
      console.log('Custom Metrics:', report.custom);
      console.log('Memory:', report.memory);
      console.groupEnd();
    }
  }

  clearMetrics(): void {
    this.metrics.clear();
    logger.debug('Performance metrics cleared');
  }

  destroy(): void {
    // Clean up observers
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
    
    // Clear metrics
    this.clearMetrics();
    
    // Clear callbacks
    this.vitalsCallbacks.clear();
  }
}

// Create global instance
const performanceMonitor = new PerformanceMonitor();

// Store for tracking component render counts
const componentRenderCounts = new Map<string, number>();
const componentRenderTimings = new Map<string, number[]>();

// Hook return type
interface UsePerformanceMonitorReturn {
  vitals: Record<string, Metric>;
  isSupported: boolean;
  startTimer: (name: string, id?: string) => void;
  endTimer: (name: string, id?: string, metadata?: Record<string, any>) => number | null;
  measureFunction: <T>(fn: () => T, name?: string, metadata?: Record<string, any>) => T;
  measureAsyncFunction: <T>(fn: () => Promise<T>, name?: string, metadata?: Record<string, any>) => Promise<T>;
  generateReport: () => PerformanceReport | null;
  getMetrics: (name?: string) => Metric[] | Record<string, Metric[]>;
  renderCount: number;
  logPerformance: () => void;
}

// React hook for performance monitoring
export const usePerformanceMonitor = (componentName?: string): UsePerformanceMonitorReturn => {
  if (typeof window === 'undefined') {
    return {
      vitals: {},
      isSupported: false,
      startTimer: () => {},
      endTimer: () => null,
      measureFunction: (fn) => fn(),
      measureAsyncFunction: async (fn) => await fn(),
      generateReport: () => null,
      getMetrics: () => ({}),
      renderCount: 0,
      logPerformance: () => {}
    };
  }
  
  // Dynamic import to avoid SSR issues
  const React = require('react') as typeof import('react');
  const { useState, useEffect, useRef } = React;
  const [vitals, setVitals] = useState<Record<string, Metric>>({});
  const [isSupported] = useState((performanceMonitor as any).isSupported);
  const renderCount = useRef(0);
  const renderStartTime = useRef<number | null>(null);

  // Track component renders
  useEffect(() => {
    if (componentName) {
      renderCount.current++;
      const totalRenders = (componentRenderCounts.get(componentName) || 0) + 1;
      componentRenderCounts.set(componentName, totalRenders);

      // Track render timing
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        const timings = componentRenderTimings.get(componentName) || [];
        timings.push(renderTime);
        componentRenderTimings.set(componentName, timings);

        // Warn about slow renders
        if (renderTime > 16) { // 16ms = 60fps threshold
          logger.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
        }

        // Record as custom metric
        performanceMonitor.recordMetric(`react-render-${componentName}`, renderTime, {
          renderCount: renderCount.current,
          totalRenders
        });
      }

      renderStartTime.current = performance.now();
    }
  });

  useEffect(() => {
    if (!performanceMonitor['isSupported']) return;

    const unsubscribe = performanceMonitor.onVitalsChange((metric) => {
      setVitals(prev => ({
        ...prev,
        [metric.name]: metric
      }));
    });

    return unsubscribe;
  }, []);

  const logPerformance = () => {
    if (componentName) {
      const timings = componentRenderTimings.get(componentName) || [];
      const avgRenderTime = timings.length > 0 
        ? timings.reduce((a, b) => a + b, 0) / timings.length 
        : 0;

      logger.info(`Performance metrics for ${componentName}:`, {
        renderCount: renderCount.current,
        totalRenders: componentRenderCounts.get(componentName) || 0,
        averageRenderTime: avgRenderTime,
        lastRenderTime: timings[timings.length - 1] || 0
      });
    }
  };

  return {
    vitals,
    isSupported,
    startTimer: performanceMonitor.startTimer.bind(performanceMonitor),
    endTimer: performanceMonitor.endTimer.bind(performanceMonitor),
    measureFunction: performanceMonitor.measureFunction.bind(performanceMonitor),
    measureAsyncFunction: performanceMonitor.measureAsyncFunction.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor) as (name?: string) => Metric[] | Record<string, Metric[]>,
    renderCount: renderCount.current,
    logPerformance
  };
};

export default performanceMonitor;