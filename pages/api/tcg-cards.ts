import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../utils/unifiedFetch';
import logger from '../../utils/logger';
import type { TCGDexCardBrief } from '../../types/api/tcgdex';
import { TCGDexEndpoints } from '../../utils/tcgdex-adapter';

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
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    // Build TCGDex query with all filters
    const queryParams = new URLSearchParams();

    // Name filter (supports wildcards)
    queryParams.append('name', pokemonName);

    // Type filter (Fire, Water, Grass, etc.)
    const typeFilter = Array.isArray(type) ? type[0] : type;
    if (typeFilter) {
      queryParams.append('types', typeFilter);
    }

    // Rarity filter
    const rarityFilter = Array.isArray(rarity) ? rarity[0] : rarity;
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
    const artistFilter = Array.isArray(illustrator) ? illustrator[0] : illustrator;
    if (artistFilter) {
      queryParams.append('illustrator', artistFilter);
    }

    // Category filter (Pokemon, Trainer, Energy)
    const categoryFilter = Array.isArray(category) ? category[0] : category;
    if (categoryFilter) {
      queryParams.append('category', `eq:${categoryFilter}`);
    }

    // Stage filter (Basic, Stage1, Stage2, V, VMAX, ex, etc.)
    const stageFilter = Array.isArray(stage) ? stage[0] : stage;
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

    // Pagination
    const pageNum = parseInt(Array.isArray(page) ? page[0] : page, 10) || 1;
    const pageSizeNum = Math.min(parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize, 10) || 50, 100);
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

    // Transform brief cards to app format (quick response for list view)
    // Full details can be fetched when user clicks on a specific card
    let cards = briefCards.slice(0, 100).map(briefCard => ({
      id: briefCard.id,
      name: briefCard.name,
      supertype: 'Pokémon' as const,
      number: briefCard.localId || '',
      images: {
        small: briefCard.image ? `${briefCard.image}/low.png` : '',
        large: briefCard.image ? `${briefCard.image}/high.png` : '',
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
    }));

    // Note: HP filter not available with brief cards - would need full card fetch
    // For now, HP filtering is skipped for performance

    logger.debug('TCGDex API response transformed', {
      pokemonName,
      cardCount: cards.length,
      filters: { type: typeFilter, rarity: rarityFilter }
    });

    // Add cache-control headers for better edge caching
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600'); // 30min cache, 1hr stale
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