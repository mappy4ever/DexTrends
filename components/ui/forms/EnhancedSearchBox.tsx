import React, { useState, useRef, useEffect } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { useSearchHistory } from '../../../hooks/useSearchHistory';

/**
 * Enhanced search box with debouncing, history, and suggestions
 */
interface EnhancedSearchBoxProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  showHistory?: boolean;
  showSearchButton?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
}

export default function EnhancedSearchBox({
  value = '', onChange = () => {},
  onSearch = () => {},
  placeholder = 'Search...',
  className = '',
  showHistory = true,
  showSearchButton = false,
  autoFocus = false,
  disabled = false
}: EnhancedSearchBoxProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const debouncedValue = useDebounce(localValue, 300);
  const isSearching = false; // Simple implementation for now
  // const { searchHistory, addToHistory, removeFromHistory, getSuggestions } = useSearchHistory();
  
  const suggestions: string[] = []; // showHistory ? getSuggestions(localValue) : [];

  // Notify parent of debounced changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setShowSuggestions(newValue.length > 0 && suggestions.length > 0);
    setSelectedSuggestion(-1);
  };

  // Handle search submission
  const handleSearch = (searchTerm = localValue) => {
    if (searchTerm.trim()) {
      // addToHistory(searchTerm.trim());
      onSearch(searchTerm.trim());
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          const suggestion = suggestions[selectedSuggestion];
          setLocalValue(suggestion);
          handleSearch(suggestion);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setLocalValue(suggestion);
    handleSearch(suggestion);
  };

  // Handle suggestion removal
  const handleRemoveSuggestion = (e: React.MouseEvent, suggestion: string) => {
    e.stopPropagation();
    // removeFromHistory(suggestion);
  };

  // Handle focus/blur
  const handleFocus = (): any => {
    if (localValue.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = (): any => {
    // Delay to allow suggestion clicks
    setTimeout(() => setShowSuggestions(false), 150);
  };

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Sync external value changes
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value, localValue]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg 
            className={`w-4 h-4 transition-colors ${isSearching ? 'text-pokemon-blue animate-pulse' : 'text-gray-400'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-3 
            border border-gray-300 rounded-lg 
            focus:ring-2 focus:ring-pokemon-blue/20 focus:border-pokemon-blue 
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-all duration-200
            ${isSearching ? 'border-pokemon-blue/50' : ''}
          `}
        />

        {/* Clear Button */}
        {localValue && (
          <button
            type="button"
            onClick={() => {
              setLocalValue('');
              onChange('');
              setShowSuggestions(false);
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Search Button */}
        {showSearchButton && (
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={!localValue.trim() || disabled}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-pokemon-blue hover:text-pokemon-red transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <div className="py-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`
                  flex items-center justify-between px-3 py-2 cursor-pointer text-sm
                  ${index === selectedSuggestion ? 'bg-pokemon-blue/10 text-pokemon-blue' : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{suggestion}</span>
                </div>
                <button
                  onClick={(e: any) => handleRemoveSuggestion(e, suggestion)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove from history"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isSearching && (
        <div className="absolute right-0 top-0 h-full flex items-center pr-3">
          <div className="w-3 h-3 border-2 border-pokemon-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}