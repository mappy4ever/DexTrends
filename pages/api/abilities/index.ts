// pages/api/abilities/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PokemonManager } from '../../../lib/supabase';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';

interface AbilityListItem {
  id: number;
  name: string;
  displayName: string;
  effect: string;
  short_effect: string;
  generation: string;
  is_main_series: boolean;
  pokemon_count: number;
}

interface AbilitiesListResponse {
  abilities: AbilityListItem[];
  total: number;
  page: number;
  pageSize: number;
  source: string;
}

// Convert slug to display name
function formatDisplayName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AbilitiesListResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      page = '1',
      pageSize = '50',
      search
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize as string, 10) || 50));
    const offset = (pageNum - 1) * pageSizeNum;

    logger.info('Fetching abilities list', {
      page: pageNum,
      pageSize: pageSizeNum,
      search
    });

    // Try Supabase first
    const supabaseAbilities = await PokemonManager.getAbilitiesList(pageSizeNum, offset, {
      search: search as string
    });

    if (supabaseAbilities && supabaseAbilities.length > 0) {
      const abilitiesList: AbilityListItem[] = supabaseAbilities.map(a => {
        // Cast to typed object
        const ability = a as {
          id: number;
          name: string;
          generation?: string;
          is_main_series?: boolean;
          pokemon?: unknown[];
          effect_entries?: Array<{
            language?: { name: string };
            effect?: string;
            short_effect?: string;
          }>;
        };

        // Get English effect text
        const englishEffect = Array.isArray(ability.effect_entries)
          ? ability.effect_entries.find(e => e.language?.name === 'en')
          : null;

        return {
          id: ability.id,
          name: ability.name,
          displayName: formatDisplayName(ability.name),
          effect: englishEffect?.effect || '',
          short_effect: englishEffect?.short_effect || '',
          generation: ability.generation || '',
          is_main_series: ability.is_main_series !== false,
          pokemon_count: Array.isArray(ability.pokemon) ? ability.pokemon.length : 0
        };
      });

      // Get total count for pagination
      const totalCount = await PokemonManager.getAbilitiesCount({
        search: search as string
      });

      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      res.setHeader('X-Data-Source', 'supabase');
      return res.status(200).json({
        abilities: abilitiesList,
        total: totalCount,
        page: pageNum,
        pageSize: pageSizeNum,
        source: 'supabase'
      });
    }

    logger.debug('Supabase returned no abilities, falling back to PokeAPI');

    // Fallback to PokeAPI
    const pokeApiUrl = `https://pokeapi.co/api/v2/ability?limit=${pageSizeNum}&offset=${offset}`;
    const pokeApiData = await fetchJSON<{
      count: number;
      results: Array<{ name: string; url: string }>;
    }>(pokeApiUrl, {
      cacheTime: 3600000, // 1 hour
      timeout: 15000,
      retries: 2
    });

    if (!pokeApiData || !pokeApiData.results) {
      return res.status(500).json({ error: 'Failed to fetch abilities data' });
    }

    // Fetch details for first 20 abilities
    const abilityDetails = await Promise.all(
      pokeApiData.results.slice(0, 20).map(async (ability) => {
        try {
          const details = await fetchJSON<{
            id: number;
            name: string;
            effect_entries: Array<{
              language: { name: string };
              effect: string;
              short_effect: string;
            }>;
            generation: { name: string };
            is_main_series: boolean;
            pokemon: Array<{ pokemon: { name: string } }>;
          }>(ability.url, {
            cacheTime: 86400000,
            timeout: 10000
          });

          const englishEffect = details?.effect_entries?.find(e => e.language?.name === 'en');

          return {
            id: details?.id || 0,
            name: details?.name || ability.name,
            displayName: formatDisplayName(details?.name || ability.name),
            effect: englishEffect?.effect || '',
            short_effect: englishEffect?.short_effect || '',
            generation: details?.generation?.name || '',
            is_main_series: details?.is_main_series !== false,
            pokemon_count: details?.pokemon?.length || 0
          };
        } catch {
          return {
            id: 0,
            name: ability.name,
            displayName: formatDisplayName(ability.name),
            effect: '',
            short_effect: '',
            generation: '',
            is_main_series: true,
            pokemon_count: 0
          };
        }
      })
    );

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Data-Source', 'pokeapi');
    return res.status(200).json({
      abilities: abilityDetails,
      total: pokeApiData.count,
      page: pageNum,
      pageSize: pageSizeNum,
      source: 'pokeapi'
    });

  } catch (error) {
    logger.error('Failed to fetch abilities list', {
      error: error instanceof Error ? error.message : String(error)
    });
    return res.status(500).json({ error: 'Failed to fetch abilities data' });
  }
}
