import React, { ReactNode, ErrorInfo } from 'react';
import Router from 'next/router';

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
    console.error('TCGSets Error:', error, errorInfo);
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an error loading the TCG sets. This might be due to a temporary issue.
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Go Back
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs overflow-auto bg-gray-100 dark:bg-gray-900 p-2 rounded">
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