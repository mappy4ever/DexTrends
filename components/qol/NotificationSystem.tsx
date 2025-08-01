import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/router';
import logger from '../../utils/logger';
import { 
  NotificationType, 
  NotificationAction, 
  Notification, 
  NotificationConfig, 
  NotifyHelpers,
  NOTIFICATION_TYPES 
} from '../../utils/notificationTypes';

// Type definitions moved to notificationTypes.ts

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Partial<Notification>) => string | number;
  dismissNotification: (id: string | number) => void;
  clearAllNotifications: () => void;
  notify: NotifyHelpers;
}

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string | number) => void;
}

interface NotificationProviderProps {
  children: ReactNode;
}

// Global showNotification function is already declared in AchievementSystem.tsx

// Notification context - exported for use in hooks
export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// NOTE: useNotifications hook has been moved to /hooks/useNotifications.ts for Fast Refresh compatibility

// NOTIFICATION_TYPES is now imported from notificationTypes.ts


// Smart notification component
const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { type, title, message, duration, persistent, actions } = notification;
  const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.INFO;

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  }, [notification.id, onDismiss]);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration && !persistent) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
    // Return undefined for the else case
    return undefined;
  }, [duration, persistent, handleDismiss]);

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className={`p-4 border rounded-lg shadow-sm ${config.className} min-w-[300px] max-w-[400px]`}>
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 text-lg ${config.iconColor}`}>
            {config.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-semibold text-sm mb-1">{title}</h4>
            )}
            <p className="text-sm">{message}</p>
            
            {actions && actions.length > 0 && (
              <div className="flex space-x-2 mt-3">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.handler();
                      handleDismiss();
                    }}
                    className="text-xs px-3 py-1 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {!persistent && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Notification container component
const NotificationContainer: React.FC<{ notifications: Notification[]; onDismiss: (id: string | number) => void }> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <div className="pointer-events-auto">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
};

// Main notification provider
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  const addNotification = useCallback((notification: Partial<Notification>): string | number => {
    const id = Date.now() + Math.random();
    const newNotification: Notification = {
      id,
      timestamp: Date.now(),
      type: 'INFO' as NotificationType,
      message: '',
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);
    logger.debug('Notification added', { type: notification.type, title: notification.title });
    
    return id;
  }, []);

  const dismissNotification = useCallback((id: string | number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Smart notification helpers
  const notify: NotifyHelpers = {
    success: (message: string, options = {}) => addNotification({
      type: 'SUCCESS',
      message,
      ...options
    }),
    
    error: (message: string, options = {}) => addNotification({
      type: 'ERROR',
      message,
      persistent: true, // Errors should be persistent by default
      ...options
    }),
    
    warning: (message: string, options = {}) => addNotification({
      type: 'WARNING',
      message,
      ...options
    }),
    
    info: (message: string, options = {}) => addNotification({
      type: 'INFO',
      message,
      ...options
    }),
    
    loading: (message: string, options = {}) => addNotification({
      type: 'LOADING',
      message,
      persistent: true,
      ...options
    }),
    
    cardAdded: (cardName: string, options = {}) => addNotification({
      type: 'CARD_ADDED',
      title: 'Card Added to Favorites',
      message: `${cardName} has been added to your favorites!`,
      actions: [
        {
          label: 'View Favorites',
          handler: () => {
            // Navigate to favorites page
            router.push('/favorites');
          }
        }
      ],
      ...options
    }),
    
    pokemonFound: (pokemonName: string, options = {}) => addNotification({
      type: 'POKEMON_FOUND',
      title: 'Pokémon Found!',
      message: `Found ${pokemonName} in your search!`,
      ...options
    }),
    
    priceAlert: (cardName: string, oldPrice: number, newPrice: number, options = {}) => {
      const change = newPrice > oldPrice ? 'increased' : 'decreased';
      const emoji = newPrice > oldPrice ? '📈' : '📉';
      
      return addNotification({
        type: newPrice > oldPrice ? 'WARNING' : 'SUCCESS',
        title: `Price Alert ${emoji}`,
        message: `${cardName} ${change} from $${oldPrice} to $${newPrice}`,
        actions: [
          {
            label: 'View Card',
            handler: () => {
              // Navigate to card page
              logger.debug('Price alert: Navigate to card', { cardName });
            }
          }
        ],
        ...options
      });
    }
  };

  // Expose notification functions globally
  useEffect(() => {
    // Set global API for modern usage
    setGlobalNotificationAPI(notify);
    
    // Initialize legacy window.showNotification (moved to separate file for Fast Refresh)
    initializeGlobalNotifications(addNotification);
    
    // Cleanup on unmount
    return () => {
      cleanupGlobalNotifications();
    };
  }, [addNotification, router, notify]);

  // Context value
  const contextValue: NotificationContextValue = {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
    notify
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer 
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </NotificationContext.Provider>
  );
};

// NOTE: useSmartNotifications hook has been moved to /hooks/useSmartNotifications.ts for Fast Refresh compatibility

// Import the global notification utilities
import { setGlobalNotificationAPI } from '../../utils/globalNotifications';
import { initializeGlobalNotifications, cleanupGlobalNotifications } from '../../utils/initializeGlobalNotifications';

export default NotificationProvider;

// Re-export types for convenience
export type { Notification, NotificationType, NotificationAction, NotifyHelpers };

// Re-export the hook for backward compatibility
export { useNotifications } from '../../hooks/useNotifications';