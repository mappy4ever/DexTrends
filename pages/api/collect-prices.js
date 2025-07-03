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
    console.error(`Failed to fetch card ${cardId}:`, error);
    return null;
  }
}

async function getCardsFromDatabase() {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('id, name')
      .limit(100);

    if (error) {
      console.error('Supabase error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

async function storePriceHistory(cardId, priceData) {
  try {
    const { error } = await supabase
      .from('price_history')
      .insert({
        card_id: cardId,
        price_data: priceData,
        collected_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to store price history:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database storage error:', error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting price collection...');
    
    const cards = await getCardsFromDatabase();
    console.log(`Found ${cards.length} cards to process`);

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    // Process cards in batches
    for (let i = 0; i < cards.length; i += BATCH_SIZE) {
      const batch = cards.slice(i, i + BATCH_SIZE);
      
      // Process batch concurrently
      const batchPromises = batch.map(async (card) => {
        try {
          const cardData = await fetchCardData(card.id);
          
          if (cardData && cardData.tcgplayer?.prices) {
            const priceData = {
              normal: cardData.tcgplayer.prices.normal || null,
              holofoil: cardData.tcgplayer.prices.holofoil || null,
              reverseHolofoil: cardData.tcgplayer.prices.reverseHolofoil || null,
              unlimited: cardData.tcgplayer.prices.unlimited || null,
              unlimitedHolofoil: cardData.tcgplayer.prices.unlimitedHolofoil || null
            };

            const stored = await storePriceHistory(card.id, priceData);
            if (stored) {
              successCount++;
            } else {
              errorCount++;
            }
          }
          
          processedCount++;
        } catch (error) {
          console.error(`Error processing card ${card.id}:`, error);
          errorCount++;
          processedCount++;
        }
      });

      await Promise.all(batchPromises);
      
      // Delay between batches to be respectful to the API
      if (i + BATCH_SIZE < cards.length) {
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }

    console.log(`Price collection completed. Processed: ${processedCount}, Success: ${successCount}, Errors: ${errorCount}`);

    res.status(200).json({
      success: true,
      message: 'Price collection completed',
      stats: {
        processed: processedCount,
        successful: successCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('Price collection failed:', error);
    res.status(500).json({
      success: false,
      error: 'Price collection failed',
      message: error.message
    });
  }
}