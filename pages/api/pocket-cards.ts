import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../utils/unifiedFetch';
import logger from '../../utils/logger';
import { ErrorResponse } from '@/types/api/api-responses';
import { withRateLimit, RateLimitPresets } from '../../lib/api-middleware';

interface PocketCard {
  id?: string;
  name: string;
  rarity?: string;
  type?: string;
  set?: string;
  cardNumber?: string;
  artist?: string;
  hp?: number;
  attacks?: Array<{
    name: string;
    cost: string[];
    damage?: string;
    text?: string;
  }>;
  weaknesses?: Array<{
    type: string;
    value: string;
  }>;
  resistances?: Array<{
    type: string;
    value: string;
  }>;
  retreatCost?: string[];
  convertedRetreatCost?: number;
  images?: {
    small?: string;
    large?: string;
  };
  abilities?: Array<{
    name: string;
    text: string;
    type: string;
  }>;
  rules?: string[];
  legalities?: Record<string, string>;
}


async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PocketCard[] | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name } = req.query;
  const nameStr = Array.isArray(name) ? name[0] : name;

  if (!nameStr) {
    return res.status(400).json({ error: 'Pokemon name is required' });
  }

  try {
    logger.debug('Fetching pocket cards data', { pokemonName: nameStr });
    
    // Fetch pocket cards data from the external API with aggressive caching
    const allCards = await fetchJSON<PocketCard[]>(
      'https://raw.githubusercontent.com/chase-manning/pokemon-tcg-pocket-cards/refs/heads/main/v4.json',
      {
        useCache: true,
        cacheTime: 30 * 60 * 1000, // Cache for 30 minutes (static data)
        retries: 2
      }
    );
    
    if (!Array.isArray(allCards)) {
      throw new Error('Invalid data format from external API');
    }

    // Clean the Pokemon name for matching
    const cleanPokemonName = nameStr.toLowerCase()
      .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric characters

    // Filter cards by Pokemon name with intelligent matching
    const filteredCards = allCards.filter((card: PocketCard) => {
      if (!card || !card.name) return false;
      
      // Clean the card name for comparison
      const cardBaseName = card.name.toLowerCase()
        .replace(/\s+(ex|gx|v|vmax|vstar)$/i, '') // Remove TCG suffixes
        .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric
      
      // Also check first word only for complex names
      const cardFirstWord = card.name.split(' ')[0].toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      
      return cardBaseName === cleanPokemonName || 
             cardFirstWord === cleanPokemonName ||
             cardBaseName.includes(cleanPokemonName) ||
             cleanPokemonName.includes(cardBaseName);
    });

    // Sort cards by rarity (if available) and then by name
    const rarityOrder: Record<string, number> = {
      'Common': 1,
      'Uncommon': 2,
      'Rare': 3,
      'Rare Holo': 4,
      'Ultra Rare': 5,
      'Secret Rare': 6
    };

    filteredCards.sort((a: PocketCard, b: PocketCard) => {
      // Sort by rarity first
      const rarityA = rarityOrder[a.rarity || ''] || 0;
      const rarityB = rarityOrder[b.rarity || ''] || 0;
      
      if (rarityA !== rarityB) {
        return rarityA - rarityB;
      }
      
      // Then sort by name
      return (a.name || '').localeCompare(b.name || '');
    });

    logger.debug('Pocket cards filtered and sorted', { 
      pokemonName: nameStr, 
      totalCards: allCards.length,
      filteredCount: filteredCards.length 
    });

    res.status(200).json(filteredCards);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Failed to fetch pocket cards', { 
      pokemonName: nameStr, 
      error: errorMessage 
    });
    res.status(500).json({
      error: 'Failed to fetch pocket cards',
      message: errorMessage
    });
  }
}

// Export with rate limiting: 60 requests/minute (search endpoint)
export default withRateLimit(handler, { ...RateLimitPresets.search, keyPrefix: 'pocket-cards' });