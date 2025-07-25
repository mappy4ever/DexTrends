import React, { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { 
  borderRadiusClasses, 
  shadows, 
  components,
  combineClasses 
} from '../../styles/design-tokens';

export interface StandardCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'standard' | 'featured' | 'compact';
  hover?: boolean;
  gradient?: boolean;
  shadow?: keyof typeof shadows;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: React.ElementType;
}

/**
 * StandardCard Component
 * 
 * A consistent card implementation following the design system.
 * Uses rounded-2xl for standard cards and rounded-3xl for featured cards.
 * 
 * @example
 * <StandardCard variant="standard">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </StandardCard>
 */
const StandardCard = forwardRef<HTMLDivElement, StandardCardProps>(
  (
    {
      className,
      variant = 'standard',
      hover = true,
      gradient = false,
      shadow = 'lg',
      padding = 'md',
      as: Component = 'div',
      children,
      ...props
    },
    ref
  ) => {
    // Variant-specific styles
    const variantStyles = {
      standard: {
        base: 'bg-white dark:bg-gray-800',
        rounded: borderRadiusClasses.xl, // rounded-2xl (16px)
        padding: padding === 'md' ? 'p-6' : '',
      },
      featured: {
        base: gradient 
          ? 'bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20'
          : 'bg-white dark:bg-gray-800',
        rounded: borderRadiusClasses.xxl, // rounded-3xl (24px)
        padding: padding === 'md' ? 'p-8' : '',
      },
      compact: {
        base: 'bg-white dark:bg-gray-800',
        rounded: borderRadiusClasses.lg, // rounded-xl (12px)
        padding: padding === 'md' ? 'p-4' : '',
      },
    };

    // Padding overrides
    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: '', // Use variant default
      lg: 'p-8',
    };

    // Hover effects
    const hoverStyles = hover
      ? 'transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1'
      : '';

    // Combine all styles
    const cardStyles = combineClasses(
      // Base styles
      'relative overflow-hidden',
      
      // Variant styles
      variantStyles[variant].base,
      variantStyles[variant].rounded,
      paddingStyles[padding] || variantStyles[variant].padding,
      
      // Shadow
      shadows[shadow],
      
      // Hover effects
      hoverStyles,
      
      // Custom className
      className || ''
    );

    return (
      <Component
        ref={ref}
        className={cardStyles}
        {...props}
      >
        {/* Gradient overlay for featured cards */}
        {variant === 'featured' && gradient && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 pointer-events-none" />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </Component>
    );
  }
);

StandardCard.displayName = 'StandardCard';

// Subcomponents for better composition
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mb-4', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold text-gray-900 dark:text-white', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-gray-600 dark:text-gray-400 mt-2', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('', className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-6 pt-4 border-t border-gray-200 dark:border-gray-700', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export default StandardCard;