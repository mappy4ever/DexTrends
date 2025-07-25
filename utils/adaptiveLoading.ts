/**
 * Adaptive Loading System for Mobile Performance Optimization
 * Adjusts loading strategies based on device capabilities and network conditions
 */

import logger from './logger';

// Type definitions
interface DeviceCapabilities {
  hardwareConcurrency: number;
  deviceMemory: number;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  colorDepth: number;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isLowEnd: boolean;
  supportsWebP: boolean;
  supportsAVIF: boolean;
  supportsIntersectionObserver: boolean;
  supportsServiceWorker: boolean;
  saveData: boolean;
  reducedMotion: boolean;
}

interface NetworkInfo {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
  saveData: boolean;
  type?: string;
}

interface MemoryUsage {
  used: number;
  total: number;
  limit: number;
  timestamp: number;
}

interface PerformanceMetrics {
  loadTimes: number[];
  errorRates: number[];
  memoryUsage: MemoryUsage[];
  lastUpdated: number | null;
  lcp?: number;
}

type LoadingStrategy = 'minimal' | 'balanced' | 'full';

interface ImageLoadingConfig {
  format: string;
  quality: number;
  maxWidth: number;
  lazy: boolean;
  placeholder: 'blur' | 'none';
  priority: 'low' | 'normal' | 'high';
}

interface JavaScriptLoadingConfig {
  moduleLoading: 'defer' | 'async' | 'immediate';
  bundleSplitting: 'aggressive' | 'moderate' | 'conservative';
  treeshaking: boolean;
  polyfills: 'minimal' | 'essential' | 'comprehensive';
  preload: 'critical-only' | 'important' | 'all';
}

interface APILoadingConfig {
  batchSize: number;
  caching: 'aggressive' | 'moderate' | 'minimal';
  compression: boolean;
  timeout: number;
  retries: number;
  priority: 'essential-only' | 'important' | 'all';
}

interface PrefetchConfig {
  enabled: boolean;
  resources: string[];
  priority: 'none' | 'low' | 'normal';
}

interface AnimationConfig {
  enabled: boolean;
  duration: number;
  complexity: 'none' | 'simple' | 'moderate' | 'rich';
}

interface LoadingConfig {
  strategy: LoadingStrategy;
  image: ImageLoadingConfig;
  javascript: JavaScriptLoadingConfig;
  api: APILoadingConfig;
  prefetch: PrefetchConfig;
  animation: AnimationConfig;
  deviceCapabilities: DeviceCapabilities | null;
  networkInfo: NetworkInfo | null;
  performanceScore: number;
}

// Extend Navigator interface for experimental APIs
interface NavigatorExtended extends Navigator {
  connection?: NetworkInformation;
  deviceMemory?: number;
  getBattery?: () => Promise<BatteryManager>;
}

interface NetworkInformation extends EventTarget {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
  saveData: boolean;
  type?: string;
}

interface BatteryManager {
  level: number;
  charging: boolean;
}

// Extend Performance interface for memory
interface PerformanceExtended extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

class AdaptiveLoading {
  private isClient: boolean;
  private deviceCapabilities: DeviceCapabilities | null = null;
  private networkInfo: NetworkInfo | null = null;
  private performanceMetrics: PerformanceMetrics;
  private forcedStrategy: LoadingStrategy | null = null;

