/**
 * Adaptive Loading System for Mobile Performance Optimization
 * Adjusts loading strategies based on device capabilities and network conditions
 */

import logger from './logger';

class AdaptiveLoading {
  constructor() {
    this.isClient = typeof window !== 'undefined';
    this.deviceCapabilities = null;
    this.networkInfo = null;
    this.performanceMetrics = {
      loadTimes: [],
      errorRates: [],
      memoryUsage: [],
      lastUpdated: null
    };
    
    if (this.isClient) {
      this.initialize();
    }
  }

  initialize() {
    this.detectDeviceCapabilities();
    this.setupNetworkMonitoring();
    this.setupPerformanceMonitoring();
    this.setupMemoryMonitoring();
    
    logger.debug('Adaptive loading initialized', {
      deviceCapabilities: this.deviceCapabilities,
      networkInfo: this.networkInfo
    });
  }

  // Device capability detection
  detectDeviceCapabilities() {
    this.deviceCapabilities = {
      // CPU/Performance
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      deviceMemory: navigator.deviceMemory || 4, // GB
      
      // Display
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      pixelRatio: window.devicePixelRatio || 1,
      colorDepth: window.screen.colorDepth || 24,
      
      // Platform
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isAndroid: /Android/.test(navigator.userAgent),
      isLowEnd: this.detectLowEndDevice(),
      
      // Capabilities
      supportsWebP: this.supportsWebP(),
      supportsAVIF: this.supportsAVIF(),
      supportsIntersectionObserver: 'IntersectionObserver' in window,
      supportsServiceWorker: 'serviceWorker' in navigator,
      
      // Performance hints
      saveData: navigator.connection?.saveData || false,
      reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false
    };
  }

