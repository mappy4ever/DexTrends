import React, { forwardRef, ReactNode, ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

/**
 * TouchTarget Component - Ensures minimum 44px touch targets for mobile
 * 
 * Apple Human Interface Guidelines require a minimum 44x44px touch target
 * for comfortable and accurate touch interaction on mobile devices.
 * 
 * This component wraps interactive elements to ensure they meet this requirement
 * while maintaining visual flexibility.
 */

type TouchTargetElement = 'button' | 'a' | 'div' | 'span';

interface TouchTargetProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: TouchTargetElement;
  variant?: 'default' | 'inline' | 'compact';
  disabled?: boolean;
  href?: string; // For link elements
  type?: 'button' | 'submit' | 'reset'; // For button elements
}

export const TouchTarget = forwardRef<HTMLElement, TouchTargetProps>(
  ({ 
    children, 
    as = 'button',
    variant = 'default',
    disabled = false,
    className,
    href,
    type = 'button',
    ...props 
  }, ref) => {
    // Determine the component to render
    const Component = as as any;
    
    // Base styles ensuring minimum touch target
    const baseStyles = cn(
      // Minimum size for touch targets
      'min-h-[44px] min-w-[44px]',
      // Flexbox for centering content
      'inline-flex items-center justify-center',
      // Touch feedback
      'transition-transform active:scale-[0.97]',
      // Remove tap highlight on iOS
      'tap-highlight-transparent',
      // Cursor and disabled states
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      // Ensure touch area even if content is smaller
      'relative touch-manipulation'
    );
    
    // Variant-specific styles
    const variantStyles = {
      default: 'px-4 py-2', // Standard padding
      inline: 'px-2', // Minimal horizontal padding for inline elements
      compact: 'p-2' // Equal padding all around for icon buttons
    };
    
    // Additional props based on element type
    const elementProps: any = {
      className: cn(baseStyles, variantStyles[variant], className),
      disabled: as === 'button' ? disabled : undefined,
      'aria-disabled': disabled,
      ...props
    };
    
    // Add element-specific props
    if (as === 'a' && href) {
      elementProps.href = disabled ? undefined : href;
    }
    
    if (as === 'button') {
      elementProps.type = type;
    }
    
    return (
      <Component ref={ref} {...elementProps}>
        {children}
      </Component>
    );
  }
);

TouchTarget.displayName = 'TouchTarget';

/**
 * TouchTargetGroup - Ensures proper spacing between touch targets
 * iOS guidelines recommend at least 8px between touch targets
 */
interface TouchTargetGroupProps {
  children: ReactNode;
  direction?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TouchTargetGroup: React.FC<TouchTargetGroupProps> = ({
  children,
  direction = 'horizontal',
  spacing = 'md',
  className
}) => {
  const spacingClasses = {
    sm: direction === 'horizontal' ? 'gap-2' : 'gap-2', // 8px
    md: direction === 'horizontal' ? 'gap-3' : 'gap-3', // 12px
    lg: direction === 'horizontal' ? 'gap-4' : 'gap-4'  // 16px
  };
  
  return (
    <div 
      className={cn(
        'flex',
        direction === 'horizontal' ? 'flex-row' : 'flex-col',
        spacingClasses[spacing],
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * TouchTargetIcon - Wrapper for icon-only buttons ensuring touch target
 * Useful when the visual icon is smaller than 44px but needs to be tappable
 */
interface TouchTargetIconProps extends TouchTargetProps {
  icon: ReactNode;
  label: string; // For accessibility
}

export const TouchTargetIcon: React.FC<TouchTargetIconProps> = ({
  icon,
  label,
  className,
  ...props
}) => {
  return (
    <TouchTarget
      variant="compact"
      className={cn('rounded-full', className)}
      aria-label={label}
      {...props}
    >
      <span className="flex items-center justify-center">
        {icon}
      </span>
    </TouchTarget>
  );
};

// Export utility to check if an element meets touch target requirements
export const ensureTouchTarget = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return rect.width >= 44 && rect.height >= 44;
};

// CSS utility classes for use in other components
export const touchTargetClasses = {
  base: 'min-h-[44px] min-w-[44px] tap-highlight-transparent touch-manipulation',
  button: 'min-h-[44px] px-4 py-2 inline-flex items-center justify-center transition-transform active:scale-[0.97]',
  icon: 'h-[44px] w-[44px] inline-flex items-center justify-center rounded-full transition-transform active:scale-[0.97]',
  link: 'min-h-[44px] inline-flex items-center px-3 py-2 transition-colors'
};

export default TouchTarget;