/**
 * API: Get TCG Sets from Supabase
 *
 * GET /api/supabase/tcg-sets
 * GET /api/supabase/tcg-sets?seriesId=xy
 *
 * Query params:
 *   - seriesId: Filter by series ID (optional)
 *
 * Returns TCG sets from local Supabase database
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { TcgCardManager } from '@/lib/supabase';
import logger from '@/utils/logger';

interface SetData {
  id: string;
  name: string;
  series_id: string | null;
  logo_url: string | null;
  symbol_url: string | null;
  total_cards: number | null;
  release_date: string | null;
}

interface SetsResponse {
  success: boolean;
  data?: SetData[];
  total?: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SetsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { seriesId } = req.query;

    logger.debug('[API] Fetching TCG sets from Supabase', { seriesId });

    const sets = await TcgCardManager.getSets(
      typeof seriesId === 'string' ? seriesId : undefined
    );

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return res.status(200).json({
      success: true,
      data: sets,
      total: sets.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[API] Error fetching TCG sets:', { error: errorMessage });

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
