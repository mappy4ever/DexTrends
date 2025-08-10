// Global type definitions for the project

declare global {
  interface Window {
    // Google Analytics
    gtag?: (...args: any[]) => void;
    
    // Google Analytics data layer
    dataLayer?: any[];
  }

  // Jest globals for test/mock environments
  namespace jest {
    interface MockedFunction<T extends (...args: any[]) => any> {
      (...args: Parameters<T>): ReturnType<T>;
      mockReturnValue: (value: ReturnType<T>) => MockedFunction<T>;
      mockImplementation: (fn: T) => MockedFunction<T>;
      mockReset: () => MockedFunction<T>;
      mockClear: () => MockedFunction<T>;
    }
  }

  // Jest mock function
  const jest: {
    fn: <T extends (...args: any[]) => any>(implementation?: T) => jest.MockedFunction<T>;
  };

  // Service Worker globals
  interface SyncEvent extends ExtendableEvent {
    readonly tag: string;
  }

  interface ExtendableEvent extends Event {
    waitUntil(promise: Promise<any>): void;
  }
}

// This is required for the file to be treated as a module
export {};