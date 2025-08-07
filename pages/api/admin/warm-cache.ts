import type { NextApiRequest, NextApiResponse } from 'next';
import { POPULAR_SETS, tcgCache } from '../../../lib/tcg-cache';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';

// Function to fetch ALL TCG sets from Pokemon TCG API
async function fetchAllTCGSets(): Promise<string[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    logger.info('[Cache Warm] Fetching ALL TCG sets from API');
    
    // First, get total count
    const countResponse = await fetchJSON<{ totalCount: number }>(
      `https://api.pokemontcg.io/v2/sets?pageSize=1`,
      {
        headers,
        timeout: 30000,
        retries: 2
      }
    );

    const totalSets = countResponse?.totalCount || 200; // fallback estimate
    logger.info(`[Cache Warm] Found ${totalSets} total sets`);

    // Fetch all sets in batches
    const allSets: any[] = [];
    const pageSize = 250; // Max page size
    const totalPages = Math.ceil(totalSets / pageSize);

    for (let page = 1; page <= totalPages; page++) {
      const response = await fetchJSON<{ data: any[] }>(
        `https://api.pokemontcg.io/v2/sets?orderBy=-releaseDate&page=${page}&pageSize=${pageSize}`,
        {
          headers,
          timeout: 30000,
          retries: 2
        }
      );

      if (response?.data) {
        allSets.push(...response.data);
      }

      // Small delay between requests
      if (page < totalPages) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const setIds = allSets.map((set: any) => set.id);
    logger.info(`[Cache Warm] Fetched ${setIds.length} total sets`);
    
    return setIds;
  } catch (error) {
    logger.error('[Cache Warm] Error fetching all sets:', error);
    return FALLBACK_RECENT_SETS; // fallback to recent sets
  }
}

// Function to dynamically fetch the most recent sets from Pokemon TCG API
async function fetchMostRecentSets(limit: number = 25): Promise<string[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    // Fetch sets ordered by release date (newest first)
    const response = await fetchJSON<{ data: any[] }>(
      `https://api.pokemontcg.io/v2/sets?orderBy=-releaseDate&pageSize=${limit}`,
      {
        headers,
        timeout: 30000,
        retries: 2
      }
    );

    if (!response?.data) {
      logger.warn('[Cache Warm] Failed to fetch recent sets, using fallback list');
      return FALLBACK_RECENT_SETS.slice(0, limit);
    }

    const setIds = response.data.map((set: any) => set.id);
    logger.info(`[Cache Warm] Fetched ${setIds.length} most recent sets`, { sets: setIds.slice(0, 10) });
    
    return setIds;
  } catch (error) {
    logger.error('[Cache Warm] Error fetching recent sets:', error);
    return FALLBACK_RECENT_SETS.slice(0, limit);
  }
}

// Fallback list in case API is unavailable (manually maintained but not frequently updated)
const FALLBACK_RECENT_SETS = [
  'sv8pt5',        // Prismatic Evolutions (Jan 2025)
  'sv8',           // Surging Sparks (Nov 2024)
  'sv7',           // Stellar Crown (Aug 2024)
  'sv6pt5',        // Shrouded Fable (Aug 2024)
  'sv6',           // Twilight Masquerade (May 2024)
  'sv5',           // Temporal Forces (Mar 2024)
  'sv4pt5',        // Paldean Fates (Jan 2024)
  'sv4',           // Paradox Rift (Nov 2023)
  'sv3pt5',        // 151 (Sep 2023)
  'sv3',           // Obsidian Flames (Aug 2023)
  'sv2',           // Paldea Evolved (Jun 2023)
  'sv1',           // Scarlet & Violet Base (Mar 2023)
  ...POPULAR_SETS, // Add popular classic sets as backup
];

interface WarmCacheRequest extends NextApiRequest {
  query: {
    token?: string;
    sets?: string;
    limit?: string;
    all?: string;        // Cache ALL sets
    cards?: string;      // Cache individual cards too
    search?: string;     // Pre-cache popular searches
  };
}

