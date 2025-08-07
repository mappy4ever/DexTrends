// components/ErrorBoundary.tsx
import React, { Component, ReactNode, ErrorInfo } from 'react';
import Router from 'next/router';
import logger, { reportError } from '../../utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component that catches JavaScript errors anywhere in the child component tree
 * Logs errors and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // Method to reset error boundary state
  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> | null {
    // Don't catch chunk loading errors - let Next.js handle them
    const errorMessage = error.message || '';
    if (errorMessage.includes('Loading chunk') || 
        errorMessage.includes('Failed to fetch dynamically imported module') ||
        errorMessage.includes('Cannot find module') ||
        errorMessage.includes('Failed to import') ||
        errorMessage.includes('Unable to preload CSS')) {
      // Return null to not update state - let error propagate
      logger.debug('Chunk/module loading error detected, letting Next.js handle it:', { errorMessage });
      return null;
    }
    
    // Only catch true runtime errors
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error using production-safe logger
    reportError(error, { errorInfo, componentStack: errorInfo.componentStack });
    this.setState({ errorInfo });
    // In production, you would send this to an error reporting service
    // Example: logErrorToMyService(error, errorInfo);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600">We're sorry for the inconvenience. Please try refreshing the page.</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Reset state before reload to ensure clean refresh
                  this.resetErrorBoundary();
                  Router.reload();
                }}
                className="w-full px-6 py-3 bg-pokemon-red text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  try {
                    // First, reset the error boundary state
                    this.resetErrorBoundary();
                    
                    // Use requestAnimationFrame to ensure React has processed the state update
                    requestAnimationFrame(() => {
                      // Use window.location for reliable navigation in error states
                      window.location.href = '/';
                    });
                  } catch (navError) {
                    // If navigation fails, at least try to force reload
                    logger.error('Navigation failed:', { navError });
                    window.location.reload();
                  }
                }}
                className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go to Homepage
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-8 text-left bg-gray-100 p-4 rounded-lg">
                <summary className="cursor-pointer font-semibold text-gray-700">Error Details</summary>
                <pre className="mt-2 text-xs overflow-x-auto whitespace-pre-wrap text-red-600">
                  {this.state.error && this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;