// pages/api/berries/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PokemonManager } from '../../../lib/supabase';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';

interface BerryItem {
  id: number;
  name: string;
  displayName: string;
  growth_time: number;
  max_harvest: number;
  natural_gift_power: number;
  natural_gift_type: string;
  size: number;
  smoothness: number;
  soil_dryness: number;
  firmness: string;
  flavors: Array<{
    flavor: string;
    potency: number;
  }>;
}

interface BerriesListResponse {
  berries: BerryItem[];
  total: number;
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
  res: NextApiResponse<BerriesListResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { search } = req.query;

    logger.info('Fetching berries list', { search });

    // Try Supabase first
    const supabaseBerries = await PokemonManager.getAllBerries();

    if (supabaseBerries && supabaseBerries.length > 0) {
      let berriesList: BerryItem[] = supabaseBerries.map(b => {
        // Cast to typed object
        const berry = b as {
          id: number;
          name: string;
          growth_time?: number;
          max_harvest?: number;
          natural_gift_power?: number;
          natural_gift_type?: string;
          size?: number;
          smoothness?: number;
          soil_dryness?: number;
          firmness?: string;
          flavors?: Array<{ flavor?: { name: string }; potency?: number }>;
        };

        return {
          id: berry.id,
          name: berry.name,
          displayName: formatDisplayName(berry.name),
          growth_time: berry.growth_time || 0,
          max_harvest: berry.max_harvest || 0,
          natural_gift_power: berry.natural_gift_power || 0,
          natural_gift_type: berry.natural_gift_type || '',
          size: berry.size || 0,
          smoothness: berry.smoothness || 0,
          soil_dryness: berry.soil_dryness || 0,
          firmness: berry.firmness || '',
          flavors: Array.isArray(berry.flavors)
            ? berry.flavors.map(f => ({
                flavor: f.flavor?.name || '',
                potency: f.potency || 0
              }))
            : []
        };
      });

      // Apply search filter if provided
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        berriesList = berriesList.filter(b =>
          b.name.toLowerCase().includes(searchLower) ||
          b.displayName.toLowerCase().includes(searchLower)
        );
      }

      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
      res.setHeader('X-Data-Source', 'supabase');
      return res.status(200).json({
        berries: berriesList,
        total: berriesList.length,
        source: 'supabase'
      });
    }

    logger.debug('Supabase returned no berries, falling back to PokeAPI');

    // Fallback to PokeAPI
    const pokeApiUrl = 'https://pokeapi.co/api/v2/berry?limit=100';
    const pokeApiData = await fetchJSON<{
      count: number;
      results: Array<{ name: string; url: string }>;
    }>(pokeApiUrl, {
      cacheTime: 86400000, // 24 hours
      timeout: 15000,
      retries: 2
    });

    if (!pokeApiData || !pokeApiData.results) {
      return res.status(500).json({ error: 'Failed to fetch berries data' });
    }

    // Fetch details for all berries (about 64 berries)
    const berryDetails = await Promise.all(
      pokeApiData.results.map(async (berry) => {
        try {
          const details = await fetchJSON<{
            id: number;
            name: string;
            growth_time: number;
            max_harvest: number;
            natural_gift_power: number;
            natural_gift_type: { name: string };
            size: number;
            smoothness: number;
            soil_dryness: number;
            firmness: { name: string };
            flavors: Array<{
              flavor: { name: string };
              potency: number;
            }>;
          }>(berry.url, {
            cacheTime: 86400000,
            timeout: 10000
          });

          return {
            id: details?.id || 0,
            name: details?.name || berry.name,
            displayName: formatDisplayName(details?.name || berry.name),
            growth_time: details?.growth_time || 0,
            max_harvest: details?.max_harvest || 0,
            natural_gift_power: details?.natural_gift_power || 0,
            natural_gift_type: details?.natural_gift_type?.name || '',
            size: details?.size || 0,
            smoothness: details?.smoothness || 0,
            soil_dryness: details?.soil_dryness || 0,
            firmness: details?.firmness?.name || '',
            flavors: details?.flavors?.map(f => ({
              flavor: f.flavor?.name || '',
              potency: f.potency || 0
            })) || []
          };
        } catch {
          return {
            id: 0,
            name: berry.name,
            displayName: formatDisplayName(berry.name),
            growth_time: 0,
            max_harvest: 0,
            natural_gift_power: 0,
            natural_gift_type: '',
            size: 0,
            smoothness: 0,
            soil_dryness: 0,
            firmness: '',
            flavors: []
          };
        }
      })
    );

    // Apply search filter if provided
    let filteredBerries = berryDetails;
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filteredBerries = berryDetails.filter(b =>
        b.name.toLowerCase().includes(searchLower) ||
        b.displayName.toLowerCase().includes(searchLower)
      );
    }

    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('X-Data-Source', 'pokeapi');
    return res.status(200).json({
      berries: filteredBerries,
      total: filteredBerries.length,
      source: 'pokeapi'
    });

  } catch (error) {
    logger.error('Failed to fetch berries list', {
      error: error instanceof Error ? error.message : String(error)
    });
    return res.status(500).json({ error: 'Failed to fetch berries data' });
  }
}
