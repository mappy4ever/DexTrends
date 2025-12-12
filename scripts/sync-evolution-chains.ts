/**
 * Sync Evolution Chains from PokeAPI to Supabase
 *
 * This script fetches evolution chain data from PokeAPI and stores it in Supabase.
 * It also populates the pokemon_forms table with regional variants.
 *
 * Usage:
 *   npx ts-node scripts/sync-evolution-chains.ts
 *
 * Environment variables required:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for write access
 */

import { createClient } from '@supabase/supabase-js';

// Types
interface EvolutionDetail {
  trigger: string;
  item?: string;
  min_level?: number;
  min_happiness?: number;
  min_beauty?: number;
  min_affection?: number;
  time_of_day?: string;
  location?: string;
  held_item?: string;
  known_move?: string;
  known_move_type?: string;
  party_species?: string;
  party_type?: string;
  relative_physical_stats?: number;
  needs_overworld_rain?: boolean;
  turn_upside_down?: boolean;
  gender?: number;
}

interface ChainLink {
  species: { name: string; url: string };
  evolution_details: Array<{
    trigger: { name: string };
    item?: { name: string };
    min_level?: number;
    min_happiness?: number;
    min_beauty?: number;
    min_affection?: number;
    time_of_day?: string;
    location?: { name: string };
    held_item?: { name: string };
    known_move?: { name: string };
    known_move_type?: { name: string };
    party_species?: { name: string };
    party_type?: { name: string };
    relative_physical_stats?: number;
    needs_overworld_rain?: boolean;
    turn_upside_down?: boolean;
    gender?: number;
  }>;
  evolves_to: ChainLink[];
}

interface EvolutionChainResponse {
  id: number;
  chain: ChainLink;
}

interface PokemonFormResponse {
  id: number;
  name: string;
  form_name: string;
  is_default: boolean;
  is_battle_only: boolean;
  is_mega: boolean;
  pokemon: { name: string; url: string };
  sprites: Record<string, string | null>;
  types: Array<{ slot: number; type: { name: string } }>;
  version_group: { name: string };
}

interface PokemonSpeciesResponse {
  id: number;
  name: string;
  evolution_chain: { url: string };
  varieties: Array<{
    is_default: boolean;
    pokemon: { name: string; url: string };
  }>;
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('  SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Rate limiting helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch with retry
async function fetchWithRetry<T>(url: string, retries = 3): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
      if (response.status === 404) {
        return null;
      }
      console.warn(`Fetch failed (attempt ${i + 1}/${retries}): ${url} - ${response.status}`);
    } catch (error) {
      console.warn(`Fetch error (attempt ${i + 1}/${retries}): ${url}`, error);
    }
    await delay(1000 * (i + 1)); // Exponential backoff
  }
  return null;
}

// Process evolution chain into a simplified structure
function processChainLink(link: ChainLink): Record<string, unknown> {
  const evolutionDetails: EvolutionDetail[] = link.evolution_details.map(detail => ({
    trigger: detail.trigger.name,
    item: detail.item?.name,
    min_level: detail.min_level,
    min_happiness: detail.min_happiness,
    min_beauty: detail.min_beauty,
    min_affection: detail.min_affection,
    time_of_day: detail.time_of_day || undefined,
    location: detail.location?.name,
    held_item: detail.held_item?.name,
    known_move: detail.known_move?.name,
    known_move_type: detail.known_move_type?.name,
    party_species: detail.party_species?.name,
    party_type: detail.party_type?.name,
    relative_physical_stats: detail.relative_physical_stats,
    needs_overworld_rain: detail.needs_overworld_rain || undefined,
    turn_upside_down: detail.turn_upside_down || undefined,
    gender: detail.gender,
  }));

  // Filter out undefined values
  const cleanedDetails = evolutionDetails.map(d =>
    Object.fromEntries(Object.entries(d).filter(([, v]) => v !== undefined))
  );

  return {
    species_name: link.species.name,
    species_id: parseInt(link.species.url.split('/').filter(Boolean).pop() || '0'),
    evolution_details: cleanedDetails,
    evolves_to: link.evolves_to.map(processChainLink),
  };
}

