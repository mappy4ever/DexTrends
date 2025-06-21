import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a mock client for build time if env vars are missing
let supabase;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Mock client for build/development
  console.warn('Supabase environment variables not found. Using mock client.');
  supabase = {
    from: () => ({
      select: () => ({ 
        eq: () => ({ 
          single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }),
          gt: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }) })
        }),
        gt: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }) })
      }),
      upsert: () => Promise.resolve({ error: null }),
      delete: () => Promise.resolve({ error: null })
    })
  };
}

export { supabase };

// Utility functions for database operations
export class SupabaseCache {
  // Pokemon cache operations
  static async getCachedPokemon(pokemonId) {
    const { data, error } = await supabase
      .from('pokemon_cache')
      .select('pokemon_data')
      .eq('pokemon_id', pokemonId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching cached Pokemon:', error);
      return null;
    }

    return data?.pokemon_data || null;
  }

  static async setCachedPokemon(pokemonId, pokemonData, cacheKey, expiryHours = 24) {
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
      console.error('Error caching Pokemon:', error);
    }
  }

  // Card cache operations
  static async getCachedCard(cardId) {
    const { data, error } = await supabase
      .from('card_cache')
      .select('card_data')
      .eq('card_id', cardId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching cached card:', error);
      return null;
    }

    return data?.card_data || null;
  }

  static async setCachedCard(cardId, cardData, cacheKey, expiryHours = 24) {
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
      console.error('Error caching card:', error);
    }
  }

  // Clean up expired cache entries
  static async cleanupExpiredCache() {
    const now = new Date().toISOString();
    
    const { error: pokemonError } = await supabase
      .from('pokemon_cache')
      .delete()
      .lt('expires_at', now);

    const { error: cardError } = await supabase
      .from('card_cache')
      .delete()
      .lt('expires_at', now);

    if (pokemonError) console.error('Error cleaning Pokemon cache:', pokemonError);
    if (cardError) console.error('Error cleaning card cache:', cardError);
  }
}

// Favorites management
export class FavoritesManager {
  // Get session ID for non-authenticated users
  static getSessionId() {
    if (typeof window === 'undefined') return null;
    
    let sessionId = localStorage.getItem('dextrends_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('dextrends_session_id', sessionId);
    }
    return sessionId;
  }

  // Get user favorites (authenticated or session-based)
  static async getFavorites(userId = null) {
    if (userId) {
      // Authenticated user
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user favorites:', error);
        return { pokemon: [], cards: [], decks: [] };
      }

      return this.groupFavorites(data);
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
        console.error('Error fetching session favorites:', error);
        return { pokemon: [], cards: [], decks: [] };
      }

      return this.groupFavorites(data);
    }
  }

  // Add favorite
  static async addFavorite(itemType, itemId, itemData, userId = null) {
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
        console.error('Error adding user favorite:', error);
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
        console.error('Error adding session favorite:', error);
        return false;
      }
    }

    return true;
  }

  // Remove favorite
  static async removeFavorite(itemType, itemId, userId = null) {
    if (userId) {
      // Authenticated user
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      if (error) {
        console.error('Error removing user favorite:', error);
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
        console.error('Error removing session favorite:', error);
        return false;
      }
    }

    return true;
  }

  // Group favorites by type
  static groupFavorites(favorites) {
    const grouped = { pokemon: [], cards: [], decks: [] };
    
    favorites.forEach(fav => {
      if (grouped[fav.item_type]) {
        grouped[fav.item_type].push({
          id: fav.item_id,
          ...fav.item_data,
          favorited_at: fav.created_at
        });
      }
    });

    return grouped;
  }

  // Migrate localStorage favorites to Supabase
  static async migrateLocalStorageFavorites() {
    if (typeof window === 'undefined') return;

    const localFavorites = localStorage.getItem('favorites');
    if (!localFavorites) return;

    try {
      const favorites = JSON.parse(localFavorites);
      const sessionId = this.getSessionId();

      for (const [itemType, items] of Object.entries(favorites)) {
        if (Array.isArray(items)) {
          for (const item of items) {
            await this.addFavorite(itemType.slice(0, -1), item.id, item); // Remove 's' from type
          }
        }
      }

      // Remove old localStorage data after successful migration
      localStorage.removeItem('favorites');
      console.log('Successfully migrated localStorage favorites to Supabase');
    } catch (error) {
      console.error('Error migrating localStorage favorites:', error);
    }
  }
}

// Price history utilities
export class PriceHistoryManager {
  // Get price history for a specific card
  static async getCardPriceHistory(cardId, variantType = 'holofoil', daysBack = 30) {
    const { data, error } = await supabase
      .rpc('get_card_price_trend', {
        input_card_id: cardId,
        input_variant_type: variantType,
        days_back: daysBack
      });

    if (error) {
      console.error('Error fetching price trend:', error);
      return [];
    }

    return data || [];
  }

  // Get price statistics for a card
  static async getCardPriceStats(cardId, variantType = 'holofoil', daysBack = 30) {
    const { data, error } = await supabase
      .rpc('get_card_price_stats', {
        input_card_id: cardId,
        input_variant_type: variantType,
        days_back: daysBack
      });

    if (error) {
      console.error('Error fetching price stats:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  // Get recent price collection jobs
  static async getRecentCollectionJobs(limit = 10) {
    const { data, error } = await supabase
      .from('price_collection_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching collection jobs:', error);
      return [];
    }

    return data || [];
  }

  // Get cards with recent price data
  static async getCardsWithPriceData(limit = 20) {
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
      console.error('Error fetching cards with price data:', error);
      return [];
    }

    return data || [];
  }

  // Get price history for multiple cards
  static async getMultipleCardsPriceHistory(cardIds, daysBack = 7) {
    const { data, error } = await supabase
      .from('card_price_history')
      .select('*')
      .in('card_id', cardIds)
      .gte('collected_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
      .order('collected_at', { ascending: true });

    if (error) {
      console.error('Error fetching multiple cards price history:', error);
      return [];
    }

    return data || [];
  }

  // Add a price alert for a user
  static async addPriceAlert(userId, cardId, cardName, alertType, targetPrice = null, percentageChange = null) {
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
      console.error('Error adding price alert:', error);
      return null;
    }

    return data;
  }

  // Get user's price alerts
  static async getUserPriceAlerts(userId) {
    const { data, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user price alerts:', error);
      return [];
    }

    return data || [];
  }

  // Check if we have recent price data for a card
  static async hasRecentPriceData(cardId, hoursBack = 24) {
    const { data, error } = await supabase
      .from('card_price_history')
      .select('id')
      .eq('card_id', cardId)
      .gte('collected_at', new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString())
      .limit(1);

    if (error) {
      console.error('Error checking recent price data:', error);
      return false;
    }

    return data && data.length > 0;
  }

  // Get trending cards (biggest price changes)
  static async getTrendingCards(daysBack = 7, limit = 10) {
    // This is a simplified version - you might want to create a more sophisticated function
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
      .gte('collected_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
      .order('price_market', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trending cards:', error);
      return [];
    }

    return data || [];
  }
}

export default supabase;