import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaTimes, FaSlidersH } from 'react-icons/fa';
import { useDebounce } from '../../hooks/useDebounce';
import logger from '../../utils/logger';

interface FilterOption {
  value: string;
  label: string;
}

interface BaseFilter {
  id: string;
  label: string;
  type: 'select' | 'range' | 'checkbox';
}

interface SelectFilter extends BaseFilter {
  type: 'select';
  options: FilterOption[];
}

interface RangeFilter extends BaseFilter {
  type: 'range';
  min: number;
  max: number;
}

interface CheckboxFilter extends BaseFilter {
  type: 'checkbox';
  options: FilterOption[];
}

type Filter = SelectFilter | RangeFilter | CheckboxFilter;

interface Suggestion {
  text: string;
  type?: 'suggestion' | 'history';
  category?: string;
}

interface ActiveFilters {
  [key: string]: string | number | string[];
}

interface SearchPayload {
  query: string;
  filters: ActiveFilters;
}

interface AdvancedSearchInterfaceProps {
  onSearch?: (payload: SearchPayload) => void;
  onFilterChange?: (filters: ActiveFilters) => void;
  placeholder?: string;
  initialValue?: string;
  filters?: Filter[];
  suggestions?: Suggestion[];
  showFilters?: boolean;
  showSuggestions?: boolean;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Advanced Search Interface Component
 * Provides enhanced search experience with filters, suggestions, and real-time results
 */
const AdvancedSearchInterface: React.FC<AdvancedSearchInterfaceProps> = ({
  onSearch,
  onFilterChange,
  placeholder = "Search Pokémon cards...",
  initialValue = "",
  filters = [],
  suggestions = [],
  showFilters = true,
  showSuggestions = true,
  autoFocus = false,
  className = ""
}) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Debounce search input
  const debouncedSearchValue = useDebounce(searchValue, 300);
  
