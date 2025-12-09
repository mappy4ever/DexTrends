/**
 * API: Search TCG Cards from Supabase
 *
 * GET /api/supabase/tcg-cards
 *
 * Query params:
 *   - name: Card name (partial match)
 *   - setId: Filter by set ID
 *   - types: Energy types (comma-separated)
 *   - rarity: Filter by rarity
 *   - category: Pokemon | Trainer | Energy
 *   - stage: Basic | Stage1 | Stage2 | V | VMAX | ex
 *   - illustrator: Filter by artist name
 *   - limit: Results per page (max 100, default 50)
 *   - offset: Pagination offset
 *
 * Returns TCG cards from local Supabase database
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { TcgCardManager } from '@/lib/supabase';
import logger from '@/utils/logger';

interface CardData {
  id: string;
  name: string;
  set_id: string;
  local_id: string;
  category: string;
  hp: number | null;
  types: string[] | null;
  rarity: string | null;
  image_small: string | null;
  image_large: string | null;
  illustrator: string | null;
  stage: string | null;
}

interface CardsResponse {
  success: boolean;
  data?: CardData[];
  total?: number;
  limit?: number;
  offset?: number;
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

  try {
    const {
      name,
      setId,
      types,
      rarity,
      category,
      stage,
      illustrator,
      limit = '50',
      offset = '0',
    } = req.query;

    const options = {
      name: typeof name === 'string' ? name : undefined,
      setId: typeof setId === 'string' ? setId : undefined,
      types: typeof types === 'string' ? types.split(',').map(t => t.trim()) : undefined,
      rarity: typeof rarity === 'string' ? rarity : undefined,
      category: typeof category === 'string' ? category : undefined,
      stage: typeof stage === 'string' ? stage : undefined,
      illustrator: typeof illustrator === 'string' ? illustrator : undefined,
      limit: Math.min(parseInt(String(limit), 10) || 50, 100),
      offset: parseInt(String(offset), 10) || 0,
    };

    logger.debug('[API] Searching TCG cards from Supabase', options);

    const cards = await TcgCardManager.searchCards(options);

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');

    return res.status(200).json({
      success: true,
      data: cards,
      total: cards.length,
      limit: options.limit,
      offset: options.offset,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[API] Error searching TCG cards:', { error: errorMessage });

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
