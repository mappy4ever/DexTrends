import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../utils/unifiedFetch';
import logger from '../../utils/logger';
import type { TCGDexCardBrief } from '../../types/api/tcgdex';
import { TCGDexEndpoints } from '../../utils/tcgdex-adapter';
import { withRateLimit, RateLimitPresets } from '../../lib/api-middleware';
import { TcgCardManager } from '../../lib/supabase';
// Pricing is available via individual card detail endpoints (TCGDex includes pricing)

/**
 * Enhanced TCG Card Search API
 *
 * Query Parameters:
 * - name: Card name (required, supports wildcards: *chu, pika*)
 * - type: Energy type filter (Fire, Water, Grass, etc.)
 * - rarity: Rarity filter (Common, Uncommon, Rare, etc.)
 * - hpMin: Minimum HP (number)
 * - hpMax: Maximum HP (number)
 * - illustrator: Artist name filter
 * - category: Pokemon | Trainer | Energy
 * - stage: Basic | Stage1 | Stage2 | V | VMAX | ex | etc.
 * - legal: standard | expanded (tournament legality)
 * - sort: Field to sort by (name, hp, rarity)
 * - order: ASC | DESC
 * - page: Page number (default 1)
 * - pageSize: Items per page (default 50, max 100)
 *
 * Note: Pricing is available via /api/tcg-cards/[cardId] endpoint (TCGDex includes pricing)
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  // Extract all query params
  const {
    name,
    type,
    rarity,
    hpMin,
    hpMax,
    illustrator,
    category,
    stage,
    legal,
    sort,
    order = 'ASC',
    page = '1',
    pageSize = '50'
  } = req.query;

  const pokemonName = Array.isArray(name) ? name[0] : name;

  if (!pokemonName) {
    return res.status(400).json({ error: 'Pokemon name is required' });
  }

  try {
    // Try Supabase first (local database)
    const typeFilter = Array.isArray(type) ? type[0] : type;
    const rarityFilter = Array.isArray(rarity) ? rarity[0] : rarity;
    const categoryFilter = Array.isArray(category) ? category[0] : category;
    const stageFilter = Array.isArray(stage) ? stage[0] : stage;
    const artistFilter = Array.isArray(illustrator) ? illustrator[0] : illustrator;
    const pageNum = parseInt(Array.isArray(page) ? page[0] : page, 10) || 1;
    const pageSizeNum = Math.min(parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize, 10) || 50, 100);

    logger.debug('Searching TCG cards', { pokemonName, source: 'supabase-first' });

    const supabaseCards = await TcgCardManager.searchCards({
      name: pokemonName,
      types: typeFilter ? [typeFilter] : undefined,
      rarity: rarityFilter,
      category: categoryFilter,
      stage: stageFilter,
      illustrator: artistFilter,
      limit: pageSizeNum,
      offset: (pageNum - 1) * pageSizeNum
    });

    // If Supabase has results, use them
    if (supabaseCards && supabaseCards.length > 0) {
      logger.debug('Using Supabase data for TCG cards', { pokemonName, count: supabaseCards.length });

      // Transform Supabase cards to match expected format
      const cards = supabaseCards.map(card => ({
        id: card.id,
        name: card.name,
        supertype: card.category === 'Pokemon' ? 'Pokémon' : card.category,
        number: card.local_id,
        hp: card.hp ? String(card.hp) : undefined,
        types: card.types,
        rarity: card.rarity,
        artist: card.illustrator,
        images: {
          small: card.image_small || '/back-card.png',
          large: card.image_large || '/back-card.png',
        },
        set: {
          id: card.set_id,
          name: '',
          series: '',
          printedTotal: 0,
          total: 0,
          releaseDate: '',
          updatedAt: '',
          images: { symbol: '', logo: '' }
        }
      }));

      const responseTime = Date.now() - startTime;
      res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=2592000');
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.setHeader('X-Data-Source', 'supabase');

      return res.status(200).json({
        data: cards,
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum,
          count: cards.length
        },
        filters: {
          name: pokemonName,
          type: typeFilter || null,
          rarity: rarityFilter || null,
          hpMin: null,
          hpMax: null,
          illustrator: artistFilter || null,
          category: categoryFilter || null,
          stage: stageFilter || null,
          legal: null
        },
        meta: {
          responseTime,
          cardCount: cards.length,
          source: 'supabase'
        }
      });
    }

    logger.debug('Supabase returned no results, falling back to TCGDex', { pokemonName });

    // Fallback to TCGDex API if Supabase has no data
    // Build TCGDex query with all filters
    const queryParams = new URLSearchParams();

    // Name filter - TCGDex uses 'like:' prefix for partial matching
    // This will match "Pikachu", "Pikachu V", "Pikachu VMAX", etc.
    queryParams.append('name', `like:${pokemonName}`);

    // Type filter (Fire, Water, Grass, etc.)
    if (typeFilter) {
      queryParams.append('types', typeFilter);
    }

    // Rarity filter
    if (rarityFilter) {
      queryParams.append('rarity', `eq:${rarityFilter}`);
    }

    // HP range filters
    const minHp = Array.isArray(hpMin) ? hpMin[0] : hpMin;
    const maxHp = Array.isArray(hpMax) ? hpMax[0] : hpMax;
    if (minHp) {
      queryParams.append('hp', `gte:${minHp}`);
    }
    if (maxHp) {
      // TCGDex requires separate params for range, use client-side filtering for max
    }

    // Illustrator filter
    if (artistFilter) {
      queryParams.append('illustrator', artistFilter);
    }

    // Category filter (Pokemon, Trainer, Energy)
    if (categoryFilter) {
      queryParams.append('category', `eq:${categoryFilter}`);
    }

    // Stage filter (Basic, Stage1, Stage2, V, VMAX, ex, etc.)
    if (stageFilter) {
      queryParams.append('stage', `eq:${stageFilter}`);
    }

    // Legal status filter
    const legalFilter = Array.isArray(legal) ? legal[0] : legal;
    if (legalFilter === 'standard') {
      queryParams.append('legal.standard', 'true');
    } else if (legalFilter === 'expanded') {
      queryParams.append('legal.expanded', 'true');
    }

    // Sorting
    const sortField = Array.isArray(sort) ? sort[0] : sort;
    const sortOrder = Array.isArray(order) ? order[0] : order;
    if (sortField) {
      queryParams.append('sort:field', sortField);
      queryParams.append('sort:order', sortOrder.toUpperCase());
    }

    // Pagination (using variables already defined above)
    queryParams.append('pagination:page', String(pageNum));
    queryParams.append('pagination:itemsPerPage', String(pageSizeNum));

    const apiUrl = `${TCGDexEndpoints.cards('en')}?${queryParams.toString()}`;

    logger.debug('Fetching TCG cards from TCGDex', { url: apiUrl, pokemonName });

    // TCGDex /cards endpoint returns BRIEF cards (id, name, image only)
    const briefCards = await fetchJSON<TCGDexCardBrief[]>(apiUrl, {
      useCache: true,
      cacheTime: 30 * 60 * 1000,
      timeout: 15000,
      retries: 2,
      retryDelay: 500,
      throwOnError: false
    });

    // Handle null/undefined response gracefully
    if (!briefCards || !Array.isArray(briefCards)) {
      logger.warn('TCGDex API returned null/undefined', { pokemonName, apiUrl });
      res.status(200).json({
        data: [],
        meta: {
          responseTime: Date.now() - startTime,
          cardCount: 0,
          pokemonName,
          source: 'tcgdex',
          warning: 'API returned no data'
        }
      });
      return;
    }

    logger.debug('TCGDex returned brief cards', { pokemonName, count: briefCards.length });

    // Helper to construct image URL from card ID when image is missing
    // TCGDex image format: https://assets.tcgdex.net/en/{series}/{setId}/{localId}
    const constructImageUrl = (cardId: string, localId: string): string => {
      const setId = cardId.split('-')[0] || '';
      // Derive series from setId prefix
      const seriesMap: Record<string, string> = {
        'sv': 'sv', 'swsh': 'swsh', 'sm': 'sm', 'xy': 'xy', 'bw': 'bw',
        'hgss': 'hgss', 'dp': 'dp', 'ex': 'ex', 'neo': 'neo', 'gym': 'gym',
        'base': 'base', 'det': 'sm', 'cel': 'swsh', 'pop': 'pop', 'pl': 'pl',
        'mcd': 'mcd', 'tk': 'swsh', 'fut': 'swsh'
      };
      // Find matching prefix
      let series = 'sm'; // default fallback
      for (const [prefix, seriesName] of Object.entries(seriesMap)) {
        if (setId.toLowerCase().startsWith(prefix)) {
          series = seriesName;
          break;
        }
      }
      return `https://assets.tcgdex.net/en/${series}/${setId}/${localId}`;
    };

    // Filter out Pocket cards - they have their own API at /api/pocket-cards
    // Pocket card IDs start with: A1, A2, A3, A4, P-A, B1, etc.
    const POCKET_CARD_PATTERNS = /^(A[0-9]|P-A|B[0-9])/i;
    const tcgOnlyCards = briefCards.filter(card => !POCKET_CARD_PATTERNS.test(card.id));

    logger.debug('Filtered out Pocket cards', {
      before: briefCards.length,
      after: tcgOnlyCards.length,
      removed: briefCards.length - tcgOnlyCards.length
    });

    // Transform brief cards to app format (quick response for list view)
    // Full details (including pricing) can be fetched via /api/tcg-cards/[cardId]
    const cards = tcgOnlyCards.slice(0, 100).map(briefCard => {
      const localId = briefCard.localId || briefCard.id.split('-')[1] || '';
      // Use provided image or construct from card ID
      const imageBase = briefCard.image || constructImageUrl(briefCard.id, localId);

      return {
        id: briefCard.id,
        name: briefCard.name,
        supertype: 'Pokémon' as const,
        number: localId,
        images: {
          small: `${imageBase}/low.png`,
          large: `${imageBase}/high.png`,
        },
        set: {
          id: briefCard.id.split('-')[0] || '',
          name: '',
          series: '',
          printedTotal: 0,
          total: 0,
          releaseDate: '',
          updatedAt: '',
          images: { symbol: '', logo: '' }
        }
      };
    });

    // Note: HP filter not available with brief cards - would need full card fetch
    // For now, HP filtering is skipped for performance
    // Pricing is available via individual card detail endpoint (/api/tcg-cards/[cardId])

    logger.debug('TCGDex API response transformed', {
      pokemonName,
      cardCount: cards.length,
      filters: { type: typeFilter, rarity: rarityFilter }
    });

    // Add cache-control headers for better edge caching
    res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=2592000'); // 1 week cache, 30 day stale
    res.setHeader('Vary', 'Accept-Encoding'); // Support compression

    // Add performance headers
    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('X-Data-Source', 'tcgdex');

    // Log slow responses
    if (responseTime > 3000) {
      logger.warn('Slow TCG cards API response', {
        responseTime,
        pokemonName,
        cardCount: cards.length
      });
    }

    res.status(200).json({
      data: cards,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        count: cards.length
      },
      filters: {
        name: pokemonName,
        type: typeFilter || null,
        rarity: rarityFilter || null,
        hpMin: minHp ? parseInt(minHp, 10) : null,
        hpMax: maxHp ? parseInt(maxHp, 10) : null,
        illustrator: artistFilter || null,
        category: categoryFilter || null,
        stage: stageFilter || null,
        legal: legalFilter || null
      },
      meta: {
        responseTime,
        cardCount: cards.length,
        source: 'tcgdex'
      }
    });
  } catch (error) {
    logger.error('Failed to fetch TCG cards', { 
      pokemonName, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined 
    });
    res.status(500).json({
      error: 'Failed to fetch TCG cards',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

// Export with rate limiting: 60 requests/minute (search endpoint)
export default withRateLimit(handler, { ...RateLimitPresets.search, keyPrefix: 'tcg-cards' });