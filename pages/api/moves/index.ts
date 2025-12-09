// pages/api/moves/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PokemonManager } from '../../../lib/supabase';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';

interface MoveListItem {
  id: number;
  name: string;
  displayName: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  damage_class: string;
  effect: string;
  short_effect: string;
  target: string;
}

interface MovesListResponse {
  moves: MoveListItem[];
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
  res: NextApiResponse<MovesListResponse | { error: string }>
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
      damage_class
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize as string, 10) || 50));
    const offset = (pageNum - 1) * pageSizeNum;

    logger.info('Fetching moves list', {
      page: pageNum,
      pageSize: pageSizeNum,
      search,
      type,
      damage_class
    });

    // Try Supabase first
    const supabaseMoves = await PokemonManager.getMovesList(pageSizeNum, offset, {
      search: search as string,
      type: type as string,
      damageClass: damage_class as string
    });

    if (supabaseMoves && supabaseMoves.length > 0) {
      const movesList: MoveListItem[] = supabaseMoves.map(m => {
        // Cast to typed object
        const move = m as {
          id: number;
          name: string;
          type?: string;
          power?: number | null;
          accuracy?: number | null;
          pp?: number | null;
          priority?: number;
          damage_class?: string;
          target?: string;
          effect_entries?: Array<{
            language?: { name: string };
            effect?: string;
            short_effect?: string;
          }>;
        };

        // Get English effect text
        const englishEffect = Array.isArray(move.effect_entries)
          ? move.effect_entries.find(e => e.language?.name === 'en')
          : null;

        return {
          id: move.id,
          name: move.name,
          displayName: formatDisplayName(move.name),
          type: move.type || 'normal',
          power: move.power ?? null,
          accuracy: move.accuracy ?? null,
          pp: move.pp ?? null,
          priority: move.priority || 0,
          damage_class: move.damage_class || 'status',
          effect: englishEffect?.effect || '',
          short_effect: englishEffect?.short_effect || '',
          target: move.target || ''
        };
      });

      // Get total count for pagination
      const totalCount = await PokemonManager.getMovesCount({
        search: search as string,
        type: type as string,
        damageClass: damage_class as string
      });

      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      res.setHeader('X-Data-Source', 'supabase');
      return res.status(200).json({
        moves: movesList,
        total: totalCount,
        page: pageNum,
        pageSize: pageSizeNum,
        source: 'supabase'
      });
    }

    logger.debug('Supabase returned no moves, falling back to PokeAPI');

    // Fallback to PokeAPI
    const pokeApiUrl = `https://pokeapi.co/api/v2/move?limit=${pageSizeNum}&offset=${offset}`;
    const pokeApiData = await fetchJSON<{
      count: number;
      results: Array<{ name: string; url: string }>;
    }>(pokeApiUrl, {
      cacheTime: 3600000, // 1 hour
      timeout: 15000,
      retries: 2
    });

    if (!pokeApiData || !pokeApiData.results) {
      return res.status(500).json({ error: 'Failed to fetch moves data' });
    }

    // Fetch basic details for each move (parallel, limited)
    const moveDetails = await Promise.all(
      pokeApiData.results.slice(0, 20).map(async (move) => {
        try {
          const details = await fetchJSON<{
            id: number;
            name: string;
            type: { name: string };
            power: number | null;
            accuracy: number | null;
            pp: number;
            priority: number;
            damage_class: { name: string };
            effect_entries: Array<{
              language: { name: string };
              effect: string;
              short_effect: string;
            }>;
            target: { name: string };
          }>(move.url, {
            cacheTime: 86400000, // 24 hours
            timeout: 10000
          });

          const englishEffect = details?.effect_entries?.find(e => e.language?.name === 'en');

          return {
            id: details?.id || 0,
            name: details?.name || move.name,
            displayName: formatDisplayName(details?.name || move.name),
            type: details?.type?.name || 'normal',
            power: details?.power ?? null,
            accuracy: details?.accuracy ?? null,
            pp: details?.pp ?? null,
            priority: details?.priority || 0,
            damage_class: details?.damage_class?.name || 'status',
            effect: englishEffect?.effect || '',
            short_effect: englishEffect?.short_effect || '',
            target: details?.target?.name || ''
          };
        } catch {
          return {
            id: 0,
            name: move.name,
            displayName: formatDisplayName(move.name),
            type: 'normal',
            power: null,
            accuracy: null,
            pp: null,
            priority: 0,
            damage_class: 'status',
            effect: '',
            short_effect: '',
            target: ''
          };
        }
      })
    );

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Data-Source', 'pokeapi');
    return res.status(200).json({
      moves: moveDetails,
      total: pokeApiData.count,
      page: pageNum,
      pageSize: pageSizeNum,
      source: 'pokeapi'
    });

  } catch (error) {
    logger.error('Failed to fetch moves list', {
      error: error instanceof Error ? error.message : String(error)
    });
    return res.status(500).json({ error: 'Failed to fetch moves data' });
  }
}
