/**
 * TCG Database Sync Script
 *
 * Syncs TCG card data from TCGDex API to local Supabase database.
 * Supports both full sync and delta updates.
 *
 * Usage:
 *   npx ts-node scripts/sync-tcg-database.ts --full     # Full sync (all data)
 *   npx ts-node scripts/sync-tcg-database.ts --delta    # Delta sync (new data only)
 *   npx ts-node scripts/sync-tcg-database.ts --set sv3  # Sync specific set
 */

// Load environment variables from .env.local
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  TCGDexCard,
  TCGDexSet,
  TCGDexSerie,
  TCGDexSetBrief,
  TCGDexSerieBrief,
} from '../types/api/tcgdex';

// ============================================================================
// Configuration
// ============================================================================

const TCGDEX_BASE_URL = 'https://api.tcgdex.net/v2/en';
const BATCH_SIZE = 50; // Cards to insert per batch
const RATE_LIMIT_MS = 100; // Delay between API calls to avoid rate limiting

// ============================================================================
// Types
// ============================================================================

interface SyncStats {
  seriesChecked: number;
  seriesCreated: number;
  seriesUpdated: number;
  setsChecked: number;
  setsCreated: number;
  setsUpdated: number;
  cardsChecked: number;
  cardsCreated: number;
  cardsUpdated: number;
  cardsFailed: number;
  errors: string[];
}

interface DbSeries {
  id: string;
  name: string;
  logo_url: string | null;
  last_synced_at: string;
}

interface DbSet {
  id: string;
  series_id: string | null;
  name: string;
  logo_url: string | null;
  symbol_url: string | null;
  total_cards: number | null;
  official_cards: number | null;
  release_date: string | null;
  tcg_online_code: string | null;
  legal_standard: boolean;
  legal_expanded: boolean;
  last_synced_at: string;
}

interface DbCard {
  id: string;
  local_id: string;
  set_id: string;
  name: string;
  category: string;
  hp: number | null;
  types: string[] | null;
  stage: string | null;
  evolve_from: string | null;
  evolve_to: string[] | null;
  attacks: unknown | null;
  abilities: unknown | null;
  weaknesses: unknown | null;
  resistances: unknown | null;
  retreat_cost: number | null;
  trainer_type: string | null;
  energy_type: string | null;
  effect: string | null;
  illustrator: string | null;
  rarity: string | null;
  regulation_mark: string | null;
  dex_ids: number[] | null;
  description: string | null;
  image_small: string | null;
  image_large: string | null;
  has_normal: boolean;
  has_reverse: boolean;
  has_holo: boolean;
  has_first_edition: boolean;
  legal_standard: boolean;
  legal_expanded: boolean;
  last_synced_at: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(url: string, retries = 3): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`  Attempt ${attempt}/${retries} failed for ${url}:`, error);
      if (attempt < retries) {
        await sleep(1000 * attempt); // Exponential backoff
      }
    }
  }
  return null;
}

function transformCard(card: TCGDexCard, setId: string): DbCard {
  return {
    id: card.id,
    local_id: card.localId,
    set_id: setId,
    name: card.name,
    category: card.category,
    hp: card.hp || null,
    types: card.types || null,
    stage: card.stage || null,
    evolve_from: card.evolveFrom || null,
    evolve_to: card.evolveTo || null,
    attacks: card.attacks || null,
    abilities: card.abilities || null,
    weaknesses: card.weaknesses || null,
    resistances: card.resistances || null,
    retreat_cost: card.retreat || null,
    trainer_type: card.trainerType || null,
    energy_type: card.energyType || null,
    effect: card.effect || null,
    illustrator: card.illustrator || null,
    rarity: card.rarity || null,
    regulation_mark: card.regulationMark || null,
    dex_ids: card.dexId || null,
    description: card.description || null,
    image_small: card.image ? `${card.image}/low.webp` : null,
    image_large: card.image ? `${card.image}/high.webp` : null,
    has_normal: card.variants?.normal || false,
    has_reverse: card.variants?.reverse || false,
    has_holo: card.variants?.holo || false,
    has_first_edition: card.variants?.firstEdition || false,
    legal_standard: card.legal?.standard || false,
    legal_expanded: card.legal?.expanded || true,
    last_synced_at: new Date().toISOString(),
  };
}

// ============================================================================
// Sync Functions
// ============================================================================

