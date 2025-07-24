// Initialize global notification functions
// Separated from React components to avoid Fast Refresh issues

import { NotificationType } from './notificationTypes';

interface NotificationOptions {
  description?: string;
  duration?: number;
}

// This function should be called once after NotificationProvider is mounted
export function initializeGlobalNotifications(
  addNotification: (notification: any) => string | number
) {
  // Legacy window.showNotification for backwards compatibility
  if (typeof window !== 'undefined') {
    (window as any).showNotification = (
      type: string, 
      message: string, 
      options?: NotificationOptions
    ) => {
      addNotification({ 
        type: type.toUpperCase() as NotificationType,
        title: options?.description || message,
        message: options?.description ? message : '',
        duration: options?.duration 
      });
    };
  }
}

// Cleanup function to remove global mutations
export function cleanupGlobalNotifications() {
  if (typeof window !== 'undefined' && 'showNotification' in window) {
    delete (window as any).showNotification;
  }
}