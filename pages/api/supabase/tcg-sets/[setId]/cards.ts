/**
 * API: Get All Cards in a TCG Set from Supabase
 *
 * GET /api/supabase/tcg-sets/[setId]/cards
 *
 * Returns all cards in a specific set from local database
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { TcgCardManager } from '@/lib/supabase';
import logger from '@/utils/logger';

interface CardData {
  id: string;
  name: string;
  local_id: string;
  category: string;
  rarity: string | null;
  image_small: string | null;
  image_large: string | null;
}

interface CardsResponse {
  success: boolean;
  data?: CardData[];
  setId?: string;
  total?: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CardsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  const { setId } = req.query;

  if (!setId || typeof setId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Set ID is required',
    });
  }

  try {
    logger.debug('[API] Fetching TCG cards by set from Supabase', { setId });
    const cards = await TcgCardManager.getCardsBySet(setId);

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return res.status(200).json({
      success: true,
      data: cards,
      setId,
      total: cards.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[API] Error fetching TCG cards by set:', { setId, error: errorMessage });

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
