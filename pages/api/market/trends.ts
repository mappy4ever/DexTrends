import type { NextApiRequest, NextApiResponse } from 'next';
import { tcgCache } from '../../../lib/tcg-cache';
import logger from '../../../utils/logger';

interface MarketTrendsRequest extends NextApiRequest {
  query: {
    sets?: string;
    refresh?: string;
    limit?: string;
  };
}

export default async function handler(req: MarketTrendsRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sets, refresh = 'false', limit = '30' } = req.query;
  const shouldRefresh = refresh === 'true';
  const limitNum = parseInt(limit as string) || 30;
  
  const startTime = Date.now();

  try {
    // Check cached market trends first (unless force refresh)
    if (!shouldRefresh) {
      const cachedTrends = await tcgCache.getMarketTrends();
      if (cachedTrends) {
        logger.info('Returning cached market trends', {
          responseTime: Date.now() - startTime
        });
        
        res.setHeader('X-Cache-Status', 'hit');
        res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
        res.setHeader('Cache-Control', 'public, s-maxage=14400, stale-while-revalidate=86400'); // 4hr cache
        
        return res.status(200).json({
          ...cachedTrends,
          meta: {
            cached: true,
            responseTime: Date.now() - startTime
          }
        });
      }
    }

    logger.info('Generating fresh market trends');
    
    // Determine which sets to analyze
    const setsToAnalyze = sets 
      ? (sets as string).split(',').map(s => s.trim())
      : ['sv8', 'sv7', 'sv6', 'sv5', 'sv4', 'sv3']; // Default to recent sets

    // Generate market analytics from cached data
    const analytics = await tcgCache.generateMarketAnalytics(setsToAnalyze);
    
    // Enhance with additional market insights
    const enhancedAnalytics = {
      ...analytics,
      // Limit results based on query parameter
      trending: analytics.trending.slice(0, limitNum),
      mostExpensive: analytics.mostExpensive.slice(0, Math.min(limitNum, 20)),
      
      // Add market summary
      marketSummary: {
        totalCardsAnalyzed: analytics.trending.length + analytics.mostExpensive.length,
        avgTrendingPrice: analytics.trending.length > 0 
          ? analytics.trending.reduce((sum, card) => sum + card.marketPrice, 0) / analytics.trending.length
          : 0,
        highestPrice: analytics.mostExpensive.length > 0 
          ? analytics.mostExpensive[0].marketPrice 
          : 0,
        setsAnalyzed: setsToAnalyze,
        generatedAt: new Date().toISOString()
      }
    };
    
    // Cache the enhanced analytics
    await tcgCache.cacheMarketTrends(enhancedAnalytics);
    
    const responseTime = Date.now() - startTime;
    
    logger.info('Generated and cached fresh market trends', {
      trending: enhancedAnalytics.trending.length,
      expensive: enhancedAnalytics.mostExpensive.length,
      sets: setsToAnalyze.length,
      responseTime
    });
    
    res.setHeader('X-Cache-Status', 'miss');
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('Cache-Control', 'public, s-maxage=14400, stale-while-revalidate=86400');
    
    res.status(200).json({
      ...enhancedAnalytics,
      meta: {
        cached: false,
        responseTime,
        setsAnalyzed: setsToAnalyze.length
      }
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Failed to generate market trends', { 
      error: errorMessage,
      stack: errorStack
    });
    
    // Try to return stale cache if available as fallback
    const staleCache = await tcgCache.getMarketTrends();
    if (staleCache) {
      logger.warn('Returning stale cached trends due to error', {
        error: errorMessage
      });
      
      res.setHeader('X-Cache-Status', 'stale-fallback');
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      res.setHeader('X-Error', errorMessage);
      res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=172800');
      
      return res.status(200).json({
        ...staleCache,
        warning: 'Data may be outdated due to processing issues',
        meta: {
          cached: true,
          stale: true,
          error: errorMessage
        }
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate market trends',
      message: errorMessage 
    });
  }
}