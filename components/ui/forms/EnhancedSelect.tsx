import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface EnhancedSelectProps {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  className?: string;
}

export const EnhancedSelect = forwardRef<HTMLDivElement, EnhancedSelectProps>(({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  helperText,
  disabled = false,
  searchable = false,
  multiple = false,
  variant = 'default',
  className
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(
    multiple && value ? value.split(',') : value ? [value] : []
  );
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = searchTerm
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      setSelectedValues(newValues);
      onChange?.(newValues.join(','));
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
    }
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn('enhanced-select-wrapper', variant, className)}>
      {label && (
        <label className="select-label">
          {label}
        </label>
      )}

      <div
        className={cn(
          'select-container',
          isOpen && 'open',
          error && 'error',
          disabled && 'disabled'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={label}
        aria-controls="select-listbox"
      >
        <div className="select-value">
          {selectedOption ? (
            <div className="selected-option">
              {selectedOption.icon && (
                <span className="option-icon">{selectedOption.icon}</span>
              )}
              <span>{selectedOption.label}</span>
            </div>
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
        </div>

        <motion.div
          className="select-arrow"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </motion.div>

        {/* Focus ring */}
        <motion.div
          className="focus-ring"
          initial={false}
          animate={{
            opacity: isOpen ? 1 : 0,
            scale: isOpen ? 1 : 0.95
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="select-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          >
            {searchable && (
              <div className="search-container">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-input"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M6.5 12a5.5 5.5 0 100-11 5.5 5.5 0 000 11zM13 11.5l3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            )}

            <div className="options-list" role="listbox" id="select-listbox">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <motion.div
                    key={option.value}
                    className={cn(
                      'select-option',
                      selectedValues.includes(option.value) && 'selected',
                      option.disabled && 'disabled',
                      highlightedIndex === index && 'highlighted'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!option.disabled) {
                        handleSelect(option.value);
                      }
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={selectedValues.includes(option.value)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option.icon && (
                      <span className="option-icon">{option.icon}</span>
                    )}
                    <span className="option-label">{option.label}</span>
                    {multiple && selectedValues.includes(option.value) && (
                      <motion.svg
                        className="check-icon"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <path fillRule="evenodd" d="M13.707 5.293a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L8 9.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </motion.svg>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="no-options">No options found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper text and error */}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            className="select-message error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {error}
          </motion.div>
        ) : helperText ? (
          <motion.div
            key="helper"
            className="select-message helper"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {helperText}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <style jsx>{`
        .enhanced-select-wrapper {
          position: relative;
          width: 100%;
        }

        .select-label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .select-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(209, 213, 219, 0.5);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }

        .select-container:focus {
          outline: none;
        }

        .select-container.open {
          background: rgba(255, 255, 255, 0.9);
          border-color: #3b82f6;
          box-shadow: 
            0 0 0 3px rgba(59, 130, 246, 0.1),
            0 4px 16px rgba(59, 130, 246, 0.1);
        }

        .select-container.error {
          border-color: #ef4444;
        }

        .select-container.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .select-value {
          flex: 1;
          font-size: 16px;
          color: #1f2937;
        }

        .placeholder {
          color: #9ca3af;
        }

        .selected-option {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .option-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        .select-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .focus-ring {
          position: absolute;
          inset: -1px;
          border-radius: 12px;
          border: 2px solid #3b82f6;
          pointer-events: none;
        }

        .select-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(209, 213, 219, 0.3);
          border-radius: 12px;
          box-shadow: 
            0 10px 40px rgba(0, 0, 0, 0.1),
            0 4px 16px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .search-container {
          position: relative;
          padding: 12px;
          border-bottom: 1px solid rgba(209, 213, 219, 0.3);
        }

        .search-input {
          width: 100%;
          padding: 8px 32px 8px 12px;
          background: rgba(243, 244, 246, 0.5);
          border: 1px solid transparent;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          background: white;
          border-color: #3b82f6;
        }

        .search-icon {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .options-list {
          max-height: 300px;
          overflow-y: auto;
          padding: 4px;
        }

        .select-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          color: #1f2937;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .select-option.selected {
          background: rgba(59, 130, 246, 0.08);
          color: #3b82f6;
        }

        .select-option.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .select-option.highlighted {
          background: rgba(59, 130, 246, 0.05);
        }

        .option-label {
          flex: 1;
        }

        .check-icon {
          color: #3b82f6;
          margin-left: auto;
        }

        .no-options {
          padding: 24px;
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
        }

        .select-message {
          margin-top: 4px;
          font-size: 12px;
        }

        .select-message.error {
          color: #ef4444;
        }

        .select-message.helper {
          color: #6b7280;
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .select-label {
            color: #d1d5db;
          }

          .select-container {
            background: rgba(31, 41, 55, 0.7);
            border-color: rgba(75, 85, 99, 0.5);
          }

          .select-value {
            color: #f3f4f6;
          }

          .select-dropdown {
            background: rgba(31, 41, 55, 0.98);
            border-color: rgba(75, 85, 99, 0.3);
          }

          .search-input {
            background: rgba(55, 65, 81, 0.5);
            color: #f3f4f6;
          }

          .search-input:focus {
            background: rgba(55, 65, 81, 0.8);
          }

          .select-option {
            color: #f3f4f6;
          }

          .select-option.highlighted {
            background: rgba(59, 130, 246, 0.15);
          }
        }
      `}</style>
    </div>
  );
});