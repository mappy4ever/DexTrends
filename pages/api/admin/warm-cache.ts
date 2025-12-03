import type { NextApiRequest, NextApiResponse } from 'next';
import { POPULAR_SETS, tcgCache } from '../../../lib/tcg-cache';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import { validateAdminAuth } from '../../../lib/admin-auth';
import type { TCGCard, CardSet } from '../../../types/api/cards';

// Function to fetch ALL TCG sets from TCGDex API
async function fetchAllTCGSets(): Promise<string[]> {
  try {
    logger.info('[Cache Warm] Fetching ALL TCG sets from TCGDex API');

    const response = await fetchJSON<Array<{ id: string; name: string; releaseDate?: string }>>(
      'https://api.tcgdex.net/v2/en/sets',
      {
        timeout: 30000,
        retries: 2
      }
    );

    if (!Array.isArray(response)) {
      logger.warn('[Cache Warm] Invalid response from TCGDex, using fallback');
      return FALLBACK_RECENT_SETS;
    }

    // Sort by release date (newest first)
    const sortedSets = response.sort((a, b) => {
      const dateA = a.releaseDate || '';
      const dateB = b.releaseDate || '';
      return dateB.localeCompare(dateA);
    });

    const setIds = sortedSets.map(set => set.id);
    logger.info(`[Cache Warm] Fetched ${setIds.length} total sets from TCGDex`);

    return setIds;
  } catch (error) {
    logger.error('[Cache Warm] Error fetching all sets:', { error: error instanceof Error ? error.message : String(error) });
    return FALLBACK_RECENT_SETS;
  }
}

// Function to dynamically fetch the most recent sets from TCGDex API
async function fetchMostRecentSets(limit: number = 25): Promise<string[]> {
  try {
    const response = await fetchJSON<Array<{ id: string; name: string; releaseDate?: string }>>(
      'https://api.tcgdex.net/v2/en/sets',
      {
        timeout: 30000,
        retries: 2
      }
    );

    if (!Array.isArray(response)) {
      logger.warn('[Cache Warm] Failed to fetch recent sets from TCGDex, using fallback');
      return FALLBACK_RECENT_SETS.slice(0, limit);
    }

    // Sort by release date (newest first) and take the limit
    const sortedSets = response.sort((a, b) => {
      const dateA = a.releaseDate || '';
      const dateB = b.releaseDate || '';
      return dateB.localeCompare(dateA);
    });

    const setIds = sortedSets.slice(0, limit).map(set => set.id);
    logger.info(`[Cache Warm] Fetched ${setIds.length} most recent sets from TCGDex`, { sets: setIds.slice(0, 10) });

    return setIds;
  } catch (error) {
    logger.error('[Cache Warm] Error fetching recent sets:', { error: error instanceof Error ? error.message : String(error) });
    return FALLBACK_RECENT_SETS.slice(0, limit);
  }
}

// Fallback list in case API is unavailable (TCGDex format)
const FALLBACK_RECENT_SETS = [
  'sv10',          // Destined Rivals (May 2025)
  'sv09',          // Journey Together (Mar 2025)
  'sv08.5',        // Prismatic Evolutions (Jan 2025)
  'sv08',          // Surging Sparks (Nov 2024)
  'sv07',          // Stellar Crown (Aug 2024)
  'sv06.5',        // Shrouded Fable (Aug 2024)
  'sv06',          // Twilight Masquerade (May 2024)
  'sv05',          // Temporal Forces (Mar 2024)
  'sv04.5',        // Paldean Fates (Jan 2024)
  'sv04',          // Paradox Rift (Nov 2023)
  'sv03.5',        // 151 (Sep 2023)
  'sv03',          // Obsidian Flames (Aug 2023)
  'sv02',          // Paldea Evolved (Jun 2023)
  'sv01',          // Scarlet & Violet Base (Mar 2023)
  ...POPULAR_SETS, // Add popular classic sets as backup
];

interface WarmCacheRequest extends NextApiRequest {
  query: {
    sets?: string;
    limit?: string;
    all?: string;        // Cache ALL sets
    cards?: string;      // Cache individual cards too
    search?: string;     // Pre-cache popular searches
  };
}

