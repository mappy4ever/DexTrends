import { useContext } from 'react';
import { PWAContext } from '../components/pwa/PWAProvider';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAContextValue {
  isInstallable: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
  promptInstall: () => Promise<boolean>;
  refreshApp: () => void;
  serviceWorkerRegistration: ServiceWorkerRegistration | null;
}

export const usePWA = (): PWAContextValue => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
};