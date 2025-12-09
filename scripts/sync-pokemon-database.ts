/**
 * Pokemon Data Sync Script
 *
 * Syncs Pokemon, Moves, Abilities, Types, Natures, Berries, and Items
 * from PokeAPI to Supabase database.
 *
 * Usage: npx ts-node scripts/sync-pokemon-database.ts [--pokemon] [--moves] [--abilities] [--types] [--natures] [--berries] [--items] [--all]
 */

// Load environment variables from .env.local
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role key for write access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const MAX_POKEMON = 1025;
const BATCH_SIZE = 50;
const DELAY_MS = 100; // Delay between requests to avoid rate limiting

// Helper to fetch with retry
async function fetchWithRetry<T>(url: string, retries = 3): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json() as T;
    } catch (error) {
      console.warn(`Retry ${i + 1}/${retries} for ${url}:`, error);
      await sleep(1000 * (i + 1));
    }
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================
// SYNC POKEMON
// =============================================
async function syncPokemon() {
  console.log('\n🔴 Syncing Pokemon...');

  for (let id = 1; id <= MAX_POKEMON; id++) {
    try {
      const pokemon = await fetchWithRetry<any>(`${POKEAPI_BASE}/pokemon/${id}`);
      if (!pokemon) {
        console.warn(`  Pokemon ${id} not found`);
        continue;
      }

      const data = {
        id: pokemon.id,
        name: pokemon.name,
        height: pokemon.height,
        weight: pokemon.weight,
        base_experience: pokemon.base_experience,
        types: pokemon.types.map((t: any) => t.type.name),
        abilities: pokemon.abilities.map((a: any) => ({
          name: a.ability.name,
          is_hidden: a.is_hidden,
          slot: a.slot
        })),
        stats: Object.fromEntries(
          pokemon.stats.map((s: any) => [s.stat.name, { base: s.base_stat, effort: s.effort }])
        ),
        sprites: {
          front_default: pokemon.sprites.front_default,
          front_shiny: pokemon.sprites.front_shiny,
          front_female: pokemon.sprites.front_female,
          back_default: pokemon.sprites.back_default,
          back_shiny: pokemon.sprites.back_shiny,
          official_artwork: pokemon.sprites.other?.['official-artwork']?.front_default,
          home: pokemon.sprites.other?.home?.front_default,
          showdown: pokemon.sprites.other?.showdown?.front_default
        },
        cries: pokemon.cries || {},
        species_url: pokemon.species?.url,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('pokemon')
        .upsert(data, { onConflict: 'id' });

      if (error) {
        console.error(`  Error saving Pokemon ${id}:`, error.message);
      } else if (id % 50 === 0) {
        console.log(`  Progress: ${id}/${MAX_POKEMON}`);
      }

      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`  Error processing Pokemon ${id}:`, error);
    }
  }

  console.log('✅ Pokemon sync complete');
}

// =============================================
// SYNC POKEMON SPECIES
// =============================================
async function syncPokemonSpecies() {
  console.log('\n🟠 Syncing Pokemon Species...');

  for (let id = 1; id <= MAX_POKEMON; id++) {
    try {
      const species = await fetchWithRetry<any>(`${POKEAPI_BASE}/pokemon-species/${id}`);
      if (!species) {
        console.warn(`  Species ${id} not found`);
        continue;
      }

      // Extract evolution chain ID from URL
      const evolutionChainId = species.evolution_chain?.url
        ? parseInt(species.evolution_chain.url.split('/').filter(Boolean).pop() || '0')
        : null;

      const data = {
        id: species.id,
        name: species.name,
        gender_rate: species.gender_rate,
        capture_rate: species.capture_rate,
        base_happiness: species.base_happiness,
        is_baby: species.is_baby,
        is_legendary: species.is_legendary,
        is_mythical: species.is_mythical,
        hatch_counter: species.hatch_counter,
        has_gender_differences: species.has_gender_differences,
        growth_rate: species.growth_rate?.name,
        egg_groups: species.egg_groups?.map((e: any) => e.name) || [],
        color: species.color?.name,
        shape: species.shape?.name,
        habitat: species.habitat?.name,
        generation: species.generation?.name,
        flavor_text_entries: species.flavor_text_entries
          ?.filter((e: any) => e.language.name === 'en')
          .slice(0, 5)
          .map((e: any) => ({ text: e.flavor_text.replace(/\n|\f/g, ' '), version: e.version.name })) || [],
        genera: species.genera
          ?.filter((g: any) => g.language.name === 'en')
          .map((g: any) => g.genus) || [],
        evolution_chain_id: evolutionChainId,
        evolves_from_species_id: species.evolves_from_species?.name
          ? await getPokemonIdByName(species.evolves_from_species.name)
          : null,
        varieties: species.varieties?.map((v: any) => ({
          is_default: v.is_default,
          pokemon: v.pokemon.name
        })) || [],
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('pokemon_species')
        .upsert(data, { onConflict: 'id' });

      if (error) {
        console.error(`  Error saving species ${id}:`, error.message);
      } else if (id % 50 === 0) {
        console.log(`  Progress: ${id}/${MAX_POKEMON}`);
      }

      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`  Error processing species ${id}:`, error);
    }
  }

  console.log('✅ Pokemon Species sync complete');
}