// Determine form type from Pokemon name
function getFormInfo(pokemonName: string, baseName: string): { formType: string; region: string | null } {
  const suffix = pokemonName.replace(baseName, '').replace(/^-/, '');

  // Regional forms
  if (suffix.includes('alola')) return { formType: 'regional', region: 'alola' };
  if (suffix.includes('galar')) return { formType: 'regional', region: 'galar' };
  if (suffix.includes('hisui')) return { formType: 'regional', region: 'hisui' };
  if (suffix.includes('paldea')) return { formType: 'regional', region: 'paldea' };

  // Mega forms
  if (suffix.includes('mega')) return { formType: 'mega', region: null };

  // Gigantamax
  if (suffix.includes('gmax')) return { formType: 'gmax', region: null };

  // Totem forms
  if (suffix.includes('totem')) return { formType: 'totem', region: null };

  // Default/other
  if (!suffix) return { formType: 'default', region: null };
  return { formType: 'other', region: null };
}

// Sync evolution chains
async function syncEvolutionChains() {
  console.log('Starting evolution chain sync...');

  // PokeAPI has evolution chains from 1 to ~500+
  // We'll fetch them incrementally
  const maxChainId = 550;
  let synced = 0;
  let failed = 0;

  for (let chainId = 1; chainId <= maxChainId; chainId++) {
    const url = `https://pokeapi.co/api/v2/evolution-chain/${chainId}`;
    const data = await fetchWithRetry<EvolutionChainResponse>(url);

    if (data) {
      const processedChain = processChainLink(data.chain);

      const { error } = await supabase
        .from('evolution_chains')
        .upsert({
          id: data.id,
          chain: processedChain,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error(`Failed to upsert chain ${chainId}:`, error.message);
        failed++;
      } else {
        synced++;
      }
    } else {
      // Chain doesn't exist, skip
    }

    // Rate limiting
    if (chainId % 10 === 0) {
      console.log(`Progress: ${chainId}/${maxChainId} (synced: ${synced}, failed: ${failed})`);
      await delay(100);
    }
  }

  console.log(`Evolution chains sync complete. Synced: ${synced}, Failed: ${failed}`);
}

// Sync Pokemon forms
async function syncPokemonForms() {
  console.log('Starting Pokemon forms sync...');

  // Fetch all species to get their varieties
  const maxSpeciesId = 1025; // Gen 9 limit
  let synced = 0;
  let failed = 0;

  for (let speciesId = 1; speciesId <= maxSpeciesId; speciesId++) {
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${speciesId}`;
    const species = await fetchWithRetry<PokemonSpeciesResponse>(speciesUrl);

    if (!species) continue;

    // Process each variety (form)
    for (const variety of species.varieties) {
      const pokemonUrl = variety.pokemon.url;
      const pokemonId = parseInt(pokemonUrl.split('/').filter(Boolean).pop() || '0');
      const pokemonName = variety.pokemon.name;

      // Get form details
      const pokemonData = await fetchWithRetry<{
        id: number;
        name: string;
        types: Array<{ type: { name: string } }>;
        sprites: Record<string, unknown>;
      }>(pokemonUrl);

      if (!pokemonData) continue;

      const { formType, region } = getFormInfo(pokemonName, species.name);

      const formRecord = {
        pokemon_id: pokemonId,
        species_id: speciesId,
        form_name: pokemonName,
        base_species_name: species.name,
        form_type: formType,
        region: region,
        is_default: variety.is_default,
        is_battle_only: false,
        is_mega: formType === 'mega',
        is_gmax: formType === 'gmax',
        types: pokemonData.types.map(t => t.type.name),
        sprites: pokemonData.sprites,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('pokemon_forms')
        .upsert(formRecord, { onConflict: 'form_name' });

      if (error) {
        console.error(`Failed to upsert form ${pokemonName}:`, error.message);
        failed++;
      } else {
        synced++;
      }

      await delay(50); // Rate limiting between forms
    }

    // Progress logging
    if (speciesId % 50 === 0) {
      console.log(`Progress: ${speciesId}/${maxSpeciesId} (synced: ${synced}, failed: ${failed})`);
    }

    await delay(100); // Rate limiting between species
  }

  console.log(`Pokemon forms sync complete. Synced: ${synced}, Failed: ${failed}`);
}

// Main execution
async function main() {
  console.log('='.repeat(50));
  console.log('Pokemon Evolution & Forms Sync Script');
  console.log('='.repeat(50));

  const args = process.argv.slice(2);

  if (args.includes('--chains-only')) {
    await syncEvolutionChains();
  } else if (args.includes('--forms-only')) {
    await syncPokemonForms();
  } else {
    // Sync both
    await syncEvolutionChains();
    await syncPokemonForms();
  }

  console.log('='.repeat(50));
  console.log('Sync complete!');
  console.log('='.repeat(50));
}

main().catch(console.error);
