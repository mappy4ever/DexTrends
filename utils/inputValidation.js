/**
 * Input validation utilities without external dependencies
 */

// Basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Basic URL validation regex
const URL_REGEX = /^https?:\/\/.+/;

// XSS patterns to check for
const XSS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+=/i,
  /<iframe/i,
  /eval\(/i,
  /document\.write/i
];

/**
 * Basic HTML sanitization
 */
export const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Check if string contains XSS patterns
 */
export const containsXSS = (input) => {
  if (typeof input !== 'string') return false;
  return XSS_PATTERNS.some(pattern => pattern.test(input));
};

/**
 * Validate email address
 */
export const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email) && email.length <= 254;
};

/**
 * Validate URL
 */
export const isValidURL = (url) => {
  if (typeof url !== 'string') return false;
  return URL_REGEX.test(url) && url.length <= 2048;
};

/**
 * Validate string length
 */
export const isValidLength = (str, min = 0, max = Infinity) => {
  if (typeof str !== 'string') return false;
  return str.length >= min && str.length <= max;
};

/**
 * Check if string is alphanumeric
 */
export const isAlphanumeric = (str) => {
  if (typeof str !== 'string') return false;
  return /^[a-zA-Z0-9]+$/.test(str);
};

/**
 * Validate API request parameters
 */
export const validateApiRequest = (req, schema) => {
  const errors = [];
  
  // Basic validation - in a real app you'd use a schema validation library
  if (schema.method && req.method !== schema.method) {
    errors.push(`Method ${req.method} not allowed`);
  }
  
  if (schema.requiredParams) {
    for (const param of schema.requiredParams) {
      if (!req.query[param] && !req.body?.[param]) {
        errors.push(`Missing required parameter: ${param}`);
      }
    }
  }
  
  // Check for XSS in query parameters
  for (const [key, value] of Object.entries(req.query || {})) {
    if (typeof value === 'string' && containsXSS(value)) {
      errors.push(`XSS detected in parameter: ${key}`);
    }
  }
  
  // Check for XSS in body
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string' && containsXSS(value)) {
        errors.push(`XSS detected in body parameter: ${key}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validation schemas for different API endpoints
 */
export const VALIDATION_SCHEMAS = {
  GET_FILTERS: {
    method: 'GET',
    requiredParams: []
  },
  POST_PRICES: {
    method: 'POST',
    requiredParams: []
  },
  SEARCH_CARDS: {
    method: 'GET',
    requiredParams: ['q']
  }
};

export default {
  sanitizeHTML,
  containsXSS,
  isValidEmail,
  isValidURL,
  isValidLength,
  isAlphanumeric,
  validateApiRequest,
  VALIDATION_SCHEMAS
};