import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};

const baseClasses = 'font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';

const variantClasses = {
  primary: 'bg-gradient-to-r from-purple-400 to-purple-500 text-white hover:from-purple-500 hover:to-purple-600 shadow-lg hover:shadow-xl focus:ring-purple-500',
  secondary: 'bg-white/10 backdrop-blur-md border-2 border-purple-300 text-purple-700 hover:bg-white/20 hover:border-purple-400 focus:ring-purple-300',
  tertiary: 'text-purple-600 hover:text-purple-700 underline-offset-4 hover:underline focus:ring-purple-300'
};

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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  fullWidth = false,
  disabled,
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {/* Ripple effect on click */}
      <motion.span
        className="absolute inset-0 rounded-lg"
        initial={false}
        animate={{ scale: 0, opacity: 0 }}
        whileTap={{
          scale: [0, 1.5],
          opacity: [0.4, 0],
        }}
        transition={{ duration: 0.6 }}
        style={{
          background: variant === 'primary' 
            ? 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(147,51,234,0.2) 0%, transparent 70%)'
        }}
      />
      
      <span className="relative flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            {loadingSpinner}
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </span>
    </motion.button>
  );
});

Button.displayName = 'Button';

// Contextual Button that uses theme colors
interface ContextualButtonProps extends ButtonProps {
  themeClass?: string;
}

export const ContextualButton = forwardRef<HTMLButtonElement, ContextualButtonProps>(({
  themeClass,
  className,
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(themeClass, className)}
      {...props}
    />
  );
});