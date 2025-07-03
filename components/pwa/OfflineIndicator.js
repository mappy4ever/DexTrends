import React, { useState, useEffect } from 'react';
import { usePWA } from './PWAProvider';

const OfflineIndicator = () => {
  const { isOnline } = usePWA();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [justWentOffline, setJustWentOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setJustWentOffline(true);
      setShowOfflineMessage(true);
    } else if (justWentOffline) {
      // Show "back online" message briefly
      setShowOfflineMessage(true);
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
        setJustWentOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, justWentOffline]);

  if (!showOfflineMessage) return null;

  return (
    <div className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
      isOnline 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`}>
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>You're back online!</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>You're offline. Limited functionality available.</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;