async function getPokemonIdByName(name: string): Promise<number | null> {
  const pokemon = await fetchWithRetry<any>(`${POKEAPI_BASE}/pokemon/${name}`);
  return pokemon?.id || null;
}

// =============================================
// SYNC MOVES
// =============================================
async function syncMoves() {
  console.log('\n🟡 Syncing Moves...');

  // First get list of all moves
  const moveList = await fetchWithRetry<any>(`${POKEAPI_BASE}/move?limit=1000`);
  if (!moveList?.results) {
    console.error('Failed to fetch move list');
    return;
  }

  const totalMoves = moveList.results.length;
  console.log(`  Found ${totalMoves} moves`);

  for (let i = 0; i < moveList.results.length; i++) {
    const moveRef = moveList.results[i];
    const moveId = parseInt(moveRef.url.split('/').filter(Boolean).pop() || '0');

    try {
      const move = await fetchWithRetry<any>(`${POKEAPI_BASE}/move/${moveId}`);
      if (!move) continue;

      const data = {
        id: move.id,
        name: move.name,
        accuracy: move.accuracy,
        effect_chance: move.effect_chance,
        pp: move.pp,
        priority: move.priority,
        power: move.power,
        damage_class: move.damage_class?.name,
        type: move.type?.name,
        effect_entries: move.effect_entries
          ?.filter((e: any) => e.language.name === 'en')
          .map((e: any) => ({ effect: e.effect, short_effect: e.short_effect })) || [],
        flavor_text_entries: move.flavor_text_entries
          ?.filter((e: any) => e.language.name === 'en')
          .slice(0, 3)
          .map((e: any) => ({ text: e.flavor_text.replace(/\n|\f/g, ' '), version: e.version_group.name })) || [],
        meta: move.meta ? {
          ailment: move.meta.ailment?.name,
          category: move.meta.category?.name,
          min_hits: move.meta.min_hits,
          max_hits: move.meta.max_hits,
          min_turns: move.meta.min_turns,
          max_turns: move.meta.max_turns,
          drain: move.meta.drain,
          healing: move.meta.healing,
          crit_rate: move.meta.crit_rate,
          ailment_chance: move.meta.ailment_chance,
          flinch_chance: move.meta.flinch_chance,
          stat_chance: move.meta.stat_chance
        } : {},
        target: move.target?.name,
        learned_by_pokemon: move.learned_by_pokemon?.slice(0, 50).map((p: any) => p.name) || [],
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('moves')
        .upsert(data, { onConflict: 'id' });

      if (error) {
        console.error(`  Error saving move ${move.name}:`, error.message);
      } else if ((i + 1) % 100 === 0) {
        console.log(`  Progress: ${i + 1}/${totalMoves}`);
      }

      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`  Error processing move ${moveId}:`, error);
    }
  }

  console.log('✅ Moves sync complete');
}

