import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
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
  const [progress, setProgress] = useState(100);
  const { type, title, message, duration, persistent, actions, showProgress } = notification;
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
      if (showProgress !== false && duration > 0) {
        // Progress bar animation (like Toast)
        const interval = 50; // Update every 50ms
        const decrement = (100 / duration) * interval;

        const timer = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev - decrement;
            if (newProgress <= 0) {
              clearInterval(timer);
              handleDismiss();
              return 0;
            }
            return newProgress;
          });
        }, interval);

        return () => clearInterval(timer);
      } else {
        // Simple timeout without progress
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
    // Return undefined for the else case
    return undefined;
  }, [duration, persistent, showProgress, handleDismiss]);

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
        
        {/* Progress bar (from Toast component) */}
        {showProgress !== false && duration && duration > 0 && !persistent && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700 mt-3 -mx-4 -mb-4">
            <div
              className={`h-full transition-all duration-75 ease-linear ${
                type === 'SUCCESS' ? 'bg-green-500' :
                type === 'ERROR' ? 'bg-red-500' :
                type === 'WARNING' ? 'bg-yellow-500' :
                type === 'INFO' ? 'bg-blue-500' :
                'bg-gray-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Notification container component with position support
const NotificationContainer: React.FC<{ notifications: Notification[]; onDismiss: (id: string | number) => void }> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  // Group notifications by position (similar to Toast)
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const position = notification.position || 'top-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  const getPositionClasses = (position: string) => {
    const positions: Record<string, string> = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
    };
    return positions[position] || positions['top-right'];
  };

  return (
    <>
      {Object.entries(groupedNotifications).map(([position, positionNotifications]) => (
        <div
          key={position}
          className={`fixed ${getPositionClasses(position)} z-50 pointer-events-none`}
          style={{
            display: 'flex',
            flexDirection: position.includes('bottom') ? 'column-reverse' : 'column',
            gap: '0.75rem'
          }}
        >
          <div className="pointer-events-auto space-y-3">
            {positionNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onDismiss={onDismiss}
              />
            ))}
          </div>
        </div>
      ))}
    </>
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

  // Promise-based notification helper (moved outside useMemo to fix hooks rule violation)
  const promiseNotification = useCallback(
    <T,>(
      promise: Promise<T>,
      messages: {
        loading?: string;
        success?: string | ((data: T) => string);
        error?: string | ((error: any) => string);
      },
      options: Partial<Notification> = {}
    ): Promise<T> => {
      const loadingId = addNotification({
        type: 'LOADING',
        message: messages.loading || 'Loading...',
        persistent: true,
        ...options
      });

      return promise
        .then((data) => {
          dismissNotification(loadingId);
          const successMessage = typeof messages.success === 'function' 
            ? messages.success(data) 
            : messages.success || 'Success!';
          addNotification({
            type: 'SUCCESS',
            message: successMessage,
            ...options
          });
          return data;
        })
        .catch((error) => {
          dismissNotification(loadingId);
          const errorMessage = typeof messages.error === 'function'
            ? messages.error(error)
            : messages.error || 'Something went wrong';
          addNotification({
            type: 'ERROR',
            message: errorMessage,
            persistent: true,
            ...options
          });
          throw error;
        });
    },
    [addNotification, dismissNotification]
  );

  // Smart notification helpers
  const notify: NotifyHelpers = useMemo(() => ({
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
    },
    
    // Promise-based toast for async operations
    promise: promiseNotification
  }), [addNotification, router, promiseNotification]);

  // Expose notification functions globally
  useEffect(() => {
    // Set global API for modern usage
    setGlobalNotificationAPI(notify);
    
    // Initialize legacy window.showNotification (moved to separate file for Fast Refresh)
    initializeGlobalNotifications(addNotification as (notification: unknown) => string | number);
    
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