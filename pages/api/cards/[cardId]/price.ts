import type { NextApiRequest, NextApiResponse } from 'next';
import { tcgCache } from '../../../../lib/tcg-cache';
import { fetchJSON } from '../../../../utils/unifiedFetch';
import logger from '../../../../utils/logger';
import type { TCGApiResponse, UnknownError } from '../../../../types/api/enhanced-responses';
import type { AnyObject } from '../../../../types/common';

interface TCGCard {
  id: string;
  name: string;
  set?: { name: string };
  rarity?: string;
  tcgplayer?: {
    prices?: AnyObject;
  };
}

interface PriceData {
  market?: number;
  low?: number;
  high?: number;
  [key: string]: unknown;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cardId } = req.query;
  const id = Array.isArray(cardId) ? cardId[0] : cardId;
  
  if (!id) {
    return res.status(400).json({ error: 'Card ID is required' });
  }
  
  const startTime = Date.now();
  
  try {
    // Check cached price data first
    const cachedPrice = await tcgCache.getPriceData(id);
    if (cachedPrice) {
      logger.info('Returning cached price data', {
        cardId: id,
        responseTime: Date.now() - startTime
      });
      
      res.setHeader('X-Cache-Status', 'hit');
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      res.setHeader('Cache-Control', 'public, s-maxage=14400, stale-while-revalidate=86400'); // 4hr cache
      
      return res.status(200).json({
        cardId: id,
        prices: cachedPrice,
        cached: true,
        responseTime: Date.now() - startTime
      });
    }

    logger.info('Fetching fresh price data from API', { cardId: id });
    
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }
    
    // Fetch card data from Pokemon TCG API
    const cardData = await fetchJSON<TCGApiResponse<TCGCard>>(
      `https://api.pokemontcg.io/v2/cards/${id}`, 
      { 
        headers,
        useCache: true,
        cacheTime: 60 * 60 * 1000, // 1 hour cache in unifiedFetch
        timeout: 30000
      }
    );
    
    if (!cardData?.data) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const card = cardData.data;
    const priceData = card.tcgplayer?.prices || null;
    
    if (!priceData) {
      return res.status(404).json({ 
        error: 'No price data available',
        cardId: id,
        cardName: card.name
      });
    }
    
    // Cache the price data
    await tcgCache.cachePriceData(id, priceData);
    
    // Calculate price summary
    const priceSummary = {
      highest: 0,
      lowest: Infinity,
      variants: Object.keys(priceData).length,
      lastUpdated: new Date().toISOString()
    };
    
    for (const [variant, prices] of Object.entries(priceData)) {
      if (prices && typeof prices === 'object') {
        const priceData = prices as PriceData;
        const market = priceData.market;
        const low = priceData.low;
        const high = priceData.high;
        
        if (typeof market === 'number') {
          priceSummary.highest = Math.max(priceSummary.highest, market);
          priceSummary.lowest = Math.min(priceSummary.lowest, market);
        }
        if (typeof high === 'number') {
          priceSummary.highest = Math.max(priceSummary.highest, high);
        }
        if (typeof low === 'number') {
          priceSummary.lowest = Math.min(priceSummary.lowest, low);
        }
      }
    }
    
    if (priceSummary.lowest === Infinity) {
      priceSummary.lowest = 0;
    }
    
    const responseTime = Date.now() - startTime;
    
    logger.info('Fetched and cached fresh price data', {
      cardId: id,
      variants: priceSummary.variants,
      highest: priceSummary.highest,
      responseTime
    });
    
    res.setHeader('X-Cache-Status', 'miss');
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('Cache-Control', 'public, s-maxage=14400, stale-while-revalidate=86400');
    
    res.status(200).json({
      cardId: id,
      cardName: card.name,
      set: card.set?.name,
      rarity: card.rarity,
      prices: priceData,
      summary: priceSummary,
      cached: false,
      responseTime
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Failed to fetch card price', { 
      cardId: id,
      error: errorMessage,
      stack: errorStack
    });
    
    // Try to return stale cache if available as fallback
    const stalePrice = await tcgCache.getPriceData(id);
    if (stalePrice) {
      logger.warn('Returning stale cached price due to API error', {
        cardId: id,
        error: errorMessage
      });
      
      res.setHeader('X-Cache-Status', 'stale-fallback');
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      res.setHeader('X-Error', errorMessage);
      res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=172800');
      
      return res.status(200).json({
        cardId: id,
        prices: stalePrice,
        warning: 'Price data may be outdated due to API issues',
        cached: true,
        stale: true
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch card price',
      message: errorMessage,
      cardId: id
    });
  }
}