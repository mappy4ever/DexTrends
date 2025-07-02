/**
 * Enhanced Haptic Feedback System for Mobile Interactions
 * Provides consistent haptic feedback across different devices and browsers
 */

import logger from './logger';

class HapticFeedback {
  constructor() {
    this.isSupported = false;
    this.patterns = {
      // Basic patterns
      light: [10],
      medium: [50],
      heavy: [100],
      
      // Complex patterns
      success: [50, 50, 100],
      error: [100, 100, 100, 100, 100],
      warning: [50, 30, 50],
      notification: [25, 25, 25],
      
      // Card-specific patterns
      cardFlip: [30, 20, 40],
      cardDraw: [20, 10, 30, 10, 50],
      cardMatch: [50, 30, 100, 30, 50],
      priceAlert: [100, 50, 100],
      
      // UI interaction patterns
      buttonTap: [15],
      swipeComplete: [25, 25],
      pullRefresh: [50, 25, 25],
      modalOpen: [30],
      modalClose: [20],
      
      // Game-like patterns
      levelUp: [100, 50, 100, 50, 200],
      achievement: [50, 25, 50, 25, 100, 25, 50],
      collect: [25, 25, 50],
      
      // Accessibility patterns
      focus: [5],
      selection: [15],
      confirmation: [50, 50]
    };
    
    this.initialize();
  }

  initialize() {
    if (typeof window === 'undefined') {
      return;
    }

    // Check for native haptic feedback support
    this.checkNativeSupport();
    
    // Check for vibration API support
    this.checkVibrationSupport();
    
    // Setup iOS haptic feedback
    this.setupIOSHaptics();
    
    logger.debug('Haptic feedback initialized', {
      isSupported: this.isSupported,
      hasVibration: !!navigator.vibrate,
      isIOS: this.isIOS(),
      isAndroid: this.isAndroid()
    });
  }

  checkNativeSupport() {
    // Check for iOS haptic feedback
    if (this.isIOS() && window.DeviceMotionEvent) {
      this.isSupported = true;
      return;
    }

    // Check for Android vibration
    if (navigator.vibrate) {
      this.isSupported = true;
      return;
    }

    // Check for gamepad vibration
    if (navigator.getGamepads) {
      this.isSupported = true;
      return;
    }
  }

  checkVibrationSupport() {
    this.hasVibration = !!(
      navigator.vibrate ||
      navigator.webkitVibrate ||
      navigator.mozVibrate ||
      navigator.msVibrate
    );
  }

  setupIOSHaptics() {
    if (!this.isIOS()) return;

    // Check for iOS haptic feedback APIs
    this.hasIOSHaptics = !!(
      window.TapticEngine ||
      (window.webkit && window.webkit.messageHandlers?.haptic)
    );
  }

  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  isAndroid() {
    return /Android/.test(navigator.userAgent);
  }

  // Main haptic feedback method
  trigger(pattern = 'light', options = {}) {
    if (!this.isSupported) {
      return false;
    }

    const {
      fallback = true,
      force = false,
      delay = 0
    } = options;

    // Respect user preferences
    if (!force && this.shouldSkipHaptics()) {
      return false;
    }

    // Apply delay if specified
    if (delay > 0) {
      setTimeout(() => this._executeHaptic(pattern, fallback), delay);
      return true;
    }

    return this._executeHaptic(pattern, fallback);
  }

  _executeHaptic(pattern, fallback = true) {
    try {
      // Get pattern array
      const vibrationPattern = this.getVibrationPattern(pattern);
      
      if (!vibrationPattern) {
        logger.warn('Unknown haptic pattern:', pattern);
        return false;
      }

      // Try iOS-specific haptics first
      if (this.isIOS() && this.tryIOSHaptics(pattern)) {
        return true;
      }

      // Try Web Vibration API
      if (this.hasVibration && this.tryVibration(vibrationPattern)) {
        return true;
      }

      // Try gamepad vibration
      if (this.tryGamepadVibration(vibrationPattern)) {
        return true;
      }

      // Fallback to visual feedback
      if (fallback) {
        this.visualFeedback(pattern);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Haptic feedback failed:', error);
      return false;
    }
  }

  tryIOSHaptics(pattern) {
    if (!this.isIOS()) return false;

    try {
      // Use TapticEngine if available
      if (window.TapticEngine) {
        const intensity = this.getIOSIntensity(pattern);
        window.TapticEngine.impact(intensity);
        return true;
      }

      // Use webkit message handler
      if (window.webkit?.messageHandlers?.haptic) {
        window.webkit.messageHandlers.haptic.postMessage({
          type: this.getIOSHapticType(pattern)
        });
        return true;
      }

      // Use Audio API workaround for iOS
      if (this.tryAudioHapticWorkaround(pattern)) {
        return true;
      }
    } catch (error) {
      logger.debug('iOS haptics failed:', error);
    }

    return false;
  }

  tryVibration(pattern) {
    if (!this.hasVibration) return false;

    try {
      const vibrate = navigator.vibrate ||
                     navigator.webkitVibrate ||
                     navigator.mozVibrate ||
                     navigator.msVibrate;

      if (vibrate.call(navigator, pattern)) {
        logger.debug('Vibration triggered:', pattern);
        return true;
      }
    } catch (error) {
      logger.debug('Vibration failed:', error);
    }

    return false;
  }

  tryGamepadVibration(pattern) {
    if (!navigator.getGamepads) return false;

    try {
      const gamepads = navigator.getGamepads();
      
      for (const gamepad of gamepads) {
        if (gamepad && gamepad.vibrationActuator) {
          const intensity = this.patternToIntensity(pattern);
          const duration = this.patternToDuration(pattern);
          
          gamepad.vibrationActuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: duration,
            weakMagnitude: intensity * 0.5,
            strongMagnitude: intensity
          });
          
          return true;
        }
      }
    } catch (error) {
      logger.debug('Gamepad vibration failed:', error);
    }

