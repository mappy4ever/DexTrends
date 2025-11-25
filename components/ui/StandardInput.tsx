import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
// Glass styles replaced with Tailwind classes - createGlassStyle removed

interface StandardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'glass' | 'minimal';
  inputSize?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-10 px-2 text-sm',
  md: 'h-12 px-3 text-base',
  lg: 'h-14 px-3 text-lg'
};

const variantClasses = {
  default: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700',
  glass: '',
  minimal: 'bg-transparent border-b-2 border-gray-300 dark:border-gray-600 rounded-none'
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
    ...props 
  }, ref) => {
    const glassClasses = variant === 'glass' 
      ? 'bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-xl shadow-sm'
      : '';

    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-2 pointer-events-none">
              <div className="text-gray-500 dark:text-gray-400">
                {icon}
              </div>
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              'w-full rounded-xl transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:rounded-xl',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'text-gray-900 dark:text-white',
              'text-left', // Ensure text alignment is left
              sizeClasses[inputSize],
              variantClasses[variant],
              glassClasses,
              icon && 'pl-8',
              rightIcon && 'pr-10',
              error && 'border-red-500 dark:border-red-400',
              'hover:border-gray-300 dark:hover:border-gray-600',
              'focus:border-blue-500 dark:focus:border-blue-400',
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-3">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">
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
  ({ className, ...props }, ref) => {
    return (
      <StandardInput
        ref={ref}
        variant="glass"
        placeholder="Search..."
        className={cn(
          'bg-white/80 dark:bg-gray-800/80',
          'backdrop-blur-xl',
          'border border-white/20 dark:border-gray-700/20',
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