  constructor() {
    this.isClient = typeof window !== 'undefined';
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

  private initialize(): void {
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
  private detectDeviceCapabilities(): void {
    const nav = navigator as NavigatorExtended;
    
    this.deviceCapabilities = {
      // CPU/Performance
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      deviceMemory: nav.deviceMemory || 4, // GB
      
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
      saveData: nav.connection?.saveData || false,
      reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false
    };
  }

  private detectLowEndDevice(): boolean {
    // Heuristics for low-end device detection
    const nav = navigator as NavigatorExtended;
    const memory = nav.deviceMemory || 4;
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

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('webp') !== -1;
  }

  private supportsAVIF(): boolean {
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
  private setupNetworkMonitoring(): void {
    const nav = navigator as NavigatorExtended;
    if (nav.connection) {
      this.updateNetworkInfo();
      
      nav.connection.addEventListener('change', () => {
        this.updateNetworkInfo();
        this.adjustStrategyForNetwork();
      });
    }
  }

  private updateNetworkInfo(): void {
    const nav = navigator as NavigatorExtended;
    if (!nav.connection) {
      this.networkInfo = { effectiveType: '4g', downlink: 10, rtt: 100, saveData: false };
      return;
    }

    this.networkInfo = {
      effectiveType: nav.connection.effectiveType,
      downlink: nav.connection.downlink,
      rtt: nav.connection.rtt,
      saveData: nav.connection.saveData || false,
      type: nav.connection.type
    };
  }

  private adjustStrategyForNetwork(): void {
    const strategy = this.getLoadingStrategy();
    
    // Notify components about strategy change
    window.dispatchEvent(new CustomEvent('adaptiveLoadingStrategyChange', {
      detail: { strategy, networkInfo: this.networkInfo }
    }));
    
    logger.debug('Loading strategy adjusted for network', { strategy });
  }

  // Performance monitoring
  private setupPerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      // Monitor navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordLoadTime((entry as PerformanceNavigationTiming).duration);
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });

      // Monitor resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.analyzeResourcePerformance(entry as PerformanceResourceTiming);
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

  private setupMemoryMonitoring(): void {
    const perf = performance as PerformanceExtended;
    if ('memory' in perf) {
      setInterval(() => {
        this.recordMemoryUsage();
      }, 30000); // Every 30 seconds
    }
  }

  private recordLoadTime(duration: number): void {
    this.performanceMetrics.loadTimes.push(duration);
    
    // Keep only last 50 measurements
    if (this.performanceMetrics.loadTimes.length > 50) {
      this.performanceMetrics.loadTimes = this.performanceMetrics.loadTimes.slice(-50);
    }
    
    this.performanceMetrics.lastUpdated = Date.now();
  }

  private recordLCP(time: number): void {
    this.performanceMetrics.lcp = time;
  }

  private recordMemoryUsage(): void {
    const perf = performance as PerformanceExtended;
    if (perf.memory) {
      const usage: MemoryUsage = {
        used: perf.memory.usedJSHeapSize,
        total: perf.memory.totalJSHeapSize,
        limit: perf.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };
      
      this.performanceMetrics.memoryUsage.push(usage);
      
      // Keep only last 20 measurements
      if (this.performanceMetrics.memoryUsage.length > 20) {
        this.performanceMetrics.memoryUsage = this.performanceMetrics.memoryUsage.slice(-20);
      }
    }
  }

  private analyzeResourcePerformance(entry: PerformanceResourceTiming): void {
    // Analyze slow resources
    if (entry.duration > 2000) { // > 2 seconds
      logger.warn('Slow resource detected:', {
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize || 0
      });
    }
  }

  // Loading strategy determination
  getLoadingStrategy(): LoadingStrategy {
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

  private isLowPerformanceScenario(
    capabilities: DeviceCapabilities | null, 
    network: NetworkInfo | null, 
    performance: number
  ): boolean {
    return (
      capabilities?.isLowEnd ||
      capabilities?.saveData ||
      network?.saveData ||
      network?.effectiveType === 'slow-2g' ||
      network?.effectiveType === '2g' ||
      performance < 30 ||
      this.isLowMemory()
    ) ?? false;
  }

  private isMediumPerformanceScenario(
    capabilities: DeviceCapabilities | null, 
    network: NetworkInfo | null, 
    performance: number
  ): boolean {
    return (
      (capabilities?.deviceMemory ?? 4) <= 4 ||
      network?.effectiveType === '3g' ||
      performance < 70 ||
      this.isMemoryConstrained()
    ) ?? false;
  }

  private getPerformanceScore(): number {
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
    if (this.deviceCapabilities?.isLowEnd) score -= 30;
    if ((this.deviceCapabilities?.deviceMemory ?? 4) <= 2) score -= 20;
    if ((this.deviceCapabilities?.hardwareConcurrency ?? 4) <= 2) score -= 15;
    
    // Performance metrics score
    const avgLoadTime = this.getAverageLoadTime();
    if (avgLoadTime > 3000) score -= 20;
    else if (avgLoadTime > 1500) score -= 10;
    
    return Math.max(0, score);
  }

  private getAverageLoadTime(): number {
    if (this.performanceMetrics.loadTimes.length === 0) return 0;
    
    const sum = this.performanceMetrics.loadTimes.reduce((a, b) => a + b, 0);
    return sum / this.performanceMetrics.loadTimes.length;
  }

  private isLowMemory(): boolean {
    const perf = performance as PerformanceExtended;
    if (!perf.memory) return false;
    
    const usage = perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit;
    return usage > 0.8; // 80% memory usage
  }

  private isMemoryConstrained(): boolean {
    const perf = performance as PerformanceExtended;
    if (!perf.memory) return false;
    
    const usage = perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit;
    return usage > 0.6; // 60% memory usage
  }

  // Image loading strategies
  getImageLoadingStrategy(): ImageLoadingConfig {
    const strategy = this.getCurrentStrategy();
    
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
          format: this.deviceCapabilities?.supportsWebP ? 'webp' : 'jpeg',
          quality: 75,
          maxWidth: 800,
          lazy: true,
          placeholder: 'blur',
          priority: 'normal'
        };
      
      case 'full':
        return {
          format: this.deviceCapabilities?.supportsAVIF ? 'avif' : 
                  this.deviceCapabilities?.supportsWebP ? 'webp' : 'jpeg',
          quality: 85,
          maxWidth: 1200,
          lazy: false,
          placeholder: 'none',
          priority: 'high'
        };
      
      default:
        return this.getImageLoadingStrategy();
    }
  }

