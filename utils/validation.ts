/**
 * Unified Form Validation System
 * 
 * Comprehensive validation with:
 * - Type-safe validators
 * - Custom error messages
 * - Async validation support
 * - Form state management
 */

export type ValidationRule<T = any> = {
  validate: (value: T, formData?: any) => boolean | Promise<boolean>;
  message: string | ((value: T) => string);
};

export type ValidationSchema<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

export type ValidationErrors<T extends Record<string, any>> = {
  [K in keyof T]?: string;
};

/**
 * Common validators
 */
export const validators = {
  // Required field
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => {
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return true;
    },
    message
  }),

  // Email validation
  email: (message = 'Please enter a valid email'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true; // Allow empty for optional fields
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message
  }),

  // Min length
  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      return value.length >= min;
    },
    message: message || `Must be at least ${min} characters`
  }),

  // Max length
  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      return value.length <= max;
    },
    message: message || `Must be no more than ${max} characters`
  }),

  // Pattern matching
  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      return regex.test(value);
    },
    message
  }),

  // Number range
  range: (min: number, max: number, message?: string): ValidationRule<number> => ({
    validate: (value) => {
      if (value === null || value === undefined) return true;
      return value >= min && value <= max;
    },
    message: message || `Must be between ${min} and ${max}`
  }),

  // Minimum value
  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value) => {
      if (value === null || value === undefined) return true;
      return value >= min;
    },
    message: message || `Must be at least ${min}`
  }),

  // Maximum value
  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value) => {
      if (value === null || value === undefined) return true;
      return value <= max;
    },
    message: message || `Must be no more than ${max}`
  }),

  // URL validation
  url: (message = 'Please enter a valid URL'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message
  }),

  // Phone number
  phone: (message = 'Please enter a valid phone number'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
    },
    message
  }),

  // Password strength
  password: (options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  }): ValidationRule<string> => {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = true
    } = options || {};

    return {
      validate: (value) => {
        if (!value) return true;
        if (value.length < minLength) return false;
        if (requireUppercase && !/[A-Z]/.test(value)) return false;
        if (requireLowercase && !/[a-z]/.test(value)) return false;
        if (requireNumbers && !/\d/.test(value)) return false;
        if (requireSpecialChars && !/[!@#$%^&*]/.test(value)) return false;
        return true;
      },
      message: 'Password must be strong (8+ chars, mixed case, numbers, special chars)'
    };
  },

  // Confirm password
  confirmPassword: (passwordField = 'password'): ValidationRule<string> => ({
    validate: (value, formData) => {
      if (!value) return true;
      return value === formData?.[passwordField];
    },
    message: 'Passwords do not match'
  }),

  // Custom validation
  custom: <T = any>(
    validate: (value: T, formData?: any) => boolean | Promise<boolean>,
    message: string
  ): ValidationRule<T> => ({
    validate,
    message
  }),

  // Date validation
  date: (options?: {
    min?: Date;
    max?: Date;
    message?: string;
  }): ValidationRule<string | Date> => ({
    validate: (value) => {
      if (!value) return true;
      const date = value instanceof Date ? value : new Date(value);
      if (isNaN(date.getTime())) return false;
      
      if (options?.min && date < options.min) return false;
      if (options?.max && date > options.max) return false;
      
      return true;
    },
    message: options?.message || 'Please enter a valid date'
  }),

  // File validation
  file: (options?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    message?: string;
  }): ValidationRule<File | FileList> => ({
    validate: (value) => {
      if (!value) return true;
      
      const files = value instanceof FileList ? Array.from(value) : [value];
      
      for (const file of files) {
        if (options?.maxSize && file.size > options.maxSize) return false;
        if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) return false;
      }
      
      return true;
    },
    message: options?.message || 'Invalid file'
  }),

  // Array validation
  arrayLength: (min?: number, max?: number): ValidationRule<any[]> => ({
    validate: (value) => {
      if (!Array.isArray(value)) return false;
      if (min !== undefined && value.length < min) return false;
      if (max !== undefined && value.length > max) return false;
      return true;
    },
    message: `Array length must be ${min ? `at least ${min}` : ''}${min && max ? ' and ' : ''}${max ? `no more than ${max}` : ''}`
  }),

  // Unique values in array
  unique: (message = 'Values must be unique'): ValidationRule<any[]> => ({
    validate: (value) => {
      if (!Array.isArray(value)) return true;
      return new Set(value).size === value.length;
    },
    message
  })
};

