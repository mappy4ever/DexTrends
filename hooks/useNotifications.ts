import { useContext } from 'react';
import { NotificationContext } from '../components/qol/NotificationSystem';
import type { Notification, NotifyHelpers } from '../utils/notificationTypes';

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Partial<Notification>) => string | number;
  dismissNotification: (id: string | number) => void;
  clearAllNotifications: () => void;
  notify: NotifyHelpers;
}

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};