import React, { useState, useEffect } from 'react';
import { useMobileUtils } from '../../utils/mobileUtils';
import logger from '../../utils/logger';

const AppUpdateNotification = () => {
  const { utils } = useMobileUtils();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [appUpdated, setAppUpdated] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showChangeLog, setShowChangeLog] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Listen for service worker messages
      const handleMessage = (event) => {
        if (event.data) {
          switch (event.data.type) {
            case 'UPDATE_AVAILABLE':
              setUpdateAvailable(true);
              setUpdateInfo(event.data);
              utils.hapticFeedback('medium');
              logger.debug('App update available:', event.data);
              break;
            
            case 'APP_UPDATED':
              setAppUpdated(true);
              setUpdateAvailable(false);
              setUpdateInfo(event.data);
              utils.hapticFeedback('heavy');
              logger.debug('App updated successfully:', event.data);
              
              // Auto-hide after 5 seconds
              setTimeout(() => {
                setAppUpdated(false);
              }, 5000);
              break;
              
            case 'BACKGROUND_SYNC_COMPLETE':
              logger.debug('Background sync completed');
              break;
              
            case 'PRICE_DATA_UPDATED':
              // Could show a subtle notification about new price data
              logger.debug('Price data updated');
              break;
          }
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);

      // Check for updates on load
      checkForUpdates();

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [utils]);

  const checkForUpdates = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Check if there's a waiting service worker
        if (registration.waiting) {
          setUpdateAvailable(true);
          setUpdateInfo({ version: 'pending', timestamp: Date.now() });
        }
        
        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              setUpdateInfo({ version: 'installed', timestamp: Date.now() });
            }
          });
        });
      } catch (error) {
        logger.error('Update check failed:', error);
      }
    }
  };

  const handleUpdateApp = async () => {
    if (!updateAvailable) return;
    
    setIsInstalling(true);
    utils.hapticFeedback('medium');
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        if (registration.waiting) {
          // Tell the waiting service worker to skip waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Reload the page to get the new version
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      logger.error('Update installation failed:', error);
      setIsInstalling(false);
    }
  };

  const handleDismissUpdate = () => {
    setUpdateAvailable(false);
    utils.hapticFeedback('light');
    
    // Don't show again for 1 hour
    localStorage.setItem('updateDismissed', Date.now().toString());
  };

  const handleDismissUpdateSuccess = () => {
    setAppUpdated(false);
    utils.hapticFeedback('light');
  };

  // Don't show if dismissed recently (within 1 hour)
  const isDismissedRecently = () => {
    const dismissed = localStorage.getItem('updateDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const oneHour = 60 * 60 * 1000;
      return Date.now() - dismissedTime < oneHour;
    }
    return false;
  };

  if (appUpdated) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md">
        <div className="bg-green-500 text-white rounded-lg shadow-lg p-4 animate-slide-down">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <div>
                <div className="font-semibold">App Updated!</div>
                <div className="text-sm opacity-90">DexTrends has been updated with new features</div>
              </div>
            </div>
            <button
              onClick={handleDismissUpdateSuccess}
              className="ml-4 text-white hover:text-green-200 transition-colors">

              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!updateAvailable || isDismissedRecently()) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🚀</span>
            <div>
              <div className="font-semibold">Update Available</div>
              <div className="text-sm opacity-90">A new version of DexTrends is ready</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-sm text-gray-600 mb-4">
            Get the latest features, improvements, and bug fixes by updating now.
          </div>

          {/* Change Log Preview */}
          <div className="mb-4">
            <button
              onClick={() => setShowChangeLog(!showChangeLog)}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">

              {showChangeLog ? '📖 Hide' : '📋 View'} What's New
            </button>
            
            {showChangeLog && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                <ul className="space-y-1 text-gray-700">
                  <li>• 🎨 Enhanced mobile UI and animations</li>
                  <li>• 📱 Improved PWA functionality</li>
                  <li>• 🔔 Better push notifications</li>
                  <li>• ⚡ Performance optimizations</li>
                  <li>• 🐛 Bug fixes and stability improvements</li>
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleUpdateApp}
              disabled={isInstalling}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isInstalling
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 active:scale-95'
              }`}
            >
              {isInstalling ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Installing...
                </div>
              ) : (
                'Update Now'
              )}
            </button>
            
            <button
              onClick={handleDismissUpdate}
              disabled={isInstalling}
              className="px-4 py-3 text-gray-600 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">

              Later
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            Update will take just a few seconds
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppUpdateNotification;