/**
 * Evolution tree utilities for Pokemon
 * Optimized and reusable across the application
 */

import { fetchData, sanitizePokemonName } from './apiutils';
import { extractIdFromUrl } from './pokemonutils';
import type { Pokemon, PokemonSpecies, EvolutionChain, EvolutionLink, EvolutionDetail } from '../types/api/pokemon';

// Evolution tree node interface
interface EvolutionTreeNode {
  name: string;
  id: string;
  spriteUrl: string;
  shinySpriteUrl: string;
  evolutionDetails: EvolutionDetail[];
  types: string[];
  children: EvolutionTreeNode[];
  isCurrent: boolean;
}

// Pokemon form interface
interface PokemonForm {
  id: number;
  name: string;
  displayName: string;
  isDefault: boolean;
  sprites: any;
  types: any[];
}

// Cache entry interface
interface CachedData<T> {
  data: T;
  timestamp: number;
}

// Cache for evolution data
const evolutionCache = new Map<string, CachedData<any>>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Cached fetch for evolution data
const cachedFetchData = async <T = any>(url: string): Promise<T> => {
  const now = Date.now();
  const cached = evolutionCache.get(url);
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data as T;
  }
  
  const data = await fetchData<T>(url);
  evolutionCache.set(url, { data, timestamp: now });
  return data;
};

/**
 * Build evolution tree structure recursively
 */
