// Global type definitions for the project

declare global {
  interface Window {
    // Google Analytics
    gtag?: (...args: any[]) => void;
    
    // Google Analytics data layer
    dataLayer?: any[];
  }
}

// This is required for the file to be treated as a module
export {};