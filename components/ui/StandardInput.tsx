import React, { forwardRef, useId } from 'react';
import { cn } from '@/utils/cn';
import { createGlassStyle } from './design-system/glass-constants';

interface StandardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'glass' | 'minimal';
  inputSize?: 'sm' | 'md' | 'lg';
  /** Explicit aria-label for screen readers (required if no visible label) */
  'aria-label'?: string;
}

const sizeClasses = {
  sm: 'h-10 px-2 text-sm',
  md: 'h-12 px-3 text-base',
  lg: 'h-14 px-3 text-lg'
};

const variantClasses = {
  default: 'bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700',
  glass: '',
  minimal: 'bg-transparent border-b-2 border-stone-300 dark:border-stone-600 rounded-none'
};

export const StandardInput = forwardRef<HTMLInputElement, StandardInputProps>(
  ({
    label,
    error,
    icon,
    rightIcon,
    variant = 'default',
    inputSize = 'md',
    className,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    // Generate unique IDs for accessibility
    const generatedId = useId();
    const inputId = props.id || generatedId;
    const labelId = `${inputId}-label`;
    const errorId = `${inputId}-error`;

    const glassClasses = variant === 'glass'
      ? createGlassStyle({
          blur: 'sm',
          opacity: 'subtle',
          border: 'subtle',
          rounded: 'xl',
          shadow: 'sm'
        })
      : '';

    // Determine ARIA attributes - prioritize explicit aria-label, then use labelledby
    const ariaAttributes: Record<string, string> = {};
    if (ariaLabel) {
      ariaAttributes['aria-label'] = ariaLabel;
    } else if (label) {
      ariaAttributes['aria-labelledby'] = labelId;
    }
    if (error) {
      ariaAttributes['aria-describedby'] = errorId;
      ariaAttributes['aria-invalid'] = 'true';
    }

    return (
      <div className="w-full">
        {label && (
          <label
            id={labelId}
            htmlFor={inputId}
            className="block mb-2 text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="text-stone-500 dark:text-stone-300">
                {icon}
              </div>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:rounded-xl',
              'placeholder:text-stone-400 dark:placeholder:text-stone-500',
              'text-stone-900 dark:text-white',
              'text-left', // Ensure text alignment is left
              sizeClasses[inputSize],
              variantClasses[variant],
              glassClasses,
              icon && 'pl-11',
              rightIcon && 'pr-10',
              error && 'border-red-500 dark:border-red-400',
              'hover:border-stone-300 dark:hover:border-stone-600',
              'focus:border-amber-500 dark:focus:border-amber-400',
              className
            )}
            {...ariaAttributes}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-3">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-500 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

StandardInput.displayName = 'StandardInput';

// Search Input Component with glass effect
export const SearchInput = forwardRef<HTMLInputElement, Omit<StandardInputProps, 'variant'>>(
  ({ className, 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <StandardInput
        ref={ref}
        variant="glass"
        placeholder="Search..."
        aria-label={ariaLabel || 'Search'}
        className={cn(
          'bg-white/80 dark:bg-stone-800/80',
          'backdrop-blur-xl',
          'border border-white/20 dark:border-stone-700/20',
          'rounded-xl !rounded-xl',
          className
        )}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

// Form Input Component
export const FormInput = forwardRef<HTMLInputElement, StandardInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <StandardInput
        ref={ref}
        variant="default"
        className={cn(
          'focus:shadow-lg',
          className
        )}
        {...props}
      />
    );
  }
);

FormInput.displayName = 'FormInput';