    return false;
  }

  tryAudioHapticWorkaround(pattern) {
    // iOS Safari haptic workaround using silent audio
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create very quiet, high-frequency tone
      oscillator.frequency.setValueAtTime(20000, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.01);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  visualFeedback(pattern) {
    // Provide visual feedback as fallback
    try {
      const intensity = this.getVisualIntensity(pattern);
      const duration = this.getVisualDuration(pattern);
      
      // Create temporary visual element
      const element = document.createElement('div');
      element.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        background: rgba(59, 130, 246, ${intensity});
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: hapticFeedback ${duration}ms ease-out;
      `;
      
      // Add animation keyframes if not already present
      if (!document.getElementById('haptic-feedback-styles')) {
        const style = document.createElement('style');
        style.id = 'haptic-feedback-styles';
        style.textContent = `
          @keyframes hapticFeedback {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(element);
      
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, duration);
      
      logger.debug('Visual haptic feedback triggered:', pattern);
    } catch (error) {
      logger.debug('Visual feedback failed:', error);
    }
  }

  getVibrationPattern(pattern) {
    if (Array.isArray(pattern)) {
      return pattern;
    }
    
    return this.patterns[pattern] || this.patterns.light;
  }

  getIOSIntensity(pattern) {
    const mapping = {
      light: 'light',
      medium: 'medium',
      heavy: 'heavy',
      success: 'medium',
      error: 'heavy',
      warning: 'medium',
      notification: 'light'
    };
    
    return mapping[pattern] || 'light';
  }

  getIOSHapticType(pattern) {
    const mapping = {
      light: 'selection',
      medium: 'impact',
      heavy: 'impact',
      success: 'notification',
      error: 'notification',
      warning: 'notification'
    };
    
    return mapping[pattern] || 'selection';
  }

  patternToIntensity(pattern) {
    if (!Array.isArray(pattern)) {
      pattern = this.getVibrationPattern(pattern);
    }
    
    const maxValue = Math.max(...pattern);
    return Math.min(maxValue / 100, 1.0);
  }

  patternToDuration(pattern) {
    if (!Array.isArray(pattern)) {
      pattern = this.getVibrationPattern(pattern);
    }
    
    return pattern.reduce((sum, value, index) => {
      // Odd indices are pauses in vibration patterns
      return sum + (index % 2 === 0 ? value : value);
    }, 0);
  }

  getVisualIntensity(pattern) {
    const intensities = {
      light: 0.3,
      medium: 0.6,
      heavy: 0.9,
      success: 0.5,
      error: 0.8,
      warning: 0.7
    };
    
    return intensities[pattern] || 0.3;
  }

  getVisualDuration(pattern) {
    const durations = {
      light: 150,
      medium: 200,
      heavy: 300,
      success: 250,
      error: 400,
      warning: 300
    };
    
    return durations[pattern] || 150;
  }

  shouldSkipHaptics() {
    // Check if user prefers reduced motion
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    
    // Check for user preference
    const preference = localStorage.getItem('haptic-feedback-enabled');
    if (preference === 'false') {
      return true;
    }
    
    // Check battery level (if available)
    if (navigator.getBattery) {
      navigator.getBattery().then(battery => {
        if (battery.level < 0.2 && !battery.charging) {
          return true;
        }
      });
    }
    
    return false;
  }

  // Convenience methods for common patterns
  light() { return this.trigger('light'); }
  medium() { return this.trigger('medium'); }
  heavy() { return this.trigger('heavy'); }
  success() { return this.trigger('success'); }
  error() { return this.trigger('error'); }
  warning() { return this.trigger('warning'); }
  notification() { return this.trigger('notification'); }
  
  // Card-specific methods
  cardFlip() { return this.trigger('cardFlip'); }
  cardDraw() { return this.trigger('cardDraw'); }
  cardMatch() { return this.trigger('cardMatch'); }
  priceAlert() { return this.trigger('priceAlert'); }
  
  // UI interaction methods
  buttonTap() { return this.trigger('buttonTap'); }
  swipeComplete() { return this.trigger('swipeComplete'); }
  pullRefresh() { return this.trigger('pullRefresh'); }
  
  // Enable/disable haptic feedback
  enable() {
    localStorage.setItem('haptic-feedback-enabled', 'true');
  }
  
  disable() {
    localStorage.setItem('haptic-feedback-enabled', 'false');
  }
  
  isEnabled() {
    return localStorage.getItem('haptic-feedback-enabled') !== 'false';
  }
}

// Create singleton instance
const hapticFeedback = new HapticFeedback();

export default hapticFeedback;