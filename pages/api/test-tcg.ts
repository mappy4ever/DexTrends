import type { NextApiRequest, NextApiResponse } from 'next';
import logger from '../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  const pokemonName = Array.isArray(name) ? name[0] : name || 'pikachu';
  
  try {
    const pokemonModule = await import('pokemontcgsdk');
    const pokemon = pokemonModule.default || pokemonModule;
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    
    logger.debug('[Test TCG API] API Key present:', { hasApiKey: !!apiKey });
    logger.debug('[Test TCG API] Searching for:', { pokemonName });
    
    if (apiKey && typeof pokemon.configure === 'function') {
      pokemon.configure({ apiKey });
    }
    
    // Try exact match first
    const exactResult = await pokemon.card.where({ q: `name:"${pokemonName}"` });
    logger.debug('[Test TCG API] Exact match result:', { count: exactResult?.length || 0 });
    
    // Try partial match
    const partialResult = await pokemon.card.where({ q: `name:${pokemonName}*` });
    logger.debug('[Test TCG API] Partial match result:', { count: partialResult?.length || 0 });
    
    res.status(200).json({
      success: true,
      pokemonName,
      apiKeyPresent: !!apiKey,
      exactMatch: {
        count: (exactResult as any).data?.length || 0,
        sample: (exactResult as any).data?.slice(0, 2)
      },
      partialMatch: {
        count: (partialResult as any).data?.length || 0,
        sample: (partialResult as any).data?.slice(0, 2)
      }
    });
  } catch (error: any) {
    logger.error('[Test TCG API] Error:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}