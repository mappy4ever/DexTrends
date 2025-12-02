import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '../ui';
import logger from '../../utils/logger';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentName?: string;
}

function ErrorFallback({ error, resetErrorBoundary, componentName }: ErrorFallbackProps) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😵</div>
        <h3 className="text-lg font-semibold mb-2 text-stone-900 dark:text-stone-100">
          Something went wrong{componentName ? ` in ${componentName}` : ''}
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-300 mb-4">
          We encountered an unexpected error. Please try again.
        </p>
        <Button 
          onClick={resetErrorBoundary}
          className="bg-primary text-white hover:bg-primary-dark"
        >
          Try Again
        </Button>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs text-stone-500">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs bg-stone-100 dark:bg-stone-800 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

interface StandardErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export default function StandardErrorBoundary({ 
  children, 
  componentName,
  fallback: CustomFallback,
  onError
}: StandardErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error for monitoring
    logger.error(`Error in ${componentName || 'component'}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    // Call custom error handler if provided
    onError?.(error, errorInfo);
  };

  const FallbackComponent = CustomFallback || ErrorFallback;

  return (
    <ErrorBoundary
      FallbackComponent={(props) => (
        <FallbackComponent {...props} componentName={componentName} />
      )}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}