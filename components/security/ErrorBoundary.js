/**
 * Advanced Error Boundary with security-focused error handling
 * Provides fallback UI and secure error reporting
 */

import React, { Component } from 'react';
import logger, { reportError } from '../../utils/logger';

class SecurityErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      lastErrorTime: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = this.state.errorId;
    const now = Date.now();
    
    // Security-conscious error logging
    const sanitizedError = this.sanitizeError(error);
    const secureErrorInfo = this.sanitizeErrorInfo(errorInfo);
    
    // Report error with security context
    reportError(sanitizedError, {
      errorId,
      errorInfo: secureErrorInfo,
      component: this.props.name || 'Unknown Component',
      userId: this.props.userId || 'anonymous',
      sessionId: this.props.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
      props: this.sanitizeProps(this.props)
    });

    this.setState({
      errorInfo: secureErrorInfo,
      lastErrorTime: now
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(sanitizedError, secureErrorInfo, errorId);
      } catch (handlerError) {
        logger.error('Error in custom error handler', { 
          handlerError: handlerError.message,
          originalError: sanitizedError.message 
        });
      }
    }
  }

  /**
   * Sanitize error object to prevent sensitive data leakage
   */
  sanitizeError(error) {
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /key/i,
      /auth/i,
      /credential/i,
      /session/i
    ];

    let message = error.message || 'Unknown error';
    let stack = error.stack || '';

    // Remove potentially sensitive information from error message
    sensitivePatterns.forEach(pattern => {
      message = message.replace(pattern, '[REDACTED]');
      stack = stack.replace(pattern, '[REDACTED]');
    });

    // Limit stack trace length in production
    if (process.env.NODE_ENV === 'production') {
      const stackLines = stack.split('\n');
      stack = stackLines.slice(0, 10).join('\n');
    }

    return {
      name: error.name || 'Error',
      message,
      stack: process.env.NODE_ENV === 'development' ? stack : '[STACK_TRACE_HIDDEN]'
    };
  }

  /**
   * Sanitize error info to prevent sensitive data leakage
   */
  sanitizeErrorInfo(errorInfo) {
    const componentStack = errorInfo.componentStack || '';
    
    // In production, limit component stack depth
    if (process.env.NODE_ENV === 'production') {
      const stackLines = componentStack.split('\n');
      return {
        componentStack: stackLines.slice(0, 5).join('\n')
      };
    }

    return {
      componentStack
    };
  }

  /**
   * Sanitize props to prevent sensitive data leakage
   */
  sanitizeProps(props) {
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'credential',
      'session',
      'apiKey',
      'accessToken'
    ];

    const sanitized = {};
    
    Object.keys(props).forEach(key => {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));
      
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof props[key] === 'object' && props[key] !== null) {
        sanitized[key] = '[OBJECT]';
      } else if (typeof props[key] === 'function') {
        sanitized[key] = '[FUNCTION]';
      } else {
        sanitized[key] = props[key];
      }
    });

    return sanitized;
  }

  /**
   * Retry functionality with exponential backoff
   */
  handleRetry = () => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    const { retryCount, lastErrorTime } = this.state;
    
    if (retryCount >= maxRetries) {
      logger.warn('Maximum retry attempts reached', { 
        retryCount, 
        maxRetries,
        errorId: this.state.errorId 
      });
      return;
    }

    // Implement exponential backoff
    const delay = retryDelay * Math.pow(2, retryCount);
    const timeSinceLastError = Date.now() - lastErrorTime;
    
    if (timeSinceLastError < delay) {
      setTimeout(() => {
        this.retryComponent();
      }, delay - timeSinceLastError);
    } else {
      this.retryComponent();
    }
  };

  retryComponent = () => {
    logger.info('Retrying component render', { 
      retryCount: this.state.retryCount + 1,
      errorId: this.state.errorId 
    });
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  /**
   * Refresh page as last resort
   */
  handleRefresh = () => {
    logger.info('User initiated page refresh after error', { 
      errorId: this.state.errorId 
    });
    
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  /**
   * Send feedback about the error
   */
  handleFeedback = () => {
    const { onFeedback } = this.props;
    const { errorId } = this.state;
    
    if (onFeedback) {
      onFeedback(errorId);
    } else {
      // Default feedback mechanism
      logger.info('User reported error', { errorId });
    }
  };

  render() {
    if (this.state.hasError) {
      const { 
        fallback: CustomFallback,
        showErrorDetails = process.env.NODE_ENV === 'development',
        allowRetry = true,
        allowRefresh = true,
        allowFeedback = true,
        title = 'Something went wrong',
        message = 'We\'re sorry for the inconvenience. Please try again.',
        maxRetries = 3
      } = this.props;

      const { retryCount } = this.state;
      const canRetry = allowRetry && retryCount < maxRetries;

      // Use custom fallback if provided
      if (CustomFallback) {
        return (
          <CustomFallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            errorId={this.state.errorId}
            onRetry={canRetry ? this.handleRetry : null}
            onRefresh={allowRefresh ? this.handleRefresh : null}
            onFeedback={allowFeedback ? this.handleFeedback : null}
            retryCount={retryCount}
            maxRetries={maxRetries}
          />
        );
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            
            <h2 className="error-title">{title}</h2>
            <p className="error-message">{message}</p>
            
            {showErrorDetails && this.state.error && (
              <details className="error-details">
                <summary>Technical Details</summary>
                <div className="error-details-content">
                  <p><strong>Error ID:</strong> {this.state.errorId}</p>
                  <p><strong>Error:</strong> {this.state.error.message}</p>
                  {this.state.error.stack && (
                    <pre className="error-stack">
                      {this.state.error.stack}
                    </pre>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <pre className="error-component-stack">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
            
            <div className="error-actions">
              {canRetry && (
                <button
                  className="error-button error-button-primary">
                  onClick={this.handleRetry}
                >
                  Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                </button>
              )}
              
              {allowRefresh && (
                <button
                  className="error-button error-button-secondary">
                  onClick={this.handleRefresh}
                >
                  Refresh Page
                </button>
              )}
              
              {allowFeedback && (
                <button
                  className="error-button error-button-tertiary">
                  onClick={this.handleFeedback}
                >
                  Report Issue
                </button>
              )}
            </div>
            
            {!showErrorDetails && (
              <p className="error-id">
                Error ID: {this.state.errorId}
              </p>
            )}
          </div>
          
          <style jsx>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 2rem;
              background-color: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 8px;
              margin: 1rem 0;
            }
            
            .error-boundary-content {
              text-align: center;
              max-width: 500px;
            }
            
            .error-icon {
              color: #ef4444;
              margin-bottom: 1rem;
            }
            
            .error-title {
              color: #991b1b;
              font-size: 1.5rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            
            .error-message {
              color: #7f1d1d;
              margin-bottom: 1.5rem;
            }
            
            .error-details {
              text-align: left;
              margin-bottom: 1.5rem;
              padding: 1rem;
              background-color: #ffffff;
              border: 1px solid #fecaca;
              border-radius: 4px;
            }
            
            .error-details-content {
              margin-top: 0.5rem;
            }
            
            .error-stack,
            .error-component-stack {
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              padding: 0.5rem;
              font-size: 0.75rem;
              overflow-x: auto;
              white-space: pre-wrap;
              margin-top: 0.5rem;
            }
            
            .error-actions {
              display: flex;
              gap: 0.5rem;
              justify-content: center;
              flex-wrap: wrap;
              margin-bottom: 1rem;
            }
            
            .error-button {
              padding: 0.5rem 1rem;
              border: none;
              border-radius: 4px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            
            .error-button-primary {
              background-color: #dc2626;
              color: white;
            }
            
            .error-button-primary:hover {
              background-color: #b91c1c;
            }
            
            .error-button-secondary {
              background-color: #6b7280;
              color: white;
            }
            
            .error-button-secondary:hover {
              background-color: #4b5563;
            }
            
            .error-button-tertiary {
              background-color: transparent;
              color: #dc2626;
              border: 1px solid #dc2626;
            }
            
            .error-button-tertiary:hover {
              background-color: #dc2626;
              color: white;
            }
            
            .error-id {
              font-size: 0.75rem;
              color: #6b7280;
              font-family: monospace;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SecurityErrorBoundary;