import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useNotifications } from './NotificationSystem';
import logger from '../../utils/logger';

// Smart search suggestions based on user history and popular searches
export const SmartSearchEnhancer = ({ onSearch, placeholder = "Search..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const searchRef = useRef(null);
  const router = useRouter();
  const { notify } = useNotifications();

  // Load search history and popular searches on mount
  useEffect(() => {
    loadSearchData();
  }, []);

  // Update suggestions when search term changes
  useEffect(() => {
    if (searchTerm.length > 0) {
      generateSuggestions(searchTerm);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  }, [searchTerm]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSearchData = () => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const popular = JSON.parse(localStorage.getItem('popularSearches') || '[]');
      
      setSearchHistory(history.slice(0, 10)); // Keep only last 10 searches
      setPopularSearches(popular.slice(0, 5)); // Keep top 5 popular searches
    } catch (error) {
      logger.error('Failed to load search data', { error });
    }
  };

  const saveSearchTerm = (term) => {
    try {
      // Add to search history
      const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));

      // Update popular searches (simplified frequency tracking)
      const popular = JSON.parse(localStorage.getItem('popularSearches') || '[]');
      const existingIndex = popular.findIndex(p => p.term === term);
      
      if (existingIndex >= 0) {
        popular[existingIndex].count++;
      } else {
        popular.push({ term, count: 1 });
      }
      
      const sortedPopular = popular.sort((a, b) => b.count - a.count).slice(0, 5);
      setPopularSearches(sortedPopular);
      localStorage.setItem('popularSearches', JSON.stringify(sortedPopular));
    } catch (error) {
      logger.error('Failed to save search term', { error, term });
    }
  };

  const generateSuggestions = (term) => {
    const lowerTerm = term.toLowerCase();
    const suggestions = [];

    // Pokemon name suggestions
    const pokemonSuggestions = [
      'Pikachu', 'Charizard', 'Blastoise', 'Venusaur', 'Mewtwo', 'Mew', 'Lugia', 'Ho-Oh',
      'Rayquaza', 'Dialga', 'Palkia', 'Giratina', 'Arceus', 'Reshiram', 'Zekrom', 'Kyurem',
      'Xerneas', 'Yveltal', 'Zygarde', 'Solgaleo', 'Lunala', 'Necrozma', 'Zacian', 'Zamazenta'
    ].filter(name => name.toLowerCase().includes(lowerTerm));

    // Search history suggestions
    const historySuggestions = searchHistory
      .filter(h => h.toLowerCase().includes(lowerTerm))
      .map(h => ({ term: h, type: 'history' }));

    // Popular search suggestions
    const popularSuggestions = popularSearches
      .filter(p => p.term.toLowerCase().includes(lowerTerm))
      .map(p => ({ term: p.term, type: 'popular', count: p.count }));

    // Combine all suggestions
    suggestions.push(
      ...pokemonSuggestions.slice(0, 3).map(term => ({ term, type: 'pokemon' })),
      ...historySuggestions.slice(0, 3),
      ...popularSuggestions.slice(0, 2)
    );

    // Remove duplicates and limit to 8 suggestions
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.term === suggestion.term)
      )
      .slice(0, 8);

    setSuggestions(uniqueSuggestions);
  };

  const handleSearch = (term = searchTerm) => {
    if (term.trim()) {
      saveSearchTerm(term.trim());
      setIsOpen(false);
      setSearchTerm(term);
      
      if (onSearch) {
        onSearch(term.trim());
      }
      
      // Show search notification
      notify.info(`Searching for "${term.trim()}"...`);
      
      logger.debug('Search performed', { term: term.trim() });
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSearch(suggestions[selectedIndex].term);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSearch(suggestion.term);
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'pokemon':
        return '⭐';
      case 'history':
        return '🕒';
      case 'popular':
        return '🔥';
      default:
        return '🔍';
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    notify.success('Search history cleared');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        />
        
        {/* Search icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Clear button */}
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.term}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`flex items-center px-4 py-2 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              <span className="mr-3 text-lg">{getSuggestionIcon(suggestion.type)}</span>
              <span className="flex-1">{suggestion.term}</span>
              {suggestion.type === 'popular' && (
                <span className="text-xs text-gray-400 ml-2">
                  {suggestion.count} searches
                </span>
              )}
            </div>
          ))}
          
          {/* Clear history option */}
          {searchHistory.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={clearSearchHistory}
                className="w-full px-4 py-2 text-left text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              >
                🗑️ Clear search history
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search shortcuts help */}
      <div className="absolute top-full left-0 mt-1 text-xs text-gray-400 pointer-events-none">
        <div>↑↓ Navigate • Enter: Search • Esc: Close</div>
      </div>
    </div>
  );
};

// Global search shortcut handler
export const GlobalSearchShortcuts = () => {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('[placeholder*="Search"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Quick navigation shortcuts
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        switch (e.key) {
          case 'P':
            e.preventDefault();
            router.push('/pokedex');
            break;
          case 'C':
            e.preventDefault();
            router.push('/cards');
            break;
          case 'F':
            e.preventDefault();
            router.push('/favorites');
            break;
          case 'H':
            e.preventDefault();
            router.push('/');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null;
};

export default SmartSearchEnhancer;