async function syncSeries(supabase: SupabaseClient, stats: SyncStats): Promise<Map<string, string>> {
  console.log('\n📚 Syncing series...');

  const seriesMap = new Map<string, string>();

  // Fetch all series from TCGDex
  const series = await fetchWithRetry<TCGDexSerieBrief[]>(`${TCGDEX_BASE_URL}/series`);
  if (!series) {
    stats.errors.push('Failed to fetch series list');
    return seriesMap;
  }

  console.log(`  Found ${series.length} series`);

  for (const s of series) {
    stats.seriesChecked++;

    // Fetch full series details
    const fullSeries = await fetchWithRetry<TCGDexSerie>(`${TCGDEX_BASE_URL}/series/${s.id}`);
    await sleep(RATE_LIMIT_MS);

    if (!fullSeries) {
      stats.errors.push(`Failed to fetch series: ${s.id}`);
      continue;
    }

    const dbSeries: DbSeries = {
      id: fullSeries.id,
      name: fullSeries.name,
      logo_url: fullSeries.logo || null,
      last_synced_at: new Date().toISOString(),
    };

    // Upsert series
    const { error } = await supabase
      .from('tcg_series')
      .upsert(dbSeries, { onConflict: 'id' });

    if (error) {
      stats.errors.push(`Failed to upsert series ${s.id}: ${error.message}`);
    } else {
      stats.seriesCreated++;
      seriesMap.set(fullSeries.id, fullSeries.name);
      console.log(`  ✓ ${fullSeries.name}`);
    }
  }

  return seriesMap;
}

async function syncSets(
  supabase: SupabaseClient,
  stats: SyncStats,
  existingSetIds: Set<string>
): Promise<TCGDexSetBrief[]> {
  console.log('\n📦 Syncing sets...');

  // Fetch all sets from TCGDex
  const sets = await fetchWithRetry<TCGDexSetBrief[]>(`${TCGDEX_BASE_URL}/sets`);
  if (!sets) {
    stats.errors.push('Failed to fetch sets list');
    return [];
  }

  console.log(`  Found ${sets.length} sets`);

  const newSets: TCGDexSetBrief[] = [];

  for (const s of sets) {
    stats.setsChecked++;

    // Fetch full set details
    const fullSet = await fetchWithRetry<TCGDexSet>(`${TCGDEX_BASE_URL}/sets/${s.id}`);
    await sleep(RATE_LIMIT_MS);

    if (!fullSet) {
      stats.errors.push(`Failed to fetch set: ${s.id}`);
      continue;
    }

    const dbSet: DbSet = {
      id: fullSet.id,
      series_id: fullSet.serie?.id || null,
      name: fullSet.name,
      logo_url: fullSet.logo || null,
      symbol_url: fullSet.symbol || null,
      total_cards: fullSet.cardCount?.total || null,
      official_cards: fullSet.cardCount?.official || null,
      release_date: fullSet.releaseDate || null,
      tcg_online_code: fullSet.tcgOnline || null,
      legal_standard: fullSet.legal?.standard || false,
      legal_expanded: fullSet.legal?.expanded || true,
      last_synced_at: new Date().toISOString(),
    };

    // Upsert set
    const { error } = await supabase
      .from('tcg_sets')
      .upsert(dbSet, { onConflict: 'id' });

    if (error) {
      stats.errors.push(`Failed to upsert set ${s.id}: ${error.message}`);
    } else {
      if (!existingSetIds.has(s.id)) {
        stats.setsCreated++;
        newSets.push(s);
        console.log(`  ✓ NEW: ${fullSet.name} (${fullSet.cardCount?.total || 0} cards)`);
      } else {
        stats.setsUpdated++;
        console.log(`  ↻ ${fullSet.name}`);
      }
    }
  }

  return newSets;
}

