import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import { tcgCache } from '../../../lib/tcg-cache';
import performanceMonitor from '../../../utils/performanceMonitor';

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
    
    logger.info('[TCG Card API] Cache miss, fetching from API', { cardId: id });
    
    // Not in cache, fetch from API
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }
    
    // Fetch card from API
    const cardData = await fetchJSON<{ data: any }>(
      `https://api.pokemontcg.io/v2/cards/${id}`,
      {
        headers,
        useCache: true,
        cacheTime: 60 * 60 * 1000, // 1 hour
        timeout: 10000,
        retries: 2,
        retryDelay: 1000
      }
    );
    
    if (!cardData?.data) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const card = cardData.data;
    
    // Cache the card for future requests
    await tcgCache.cacheCard(id, card);
    
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
    
  } catch (error: any) {
    logger.error('[TCG Card API] Error fetching card', {
      cardId: id,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Failed to fetch card',
      message: error.message
    });
  }
}

// API endpoint for fetching related cards (cards with the same Pokemon name)
export async function getRelatedCards(pokemonName: string, excludeId?: string): Promise<any[]> {
  try {
    // Start performance monitoring
    performanceMonitor.startTimer('api-request', `related-cards-${pokemonName}`);
    
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }
    
    // Extract base Pokemon name (without forms/variants)
    const baseName = pokemonName.split(" ")[0];
    
    // Fetch related cards
    const relatedData = await fetchJSON<{ data: any[] }>(
      `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(baseName)}&pageSize=20`,
      {
        headers,
        useCache: true,
        cacheTime: 30 * 60 * 1000, // 30 minutes
        timeout: 10000,
        retries: 1
      }
    );
    
    performanceMonitor.endTimer('api-request', `related-cards-${pokemonName}`);
    
    if (!relatedData?.data) {
      return [];
    }
    
    // Filter out the current card and limit results
    return relatedData.data
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