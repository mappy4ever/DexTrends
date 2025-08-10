// API endpoint to collect current Pokemon card prices and store them in history
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
import logger from '../../utils/logger';
import { ErrorResponse } from '@/types/api/api-responses';

// Rate limiting to avoid overwhelming the Pokemon TCG API
const BATCH_SIZE = 20; // Process 20 cards at a time
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface PriceVariant {
  low?: number;
  mid?: number;
  high?: number;
  market?: number;
  directLow?: number;
}

interface PriceData {
  normal?: PriceVariant | null;
  holofoil?: PriceVariant | null;
  reverseHolofoil?: PriceVariant | null;
  unlimited?: PriceVariant | null;
  unlimitedHolofoil?: PriceVariant | null;
  '1stEditionHolofoil'?: PriceVariant | null;
}

interface CardData {
  id: string;
  name: string;
  set?: {
    name: string;
  };
  tcgplayer?: {
    prices?: PriceData;
  };
}

interface DatabaseCard {
  id: string;
  name: string;
}

async function fetchCardData(cardId: string): Promise<CardData | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
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
    logger.error(`Failed to fetch card ${cardId}:`, { cardId, error });
    return null;
  }
}

async function getCardsFromDatabase(): Promise<DatabaseCard[]> {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('id, name')
      .limit(100);

    if (error) {
      logger.error('Supabase error:', { error });
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Database error:', { error });
    return [];
  }
}

async function storePriceHistory(cardId: string, priceData: PriceData, cardName: string = '', setName: string = ''): Promise<boolean> {
  try {
    // Extract individual prices from the different variants
    const marketPrice = priceData.normal?.market || 
                       priceData.holofoil?.market || 
                       priceData.reverseHolofoil?.market || 
                       priceData.unlimited?.market || 
                       priceData.unlimitedHolofoil?.market || 
                       0;
    
    const lowPrice = priceData.normal?.low || 
                     priceData.holofoil?.low || 
                     priceData.reverseHolofoil?.low || 
                     priceData.unlimited?.low || 
                     priceData.unlimitedHolofoil?.low || 
                     0;
    
    const midPrice = priceData.normal?.mid || 
                     priceData.holofoil?.mid || 
                     priceData.reverseHolofoil?.mid || 
                     priceData.unlimited?.mid || 
                     priceData.unlimitedHolofoil?.mid || 
                     0;
    
    const highPrice = priceData.normal?.high || 
                      priceData.holofoil?.high || 
                      priceData.reverseHolofoil?.high || 
                      priceData.unlimited?.high || 
                      priceData.unlimitedHolofoil?.high || 
                      0;

    // Determine variant type based on available data
    let variantType = 'normal';
    if (priceData.holofoil?.market) variantType = 'holofoil';
    else if (priceData.reverseHolofoil?.market) variantType = 'reverseHolofoil';
    else if (priceData.unlimited?.market) variantType = 'unlimited';
    else if (priceData.unlimitedHolofoil?.market) variantType = 'unlimitedHolofoil';

    const { error } = await supabase
      .from('card_price_history')
      .insert({
        card_id: cardId,
        card_name: cardName,
        set_name: setName,
        variant_type: variantType,
        price_market: marketPrice,
        price_low: lowPrice,
        price_mid: midPrice,
        price_high: highPrice,
        collected_at: new Date().toISOString()
      });

    if (error) {
      logger.error('Failed to store price history:', { cardId, error });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Database storage error:', { error });
    return false;
  }
}

interface CollectionResponse {
  success: boolean;
  message: string;
  stats?: {
    processed: number;
    successful: number;
    errors: number;
  };
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CollectionResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST method is allowed'
    });
  }

  try {
    logger.info('Starting price collection...');
    
    const cards = await getCardsFromDatabase();
    logger.info(`Found ${cards.length} cards to process`);

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

            const stored = await storePriceHistory(
              card.id, 
              priceData, 
              cardData.name || card.name,
              cardData.set?.name || ''
            );
            if (stored) {
              successCount++;
            } else {
              errorCount++;
            }
          }
          
          processedCount++;
        } catch (error) {
          logger.error(`Error processing card ${card.id}:`, { cardId: card.id, error });
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

    logger.info(`Price collection completed. Processed: ${processedCount}, Success: ${successCount}, Errors: ${errorCount}`);

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
    logger.error('Price collection failed:', { error });
    res.status(500).json({
      error: 'Price collection failed',
      message: error instanceof Error ? error.message : String(error) || 'Unknown error'
    });
  }
}