import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { notificationSlide } from '@/utils/animations';
import logger from '@/utils/logger';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  closable?: boolean;
  icon?: React.ReactNode;
  timestamp: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Notification Provider
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration ?? 5000,
      closable: notification.closable ?? true
    };

    setNotifications(prev => [...prev, newNotification]);
    
    // Log notification
    logger.info('Notification shown', {
      type: notification.type,
      title: notification.title
    });

    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, [removeNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification, clearAll }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notifications
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

/**
 * Notification Container
 */
function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div 
      className={cn(
        'fixed z-50 pointer-events-none',
        isMobile ? 'bottom-0 left-0 right-0 p-4' : 'top-4 right-4'
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="sync">
        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
            style={{
              marginBottom: isMobile ? 0 : index * 10,
              zIndex: notifications.length - index
            }}
            isMobile={isMobile}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual Notification
 */
function NotificationItem({ 
  notification, 
  onClose, 
  style,
  isMobile 
}: { 
  notification: Notification; 
  onClose: () => void;
  style?: React.CSSProperties;
  isMobile: boolean;
}) {
  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  const colors = {
    success: 'from-green-500 to-emerald-500',
    error: 'from-red-500 to-rose-500',
    warning: 'from-amber-500 to-yellow-500',
    info: 'from-blue-500 to-cyan-500'
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500'
  };

  return (
    <motion.div
      layout
      initial="initial"
      animate="animate"
      exit="exit"
      variants={isMobile ? {
        initial: { y: 100, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: 100, opacity: 0 }
      } : notificationSlide}
      style={style}
      className={cn(
        'pointer-events-auto mb-3',
        isMobile && 'w-full'
      )}
    >
      <div className={cn(
        'relative overflow-hidden rounded-xl shadow-xl',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'max-w-sm w-full',
        isMobile && 'mx-auto'
      )}>
        {/* Gradient accent bar */}
        <div className={cn(
          'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
          colors[notification.type]
        )} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn(
              'flex-shrink-0 p-2 rounded-full',
              'bg-gray-100 dark:bg-gray-700',
              iconColors[notification.type]
            )}>
              {notification.icon || icons[notification.type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {notification.title}
              </h3>
              {notification.message && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {notification.message}
                </p>
              )}
              
              {/* Action button */}
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className={cn(
                    'mt-2 text-sm font-medium',
                    'text-purple-600 dark:text-purple-400',
                    'hover:text-purple-700 dark:hover:text-purple-300',
                    'transition-colors'
                  )}
                >
                  {notification.action.label}
                </button>
              )}
            </div>

            {/* Close button */}
            {notification.closable && (
              <button
                onClick={onClose}
                className={cn(
                  'flex-shrink-0 p-1 rounded-lg',
                  'text-gray-400 hover:text-gray-600',
                  'dark:text-gray-500 dark:hover:text-gray-300',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'transition-all'
                )}
                aria-label="Close notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar for auto-dismiss */}
        {notification.duration && notification.duration > 0 && (
          <motion.div
            className={cn(
              'absolute bottom-0 left-0 h-1 bg-gradient-to-r',
              colors[notification.type],
              'opacity-30'
            )}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: notification.duration / 1000, ease: 'linear' }}
          />
        )}
      </div>
    </motion.div>
  );
}

/**
 * Notification helper - use through hook
 */
export function useNotify() {
  const { showNotification, removeNotification } = useNotification();
  
  return {
    success: (title: string, message?: string, options?: Partial<Notification>) => {
      showNotification({
        type: 'success',
        title,
        message,
        ...options
      });
    },
    
    error: (title: string, message?: string, options?: Partial<Notification>) => {
      showNotification({
        type: 'error',
        title,
        message,
        duration: 0, // Errors don't auto-dismiss by default
        ...options
      });
    },
    
    warning: (title: string, message?: string, options?: Partial<Notification>) => {
      showNotification({
        type: 'warning',
        title,
        message,
        ...options
      });
    },
    
    info: (title: string, message?: string, options?: Partial<Notification>) => {
      showNotification({
        type: 'info',
        title,
        message,
        ...options
      });
    },
    
    promise: async <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      }
    ) => {
      // Show loading notification
      const loadingId = `loading-${Date.now()}`;
      showNotification({
        type: 'info',
        title: messages.loading,
        duration: 0,
        closable: false
      });
      
      try {
        const result = await promise;
        
        // Remove loading and show success
        removeNotification(loadingId);
        showNotification({
          type: 'success',
          title: typeof messages.success === 'function' 
            ? messages.success(result) 
            : messages.success
        });
        
        return result;
      } catch (error) {
        // Remove loading and show error
        removeNotification(loadingId);
        showNotification({
          type: 'error',
          title: typeof messages.error === 'function' 
            ? messages.error(error) 
            : messages.error,
          duration: 0
        });
        
        throw error;
      }
    }
  };
}