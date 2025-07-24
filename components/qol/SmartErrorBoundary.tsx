import React, { ReactNode } from 'react';
import Router from 'next/router';
import logger from '../../utils/logger';

// Type definitions
interface SmartErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface SmartErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Smart error boundary class component
export class SmartErrorBoundary extends React.Component<SmartErrorBoundaryProps, SmartErrorBoundaryState> {
  constructor(props: SmartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): SmartErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error boundary caught error', { error, errorInfo });
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We're sorry, but an unexpected error occurred. Don't worry, your data is safe!
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={() => Router.reload()}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">

                  Refresh Page
                </button>
                
                <button
                  onClick={() => window.history.back()}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">

                  Go Back
                </button>
              </div>
              
              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
                    Technical Details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-800 dark:text-gray-200 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SmartErrorBoundary;