  // JavaScript loading strategies
  getJavaScriptLoadingStrategy(): JavaScriptLoadingConfig {
    const strategy = this.getCurrentStrategy();
    
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
        return this.getJavaScriptLoadingStrategy();
    }
  }

  // API loading strategies
  getAPILoadingStrategy(): APILoadingConfig {
    const strategy = this.getCurrentStrategy();
    
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
        return this.getAPILoadingStrategy();
    }
  }

  // Resource prefetching strategies
  getPrefetchStrategy(): PrefetchConfig {
    const strategy = this.getCurrentStrategy();
    
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
        return this.getPrefetchStrategy();
    }
  }

  // Animation strategies
  getAnimationStrategy(): AnimationConfig {
    const strategy = this.getCurrentStrategy();
    const reducedMotion = this.deviceCapabilities?.reducedMotion ?? false;
    
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
        return this.getAnimationStrategy();
    }
  }

  // Battery optimization
  optimizeForBattery(): void {
    const nav = navigator as NavigatorExtended;
    if ('getBattery' in nav && nav.getBattery) {
      nav.getBattery().then(battery => {
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
  setStrategy(strategy: LoadingStrategy): void {
    const validStrategies: LoadingStrategy[] = ['minimal', 'balanced', 'full'];
    if (validStrategies.includes(strategy)) {
      this.forcedStrategy = strategy;
      this.adjustStrategyForNetwork();
    }
  }

  resetStrategy(): void {
    this.forcedStrategy = null;
    this.adjustStrategyForNetwork();
  }

  // Get current strategy (forced or auto-detected)
  getCurrentStrategy(): LoadingStrategy {
    return this.forcedStrategy || this.getLoadingStrategy();
  }

  // Get comprehensive loading configuration
  getLoadingConfig(): LoadingConfig {
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