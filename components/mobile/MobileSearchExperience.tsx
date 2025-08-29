import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiMic, FiFilter, FiTrendingUp, FiClock } from 'react-icons/fi';
import { cn } from '@/utils/cn';
// @ts-ignore - TypeScript issue with haptic exports
import { useHaptic } from '@/utils/hapticFeedback';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'pokemon' | 'card' | 'set' | 'recent' | 'trending';
  icon?: React.ReactNode;
  meta?: string;
}

interface MobileSearchProps {
  onSearch: (query: string) => void;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  trendingSearches?: string[];
  placeholder?: string;
  className?: string;
  onClose?: () => void;
  isOpen?: boolean;
}

export const MobileSearchExperience: React.FC<MobileSearchProps> = ({
  onSearch,
  onSuggestionClick,
  suggestions = [],
  recentSearches = [],
  trendingSearches = [],
  placeholder = "Search Pokemon, cards, sets...",
  className,
  onClose,
  isOpen = false
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const { selection, buttonPress } = useHaptic();
  const debouncedQuery = useDebounce(query, 300);

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        setVoiceTranscript(transcript);
        
        if (event.results[0].isFinal) {
          setQuery(transcript);
          setIsListening(false);
          onSearch(transcript);
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        setVoiceTranscript('');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onSearch]);

  // Handle voice search
  const startVoiceSearch = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      buttonPress();
      setIsListening(true);
      setVoiceTranscript('');
      recognitionRef.current.start();
    } else if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  }, [isListening, buttonPress]);

  // Handle search submission
  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      selection();
      onSearch(searchQuery);
      
      // Save to recent searches
      const stored = localStorage.getItem('recentSearches');
      const recent = stored ? JSON.parse(stored) : [];
      const updated = [searchQuery, ...recent.filter((s: string) => s !== searchQuery)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  }, [onSearch, selection]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setVoiceTranscript('');
    inputRef.current?.focus();
    selection();
  }, [selection]);

  // Auto-focus on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Get display suggestions
  const displaySuggestions = query.trim() 
    ? suggestions 
    : [
        ...trendingSearches.slice(0, 3).map(text => ({
          id: `trending-${text}`,
          text,
          type: 'trending' as const,
          icon: <FiTrendingUp />
        })),
        ...recentSearches.slice(0, 3).map(text => ({
          id: `recent-${text}`,
          text,
          type: 'recent' as const,
          icon: <FiClock />
        }))
      ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "fixed inset-x-0 top-0 z-[100] bg-white dark:bg-gray-900",
            "shadow-2xl border-b border-gray-200 dark:border-gray-700",
            className
          )}
        >
          {/* Search Header */}
          <div className="flex items-center gap-3 p-4 pb-2">
            {/* Back button */}
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Search input container */}
            <div className="flex-1 relative">
              <div className="relative flex items-center">
                <FiSearch className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
                
                <input
                  ref={inputRef}
                  type="search"
                  value={isListening ? voiceTranscript || "Listening..." : query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  placeholder={placeholder}
                  className={cn(
                    "w-full pl-10 pr-10 py-3 rounded-2xl",
                    "bg-gray-100 dark:bg-gray-800",
                    "text-gray-900 dark:text-white",
                    "placeholder-gray-500 dark:placeholder-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "text-base", // Prevent zoom on iOS
                    isListening && "animate-pulse"
                  )}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />

                {/* Clear button */}
                {query && !isListening && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <FiX className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Voice search button */}
            {typeof window !== 'undefined' && 'webkitSpeechRecognition' in window && (
              <button
                onClick={startVoiceSearch}
                className={cn(
                  "p-3 rounded-full transition-all",
                  isListening 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                <FiMic className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick filters */}
          <div className="px-4 py-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['All', 'Pokemon', 'Cards', 'Sets', 'Trainers'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    selection();
                    // Add filter logic here
                  }}
                  className={cn(
                    "px-4 py-1.5 rounded-full whitespace-nowrap",
                    "text-sm font-medium",
                    "bg-gray-100 dark:bg-gray-800",
                    "text-gray-600 dark:text-gray-400",
                    "hover:bg-gray-200 dark:hover:bg-gray-700",
                    "transition-colors"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {(isFocused || query) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 dark:border-gray-700"
            >
              <div className="max-h-[60vh] overflow-y-auto">
                {displaySuggestions.length > 0 ? (
                  displaySuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => {
                        selection();
                        setQuery(suggestion.text);
                        handleSearch(suggestion.text);
                        onSuggestionClick?.(suggestion);
                      }}
                      className={cn(
                        "w-full px-4 py-3 flex items-center gap-3",
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        "transition-colors text-left"
                      )}
                    >
                      <span className="text-gray-400 dark:text-gray-500">
                        {suggestion.icon || <FiSearch />}
                      </span>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white font-medium truncate">
                          {suggestion.text}
                        </p>
                        {'meta' in suggestion && suggestion.meta && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {suggestion.meta}
                          </p>
                        )}
                      </div>
                      
                      {suggestion.type === 'recent' && (
                        <span className="text-xs text-gray-400">Recent</span>
                      )}
                      {suggestion.type === 'trending' && (
                        <span className="text-xs text-blue-500">Trending</span>
                      )}
                    </button>
                  ))
                ) : query.trim() && (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-sm">No results found for "{query}"</p>
                    <p className="text-xs mt-1">Try searching for something else</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Voice feedback overlay */}
          {isListening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center"
              onClick={() => recognitionRef.current?.stop()}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 m-4 text-center"
              >
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <motion.div
                    className="absolute inset-0 bg-red-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.2, 0.5]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5
                    }}
                  />
                  <div className="relative w-full h-full bg-red-500 rounded-full flex items-center justify-center">
                    <FiMic className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {voiceTranscript || "Listening..."}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tap anywhere to cancel
                </p>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};