// Cache warming endpoint - should be called periodically or on deploy
export default async function handler(req: WarmCacheRequest, res: NextApiResponse) {
  // Security: Only accept Bearer token from Authorization header
  if (!validateAdminAuth(req, res, 'Cache Warm')) {
    return; // Response already sent by validateAdminAuth
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  const limit = parseInt(req.query.limit as string) || 25;
  const useRecent = (req.query as { recent?: string }).recent !== 'false';
  const cacheAll = req.query.all === 'true';
  const cacheCards = req.query.cards !== 'false';

  let setsToWarm: string[];

  // Allow custom sets via query parameter
  if (req.query.sets) {
    const customSets = (req.query.sets as string).split(',').map(s => s.trim());
    setsToWarm = customSets;
    logger.info(`[Cache Warming] Using custom sets list`, { sets: setsToWarm });
  } else if (cacheAll) {
    logger.info(`[Cache Warming] Fetching ALL TCG sets from TCGDex (aggressive mode)`);
    setsToWarm = await fetchAllTCGSets();
  } else if (useRecent) {
    logger.info(`[Cache Warming] Fetching ${limit} most recent sets from TCGDex`);
    setsToWarm = await fetchMostRecentSets(limit);
  } else {
    setsToWarm = POPULAR_SETS.slice(0, limit);
    logger.info(`[Cache Warming] Using popular sets fallback`);
  }

  logger.info(`[Cache Warming] Starting cache warm process for ${setsToWarm.length} sets`, {
    sets: setsToWarm.slice(0, 10),
    totalSets: setsToWarm.length,
    useRecent
  });

  const results = {
    total: setsToWarm.length,
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: [] as Array<{ setId: string; error: string }>,
    sets: [] as Array<{ setId: string; cardCount: number; duration: number; status: string }>
  };

  try {
    // Process sets in smaller batches
    const BATCH_SIZE = 3;

    for (let i = 0; i < setsToWarm.length; i += BATCH_SIZE) {
      const batch = setsToWarm.slice(i, i + BATCH_SIZE);

      logger.info(`[Cache Warm] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(setsToWarm.length / BATCH_SIZE)}`, {
        sets: batch
      });

      // Process batch in parallel
      const batchPromises = batch.map(async (setId) => {
        const setStartTime = Date.now();

        try {
          // Check if already cached
          const existing = await tcgCache.getCompleteSet(setId);
          if (existing) {
            const duration = Date.now() - setStartTime;
            logger.info(`[Cache Warm] Set ${setId} already cached`, { duration });

            results.skipped++;
            results.sets.push({
              setId,
              cardCount: existing.cards.length,
              duration,
              status: 'already-cached'
            });
            return;
          }

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
              retries: 3
            }
          );

          if (!setData) {
            throw new Error('Set not found in TCGDex');
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
          allCards.sort((a: TCGCard, b: TCGCard) => {
            const numA = parseInt(a.number) || 0;
            const numB = parseInt(b.number) || 0;
            return numA - numB;
          });

          // Cache the complete set
          await tcgCache.cacheCompleteSet(setId, set, allCards);

          let individualCardsCached = 0;

          // Also cache individual cards if requested
          if (cacheCards && allCards.length > 0) {
            individualCardsCached = await tcgCache.cacheCards(allCards);

            // Also cache image URLs for fast lookups
            const imageUrlsCached = await tcgCache.bulkCacheImageUrls(allCards);
            logger.info(`[Cache Warm] Also cached ${individualCardsCached} individual cards and ${imageUrlsCached} image URLs for set ${setId}`);
          }

          const duration = Date.now() - setStartTime;
          logger.info(`[Cache Warm] Successfully warmed cache for set ${setId} from TCGDex`, {
            cardCount: allCards.length,
            individualCardsCached,
            duration
          });

          results.successful++;
          results.sets.push({
            setId,
            cardCount: allCards.length,
            duration,
            status: cacheCards ? 'cached-with-cards' : 'cached'
          });

        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const duration = Date.now() - setStartTime;
          logger.error(`[Cache Warm] Failed to warm cache for set ${setId}:`, { error: errorMessage });

          results.failed++;
          results.errors.push({
            setId,
            error: errorMessage
          });
          results.sets.push({
            setId,
            cardCount: 0,
            duration,
            status: 'failed'
          });
        }
      });

      // Wait for current batch to complete
      await Promise.all(batchPromises);

      // Small delay between batches
      if (i + BATCH_SIZE < setsToWarm.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`[Cache Warming] Completed cache warming`, {
      total: results.total,
      successful: results.successful,
      failed: results.failed,
      skipped: results.skipped,
      duration
    });

    res.status(200).json({
      success: true,
      message: 'Cache warming completed (using TCGDex)',
      duration,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[Cache Warming] Failed:', { error: errorMessage });

    res.status(500).json({
      error: 'Cache warming failed',
      message: errorMessage
    });
  }
}

// Export for use in deployment scripts
export async function warmCache() {
  const token = process.env.CACHE_WARM_TOKEN;
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/admin/warm-cache`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    logger.info('Cache warming result:', result);
    return result;
  } catch (error) {
    logger.error('Cache warming failed:', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}
