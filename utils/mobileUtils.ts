/**
 * Mobile utilities for touch interactions, device detection, and mobile-specific features
 */

import { useState, useEffect } from 'react';
import logger from './logger';

// Type definitions
interface ScreenSize {
  width: number;
  height: number;
}

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface SwipeCallbacks {
  onSwipeLeft?: (event: TouchEvent) => void;
  onSwipeRight?: (event: TouchEvent) => void;
  onSwipeUp?: (event: TouchEvent) => void;
  onSwipeDown?: (event: TouchEvent) => void;
  threshold?: number;
  restraint?: number;
  allowedTime?: number;
}

interface BatteryStatus {
  level: number;
  charging: boolean;
  chargingTime: number | null;
  dischargingTime: number | null;
}

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  screenCategory: ScreenCategory;
  isOnline: boolean;
}

type ScreenCategory = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type HapticFeedbackType = 'light' | 'medium' | 'heavy';

// Extend Navigator interface for experimental APIs
interface NavigatorExtended extends Navigator {
  standalone?: boolean;
  getBattery?: () => Promise<BatteryManager>;
}

interface BatteryManager {
  level: number;
  charging: boolean;
  chargingTime: number | null;
  dischargingTime: number | null;
}

// Extend Window interface for PWA event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class MobileUtils {
  private isClient: boolean;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchEndX: number = 0;
  private touchEndY: number = 0;
  private isScrolling: boolean = false;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    
    if (this.isClient) {
      this.initializeUtils();
    }
  }

  private initializeUtils(): void {
    // Set up viewport handling
    this.setupViewport();
    
    // Set up orientation change handling
    this.setupOrientationChange();
    
    // Set up touch device optimizations
    this.setupTouchOptimizations();
  }

  /**
   * Device detection utilities
   */
  get isMobile(): boolean {
    if (!this.isClient) return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  get isIOS(): boolean {
    if (!this.isClient) return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  get isAndroid(): boolean {
    if (!this.isClient) return false;
    return /Android/.test(navigator.userAgent);
  }

  get isTouchDevice(): boolean {
    if (!this.isClient) return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  get isStandalone(): boolean {
    if (!this.isClient) return false;
    const nav = navigator as NavigatorExtended;
    return window.matchMedia('(display-mode: standalone)').matches ||
           nav.standalone === true;
  }

  get screenSize(): ScreenSize {
    if (!this.isClient) return { width: 0, height: 0 };
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  get devicePixelRatio(): number {
    if (!this.isClient) return 1;
    return window.devicePixelRatio || 1;
  }

  get isLandscape(): boolean {
    if (!this.isClient) return false;
    return window.innerWidth > window.innerHeight;
  }

  get isPortrait(): boolean {
    if (!this.isClient) return false;
    return window.innerHeight > window.innerWidth;
  }

  /**
   * Screen size categories
   */
  get screenCategory(): ScreenCategory {
    const width = this.screenSize.width;
    
    if (width < 480) return 'xs'; // Extra small phones
    if (width < 640) return 'sm'; // Small phones
    if (width < 768) return 'md'; // Large phones / small tablets
    if (width < 1024) return 'lg'; // Tablets
    if (width < 1280) return 'xl'; // Small desktops
    return '2xl'; // Large desktops
  }

  get isMobileSize(): boolean {
    return ['xs', 'sm'].includes(this.screenCategory);
  }

  get isTabletSize(): boolean {
    return ['md', 'lg'].includes(this.screenCategory);
  }

  get isDesktopSize(): boolean {
    return ['xl', '2xl'].includes(this.screenCategory);
  }

  /**
   * Viewport and display utilities
   */
  private setupViewport(): void {
    if (!this.isClient) return;

    // Set up dynamic viewport height for mobile
    const setVH = (): void => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100); // Delay for orientation change
    });

    // Prevent zoom on iOS
    if (this.isIOS) {
      document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });

      let lastTouchEnd = 0;
      document.addEventListener('touchend', (e) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      }, { passive: false });
    }
  }

  private setupOrientationChange(): void {
    if (!this.isClient) return;

    window.addEventListener('orientationchange', () => {
      // Trigger custom event for orientation change
      const event = new CustomEvent('mobileOrientationChange', {
        detail: {
          orientation: this.isLandscape ? 'landscape' : 'portrait',
          angle: screen.orientation?.angle || (window as any).orientation || 0
        }
      });
      window.dispatchEvent(event);
      
      logger.debug('Orientation changed', {
        orientation: this.isLandscape ? 'landscape' : 'portrait',
        screenSize: this.screenSize
      });
    });
  }

  private setupTouchOptimizations(): void {
    if (!this.isClient || !this.isTouchDevice) return;

    // Add touch device class
    document.documentElement.classList.add('touch-device');

    // Improve scroll performance
    document.addEventListener('touchstart', () => {
      this.isScrolling = true;
    }, { passive: true });

    document.addEventListener('touchend', () => {
      setTimeout(() => {
        this.isScrolling = false;
      }, 100);
    }, { passive: true });
  }

  /**
   * Touch gesture detection
   */
  detectSwipe(element: HTMLElement, callbacks: SwipeCallbacks = {}): () => void {
    if (!this.isClient || !element) return () => {};

    const {
      onSwipeLeft = () => {},
      onSwipeRight = () => {},
      onSwipeUp = () => {},
      onSwipeDown = () => {},
      threshold = 50,
      restraint = 100,
      allowedTime = 300
    } = callbacks;

    let startTime: number;
    let elapsedTime: number;

    const handleTouchStart = (e: TouchEvent): void => {
      const touch = e.changedTouches[0];
      this.touchStartX = touch.screenX;
      this.touchStartY = touch.screenY;
      startTime = new Date().getTime();
    };

    const handleTouchEnd = (e: TouchEvent): void => {
      const touch = e.changedTouches[0];
      this.touchEndX = touch.screenX;
      this.touchEndY = touch.screenY;
      elapsedTime = new Date().getTime() - startTime;

      if (elapsedTime <= allowedTime) {
        const distX = this.touchEndX - this.touchStartX;
        const distY = this.touchEndY - this.touchStartY;

        if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
          // Horizontal swipe
          if (distX > 0) {
            onSwipeRight(e);
          } else {
            onSwipeLeft(e);
          }
        } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
          // Vertical swipe
          if (distY > 0) {
            onSwipeDown(e);
          } else {
            onSwipeUp(e);
          }
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Return cleanup function
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }

  /**
   * Haptic feedback (iOS Safari)
   */
  hapticFeedback(type: HapticFeedbackType = 'light'): void {
    if (!this.isClient || !this.isIOS) return;

    try {
      if (window.navigator.vibrate) {
        // Android vibration
        const patterns: Record<HapticFeedbackType, number[]> = {
          light: [10],
          medium: [20],
          heavy: [30]
        };
        window.navigator.vibrate(patterns[type]);
      }
    } catch (error) {
      // Haptic feedback not supported
    }
  }

  /**
   * Safe area utilities for notched devices
   */
  getSafeAreaInsets(): SafeAreaInsets {
    if (!this.isClient) return { top: 0, right: 0, bottom: 0, left: 0 };

    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('--sat') || '0'),
      right: parseInt(style.getPropertyValue('--sar') || '0'),
      bottom: parseInt(style.getPropertyValue('--sab') || '0'),
      left: parseInt(style.getPropertyValue('--sal') || '0')
    };
  }

  applySafeAreaInsets(): void {
    if (!this.isClient || !this.isIOS) return;

    // Set CSS custom properties for safe areas
    const safeAreaCSS = `
      :root {
        --sat: env(safe-area-inset-top);
        --sar: env(safe-area-inset-right);
        --sab: env(safe-area-inset-bottom);
        --sal: env(safe-area-inset-left);
      }
    `;

    const style = document.createElement('style');
    style.textContent = safeAreaCSS;
    document.head.appendChild(style);
  }

  /**
   * Performance utilities
   */
  enableSmoothScrolling(): void {
    if (!this.isClient) return;

    document.documentElement.style.scrollBehavior = 'smooth';
    
    // iOS momentum scrolling
    if (this.isIOS) {
      (document.body.style as any).webkitOverflowScrolling = 'touch';
    }
  }

  disableOverscroll(): void {
    if (!this.isClient) return;
    
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
  }

  /**
   * Installation and PWA utilities
   */
  canInstallPWA(): boolean {
    return this.deferredPrompt !== null;
  }

  async installPWA(): Promise<boolean> {
    if (!this.canInstallPWA() || !this.deferredPrompt) return false;

    try {
      const result = await this.deferredPrompt.prompt();
      logger.debug('PWA installation result:', result);
      
      this.deferredPrompt = null;
      return result.outcome === 'accepted';
    } catch (error) {
      logger.error('PWA installation failed:', error);
      return false;
    }
  }

  setupPWAInstallPrompt(): void {
    if (!this.isClient) return;

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      // Prevent default install prompt
      e.preventDefault();
      
      // Store the event for later use
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      
      // Trigger custom event
      const customEvent = new CustomEvent('pwaInstallAvailable');
      window.dispatchEvent(customEvent);
      
      logger.debug('PWA install prompt available');
    });

    window.addEventListener('appinstalled', () => {
      logger.debug('PWA installed successfully');
      
      // Trigger custom event
      const customEvent = new CustomEvent('pwaInstalled');
      window.dispatchEvent(customEvent);
    });
  }

  /**
   * Network status
   */
  get isOnline(): boolean {
    if (!this.isClient) return true;
    return navigator.onLine;
  }

  setupNetworkMonitoring(): () => void {
    if (!this.isClient) return () => {};

    const handleOnline = (): void => {
      logger.debug('Network: Online');
      window.dispatchEvent(new CustomEvent('networkOnline'));
    };

    const handleOffline = (): void => {
      logger.debug('Network: Offline');
      window.dispatchEvent(new CustomEvent('networkOffline'));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  /**
   * Battery status (experimental)
   */
  async getBatteryStatus(): Promise<BatteryStatus | null> {
    if (!this.isClient) return null;
    
    const nav = navigator as NavigatorExtended;
    if (!nav.getBattery) return null;

    try {
      const battery = await nav.getBattery();
      return {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Share API
   */
  async shareContent(data: ShareData): Promise<boolean> {
    if (!this.isClient || !navigator.share) {
      // Fallback to clipboard
      return this.copyToClipboard(data.url || data.text || '');
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        logger.error('Share failed:', error);
      }
      return false;
    }
  }

  async copyToClipboard(text: string): Promise<boolean> {
    if (!this.isClient) return false;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      logger.error('Copy to clipboard failed:', error);
      return false;
    }
  }

  /**
   * Full initialization
   */
  init(): void {
    if (!this.isClient) return;

    this.applySafeAreaInsets();
    this.enableSmoothScrolling();
    this.disableOverscroll();
    this.setupPWAInstallPrompt();
    this.setupNetworkMonitoring();

    logger.debug('Mobile utils initialized', {
      isMobile: this.isMobile,
      isTouch: this.isTouchDevice,
      screenCategory: this.screenCategory,
      isStandalone: this.isStandalone
    });
  }
}

// Create global instance
const mobileUtils = new MobileUtils();

// React hooks
export const useMobileUtils = (): DeviceInfo & { utils: MobileUtils } => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: typeof window !== 'undefined' ? mobileUtils.isMobile : false,
    isTablet: typeof window !== 'undefined' ? mobileUtils.isTabletSize : false,
    isDesktop: typeof window !== 'undefined' ? mobileUtils.isDesktopSize : true,
    isTouch: typeof window !== 'undefined' ? mobileUtils.isTouchDevice : false,
    screenCategory: typeof window !== 'undefined' ? mobileUtils.screenCategory : 'xl',
    isOnline: typeof window !== 'undefined' ? mobileUtils.isOnline : true
  });

  useEffect(() => {
    const updateDeviceInfo = (): void => {
      setDeviceInfo({
        isMobile: mobileUtils.isMobile,
        isTablet: mobileUtils.isTabletSize,
        isDesktop: mobileUtils.isDesktopSize,
        isTouch: mobileUtils.isTouchDevice,
        screenCategory: mobileUtils.screenCategory,
        isOnline: mobileUtils.isOnline
      });
    };

    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    window.addEventListener('online', updateDeviceInfo);
    window.addEventListener('offline', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
      window.removeEventListener('online', updateDeviceInfo);
      window.removeEventListener('offline', updateDeviceInfo);
    };
  }, []);

  return {
    ...deviceInfo,
    utils: mobileUtils
  };
};

export default mobileUtils;