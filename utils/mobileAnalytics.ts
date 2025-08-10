/**
 * Mobile Analytics and Performance Monitoring System
 * Tracks mobile-specific user journeys, performance metrics, and crash reporting
 */

import logger from './logger';
import adaptiveLoading from './adaptiveLoading';
import batteryOptimization from './batteryOptimization';
import type { AnyObject, PerformanceMetric, AnalyticsEvent as BaseAnalyticsEvent } from '../types/common';
import type { 
  LayoutShiftPerformanceEntry, 
  LargestContentfulPaintEntry,
  GtagParameters,
  PWAUsageData,
  InteractionProperties,
  EventProperties
} from '../types/performance';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isWindows: boolean;
  isMacOS: boolean;
  isChrome: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  pixelRatio: number;
  orientation: 'landscape' | 'portrait';
  cores: number | 'unknown';
  memory: number | 'unknown';
  connection: ConnectionInfo | null;
  touchScreen: boolean;
  standalone: boolean;
  webGL: boolean;
  serviceWorker: boolean;
  pushNotifications: boolean;
  geolocation: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  darkMode: boolean;
}

interface ConnectionInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface SessionData {
  startTime: number;
  pageViews: number;
  interactions: number;
  errors: number;
  performance: {
    loadTimes: PerformanceMetric[];
    interactionTimes: PerformanceMetric[];
    memoryUsage: PerformanceMetric[];
    networkRequests: PerformanceMetric[];
    [key: string]: PerformanceMetric[];
  };
}

interface ElementInfo {
  tag: string | undefined;
  id: string;
  class: string;
  text: string | null;
}

interface AnalyticsEvent extends BaseAnalyticsEvent {
  type: 'event' | 'interaction' | 'performance' | 'error';
  name?: string;
  interaction_type?: string;
  metric?: string;
  error?: ErrorData;
  data?: AnyObject;
  properties?: AnyObject;
}

interface ErrorData {
  type: string;
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  userAgent: string;
  url: string;
  timestamp: number;
}

interface NetworkEventDetail {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface ExtendedNavigator extends Navigator {
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
    addEventListener?: (type: string, listener: EventListener) => void;
  };
  deviceMemory?: number;
}

interface ExtendedScreen extends Screen {
  // Screen already has orientation property
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

declare const gtag: (
  command: string,
  eventName: string,
  parameters?: GtagParameters
) => void;

class MobileAnalytics {
  private isClient: boolean;
  private sessionId: string | null;
  private userId: string | null;
  private deviceInfo: DeviceInfo | null;
  private performanceObservers: PerformanceObserver[];
  private errorQueue: ErrorData[];
  private analyticsQueue: AnalyticsEvent[];
  private isOnline: boolean;
  private sessionData: SessionData;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    this.sessionId = null;
    this.userId = null;
    this.deviceInfo = null;
    this.performanceObservers = [];
    this.errorQueue = [];
    this.analyticsQueue = [];
    this.isOnline = navigator?.onLine ?? true;
    this.sessionData = {
      startTime: Date.now(),
      pageViews: 0,
      interactions: 0,
      errors: 0,
      performance: {
        loadTimes: [],
        interactionTimes: [],
        memoryUsage: [],
        networkRequests: []
      }
    };
    
    if (this.isClient) {
      this.initialize();
    }
  }

