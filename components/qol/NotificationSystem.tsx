import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import logger from '../../utils/logger';

// Type definitions
interface NotificationAction {
  label: string;
  handler: () => void;
}

interface Notification {
  id: string | number;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number | null;
  persistent?: boolean;
  actions?: NotificationAction[];
  timestamp: number;
}

type NotificationType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO' | 'LOADING' | 'CARD_ADDED' | 'POKEMON_FOUND';

interface NotificationConfig {
  icon: string;
  className: string;
  iconColor: string;
  duration: number | null;
}

interface NotifyHelpers {
  success: (message: string, options?: Partial<Notification>) => string | number;
  error: (message: string, options?: Partial<Notification>) => string | number;
  warning: (message: string, options?: Partial<Notification>) => string | number;
  info: (message: string, options?: Partial<Notification>) => string | number;
  loading: (message: string, options?: Partial<Notification>) => string | number;
  cardAdded: (cardName: string, options?: Partial<Notification>) => string | number;
  pokemonFound: (pokemonName: string, options?: Partial<Notification>) => string | number;
  priceAlert: (cardName: string, oldPrice: number, newPrice: number, options?: Partial<Notification>) => string | number;
}

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

// Notification context
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Notification types and configurations
const NOTIFICATION_TYPES: Record<NotificationType, NotificationConfig> = {
  SUCCESS: {
    icon: '✅',
    className: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200',
    iconColor: 'text-green-500',
    duration: 4000
  },
  ERROR: {
    icon: '❌',
    className: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200',
    iconColor: 'text-red-500',
    duration: 6000
  },
  WARNING: {
    icon: '⚠️',
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-200',
    iconColor: 'text-yellow-500',
    duration: 5000
  },
  INFO: {
    icon: 'ℹ️',
    className: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200',
    iconColor: 'text-blue-500',
    duration: 4000
  },
  LOADING: {
    icon: '⏳',
    className: 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200',
    iconColor: 'text-gray-500',
    duration: null // Loading notifications don't auto-dismiss
  },
  CARD_ADDED: {
    icon: '🃏',
    className: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-200',
    iconColor: 'text-purple-500',
    duration: 3000
  },
  POKEMON_FOUND: {
    icon: '⭐',
    className: 'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-700 dark:text-indigo-200',
    iconColor: 'text-indigo-500',
    duration: 4000
  }
};

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
            if (typeof window !== 'undefined') {
              window.location.href = '/favorites';
            }
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
    if (typeof window !== 'undefined') {
      window.showNotification = (type: string, message: string, options?: { description?: string; duration?: number }) => {
        addNotification({ 
          type: type.toUpperCase() as NotificationType, 
          message, 
          title: options?.description,
          duration: options?.duration
        });
      };
    }
  }, [addNotification]);

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

// Smart notification hooks for common patterns
export const useSmartNotifications = () => {
  const { notify } = useNotifications();

  const notifyCardAction = useCallback((action: string, card: { name: string }) => {
    switch (action) {
      case 'favorited':
        notify.cardAdded(card.name);
        break;
      case 'unfavorited':
        notify.info(`${card.name} removed from favorites`);
        break;
      case 'shared':
        notify.success(`${card.name} link copied to clipboard!`);
        break;
      default:
        notify.info(`Action completed for ${card.name}`);
    }
  }, [notify]);

  const notifySearchResult = useCallback((query: string, resultCount: number) => {
    if (resultCount === 0) {
      notify.warning(`No results found for "${query}"`, {
        actions: [
          {
            label: 'Clear Search',
            handler: () => {
              // Clear search logic
              logger.debug('Clear search triggered from notification');
            }
          }
        ]
      });
    } else if (resultCount === 1) {
      notify.pokemonFound(`1 result for "${query}"`);
    } else {
      notify.info(`Found ${resultCount} results for "${query}"`);
    }
  }, [notify]);

  const notifyNetworkStatus = useCallback((isOnline: boolean) => {
    if (isOnline) {
      notify.success('Connection restored! 🌐');
    } else {
      notify.warning('You are offline. Some features may be limited.', {
        persistent: true
      });
    }
  }, [notify]);

  return {
    notifyCardAction,
    notifySearchResult,
    notifyNetworkStatus
  };
};

export default NotificationProvider;