// Type declarations for lib/supabase.js

import { SupabaseClient } from '@supabase/supabase-js';

export const supabase: SupabaseClient;

export class SupabaseCache {
  static getCachedPokemon(pokemonId: string | number): Promise<any | null>;
  static setCachedPokemon(pokemonId: string | number, pokemonData: any, cacheKey: string, expiryHours?: number): Promise<void>;
  static getCachedCard(cardId: string): Promise<any | null>;
  static setCachedCard(cardId: string, cardData: any, cacheKey: string, expiryHours?: number): Promise<void>;
  static getCachedSet(setId: string): Promise<any | null>;
  static setCachedSet(setId: string, setData: any): Promise<void>;
  static getCachedSearchResults(cacheKey: string): Promise<any | null>;
  static setCachedSearchResults(cacheKey: string, results: any): Promise<void>;
  static deleteCachedSearchResults(pattern: string): Promise<number>;
  static cleanupExpiredCache(): Promise<void>;
}

export class FavoritesManager {
  static getSessionId(): string | null;
  static getFavorites(userId?: string | null): Promise<any>;
  static toggleFavorite(type: string, itemId: string, userId?: string | null): Promise<any>;
  static clearFavorites(userId?: string | null): Promise<any>;
}

export class PriceHistoryManager {
  static getCardPriceHistory(cardId: string, variantType?: string, daysBack?: number): Promise<any[]>;
  static getCardPriceStats(cardId: string, variantType?: string, daysBack?: number): Promise<any>;
  static getMultipleCardPrices(cardIds: string[]): Promise<any>;
  static trackPriceView(cardId: string, userId?: string | null): Promise<void>;
  static getCardsWithPriceData(limit?: number): Promise<any[]>;
  static getTrendingCards(daysBack?: number, limit?: number): Promise<any[]>;
  static getMultipleCardsPriceHistory(cardIds: string[], daysBack?: number): Promise<any>;
  static getUserPriceAlerts(userId: string): Promise<any>;
  static addPriceAlert(userId: string, cardId: string, cardName: string, alertType: string, targetPrice?: number | null, percentageChange?: number | null): Promise<any>;
  static deletePriceAlert(alertId: string): Promise<any>;
}