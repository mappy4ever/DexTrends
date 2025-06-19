import React, { forwardRef } from 'react';

// Premium Glass Card Component
export const GlassCard = forwardRef(({ 
  children, 
  className = '', 
  elevated = false, 
  hoverable = true, 
  padding = 'lg',
  gradient = false,
  glow = false,
  ...props 
}, ref) => {
  const paddingClasses = {
    'sm': 'p-4',
    'md': 'p-6', 
    'lg': 'p-8',
    'xl': 'p-10'
  };

  const baseClasses = `
    relative
    ${elevated ? 'glass-elevated' : 'glass'}
    ${hoverable ? 'glass-hover' : ''}
    ${paddingClasses[padding]}
    rounded-2xl
    transition-all duration-300 ease-premium
    ${gradient ? 'gradient-primary' : ''}
    ${glow ? 'glow-primary' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div ref={ref} className={baseClasses} {...props}>
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';

// Premium Button Component
export const PremiumButton = forwardRef(({ 
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  glow = false,
  loading = false,
  disabled = false,
  ...props 
}, ref) => {
  const variants = {
    primary: 'gradient-primary text-white',
    accent: 'gradient-accent text-white',
    success: 'gradient-success text-white',
    glass: 'glass text-gray-900 dark:text-white',
    outline: 'border-2 border-current bg-transparent hover:bg-current hover:text-white'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  const baseClasses = `
    btn-premium
    ${variants[variant]}
    ${sizes[size]}
    ${glow ? 'glow-primary' : ''}
    ${loading ? 'cursor-wait opacity-75' : ''}
    ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-105 active:scale-95'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button 
      ref={ref} 
      className={baseClasses} 
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
      )}
      {children}
    </button>
  );
});

PremiumButton.displayName = 'PremiumButton';

// Floating Action Button
export const FloatingActionButton = ({ 
  children, 
  className = '', 
  position = 'bottom-right',
  ...props 
}) => {
  const positions = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-20 right-6',
    'top-left': 'fixed top-20 left-6'
  };

  return (
    <PremiumButton
      className={`
        ${positions[position]}
        !rounded-full
        !p-4
        shadow-premium
        glow-primary
        z-50
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      glow
      {...props}
    >
      {children}
    </PremiumButton>
  );
};

// Glass Navigation Bar
export const GlassNavbar = ({ children, className = '', fixed = true, ...props }) => {
  return (
    <nav 
      className={`
        ${fixed ? 'fixed top-0 left-0 right-0' : ''}
        glass-elevated
        backdrop-blur-xl
        border-b border-glass-border
        z-sticky
        transition-all duration-300 ease-premium
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </nav>
  );
};

// Premium Modal Overlay
export const PremiumModal = ({ 
  children, 
  isOpen, 
  onClose, 
  className = '',
  size = 'md',
  ...props 
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <GlassCard
        className={`
          relative
          w-full
          ${sizes[size]}
          max-h-[90vh]
          overflow-auto
          animate-scale-in
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        elevated
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </GlassCard>
    </div>
  );
};

// Premium Loading Skeleton
export const PremiumSkeleton = ({ 
  className = '', 
  width = '100%', 
  height = '1rem',
  rounded = 'md',
  ...props 
}) => {
  const roundedClasses = {
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
    'xl': 'rounded-xl',
    'full': 'rounded-full'
  };

  return (
    <div
      className={`
        bg-gradient-to-r from-glass-primary via-glass-hover to-glass-primary
        bg-[length:200px_100%]
        animate-shimmer
        ${roundedClasses[rounded]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{ width, height }}
      {...props}
    />
  );
};

// Premium Badge Component
export const PremiumBadge = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  className = '',
  glow = false,
  ...props 
}) => {
  const variants = {
    primary: 'gradient-primary text-white',
    accent: 'gradient-accent text-white',
    success: 'gradient-success text-white',
    warning: 'gradient-warning text-white',
    error: 'gradient-error text-white',
    glass: 'glass text-gray-900 dark:text-white'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      className={`
        inline-flex items-center
        font-medium
        rounded-full
        transition-all duration-200 ease-premium
        ${variants[variant]}
        ${sizes[size]}
        ${glow ? 'glow-primary' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </span>
  );
};

// Premium Input Component
export const PremiumInput = forwardRef(({ 
  className = '',
  label,
  error,
  icon,
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full
            glass
            border-glass-border
            rounded-lg
            px-4 py-3
            ${icon ? 'pl-10' : ''}
            text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            focus:ring-2 focus:ring-primary focus:border-transparent
            transition-all duration-200 ease-premium
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

PremiumInput.displayName = 'PremiumInput';

// Premium Progress Bar
export const PremiumProgress = ({ 
  value = 0, 
  max = 100, 
  className = '',
  variant = 'primary',
  size = 'md',
  showLabel = false,
  animated = true,
  ...props 
}) => {
  const percentage = (value / max) * 100;
  
  const variants = {
    primary: 'gradient-primary',
    accent: 'gradient-accent',
    success: 'gradient-success',
    warning: 'gradient-warning',
    error: 'gradient-error'
  };

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Progress</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <div className={`w-full glass rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`
            ${sizes[size]}
            ${variants[variant]}
            transition-all duration-500 ease-premium
            ${animated ? 'animate-pulse' : ''}
            rounded-full
          `.trim().replace(/\s+/g, ' ')}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default {
  GlassCard,
  PremiumButton,
  FloatingActionButton,
  GlassNavbar,
  PremiumModal,
  PremiumSkeleton,
  PremiumBadge,
  PremiumInput,
  PremiumProgress
};