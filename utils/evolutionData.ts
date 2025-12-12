/**
 * Evolution Data Utilities
 *
 * Fetches evolution chain data from Supabase with fallback to hardcoded values.
 * This allows gradual migration from PokeAPI to Supabase.
 */

import { supabase } from '@/lib/supabase';
import logger from './logger';

// Types
export interface RegionalExclusiveEvolution {
  evolution_species_name: string;
  evolution_species_id: number | null;
  required_region: string;
  pre_evolution_species_name: string;
  pre_evolution_species_id: number | null;
  notes: string | null;
}

export interface BaseFormNoEvolution {
  species_name: string;
  species_id: number | null;
  notes: string | null;
}

export interface PokemonClassification {
  pokemon_id: number;
  species_name: string;
  classification: string;
  notes: string | null;
}

export interface PokemonForm {
  pokemon_id: number;
  species_id: number;
  form_name: string;
  base_species_name: string;
  form_type: string | null;
  region: string | null;
  is_default: boolean;
  is_mega: boolean;
  is_gmax: boolean;
  types: string[];
}

export interface EvolutionChainNode {
  species_name: string;
  species_id: number;
  evolution_details: Array<{
    trigger: string;
    item?: string;
    min_level?: number;
    min_happiness?: number;
    time_of_day?: string;
    location?: string;
    held_item?: string;
    known_move?: string;
  }>;
  evolves_to: EvolutionChainNode[];
}

// Hardcoded fallbacks (used if Supabase data isn't available)
const FALLBACK_REGIONAL_EXCLUSIVE: Record<string, string> = {
  'sirfetchd': 'galar',
  'perrserker': 'galar',
  'mr-rime': 'galar',
  'cursola': 'galar',
  'obstagoon': 'galar',
  'runerigus': 'galar',
  'sneasler': 'hisui',
  'overqwil': 'hisui',
  'basculegion': 'hisui',
};

const FALLBACK_BASE_NO_EVOLUTION: Set<string> = new Set([
  'farfetchd',
  'corsola',
]);

// Cache for Supabase data
let regionalExclusiveCache: Map<string, RegionalExclusiveEvolution> | null = null;
let baseNoEvolutionCache: Set<string> | null = null;
let classificationsCache: Map<number, PokemonClassification[]> | null = null;

/**
 * Load regional exclusive evolutions from Supabase
 */
export async function loadRegionalExclusiveEvolutions(): Promise<Map<string, RegionalExclusiveEvolution>> {
  if (regionalExclusiveCache) return regionalExclusiveCache;

  try {
    const { data, error } = await supabase
      .from('regional_exclusive_evolutions')
      .select('*');

    if (error) {
      logger.warn('Failed to load regional exclusive evolutions from Supabase:', { error: error.message });
      // Return fallback as map
      regionalExclusiveCache = new Map(
        Object.entries(FALLBACK_REGIONAL_EXCLUSIVE).map(([name, region]) => [
          name,
          {
            evolution_species_name: name,
            evolution_species_id: null,
            required_region: region,
            pre_evolution_species_name: '',
            pre_evolution_species_id: null,
            notes: null,
          },
        ])
      );
      return regionalExclusiveCache;
    }

    regionalExclusiveCache = new Map(
      (data || []).map(row => [row.evolution_species_name, row])
    );
    return regionalExclusiveCache;
  } catch (err) {
    logger.error('Error loading regional exclusive evolutions:', { error: err });
    // Return fallback
    regionalExclusiveCache = new Map(
      Object.entries(FALLBACK_REGIONAL_EXCLUSIVE).map(([name, region]) => [
        name,
        {
          evolution_species_name: name,
          evolution_species_id: null,
          required_region: region,
          pre_evolution_species_name: '',
          pre_evolution_species_id: null,
          notes: null,
        },
      ])
    );
    return regionalExclusiveCache;
  }
}

/**
 * Load base forms that don't evolve from Supabase
 */
export async function loadBaseFormsNoEvolution(): Promise<Set<string>> {
  if (baseNoEvolutionCache) return baseNoEvolutionCache;

  try {
    const { data, error } = await supabase
      .from('base_form_no_evolution')
      .select('species_name');

    if (error) {
      logger.warn('Failed to load base form no evolution from Supabase:', { error: error.message });
      baseNoEvolutionCache = FALLBACK_BASE_NO_EVOLUTION;
      return baseNoEvolutionCache;
    }

    baseNoEvolutionCache = new Set((data || []).map(row => row.species_name));
    return baseNoEvolutionCache;
  } catch (err) {
    logger.error('Error loading base form no evolution:', { error: err });
    baseNoEvolutionCache = FALLBACK_BASE_NO_EVOLUTION;
    return baseNoEvolutionCache;
  }
}

/**
 * Check if an evolution is regional-exclusive
 */
