// pages/api/pokemon/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PokemonManager } from '../../../lib/supabase';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';

interface PokemonListItem {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  stats?: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
}

interface PokemonListResponse {
  pokemon: PokemonListItem[];
  total: number;
  page: number;
  pageSize: number;
  source: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PokemonListResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      page = '1',
      pageSize = '50',
      search,
      type,
      generation,
      legendary,
      mythical
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize as string, 10) || 50));
    const offset = (pageNum - 1) * pageSizeNum;

    logger.info('Fetching Pokemon list', {
      page: pageNum,
      pageSize: pageSizeNum,
      search,
      type,
      generation
    });

    // Try Supabase first
    const supabasePokemon = await PokemonManager.getPokemonList(pageSizeNum, offset, {
      search: search as string,
      type: type as string,
      generation: generation as string
    });

    if (supabasePokemon && supabasePokemon.length > 0) {
      const pokemonList: PokemonListItem[] = supabasePokemon.map(p => {
        // Cast to typed object
        const pokemon = p as {
          id: number;
          name: string;
          types?: Array<{ type?: { name: string } } | string>;
          sprites?: { front_default?: string };
          stats?: Record<string, number>;
        };

        return {
          id: pokemon.id,
          name: pokemon.name,
          types: Array.isArray(pokemon.types) ? pokemon.types.map(t =>
            typeof t === 'string' ? t : t.type?.name || ''
          ).filter(Boolean) : [],
          sprite: pokemon.sprites?.front_default ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
          stats: pokemon.stats ? {
            hp: pokemon.stats.hp || 0,
            attack: pokemon.stats.attack || 0,
            defense: pokemon.stats.defense || 0,
            specialAttack: pokemon.stats['special-attack'] || 0,
            specialDefense: pokemon.stats['special-defense'] || 0,
            speed: pokemon.stats.speed || 0
          } : undefined
        };
      });

      // Get total count for pagination
      const totalCount = await PokemonManager.getPokemonCount({
        search: search as string,
        type: type as string,
        generation: generation as string
      });

      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      res.setHeader('X-Data-Source', 'supabase');
      return res.status(200).json({
        pokemon: pokemonList,
        total: totalCount,
        page: pageNum,
        pageSize: pageSizeNum,
        source: 'supabase'
      });
    }

    logger.debug('Supabase returned no Pokemon, falling back to PokeAPI');

    // Fallback to PokeAPI - get list only, no individual requests (avoids N+1)
    const pokeApiUrl = `https://pokeapi.co/api/v2/pokemon?limit=${pageSizeNum}&offset=${offset}`;
    const pokeApiData = await fetchJSON<{
      count: number;
      results: Array<{ name: string; url: string }>;
    }>(pokeApiUrl, {
      cacheTime: 3600000, // 1 hour
      timeout: 15000,
      retries: 2
    });

    if (!pokeApiData || !pokeApiData.results) {
      return res.status(500).json({ error: 'Failed to fetch Pokemon data' });
    }

    // Build Pokemon list from the list endpoint directly (no N+1 individual requests)
    // We construct sprite URLs from the ID - types won't be available in fallback mode
    const pokemonDetails = pokeApiData.results.map((pokemon, index) => {
      // Extract ID from URL (format: https://pokeapi.co/api/v2/pokemon/25/)
      const urlParts = pokemon.url.split('/').filter(Boolean);
      const id = parseInt(urlParts[urlParts.length - 1], 10) || (offset + index + 1);

      return {
        id,
        name: pokemon.name,
        types: [], // Types not available without individual API calls - Supabase should be used
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
      };
    });

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Data-Source', 'pokeapi');
    return res.status(200).json({
      pokemon: pokemonDetails,
      total: pokeApiData.count,
      page: pageNum,
      pageSize: pageSizeNum,
      source: 'pokeapi'
    });

  } catch (error) {
    logger.error('Failed to fetch Pokemon list', {
      error: error instanceof Error ? error.message : String(error)
    });
    return res.status(500).json({ error: 'Failed to fetch Pokemon data' });
  }
}
