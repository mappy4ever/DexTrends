import { tcgCache, POPULAR_SETS } from './tcg-cache';
import { fetchJSON } from '../utils/unifiedFetch';
import logger from '../utils/logger';
import type { TCGCard, CardSet } from '../types/api/cards';
import type { TCGApiResponse } from '../types/api/enhanced-responses';

interface WarmingTask {
  setId: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  lastWarmed?: Date;
}

class BackgroundCacheWarmer {
  private isRunning = false;
  private warmingInterval: NodeJS.Timeout | null = null;
  private startupWarmed = false;
  
  // Priority sets that should always be cached
  private readonly PRIORITY_SETS: WarmingTask[] = [
    // Most recent sets (critical priority)
    { setId: 'sv8pt5', priority: 'critical' }, // Prismatic Evolutions
    { setId: 'sv8', priority: 'critical' },    // Surging Sparks
    { setId: 'sv7', priority: 'critical' },    // Stellar Crown
    { setId: 'sv6pt5', priority: 'critical' }, // Shrouded Fable
    { setId: 'sv6', priority: 'critical' },    // Twilight Masquerade
    { setId: 'sv5', priority: 'critical' },    // Temporal Forces
    { setId: 'sv4pt5', priority: 'critical' }, // Paldean Fates
    { setId: 'sv4', priority: 'critical' },    // Paradox Rift
    { setId: 'sv3pt5', priority: 'critical' }, // 151 - This is the one user mentioned!
    { setId: 'sv3', priority: 'critical' },    // Obsidian Flames
    
    // Popular classic sets (high priority)
    { setId: 'base1', priority: 'high' },      // Base Set
    { setId: 'swsh12pt5', priority: 'high' },  // Crown Zenith
    { setId: 'xy12', priority: 'high' },       // Evolutions
    
    // Other sets from POPULAR_SETS (medium priority)
    ...POPULAR_SETS
      .filter(id => !['sv8pt5', 'sv8', 'sv7', 'sv6pt5', 'sv6', 'sv5', 'sv4pt5', 'sv4', 'sv3pt5', 'sv3', 'base1', 'swsh12pt5', 'xy12'].includes(id))
      .map(id => ({ setId: id, priority: 'medium' as const }))
  ];

  /**
   * Initialize the background cache warmer
   * This should be called once when the server starts
   */
  async initialize(): Promise<void> {
    if (this.isRunning) {
      logger.warn('[Cache Warmer] Already initialized');
      return;
    }

    this.isRunning = true;
    logger.info('[Cache Warmer] Initializing background cache warming service');

    // Run startup warming immediately (but don't block)
    this.runStartupWarming().catch(error => {
      logger.error('[Cache Warmer] Startup warming failed:', error);
    });

    // Set up periodic warming every 48 hours (to reduce Redis usage)
    this.warmingInterval = setInterval(() => {
      this.runPeriodicWarming().catch(error => {
        logger.error('[Cache Warmer] Periodic warming failed:', error);
      });
    }, 48 * 60 * 60 * 1000); // 48 hours

    logger.info('[Cache Warmer] Background warming service initialized with 48hr warming interval');
  }

  /**
   * Run startup warming for critical sets
   * This ensures popular sets are cached before users visit
   */
  private async runStartupWarming(): Promise<void> {
    if (this.startupWarmed) {
      logger.info('[Cache Warmer] Startup warming already completed');
      return;
    }

    logger.info('[Cache Warmer] Starting startup cache warming');
    const startTime = Date.now();
    
    // Filter sets by priority for startup
    const criticalSets = this.PRIORITY_SETS.filter(t => t.priority === 'critical');
    const highPrioritySets = this.PRIORITY_SETS.filter(t => t.priority === 'high');
    
    // Warm critical sets first
    logger.info(`[Cache Warmer] Warming ${criticalSets.length} critical sets`);
    await this.warmSets(criticalSets);
    
    // Then warm high priority sets
    logger.info(`[Cache Warmer] Warming ${highPrioritySets.length} high priority sets`);
    await this.warmSets(highPrioritySets);
    
    this.startupWarmed = true;
    const duration = Date.now() - startTime;
    logger.info(`[Cache Warmer] Startup warming completed in ${duration}ms`);
  }

