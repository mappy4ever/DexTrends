import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '../utils/logger';
import type { Database, CardPriceHistory, PriceCollectionJob } from '../types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log environment variable status for debugging
if (typeof window !== 'undefined') {
  console.log('[Supabase] Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl ? 'URL is set' : 'URL is missing'
  });
}

// Create Supabase client with proper error handling
let supabase: SupabaseClient<Database>;

if (!supabaseUrl || !supabaseAnonKey) {
  // Log warning but create a proper client that will fail gracefully
  logger.warn('[Supabase] Missing environment variables. Features requiring database will not work.', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  
  // Still create a client to avoid type errors, but it will fail on actual requests
  supabase = createClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      auth: {
        persistSession: false
      }
    }
  );
} else {
  // Create real Supabase client with proper configuration
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
  
  logger.info('[Supabase] Client initialized successfully');
}

export { supabase };

// Types
export interface CachedPokemon {
  pokemon_id: number;
  pokemon_data: Record<string, unknown>;
  cache_key: string;
  expires_at: string;
}

export interface CachedCard {
  card_id: string;
  card_data: Record<string, unknown>;
  cache_key: string;
  expires_at: string;
}

export interface Favorite {
  item_type: 'pokemon' | 'card' | 'deck';
  item_id: string;
  item_data: Record<string, unknown>;
  created_at?: string;
}

export interface GroupedFavorites {
  pokemon: Array<Record<string, unknown>>;
  cards: Array<Record<string, unknown>>;
  decks: Array<Record<string, unknown>>;
}

export interface PriceData {
  card_id: string;
  card_name: string;
  set_name: string;
  variant_type: string;
  price_market: number;
  collected_at: string;
}

export interface PriceAlert {
  id?: string;
  user_id: string;
  card_id: string;
  card_name: string;
  alert_type: string;
  target_price?: number;
  percentage_change?: number;
  is_active?: boolean;
  created_at?: string;
}

// Utility functions for database operations
export class SupabaseCache {
  // Check if Supabase is properly configured
  private static isConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }

  // Pokemon cache operations
  static async getCachedPokemon(pokemonId: number): Promise<Record<string, unknown> | null> {
    if (!this.isConfigured()) {
      logger.debug('[SupabaseCache] Skipping cache lookup - Supabase not configured');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('pokemon_cache')
        .select('pokemon_data')
        .eq('pokemon_id', pokemonId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found - this is normal
          return null;
        }
        logger.error('[SupabaseCache] Error fetching cached Pokemon:', { 
          pokemonId, 
          error: error.message,
          code: error.code 
        });
        return null;
      }

      return (data?.pokemon_data as Record<string, unknown>) || null;
    } catch (error) {
      logger.error('[SupabaseCache] Unexpected error:', { pokemonId, error });
      return null;
    }
  }

  static async setCachedPokemon(pokemonId: number, pokemonData: Record<string, unknown>, cacheKey: string, expiryHours: number = 24): Promise<void> {
    if (!this.isConfigured()) {
      logger.debug('[SupabaseCache] Skipping cache write - Supabase not configured');
      return;
    }

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiryHours);

      const { error } = await supabase
        .from('pokemon_cache')
        .upsert({
          pokemon_id: pokemonId,
          pokemon_data: pokemonData,
          cache_key: cacheKey,
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        logger.error('[SupabaseCache] Error caching Pokemon:', { 
          pokemonId, 
          error: error.message,
          code: error.code 
        });
      } else {
        logger.debug('[SupabaseCache] Successfully cached Pokemon:', { pokemonId });
      }
    } catch (error) {
      logger.error('[SupabaseCache] Unexpected error during cache write:', { pokemonId, error });
    }
  }

  // Card cache operations
  static async getCachedCard(cardId: string): Promise<Record<string, unknown> | null> {
    const { data, error } = await supabase
      .from('card_cache')
      .select('card_data')
      .eq('card_id', cardId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') {
      // Error fetching cached card
      return null;
    }

    return (data?.card_data as Record<string, unknown>) || null;
  }

  static async setCachedCard(cardId: string, cardData: Record<string, unknown>, cacheKey: string, expiryHours: number = 24): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    const { error } = await supabase
      .from('card_cache')
      .upsert({
        card_id: cardId,
        card_data: cardData,
        cache_key: cacheKey,
        expires_at: expiresAt.toISOString()
      });

    if (error) {
      // Error caching card
    }
  }

  // Clean up expired cache entries
  static async cleanupExpiredCache(): Promise<void> {
    const now = new Date().toISOString();
    
    const { error: pokemonError } = await supabase
      .from('pokemon_cache')
      .delete()
      .lt('expires_at', now);

    const { error: cardError } = await supabase
      .from('card_cache')
      .delete()
      .lt('expires_at', now);

    if (pokemonError) {} // Error cleaning Pokemon cache
    if (cardError) {} // Error cleaning card cache
  }
}

