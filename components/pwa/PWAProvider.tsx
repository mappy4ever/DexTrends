import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/router';
import logger from '@/utils/logger';
import { getServiceWorkerFile, getBrowserInfo } from '@/utils/browserDetection';
import type { BeforeInstallPromptEvent, ExtendedNavigator } from '@/types/pwa';
import { UpdateNotification, OfflineIndicator } from '@/components/ui/UpdateNotification';

// Re-export hook for backward compatibility
export { usePWA } from '../../hooks/usePWA';

// BeforeInstallPromptEvent is now imported from types

interface PWAContextValue {
  isInstallable: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
  promptInstall: () => Promise<boolean>;
  refreshApp: () => void;
  serviceWorkerRegistration: ServiceWorkerRegistration | null;
}

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAContext = createContext<PWAContextValue | undefined>(undefined);

// NOTE: usePWA hook has been moved to /hooks/usePWA.ts for Fast Refresh compatibility

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if app is installed/standalone (client-only)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      setIsStandalone(
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as ExtendedNavigator).standalone ||
        document.referrer.includes('android-app://')
      );
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    // Listen for online/offline changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    // Register service worker with cleanup of old workers
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      // First clean up any old service workers that might cause conflicts
      cleanupOldServiceWorkers().then(() => {
        registerServiceWorker();
      });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const cleanupOldServiceWorkers = async (): Promise<void> => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      // Clear all caches if we detect issues
      if (typeof window !== 'undefined' && window.localStorage) {
        const hasRecoveryFlag = localStorage.getItem('sw-recovery-needed');
        if (hasRecoveryFlag === 'true') {
          logger.info('Service worker recovery mode activated');
          
          // Clear all caches
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(name => {
                logger.info('Deleting cache:', { name });
                return caches.delete(name);
              })
            );
          }
          
          // Clear the recovery flag
          localStorage.removeItem('sw-recovery-needed');
        }
      }
      
      // Unregister all old service workers except the current one
      for (const registration of registrations) {
        const scriptURL = registration.active?.scriptURL || registration.installing?.scriptURL || registration.waiting?.scriptURL;
        
        if (scriptURL) {
          const url = new URL(scriptURL);
          const filename = url.pathname;
          
          // Keep only sw.js, unregister everything else
          if (filename !== '/sw.js') {
            logger.info('Unregistering old service worker:', { file: filename });
            await registration.unregister();
          }
        }
      }
    } catch (error) {
      logger.warn('Failed to cleanup old service workers:', { error });
      // Don't let SW errors break the app
    }
  };

  const registerServiceWorker = async (): Promise<void> => {
    try {
      // Always use sw.js now that we've cleaned up
      const swFile = '/sw.js';
      
      logger.info('Registering service worker', { file: swFile });
      
      // Register service worker without timestamp to prevent constant updates
      const registration = await navigator.serviceWorker.register(swFile);
      setServiceWorkerRegistration(registration);

      // Force immediate activation of new service worker
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Check for updates but don't auto-reload
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setHasUpdate(true);
              logger.info('New service worker available - refresh to update');
              // Don't auto-reload - let user decide when to refresh
            }
          });
        }
      });
      
      // Check for updates every 30 seconds in development
      if (process.env.NODE_ENV === 'development') {
        setInterval(() => {
          registration.update().catch(() => {});
        }, 30000);
      }
      
      logger.info('Service worker registered successfully', { scope: registration.scope });
    } catch (error) {
      logger.error('Service worker registration failed:', { error });
      
      // Set recovery flag if registration fails
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('sw-recovery-needed', 'true');
      }
      
      // Continue running the app even if SW registration fails
    }
  };

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
    setIsInstallable(false);
    
    return outcome === 'accepted';
  };

  const refreshApp = (): void => {
    // Clear all caches and reload
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
    
    // Clear localStorage recovery flags
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('sw-recovery-needed', 'true');
    }
    
    // Force reload
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const value: PWAContextValue = {
    isInstallable,
    isStandalone,
    isOnline,
    hasUpdate,
    promptInstall,
    refreshApp,
    serviceWorkerRegistration
  };

  const dismissUpdate = useCallback(() => {
    setHasUpdate(false);
  }, []);

  return (
    <PWAContext.Provider value={value}>
      {children}
      <UpdateNotification
        isVisible={hasUpdate}
        onUpdate={refreshApp}
        onDismiss={dismissUpdate}
      />
      <OfflineIndicator isOffline={!isOnline} />
    </PWAContext.Provider>
  );
};

export default PWAProvider;