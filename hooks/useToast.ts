import { useState, useCallback } from 'react';
import { ToastType, ToastPosition } from '@/components/ui/Toast';

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  showProgress?: boolean;
}

export interface ToastItem extends ToastOptions {
  id: string;
  message: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastItem = {
      id,
      message,
      type: options?.type || 'info',
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      showProgress: options?.showProgress !== false
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) => {
    return showToast(message, { ...options, type: 'success' });
  }, [showToast]);

  const error = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) => {
    return showToast(message, { ...options, type: 'error' });
  }, [showToast]);

  const info = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) => {
    return showToast(message, { ...options, type: 'info' });
  }, [showToast]);

  const warning = useCallback((message: string, options?: Omit<ToastOptions, 'type'>) => {
    return showToast(message, { ...options, type: 'warning' });
  }, [showToast]);

  // Promise-based toast for async operations
  const promise = useCallback(
    <T,>(
      promise: Promise<T>,
      messages: {
        loading?: string;
        success?: string | ((data: T) => string);
        error?: string | ((error: any) => string);
      },
      options?: Omit<ToastOptions, 'type'>
    ): Promise<T> => {
      const loadingId = showToast(messages.loading || 'Loading...', {
        ...options,
        type: 'info',
        duration: 0 // Don't auto-dismiss
      });

      return promise
        .then((data) => {
          removeToast(loadingId);
          const successMessage = typeof messages.success === 'function' 
            ? messages.success(data) 
            : messages.success || 'Success!';
          success(successMessage, options);
          return data;
        })
        .catch((error) => {
          removeToast(loadingId);
          const errorMessage = typeof messages.error === 'function'
            ? messages.error(error)
            : messages.error || 'Something went wrong';
          showToast(errorMessage, { ...options, type: 'error' });
          throw error;
        });
    },
    [showToast, removeToast, success]
  );

  return {
    toasts,
    showToast,
    removeToast,
    clearToasts,
    success,
    error,
    info,
    warning,
    promise
  };
};