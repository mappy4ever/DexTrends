import React from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';
import { FiAlertCircle, FiRefreshCw, FiWifi, FiServer, FiAlertTriangle } from 'react-icons/fi';

export type ErrorType = 'generic' | 'network' | 'server' | 'notFound' | 'permission';

export interface ErrorStateProps {
  /** Error type determines icon and default messaging */
  type?: ErrorType;
  /** Custom title (overrides type default) */
  title?: string;
  /** Custom message (overrides type default) */
  message?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Custom retry button text */
  retryText?: string;
  /** Show retry button */
  showRetry?: boolean;
  /** Additional action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
  /** Inline mode (no background container) */
  inline?: boolean;
}

/**
 * ErrorState - Consistent error display with retry functionality
 *
 * Uses design tokens for responsive styling and animations.
 *
 * @example
 * <ErrorState
 *   type="network"
 *   onRetry={() => refetch()}
 * />
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'generic',
  title,
  message,
  onRetry,
  retryText = 'Try Again',
  showRetry = true,
  secondaryAction,
  size = 'md',
  className,
  inline = false,
}) => {
  // Error type configurations
  const typeConfigs = {
    generic: {
      icon: FiAlertCircle,
      iconColor: 'text-red-500',
      title: 'Something went wrong',
      message: 'An unexpected error occurred. Please try again.',
    },
    network: {
      icon: FiWifi,
      iconColor: 'text-orange-500',
      title: 'Connection Error',
      message: 'Please check your internet connection and try again.',
    },
    server: {
      icon: FiServer,
      iconColor: 'text-red-600',
      title: 'Server Error',
      message: 'Our servers are having trouble. Please try again later.',
    },
    notFound: {
      icon: FiAlertTriangle,
      iconColor: 'text-yellow-500',
      title: 'Not Found',
      message: 'The requested content could not be found.',
    },
    permission: {
      icon: FiAlertCircle,
      iconColor: 'text-purple-500',
      title: 'Access Denied',
      message: 'You don\'t have permission to view this content.',
    },
  };

  const config = typeConfigs[type];
  const Icon = config.icon;
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  // Size-based styles
  const sizeStyles = {
    sm: {
      container: 'p-4',
      icon: 'w-8 h-8',
      title: 'text-[var(--text-base)] font-semibold',
      message: 'text-[var(--text-sm)]',
      spacing: 'gap-3',
    },
    md: {
      container: 'p-6',
      icon: 'w-12 h-12',
      title: 'text-[var(--text-lg)] font-bold',
      message: 'text-[var(--text-base)]',
      spacing: 'gap-4',
    },
    lg: {
      container: 'p-8',
      icon: 'w-16 h-16',
      title: 'text-[var(--text-xl)] font-bold',
      message: 'text-[var(--text-lg)]',
      spacing: 'gap-5',
    },
  };

  const styles = sizeStyles[size];

  const content = (
    <div className={cn('flex flex-col items-center text-center', styles.spacing)}>
      {/* Icon */}
      <div className={cn(
        'rounded-full p-3',
        'bg-[var(--glass-bg-light)]',
        'border border-white/20 dark:border-white/10'
      )}>
        <Icon className={cn(styles.icon, config.iconColor)} />
      </div>

      {/* Text content */}
      <div className="space-y-1">
        <h3 className={cn(styles.title, 'text-gray-900 dark:text-white')}>
          {displayTitle}
        </h3>
        <p className={cn(styles.message, 'text-gray-600 dark:text-gray-400 max-w-sm')}>
          {displayMessage}
        </p>
      </div>

      {/* Actions */}
      {(showRetry && onRetry) || secondaryAction ? (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              variant="primary"
              size={size === 'sm' ? 'sm' : 'md'}
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              {retryText}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="secondary"
              size={size === 'sm' ? 'sm' : 'md'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );

  if (inline) {
    return (
      <div className={cn('py-4', className)}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        styles.container,
        'rounded-xl',
        'bg-[var(--glass-bg-medium)] backdrop-blur-[var(--glass-blur-medium)]',
        'border border-white/30 dark:border-white/15',
        'shadow-[var(--shadow-md)]',
        className
      )}
    >
      {content}
    </div>
  );
};

export default ErrorState;
