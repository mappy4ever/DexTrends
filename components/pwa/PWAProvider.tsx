import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import logger from '@/utils/logger';
import { getServiceWorkerFile, getBrowserInfo } from '@/utils/browserDetection';
import type { BeforeInstallPromptEvent, ExtendedNavigator } from '@/types/pwa';

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
    // Check if app is installed/standalone
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as ExtendedNavigator).standalone ||
      document.referrer.includes('android-app://')
    );

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

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker with cleanup of old workers
    if ('serviceWorker' in navigator) {
      // First clean up any old service workers that might cause conflicts
      cleanupOldServiceWorkers().then(() => {
        registerServiceWorker();
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cleanupOldServiceWorkers = async (): Promise<void> => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const currentSWFile = getServiceWorkerFile();
      
      for (const registration of registrations) {
        // Check if this is an old or conflicting service worker
        const scriptURL = registration.active?.scriptURL || registration.installing?.scriptURL || registration.waiting?.scriptURL;
        
        if (scriptURL) {
          const url = new URL(scriptURL);
          const filename = url.pathname;
          
          // Unregister old service workers that don't match current one
          if (filename !== currentSWFile && (filename === '/sw.js' || filename === '/sw.tsx' || filename === '/sw-safari.js')) {
            logger.info('Unregistering old service worker:', { file: filename });
            await registration.unregister();
          }
        }
      }
    } catch (error) {
      logger.warn('Failed to cleanup old service workers:', { error });
    }
  };

  const registerServiceWorker = async (): Promise<void> => {
    try {
      // Get the appropriate service worker file based on browser
      const swFile = getServiceWorkerFile();
      
      if (!swFile) {
        logger.info('Service worker not supported in this browser');
        return;
      }
      
      const browserInfo = getBrowserInfo();
      logger.info('Registering service worker', { 
        file: swFile, 
        browser: {
          isSafari: browserInfo.isSafari,
          isChrome: browserInfo.isChrome,
          version: browserInfo.browserVersion
        }
      });
      
      const registration = await navigator.serviceWorker.register(swFile);
      setServiceWorkerRegistration(registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setHasUpdate(true);
              logger.info('New service worker available');
            }
          });
        }
      });
      
      logger.info('Service worker registered successfully', { scope: registration.scope });
    } catch (error) {
      logger.error('Service worker registration failed:', { error });
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
    if (serviceWorkerRegistration && serviceWorkerRegistration.waiting) {
      serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      router.reload();
    }
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

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};

export default PWAProvider;