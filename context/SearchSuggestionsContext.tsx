import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchJSON } from '../utils/unifiedFetch';
import { requestCache } from '../utils/UnifiedCacheManager';
import logger from '../utils/logger';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'pokemon' | 'move' | 'ability' | 'item' | 'card' | 'recent';
  data?: any;
  icon?: React.ReactNode;
}

interface SearchSuggestionsContextType {
  suggestions: SearchSuggestion[];
  recentSearches: string[];
  loading: boolean;
  getSuggestions: (query: string, type?: string) => Promise<void>;
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  clearSuggestions: () => void;
}

const SearchSuggestionsContext = createContext<SearchSuggestionsContextType | undefined>(undefined);

export const useSearchSuggestions = () => {
  const context = useContext(SearchSuggestionsContext);
  if (!context) {
    throw new Error('useSearchSuggestions must be used within SearchSuggestionsProvider');
  }
  return context;
};

interface SearchSuggestionsProviderProps {
  children: React.ReactNode;
  maxRecentSearches?: number;
  maxSuggestions?: number;
}

export const SearchSuggestionsProvider: React.FC<SearchSuggestionsProviderProps> = ({
  children,
  maxRecentSearches = 10,
  maxSuggestions = 8,
}) => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentSearches(parsed.slice(0, maxRecentSearches));
      }
    } catch (error) {
      logger.error('Failed to load recent searches', { error });
    }
  }, [maxRecentSearches]);

  // Save recent searches to localStorage
  const saveRecentSearches = useCallback((searches: string[]) => {
    try {
      localStorage.setItem('recentSearches', JSON.stringify(searches));
    } catch (error) {
      logger.error('Failed to save recent searches', { error });
    }
  }, []);

  // Add a search to recent searches
  const addRecentSearch = useCallback((search: string) => {
    if (!search.trim()) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== search.toLowerCase());
      const updated = [search, ...filtered].slice(0, maxRecentSearches);
      saveRecentSearches(updated);
      return updated;
    });
  }, [maxRecentSearches, saveRecentSearches]);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('recentSearches');
    } catch (error) {
      logger.error('Failed to clear recent searches', { error });
    }
  }, []);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  // Get suggestions based on query
  const getSuggestions = useCallback(async (query: string, type?: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    const lowerQuery = query.toLowerCase();
    const newSuggestions: SearchSuggestion[] = [];

    try {
      // Add recent searches that match
      const matchingRecent = recentSearches
        .filter(s => s.toLowerCase().includes(lowerQuery))
        .slice(0, 3)
        .map(s => ({
          id: `recent-${s}`,
          text: s,
          type: 'recent' as const,
        }));
      newSuggestions.push(...matchingRecent);

      // Fetch Pokemon suggestions
      if (!type || type === 'pokemon') {
        const cacheKey = `pokemon-suggestions-${lowerQuery}`;
        let pokemonData = await requestCache.get(cacheKey);
        
        if (!pokemonData) {
          try {
            const response = await fetchJSON<any>(
              `https://pokeapi.co/api/v2/pokemon?limit=1000`
            );
            
            if (response?.results) {
              const filtered = response.results
                .filter((p: any) => p.name.includes(lowerQuery))
                .slice(0, 5)
                .map((p: any) => ({
                  id: `pokemon-${p.name}`,
                  text: p.name.replace(/-/g, ' '),
                  type: 'pokemon' as const,
                  data: p,
                }));
              
              pokemonData = filtered;
              await requestCache.set(cacheKey, filtered); // Cache handled by UnifiedCacheManager
            }
          } catch (error) {
            logger.error('Failed to fetch Pokemon suggestions', { error });
          }
        }
        
        if (pokemonData) {
          newSuggestions.push(...pokemonData);
        }
      }

      // Fetch Move suggestions
      if (!type || type === 'move') {
        const cacheKey = `move-suggestions-${lowerQuery}`;
        let moveData = await requestCache.get(cacheKey);
        
        if (!moveData) {
          try {
            const response = await fetchJSON<any>(
              `https://pokeapi.co/api/v2/move?limit=1000`
            );
            
            if (response?.results) {
              const filtered = response.results
                .filter((m: any) => m.name.includes(lowerQuery))
                .slice(0, 3)
                .map((m: any) => ({
                  id: `move-${m.name}`,
                  text: m.name.replace(/-/g, ' '),
                  type: 'move' as const,
                  data: m,
                }));
              
              moveData = filtered;
              await requestCache.set(cacheKey, filtered);
            }
          } catch (error) {
            logger.error('Failed to fetch Move suggestions', { error });
          }
        }
        
        if (moveData) {
          newSuggestions.push(...moveData);
        }
      }

      // Fetch Ability suggestions
      if (!type || type === 'ability') {
        const cacheKey = `ability-suggestions-${lowerQuery}`;
        let abilityData = await requestCache.get(cacheKey);
        
        if (!abilityData) {
          try {
            const response = await fetchJSON<any>(
              `https://pokeapi.co/api/v2/ability?limit=500`
            );
            
            if (response?.results) {
              const filtered = response.results
                .filter((a: any) => a.name.includes(lowerQuery))
                .slice(0, 3)
                .map((a: any) => ({
                  id: `ability-${a.name}`,
                  text: a.name.replace(/-/g, ' '),
                  type: 'ability' as const,
                  data: a,
                }));
              
              abilityData = filtered;
              await requestCache.set(cacheKey, filtered);
            }
          } catch (error) {
            logger.error('Failed to fetch Ability suggestions', { error });
          }
        }
        
        if (abilityData) {
          newSuggestions.push(...abilityData);
        }
      }

      // Fetch Item suggestions
      if (!type || type === 'item') {
        const cacheKey = `item-suggestions-${lowerQuery}`;
        let itemData = await requestCache.get(cacheKey);
        
        if (!itemData) {
          try {
            const response = await fetchJSON<any>(
              `https://pokeapi.co/api/v2/item?limit=1000`
            );
            
            if (response?.results) {
              const filtered = response.results
                .filter((i: any) => i.name.includes(lowerQuery))
                .slice(0, 3)
                .map((i: any) => ({
                  id: `item-${i.name}`,
                  text: i.name.replace(/-/g, ' '),
                  type: 'item' as const,
                  data: i,
                }));
              
              itemData = filtered;
              await requestCache.set(cacheKey, filtered);
            }
          } catch (error) {
            logger.error('Failed to fetch Item suggestions', { error });
          }
        }
        
        if (itemData) {
          newSuggestions.push(...itemData);
        }
      }

      setSuggestions(newSuggestions.slice(0, maxSuggestions));
    } catch (error) {
      logger.error('Failed to get suggestions', { error });
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [recentSearches, maxSuggestions]);

  const value: SearchSuggestionsContextType = {
    suggestions,
    recentSearches,
    loading,
    getSuggestions,
    addRecentSearch,
    clearRecentSearches,
    clearSuggestions,
  };

  return (
    <SearchSuggestionsContext.Provider value={value}>
      {children}
    </SearchSuggestionsContext.Provider>
  );
};

export default SearchSuggestionsProvider;