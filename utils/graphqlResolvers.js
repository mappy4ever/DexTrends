/**
 * GraphQL Resolvers
 * Implements the GraphQL schema with optimized data fetching
 */

import { supabase } from '../lib/supabase';
import databaseOptimizer from './databaseOptimizer';
import analyticsEngine from './analyticsEngine';
import EnhancedPriceCollector from './enhancedPriceCollector';
import logger from './logger';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
const priceCollector = new EnhancedPriceCollector();

// Subscription event names
const PRICE_UPDATE = 'PRICE_UPDATE';
const MARKET_TREND_UPDATE = 'MARKET_TREND_UPDATE';
const COLLECTION_UPDATE = 'COLLECTION_UPDATE';
const PRICE_ALERT_NOTIFICATION = 'PRICE_ALERT_NOTIFICATION';

export const resolvers = {
  Query: {
    // Card queries
    card: async (parent, { id }, context) => {
      try {
        logger.debug('Fetching card:', { id });
        
        const { data, error } = await databaseOptimizer.executeOptimizedQuery(
          'card_cache',
          supabase
            .from('card_cache')
            .select('card_data')
            .eq('card_id', id)
            .single(),
          {
            cacheKey: `card_${id}`,
            cacheTTL: 600000 // 10 minutes
          }
        );

        if (error) {
          logger.error('Error fetching card:', error);
          return null;
        }

        return data?.card_data ? parseCardData(data.card_data) : null;
      } catch (error) {
        logger.error('Card query error:', error);
        throw new Error('Failed to fetch card');
      }
    },

    cards: async (parent, { search, filters, sort, pagination }, context) => {
      try {
        logger.debug('Searching cards:', { search, filters, sort, pagination });

        const searchParams = {
          query: search || '',
          filters: filters || {},
          sortBy: sort?.field || 'name',
          sortOrder: sort?.direction || 'ASC',
          limit: pagination?.first || 50,
          offset: 0 // Calculate based on cursor logic
        };

        const result = await databaseOptimizer.searchCards(searchParams, {
          useFullTextSearch: true,
          enableFuzzySearch: true
        });

        if (result.error) {
          throw new Error(`Card search failed: ${result.error.message}`);
        }

        return formatConnectionResult(result.data || [], pagination);
      } catch (error) {
        logger.error('Cards query error:', error);
        throw new Error('Failed to search cards');
      }
    },

    // Pokemon queries
    pokemon: async (parent, { id }, context) => {
      try {
        const { data, error } = await databaseOptimizer.executeOptimizedQuery(
          'pokemon_cache',
          supabase
            .from('pokemon_cache')
            .select('pokemon_data')
            .eq('pokemon_id', id)
            .single(),
          {
            cacheKey: `pokemon_${id}`,
            cacheTTL: 3600000 // 1 hour
          }
        );

        if (error) {
          logger.error('Error fetching pokemon:', error);
          return null;
        }

        return data?.pokemon_data ? parsePokemonData(data.pokemon_data) : null;
      } catch (error) {
        logger.error('Pokemon query error:', error);
        throw new Error('Failed to fetch pokemon');
      }
    },

    // Price queries
    priceHistory: async (parent, { cardId, variantType, daysBack }, context) => {
      try {
        const result = await databaseOptimizer.getPriceHistory(cardId, variantType, daysBack);
        
        if (result.error) {
          throw new Error(`Price history fetch failed: ${result.error.message}`);
        }

        return (result.data || []).map(entry => ({
          date: entry.collected_at,
          price: entry.price_market,
          volume: entry.volume || 0,
          marketCap: entry.market_cap_estimate || 0,
          source: 'tcgplayer'
        }));
      } catch (error) {
        logger.error('Price history query error:', error);
        throw new Error('Failed to fetch price history');
      }
    },

    priceStats: async (parent, { cardId, variantType, daysBack }, context) => {
      try {
        const { data, error } = await supabase
          .rpc('get_card_price_stats', {
            input_card_id: cardId,
            input_variant_type: variantType,
            days_back: daysBack
          });

        if (error) {
          throw new Error(`Price stats fetch failed: ${error.message}`);
        }

        const stats = data && data.length > 0 ? data[0] : null;
        if (!stats) return null;

        return {
          current: stats.current_price,
          average: stats.average_price,
          min: stats.min_price,
          max: stats.max_price,
          volatility: stats.volatility,
          trend: stats.trend_direction,
          changePercent: stats.price_change_percent,
          lastUpdated: stats.last_updated
        };
      } catch (error) {
        logger.error('Price stats query error:', error);
        throw new Error('Failed to fetch price stats');
      }
    },

    trendingCards: async (parent, { limit }, context) => {
      try {
        const trendAnalysis = await priceCollector.generateMarketTrendAnalysis(7);
        
        if (!trendAnalysis || !trendAnalysis.marketOverview) {
          return [];
        }

        return trendAnalysis.marketOverview.topGainers
          .slice(0, limit)
          .map((card, index) => ({
            card: parseCardData(card),
            priceChange: card.priceChange || 0,
            priceChangePercent: card.priceChangePercent || 0,
            volume: card.volume || 0,
            rank: index + 1
          }));
      } catch (error) {
        logger.error('Trending cards query error:', error);
        throw new Error('Failed to fetch trending cards');
      }
    },

    // Analytics queries
    analytics: async (parent, { type, cardId, daysBack }, context) => {
      try {
        let analyticsData;

        switch (type) {
          case 'OVERVIEW':
            analyticsData = await analyticsEngine.generateAnalyticsReport(daysBack);
            break;
          case 'USER_BEHAVIOR':
            analyticsData = await analyticsEngine.getUserBehaviorAnalytics(daysBack);
            break;
          case 'SEARCH':
            analyticsData = await analyticsEngine.getSearchAnalytics(daysBack);
            break;
          case 'CARD_PERFORMANCE':
            if (!cardId) throw new Error('cardId required for CARD_PERFORMANCE analytics');
            analyticsData = await analyticsEngine.getCardPerformanceAnalytics(cardId, daysBack);
            break;
          default:
            throw new Error(`Unsupported analytics type: ${type}`);
        }

        if (!analyticsData) {
          throw new Error('Failed to generate analytics data');
        }

        return {
          type,
          period: {
            startDate: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
            daysBack
          },
          data: analyticsData,
          insights: extractInsights(analyticsData, type)
        };
      } catch (error) {
        logger.error('Analytics query error:', error);
        throw new Error('Failed to fetch analytics');
      }
    },

    // Search suggestions
    searchSuggestions: async (parent, { query, limit }, context) => {
      try {
        // Simple implementation - could be enhanced with ML-based suggestions
        const { data, error } = await supabase
          .from('card_cache')
          .select('card_data')
          .like('card_data->>name', `%${query}%`)
          .limit(limit);

        if (error) {
          throw new Error(`Search suggestions failed: ${error.message}`);
        }

        return (data || []).map(item => ({
          text: item.card_data.name,
          type: 'card',
          category: item.card_data.set?.name || 'Unknown',
          popularity: 0 // Could be calculated from analytics
        }));
      } catch (error) {
        logger.error('Search suggestions query error:', error);
        throw new Error('Failed to fetch search suggestions');
      }
    },

    // Market overview
    marketOverview: async (parent, { daysBack }, context) => {
      try {
        const trendAnalysis = await priceCollector.generateMarketTrendAnalysis(daysBack);
        
        if (!trendAnalysis || !trendAnalysis.marketOverview) {
          throw new Error('Market overview data not available');
        }

        const overview = trendAnalysis.marketOverview;
        
        return {
          totalCards: overview.totalCards,
          averagePrice: calculateAveragePrice(overview),
          totalVolume: calculateTotalVolume(overview),
          topGainers: overview.topGainers.slice(0, 5).map((card, index) => ({
            card: parseCardData(card),
            priceChange: card.priceChange || 0,
            priceChangePercent: card.priceChangePercent || 0,
            volume: card.volume || 0,
            rank: index + 1
          })),
          topLosers: overview.topLosers.slice(0, 5).map((card, index) => ({
            card: parseCardData(card),
            priceChange: card.priceChange || 0,
            priceChangePercent: card.priceChangePercent || 0,
            volume: card.volume || 0,
            rank: index + 1
          })),
          mostVolatile: overview.mostVolatile.slice(0, 5).map((card, index) => ({
            card: parseCardData(card),
            priceChange: card.priceChange || 0,
            priceChangePercent: card.priceChangePercent || 0,
            volume: card.volume || 0,
            rank: index + 1
          })),
          marketSentiment: calculateMarketSentiment(overview),
          lastUpdated: trendAnalysis.generatedAt
        };
      } catch (error) {
        logger.error('Market overview query error:', error);
        throw new Error('Failed to fetch market overview');
      }
    }
  },

  Mutation: {
    // Favorites
    addFavorite: async (parent, { input }, context) => {
      try {
        const { itemType, itemId, itemData } = input;
        const userId = context.user?.id || null;

        const success = await supabase.FavoritesManager.addFavorite(
          itemType,
          itemId,
          itemData,
          userId
        );

        return {
          success,
          message: success ? 'Favorite added successfully' : 'Failed to add favorite',
          item: itemData
        };
      } catch (error) {
        logger.error('Add favorite mutation error:', error);
        throw new Error('Failed to add favorite');
      }
    },

    removeFavorite: async (parent, { input }, context) => {
      try {
        const { itemType, itemId } = input;
        const userId = context.user?.id || null;

        const success = await supabase.FavoritesManager.removeFavorite(
          itemType,
          itemId,
          userId
        );

        return {
          success,
          message: success ? 'Favorite removed successfully' : 'Failed to remove favorite',
          item: null
        };
      } catch (error) {
        logger.error('Remove favorite mutation error:', error);
        throw new Error('Failed to remove favorite');
      }
    },

    // Price alerts
    createPriceAlert: async (parent, { input }, context) => {
      try {
        const userId = context.user?.id;
        if (!userId) {
          throw new Error('Authentication required');
        }

        const alert = await supabase.PriceHistoryManager.addPriceAlert(
          userId,
          input.cardId,
          input.cardName,
          input.alertType,
          input.targetPrice,
          input.percentageChange
        );

        if (!alert) {
          throw new Error('Failed to create price alert');
        }

        return {
          id: alert.id,
          cardId: alert.card_id,
          cardName: alert.card_name,
          alertType: alert.alert_type,
          targetPrice: alert.target_price,
          percentageChange: alert.percentage_change,
          isActive: alert.is_active,
          createdAt: alert.created_at,
          triggeredAt: alert.triggered_at
        };
      } catch (error) {
        logger.error('Create price alert mutation error:', error);
        throw new Error('Failed to create price alert');
      }
    },

    // Analytics events
    trackEvent: async (parent, { input }, context) => {
      try {
        const { eventType, eventData } = input;
        const userId = context.user?.id || null;

        analyticsEngine.trackEvent(eventType, eventData, userId);

        return true;
      } catch (error) {
        logger.error('Track event mutation error:', error);
        return false;
      }
    },

    // Data operations
    triggerPriceCollection: async (parent, { input }, context) => {
      try {
        if (!context.user?.isAdmin) {
          throw new Error('Admin access required');
        }

        const { jobType, limit, specificCards } = input || {};
        
        const result = await priceCollector.collectPricesForTrendingCards(limit || 100);
        
        if (!result.success) {
          throw new Error(`Price collection failed: ${result.error}`);
        }

        return {
          id: result.jobId,
          status: 'running',
          progress: 0,
          cardsProcessed: 0,
          cardsUpdated: 0,
          cardsFailed: 0,
          startedAt: new Date().toISOString(),
          completedAt: null
        };
      } catch (error) {
        logger.error('Trigger price collection mutation error:', error);
        throw new Error('Failed to trigger price collection');
      }
    },

    refreshCache: async (parent, { type }, context) => {
      try {
        if (!context.user?.isAdmin) {
          throw new Error('Admin access required');
        }

        switch (type) {
          case 'CARDS':
            await apiCache.clearCache('cards');
            break;
          case 'POKEMON':
            await apiCache.clearCache('pokemon');
            break;
          case 'PRICES':
            await apiCache.clearCache('prices');
            break;
          case 'ALL':
            await apiCache.clearCache();
            break;
          default:
            throw new Error(`Invalid cache type: ${type}`);
        }

        return true;
      } catch (error) {
        logger.error('Refresh cache mutation error:', error);
        throw new Error('Failed to refresh cache');
      }
    }
  },

  Subscription: {
    // Real-time price updates
    priceUpdates: {
      subscribe: (parent, { cardIds }, context) => {
        // Filter updates for specific cards
        return pubsub.asyncIterator([PRICE_UPDATE]);
      }
    },

    // Market trend updates
    marketTrends: {
      subscribe: () => pubsub.asyncIterator([MARKET_TREND_UPDATE])
    },

    // Collection updates
    collectionUpdates: {
      subscribe: (parent, { userId }, context) => {
        if (context.user?.id !== userId && !context.user?.isAdmin) {
          throw new Error('Access denied');
        }
        return pubsub.asyncIterator([COLLECTION_UPDATE]);
      }
    },

    // Price alert notifications
    priceAlerts: {
      subscribe: (parent, { userId }, context) => {
        if (context.user?.id !== userId && !context.user?.isAdmin) {
          throw new Error('Access denied');
        }
        return pubsub.asyncIterator([PRICE_ALERT_NOTIFICATION]);
      }
    }
  }
};

