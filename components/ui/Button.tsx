import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
const hapticManager = typeof window !== 'undefined' ? require('../../utils/hapticFeedback').default : null;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'clean';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  gradient?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
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
      gradient = false,
      rounded = 'lg',
      children,
      ...props
    },
    ref
  ) => {
    // Rounded styles
    const roundedStyles = {
      sm: 'rounded',
      md: 'rounded-lg',
      lg: 'rounded-xl',
      full: 'rounded-full'
    };
    
    // Base styles with consistent hover and active states
    const baseStyles = cn(
      'relative inline-flex items-center justify-center font-medium',
      roundedStyles[rounded],
      'transition-all duration-200 ease-out',
      'transform hover:scale-[1.02] active:scale-[0.98]',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100',
      'tap-highlight-transparent touch-manipulation',
      fullWidth && 'w-full'
    );

    // Variant styles with consistent gradients and shadows
    const variantStyles = {
      primary: cn(
        gradient
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
          : 'bg-blue-600 hover:bg-blue-700',
        'text-white',
        'shadow-sm hover:shadow-md active:shadow-sm',
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
        gradient
          ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
          : 'bg-red-600 hover:bg-red-700',
        'text-white',
        'shadow-sm hover:shadow-md active:shadow-sm',
        'focus-visible:ring-red-500'
      ),
      success: cn(
        gradient
          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
          : 'bg-green-600 hover:bg-green-700',
        'text-white',
        'shadow-sm hover:shadow-md active:shadow-sm',
        'focus-visible:ring-green-500'
      ),
      clean: cn(
        'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        'hover:bg-gray-200 dark:hover:bg-gray-700',
        'focus-visible:ring-gray-500'
      )
    };

    // Size styles with minimum touch targets and responsive sizing
    const sizeStyles = {
      sm: cn(
        'min-h-[36px] sm:min-h-[40px]',
        'px-3 sm:px-4 py-1.5 sm:py-2',
        'text-xs sm:text-sm',
        'gap-1.5'
      ),
      md: cn(
        'min-h-[44px]', // iOS touch target minimum
        'px-4 sm:px-5 py-2 sm:py-2.5',
        'text-sm sm:text-base',
        'gap-2'
      ),
      lg: cn(
        'min-h-[48px] sm:min-h-[52px]',
        'px-5 sm:px-6 py-2.5 sm:py-3',
        'text-base sm:text-lg',
        'gap-2.5'
      ),
      xl: cn(
        'min-h-[56px] sm:min-h-[64px]',
        'px-6 sm:px-8 py-3 sm:py-4',
        'text-lg sm:text-xl',
        'gap-3'
      )
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading && hapticManager) {
        hapticManager.button('tap');
      }
      props.onClick?.(e);
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
        onClick={handleClick}
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

/**
 * IconButton - Specialized button for icon-only actions
 * Ensures perfect circle/square with proper touch targets
 */
export const IconButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'icon' | 'iconPosition' | 'fullWidth'>>(
  ({ className, size = 'md', rounded = 'full', children, ...props }, ref) => {
    const iconSizeStyles = {
      sm: 'w-9 h-9 sm:w-10 sm:h-10',
      md: 'w-11 h-11', // 44px minimum
      lg: 'w-12 h-12 sm:w-14 sm:h-14',
      xl: 'w-14 h-14 sm:w-16 sm:h-16'
    };
    
    return (
      <Button
        ref={ref}
        className={cn(iconSizeStyles[size], 'p-0', className)}
        size={size}
        rounded={rounded}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

/**
 * ButtonGroup - Container for grouped buttons
 * Handles spacing and responsive layout
 */
export const ButtonGroup: React.FC<{
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
  className?: string;
}> = ({ children, direction = 'horizontal', spacing = 'md', responsive = true, className }) => {
  const spacingStyles = {
    sm: 'gap-1 sm:gap-2',
    md: 'gap-2 sm:gap-3',
    lg: 'gap-3 sm:gap-4'
  };
  
  return (
    <div 
      className={cn(
        'flex',
        responsive && direction === 'horizontal'
          ? 'flex-col sm:flex-row'
          : direction === 'horizontal' 
            ? 'flex-row flex-wrap' 
            : 'flex-col',
        spacingStyles[spacing],
        className
      )}
    >
      {children}
    </div>
  );
};

export default Button;