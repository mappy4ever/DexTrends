/**
 * Battery Optimization System for Mobile Devices
 * Manages app behavior based on battery status to preserve device power
 */

import logger from './logger';
import adaptiveLoading from './adaptiveLoading';

class BatteryOptimization {
  constructor() {
    this.isClient = typeof window !== 'undefined';
    this.battery = null;
    this.optimizationLevel = 'none'; // none, light, moderate, aggressive
    this.listeners = new Set();
    this.checkInterval = null;
    
    this.optimizations = {
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
    
    if (this.isClient) {
      this.initialize();
    }
  }

  async initialize() {
    try {
      if ('getBattery' in navigator) {
        this.battery = await navigator.getBattery();
        this.setupBatteryListeners();
        this.checkBatteryStatus();
        
        // Check battery status periodically
        this.checkInterval = setInterval(() => {
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

  setupBatteryListeners() {
    if (!this.battery) return;

    // Listen for battery level changes
    this.battery.addEventListener('levelchange', () => {
      this.checkBatteryStatus();
    });

    // Listen for charging state changes
    this.battery.addEventListener('chargingchange', () => {
      this.handleChargingChange();
    });

    // Listen for charging time changes
    this.battery.addEventListener('chargingtimechange', () => {
      this.handleChargingTimeChange();
    });

    // Listen for discharging time changes
    this.battery.addEventListener('dischargingtimechange', () => {
      this.handleDischargingTimeChange();
    });
  }

  checkBatteryStatus() {
    if (!this.battery) return;

    const level = this.battery.level;
    const charging = this.battery.charging;
    const oldLevel = this.optimizationLevel;

    // Determine optimization level based on battery status
    let newLevel = 'none';

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

  handleChargingChange() {
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

  handleChargingTimeChange() {
    if (!this.battery) return;

    const chargingTime = this.battery.chargingTime;
    
    if (chargingTime !== Infinity) {
      logger.debug('Charging time updated:', chargingTime);
      
      this.notifyListeners({
        type: 'charging-time-change',
        chargingTime,
        level: this.battery.level
      });
    }
  }

  handleDischargingTimeChange() {
    if (!this.battery) return;

    const dischargingTime = this.battery.dischargingTime;
    
    if (dischargingTime !== Infinity) {
      logger.debug('Discharging time updated:', dischargingTime);
      
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

  setOptimizationLevel(level) {
    if (!['none', 'light', 'moderate', 'aggressive'].includes(level)) {
      logger.warn('Invalid optimization level:', level);
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

  applyOptimizations() {
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

  toggleFeatures(config) {
    // Dispatch events for feature toggling
    window.dispatchEvent(new CustomEvent('batteryOptimizationChange', {
      detail: {
        level: this.optimizationLevel,
        config,
        toggles: {
          animations: config.animationDuration > 0,
          backgroundSync: config.backgroundSync,
          autoRefresh: config.autoRefresh,
          hapticFeedback: config.hapticFeedback,
          backgroundVideo: config.backgroundVideo
        }
      }
    }));
  }

  updateRefreshIntervals(config) {
    // Clear existing intervals and set new ones based on optimization
    window.dispatchEvent(new CustomEvent('batteryRefreshIntervalChange', {
      detail: {
        interval: config.refreshInterval,
        level: this.optimizationLevel
      }
    }));
  }

  getCurrentOptimization() {
    return this.optimizations[this.optimizationLevel] || {};
  }

  getBatteryInfo() {
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

  getOptimizationLevel() {
    return this.optimizationLevel;
  }

  isOptimizing() {
    return this.optimizationLevel !== 'none';
  }

  // Manual override methods
  enableOptimization(level = 'light') {
    this.setOptimizationLevel(level);
  }

  disableOptimization() {
    this.setOptimizationLevel('none');
  }

  // Listener management
  addListener(callback) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        logger.error('Battery listener callback failed:', error);
      }
    });
  }

  // Performance optimization methods
  optimizeImageLoading() {
    const config = this.getCurrentOptimization();
    
    return {
      quality: config.imageQuality || 1.0,
      lazy: this.optimizationLevel !== 'none',
      placeholder: this.optimizationLevel === 'aggressive' ? 'blur' : 'none',
      format: this.optimizationLevel === 'aggressive' ? 'webp' : 'auto'
    };
  }

  optimizeAnimations() {
    const config = this.getCurrentOptimization();
    
    return {
      enabled: config.animationDuration > 0,
      duration: config.animationDuration,
      complexity: this.optimizationLevel === 'aggressive' ? 'simple' : 'normal'
    };
  }

  optimizeNetworking() {
    const config = this.getCurrentOptimization();
    
    return {
      backgroundSync: config.backgroundSync,
      refreshInterval: config.refreshInterval,
      compression: this.optimizationLevel !== 'none',
      caching: this.optimizationLevel === 'aggressive' ? 'aggressive' : 'normal'
    };
  }

  // Utility methods
  shouldReduceActivity() {
    return ['moderate', 'aggressive'].includes(this.optimizationLevel);
  }

  shouldDisableNonEssentialFeatures() {
    return this.optimizationLevel === 'aggressive';
  }

  getRecommendedSettings() {
    const battery = this.getBatteryInfo();
    const config = this.getCurrentOptimization();
    
    return {
      battery,
      optimizationLevel: this.optimizationLevel,
      recommendations: {
        reduceAnimations: config.animationDuration < 1,
        reduceImageQuality: config.imageQuality < 0.9,
        disableAutoRefresh: !config.autoRefresh,
        enableDataSaver: this.optimizationLevel !== 'none',
        reduceBrightness: this.optimizationLevel === 'aggressive',
        closeBackgroundTabs: this.optimizationLevel === 'aggressive'
      }
    };
  }

  // Status reporting
  getStatus() {
    return {
      battery: this.getBatteryInfo(),
      optimizationLevel: this.optimizationLevel,
      isOptimizing: this.isOptimizing(),
      currentConfig: this.getCurrentOptimization(),
      recommendations: this.getRecommendedSettings()
    };
  }

  // Cleanup
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    this.listeners.clear();
    
    if (this.battery) {
      this.battery.removeEventListener('levelchange', this.checkBatteryStatus);
      this.battery.removeEventListener('chargingchange', this.handleChargingChange);
      this.battery.removeEventListener('chargingtimechange', this.handleChargingTimeChange);
      this.battery.removeEventListener('dischargingtimechange', this.handleDischargingTimeChange);
    }
  }
}

// Create singleton instance
const batteryOptimization = new BatteryOptimization();

export default batteryOptimization;