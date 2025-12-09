import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '../utils/logger';
import type { Database, CardPriceHistory, PriceCollectionJob } from '../types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log environment variable status for debugging
if (typeof window !== 'undefined') {
  logger.debug('[Supabase] Environment check:', {
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
    if (!this.isConfigured()) {
      logger.debug('[SupabaseCache] Skipping card cache lookup - Supabase not configured');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('card_cache')
        .select('card_data')
        .eq('card_id', cardId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('[SupabaseCache] Error fetching cached card:', { cardId, error: error.message });
        return null;
      }

      return (data?.card_data as Record<string, unknown>) || null;
    } catch (error) {
      logger.error('[SupabaseCache] Unexpected error fetching cached card:', { cardId, error });
      return null;
    }
  }

  static async setCachedCard(cardId: string, cardData: Record<string, unknown>, cacheKey: string, expiryHours: number = 24): Promise<void> {
    if (!this.isConfigured()) {
      logger.debug('[SupabaseCache] Skipping card cache write - Supabase not configured');
      return;
    }

    try {
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
        logger.error('[SupabaseCache] Error caching card:', { cardId, error: error.message });
      }
    } catch (error) {
      logger.error('[SupabaseCache] Unexpected error caching card:', { cardId, error });
    }
  }

  // Clean up expired cache entries
  static async cleanupExpiredCache(): Promise<void> {
    if (!this.isConfigured()) {
      logger.debug('[SupabaseCache] Skipping cache cleanup - Supabase not configured');
      return;
    }

    try {
      const now = new Date().toISOString();

      const { error: pokemonError } = await supabase
        .from('pokemon_cache')
        .delete()
        .lt('expires_at', now);

      const { error: cardError } = await supabase
        .from('card_cache')
        .delete()
        .lt('expires_at', now);

      if (pokemonError) {
        logger.error('[SupabaseCache] Error cleaning Pokemon cache:', { error: pokemonError.message });
      }
      if (cardError) {
        logger.error('[SupabaseCache] Error cleaning card cache:', { error: cardError.message });
      }
    } catch (error) {
      logger.error('[SupabaseCache] Unexpected error during cache cleanup:', { error });
    }
  }
}

