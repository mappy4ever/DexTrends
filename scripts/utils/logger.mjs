/**
 * Simple logger utility for ES modules
 * Compatible with import syntax
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Log levels
const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Get log level from environment or default to INFO in development, ERROR in production
const getLogLevel = () => {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();
  if (envLevel && LogLevel[envLevel] !== undefined) {
    return LogLevel[envLevel];
  }
  return isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;
};

const currentLogLevel = getLogLevel();

/**
 * Format log message with timestamp and level
 */
const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

/**
 * Logger interface for ES module scripts
 */
const logger = {
  /**
   * Log error messages - always shown in production
   */
  error: (message, context = {}) => {
    if (currentLogLevel >= LogLevel.ERROR) {
      const formatted = formatMessage('ERROR', message);
      if (Object.keys(context).length > 0) {
        console.error(formatted, context);
      } else {
        console.error(formatted);
      }
    }
  },

  /**
   * Log warning messages
   */
  warn: (message, context = {}) => {
    if (currentLogLevel >= LogLevel.WARN) {
      const formatted = formatMessage('WARN', message);
      if (Object.keys(context).length > 0) {
        console.warn(formatted, context);
      } else {
        console.warn(formatted);
      }
    }
  },

  /**
   * Log info messages
   */
  info: (message, context = {}) => {
    if (currentLogLevel >= LogLevel.INFO) {
      const formatted = formatMessage('INFO', message);
      if (Object.keys(context).length > 0) {
        console.info(formatted, context);
      } else {
        console.info(formatted);
      }
    }
  },

  /**
   * Log debug messages - only shown in development
   */
  debug: (message, context = {}) => {
    if (currentLogLevel >= LogLevel.DEBUG && isDevelopment) {
      const formatted = formatMessage('DEBUG', message);
      if (Object.keys(context).length > 0) {
        console.log(formatted, context);
      } else {
        console.log(formatted);
      }
    }
  }
};

export default logger;