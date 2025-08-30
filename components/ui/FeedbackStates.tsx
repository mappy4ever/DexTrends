import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { semanticColors } from '@/utils/darkModeColorSystem';
import { componentFocus } from '@/utils/focusStateSystem';
import { hoverEffects, feedbackAnimations } from '@/utils/microInteractionSystem';

// Icon components
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Error State Component
export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}> = ({ 
  title = "Something went wrong", 
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <motion.div
        animate={{ x: [0, -10, 10, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
        className="w-16 h-16 mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center"
      >
        <ErrorIcon />
      </motion.div>
      
      <h3 className={cn(
        "text-lg font-semibold mb-2",
        semanticColors.text.primary
      )}>
        {title}
      </h3>
      
      <p className={cn(
        "text-sm mb-6 max-w-sm",
        semanticColors.text.secondary
      )}>
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            "px-6 py-2 rounded-lg font-medium",
            "bg-red-600 hover:bg-red-700 text-white",
            "transition-colors duration-200",
            componentFocus.button,
            hoverEffects.scaleSmall
          )}
        >
          Try Again
        </button>
      )}
    </motion.div>
  );
};

// Success State Component
export const SuccessState: React.FC<{
  title?: string;
  message?: string;
  onContinue?: () => void;
  autoHide?: boolean;
  duration?: number;
  className?: string;
}> = ({ 
  title = "Success!", 
  message = "Operation completed successfully.",
  onContinue,
  autoHide = false,
  duration = 3000,
  className 
}) => {
  React.useEffect(() => {
    if (autoHide && onContinue) {
      const timer = setTimeout(onContinue, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoHide, duration, onContinue]);

  return (
    <motion.div
      initial={feedbackAnimations.success.initial}
      animate={feedbackAnimations.success.animate}
      transition={feedbackAnimations.success.transition}
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <div className="w-16 h-16 mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
        <CheckIcon />
      </div>
      
      <h3 className={cn(
        "text-lg font-semibold mb-2",
        semanticColors.text.primary
      )}>
        {title}
      </h3>
      
      <p className={cn(
        "text-sm mb-6 max-w-sm",
        semanticColors.text.secondary
      )}>
        {message}
      </p>
      
      {onContinue && !autoHide && (
        <button
          onClick={onContinue}
          className={cn(
            "px-6 py-2 rounded-lg font-medium",
            "bg-green-600 hover:bg-green-700 text-white",
            "transition-colors duration-200",
            componentFocus.button,
            hoverEffects.scaleSmall
          )}
        >
          Continue
        </button>
      )}
    </motion.div>
  );
};

// Loading State Component
export const LoadingState: React.FC<{
  message?: string;
  className?: string;
}> = ({ message = "Loading...", className }) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8",
      className
    )}>
      <div className="w-12 h-12 mb-4 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin" />
      <p className={cn(
        "text-sm",
        semanticColors.text.secondary
      )}>
        {message}
      </p>
    </div>
  );
};

// Empty State Component
export const EmptyState: React.FC<{
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}> = ({ 
  title = "No data found", 
  message = "There's nothing to display here yet.",
  icon,
  action,
  className 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      {icon || (
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      
      <h3 className={cn(
        "text-lg font-semibold mb-2",
        semanticColors.text.primary
      )}>
        {title}
      </h3>
      
      <p className={cn(
        "text-sm mb-6 max-w-sm",
        semanticColors.text.secondary
      )}>
        {message}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "px-6 py-2 rounded-lg font-medium",
            semanticColors.component.buttonPrimary,
            "text-white",
            "transition-colors duration-200",
            componentFocus.button,
            hoverEffects.scaleSmall
          )}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};

// Toast Notification Component
export const Toast: React.FC<{
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isVisible: boolean;
  onClose?: () => void;
  autoHide?: boolean;
  duration?: number;
  position?: 'top' | 'bottom';
}> = ({ 
  type, 
  message, 
  isVisible, 
  onClose,
  autoHide = true,
  duration = 3000,
  position = 'bottom'
}) => {
  React.useEffect(() => {
    if (autoHide && isVisible && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoHide, duration, isVisible, onClose]);

  const icons = {
    success: <CheckIcon />,
    error: <ErrorIcon />,
    warning: <WarningIcon />,
    info: <InfoIcon />
  };

  const colors = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-600 text-white'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
          className={cn(
            "fixed z-50 left-1/2 transform -translate-x-1/2",
            position === 'top' ? 'top-4' : 'bottom-4',
            "px-4 py-3 rounded-lg shadow-lg",
            "flex items-center gap-3",
            "min-w-[300px] max-w-[500px]",
            colors[type]
          )}
        >
          <span className="flex-shrink-0">{icons[type]}</span>
          <p className="flex-1 text-sm font-medium">{message}</p>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-4 hover:opacity-80 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Inline Error Message Component
export const InlineError: React.FC<{
  message: string;
  className?: string;
}> = ({ message, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "text-sm text-red-600 dark:text-red-400 mt-1",
        className
      )}
    >
      {message}
    </motion.div>
  );
};

// Inline Success Message Component
export const InlineSuccess: React.FC<{
  message: string;
  className?: string;
}> = ({ message, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "text-sm text-green-600 dark:text-green-400 mt-1",
        className
      )}
    >
      {message}
    </motion.div>
  );
};