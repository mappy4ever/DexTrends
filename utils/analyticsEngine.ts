/**
 * Comprehensive Analytics Engine
 * Tracks user behavior, card performance, and generates insights
 */

import { supabase } from '../lib/supabase';
import logger from './logger';

// Types for analytics data
interface EventData {
  [key: string]: unknown;
  timestamp?: string;
  user_agent?: string | null;
  url?: string | null;
  referrer?: string | null;
  session_id?: string;
  card_id?: string;
  card_name?: string;
  action?: string;
  query?: string;
  results_count?: number;
  price_type?: string;
}

interface AnalyticsEvent {
  session_id: string;
  user_id: string | null;
  event_type: string;
  event_data: EventData;
  created_at: string;
}

interface SessionData {
  startTime: number;
  eventCount: number;
  cardViews: Set<string>;
  searchQueries: string[];
  pages: Set<string>;
  lastActivity: number;
}

interface CardPerformanceAnalytics {
  views: {
    total: number;
    uniqueSessions: number;
    byDay: Record<string, number>;
    averagePerDay: number;
  };
  favorites: {
    total: number;
    adds: number;
    removes: number;
  };
  priceChecks: {
    total: number;
    byType: Record<string, number>;
  };
  engagement: {
    score: number;
    popularity: 'low' | 'medium' | 'high';
  };
}

interface UserBehaviorAnalytics {
  overview: {
    totalEvents: number;
    uniqueSessions: number;
    uniqueUsers: number;
    averageEventsPerSession: number;
  };
  eventTypes: Record<string, number>;
  hourlyDistribution: Record<number, number>;
  popularCards: Array<[string, number]>;
  searchTerms: Array<[string, number]>;
  userJourneys: unknown[];
}

interface SearchAnalytics {
  overview: {
    totalSearches: number;
    uniqueQueries: number;
    uniqueSessions: number;
    averageSearchesPerSession: number;
  };
  queryAnalysis: {
    topQueries: Array<[string, number]>;
    queryLength: Record<string, number>;
    emptyResults: string[];
    lowResults: string[];
  };
  trends: {
    byHour: Record<number, number>;
    byDay: Record<string, number>;
  };
  insights: SearchInsight[];
}

interface SearchInsight {
  type: string;
  message: string;
  impact: 'positive' | 'negative' | 'neutral';
  suggestion: string;
}

interface AnalyticsReport {
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  userBehavior: UserBehaviorAnalytics | null;
  searchAnalytics: SearchAnalytics | null;
  generatedAt: string;
}

class AnalyticsEngine {
  private sessionData: Map<string, SessionData>;
  private eventQueue: AnalyticsEvent[];
  private flushInterval: number;
  private maxQueueSize: number;
  private isClient: boolean;

  constructor() {
    this.sessionData = new Map();
    this.eventQueue = [];
    this.flushInterval = 30000; // 30 seconds
    this.maxQueueSize = 100;
    this.isClient = typeof window !== 'undefined';
    
    if (this.isClient) {
      this.initializeClientAnalytics();
    }
  }

