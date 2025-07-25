import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Global error handler component that catches unhandled errors and chunk loading failures
 * Automatically reloads the page once on chunk loading errors in production
 */
export default function GlobalErrorHandler(): null {
  const router = useRouter();
  
  // Use sessionStorage instead of window mutation for Fast Refresh compatibility
  const RELOAD_KEY = 'error-handler-has-reloaded';
  
  const hasReloaded = () => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(RELOAD_KEY) === 'true';
  };
  
  const setReloaded = (value: boolean) => {
    if (typeof window === 'undefined') return;
    if (value) {
      sessionStorage.setItem(RELOAD_KEY, 'true');
    } else {
      sessionStorage.removeItem(RELOAD_KEY);
    }
  };

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
      const errorMessage = event.reason?.message || '';
      
      // For chunk/module loading errors, let Next.js handle
      if (errorMessage.includes('Loading chunk') || 
          errorMessage.includes('Failed to fetch dynamically imported module') ||
          errorMessage.includes('Cannot find module') ||
          errorMessage.includes('Failed to import')) {
        console.log('Chunk loading error in promise rejection, letting Next.js handle:', errorMessage);
        return;
      }
      
      // Log other unhandled rejections
      console.error('Unhandled promise rejection:', event.reason);
    };

    // Handle global errors
    const handleError = (event: ErrorEvent): void => {
      const errorMessage = event.error?.message || '';
      
      // For chunk loading errors, let Next.js show 404
      if (errorMessage.includes('Loading chunk') ||
          errorMessage.includes('Failed to fetch dynamically imported module') ||
          errorMessage.includes('Cannot find module') ||
          errorMessage.includes('Failed to import')) {
        // Don't prevent default - let Next.js handle it
        console.log('Chunk loading error detected, letting Next.js handle:', errorMessage);
        return;
      }
      
      // Log other errors
      console.error('Global error:', event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Clear reload flag on route change
    const handleRouteChange = (): void => {
      setReloaded(false);
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