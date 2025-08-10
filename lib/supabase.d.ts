// Type declarations for lib/supabase.js

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, CardPriceHistory, PriceAlert, PriceCollectionJob } from '../types/database';

export const supabase: SupabaseClient<Database>;

export class SupabaseCache {
  static getCachedPokemon(pokemonId: string | number): Promise<Record<string, unknown> | null>;
  static setCachedPokemon(pokemonId: string | number, pokemonData: Record<string, unknown>, cacheKey: string, expiryHours?: number): Promise<void>;
  static getCachedCard(cardId: string): Promise<Record<string, unknown> | null>;
  static setCachedCard(cardId: string, cardData: Record<string, unknown>, cacheKey: string, expiryHours?: number): Promise<void>;
  static getCachedSet(setId: string): Promise<Record<string, unknown> | null>;
  static setCachedSet(setId: string, setData: Record<string, unknown>): Promise<void>;
  static getCachedSearchResults(cacheKey: string): Promise<Record<string, unknown> | null>;
  static setCachedSearchResults(cacheKey: string, results: Record<string, unknown>): Promise<void>;
  static deleteCachedSearchResults(pattern: string): Promise<number>;
  static cleanupExpiredCache(): Promise<void>;
}

export class FavoritesManager {
  static getSessionId(): string | null;
  static getFavorites(userId?: string | null): Promise<Record<string, unknown>>;
  static toggleFavorite(type: string, itemId: string, userId?: string | null): Promise<Record<string, unknown>>;
  static clearFavorites(userId?: string | null): Promise<Record<string, unknown>>;
}

export class PriceHistoryManager {
  static getCardPriceHistory(cardId: string, variantType?: string, daysBack?: number): Promise<CardPriceHistory[]>;
  static getCardPriceStats(cardId: string, variantType?: string, daysBack?: number): Promise<Record<string, unknown>>;
  static getMultipleCardPrices(cardIds: string[]): Promise<Record<string, unknown>>;
  static trackPriceView(cardId: string, userId?: string | null): Promise<void>;
  static getCardsWithPriceData(limit?: number): Promise<CardPriceHistory[]>;
  static getTrendingCards(daysBack?: number, limit?: number): Promise<CardPriceHistory[]>;
  static getMultipleCardsPriceHistory(cardIds: string[], daysBack?: number): Promise<CardPriceHistory[]>;
  static getUserPriceAlerts(userId: string): Promise<PriceAlert[]>;
  static addPriceAlert(userId: string, cardId: string, cardName: string, alertType: string, targetPrice?: number | null, percentageChange?: number | null): Promise<PriceAlert | null>;
  static deletePriceAlert(alertId: string): Promise<boolean>;
}