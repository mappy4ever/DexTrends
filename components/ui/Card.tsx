import React, { forwardRef, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
const hapticManager = typeof window !== 'undefined' ? require('../../utils/hapticFeedback').default : null;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'ghost' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hover?: boolean;
  loading?: boolean;
  interactive?: boolean;
  gradient?: 'blue' | 'purple' | 'green' | 'red' | 'yellow' | 'custom';
  customGradient?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      rounded = 'lg',
      hover = false,
      loading = false,
      interactive = false,
      gradient,
      customGradient,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    // Rounded styles
    const roundedStyles = {
      none: '',
      sm: 'rounded',
      md: 'rounded-lg',
      lg: 'rounded-xl',
      xl: 'rounded-2xl',
      full: 'rounded-full'
    };

    // Padding styles - responsive
    const paddingStyles = {
      none: '',
      sm: 'p-2 sm:p-3',
      md: 'p-3 sm:p-4 md:p-5',
      lg: 'p-4 sm:p-6 md:p-8',
      xl: 'p-6 sm:p-8 md:p-10'
    };

    // Base styles
    const baseStyles = cn(
      'relative',
      roundedStyles[rounded],
      paddingStyles[padding],
      'transition-all duration-200 ease-out'
    );

    // Gradient backgrounds
    const gradientStyles = {
      blue: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20',
      purple: 'bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20',
      green: 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20',
      red: 'bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20',
      yellow: 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20',
      custom: customGradient || ''
    };

    // Variant styles
    const variantStyles = {
      default: cn(
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'shadow-sm'
      ),
      elevated: cn(
        'bg-white dark:bg-gray-800',
        'shadow-lg hover:shadow-xl',
        'border border-gray-100 dark:border-gray-700'
      ),
      outline: cn(
        'bg-transparent',
        'border-2 border-gray-300 dark:border-gray-600'
      ),
      ghost: cn(
        'bg-transparent',
        'border border-transparent'
      ),
      gradient: cn(
        gradient ? gradientStyles[gradient] : gradientStyles.blue,
        'border border-gray-200/50 dark:border-gray-700/50',
        'shadow-sm'
      )
    };

    // Interactive styles
    const interactiveStyles = interactive || onClick ? cn(
      'cursor-pointer',
      'active:scale-[0.98]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
    ) : '';

    // Hover effects
    const hoverStyles = (hover || interactive || onClick) ? cn(
      'hover:shadow-lg',
      'hover:scale-[1.02]',
      variant === 'outline' && 'hover:border-gray-400 dark:hover:border-gray-500',
      variant === 'ghost' && 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
    ) : '';

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          interactiveStyles,
          hoverStyles,
          loading && 'pointer-events-none opacity-60',
          className
        )}
        onClick={onClick}
        tabIndex={interactive || onClick ? 0 : undefined}
        role={interactive || onClick ? 'button' : undefined}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 rounded-inherit z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * CardHeader - Header section for Card
 */
export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
  separator?: boolean;
}> = ({ children, className, separator = false }) => {
  return (
    <div
      className={cn(
        'mb-3 sm:mb-4',
        separator && 'pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * CardTitle - Title component for Card
 */
export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ children, className, size = 'md' }) => {
  const sizeStyles = {
    sm: 'text-base sm:text-lg font-semibold',
    md: 'text-lg sm:text-xl md:text-2xl font-bold',
    lg: 'text-xl sm:text-2xl md:text-3xl font-bold',
    xl: 'text-2xl sm:text-3xl md:text-4xl font-bold'
  };

  return (
    <h3 className={cn(sizeStyles[size], 'text-gray-900 dark:text-white', className)}>
      {children}
    </h3>
  );
};

/**
 * CardDescription - Description text for Card
 */
export const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <p className={cn('text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1', className)}>
      {children}
    </p>
  );
};

/**
 * CardContent - Main content area for Card
 */
export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={cn('', className)}>{children}</div>;
};

/**
 * CardFooter - Footer section for Card
 */
export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
  separator?: boolean;
  align?: 'left' | 'center' | 'right' | 'between';
}> = ({ children, className, separator = false, align = 'right' }) => {
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div
      className={cn(
        'mt-4 sm:mt-6 flex items-center gap-2 sm:gap-3',
        alignStyles[align],
        separator && 'pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * CardGrid - Container for Card grid layouts
 */
export const CardGrid: React.FC<{
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  children, 
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className 
}) => {
  const gapStyles = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 md:gap-5',
    lg: 'gap-4 sm:gap-6 md:gap-8'
  };

  const colStyles = cn(
    'grid',
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  );

  return (
    <div className={cn(colStyles, gapStyles[gap], className)}>
      {children}
    </div>
  );
};

export default Card;