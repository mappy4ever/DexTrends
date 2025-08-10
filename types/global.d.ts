// Global type definitions for the project

// Google Analytics event type
interface GtagEvent {
  event: string;
  [key: string]: string | number | boolean | undefined;
}

declare global {
  interface Window {
    // Google Analytics
    gtag?: (...args: unknown[]) => void;
    
    // Google Analytics data layer
    dataLayer?: GtagEvent[];
  }

  // Jest globals for test/mock environments
  namespace jest {
    interface MockedFunction<T extends (...args: unknown[]) => unknown> {
      (...args: Parameters<T>): ReturnType<T>;
      mockReturnValue: (value: ReturnType<T>) => MockedFunction<T>;
      mockImplementation: (fn: T) => MockedFunction<T>;
      mockReset: () => MockedFunction<T>;
      mockClear: () => MockedFunction<T>;
    }
  }

  // Jest mock function
  const jest: {
    fn: <T extends (...args: unknown[]) => unknown>(implementation?: T) => jest.MockedFunction<T>;
  };

  // Service Worker globals
  interface SyncEvent extends ExtendableEvent {
    readonly tag: string;
  }

  interface ExtendableEvent extends Event {
    waitUntil(promise: Promise<unknown>): void;
  }
}

// This is required for the file to be treated as a module
export {};