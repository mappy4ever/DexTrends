import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('===== TCG TEST SIMPLE =====');
  
  const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
  console.log('API Key exists:', !!apiKey);
  console.log('API Key value:', apiKey ? `${apiKey.substring(0, 5)}...` : 'none');
  
  const url = 'https://api.pokemontcg.io/v2/sets?page=1&pageSize=10';
  console.log('Fetching URL:', url);
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }
    
    console.log('Headers:', headers);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response text length:', responseText.length);
    console.log('Response text preview:', responseText.substring(0, 200));
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return res.status(500).json({
        error: 'Failed to parse API response',
        responseText: responseText.substring(0, 500),
        parseError: (e as Error).message
      });
    }
    
    console.log('Parsed data structure:', {
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
    console.error('Fetch error:', error);
    res.status(500).json({
      error: 'Fetch failed',
      message: error.message,
      stack: error.stack,
      apiKeyExists: !!apiKey
    });
  }
}