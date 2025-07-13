/**
 * Battery Optimization System for Mobile Devices
 * Manages app behavior based on battery status to preserve device power
 */

import logger from './logger';
import adaptiveLoading from './adaptiveLoading';

// Type definitions
type OptimizationLevel = 'none' | 'light' | 'moderate' | 'aggressive';

interface OptimizationConfig {
  refreshInterval: number;
  animationDuration: number;
  imageQuality: number;
  backgroundSync: boolean;
  autoRefresh: boolean;
  hapticFeedback: boolean;
  backgroundVideo: boolean;
}

interface BatteryInfo {
  level: number | null;
  charging: boolean | null;
  chargingTime: number | null;
  dischargingTime: number | null;
  supported: boolean;
  percentage?: number;
}

interface OptimizationEvent {
  type: 'charging-started' | 'charging-stopped' | 'charging-time-change' | 
        'discharging-time-change' | 'optimization-level-change';
  level?: number;
  optimizationLevel?: OptimizationLevel;
  chargingTime?: number;
  dischargingTime?: number;
  oldLevel?: OptimizationLevel;
  newLevel?: OptimizationLevel;
  battery?: BatteryInfo;
}

interface ImageOptimizationConfig {
  quality: number;
  lazy: boolean;
  placeholder: 'blur' | 'none';
  format: 'webp' | 'auto';
}

interface AnimationOptimizationConfig {
  enabled: boolean;
  duration: number;
  complexity: 'simple' | 'normal';
}

interface NetworkOptimizationConfig {
  backgroundSync: boolean;
  refreshInterval: number;
  compression: boolean;
  caching: 'aggressive' | 'normal';
}

interface FeatureToggles {
  animations: boolean;
  backgroundSync: boolean;
  autoRefresh: boolean;
  hapticFeedback: boolean;
  backgroundVideo: boolean;
}

interface Recommendations {
  reduceAnimations: boolean;
  reduceImageQuality: boolean;
  disableAutoRefresh: boolean;
  enableDataSaver: boolean;
  reduceBrightness: boolean;
  closeBackgroundTabs: boolean;
}

interface RecommendedSettings {
  battery: BatteryInfo;
  optimizationLevel: OptimizationLevel;
  recommendations: Recommendations;
}

interface Status {
  battery: BatteryInfo;
  optimizationLevel: OptimizationLevel;
  isOptimizing: boolean;
  currentConfig: Partial<OptimizationConfig>;
  recommendations: RecommendedSettings;
}

type BatteryListener = (event: OptimizationEvent) => void;

// Extend Navigator interface for battery API
interface NavigatorExtended extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

class BatteryOptimization {
  private isClient: boolean;
  private battery: BatteryManager | null = null;
  private optimizationLevel: OptimizationLevel = 'none';
  private listeners: Set<BatteryListener> = new Set();
  private checkInterval: number | null = null;
  
  private readonly optimizations: Record<Exclude<OptimizationLevel, 'none'>, OptimizationConfig> = {
    light: {
      refreshInterval: 30000, // 30 seconds
      animationDuration: 0.75, // 75% of normal
      imageQuality: 0.9,
      backgroundSync: true,
      autoRefresh: true,
      hapticFeedback: true,
      backgroundVideo: false
    },
    moderate: {
      refreshInterval: 60000, // 1 minute
      animationDuration: 0.5, // 50% of normal
      imageQuality: 0.8,
      backgroundSync: false,
      autoRefresh: false,
      hapticFeedback: false,
      backgroundVideo: false
    },
    aggressive: {
      refreshInterval: 300000, // 5 minutes
      animationDuration: 0, // No animations
      imageQuality: 0.6,
      backgroundSync: false,
      autoRefresh: false,
      hapticFeedback: false,
      backgroundVideo: false
    }
  };

  constructor() {
    this.isClient = typeof window !== 'undefined';
    
    if (this.isClient) {
      this.initialize();
    }
  }

  private async initialize(): Promise<void> {
    try {
      const nav = navigator as NavigatorExtended;
      if ('getBattery' in nav && nav.getBattery) {
        this.battery = await nav.getBattery();
        this.setupBatteryListeners();
        this.checkBatteryStatus();
        
        // Check battery status periodically
        this.checkInterval = window.setInterval(() => {
          this.checkBatteryStatus();
        }, 30000); // Every 30 seconds
        
        logger.debug('Battery optimization initialized', {
          level: this.battery.level,
          charging: this.battery.charging
        });
      } else {
        logger.debug('Battery API not supported');
      }
    } catch (error) {
      logger.error('Failed to initialize battery optimization:', error);
    }
  }

