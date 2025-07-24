/**
 * Global Notification Utilities
 * These utilities allow notifications to be triggered from outside React components
 */

import logger from './logger';
import { 
  NotificationAction,
  Notification,
  NotificationType,
  NotifyHelpers
} from './notificationTypes';

// Global notification API for use outside React components
let globalNotificationAPI: NotifyHelpers | null = null;

export const setGlobalNotificationAPI = (api: NotifyHelpers) => {
  globalNotificationAPI = api;
};

// Global notification functions that can be used anywhere
export const GlobalNotifications = {
  success: (message: string, options?: Partial<Notification>) => {
    if (globalNotificationAPI) {
      return globalNotificationAPI.success(message, options);
    }
    logger.warn('GlobalNotifications: NotificationProvider not initialized');
    return -1;
  },
  error: (message: string, options?: Partial<Notification>) => {
    if (globalNotificationAPI) {
      return globalNotificationAPI.error(message, options);
    }
    logger.warn('GlobalNotifications: NotificationProvider not initialized');
    return -1;
  },
  warning: (message: string, options?: Partial<Notification>) => {
    if (globalNotificationAPI) {
      return globalNotificationAPI.warning(message, options);
    }
    logger.warn('GlobalNotifications: NotificationProvider not initialized');
    return -1;
  },
  info: (message: string, options?: Partial<Notification>) => {
    if (globalNotificationAPI) {
      return globalNotificationAPI.info(message, options);
    }
    logger.warn('GlobalNotifications: NotificationProvider not initialized');
    return -1;
  },
  loading: (message: string, options?: Partial<Notification>) => {
    if (globalNotificationAPI) {
      return globalNotificationAPI.loading(message, options);
    }
    logger.warn('GlobalNotifications: NotificationProvider not initialized');
    return -1;
  },
  cardAdded: (cardName: string, options?: Partial<Notification>) => {
    if (globalNotificationAPI) {
      return globalNotificationAPI.cardAdded(cardName, options);
    }
    logger.warn('GlobalNotifications: NotificationProvider not initialized');
    return -1;
  },
  pokemonFound: (pokemonName: string, options?: Partial<Notification>) => {
    if (globalNotificationAPI) {
      return globalNotificationAPI.pokemonFound(pokemonName, options);
    }
    logger.warn('GlobalNotifications: NotificationProvider not initialized');
    return -1;
  },
  priceAlert: (cardName: string, oldPrice: number, newPrice: number, options?: Partial<Notification>) => {
    if (globalNotificationAPI) {
      return globalNotificationAPI.priceAlert(cardName, oldPrice, newPrice, options);
    }
    logger.warn('GlobalNotifications: NotificationProvider not initialized');
    return -1;
  }
};

// Re-export types for convenience
export type { Notification, NotificationType, NotificationAction, NotifyHelpers };