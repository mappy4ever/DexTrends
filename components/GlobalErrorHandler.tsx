import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Extend Window interface to include our custom property
declare global {
  interface Window {
    __hasReloaded?: boolean;
  }
}

/**
 * Global error handler component that catches unhandled errors and chunk loading failures
 * Automatically reloads the page once on chunk loading errors in production
 */
export default function GlobalErrorHandler(): null {
  const router = useRouter();

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Don't reload on development to see the error
      if (process.env.NODE_ENV === 'production') {
        // Check if it's a chunk loading error
        const errorMessage = event.reason?.message || '';
        if (errorMessage.includes('Loading chunk') || 
            errorMessage.includes('Failed to fetch')) {
          // Reload the page once to try recovering
          if (!window.__hasReloaded) {
            window.__hasReloaded = true;
            window.location.reload();
          }
        }
      }
    };

    // Handle global errors
    const handleError = (event: ErrorEvent): void => {
      console.error('Global error:', event.error);
      
      // Check for chunk loading errors
      const errorMessage = event.error?.message || '';
      if (errorMessage.includes('Loading chunk') ||
          errorMessage.includes('Failed to fetch dynamically imported module')) {
        event.preventDefault();
        
        if (process.env.NODE_ENV === 'production' && !window.__hasReloaded) {
          window.__hasReloaded = true;
          window.location.reload();
        }
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Clear reload flag on route change
    const handleRouteChange = (): void => {
      window.__hasReloaded = false;
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return null;
}