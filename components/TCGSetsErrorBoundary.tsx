import React, { ReactNode, ErrorInfo } from 'react';
import Router from 'next/router';
import logger from '@/utils/logger';

interface TCGSetsErrorBoundaryProps {
  children: ReactNode;
}

interface TCGSetsErrorBoundaryState {
  hasError: boolean;
  errorInfo: ErrorInfo | null;
}

class TCGSetsErrorBoundary extends React.Component<TCGSetsErrorBoundaryProps, TCGSetsErrorBoundaryState> {
  constructor(props: TCGSetsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(_error: Error): Partial<TCGSetsErrorBoundaryState> {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('TCGSets Error:', { error, errorInfo });
    this.setState({
      errorInfo: errorInfo
    });
  }

  handleReset(): void {
    this.setState({ hasError: false, errorInfo: null });
    // Force a page reload to clear any module state
    Router.reload();
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
          <div className="max-w-md w-full p-6 bg-white dark:bg-stone-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              We encountered an error loading the TCG sets. This might be due to a temporary issue.
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-md hover:bg-stone-300 dark:hover:bg-stone-600 transition"
              >
                Go Back
              </button>
            </div>
            {this.state.errorInfo && (
              <details className="mt-6" open>
                <summary className="cursor-pointer text-sm text-stone-500 dark:text-stone-400">
                  Error Details (for debugging)
                </summary>
                <pre className="mt-2 text-xs overflow-auto bg-stone-100 dark:bg-stone-900 p-2 rounded max-h-48">
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

export default TCGSetsErrorBoundary;