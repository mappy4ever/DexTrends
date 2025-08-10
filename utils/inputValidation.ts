/**
 * Input validation utilities without external dependencies
 */

import { NextApiRequest } from 'next';
import { ValidatableInput, ValidationFunction, SanitizationFunction, AnyObject } from '../types/common';

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

interface ValidationSchema {
  method?: string;
  requiredParams?: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface ExtendedRequest extends NextApiRequest {
  query: Record<string, string | string[]>;
  body: AnyObject;
}

/**
 * Basic HTML sanitization
 */
export const sanitizeHTML: SanitizationFunction<ValidatableInput> = (input) => {
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
export const containsXSS: ValidationFunction<ValidatableInput> = (input) => {
  if (typeof input !== 'string') return false;
  return XSS_PATTERNS.some(pattern => pattern.test(input));
};

/**
 * Validate email address
 */
export const isValidEmail: ValidationFunction<ValidatableInput> = (email) => {
  if (typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email) && email.length <= 254;
};

/**
 * Validate URL
 */
export const isValidURL: ValidationFunction<ValidatableInput> = (url) => {
  if (typeof url !== 'string') return false;
  return URL_REGEX.test(url) && url.length <= 2048;
};

/**
 * Validate string length
 */
export const isValidLength = (str: ValidatableInput, min: number = 0, max: number = Infinity): boolean => {
  if (typeof str !== 'string') return false;
  return str.length >= min && str.length <= max;
};

/**
 * Check if string is alphanumeric
 */
export const isAlphanumeric: ValidationFunction<ValidatableInput> = (str) => {
  if (typeof str !== 'string') return false;
  return /^[a-zA-Z0-9]+$/.test(str);
};

/**
 * Check if value is a string (helper for validation)
 */
const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

/**
 * Check single query parameter value for XSS
 */
const checkQueryValueForXSS = (value: string | string[]): boolean => {
  if (Array.isArray(value)) {
    return value.some(v => isString(v) && containsXSS(v));
  }
  return isString(value) && containsXSS(value);
};

/**
 * Get parameter value from request
 */
const getParamValue = (req: ExtendedRequest, param: string): string | string[] | undefined => {
  const queryValue = req.query[param];
  const bodyValue = req.body?.[param];
  
  if (queryValue !== undefined) return queryValue;
  if (bodyValue !== undefined && (typeof bodyValue === 'string' || Array.isArray(bodyValue))) {
    return bodyValue as string | string[];
  }
  return undefined;
};

/**
 * Validate API request parameters
 */
export const validateApiRequest = (req: ExtendedRequest, schema: ValidationSchema): ValidationResult => {
  const errors: string[] = [];
  
  // Basic validation - in a real app you'd use a schema validation library
  if (schema.method && req.method !== schema.method) {
    errors.push(`Method ${req.method} not allowed`);
  }
  
  if (schema.requiredParams) {
    for (const param of schema.requiredParams) {
      if (!getParamValue(req, param)) {
        errors.push(`Missing required parameter: ${param}`);
      }
    }
  }
  
  // Check for XSS in query parameters
  for (const [key, value] of Object.entries(req.query || {})) {
    if (checkQueryValueForXSS(value)) {
      errors.push(`XSS detected in parameter: ${key}`);
    }
  }
  
  // Check for XSS in body
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (isString(value) && containsXSS(value)) {
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
export const VALIDATION_SCHEMAS: Record<string, ValidationSchema> = {
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