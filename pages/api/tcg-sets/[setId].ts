import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { setId } = req.query;
  const id = Array.isArray(setId) ? setId[0] : setId;

  if (!id) {
    return res.status(400).json({ error: 'Set ID is required' });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    // Fetch both set info and cards in parallel
    const [setInfo, cardsData] = await Promise.all([
      // Get set information
      fetchJSON<{ data: any }>(`https://api.pokemontcg.io/v2/sets/${id}`, { 
        headers,
        useCache: true,
        cacheTime: 10 * 60 * 1000, // Cache for 10 minutes
        retries: 2
      }),
      // Get cards for this set
      fetchJSON<{ data: any[] }>(`https://api.pokemontcg.io/v2/cards?q=set.id:${id}`, { 
        headers,
        useCache: true,
        cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
        retries: 2
      })
    ]);
    
    const set = setInfo?.data || null;
    const cards = cardsData?.data || [];
    
    logger.debug('TCG set API response received', { setId: id, cardCount: cards.length });
    
    res.status(200).json({ set, cards });
  } catch (error: any) {
    logger.error('Failed to fetch TCG set details', { 
      setId: id,
      error: error.message,
      stack: error.stack 
    });
    res.status(500).json({ 
      error: 'Failed to fetch TCG set details',
      message: error.message 
    });
  }
}