/**
 * Validate a single field
 */
export async function validateField<T = any>(
  value: T,
  rules: ValidationRule<T>[] = [],
  formData?: any
): Promise<string | null> {
  for (const rule of rules) {
    const isValid = await rule.validate(value, formData);
    if (!isValid) {
      return typeof rule.message === 'function' 
        ? rule.message(value)
        : rule.message;
    }
  }
  return null;
}

/**
 * Validate entire form
 */
export async function validateForm<T extends Record<string, any>>(
  formData: T,
  schema: ValidationSchema<T>
): Promise<ValidationErrors<T>> {
  const errors: ValidationErrors<T> = {};
  
  for (const field in schema) {
    const rules = schema[field];
    if (!rules) continue;
    
    const error = await validateField(formData[field], rules, formData);
    if (error) {
      errors[field] = error;
    }
  }
  
  return errors;
}

/**
 * Form validation hook
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  schema: ValidationSchema<T>
) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<ValidationErrors<T>>({});
  const [touched, setTouched] = React.useState<Set<keyof T>>(new Set());
  const [isValidating, setIsValidating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Validate single field
  const validateSingleField = React.useCallback(async (field: keyof T) => {
    const rules = schema[field];
    if (!rules) return;
    
    const error = await validateField(values[field], rules, values);
    
    setErrors(prev => ({
      ...prev,
      [field]: error || undefined
    }));
  }, [values, schema]);

  // Handle field change
  const handleChange = React.useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validate on change if field was touched
    if (touched.has(field)) {
      validateSingleField(field);
    }
  }, [touched, validateSingleField]);

  // Handle field blur
  const handleBlur = React.useCallback((field: keyof T) => {
    setTouched(prev => new Set([...prev, field]));
    validateSingleField(field);
  }, [validateSingleField]);

  // Validate all fields
  const validate = React.useCallback(async () => {
    setIsValidating(true);
    const validationErrors = await validateForm(values, schema);
    setErrors(validationErrors);
    setIsValidating(false);
    
    return Object.keys(validationErrors).length === 0;
  }, [values, schema]);

  // Handle form submit
  const handleSubmit = React.useCallback(async (
    onSubmit: (values: T) => void | Promise<void>
  ) => {
    setIsSubmitting(true);
    
    // Touch all fields
    setTouched(new Set(Object.keys(values) as (keyof T)[]));
    
    // Validate
    const isValid = await validate();
    
    if (isValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        logger.error('Form submission error:', { error });
      }
    }
    
    setIsSubmitting(false);
  }, [values, validate]);

  // Reset form
  const reset = React.useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched(new Set());
    setIsValidating(false);
    setIsSubmitting(false);
  }, [initialValues]);

  // Get field props
  const getFieldProps = React.useCallback((field: keyof T) => ({
    value: values[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      handleChange(field, e.target.value as T[keyof T]);
    },
    onBlur: () => handleBlur(field),
    error: touched.has(field) ? errors[field] : undefined,
    'aria-invalid': touched.has(field) && !!errors[field],
    'aria-describedby': errors[field] ? `${String(field)}-error` : undefined
  }), [values, errors, touched, handleChange, handleBlur]);

  return {
    values,
    errors,
    touched,
    isValidating,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    getFieldProps,
    setValues,
    setErrors,
    isValid: Object.keys(errors).length === 0
  };
}

// React import for the hook
import * as React from 'react';
import logger from './logger';