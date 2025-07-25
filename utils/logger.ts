/**
 * Production-safe logging utility
 * Only logs in development environment
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isClient = typeof window !== 'undefined';

// Log levels
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

// Log level names for string conversion
const LOG_LEVELS: Record<string, LogLevel> = {
  ERROR: LogLevel.ERROR,
  WARN: LogLevel.WARN,
  INFO: LogLevel.INFO,
  DEBUG: LogLevel.DEBUG
};

// Type for log context
type LogContext = Record<string, any>;

// Type for formatted message
interface FormattedMessage {
  prefix: string;
  message: string | object;
  context: LogContext;
}

// Get log level from environment or default to INFO in development, ERROR in production
const getLogLevel = (): LogLevel => {
  if (process.env.LOG_LEVEL) {
    return LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LogLevel.INFO;
  }
  return isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;
};

const currentLogLevel = getLogLevel();

/**
 * Format log message with timestamp and context
 */
const formatMessage = (level: string, message: string | object, context: LogContext = {}): FormattedMessage => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  
  if (typeof message === 'object') {
    return { prefix, message, context };
  }
  
  return { prefix, message: `${prefix} ${message}`, context };
};

/**
 * Logger interface
 */
interface Logger {
  error: (message: string | object, context?: LogContext) => void;
  warn: (message: string | object, context?: LogContext) => void;
  info: (message: string | object, context?: LogContext) => void;
  debug: (message: string | object, context?: LogContext) => void;
  log: (message: string | object, context?: LogContext) => void;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
  group: (label: string) => void;
  groupEnd: () => void;
  table: (data: any) => void;
}

/**
 * Safe console logging that respects environment and log levels
 */
const logger: Logger = {
  /**
   * Log error messages - always shown in production
   */
  error: (message: string | object, context: LogContext = {}) => {
    if (currentLogLevel >= LogLevel.ERROR) {
      const formatted = formatMessage('ERROR', message, context);
      if (isClient && typeof window !== 'undefined' && (window as any).console?.error) {
        console.error(formatted.message, formatted.context);
      } else if (!isClient && typeof console !== 'undefined' && console.error) {
        console.error(formatted.message, formatted.context);
      }
    }
  },

  /**
   * Log warning messages - shown in development and when LOG_LEVEL allows
   */
  warn: (message: string | object, context: LogContext = {}) => {
    if (currentLogLevel >= LogLevel.WARN) {
      const formatted = formatMessage('WARN', message, context);
      if (isClient && typeof window !== 'undefined' && (window as any).console?.warn) {
        console.warn(formatted.message, formatted.context);
      } else if (!isClient && typeof console !== 'undefined' && console.warn) {
        console.warn(formatted.message, formatted.context);
      }
    }
  },

  /**
   * Log info messages - shown in development and when LOG_LEVEL allows
   */
  info: (message: string | object, context: LogContext = {}) => {
    if (currentLogLevel >= LogLevel.INFO) {
      const formatted = formatMessage('INFO', message, context);
      if (isClient && typeof window !== 'undefined' && (window as any).console?.info) {
        console.info(formatted.message, formatted.context);
      } else if (!isClient && typeof console !== 'undefined' && console.info) {
        console.info(formatted.message, formatted.context);
      }
    }
  },

  /**
   * Log debug messages - only shown in development
   */
  debug: (message: string | object, context: LogContext = {}) => {
    if (currentLogLevel >= LogLevel.DEBUG && isDevelopment) {
      const formatted = formatMessage('DEBUG', message, context);
      if (isClient && typeof window !== 'undefined' && (window as any).console?.log) {
        console.log(formatted.message, formatted.context);
      } else if (!isClient && typeof console !== 'undefined' && console.log) {
        console.log(formatted.message, formatted.context);
      }
    }
  },

  /**
   * Log general messages - only shown in development
   */
  log: (message: string | object, context: LogContext = {}) => {
    if (isDevelopment) {
      const formatted = formatMessage('LOG', message, context);
      if (isClient && typeof window !== 'undefined' && (window as any).console?.log) {
        console.log(formatted.message, formatted.context);
      } else if (!isClient && typeof console !== 'undefined' && console.log) {
        console.log(formatted.message, formatted.context);
      }
    }
  },

  /**
   * Performance timing utilities
   */
  time: (label: string) => {
    if (isDevelopment && typeof console !== 'undefined' && console.time) {
      console.time(label);
    }
  },

  timeEnd: (label: string) => {
    if (isDevelopment && typeof console !== 'undefined' && console.timeEnd) {
      console.timeEnd(label);
    }
  },

  /**
   * Group logging for related messages
   */
  group: (label: string) => {
    if (isDevelopment && typeof console !== 'undefined' && console.group) {
      console.group(label);
    }
  },

  groupEnd: () => {
    if (isDevelopment && typeof console !== 'undefined' && console.groupEnd) {
      console.groupEnd();
    }
  },

  /**
   * Log tables for structured data
   */
  table: (data: any) => {
    if (isDevelopment && typeof console !== 'undefined' && console.table) {
      console.table(data);
    }
  }
};

/**
 * Error reporting utility for production
 */
export const reportError = (error: Error, context: LogContext = {}): void => {
  logger.error('Application error:', { error: error.message, stack: error.stack, ...context });
  
  // In production, you might want to send to error reporting service
  if (!isDevelopment && typeof window !== 'undefined') {
    // Example: Send to error reporting service
    // analytics.track('error', { error: error.message, ...context });
  }
};

/**
 * API call logging utility
 */
export const logApiCall = (
  method: string, 
  url: string, 
  status: number, 
  duration: number, 
  error: Error | null = null
): void => {
  const context: LogContext = { method, url, status, duration };
  
  if (error) {
    logger.error(`API call failed: ${method} ${url}`, { ...context, error: error.message });
  } else if (status >= 400) {
    logger.warn(`API call returned ${status}: ${method} ${url}`, context);
  } else {
    logger.debug(`API call successful: ${method} ${url}`, context);
  }
};

/**
 * Performance logging utility
 */
export const logPerformance = (metric: string, value: number, context: LogContext = {}): void => {
  logger.debug(`Performance metric: ${metric}`, { value, ...context });
};

export default logger;