// Helper functions
function parseCardData(cardData) {
  if (typeof cardData === 'string') {
    cardData = JSON.parse(cardData);
  }

  return {
    id: cardData.id,
    name: cardData.name,
    set: {
      id: cardData.set?.id,
      name: cardData.set?.name,
      series: cardData.set?.series,
      releaseDate: cardData.set?.releaseDate,
      total: cardData.set?.total,
      logoUrl: cardData.set?.images?.logo,
      symbolUrl: cardData.set?.images?.symbol
    },
    rarity: cardData.rarity,
    artist: cardData.artist,
    imageUrl: cardData.images?.small,
    imageUrlHiRes: cardData.images?.large,
    types: cardData.types || [],
    supertype: cardData.supertype,
    subtypes: cardData.subtypes || [],
    hp: cardData.hp ? parseInt(cardData.hp) : null,
    number: cardData.number,
    prices: parsePrices(cardData.tcgplayer?.prices),
    tcgplayerUrl: cardData.tcgplayer?.url,
    marketData: parseMarketData(cardData),
    analytics: parseCardAnalytics(cardData)
  };
}

function parsePokemonData(pokemonData) {
  if (typeof pokemonData === 'string') {
    pokemonData = JSON.parse(pokemonData);
  }

  return {
    id: pokemonData.id,
    name: pokemonData.name,
    nationalPokedexNumber: pokemonData.nationalPokedexNumber,
    types: pokemonData.types || [],
    height: pokemonData.height,
    weight: pokemonData.weight,
    description: pokemonData.flavorText,
    imageUrl: pokemonData.images?.large,
    stats: pokemonData.stats || {}
  };
}

