/**
 * API: Get Single TCG Card from Supabase
 *
 * GET /api/supabase/tcg-cards/[cardId]
 *
 * Returns a single card with all details from local database
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { TcgCardManager } from '@/lib/supabase';
import logger from '@/utils/logger';

interface CardResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CardResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  const { cardId } = req.query;

  if (!cardId || typeof cardId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Card ID is required',
    });
  }

  try {
    logger.debug('[API] Fetching TCG card from Supabase', { cardId });
    const card = await TcgCardManager.getCard(cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found',
      });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[API] Error fetching TCG card:', { cardId, error: errorMessage });

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
