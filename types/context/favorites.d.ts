// Favorites context type definitions

import { SimplePokemon } from '../api/pokemon';
import { SimpleCard } from '../api/cards';
import { PocketCard } from '../api/pocket-cards';

// Favorite item types
export type FavoriteType = 'pokemon' | 'cards' | 'pocketCards' | 'sets' | 'decks';

export interface FavoriteItem {
  id: string | number;
  type: FavoriteType;
  data: SimplePokemon | SimpleCard | PocketCard | FavoriteSet | FavoriteDeck;
  dateAdded: string;
  tags?: string[];
  notes?: string;
}

export interface FavoriteSet {
  id: string;
  name: string;
  series: string;
  logo: string;
  symbol: string;
  releaseDate: string;
  totalCards: number;
}

export interface FavoriteDeck {
  id: string;
  name: string;
  format: string;
  cardCount: number;
  creator?: string;
  thumbnail?: string;
}

// Favorites state
export interface FavoritesState {
  pokemon: SimplePokemon[];
  cards: SimpleCard[];
  pocketCards: PocketCard[];
  sets: FavoriteSet[];
  decks: FavoriteDeck[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Favorites actions
export interface FavoritesActions {
  // Add/Remove operations
  addToFavorites: (type: FavoriteType, item: any) => Promise<void>;
  removeFromFavorites: (type: FavoriteType, itemId: string | number) => Promise<void>;
  toggleFavorite: (type: FavoriteType, item: any) => Promise<void>;
  
  // Bulk operations
  addMultipleToFavorites: (type: FavoriteType, items: any[]) => Promise<void>;
  removeMultipleFromFavorites: (type: FavoriteType, itemIds: (string | number)[]) => Promise<void>;
  
  // Check operations
  isFavorite: (type: FavoriteType, itemId: string | number) => boolean;
  getFavorite: (type: FavoriteType, itemId: string | number) => any | undefined;
  
  // Clear operations
  clearFavorites: (type?: FavoriteType) => Promise<void>;
  clearAllFavorites: () => Promise<void>;
  
  // Import/Export
  exportFavorites: () => Promise<FavoritesExport>;
  importFavorites: (data: FavoritesExport) => Promise<void>;
  
  // Sync operations
  syncFavorites: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

// Favorites context value
export interface FavoritesContextValue extends FavoritesState, FavoritesActions {
  // Computed values
  totalFavorites: number;
  favoritesByType: Record<FavoriteType, number>;
  recentFavorites: FavoriteItem[];
  
  // Search and filter
  searchFavorites: (query: string, type?: FavoriteType) => any[];
  filterFavorites: (filters: FavoriteFilters) => any[];
  sortFavorites: (type: FavoriteType, sortBy: FavoriteSort) => any[];
}

// Filter and sort types
export interface FavoriteFilters {
  type?: FavoriteType;
  tags?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  query?: string;
}

export interface FavoriteSort {
  field: 'name' | 'dateAdded' | 'type' | 'value';
  order: 'asc' | 'desc';
}

// Import/Export types
export interface FavoritesExport {
  version: string;
  exportDate: string;
  favorites: {
    pokemon: SimplePokemon[];
    cards: SimpleCard[];
    pocketCards: PocketCard[];
    sets: FavoriteSet[];
    decks: FavoriteDeck[];
  };
  metadata?: {
    totalItems: number;
    user?: string;
  };
}

// Storage types
export interface FavoritesStorage {
  get: (userId: string) => Promise<FavoritesState | null>;
  set: (userId: string, favorites: FavoritesState) => Promise<void>;
  clear: (userId: string) => Promise<void>;
  merge: (userId: string, favorites: Partial<FavoritesState>) => Promise<void>;
}

// Events
export interface FavoritesEvents {
  onFavoriteAdded?: (type: FavoriteType, item: any) => void;
  onFavoriteRemoved?: (type: FavoriteType, itemId: string | number) => void;
  onFavoritesCleared?: (type?: FavoriteType) => void;
  onFavoritesSynced?: () => void;
  onError?: (error: Error) => void;
}

// Hook return type
export interface UseFavoritesReturn extends FavoritesContextValue {
  // Shorthand methods for common operations
  toggleCardFavorite: (card: SimpleCard) => Promise<void>;
  togglePokemonFavorite: (pokemon: SimplePokemon) => Promise<void>;
  togglePocketCardFavorite: (card: PocketCard) => Promise<void>;
  
  // Quick checks
  isCardFavorite: (cardId: string) => boolean;
  isPokemonFavorite: (pokemonId: string | number) => boolean;
  isPocketCardFavorite: (cardId: string) => boolean;
  
  // Counts
  favoritePokemonCount: number;
  favoriteCardsCount: number;
  favoritePocketCardsCount: number;
  favoriteSetsCount: number;
  favoriteDecksCount: number;
}

// Legacy compatibility types (for migration)
export interface LegacyFavoritesAPI {
  toggleCardFavorite: (card: any) => void;
  isCardFavorite: (card: any) => boolean;
  togglePokemonFavorite: (pokemon: any) => void;
  isPokemonFavorite: (pokemon: any) => boolean;
  favoriteCards: any[];
  favoritePokemon: any[];
}