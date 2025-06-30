/**
 * Production-safe logging utility
 * Only logs in development environment
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isClient = typeof window !== 'undefined';

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Get log level from environment or default to INFO in development, ERROR in production
const getLogLevel = () => {
  if (process.env.LOG_LEVEL) {
    return LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO;
  }
  return isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;
};

const currentLogLevel = getLogLevel();

/**
 * Format log message with timestamp and context
 */
const formatMessage = (level, message, context = {}) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  
  if (typeof message === 'object') {
    return { prefix, message, context };
  }
  
  return { prefix, message: `${prefix} ${message}`, context };
};

/**
 * Safe console logging that respects environment and log levels
 */
const logger = {
  /**
   * Log error messages - always shown in production
   */
  error: (message, context = {}) => {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      const formatted = formatMessage('ERROR', message, context);
      if (isClient && window.console?.error) {
        console.error(formatted.message, formatted.context);
      } else if (!isClient && console?.error) {
        console.error(formatted.message, formatted.context);
      }
    }
  },

  /**
   * Log warning messages - shown in development and when LOG_LEVEL allows
   */
  warn: (message, context = {}) => {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      const formatted = formatMessage('WARN', message, context);
      if (isClient && window.console?.warn) {
        console.warn(formatted.message, formatted.context);
      } else if (!isClient && console?.warn) {
        console.warn(formatted.message, formatted.context);
      }
    }
  },

  /**
   * Log info messages - shown in development and when LOG_LEVEL allows
   */
  info: (message, context = {}) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      const formatted = formatMessage('INFO', message, context);
      if (isClient && window.console?.info) {
        console.info(formatted.message, formatted.context);
      } else if (!isClient && console?.info) {
        console.info(formatted.message, formatted.context);
      }
    }
  },

  /**
   * Log debug messages - only shown in development
   */
  debug: (message, context = {}) => {
    if (currentLogLevel >= LOG_LEVELS.DEBUG && isDevelopment) {
      const formatted = formatMessage('DEBUG', message, context);
      if (isClient && window.console?.log) {
        console.log(formatted.message, formatted.context);
      } else if (!isClient && console?.log) {
        console.log(formatted.message, formatted.context);
      }
    }
  },

  /**
   * Log general messages - only shown in development
   */
  log: (message, context = {}) => {
    if (isDevelopment) {
      const formatted = formatMessage('LOG', message, context);
      if (isClient && window.console?.log) {
        console.log(formatted.message, formatted.context);
      } else if (!isClient && console?.log) {
        console.log(formatted.message, formatted.context);
      }
    }
  },

  /**
   * Performance timing utilities
   */
  time: (label) => {
    if (isDevelopment && console?.time) {
      console.time(label);
    }
  },

  timeEnd: (label) => {
    if (isDevelopment && console?.timeEnd) {
      console.timeEnd(label);
    }
  },

  /**
   * Group logging for related messages
   */
  group: (label) => {
    if (isDevelopment && console?.group) {
      console.group(label);
    }
  },

  groupEnd: () => {
    if (isDevelopment && console?.groupEnd) {
      console.groupEnd();
    }
  },

  /**
   * Log tables for structured data
   */
  table: (data) => {
    if (isDevelopment && console?.table) {
      console.table(data);
    }
  }
};

/**
 * Error reporting utility for production
 */
export const reportError = (error, context = {}) => {
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
export const logApiCall = (method, url, status, duration, error = null) => {
  const context = { method, url, status, duration };
  
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
export const logPerformance = (metric, value, context = {}) => {
  logger.debug(`Performance metric: ${metric}`, { value, ...context });
};

export default logger;