async function syncCardsForSet(
  supabase: SupabaseClient,
  setId: string,
  stats: SyncStats
): Promise<void> {
  console.log(`\n🃏 Syncing cards for set: ${setId}`);

  // Fetch set with cards
  const set = await fetchWithRetry<TCGDexSet>(`${TCGDEX_BASE_URL}/sets/${setId}`);
  if (!set || !set.cards) {
    stats.errors.push(`Failed to fetch cards for set: ${setId}`);
    return;
  }

  console.log(`  Found ${set.cards.length} cards`);

  const cardBatch: DbCard[] = [];

  for (let i = 0; i < set.cards.length; i++) {
    const cardBrief = set.cards[i];
    stats.cardsChecked++;

    // Fetch full card details
    const fullCard = await fetchWithRetry<TCGDexCard>(`${TCGDEX_BASE_URL}/cards/${cardBrief.id}`);
    await sleep(RATE_LIMIT_MS);

    if (!fullCard) {
      stats.cardsFailed++;
      stats.errors.push(`Failed to fetch card: ${cardBrief.id}`);
      continue;
    }

    cardBatch.push(transformCard(fullCard, setId));

    // Insert in batches
    if (cardBatch.length >= BATCH_SIZE || i === set.cards.length - 1) {
      const { error } = await supabase
        .from('tcg_cards')
        .upsert(cardBatch, { onConflict: 'id' });

      if (error) {
        stats.cardsFailed += cardBatch.length;
        stats.errors.push(`Failed to upsert card batch: ${error.message}`);
      } else {
        stats.cardsCreated += cardBatch.length;
        process.stdout.write(`\r  Progress: ${i + 1}/${set.cards.length} cards`);
      }

      cardBatch.length = 0; // Clear batch
    }
  }

  console.log(`\n  ✓ Completed ${set.name}`);
}

async function getExistingSetIds(supabase: SupabaseClient): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('tcg_sets')
    .select('id');

  if (error) {
    console.error('Failed to fetch existing sets:', error);
    return new Set();
  }

  return new Set(data?.map(s => s.id) || []);
}