  detectLowEndDevice() {
    // Heuristics for low-end device detection
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Memory-based detection
    if (memory <= 2) return true;
    
    // CPU-based detection
    if (cores <= 2) return true;
    
    // User agent-based detection for specific low-end devices
    const lowEndKeywords = [
      'android 4', 'android 5', 'android 6',
      'iphone os 10', 'iphone os 11',
      'windows phone', 'blackberry',
      'nokia', 'samsung-gt', 'lg-', 'huawei-'
    ];
    
    return lowEndKeywords.some(keyword => userAgent.includes(keyword));
  }

  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('webp') !== -1;
  }

  supportsAVIF() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    try {
      return canvas.toDataURL('image/avif').indexOf('avif') !== -1;
    } catch {
      return false;
    }
  }

  // Network monitoring
  setupNetworkMonitoring() {
    if (navigator.connection) {
      this.updateNetworkInfo();
      
      navigator.connection.addEventListener('change', () => {
        this.updateNetworkInfo();
        this.adjustStrategyForNetwork();
      });
    }
  }

  updateNetworkInfo() {
    if (!navigator.connection) {
      this.networkInfo = { effectiveType: '4g', downlink: 10, rtt: 100, saveData: false };
      return;
    }

    this.networkInfo = {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData || false,
      type: navigator.connection.type
    };
  }

  adjustStrategyForNetwork() {
    const strategy = this.getLoadingStrategy();
    
    // Notify components about strategy change
    window.dispatchEvent(new CustomEvent('adaptiveLoadingStrategyChange', {
      detail: { strategy, networkInfo: this.networkInfo }
    }));
    
    logger.debug('Loading strategy adjusted for network', strategy);
  }

  // Performance monitoring
  setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      // Monitor navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordLoadTime(entry.duration);
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });

      // Monitor resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.analyzeResourcePerformance(entry);
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Monitor largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordLCP(entry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  setupMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        this.recordMemoryUsage();
      }, 30000); // Every 30 seconds
    }
  }

  recordLoadTime(duration) {
    this.performanceMetrics.loadTimes.push(duration);
    
    // Keep only last 50 measurements
    if (this.performanceMetrics.loadTimes.length > 50) {
      this.performanceMetrics.loadTimes = this.performanceMetrics.loadTimes.slice(-50);
    }
    
    this.performanceMetrics.lastUpdated = Date.now();
  }

  recordLCP(time) {
    this.performanceMetrics.lcp = time;
  }

  recordMemoryUsage() {
    if (performance.memory) {
      const usage = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };
      
      this.performanceMetrics.memoryUsage.push(usage);
      
      // Keep only last 20 measurements
      if (this.performanceMetrics.memoryUsage.length > 20) {
        this.performanceMetrics.memoryUsage = this.performanceMetrics.memoryUsage.slice(-20);
      }
    }
  }

  analyzeResourcePerformance(entry) {
    // Analyze slow resources
    if (entry.duration > 2000) { // > 2 seconds
      logger.warn('Slow resource detected:', {
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize
      });
    }
  }

  // Loading strategy determination
  getLoadingStrategy() {
    const capabilities = this.deviceCapabilities;
    const network = this.networkInfo;
    const performance = this.getPerformanceScore();

    // Determine strategy based on multiple factors
    if (this.isLowPerformanceScenario(capabilities, network, performance)) {
      return 'minimal';
    } else if (this.isMediumPerformanceScenario(capabilities, network, performance)) {
      return 'balanced';
    } else {
      return 'full';
    }
  }

  isLowPerformanceScenario(capabilities, network, performance) {
    return (
      capabilities.isLowEnd ||
      capabilities.saveData ||
      network.saveData ||
      network.effectiveType === 'slow-2g' ||
      network.effectiveType === '2g' ||
      performance < 30 ||
      this.isLowMemory()
    );
  }

  isMediumPerformanceScenario(capabilities, network, performance) {
    return (
      capabilities.deviceMemory <= 4 ||
      network.effectiveType === '3g' ||
      performance < 70 ||
      this.isMemoryConstrained()
    );
  }

  getPerformanceScore() {
    // Calculate performance score based on various metrics
    let score = 100;
    
    // Network score
    if (this.networkInfo) {
      switch (this.networkInfo.effectiveType) {
        case 'slow-2g': score -= 60; break;
        case '2g': score -= 40; break;
        case '3g': score -= 20; break;
        case '4g': score -= 0; break;
      }
    }
    
    // Device score
    if (this.deviceCapabilities.isLowEnd) score -= 30;
    if (this.deviceCapabilities.deviceMemory <= 2) score -= 20;
    if (this.deviceCapabilities.hardwareConcurrency <= 2) score -= 15;
    
    // Performance metrics score
    const avgLoadTime = this.getAverageLoadTime();
    if (avgLoadTime > 3000) score -= 20;
    else if (avgLoadTime > 1500) score -= 10;
    
    return Math.max(0, score);
  }

  getAverageLoadTime() {
    if (this.performanceMetrics.loadTimes.length === 0) return 0;
    
    const sum = this.performanceMetrics.loadTimes.reduce((a, b) => a + b, 0);
    return sum / this.performanceMetrics.loadTimes.length;
  }

  isLowMemory() {
    if (!performance.memory) return false;
    
    const usage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
    return usage > 0.8; // 80% memory usage
  }

  isMemoryConstrained() {
    if (!performance.memory) return false;
    
    const usage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
    return usage > 0.6; // 60% memory usage
  }

  // Image loading strategies
  getImageLoadingStrategy() {
    const strategy = this.getLoadingStrategy();
    
    switch (strategy) {
      case 'minimal':
        return {
          format: 'webp',
          quality: 60,
          maxWidth: 400,
          lazy: true,
          placeholder: 'blur',
          priority: 'low'
        };
      
      case 'balanced':
        return {
          format: this.deviceCapabilities.supportsWebP ? 'webp' : 'jpeg',
          quality: 75,
          maxWidth: 800,
          lazy: true,
          placeholder: 'blur',
          priority: 'normal'
        };
      
      case 'full':
        return {
          format: this.deviceCapabilities.supportsAVIF ? 'avif' : 
                  this.deviceCapabilities.supportsWebP ? 'webp' : 'jpeg',
          quality: 85,
          maxWidth: 1200,
          lazy: false,
          placeholder: 'none',
          priority: 'high'
        };
      
      default:
        return this.getImageLoadingStrategy('balanced');
    }
  }

  // JavaScript loading strategies
  getJavaScriptLoadingStrategy() {
    const strategy = this.getLoadingStrategy();
    
    switch (strategy) {
      case 'minimal':
        return {
          moduleLoading: 'defer',
          bundleSplitting: 'aggressive',
          treeshaking: true,
          polyfills: 'minimal',
          preload: 'critical-only'
        };
      
      case 'balanced':
        return {
          moduleLoading: 'async',
          bundleSplitting: 'moderate',
          treeshaking: true,
          polyfills: 'essential',
          preload: 'important'
        };
      
      case 'full':
        return {
          moduleLoading: 'immediate',
          bundleSplitting: 'conservative',
          treeshaking: false,
          polyfills: 'comprehensive',
          preload: 'all'
        };
      
      default:
        return this.getJavaScriptLoadingStrategy('balanced');
    }
  }

  // API loading strategies
  getAPILoadingStrategy() {
    const strategy = this.getLoadingStrategy();
    
    switch (strategy) {
      case 'minimal':
        return {
          batchSize: 10,
          caching: 'aggressive',
          compression: true,
          timeout: 15000,
          retries: 3,
          priority: 'essential-only'
        };
      
      case 'balanced':
        return {
          batchSize: 25,
          caching: 'moderate',
          compression: true,
          timeout: 10000,
          retries: 2,
          priority: 'important'
        };
      
      case 'full':
        return {
          batchSize: 50,
          caching: 'minimal',
          compression: false,
          timeout: 5000,
          retries: 1,
          priority: 'all'
        };
      
      default:
        return this.getAPILoadingStrategy('balanced');
    }
  }

  // Resource prefetching strategies
  getPrefetchStrategy() {
    const strategy = this.getLoadingStrategy();
    
    switch (strategy) {
      case 'minimal':
        return {
          enabled: false,
          resources: [],
          priority: 'none'
        };
      
      case 'balanced':
        return {
          enabled: true,
          resources: ['critical-images', 'next-page'],
          priority: 'low'
        };
      
      case 'full':
        return {
          enabled: true,
          resources: ['images', 'fonts', 'scripts', 'next-page', 'related-content'],
          priority: 'normal'
        };
      
      default:
        return this.getPrefetchStrategy('balanced');
    }
  }

  // Animation strategies
  getAnimationStrategy() {
    const strategy = this.getLoadingStrategy();
    const reducedMotion = this.deviceCapabilities.reducedMotion;
    
    if (reducedMotion) {
      return {
        enabled: false,
        duration: 0,
        complexity: 'none'
      };
    }
    
    switch (strategy) {
      case 'minimal':
        return {
          enabled: false,
          duration: 150,
          complexity: 'simple'
        };
      
      case 'balanced':
        return {
          enabled: true,
          duration: 250,
          complexity: 'moderate'
        };
      
      case 'full':
        return {
          enabled: true,
          duration: 350,
          complexity: 'rich'
        };
      
      default:
        return this.getAnimationStrategy('balanced');
    }
  }

  // Battery optimization
  optimizeForBattery() {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        if (battery.level < 0.2 && !battery.charging) {
          // Switch to minimal strategy when battery is low
          this.forcedStrategy = 'minimal';
          this.adjustStrategyForNetwork();
          
          logger.debug('Switched to battery saving mode');
        }
      });
    }
  }

  // Manual strategy override
  setStrategy(strategy) {
    if (['minimal', 'balanced', 'full'].includes(strategy)) {
      this.forcedStrategy = strategy;
      this.adjustStrategyForNetwork();
    }
  }

  resetStrategy() {
    this.forcedStrategy = null;
    this.adjustStrategyForNetwork();
  }

  // Get current strategy (forced or auto-detected)
  getCurrentStrategy() {
    return this.forcedStrategy || this.getLoadingStrategy();
  }

  // Get comprehensive loading configuration
  getLoadingConfig() {
    return {
      strategy: this.getCurrentStrategy(),
      image: this.getImageLoadingStrategy(),
      javascript: this.getJavaScriptLoadingStrategy(),
      api: this.getAPILoadingStrategy(),
      prefetch: this.getPrefetchStrategy(),
      animation: this.getAnimationStrategy(),
      deviceCapabilities: this.deviceCapabilities,
      networkInfo: this.networkInfo,
      performanceScore: this.getPerformanceScore()
    };
  }
}

// Create singleton instance
const adaptiveLoading = new AdaptiveLoading();

export default adaptiveLoading;