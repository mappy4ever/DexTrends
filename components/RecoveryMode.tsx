import React, { useEffect, useState } from 'react';
import { performFullRecovery } from '@/utils/localStorageRecovery';
import logger from '@/utils/logger';

interface RecoveryModeProps {
  error?: Error;
}

const RecoveryMode: React.FC<RecoveryModeProps> = ({ error }) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState('');

  useEffect(() => {
    if (error) {
      logger.error('RecoveryMode activated due to error:', { error });
    }
  }, [error]);

  const handleRecovery = async () => {
    setIsRecovering(true);
    setRecoveryStatus('Clearing caches...');
    
    try {
      // Step 1: Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        setRecoveryStatus(`Clearing ${cacheNames.length} caches...`);
        
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }

      // Step 2: Clear localStorage
      setRecoveryStatus('Clearing local storage...');
      localStorage.clear();

      // Step 3: Unregister service workers
      setRecoveryStatus('Unregistering service workers...');
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      setRecoveryStatus('Recovery complete! Reloading...');
      
      // Step 4: Reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      logger.error('Recovery failed:', { error });
      setRecoveryStatus('Recovery failed. Please try clearing your browser data manually.');
      setIsRecovering(false);
    }
  };

  const handleManualReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-600 to-amber-600 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <div className="mb-6">
            <svg
              className="w-20 h-20 mx-auto text-white opacity-80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">
            Recovery Mode
          </h1>

          <p className="text-white/90 mb-6">
            {error
              ? "We've detected an issue with the app. Let's fix it!"
              : "It looks like the app needs to refresh its cache to work properly."}
          </p>

          {recoveryStatus && (
            <div className="mb-6 p-3 bg-white/10 rounded-lg">
              <p className="text-white/90 text-sm">{recoveryStatus}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleRecovery}
              disabled={isRecovering}
              className={`
                w-full py-3 px-6 rounded-full font-semibold transition-all
                ${isRecovering
                  ? 'bg-white/20 text-white/50 cursor-not-allowed'
                  : 'bg-white text-amber-600 hover:bg-white/90 hover:shadow-lg transform hover:scale-105'
                }
              `}
            >
              {isRecovering ? 'Recovering...' : 'Fix & Reload'}
            </button>

            <button
              onClick={handleManualReload}
              disabled={isRecovering}
              className="w-full py-3 px-6 rounded-full font-semibold bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              Try Reload
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-white/70 text-xs">
              If the issue persists, try clearing your browser's cache and cookies for this site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryMode;