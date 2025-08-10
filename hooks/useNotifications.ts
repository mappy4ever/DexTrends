import { useContext } from 'react';
import { NotificationContext } from '../components/qol/NotificationSystem';
import type { Notification, NotifyHelpers, ToastPosition } from '../utils/notificationTypes';
import logger from '../utils/logger';

// Toast compatibility types
export interface ToastOptions {
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  position?: ToastPosition;
  showProgress?: boolean;
}

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Partial<Notification>) => string | number;
  dismissNotification: (id: string | number) => void;
  clearAllNotifications: () => void;
  notify: NotifyHelpers;
  // Convenience aliases for compatibility with useToast API
  showToast: (message: string, options?: Partial<Notification>) => string | number;
  removeToast: (id: string | number) => void;
  clearToasts: () => void;
  // Shorthand methods that match useToast API
  success: (message: string, options?: Partial<Notification>) => string | number;
  error: (message: string, options?: Partial<Notification>) => string | number;
  info: (message: string, options?: Partial<Notification>) => string | number;
  warning: (message: string, options?: Partial<Notification>) => string | number;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: Error) => string);
    },
    options?: Partial<Notification>
  ) => Promise<T>;
  // Toast-specific properties for backward compatibility
  toasts: Notification[];
}

// Mock implementation for SSR
const createMockNotificationValue = (): NotificationContextValue => {
  const noop = () => Date.now();
  const noopPromise = <T>(promise: Promise<T>) => promise;
  
  return {
    notifications: [],
    addNotification: noop,
    dismissNotification: () => {},
    clearAllNotifications: () => {},
    notify: {
      success: noop,
      error: noop,
      warning: noop,
      info: noop,
      loading: noop,
      cardAdded: noop,
      pokemonFound: noop,
      priceAlert: noop,
      promise: noopPromise
    },
    showToast: () => Date.now(), // Takes message and options but returns id
    removeToast: () => {},
    clearToasts: () => {},
    success: noop,
    error: noop,
    info: noop,
    warning: noop,
    promise: noopPromise,
    toasts: []
  };
};

export const useNotifications = (): NotificationContextValue => {
  // Handle SSR - return mock implementation on server
  if (typeof window === 'undefined') {
    return createMockNotificationValue();
  }
  
  const context = useContext(NotificationContext);
  if (!context) {
    // Return mock instead of throwing during SSR or when provider is missing
    logger.warn('useNotifications called outside of NotificationProvider, returning mock implementation');
    return createMockNotificationValue();
  }
  
  // Add convenience methods and aliases for useToast compatibility
  return {
    ...context,
    // Toast API compatibility
    showToast: (message: string, options?: Partial<Notification>) => 
      context.addNotification({ message, ...options }),
    removeToast: context.dismissNotification,
    clearToasts: context.clearAllNotifications,
    toasts: context.notifications,
    // Shorthand methods
    success: context.notify.success,
    error: context.notify.error,
    info: context.notify.info,
    warning: context.notify.warning,
    promise: context.notify.promise,
  };
};

// Export useToast as an alias for backward compatibility
export const useToast = useNotifications;