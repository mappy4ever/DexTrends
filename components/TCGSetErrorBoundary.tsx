import React, { Component, ReactNode } from 'react';
import { Container } from './ui/Container';
import Button from '@/components/ui/Button';
import logger from '../utils/logger';

// GradientButton is just Button with gradient prop
const GradientButton = (props: React.ComponentProps<typeof Button>) => (
  <Button {...props} gradient />
);

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class TCGSetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('[TCGSetErrorBoundary] Component error caught:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      errorBoundary: 'TCGSetErrorBoundary'
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
          <Container variant="colored" className="text-center max-w-2xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading TCG Set</h2>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              An error occurred while loading this TCG set. This might be due to a navigation issue or invalid set data.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-4 p-4 bg-stone-100 dark:bg-stone-800 rounded-lg">
                <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                <pre className="text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex gap-4 justify-center">
              <GradientButton 
                onClick={() => window.location.href = '/tcgexpansions'}
                variant="primary"
                size="md"
              >
                Back to Sets
              </GradientButton>
              
              <GradientButton 
                onClick={() => window.location.reload()}
                variant="secondary"
                size="md"
              >
                Try Again
              </GradientButton>
            </div>
          </Container>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TCGSetErrorBoundary;