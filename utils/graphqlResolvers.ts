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
import cacheManager from './UnifiedCacheManager';
// GraphQL types - will be available when graphql package is installed
type GraphQLResolveInfo = {
  fieldName: string;
  fieldNodes: unknown[];
  returnType: unknown;
  parentType: unknown;
  path: unknown;
  schema: unknown;
  fragments: Record<string, unknown>;
  rootValue: unknown;
  operation: unknown;
  variableValues: Record<string, unknown>;
};

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
  itemData?: Card | Pokemon;
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
  eventData: Record<string, unknown>;
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
  stats?: Record<string, number>;
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

interface CardTrend {
  [key: string]: unknown;
  priceChange?: number;
  priceChangePercent?: number;
  volume?: number;
  currentPrice?: number;
}

interface MarketOverview {
  [key: string]: unknown;
  totalCards: number;
  averagePrice: number;
  totalVolume: number;
  topGainers: CardTrend[];
  topLosers: CardTrend[];
  mostVolatile: CardTrend[];
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
  data: Record<string, unknown>;
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

// Resolver argument interfaces
interface CardArgs {
  id: string;
}

interface CardsArgs {
  search?: string;
  filters?: CardFilters;
  sort?: SortInput;
  pagination?: PaginationInput;
}

interface PokemonArgs {
  id: number;
}

interface PriceHistoryArgs {
  cardId: string;
  variantType?: string;
  daysBack?: number;
}

interface PriceStatsArgs {
  cardId: string;
  variantType?: string;
  daysBack?: number;
}

interface TrendingCardsArgs {
  limit?: number;
}

interface AnalyticsArgs {
  type: string;
  cardId?: string;
  daysBack?: number;
}

interface SearchSuggestionsArgs {
  query: string;
  limit?: number;
}

interface MarketOverviewArgs {
  daysBack?: number;
}

interface AddFavoriteArgs {
  input: FavoriteInput;
}

interface RemoveFavoriteArgs {
  input: FavoriteInput;
}

interface CreatePriceAlertArgs {
  input: PriceAlertInput;
}

interface TrackEventArgs {
  input: EventInput;
}

interface TriggerPriceCollectionArgs {
  input?: PriceCollectionInput;
}

interface RefreshCacheArgs {
  type: string;
}

interface PriceUpdatesArgs {
  cardIds?: string[];
}

interface CollectionUpdatesArgs {
  userId: string;
}

interface PriceAlertsArgs {
  userId: string;
}

// Parent object types (for field resolvers)
type QueryParent = Record<string, never>;
type MutationParent = Record<string, never>;
type SubscriptionParent = Record<string, never>;

// Supabase manager interfaces
interface FavoritesManager {
  addFavorite(itemType: string, itemId: string, itemData?: unknown, userId?: string | null): Promise<boolean>;
  removeFavorite(itemType: string, itemId: string, userId?: string | null): Promise<boolean>;
}

interface PriceHistoryManager {
  addPriceAlert(
    userId: string,
    cardId: string,
    cardName: string,
    alertType: string,
    targetPrice?: number,
    percentageChange?: number
  ): Promise<{
    id: string;
    card_id: string;
    card_name: string;
    alert_type: string;
    target_price?: number;
    percentage_change?: number;
    is_active: boolean;
    created_at: string;
    triggered_at?: string;
  } | null>;
}

interface ExtendedSupabase {
  FavoritesManager: FavoritesManager;
  PriceHistoryManager: PriceHistoryManager;
}

// Resolver function types
type QueryResolver<TArgs = Record<string, unknown>, TResult = unknown> = (
  parent: QueryParent,
  args: TArgs,
  context: GraphQLContext,
  info: GraphQLResolveInfo
) => Promise<TResult>;

type MutationResolver<TArgs = Record<string, unknown>, TResult = unknown> = (
  parent: MutationParent,
  args: TArgs,
  context: GraphQLContext,
  info: GraphQLResolveInfo
) => Promise<TResult>;

type SubscriptionResolver<TArgs = Record<string, unknown>, TResult = unknown> = (
  parent: SubscriptionParent,
  args: TArgs,
  context: GraphQLContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult>;

export const resolvers = {
  Query: {
    // Card queries
    card: async (parent: QueryParent, { id }: CardArgs, context: GraphQLContext, info: GraphQLResolveInfo): Promise<Card | null> => {
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

        return (data as { card_data?: unknown })?.card_data ? parseCardData((data as { card_data: unknown }).card_data) : null;
      } catch (error) {
        logger.error('Card query error:', error);
        throw new Error('Failed to fetch card');
      }
    },

    cards: async (
      parent: QueryParent, 
      { search, filters, sort, pagination }: CardsArgs, 
      context: GraphQLContext,
      info: GraphQLResolveInfo
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
          throw new Error(`Card search failed: ${result.error instanceof Error ? result.error.message : String(result.error)}`);
        }

        return formatConnectionResult((result.data as Record<string, unknown>[]) || [], pagination);
      } catch (error) {
        logger.error('Cards query error:', error);
        throw new Error('Failed to search cards');
      }
    },

