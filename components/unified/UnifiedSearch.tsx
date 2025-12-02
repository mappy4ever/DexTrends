import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { fadeInUp, staggerContainer, staggerItem } from '@/utils/animations';
import logger from '@/utils/logger';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Unified Search System
 * 
 * Features:
 * - Multi-source search (Pokemon, Cards, Moves, Items, Abilities)
 * - Instant results with debouncing
 * - Keyboard navigation
 * - Recent searches
 * - Search suggestions
 * - Mobile optimized
 */

export interface SearchResult {
  id: string;
  type: 'pokemon' | 'card' | 'move' | 'item' | 'ability' | 'tcg-set';
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
  relevance: number;
  metadata?: Record<string, any>;
}

interface UnifiedSearchProps {
  placeholder?: string;
  autoFocus?: boolean;
  onSelect?: (result: SearchResult) => void;
  className?: string;
  variant?: 'compact' | 'full' | 'modal';
  sources?: SearchResult['type'][];
}

// Search index for quick filtering
const searchIndex = new Map<string, SearchResult[]>();

export function UnifiedSearch({
  placeholder = 'Search Pokemon, cards, moves...',
  autoFocus = false,
  onSelect,
  className,
  variant = 'compact',
  sources = ['pokemon', 'card', 'move', 'item', 'ability', 'tcg-set']
}: UnifiedSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API calls - in production, these would be real API endpoints
      const searchPromises = sources.map(async (source) => {
        switch (source) {
          case 'pokemon':
            return searchPokemon(searchQuery);
          case 'card':
            return searchCards(searchQuery);
          case 'move':
            return searchMoves(searchQuery);
          case 'item':
            return searchItems(searchQuery);
          case 'ability':
            return searchAbilities(searchQuery);
          case 'tcg-set':
            return searchTCGSets(searchQuery);
          default:
            return [];
        }
      });

      const allResults = await Promise.all(searchPromises);
      const combinedResults = allResults
        .flat()
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 10);

      setResults(combinedResults);
      logger.debug('Search completed', { query: searchQuery, results: combinedResults.length });
    } catch (error) {
      logger.error('Search failed', { error });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [sources]);

  // Debounced search
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, performSearch]);

  // Handle selection
  const handleSelect = useCallback((result: SearchResult) => {
    // Save to recent searches
    const newRecent = [result.title, ...recentSearches.filter(s => s !== result.title)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));

    // Navigate or callback
    if (onSelect) {
      onSelect(result);
    } else {
      router.push(result.url);
    }

    // Reset search
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  }, [router, onSelect, recentSearches]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [results, selectedIndex, handleSelect]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search UI variants
  const variants = {
    compact: 'max-w-md',
    full: 'w-full',
    modal: 'fixed inset-0 z-50 flex items-start justify-center pt-20 px-4'
  };

  return (
    <div className={cn('relative', variants[variant], className)}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'w-full px-4 py-3 pl-12 pr-4',
            'bg-white dark:bg-stone-800',
            'border border-stone-200 dark:border-stone-700',
            'rounded-xl shadow-sm',
            'text-stone-900 dark:text-white',
            'placeholder-stone-500 dark:placeholder-stone-400',
            'focus:outline-none focus:ring-2 focus:ring-amber-500',
            'transition-all'
          )}
        />
        
        {/* Search Icon */}
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Clear Button */}
        {query && !isLoading && (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {isOpen && (query || recentSearches.length > 0) && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'absolute top-full mt-2 w-full',
              'bg-white dark:bg-stone-800',
              'border border-stone-200 dark:border-stone-700',
              'rounded-xl shadow-xl',
              'max-h-96 overflow-y-auto',
              'z-50'
            )}
          >
            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-4 border-b border-stone-200 dark:border-stone-700">
                <h3 className="text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">
                  Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(search)}
                      className={cn(
                        'px-3 py-1 rounded-lg',
                        'bg-stone-100 dark:bg-stone-700',
                        'text-sm text-stone-700 dark:text-stone-300',
                        'hover:bg-stone-200 dark:hover:bg-stone-600',
                        'transition-colors'
                      )}
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <SearchResultItem
                    key={result.id}
                    result={result}
                    isSelected={index === selectedIndex}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  />
                ))}
              </div>
            ) : query && !isLoading ? (
              <div className="p-8 text-center text-stone-500 dark:text-stone-300">
                No results found for "{query}"
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Search Result Item Component
 */
function SearchResultItem({
  result,
  isSelected,
  onClick,
  onMouseEnter
}: {
  result: SearchResult;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  const typeColors = {
    pokemon: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    card: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    move: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    item: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    ability: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    'tcg-set': 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
  };

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        'w-full px-4 py-3 flex items-center gap-3',
        'hover:bg-stone-50 dark:hover:bg-stone-700',
        'transition-colors text-left',
        isSelected && 'bg-stone-50 dark:bg-stone-700'
      )}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image */}
      {result.image && (
        <img
          src={result.image}
          alt={result.title}
          className="w-10 h-10 rounded-lg object-cover"
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-stone-900 dark:text-white truncate">
            {result.title}
          </span>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            typeColors[result.type]
          )}>
            {result.type}
          </span>
        </div>
        {result.subtitle && (
          <p className="text-sm text-stone-500 dark:text-stone-300 truncate">
            {result.subtitle}
          </p>
        )}
      </div>

      {/* Arrow */}
      <svg
        className="w-5 h-5 text-stone-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </motion.button>
  );
}

// Mock search functions - replace with real API calls
async function searchPokemon(query: string): Promise<SearchResult[]> {
  // This would be replaced with real API call
  return [];
}

async function searchCards(query: string): Promise<SearchResult[]> {
  return [];
}

async function searchMoves(query: string): Promise<SearchResult[]> {
  return [];
}

async function searchItems(query: string): Promise<SearchResult[]> {
  return [];
}

async function searchAbilities(query: string): Promise<SearchResult[]> {
  return [];
}

async function searchTCGSets(query: string): Promise<SearchResult[]> {
  return [];
}

/**
 * Global search modal
 */
export function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 px-4 py-2',
          'bg-stone-100 dark:bg-stone-800',
          'border border-stone-200 dark:border-stone-700',
          'rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700',
          'transition-colors'
        )}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-stone-600 dark:text-stone-300">Search</span>
        <kbd className="px-2 py-1 text-xs bg-white dark:bg-stone-900 rounded border border-stone-300 dark:border-stone-600">
          ⌘K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-20 max-w-2xl mx-auto z-50"
            >
              <UnifiedSearch
                variant="full"
                autoFocus
                onSelect={() => setIsOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}