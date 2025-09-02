import React, { useState, useRef, forwardRef, InputHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface EnhancedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  floatingLabel?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  showCharCount?: boolean;
  maxLength?: number;
  onClear?: () => void;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(({
  label,
  error,
  helperText,
  icon,
  endIcon,
  floatingLabel = true,
  variant = 'default',
  showCharCount = false,
  maxLength,
  onClear,
  className,
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Combine refs
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    onChange?.(e);
  };
  
  const handleClear = () => {
    if (inputRef.current) {
      const event = new Event('input', { bubbles: true });
      inputRef.current.value = '';
      inputRef.current.dispatchEvent(event);
      setHasValue(false);
      onClear?.();
    }
  };
  
  const charCount = value?.toString().length || 0;
  const isLabelFloating = floatingLabel && (isFocused || hasValue);
  
  return (
    <div className={cn('enhanced-input-wrapper', variant, className)}>
      {label && !floatingLabel && (
        <label className="input-label static">
          {label}
        </label>
      )}
      
      <div className={cn(
        'input-container',
        isFocused && 'focused',
        error && 'error',
        hasValue && 'has-value'
      )}>
        {icon && (
          <motion.div 
            className="input-icon start"
            animate={{
              scale: isFocused ? 1.1 : 1,
              color: isFocused ? '#3b82f6' : '#9ca3af'
            }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        )}
        
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="enhanced-input"
          maxLength={maxLength}
          {...props}
        />
        
        {floatingLabel && label && (
          <motion.label
            className="input-label floating"
            animate={{
              y: isLabelFloating ? -20 : 0,
              x: isLabelFloating ? -8 : icon ? 32 : 0,
              scale: isLabelFloating ? 0.75 : 1,
              color: error ? '#ef4444' : isFocused ? '#3b82f6' : '#6b7280'
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          >
            {label}
          </motion.label>
        )}
        
        {/* Clear button */}
        <AnimatePresence>
          {hasValue && onClear && (
            <motion.button
              type="button"
              className="input-clear"
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.5 10.5l-1 1L8 9l-2.5 2.5-1-1L7 8 4.5 5.5l1-1L8 7l2.5-2.5 1 1L9 8l2.5 2.5z"/>
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
        
        {endIcon && (
          <motion.div 
            className="input-icon end"
            animate={{
              scale: isFocused ? 1.1 : 1,
              color: isFocused ? '#3b82f6' : '#9ca3af'
            }}
            transition={{ duration: 0.2 }}
          >
            {endIcon}
          </motion.div>
        )}
        
        {/* Focus indicator */}
        <motion.div
          className="focus-indicator"
          initial={false}
          animate={{
            scaleX: isFocused ? 1 : 0,
            opacity: isFocused ? 1 : 0
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      </div>
      
      {/* Helper text and error */}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            className="input-message error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.div>
        ) : helperText ? (
          <motion.div
            key="helper"
            className="input-message helper"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {helperText}
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      {/* Character count */}
      {showCharCount && maxLength && (
        <motion.div
          className="char-count"
          animate={{
            color: charCount >= maxLength * 0.9 ? '#ef4444' : '#9ca3af'
          }}
        >
          {charCount}/{maxLength}
        </motion.div>
      )}
      
      <style jsx>{`
        .enhanced-input-wrapper {
          position: relative;
          width: 100%;
        }
        
        .input-label.static {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        
        .input-container {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(209, 213, 219, 0.5);
          border-radius: 12px;
          transition: all 0.2s ease;
          overflow: hidden;
        }
        
        .input-container.focused {
          background: rgba(255, 255, 255, 0.9);
          border-color: #3b82f6;
          box-shadow: 
            0 0 0 3px rgba(59, 130, 246, 0.1),
            0 4px 16px rgba(59, 130, 246, 0.1);
        }
        
        .input-container.error {
          border-color: #ef4444;
        }
        
        .input-container.error.focused {
          box-shadow: 
            0 0 0 3px rgba(239, 68, 68, 0.1),
            0 4px 16px rgba(239, 68, 68, 0.1);
        }
        
        .enhanced-input {
          flex: 1;
          padding: 16px;
          background: transparent;
          border: none;
          outline: none;
          font-size: 16px;
          color: #1f2937;
          transition: padding 0.2s ease;
        }
        
        .enhanced-input:disabled {
          color: #9ca3af;
          cursor: not-allowed;
        }
        
        .input-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          transition: all 0.2s ease;
        }
        
        .input-icon.start {
          margin-left: 16px;
        }
        
        .input-icon.end {
          margin-right: 16px;
        }
        
        .input-label.floating {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          color: #6b7280;
          pointer-events: none;
          background: linear-gradient(to bottom, transparent 40%, white 40%, white 60%, transparent 60%);
          padding: 0 4px;
          transform-origin: left center;
        }
        
        .input-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          margin-right: 8px;
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .input-clear:hover {
          color: #6b7280;
        }
        
        .focus-indicator {
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #3b82f6;
          transform-origin: center;
        }
        
        .input-message {
          margin-top: 4px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .input-message.error {
          color: #ef4444;
        }
        
        .input-message.helper {
          color: #6b7280;
        }
        
        .char-count {
          position: absolute;
          right: 0;
          bottom: -20px;
          font-size: 12px;
          color: #9ca3af;
        }
        
        /* Variant: Filled */
        .enhanced-input-wrapper.filled .input-container {
          background: rgba(243, 244, 246, 0.8);
          border: 1px solid transparent;
        }
        
        .enhanced-input-wrapper.filled .input-container.focused {
          background: rgba(243, 244, 246, 0.9);
          border-color: #3b82f6;
        }
        
        /* Variant: Outlined */
        .enhanced-input-wrapper.outlined .input-container {
          background: transparent;
          border: 2px solid rgba(209, 213, 219, 0.8);
        }
        
        .enhanced-input-wrapper.outlined .input-container.focused {
          border-color: #3b82f6;
          background: rgba(255, 255, 255, 0.5);
        }
        
        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .input-label.static {
            color: #d1d5db;
          }
          
          .input-container {
            background: rgba(31, 41, 55, 0.7);
            border-color: rgba(75, 85, 99, 0.5);
          }
          
          .input-container.focused {
            background: rgba(31, 41, 55, 0.9);
          }
          
          .enhanced-input {
            color: #f3f4f6;
          }
          
          .input-label.floating {
            background: linear-gradient(to bottom, transparent 40%, #1f2937 40%, #1f2937 60%, transparent 60%);
          }
          
          .enhanced-input-wrapper.filled .input-container {
            background: rgba(55, 65, 81, 0.8);
          }
          
          .enhanced-input-wrapper.outlined .input-container {
            border-color: rgba(75, 85, 99, 0.8);
          }
        }
        
        /* Animations */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .input-container.error {
          animation: shake 0.3s ease;
        }
      `}</style>
    </div>
  );
});