import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import logger from '../utils/logger';

interface MobileOptimizationOptions {
  enableTouchGestures?: boolean;
  enablePullToRefresh?: boolean;
  enableSwipeNavigation?: boolean;
  enableHapticFeedback?: boolean;
  breakpoint?: number;
}

interface MobileOptimizationReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  touchEnabled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isPWA: boolean;
  viewportHeight: number;
  viewportWidth: number;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const useMobileOptimization = (
  options: MobileOptimizationOptions = {}
): MobileOptimizationReturn => {
  const {
    enableTouchGestures = true,
    enablePullToRefresh = false,
    enableSwipeNavigation = true,
    enableHapticFeedback = true,
    breakpoint = 768,
  } = options;

  const router = useRouter();
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [viewportDimensions, setViewportDimensions] = useState({ width: 0, height: 0 });
  const [touchEnabled, setTouchEnabled] = useState(false);

  // Detect device type
  const detectDevice = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    setViewportDimensions({ width, height });
    setOrientation(width > height ? 'landscape' : 'portrait');

    if (width < breakpoint) {
      setScreenSize('mobile');
    } else if (width < 1024) {
      setScreenSize('tablet');
    } else {
      setScreenSize('desktop');
    }

    // Check for touch support
    setTouchEnabled(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (window as any).DocumentTouch && document instanceof (window as any).DocumentTouch
    );
  }, [breakpoint]);

  // Detect platform
  const getPlatform = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /android/i.test(userAgent);
    
    return { isIOS, isAndroid };
  };

  // Check if running as PWA
  const isPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://');
  };

  // Get safe area insets for notched devices
  const getSafeAreaInsets = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
      left: parseInt(computedStyle.getPropertyValue('--sal') || '0'),
      right: parseInt(computedStyle.getPropertyValue('--sar') || '0'),
    };
  };

  // Handle pull to refresh
  useEffect(() => {
    if (!enablePullToRefresh || !touchEnabled) return;

    let startY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].pageY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;

      const y = e.touches[0].pageY;
      const diff = y - startY;

      if (diff > 50 && window.scrollY === 0) {
        // Trigger refresh
        window.location.reload();
      }
    };

    const handleTouchEnd = () => {
      isPulling = false;
    };

    if (enablePullToRefresh) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enablePullToRefresh, touchEnabled]);

  // Handle swipe navigation
  useEffect(() => {
    if (!enableSwipeNavigation || !touchEnabled) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].pageX;
      startY = e.touches[0].pageY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].pageX;
      const endY = e.changedTouches[0].pageY;
      
      const diffX = endX - startX;
      const diffY = endY - startY;
      
      // Check if horizontal swipe
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swipe right - go back
          if (window.history.length > 1) {
            router.back();
            triggerHaptic('light');
          }
        } else {
          // Swipe left - could implement forward navigation
          triggerHaptic('light');
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enableSwipeNavigation, touchEnabled, router]);

  // Haptic feedback
  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHapticFeedback) return;

    // Check for Vibration API support
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
      };
      navigator.vibrate(patterns[style]);
    }

    // iOS Haptic Feedback (if available)
    if ((window as any).webkit?.messageHandlers?.haptic) {
      (window as any).webkit.messageHandlers.haptic.postMessage(style);
    }
  };

  // Setup viewport and orientation listeners
  useEffect(() => {
    detectDevice();

    const handleResize = () => {
      detectDevice();
    };

    const handleOrientationChange = () => {
      detectDevice();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Set CSS variables for safe areas
    const insets = getSafeAreaInsets();
    document.documentElement.style.setProperty('--safe-area-top', `${insets.top}px`);
    document.documentElement.style.setProperty('--safe-area-bottom', `${insets.bottom}px`);
    document.documentElement.style.setProperty('--safe-area-left', `${insets.left}px`);
    document.documentElement.style.setProperty('--safe-area-right', `${insets.right}px`);

    // Prevent overscroll on iOS
    document.body.style.overscrollBehavior = 'none';

    // Fix viewport height on mobile browsers
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', setViewportHeight);
    };
  }, [detectDevice]);

  const { isIOS, isAndroid } = getPlatform();

  return {
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    screenSize,
    orientation,
    touchEnabled,
    isIOS,
    isAndroid,
    isPWA: isPWA(),
    viewportHeight: viewportDimensions.height,
    viewportWidth: viewportDimensions.width,
    safeAreaInsets: getSafeAreaInsets(),
  };
};

// Mobile-optimized touch event handlers
export const useTouchHandlers = () => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
    setSwipeDirection(null);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;

    const currentTouch = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    const diffX = currentTouch.x - touchStart.x;
    const diffY = currentTouch.y - touchStart.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > 50) {
        setSwipeDirection(diffX > 0 ? 'right' : 'left');
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) > 50) {
        setSwipeDirection(diffY > 0 ? 'down' : 'up');
      }
    }
  }, [touchStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    });
  }, []);

  return {
    touchStart,
    touchEnd,
    swipeDirection,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};