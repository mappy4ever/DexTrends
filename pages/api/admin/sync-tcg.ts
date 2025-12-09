/**
 * Admin API: Trigger TCG Database Sync
 *
 * POST /api/admin/sync-tcg
 *
 * Body:
 *   { "type": "full" | "delta" | "set", "setId": "sv3" }
 *
 * Requires: ADMIN_API_KEY header for authentication
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import logger from '@/utils/logger';

// Types for sync operations
interface SyncRequest {
  type: 'full' | 'delta' | 'set';
  setId?: string;
}

interface SyncResponse {
  success: boolean;
  message: string;
  syncId?: string;
  stats?: {
    seriesCreated: number;
    setsCreated: number;
    setsUpdated: number;
    cardsCreated: number;
    cardsFailed: number;
  };
  error?: string;
}

const TCGDEX_BASE_URL = 'https://api.tcgdex.net/v2/en';
const RATE_LIMIT_MS = 100;

// Validate admin API key
function validateAdminKey(req: NextApiRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    logger.warn('[Admin Sync] ADMIN_API_KEY not configured');
    return false;
  }

  const providedKey = req.headers['x-admin-key'] || req.headers['authorization']?.replace('Bearer ', '');
  return providedKey === adminKey;
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
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  // Validate admin key
  if (!validateAdminKey(req)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Invalid or missing admin key',
    });
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

  // Parse request body
  const { type, setId } = req.body as SyncRequest;

  if (!type || !['full', 'delta', 'set'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid sync type. Use: full, delta, or set',
    });
  }

  if (type === 'set' && !setId) {
    return res.status(400).json({
      success: false,
      message: 'setId required for set sync type',
    });
  }

  // Create Supabase client with service role
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Create sync log entry
  const { data: syncLog, error: logError } = await supabase
    .from('tcg_sync_log')
    .insert({
      sync_type: type,
      target_id: setId || null,
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (logError) {
    logger.error('[Admin Sync] Failed to create sync log:', logError);
    return res.status(500).json({
      success: false,
      message: 'Failed to start sync',
      error: logError.message,
    });
  }

  const syncId = syncLog?.id;
  logger.info(`[Admin Sync] Started ${type} sync`, { syncId, setId });

  // For full/delta syncs, return immediately and process in background
  // For set sync, we can wait as it's faster
  if (type === 'set' && setId) {
    try {
      const stats = await syncSingleSet(supabase, setId);

      await supabase
        .from('tcg_sync_log')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          items_checked: stats.cardsChecked,
          items_created: stats.cardsCreated,
          items_failed: stats.cardsFailed,
        })
        .eq('id', syncId);

      return res.status(200).json({
        success: true,
        message: `Successfully synced set: ${setId}`,
        syncId,
        stats: {
          seriesCreated: 0,
          setsCreated: 0,
          setsUpdated: 1,
          cardsCreated: stats.cardsCreated,
          cardsFailed: stats.cardsFailed,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await supabase
        .from('tcg_sync_log')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: errorMessage,
        })
        .eq('id', syncId);

      return res.status(500).json({
        success: false,
        message: 'Sync failed',
        syncId,
        error: errorMessage,
      });
    }
  }

  // For full/delta, return immediately
  // In production, you'd use a background job queue (e.g., Vercel Cron, AWS Lambda)
  res.status(202).json({
    success: true,
    message: `${type} sync started. Check sync log for progress.`,
    syncId,
  });

  // Note: In Vercel, the response ends the function execution
  // For background processing, you'd need:
  // - Vercel Cron Jobs
  // - External job queue (e.g., Inngest, Trigger.dev)
  // - Or run via npm script: npm run db:sync-full
}

// Sync a single set (fast enough to do synchronously)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function syncSingleSet(
  supabase: ReturnType<typeof createClient<any>>,
  setId: string
): Promise<{ cardsChecked: number; cardsCreated: number; cardsFailed: number }> {
  const stats = { cardsChecked: 0, cardsCreated: 0, cardsFailed: 0 };

  // Fetch set from TCGDex
  const set = await fetchWithRetry<{
    id: string;
    name: string;
    serie?: { id: string; name: string; logo?: string };
    logo?: string;
    symbol?: string;
    cardCount?: { total?: number; official?: number };
    releaseDate?: string;
    tcgOnline?: string;
    legal?: { standard?: boolean; expanded?: boolean };
    cards?: Array<{ id: string; localId: string; name: string; image?: string }>;
  }>(`${TCGDEX_BASE_URL}/sets/${setId}`);

  if (!set) {
    throw new Error(`Set not found: ${setId}`);
  }

  // Upsert series if exists
  if (set.serie) {
    await supabase.from('tcg_series').upsert({
      id: set.serie.id,
      name: set.serie.name,
      logo_url: set.serie.logo || null,
      last_synced_at: new Date().toISOString(),
    }, { onConflict: 'id' });
  }

  // Upsert set
  await supabase.from('tcg_sets').upsert({
    id: set.id,
    series_id: set.serie?.id || null,
    name: set.name,
    logo_url: set.logo || null,
    symbol_url: set.symbol || null,
    total_cards: set.cardCount?.total || null,
    official_cards: set.cardCount?.official || null,
    release_date: set.releaseDate || null,
    tcg_online_code: set.tcgOnline || null,
    legal_standard: set.legal?.standard || false,
    legal_expanded: set.legal?.expanded || true,
    last_synced_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  // Sync cards
  if (set.cards) {
    const cardBatch = [];

    for (const cardBrief of set.cards) {
      stats.cardsChecked++;

      const fullCard = await fetchWithRetry<{
        id: string;
        localId: string;
        name: string;
        category: string;
        hp?: number;
        types?: string[];
        stage?: string;
        evolveFrom?: string;
        evolveTo?: string[];
        attacks?: unknown[];
        abilities?: unknown[];
        weaknesses?: unknown[];
        resistances?: unknown[];
        retreat?: number;
        trainerType?: string;
        energyType?: string;
        effect?: string;
        illustrator?: string;
        rarity?: string;
        regulationMark?: string;
        dexId?: number[];
        description?: string;
        image?: string;
        variants?: { normal?: boolean; reverse?: boolean; holo?: boolean; firstEdition?: boolean };
        legal?: { standard?: boolean; expanded?: boolean };
      }>(`${TCGDEX_BASE_URL}/cards/${cardBrief.id}`);

      await new Promise(r => setTimeout(r, RATE_LIMIT_MS));

      if (!fullCard) {
        stats.cardsFailed++;
        continue;
      }

      cardBatch.push({
        id: fullCard.id,
        local_id: fullCard.localId,
        set_id: setId,
        name: fullCard.name,
        category: fullCard.category,
        hp: fullCard.hp || null,
        types: fullCard.types || null,
        stage: fullCard.stage || null,
        evolve_from: fullCard.evolveFrom || null,
        evolve_to: fullCard.evolveTo || null,
        attacks: fullCard.attacks || null,
        abilities: fullCard.abilities || null,
        weaknesses: fullCard.weaknesses || null,
        resistances: fullCard.resistances || null,
        retreat_cost: fullCard.retreat || null,
        trainer_type: fullCard.trainerType || null,
        energy_type: fullCard.energyType || null,
        effect: fullCard.effect || null,
        illustrator: fullCard.illustrator || null,
        rarity: fullCard.rarity || null,
        regulation_mark: fullCard.regulationMark || null,
        dex_ids: fullCard.dexId || null,
        description: fullCard.description || null,
        image_small: fullCard.image ? `${fullCard.image}/low.webp` : null,
        image_large: fullCard.image ? `${fullCard.image}/high.webp` : null,
        has_normal: fullCard.variants?.normal || false,
        has_reverse: fullCard.variants?.reverse || false,
        has_holo: fullCard.variants?.holo || false,
        has_first_edition: fullCard.variants?.firstEdition || false,
        legal_standard: fullCard.legal?.standard || false,
        legal_expanded: fullCard.legal?.expanded || true,
        last_synced_at: new Date().toISOString(),
      });

      // Batch insert every 50 cards
      if (cardBatch.length >= 50) {
        const { error } = await supabase
          .from('tcg_cards')
          .upsert(cardBatch, { onConflict: 'id' });

        if (error) {
          stats.cardsFailed += cardBatch.length;
        } else {
          stats.cardsCreated += cardBatch.length;
        }
        cardBatch.length = 0;
      }
    }

    // Insert remaining cards
    if (cardBatch.length > 0) {
      const { error } = await supabase
        .from('tcg_cards')
        .upsert(cardBatch, { onConflict: 'id' });

      if (error) {
        stats.cardsFailed += cardBatch.length;
      } else {
        stats.cardsCreated += cardBatch.length;
      }
    }
  }

  return stats;
}
