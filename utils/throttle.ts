// Throttle utility function - extracted from _app.tsx

// Simple throttle function with proper cleanup
export const throttle = <T extends (...args: unknown[]) => unknown>(func: T, limit: number): T => {
  let inThrottle: boolean = false;
  let timer: NodeJS.Timeout | null = null;
  
  const throttledFunc = function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      timer = setTimeout(() => {
        inThrottle = false;
        timer = null;
      }, limit);
    }
  } as T;
  
  // Add cleanup method
  (throttledFunc as T & { cleanup: () => void }).cleanup = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    inThrottle = false;
  };
  
  return throttledFunc;
};