    // Pokemon queries
    pokemon: async (parent: QueryParent, { id }: PokemonArgs, context: GraphQLContext, info: GraphQLResolveInfo): Promise<Pokemon | null> => {
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

        return (data as { pokemon_data?: unknown })?.pokemon_data ? parsePokemonData((data as { pokemon_data: unknown }).pokemon_data) : null;
      } catch (error) {
        logger.error('Pokemon query error:', error);
        throw new Error('Failed to fetch pokemon');
      }
    },

    // Price queries
    priceHistory: async (
      parent: QueryParent, 
      { cardId, variantType, daysBack }: PriceHistoryArgs,
      context: GraphQLContext,
      info: GraphQLResolveInfo
    ): Promise<PriceHistoryEntry[]> => {
      try {
        const result = await databaseOptimizer.getPriceHistory(cardId, variantType, daysBack);
        
        if (result.error) {
          throw new Error(`Price history fetch failed: ${result.error instanceof Error ? result.error.message : String(result.error)}`);
        }

        return ((result.data as Record<string, unknown>[]) || []).map((entry: Record<string, unknown>) => ({
          date: String(entry.collected_at || ''),
          price: typeof entry.price_market === 'number' ? entry.price_market : 0,
          volume: typeof entry.volume === 'number' ? entry.volume : 0,
          marketCap: typeof entry.market_cap_estimate === 'number' ? entry.market_cap_estimate : 0,
          source: 'tcgplayer'
        }));
      } catch (error) {
        logger.error('Price history query error:', error);
        throw new Error('Failed to fetch price history');
      }
    },

    priceStats: async (
      parent: QueryParent,
      { cardId, variantType, daysBack }: PriceStatsArgs,
      context: GraphQLContext,
      info: GraphQLResolveInfo
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
      parent: QueryParent,
      { limit }: TrendingCardsArgs,
      context: GraphQLContext,
      info: GraphQLResolveInfo
    ): Promise<TrendingCard[]> => {
      try {
        const trendAnalysis = await priceCollector.generateMarketTrendAnalysis(7);
        
        if (!trendAnalysis || !trendAnalysis.marketOverview) {
          return [];
        }

        const overview = trendAnalysis.marketOverview as unknown as Record<string, unknown>;
        const topGainers = overview.topGainers as CardTrend[];
        return topGainers
          .slice(0, limit || 10)
          .map((card: CardTrend, index: number) => ({
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
      parent: QueryParent,
      { type, cardId, daysBack }: AnalyticsArgs,
      context: GraphQLContext,
      info: GraphQLResolveInfo
    ): Promise<AnalyticsData> => {
      try {
        let analyticsData: Record<string, unknown> | null;

        switch (type) {
          case 'OVERVIEW':
            analyticsData = (await analyticsEngine.generateAnalyticsReport(daysBack)) as unknown as Record<string, unknown> || {};
            break;
          case 'USER_BEHAVIOR':
            analyticsData = (await analyticsEngine.getUserBehaviorAnalytics(daysBack)) as unknown as Record<string, unknown> || {};
            break;
          case 'SEARCH':
            analyticsData = (await analyticsEngine.getSearchAnalytics(daysBack)) as unknown as Record<string, unknown> || {};
            break;
          case 'CARD_PERFORMANCE':
            if (!cardId) throw new Error('cardId required for CARD_PERFORMANCE analytics');
            analyticsData = (await analyticsEngine.getCardPerformanceAnalytics(cardId, daysBack)) as unknown as Record<string, unknown> || {};
            break;
          default:
            throw new Error(`Unsupported analytics type: ${type}`);
        }

        if (!analyticsData || Object.keys(analyticsData).length === 0) {
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
      parent: QueryParent,
      { query, limit }: SearchSuggestionsArgs,
      context: GraphQLContext,
      info: GraphQLResolveInfo
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

        return (data || []).map((item: Record<string, unknown>) => {
          const cardData = item.card_data as Record<string, unknown> | undefined;
          const cardSet = cardData?.set as Record<string, unknown> | undefined;
          return {
            text: cardData?.name ? String(cardData.name) : '',
            type: 'card',
            category: cardSet?.name ? String(cardSet.name) : 'Unknown',
            popularity: 0 // Could be calculated from analytics
          };
        });
      } catch (error) {
        logger.error('Search suggestions query error:', error);
        throw new Error('Failed to fetch search suggestions');
      }
    },

    // Market overview
    marketOverview: async (
      parent: QueryParent,
      { daysBack }: MarketOverviewArgs,
      context: GraphQLContext,
      info: GraphQLResolveInfo
    ): Promise<MarketOverview> => {
      try {
        const trendAnalysis = await priceCollector.generateMarketTrendAnalysis(daysBack || 7);
        
        if (!trendAnalysis || !trendAnalysis.marketOverview) {
          throw new Error('Market overview data not available');
        }

        const rawOverview = trendAnalysis.marketOverview as unknown as Record<string, unknown>;
        const overview: MarketOverview = {
          ...rawOverview,
          totalCards: typeof rawOverview.totalCards === 'number' ? rawOverview.totalCards : 0,
          topGainers: Array.isArray(rawOverview.topGainers) ? rawOverview.topGainers as CardTrend[] : [],
          topLosers: Array.isArray(rawOverview.topLosers) ? rawOverview.topLosers as CardTrend[] : [],
          mostVolatile: Array.isArray(rawOverview.mostVolatile) ? rawOverview.mostVolatile as CardTrend[] : [],
          averagePrice: 0, // Will be calculated
          totalVolume: 0, // Will be calculated
          marketSentiment: 'neutral' as const, // Will be calculated
          lastUpdated: String(trendAnalysis.generatedAt || '')
        };
        
        return {
          totalCards: overview.totalCards,
          averagePrice: calculateAveragePrice(overview),
          totalVolume: calculateTotalVolume(overview),
          topGainers: overview.topGainers.slice(0, 5).map((card: CardTrend, index: number) => ({
            card: parseCardData(card),
            priceChange: card.priceChange || 0,
            priceChangePercent: card.priceChangePercent || 0,
            volume: card.volume || 0,
            rank: index + 1
          })),
          topLosers: overview.topLosers.slice(0, 5).map((card: CardTrend, index: number) => ({
            card: parseCardData(card),
            priceChange: card.priceChange || 0,
            priceChangePercent: card.priceChangePercent || 0,
            volume: card.volume || 0,
            rank: index + 1
          })),
          mostVolatile: overview.mostVolatile.slice(0, 5).map((card: CardTrend, index: number) => ({
            card: parseCardData(card),
            priceChange: card.priceChange || 0,
            priceChangePercent: card.priceChangePercent || 0,
            volume: card.volume || 0,
            rank: index + 1
          })),
          marketSentiment: calculateMarketSentiment(overview),
          lastUpdated: overview.lastUpdated
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
      parent: MutationParent,
      { input }: AddFavoriteArgs,
      context: GraphQLContext,
      info: GraphQLResolveInfo
    ): Promise<MutationResult<Card | Pokemon>> => {
      try {
        const { itemType, itemId, itemData } = input;
        const userId = context.user?.id || null;

        const success = await (supabase as unknown as ExtendedSupabase).FavoritesManager.addFavorite(
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
      parent: MutationParent,
      { input }: RemoveFavoriteArgs,
      context: GraphQLContext,
      info: GraphQLResolveInfo
    ): Promise<MutationResult<null>> => {
      try {
        const { itemType, itemId } = input;
        const userId = context.user?.id || null;

        const success = await (supabase as unknown as ExtendedSupabase).FavoritesManager.removeFavorite(
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
      parent: MutationParent,
      { input }: CreatePriceAlertArgs,
      context: GraphQLContext,
      info: GraphQLResolveInfo
    ): Promise<PriceAlert> => {
      try {
        const userId = context.user?.id;
        if (!userId) {
          throw new Error('Authentication required');
        }

        const alert = await (supabase as unknown as ExtendedSupabase).PriceHistoryManager.addPriceAlert(
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
      parent: MutationParent,
      { input }: TrackEventArgs,
      context: GraphQLContext,
      info: GraphQLResolveInfo
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
      parent: MutationParent,
      { input }: TriggerPriceCollectionArgs,
      context: GraphQLContext,
      info: GraphQLResolveInfo
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
      parent: MutationParent,
      { type }: RefreshCacheArgs,
      context: GraphQLContext,
      info: GraphQLResolveInfo
    ): Promise<boolean> => {
      try {
        if (!context.user?.isAdmin) {
          throw new Error('Admin access required');
        }

        switch (type) {
          case 'CARDS':
            await cacheManager.clear();
            break;
          case 'POKEMON':
            await cacheManager.clear();
            break;
          case 'PRICES':
            await cacheManager.clear();
            break;
          case 'ALL':
            await cacheManager.clear();
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
      subscribe: (parent: SubscriptionParent, { cardIds }: PriceUpdatesArgs, context: GraphQLContext, info: GraphQLResolveInfo) => {
        // Filter updates for specific cards
        return pubsub.asyncIterator([PRICE_UPDATE]);
      }
    },

    // Market trend updates
    marketTrends: {
      subscribe: (parent: SubscriptionParent, args: Record<string, never>, context: GraphQLContext, info: GraphQLResolveInfo) => pubsub.asyncIterator([MARKET_TREND_UPDATE])
    },

    // Collection updates
    collectionUpdates: {
      subscribe: (parent: SubscriptionParent, { userId }: CollectionUpdatesArgs, context: GraphQLContext, info: GraphQLResolveInfo) => {
        if (context.user?.id !== userId && !context.user?.isAdmin) {
          throw new Error('Access denied');
        }
        return pubsub.asyncIterator([COLLECTION_UPDATE]);
      }
    },

    // Price alert notifications
    priceAlerts: {
      subscribe: (parent: SubscriptionParent, { userId }: PriceAlertsArgs, context: GraphQLContext, info: GraphQLResolveInfo) => {
        if (context.user?.id !== userId && !context.user?.isAdmin) {
          throw new Error('Access denied');
        }
        return pubsub.asyncIterator([PRICE_ALERT_NOTIFICATION]);
      }
    }
  }
};

// Helper functions
function parseCardData(cardData: unknown): Card {
  let data = cardData;
  if (typeof cardData === 'string') {
    data = JSON.parse(cardData);
  }
  
  const card = data as Record<string, unknown>;
  const set = card.set as Record<string, unknown> | undefined;
  const images = card.images as Record<string, unknown> | undefined;
  const tcgplayer = card.tcgplayer as Record<string, unknown> | undefined;
  const setImages = set?.images as Record<string, unknown> | undefined;

  return {
    id: String(card.id || ''),
    name: String(card.name || ''),
    set: {
      id: String(set?.id || ''),
      name: String(set?.name || ''),
      series: set?.series ? String(set.series) : undefined,
      releaseDate: set?.releaseDate ? String(set.releaseDate) : undefined,
      total: typeof set?.total === 'number' ? set.total : undefined,
      logoUrl: setImages?.logo ? String(setImages.logo) : undefined,
      symbolUrl: setImages?.symbol ? String(setImages.symbol) : undefined
    },
    rarity: card.rarity ? String(card.rarity) : undefined,
    artist: card.artist ? String(card.artist) : undefined,
    imageUrl: images?.small ? String(images.small) : undefined,
    imageUrlHiRes: images?.large ? String(images.large) : undefined,
    types: Array.isArray(card.types) ? card.types.map(String) : [],
    supertype: card.supertype ? String(card.supertype) : undefined,
    subtypes: Array.isArray(card.subtypes) ? card.subtypes.map(String) : [],
    hp: card.hp ? parseInt(String(card.hp)) : null,
    number: card.number ? String(card.number) : undefined,
    prices: parsePrices(tcgplayer?.prices),
    tcgplayerUrl: tcgplayer?.url ? String(tcgplayer.url) : undefined,
    marketData: parseMarketData(card),
    analytics: parseCardAnalytics(card)
  };
}

function parsePokemonData(pokemonData: unknown): Pokemon {
  let data = pokemonData;
  if (typeof pokemonData === 'string') {
    data = JSON.parse(pokemonData);
  }
  
  const pokemon = data as Record<string, unknown>;
  const images = pokemon.images as Record<string, unknown> | undefined;
  const stats = pokemon.stats as Record<string, number> | undefined;

  return {
    id: typeof pokemon.id === 'number' ? pokemon.id : Number(pokemon.id) || 0,
    name: String(pokemon.name || ''),
    nationalPokedexNumber: typeof pokemon.nationalPokedexNumber === 'number' ? pokemon.nationalPokedexNumber : undefined,
    types: Array.isArray(pokemon.types) ? pokemon.types.map(String) : [],
    height: typeof pokemon.height === 'number' ? pokemon.height : undefined,
    weight: typeof pokemon.weight === 'number' ? pokemon.weight : undefined,
    description: pokemon.flavorText ? String(pokemon.flavorText) : undefined,
    imageUrl: images?.large ? String(images.large) : undefined,
    stats: stats || {}
  };
}

function parsePrices(tcgplayerPrices: unknown): PriceData | null {
  if (!tcgplayerPrices) return null;

  const parseVariant = (variant: unknown): PriceVariant | null => {
    if (!variant || typeof variant !== 'object') return null;
    const v = variant as Record<string, unknown>;
    return {
      low: typeof v.low === 'number' ? v.low : undefined,
      mid: typeof v.mid === 'number' ? v.mid : undefined,
      high: typeof v.high === 'number' ? v.high : undefined,
      market: typeof v.market === 'number' ? v.market : undefined,
      directLow: typeof v.directLow === 'number' ? v.directLow : undefined
    };
  };
  
  const prices = tcgplayerPrices as Record<string, unknown>;

  return {
    normal: parseVariant(prices.normal),
    holofoil: parseVariant(prices.holofoil),
    reverseHolofoil: parseVariant(prices.reverseHolofoil),
    unlimited: parseVariant(prices.unlimited),
    firstEdition: parseVariant(prices['1stEdition'])
  };
}

function parseMarketData(cardData: unknown): MarketData {
  const data = cardData as Record<string, unknown>;
  return {
    volatility: typeof data.price_volatility === 'number' ? data.price_volatility : 0,
    spread: typeof data.price_spread === 'number' ? data.price_spread : 0,
    stabilityScore: typeof data.price_stability_score === 'number' ? data.price_stability_score : 0,
    liquidityIndicator: typeof data.liquidity_indicator === 'number' ? data.liquidity_indicator : 0,
    trendDirection: typeof data.trend_direction === 'string' ? data.trend_direction : 'neutral',
    priceChangePercent24h: 0, // Would need to calculate from price history
    priceChangePercent7d: 0,
    priceChangePercent30d: 0
  };
}

function parseCardAnalytics(cardData: unknown): CardAnalytics {
  return {
    views: 0, // Would come from analytics data
    favorites: 0,
    searches: 0,
    popularityScore: 0,
    engagementScore: 0
  };
}

function formatConnectionResult(data: Array<Record<string, unknown>>, pagination?: PaginationInput): ConnectionResult<Card> {
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

function extractInsights(analyticsData: unknown, type: string): string[] {
  // Extract insights based on analytics type
  const insights: string[] = [];
  
  if (type === 'SEARCH' && analyticsData && typeof analyticsData === 'object') {
    const data = analyticsData as Record<string, unknown>;
    if (Array.isArray(data.insights)) {
      return data.insights.map(String);
    }
  }
  
  return insights;
}

function calculateAveragePrice(overview: MarketOverview): number {
  // Calculate from trending cards
  const allCards = [...overview.topGainers, ...overview.topLosers];
  if (allCards.length === 0) return 0;
  
  const totalPrice = allCards.reduce((sum: number, card: CardTrend) => {
    return sum + (card.currentPrice || 0);
  }, 0);
  return totalPrice / allCards.length;
}

function calculateTotalVolume(overview: MarketOverview): number {
  // Calculate from trending cards
  const allCards = [...overview.topGainers, ...overview.topLosers];
  return allCards.reduce((sum: number, card: CardTrend) => {
    return sum + (card.volume || 0);
  }, 0);
}

function calculateMarketSentiment(overview: MarketOverview): 'bullish' | 'bearish' | 'neutral' {
  const gainers = overview.topGainers.length;
  const losers = overview.topLosers.length;
  
  if (gainers > losers * 1.5) return 'bullish';
  if (losers > gainers * 1.5) return 'bearish';
  return 'neutral';
}

// Export pubsub for external use
export { pubsub };
export default resolvers;