import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../utils/unifiedFetch';
import logger from '../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    // Use the Pokemon TCG API to get all sets
    const apiUrl = `https://api.pokemontcg.io/v2/sets`;
    logger.debug('Fetching TCG sets from API', { url: apiUrl });
    
    const data = await fetchJSON<{ data: any[] }>(apiUrl, { 
      headers,
      useCache: true,
      cacheTime: 10 * 60 * 1000, // Cache for 10 minutes (sets don't change often)
      retries: 2
    });
    
    const sets = data?.data || [];
    logger.debug('TCG API response received', { setCount: sets.length });
    
    res.status(200).json(sets);
  } catch (error: any) {
    logger.error('Failed to fetch TCG sets', { 
      error: error.message,
      stack: error.stack 
    });
    res.status(500).json({ 
      error: 'Failed to fetch TCG sets',
      message: error.message 
    });
  }
}