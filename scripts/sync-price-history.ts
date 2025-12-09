/**
 * Price History Sync Script
 *
 * Fetches current prices from TCGDex and stores them in Supabase.
 * Run daily via GitHub Actions to build price history over time.
 *
 * Usage:
 *   npm run db:sync-prices           # Sync all cards with prices
 *   npm run db:sync-prices -- --set sv7  # Sync specific set only
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

interface TCGDexCard {
  id: string;
  name: string;
  localId: string;
  set?: {
    id: string;
    name: string;
  };
  // TCGDex uses 'pricing' object with tcgplayer/cardmarket nested
  pricing?: {
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
  };
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

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      if (response.status === 429) {
        // Rate limited - wait and retry
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`  Rate limited, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Max retries exceeded');
}

async function getAllSets(): Promise<string[]> {
  console.log('Fetching all sets...');
  const response = await fetchWithRetry(`${TCGDEX_BASE}/sets`);
  const sets = await response.json();
  return sets.map((s: { id: string }) => s.id);
}

async function getCardsWithPrices(setId: string): Promise<TCGDexCard[]> {
  try {
    const response = await fetchWithRetry(`${TCGDEX_BASE}/sets/${setId}`);
    const setData = await response.json();

    if (!setData.cards) return [];

    // Filter to only cards that have price data
    const cardsWithPrices: TCGDexCard[] = [];

    for (const card of setData.cards) {
      // Fetch full card details to get prices
      try {
        const cardResponse = await fetchWithRetry(`${TCGDEX_BASE}/cards/${card.id}`);
        const fullCard: TCGDexCard = await cardResponse.json();

        // Only include if it has any price data (TCGDex uses 'pricing' object)
        if (fullCard.pricing?.tcgplayer || fullCard.pricing?.cardmarket) {
          cardsWithPrices.push(fullCard);
        }

        // Longer delay to be respectful to the API (100ms between cards)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch {
        // Skip cards that fail to fetch
      }
    }

    return cardsWithPrices;
  } catch (error) {
    console.error(`  Error fetching set ${setId}:`, error);
    return [];
  }
}

function cardToPriceRecord(card: TCGDexCard): PriceRecord {
  const today = new Date().toISOString().split('T')[0];
  const tcgplayer = card.pricing?.tcgplayer;
  const cardmarket = card.pricing?.cardmarket;

  return {
    card_id: card.id,
    card_name: card.name,
    set_id: card.set?.id || null,
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

async function syncPriceHistory(specificSet?: string) {
  console.log('='.repeat(60));
  console.log('Price History Sync');
  console.log('='.repeat(60));
  console.log(`Date: ${new Date().toISOString()}`);
  console.log();

  let sets: string[];

  if (specificSet) {
    sets = [specificSet];
    console.log(`Syncing specific set: ${specificSet}`);
  } else {
    sets = await getAllSets();
    // Sync ALL sets to capture complete price history
    console.log(`Syncing ALL ${sets.length} sets`);
  }

  let totalCards = 0;
  let totalSaved = 0;
  let totalErrors = 0;

  for (const setId of sets) {
    console.log(`\nProcessing set: ${setId}`);

    const cards = await getCardsWithPrices(setId);
    console.log(`  Found ${cards.length} cards with prices`);

    if (cards.length === 0) continue;

    const priceRecords = cards.map(cardToPriceRecord);
    totalCards += priceRecords.length;

    // Upsert in batches
    const batchSize = 100;
    for (let i = 0; i < priceRecords.length; i += batchSize) {
      const batch = priceRecords.slice(i, i + batchSize);

      const { error } = await supabase
        .from('price_history')
        .upsert(batch, {
          onConflict: 'card_id,recorded_at',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`  Error saving batch:`, error.message);
        totalErrors += batch.length;
      } else {
        totalSaved += batch.length;
      }
    }

    console.log(`  Saved ${priceRecords.length} price records`);

    // Longer delay between sets to be respectful to the API (1 second)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('Sync Complete');
  console.log('='.repeat(60));
  console.log(`Total cards processed: ${totalCards}`);
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
