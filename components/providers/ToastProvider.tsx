import React, { createContext, useContext, ReactNode } from 'react';
import { ToastContainer, ToastType } from '../ui/Toast';
import { useToast as useToastHook, ToastOptions } from '../../hooks/useNotifications';
import { NotificationType, Notification } from '../../utils/notificationTypes';
import logger from '../../utils/logger';

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: unknown) => string);
    },
    options?: Omit<ToastOptions, 'type'>
  ) => Promise<T>;
}

// Helper function to convert toast options to notification options
const convertToastOptions = (options?: ToastOptions) => {
  if (!options) return {};
  
  const { type, ...rest } = options;
  let convertedType: NotificationType | undefined;
  
  if (type) {
    switch (type) {
      case 'success':
        convertedType = 'SUCCESS';
        break;
      case 'error':
        convertedType = 'ERROR';
        break;
      case 'warning':
        convertedType = 'WARNING';
        break;
      case 'info':
        convertedType = 'INFO';
        break;
      default:
        convertedType = 'INFO';
    }
  }
  
  return {
    ...rest,
    ...(convertedType && { type: convertedType })
  };
};

// Helper function to convert notifications to toasts for the ToastContainer
const convertNotificationsToToasts = (notifications: Notification[]) => {
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

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const toastMethods = useToastHook();
  const { toasts, removeToast } = toastMethods;

  // Create a compatible context value by mapping the methods to match ToastContextValue interface
  const contextValue: ToastContextValue = {
    showToast: (message: string, options?: ToastOptions) => {
      return toastMethods.showToast(message, convertToastOptions(options)).toString();
    },
    removeToast: (id: string) => toastMethods.removeToast(id),
    clearToasts: toastMethods.clearToasts,
    success: (message: string, options?: Omit<ToastOptions, 'type'>) => {
      return toastMethods.success(message, convertToastOptions(options)).toString();
    },
    error: (message: string, options?: Omit<ToastOptions, 'type'>) => {
      return toastMethods.error(message, convertToastOptions(options)).toString();
    },
    info: (message: string, options?: Omit<ToastOptions, 'type'>) => {
      return toastMethods.info(message, convertToastOptions(options)).toString();
    },
    warning: (message: string, options?: Omit<ToastOptions, 'type'>) => {
      return toastMethods.warning(message, convertToastOptions(options)).toString();
    },
    promise: toastMethods.promise
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={convertNotificationsToToasts(toasts)} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  // Always call useContext first (React Hooks rule - must be called unconditionally)
  const context = useContext(ToastContext);
  
  // Handle SSR - return mock implementation on server
  if (typeof window === 'undefined') {
    const noop = () => Date.now().toString();
    const noopPromise = <T,>(promise: Promise<T>) => promise;
    
    return {
      showToast: noop,
      removeToast: () => {},
      clearToasts: () => {},
      success: noop,
      error: noop,
      info: noop,
      warning: noop,
      promise: noopPromise
    };
  }
  if (!context) {
    logger.warn('useToast called outside of ToastProvider, returning mock implementation');
    const noop = () => Date.now().toString();
    const noopPromise = <T,>(promise: Promise<T>) => promise;
    
    return {
      showToast: noop,
      removeToast: () => {},
      clearToasts: () => {},
      success: noop,
      error: noop,
      info: noop,
      warning: noop,
      promise: noopPromise
    };
  }
  return context;
};