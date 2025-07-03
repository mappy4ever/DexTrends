/**
 * Mobile Analytics and Performance Monitoring System
 * Tracks mobile-specific user journeys, performance metrics, and crash reporting
 */

import logger from './logger';
import adaptiveLoading from './adaptiveLoading';
import batteryOptimization from './batteryOptimization';

class MobileAnalytics {
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

  initialize() {
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

  generateSessionId() {
    this.sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  detectDeviceInfo() {
    const ua = navigator.userAgent;
    
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
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      
      // Hardware info
      cores: navigator.hardwareConcurrency || 'unknown',
      memory: navigator.deviceMemory || 'unknown',
      
      // Network info
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
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

  setupPerformanceMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    // Monitor navigation timing
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.trackPerformance('navigation', {
          type: entry.type,
          duration: entry.duration,
          loadEventEnd: entry.loadEventEnd,
          domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
          redirectTime: entry.redirectEnd - entry.redirectStart,
          dnsTime: entry.domainLookupEnd - entry.domainLookupStart,
          connectTime: entry.connectEnd - entry.connectStart,
          requestTime: entry.responseStart - entry.requestStart,
          responseTime: entry.responseEnd - entry.responseStart,
          domParseTime: entry.domInteractive - entry.responseEnd,
          renderTime: entry.loadEventEnd - entry.domContentLoadedEventEnd
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
        this.trackPerformance('lcp', {
          value: entry.startTime,
          element: entry.element?.tagName || 'unknown',
          url: entry.url || window.location.href,
          size: entry.size
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
        this.trackPerformance('fid', {
          value: entry.processingStart - entry.startTime,
          type: entry.name,
          duration: entry.duration
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
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
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
        // Only track significant resources
        if (entry.duration > 100 || entry.transferSize > 100000) {
          this.trackPerformance('resource', {
            name: entry.name,
            type: this.getResourceType(entry.name),
            duration: entry.duration,
            size: entry.transferSize,
            compressed: entry.encodedBodySize,
            cached: entry.transferSize === 0 && entry.decodedBodySize > 0
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
    if (performance.memory) {
      setInterval(() => {
        this.trackPerformance('memory', {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
          usage_percent: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
        });
      }, 60000); // Every minute
    }
  }

  getResourceType(url) {
    if (url.match(/\.(js|mjs)$/)) return 'script';
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  setupErrorHandling() {
    // Global error handling
    window.addEventListener('error', (event) => {
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
    window.addEventListener('unhandledrejection', (event) => {
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

  setupNetworkMonitoring() {
    if (navigator.connection) {
      const logConnection = () => {
        this.trackEvent('network_change', {
          effective_type: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt,
          save_data: navigator.connection.saveData
        });
      };

      navigator.connection.addEventListener('change', logConnection);
    }
  }

  setupUserInteractionTracking() {
    // Track touch interactions
    document.addEventListener('touchstart', (event) => {
      this.trackInteraction('touch_start', {
        touches: event.touches.length,
        target: this.getElementInfo(event.target)
      });
    });

    // Track clicks
    document.addEventListener('click', (event) => {
      this.trackInteraction('click', {
        target: this.getElementInfo(event.target),
        position: { x: event.clientX, y: event.clientY }
      });
    });

    // Track scroll behavior
    let scrollTimeout;
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
    document.addEventListener('input', (event) => {
      if (event.target.type !== 'password') {
        this.trackInteraction('form_input', {
          input_type: event.target.type,
          target: this.getElementInfo(event.target)
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

  setupLifecycleTracking() {
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

  getElementInfo(element) {
    if (!element) return null;
    
    return {
      tag: element.tagName?.toLowerCase(),
      id: element.id,
      class: element.className,
      text: element.textContent?.slice(0, 50) || null
    };
  }

  // Core tracking methods
  trackEvent(eventName, properties = {}) {
    const event = {
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
    logger.debug('Event tracked:', eventName, properties);
  }

  trackPageView(path, title) {
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

  trackInteraction(type, properties = {}) {
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

  trackPerformance(metric, data) {
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

  trackError(error) {
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

  trackTiming(name, startTime, endTime = Date.now()) {
    const duration = endTime - startTime;
    
    this.trackPerformance('timing', {
      name,
      duration,
      start_time: startTime,
      end_time: endTime
    });
  }

  // Mobile-specific tracking
  trackGestureUsage(gestureType, success = true) {
    this.trackEvent('gesture_usage', {
      gesture_type: gestureType,
      success,
      device_type: this.deviceInfo.isMobile ? 'mobile' : 'desktop'
    });
  }

  trackOfflineUsage(action, success = true) {
    this.trackEvent('offline_usage', {
      action,
      success,
      was_online: this.isOnline
    });
  }

  trackPWAFeature(feature, usage_data = {}) {
    this.trackEvent('pwa_feature_usage', {
      feature,
      ...usage_data,
      is_standalone: this.deviceInfo.standalone
    });
  }

  trackMobileConversion(type, value = null) {
    this.trackEvent('mobile_conversion', {
      conversion_type: type,
      value,
      device_category: this.deviceInfo.isMobile ? 'mobile' : 
                      this.deviceInfo.isTablet ? 'tablet' : 'desktop'
    });
  }

  // Data management
  queueData(data) {
    this.analyticsQueue.push(data);
    
    // Auto-flush if queue gets too large
    if (this.analyticsQueue.length >= 50) {
      this.flushQueuedData();
    }
  }

  async flushQueuedData() {
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

  async sendDataToServer(data) {
    // In a real implementation, this would send to your analytics endpoint
    if (typeof gtag !== 'undefined') {
      data.forEach(item => {
        if (item.type === 'event') {
          gtag('event', item.name, item.properties);
        } else if (item.type === 'performance') {
          gtag('event', 'performance_metric', {
            event_category: 'Performance',
            event_label: item.metric,
            value: item.data.value || item.data.duration
          });
        }
      });
    }

    // Mock API call
    console.log('Analytics data would be sent:', data);
  }

  storeOfflineData(data) {
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

  async loadOfflineData() {
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
  setUserId(userId) {
    this.userId = userId;
    this.trackEvent('user_identified', { user_id: userId });
  }

  // Session management
  getSessionData() {
    return {
      ...this.sessionData,
      duration: Date.now() - this.sessionData.startTime,
      session_id: this.sessionId,
      device_info: this.deviceInfo
    };
  }

  // Cleanup
  destroy() {
    this.performanceObservers.forEach(observer => {
      observer.disconnect();
    });
    
    this.flushQueuedData();
  }
}

// Create singleton instance
const mobileAnalytics = new MobileAnalytics();

export default mobileAnalytics;