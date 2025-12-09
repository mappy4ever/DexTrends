/**
 * API: Get TCG Database Stats from Supabase
 *
 * GET /api/supabase/tcg-stats
 *
 * Returns count of series, sets, and cards in local database
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { TcgCardManager } from '@/lib/supabase';
import logger from '@/utils/logger';

interface StatsResponse {
  success: boolean;
  data?: {
    series: number;
    sets: number;
    cards: number;
    lastUpdated?: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    logger.debug('[API] Fetching TCG database stats from Supabase');
    const stats = await TcgCardManager.getStats();

    if (!stats) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch stats',
      });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

    return res.status(200).json({
      success: true,
      data: {
        ...stats,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[API] Error fetching TCG stats:', { error: errorMessage });

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
