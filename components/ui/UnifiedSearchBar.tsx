import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { createGlassStyle } from './design-system/glass-constants';
import { useDebounce } from '@/hooks/useDebounce';
import logger from '@/utils/logger';

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

  // Size configurations
  const sizeClasses = {
    sm: 'py-2 text-sm',
    md: 'py-3 text-base',
    lg: 'py-4 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Variant configurations
  const variantClasses = {
    default: createGlassStyle({
      blur: 'xl',
      opacity: 'medium',
      gradient: true,
      border: 'medium',
      shadow: 'md',
      rounded: 'full',
    }),
    minimal: 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700/20',
    bordered: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 border-purple-400/30',
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

  return (
    <div className={`relative ${className}`}>
      <div className={`relative flex items-center ${variantClasses[variant]} rounded-full ${isFocused ? 'ring-2 ring-purple-400/30' : ''}`}>
        {/* Search Icon */}
        <div className="absolute left-4 pointer-events-none">
          {loading ? (
            <div className={`${iconSizes[size]} animate-spin rounded-full border-2 border-purple-400 border-t-transparent`} />
          ) : (
            <FiSearch className={`${iconSizes[size]} text-gray-400`} />
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
            w-full pl-12 ${value ? 'pr-10' : 'pr-4'} ${sizeClasses[size]}
            bg-transparent outline-none
            placeholder:text-gray-500 text-gray-800 dark:text-gray-200
            ${inputClassName}
          `}
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
            tabIndex={-1}
          >
            <FiX className={`${iconSizes[size]} text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`} />
          </button>
        )}

        {/* Search Button (optional) */}
        {showSearchButton && (
          <button
            onClick={handleSearch}
            className={`
              ml-2 mr-2 px-4 ${sizeClasses[size]}
              bg-gradient-to-r from-purple-500 to-pink-500 text-white
              rounded-full font-medium
              hover:from-purple-600 hover:to-pink-600
              transition-all duration-300
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`
              absolute top-full mt-2 w-full z-50
              ${createGlassStyle({
                blur: 'xl',
                opacity: 'strong',
                gradient: true,
                border: 'medium',
                shadow: 'xl',
                rounded: 'xl',
              })}
              rounded-2xl overflow-hidden
            `}
          >
            <div className="py-2">
              {displaySuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="w-full px-4 py-2 text-left hover:bg-white/20 dark:hover:bg-gray-700/20 transition-colors flex items-center gap-3"
                >
                  {suggestion.type === 'recent' && (
                    <span className="text-xs text-gray-500">Recent</span>
                  )}
                  {suggestion.icon}
                  <span className="flex-1 text-gray-800 dark:text-gray-200">{suggestion.text}</span>
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