function parsePrices(tcgplayerPrices) {
  if (!tcgplayerPrices) return null;

  const parseVariant = (variant) => variant ? {
    low: variant.low,
    mid: variant.mid,
    high: variant.high,
    market: variant.market,
    directLow: variant.directLow
  } : null;

  return {
    normal: parseVariant(tcgplayerPrices.normal),
    holofoil: parseVariant(tcgplayerPrices.holofoil),
    reverseHolofoil: parseVariant(tcgplayerPrices.reverseHolofoil),
    unlimited: parseVariant(tcgplayerPrices.unlimited),
    firstEdition: parseVariant(tcgplayerPrices['1stEdition'])
  };
}

function parseMarketData(cardData) {
  return {
    volatility: cardData.price_volatility || 0,
    spread: cardData.price_spread || 0,
    stabilityScore: cardData.price_stability_score || 0,
    liquidityIndicator: cardData.liquidity_indicator || 0,
    trendDirection: cardData.trend_direction || 'neutral',
    priceChangePercent24h: 0, // Would need to calculate from price history
    priceChangePercent7d: 0,
    priceChangePercent30d: 0
  };
}

function parseCardAnalytics(cardData) {
  return {
    views: 0, // Would come from analytics data
    favorites: 0,
    searches: 0,
    popularityScore: 0,
    engagementScore: 0
  };
}

