import { tcgCache, POPULAR_SETS } from './tcg-cache';
import { REDIS_ENABLED } from './redis';
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
  
  // Priority sets that should always be cached (TCGDex format)
  private readonly PRIORITY_SETS: WarmingTask[] = [
    // Most recent sets (critical priority)
    { setId: 'sv10', priority: 'critical' },   // Destined Rivals
    { setId: 'sv09', priority: 'critical' },   // Journey Together
    { setId: 'sv08.5', priority: 'critical' }, // Prismatic Evolutions
    { setId: 'sv08', priority: 'critical' },   // Surging Sparks
    { setId: 'sv07', priority: 'critical' },   // Stellar Crown
    { setId: 'sv06.5', priority: 'critical' }, // Shrouded Fable
    { setId: 'sv06', priority: 'critical' },   // Twilight Masquerade
    { setId: 'sv05', priority: 'critical' },   // Temporal Forces
    { setId: 'sv04.5', priority: 'critical' }, // Paldean Fates
    { setId: 'sv04', priority: 'critical' },   // Paradox Rift
    { setId: 'sv03.5', priority: 'critical' }, // 151
    { setId: 'sv03', priority: 'critical' },   // Obsidian Flames

    // Popular classic sets (high priority)
    { setId: 'base1', priority: 'high' },      // Base Set
    { setId: 'swsh12.5', priority: 'high' },   // Crown Zenith
    { setId: 'xy12', priority: 'high' },       // Evolutions

    // Other sets from POPULAR_SETS (medium priority)
    ...POPULAR_SETS
      .filter(id => !['sv10', 'sv09', 'sv08.5', 'sv08', 'sv07', 'sv06.5', 'sv06', 'sv05', 'sv04.5', 'sv04', 'sv03.5', 'sv03', 'base1', 'swsh12.5', 'xy12'].includes(id))
      .map(id => ({ setId: id, priority: 'medium' as const }))
  ];

  /**
   * Initialize the background cache warmer
   * This should be called once when the server starts
   */
  async initialize(): Promise<void> {
    // Skip initialization if Redis is disabled
    if (!REDIS_ENABLED) {
      logger.info('[Cache Warmer] Redis is disabled, skipping cache warming initialization');
      return;
    }

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

      logger.info(`[Cache Warmer] Warming set ${setId} from TCGDex`);
      const startTime = Date.now();

      // Fetch set info from TCGDex (includes cards!)
      const setData = await fetchJSON<{
        id: string;
        name: string;
        logo?: string;
        symbol?: string;
        cardCount?: { total?: number; official?: number };
        releaseDate?: string;
        serie?: { id: string; name: string };
        cards?: Array<{
          id: string;
          localId: string;
          name: string;
          image?: string;
          category?: string;
          illustrator?: string;
          rarity?: string;
          types?: string[];
          hp?: number;
        }>;
      }>(
        `https://api.tcgdex.net/v2/en/sets/${setId}`,
        {
          timeout: 60000,
          retries: 3,
          retryDelay: 5000
        }
      );

      if (!setData) {
        logger.warn(`[Cache Warmer] Set ${setId} not found in TCGDex`);
        return;
      }

      // Transform TCGDex set to our format
      const set: CardSet = {
        id: setData.id,
        name: setData.name,
        series: setData.serie?.name || '',
        printedTotal: setData.cardCount?.official || 0,
        total: setData.cardCount?.total || 0,
        releaseDate: setData.releaseDate || '',
        updatedAt: new Date().toISOString(),
        images: {
          symbol: setData.symbol || '',
          logo: setData.logo || ''
        }
      };

      // Transform TCGDex cards to our format
      const allCards: TCGCard[] = (setData.cards || []).map(card => ({
        id: card.id,
        name: card.name,
        supertype: (card.category as 'Pokémon' | 'Trainer' | 'Energy') || 'Pokémon',
        number: card.localId,
        artist: card.illustrator || '',
        rarity: card.rarity || '',
        types: card.types || [],
        hp: card.hp ? String(card.hp) : undefined,
        images: {
          small: card.image ? `${card.image}/low.png` : '',
          large: card.image ? `${card.image}/high.png` : ''
        },
        set: set
      }));

      // Sort cards by number
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

      logger.info(`[Cache Warmer] Successfully warmed set ${setId} from TCGDex`, {
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