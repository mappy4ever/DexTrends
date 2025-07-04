import React, { useCallback, useRef, useEffect } from 'react';

/**
 * Advanced Micro-Interaction System with Haptic Feedback Simulation
 * Provides smooth animations, visual feedback, and haptic-like responses for web
 */

// Haptic feedback simulation using Web Vibration API
const HapticFeedback = {
  // Light tap feedback
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  // Medium feedback for buttons
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },
  
  // Strong feedback for important actions
  strong: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 25, 50]);
    }
  },
  
  // Success feedback pattern
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([25, 50, 25]);
    }
  },
  
  // Error feedback pattern
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
  },
  
  // Selection feedback
  select: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  }
};

// Visual feedback effects
const VisualFeedback = {
  // Ripple effect
  createRipple: (element, event) => {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
      z-index: 1000;
    `;
    
    // Add ripple animation keyframes if not already present
    if (!document.querySelector('#ripple-keyframes')) {
      const style = document.createElement('style');
      style.id = 'ripple-keyframes';
      style.textContent = `
        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  },
  
  // Pulse effect
  pulse: (element, intensity = 'medium') => {
    const pulseIntensities = {
      light: 'pulse-light',
      medium: 'pulse-medium',
      strong: 'pulse-strong'
    };
    
    element.classList.add(pulseIntensities[intensity]);
    setTimeout(() => {
      element.classList.remove(pulseIntensities[intensity]);
    }, 300);
  },
  
  // Shake effect for errors
  shake: (element) => {
    element.classList.add('shake-animation');
    setTimeout(() => {
      element.classList.remove('shake-animation');
    }, 500);
  },
  
  // Bounce effect for success
  bounce: (element) => {
    element.classList.add('bounce-animation');
    setTimeout(() => {
      element.classList.remove('bounce-animation');
    }, 600);
  },
  
  // Glow effect
  glow: (element, color = 'primary') => {
    element.classList.add(`glow-${color}`);
    setTimeout(() => {
      element.classList.remove(`glow-${color}`);
    }, 1000);
  }
};

