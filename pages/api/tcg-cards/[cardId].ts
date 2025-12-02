import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import { tcgCache } from '../../../lib/tcg-cache';
import performanceMonitor from '../../../utils/performanceMonitor';
import type { TCGCard } from '../../../types/api/cards';
import type { TCGDexCard } from '../../../types/api/tcgdex';
import { transformCard, TCGDexEndpoints } from '../../../utils/tcgdex-adapter';
import { isTCGCard } from '../../../utils/typeGuards';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cardId } = req.query;
  const id = Array.isArray(cardId) ? cardId[0] : cardId;
  
  if (!id) {
    return res.status(400).json({ error: 'Card ID is required' });
  }
  
  const startTime = Date.now();
  
  try {
    // Check cache first
    const cachedCard = await tcgCache.getCard(id);
    if (cachedCard) {
      const responseTime = Date.now() - startTime;
      logger.info('[TCG Card API] Cache hit', { 
        cardId: id, 
        responseTime,
        cached: true 
      });
      
      res.setHeader('X-Cache-Status', 'hit');
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      
      return res.status(200).json({
        card: cachedCard,
        cached: true,
        responseTime
      });
    }
    
    logger.info('[TCG Card API] Cache miss, fetching from TCGDex', { cardId: id });

    // Fetch card from TCGDex API (no API key required)
    const apiUrl = TCGDexEndpoints.card(id, 'en');
    const tcgdexCard = await fetchJSON<TCGDexCard>(apiUrl, {
      useCache: true,
      cacheTime: 60 * 60 * 1000, // 1 hour
      timeout: 10000,
      retries: 2,
      retryDelay: 1000,
      throwOnError: false
    });

    if (!tcgdexCard) {
      // API call returned null - likely timeout or API unavailable
      logger.warn('TCGDex API unavailable for card detail', { cardId: id, apiUrl });
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'The TCGDex API is currently unavailable. Please try again later.',
        cardId: id,
        retryAfter: 60
      });
    }

    if (!tcgdexCard.id) {
      return res.status(404).json({ error: 'Card not found', cardId: id });
    }

    // Transform TCGDex card to app format
    const card = transformCard(tcgdexCard);
    
    // Cache the card for future requests (ensure card exists)
    if (card) {
      await tcgCache.cacheCard(id, card as TCGCard);
    }
    
    // Also cache related data
    if (card.images) {
      await tcgCache.cacheImageUrls(id, {
        small: card.images.small,
        large: card.images.large
      });
    }
    
    if (card.tcgplayer?.prices) {
      await tcgCache.cachePriceData(id, card.tcgplayer.prices);
    }
    
    const responseTime = Date.now() - startTime;
    
    logger.info('[TCG Card API] Fetched and cached card', { 
      cardId: id, 
      responseTime,
      cached: false,
      setId: card.set?.id 
    });
    
    res.setHeader('X-Cache-Status', 'miss');
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    res.status(200).json({
      card,
      cached: false,
      responseTime
    });
    
  } catch (error) {
    logger.error('[TCG Card API] Error fetching card', {
      cardId: id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    res.status(500).json({ 
      error: 'Failed to fetch card',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

// API endpoint for fetching related cards (cards with the same Pokemon name)
export async function getRelatedCards(pokemonName: string, excludeId?: string): Promise<TCGCard[]> {
  try {
    // Start performance monitoring
    const timerStart = performanceMonitor.startTimer('api-request-related');

    // Extract base Pokemon name (without forms/variants)
    const baseName = pokemonName.split(" ")[0];

    // Fetch related cards from TCGDex (no API key required)
    const apiUrl = `${TCGDexEndpoints.cards('en')}?name=${encodeURIComponent(baseName)}`;
    const relatedData = await fetchJSON<TCGDexCard[]>(apiUrl, {
      useCache: true,
      cacheTime: 30 * 60 * 1000, // 30 minutes
      timeout: 10000,
      retries: 1,
      throwOnError: false
    });

    performanceMonitor.endTimer('api-request-related', timerStart);

    if (!relatedData || !Array.isArray(relatedData)) {
      return [];
    }

    // Transform and filter cards
    const transformedCards = relatedData.map(transformCard);

    // Filter out the current card and limit results
    return transformedCards
      .filter(isTCGCard)
      .filter(card => card.id !== excludeId)
      .slice(0, 8);

  } catch (error) {
    logger.error('[TCG Card API] Error fetching related cards', {
      pokemonName,
      error
    });
    return [];
  }
}