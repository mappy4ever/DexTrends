import React, { createContext, useContext, useState, useEffect } from 'react';

const PWAContext = createContext();

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
};

export const PWAProvider = ({ children }) => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState(null);
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    // Check if app is installed/standalone
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://')
    );

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
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

    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setServiceWorkerRegistration(registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setHasUpdate(true);
          }
        });
      });
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  };

  const promptInstall = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
    setIsInstallable(false);
    
    return outcome === 'accepted';
  };

  const refreshApp = () => {
    if (serviceWorkerRegistration && serviceWorkerRegistration.waiting) {
      serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const value = {
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