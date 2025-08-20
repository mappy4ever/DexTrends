import React, { useState, useEffect, ReactNode } from 'react';
import type { BeforeInstallPromptEvent } from '@/types/pwa';
// Import mobile utils with error handling
let useMobileUtils: () => { isMobile: boolean; isStandalone: boolean; isDesktopSize: boolean; utils: { isIOS: boolean; hapticFeedback: () => void } };
try {
  useMobileUtils = require('../../utils/mobileUtils').useMobileUtils;
} catch (error) {
  useMobileUtils = () => ({ isMobile: true, isStandalone: false, isDesktopSize: false, utils: { isIOS: false, hapticFeedback: () => {} } });
}
import logger from '../../utils/logger';

// Note: gtag is already declared in PWA types

interface PWAFeaturesProps {
  isVisible: boolean;
}

// BeforeInstallPromptEvent is imported from types

interface InstallationAnalytics {
  promptShown: boolean;
  userInteracted: boolean;
  installAttempted: boolean;
  installSucceeded: boolean;
}

// Enhanced PWA features component
const PWAFeatures: React.FC<PWAFeaturesProps> = ({ isVisible }) => {
  return (
    <div className={`transition-all duration-300 ${isVisible ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-sm font-medium text-blue-900">Instant Load</div>
          <div className="text-xs text-blue-700">Lightning fast startup</div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl mb-1">📱</div>
          <div className="text-sm font-medium text-green-900">Native Feel</div>
          <div className="text-xs text-green-700">Works like a real app</div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-2xl mb-1">📴</div>
          <div className="text-sm font-medium text-purple-900">Offline Mode</div>
          <div className="text-xs text-purple-700">Browse without internet</div>
        </div>
        
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-2xl mb-1">🔔</div>
          <div className="text-sm font-medium text-red-900">Push Alerts</div>
          <div className="text-xs text-red-700">Price notifications</div>
        </div>
      </div>
    </div>
  );
};

const InstallPrompt: React.FC = () => {
  const { isMobile, isStandalone, utils } = useMobileUtils();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [installStep, setInstallStep] = useState(0); // 0: prompt, 1: installing, 2: success
  const [installationAnalytics, setInstallationAnalytics] = useState<InstallationAnalytics>({
    promptShown: false,
    userInteracted: false,
    installAttempted: false,
    installSucceeded: false
  });

  useEffect(() => {
    // Check if already installed or dismissed
    const isDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    setDismissed(isDismissed);
    
    // Check if iOS
    setIsIOS(utils.isIOS);
    
    // Don't show if already standalone or dismissed
    if (isStandalone || isDismissed) {
      return;
    }

    // Set up PWA install prompt detection
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setIsInstallable(true);
      
      // Show prompt after a delay to not interrupt user
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
      
      logger.debug('PWA install prompt available');
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setIsInstallable(false);
      setInstallPrompt(null);
      logger.debug('PWA installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS, show manual install instructions after some interaction
    if (utils.isIOS && !isStandalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 10000); // Show after 10 seconds on iOS

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone, utils.isIOS]);

  const handleInstallClick = async () => {
    setInstallationAnalytics(prev => ({ ...prev, userInteracted: true, installAttempted: true }));
    
    if (installPrompt && isInstallable) {
      try {
        setInstallStep(1); // Installing
        utils.hapticFeedback();
        
        const result = await installPrompt.prompt();
        logger.debug('Install prompt result:', result);
        
        if (result.outcome === 'accepted') {
          setInstallStep(2); // Success
          setInstallationAnalytics(prev => ({ ...prev, installSucceeded: true }));
          utils.hapticFeedback();
          
          // Track successful installation
          if (window.gtag) {
            window.gtag('event', 'pwa_install_success', {
              event_category: 'PWA',
              event_label: 'mobile_prompt'
            });
          }
          
          // Hide prompt after success animation
          setTimeout(() => {
            setShowPrompt(false);
            setInstallStep(0);
          }, 3000);
        } else {
          setInstallStep(0);
          // Track installation declined
          if (window.gtag) {
            window.gtag('event', 'pwa_install_declined', {
              event_category: 'PWA',
              event_label: 'mobile_prompt'
            });
          }
        }
      } catch (error: unknown) {
        logger.error('Install prompt error:', { error: error instanceof Error ? error.message : String(error) });
        setInstallStep(0);
        
        // Track installation error
        if (window.gtag) {
          window.gtag('event', 'pwa_install_error', {
            event_category: 'PWA',
            event_label: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    utils.hapticFeedback();
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Show again in 24 hours
    setTimeout(() => {
      if (!isStandalone) {
        setShowPrompt(true);
      }
    }, 24 * 60 * 60 * 1000);
  };

  if (!showPrompt || isStandalone || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end justify-center p-4">
      <div className="glass-medium rounded-t-3xl w-full max-w-md mx-auto shadow-2xl border border-white/20 backdrop-blur-md animate-slide-up">
        {/* Header */}
        <div className="p-6 text-center border-b border-white/10">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📱</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Install DexTrends
          </h2>
          <p className="text-gray-600 text-sm">
            Add DexTrends to your home screen for quick access and offline features!
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {installStep === 2 ? (
            // Success State
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                <span className="text-3xl">✅</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Successfully Installed!</h3>
                <p className="text-green-600">DexTrends is now available on your home screen</p>
              </div>
            </div>
          ) : installStep === 1 ? (
            // Installing State
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-800 mb-2">Installing...</h3>
                <p className="text-blue-600">Adding DexTrends to your device</p>
              </div>
            </div>
          ) : isIOS ? (
            // iOS manual install instructions
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">How to install:</h3>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">1</span>
                    <span>Tap the Share button <span className="inline-block">📤</span> in Safari</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">2</span>
                    <span>Scroll down and tap "Add to Home Screen"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">3</span>
                    <span>Tap "Add" to confirm</span>
                  </li>
                </ol>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center text-sm text-gray-600 bg-gray-100 rounded-full px-4 py-2">
                  <span className="mr-2">💡</span>
                  Works just like a native app!
                </div>
              </div>
            </div>
          ) : (
            // Android/Chrome install
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="glass-light rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Benefits of installing:</h3>
                    <button
                      onClick={() => setShowFeatures(!showFeatures)}
                      className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
                    >
                      {showFeatures ? 'Hide' : 'Show'} Features
                    </button>
                  </div>
                  
                  {!showFeatures && (
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• 🚀 Faster loading times</li>
                      <li>• 📱 Native app experience</li>
                      <li>• 🔔 Push notifications (optional)</li>
                      <li>• 📴 Works offline</li>
                      <li>• 🏠 Easy access from home screen</li>
                    </ul>
                  )}
                </div>
                
                <PWAFeatures isVisible={showFeatures} />
              </div>
              {isInstallable && installStep === 0 && (
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  Install DexTrends
                </button>
              )}
              {installStep === 1 && (
                <div className="w-full bg-gray-200 text-gray-600 font-semibold py-4 px-6 rounded-xl flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  Installing...
                </div>
              )}
              {installStep === 2 && (
                <div className="w-full bg-green-500 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center">
                  <span className="mr-2">✅</span>
                  Installed Successfully!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {installStep === 0 && (
          <div className="p-6 pt-0 space-y-3">
            {!isIOS && !isInstallable && (
              <div className="text-center text-sm text-gray-500 mb-4">
                Installation will be available when using Chrome or Edge
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={handleRemindLater}
                className="flex-1 py-3 px-4 text-gray-600 font-medium border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Remind me later
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 py-3 px-4 text-gray-600 font-medium border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                No thanks
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Floating install button for desktop
export const DesktopInstallButton: React.FC = () => {
  const { isDesktopSize, utils } = useMobileUtils();
  const [showButton, setShowButton] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!isDesktopSize) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isDesktopSize]);

  const handleInstall = async () => {
    if (installPrompt) {
      try {
        const result = await installPrompt.prompt();
        if (result.outcome === 'accepted') {
          setShowButton(false);
        }
      } catch (error) {
        logger.error('Desktop install error:', error);
      }
    }
  };

  if (!showButton || !isDesktopSize) {
    return null;
  }

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-pokemon-blue to-pokemon-red text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 z-40 flex items-center space-x-2"
      aria-label="Install DexTrends as an app"
    >
      <span>📱</span>
      <span className="font-medium">Install App</span>
    </button>
  );
};

export default InstallPrompt;