  private initialize(): void {
    this.generateSessionId();
    this.detectDeviceInfo();
    this.setupPerformanceMonitoring();
    this.setupErrorHandling();
    this.setupNetworkMonitoring();
    this.setupUserInteractionTracking();
    this.setupLifecycleTracking();
    
    // Start session
    this.trackEvent('session_start', {
      device_info: this.deviceInfo,
      user_agent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      color_depth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    logger.debug('Mobile analytics initialized', {
      sessionId: this.sessionId,
      deviceInfo: this.deviceInfo
    });
  }

  private generateSessionId(): void {
    this.sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectDeviceInfo(): void {
    const ua = navigator.userAgent;
    const nav = navigator as ExtendedNavigator;
    const scr = screen as ExtendedScreen;
    
    this.deviceInfo = {
      // Device type
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
      isTablet: /iPad|Android.*Tablet|Windows.*Tablet/i.test(ua),
      isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
      
      // Operating system
      isIOS: /iPad|iPhone|iPod/.test(ua),
      isAndroid: /Android/.test(ua),
      isWindows: /Windows/.test(ua),
      isMacOS: /Macintosh|MacIntel/.test(ua),
      
      // Browser
      isChrome: /Chrome/.test(ua) && !/Edge/.test(ua),
      isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
      isFirefox: /Firefox/.test(ua),
      isEdge: /Edge/.test(ua),
      
      // Screen info
      screenWidth: scr.width,
      screenHeight: scr.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      
      // Hardware info
      cores: navigator.hardwareConcurrency || 'unknown',
      memory: nav.deviceMemory || 'unknown',
      
      // Network info
      connection: nav.connection ? {
        effectiveType: nav.connection.effectiveType,
        downlink: nav.connection.downlink,
        rtt: nav.connection.rtt,
        saveData: nav.connection.saveData
      } : null,
      
      // Features
      touchScreen: 'ontouchstart' in window,
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      webGL: !!window.WebGLRenderingContext,
      serviceWorker: 'serviceWorker' in navigator,
      pushNotifications: 'PushManager' in window,
      geolocation: 'geolocation' in navigator,
      
      // Accessibility
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    };
  }

  private setupPerformanceMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    // Monitor navigation timing
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const navEntry = entry as PerformanceNavigationTiming;
        this.trackPerformance('navigation', {
          type: navEntry.type,
          duration: navEntry.duration,
          loadEventEnd: navEntry.loadEventEnd,
          domContentLoadedEventEnd: navEntry.domContentLoadedEventEnd,
          redirectTime: navEntry.redirectEnd - navEntry.redirectStart,
          dnsTime: navEntry.domainLookupEnd - navEntry.domainLookupStart,
          connectTime: navEntry.connectEnd - navEntry.connectStart,
          requestTime: navEntry.responseStart - navEntry.requestStart,
          responseTime: navEntry.responseEnd - navEntry.responseStart,
          domParseTime: navEntry.domInteractive - navEntry.responseEnd,
          renderTime: navEntry.loadEventEnd - navEntry.domContentLoadedEventEnd
        });
      }
    });
    
    try {
      navObserver.observe({ entryTypes: ['navigation'] });
      this.performanceObservers.push(navObserver);
    } catch (error) {
      logger.debug('Navigation observer not supported:', error);
    }