// Enhanced Button Component with micro-interactions
export const InteractiveButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  haptic = 'medium',
  ripple = true,
  glow = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const buttonRef = useRef(null);
  
  const handleClick = useCallback((event) => {
    if (disabled) return;
    
    // Haptic feedback
    HapticFeedback[haptic]?.();
    
    // Visual feedback
    if (ripple) {
      VisualFeedback.createRipple(buttonRef.current, event);
    }
    
    if (glow) {
      VisualFeedback.glow(buttonRef.current, variant);
    }
    
    // Execute onClick handler
    if (onClick) {
      onClick(event);
    }
  }, [onClick, disabled, haptic, ripple, glow, variant]);
  
  const baseClasses = `
    interactive-button
    relative
    inline-flex
    items-center
    justify-center
    gap-2
    font-medium
    rounded-lg
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    active:scale-95
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;
  
  const variantClasses = {
    primary: 'bg-pokemon-red text-white hover:bg-red-600 focus:ring-pokemon-red',
    secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500'
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };
  
  return (
    <button
      ref={buttonRef}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Enhanced Card Component with micro-interactions
export const InteractiveCard = ({ 
  children, 
  onClick, 
  hoverable = true,
  selectable = false,
  selected = false,
  haptic = 'light',
  className = '',
  ...props 
}) => {
  const cardRef = useRef(null);
  
  const handleClick = useCallback((event) => {
    if (!onClick) return;
    
    // Haptic feedback
    HapticFeedback[haptic]?.();
    
    // Visual feedback
    if (selectable) {
      VisualFeedback.pulse(cardRef.current, 'light');
    }
    
    // Execute onClick handler
    onClick(event);
  }, [onClick, haptic, selectable]);
  
  const handleMouseEnter = useCallback(() => {
    if (hoverable && cardRef.current) {
      cardRef.current.style.transform = 'translateY(-2px) scale(1.02)';
    }
  }, [hoverable]);
  
  const handleMouseLeave = useCallback(() => {
    if (hoverable && cardRef.current) {
      cardRef.current.style.transform = 'translateY(0) scale(1)';
    }
  }, [hoverable]);
  
  const baseClasses = `
    interactive-card
    bg-white
    rounded-lg
    shadow-md
    transition-all
    duration-300
    ${hoverable ? 'hover:shadow-lg cursor-pointer' : ''}
    ${selectable ? 'focus:ring-2 focus:ring-pokemon-blue focus:outline-none' : ''}
    ${selected ? 'ring-2 ring-pokemon-blue bg-blue-50' : ''}
  `;
  
  return (
    <div
      ref={cardRef}
      className={`${baseClasses} ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={selectable ? 0 : -1}
      role={selectable ? 'button' : undefined}
      aria-pressed={selectable ? selected : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

// Enhanced Input Component with micro-interactions
export const InteractiveInput = ({ 
  label,
  error,
  success,
  haptic = 'light',
  onFocus,
  onBlur,
  onChange,
  className = '',
  ...props 
}) => {
  const inputRef = useRef(null);
  const [focused, setFocused] = React.useState(false);
  
  const handleFocus = useCallback((event) => {
    setFocused(true);
    HapticFeedback[haptic]?.();
    
    if (onFocus) {
      onFocus(event);
    }
  }, [onFocus, haptic]);
  
  const handleBlur = useCallback((event) => {
    setFocused(false);
    
    if (onBlur) {
      onBlur(event);
    }
  }, [onBlur]);
  
  const handleChange = useCallback((event) => {
    if (error && inputRef.current) {
      VisualFeedback.shake(inputRef.current);
      HapticFeedback.error();
    }
    
    if (onChange) {
      onChange(event);
    }
  }, [onChange, error]);
  
  const inputClasses = `
    interactive-input
    w-full
    px-3
    py-2
    border
    rounded-lg
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    ${error 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : success 
        ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
        : 'border-gray-300 focus:ring-pokemon-blue focus:border-pokemon-blue'
    }
    ${focused ? 'scale-102' : 'scale-100'}
  `;
  
  return (
    <div className={`input-container ${className}`}>
      {label && (
        <label className={`block text-sm font-medium mb-1 transition-colors duration-200 ${
          focused ? 'text-pokemon-blue' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        className={inputClasses}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1 animate-shake">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-500 text-sm mt-1 animate-bounce">
          {success}
        </p>
      )}
    </div>
  );
};

// Loading states with micro-interactions
export const InteractiveLoader = ({ 
  type = 'spinner',
  size = 'medium',
  color = 'primary',
  message = 'Loading...',
  showMessage = true 
}) => {
  const loaderClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  const colorClasses = {
    primary: 'text-pokemon-red',
    secondary: 'text-gray-500',
    white: 'text-white'
  };
  
  if (type === 'dots') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${colorClasses[color]} animate-pulse`}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
        {showMessage && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    );
  }
  
  if (type === 'pulse') {
    return (
      <div className="flex items-center gap-2">
        <div className={`${loaderClasses[size]} rounded-full bg-pokemon-red animate-pulse`} />
        {showMessage && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    );
  }
  
  // Default spinner
  return (
    <div className="flex items-center gap-2">
      <div className={`${loaderClasses[size]} animate-spin`}>
        <svg className="w-full h-full" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className={`opacity-75 ${colorClasses[color]}`}
            fill="currentColor"
            d="M4,12a8,8,0,0,1,8-8V0A12,12,0,0,0,0,12Z"
          />
        </svg>
      </div>
      {showMessage && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
};

// Progress indicator with animations
export const InteractiveProgress = ({ 
  value = 0, 
  max = 100, 
  animated = true,
  showLabel = true,
  color = 'primary',
  size = 'medium',
  className = '' 
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4'
  };
  
  const colorClasses = {
    primary: 'bg-pokemon-red',
    secondary: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };
  
  return (
    <div className={`progress-container ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-700 mb-1">
          <span>Progress</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={`bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} transition-all duration-500 ease-out ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// CSS for micro-interactions (to be added to global styles)
export const MicroInteractionStyles = `
  .interactive-button:active {
    transform: scale(0.95);
  }
  
  .interactive-card {
    will-change: transform;
  }
  
  .interactive-input {
    will-change: transform;
  }
  
  .pulse-light {
    animation: pulse-light 0.3s ease-out;
  }
  
  .pulse-medium {
    animation: pulse-medium 0.3s ease-out;
  }
  
  .pulse-strong {
    animation: pulse-strong 0.3s ease-out;
  }
  
  .shake-animation {
    animation: shake 0.5s ease-in-out;
  }
  
  .bounce-animation {
    animation: bounce 0.6s ease-out;
  }
  
  .glow-primary {
    box-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
    animation: glow-fade 1s ease-out;
  }
  
  .glow-success {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
    animation: glow-fade 1s ease-out;
  }
  
  .glow-danger {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
    animation: glow-fade 1s ease-out;
  }
  
  .scale-102 {
    transform: scale(1.02);
  }
  
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
  
  @keyframes pulse-light {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
  
  @keyframes pulse-medium {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes pulse-strong {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    25% { transform: translateY(-10px); }
    50% { transform: translateY(-5px); }
    75% { transform: translateY(-2px); }
  }
  
  @keyframes glow-fade {
    0% { box-shadow: 0 0 20px rgba(220, 38, 38, 0.8); }
    100% { box-shadow: 0 0 20px rgba(220, 38, 38, 0.2); }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .interactive-button,
    .interactive-card,
    .interactive-input {
      transition: none;
      animation: none;
    }
    
    .pulse-light,
    .pulse-medium,
    .pulse-strong,
    .shake-animation,
    .bounce-animation {
      animation: none;
    }
  }
`;

// Export utilities
export { HapticFeedback, VisualFeedback };
export default {
  InteractiveButton,
  InteractiveCard,
  InteractiveInput,
  InteractiveLoader,
  InteractiveProgress,
  HapticFeedback,
  VisualFeedback,
  MicroInteractionStyles
};