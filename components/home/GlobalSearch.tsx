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
  pokemon: 'text-red-600 bg-red-50',
  card: 'text-blue-600 bg-blue-50',
  set: 'text-purple-600 bg-purple-50',
  move: 'text-green-600 bg-green-50',
  item: 'text-yellow-600 bg-yellow-50',
  ability: 'text-pink-600 bg-pink-50'
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
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowResults(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search Pokémon, cards, moves, items..."
            className="w-full px-12 py-4 text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full shadow-lg focus:outline-none focus:border-purple-500 focus:shadow-xl transition-all duration-200 touch-manipulation [&::-webkit-inner-spin-button]:appearance-none"
            style={{ fontSize: '18px' }} // Explicit size to prevent zoom
          />
          
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search className="w-6 h-6 text-gray-400" />
          </div>

          {/* Clear Button */}
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && (searchTerm.length >= 2 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* Recent Searches */}
            {searchTerm.length < 2 && recentSearches.length > 0 && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Recent Searches</h3>
                <div className="space-y-1">
                  {recentSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchTerm(search);
                        performSearch(search);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className="max-h-96 overflow-y-auto">
                {results.map((result, idx) => (
                  <Link href={result.url} key={`${result.category}-${result.id}`}>
                    <div
                      className={`flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                        idx === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      {/* Category Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${categoryColors[result.category]}`}>
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
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {result.name}
                        </p>
                        {result.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
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
                <p className="text-gray-500 dark:text-gray-400">No results found for "{searchTerm}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};