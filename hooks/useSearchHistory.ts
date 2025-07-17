import { useState, useEffect, useCallback } from 'react';

const SEARCH_HISTORY_KEY = 'pokemon_search_history';
const MAX_HISTORY_ITEMS = 10;

export interface UseSearchHistoryReturn {
  searchHistory: string[];
  addToHistory: (searchTerm: string) => void;
  removeFromHistory: (searchTerm: string) => void;
  clearHistory: () => void;
  getSuggestions: (input: string) => string[];
}

/**
 * Custom hook for managing search history
 * @returns {UseSearchHistoryReturn} - Object with search history and management functions
 */
export function useSearchHistory(): UseSearchHistoryReturn {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSearchHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      // Silent fail - start with empty history
      setSearchHistory([]);
    }
  }, []);

  // Add a new search term to history
  const addToHistory = useCallback((searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) return;

    setSearchHistory(prev => {
      // Remove duplicates and add to front
      const filtered = prev.filter(item => 
        item.toLowerCase() !== searchTerm.toLowerCase()
      );
      const newHistory = [searchTerm, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        // Silent fail if localStorage is not available
      }
      
      return newHistory;
    });
  }, []);

  // Remove a search term from history
  const removeFromHistory = useCallback((searchTerm: string) => {
    setSearchHistory(prev => {
      const newHistory = prev.filter(item => item !== searchTerm);
      
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        // Silent fail if localStorage is not available
      }
      
      return newHistory;
    });
  }, []);

  // Clear all search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      // Silent fail if localStorage is not available
    }
  }, []);

  // Get search suggestions based on current input
  const getSuggestions = useCallback((input: string): string[] => {
    if (!input || input.length < 1) return [];
    
    return searchHistory.filter(item =>
      item.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);
  }, [searchHistory]);

  return {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getSuggestions
  };
}

export default useSearchHistory;