export const buildEvolutionTree = async (
  node: EvolutionLink | null, 
  currentSpeciesId: string | number | null = null
): Promise<EvolutionTreeNode | null> => {
  if (!node || !node.species) return null;
  
  try {
    const speciesId = extractIdFromUrl(node.species.url);
    if (!speciesId) return null;
    
    let types: string[] = [];
    let formName = '';
    let isVariant = false;
    
    try {
      const pokeData = await cachedFetchData<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${speciesId}`);
      if (pokeData && pokeData.types) {
        types = pokeData.types.map(t => t.type.name);
      }
      
      // Detect variant forms
      const variantMatch = pokeData.name.match(/-(galar|alola|hisui|paldea|mega|gigantamax|totem|origin|crowned|busted|school|eternamax|starter|battle|dawn|midnight|dusk|ultra|rainy|snowy|sunny|attack|defense|speed|fan|frost|heat|mow|wash|sky|therian|black|white|resolute|pirouette|ash|baile|pom-pom|pau|sensu|zen|dada|single|rapid|low-key|amped|noice|super|small|large|average|male|female|plant|sandy|trash|east|west|blue-striped|red-striped|white-striped|yellow-striped|striped|unbound|complete|core|10|50|solo|midday|disguised|hangry|gmax)/);
      if (variantMatch) {
        isVariant = true;
        formName = variantMatch[1];
      }
    } catch (fetchError) {
      console.error('Error fetching Pokemon data for evolution tree:', fetchError);
    }
    
    // Handle special evolution cases
    let children: (EvolutionTreeNode | null)[] = [];
    if (node.evolves_to && node.evolves_to.length > 0) {
      children = await Promise.all(
        node.evolves_to.map(async child => {
          // Special case for Mr. Mime - only Galarian form evolves
          if (speciesId === '122' && node.species.name === 'mr-mime' && !isVariant) {
            return null;
          }
          
          if (isVariant || node.species.name !== 'mr-mime') {
            return buildEvolutionTree(child, currentSpeciesId);
          }
          return null;
        })
      );
    }
    
    return {
      name: node.species.name,
      id: speciesId,
      spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`,
      shinySpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${speciesId}.png`,
      evolutionDetails: node.evolution_details,
      types,
      children: children.filter((child): child is EvolutionTreeNode => child !== null),
      isCurrent: currentSpeciesId !== null && String(currentSpeciesId) === String(speciesId)
    };
  } catch (error) {
    console.error('Error in buildEvolutionTree:', error);
    return null;
  }
};

/**
 * Format evolution details for display
 */
export const formatEvolutionDetails = (details: EvolutionDetail[]): string => {
  if (!details || details.length === 0) return '';
  
  const detail = details[0];
  const parts: string[] = [];
  
  if (detail.min_level) {
    parts.push(`Level ${detail.min_level}`);
  }
  
  if (detail.item) {
    parts.push(`Use ${detail.item.name.replace('-', ' ')}`);
  }
  
  if (detail.held_item) {
    parts.push(`Hold ${detail.held_item.name.replace('-', ' ')}`);
  }
  
  if (detail.time_of_day) {
    parts.push(`${detail.time_of_day} time`);
  }
  
  if (detail.location) {
    parts.push(`At ${detail.location.name.replace('-', ' ')}`);
  }
  
  if (detail.trigger && detail.trigger.name !== 'level-up') {
    parts.push(detail.trigger.name.replace('-', ' '));
  }
  
  if (detail.min_happiness) {
    parts.push(`Happiness ${detail.min_happiness}+`);
  }
  
  if (detail.min_beauty) {
    parts.push(`Beauty ${detail.min_beauty}+`);
  }
  
  if (detail.min_affection) {
    parts.push(`Affection ${detail.min_affection}+`);
  }
  
  if (detail.known_move) {
    parts.push(`Know ${detail.known_move.name.replace('-', ' ')}`);
  }
  
  if (detail.known_move_type) {
    parts.push(`Know ${detail.known_move_type.name} move`);
  }
  
  if (detail.party_species) {
    parts.push(`With ${detail.party_species.name} in party`);
  }
  
  if (detail.party_type) {
    parts.push(`With ${detail.party_type.name} type in party`);
  }
  
  if (detail.relative_physical_stats !== null && detail.relative_physical_stats !== undefined) {
    const stat = detail.relative_physical_stats;
    if (stat === 1) parts.push('ATK > DEF');
    else if (stat === -1) parts.push('ATK < DEF');
    else if (stat === 0) parts.push('ATK = DEF');
  }
  
  if (detail.trade_species) {
    parts.push(`Trade for ${detail.trade_species.name}`);
  }
  
  if (detail.needs_overworld_rain) {
    parts.push('During rain');
  }
  
  if (detail.turn_upside_down) {
    parts.push('Turn console upside down');
  }
  
  return parts.join(', ') || 'Unknown method';
};

/**
 * Get evolution chain for a Pokemon species
 */
export const getEvolutionChain = async (speciesId: string | number): Promise<EvolutionTreeNode | null> => {
  try {
    const speciesData = await cachedFetchData<PokemonSpecies>(`https://pokeapi.co/api/v2/pokemon-species/${speciesId}`);
    if (!speciesData.evolution_chain?.url) {
      return null;
    }
    
    const evolutionData = await cachedFetchData<EvolutionChain>(speciesData.evolution_chain.url);
    if (!evolutionData.chain) {
      return null;
    }
    
    return await buildEvolutionTree(evolutionData.chain, speciesId);
  } catch (error) {
    console.error('Error fetching evolution chain:', error);
    return null;
  }
};

/**
 * Check if Pokemon has multiple forms
 */
export const hasMultipleForms = (pokemonData: Partial<Pokemon>): boolean => {
  return Boolean(pokemonData?.forms && pokemonData.forms.length > 1);
};

/**
 * Get all forms for a Pokemon species
 */
export const getAllForms = async (speciesId: string | number): Promise<PokemonForm[]> => {
  try {
    const speciesData = await cachedFetchData<PokemonSpecies>(`https://pokeapi.co/api/v2/pokemon-species/${speciesId}`);
    const varieties = speciesData.varieties || [];
    
    const forms = await Promise.all(
      varieties.map(async (variety) => {
        try {
          const pokemonData = await cachedFetchData<Pokemon>(variety.pokemon.url);
          return {
            id: pokemonData.id as number,
            name: pokemonData.name,
            displayName: pokemonData.name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            isDefault: variety.is_default,
            sprites: pokemonData.sprites,
            types: pokemonData.types || []
          };
        } catch (error) {
          console.error(`Error fetching form data for ${variety.pokemon.name}:`, error);
          return null;
        }
      })
    );
    
    return forms
      .filter((form): form is PokemonForm => form !== null)
      .sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return a.name.localeCompare(b.name);
      });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return [];
  }
};

export default {
  buildEvolutionTree,
  formatEvolutionDetails,
  getEvolutionChain,
  hasMultipleForms,
  getAllForms
};