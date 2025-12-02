import React, { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { RADIUS, GLASS_BG, GLASS_BORDER, SHADOW, TRANSITION, HOVER } from './design-system/glass-constants';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'ghost' | 'gradient' | 'featured' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hover?: boolean;
  loading?: boolean;
  interactive?: boolean;
  gradient?: 'blue' | 'purple' | 'green' | 'red' | 'yellow' | 'custom';
  customGradient?: string;
}

const Container = forwardRef<HTMLDivElement, CardProps>(
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
    // Rounded styles - using unified design system
    const roundedStyles = {
      none: RADIUS.none,
      sm: RADIUS.sm,
      md: RADIUS.md,
      lg: RADIUS.lg,     // 12px - primary choice
      xl: RADIUS.xl,     // 16px
      full: RADIUS.full
    };

    // Padding styles - responsive
    const paddingStyles = {
      none: '',
      sm: 'p-2 sm:p-3',
      md: 'p-4 sm:p-5',
      lg: 'p-5 sm:p-6 md:p-8',
      xl: 'p-6 sm:p-8 md:p-10'
    };

    // Base styles
    const baseStyles = cn(
      'relative',
      roundedStyles[rounded],
      paddingStyles[padding],
      TRANSITION.default
    );

    // Gradient backgrounds - warm palette
    const gradientStyles = {
      blue: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
      purple: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
      green: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
      red: 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30',
      yellow: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30',
      custom: customGradient || ''
    };

    // Variant styles - warm stone palette
    const variantStyles = {
      default: cn(
        'bg-white dark:bg-stone-800/95',
        'border border-stone-100 dark:border-stone-700/50',
        SHADOW.soft
      ),
      elevated: cn(
        'bg-white dark:bg-stone-800/95',
        'border border-stone-100 dark:border-stone-700/50',
        SHADOW.elevated
      ),
      outline: cn(
        'bg-transparent',
        'border border-stone-200 dark:border-stone-700'
      ),
      ghost: cn(
        'bg-transparent'
      ),
      gradient: cn(
        gradient ? gradientStyles[gradient] : gradientStyles.blue,
        'border border-stone-100/50 dark:border-stone-700/30',
        SHADOW.soft
      ),
      featured: cn(
        'bg-gradient-to-br from-amber-600 to-orange-600',
        'text-white',
        SHADOW.floating,
        'border-0'
      ),
      glass: cn(
        GLASS_BG.frosted.medium,
        'border border-white/20 dark:border-stone-700/30',
        SHADOW.soft
      )
    };

    // Interactive styles
    const interactiveStyles = interactive || onClick ? cn(
      'cursor-pointer',
      'active:scale-[0.99]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2'
    ) : '';

    // Hover effects - standardized lift (scale 1.02, -4px lift, shadow-lg)
    const hoverStyles = (hover || interactive || onClick) ? cn(
      HOVER.card, // Standard: hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg
      variant === 'outline' && 'hover:border-stone-300 dark:hover:border-stone-600',
      variant === 'ghost' && 'hover:bg-stone-50 dark:hover:bg-stone-800/50'
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
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-stone-800/50 rounded-inherit z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        )}
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

/**
 * ContainerHeader - Header section for Container
 */
export const ContainerHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
  separator?: boolean;
}> = ({ children, className, separator = false }) => {
  return (
    <div
      className={cn(
        'mb-3 sm:mb-4',
        separator && 'pb-3 sm:pb-4 border-b border-stone-200 dark:border-stone-700',
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * ContainerTitle - Title component for Container
 */
export const ContainerTitle: React.FC<{
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
    <h3 className={cn(sizeStyles[size], 'text-stone-800 dark:text-white', className)}>
      {children}
    </h3>
  );
};

/**
 * ContainerDescription - Description text for Container
 */
export const ContainerDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <p className={cn('text-sm sm:text-base text-stone-600 dark:text-stone-300 mt-1', className)}>
      {children}
    </p>
  );
};

/**
 * ContainerContent - Main content area for Container
 */
export const ContainerContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={cn('', className)}>{children}</div>;
};

/**
 * ContainerFooter - Footer section for Container
 */
export const ContainerFooter: React.FC<{
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
        separator && 'pt-4 sm:pt-6 border-t border-stone-200 dark:border-stone-700',
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * ContainerGrid - Container for Container grid layouts
 */
export const ContainerGrid: React.FC<{
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

// Export the main component
export { Container };

// Backward compatibility exports  
export {
  Container as Card,
  ContainerHeader as CardHeader,
  ContainerTitle as CardTitle,
  ContainerDescription as CardDescription,
  ContainerContent as CardContent,
  ContainerFooter as CardFooter,
  ContainerGrid as CardGrid
};

export default Container;