import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { 
  borderRadiusClasses,
  components,
  combineClasses 
} from '../../styles/design-tokens';
import { hapticFeedback } from '../../utils/mobileOptimizations';

export interface CircularButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * CircularButton Component
 * 
 * A consistent button implementation using rounded-full from design tokens.
 * Ensures 44px minimum touch target for mobile accessibility.
 * 
 * @example
 * <CircularButton variant="primary" leftIcon={<FiSave />}>
 *   Save Changes
 * </CircularButton>
 */
const CircularButton = forwardRef<HTMLButtonElement, CircularButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    // Add haptic feedback on click
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !isLoading) {
        hapticFeedback.light();
        onClick?.(e);
      }
    };
    // Size styles ensuring minimum 44px touch target
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm min-h-[44px]',
      md: 'px-6 py-3 text-base min-h-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[48px]',
      icon: 'w-11 h-11 p-0', // 44px square for icon-only buttons
    };

    // Variant styles
    const variantStyles = {
      primary: combineClasses(
        'bg-gradient-to-r from-pokemon-red to-pink-500',
        'text-white font-medium',
        'hover:from-red-600 hover:to-pink-600',
        'focus:outline-none focus:ring-2 focus:ring-pokemon-red focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'shadow-lg hover:shadow-xl'
      ),
      secondary: combineClasses(
        'bg-white dark:bg-gray-800',
        'border-2 border-gray-300 dark:border-gray-600',
        'text-gray-700 dark:text-gray-300 font-medium',
        'hover:bg-gray-100 dark:hover:bg-gray-700',
        'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      ),
      ghost: combineClasses(
        'bg-transparent',
        'text-gray-700 dark:text-gray-300 font-medium',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      ),
      danger: combineClasses(
        'bg-gradient-to-r from-red-500 to-red-600',
        'text-white font-medium',
        'hover:from-red-600 hover:to-red-700',
        'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'shadow-lg hover:shadow-xl'
      ),
    };

    // Loading spinner
    const loadingSpinner = (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
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
    );

    // Combine all styles
    const buttonStyles = combineClasses(
      // Base styles
      'relative inline-flex items-center justify-center',
      'transition-all duration-300',
      'transform hover:scale-105 active:scale-95',
      'touch-manipulation', // Improves mobile touch handling
      
      // Always use rounded-full for circular buttons
      borderRadiusClasses.full,
      
      // Size styles
      sizeStyles[size],
      
      // Variant styles
      variantStyles[variant],
      
      // Full width
      fullWidth ? 'w-full' : '',
      
      // Loading state
      isLoading ? 'cursor-wait' : '',
      
      // Custom className
      className || ''
    );

    return (
      <button
        ref={ref}
        className={buttonStyles}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        {/* Content wrapper for proper spacing */}
        <span className="inline-flex items-center gap-2">
          {isLoading ? (
            loadingSpinner
          ) : (
            leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
          )}
          
          {children && size !== 'icon' && (
            <span>{children}</span>
          )}
          
          {rightIcon && !isLoading && (
            <span className="flex-shrink-0">{rightIcon}</span>
          )}
        </span>

        {/* Ripple effect container (optional enhancement) */}
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <span className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-10 transition-opacity" />
        </span>
      </button>
    );
  }
);

CircularButton.displayName = 'CircularButton';

// Button Group Component for consistent spacing
export const ButtonGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}> = ({ children, className, align = 'start' }) => {
  const alignStyles = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3',
        alignStyles[align],
        className || ''
      )}
    >
      {children}
    </div>
  );
};

export default CircularButton;