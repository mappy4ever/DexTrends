import { ToastType } from '../components/ui/Toast';
import { Notification } from './notificationTypes';

/**
 * Converts Notification objects to Toast objects for compatibility
 * with the ToastContainer component.
 */
export const convertNotificationsToToasts = (notifications: Notification[]) => {
  return notifications.map(notification => {
    let toastType: ToastType = 'info';
    
    switch (notification.type) {
      case 'SUCCESS':
        toastType = 'success';
        break;
      case 'ERROR':
        toastType = 'error';
        break;
      case 'WARNING':
        toastType = 'warning';
        break;
      case 'INFO':
      default:
        toastType = 'info';
        break;
    }
    
    return {
      id: notification.id.toString(),
      message: notification.message,
      type: toastType,
      duration: notification.duration || undefined,
      position: notification.position
    };
  });
};