export async function isRegionalExclusiveEvolution(evolutionName: string): Promise<{
  isExclusive: boolean;
  requiredRegion: string | null;
  preEvolution: string | null;
}> {
  const cache = await loadRegionalExclusiveEvolutions();
  const data = cache.get(evolutionName);

  if (data) {
    return {
      isExclusive: true,
      requiredRegion: data.required_region,
      preEvolution: data.pre_evolution_species_name,
    };
  }

  return {
    isExclusive: false,
    requiredRegion: null,
    preEvolution: null,
  };
}

/**
 * Check if base form doesn't evolve
 */
export async function baseFormHasNoEvolution(speciesName: string): Promise<boolean> {
  const cache = await loadBaseFormsNoEvolution();
  return cache.has(speciesName);
}

/**
 * Get required regional suffix for an evolution (-galar, -hisui, etc.)
 * Returns null if not regional-exclusive
 */
export async function getRequiredRegionalSuffix(evolutionName: string): Promise<string | null> {
  const cache = await loadRegionalExclusiveEvolutions();
  const data = cache.get(evolutionName);
  return data ? `-${data.required_region}` : null;
}

/**
 * Load Pokemon classifications (Ultra Beast, Paradox, etc.)
 */
export async function loadPokemonClassifications(): Promise<Map<number, PokemonClassification[]>> {
  if (classificationsCache) return classificationsCache;

  try {
    const { data, error } = await supabase
      .from('pokemon_classifications')
      .select('*')
      .order('pokemon_id');

    if (error) {
      logger.warn('Failed to load Pokemon classifications from Supabase:', { error: error.message });
      classificationsCache = new Map();
      return classificationsCache;
    }

    // Group by pokemon_id
    classificationsCache = new Map();
    for (const row of data || []) {
      const existing = classificationsCache.get(row.pokemon_id) || [];
      existing.push(row);
      classificationsCache.set(row.pokemon_id, existing);
    }
    return classificationsCache;
  } catch (err) {
    logger.error('Error loading Pokemon classifications:', { error: err });
    classificationsCache = new Map();
    return classificationsCache;
  }
}

/**
 * Get classifications for a specific Pokemon
 */
export async function getPokemonClassifications(pokemonId: number): Promise<string[]> {
  const cache = await loadPokemonClassifications();
  const classifications = cache.get(pokemonId) || [];
  return classifications.map(c => c.classification);
}

/**
 * Check if Pokemon is an Ultra Beast
 */
export async function isUltraBeast(pokemonId: number): Promise<boolean> {
  const classifications = await getPokemonClassifications(pokemonId);
  return classifications.includes('ultra_beast');
}

/**
 * Check if Pokemon is a Paradox Pokemon
 */
export async function isParadoxPokemon(pokemonId: number): Promise<boolean> {
  const classifications = await getPokemonClassifications(pokemonId);
  return classifications.includes('paradox_past') || classifications.includes('paradox_future');
}

/**
 * Get Paradox type (past or future)
 */
export async function getParadoxType(pokemonId: number): Promise<'past' | 'future' | null> {
  const classifications = await getPokemonClassifications(pokemonId);
  if (classifications.includes('paradox_past')) return 'past';
  if (classifications.includes('paradox_future')) return 'future';
  return null;
}

/**
 * Get evolution chain from Supabase
 */
export async function getEvolutionChain(chainId: number): Promise<EvolutionChainNode | null> {
  try {
    const { data, error } = await supabase
      .from('evolution_chains')
      .select('chain')
      .eq('id', chainId)
      .single();

    if (error || !data) {
      logger.debug('Evolution chain not found in Supabase:', { chainId, error: error?.message });
      return null;
    }

    return data.chain as EvolutionChainNode;
  } catch (err) {
    logger.error('Error fetching evolution chain:', { chainId, error: err });
    return null;
  }
}

/**
 * Get all forms for a species
 */
export async function getPokemonForms(speciesName: string): Promise<PokemonForm[]> {
  try {
    const { data, error } = await supabase
      .from('pokemon_forms')
      .select('pokemon_id, species_id, form_name, base_species_name, form_type, region, is_default, is_mega, is_gmax, types')
      .eq('base_species_name', speciesName)
      .order('is_default', { ascending: false });

    if (error) {
      logger.warn('Failed to load Pokemon forms from Supabase:', { speciesName, error: error.message });
      return [];
    }

    return data || [];
  } catch (err) {
    logger.error('Error fetching Pokemon forms:', { speciesName, error: err });
    return [];
  }
}

/**
 * Clear all caches (useful for testing or forcing refresh)
 */
export function clearEvolutionDataCache(): void {
  regionalExclusiveCache = null;
  baseNoEvolutionCache = null;
  classificationsCache = null;
}

/**
 * Preload all evolution data into cache
 * Call this on app startup for better performance
 */
export async function preloadEvolutionData(): Promise<void> {
  await Promise.all([
    loadRegionalExclusiveEvolutions(),
    loadBaseFormsNoEvolution(),
    loadPokemonClassifications(),
  ]);
  logger.debug('Evolution data preloaded into cache');
}
