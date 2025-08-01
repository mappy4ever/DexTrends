import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    // Fetch all pages to get complete set list
    let allSets: any[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore && page <= 5) { // Limit to 5 pages for safety
      const apiUrl = `https://api.pokemontcg.io/v2/sets?page=${page}&pageSize=100&orderBy=-releaseDate`;
      console.log(`Fetching page ${page}...`);
      
      const response = await fetch(apiUrl, { headers });
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        allSets = [...allSets, ...data.data];
        hasMore = data.data.length === 100;
        page++;
      } else {
        hasMore = false;
      }
    }
    
    // Sort by release date
    const sortedSets = allSets.sort((a, b) => 
      new Date(b.releaseDate || '1970-01-01').getTime() - 
      new Date(a.releaseDate || '1970-01-01').getTime()
    );
    
    // Get series breakdown
    const seriesCount: Record<string, number> = {};
    sortedSets.forEach(set => {
      if (set.series) {
        seriesCount[set.series] = (seriesCount[set.series] || 0) + 1;
      }
    });
    
    // Find Scarlet & Violet sets
    const svSets = sortedSets.filter(s => 
      s.series?.toLowerCase().includes('scarlet') || 
      s.id.startsWith('sv') ||
      s.name.toLowerCase().includes('scarlet')
    );
    
    res.status(200).json({
      totalSets: sortedSets.length,
      newestSets: sortedSets.slice(0, 10).map(s => ({
        id: s.id,
        name: s.name,
        releaseDate: s.releaseDate,
        series: s.series
      })),
      seriesBreakdown: seriesCount,
      scarletVioletCount: svSets.length,
      scarletVioletSets: svSets.map(s => ({
        id: s.id,
        name: s.name,
        releaseDate: s.releaseDate
      })),
      hasApiKey: !!apiKey,
      message: `Fetched ${sortedSets.length} total sets across ${page - 1} pages`
    });
  } catch (error: any) {
    console.error('Debug API test failed:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}