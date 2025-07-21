import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../utils/unifiedFetch';
import logger from '../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  const pokemonName = Array.isArray(name) ? name[0] : name;

  if (!pokemonName) {
    return res.status(400).json({ error: 'Pokemon name is required' });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    // Use the Pokemon TCG API directly
    const apiUrl = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(pokemonName)}`;
    logger.debug('Fetching TCG cards from API', { url: apiUrl, pokemonName });
    
    const data = await fetchJSON<{ data: any[] }>(apiUrl, { 
      headers,
      useCache: true,
      cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
      retries: 2
    });
    
    const cards = data?.data || [];
    logger.debug('TCG API response received', { pokemonName, cardCount: cards.length });
    
    res.status(200).json(cards);
  } catch (error: any) {
    logger.error('Failed to fetch TCG cards', { 
      pokemonName, 
      error: error.message,
      stack: error.stack 
    });
    res.status(500).json({ 
      error: 'Failed to fetch TCG cards',
      message: error.message 
    });
  }
}