// Cache warming endpoint - should be called periodically or on deploy
export default async function handler(req: WarmCacheRequest, res: NextApiResponse) {
  // Enhanced auth check - accept token via query param or header
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;
  const expectedToken = process.env.CACHE_WARM_TOKEN;
  
  const providedToken = authHeader?.replace('Bearer ', '') || queryToken;
  
  if (expectedToken && providedToken !== expectedToken) {
    logger.warn('[Cache Warm] Unauthorized access attempt', { 
      providedToken: providedToken ? 'provided' : 'missing',
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const startTime = Date.now();
  const limit = parseInt(req.query.limit as string) || 25; // Default to 25 most recent
  const useRecent = req.query.recent !== 'false'; // Default to true
  const cacheAll = req.query.all === 'true'; // Cache ALL sets
  const cacheCards = req.query.cards !== 'false'; // Cache individual cards and images by default (was 'true')
  
  let setsToWarm: string[];
  
  // Allow custom sets via query parameter
  if (req.query.sets) {
    const customSets = (req.query.sets as string).split(',').map(s => s.trim());
    setsToWarm = customSets;
    logger.info(`[Cache Warming] Using custom sets list`, { sets: setsToWarm });
  } else if (cacheAll) {
    // Cache ALL TCG sets (aggressive caching)
    logger.info(`[Cache Warming] Fetching ALL TCG sets from API (aggressive mode)`);
    setsToWarm = await fetchAllTCGSets();
  } else if (useRecent) {
    // Dynamically fetch the most recent sets
    logger.info(`[Cache Warming] Fetching ${limit} most recent sets from API`);
    setsToWarm = await fetchMostRecentSets(limit);
  } else {
    // Use popular sets as fallback
    setsToWarm = POPULAR_SETS.slice(0, limit);
    logger.info(`[Cache Warming] Using popular sets fallback`);
  }
  
  logger.info(`[Cache Warming] Starting cache warm process for ${setsToWarm.length} sets`, {
    sets: setsToWarm.slice(0, 10), // Log first 10 for brevity
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
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    // Process sets in smaller batches to avoid overwhelming the API
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

          // Fetch set info first
          const setInfo = await fetchJSON<{ data: any }>(
            `https://api.pokemontcg.io/v2/sets/${setId}`, 
            { 
              headers,
              timeout: 30000,
              retries: 2
            }
          );
          
          if (!setInfo?.data) {
            throw new Error('Set not found');
          }
          
          const set = setInfo.data;
          const totalCards = set.total || 0;
          
          logger.info(`[Cache Warm] Loading ${totalCards} cards for set ${setId}`);
          
          // Load all cards in parallel batches (faster than sequential)
          const pageSize = 250;
          const totalPages = Math.ceil(totalCards / pageSize);
          const pagePromises: Promise<any>[] = [];
          
          // Create promises for all pages
          for (let page = 1; page <= totalPages; page++) {
            const pagePromise = fetchJSON<{ data: any[] }>(
              `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&page=${page}&pageSize=${pageSize}`,
              {
                headers,
                timeout: 30000,
                retries: 2
              }
            );
            pagePromises.push(pagePromise);
          }
          
          // Wait for all pages to load
          const pageResults = await Promise.all(pagePromises);
          
          // Combine all cards
          const allCards: any[] = [];
          for (const result of pageResults) {
            if (result?.data) {
              allCards.push(...result.data);
            }
          }
          
          // Sort cards by number
          allCards.sort((a, b) => {
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
            
            // Also cache image URLs and price data for fast lookups
            const [imageUrlsCached, priceDataCached] = await Promise.all([
              tcgCache.bulkCacheImageUrls(allCards),
              tcgCache.bulkCachePriceData(allCards)
            ]);
            logger.info(`[Cache Warm] Also cached ${individualCardsCached} individual cards, ${imageUrlsCached} image URLs, and ${priceDataCached} price entries for set ${setId}`);
          }
          
          const duration = Date.now() - setStartTime;
          logger.info(`[Cache Warm] Successfully warmed cache for set ${setId}`, {
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
          
        } catch (error: any) {
          const duration = Date.now() - setStartTime;
          logger.error(`[Cache Warm] Failed to warm cache for set ${setId}:`, error);
          
          results.failed++;
          results.errors.push({
            setId,
            error: error.message
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
      
      // Small delay between batches to be nice to the API
      if (i + BATCH_SIZE < setsToWarm.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
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
      message: 'Cache warming completed',
      duration,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    logger.error('[Cache Warming] Failed:', error);
    
    res.status(500).json({
      error: 'Cache warming failed',
      message: error.message
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
    logger.error('Cache warming failed:', error);
    throw error;
  }
}