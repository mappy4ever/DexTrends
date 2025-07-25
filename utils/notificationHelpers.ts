/**
 * Notification Helper Utilities
 * Demonstrates usage of the global notification API from outside React components
 */

import { GlobalNotifications } from './globalNotifications';

/**
 * Show success notification for API operations
 */
export const notifyApiSuccess = (operation: string, resource: string) => {
  GlobalNotifications.success(`${operation} ${resource} successfully! ✅`);
};

/**
 * Show error notification for API failures
 */
export const notifyApiError = (operation: string, resource: string, error?: string) => {
  const message = error 
    ? `Failed to ${operation.toLowerCase()} ${resource}: ${error}`
    : `Failed to ${operation.toLowerCase()} ${resource}`;
  
  GlobalNotifications.error(message, { persistent: true });
};

/**
 * Show loading notification that can be dismissed later
 */
export const notifyLoading = (message: string) => {
  return GlobalNotifications.loading(message);
};

/**
 * Show card interaction notifications
 */
export const notifyCardInteraction = (action: string, cardName: string) => {
  switch (action) {
    case 'favorite':
      GlobalNotifications.cardAdded(cardName);
      break;
    case 'unfavorite':
      GlobalNotifications.info(`Removed ${cardName} from favorites`);
      break;
    case 'share':
      GlobalNotifications.success(`Shared ${cardName}! 📤`);
      break;
    default:
      GlobalNotifications.info(`${action} ${cardName}`);
  }
};

/**
 * Network status notifications
 */
export const notifyNetworkStatus = (isOnline: boolean) => {
  if (isOnline) {
    GlobalNotifications.success('Connection restored! 🌐');
  } else {
    GlobalNotifications.warning('You are offline. Some features may be limited.', {
      persistent: true
    });
  }
};

/**
 * Price alert notifications
 */
export const notifyPriceChange = (cardName: string, oldPrice: number, newPrice: number) => {
  const change = newPrice > oldPrice ? 'increased' : 'decreased';
  const emoji = newPrice > oldPrice ? '📈' : '📉';
  
  GlobalNotifications.warning(
    `${cardName} price ${change} ${emoji}`,
    {
      title: `$${oldPrice.toFixed(2)} → $${newPrice.toFixed(2)}`,
      persistent: true
    }
  );
};

export default {
  notifyApiSuccess,
  notifyApiError,
  notifyLoading,
  notifyCardInteraction,
  notifyNetworkStatus,
  notifyPriceChange
};