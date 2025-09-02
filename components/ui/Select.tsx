import React, { forwardRef, SelectHTMLAttributes, useState, useRef, useEffect } from 'react';
import { IoChevronDown, IoCheckmark, IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useViewport } from '../../hooks/useViewport';
const hapticManager = typeof window !== 'undefined' ? require('../../utils/hapticFeedback').default : null;

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  maxHeight?: number;
  showCheckmarks?: boolean;
  mobileNative?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select an option',
      label,
      error,
      helperText,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      loading = false,
      searchable = false,
      clearable = false,
      multiple = false,
      maxHeight = 300,
      showCheckmarks = true,
      mobileNative = true,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedValues, setSelectedValues] = useState<string[]>(
      multiple ? (Array.isArray(value) ? value : value ? [value] : []) : []
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const viewport = useViewport();

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Size styles
    const sizeStyles = {
      sm: {
        button: 'h-9 px-3 text-sm',
        icon: 'h-4 w-4',
        option: 'py-1.5 px-3 text-sm'
      },
      md: {
        button: 'h-11 px-4 text-base',
        icon: 'h-5 w-5',
        option: 'py-2 px-4 text-base'
      },
      lg: {
        button: 'h-[52px] px-5 text-lg',
        icon: 'h-6 w-6',
        option: 'py-3 px-5 text-lg'
      }
    };

    // Variant styles
    const variantStyles = {
      default: cn(
        'bg-white dark:bg-gray-800',
        'border border-gray-300 dark:border-gray-600',
        'hover:border-gray-400 dark:hover:border-gray-500'
      ),
      filled: cn(
        'bg-gray-100 dark:bg-gray-700',
        'border border-transparent',
        'hover:bg-gray-200 dark:hover:bg-gray-600'
      ),
      outline: cn(
        'bg-transparent',
        'border-2 border-gray-300 dark:border-gray-600',
        'hover:border-gray-400 dark:hover:border-gray-500'
      ),
      ghost: cn(
        'bg-transparent',
        'border border-transparent',
        'hover:bg-gray-100 dark:hover:bg-gray-800'
      )
    };

    const filteredOptions = searchable
      ? options.filter(option =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    const handleSelect = (optionValue: string) => {
      if (hapticManager) {
        hapticManager.selection('light');
      }

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
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hapticManager) {
        hapticManager.button('tap');
      }
      onChange?.('');
      setSelectedValues([]);
    };

    const selectedOption = options.find(opt => opt.value === value);
    const displayValue = multiple
      ? selectedValues.length > 0
        ? `${selectedValues.length} selected`
        : placeholder
      : selectedOption?.label || placeholder;

    // Use native select on mobile if enabled
    if (viewport.isMobile && mobileNative && !searchable && !multiple) {
      return (
        <div className={cn('relative', fullWidth && 'w-full', className)}>
          {label && (
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {label}
            </label>
          )}
          <div className="relative">
            <select
              ref={ref}
              value={value}
              onChange={(e) => {
                if (hapticManager) {
                  hapticManager.selection('light');
                }
                onChange?.(e.target.value);
              }}
              disabled={disabled || loading}
              className={cn(
                'w-full rounded-lg appearance-none pr-10',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                'transition-all duration-200',
                sizeStyles[size].button,
                variantStyles[variant],
                error && 'border-red-500 dark:border-red-400',
                disabled && 'opacity-50 cursor-not-allowed',
                className
              )}
              {...props}
            >
              <option value="">{placeholder}</option>
              {options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}
            </select>
            <IoChevronDown 
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none',
                sizeStyles[size].icon,
                'text-gray-500 dark:text-gray-400'
              )}
            />
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
          )}
          {helperText && !error && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
          )}
        </div>
      );
    }

    // Custom dropdown for desktop and advanced features
    return (
      <div 
        ref={containerRef}
        className={cn('relative', fullWidth && 'w-full', className)}
      >
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        
        <button
          type="button"
          onClick={() => {
            if (!disabled && !loading) {
              setIsOpen(!isOpen);
              if (hapticManager) {
                hapticManager.button('tap');
              }
            }
          }}
          disabled={disabled || loading}
          className={cn(
            'w-full rounded-lg flex items-center justify-between',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'transition-all duration-200',
            sizeStyles[size].button,
            variantStyles[variant],
            error && 'border-red-500 dark:border-red-400',
            disabled && 'opacity-50 cursor-not-allowed',
            'min-h-[44px]' // Touch target compliance
          )}
        >
          <span className={cn(
            'flex-1 text-left truncate',
            !selectedOption && !multiple && 'text-gray-500 dark:text-gray-400'
          )}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                Loading...
              </span>
            ) : (
              displayValue
            )}
          </span>
          
          <div className="flex items-center gap-1">
            {clearable && value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <IoClose className={sizeStyles[size].icon} />
              </button>
            )}
            <IoChevronDown 
              className={cn(
                sizeStyles[size].icon,
                'text-gray-500 dark:text-gray-400 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute z-50 w-full mt-1',
                'bg-white dark:bg-gray-800',
                'border border-gray-200 dark:border-gray-700',
                'rounded-lg shadow-lg',
                'overflow-hidden'
              )}
              style={{ maxHeight }}
            >
              {searchable && (
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 rounded',
                      'bg-gray-50 dark:bg-gray-700',
                      'border border-gray-200 dark:border-gray-600',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500',
                      'text-sm'
                    )}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              <div className="overflow-y-auto" style={{ maxHeight: maxHeight - (searchable ? 60 : 0) }}>
                {filteredOptions.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = multiple
                      ? selectedValues.includes(option.value)
                      : option.value === value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        disabled={option.disabled}
                        className={cn(
                          'w-full text-left',
                          'hover:bg-gray-100 dark:hover:bg-gray-700',
                          'transition-colors duration-150',
                          'flex items-center justify-between gap-2',
                          sizeStyles[size].option,
                          isSelected && 'bg-blue-50 dark:bg-blue-900/20',
                          option.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {option.icon && (
                            <span className="flex-shrink-0">{option.icon}</span>
                          )}
                          <div className="flex-1">
                            <div className={cn(
                              'font-medium',
                              isSelected && 'text-blue-600 dark:text-blue-400'
                            )}>
                              {option.label}
                            </div>
                            {option.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </div>
                        {showCheckmarks && isSelected && (
                          <IoCheckmark className={cn(
                            sizeStyles[size].icon,
                            'text-blue-600 dark:text-blue-400 flex-shrink-0'
                          )} />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;