// Favorites management
export class FavoritesManager {
  /**
   * Generate cryptographically secure random string
   * Uses crypto.getRandomValues() for secure randomness
   */
  private static generateSecureId(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Get session ID for non-authenticated users
  static getSessionId(): string | null {
    if (typeof window === 'undefined') return null;

    let sessionId = localStorage.getItem('dextrends_session_id');
    if (!sessionId) {
      // Security: Use cryptographically secure random ID instead of Math.random()
      sessionId = 'session_' + this.generateSecureId(16) + '_' + Date.now();
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

      // Map plural keys to singular types
      const typeMap: Record<string, 'pokemon' | 'card' | 'deck'> = {
        pokemons: 'pokemon',
        cards: 'card',
        decks: 'deck'
      };

      for (const [itemType, items] of Object.entries(favorites)) {
        const singularType = typeMap[itemType];
        if (singularType && Array.isArray(items)) {
          for (const item of items) {
            await this.addFavorite(singularType, item.id, item);
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

  /**
   * Get the latest price from the price_history table (daily sync)
   * This uses the new price_history table created by the migration
   * Returns TCGPlayer and CardMarket prices
   */
  static async getLatestPriceFromHistory(cardId: string): Promise<{
    tcgplayer_low: number | null;
    tcgplayer_mid: number | null;
    tcgplayer_high: number | null;
    tcgplayer_market: number | null;
    cardmarket_low: number | null;
    cardmarket_trend: number | null;
    cardmarket_avg1: number | null;
    cardmarket_avg7: number | null;
    cardmarket_avg30: number | null;
    recorded_at: string | null;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('price_history')
        .select(`
          tcgplayer_low,
          tcgplayer_mid,
          tcgplayer_high,
          tcgplayer_market,
          cardmarket_low,
          cardmarket_trend,
          cardmarket_avg1,
          cardmarket_avg7,
          cardmarket_avg30,
          recorded_at
        `)
        .eq('card_id', cardId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // PGRST116 = no rows returned, which is fine - just means no price data yet
        if (error.code !== 'PGRST116') {
          logger.debug('[PriceHistory] No price data found for card:', { cardId });
        }
        return null;
      }

      return data;
    } catch (error) {
      logger.error('[PriceHistory] Error fetching latest price:', { cardId, error });
      return null;
    }
  }

  /**
   * Get price history for charting (last N days)
   * Uses the price_history table from the daily sync
   */
  static async getPriceHistoryForChart(cardId: string, days: number = 30): Promise<Array<{
    recorded_at: string;
    tcgplayer_market: number | null;
    cardmarket_trend: number | null;
  }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('price_history')
        .select('recorded_at, tcgplayer_market, cardmarket_trend')
        .eq('card_id', cardId)
        .gte('recorded_at', startDate.toISOString().split('T')[0])
        .order('recorded_at', { ascending: true });

      if (error) {
        logger.error('[PriceHistory] Error fetching price history for chart:', { cardId, error });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[PriceHistory] Unexpected error fetching price history:', { cardId, error });
      return [];
    }
  }
}

// TCG Cards from Supabase database
export class TcgCardManager {
  // Check if Supabase is configured
  private static isConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }

  // Get all series
  static async getSeries(): Promise<Array<{ id: string; name: string; logo_url: string | null }>> {
    if (!this.isConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('tcg_series')
        .select('id, name, logo_url')
        .order('name');

      if (error) {
        logger.error('[TcgCardManager] Error fetching series:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[TcgCardManager] Unexpected error fetching series:', { error });
      return [];
    }
  }

  // Get all sets with optional series filter
  static async getSets(seriesId?: string): Promise<Array<{
    id: string;
    name: string;
    series_id: string | null;
    logo_url: string | null;
    symbol_url: string | null;
    total_cards: number | null;
    release_date: string | null;
  }>> {
    if (!this.isConfigured()) return [];

    try {
      let query = supabase
        .from('tcg_sets')
        .select('id, name, series_id, logo_url, symbol_url, total_cards, release_date')
        .order('release_date', { ascending: false });

      if (seriesId) {
        query = query.eq('series_id', seriesId);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('[TcgCardManager] Error fetching sets:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[TcgCardManager] Unexpected error fetching sets:', { error });
      return [];
    }
  }

  // Search cards by name with filters
  static async searchCards(options: {
    name?: string;
    setId?: string;
    types?: string[];
    rarity?: string;
    category?: string;
    stage?: string;
    illustrator?: string;
    limit?: number;
    offset?: number;
  }): Promise<Array<{
    id: string;
    name: string;
    set_id: string;
    local_id: string;
    category: string;
    hp: number | null;
    types: string[] | null;
    rarity: string | null;
    image_small: string | null;
    image_large: string | null;
    illustrator: string | null;
    stage: string | null;
  }>> {
    if (!this.isConfigured()) return [];

    try {
      let query = supabase
        .from('tcg_cards')
        .select('id, name, set_id, local_id, category, hp, types, rarity, image_small, image_large, illustrator, stage');

      // Apply filters
      if (options.name) {
        query = query.ilike('name', `%${options.name}%`);
      }
      if (options.setId) {
        query = query.eq('set_id', options.setId);
      }
      if (options.rarity) {
        query = query.eq('rarity', options.rarity);
      }
      if (options.category) {
        query = query.eq('category', options.category);
      }
      if (options.stage) {
        query = query.eq('stage', options.stage);
      }
      if (options.illustrator) {
        query = query.ilike('illustrator', `%${options.illustrator}%`);
      }
      if (options.types && options.types.length > 0) {
        query = query.overlaps('types', options.types);
      }

      // Apply pagination
      const limit = Math.min(options.limit || 50, 100);
      const offset = options.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Order by name
      query = query.order('name');

      const { data, error } = await query;

      if (error) {
        logger.error('[TcgCardManager] Error searching cards:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[TcgCardManager] Unexpected error searching cards:', { error });
      return [];
    }
  }

  // Get a single card by ID
  static async getCard(cardId: string): Promise<Record<string, unknown> | null> {
    if (!this.isConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('tcg_cards')
        .select('*')
        .eq('id', cardId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        logger.error('[TcgCardManager] Error fetching card:', { cardId, error: error.message });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('[TcgCardManager] Unexpected error fetching card:', { cardId, error });
      return null;
    }
  }

  // Get cards by set ID
  static async getCardsBySet(setId: string): Promise<Array<{
    id: string;
    name: string;
    local_id: string;
    category: string;
    rarity: string | null;
    image_small: string | null;
    image_large: string | null;
  }>> {
    if (!this.isConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('tcg_cards')
        .select('id, name, local_id, category, rarity, image_small, image_large')
        .eq('set_id', setId)
        .order('local_id');

      if (error) {
        logger.error('[TcgCardManager] Error fetching cards by set:', { setId, error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[TcgCardManager] Unexpected error fetching cards by set:', { setId, error });
      return [];
    }
  }

  // Get database stats
  static async getStats(): Promise<{ series: number; sets: number; cards: number } | null> {
    if (!this.isConfigured()) return null;

    try {
      const [seriesResult, setsResult, cardsResult] = await Promise.all([
        supabase.from('tcg_series').select('id', { count: 'exact', head: true }),
        supabase.from('tcg_sets').select('id', { count: 'exact', head: true }),
        supabase.from('tcg_cards').select('id', { count: 'exact', head: true })
      ]);

      return {
        series: seriesResult.count || 0,
        sets: setsResult.count || 0,
        cards: cardsResult.count || 0
      };
    } catch (error) {
      logger.error('[TcgCardManager] Error fetching stats:', { error });
      return null;
    }
  }

  // ==================== POCKET CARD METHODS ====================
  // Pocket cards have set IDs starting with: A1, A2, A1a, A2a, P-A (promos)
  private static readonly POCKET_SET_PATTERN = /^(A[0-9]|P-A)/i;

  // Get all Pocket sets
  static async getPocketSets(): Promise<Array<{
    id: string;
    name: string;
    series_id: string | null;
    logo_url: string | null;
    symbol_url: string | null;
    total_cards: number | null;
    release_date: string | null;
  }>> {
    if (!this.isConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('tcg_sets')
        .select('id, name, series_id, logo_url, symbol_url, total_cards, release_date')
        .or('id.ilike.A1%,id.ilike.A2%,id.ilike.A3%,id.ilike.P-A%')
        .order('release_date', { ascending: false });

      if (error) {
        logger.error('[TcgCardManager] Error fetching Pocket sets:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[TcgCardManager] Unexpected error fetching Pocket sets:', { error });
      return [];
    }
  }

  // Search Pocket cards by Pokemon name
  static async searchPocketCards(pokemonName: string, limit: number = 50): Promise<Array<{
    id: string;
    name: string;
    set_id: string;
    local_id: string;
    category: string;
    hp: number | null;
    types: string[] | null;
    rarity: string | null;
    image_small: string | null;
    image_large: string | null;
    illustrator: string | null;
    attacks: unknown[] | null;
    abilities: unknown[] | null;
    weaknesses: unknown[] | null;
    retreat_cost: number | null;
  }>> {
    if (!this.isConfigured()) return [];

    try {
      // Search for cards matching the Pokemon name in Pocket sets
      const { data, error } = await supabase
        .from('tcg_cards')
        .select('id, name, set_id, local_id, category, hp, types, rarity, image_small, image_large, illustrator, attacks, abilities, weaknesses, retreat_cost')
        .ilike('name', `%${pokemonName}%`)
        .or('set_id.ilike.A1%,set_id.ilike.A2%,set_id.ilike.A3%,set_id.ilike.P-A%')
        .order('name')
        .limit(limit);

      if (error) {
        logger.error('[TcgCardManager] Error searching Pocket cards:', { pokemonName, error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[TcgCardManager] Unexpected error searching Pocket cards:', { pokemonName, error });
      return [];
    }
  }

  // Get all cards in a Pocket set
  static async getPocketCardsBySet(setId: string): Promise<Array<{
    id: string;
    name: string;
    local_id: string;
    category: string;
    hp: number | null;
    types: string[] | null;
    rarity: string | null;
    image_small: string | null;
    image_large: string | null;
    illustrator: string | null;
    attacks: unknown[] | null;
    abilities: unknown[] | null;
  }>> {
    if (!this.isConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('tcg_cards')
        .select('id, name, local_id, category, hp, types, rarity, image_small, image_large, illustrator, attacks, abilities')
        .eq('set_id', setId)
        .order('local_id');

      if (error) {
        logger.error('[TcgCardManager] Error fetching Pocket cards by set:', { setId, error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[TcgCardManager] Unexpected error fetching Pocket cards by set:', { setId, error });
      return [];
    }
  }
}

// =============================================
// POKEMON DATA MANAGER
// =============================================
export class PokemonManager {
  private static isConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }

  // Get Pokemon by ID
  static async getPokemon(id: number): Promise<Record<string, unknown> | null> {
    if (!this.isConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('pokemon')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        logger.error('[PokemonManager] Error fetching Pokemon:', { id, error: error.message });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching Pokemon:', { id, error });
      return null;
    }
  }

  // Get Pokemon by name
  static async getPokemonByName(name: string): Promise<Record<string, unknown> | null> {
    if (!this.isConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('pokemon')
        .select('*')
        .eq('name', name.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        logger.error('[PokemonManager] Error fetching Pokemon by name:', { name, error: error.message });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching Pokemon by name:', { name, error });
      return null;
    }
  }

  // Get Pokemon species by ID
  static async getSpecies(id: number): Promise<Record<string, unknown> | null> {
    if (!this.isConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('pokemon_species')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        logger.error('[PokemonManager] Error fetching species:', { id, error: error.message });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching species:', { id, error });
      return null;
    }
  }

  // Search Pokemon by name
  static async searchPokemon(query: string, limit: number = 20): Promise<Array<{
    id: number;
    name: string;
    types: string[];
    sprites: Record<string, unknown>;
  }>> {
    if (!this.isConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('pokemon')
        .select('id, name, types, sprites')
        .ilike('name', `%${query}%`)
        .order('id')
        .limit(limit);

      if (error) {
        logger.error('[PokemonManager] Error searching Pokemon:', { query, error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error searching Pokemon:', { query, error });
      return [];
    }
  }

  // Get Move by ID
  static async getMove(id: number): Promise<Record<string, unknown> | null> {
    if (!this.isConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('moves')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        logger.error('[PokemonManager] Error fetching move:', { id, error: error.message });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching move:', { id, error });
      return null;
    }
  }

  // Get Move by name
  static async getMoveByName(name: string): Promise<Record<string, unknown> | null> {
    if (!this.isConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('moves')
        .select('*')
        .eq('name', name.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        logger.error('[PokemonManager] Error fetching move by name:', { name, error: error.message });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching move by name:', { name, error });
      return null;
    }
  }

  // Get all moves with pagination
  static async getMoves(limit: number = 50, offset: number = 0): Promise<Array<{
    id: number;
    name: string;
    type: string | null;
    power: number | null;
    accuracy: number | null;
    pp: number | null;
    damage_class: string | null;
  }>> {
    if (!this.isConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('moves')
        .select('id, name, type, power, accuracy, pp, damage_class')
        .order('name')
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('[PokemonManager] Error fetching moves:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching moves:', { error });
      return [];
    }
  }

  // Get Ability by name
  static async getAbilityByName(name: string): Promise<Record<string, unknown> | null> {
    if (!this.isConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('abilities')
        .select('*')
        .eq('name', name.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        logger.error('[PokemonManager] Error fetching ability:', { name, error: error.message });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching ability:', { name, error });
      return null;
    }
  }

  // Get all abilities
  static async getAbilities(limit: number = 50, offset: number = 0): Promise<Array<{
    id: number;
    name: string;
    effect_entries: unknown[];
    generation: string | null;
  }>> {
    if (!this.isConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('abilities')
        .select('id, name, effect_entries, generation')
        .order('name')
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('[PokemonManager] Error fetching abilities:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching abilities:', { error });
      return [];
    }
  }

  // Get all types
  static async getTypes(): Promise<Array<{
    id: number;
    name: string;
    damage_relations: Record<string, unknown>;
  }>> {
    if (!this.isConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('types')
        .select('id, name, damage_relations')
        .order('id');

      if (error) {
        logger.error('[PokemonManager] Error fetching types:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching types:', { error });
      return [];
    }
  }

  // Get all natures
  static async getNatures(): Promise<Array<{
    id: number;
    name: string;
    increased_stat: string | null;
    decreased_stat: string | null;
  }>> {
    if (!this.isConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('natures')
        .select('id, name, increased_stat, decreased_stat')
        .order('name');

      if (error) {
        logger.error('[PokemonManager] Error fetching natures:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching natures:', { error });
      return [];
    }
  }

  // Get all berries
  static async getBerries(): Promise<Array<{
    id: number;
    name: string;
    natural_gift_type: string | null;
    natural_gift_power: number | null;
    flavors: unknown[];
  }>> {
    if (!this.isConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('berries')
        .select('id, name, natural_gift_type, natural_gift_power, flavors')
        .order('name');

      if (error) {
        logger.error('[PokemonManager] Error fetching berries:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching berries:', { error });
      return [];
    }
  }

  // Get item by name
  static async getItemByName(name: string): Promise<Record<string, unknown> | null> {
    if (!this.isConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('name', name.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        logger.error('[PokemonManager] Error fetching item:', { name, error: error.message });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching item:', { name, error });
      return null;
    }
  }

  // Get database stats
  static async getStats(): Promise<{
    pokemon: number;
    moves: number;
    abilities: number;
    types: number;
    natures: number;
    berries: number;
    items: number;
  } | null> {
    if (!this.isConfigured()) return null;

    try {
      const [pokemonResult, movesResult, abilitiesResult, typesResult, naturesResult, berriesResult, itemsResult] = await Promise.all([
        supabase.from('pokemon').select('id', { count: 'exact', head: true }),
        supabase.from('moves').select('id', { count: 'exact', head: true }),
        supabase.from('abilities').select('id', { count: 'exact', head: true }),
        supabase.from('types').select('id', { count: 'exact', head: true }),
        supabase.from('natures').select('id', { count: 'exact', head: true }),
        supabase.from('berries').select('id', { count: 'exact', head: true }),
        supabase.from('items').select('id', { count: 'exact', head: true })
      ]);

      return {
        pokemon: pokemonResult.count || 0,
        moves: movesResult.count || 0,
        abilities: abilitiesResult.count || 0,
        types: typesResult.count || 0,
        natures: naturesResult.count || 0,
        berries: berriesResult.count || 0,
        items: itemsResult.count || 0
      };
    } catch (error) {
      logger.error('[PokemonManager] Error fetching stats:', { error });
      return null;
    }
  }

  // =============================================
  // EXTENDED API METHODS FOR SUPABASE-FIRST PATTERN
  // =============================================

  // Alias for getPokemon - Get Pokemon by ID
  static async getPokemonById(id: number): Promise<Record<string, unknown> | null> {
    return this.getPokemon(id);
  }

  // Alias for getSpecies - Get species by ID
  static async getSpeciesById(id: number): Promise<Record<string, unknown> | null> {
    return this.getSpecies(id);
  }

  // Get Pokemon list with pagination and filters
  static async getPokemonList(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      search?: string;
      type?: string;
      generation?: string;
    }
  ): Promise<Array<Record<string, unknown>>> {
    if (!this.isConfigured()) return [];

    try {
      let query = supabase
        .from('pokemon')
        .select('*')
        .order('id')
        .range(offset, offset + limit - 1);

      // Apply search filter
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      // Apply type filter (search in JSONB types array)
      if (filters?.type) {
        query = query.contains('types', [{ type: { name: filters.type.toLowerCase() } }]);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('[PokemonManager] Error fetching Pokemon list:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching Pokemon list:', { error });
      return [];
    }
  }

  // Get Pokemon count with filters
  static async getPokemonCount(filters?: {
    search?: string;
    type?: string;
    generation?: string;
  }): Promise<number> {
    if (!this.isConfigured()) return 0;

    try {
      let query = supabase
        .from('pokemon')
        .select('id', { count: 'exact', head: true });

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.type) {
        query = query.contains('types', [{ type: { name: filters.type.toLowerCase() } }]);
      }

      const { count, error } = await query;

      if (error) {
        logger.error('[PokemonManager] Error counting Pokemon:', { error: error.message });
        return 0;
      }

      return count || 0;
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error counting Pokemon:', { error });
      return 0;
    }
  }

  // Get moves list with pagination and filters
  static async getMovesList(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      search?: string;
      type?: string;
      damageClass?: string;
    }
  ): Promise<Array<Record<string, unknown>>> {
    if (!this.isConfigured()) return [];

    try {
      let query = supabase
        .from('moves')
        .select('*')
        .order('name')
        .range(offset, offset + limit - 1);

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.type) {
        query = query.eq('type', filters.type.toLowerCase());
      }

      if (filters?.damageClass) {
        query = query.eq('damage_class', filters.damageClass.toLowerCase());
      }

      const { data, error } = await query;

      if (error) {
        logger.error('[PokemonManager] Error fetching moves list:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching moves list:', { error });
      return [];
    }
  }

  // Get moves count with filters
  static async getMovesCount(filters?: {
    search?: string;
    type?: string;
    damageClass?: string;
  }): Promise<number> {
    if (!this.isConfigured()) return 0;

    try {
      let query = supabase
        .from('moves')
        .select('id', { count: 'exact', head: true });

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.type) {
        query = query.eq('type', filters.type.toLowerCase());
      }

      if (filters?.damageClass) {
        query = query.eq('damage_class', filters.damageClass.toLowerCase());
      }

      const { count, error } = await query;

      if (error) {
        logger.error('[PokemonManager] Error counting moves:', { error: error.message });
        return 0;
      }

      return count || 0;
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error counting moves:', { error });
      return 0;
    }
  }

  // Get abilities list with pagination and filters
  static async getAbilitiesList(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      search?: string;
    }
  ): Promise<Array<Record<string, unknown>>> {
    if (!this.isConfigured()) return [];

    try {
      let query = supabase
        .from('abilities')
        .select('*')
        .order('name')
        .range(offset, offset + limit - 1);

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('[PokemonManager] Error fetching abilities list:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching abilities list:', { error });
      return [];
    }
  }

  // Get abilities count with filters
  static async getAbilitiesCount(filters?: {
    search?: string;
  }): Promise<number> {
    if (!this.isConfigured()) return 0;

    try {
      let query = supabase
        .from('abilities')
        .select('id', { count: 'exact', head: true });

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { count, error } = await query;

      if (error) {
        logger.error('[PokemonManager] Error counting abilities:', { error: error.message });
        return 0;
      }

      return count || 0;
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error counting abilities:', { error });
      return 0;
    }
  }

  // Alias for getTypes - Get all types with full data
  static async getAllTypes(): Promise<Array<Record<string, unknown>>> {
    if (!this.isConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('types')
        .select('*')
        .order('id');

      if (error) {
        logger.error('[PokemonManager] Error fetching all types:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching all types:', { error });
      return [];
    }
  }

  // Alias for getNatures - Get all natures with full data
  static async getAllNatures(): Promise<Array<Record<string, unknown>>> {
    if (!this.isConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('natures')
        .select('*')
        .order('name');

      if (error) {
        logger.error('[PokemonManager] Error fetching all natures:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching all natures:', { error });
      return [];
    }
  }

  // Alias for getBerries - Get all berries with full data
  static async getAllBerries(): Promise<Array<Record<string, unknown>>> {
    if (!this.isConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('berries')
        .select('*')
        .order('name');

      if (error) {
        logger.error('[PokemonManager] Error fetching all berries:', { error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('[PokemonManager] Unexpected error fetching all berries:', { error });
      return [];
    }
  }
}

export default supabase;