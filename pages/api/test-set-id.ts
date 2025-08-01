import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const testId = Array.isArray(id) ? id[0] : id || 'sv5';
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    // Test direct fetch to Pokemon TCG API
    const apiUrl = `https://api.pokemontcg.io/v2/sets/${testId}`;
    console.log('Testing set ID:', testId);
    
    const response = await fetch(apiUrl, { headers });
    const data = await response.json();
    
    if (response.ok && data.data) {
      res.status(200).json({
        success: true,
        setId: testId,
        setInfo: {
          id: data.data.id,
          name: data.data.name,
          series: data.data.series,
          releaseDate: data.data.releaseDate,
          total: data.data.total
        },
        message: `Set "${testId}" found successfully!`
      });
    } else {
      res.status(404).json({
        success: false,
        setId: testId,
        error: data.error || 'Set not found',
        message: `Set "${testId}" was not found in the Pokemon TCG API`
      });
    }
  } catch (error: any) {
    console.error('Test failed:', error);
    res.status(500).json({ 
      success: false,
      setId: testId,
      error: error.message
    });
  }
}