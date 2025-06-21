// API endpoint to collect current Pokemon card prices and store them in history
import { supabase } from '../../lib/supabase';

// Rate limiting to avoid overwhelming the Pokemon TCG API
const BATCH_SIZE = 20; // Process 20 cards at a time
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchCardData(cardId) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    const response = await fetch(`https://api.pokemontcg.io/v2/cards/${cardId}`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching card ${cardId}:`, error);
    return null;
  }
}

async function getCardsToCollect(limit = 100) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    // Get recent popular cards or specific sets
    // You can modify this query to target specific sets or card types
    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=set.id:base1 OR set.id:base2 OR set.id:base3&pageSize=${limit}&orderBy=-tcgplayer.prices.holofoil.market`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching cards list:', error);
    return [];
  }
}

function extractPriceData(card) {
  const priceEntries = [];
  
  if (card.tcgplayer && card.tcgplayer.prices) {
    const tcgplayerData = card.tcgplayer;
    
    // Extract different variant prices
    Object.entries(tcgplayerData.prices).forEach(([variant, prices]) => {
      if (prices && typeof prices === 'object') {
        priceEntries.push({
          card_id: card.id,
          card_name: card.name,
          set_name: card.set?.name || null,
          set_id: card.set?.id || null,
          variant_type: variant,
          price_low: prices.low || null,
          price_mid: prices.mid || null,
          price_high: prices.high || null,
          price_market: prices.market || null,
          price_direct_low: prices.directLow || null,
          tcgplayer_url: tcgplayerData.url || null,
          last_updated_at: tcgplayerData.updatedAt ? new Date(tcgplayerData.updatedAt) : null,
          raw_data: tcgplayerData
        });
      }
    });
  }
  
  return priceEntries;
}

async function storePriceData(priceEntries, jobId) {
  if (priceEntries.length === 0) return { inserted: 0, errors: 0 };

  try {
    const { data, error } = await supabase
      .from('card_price_history')
      .insert(priceEntries);

    if (error) {
      console.error('Error storing price data:', error);
      
      // Update job with error
      await supabase
        .from('price_collection_jobs')
        .update({
          cards_failed: priceEntries.length,
          error_message: error.message,
          error_details: error
        })
        .eq('id', jobId);
        
      return { inserted: 0, errors: priceEntries.length };
    }

    return { inserted: priceEntries.length, errors: 0 };
  } catch (error) {
    console.error('Error in storePriceData:', error);
    return { inserted: 0, errors: priceEntries.length };
  }
}

async function createCollectionJob(jobType = 'manual') {
  try {
    const { data, error } = await supabase
      .from('price_collection_jobs')
      .insert({
        job_type: jobType,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating collection job:', error);
    return null;
  }
}

async function updateCollectionJob(jobId, updates) {
  try {
    const { error } = await supabase
      .from('price_collection_jobs')
      .update(updates)
      .eq('id', jobId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating collection job:', error);
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple API key protection (optional)
  const { authorization } = req.headers;
  const apiKey = process.env.PRICE_COLLECTION_API_KEY;
  
  if (apiKey && authorization !== `Bearer ${apiKey}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { jobType = 'manual', limit = 100, specificCards = [] } = req.body;

  console.log(`Starting price collection job (${jobType}) for ${limit} cards...`);

  // Create collection job
  const job = await createCollectionJob(jobType);
  if (!job) {
    return res.status(500).json({ error: 'Failed to create collection job' });
  }

  let cardsToProcess = [];
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalFailed = 0;

  try {
    // Get cards to collect prices for
    if (specificCards.length > 0) {
      // Process specific card IDs
      cardsToProcess = specificCards;
    } else {
      // Get popular cards
      const cards = await getCardsToCollect(limit);
      cardsToProcess = cards.map(card => card.id);
    }

    console.log(`Found ${cardsToProcess.length} cards to process`);

    // Process cards in batches
    for (let i = 0; i < cardsToProcess.length; i += BATCH_SIZE) {
      const batch = cardsToProcess.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(cardsToProcess.length / BATCH_SIZE)}`);

      // Fetch card data for each card in the batch
      const cardDataPromises = batch.map(cardId => fetchCardData(cardId));
      const cardDataResults = await Promise.all(cardDataPromises);

      // Extract price data from successful fetches
      const allPriceEntries = [];
      for (const cardData of cardDataResults) {
        totalProcessed++;
        
        if (cardData) {
          const priceEntries = extractPriceData(cardData);
          if (priceEntries.length > 0) {
            allPriceEntries.push(...priceEntries);
            totalUpdated++;
          }
        } else {
          totalFailed++;
        }
      }

      // Store price data for this batch
      if (allPriceEntries.length > 0) {
        const result = await storePriceData(allPriceEntries, job.id);
        if (result.errors > 0) {
          totalFailed += result.errors;
        }
      }

      // Update job progress
      await updateCollectionJob(job.id, {
        cards_processed: totalProcessed,
        cards_updated: totalUpdated,
        cards_failed: totalFailed
      });

      // Delay between batches to be respectful to the API
      if (i + BATCH_SIZE < cardsToProcess.length) {
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }

    // Mark job as completed
    await updateCollectionJob(job.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      cards_processed: totalProcessed,
      cards_updated: totalUpdated,
      cards_failed: totalFailed
    });

    console.log(`Price collection completed: ${totalUpdated}/${totalProcessed} cards updated, ${totalFailed} failed`);

    res.status(200).json({
      success: true,
      jobId: job.id,
      summary: {
        cardsProcessed: totalProcessed,
        cardsUpdated: totalUpdated,
        cardsFailed: totalFailed,
        batchesProcessed: Math.ceil(cardsToProcess.length / BATCH_SIZE)
      }
    });

  } catch (error) {
    console.error('Error in price collection:', error);

    // Mark job as failed
    await updateCollectionJob(job.id, {
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_message: error.message,
      error_details: { error: error.toString(), stack: error.stack }
    });

    res.status(500).json({
      error: 'Price collection failed',
      message: error.message,
      jobId: job.id
    });
  }
}