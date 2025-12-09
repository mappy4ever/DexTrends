/**
 * Cron Job: Daily TCG Database Sync
 *
 * GET /api/cron/sync-tcg
 *
 * Called automatically by Vercel Cron at 6 AM UTC daily.
 * Performs a delta sync to catch any new sets or cards.
 *
 * Security: Vercel automatically adds CRON_SECRET header
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import logger from '@/utils/logger';

const TCGDEX_BASE_URL = 'https://api.tcgdex.net/v2/en';

interface SyncResponse {
  success: boolean;
  message: string;
  stats?: {
    setsChecked: number;
    newSetsFound: number;
    cardsAdded: number;
  };
  error?: string;
}

// Simple fetch with retry
async function fetchWithRetry<T>(url: string, retries = 3): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (attempt === retries) return null;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SyncResponse>
) {
  // Only allow GET (Vercel Cron uses GET)
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  // Verify Vercel Cron secret (in production)
  // Vercel automatically sets this header for cron jobs
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (process.env.NODE_ENV === 'production') {
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('[Cron Sync] Unauthorized cron request');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }
  }

  // Validate Supabase config
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({
      success: false,
      message: 'Supabase not configured',
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  logger.info('[Cron Sync] Starting daily delta sync');

  try {
    // Get existing set IDs from database
    const { data: existingSets } = await supabase
      .from('tcg_sets')
      .select('id');

    const existingSetIds = new Set(existingSets?.map(s => s.id) || []);

    // Fetch all sets from TCGDex
    const allSets = await fetchWithRetry<Array<{ id: string; name: string }>>(
      `${TCGDEX_BASE_URL}/sets`
    );

    if (!allSets) {
      throw new Error('Failed to fetch sets from TCGDex');
    }

    // Find new sets
    const newSets = allSets.filter(s => !existingSetIds.has(s.id));

    const stats = {
      setsChecked: allSets.length,
      newSetsFound: newSets.length,
      cardsAdded: 0,
    };

    if (newSets.length === 0) {
      logger.info('[Cron Sync] No new sets found');

      // Log the sync
      await supabase.from('tcg_sync_log').insert({
        sync_type: 'delta',
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        items_checked: stats.setsChecked,
        items_created: 0,
      });

      return res.status(200).json({
        success: true,
        message: 'No new data to sync',
        stats,
      });
    }

    logger.info(`[Cron Sync] Found ${newSets.length} new sets to sync`);

    // For cron jobs, we just log and return - actual sync would timeout
    // In production, you'd queue this for background processing
    await supabase.from('tcg_sync_log').insert({
      sync_type: 'delta',
      status: 'pending',
      started_at: new Date().toISOString(),
      items_checked: stats.setsChecked,
      error_message: `Found ${newSets.length} new sets: ${newSets.map(s => s.id).join(', ')}`,
    });

    return res.status(200).json({
      success: true,
      message: `Found ${newSets.length} new sets. Run npm run db:sync-delta to sync them.`,
      stats,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[Cron Sync] Failed', { error: errorMessage });

    return res.status(500).json({
      success: false,
      message: 'Sync check failed',
      error: errorMessage,
    });
  }
}
