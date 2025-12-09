/**
 * API: Get TCG Series from Supabase
 *
 * GET /api/supabase/tcg-series
 *
 * Returns all TCG series from local Supabase database
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { TcgCardManager } from '@/lib/supabase';
import logger from '@/utils/logger';

interface SeriesResponse {
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    logo_url: string | null;
  }>;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SeriesResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    logger.debug('[API] Fetching TCG series from Supabase');
    const series = await TcgCardManager.getSeries();

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return res.status(200).json({
      success: true,
      data: series,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[API] Error fetching TCG series:', { error: errorMessage });

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
