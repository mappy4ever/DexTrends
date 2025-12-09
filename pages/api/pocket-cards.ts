import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../utils/unifiedFetch';
import logger from '../../utils/logger';
import { ErrorResponse } from '@/types/api/api-responses';
import { withRateLimit, RateLimitPresets } from '../../lib/api-middleware';
import { TcgCardManager } from '../../lib/supabase';

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

    // Sort helper
    const rarityOrder: Record<string, number> = {
      'Common': 1,
      'Uncommon': 2,
      'Rare': 3,
      'Rare Holo': 4,
      'Ultra Rare': 5,
      'Secret Rare': 6
    };

    // Try Supabase first (local database) - much faster than external API
    const supabaseCards = await TcgCardManager.searchPocketCards(nameStr, 100);
    if (supabaseCards && supabaseCards.length > 0) {
      logger.debug('Using Supabase data for Pocket cards', { pokemonName: nameStr, count: supabaseCards.length });

      // Transform to expected format
      const cards: PocketCard[] = supabaseCards.map(card => ({
        id: card.id,
        name: card.name,
        rarity: card.rarity || undefined,
        type: card.types?.[0] || undefined,
        set: card.set_id,
        cardNumber: card.local_id,
        artist: card.illustrator || undefined,
        hp: card.hp || undefined,
        attacks: card.attacks as PocketCard['attacks'],
        weaknesses: card.weaknesses as PocketCard['weaknesses'],
        retreatCost: card.retreat_cost ? Array(card.retreat_cost).fill('Colorless') : undefined,
        convertedRetreatCost: card.retreat_cost || undefined,
        images: {
          small: card.image_small || undefined,
          large: card.image_large || undefined
        },
        abilities: card.abilities as PocketCard['abilities']
      }));

      // Sort by rarity then name
      cards.sort((a, b) => {
        const rarityA = rarityOrder[a.rarity || ''] || 0;
        const rarityB = rarityOrder[b.rarity || ''] || 0;
        if (rarityA !== rarityB) return rarityA - rarityB;
        return (a.name || '').localeCompare(b.name || '');
      });

      res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=2592000');
      res.setHeader('X-Data-Source', 'supabase');
      return res.status(200).json(cards);
    }

    logger.debug('Supabase returned no Pocket cards, falling back to GitHub JSON', { pokemonName: nameStr });

    // Fallback to GitHub JSON if Supabase has no data
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

    // Edge cache for 1 week, stale for 30 days (card data is stable)
    res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=2592000');
    res.setHeader('X-Data-Source', 'github');
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