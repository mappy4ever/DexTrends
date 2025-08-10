import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useErrorHandler } from './PageErrorBoundary.hooks';
import { useRouter } from 'next/router';
import logger from '@/utils/logger';
import errorTracking from '@/utils/errorTracking';

interface Props {
  children: ReactNode;
  fallbackComponent?: React.ComponentType<{ error: Error; resetError: () => void }>;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Router-aware wrapper component
const RouterAwareErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
  const router = useRouter();
  
  const handleGoHome = () => {
    router.push('/');
  };
  
  return (
    <DefaultErrorFallbackContent 
      error={error} 
      resetError={resetError}
      onGoHome={handleGoHome}
    />
  );
};

// Default error fallback component (no hooks)
const DefaultErrorFallbackContent = ({ 
  error, 
  resetError, 
  onGoHome 
}: { 
  error: Error; 
  resetError: () => void;
  onGoHome: () => void;
}) => {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We encountered an unexpected error. The issue has been logged and we'll look into it.
        </p>
        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onGoHome}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors"
          >
            Go to Homepage
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      logger.error('Page Error Boundary caught an error', { error, errorInfo });
    }
    
    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service (Sentry or custom)
      errorTracking.captureException(error, {
        pageName: this.props.pageName || 'Unknown Page',
        componentStack: errorInfo.componentStack || undefined,
        extra: {
          props: this.props
        }
      });
    }

    this.setState({
      error,
      errorInfo
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallbackComponent || RouterAwareErrorFallback;
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Hook to use with the error boundary

export default PageErrorBoundary;