async function createSyncLog(
  supabase: SupabaseClient,
  syncType: string,
  targetId?: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('tcg_sync_log')
    .insert({
      sync_type: syncType,
      target_id: targetId || null,
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create sync log:', error);
    return null;
  }

  return data?.id || null;
}

async function updateSyncLog(
  supabase: SupabaseClient,
  logId: string,
  stats: SyncStats,
  status: 'completed' | 'failed'
): Promise<void> {
  const completedAt = new Date().toISOString();

  await supabase
    .from('tcg_sync_log')
    .update({
      status,
      items_checked: stats.cardsChecked,
      items_created: stats.cardsCreated,
      items_updated: stats.cardsUpdated,
      items_failed: stats.cardsFailed,
      completed_at: completedAt,
      error_message: stats.errors.length > 0 ? stats.errors.slice(0, 5).join('; ') : null,
      error_details: stats.errors.length > 0 ? { errors: stats.errors } : null,
    })
    .eq('id', logId);
}

// ============================================================================
// Main Sync Functions
// ============================================================================

async function fullSync(supabase: SupabaseClient): Promise<SyncStats> {
  console.log('🚀 Starting FULL sync...');

  const stats: SyncStats = {
    seriesChecked: 0,
    seriesCreated: 0,
    seriesUpdated: 0,
    setsChecked: 0,
    setsCreated: 0,
    setsUpdated: 0,
    cardsChecked: 0,
    cardsCreated: 0,
    cardsUpdated: 0,
    cardsFailed: 0,
    errors: [],
  };

  const logId = await createSyncLog(supabase, 'full');

  try {
    // 1. Sync all series
    await syncSeries(supabase, stats);

    // 2. Sync all sets
    const existingSetIds = new Set<string>(); // For full sync, treat all as new
    const sets = await fetchWithRetry<TCGDexSetBrief[]>(`${TCGDEX_BASE_URL}/sets`);

    if (sets) {
      // First upsert all sets
      await syncSets(supabase, stats, existingSetIds);

      // Then sync cards for each set
      for (const set of sets) {
        await syncCardsForSet(supabase, set.id, stats);
      }
    }

    if (logId) {
      await updateSyncLog(supabase, logId, stats, 'completed');
    }
  } catch (error) {
    stats.errors.push(`Full sync failed: ${error}`);
    if (logId) {
      await updateSyncLog(supabase, logId, stats, 'failed');
    }
  }

  return stats;
}

async function deltaSync(supabase: SupabaseClient): Promise<SyncStats> {
  console.log('🔄 Starting DELTA sync (new sets only)...');

  const stats: SyncStats = {
    seriesChecked: 0,
    seriesCreated: 0,
    seriesUpdated: 0,
    setsChecked: 0,
    setsCreated: 0,
    setsUpdated: 0,
    cardsChecked: 0,
    cardsCreated: 0,
    cardsUpdated: 0,
    cardsFailed: 0,
    errors: [],
  };

  const logId = await createSyncLog(supabase, 'delta');

  try {
    // 1. Get existing set IDs
    const existingSetIds = await getExistingSetIds(supabase);
    console.log(`  Found ${existingSetIds.size} existing sets in database`);

    // 2. Sync series (always update)
    await syncSeries(supabase, stats);

    // 3. Sync sets and identify new ones
    const newSets = await syncSets(supabase, stats, existingSetIds);

    console.log(`\n  📊 Found ${newSets.length} new sets to sync`);

    // 4. Only sync cards for new sets
    for (const set of newSets) {
      await syncCardsForSet(supabase, set.id, stats);
    }

    if (logId) {
      await updateSyncLog(supabase, logId, stats, 'completed');
    }
  } catch (error) {
    stats.errors.push(`Delta sync failed: ${error}`);
    if (logId) {
      await updateSyncLog(supabase, logId, stats, 'failed');
    }
  }

  return stats;
}

async function syncSet(supabase: SupabaseClient, setId: string): Promise<SyncStats> {
  console.log(`🎯 Syncing specific set: ${setId}`);

  const stats: SyncStats = {
    seriesChecked: 0,
    seriesCreated: 0,
    seriesUpdated: 0,
    setsChecked: 1,
    setsCreated: 0,
    setsUpdated: 0,
    cardsChecked: 0,
    cardsCreated: 0,
    cardsUpdated: 0,
    cardsFailed: 0,
    errors: [],
  };

  const logId = await createSyncLog(supabase, 'set', setId);

  try {
    // Fetch and upsert the set
    const fullSet = await fetchWithRetry<TCGDexSet>(`${TCGDEX_BASE_URL}/sets/${setId}`);
    if (!fullSet) {
      throw new Error(`Set not found: ${setId}`);
    }

    // Ensure series exists
    if (fullSet.serie) {
      await supabase.from('tcg_series').upsert({
        id: fullSet.serie.id,
        name: fullSet.serie.name,
        logo_url: fullSet.serie.logo || null,
        last_synced_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }

    // Upsert set
    const dbSet: DbSet = {
      id: fullSet.id,
      series_id: fullSet.serie?.id || null,
      name: fullSet.name,
      logo_url: fullSet.logo || null,
      symbol_url: fullSet.symbol || null,
      total_cards: fullSet.cardCount?.total || null,
      official_cards: fullSet.cardCount?.official || null,
      release_date: fullSet.releaseDate || null,
      tcg_online_code: fullSet.tcgOnline || null,
      legal_standard: fullSet.legal?.standard || false,
      legal_expanded: fullSet.legal?.expanded || true,
      last_synced_at: new Date().toISOString(),
    };

    await supabase.from('tcg_sets').upsert(dbSet, { onConflict: 'id' });
    stats.setsUpdated++;

    // Sync cards
    await syncCardsForSet(supabase, setId, stats);

    if (logId) {
      await updateSyncLog(supabase, logId, stats, 'completed');
    }
  } catch (error) {
    stats.errors.push(`Set sync failed: ${error}`);
    if (logId) {
      await updateSyncLog(supabase, logId, stats, 'failed');
    }
  }

  return stats;
}

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Get Supabase credentials from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL');
    console.error('   SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Create Supabase client with service role (for write access)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  console.log('🔌 Connected to Supabase');

  let stats: SyncStats;
  const startTime = Date.now();

  if (args.includes('--full')) {
    stats = await fullSync(supabase);
  } else if (args.includes('--delta')) {
    stats = await deltaSync(supabase);
  } else if (args.includes('--set')) {
    const setIndex = args.indexOf('--set');
    const setId = args[setIndex + 1];
    if (!setId) {
      console.error('❌ Please provide a set ID: --set <setId>');
      process.exit(1);
    }
    stats = await syncSet(supabase, setId);
  } else {
    console.log('Usage:');
    console.log('  npx ts-node scripts/sync-tcg-database.ts --full     # Full sync');
    console.log('  npx ts-node scripts/sync-tcg-database.ts --delta    # Delta sync (new only)');
    console.log('  npx ts-node scripts/sync-tcg-database.ts --set sv3  # Sync specific set');
    process.exit(0);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(50));
  console.log('📊 SYNC COMPLETE');
  console.log('='.repeat(50));
  console.log(`Duration: ${duration}s`);
  console.log(`Series: ${stats.seriesCreated} created`);
  console.log(`Sets: ${stats.setsCreated} created, ${stats.setsUpdated} updated`);
  console.log(`Cards: ${stats.cardsCreated} created, ${stats.cardsFailed} failed`);

  if (stats.errors.length > 0) {
    console.log('\n⚠️  Errors:');
    stats.errors.slice(0, 10).forEach(e => console.log(`   - ${e}`));
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more`);
    }
  }

  process.exit(stats.cardsFailed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
