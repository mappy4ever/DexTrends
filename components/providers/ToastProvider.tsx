import React, { createContext, useContext, ReactNode } from 'react';
import { ToastContainer } from '../ui/Toast';
import { useToast as useToastHook, ToastOptions } from '../../hooks/useToast';

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
      error?: string | ((error: any) => string);
    },
    options?: Omit<ToastOptions, 'type'>
  ) => Promise<T>;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const toastMethods = useToastHook();
  const { toasts, removeToast } = toastMethods;

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};