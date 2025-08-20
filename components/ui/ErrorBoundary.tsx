import React, { Component, ReactNode, ErrorInfo } from 'react';
import { useRouter } from 'next/router';
import logger, { reportError } from '@/utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * Enhanced error boundary component with glass morphism design
 * Provides comprehensive error handling with different error states and recovery options
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  // Generate unique error ID for tracking
  private generateErrorId(): string {
    return `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Method to reset error boundary state
  resetErrorBoundary = (): void => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> | null {
    // Don't catch chunk loading errors - let Next.js handle them
    const errorMessage = error.message || '';
    if (errorMessage.includes('Loading chunk') || 
        errorMessage.includes('Failed to fetch dynamically imported module') ||
        errorMessage.includes('Cannot find module') ||
        errorMessage.includes('Failed to import') ||
        errorMessage.includes('Unable to preload CSS')) {
      logger.debug('Chunk/module loading error detected, letting Next.js handle it:', { errorMessage });
      return null;
    }
    
    // Only catch true runtime errors
    return { 
      hasError: true, 
      error,
      errorId: `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorId = this.generateErrorId();
    const context = {
      errorInfo,
      componentStack: errorInfo.componentStack,
      context: this.props.context,
      errorId,
      timestamp: new Date().toISOString()
    };

    // Log error using production-safe logger
    reportError(error, context);
    
    this.setState({ errorInfo, errorId });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private getErrorType(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'notfound';
    }
    if (message.includes('unauthorized') || message.includes('403')) {
      return 'unauthorized';
    }
    if (message.includes('server') || message.includes('500')) {
      return 'server';
    }
    
    return 'unknown';
  }

  private getErrorContent(errorType: string): { title: string; message: string; icon: string } {
    switch (errorType) {
      case 'network':
        return {
          title: 'Connection Error',
          message: 'Unable to connect to our servers. Please check your internet connection and try again.',
          icon: '🌐'
        };
      case 'notfound':
        return {
          title: 'Content Not Found',
          message: 'The content you\'re looking for could not be found. It may have been moved or deleted.',
          icon: '🔍'
        };
      case 'unauthorized':
        return {
          title: 'Access Denied',
          message: 'You don\'t have permission to access this content. Please try signing in again.',
          icon: '🔒'
        };
      case 'server':
        return {
          title: 'Server Error',
          message: 'Our servers are experiencing issues. Please try again in a few moments.',
          icon: '⚠️'
        };
      default:
        return {
          title: 'Something went wrong',
          message: 'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.',
          icon: '❌'
        };
    }
  }

  override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorType = this.getErrorType(this.state.error);
      const { title, message, icon } = this.getErrorContent(errorType);

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="w-full max-w-md">
            {/* Glass morphism error container */}
            <div className="glass-medium rounded-2xl p-8 shadow-xl border border-white/20 backdrop-blur-md">
              {/* Error icon */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4 animate-pulse">{icon}</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
                <p className="text-gray-600 leading-relaxed">{message}</p>
              </div>

              {/* Error ID for support */}
              {this.state.errorId && (
                <div className="mb-6 p-3 bg-gray-50/50 rounded-lg">
                  <p className="text-xs text-gray-500">
                    Error ID: <code className="font-mono">{this.state.errorId}</code>
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    this.resetErrorBoundary();
                    window.location.reload();
                  }}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Retry
                </button>
                
                <button
                  onClick={() => {
                    this.resetErrorBoundary();
                    window.location.href = '/';
                  }}
                  className="w-full px-6 py-3 bg-white/70 text-gray-700 rounded-xl hover:bg-white/90 transition-all duration-200 font-medium border border-gray-200/50 backdrop-blur-sm"
                >
                  Go Home
                </button>

                {errorType === 'network' && (
                  <button
                    onClick={() => {
                      this.resetErrorBoundary();
                      // Force reload without cache
                      window.location.reload();
                    }}
                    className="w-full px-6 py-3 bg-green-50/70 text-green-700 rounded-xl hover:bg-green-100/70 transition-all duration-200 font-medium border border-green-200/50"
                  >
                    Check Connection
                  </button>
                )}
              </div>

              {/* Development error details */}
              {process.env.NODE_ENV === 'development' && this.props.showDetails !== false && this.state.errorInfo && (
                <details className="mt-6 bg-red-50/50 rounded-lg p-4">
                  <summary className="cursor-pointer font-semibold text-red-700 mb-2">
                    Development Error Details
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-red-600 mb-1">Error:</p>
                      <pre className="text-xs bg-red-100/50 p-2 rounded overflow-x-auto whitespace-pre-wrap text-red-800">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-600 mb-1">Component Stack:</p>
                      <pre className="text-xs bg-red-100/50 p-2 rounded overflow-x-auto whitespace-pre-wrap text-red-800">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}
            </div>

            {/* Additional help text */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Need help? Contact our support team with the error ID above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based wrapper for functional components
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  context?: string;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = (props) => {
  return <ErrorBoundary {...props} />;
};

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ErrorBoundary;