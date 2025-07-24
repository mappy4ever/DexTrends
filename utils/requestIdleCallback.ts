/**
 * requestIdleCallback polyfill for browsers that don't support it
 */

declare global {
  interface Window {
    requestIdleCallback: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number;
    cancelIdleCallback: (id: number) => void;
  }
}

interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
}

type IdleRequestCallback = (deadline: IdleDeadline) => void;

interface IdleRequestOptions {
  timeout?: number;
}

// Polyfill implementation
export function setupRequestIdleCallbackPolyfill() {
  if (typeof window === 'undefined') return;

  if (!window.requestIdleCallback) {
    window.requestIdleCallback = function (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) {
      const start = Date.now();
      const timeout = options?.timeout || 1;
      
      return window.setTimeout(function () {
        callback({
          didTimeout: false,
          timeRemaining: function () {
            return Math.max(0, 50 - (Date.now() - start));
          },
        });
      }, timeout) as unknown as number;
    };
  }

  if (!window.cancelIdleCallback) {
    window.cancelIdleCallback = function (id: number) {
      clearTimeout(id);
    };
  }
}

// Auto-setup on import
if (typeof window !== 'undefined') {
  setupRequestIdleCallbackPolyfill();
}

// Export a safe wrapper that can be used anywhere
export function safeRequestIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    return window.requestIdleCallback(callback, options);
  } else {
    // Fallback for SSR or unsupported browsers
    const id = setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => 0,
      });
    }, options?.timeout || 1);
    return id as unknown as number;
  }
}

export function safeCancelIdleCallback(id: number): void {
  if (typeof window !== 'undefined' && window.cancelIdleCallback) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}