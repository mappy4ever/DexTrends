import React, { Component, ReactNode, ErrorInfo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logger from '@/utils/logger';
import { cn } from '@/utils/cn';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Production-ready Error Boundary
 * 
 * Features:
 * - Graceful error handling at different levels
 * - Automatic error recovery
 * - Error logging to monitoring service
 * - User-friendly error messages
 * - Reset capability
 */
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private previousResetKeys: Array<string | number> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    const { errorCount } = this.state;

    // Log error with context
    logger.error(`Error Boundary Caught [${level}]`, {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      errorCount: errorCount + 1,
      level,
      url: typeof window !== 'undefined' ? window.location.href : 'SSR'
    });

    // Update state
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Auto-reset after 3 errors (prevent infinite loops)
    if (errorCount >= 2) {
      this.scheduleReset(5000);
    }
  }

  override componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    // Reset on prop changes if enabled
    if (resetOnPropsChange && hasError && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
    
    // Reset if resetKeys changed
    if (resetKeys && this.previousResetKeys.join(',') !== resetKeys.join(',')) {
      this.previousResetKeys = resetKeys;
      if (hasError) {
        this.resetErrorBoundary();
      }
    }
  }

  override componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  scheduleReset = (delay: number) => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.resetTimeoutId = setTimeout(() => {
      this.resetErrorBoundary();
    }, delay);
  };

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    });
  };

  override render() {
    const { hasError, error, errorCount } = this.state;
    const { children, fallback, isolate = true, level = 'component' } = this.props;

    if (hasError && error) {
      // Custom fallback
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI based on level
      return (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'flex flex-col items-center justify-center',
              level === 'page' && 'min-h-screen',
              level === 'section' && 'min-h-[400px] py-12',
              level === 'component' && 'py-8',
              isolate && 'relative overflow-hidden'
            )}
          >
            <div className="text-center px-4 max-w-md mx-auto">
              {/* Error Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="mb-6"
              >
                <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-10 h-10 text-red-600 dark:text-red-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
              </motion.div>

              {/* Error Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {level === 'page' ? 'Page Error' : 'Something went wrong'}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {process.env.NODE_ENV === 'development' ? (
                    <span className="font-mono text-sm">{error.message}</span>
                  ) : (
                    'An unexpected error occurred. Please try again.'
                  )}
                </p>

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={this.resetErrorBoundary}
                    className={cn(
                      'px-4 py-2 rounded-lg font-medium transition-all',
                      'bg-gradient-to-r from-purple-500 to-pink-500',
                      'text-white shadow-lg hover:shadow-xl',
                      'hover:scale-105 active:scale-95'
                    )}
                  >
                    Try Again
                  </button>
                  
                  {level === 'page' && (
                    <button
                      onClick={() => window.location.href = '/'}
                      className={cn(
                        'px-4 py-2 rounded-lg font-medium transition-all',
                        'bg-gray-200 dark:bg-gray-700',
                        'text-gray-700 dark:text-gray-300',
                        'hover:bg-gray-300 dark:hover:bg-gray-600'
                      )}
                    >
                      Go Home
                    </button>
                  )}
                </div>

                {/* Error count warning */}
                {errorCount > 1 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-xs text-amber-600 dark:text-amber-400"
                  >
                    This error has occurred {errorCount} times. 
                    {errorCount >= 3 && ' Auto-reset in 5 seconds...'}
                  </motion.p>
                )}
              </motion.div>

              {/* Development Mode - Stack Trace */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <motion.details
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 text-left"
                >
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Show Details
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </motion.details>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }

    return children;
  }
}

/**
 * Hook for error handling in functional components
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    logger.error('Error caught by useErrorHandler', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo
    });
    
    // Could trigger global error state here
    // or send to monitoring service
  };
}

// Async Error Boundary for Suspense
export function AsyncErrorBoundary({ 
  children, 
  ...props 
}: Props) {
  return (
    <ErrorBoundary {...props}>
      <React.Suspense fallback={<LoadingFallback />}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
    </div>
  );
}