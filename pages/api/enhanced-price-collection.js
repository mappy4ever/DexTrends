/**
 * Enhanced Price Collection API Endpoint
 * Provides improved price collection with market analysis
 */

import EnhancedPriceCollector from '../../utils/enhancedPriceCollector';
import logger from '../../utils/logger';

const priceCollector = new EnhancedPriceCollector();

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple API key protection
  const { authorization } = req.headers;
  const apiKey = process.env.PRICE_COLLECTION_API_KEY;
  
  if (apiKey && authorization !== `Bearer ${apiKey}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { 
    action = 'collect',
    limit = 200,
    generateTrends = false,
    trendDaysBack = 30
  } = req.body;

  try {
    switch (action) {
      case 'collect':
        logger.info('Starting enhanced price collection via API');
        const collectionResult = await priceCollector.collectPricesForTrendingCards(limit);
        
        if (collectionResult.success) {
          const response = {
            success: true,
            jobId: collectionResult.jobId,
            summary: {
              cardsProcessed: collectionResult.stats.totalProcessed,
              cardsUpdated: collectionResult.stats.successCount,
              cardsFailed: collectionResult.stats.errorCount,
              duration: collectionResult.stats.endTime - collectionResult.stats.startTime
            }
          };

          // Generate trends if requested
          if (generateTrends) {
            logger.info('Generating market trend analysis');
            const trendAnalysis = await priceCollector.generateMarketTrendAnalysis(trendDaysBack);
            response.trendAnalysis = trendAnalysis;
          }

          return res.status(200).json(response);
        } else {
          return res.status(500).json({
            error: 'Enhanced price collection failed',
            message: collectionResult.error,
            stats: collectionResult.stats
          });
        }

      case 'trends':
        logger.info('Generating market trend analysis via API');
        const trendAnalysis = await priceCollector.generateMarketTrendAnalysis(trendDaysBack);
        
        if (trendAnalysis) {
          return res.status(200).json({
            success: true,
            trendAnalysis
          });
        } else {
          return res.status(500).json({
            error: 'Failed to generate trend analysis'
          });
        }

      case 'schedule':
        const { intervalHours = 6 } = req.body;
        logger.info(`Scheduling automatic collection every ${intervalHours} hours`);
        
        await priceCollector.scheduleAutomaticCollection(intervalHours);
        
        return res.status(200).json({
          success: true,
          message: `Automatic collection scheduled every ${intervalHours} hours`
        });

      case 'status':
        return res.status(200).json({
          success: true,
          isRunning: priceCollector.isRunning,
          currentStats: priceCollector.collectionStats
        });

      default:
        return res.status(400).json({
          error: 'Invalid action',
          validActions: ['collect', 'trends', 'schedule', 'status']
        });
    }
  } catch (error) {
    logger.error('Enhanced price collection API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

export const config = {
  api: {
    responseLimit: false, // Allow large responses for trend data
  },
};