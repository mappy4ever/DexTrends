// pages/api/natures/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PokemonManager } from '../../../lib/supabase';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';

interface NatureItem {
  id: number;
  name: string;
  displayName: string;
  increased_stat: string | null;
  decreased_stat: string | null;
  likes_flavor: string | null;
  hates_flavor: string | null;
  is_neutral: boolean;
}

interface NaturesListResponse {
  natures: NatureItem[];
  total: number;
  source: string;
}

// Convert slug to display name
function formatDisplayName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Convert stat slug to readable name
function formatStatName(stat: string | null): string | null {
  if (!stat) return null;
  const statMap: Record<string, string> = {
    'attack': 'Attack',
    'defense': 'Defense',
    'special-attack': 'Sp. Attack',
    'special-defense': 'Sp. Defense',
    'speed': 'Speed'
  };
  return statMap[stat] || stat;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NaturesListResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Fetching natures list');

    // Try Supabase first
    const supabaseNatures = await PokemonManager.getAllNatures();

    if (supabaseNatures && supabaseNatures.length > 0) {
      const naturesList: NatureItem[] = supabaseNatures.map(n => {
        // Cast to typed object
        const nature = n as {
          id: number;
          name: string;
          increased_stat?: string | null;
          decreased_stat?: string | null;
          likes_flavor?: string | null;
          hates_flavor?: string | null;
        };

        return {
          id: nature.id,
          name: nature.name,
          displayName: formatDisplayName(nature.name),
          increased_stat: formatStatName(nature.increased_stat || null),
          decreased_stat: formatStatName(nature.decreased_stat || null),
          likes_flavor: nature.likes_flavor || null,
          hates_flavor: nature.hates_flavor || null,
          is_neutral: !nature.increased_stat || !nature.decreased_stat || nature.increased_stat === nature.decreased_stat
        };
      });

      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
      res.setHeader('X-Data-Source', 'supabase');
      return res.status(200).json({
        natures: naturesList,
        total: naturesList.length,
        source: 'supabase'
      });
    }

    logger.debug('Supabase returned no natures, falling back to PokeAPI');

    // Fallback to PokeAPI
    const pokeApiUrl = 'https://pokeapi.co/api/v2/nature?limit=25';
    const pokeApiData = await fetchJSON<{
      count: number;
      results: Array<{ name: string; url: string }>;
    }>(pokeApiUrl, {
      cacheTime: 86400000, // 24 hours
      timeout: 15000,
      retries: 2
    });

    if (!pokeApiData || !pokeApiData.results) {
      return res.status(500).json({ error: 'Failed to fetch natures data' });
    }

    // Fetch details for all natures (only 25 natures)
    const natureDetails = await Promise.all(
      pokeApiData.results.map(async (nature) => {
        try {
          const details = await fetchJSON<{
            id: number;
            name: string;
            increased_stat: { name: string } | null;
            decreased_stat: { name: string } | null;
            likes_flavor: { name: string } | null;
            hates_flavor: { name: string } | null;
          }>(nature.url, {
            cacheTime: 86400000,
            timeout: 10000
          });

          return {
            id: details?.id || 0,
            name: details?.name || nature.name,
            displayName: formatDisplayName(details?.name || nature.name),
            increased_stat: formatStatName(details?.increased_stat?.name || null),
            decreased_stat: formatStatName(details?.decreased_stat?.name || null),
            likes_flavor: details?.likes_flavor?.name || null,
            hates_flavor: details?.hates_flavor?.name || null,
            is_neutral: !details?.increased_stat || !details?.decreased_stat ||
              details.increased_stat.name === details.decreased_stat.name
          };
        } catch {
          return {
            id: 0,
            name: nature.name,
            displayName: formatDisplayName(nature.name),
            increased_stat: null,
            decreased_stat: null,
            likes_flavor: null,
            hates_flavor: null,
            is_neutral: true
          };
        }
      })
    );

    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('X-Data-Source', 'pokeapi');
    return res.status(200).json({
      natures: natureDetails,
      total: natureDetails.length,
      source: 'pokeapi'
    });

  } catch (error) {
    logger.error('Failed to fetch natures list', {
      error: error instanceof Error ? error.message : String(error)
    });
    return res.status(500).json({ error: 'Failed to fetch natures data' });
  }
}