    // Monitor largest contentful paint
    const lcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const lcpEntry = entry as LargestContentfulPaintEntry;
        this.trackPerformance('lcp', {
          value: lcpEntry.startTime,
          element: lcpEntry.element?.tagName || 'unknown',
          url: lcpEntry.url || window.location.href,
          size: lcpEntry.size
        });
      }
    });
    
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.performanceObservers.push(lcpObserver);
    } catch (error) {
      logger.debug('LCP observer not supported:', error);
    }

    // Monitor first input delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as PerformanceEventTiming;
        this.trackPerformance('fid', {
          value: fidEntry.processingStart - fidEntry.startTime,
          type: fidEntry.name,
          duration: fidEntry.duration
        });
      }
    });
    
    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.performanceObservers.push(fidObserver);
    } catch (error) {
      logger.debug('FID observer not supported:', error);
    }

    // Monitor cumulative layout shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        const layoutEntry = entry as LayoutShiftPerformanceEntry;
        if (!layoutEntry.hadRecentInput) {
          clsValue += layoutEntry.value;
        }
      }
      
      if (clsValue > 0) {
        this.trackPerformance('cls', {
          value: clsValue,
          entries: list.getEntries().length
        });
      }
    });
    
    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.performanceObservers.push(clsObserver);
    } catch (error) {
      logger.debug('CLS observer not supported:', error);
    }

    // Monitor resource timing
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming;
        // Only track significant resources
        if (resourceEntry.duration > 100 || resourceEntry.transferSize > 100000) {
          this.trackPerformance('resource', {
            name: resourceEntry.name,
            type: this.getResourceType(resourceEntry.name),
            duration: resourceEntry.duration,
            size: resourceEntry.transferSize,
            compressed: resourceEntry.encodedBodySize,
            cached: resourceEntry.transferSize === 0 && resourceEntry.decodedBodySize > 0
          });
        }
      }
    });
    
    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.performanceObservers.push(resourceObserver);
    } catch (error) {
      logger.debug('Resource observer not supported:', error);
    }

    // Monitor memory usage
    const perf = performance as ExtendedPerformance;
    if (perf.memory) {
      setInterval(() => {
        if (perf.memory) {
          this.trackPerformance('memory', {
            used: perf.memory.usedJSHeapSize,
            total: perf.memory.totalJSHeapSize,
            limit: perf.memory.jsHeapSizeLimit,
            usage_percent: (perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit) * 100
          });
        }
      }, 60000); // Every minute
    }
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(js|mjs)$/)) return 'script';
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  private setupErrorHandling(): void {
    // Global error handling
    window.addEventListener('error', (event: ErrorEvent) => {
      this.trackError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      });
    });

    // Promise rejection handling
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      this.trackError({
        type: 'promise_rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      });
    });

    // Network error handling
    window.addEventListener('offline', () => {
      this.trackEvent('network_offline', {
        was_online: this.isOnline,
        timestamp: Date.now()
      });
      this.isOnline = false;
    });

    window.addEventListener('online', () => {
      this.trackEvent('network_online', {
        was_offline: !this.isOnline,
        timestamp: Date.now()
      });
      this.isOnline = true;
      this.flushQueuedData();
    });
  }

  private setupNetworkMonitoring(): void {
    const nav = navigator as ExtendedNavigator;
    if (nav.connection && nav.connection.addEventListener) {
      const logConnection = () => {
        this.trackEvent('network_change', {
          effective_type: nav.connection?.effectiveType,
          downlink: nav.connection?.downlink,
          rtt: nav.connection?.rtt,
          save_data: nav.connection?.saveData
        });
      };

      nav.connection.addEventListener('change', logConnection);
    }
  }

  private setupUserInteractionTracking(): void {
    // Track touch interactions
    document.addEventListener('touchstart', (event: TouchEvent) => {
      this.trackInteraction('touch_start', {
        touches: event.touches.length,
        target: this.getElementInfo(event.target as HTMLElement)
      });
    });

    // Track clicks
    document.addEventListener('click', (event: MouseEvent) => {
      this.trackInteraction('click', {
        target: this.getElementInfo(event.target as HTMLElement),
        position: { x: event.clientX, y: event.clientY }
      });
    });

    // Track scroll behavior
    let scrollTimeout: ReturnType<typeof setTimeout>;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackInteraction('scroll', {
          scroll_y: window.scrollY,
          scroll_x: window.scrollX,
          viewport_height: window.innerHeight,
          document_height: document.documentElement.scrollHeight,
          scroll_percent: (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        });
      }, 100);
    });

    // Track form interactions
    document.addEventListener('input', (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.type !== 'password') {
        this.trackInteraction('form_input', {
          input_type: target.type,
          target: this.getElementInfo(target)
        });
      }
    });

    // Track orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.trackEvent('orientation_change', {
          orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
          viewport: `${window.innerWidth}x${window.innerHeight}`
        });
      }, 100);
    });
  }

  private setupLifecycleTracking(): void {
    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('visibility_change', {
        visible: !document.hidden,
        visibility_state: document.visibilityState
      });
      
      if (document.hidden) {
        this.flushQueuedData();
      }
    });

    // Before page unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end', {
        duration: Date.now() - this.sessionData.startTime,
        page_views: this.sessionData.pageViews,
        interactions: this.sessionData.interactions,
        errors: this.sessionData.errors
      });
      
      this.flushQueuedData();
    });

    // Focus/blur events
    window.addEventListener('focus', () => {
      this.trackEvent('app_focus');
    });

    window.addEventListener('blur', () => {
      this.trackEvent('app_blur');
    });
  }

  private getElementInfo(element: HTMLElement | null): ElementInfo | null {
    if (!element) return null;
    
    return {
      tag: element.tagName?.toLowerCase(),
      id: element.id,
      class: element.className,
      text: element.textContent?.slice(0, 50) || null
    };
  }

  // Core tracking methods
  trackEvent(eventName: string, properties: EventProperties = {}): void {
    const event: AnalyticsEvent = {
      type: 'event',
      name: eventName,
      properties: {
        ...properties,
        session_id: this.sessionId,
        user_id: this.userId,
        timestamp: Date.now(),
        url: window.location.href,
        referrer: document.referrer,
        device_info: this.deviceInfo
      }
    };

    this.queueData(event);
    logger.debug('Event tracked:', { eventName, properties });
  }

  trackPageView(path?: string, title?: string): void {
    this.sessionData.pageViews++;
    
    this.trackEvent('page_view', {
      path: path || window.location.pathname,
      title: title || document.title,
      search: window.location.search,
      hash: window.location.hash,
      loading_strategy: adaptiveLoading.getCurrentStrategy(),
      battery_optimization: batteryOptimization.getOptimizationLevel()
    });
  }

  trackInteraction(type: string, properties: InteractionProperties = {}): void {
    this.sessionData.interactions++;
    
    this.queueData({
      type: 'interaction',
      interaction_type: type,
      properties: {
        ...properties,
        session_id: this.sessionId,
        timestamp: Date.now()
      }
    });
  }

  trackPerformance(metric: string, data: PerformanceMetric): void {
    this.sessionData.performance[metric] = this.sessionData.performance[metric] || [];
    this.sessionData.performance[metric].push(data);

    this.queueData({
      type: 'performance',
      metric,
      data: {
        ...data,
        session_id: this.sessionId,
        timestamp: Date.now(),
        device_info: this.deviceInfo
      }
    });
  }

  trackError(error: ErrorData): void {
    this.sessionData.errors++;
    this.errorQueue.push(error);

    this.queueData({
      type: 'error',
      error: {
        ...error,
        session_id: this.sessionId,
        device_info: this.deviceInfo,
        session_data: {
          duration: Date.now() - this.sessionData.startTime,
          page_views: this.sessionData.pageViews,
          interactions: this.sessionData.interactions
        }
      }
    });

    logger.error('Error tracked:', error);
  }

  trackTiming(name: string, startTime: number, endTime: number = Date.now()): void {
    const duration = endTime - startTime;
    
    this.trackPerformance('timing', {
      name,
      duration,
      start_time: startTime,
      end_time: endTime
    });
  }

  // Mobile-specific tracking
  trackGestureUsage(gestureType: string, success: boolean = true): void {
    this.trackEvent('gesture_usage', {
      gesture_type: gestureType,
      success,
      device_type: this.deviceInfo?.isMobile ? 'mobile' : 'desktop'
    });
  }

  trackOfflineUsage(action: string, success: boolean = true): void {
    this.trackEvent('offline_usage', {
      action,
      success,
      was_online: this.isOnline
    });
  }

  trackPWAFeature(feature: string, usage_data: PWAUsageData = {}): void {
    this.trackEvent('pwa_feature_usage', {
      feature,
      ...usage_data,
      is_standalone: this.deviceInfo?.standalone
    });
  }

  trackMobileConversion(type: string, value: unknown = null): void {
    this.trackEvent('mobile_conversion', {
      conversion_type: type,
      value,
      device_category: this.deviceInfo?.isMobile ? 'mobile' : 
                      this.deviceInfo?.isTablet ? 'tablet' : 'desktop'
    });
  }

  // Data management
  private queueData(data: AnalyticsEvent): void {
    this.analyticsQueue.push(data);
    
    // Auto-flush if queue gets too large
    if (this.analyticsQueue.length >= 50) {
      this.flushQueuedData();
    }
  }

  private async flushQueuedData(): Promise<void> {
    if (this.analyticsQueue.length === 0) return;

    const dataToFlush = [...this.analyticsQueue];
    this.analyticsQueue = [];

    try {
      if (this.isOnline) {
        await this.sendDataToServer(dataToFlush);
      } else {
        // Store offline for later
        this.storeOfflineData(dataToFlush);
      }
    } catch (error) {
      logger.error('Failed to flush analytics data:', error);
      // Re-queue the data
      this.analyticsQueue.unshift(...dataToFlush);
    }
  }

  private async sendDataToServer(data: AnalyticsEvent[]): Promise<void> {
    // In a real implementation, this would send to your analytics endpoint
    if (typeof gtag !== 'undefined') {
      data.forEach(item => {
        if (item.type === 'event' && item.name) {
          gtag('event', item.name, item.properties);
        } else if (item.type === 'performance' && item.metric) {
          gtag('event', 'performance_metric', {
            event_category: 'Performance',
            event_label: item.metric,
            value: item.data?.value || item.data?.duration
          });
        }
      });
    }

    // Mock API call
    logger.debug('Analytics data would be sent:', { data });
  }

  private storeOfflineData(data: AnalyticsEvent[]): void {
    try {
      const existingData = JSON.parse(localStorage.getItem('offline_analytics') || '[]');
      const newData = [...existingData, ...data];
      
      // Keep only last 1000 items to prevent storage overflow
      const trimmedData = newData.slice(-1000);
      
      localStorage.setItem('offline_analytics', JSON.stringify(trimmedData));
    } catch (error) {
      logger.error('Failed to store offline analytics:', error);
    }
  }

  async loadOfflineData(): Promise<void> {
    try {
      const offlineData = JSON.parse(localStorage.getItem('offline_analytics') || '[]');
      
      if (offlineData.length > 0 && this.isOnline) {
        await this.sendDataToServer(offlineData);
        localStorage.removeItem('offline_analytics');
      }
    } catch (error) {
      logger.error('Failed to load offline analytics:', error);
    }
  }

  // User identification
  setUserId(userId: string): void {
    this.userId = userId;
    this.trackEvent('user_identified', { user_id: userId });
  }

  // Session management
  getSessionData(): SessionData & { duration: number; session_id: string | null; device_info: DeviceInfo | null } {
    return {
      ...this.sessionData,
      duration: Date.now() - this.sessionData.startTime,
      session_id: this.sessionId,
      device_info: this.deviceInfo
    };
  }

  // Cleanup
  destroy(): void {
    this.performanceObservers.forEach(observer => {
      observer.disconnect();
    });
    
    this.flushQueuedData();
  }
}

// Create singleton instance
const mobileAnalytics = new MobileAnalytics();

export default mobileAnalytics;