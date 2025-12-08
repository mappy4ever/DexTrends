/**
 * useServiceWorker - Hook for managing PWA service worker
 *
 * Features:
 * - Registers service worker
 * - Detects updates and notifies user
 * - Provides method to apply updates
 */

import { useEffect, useState, useCallback } from 'react';
import logger from '@/utils/logger';

interface UseServiceWorkerReturn {
  isUpdateAvailable: boolean;
  isOffline: boolean;
  applyUpdate: () => void;
  dismissUpdate: () => void;
}

export function useServiceWorker(): UseServiceWorkerReturn {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Set initial state
    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker and check for updates
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        logger.info('Service Worker registered', { scope: registration.scope });

        // Check for updates on registration
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              logger.info('New service worker update available');
              setWaitingWorker(newWorker);
              setIsUpdateAvailable(true);
            }
          });
        });

        // Check if there's already a waiting worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setIsUpdateAvailable(true);
        }

        // Periodically check for updates (every 60 minutes)
        setInterval(() => {
          registration.update().catch((err) => {
            logger.debug('Service worker update check failed', { error: err });
          });
        }, 60 * 60 * 1000);

      } catch (error) {
        logger.error('Service Worker registration failed', { error });
      }
    };

    registerServiceWorker();

    // Handle controller change (when update is applied)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      logger.info('Service worker controller changed, reloading...');
      window.location.reload();
    });
  }, []);

  // Apply the pending update
  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      // Tell the waiting worker to skip waiting and become active
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setIsUpdateAvailable(false);
      setWaitingWorker(null);
    }
  }, [waitingWorker]);

  // Dismiss update notification
  const dismissUpdate = useCallback(() => {
    setIsUpdateAvailable(false);
  }, []);

  return {
    isUpdateAvailable,
    isOffline,
    applyUpdate,
    dismissUpdate,
  };
}

export default useServiceWorker;
