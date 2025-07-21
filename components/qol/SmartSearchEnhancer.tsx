import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useNotifications } from './NotificationSystem';
import logger from '../../utils/logger';

// Type definitions
interface SearchSuggestion {
  term: string;
  type: 'pokemon' | 'history' | 'popular';
  count?: number;
}

interface PopularSearch {
  term: string;
  count: number;
}

interface SmartSearchEnhancerProps {
  onSearch?: (term: string) => void;
  placeholder?: string;
}

// Smart search suggestions based on user history and popular searches
export const SmartSearchEnhancer: React.FC<SmartSearchEnhancerProps> = ({ 
  onSearch, 
  placeholder = "Search..." 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
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
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
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

  const saveSearchTerm = (term: string) => {
    try {
      // Add to search history
      const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));

      // Update popular searches (simplified frequency tracking)
      const popular = JSON.parse(localStorage.getItem('popularSearches') || '[]') as PopularSearch[];
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

  const generateSuggestions = (term: string) => {
    const lowerTerm = term.toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    // Pokemon name suggestions
    const pokemonSuggestions = [
      'Pikachu', 'Charizard', 'Blastoise', 'Venusaur', 'Mewtwo', 'Mew', 'Lugia', 'Ho-Oh',
      'Rayquaza', 'Dialga', 'Palkia', 'Giratina', 'Arceus', 'Reshiram', 'Zekrom', 'Kyurem',
      'Xerneas', 'Yveltal', 'Zygarde', 'Solgaleo', 'Lunala', 'Necrozma', 'Zacian', 'Zamazenta'
    ].filter(name => name.toLowerCase().includes(lowerTerm));

    // Search history suggestions
    const historySuggestions = searchHistory
      .filter(h => h.toLowerCase().includes(lowerTerm))
      .map(h => ({ term: h, type: 'history' as const }));

    // Popular search suggestions
    const popularSuggestions = popularSearches
      .filter(p => p.term.toLowerCase().includes(lowerTerm))
      .map(p => ({ term: p.term, type: 'popular' as const, count: p.count }));

    // Combine all suggestions
    suggestions.push(
      ...pokemonSuggestions.slice(0, 3).map(term => ({ term, type: 'pokemon' as const })),
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

  const handleSearch = (term: string = searchTerm) => {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.term);
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
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
          className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        
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
              {suggestion.type === 'popular' && suggestion.count && (
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

// Global command palette interface
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Available commands
  const commands = [
    { id: 'pokedex', label: 'Go to Pokedex', shortcut: 'Ctrl+Shift+P', action: () => router.push('/pokedex') },
    { id: 'tcgsets', label: 'Go to TCG Sets', shortcut: 'Ctrl+Shift+C', action: () => router.push('/tcgsets') },
    { id: 'fun', label: 'Go to Fun Page', shortcut: 'Ctrl+Shift+F', action: () => router.push('/fun') },
    { id: 'home', label: 'Go to Home', shortcut: 'Ctrl+Shift+H', action: () => router.push('/') },
    { id: 'pocketmode', label: 'Go to Pocket Mode', shortcut: '', action: () => router.push('/pocketmode') },
    { id: 'battle', label: 'Go to Battle Simulator', shortcut: '', action: () => router.push('/battle-simulator') },
    { id: 'preferences', label: 'Open Preferences', shortcut: 'Ctrl+,', action: () => {
      // This will be handled by the preferences toggle mechanism
      const event = new CustomEvent('togglePreferences');
      window.dispatchEvent(event);
    }},
  ];

  // Filter commands based on search term
  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {filteredCommands.map((command, index) => (
            <div
              key={command.id}
              className={`px-4 py-2 cursor-pointer flex justify-between items-center ${
                index === selectedIndex 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => {
                command.action();
                onClose();
              }}
            >
              <span>{command.label}</span>
              {command.shortcut && (
                <span className="text-sm opacity-60">{command.shortcut}</span>
              )}
            </div>
          ))}
          {filteredCommands.length === 0 && (
            <div className="px-4 py-2 text-gray-500 text-center">
              No commands found
            </div>
          )}
        </div>
        
        <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-600">
          Use ↑↓ to navigate, Enter to select, Esc to close
        </div>
      </div>
    </div>
  );
};

// Global search shortcut handler with command palette
export const GlobalSearchShortcuts: React.FC = () => {
  const router = useRouter();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to open command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      
      // Ctrl/Cmd + , to open preferences
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        const event = new CustomEvent('togglePreferences');
        window.dispatchEvent(event);
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
            router.push('/tcgsets');
            break;
          case 'F':
            e.preventDefault();
            router.push('/fun');
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

  return (
    <CommandPalette 
      isOpen={isCommandPaletteOpen} 
      onClose={() => setIsCommandPaletteOpen(false)} 
    />
  );
};

export default SmartSearchEnhancer;