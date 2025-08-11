import type { NextApiRequest, NextApiResponse } from 'next';
import logger from '@/utils/logger';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const setId = 'sv5';
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    // Test the exact endpoint that the frontend calls
    const testUrl = `http://localhost:3002/api/tcg-sets/${setId}?page=1&pageSize=20`;
    logger.debug('Testing local API endpoint', { testUrl });
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    logger.debug('Local API response:', {
      status: response.status,
      ok: response.ok,
      hasSet: !!data?.set,
      hasCards: !!data?.cards,
      setName: data?.set?.name,
      cardsCount: data?.cards?.length
    });
    
    res.status(200).json({
      localApiTest: {
        url: testUrl,
        status: response.status,
        ok: response.ok,
        data: data
      },
      // Also test direct Pokemon TCG API
      directApiTest: {
        message: 'Visit /api/test-set/sv5 for direct API test'
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Test failed:', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      error: errorMessage,
      stack: errorStack
    });
  }
}