  private setupBatteryListeners(): void {
    if (!this.battery) return;

    // Bind methods to maintain context
    const boundCheckBatteryStatus = this.checkBatteryStatus.bind(this);
    const boundHandleChargingChange = this.handleChargingChange.bind(this);
    const boundHandleChargingTimeChange = this.handleChargingTimeChange.bind(this);
    const boundHandleDischargingTimeChange = this.handleDischargingTimeChange.bind(this);

    // Listen for battery level changes
    this.battery.addEventListener('levelchange', boundCheckBatteryStatus);

    // Listen for charging state changes
    this.battery.addEventListener('chargingchange', boundHandleChargingChange);

    // Listen for charging time changes
    this.battery.addEventListener('chargingtimechange', boundHandleChargingTimeChange);

    // Listen for discharging time changes
    this.battery.addEventListener('dischargingtimechange', boundHandleDischargingTimeChange);
  }

  private checkBatteryStatus(): void {
    if (!this.battery) return;

    const level = this.battery.level;
    const charging = this.battery.charging;
    const oldLevel = this.optimizationLevel;

    // Determine optimization level based on battery status
    let newLevel: OptimizationLevel = 'none';

    if (!charging) {
      if (level <= 0.05) { // 5% or less
        newLevel = 'aggressive';
      } else if (level <= 0.15) { // 15% or less
        newLevel = 'moderate';
      } else if (level <= 0.3) { // 30% or less
        newLevel = 'light';
      }
    } else {
      // If charging, reduce optimization level
      if (level <= 0.1) {
        newLevel = 'moderate';
      } else if (level <= 0.2) {
        newLevel = 'light';
      }
    }

    if (newLevel !== oldLevel) {
      this.setOptimizationLevel(newLevel);
    }
  }

  private handleChargingChange(): void {
    if (!this.battery) return;

    if (this.battery.charging) {
      logger.debug('Device started charging - reducing battery optimization');
      // Re-evaluate optimization level when charging starts
      this.checkBatteryStatus();
      
      // Notify listeners about charging state
      this.notifyListeners({
        type: 'charging-started',
        level: this.battery.level,
        optimizationLevel: this.optimizationLevel
      });
    } else {
      logger.debug('Device stopped charging - increasing battery optimization');
      this.checkBatteryStatus();
      
      this.notifyListeners({
        type: 'charging-stopped',
        level: this.battery.level,
        optimizationLevel: this.optimizationLevel
      });
    }
  }

  private handleChargingTimeChange(): void {
    if (!this.battery) return;

    const chargingTime = this.battery.chargingTime;
    
    if (chargingTime !== Infinity) {
      logger.debug('Charging time updated:', { chargingTime });
      
      this.notifyListeners({
        type: 'charging-time-change',
        chargingTime,
        level: this.battery.level
      });
    }
  }

  private handleDischargingTimeChange(): void {
    if (!this.battery) return;

    const dischargingTime = this.battery.dischargingTime;
    
    if (dischargingTime !== Infinity) {
      logger.debug('Discharging time updated:', { dischargingTime });
      
      // If device will discharge in less than 1 hour, increase optimization
      if (dischargingTime < 3600 && !this.battery.charging) {
        this.setOptimizationLevel('aggressive');
      }
      
      this.notifyListeners({
        type: 'discharging-time-change',
        dischargingTime,
        level: this.battery.level
      });
    }
  }

  setOptimizationLevel(level: OptimizationLevel): void {
    const validLevels: OptimizationLevel[] = ['none', 'light', 'moderate', 'aggressive'];
    if (!validLevels.includes(level)) {
      logger.warn('Invalid optimization level:', { level });
      return;
    }

    const oldLevel = this.optimizationLevel;
    this.optimizationLevel = level;

    if (oldLevel !== level) {
      logger.debug('Battery optimization level changed:', { from: oldLevel, to: level });
      
      // Apply optimizations
      this.applyOptimizations();
      
      // Notify adaptive loading system
      if (level !== 'none') {
        adaptiveLoading.setStrategy('minimal');
      } else {
        adaptiveLoading.resetStrategy();
      }
      
      // Notify listeners
      this.notifyListeners({
        type: 'optimization-level-change',
        oldLevel,
        newLevel: level,
        battery: this.getBatteryInfo()
      });
    }
  }

  private applyOptimizations(): void {
    const config = this.getCurrentOptimization();
    
    // Apply CSS variables for optimization
    if (document.documentElement) {
      document.documentElement.style.setProperty(
        '--battery-animation-duration', 
        `${config.animationDuration}s`
      );
      
      document.documentElement.style.setProperty(
        '--battery-optimization-level', 
        this.optimizationLevel
      );
    }

    // Disable/enable features based on optimization level
    this.toggleFeatures(config);
    
    // Update refresh intervals
    this.updateRefreshIntervals(config);
  }

