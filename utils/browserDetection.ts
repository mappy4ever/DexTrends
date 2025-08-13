/**
 * Browser detection utilities for handling browser-specific features and compatibility
 */

interface BrowserInfo {
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isServiceWorkerSupported: boolean;
  isPWACapable: boolean;
  browserVersion: string | null;
}

/**
 * Detects the current browser and its capabilities
 */
export function detectBrowser(): BrowserInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isSafari: false,
      isChrome: false,
      isFirefox: false,
      isEdge: false,
      isIOS: false,
      isAndroid: false,
      isMobile: false,
      isServiceWorkerSupported: false,
      isPWACapable: false,
      browserVersion: null
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  const vendor = navigator.vendor?.toLowerCase() || '';
  
  // Browser detection
  const isSafari = /safari/.test(ua) && !/chrome|chromium|crios/.test(ua) && /apple/.test(vendor);
  const isChrome = /chrome|chromium|crios/.test(ua) && !/edge|edg/.test(ua);
  const isFirefox = /firefox|fxios/.test(ua);
  const isEdge = /edge|edg/.test(ua);
  
  // Mobile OS detection
  const isIOS = /iphone|ipad|ipod/.test(ua) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(ua);
  const isMobile = isIOS || isAndroid || /mobile/.test(ua);
  
  // Feature detection
  const isServiceWorkerSupported = 'serviceWorker' in navigator;
  
  // PWA capability detection - more strict for Safari
  const isPWACapable = isServiceWorkerSupported && 
    'PushManager' in window && 
    'Notification' in window &&
    (!isSafari || checkSafariPWASupport());
  
  // Get browser version
  let browserVersion: string | null = null;
  if (isSafari) {
    const match = ua.match(/version\/(\d+(\.\d+)?)/);
    browserVersion = match ? match[1] : null;
  } else if (isChrome) {
    const match = ua.match(/chrome\/(\d+(\.\d+)?)/);
    browserVersion = match ? match[1] : null;
  } else if (isFirefox) {
    const match = ua.match(/firefox\/(\d+(\.\d+)?)/);
    browserVersion = match ? match[1] : null;
  } else if (isEdge) {
    const match = ua.match(/edg\/(\d+(\.\d+)?)/);
    browserVersion = match ? match[1] : null;
  }
  
  return {
    isSafari,
    isChrome,
    isFirefox,
    isEdge,
    isIOS,
    isAndroid,
    isMobile,
    isServiceWorkerSupported,
    isPWACapable,
    browserVersion
  };
}

/**
 * Check Safari-specific PWA support
 * Safari has limited PWA support compared to other browsers
 */
function checkSafariPWASupport(): boolean {
  // Safari 11.3+ on iOS supports service workers
  // Safari 14+ on macOS has better PWA support
  const browser = detectBrowser();
  if (!browser.browserVersion) return false;
  
  const version = parseFloat(browser.browserVersion);
  if (browser.isIOS) {
    // iOS Safari needs version 11.3+
    return version >= 11.3;
  } else {
    // macOS Safari needs version 14+
    return version >= 14;
  }
}

/**
 * Determines if we should use a simplified service worker for compatibility
 */
export function shouldUseSimplifiedServiceWorker(): boolean {
  const browser = detectBrowser();
  
  // Use simplified service worker for:
  // 1. Safari (due to stricter SW implementation)
  // 2. Older browsers
  // 3. When SW is supported but PWA features are limited
  return browser.isSafari || 
    (browser.isServiceWorkerSupported && !browser.isPWACapable);
}

/**
 * Gets the appropriate service worker file based on browser capabilities
 */
export function getServiceWorkerFile(): string {
  if (!detectBrowser().isServiceWorkerSupported) {
    return ''; // No service worker
  }
  
  // Use simplified service worker for Safari and limited browsers
  if (shouldUseSimplifiedServiceWorker()) {
    return '/sw-safari.js';
  }
  
  // Use the basic service worker for all browsers now
  // The enhanced sw.tsx has too many compatibility issues
  return '/sw.js';
}

/**
 * Checks if the browser supports advanced PWA features
 */
export function supportsAdvancedPWAFeatures(): boolean {
  const browser = detectBrowser();
  
  return browser.isPWACapable && 
    !browser.isSafari && // Safari has limited support
    'BackgroundSync' in window &&
    'NavigationPreloadManager' in window;
}

/**
 * Export singleton instance for consistent browser detection
 */
let cachedBrowserInfo: BrowserInfo | null = null;

export function getBrowserInfo(): BrowserInfo {
  if (!cachedBrowserInfo) {
    cachedBrowserInfo = detectBrowser();
  }
  return cachedBrowserInfo;
}

// Clear cache on page visibility change (user might switch browsers in dev)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      cachedBrowserInfo = null;
    }
  });
}