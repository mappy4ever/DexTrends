/**
 * FavoritesContext - Focused context for favorites management
 * Split from UnifiedAppContext for performance optimization (GAMMA-003)
 *
 * This context only causes re-renders when favorites change,
 * not when theme, modals, or other state changes.
 */

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import {
  FavoritesState,
  FavoritePokemon,
  FavoriteCard,
  FavoriteDeck
} from './modules/types';

// Favorites context value interface
export interface FavoritesContextValue {
  favorites: FavoritesState;
  addToFavorites: (type: keyof FavoritesState, item: FavoritePokemon | FavoriteCard | FavoriteDeck) => void;
  removeFromFavorites: (type: keyof FavoritesState, itemId: string | number) => void;
  updateFavorites: (favorites: Partial<FavoritesState>) => void;
  isFavorite: (type: keyof FavoritesState, itemId: string | number) => boolean;
  getFavoriteCount: (type?: keyof FavoritesState) => number;
}

// Create the context
const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

// Storage key for favorites
const FAVORITES_STORAGE_KEY = 'dextrends-favorites';

// Default favorites state
const defaultFavorites: FavoritesState = {
  pokemon: [],
  cards: [],
  decks: []
};

// Get initial favorites from localStorage
function getInitialFavorites(): FavoritesState {
  if (typeof window === 'undefined') return defaultFavorites;

  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        pokemon: Array.isArray(parsed.pokemon) ? parsed.pokemon : [],
        cards: Array.isArray(parsed.cards) ? parsed.cards : [],
        decks: Array.isArray(parsed.decks) ? parsed.decks : []
      };
    }
  } catch (e) {
    // localStorage not available or invalid data
  }

  return defaultFavorites;
}

// Provider props
interface FavoritesProviderProps {
  children: ReactNode;
}

// Favorites Provider Component
export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<FavoritesState>(getInitialFavorites);

  // Persist favorites to localStorage when they change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      // localStorage not available
    }
  }, [favorites]);

  // Add item to favorites
  const addToFavorites = useCallback((
    type: keyof FavoritesState,
    item: FavoritePokemon | FavoriteCard | FavoriteDeck
  ) => {
    setFavorites(prev => {
      // Check if already exists
      const exists = prev[type].some((existing: FavoritePokemon | FavoriteCard | FavoriteDeck) => {
        if (type === 'pokemon') {
          return (existing as FavoritePokemon).id === (item as FavoritePokemon).id;
        }
        return (existing as FavoriteCard | FavoriteDeck).id === (item as FavoriteCard | FavoriteDeck).id;
      });

      if (exists) return prev;

      // Add with timestamp
      const itemWithTimestamp = {
        ...item,
        addedAt: item.addedAt || Date.now()
      };

      return {
        ...prev,
        [type]: [...prev[type], itemWithTimestamp]
      };
    });
  }, []);

  // Remove item from favorites
  const removeFromFavorites = useCallback((
    type: keyof FavoritesState,
    itemId: string | number
  ) => {
    setFavorites(prev => ({
      ...prev,
      [type]: prev[type].filter((item: FavoritePokemon | FavoriteCard | FavoriteDeck) => {
        if (type === 'pokemon') {
          return (item as FavoritePokemon).id !== itemId;
        }
        return (item as FavoriteCard | FavoriteDeck).id !== itemId;
      })
    }));
  }, []);

  // Bulk update favorites
  const updateFavorites = useCallback((newFavorites: Partial<FavoritesState>) => {
    setFavorites(prev => ({
      ...prev,
      ...newFavorites
    }));
  }, []);

  // Check if item is a favorite
  const isFavorite = useCallback((
    type: keyof FavoritesState,
    itemId: string | number
  ): boolean => {
    return favorites[type].some((item: FavoritePokemon | FavoriteCard | FavoriteDeck) => {
      if (type === 'pokemon') {
        return (item as FavoritePokemon).id === itemId;
      }
      return (item as FavoriteCard | FavoriteDeck).id === itemId;
    });
  }, [favorites]);

  // Get count of favorites
  const getFavoriteCount = useCallback((type?: keyof FavoritesState): number => {
    if (type) {
      return favorites[type].length;
    }
    return favorites.pokemon.length + favorites.cards.length + favorites.decks.length;
  }, [favorites]);

  const value: FavoritesContextValue = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    updateFavorites,
    isFavorite,
    getFavoriteCount
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Hook to use favorites context
export function useFavoritesContext(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
}

// Safe hook that doesn't throw
export function useFavoritesContextSafe(): FavoritesContextValue | null {
  return useContext(FavoritesContext) ?? null;
}

export default FavoritesContext;
