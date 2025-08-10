/**
 * Analytics API Endpoint
 * Provides comprehensive analytics data and insights
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import analyticsEngine from '../../utils/analyticsEngine';
import logger from '../../utils/logger';
import { ErrorResponse } from '@/types/api/api-responses';
import type { UnknownError, AnyObject } from '../../types/common';

interface AnalyticsResponse {
  success: boolean;
  type?: string;
  period?: {
    daysBack: number;
    startDate: string;
    endDate: string;
  };
  data?: AnyObject;
  generatedAt?: string;
  message?: string;
  eventType?: string;
  timestamp?: string;
  validTypes?: string[];
  validEventTypes?: string[];
  [key: string]: unknown;
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyticsResponse | ErrorResponse | string>
) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGetAnalytics(req, res);
      
      case 'POST':
        return await handleTrackEvent(req, res);
      
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    logger.error('Analytics API error:', { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}

async function handleGetAnalytics(
  req: NextApiRequest,
  res: NextApiResponse<AnalyticsResponse | ErrorResponse | string>
) {
  const {
    type = 'overview',
    cardId,
    daysBack = 30,
    format = 'json'
  } = req.query;

  const daysBackStr = Array.isArray(daysBack) ? daysBack[0] : String(daysBack);
  const parsedDaysBack = parseInt(daysBackStr, 10);
  
  if (isNaN(parsedDaysBack) || parsedDaysBack < 1 || parsedDaysBack > 365) {
    return res.status(400).json({ 
      error: 'Invalid daysBack parameter. Must be between 1 and 365.' 
    });
  }

  try {
    let analyticsData;

    switch (type) {
      case 'overview':
        analyticsData = await analyticsEngine.generateAnalyticsReport(parsedDaysBack);
        break;

      case 'user-behavior':
        analyticsData = await analyticsEngine.getUserBehaviorAnalytics(parsedDaysBack);
        break;

      case 'search':
        analyticsData = await analyticsEngine.getSearchAnalytics(parsedDaysBack);
        break;

      case 'card-performance':
        if (!cardId) {
          return res.status(400).json({ 
            error: 'cardId parameter is required for card performance analytics' 
          });
        }
        const cardIdStr = Array.isArray(cardId) ? cardId[0] : cardId;
        analyticsData = await analyticsEngine.getCardPerformanceAnalytics(cardIdStr || '', parsedDaysBack);
        break;

      default:
        return res.status(400).json({ 
          error: 'Invalid analytics type',
          validTypes: ['overview', 'user-behavior', 'search', 'card-performance']
        });
    }

    if (!analyticsData) {
      return res.status(500).json({ 
        error: 'Failed to generate analytics data' 
      });
    }

    // Handle different response formats
    const formatStr = Array.isArray(format) ? format[0] : format;
    if (formatStr === 'csv' && type === 'search') {
      return handleCSVResponse(res as NextApiResponse<string | ErrorResponse>, analyticsData, type);
    }

    return res.status(200).json({
      success: true,
      type,
      period: {
        daysBack: parsedDaysBack,
        startDate: new Date(Date.now() - parsedDaysBack * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      },
      data: analyticsData,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Error fetching ${type} analytics:`, { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ 
      error: `Failed to fetch ${type} analytics`,
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}

async function handleTrackEvent(
  req: NextApiRequest,
  res: NextApiResponse<AnalyticsResponse | ErrorResponse>
) {
  const {
    eventType,
    eventData = {},
    userId = null
  } = req.body;

  if (!eventType) {
    return res.status(400).json({ 
      error: 'eventType is required' 
    });
  }

  // Validate event type
  const validEventTypes = [
    'card_view', 'card_favorite', 'card_price_check',
    'search', 'pokemon_view', 'deck_action', 'collection_action',
    'user_journey', 'performance_metric', 'page_view'
  ];

  if (!validEventTypes.includes(eventType)) {
    return res.status(400).json({ 
      error: 'Invalid event type',
      validEventTypes 
    });
  }

  try {
    // Track the event
    analyticsEngine.trackEvent(eventType, eventData, userId);

    return res.status(200).json({
      success: true,
      message: 'Event tracked successfully',
      eventType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error tracking event:', { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ 
      error: 'Failed to track event',
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}

function handleCSVResponse(
  res: NextApiResponse<string | ErrorResponse>,
  data: AnyObject,
  type: string
) {
  try {
    let csvContent = '';

    if (type === 'search') {
      // Generate CSV for search analytics
      csvContent = 'Query,Frequency,Results Count\n';
      
      if (data.queryAnalysis && data.queryAnalysis.topQueries) {
        data.queryAnalysis.topQueries.forEach(([query, frequency]: [string, number]) => {
          csvContent += `"${query}",${frequency},0\n`;
        });
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-analytics.csv"`);
    return res.status(200).send(csvContent);

  } catch (error) {
    logger.error('Error generating CSV response:', { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ 
      error: 'Failed to generate CSV response' 
    });
  }
}

interface BatchEvent {
  eventType: string;
  eventData: AnyObject;
  userId?: string | null;
}

// Batch tracking endpoint for multiple events
export async function handleBatchTracking(events: BatchEvent[]) {
  try {
    for (const event of events) {
      if (event.eventType && event.eventData) {
        analyticsEngine.trackEvent(event.eventType, event.eventData, event.userId);
      }
    }
    
    // Force flush after batch
    await analyticsEngine.flushEvents();
    
    return { success: true, processed: events.length };
  } catch (error) {
    logger.error('Error in batch tracking:', { error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow larger payloads for batch tracking
    },
  },
};