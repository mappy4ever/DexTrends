// pages/api/types/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PokemonManager } from '../../../lib/supabase';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';

interface TypeItem {
  id: number;
  name: string;
  displayName: string;
  damage_relations: {
    double_damage_from: string[];
    double_damage_to: string[];
    half_damage_from: string[];
    half_damage_to: string[];
    no_damage_from: string[];
    no_damage_to: string[];
  };
  pokemon_count: number;
  move_count: number;
}

interface TypesListResponse {
  types: TypeItem[];
  total: number;
  source: string;
}

// Convert slug to display name
function formatDisplayName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TypesListResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Fetching types list');

    // Try Supabase first
    const supabaseTypes = await PokemonManager.getAllTypes();

    if (supabaseTypes && supabaseTypes.length > 0) {
      const typesList: TypeItem[] = supabaseTypes.map(t => {
        // Cast to typed object
        const type = t as {
          id: number;
          name: string;
          damage_relations?: {
            double_damage_from?: Array<{ name: string }>;
            double_damage_to?: Array<{ name: string }>;
            half_damage_from?: Array<{ name: string }>;
            half_damage_to?: Array<{ name: string }>;
            no_damage_from?: Array<{ name: string }>;
            no_damage_to?: Array<{ name: string }>;
          };
          pokemon?: unknown[];
          moves?: unknown[];
        };

        return {
          id: type.id,
          name: type.name,
          displayName: formatDisplayName(type.name),
          damage_relations: {
            double_damage_from: type.damage_relations?.double_damage_from?.map(d => d.name) || [],
            double_damage_to: type.damage_relations?.double_damage_to?.map(d => d.name) || [],
            half_damage_from: type.damage_relations?.half_damage_from?.map(d => d.name) || [],
            half_damage_to: type.damage_relations?.half_damage_to?.map(d => d.name) || [],
            no_damage_from: type.damage_relations?.no_damage_from?.map(d => d.name) || [],
            no_damage_to: type.damage_relations?.no_damage_to?.map(d => d.name) || []
          },
          pokemon_count: Array.isArray(type.pokemon) ? type.pokemon.length : 0,
          move_count: Array.isArray(type.moves) ? type.moves.length : 0
        };
      });

      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
      res.setHeader('X-Data-Source', 'supabase');
      return res.status(200).json({
        types: typesList,
        total: typesList.length,
        source: 'supabase'
      });
    }

    logger.debug('Supabase returned no types, falling back to PokeAPI');

    // Fallback to PokeAPI
    const pokeApiUrl = 'https://pokeapi.co/api/v2/type?limit=20';
    const pokeApiData = await fetchJSON<{
      count: number;
      results: Array<{ name: string; url: string }>;
    }>(pokeApiUrl, {
      cacheTime: 86400000, // 24 hours
      timeout: 15000,
      retries: 2
    });

    if (!pokeApiData || !pokeApiData.results) {
      return res.status(500).json({ error: 'Failed to fetch types data' });
    }

    // Fetch details for all types (only 18-20 types)
    const typeDetails = await Promise.all(
      pokeApiData.results.map(async (type) => {
        try {
          const details = await fetchJSON<{
            id: number;
            name: string;
            damage_relations: {
              double_damage_from: Array<{ name: string }>;
              double_damage_to: Array<{ name: string }>;
              half_damage_from: Array<{ name: string }>;
              half_damage_to: Array<{ name: string }>;
              no_damage_from: Array<{ name: string }>;
              no_damage_to: Array<{ name: string }>;
            };
            pokemon: Array<{ pokemon: { name: string } }>;
            moves: Array<{ name: string }>;
          }>(type.url, {
            cacheTime: 86400000,
            timeout: 10000
          });

          return {
            id: details?.id || 0,
            name: details?.name || type.name,
            displayName: formatDisplayName(details?.name || type.name),
            damage_relations: {
              double_damage_from: details?.damage_relations?.double_damage_from?.map(d => d.name) || [],
              double_damage_to: details?.damage_relations?.double_damage_to?.map(d => d.name) || [],
              half_damage_from: details?.damage_relations?.half_damage_from?.map(d => d.name) || [],
              half_damage_to: details?.damage_relations?.half_damage_to?.map(d => d.name) || [],
              no_damage_from: details?.damage_relations?.no_damage_from?.map(d => d.name) || [],
              no_damage_to: details?.damage_relations?.no_damage_to?.map(d => d.name) || []
            },
            pokemon_count: details?.pokemon?.length || 0,
            move_count: details?.moves?.length || 0
          };
        } catch {
          return {
            id: 0,
            name: type.name,
            displayName: formatDisplayName(type.name),
            damage_relations: {
              double_damage_from: [],
              double_damage_to: [],
              half_damage_from: [],
              half_damage_to: [],
              no_damage_from: [],
              no_damage_to: []
            },
            pokemon_count: 0,
            move_count: 0
          };
        }
      })
    );

    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('X-Data-Source', 'pokeapi');
    return res.status(200).json({
      types: typeDetails,
      total: typeDetails.length,
      source: 'pokeapi'
    });

  } catch (error) {
    logger.error('Failed to fetch types list', {
      error: error instanceof Error ? error.message : String(error)
    });
    return res.status(500).json({ error: 'Failed to fetch types data' });
  }
}
