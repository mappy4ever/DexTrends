/**
 * Haptic Feedback Utility
 * Provides cross-platform haptic feedback with fallbacks
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

export interface HapticFeedbackOptions {
  type?: HapticType;
  duration?: number;
}

class HapticFeedbackManager {
  private isSupported: boolean;
  private vibrationApi: boolean;

  constructor() {
    // Check for various haptic feedback APIs
    this.isSupported = this.checkSupport();
    this.vibrationApi = 'vibrate' in navigator;
  }

  private checkSupport(): boolean {
    // Check for iOS Haptic Feedback API
    if (typeof window !== 'undefined' && 'webkit' in window) {
      const webkit = (window as any).webkit;
      if (webkit?.messageHandlers?.haptic) {
        return true;
      }
    }

    // Check for Vibration API
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      return true;
    }

    return false;
  }

  /**
   * Trigger haptic feedback
   */
  trigger(options: HapticFeedbackOptions = {}): void {
    if (!this.isSupported) return;

    const { type = 'selection', duration } = options;

    // Try iOS Haptic Feedback first
    if (this.tryIOSHaptic(type)) return;

    // Fallback to Vibration API
    if (this.vibrationApi) {
      const vibrationPattern = this.getVibrationPattern(type, duration);
      navigator.vibrate(vibrationPattern);
    }
  }

  private tryIOSHaptic(type: HapticType): boolean {
    if (typeof window === 'undefined') return false;

    const webkit = (window as any).webkit;
    if (!webkit?.messageHandlers?.haptic) return false;

    try {
      switch (type) {
        case 'light':
        case 'selection':
          webkit.messageHandlers.haptic.postMessage('impact');
          break;
        case 'medium':
          webkit.messageHandlers.haptic.postMessage('impact');
          break;
        case 'heavy':
          webkit.messageHandlers.haptic.postMessage('impact');
          break;
        case 'success':
        case 'warning':
        case 'error':
          webkit.messageHandlers.haptic.postMessage('notification');
          break;
      }
      return true;
    } catch {
      return false;
    }
  }

  private getVibrationPattern(type: HapticType, customDuration?: number): number | number[] {
    switch (type) {
      case 'light':
        return customDuration || 10;
      case 'medium':
        return customDuration || 20;
      case 'heavy':
        return customDuration || 30;
      case 'selection':
        return customDuration || 15;
      case 'success':
        return [10, 10, 10];
      case 'warning':
        return [20, 10, 20];
      case 'error':
        return [30, 10, 30, 10, 30];
      default:
        return customDuration || 15;
    }
  }

  // Convenience methods
  light(): void {
    this.trigger({ type: 'light' });
  }

  medium(): void {
    this.trigger({ type: 'medium' });
  }

  heavy(): void {
    this.trigger({ type: 'heavy' });
  }

  selection(): void {
    this.trigger({ type: 'selection' });
  }

  success(): void {
    this.trigger({ type: 'success' });
  }

  warning(): void {
    this.trigger({ type: 'warning' });
  }

  error(): void {
    this.trigger({ type: 'error' });
  }

  // Special interaction patterns
  doubleTap(): void {
    if (!this.isSupported) return;
    this.trigger({ type: 'medium' });
    setTimeout(() => this.trigger({ type: 'medium' }), 100);
  }

  longPress(): void {
    if (!this.isSupported) return;
    this.trigger({ type: 'heavy', duration: 50 });
  }

  swipe(): void {
    if (!this.isSupported) return;
    this.trigger({ type: 'light', duration: 20 });
  }

  cardFlip(): void {
    if (!this.isSupported) return;
    this.trigger({ type: 'medium' });
  }

  buttonTap(): void {
    if (!this.isSupported) return;
    this.trigger({ type: 'light' });
  }

  toggleSwitch(): void {
    if (!this.isSupported) return;
    this.trigger({ type: 'selection' });
  }

  /**
   * Check if haptic feedback is available
   */
  isAvailable(): boolean {
    return this.isSupported;
  }
}

// Export singleton instance
const hapticFeedback = new HapticFeedbackManager();
export default hapticFeedback;