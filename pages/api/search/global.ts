import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import type { TCGApiResponse } from '../../../types/api/enhanced-responses';
import { isTCGCard, isTCGSet, isObject, isString, hasProperty } from '../../../utils/typeGuards';

interface SearchResult {
  category: 'pokemon' | 'card' | 'set' | 'move' | 'item' | 'ability';
  id: string;
  name: string;
  description?: string;
  image?: string;
  url: string;
  relevance: number;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  categories: {
    [key: string]: number;
  };
}

// Simple in-memory cache for search results
const searchCache = new Map<string, { data: SearchResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper to get base URL from request
function getBaseUrl(req: NextApiRequest): string {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  return `${protocol}://${host}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, limit = '20', categories } = req.query;
  const query = (q as string || '').trim().toLowerCase();

  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' });
  }

  // Check cache
  const cacheKey = `${query}-${limit}-${categories || 'all'}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return res.status(200).json(cached.data);
  }

  // Get base URL for internal API calls
  const baseUrl = getBaseUrl(req);

  try {
    const results: SearchResult[] = [];
    const categoryFilter = categories ? (categories as string).split(',') : null;
    const resultLimit = Math.min(parseInt(limit as string), 50);

    // Search Pokemon
    if (!categoryFilter || categoryFilter.includes('pokemon')) {
      try {
        // For now, we'll search from a predefined list since we don't have a proper Pokemon search endpoint
        // In production, this would query the Pokemon API or database
        const pokemonResults = await searchPokemon(query, resultLimit);
        results.push(...pokemonResults);
      } catch (error) {
        logger.error('[Global Search] Pokemon search failed:', { error: error instanceof Error ? error.message : String(error) });
      }
    }

    // Search TCG Cards
    if (!categoryFilter || categoryFilter.includes('card')) {
      try {
        const cardResults = await searchTCGCards(query, resultLimit, baseUrl);
        results.push(...cardResults);
      } catch (error) {
        logger.error('[Global Search] Card search failed:', { error: error instanceof Error ? error.message : String(error) });
      }
    }

    // Search TCG Sets
    if (!categoryFilter || categoryFilter.includes('set')) {
      try {
        const setResults = await searchTCGSets(query, resultLimit, baseUrl);
        results.push(...setResults);
      } catch (error) {
        logger.error('[Global Search] Set search failed:', { error: error instanceof Error ? error.message : String(error) });
      }
    }

    // Sort by relevance and limit results
    results.sort((a, b) => b.relevance - a.relevance);
    const limitedResults = results.slice(0, resultLimit);

    // Count results by category
    const categoryCounts = limitedResults.reduce((acc, result) => {
      acc[result.category] = (acc[result.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const response: SearchResponse = {
      query: q as string,
      results: limitedResults,
      totalResults: limitedResults.length,
      categories: categoryCounts
    };

    // Cache the results
    searchCache.set(cacheKey, { data: response, timestamp: Date.now() });

    // Clean old cache entries
    if (searchCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of searchCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          searchCache.delete(key);
        }
      }
    }

    // Edge cache for 1 day, stale for 1 week (search results are stable)
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json(response);
  } catch (error) {
    logger.error('[Global Search] Error:', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to search Pokemon
async function searchPokemon(query: string, limit: number): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  // Common Pokemon for demo - in production this would query the API
  const commonPokemon = [
    { id: '1', name: 'bulbasaur', types: ['grass', 'poison'] },
    { id: '2', name: 'ivysaur', types: ['grass', 'poison'] },
    { id: '3', name: 'venusaur', types: ['grass', 'poison'] },
    { id: '4', name: 'charmander', types: ['fire'] },
    { id: '5', name: 'charmeleon', types: ['fire'] },
    { id: '6', name: 'charizard', types: ['fire', 'flying'] },
    { id: '7', name: 'squirtle', types: ['water'] },
    { id: '8', name: 'wartortle', types: ['water'] },
    { id: '9', name: 'blastoise', types: ['water'] },
    { id: '25', name: 'pikachu', types: ['electric'] },
    { id: '133', name: 'eevee', types: ['normal'] },
    { id: '150', name: 'mewtwo', types: ['psychic'] },
    { id: '151', name: 'mew', types: ['psychic'] }
  ];

  for (const pokemon of commonPokemon) {
    if (pokemon.name.includes(query)) {
      const relevance = pokemon.name.startsWith(query) ? 1.0 : 0.7;
      results.push({
        category: 'pokemon',
        id: pokemon.id,
        name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
        description: `Type: ${pokemon.types.join(', ')}`,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
        url: `/pokedex/${pokemon.id}`,
        relevance
      });
    }
    if (results.length >= limit) break;
  }

  return results;
}

// Helper function to search TCG Cards
async function searchTCGCards(query: string, limit: number, baseUrl: string): Promise<SearchResult[]> {
  try {
    // Use 'name' parameter to match the API endpoint (uses Supabase first, fallback to TCGDex)
    const response = await fetchJSON<TCGApiResponse<unknown[]>>(
      `${baseUrl}/api/tcg-cards?name=${encodeURIComponent(query)}&pageSize=${limit}`
    );
    
    if (!response?.data) return [];

    return response.data
      .filter(isTCGCard)
      .map((card) => ({
        category: 'card' as const,
        id: card.id,
        name: card.name,
        description: `${card.set?.name || 'Unknown Set'} - ${card.rarity || 'Common'}`,
        image: card.images?.small,
        url: `/tcgexpansions/${card.set?.id}#${card.id}`,
        relevance: card.name.toLowerCase().startsWith(query) ? 0.9 : 0.6
      }));
  } catch (error) {
    logger.error('[Global Search] TCG card search error:', { error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

// Helper function to search TCG Sets
async function searchTCGSets(query: string, limit: number, baseUrl: string): Promise<SearchResult[]> {
  try {
    const response = await fetchJSON<TCGApiResponse<unknown[]>>(`${baseUrl}/api/tcgexpansions?pageSize=100`);
    
    if (!response?.data) return [];

    const validSets = response.data.filter(isTCGSet);
    const results: SearchResult[] = [];
    
    for (const set of validSets) {
      if (set.name.toLowerCase().includes(query) || set.series?.toLowerCase().includes(query)) {
        results.push({
          category: 'set' as const,
          id: set.id,
          name: set.name,
          description: `${set.series || 'Unknown Series'} - ${set.total || 0} cards`,
          image: set.images?.logo,
          url: `/tcgexpansions/${set.id}`,
          relevance: set.name.toLowerCase().startsWith(query) ? 0.8 : 0.5
        });
        if (results.length >= limit) break;
      }
    }

    return results;
  } catch (error) {
    logger.error('[Global Search] TCG set search error:', { error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}