// Favorites management
export class FavoritesManager {
  // Get session ID for non-authenticated users
  static getSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    
    let sessionId = localStorage.getItem('dextrends_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('dextrends_session_id', sessionId);
    }
    return sessionId;
  }

  // Get user favorites (authenticated or session-based)
  static async getFavorites(userId: string | null = null): Promise<GroupedFavorites> {
    if (userId) {
      // Authenticated user
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        // Error fetching user favorites
        return { pokemon: [], cards: [], decks: [] };
      }

      return this.groupFavorites(data || []);
    } else {
      // Session-based user
      const sessionId = this.getSessionId();
      if (!sessionId) return { pokemon: [], cards: [], decks: [] };

      const { data, error } = await supabase
        .from('session_favorites')
        .select('*')
        .eq('session_id', sessionId)
        .gt('expires_at', new Date().toISOString());

      if (error) {
        // Error fetching session favorites
        return { pokemon: [], cards: [], decks: [] };
      }

      return this.groupFavorites(data || []);
    }
  }

  // Add favorite
  static async addFavorite(itemType: 'pokemon' | 'card' | 'deck', itemId: string, itemData: Record<string, unknown>, userId: string | null = null): Promise<boolean> {
    if (userId) {
      // Authenticated user
      const { error } = await supabase
        .from('user_favorites')
        .upsert({
          user_id: userId,
          item_type: itemType,
          item_id: itemId,
          item_data: itemData
        });

      if (error) {
        // Error adding user favorite
        return false;
      }
    } else {
      // Session-based user
      const sessionId = this.getSessionId();
      if (!sessionId) return false;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      const { error } = await supabase
        .from('session_favorites')
        .upsert({
          session_id: sessionId,
          item_type: itemType,
          item_id: itemId,
          item_data: itemData,
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        // Error adding session favorite
        return false;
      }
    }

    return true;
  }

  // Remove favorite
  static async removeFavorite(itemType: 'pokemon' | 'card' | 'deck', itemId: string, userId: string | null = null): Promise<boolean> {
    if (userId) {
      // Authenticated user
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      if (error) {
        // Error removing user favorite
        return false;
      }
    } else {
      // Session-based user
      const sessionId = this.getSessionId();
      if (!sessionId) return false;

      const { error } = await supabase
        .from('session_favorites')
        .delete()
        .eq('session_id', sessionId)
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      if (error) {
        // Error removing session favorite
        return false;
      }
    }

    return true;
  }

  // Group favorites by type
  static groupFavorites(favorites: Array<Record<string, unknown>>): GroupedFavorites {
    const grouped: GroupedFavorites = { pokemon: [], cards: [], decks: [] };
    
    favorites.forEach(fav => {
      const itemType = fav.item_type as keyof GroupedFavorites;
      if (itemType in grouped) {
        const itemData = fav.item_data as Record<string, unknown>;
        grouped[itemType].push({
          id: fav.item_id,
          ...itemData,
          favorited_at: fav.created_at
        });
      }
    });

    return grouped;
  }

  // Migrate localStorage favorites to Supabase
  static async migrateLocalStorageFavorites(): Promise<void> {
    if (typeof window === 'undefined') return;

    const localFavorites = localStorage.getItem('favorites');
    if (!localFavorites) return;

    try {
      const favorites = JSON.parse(localFavorites);
      const sessionId = this.getSessionId();

      for (const [itemType, items] of Object.entries(favorites)) {
        if (Array.isArray(items)) {
          for (const item of items) {
            await this.addFavorite(itemType.slice(0, -1) as any, item.id, item); // Remove 's' from type
          }
        }
      }

      // Remove old localStorage data after successful migration
      localStorage.removeItem('favorites');
      // Successfully migrated localStorage favorites to Supabase
    } catch (error) {
      // Error migrating localStorage favorites
    }
  }
}

// Price history utilities
export class PriceHistoryManager {
  // Get price history for a specific card
  static async getCardPriceHistory(cardId: string, variantType: string = 'holofoil', daysBack: number = 30): Promise<CardPriceHistory[]> {
    try {
      // First try RPC function if it exists
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_card_price_trend', {
          input_card_id: cardId,
          input_variant_type: variantType,
          days_back: daysBack
        });

