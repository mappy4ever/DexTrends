/**
 * Enhanced Haptic Feedback System for Mobile Interactions
 * Provides consistent haptic feedback across different devices and browsers
 */

import logger from './logger';

// Type definitions
type BasicPattern = 'light' | 'medium' | 'heavy';
type ComplexPattern = 'success' | 'error' | 'warning' | 'notification';
type CardPattern = 'cardFlip' | 'cardDraw' | 'cardMatch' | 'priceAlert';
type UIPattern = 'buttonTap' | 'swipeComplete' | 'pullRefresh' | 'modalOpen' | 'modalClose';
type GamePattern = 'levelUp' | 'achievement' | 'collect';
type AccessibilityPattern = 'focus' | 'selection' | 'confirmation';

type HapticPattern = BasicPattern | ComplexPattern | CardPattern | UIPattern | GamePattern | AccessibilityPattern | number[];

type IOSIntensity = 'light' | 'medium' | 'heavy';
type IOSHapticType = 'selection' | 'impact' | 'notification';

interface HapticOptions {
  fallback?: boolean;
  force?: boolean;
  delay?: number;
}

interface VibrationPattern {
  [key: string]: number[];
}

interface IOSHapticMessage {
  type: IOSHapticType;
}

interface GamepadVibrationOptions {
  startDelay: number;
  duration: number;
  weakMagnitude: number;
  strongMagnitude: number;
}

// Extend Navigator for experimental APIs
interface NavigatorExtended extends Navigator {
  webkitVibrate?: (pattern: number | number[]) => boolean;
  mozVibrate?: (pattern: number | number[]) => boolean;
  msVibrate?: (pattern: number | number[]) => boolean;
  getBattery?: () => Promise<BatteryManager>;
}

interface BatteryManager {
  level: number;
  charging: boolean;
}

// Extend Window for iOS-specific APIs
interface WindowExtended extends Window {
  TapticEngine?: {
    impact: (intensity: IOSIntensity) => void;
  };
  webkit?: {
    messageHandlers?: {
      haptic?: {
        postMessage: (message: IOSHapticMessage) => void;
      };
    };
  };
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

// Custom gamepad type with haptic actuator
interface GamepadWithHaptics {
  connected: boolean;
  vibrationActuator?: {
    playEffect: (type: string, options: GamepadVibrationOptions) => Promise<void>;
  };
}

class HapticFeedback {
  private isSupported: boolean;
  private hasVibration: boolean;
  private hasIOSHaptics: boolean;
  private patterns: VibrationPattern;

  constructor() {
    this.isSupported = false;
    this.hasVibration = false;
    this.hasIOSHaptics = false;
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

  private initialize(): void {
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
      hasVibration: this.hasVibration,
      isIOS: this.isIOS(),
      isAndroid: this.isAndroid()
    });
  }

  private checkNativeSupport(): void {
    // Check for iOS haptic feedback
    if (this.isIOS() && window.DeviceMotionEvent) {
      this.isSupported = true;
      return;
    }

    // Check for Android vibration
    if ('vibrate' in navigator) {
      this.isSupported = true;
      return;
    }

    // Check for gamepad vibration
    if ('getGamepads' in navigator) {
      this.isSupported = true;
      return;
    }
  }

  private checkVibrationSupport(): void {
    const nav = navigator as NavigatorExtended;
    this.hasVibration = !!(
      ('vibrate' in navigator) ||
      nav.webkitVibrate ||
      nav.mozVibrate ||
      nav.msVibrate
    );
  }

