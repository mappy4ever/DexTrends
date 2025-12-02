import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchJSON } from '../../utils/unifiedFetch';
import { Search, X } from '../../utils/icons';
import { useDebounce } from '../../hooks/useDebounce';
import logger from '@/utils/logger';

interface SearchResult {
  category: 'pokemon' | 'card' | 'set' | 'move' | 'item' | 'ability';
  id: string;
  name: string;
  description?: string;
  image?: string;
  url: string;
  relevance: number;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  categories: {
    [key: string]: number;
  };
}

const categoryColors = {
  pokemon: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  card: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20',
  set: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/20',
  move: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  item: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
  ability: 'text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-900/20'
};

const categoryIcons = {
  pokemon: '🔴',
  card: '🃏',
  set: '📦',
  move: '⚔️',
  item: '🎒',
  ability: '✨'
};

export const GlobalSearch: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('dextrends-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      performSearch(debouncedSearchTerm);
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetchJSON<SearchResponse>(
        `/api/search/global?q=${encodeURIComponent(query)}&limit=10`
      );
      if (response?.results) {
        setResults(response.results);
        setShowResults(true);
      }
    } catch (error) {
      logger.error('Search error:', { error });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length < 2) return;

    // Save to recent searches
    const newRecent = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('dextrends-recent-searches', JSON.stringify(newRecent));

    // Navigate to first result or search page
    if (results.length > 0 && selectedIndex >= 0) {
      router.push(results[selectedIndex].url);
    } else if (results.length > 0) {
      router.push(results[0].url);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
    
    setShowResults(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl mx-auto px-4">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowResults(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search Pokémon, cards, moves..."
            className="w-full h-12 pl-11 pr-10 text-base bg-white dark:bg-stone-800/95 border border-stone-200 dark:border-stone-700 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-150 touch-manipulation"
            style={{ fontSize: '16px' }}
          />

          {/* Search Icon */}
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="w-5 h-5 text-stone-400" />
          </div>

          {/* Clear Button / Loading Spinner - proper touch target */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            ) : searchTerm ? (
              <button
                type="button"
                onClick={clearSearch}
                className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors duration-150 touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center active:bg-stone-200 dark:active:bg-stone-600"
              >
                <X className="w-5 h-5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300" />
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && (searchTerm.length >= 2 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-stone-800/95 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-stone-100 dark:border-stone-700/50 overflow-hidden z-50"
          >
            {/* Recent Searches - proper touch targets */}
            {searchTerm.length < 2 && recentSearches.length > 0 && (
              <div className="p-3 border-b border-stone-100 dark:border-stone-700/50">
                <h3 className="text-xs font-medium text-stone-500 dark:text-stone-300 mb-2 px-1">Recent</h3>
                <div className="space-y-1">
                  {recentSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchTerm(search);
                        performSearch(search);
                      }}
                      className="w-full text-left px-3 py-3 hover:bg-stone-50 dark:hover:bg-stone-700/50 active:bg-stone-100 dark:active:bg-stone-600 rounded-lg transition-colors duration-150 text-sm text-stone-700 dark:text-stone-300 touch-manipulation min-h-[44px] flex items-center"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results - proper touch targets */}
            {results.length > 0 && (
              <div className="max-h-80 overflow-y-auto py-1">
                {results.map((result, idx) => (
                  <Link href={result.url} key={`${result.category}-${result.id}`}>
                    <div
                      className={`flex items-center gap-3 px-3 py-3 hover:bg-stone-50 dark:hover:bg-stone-700/50 active:bg-stone-100 dark:active:bg-stone-600 transition-colors duration-150 cursor-pointer touch-manipulation min-h-[52px] ${
                        idx === selectedIndex ? 'bg-stone-50 dark:bg-stone-700/50' : ''
                      }`}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      {/* Category Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs ${categoryColors[result.category]}`}>
                        {categoryIcons[result.category]}
                      </div>

                      {/* Image */}
                      {result.image && (
                        <div className="flex-shrink-0 w-12 h-12 relative">
                          <Image
                            src={result.image}
                            alt={result.name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-900 dark:text-white truncate">
                          {result.name}
                        </p>
                        {result.description && (
                          <p className="text-sm text-stone-600 dark:text-stone-300 truncate">
                            {result.description}
                          </p>
                        )}
                      </div>

                      {/* Category Badge */}
                      <div className="flex-shrink-0">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryColors[result.category]}`}>
                          {result.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchTerm.length >= 2 && results.length === 0 && !loading && (
              <div className="p-8 text-center">
                <p className="text-stone-500 dark:text-stone-300">No results found for "{searchTerm}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};