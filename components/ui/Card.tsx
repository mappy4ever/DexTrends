import React, { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'interactive' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  flipOnClick?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      rounded = 'lg',
      shadow = 'md',
      hover = true,
      flipOnClick = false,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const [isFlipped, setIsFlipped] = React.useState(false);

    // Base card styles
    const baseStyles = cn(
      'relative overflow-hidden',
      'transition-all duration-300 ease-out',
      hover && 'transform hover:scale-105 hover:-translate-y-1',
      'bg-white dark:bg-gray-800',
      flipOnClick && 'cursor-pointer preserve-3d'
    );

    // Variant styles
    const variantStyles = {
      default: 'border border-gray-200 dark:border-gray-700',
      hover: cn(
        'border border-gray-200 dark:border-gray-700',
        hover && 'hover:border-blue-400 dark:hover:border-blue-600'
      ),
      interactive: cn(
        'border border-gray-200 dark:border-gray-700',
        hover && 'hover:border-purple-400 dark:hover:border-purple-600',
        'cursor-pointer'
      ),
      flat: 'bg-gray-50 dark:bg-gray-900'
    };

    // Padding styles
    const paddingStyles = {
      none: '',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6'
    };

    // Rounded styles
    const roundedStyles = {
      none: '',
      sm: 'rounded',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl'
    };

    // Shadow styles with hover effects
    const shadowStyles = {
      none: '',
      sm: cn('shadow-sm', hover && 'hover:shadow-md'),
      md: cn('shadow-md', hover && 'hover:shadow-lg'),
      lg: cn('shadow-lg', hover && 'hover:shadow-xl'),
      xl: cn('shadow-xl', hover && 'hover:shadow-2xl')
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (flipOnClick) {
        setIsFlipped(!isFlipped);
      }
      onClick?.(e);
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          paddingStyles[padding],
          roundedStyles[rounded],
          shadowStyles[shadow],
          isFlipped && 'rotate-y-180',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {flipOnClick ? (
          <div className="relative w-full h-full">
            <div className={cn('backface-hidden', isFlipped && 'hidden')}>
              {children}
            </div>
            <div className={cn('backface-hidden rotate-y-180 absolute inset-0', !isFlipped && 'hidden')}>
              <div className="flex items-center justify-center h-full p-4">
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Card Back Content
                </p>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card subcomponents for better composition
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('pb-4', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

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
      className={cn('pt-4', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export default Card;