  /**
   * Run periodic warming for all sets
   */
  private async runPeriodicWarming(): Promise<void> {
    logger.info('[Cache Warmer] Starting periodic cache warming');
    const startTime = Date.now();
    
    // Warm all sets during periodic runs
    await this.warmSets(this.PRIORITY_SETS);
    
    const duration = Date.now() - startTime;
    logger.info(`[Cache Warmer] Periodic warming completed in ${duration}ms`);
  }


  /**
   * Warm a batch of sets
   */
  private async warmSets(tasks: WarmingTask[]): Promise<void> {
    const batchSize = 3; // Process 3 sets at a time to avoid overwhelming the API
    
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(task => this.warmSingleSet(task))
      );
      
      // Small delay between batches
      if (i + batchSize < tasks.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  /**
   * Warm a single set
   */
  private async warmSingleSet(task: WarmingTask): Promise<void> {
    const { setId } = task;
    
    try {
      // Check if already cached
      const cached = await tcgCache.getCompleteSet(setId);
      if (cached) {
        logger.debug(`[Cache Warmer] Set ${setId} already cached, skipping`);
        task.lastWarmed = new Date();
        return;
      }
      
      logger.info(`[Cache Warmer] Warming set ${setId}`);
      const startTime = Date.now();
      
      // Fetch set data
      const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (apiKey) {
        headers['X-Api-Key'] = apiKey;
      }
      
      // Fetch set info
      const setInfo = await fetchJSON<TCGApiResponse<CardSet>>(
        `https://api.pokemontcg.io/v2/sets/${setId}`,
        {
          headers,
          timeout: 60000,
          retries: 3,
          retryDelay: 5000
        }
      );
      
      if (!setInfo?.data) {
        logger.warn(`[Cache Warmer] Set ${setId} not found`);
        return;
      }
      
      const set = setInfo.data;
      const totalCards = set.total || 0;
      
      // Fetch all cards
      const pageSize = 250;
      const totalPages = Math.ceil(totalCards / pageSize);
      const pagePromises: Promise<TCGApiResponse<TCGCard[]>>[] = [];
      
      for (let page = 1; page <= totalPages; page++) {
        const pagePromise = fetchJSON<TCGApiResponse<TCGCard[]>>(
          `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&page=${page}&pageSize=${pageSize}`,
          {
            headers,
            timeout: 60000,
            retries: 3
          }
        ).then(result => result || { data: [] as TCGCard[] });
        pagePromises.push(pagePromise);
      }
      
      const pageResults = await Promise.all(pagePromises);
      
      // Combine all cards
      const allCards: TCGCard[] = [];
      for (const result of pageResults) {
        if (result?.data) {
          allCards.push(...result.data);
        }
      }
      
      // Sort cards
      allCards.sort((a, b) => {
        const numA = parseInt(a.number) || 0;
        const numB = parseInt(b.number) || 0;
        return numA - numB;
      });
      
      // Cache everything
      await tcgCache.cacheCompleteSet(setId, set, allCards);
      
      // Also cache individual cards, images, and prices
      await Promise.all([
        tcgCache.cacheCards(allCards),
        tcgCache.bulkCacheImageUrls(allCards),
        tcgCache.bulkCachePriceData(allCards)
      ]);
      
      task.lastWarmed = new Date();
      const duration = Date.now() - startTime;
      
      logger.info(`[Cache Warmer] Successfully warmed set ${setId}`, {
        cardCount: allCards.length,
        duration
      });
      
    } catch (error: unknown) {
      logger.error(`[Cache Warmer] Failed to warm set ${setId}:`, {
        error: error instanceof Error ? error.message : String(error),
        setId
      });
    }
  }

  /**
   * Stop the background warming service
   */
  stop(): void {
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
      this.warmingInterval = null;
    }
    this.isRunning = false;
    logger.info('[Cache Warmer] Background warming service stopped');
  }

  /**
   * Get warming status
   */
  getStatus(): {
    isRunning: boolean;
    startupWarmed: boolean;
    warmedSets: string[];
  } {
    return {
      isRunning: this.isRunning,
      startupWarmed: this.startupWarmed,
      warmedSets: this.PRIORITY_SETS
        .filter(t => t.lastWarmed)
        .map(t => t.setId)
    };
  }
}

// Export singleton instance
export const cacheWarmer = new BackgroundCacheWarmer();

// Initialize on import if in production
if (process.env.NODE_ENV === 'production') {
  cacheWarmer.initialize().catch(error => {
    logger.error('[Cache Warmer] Failed to initialize:', error);
  });
}