// =============================================
// SYNC ABILITIES
// =============================================
async function syncAbilities() {
  console.log('\n🟢 Syncing Abilities...');

  const abilityList = await fetchWithRetry<any>(`${POKEAPI_BASE}/ability?limit=400`);
  if (!abilityList?.results) {
    console.error('Failed to fetch ability list');
    return;
  }

  const totalAbilities = abilityList.results.length;
  console.log(`  Found ${totalAbilities} abilities`);

  for (let i = 0; i < abilityList.results.length; i++) {
    const abilityRef = abilityList.results[i];
    const abilityId = parseInt(abilityRef.url.split('/').filter(Boolean).pop() || '0');

    try {
      const ability = await fetchWithRetry<any>(`${POKEAPI_BASE}/ability/${abilityId}`);
      if (!ability) continue;

      const data = {
        id: ability.id,
        name: ability.name,
        is_main_series: ability.is_main_series,
        effect_entries: ability.effect_entries
          ?.filter((e: any) => e.language.name === 'en')
          .map((e: any) => ({ effect: e.effect, short_effect: e.short_effect })) || [],
        flavor_text_entries: ability.flavor_text_entries
          ?.filter((e: any) => e.language.name === 'en')
          .slice(0, 3)
          .map((e: any) => ({ text: e.flavor_text.replace(/\n|\f/g, ' '), version: e.version_group.name })) || [],
        pokemon: ability.pokemon?.slice(0, 30).map((p: any) => ({
          name: p.pokemon.name,
          is_hidden: p.is_hidden
        })) || [],
        generation: ability.generation?.name,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('abilities')
        .upsert(data, { onConflict: 'id' });

      if (error) {
        console.error(`  Error saving ability ${ability.name}:`, error.message);
      } else if ((i + 1) % 50 === 0) {
        console.log(`  Progress: ${i + 1}/${totalAbilities}`);
      }

      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`  Error processing ability ${abilityId}:`, error);
    }
  }

  console.log('✅ Abilities sync complete');
}

// =============================================
// SYNC TYPES
// =============================================
async function syncTypes() {
  console.log('\n🔵 Syncing Types...');

  const typeList = await fetchWithRetry<any>(`${POKEAPI_BASE}/type?limit=20`);
  if (!typeList?.results) {
    console.error('Failed to fetch type list');
    return;
  }

  for (const typeRef of typeList.results) {
    const typeId = parseInt(typeRef.url.split('/').filter(Boolean).pop() || '0');

    // Skip types above 18 (fairy is 18, unknown and shadow are special)
    if (typeId > 18) continue;

    try {
      const type = await fetchWithRetry<any>(`${POKEAPI_BASE}/type/${typeId}`);
      if (!type) continue;

      const data = {
        id: type.id,
        name: type.name,
        damage_relations: {
          double_damage_from: type.damage_relations?.double_damage_from?.map((t: any) => t.name) || [],
          double_damage_to: type.damage_relations?.double_damage_to?.map((t: any) => t.name) || [],
          half_damage_from: type.damage_relations?.half_damage_from?.map((t: any) => t.name) || [],
          half_damage_to: type.damage_relations?.half_damage_to?.map((t: any) => t.name) || [],
          no_damage_from: type.damage_relations?.no_damage_from?.map((t: any) => t.name) || [],
          no_damage_to: type.damage_relations?.no_damage_to?.map((t: any) => t.name) || []
        },
        pokemon: type.pokemon?.slice(0, 50).map((p: any) => p.pokemon.name) || [],
        moves: type.moves?.slice(0, 50).map((m: any) => m.name) || []
      };

      const { error } = await supabase
        .from('types')
        .upsert(data, { onConflict: 'id' });

      if (error) {
        console.error(`  Error saving type ${type.name}:`, error.message);
      } else {
        console.log(`  ✓ ${type.name}`);
      }

      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`  Error processing type ${typeId}:`, error);
    }
  }

  console.log('✅ Types sync complete');
}

// =============================================
// SYNC NATURES
// =============================================
async function syncNatures() {
  console.log('\n🟣 Syncing Natures...');

  const natureList = await fetchWithRetry<any>(`${POKEAPI_BASE}/nature?limit=30`);
  if (!natureList?.results) {
    console.error('Failed to fetch nature list');
    return;
  }

  for (const natureRef of natureList.results) {
    const natureId = parseInt(natureRef.url.split('/').filter(Boolean).pop() || '0');

    try {
      const nature = await fetchWithRetry<any>(`${POKEAPI_BASE}/nature/${natureId}`);
      if (!nature) continue;

      const data = {
        id: nature.id,
        name: nature.name,
        decreased_stat: nature.decreased_stat?.name || null,
        increased_stat: nature.increased_stat?.name || null,
        hates_flavor: nature.hates_flavor?.name || null,
        likes_flavor: nature.likes_flavor?.name || null
      };

      const { error } = await supabase
        .from('natures')
        .upsert(data, { onConflict: 'id' });

      if (error) {
        console.error(`  Error saving nature ${nature.name}:`, error.message);
      } else {
        console.log(`  ✓ ${nature.name}`);
      }

      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`  Error processing nature ${natureId}:`, error);
    }
  }

  console.log('✅ Natures sync complete');
}

