import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import logger from '@/utils/logger';
import { Search, X } from '@/utils/icons';

interface SearchSuggestion {
  id: string;
  text: string;
  type?: 'recent' | 'suggestion';
  icon?: React.ReactNode;
}

interface UnifiedSearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  suggestions?: SearchSuggestion[];
  showSuggestions?: boolean;
  recentSearches?: string[];
  maxRecentSearches?: number;
  debounceMs?: number;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'bordered';
  showSearchButton?: boolean;
  searchButtonText?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  loading?: boolean;
}

const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = ({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onSearch,
  onClear,
  suggestions = [],
  showSuggestions = true,
  recentSearches = [],
  maxRecentSearches = 5,
  debounceMs = 300,
  autoFocus = false,
  className = '',
  inputClassName = '',
  size = 'md',
  variant = 'default',
  showSearchButton = false,
  searchButtonText = 'Search',
  onFocus,
  onBlur,
  loading = false,
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [localRecentSearches, setLocalRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const debouncedValue = useDebounce(value, debounceMs);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        const parsed = JSON.parse(stored);
        setLocalRecentSearches(parsed.slice(0, maxRecentSearches));
      }
    } catch (error) {
      logger.error('Failed to load recent searches', { error });
    }
  }, [maxRecentSearches]);

  // Save search to recent searches
  const saveToRecentSearches = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    try {
      const updated = [searchTerm, ...localRecentSearches.filter(s => s !== searchTerm)].slice(0, maxRecentSearches);
      setLocalRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      logger.error('Failed to save recent search', { error });
    }
  }, [localRecentSearches, maxRecentSearches]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
    
    if (showSuggestions && newValue.length > 0) {
      setShowDropdown(true);
    }
  };

  // Handle search submission
  const handleSearch = () => {
    if (value.trim()) {
      saveToRecentSearches(value);
      onSearch?.(value);
      setShowDropdown(false);
    }
  };

  // Handle clear
  const handleClear = () => {
    setInternalValue('');
    onChange?.('');
    onClear?.();
    inputRef.current?.focus();
    setShowDropdown(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInternalValue(suggestion);
    onChange?.(suggestion);
    onSearch?.(suggestion);
    saveToRecentSearches(suggestion);
    setShowDropdown(false);
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    if (showSuggestions && (value.length > 0 || localRecentSearches.length > 0)) {
      setShowDropdown(true);
    }
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent) => {
    // Don't blur if clicking within dropdown
    if (dropdownRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsFocused(false);
    onBlur?.();
    setTimeout(() => setShowDropdown(false), 200);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      if (value) {
        handleClear();
      } else {
        inputRef.current?.blur();
      }
    }
  };

  // Size configurations - consistent with design system
  const sizeConfig = {
    sm: { height: 'h-9', padding: 'pl-10 pr-9', text: 'text-sm', iconSize: 'w-4 h-4', iconLeft: 'left-3' },
    md: { height: 'h-11', padding: 'pl-12 pr-10', text: 'text-base', iconSize: 'w-5 h-5', iconLeft: 'left-4' },
    lg: { height: 'h-12', padding: 'pl-12 pr-10', text: 'text-base', iconSize: 'w-5 h-5', iconLeft: 'left-4' },
  };

  // Variant configurations - clean, consistent styling
  const variantClasses = {
    default: 'bg-white dark:bg-stone-800/95 border border-stone-200 dark:border-stone-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
    minimal: 'bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/50',
    bordered: 'bg-white dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-600',
  };

  // Combine suggestions with recent searches
  const displaySuggestions: SearchSuggestion[] = [
    ...localRecentSearches.filter(s => s.toLowerCase().includes(value.toLowerCase())).map(s => ({
      id: `recent-${s}`,
      text: s,
      type: 'recent' as const,
      icon: undefined,
    })),
    ...suggestions,
  ].slice(0, 8);

  const currentSize = sizeConfig[size];

  return (
    <div className={`relative ${className}`}>
      <div className={`relative flex items-center ${variantClasses[variant]} rounded-xl ${currentSize.height} ${isFocused ? 'ring-2 ring-blue-500/20 border-blue-500' : ''} transition-all duration-150`}>
        {/* Search Icon */}
        <div className={`absolute ${currentSize.iconLeft} top-1/2 -translate-y-1/2 pointer-events-none`}>
          {loading ? (
            <div className={`${currentSize.iconSize} animate-spin rounded-full border-2 border-blue-500 border-t-transparent`} />
          ) : (
            <Search className={`${currentSize.iconSize} text-stone-400`} />
          )}
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`
            w-full ${currentSize.padding} ${currentSize.text} ${currentSize.height}
            bg-transparent outline-none rounded-xl
            placeholder:text-stone-400 text-stone-900 dark:text-stone-100
            ${inputClassName}
          `}
          style={{ fontSize: '16px' }}
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors duration-150"
            tabIndex={-1}
          >
            <X className={`${currentSize.iconSize} text-stone-400 hover:text-stone-600 dark:hover:text-stone-300`} />
          </button>
        )}

        {/* Search Button (optional) */}
        {showSearchButton && (
          <button
            onClick={handleSearch}
            className={`
              mr-1.5 px-4 py-1.5
              bg-blue-600 text-white text-sm font-medium
              rounded-lg
              hover:bg-blue-700
              transition-colors duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            disabled={!value.trim() || loading}
          >
            {searchButtonText}
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showDropdown && displaySuggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full z-50 bg-white dark:bg-stone-800/95 border border-stone-200 dark:border-stone-700 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            <div className="py-1.5">
              {displaySuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="w-full px-3 py-2.5 text-left hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors duration-150 flex items-center gap-3"
                >
                  {suggestion.type === 'recent' && (
                    <span className="text-xs text-stone-400 px-1.5 py-0.5 bg-stone-100 dark:bg-stone-700 rounded">Recent</span>
                  )}
                  {suggestion.icon}
                  <span className="flex-1 text-stone-900 dark:text-stone-100 text-sm">{suggestion.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnifiedSearchBar;