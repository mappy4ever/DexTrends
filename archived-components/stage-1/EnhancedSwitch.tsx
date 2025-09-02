import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface EnhancedSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showIcon?: boolean;
  className?: string;
}

export const EnhancedSwitch = forwardRef<HTMLInputElement, EnhancedSwitchProps>(({
  checked = false,
  onChange,
  label,
  helperText,
  disabled = false,
  size = 'md',
  color = 'primary',
  showIcon = true,
  className
}, ref) => {
  const handleChange = () => {
    if (!disabled) {
      onChange?.(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleChange();
    }
  };

  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 16 },
    md: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 24 },
    lg: { track: 'w-16 h-8', thumb: 'w-7 h-7', translate: 32 }
  };

  const colors = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  };

  const currentSize = sizes[size];
  const currentColor = colors[color];

  return (
    <div className={cn('enhanced-switch-wrapper', className)}>
      <label className={cn(
        'switch-container',
        disabled && 'disabled'
      )}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          role="switch"
          aria-checked={checked}
        />
        
        <div
          className={cn('switch-track', currentSize.track)}
          onClick={handleChange}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="button"
        >
          <motion.div
            className="track-background"
            animate={{
              backgroundColor: checked ? currentColor : 'rgba(209, 213, 219, 0.5)'
            }}
            transition={{ duration: 0.2 }}
          />
          
          <motion.div
            className={cn('switch-thumb', currentSize.thumb)}
            animate={{
              x: checked ? currentSize.translate : 0,
              backgroundColor: checked ? 'white' : 'rgba(255, 255, 255, 0.9)'
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          >
            {showIcon && (
              <AnimatePresence mode="wait">
                {checked ? (
                  <motion.svg
                    key="check"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill={currentColor}
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L6 7.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="x"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="#9ca3af"
                    initial={{ scale: 0, rotate: 90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L6 4.586l.293-.293a1 1 0 111.414 1.414L7.414 6l.293.293a1 1 0 01-1.414 1.414L6 7.414l-.293.293a1 1 0 01-1.414-1.414L4.586 6l-.293-.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </motion.svg>
                )}
              </AnimatePresence>
            )}
          </motion.div>
          
          {/* Ripple effect */}
          <AnimatePresence>
            {checked && (
              <motion.div
                className="ripple"
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  backgroundColor: currentColor
                }}
              />
            )}
          </AnimatePresence>
        </div>
        
        <div className="switch-content">
          {label && (
            <span className={cn(
              'switch-label',
              disabled && 'disabled'
            )}>
              {label}
            </span>
          )}
          
          {helperText && (
            <span className="switch-helper">
              {helperText}
            </span>
          )}
        </div>
      </label>
      
      <style jsx>{`
        .enhanced-switch-wrapper {
          display: inline-block;
        }
        
        .switch-container {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        
        .switch-container.disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        
        .switch-track {
          position: relative;
          display: inline-flex;
          align-items: center;
          padding: 2px;
          border-radius: 9999px;
          transition: all 0.2s ease;
          overflow: hidden;
        }
        
        .switch-track:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        
        .track-background {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          backdrop-filter: blur(10px);
        }
        
        .switch-thumb {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.1),
            0 1px 2px rgba(0, 0, 0, 0.06);
          z-index: 1;
        }
        
        .ripple {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        
        .switch-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .switch-label {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          user-select: none;
        }
        
        .switch-label.disabled {
          color: #9ca3af;
        }
        
        .switch-helper {
          font-size: 12px;
          color: #6b7280;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        
        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .switch-label {
            color: #f3f4f6;
          }
          
          .switch-label.disabled {
            color: #6b7280;
          }
          
          .switch-helper {
            color: #9ca3af;
          }
        }
        
        /* Hover effects */
        @media (hover: hover) {
          .switch-container:not(.disabled):hover .switch-track {
            box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
          }
          
          .switch-container:not(.disabled):hover .switch-thumb {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
});