// =============================================
// SYNC BERRIES
// =============================================
async function syncBerries() {
  console.log('\n🫐 Syncing Berries...');

  const berryList = await fetchWithRetry<any>(`${POKEAPI_BASE}/berry?limit=100`);
  if (!berryList?.results) {
    console.error('Failed to fetch berry list');
    return;
  }

  for (const berryRef of berryList.results) {
    const berryId = parseInt(berryRef.url.split('/').filter(Boolean).pop() || '0');

    try {
      const berry = await fetchWithRetry<any>(`${POKEAPI_BASE}/berry/${berryId}`);
      if (!berry) continue;

      const data = {
        id: berry.id,
        name: berry.name,
        growth_time: berry.growth_time,
        max_harvest: berry.max_harvest,
        natural_gift_power: berry.natural_gift_power,
        natural_gift_type: berry.natural_gift_type?.name,
        size: berry.size,
        smoothness: berry.smoothness,
        soil_dryness: berry.soil_dryness,
        firmness: berry.firmness?.name,
        flavors: berry.flavors?.map((f: any) => ({
          flavor: f.flavor.name,
          potency: f.potency
        })) || [],
        item_id: berry.item?.url ? parseInt(berry.item.url.split('/').filter(Boolean).pop() || '0') : null
      };

      const { error } = await supabase
        .from('berries')
        .upsert(data, { onConflict: 'id' });

      if (error) {
        console.error(`  Error saving berry ${berry.name}:`, error.message);
      } else {
        console.log(`  ✓ ${berry.name}`);
      }

      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`  Error processing berry ${berryId}:`, error);
    }
  }

  console.log('✅ Berries sync complete');
}

// =============================================
// SYNC ITEMS (just key items for now)
// =============================================
async function syncItems() {
  console.log('\n📦 Syncing Items...');

  const itemList = await fetchWithRetry<any>(`${POKEAPI_BASE}/item?limit=1200`);
  if (!itemList?.results) {
    console.error('Failed to fetch item list');
    return;
  }

  const totalItems = itemList.results.length;
  console.log(`  Found ${totalItems} items`);

  for (let i = 0; i < itemList.results.length; i++) {
    const itemRef = itemList.results[i];
    const itemId = parseInt(itemRef.url.split('/').filter(Boolean).pop() || '0');

    try {
      const item = await fetchWithRetry<any>(`${POKEAPI_BASE}/item/${itemId}`);
      if (!item) continue;

      const data = {
        id: item.id,
        name: item.name,
        cost: item.cost,
        fling_power: item.fling_power,
        fling_effect: item.fling_effect?.name || null,
        category: item.category?.name,
        effect_entries: item.effect_entries
          ?.filter((e: any) => e.language.name === 'en')
          .map((e: any) => ({ effect: e.effect, short_effect: e.short_effect })) || [],
        flavor_text_entries: item.flavor_text_entries
          ?.filter((e: any) => e.language.name === 'en')
          .slice(0, 3)
          .map((e: any) => ({ text: e.text.replace(/\n|\f/g, ' '), version: e.version_group.name })) || [],
        sprites: {
          default: item.sprites?.default
        },
        attributes: item.attributes?.map((a: any) => a.name) || []
      };

      const { error } = await supabase
        .from('items')
        .upsert(data, { onConflict: 'id' });

      if (error) {
        console.error(`  Error saving item ${item.name}:`, error.message);
      } else if ((i + 1) % 100 === 0) {
        console.log(`  Progress: ${i + 1}/${totalItems}`);
      }

      await sleep(DELAY_MS);
    } catch (error) {
      console.error(`  Error processing item ${itemId}:`, error);
    }
  }

  console.log('✅ Items sync complete');
}

// =============================================
// MAIN
// =============================================
async function main() {
  const args = process.argv.slice(2);

  console.log('🚀 Pokemon Database Sync');
  console.log('========================\n');

  const syncAll = args.includes('--all') || args.length === 0;

  if (syncAll || args.includes('--types')) {
    await syncTypes();
  }

  if (syncAll || args.includes('--natures')) {
    await syncNatures();
  }

  if (syncAll || args.includes('--berries')) {
    await syncBerries();
  }

  if (syncAll || args.includes('--pokemon')) {
    await syncPokemon();
    await syncPokemonSpecies();
  }

  if (syncAll || args.includes('--moves')) {
    await syncMoves();
  }

  if (syncAll || args.includes('--abilities')) {
    await syncAbilities();
  }

  if (syncAll || args.includes('--items')) {
    await syncItems();
  }

  console.log('\n🎉 Sync complete!');
}

main().catch(console.error);
