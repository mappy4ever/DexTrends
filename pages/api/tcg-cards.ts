import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../utils/unifiedFetch';
import logger from '../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  const { name, fields } = req.query;
  const pokemonName = Array.isArray(name) ? name[0] : name;
  const requestedFields = Array.isArray(fields) ? fields[0] : fields;

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

    // Use the Pokemon TCG API directly with optional field selection
    let apiUrl = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(pokemonName)}`;
    
    // Add field selection to reduce response size if requested
    if (requestedFields) {
      const fieldsParam = requestedFields.split(',').map((f: string) => f.trim()).join(',');
      apiUrl += `&select=${encodeURIComponent(fieldsParam)}`;
    }
    
    logger.debug('Fetching TCG cards from API', { url: apiUrl, pokemonName, fields: requestedFields });
    
    const data = await fetchJSON<{ data: any[] }>(apiUrl, { 
      headers,
      useCache: true,
      cacheTime: 30 * 60 * 1000, // Cache for 30 minutes (cards don't change often)
      timeout: 8000, // Reduced timeout for faster failure
      retries: 1,
      retryDelay: 300
    });
    
    const cards = data?.data || [];
    logger.debug('TCG API response received', { pokemonName, cardCount: cards.length });
    
    // Add cache-control headers for better edge caching
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600'); // 30min cache, 1hr stale
    res.setHeader('Vary', 'Accept-Encoding'); // Support compression
    
    // Add performance headers
    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    
    // Log slow responses
    if (responseTime > 3000) {
      logger.warn('Slow TCG cards API response', { 
        responseTime, 
        pokemonName,
        cardCount: cards.length,
        fields: requestedFields
      });
    }
    
    res.status(200).json({
      data: cards,
      meta: {
        responseTime,
        cardCount: cards.length,
        pokemonName,
        fields: requestedFields || 'all'
      }
    });
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