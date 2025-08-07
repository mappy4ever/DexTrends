import type { NextApiRequest, NextApiResponse } from 'next';
import logger from '@/utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  logger.debug('===== TCG TEST SIMPLE =====');
  
  const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
  logger.debug('API Key exists:', !!apiKey);
  logger.debug('API Key value:', apiKey ? `${apiKey.substring(0, 5)}...` : 'none');
  
  const url = 'https://api.pokemontcg.io/v2/sets?page=1&pageSize=10';
  logger.debug('Fetching URL:', url);
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }
    
    logger.debug('Headers:', headers);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    
    logger.debug('Response status:', response.status);
    logger.debug('Response ok:', response.ok);
    logger.debug('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    logger.debug('Response text length:', responseText.length);
    logger.debug('Response text preview:', responseText.substring(0, 200));
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      logger.error('Failed to parse JSON:', e);
      return res.status(500).json({
        error: 'Failed to parse API response',
        responseText: responseText.substring(0, 500),
        parseError: (e as Error).message
      });
    }
    
    logger.debug('Parsed data structure:', {
      hasData: !!data,
      hasDataArray: !!data?.data,
      dataLength: data?.data?.length || 0,
      firstItem: data?.data?.[0] || null
    });
    
    res.status(200).json({
      success: true,
      apiKeyExists: !!apiKey,
      responseStatus: response.status,
      dataCount: data?.data?.length || 0,
      totalCount: data?.totalCount || 'unknown',
      firstSet: data?.data?.[0] || null,
      allSetNames: data?.data?.map((s: any) => `${s.id}: ${s.name}`) || [],
      rawResponse: responseText.substring(0, 500)
    });
  } catch (error: any) {
    logger.error('Fetch error:', error);
    res.status(500).json({
      error: 'Fetch failed',
      message: error.message,
      stack: error.stack,
      apiKeyExists: !!apiKey
    });
  }
}