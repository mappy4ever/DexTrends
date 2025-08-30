import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'clean';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      children,
      ...props
    },
    ref
  ) => {
    // Base styles with consistent hover and active states
    const baseStyles = cn(
      'relative inline-flex items-center justify-center font-medium rounded-lg',
      'transition-all duration-200 ease-out',
      'transform hover:scale-105 active:scale-95',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100',
      fullWidth && 'w-full'
    );

    // Variant styles with consistent gradients and shadows
    const variantStyles = {
      primary: cn(
        'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
        'hover:from-blue-700 hover:to-purple-700',
        'shadow-md hover:shadow-lg active:shadow-md',
        'focus-visible:ring-blue-500'
      ),
      secondary: cn(
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
        'border border-gray-300 dark:border-gray-600',
        'hover:bg-gray-50 dark:hover:bg-gray-700',
        'shadow-sm hover:shadow-md active:shadow-sm',
        'focus-visible:ring-gray-500'
      ),
      ghost: cn(
        'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
        'text-gray-700 dark:text-gray-300',
        'focus-visible:ring-gray-500'
      ),
      danger: cn(
        'bg-gradient-to-r from-red-600 to-pink-600 text-white',
        'hover:from-red-700 hover:to-pink-700',
        'shadow-md hover:shadow-lg active:shadow-md',
        'focus-visible:ring-red-500'
      ),
      success: cn(
        'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
        'hover:from-green-700 hover:to-emerald-700',
        'shadow-md hover:shadow-lg active:shadow-md',
        'focus-visible:ring-green-500'
      ),
      clean: cn(
        'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        'hover:bg-gray-200 dark:hover:bg-gray-700',
        'focus-visible:ring-gray-500'
      )
    };

    // Size styles with minimum touch targets
    const sizeStyles = {
      sm: 'px-3 py-2 text-sm gap-1.5 min-h-[40px]',
      md: 'px-4 py-2.5 text-base gap-2 min-h-[48px]',
      lg: 'px-6 py-3 text-lg gap-2.5 min-h-[56px]',
      xl: 'px-8 py-4 text-xl gap-3 min-h-[64px]'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {/* Content wrapper for consistent alignment */}
        <span className="inline-flex items-center justify-center gap-2">
          {loading ? (
            <span className="animate-spin">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
          ) : (
            icon && iconPosition === 'left' && icon
          )}
          {children}
          {!loading && icon && iconPosition === 'right' && icon}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;