      if (!rpcError && rpcData) {
        return rpcData;
      }
      
      // Fallback to direct query if RPC doesn't exist
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      
      const { data, error } = await supabase
        .from('card_price_history')
        .select('*')
        .eq('card_id', cardId)
        .gte('collected_at', startDate.toISOString())
        .order('collected_at', { ascending: true });

      if (error) {
        logger.error('Error fetching price history:', { error });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getCardPriceHistory:', { error });
      return [];
    }
  }

  // Get price statistics for a card
  static async getCardPriceStats(cardId: string, variantType: string = 'holofoil', daysBack: number = 30): Promise<Record<string, unknown> | null> {
    try {
      // First try RPC function if it exists
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_card_price_stats', {
          input_card_id: cardId,
          input_variant_type: variantType,
          days_back: daysBack
        });

      if (!rpcError && rpcData && rpcData.length > 0) {
        return rpcData[0];
      }
      
      // Fallback to manual calculation if RPC doesn't exist
      const history = await this.getCardPriceHistory(cardId, variantType, daysBack);
      
      if (!history || history.length === 0) {
        return null;
      }
      
      // Calculate stats manually
      const prices = history.map(h => h.price_market || 0).filter(p => p > 0);
      
      if (prices.length === 0) {
        return null;
      }
      
      return {
        highest_price: Math.max(...prices),
        lowest_price: Math.min(...prices),
        average_price: prices.reduce((sum, p) => sum + p, 0) / prices.length,
        price_change: prices[prices.length - 1] - prices[0],
        price_change_percentage: ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100
      };
    } catch (error) {
      logger.error('Error in getCardPriceStats:', { error });
      return null;
    }
  }

  // Get recent price collection jobs
  static async getRecentCollectionJobs(limit: number = 10): Promise<PriceCollectionJob[]> {
    const { data, error } = await supabase
      .from('price_collection_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching collection jobs:', { error });
      return [];
    }

    return data || [];
  }

  // Get cards with recent price data
  static async getCardsWithPriceData(limit: number = 20): Promise<PriceData[]> {
    const { data, error } = await supabase
      .from('card_price_history')
      .select(`
        card_id,
        card_name,
        set_name,
        variant_type,
        price_market,
        collected_at
      `)
      .order('collected_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching cards with price data:', { error });
      return [];
    }

    return data || [];
  }

  // Get price history for multiple cards
  static async getMultipleCardsPriceHistory(cardIds: string[], daysBack: number = 7): Promise<CardPriceHistory[]> {
    const { data, error } = await supabase
      .from('card_price_history')
      .select('*')
      .in('card_id', cardIds)
      .gte('collected_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
      .order('collected_at', { ascending: true });

    if (error) {
      logger.error('Error fetching multiple cards price history:', { error });
      return [];
    }

    return data || [];
  }

  // Add a price alert for a user
  static async addPriceAlert(
    userId: string, 
    cardId: string, 
    cardName: string, 
    alertType: string, 
    targetPrice: number | null = null, 
    percentageChange: number | null = null
  ): Promise<PriceAlert | null> {
    const { data, error } = await supabase
      .from('price_alerts')
      .insert({
        user_id: userId,
        card_id: cardId,
        card_name: cardName,
        alert_type: alertType,
        target_price: targetPrice,
        percentage_change: percentageChange
      })
      .select()
      .single();

    if (error) {
      logger.error('Error adding price alert:', { error });
      return null;
    }

    return data;
  }

  // Get user's price alerts
  static async getUserPriceAlerts(userId: string): Promise<PriceAlert[]> {
    const { data, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching user price alerts:', { error });
      return [];
    }

    return data || [];
  }

  // Check if we have recent price data for a card
  static async hasRecentPriceData(cardId: string, hoursBack: number = 24): Promise<boolean> {
    const { data, error } = await supabase
      .from('card_price_history')
      .select('id')
      .eq('card_id', cardId)
      .gte('collected_at', new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString())
      .limit(1);

    if (error) {
      logger.error('Error checking recent price data:', { error });
      return false;
    }

    return data && data.length > 0;
  }

  // Get trending cards (biggest price changes)
  static async getTrendingCards(daysBack: number = 7, limit: number = 10): Promise<CardPriceHistory[]> {
    // This is a simplified version - you might want to create a more sophisticated function
    const { data, error } = await supabase
      .from('card_price_history')
      .select('*')
      .gte('collected_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
      .order('price_market', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching trending cards:', { error });
      return [];
    }

    return data || [];
  }
}

export default supabase;