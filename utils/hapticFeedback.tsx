/**
 * Haptic Feedback Utility
 * Provides cross-platform haptic feedback for mobile devices
 */

import React, { useCallback } from 'react';
import logger from './logger';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';
type NotificationFeedback = 'success' | 'warning' | 'error';

class HapticFeedbackManager {
  private isSupported: boolean;
  private vibrationAPI: boolean;
  private isIOS: boolean;
  private isAndroid: boolean;

  constructor() {
    // Check platform
    this.isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);
    this.isAndroid = typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);
    
    // Check API support
    this.vibrationAPI = typeof navigator !== 'undefined' && 'vibrate' in navigator;
    this.isSupported = this.vibrationAPI || this.checkWebkitSupport();
  }

  private checkWebkitSupport(): boolean {
    // Check for webkit haptic support (iOS)
    return typeof window !== 'undefined' && 'ontouchstart' in window && this.isIOS;
  }

  /**
   * Trigger impact feedback
   */
  impact(style: HapticStyle = 'medium'): void {
    if (!this.isSupported) return;

    // Map style to vibration duration
    const durations: Record<HapticStyle, number> = {
      light: 10,
      medium: 20,
      heavy: 30,
      soft: 15,
      rigid: 35,
    };

    this.vibrate(durations[style]);
  }

  /**
   * Trigger selection feedback (light tap)
   */
  selection(): void {
    if (!this.isSupported) return;
    this.vibrate(10);
  }

  /**
   * Trigger notification feedback
   */
  notification(type: NotificationFeedback): void {
    if (!this.isSupported) return;

    const patterns: Record<NotificationFeedback, number[]> = {
      success: [10, 50, 10],
      warning: [20, 40, 20],
      error: [30, 20, 30, 20, 30],
    };

    this.vibrate(patterns[type]);
  }

  /**
   * Custom vibration pattern
   */
  vibrate(pattern: number | number[]): void {
    if (!this.vibrationAPI) return;

    try {
      navigator.vibrate(pattern);
    } catch (error) {
      logger.warn('Haptic feedback failed:', { error });
    }
  }

  /**
   * Long press feedback
   */
  longPress(): void {
    if (!this.isSupported) return;
    this.vibrate([0, 10, 50, 10]);
  }

  /**
   * Swipe feedback
   */
  swipe(): void {
    if (!this.isSupported) return;
    this.vibrate(5);
  }

  /**
   * Pull to refresh feedback
   */
  pullToRefresh(stage: 'start' | 'trigger' | 'end'): void {
    if (!this.isSupported) return;

    switch (stage) {
      case 'start':
        this.vibrate(5);
        break;
      case 'trigger':
        this.vibrate([10, 20, 10]);
        break;
      case 'end':
        this.vibrate(15);
        break;
    }
  }

  /**
   * Tab switch feedback
   */
  tabSwitch(): void {
    if (!this.isSupported) return;
    this.vibrate(8);
  }

  /**
   * Button press feedback
   */
  buttonPress(type: 'primary' | 'secondary' | 'danger' = 'primary'): void {
    if (!this.isSupported) return;

    const patterns = {
      primary: 15,
      secondary: 10,
      danger: [20, 10, 20],
    };

    this.vibrate(patterns[type]);
  }

  /**
   * Toggle switch feedback
   */
  toggle(state: boolean): void {
    if (!this.isSupported) return;
    this.vibrate(state ? [5, 10] : [10, 5]);
  }

  /**
   * Card interaction feedback
   */
  cardInteraction(type: 'tap' | 'flip' | 'favorite' | 'delete'): void {
    if (!this.isSupported) return;

    const patterns = {
      tap: 10,
      flip: [5, 10, 5],
      favorite: [10, 20, 10],
      delete: [20, 10, 20, 10],
    };

    this.vibrate(patterns[type]);
  }

  /**
   * Filter selection feedback
   */
  filterSelect(): void {
    if (!this.isSupported) return;
    this.vibrate(12);
  }

  /**
   * Scroll boundary feedback
   */
  scrollBoundary(): void {
    if (!this.isSupported) return;
    this.vibrate([5, 5]);
  }

  /**
   * Check if haptic feedback is supported
   */
  get supported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if device is mobile
   */
  get isMobile(): boolean {
    return this.isIOS || this.isAndroid;
  }
}

// Create singleton instance
const haptic = new HapticFeedbackManager();

// React Hook for haptic feedback
export function useHaptic() {
  const impact = useCallback((style?: HapticStyle) => {
    haptic.impact(style);
  }, []);

  const selection = useCallback(() => {
    haptic.selection();
  }, []);

  const notification = useCallback((type: NotificationFeedback) => {
    haptic.notification(type);
  }, []);

  const buttonPress = useCallback((type?: 'primary' | 'secondary' | 'danger') => {
    haptic.buttonPress(type);
  }, []);

  const cardTap = useCallback(() => {
    haptic.cardInteraction('tap');
  }, []);

  const swipe = useCallback(() => {
    haptic.swipe();
  }, []);

  return {
    impact,
    selection,
    notification,
    buttonPress,
    cardTap,
    swipe,
    supported: haptic.supported,
    isMobile: haptic.isMobile,
  };
}

// HOC for adding haptic feedback to components
export function withHaptic<P extends object>(
  Component: React.ComponentType<P>,
  feedbackType: 'selection' | 'impact' | 'button' = 'selection'
) {
  return (props: P) => {
    const handleInteraction = useCallback(() => {
      switch (feedbackType) {
        case 'selection':
          haptic.selection();
          break;
        case 'impact':
          haptic.impact();
          break;
        case 'button':
          haptic.buttonPress();
          break;
      }
    }, []);

    const enhancedProps = {
      ...props,
      onTouchStart: handleInteraction
    };

    return <Component {...enhancedProps} />;
  };
}

export default haptic;