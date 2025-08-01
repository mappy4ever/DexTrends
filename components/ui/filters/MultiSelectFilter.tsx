import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  description?: string;
}

interface MultiSelectFilterProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  maxSelections?: number;
  searchable?: boolean;
  groupBy?: (option: Option) => string;
  className?: string;
}

export const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options...',
  label,
  maxSelections,
  searchable = true,
  groupBy,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search
  const filteredOptions = searchQuery
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Group options if groupBy is provided
  const groupedOptions = groupBy
    ? filteredOptions.reduce((acc, option) => {
        const group = groupBy(option);
        if (!acc[group]) acc[group] = [];
        acc[group].push(option);
        return acc;
      }, {} as Record<string, Option[]>)
    : { '': filteredOptions };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const toggleOption = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];

    if (maxSelections && newValues.length > maxSelections) {
      return;
    }

    onChange(newValues);
  };

  const selectAll = () => {
    const allValues = options.map(opt => opt.value);
    onChange(maxSelections ? allValues.slice(0, maxSelections) : allValues);
  };

  const clearAll = () => {
    onChange([]);
    setSearchQuery('');
  };

  const selectedOptions = options.filter(opt => selectedValues.includes(opt.value));
  const canSelectMore = !maxSelections || selectedValues.length < maxSelections;

  return (
    <div ref={containerRef} className={cn('multi-select-filter', className)}>
      {label && (
        <label className="filter-label">{label}</label>
      )}

      <motion.button
        className={cn('filter-trigger', isOpen && 'open')}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="trigger-content">
          {selectedValues.length === 0 ? (
            <span className="placeholder">{placeholder}</span>
          ) : (
            <div className="selected-preview">
              {selectedOptions.slice(0, 2).map((opt, index) => (
                <motion.span
                  key={opt.value}
                  className="preview-chip"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    backgroundColor: opt.color ? `${opt.color}20` : undefined,
                    borderColor: opt.color || undefined
                  }}
                >
                  {opt.icon && <span className="chip-icon">{opt.icon}</span>}
                  {opt.label}
                </motion.span>
              ))}
              
              {selectedValues.length > 2 && (
                <motion.span
                  className="more-count"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  +{selectedValues.length - 2} more
                </motion.span>
              )}
            </div>
          )}
        </div>

        <motion.div
          className="trigger-arrow"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 5.293a1 1 0 011.414 0L8 7.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </motion.div>

        {/* Selection counter */}
        {selectedValues.length > 0 && (
          <motion.span
            className="selection-counter"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            {selectedValues.length}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="filter-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          >
            {/* Header */}
            <div className="dropdown-header">
              {searchable && (
                <div className="search-container">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search options..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7 13A6 6 0 107 1a6 6 0 000 12zM12 12l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              )}

              <div className="header-actions">
                <button
                  className="action-btn"
                  onClick={selectAll}
                  disabled={!canSelectMore || filteredOptions.length === 0}
                >
                  Select all
                </button>
                <button
                  className="action-btn"
                  onClick={clearAll}
                  disabled={selectedValues.length === 0}
                >
                  Clear
                </button>
              </div>

              {maxSelections && (
                <div className="selection-limit">
                  {selectedValues.length} / {maxSelections} selected
                </div>
              )}
            </div>

            {/* Options */}
            <div className="options-container">
              {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                <div key={groupName} className="option-group">
                  {groupName && (
                    <div className="group-name">{groupName}</div>
                  )}
                  
                  {groupOptions.map((option, index) => {
                    const isSelected = selectedValues.includes(option.value);
                    const isDisabled = !isSelected && !canSelectMore;
                    
                    return (
                      <motion.label
                        key={option.value}
                        className={cn(
                          'option-item',
                          isSelected && 'selected',
                          isDisabled && 'disabled',
                          highlightedIndex === index && 'highlighted'
                        )}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ x: 4 }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOption(option.value)}
                          disabled={isDisabled}
                          className="option-checkbox"
                        />
                        
                        <motion.div
                          className="custom-checkbox"
                          animate={{
                            backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                            borderColor: isSelected ? '#3b82f6' : '#d1d5db'
                          }}
                        >
                          <AnimatePresence>
                            {isSelected && (
                              <motion.svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="white"
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 90 }}
                                transition={{ type: "spring", stiffness: 500 }}
                              >
                                <path d="M10 3L4.5 8.5 2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                              </motion.svg>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        
                        {option.icon && (
                          <span className="option-icon">{option.icon}</span>
                        )}
                        
                        <div className="option-content">
                          <span className="option-label">{option.label}</span>
                          {option.description && (
                            <span className="option-description">{option.description}</span>
                          )}
                        </div>
                        
                        {option.color && (
                          <span 
                            className="option-color"
                            style={{ backgroundColor: option.color }}
                          />
                        )}
                      </motion.label>
                    );
                  })}
                </div>
              ))}

              {filteredOptions.length === 0 && (
                <motion.div
                  className="no-options"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No options found
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .multi-select-filter {
          position: relative;
          width: 100%;
        }

        .filter-label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .filter-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(209, 213, 219, 0.5);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .filter-trigger:hover {
          background: rgba(255, 255, 255, 0.9);
          border-color: #d1d5db;
        }

        .filter-trigger.open {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .trigger-content {
          flex: 1;
          min-width: 0;
        }

        .placeholder {
          color: #9ca3af;
          font-size: 14px;
        }

        .selected-preview {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .preview-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          font-size: 12px;
          color: #1f2937;
        }

        .chip-icon {
          display: flex;
          width: 14px;
          height: 14px;
        }

        .more-count {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .trigger-arrow {
          display: flex;
          color: #6b7280;
        }

        .selection-counter {
          position: absolute;
          top: -8px;
          right: -8px;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: #3b82f6;
          color: white;
          font-size: 11px;
          font-weight: 600;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .filter-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(209, 213, 219, 0.3);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .dropdown-header {
          padding: 12px;
          border-bottom: 1px solid rgba(229, 231, 235, 0.3);
        }

        .search-container {
          position: relative;
          margin-bottom: 8px;
        }

        .search-input {
          width: 100%;
          padding: 8px 32px 8px 12px;
          background: rgba(243, 244, 246, 0.5);
          border: 1px solid transparent;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          background: white;
          border-color: #3b82f6;
        }

        .search-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .header-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .action-btn {
          flex: 1;
          padding: 6px 12px;
          background: transparent;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 12px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover:not(:disabled) {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .selection-limit {
          font-size: 11px;
          color: #9ca3af;
          text-align: center;
        }

        .options-container {
          max-height: 300px;
          overflow-y: auto;
          padding: 4px;
        }

        .option-group:not(:last-child) {
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(229, 231, 235, 0.3);
        }

        .group-name {
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .option-item:hover {
          background: rgba(243, 244, 246, 0.5);
        }

        .option-item.selected {
          background: rgba(59, 130, 246, 0.05);
        }

        .option-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .option-item.highlighted {
          background: rgba(59, 130, 246, 0.08);
        }

        .option-checkbox {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .custom-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .option-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        .option-content {
          flex: 1;
          min-width: 0;
        }

        .option-label {
          display: block;
          font-size: 14px;
          color: #1f2937;
        }

        .option-description {
          display: block;
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }

        .option-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .no-options {
          padding: 24px;
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .filter-label {
            color: #d1d5db;
          }

          .filter-trigger {
            background: rgba(31, 41, 55, 0.8);
            border-color: rgba(75, 85, 99, 0.5);
          }

          .preview-chip {
            background: rgba(59, 130, 246, 0.2);
            color: #f3f4f6;
          }

          .filter-dropdown {
            background: rgba(31, 41, 55, 0.98);
            border-color: rgba(75, 85, 99, 0.3);
          }

          .search-input {
            background: rgba(55, 65, 81, 0.5);
            color: #f3f4f6;
          }

          .option-label {
            color: #f3f4f6;
          }

          .custom-checkbox {
            border-color: #4b5563;
          }
        }
      `}</style>
    </div>
  );
};