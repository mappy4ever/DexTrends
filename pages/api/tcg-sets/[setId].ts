import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { setId, page = '1', pageSize = '20' } = req.query;
  const id = Array.isArray(setId) ? setId[0] : setId;
  const pageNum = parseInt(Array.isArray(page) ? page[0] : page, 10);
  const pageSizeNum = Math.min(parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize, 10), 50);

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

    // Fetch set info and cards (with pagination) in parallel
    const [setInfo, cardsData] = await Promise.all([
      // Get set information (always needed)
      fetchJSON<{ data: any }>(`https://api.pokemontcg.io/v2/sets/${id}`, { 
        headers,
        useCache: true,
        cacheTime: 6 * 60 * 60 * 1000, // Cache for 6 hours
        retries: 2
      }),
      // Get cards for this set with pagination
      fetchJSON<{ data: any[], page?: number, pageSize?: number, count?: number, totalCount?: number }>(
        `https://api.pokemontcg.io/v2/cards?q=set.id:${id}&page=${pageNum}&pageSize=${pageSizeNum}`, 
        { 
          headers,
          useCache: true,
          cacheTime: 30 * 60 * 1000, // Cache for 30 minutes (cards change less frequently)
          retries: 2,
          timeout: 15000 // Reduced timeout for better UX
        }
      )
    ]);
    
    const set = setInfo?.data || null;
    const cards = cardsData?.data || [];
    
    logger.debug('TCG set API response received', { 
      setId: id, 
      page: pageNum,
      pageSize: pageSizeNum,
      cardCount: cards.length,
      totalCount: cardsData?.totalCount 
    });
    
    // Add cache-control headers for better edge caching
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600'); // 30min cache, 1hr stale
    
    res.status(200).json({ 
      set, 
      cards,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        count: cardsData?.count || cards.length,
        totalCount: cardsData?.totalCount || cards.length,
        hasMore: (cardsData?.count || cards.length) === pageSizeNum
      }
    });
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