function formatConnectionResult(data, pagination) {
  const edges = data.map((item, index) => ({
    node: parseCardData(item.card_data || item),
    cursor: Buffer.from(`${index}`).toString('base64')
  }));

  return {
    edges,
    pageInfo: {
      hasNextPage: false, // Would need to implement proper pagination logic
      hasPreviousPage: false,
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
    },
    totalCount: data.length
  };
}

function extractInsights(analyticsData, type) {
  // Extract insights based on analytics type
  const insights = [];
  
  if (type === 'SEARCH' && analyticsData.insights) {
    return analyticsData.insights;
  }
  
  return insights;
}

function calculateAveragePrice(overview) {
  // Calculate from trending cards
  const allCards = [...(overview.topGainers || []), ...(overview.topLosers || [])];
  if (allCards.length === 0) return 0;
  
  const totalPrice = allCards.reduce((sum, card) => sum + (card.currentPrice || 0), 0);
  return totalPrice / allCards.length;
}

function calculateTotalVolume(overview) {
  // Calculate from trending cards
  const allCards = [...(overview.topGainers || []), ...(overview.topLosers || [])];
  return allCards.reduce((sum, card) => sum + (card.volume || 0), 0);
}

function calculateMarketSentiment(overview) {
  const gainers = (overview.topGainers || []).length;
  const losers = (overview.topLosers || []).length;
  
  if (gainers > losers * 1.5) return 'bullish';
  if (losers > gainers * 1.5) return 'bearish';
  return 'neutral';
}

// Export pubsub for external use
export { pubsub };
export default resolvers;