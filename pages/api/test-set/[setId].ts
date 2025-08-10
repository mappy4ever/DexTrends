import type { NextApiRequest, NextApiResponse } from 'next';
import logger from '@/utils/logger';

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

    // Direct API call to test set existence
    const setUrl = `https://api.pokemontcg.io/v2/sets/${id}`;
    logger.debug('Testing direct API call to:', { setUrl });
    
    const response = await fetch(setUrl, {
      headers,
      method: 'GET',
    });
    
    const responseText = await response.text();
    logger.debug('Response status:', { status: response.status });
    logger.debug('Response headers:', { headers: Object.fromEntries(response.headers.entries()) });
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      logger.error('Failed to parse response:', { responseText });
      return res.status(500).json({ 
        error: 'Invalid JSON response',
        responsePreview: responseText.substring(0, 200),
        setId: id
      });
    }
    
    if (response.status === 404) {
      return res.status(404).json({
        error: 'Set not found by Pokemon TCG API',
        setId: id,
        apiResponse: data
      });
    }
    
    res.status(200).json({
      success: true,
      setId: id,
      status: response.status,
      setData: data?.data || null,
      hasApiKey: !!apiKey,
      message: data?.data ? `Set "${data.data.name}" found successfully` : 'No set data returned'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Test API failed:', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ 
      error: errorMessage,
      setId: id,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    });
  }
}