  /**
   * Initialize client-side analytics tracking
   */
  private initializeClientAnalytics(): void {
    // Start event flushing interval
    setInterval(() => this.flushEvents(), this.flushInterval);

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', { timestamp: String(Date.now()) });
        this.flushEvents(); // Immediate flush when leaving
      } else {
        this.trackEvent('page_visible', { timestamp: String(Date.now()) });
      }
    });

    // Track before unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });
  }

  /**
   * Track user events with context
   */
  trackEvent(eventType: string, eventData: EventData = {}, userId: string | null = null): void {
    const sessionId = this.getSessionId();
    const timestamp = new Date().toISOString();

    const event: AnalyticsEvent = {
      session_id: sessionId,
      user_id: userId,
      event_type: eventType,
      event_data: {
        ...eventData,
        timestamp,
        user_agent: this.isClient ? navigator.userAgent : null,
        url: this.isClient ? window.location.href : null,
        referrer: this.isClient ? document.referrer : null
      },
      created_at: timestamp
    };

    // Add to queue
    this.eventQueue.push(event);

    // Update session data
    this.updateSessionData(sessionId, eventType, eventData);

    // Flush if queue is getting full
    if (this.eventQueue.length >= this.maxQueueSize) {
      this.flushEvents();
    }

    logger.debug('Event tracked:', { eventType, sessionId });
  }

  /**
   * Track card interactions
   */
  trackCardView(cardId: string, cardName: string, setName: string, source = 'unknown', userId: string | null = null): void {
    this.trackEvent('card_view', {
      card_id: cardId,
      card_name: cardName,
      set_name: setName,
      source,
      view_duration_start: String(Date.now())
    }, userId);
  }

  trackCardFavorite(cardId: string, cardName: string, action: 'add' | 'remove' = 'add', userId: string | null = null): void {
    this.trackEvent('card_favorite', {
      card_id: cardId,
      card_name: cardName,
      action, // 'add' or 'remove'
    }, userId);
  }

  trackCardPriceCheck(cardId: string, cardName: string, priceType: string, userId: string | null = null): void {
    this.trackEvent('card_price_check', {
      card_id: cardId,
      card_name: cardName,
      price_type: priceType // 'history', 'current', 'alert'
    }, userId);
  }

  trackSearch(query: string, resultsCount: number, filters: Record<string, any> = {}, userId: string | null = null): void {
    this.trackEvent('search', {
      query,
      results_count: resultsCount,
      filters,
      search_type: 'cards'
    }, userId);
  }

  trackPokemonView(pokemonId: string | number, pokemonName: string, source = 'unknown', userId: string | null = null): void {
    this.trackEvent('pokemon_view', {
      pokemon_id: pokemonId,
      pokemon_name: pokemonName,
      source
    }, userId);
  }

  trackDeckAction(action: string, deckData: Record<string, any> = {}, userId: string | null = null): void {
    this.trackEvent('deck_action', {
      action, // 'create', 'edit', 'delete', 'view', 'share'
      ...deckData
    }, userId);
  }

  trackCollectionAction(action: string, collectionData: Record<string, any> = {}, userId: string | null = null): void {
    this.trackEvent('collection_action', {
      action, // 'add', 'remove', 'value_check'
      ...collectionData
    }, userId);
  }

  trackPerformanceMetric(metric: string, value: number, context: Record<string, any> = {}): void {
    this.trackEvent('performance_metric', {
      metric,
      value,
      ...context
    });
  }

  /**
   * Track user journey through the app
   */
  trackUserJourney(step: string, metadata: Record<string, any> = {}, userId: string | null = null): void {
    this.trackEvent('user_journey', {
      step,
      ...metadata
    }, userId);
  }

  /**
   * Update session data for analysis
   */
  private updateSessionData(sessionId: string, eventType: string, eventData: EventData): void {
    if (!this.sessionData.has(sessionId)) {
      this.sessionData.set(sessionId, {
        startTime: Date.now(),
        eventCount: 0,
        cardViews: new Set(),
        searchQueries: [],
        pages: new Set(),
        lastActivity: Date.now()
      });
    }

    const session = this.sessionData.get(sessionId)!;
    session.eventCount++;
    session.lastActivity = Date.now();

    // Track specific metrics
    switch (eventType) {
      case 'card_view':
        if (eventData.card_id) {
          session.cardViews.add(eventData.card_id);
        }
        break;
      case 'search':
        if (eventData.query) {
          session.searchQueries.push(eventData.query);
        }
        break;
      case 'page_view':
        if (eventData.page) {
          session.pages.add(eventData.page);
        }
        break;
    }

    this.sessionData.set(sessionId, session);
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    if (!this.isClient) return `server_${Date.now()}`;

    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Flush events to database
   */
  async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue.length = 0; // Clear queue

    try {
      const { error } = await supabase
        .from('user_analytics_events')
        .insert(eventsToFlush);

      if (error) {
        logger.error('Error flushing analytics events:', error);
        // Re-add events to queue for retry
        this.eventQueue.unshift(...eventsToFlush);
      } else {
        logger.debug(`Flushed ${eventsToFlush.length} analytics events`);
      }
    } catch (error) {
      logger.error('Error in flushEvents:', error);
      // Re-add events to queue for retry
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  /**
   * Get card performance analytics
   */
  async getCardPerformanceAnalytics(cardId: string, daysBack = 30): Promise<CardPerformanceAnalytics | null> {
    try {
      const sinceDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

      // Get view analytics
      const { data: viewData, error: viewError } = await supabase
        .from('user_analytics_events')
        .select('event_data, created_at')
        .eq('event_type', 'card_view')
        .gte('created_at', sinceDate)
        .like('event_data->>card_id', cardId);

      if (viewError) {
        logger.error('Error fetching card view analytics:', viewError);
        return null;
      }

      // Get favorite analytics
      const { data: favoriteData, error: favoriteError } = await supabase
        .from('user_analytics_events')
        .select('event_data, created_at')
        .eq('event_type', 'card_favorite')
        .gte('created_at', sinceDate)
        .like('event_data->>card_id', cardId);

      if (favoriteError) {
        logger.error('Error fetching card favorite analytics:', favoriteError);
      }

      // Get price check analytics
      const { data: priceData, error: priceError } = await supabase
        .from('user_analytics_events')
        .select('event_data, created_at')
        .eq('event_type', 'card_price_check')
        .gte('created_at', sinceDate)
        .like('event_data->>card_id', cardId);

      if (priceError) {
        logger.error('Error fetching card price analytics:', priceError);
      }

      return this.analyzeCardPerformance(viewData || [], favoriteData || [], priceData || []);
    } catch (error) {
      logger.error('Error getting card performance analytics:', error);
      return null;
    }
  }

  /**
   * Analyze card performance data
   */
  private analyzeCardPerformance(
    viewData: Array<{event_data: EventData; created_at: string}>, 
    favoriteData: Array<{event_data: EventData; created_at: string}>, 
    priceData: Array<{event_data: EventData; created_at: string}>
  ): CardPerformanceAnalytics {
    const analytics: CardPerformanceAnalytics = {
      views: {
        total: viewData.length,
        uniqueSessions: new Set(viewData.map(v => v.event_data?.session_id)).size,
        byDay: {},
        averagePerDay: 0
      },
      favorites: {
        total: favoriteData.length,
        adds: favoriteData.filter(f => f.event_data?.action === 'add').length,
        removes: favoriteData.filter(f => f.event_data?.action === 'remove').length
      },
      priceChecks: {
        total: priceData.length,
        byType: {}
      },
      engagement: {
        score: 0,
        popularity: 'low'
      }
    };

    // Analyze views by day
    viewData.forEach(view => {
      const day = new Date(view.created_at).toISOString().split('T')[0];
      analytics.views.byDay[day] = (analytics.views.byDay[day] || 0) + 1;
    });

    const dayCount = Object.keys(analytics.views.byDay).length;
    analytics.views.averagePerDay = dayCount > 0 ? analytics.views.total / dayCount : 0;

    // Analyze price checks by type
    priceData.forEach(check => {
      const type = check.event_data?.price_type || 'unknown';
      analytics.priceChecks.byType[type] = (analytics.priceChecks.byType[type] || 0) + 1;
    });

    // Calculate engagement score
    const viewScore = Math.min(analytics.views.total * 1, 50);
    const favoriteScore = analytics.favorites.adds * 5;
    const priceScore = analytics.priceChecks.total * 2;
    const uniqueScore = analytics.views.uniqueSessions * 3;

    analytics.engagement.score = viewScore + favoriteScore + priceScore + uniqueScore;

    // Determine popularity
    if (analytics.engagement.score >= 100) {
      analytics.engagement.popularity = 'high';
    } else if (analytics.engagement.score >= 50) {
      analytics.engagement.popularity = 'medium';
    } else {
      analytics.engagement.popularity = 'low';
    }

    return analytics;
  }

  /**
   * Get user behavior analytics
   */
  async getUserBehaviorAnalytics(daysBack = 30): Promise<UserBehaviorAnalytics | null> {
    try {
      const sinceDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

      const { data: events, error } = await supabase
        .from('user_analytics_events')
        .select('*')
        .gte('created_at', sinceDate)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching user behavior analytics:', error);
        return null;
      }

      return this.analyzeUserBehavior(events);
    } catch (error) {
      logger.error('Error getting user behavior analytics:', error);
      return null;
    }
  }

  /**
   * Analyze user behavior patterns
   */
  private analyzeUserBehavior(events: AnalyticsEvent[]): UserBehaviorAnalytics {
    const analytics: UserBehaviorAnalytics = {
      overview: {
        totalEvents: events.length,
        uniqueSessions: new Set(events.map(e => e.session_id)).size,
        uniqueUsers: new Set(events.filter(e => e.user_id).map(e => e.user_id)).size,
        averageEventsPerSession: 0
      },
      eventTypes: {},
      hourlyDistribution: {},
      popularCards: [],
      searchTerms: [],
      userJourneys: []
    };

    const popularCardsMap: Record<string, number> = {};
    const searchTermsMap: Record<string, number> = {};

    // Analyze event types
    events.forEach(event => {
      analytics.eventTypes[event.event_type] = (analytics.eventTypes[event.event_type] || 0) + 1;

      // Analyze by hour
      const hour = new Date(event.created_at).getHours();
      analytics.hourlyDistribution[hour] = (analytics.hourlyDistribution[hour] || 0) + 1;

      // Track popular cards
      if (event.event_type === 'card_view' && event.event_data?.card_id) {
        const cardKey = `${event.event_data.card_id}_${event.event_data.card_name}`;
        popularCardsMap[cardKey] = (popularCardsMap[cardKey] || 0) + 1;
      }

      // Track search terms
      if (event.event_type === 'search' && event.event_data?.query) {
        searchTermsMap[event.event_data.query] = (searchTermsMap[event.event_data.query] || 0) + 1;
      }
    });

    analytics.overview.averageEventsPerSession = analytics.overview.uniqueSessions > 0 
      ? analytics.overview.totalEvents / analytics.overview.uniqueSessions 
      : 0;

    // Convert to sorted arrays for easier consumption
    analytics.popularCards = Object.entries(popularCardsMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);

    analytics.searchTerms = Object.entries(searchTermsMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 50);

    return analytics;
  }

  /**
   * Get search analytics and insights
   */
  async getSearchAnalytics(daysBack = 30): Promise<SearchAnalytics | null> {
    try {
      const sinceDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

      const { data: searchEvents, error } = await supabase
        .from('user_analytics_events')
        .select('event_data, created_at, session_id')
        .eq('event_type', 'search')
        .gte('created_at', sinceDate)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching search analytics:', error);
        return null;
      }

      return this.analyzeSearchBehavior(searchEvents);
    } catch (error) {
      logger.error('Error getting search analytics:', error);
      return null;
    }
  }

  /**
   * Analyze search behavior and generate insights
   */
  private analyzeSearchBehavior(searchEvents: Array<{event_data: EventData; created_at: string; session_id: string}>): SearchAnalytics {
    const analytics: SearchAnalytics = {
      overview: {
        totalSearches: searchEvents.length,
        uniqueQueries: new Set(searchEvents.map(e => e.event_data?.query)).size,
        uniqueSessions: new Set(searchEvents.map(e => e.session_id)).size,
        averageSearchesPerSession: 0
      },
      queryAnalysis: {
        topQueries: [],
        queryLength: {},
        emptyResults: [],
        lowResults: []
      },
      trends: {
        byHour: {},
        byDay: {}
      },
      insights: []
    };

    const topQueriesMap: Record<string, number> = {};

    // Analyze queries
    searchEvents.forEach(event => {
      const query = event.event_data?.query || '';
      const resultsCount = event.event_data?.results_count || 0;
      const hour = new Date(event.created_at).getHours();
      const day = new Date(event.created_at).toISOString().split('T')[0];

      // Track query popularity
      topQueriesMap[query] = (topQueriesMap[query] || 0) + 1;

      // Track query length
      const length = query.length;
      const lengthBucket = length < 5 ? 'short' : length < 15 ? 'medium' : 'long';
      analytics.queryAnalysis.queryLength[lengthBucket] = (analytics.queryAnalysis.queryLength[lengthBucket] || 0) + 1;

      // Track empty or low results
      if (resultsCount === 0) {
        analytics.queryAnalysis.emptyResults.push(query);
      } else if (resultsCount < 5) {
        analytics.queryAnalysis.lowResults.push(query);
      }

      // Track trends
      analytics.trends.byHour[hour] = (analytics.trends.byHour[hour] || 0) + 1;
      analytics.trends.byDay[day] = (analytics.trends.byDay[day] || 0) + 1;
    });

    analytics.overview.averageSearchesPerSession = analytics.overview.uniqueSessions > 0
      ? analytics.overview.totalSearches / analytics.overview.uniqueSessions
      : 0;

    // Generate insights
    analytics.insights = this.generateSearchInsights(analytics);

    // Convert to sorted arrays
    analytics.queryAnalysis.topQueries = Object.entries(topQueriesMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 50);

    return analytics;
  }

  /**
   * Generate insights from search analytics
   */
  private generateSearchInsights(analytics: SearchAnalytics): SearchInsight[] {
    const insights: SearchInsight[] = [];

    // Empty results insight
    if (analytics.queryAnalysis.emptyResults.length > 0) {
      insights.push({
        type: 'empty_results',
        message: `${analytics.queryAnalysis.emptyResults.length} searches returned no results`,
        impact: 'negative',
        suggestion: 'Consider improving search algorithm or adding more content'
      });
    }

    // Query length insights
    const shortQueries = analytics.queryAnalysis.queryLength.short || 0;
    const totalQueries = analytics.overview.totalSearches;
    
    if (shortQueries / totalQueries > 0.6) {
      insights.push({
        type: 'short_queries',
        message: 'Most searches use very short queries',
        impact: 'neutral',
        suggestion: 'Consider implementing auto-suggestions for short queries'
      });
    }

    // Peak usage insights
    const hourlyValues = Object.values(analytics.trends.byHour);
    const maxHour = Object.keys(analytics.trends.byHour).find(
      h => analytics.trends.byHour[Number(h)] === Math.max(...hourlyValues)
    );
    
    if (maxHour) {
      insights.push({
        type: 'peak_hour',
        message: `Peak search time is ${maxHour}:00`,
        impact: 'positive',
        suggestion: 'Consider optimizing performance during peak hours'
      });
    }

    return insights;
  }

  /**
   * Generate comprehensive analytics report
   */
  async generateAnalyticsReport(daysBack = 30): Promise<AnalyticsReport | null> {
    try {
      logger.info('Generating comprehensive analytics report');

      const [userBehavior, searchAnalytics] = await Promise.all([
        this.getUserBehaviorAnalytics(daysBack),
        this.getSearchAnalytics(daysBack)
      ]);

      const report: AnalyticsReport = {
        period: {
          days: daysBack,
          startDate: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        },
        userBehavior,
        searchAnalytics,
        generatedAt: new Date().toISOString()
      };

      logger.info('Analytics report generated successfully');
      return report;
    } catch (error) {
      logger.error('Error generating analytics report:', error);
      return null;
    }
  }
}

// Create global instance
const analyticsEngine = new AnalyticsEngine();

export default analyticsEngine;