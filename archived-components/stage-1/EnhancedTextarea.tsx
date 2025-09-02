import React, { useState, useRef, forwardRef, TextareaHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface EnhancedTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
  autoResize?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  resizable?: boolean;
}

export const EnhancedTextarea = forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(({
  label,
  error,
  helperText,
  showCharCount = false,
  maxLength,
  autoResize = false,
  variant = 'default',
  resizable = true,
  className,
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(value?.toString().length || 0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Combine refs
  React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);
  
  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
    
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    
    onChange?.(e);
  };
  
  const getCharCountColor = () => {
    if (!maxLength) return '#9ca3af';
    const percentage = charCount / maxLength;
    if (percentage >= 1) return '#ef4444';
    if (percentage >= 0.9) return '#f59e0b';
    return '#9ca3af';
  };
  
  return (
    <div className={cn('enhanced-textarea-wrapper', variant, className)}>
      {label && (
        <motion.label
          className="textarea-label"
          animate={{
            color: error ? '#ef4444' : isFocused ? '#3b82f6' : '#374151'
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
      
      <div className={cn(
        'textarea-container',
        isFocused && 'focused',
        error && 'error',
        !resizable && 'no-resize'
      )}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="enhanced-textarea"
          maxLength={maxLength}
          {...props}
        />
        
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
        
        {/* Character count */}
        {showCharCount && (
          <motion.div
            className="char-count-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.span
              className="char-count"
              animate={{ color: getCharCountColor() }}
              transition={{ duration: 0.2 }}
            >
              {charCount}{maxLength && `/${maxLength}`}
            </motion.span>
            
            {maxLength && (
              <motion.div
                className="char-progress"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: Math.min(charCount / maxLength, 1) }}
                style={{
                  backgroundColor: getCharCountColor(),
                  transformOrigin: 'left'
                }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.div>
        )}
      </div>
      
      {/* Helper text and error */}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            className="textarea-message error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 6a1 1 0 012 0v3a1 1 0 11-2 0V6zm1 5a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.div>
        ) : helperText ? (
          <motion.div
            key="helper"
            className="textarea-message helper"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {helperText}
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      <style jsx>{`
        .enhanced-textarea-wrapper {
          position: relative;
          width: 100%;
        }
        
        .textarea-label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        
        .textarea-container {
          position: relative;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(209, 213, 219, 0.5);
          border-radius: 12px;
          transition: all 0.2s ease;
          overflow: hidden;
        }
        
        .textarea-container.focused {
          background: rgba(255, 255, 255, 0.9);
          border-color: #3b82f6;
          box-shadow: 
            0 0 0 3px rgba(59, 130, 246, 0.1),
            0 4px 16px rgba(59, 130, 246, 0.1);
        }
        
        .textarea-container.error {
          border-color: #ef4444;
        }
        
        .textarea-container.error.focused {
          box-shadow: 
            0 0 0 3px rgba(239, 68, 68, 0.1),
            0 4px 16px rgba(239, 68, 68, 0.1);
        }
        
        .textarea-container.no-resize .enhanced-textarea {
          resize: none;
        }
        
        .enhanced-textarea {
          width: 100%;
          padding: 16px;
          background: transparent;
          border: none;
          outline: none;
          font-size: 16px;
          line-height: 1.5;
          color: #1f2937;
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
        }
        
        .enhanced-textarea:disabled {
          color: #9ca3af;
          cursor: not-allowed;
          resize: none;
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
        
        .char-count-container {
          position: absolute;
          bottom: 8px;
          right: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .char-count {
          font-size: 12px;
          font-weight: 500;
        }
        
        .char-progress {
          width: 50px;
          height: 2px;
          background: #9ca3af;
          border-radius: 1px;
        }
        
        .textarea-message {
          margin-top: 4px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .textarea-message.error {
          color: #ef4444;
        }
        
        .textarea-message.helper {
          color: #6b7280;
        }
        
        /* Variant: Filled */
        .enhanced-textarea-wrapper.filled .textarea-container {
          background: rgba(243, 244, 246, 0.8);
          border: 1px solid transparent;
        }
        
        .enhanced-textarea-wrapper.filled .textarea-container.focused {
          background: rgba(243, 244, 246, 0.9);
          border-color: #3b82f6;
        }
        
        /* Variant: Outlined */
        .enhanced-textarea-wrapper.outlined .textarea-container {
          background: transparent;
          border: 2px solid rgba(209, 213, 219, 0.8);
        }
        
        .enhanced-textarea-wrapper.outlined .textarea-container.focused {
          border-color: #3b82f6;
          background: rgba(255, 255, 255, 0.5);
        }
        
        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .textarea-label {
            color: #d1d5db;
          }
          
          .textarea-container {
            background: rgba(31, 41, 55, 0.7);
            border-color: rgba(75, 85, 99, 0.5);
          }
          
          .textarea-container.focused {
            background: rgba(31, 41, 55, 0.9);
          }
          
          .enhanced-textarea {
            color: #f3f4f6;
          }
          
          .char-count-container {
            background: rgba(31, 41, 55, 0.9);
          }
          
          .enhanced-textarea-wrapper.filled .textarea-container {
            background: rgba(55, 65, 81, 0.8);
          }
          
          .enhanced-textarea-wrapper.outlined .textarea-container {
            border-color: rgba(75, 85, 99, 0.8);
          }
        }
        
        /* Scrollbar styling */
        .enhanced-textarea::-webkit-scrollbar {
          width: 8px;
        }
        
        .enhanced-textarea::-webkit-scrollbar-track {
          background: rgba(209, 213, 219, 0.3);
          border-radius: 4px;
        }
        
        .enhanced-textarea::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 4px;
        }
        
        .enhanced-textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </div>
  );
});