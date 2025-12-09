/**
 * Price History Sync Script (Optimized)
 *
 * Fetches current prices from TCGDex for cards already in Supabase.
 * This approach reduces redundant API calls by only fetching prices
 * for cards we already have in our database.
 *
 * Run daily via GitHub Actions to build price history over time.
 *
 * Usage:
 *   npm run db:sync-prices                # Sync all cards with prices
 *   npm run db:sync-prices -- --set sv7   # Sync specific set only
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const TCGDEX_BASE = 'https://api.tcgdex.net/v2/en';

interface SupabaseCard {
  id: string;
  name: string;
  set_id: string;
}

interface TCGDexPricing {
  tcgplayer?: {
    updated?: string;
    unit?: string;
    low?: number;
    mid?: number;
    high?: number;
    market?: number;
  };
  cardmarket?: {
    updated?: string;
    unit?: string;
    low?: number;
    trend?: number;
    avg?: number;
    avg1?: number;
    avg7?: number;
    avg30?: number;
  };
}

interface TCGDexCardResponse {
  id: string;
  name: string;
  pricing?: TCGDexPricing;
}

interface PriceRecord {
  card_id: string;
  card_name: string;
  set_id: string | null;
  tcgplayer_low: number | null;
  tcgplayer_mid: number | null;
  tcgplayer_high: number | null;
  tcgplayer_market: number | null;
  cardmarket_low: number | null;
  cardmarket_trend: number | null;
  cardmarket_avg1: number | null;
  cardmarket_avg7: number | null;
  cardmarket_avg30: number | null;
  recorded_at: string;
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      if (response.status === 404) return null; // Card not found in TCGDex
      if (response.status === 429) {
        // Rate limited - wait and retry with exponential backoff
        const waitTime = Math.pow(2, i) * 2000;
        console.log(`  Rate limited, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === retries - 1) return null;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}

async function getCardsFromSupabase(setId?: string): Promise<SupabaseCard[]> {
  console.log('Fetching cards from Supabase...');

  let query = supabase
    .from('tcg_cards')
    .select('id, name, set_id')
    .order('set_id', { ascending: true });

  if (setId) {
    query = query.eq('set_id', setId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching cards from Supabase:', error.message);
    return [];
  }

  return data || [];
}

async function fetchCardPrice(cardId: string): Promise<TCGDexPricing | null> {
  const response = await fetchWithRetry(`${TCGDEX_BASE}/cards/${cardId}`);
  if (!response) return null;

  try {
    const card: TCGDexCardResponse = await response.json();
    return card.pricing || null;
  } catch {
    return null;
  }
}

function createPriceRecord(
  card: SupabaseCard,
  pricing: TCGDexPricing
): PriceRecord {
  const today = new Date().toISOString().split('T')[0];
  const tcgplayer = pricing.tcgplayer;
  const cardmarket = pricing.cardmarket;

  return {
    card_id: card.id,
    card_name: card.name,
    set_id: card.set_id || null,
    tcgplayer_low: tcgplayer?.low ?? null,
    tcgplayer_mid: tcgplayer?.mid ?? null,
    tcgplayer_high: tcgplayer?.high ?? null,
    tcgplayer_market: tcgplayer?.market ?? null,
    cardmarket_low: cardmarket?.low ?? null,
    cardmarket_trend: cardmarket?.trend ?? null,
    cardmarket_avg1: cardmarket?.avg1 ?? null,
    cardmarket_avg7: cardmarket?.avg7 ?? null,
    cardmarket_avg30: cardmarket?.avg30 ?? null,
    recorded_at: today,
  };
}

async function savePriceRecords(records: PriceRecord[]): Promise<{ saved: number; errors: number }> {
  let saved = 0;
  let errors = 0;

  // Upsert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    const { error } = await supabase
      .from('price_history')
      .upsert(batch, {
        onConflict: 'card_id,recorded_at',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`  Error saving batch:`, error.message);
      errors += batch.length;
    } else {
      saved += batch.length;
    }
  }

  return { saved, errors };
}

async function syncPriceHistory(specificSet?: string) {
  console.log('='.repeat(60));
  console.log('Price History Sync (Optimized)');
  console.log('='.repeat(60));
  console.log(`Date: ${new Date().toISOString()}`);
  console.log();

  // Step 1: Get cards from Supabase (not TCGDex)
  const cards = await getCardsFromSupabase(specificSet);

  if (cards.length === 0) {
    console.log('No cards found in Supabase. Run tcg sync first.');
    return;
  }

  console.log(`Found ${cards.length} cards in Supabase`);
  if (specificSet) {
    console.log(`Filtering to set: ${specificSet}`);
  }

  // Group cards by set for better logging
  const cardsBySet = new Map<string, SupabaseCard[]>();
  for (const card of cards) {
    const setId = card.set_id || 'unknown';
    if (!cardsBySet.has(setId)) {
      cardsBySet.set(setId, []);
    }
    cardsBySet.get(setId)!.push(card);
  }

  console.log(`Cards span ${cardsBySet.size} sets\n`);

  let totalProcessed = 0;
  let totalWithPrices = 0;
  let totalSaved = 0;
  let totalErrors = 0;

  // Step 2: Process each set
  for (const [setId, setCards] of cardsBySet) {
    console.log(`Processing set: ${setId} (${setCards.length} cards)`);

    const priceRecords: PriceRecord[] = [];
    let cardsWithPrices = 0;

    // Fetch prices for each card in this set
    for (const card of setCards) {
      const pricing = await fetchCardPrice(card.id);

      if (pricing && (pricing.tcgplayer || pricing.cardmarket)) {
        priceRecords.push(createPriceRecord(card, pricing));
        cardsWithPrices++;
      }

      totalProcessed++;

      // Progress indicator every 50 cards
      if (totalProcessed % 50 === 0) {
        process.stdout.write(`  Processed ${totalProcessed}/${cards.length} cards\r`);
      }

      // Respectful delay between API calls (100ms)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`  Found ${cardsWithPrices} cards with prices`);
    totalWithPrices += cardsWithPrices;

    // Save price records for this set
    if (priceRecords.length > 0) {
      const { saved, errors } = await savePriceRecords(priceRecords);
      totalSaved += saved;
      totalErrors += errors;
      console.log(`  Saved ${saved} price records`);
    }

    // Small delay between sets
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('Sync Complete');
  console.log('='.repeat(60));
  console.log(`Total cards in Supabase: ${cards.length}`);
  console.log(`Cards with prices: ${totalWithPrices}`);
  console.log(`Successfully saved: ${totalSaved}`);
  console.log(`Errors: ${totalErrors}`);
}

// Parse command line arguments
const args = process.argv.slice(2);
let specificSet: string | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--set' && args[i + 1]) {
    specificSet = args[i + 1];
  }
}

// Run the sync
syncPriceHistory(specificSet)
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFatal error:', error);
    process.exit(1);
  });