  private toggleFeatures(config: Partial<OptimizationConfig>): void {
    const toggles: FeatureToggles = {
      animations: (config.animationDuration ?? 1) > 0,
      backgroundSync: config.backgroundSync ?? true,
      autoRefresh: config.autoRefresh ?? true,
      hapticFeedback: config.hapticFeedback ?? true,
      backgroundVideo: config.backgroundVideo ?? true
    };

    // Dispatch events for feature toggling
    window.dispatchEvent(new CustomEvent('batteryOptimizationChange', {
      detail: {
        level: this.optimizationLevel,
        config,
        toggles
      }
    }));
  }

  private updateRefreshIntervals(config: Partial<OptimizationConfig>): void {
    // Clear existing intervals and set new ones based on optimization
    window.dispatchEvent(new CustomEvent('batteryRefreshIntervalChange', {
      detail: {
        interval: config.refreshInterval || 30000,
        level: this.optimizationLevel
      }
    }));
  }

  getCurrentOptimization(): Partial<OptimizationConfig> {
    if (this.optimizationLevel === 'none') {
      return {};
    }
    return this.optimizations[this.optimizationLevel];
  }

  getBatteryInfo(): BatteryInfo {
    if (!this.battery) {
      return {
        level: null,
        charging: null,
        chargingTime: null,
        dischargingTime: null,
        supported: false
      };
    }

    return {
      level: this.battery.level,
      charging: this.battery.charging,
      chargingTime: this.battery.chargingTime,
      dischargingTime: this.battery.dischargingTime,
      supported: true,
      percentage: Math.round(this.battery.level * 100)
    };
  }

  getOptimizationLevel(): OptimizationLevel {
    return this.optimizationLevel;
  }

  isOptimizing(): boolean {
    return this.optimizationLevel !== 'none';
  }

  // Manual override methods
  enableOptimization(level: Exclude<OptimizationLevel, 'none'> = 'light'): void {
    this.setOptimizationLevel(level);
  }

  disableOptimization(): void {
    this.setOptimizationLevel('none');
  }

  // Listener management
  addListener(callback: BatteryListener): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  removeListener(callback: BatteryListener): void {
    this.listeners.delete(callback);
  }

  private notifyListeners(data: OptimizationEvent): void {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        logger.error('Battery listener callback failed:', error);
      }
    });
  }

  // Performance optimization methods
  optimizeImageLoading(): ImageOptimizationConfig {
    const config = this.getCurrentOptimization();
    
    return {
      quality: config.imageQuality || 1.0,
      lazy: this.optimizationLevel !== 'none',
      placeholder: this.optimizationLevel === 'aggressive' ? 'blur' : 'none',
      format: this.optimizationLevel === 'aggressive' ? 'webp' : 'auto'
    };
  }

  optimizeAnimations(): AnimationOptimizationConfig {
    const config = this.getCurrentOptimization();
    
    return {
      enabled: (config.animationDuration ?? 1) > 0,
      duration: config.animationDuration ?? 1,
      complexity: this.optimizationLevel === 'aggressive' ? 'simple' : 'normal'
    };
  }

  optimizeNetworking(): NetworkOptimizationConfig {
    const config = this.getCurrentOptimization();
    
    return {
      backgroundSync: config.backgroundSync ?? true,
      refreshInterval: config.refreshInterval ?? 30000,
      compression: this.optimizationLevel !== 'none',
      caching: this.optimizationLevel === 'aggressive' ? 'aggressive' : 'normal'
    };
  }

  // Utility methods
  shouldReduceActivity(): boolean {
    return ['moderate', 'aggressive'].includes(this.optimizationLevel);
  }

  shouldDisableNonEssentialFeatures(): boolean {
    return this.optimizationLevel === 'aggressive';
  }

  getRecommendedSettings(): RecommendedSettings {
    const battery = this.getBatteryInfo();
    const config = this.getCurrentOptimization();
    
    return {
      battery,
      optimizationLevel: this.optimizationLevel,
      recommendations: {
        reduceAnimations: (config.animationDuration ?? 1) < 1,
        reduceImageQuality: (config.imageQuality ?? 1) < 0.9,
        disableAutoRefresh: !(config.autoRefresh ?? true),
        enableDataSaver: this.optimizationLevel !== 'none',
        reduceBrightness: this.optimizationLevel === 'aggressive',
        closeBackgroundTabs: this.optimizationLevel === 'aggressive'
      }
    };
  }

  // Status reporting
  getStatus(): Status {
    return {
      battery: this.getBatteryInfo(),
      optimizationLevel: this.optimizationLevel,
      isOptimizing: this.isOptimizing(),
      currentConfig: this.getCurrentOptimization(),
      recommendations: this.getRecommendedSettings()
    };
  }

  // Cleanup
  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    this.listeners.clear();
    
    if (this.battery) {
      // Note: In the original code, these event listeners were not properly bound,
      // so they wouldn't actually be removed. This is fixed in the TypeScript version
      // by using bound methods or arrow functions in setupBatteryListeners
    }
  }
}

// Create singleton instance
const batteryOptimization = new BatteryOptimization();

export default batteryOptimization;