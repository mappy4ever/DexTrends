/**
 * Error tracking utility for production error reporting
 * Can be integrated with services like Sentry, Rollbar, LogRocket, etc.
 */

import logger from './logger';
import { AnyObject } from '../types/common';

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  pageName?: string;
  componentStack?: string;
  extra?: AnyObject;
}

interface ErrorTrackingService {
  captureException: (error: Error, context?: ErrorContext) => void;
  captureMessage: (message: string, level?: 'info' | 'warning' | 'error', context?: ErrorContext) => void;
  setUser: (userId: string | null) => void;
  setContext: (key: string, value: unknown) => void;
}

class ErrorTracking implements ErrorTrackingService {
  private isInitialized = false;
  private context: AnyObject = {};

  constructor() {
    // Initialize error tracking service in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    // Check if Sentry is available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      this.isInitialized = true;
      logger.info('Error tracking service initialized');
    }
  }

  captureException(error: Error, context?: ErrorContext) {
    // Log locally
    logger.error('Error captured', { 
      error: error.message, 
      stack: error.stack,
      ...context 
    });

    // Send to Sentry if available
    if (this.isInitialized && typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;
      Sentry.captureException(error, {
        contexts: {
          custom: context
        }
      });
    }

    // Fallback: Send to custom error logging endpoint
    if (process.env.NODE_ENV === 'production' && !this.isInitialized) {
      this.sendToErrorEndpoint(error, context);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    // Log locally (map warning to warn for logger)
    const logLevel = level === 'warning' ? 'warn' : level;
    logger[logLevel](message, context);

    // Send to Sentry if available
    if (this.isInitialized && typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;
      Sentry.captureMessage(message, level, {
        contexts: {
          custom: context
        }
      });
    }
  }

  setUser(userId: string | null) {
    if (userId) {
      this.context.userId = userId;
    } else {
      delete this.context.userId;
    }

    // Update Sentry user if available
    if (this.isInitialized && typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;
      Sentry.setUser(userId ? { id: userId } : null);
    }
  }

  setContext(key: string, value: unknown) {
    this.context[key] = value;

    // Update Sentry context if available
    if (this.isInitialized && typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;
      Sentry.setContext(key, value);
    }
  }

  private async sendToErrorEndpoint(error: Error, context?: ErrorContext) {
    try {
      // This could be your custom error logging endpoint
      const errorData = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        ...this.context,
        ...context
      };

      // If you have a custom error endpoint, uncomment and configure:
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // });

      // For now, just log it
      logger.error('Error logged for tracking', errorData);
    } catch (err) {
      // Silently fail - we don't want error tracking to cause errors
      logger.warn('Failed to send error to tracking endpoint', err);
    }
  }
}

// Singleton instance
const errorTracking = new ErrorTracking();

export default errorTracking;
export type { ErrorContext, ErrorTrackingService };