  private setupIOSHaptics(): void {
    if (!this.isIOS()) return;

    const win = window as WindowExtended;
    // Check for iOS haptic feedback APIs
    this.hasIOSHaptics = !!(
      win.TapticEngine ||
      (win.webkit && win.webkit.messageHandlers?.haptic)
    );
  }

  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  private isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  // Main haptic feedback method
  trigger(pattern: HapticPattern = 'light', options: HapticOptions = {}): boolean {
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

  private _executeHaptic(pattern: HapticPattern, fallback: boolean = true): boolean {
    try {
      // Get pattern array
      const vibrationPattern = this.getVibrationPattern(pattern);
      
      if (!vibrationPattern) {
        logger.warn('Unknown haptic pattern', { pattern });
        return false;
      }

      // Try iOS-specific haptics first
      if (this.isIOS() && this.tryIOSHaptics(pattern as string)) {
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
        this.visualFeedback(pattern as string);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Haptic feedback failed', { error });
      return false;
    }
  }

  private tryIOSHaptics(pattern: string): boolean {
    if (!this.isIOS()) return false;

    try {
      const win = window as WindowExtended;
      
      // Use TapticEngine if available
      if (win.TapticEngine) {
        const intensity = this.getIOSIntensity(pattern);
        win.TapticEngine.impact(intensity);
        return true;
      }

      // Use webkit message handler
      if (win.webkit?.messageHandlers?.haptic) {
        win.webkit.messageHandlers.haptic.postMessage({
          type: this.getIOSHapticType(pattern)
        });
        return true;
      }

      // Use Audio API workaround for iOS
      if (this.tryAudioHapticWorkaround(pattern)) {
        return true;
      }
    } catch (error) {
      logger.debug('iOS haptics failed', { error });
    }

    return false;
  }

  private tryVibration(pattern: number[]): boolean {
    if (!this.hasVibration) return false;

    try {
      const nav = navigator as NavigatorExtended;
      const vibrate = navigator.vibrate ||
                     nav.webkitVibrate ||
                     nav.mozVibrate ||
                     nav.msVibrate;

      if (vibrate && vibrate.call(navigator, pattern)) {
        logger.debug('Vibration triggered', { pattern });
        return true;
      }
    } catch (error) {
      logger.debug('Vibration failed', { error });
    }

    return false;
  }

  private tryGamepadVibration(pattern: number[]): boolean {
    if (!('getGamepads' in navigator)) return false;

    try {
      const gamepads = navigator.getGamepads();
      
      for (const gamepad of gamepads) {
        if (gamepad && gamepad.connected) {
          const gamepadWithHaptics = gamepad as any as GamepadWithHaptics;
          if (gamepadWithHaptics.vibrationActuator) {
            const intensity = this.patternToIntensity(pattern);
            const duration = this.patternToDuration(pattern);
            
            gamepadWithHaptics.vibrationActuator.playEffect('dual-rumble', {
              startDelay: 0,
              duration: duration,
              weakMagnitude: intensity * 0.5,
              strongMagnitude: intensity
            });
            
            return true;
          }
        }
      }
    } catch (error) {
      logger.debug('Gamepad vibration failed', { error });
    }

    return false;
  }

  private tryAudioHapticWorkaround(pattern: string): boolean {
    // iOS Safari haptic workaround using silent audio
    try {
      const win = window as WindowExtended;
      const AudioContextClass = win.AudioContext || win.webkitAudioContext;
      if (!AudioContextClass) return false;

      const audioContext = new AudioContextClass();
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

  private visualFeedback(pattern: string): void {
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
      
      logger.debug('Visual haptic feedback triggered', { pattern });
    } catch (error) {
      logger.debug('Visual feedback failed', { error });
    }
  }

  private getVibrationPattern(pattern: HapticPattern): number[] | null {
    if (Array.isArray(pattern)) {
      return pattern;
    }
    
    return this.patterns[pattern as string] || this.patterns.light;
  }

  private getIOSIntensity(pattern: string): IOSIntensity {
    const mapping: Record<string, IOSIntensity> = {
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

  private getIOSHapticType(pattern: string): IOSHapticType {
    const mapping: Record<string, IOSHapticType> = {
      light: 'selection',
      medium: 'impact',
      heavy: 'impact',
      success: 'notification',
      error: 'notification',
      warning: 'notification'
    };
    
    return mapping[pattern] || 'selection';
  }

  private patternToIntensity(pattern: number[]): number {
    const maxValue = Math.max(...pattern);
    return Math.min(maxValue / 100, 1.0);
  }

  private patternToDuration(pattern: number[]): number {
    return pattern.reduce((sum, value, index) => {
      // Odd indices are pauses in vibration patterns
      return sum + (index % 2 === 0 ? value : value);
    }, 0);
  }

  private getVisualIntensity(pattern: string): number {
    const intensities: Record<string, number> = {
      light: 0.3,
      medium: 0.6,
      heavy: 0.9,
      success: 0.5,
      error: 0.8,
      warning: 0.7
    };
    
    return intensities[pattern] || 0.3;
  }

  private getVisualDuration(pattern: string): number {
    const durations: Record<string, number> = {
      light: 150,
      medium: 200,
      heavy: 300,
      success: 250,
      error: 400,
      warning: 300
    };
    
    return durations[pattern] || 150;
  }

  private shouldSkipHaptics(): boolean {
    // Check if user prefers reduced motion
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    
    // Check for user preference
    const preference = localStorage.getItem('haptic-feedback-enabled');
    if (preference === 'false') {
      return true;
    }
    
    return false;
  }

  // Convenience methods for common patterns
  light(): boolean { return this.trigger('light'); }
  medium(): boolean { return this.trigger('medium'); }
  heavy(): boolean { return this.trigger('heavy'); }
  success(): boolean { return this.trigger('success'); }
  error(): boolean { return this.trigger('error'); }
  warning(): boolean { return this.trigger('warning'); }
  notification(): boolean { return this.trigger('notification'); }
  
  // Card-specific methods
  cardFlip(): boolean { return this.trigger('cardFlip'); }
  cardDraw(): boolean { return this.trigger('cardDraw'); }
  cardMatch(): boolean { return this.trigger('cardMatch'); }
  priceAlert(): boolean { return this.trigger('priceAlert'); }
  
  // UI interaction methods
  buttonTap(): boolean { return this.trigger('buttonTap'); }
  swipeComplete(): boolean { return this.trigger('swipeComplete'); }
  pullRefresh(): boolean { return this.trigger('pullRefresh'); }
  
  // Enable/disable haptic feedback
  enable(): void {
    localStorage.setItem('haptic-feedback-enabled', 'true');
  }
  
  disable(): void {
    localStorage.setItem('haptic-feedback-enabled', 'false');
  }
  
  isEnabled(): boolean {
    return localStorage.getItem('haptic-feedback-enabled') !== 'false';
  }
}

// Create singleton instance
const hapticFeedback = new HapticFeedback();

export default hapticFeedback;