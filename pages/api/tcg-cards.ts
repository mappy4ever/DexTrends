import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  const pokemonName = Array.isArray(name) ? name[0] : name;

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

    // Use the Pokemon TCG API directly
    const apiUrl = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(pokemonName)}`;
    console.log('[TCG API Route] Fetching from:', apiUrl);
    
    const response = await fetch(apiUrl, { headers });
    
    if (!response.ok) {
      console.error('[TCG API Route] API Error:', response.status, response.statusText);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('[TCG API Route] Found cards:', data.data?.length || 0);
    
    res.status(200).json(data.data || []);
  } catch (error: any) {
    console.error('[TCG API Route] Error fetching TCG cards:', error);
    res.status(500).json({ 
      error: 'Failed to fetch TCG cards',
      message: error.message 
    });
  }
}