import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/utils/cn';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  category?: string;
  action?: () => void;
}

interface EnhancedSearchProps {
  onSearch: (query: string) => void | Promise<SearchResult[]>;
  placeholder?: string;
  suggestions?: SearchResult[];
  recentSearches?: string[];
  popularSearches?: string[];
  onClearRecent?: () => void;
  showCategories?: boolean;
  autoFocus?: boolean;
  variant?: 'default' | 'overlay' | 'inline';
  className?: string;
}

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  onSearch,
  placeholder = 'Search...',
  suggestions = [],
  recentSearches = [],
  popularSearches = [],
  onClearRecent,
  showCategories = true,
  autoFocus = false,
  variant = 'default',
  className
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Handle search
  useEffect(() => {
    if (debouncedQuery) {
      const performSearch = async () => {
        setIsLoading(true);
        try {
          const searchResult = await onSearch(debouncedQuery);
          if (Array.isArray(searchResult)) {
            setResults(searchResult);
          }
        } finally {
          setIsLoading(false);
        }
      };
      performSearch();
    } else {
      setResults([]);
    }
  }, [debouncedQuery, onSearch]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    setIsOpen(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay to allow click on results
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const handleSelect = (result: SearchResult) => {
    setQuery(result.title);
    result.action?.();
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalResults = results.length + recentSearches.length + popularSearches.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, totalResults - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const hasContent = query || results.length > 0 || recentSearches.length > 0 || popularSearches.length > 0;

  return (
    <div ref={containerRef} className={cn('enhanced-search', variant, className)}>
      <div className={cn(
        'search-input-container',
        isFocused && 'focused',
        isOpen && 'open'
      )}>
        {/* Search Icon */}
        <motion.div
          className="search-icon"
          animate={{
            scale: isFocused ? 1.1 : 1,
            color: isFocused ? '#3b82f6' : '#9ca3af'
          }}
          transition={{ duration: 0.2 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M9 17A8 8 0 109 1a8 8 0 000 16zM15 15l4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="search-input"
        />

        {/* Loading Spinner */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="search-spinner"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 1v3M8 12v3M1 8h3M12 8h3M3.05 3.05l2.12 2.12M10.83 10.83l2.12 2.12M3.05 12.95l2.12-2.12M10.83 5.17l2.12-2.12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clear Button */}
        <AnimatePresence>
          {query && (
            <motion.button
              className="search-clear"
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Focus Indicator */}
        <motion.div
          className="focus-indicator"
          initial={false}
          animate={{
            scaleX: isFocused ? 1 : 0,
            opacity: isFocused ? 1 : 0
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && hasContent && (
          <motion.div
            className="search-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          >
            {/* Search Results */}
            {results.length > 0 && (
              <div className="results-section">
                {showCategories && (
                  <div className="section-header">Results</div>
                )}
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    className={cn(
                      'search-result',
                      selectedIndex === index && 'selected'
                    )}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                  >
                    {result.icon && (
                      <span className="result-icon">{result.icon}</span>
                    )}
                    <div className="result-content">
                      <div className="result-title">{result.title}</div>
                      {result.subtitle && (
                        <div className="result-subtitle">{result.subtitle}</div>
                      )}
                    </div>
                    {result.category && (
                      <span className="result-category">{result.category}</span>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="results-section">
                <div className="section-header">
                  <span>Recent</span>
                  {onClearRecent && (
                    <button 
                      className="clear-recent"
                      onClick={onClearRecent}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {recentSearches.map((search, index) => (
                  <motion.div
                    key={search}
                    className="search-result recent"
                    onClick={() => setQuery(search)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                  >
                    <svg className="history-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" d="M8 1a7 7 0 110 14A7 7 0 018 1zm0 2a5 5 0 100 10A5 5 0 008 3zm-.5 2a.5.5 0 01.5.5V8h2.5a.5.5 0 010 1h-3a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5z" clipRule="evenodd" />
                    </svg>
                    <span>{search}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {!query && popularSearches.length > 0 && (
              <div className="results-section">
                <div className="section-header">Popular</div>
                {popularSearches.map((search, index) => (
                  <motion.div
                    key={search}
                    className="search-result popular"
                    onClick={() => setQuery(search)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                  >
                    <svg className="trending-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" d="M1.5 8a.5.5 0 01.5-.5h2a.5.5 0 010 1H2a.5.5 0 01-.5-.5zm3.5 4a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm4-8a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zM13 1a.5.5 0 01.5.5v13a.5.5 0 01-1 0v-13A.5.5 0 0113 1z" clipRule="evenodd" />
                    </svg>
                    <span>{search}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Results */}
            {query && results.length === 0 && !isLoading && (
              <motion.div
                className="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                  <path d="M24 16v8M24 28h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p>No results found for "{query}"</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .enhanced-search {
          position: relative;
          width: 100%;
        }

        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
          padding: 0 16px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(209, 213, 219, 0.5);
          border-radius: 24px;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .search-input-container.focused {
          background: rgba(255, 255, 255, 0.9);
          border-color: #3b82f6;
          box-shadow: 
            0 0 0 3px rgba(59, 130, 246, 0.1),
            0 4px 16px rgba(59, 130, 246, 0.1);
        }

        .search-icon,
        .search-spinner,
        .search-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .search-icon {
          color: #9ca3af;
        }

        .search-input {
          flex: 1;
          padding: 16px 12px;
          background: transparent;
          border: none;
          outline: none;
          font-size: 16px;
          color: #1f2937;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .search-spinner {
          color: #3b82f6;
        }

        .search-clear {
          padding: 8px;
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-clear:hover {
          color: #6b7280;
        }

        .focus-indicator {
          position: absolute;
          bottom: -1px;
          left: 24px;
          right: 24px;
          height: 2px;
          background: #3b82f6;
          transform-origin: center;
        }

        .search-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(209, 213, 219, 0.3);
          border-radius: 16px;
          box-shadow: 
            0 10px 40px rgba(0, 0, 0, 0.1),
            0 4px 16px rgba(0, 0, 0, 0.05);
          max-height: 400px;
          overflow-y: auto;
        }

        .results-section {
          padding: 8px;
        }

        .results-section:not(:last-child) {
          border-bottom: 1px solid rgba(209, 213, 219, 0.2);
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .clear-recent {
          font-size: 11px;
          color: #3b82f6;
          background: transparent;
          border: none;
          cursor: pointer;
          text-transform: none;
          letter-spacing: normal;
        }

        .clear-recent:hover {
          text-decoration: underline;
        }

        .search-result {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-result.selected {
          background: rgba(59, 130, 246, 0.08);
        }

        .result-icon,
        .history-icon,
        .trending-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          color: #9ca3af;
        }

        .result-content {
          flex: 1;
          min-width: 0;
        }

        .result-title {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .result-subtitle {
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .result-category {
          font-size: 11px;
          padding: 2px 8px;
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border-radius: 4px;
          white-space: nowrap;
        }

        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 32px;
          color: #9ca3af;
          text-align: center;
        }

        .no-results p {
          font-size: 14px;
          margin: 0;
        }

        /* Variant: Overlay */
        .enhanced-search.overlay .search-dropdown {
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 600px;
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .search-input-container {
            background: rgba(31, 41, 55, 0.7);
            border-color: rgba(75, 85, 99, 0.5);
          }

          .search-input-container.focused {
            background: rgba(31, 41, 55, 0.9);
          }

          .search-input {
            color: #f3f4f6;
          }

          .search-dropdown {
            background: rgba(31, 41, 55, 0.98);
            border-color: rgba(75, 85, 99, 0.3);
          }

          .result-title {
            color: #f3f4f6;
          }

          .result-subtitle {
            color: #9ca3af;
          }
        }
      `}</style>
    </div>
  );
};