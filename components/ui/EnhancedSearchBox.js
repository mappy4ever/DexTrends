import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * Enhanced search box with autocomplete, recent searches, and advanced features
 */
const EnhancedSearchBox = ({
  placeholder = "Search cards, Pokemon, sets...",
  onSearch = () => {},
  onFilterChange = () => {},
  className = "",
  enableVoiceSearch = true,
  enableAdvancedFilters = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    rarity: '',
    set: '',
    priceRange: [0, 1000]
  });

  const searchRef = useRef(null);
  const recognitionRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
  }, []);

  // Setup voice recognition
  useEffect(() => {
    if (enableVoiceSearch && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        handleSearch(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [enableVoiceSearch]);

  // Generate suggestions based on search term
  useEffect(() => {
    if (debouncedSearchTerm.length > 1) {
      generateSuggestions(debouncedSearchTerm);
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchTerm]);

  const generateSuggestions = useCallback(async (term) => {
    try {
      // Mock suggestion generation - replace with actual API call
      const mockSuggestions = [
        { type: 'pokemon', text: `${term} Pokemon`, icon: '🔍' },
        { type: 'card', text: `${term} Cards`, icon: '🃏' },
        { type: 'set', text: `${term} Set`, icon: '📦' },
        { type: 'recent', text: term, icon: '🕒' }
      ].filter(s => s.text.toLowerCase().includes(term.toLowerCase()));

      setSuggestions(mockSuggestions.slice(0, 5));
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  const handleSearch = useCallback((term = searchTerm) => {
    if (term.trim()) {
      // Add to recent searches
      const newRecentSearches = [
        term,
        ...recentSearches.filter(s => s !== term)
      ].slice(0, 10);
      
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
      
      // Execute search
      onSearch(term, filters);
    }
    setShowSuggestions(false);
  }, [searchTerm, filters, onSearch, recentSearches]);

  const handleVoiceSearch = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting voice recognition:', error);
      }
    }
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main search input */}
      <div className={`
        relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-300
        ${isExpanded ? 'border-blue-500 shadow-lg' : 'border-gray-300 dark:border-gray-600'}
      `}>
        <div className="flex items-center px-4 py-3">
          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          <input
            ref={searchRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              setIsExpanded(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsExpanded(false);
                setShowSuggestions(false);
              }, 200);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white"
          />

          {/* Voice search button */}
          {enableVoiceSearch && 'webkitSpeechRecognition' in window && (
            <button
              onClick={handleVoiceSearch}
              disabled={isListening}
              className={`
                ml-2 p-2 rounded-full transition-colors duration-200
                ${isListening 
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600'
                }
              `}
              title="Voice search"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
          )}

          {/* Clear button */}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Advanced filters toggle */}
          {enableAdvancedFilters && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
              title="Advanced filters"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </button>
          )}
        </div>

        {/* Advanced filters */}
        {enableAdvancedFilters && isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-600 p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Type filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Types</option>
                  <option value="fire">Fire</option>
                  <option value="water">Water</option>
                  <option value="grass">Grass</option>
                  <option value="electric">Electric</option>
                  <option value="psychic">Psychic</option>
                  <option value="fighting">Fighting</option>
                  <option value="darkness">Darkness</option>
                  <option value="metal">Metal</option>
                  <option value="fairy">Fairy</option>
                  <option value="dragon">Dragon</option>
                  <option value="colorless">Colorless</option>
                </select>
              </div>

              {/* Rarity filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rarity
                </label>
                <select
                  value={filters.rarity}
                  onChange={(e) => handleFilterChange('rarity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Rarities</option>
                  <option value="common">Common</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="rare">Rare</option>
                  <option value="rare holo">Rare Holo</option>
                  <option value="ultra rare">Ultra Rare</option>
                  <option value="secret rare">Secret Rare</option>
                </select>
              </div>

              {/* Set filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Set
                </label>
                <select
                  value={filters.set}
                  onChange={(e) => handleFilterChange('set', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Sets</option>
                  <option value="base1">Base Set</option>
                  <option value="jungle">Jungle</option>
                  <option value="fossil">Fossil</option>
                  <option value="base2">Base Set 2</option>
                </select>
              </div>

              {/* Price range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 1000])}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(suggestion.text);
                    handleSearch(suggestion.text);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <span className="mr-3">{suggestion.icon}</span>
                  <span className="text-gray-900 dark:text-white">{suggestion.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Recent Searches
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              </div>
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(search);
                    handleSearch(search);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-900 dark:text-white">{search}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBox;