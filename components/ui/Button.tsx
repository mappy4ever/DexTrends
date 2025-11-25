import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { RADIUS, SHADOW, TRANSITION } from './design-system/glass-constants';
const hapticManager = typeof window !== 'undefined' ? require('../../utils/hapticFeedback').default : null;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'clean' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  gradient?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  leftIcon?: React.ReactNode; // Backward compatibility alias for icon with iconPosition="left"
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
      leftIcon, // Backward compatibility
      iconPosition = 'left',
      gradient = false,
      rounded = 'lg',
      children,
      ...props
    },
    ref
  ) => {
    // Handle leftIcon backward compatibility
    const resolvedIcon = icon || leftIcon;
    const resolvedIconPosition = leftIcon ? 'left' : iconPosition;

    // Rounded styles - using unified design system
    // Default is 'lg' (rounded-xl = 12px) - NOT pill-shaped
    const roundedStyles = {
      sm: RADIUS.sm,     // 4px
      md: RADIUS.md,     // 8px
      lg: RADIUS.lg,     // 12px - primary choice
      full: RADIUS.full  // pill shape (use sparingly)
    };

    // Base styles with consistent hover and active states
    const baseStyles = cn(
      'relative inline-flex items-center justify-center font-medium',
      roundedStyles[rounded],
      TRANSITION.default,
      'transform hover:scale-[1.01] active:scale-[0.99]', // More subtle scale
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100',
      'tap-highlight-transparent touch-manipulation',
      fullWidth && 'w-full'
    );

    // Variant styles with consistent gradients and shadows
    const variantStyles = {
      primary: cn(
        gradient
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          : 'bg-blue-600 hover:bg-blue-700',
        'text-white',
        SHADOW.sm,
        'hover:shadow-md active:shadow-sm',
        'focus-visible:ring-blue-500'
      ),
      secondary: cn(
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
        'border border-gray-200 dark:border-gray-700',
        'hover:bg-gray-50 dark:hover:bg-gray-700',
        SHADOW.sm,
        'hover:shadow-md active:shadow-sm',
        'focus-visible:ring-gray-500'
      ),
      ghost: cn(
        'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
        'text-gray-700 dark:text-gray-300',
        'focus-visible:ring-gray-500'
      ),
      danger: cn(
        gradient
          ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
          : 'bg-red-600 hover:bg-red-700',
        'text-white',
        SHADOW.sm,
        'hover:shadow-md active:shadow-sm',
        'focus-visible:ring-red-500'
      ),
      success: cn(
        gradient
          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
          : 'bg-green-600 hover:bg-green-700',
        'text-white',
        SHADOW.sm,
        'hover:shadow-md active:shadow-sm',
        'focus-visible:ring-green-500'
      ),
      clean: cn(
        'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        'hover:bg-gray-200 dark:hover:bg-gray-700',
        'focus-visible:ring-gray-500'
      ),
      glass: cn(
        'bg-white/75 dark:bg-gray-800/75',
        'backdrop-blur-sm',
        'border border-gray-200/50 dark:border-gray-700/50',
        'text-gray-900 dark:text-white',
        SHADOW.sm,
        'hover:shadow-md',
        'focus-visible:ring-blue-500'
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
      ),
      icon: cn(
        'min-h-[44px] min-w-[44px]', // Square icon button
        'p-2',
        'text-base',
        'gap-0'
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
            resolvedIcon && resolvedIconPosition === 'left' && resolvedIcon
          )}
          {children}
          {!loading && resolvedIcon && resolvedIconPosition === 'right' && resolvedIcon}
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
    const iconSizeStyles: Record<string, string> = {
      sm: 'w-9 h-9 sm:w-10 sm:h-10',
      md: 'w-11 h-11', // 44px minimum
      lg: 'w-12 h-12 sm:w-14 sm:h-14',
      xl: 'w-14 h-14 sm:w-16 sm:h-16',
      icon: 'w-11 h-11' // Same as md for icon variant
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