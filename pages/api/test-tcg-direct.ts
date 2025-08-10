import type { NextApiRequest, NextApiResponse } from 'next';
import logger from '@/utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    // Direct fetch to Pokemon TCG API
    const apiUrl = 'https://api.pokemontcg.io/v2/sets?page=1&pageSize=10';
    logger.debug('Testing direct API call to', { apiUrl });
    
    const response = await fetch(apiUrl, {
      headers,
      method: 'GET',
    });
    
    const responseText = await response.text();
    logger.debug('Response status', { status: response.status });
    logger.debug('Response headers', { headers: Object.fromEntries(response.headers.entries()) });
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      logger.error('Failed to parse response', { responseText });
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
    }
    
    res.status(200).json({
      success: true,
      status: response.status,
      dataLength: data?.data?.length || 0,
      firstSet: data?.data?.[0] || null,
      totalCount: data?.totalCount || 'unknown',
      hasApiKey: !!apiKey,
      rawResponse: process.env.NODE_ENV === 'development' ? responseText.substring(0, 500) : undefined
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Direct API test failed:', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ 
      success: false,
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    });
  }
}