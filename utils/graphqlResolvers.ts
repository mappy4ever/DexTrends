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
import apiCache from './apiCache';

const pubsub = new PubSub();
const priceCollector = new EnhancedPriceCollector();

// Subscription event names
const PRICE_UPDATE = 'PRICE_UPDATE';
const MARKET_TREND_UPDATE = 'MARKET_TREND_UPDATE';
const COLLECTION_UPDATE = 'COLLECTION_UPDATE';
const PRICE_ALERT_NOTIFICATION = 'PRICE_ALERT_NOTIFICATION';

// Type definitions
interface GraphQLContext {
  user?: {
    id: string;
    isAdmin?: boolean;
  };
}

interface PaginationInput {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

interface SortInput {
  field: string;
  direction: 'ASC' | 'DESC';
}

interface CardFilters {
  name?: string;
  set?: string;
  rarity?: string;
  artist?: string;
  types?: string[];
  priceMin?: number;
  priceMax?: number;
}

interface FavoriteInput {
  itemType: 'card' | 'pokemon';
  itemId: string;
  itemData?: any;
}

interface PriceAlertInput {
  cardId: string;
  cardName: string;
  alertType: 'price_above' | 'price_below' | 'percentage_change';
  targetPrice?: number;
  percentageChange?: number;
}

interface EventInput {
  eventType: string;
  eventData: Record<string, any>;
}

interface PriceCollectionInput {
  jobType?: 'trending' | 'all' | 'specific';
  limit?: number;
  specificCards?: string[];
}

interface Card {
  id: string;
  name: string;
  set: CardSet;
  rarity?: string;
  artist?: string;
  imageUrl?: string;
  imageUrlHiRes?: string;
  types: string[];
  supertype?: string;
  subtypes: string[];
  hp?: number | null;
  number?: string;
  prices?: PriceData | null;
  tcgplayerUrl?: string;
  marketData?: MarketData;
  analytics?: CardAnalytics;
}

interface CardSet {
  id: string;
  name: string;
  series?: string;
  releaseDate?: string;
  total?: number;
  logoUrl?: string;
  symbolUrl?: string;
}

interface PriceData {
  normal?: PriceVariant | null;
  holofoil?: PriceVariant | null;
  reverseHolofoil?: PriceVariant | null;
  unlimited?: PriceVariant | null;
  firstEdition?: PriceVariant | null;
}

interface PriceVariant {
  low?: number;
  mid?: number;
  high?: number;
  market?: number;
  directLow?: number;
}

interface MarketData {
  volatility: number;
  spread: number;
  stabilityScore: number;
  liquidityIndicator: number;
  trendDirection: string;
  priceChangePercent24h: number;
  priceChangePercent7d: number;
  priceChangePercent30d: number;
}

interface CardAnalytics {
  views: number;
  favorites: number;
  searches: number;
  popularityScore: number;
  engagementScore: number;
}

interface Pokemon {
  id: number;
  name: string;
  nationalPokedexNumber?: number;
  types: string[];
  height?: number;
  weight?: number;
  description?: string;
  imageUrl?: string;
  stats?: Record<string, any>;
}

interface PriceHistoryEntry {
  date: string;
  price: number;
  volume: number;
  marketCap: number;
  source: string;
}

interface PriceStats {
  current: number;
  average: number;
  min: number;
  max: number;
  volatility: number;
  trend: string;
  changePercent: number;
  lastUpdated: string;
}

interface TrendingCard {
  card: Card;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  rank: number;
}

interface MarketOverview {
  totalCards: number;
  averagePrice: number;
  totalVolume: number;
  topGainers: TrendingCard[];
  topLosers: TrendingCard[];
  mostVolatile: TrendingCard[];
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  lastUpdated: string;
}

interface AnalyticsPeriod {
  startDate: string;
  endDate: string;
  daysBack: number;
}

interface AnalyticsData {
  type: string;
  period: AnalyticsPeriod;
  data: any;
  insights: string[];
}

interface SearchSuggestion {
  text: string;
  type: string;
  category: string;
  popularity: number;
}

interface PriceAlert {
  id: string;
  cardId: string;
  cardName: string;
  alertType: string;
  targetPrice?: number;
  percentageChange?: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

interface JobStatus {
  id: string;
  status: string;
  progress: number;
  cardsProcessed: number;
  cardsUpdated: number;
  cardsFailed: number;
  startedAt: string;
  completedAt?: string | null;
}

interface ConnectionResult<T> {
  edges: Array<{
    node: T;
    cursor: string;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  totalCount: number;
}

interface MutationResult<T> {
  success: boolean;
  message: string;
  item?: T | null;
}

export const resolvers = {
  Query: {
    // Card queries
    card: async (parent: any, { id }: { id: string }, context: GraphQLContext): Promise<Card | null> => {
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

    cards: async (
      parent: any, 
      { search, filters, sort, pagination }: {
        search?: string;
        filters?: CardFilters;
        sort?: SortInput;
        pagination?: PaginationInput;
      }, 
      context: GraphQLContext
    ): Promise<ConnectionResult<Card>> => {
      try {
        logger.debug('Searching cards:', { search, filters, sort, pagination });

        const searchParams = {
          query: search || '',
          filters: filters || {},
          sortBy: sort?.field || 'name',
          sortOrder: (sort?.direction === 'DESC' ? 'desc' : 'asc') as 'asc' | 'desc',
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
    pokemon: async (parent: any, { id }: { id: number }, context: GraphQLContext): Promise<Pokemon | null> => {
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
    priceHistory: async (
      parent: any, 
      { cardId, variantType, daysBack }: { cardId: string; variantType?: string; daysBack?: number },
      context: GraphQLContext
    ): Promise<PriceHistoryEntry[]> => {
      try {
        const result = await databaseOptimizer.getPriceHistory(cardId, variantType, daysBack);
        
        if (result.error) {
          throw new Error(`Price history fetch failed: ${result.error.message}`);
        }

        return (result.data || []).map((entry: any) => ({
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

    priceStats: async (
      parent: any,
      { cardId, variantType, daysBack }: { cardId: string; variantType?: string; daysBack?: number },
      context: GraphQLContext
    ): Promise<PriceStats | null> => {
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

    trendingCards: async (
      parent: any,
      { limit }: { limit?: number },
      context: GraphQLContext
    ): Promise<TrendingCard[]> => {
      try {
        const trendAnalysis = await priceCollector.generateMarketTrendAnalysis(7);
        
        if (!trendAnalysis || !trendAnalysis.marketOverview) {
          return [];
        }

        return trendAnalysis.marketOverview.topGainers
          .slice(0, limit || 10)
          .map((card: any, index: number) => ({
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
    analytics: async (
      parent: any,
      { type, cardId, daysBack }: { type: string; cardId?: string; daysBack?: number },
      context: GraphQLContext
    ): Promise<AnalyticsData> => {
      try {
        let analyticsData: any;

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
            startDate: new Date(Date.now() - (daysBack || 30) * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
            daysBack: daysBack || 30
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
    searchSuggestions: async (
      parent: any,
      { query, limit }: { query: string; limit?: number },
      context: GraphQLContext
    ): Promise<SearchSuggestion[]> => {
      try {
        // Simple implementation - could be enhanced with ML-based suggestions
        const { data, error } = await supabase
          .from('card_cache')
          .select('card_data')
          .like('card_data->>name', `%${query}%`)
          .limit(limit || 10);

        if (error) {
          throw new Error(`Search suggestions failed: ${error.message}`);
        }

        return (data || []).map((item: any) => ({
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
    marketOverview: async (
      parent: any,
      { daysBack }: { daysBack?: number },
      context: GraphQLContext
    ): Promise<MarketOverview> => {
      try {
        const trendAnalysis = await priceCollector.generateMarketTrendAnalysis(daysBack || 7);
        
        if (!trendAnalysis || !trendAnalysis.marketOverview) {
          throw new Error('Market overview data not available');
        }

        const overview = trendAnalysis.marketOverview;
        
        return {
          totalCards: overview.totalCards,
          averagePrice: calculateAveragePrice(overview),
          totalVolume: calculateTotalVolume(overview),
          topGainers: overview.topGainers.slice(0, 5).map((card: any, index: number) => ({
            card: parseCardData(card),
            priceChange: card.priceChange || 0,
            priceChangePercent: card.priceChangePercent || 0,
            volume: card.volume || 0,
            rank: index + 1
          })),
          topLosers: overview.topLosers.slice(0, 5).map((card: any, index: number) => ({
            card: parseCardData(card),
            priceChange: card.priceChange || 0,
            priceChangePercent: card.priceChangePercent || 0,
            volume: card.volume || 0,
            rank: index + 1
          })),
          mostVolatile: overview.mostVolatile.slice(0, 5).map((card: any, index: number) => ({
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
    addFavorite: async (
      parent: any,
      { input }: { input: FavoriteInput },
      context: GraphQLContext
    ): Promise<MutationResult<any>> => {
      try {
        const { itemType, itemId, itemData } = input;
        const userId = context.user?.id || null;

        const success = await (supabase as any).FavoritesManager.addFavorite(
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

    removeFavorite: async (
      parent: any,
      { input }: { input: FavoriteInput },
      context: GraphQLContext
    ): Promise<MutationResult<any>> => {
      try {
        const { itemType, itemId } = input;
        const userId = context.user?.id || null;

        const success = await (supabase as any).FavoritesManager.removeFavorite(
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
    createPriceAlert: async (
      parent: any,
      { input }: { input: PriceAlertInput },
      context: GraphQLContext
    ): Promise<PriceAlert> => {
      try {
        const userId = context.user?.id;
        if (!userId) {
          throw new Error('Authentication required');
        }

        const alert = await (supabase as any).PriceHistoryManager.addPriceAlert(
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
    trackEvent: async (
      parent: any,
      { input }: { input: EventInput },
      context: GraphQLContext
    ): Promise<boolean> => {
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
    triggerPriceCollection: async (
      parent: any,
      { input }: { input?: PriceCollectionInput },
      context: GraphQLContext
    ): Promise<JobStatus> => {
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
          id: result.jobId || 'unknown',
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

    refreshCache: async (
      parent: any,
      { type }: { type: string },
      context: GraphQLContext
    ): Promise<boolean> => {
      try {
        if (!context.user?.isAdmin) {
          throw new Error('Admin access required');
        }

        switch (type) {
          case 'CARDS':
            await (apiCache as any).clearCache('cards');
            break;
          case 'POKEMON':
            await (apiCache as any).clearCache('pokemon');
            break;
          case 'PRICES':
            await (apiCache as any).clearCache('prices');
            break;
          case 'ALL':
            await (apiCache as any).clearCache();
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
      subscribe: (parent: any, { cardIds }: { cardIds?: string[] }, context: GraphQLContext) => {
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
      subscribe: (parent: any, { userId }: { userId: string }, context: GraphQLContext) => {
        if (context.user?.id !== userId && !context.user?.isAdmin) {
          throw new Error('Access denied');
        }
        return pubsub.asyncIterator([COLLECTION_UPDATE]);
      }
    },

    // Price alert notifications
    priceAlerts: {
      subscribe: (parent: any, { userId }: { userId: string }, context: GraphQLContext) => {
        if (context.user?.id !== userId && !context.user?.isAdmin) {
          throw new Error('Access denied');
        }
        return pubsub.asyncIterator([PRICE_ALERT_NOTIFICATION]);
      }
    }
  }
};

// Helper functions
function parseCardData(cardData: any): Card {
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

function parsePokemonData(pokemonData: any): Pokemon {
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

function parsePrices(tcgplayerPrices: any): PriceData | null {
  if (!tcgplayerPrices) return null;

  const parseVariant = (variant: any): PriceVariant | null => variant ? {
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

function parseMarketData(cardData: any): MarketData {
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

function parseCardAnalytics(cardData: any): CardAnalytics {
  return {
    views: 0, // Would come from analytics data
    favorites: 0,
    searches: 0,
    popularityScore: 0,
    engagementScore: 0
  };
}

function formatConnectionResult(data: any[], pagination?: PaginationInput): ConnectionResult<Card> {
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

function extractInsights(analyticsData: any, type: string): string[] {
  // Extract insights based on analytics type
  const insights: string[] = [];
  
  if (type === 'SEARCH' && analyticsData.insights) {
    return analyticsData.insights;
  }
  
  return insights;
}

function calculateAveragePrice(overview: any): number {
  // Calculate from trending cards
  const allCards = [...(overview.topGainers || []), ...(overview.topLosers || [])];
  if (allCards.length === 0) return 0;
  
  const totalPrice = allCards.reduce((sum: number, card: any) => sum + (card.currentPrice || 0), 0);
  return totalPrice / allCards.length;
}

function calculateTotalVolume(overview: any): number {
  // Calculate from trending cards
  const allCards = [...(overview.topGainers || []), ...(overview.topLosers || [])];
  return allCards.reduce((sum: number, card: any) => sum + (card.volume || 0), 0);
}

function calculateMarketSentiment(overview: any): 'bullish' | 'bearish' | 'neutral' {
  const gainers = (overview.topGainers || []).length;
  const losers = (overview.topLosers || []).length;
  
  if (gainers > losers * 1.5) return 'bullish';
  if (losers > gainers * 1.5) return 'bearish';
  return 'neutral';
}

// Export pubsub for external use
export { pubsub };
export default resolvers;