  // Load search history from localStorage
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('pokemon_search_history') || '[]') as string[];
      setSearchHistory(history.slice(0, 10)); // Keep only last 10 searches
    } catch (error) {
      setSearchHistory([]);
    }
  }, []);
  
  // Save search to history
  const saveToHistory = useCallback((query: string) => {
    if (!query.trim() || query.length < 2) return;
    
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    
    try {
      localStorage.setItem('pokemon_search_history', JSON.stringify(newHistory));
    } catch (error) {
      logger.warn('Failed to save search history', error);
    }
  }, [searchHistory]);
  
  // Handle search execution
  const executeSearch = useCallback((query: string = searchValue, saveHistory: boolean = true) => {
    if (saveHistory && query.trim()) {
      saveToHistory(query.trim());
    }
    
    if (onSearch) {
      onSearch({
        query: query.trim(),
        filters: activeFilters
      });
    }
    
    setShowSuggestionsPanel(false);
    setSuggestionIndex(-1);
    
    logger.debug('Search executed', { query, filters: activeFilters });
  }, [searchValue, activeFilters, onSearch, saveToHistory]);
  
  // Debounced search effect
  useEffect(() => {
    if (debouncedSearchValue !== initialValue) {
      executeSearch(debouncedSearchValue, false);
    }
  }, [debouncedSearchValue, executeSearch, initialValue]);
  
  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setShowSuggestionsPanel(value.length > 0);
    setSuggestionIndex(-1);
  }, []);
  
  // Handle input focus
  const handleInputFocus = useCallback(() => {
    if (searchValue.length > 0 || searchHistory.length > 0) {
      setShowSuggestionsPanel(true);
    }
  }, [searchValue, searchHistory]);
  
  // Handle input blur
  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestionsPanel(false);
        setSuggestionIndex(-1);
      }
    }, 200);
  }, []);
  
  // Filter suggestions based on input
  const filteredSuggestions = useMemo((): Suggestion[] => {
    if (!searchValue.trim()) {
      return searchHistory.map(h => ({ text: h, type: 'history' as const }));
    }
    
    const query = searchValue.toLowerCase();
    return suggestions
      .filter(s => s.text.toLowerCase().includes(query))
      .slice(0, 8)
      .map(s => ({ ...s, type: 'suggestion' as const }));
  }, [searchValue, suggestions, searchHistory]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSuggestionIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (suggestionIndex >= 0 && filteredSuggestions[suggestionIndex]) {
          const suggestion = filteredSuggestions[suggestionIndex];
          setSearchValue(suggestion.text);
          executeSearch(suggestion.text);
        } else {
          executeSearch();
        }
        break;
        
      case 'Escape':
        setShowSuggestionsPanel(false);
        setSuggestionIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  }, [showSuggestions, suggestionIndex, filteredSuggestions, executeSearch]);
  
  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    setSearchValue(suggestion.text);
    executeSearch(suggestion.text);
  }, [executeSearch]);
  
  // Handle filter change
  const handleFilterChange = useCallback((filterId: string, value: string | number | string[] | null) => {
    const newFilters = { ...activeFilters };
    
    if (value === null || value === undefined || value === '') {
      delete newFilters[filterId];
    } else {
      newFilters[filterId] = value;
    }
    
    setActiveFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
    
    // Re-search with new filters
    executeSearch(searchValue, false);
  }, [activeFilters, onFilterChange, executeSearch, searchValue]);
  
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchValue('');
    setActiveFilters({});
    setShowSuggestionsPanel(false);
    setSuggestionIndex(-1);
    executeSearch('', false);
  }, [executeSearch]);
  
  // Auto-focus effect
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);
  
  // Active filter count
  const activeFilterCount = Object.keys(activeFilters).length;
  
  return (
    <div className={`advanced-search-interface ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <FaSearch className="absolute left-3 h-5 w-5 text-gray-400" />
          
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            aria-haspopup="listbox"
            role="combobox"
            aria-expanded={showSuggestionsPanel && filteredSuggestions.length > 0}
            aria-controls="suggestions-listbox"
            aria-activedescendant={suggestionIndex >= 0 ? `suggestion-${suggestionIndex}` : undefined}
          />
          
          <div className="absolute right-3 flex items-center space-x-2">
            {searchValue && (
              <button
                onClick={clearSearch}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Clear search"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            )}
            
            {showFilters && (
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`p-1 transition-colors relative ${
                  showFilterPanel || activeFilterCount > 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                aria-label="Search filters"
              >
                <FaSlidersH className="h-5 w-5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Suggestions Dropdown */}
        {showSuggestions && showSuggestionsPanel && filteredSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            id="suggestions-listbox"
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
            role="listbox"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                id={`suggestion-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center space-x-3 ${
                  index === suggestionIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                role="option"
                aria-selected={index === suggestionIndex}
              >
                <span className="text-gray-400 dark:text-gray-500">
                  {suggestion.type === 'history' ? '🕒' : '🔍'}
                </span>
                <span className="flex-1 text-gray-900 dark:text-gray-100">
                  {suggestion.text}
                </span>
                {suggestion.category && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {suggestion.category}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Filter Panel */}
      {showFilters && showFilterPanel && (
        <div
          ref={filterPanelRef}
          className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Search Filters
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setActiveFilters({})}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.id} className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {filter.label}
                </label>
                
                {filter.type === 'select' && (
                  <select
                    value={activeFilters[filter.id] as string || ''}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All {filter.label}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                
                {filter.type === 'range' && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={filter.min}
                      max={filter.max}
                      value={activeFilters[filter.id] as number || filter.min}
                      onChange={(e) => handleFilterChange(filter.id, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{filter.min}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {activeFilters[filter.id] || filter.min}
                      </span>
                      <span>{filter.max}</span>
                    </div>
                  </div>
                )}
                
                {filter.type === 'checkbox' && (
                  <div className="space-y-2">
                    {filter.options.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={(activeFilters[filter.id] as string[] || []).includes(option.value)}
                          onChange={(e) => {
                            const currentValues = activeFilters[filter.id] as string[] || [];
                            const newValues = e.target.checked
                              ? [...currentValues, option.value]
                              : currentValues.filter(v => v !== option.value);
                            handleFilterChange(filter.id, newValues.length > 0 ? newValues : null);
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([filterId, value]) => {
            const filter = filters.find(f => f.id === filterId);
            if (!filter) return null;
            
            let displayValue: string = String(value);
            if (Array.isArray(value)) {
              displayValue = value.join(', ');
            } else if (filter.type === 'select') {
              const option = filter.options.find(o => o.value === value);
              displayValue = option ? option.label : String(value);
            }
            
            return (
              <span
                key={filterId}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
              >
                {filter.label}: {displayValue}
                <button
                  onClick={() => handleFilterChange(filterId, null)}
                  className="ml-2 h-4 w-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center justify-center"
                  aria-label={`Remove ${filter.label} filter`}
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchInterface;