import React, { useState, useEffect } from 'react';
import { usePWA } from './PWAProvider';
import logger from '@/utils/logger';

interface OfflineIndicatorProps {
  position?: 'top' | 'bottom';
  autoHide?: boolean;
  hideDelay?: number;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  position = 'top',
  autoHide = true,
  hideDelay = 5000
}) => {
  const { isOnline } = usePWA();
  const [showMessage, setShowMessage] = useState(false);
  const [justWentOffline, setJustWentOffline] = useState(false);
  const [justWentOnline, setJustWentOnline] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [offlineStartTime, setOfflineStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!isOnline) {
      // Going offline
      if (!justWentOffline) {
        setJustWentOffline(true);
        setJustWentOnline(false);
        setShowMessage(true);
        setOfflineStartTime(new Date());
        logger.info('User went offline');
      }
    } else {
      // Coming back online
      if (justWentOffline) {
        setJustWentOnline(true);
        setJustWentOffline(false);
        setShowMessage(true);
        setOfflineStartTime(null);
        logger.info('User came back online');

        // Auto-hide the "back online" message
        if (autoHide) {
          const timer = setTimeout(() => {
            setShowMessage(false);
            setJustWentOnline(false);
          }, 3000);
          return () => clearTimeout(timer);
        }
      }
    }

    return undefined;
  }, [isOnline, justWentOffline, autoHide]);

  // Auto-hide offline message after delay
  useEffect(() => {
    if (!isOnline && showMessage && autoHide && hideDelay > 0) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
      }, hideDelay);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [isOnline, showMessage, autoHide, hideDelay]);

  const handleToggleMinimize = (): void => {
    setIsMinimized(!isMinimized);
  };

  const handleDismiss = (): void => {
    setShowMessage(false);
    setJustWentOffline(false);
    setJustWentOnline(false);
  };

  const getOfflineDuration = (): string => {
    if (!offlineStartTime) return '';
    const now = new Date();
    const diffMs = now.getTime() - offlineStartTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    if (diffMins > 0) {
      return `${diffMins}m ${diffSecs}s`;
    }
    return `${diffSecs}s`;
  };

  if (!showMessage) return null;

  const positionClasses = position === 'top' ? 'top-4' : 'bottom-4';
  const animationClasses = position === 'top' ? 'animate-slide-down' : 'animate-slide-up';

  return (
    <div className={`fixed ${positionClasses} left-1/2 transform -translate-x-1/2 z-50 ${animationClasses}`}>
      <div className={`glass-medium rounded-xl shadow-xl border border-white/20 backdrop-blur-md transition-all duration-300 ${
        isMinimized ? 'w-12 h-12' : 'max-w-sm'
      }`}>
        {isMinimized ? (
          // Minimized state
          <button
            onClick={handleToggleMinimize}
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 ${
              isOnline
                ? 'text-green-600 hover:bg-green-50/50'
                : 'text-amber-600 hover:bg-amber-50/50'
            }`}
            title={isOnline ? 'Online' : 'Offline'}
          >
            {isOnline ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 2.83L3 21m9-13a4.978 4.978 0 00-2.83 1.414M21 3l-6 6m0 0V4m0 5h5M9 9l3 3m0 0V9m0 3H9" />
              </svg>
            )}
          </button>
        ) : (
          // Expanded state
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                {isOnline ? (
                  <div className="w-10 h-10 bg-green-100/80 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-amber-100/80 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 2.83L3 21m9-13a4.978 4.978 0 00-2.83 1.414M21 3l-6 6m0 0V4m0 5h5M9 9l3 3m0 0V9m0 3H9" />
                    </svg>
                  </div>
                )}
                
                <div>
                  <h4 className={`font-semibold ${
                    isOnline ? 'text-green-800' : 'text-amber-800'
                  }`}>
                    {isOnline ? 'Back Online!' : 'Offline Mode'}
                  </h4>
                  <p className={`text-sm ${
                    isOnline ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {isOnline 
                      ? 'Connection restored'
                      : offlineStartTime 
                        ? `Offline for ${getOfflineDuration()}`
                        : 'Limited functionality'
                    }
                  </p>
                </div>
              </div>

              <div className="flex space-x-1">
                <button
                  onClick={handleToggleMinimize}
                  className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100/50 rounded transition-all"
                  title="Minimize"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>

                {(isOnline || autoHide) && (
                  <button
                    onClick={handleDismiss}
                    className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100/50 rounded transition-all"
                    title="Dismiss"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {!isOnline && (
              <div className="mt-3 p-3 bg-amber-50/50 rounded-lg border border-amber-200/50">
                <h5 className="text-sm font-medium text-amber-800 mb-2">Available offline:</h5>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Previously viewed cards</li>
                  <li>• Cached Pokedex data</li>
                  <li>• Basic navigation</li>
                  <li>• Saved collections</li>
                </ul>
              </div>
            )}

            {isOnline && justWentOnline && (
              <div className="mt-3 p-3 bg-green-50/50 rounded-lg border border-green-200/50">
                <p className="text-xs text-green-700">
                  All features are now available. Fresh data will be loaded automatically.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Compact version for status bars
export const CompactOfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-amber-100/80 text-amber-800 rounded-full text-xs font-medium">
      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
      <span>Offline</span>
    </div>
  );
};

export default OfflineIndicator;