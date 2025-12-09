// pages/api/pokemon/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PokemonManager } from '../../../lib/supabase';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';

interface PokemonDetailResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: string[];
  abilities: Array<{
    name: string;
    is_hidden: boolean;
  }>;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
    total: number;
  };
  sprites: {
    front_default: string;
    front_shiny: string;
    back_default: string;
    back_shiny: string;
    artwork: string;
  };
  cries?: {
    latest: string;
    legacy: string;
  };
  species?: {
    id: number;
    name: string;
    is_legendary: boolean;
    is_mythical: boolean;
    is_baby: boolean;
    gender_rate: number;
    capture_rate: number;
    base_happiness: number;
    growth_rate: string;
    color: string;
    shape: string;
    habitat: string;
    generation: string;
    egg_groups: string[];
    flavor_text: string;
    genus: string;
    evolution_chain_id: number;
    evolves_from_species_id: number | null;
  };
  source: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PokemonDetailResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const pokemonId = typeof id === 'string' ? id : id?.[0];

  if (!pokemonId) {
    return res.status(400).json({ error: 'Pokemon ID is required' });
  }

  try {
    logger.info('Fetching Pokemon details', { id: pokemonId });

    // Determine if ID is numeric or name
    const numericId = parseInt(pokemonId, 10);
    const isNumeric = !isNaN(numericId);

    // Try Supabase first
    const supabasePokemon = isNumeric
      ? await PokemonManager.getPokemonById(numericId)
      : await PokemonManager.getPokemonByName(pokemonId);

    if (supabasePokemon) {
      // Cast to typed object for easier access
      const p = supabasePokemon as {
        id: number;
        name: string;
        height?: number;
        weight?: number;
        base_experience?: number;
        types?: Array<{ type?: { name: string } } | string>;
        abilities?: Array<{ ability?: { name: string }; is_hidden?: boolean } | string>;
        stats?: Record<string, number>;
        sprites?: {
          front_default?: string;
          front_shiny?: string;
          back_default?: string;
          back_shiny?: string;
          other?: { 'official-artwork'?: { front_default?: string } };
        };
        cries?: { latest?: string; legacy?: string };
      };

      // Get species data
      const speciesData = await PokemonManager.getSpeciesById(p.id);

      const response: PokemonDetailResponse = {
        id: p.id,
        name: p.name,
        height: p.height || 0,
        weight: p.weight || 0,
        base_experience: p.base_experience || 0,
        types: Array.isArray(p.types)
          ? p.types.map((t) =>
              typeof t === 'string' ? t : t.type?.name || ''
            ).filter(Boolean)
          : [],
        abilities: Array.isArray(p.abilities)
          ? p.abilities.map((a) =>
              typeof a === 'string'
                ? { name: a, is_hidden: false }
                : { name: a.ability?.name || '', is_hidden: a.is_hidden || false }
            )
          : [],
        stats: {
          hp: p.stats?.hp || 0,
          attack: p.stats?.attack || 0,
          defense: p.stats?.defense || 0,
          specialAttack: p.stats?.['special-attack'] || 0,
          specialDefense: p.stats?.['special-defense'] || 0,
          speed: p.stats?.speed || 0,
          total: Object.values(p.stats || {}).reduce((sum: number, val) =>
            sum + (typeof val === 'number' ? val : 0), 0
          )
        },
        sprites: {
          front_default: p.sprites?.front_default ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`,
          front_shiny: p.sprites?.front_shiny ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${p.id}.png`,
          back_default: p.sprites?.back_default || '',
          back_shiny: p.sprites?.back_shiny || '',
          artwork: p.sprites?.other?.['official-artwork']?.front_default ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`
        },
        cries: p.cries ? {
          latest: p.cries.latest || '',
          legacy: p.cries.legacy || ''
        } : undefined,
        source: 'supabase'
      };

      // Add species data if available
      if (speciesData) {
        // Cast species data to typed object
        const s = speciesData as {
          id: number;
          name: string;
          is_legendary?: boolean;
          is_mythical?: boolean;
          is_baby?: boolean;
          gender_rate?: number;
          capture_rate?: number;
          base_happiness?: number;
          growth_rate?: string;
          color?: string;
          shape?: string;
          habitat?: string;
          generation?: string;
          egg_groups?: string[];
          flavor_text_entries?: Array<{ language?: { name: string }; flavor_text?: string }>;
          genera?: Array<{ language?: { name: string }; genus?: string }>;
          evolution_chain_id?: number;
          evolves_from_species_id?: number | null;
        };

        const englishFlavorText = Array.isArray(s.flavor_text_entries)
          ? s.flavor_text_entries.find(
              (f) => f.language?.name === 'en'
            )?.flavor_text?.replace(/[\n\f]/g, ' ')
          : '';

        const englishGenus = Array.isArray(s.genera)
          ? s.genera.find(
              (g) => g.language?.name === 'en'
            )?.genus
          : '';

        response.species = {
          id: s.id,
          name: s.name,
          is_legendary: s.is_legendary || false,
          is_mythical: s.is_mythical || false,
          is_baby: s.is_baby || false,
          gender_rate: s.gender_rate ?? -1,
          capture_rate: s.capture_rate || 0,
          base_happiness: s.base_happiness || 0,
          growth_rate: s.growth_rate || '',
          color: s.color || '',
          shape: s.shape || '',
          habitat: s.habitat || '',
          generation: s.generation || '',
          egg_groups: Array.isArray(s.egg_groups) ? s.egg_groups : [],
          flavor_text: englishFlavorText || '',
          genus: englishGenus || '',
          evolution_chain_id: s.evolution_chain_id || 0,
          evolves_from_species_id: s.evolves_from_species_id || null
        };
      }

      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
      res.setHeader('X-Data-Source', 'supabase');
      return res.status(200).json(response);
    }

    logger.debug('Supabase returned no Pokemon, falling back to PokeAPI', { id: pokemonId });

    // Fallback to PokeAPI
    const pokeApiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
    const pokemonData = await fetchJSON<{
      id: number;
      name: string;
      height: number;
      weight: number;
      base_experience: number;
      types: Array<{ type: { name: string } }>;
      abilities: Array<{ ability: { name: string }; is_hidden: boolean }>;
      stats: Array<{ base_stat: number; stat: { name: string } }>;
      sprites: {
        front_default: string;
        front_shiny: string;
        back_default: string;
        back_shiny: string;
        other: { 'official-artwork': { front_default: string } };
      };
      cries: { latest: string; legacy: string };
    }>(pokeApiUrl, {
      cacheTime: 86400000, // 24 hours
      timeout: 15000,
      retries: 2
    });

    if (!pokemonData) {
      return res.status(404).json({ error: 'Pokemon not found' });
    }

    // Parse stats
    const statsMap: Record<string, number> = {};
    pokemonData.stats.forEach(s => {
      statsMap[s.stat.name] = s.base_stat;
    });

    const response: PokemonDetailResponse = {
      id: pokemonData.id,
      name: pokemonData.name,
      height: pokemonData.height,
      weight: pokemonData.weight,
      base_experience: pokemonData.base_experience,
      types: pokemonData.types.map(t => t.type.name),
      abilities: pokemonData.abilities.map(a => ({
        name: a.ability.name,
        is_hidden: a.is_hidden
      })),
      stats: {
        hp: statsMap.hp || 0,
        attack: statsMap.attack || 0,
        defense: statsMap.defense || 0,
        specialAttack: statsMap['special-attack'] || 0,
        specialDefense: statsMap['special-defense'] || 0,
        speed: statsMap.speed || 0,
        total: Object.values(statsMap).reduce((sum, val) => sum + val, 0)
      },
      sprites: {
        front_default: pokemonData.sprites.front_default,
        front_shiny: pokemonData.sprites.front_shiny,
        back_default: pokemonData.sprites.back_default || '',
        back_shiny: pokemonData.sprites.back_shiny || '',
        artwork: pokemonData.sprites.other?.['official-artwork']?.front_default ||
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonData.id}.png`
      },
      cries: pokemonData.cries ? {
        latest: pokemonData.cries.latest,
        legacy: pokemonData.cries.legacy
      } : undefined,
      source: 'pokeapi'
    };

    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('X-Data-Source', 'pokeapi');
    return res.status(200).json(response);

  } catch (error) {
    logger.error('Failed to fetch Pokemon details', {
      id: pokemonId,
      error: error instanceof Error ? error.message : String(error)
    });
    return res.status(500).json({ error: 'Failed to fetch Pokemon data' });
  }
}
