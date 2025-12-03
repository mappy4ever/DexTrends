import type { NextApiRequest, NextApiResponse } from 'next';
import { tcgCache } from '../../../../lib/tcg-cache';
import { fetchJSON } from '../../../../utils/unifiedFetch';
import logger from '../../../../utils/logger';
import type { AnyObject } from '../../../../types/common';

interface TCGDexCard {
  id: string;
  name: string;
  set?: { name: string };
  rarity?: string;
  prices?: {
    tcgplayer?: {
      normal?: { market?: number; low?: number; high?: number };
      holofoil?: { market?: number; low?: number; high?: number };
      reverseHolofoil?: { market?: number; low?: number; high?: number };
      firstEditionHolofoil?: { market?: number; low?: number; high?: number };
    };
    cardmarket?: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
    };
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

    logger.info('Fetching fresh price data from TCGDex', { cardId: id });

    // Fetch card data from TCGDex API
    const cardData = await fetchJSON<TCGDexCard>(
      `https://api.tcgdex.net/v2/en/cards/${id}`,
      {
        useCache: true,
        cacheTime: 60 * 60 * 1000, // 1 hour cache
        timeout: 30000
      }
    );

    if (!cardData) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Extract price data from TCGDex format
    const priceData: AnyObject = {};

    if (cardData.prices?.tcgplayer) {
      const tcgp = cardData.prices.tcgplayer;
      if (tcgp.normal) {
        priceData.normal = {
          market: tcgp.normal.market,
          low: tcgp.normal.low,
          high: tcgp.normal.high
        };
      }
      if (tcgp.holofoil) {
        priceData.holofoil = {
          market: tcgp.holofoil.market,
          low: tcgp.holofoil.low,
          high: tcgp.holofoil.high
        };
      }
      if (tcgp.reverseHolofoil) {
        priceData.reverseHolofoil = {
          market: tcgp.reverseHolofoil.market,
          low: tcgp.reverseHolofoil.low,
          high: tcgp.reverseHolofoil.high
        };
      }
      if (tcgp.firstEditionHolofoil) {
        priceData.firstEditionHolofoil = {
          market: tcgp.firstEditionHolofoil.market,
          low: tcgp.firstEditionHolofoil.low,
          high: tcgp.firstEditionHolofoil.high
        };
      }
    }

    // Add CardMarket prices if available
    if (cardData.prices?.cardmarket) {
      const cm = cardData.prices.cardmarket;
      priceData.cardmarket = {
        averageSellPrice: cm.averageSellPrice,
        lowPrice: cm.lowPrice,
        trendPrice: cm.trendPrice
      };
    }

    if (Object.keys(priceData).length === 0) {
      return res.status(404).json({
        error: 'No price data available',
        cardId: id,
        cardName: cardData.name
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
      if (prices && typeof prices === 'object' && variant !== 'cardmarket') {
        const priceInfo = prices as PriceData;
        const market = priceInfo.market;
        const low = priceInfo.low;
        const high = priceInfo.high;

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

    logger.info('Fetched and cached fresh price data from TCGDex', {
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
      cardName: cardData.name,
      set: cardData.set?.name,
      rarity: cardData.rarity,
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
