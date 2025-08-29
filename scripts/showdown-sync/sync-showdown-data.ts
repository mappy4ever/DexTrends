import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';
import logger from '../../utils/logger';
import type { Database, TypeEffectivenessRecord, CompetitiveTierRecord, PokemonLearnsetRecord, MoveCompetitiveDataRecord, AbilityRatingRecord, ItemShowdownRecord } from '../../types/database';

// Load environment variables from root .env file
const envPath = path.resolve(__dirname, '../../.env.local');
const result = dotenv.config({ path: envPath });

if (result.error) {
  logger.error('Error loading .env.local:', { error: result.error });
}

// Constants
const SHOWDOWN_BASE_URL = 'https://play.pokemonshowdown.com/data';
const BATCH_SIZE = 1000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // ms

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_JWT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error('Missing required environment variables:', {
    SUPABASE_URL: !!supabaseUrl,
    SUPABASE_KEY: !!supabaseServiceKey,
    availableEnvVars: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
  });
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Types
interface SyncResult {
  success: boolean;
  file: string;
  recordsProcessed: number;
  error?: string;
}

interface TypeChartData {
  [typeName: string]: {
    damageTaken?: {
      [defendingType: string]: number;
    };
  };
}

interface FormatsData {
  [pokemonId: string]: {
    tier?: string;
    doublesTier?: string;
    natDexTier?: string;
  };
}

interface LearnsetData {
  [pokemonId: string]: {
    learnset?: {
      [moveName: string]: string[];
    };
  };
}

interface MoveData {
  [moveName: string]: {
    num?: number;
    basePower?: number;
    accuracy?: number | true;
    pp?: number;
    priority?: number;
    category?: 'Physical' | 'Special' | 'Status';
    type?: string;
    target?: string;
    flags?: {
      [flag: string]: number;
    };
    drain?: number[];
    recoil?: number[];
    secondary?: {
      chance?: number;
      status?: string;
      volatileStatus?: string;
      boosts?: {
        [stat: string]: number;
      };
    } | false;
    desc?: string;
    shortDesc?: string;
  };
}

// Utility functions
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = RETRY_ATTEMPTS): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      logger.info(`Fetching ${url} (attempt ${i + 1}/${retries})`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'DexTrends/1.0 (https://github.com/moazzam/dextrends)',
          'Accept': 'text/javascript, application/javascript, application/json',
        },
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      logger.error(`Attempt ${i + 1} failed:`, { error: error.message });
      if (i < retries - 1) {
        await sleep(RETRY_DELAY * (i + 1));
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

// Parse JavaScript files from Showdown
function parseJavaScriptExports(content: string, exportName: string): Record<string, unknown> {
  try {
    // Try to extract the exports object
    const regex = new RegExp(`exports\\.${exportName}\\s*=\\s*({[\\s\\S]*?});`, 'm');
    const match = content.match(regex);
    
    if (!match || !match[1]) {
      throw new Error(`Could not find exports.${exportName} in content`);
    }
    
    // Clean up the JavaScript object notation to make it valid JSON
    let jsonString = match[1];
    
    // Replace single quotes with double quotes
    jsonString = jsonString.replace(/'/g, '"');
    
    // Handle unquoted property names
    jsonString = jsonString.replace(/(\w+):/g, '"$1":');
    
    // Remove trailing commas
    jsonString = jsonString.replace(/,\s*([\]}])/g, '$1');
    
    // Handle special boolean/null values
    jsonString = jsonString.replace(/:\s*true/g, ': true');
    jsonString = jsonString.replace(/:\s*false/g, ': false');
    jsonString = jsonString.replace(/:\s*null/g, ': null');
    
    // Parse the JSON
    return JSON.parse(jsonString);
  } catch (error) {
    logger.error(`Error parsing JavaScript for ${exportName}:`, { error: error.message });
    
    // Fallback: try Function constructor (safer than eval)
    try {
      const sandbox = { exports: {} };
      // Use Function constructor instead of eval for better security
      const func = new Function('exports', `${content}; return exports.${exportName};`);
      return func(sandbox.exports);
    } catch (funcError) {
      logger.error(`Function constructor fallback also failed:`, { error: funcError.message });
      throw new Error(`Failed to parse ${exportName} from JavaScript content`);
    }
  }
}

// Sync functions
async function syncTypeEffectiveness(): Promise<SyncResult> {
  try {
    const content = await fetchWithRetry(`${SHOWDOWN_BASE_URL}/typechart.js`);
    const typeChart = parseJavaScriptExports(content, 'BattleTypeChart') as TypeChartData;
    
    const records: TypeEffectivenessRecord[] = [];
    
    // Transform Showdown format to our schema
    for (const [attackingType, typeData] of Object.entries(typeChart)) {
      if (typeData.damageTaken) {
        for (const [defendingType, effectivenessCode] of Object.entries(typeData.damageTaken)) {
          // Convert Showdown's damage taken encoding to multipliers
          // In Showdown: 0 = normal, 1 = weak to (2x), 2 = resist (0.5x), 3 = immune (0x)
          let multiplier = 1.0;
          switch (effectivenessCode) {
            case 0: multiplier = 1.0; break;  // Normal damage
            case 1: multiplier = 2.0; break;  // Weak to (takes 2x)
            case 2: multiplier = 0.5; break;  // Resists (takes 0.5x)
            case 3: multiplier = 0.0; break;  // Immune (takes 0x)
          }
          
          // We need to invert this for attacking perspective
          records.push({
            attacking_type: defendingType.toLowerCase(),
            defending_type: attackingType.toLowerCase(), 
            multiplier
          });
        }
      }
    }
    
    logger.info(`Prepared ${records.length} type effectiveness records`);
    
    // Clear existing data
    const { error: deleteError } = await supabase
      .from('type_effectiveness')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      logger.error('Error clearing type_effectiveness table:', { error: deleteError });
    }
    
    // Insert in batches
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('type_effectiveness')
        .insert(batch);
      
      if (error) {
        throw new Error(`Database insert error: ${error.message}`);
      }
      
      logger.info(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)}`);
    }
    
    return {
      success: true,
      file: 'typechart.js',
      recordsProcessed: records.length
    };
  } catch (error) {
    return {
      success: false,
      file: 'typechart.js',
      recordsProcessed: 0,
      error: error.message
    };
  }
}

async function syncPokemonTiers(): Promise<SyncResult> {
  try {
    const content = await fetchWithRetry(`${SHOWDOWN_BASE_URL}/formats-data.js`);
    const formatsData = parseJavaScriptExports(content, 'BattleFormatsData') as FormatsData;
    
    const records: CompetitiveTierRecord[] = [];
    
    for (const [pokemonId, data] of Object.entries(formatsData)) {
      if (data.tier || data.doublesTier || data.natDexTier) {
        records.push({
          pokemon_name: pokemonId.toLowerCase(),
          singles_tier: data.tier || null,
          doubles_tier: data.doublesTier || null,
          national_dex_tier: data.natDexTier || null,
          updated_at: new Date().toISOString()
        });
      }
    }
    
    logger.info(`Prepared ${records.length} tier records`);
    
    // Upsert in batches
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('competitive_tiers')
        .upsert(batch, {
          onConflict: 'pokemon_name'
        });
      
      if (error) {
        throw new Error(`Database upsert error: ${error.message}`);
      }
      
      logger.info(`Upserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)}`);
    }
    
    return {
      success: true,
      file: 'formats-data.js',
      recordsProcessed: records.length
    };
  } catch (error) {
    return {
      success: false,
      file: 'formats-data.js',
      recordsProcessed: 0,
      error: error.message
    };
  }
}

async function syncLearnsets(): Promise<SyncResult> {
  try {
    // Learnsets are actually served as JSON
    const content = await fetchWithRetry(`${SHOWDOWN_BASE_URL}/learnsets.json`);
    const learnsets = (typeof content === 'string' ? JSON.parse(content) : content) as LearnsetData;
    
    const records: PokemonLearnsetRecord[] = [];
    
    for (const [pokemonId, data] of Object.entries(learnsets)) {
      if (data.learnset) {
        for (const [moveName, learnMethods] of Object.entries(data.learnset)) {
          for (const method of learnMethods) {
            // Parse learn method format: "8L31" = Gen 8, Level 31
            // "8M" = Gen 8, TM/HM
            // "8T" = Gen 8, Tutor
            // "8E" = Gen 8, Egg move
            const match = method.match(/^(\d+)([LMTE])(\d+)?$/);
            if (match) {
              const [_, gen, methodType, level] = match;
              
              let learnMethod = '';
              switch (methodType) {
                case 'L': learnMethod = 'level-up'; break;
                case 'M': learnMethod = 'machine'; break;
                case 'T': learnMethod = 'tutor'; break;
                case 'E': learnMethod = 'egg'; break;
              }
              
              records.push({
                pokemon_id: pokemonId.toLowerCase(),
                move_name: moveName.toLowerCase(),
                generation: parseInt(gen),
                learn_method: learnMethod,
                level: level ? parseInt(level) : null
              });
            }
          }
        }
      }
    }
    
    logger.info(`Prepared ${records.length} learnset records`);
    
    // Clear existing data for full refresh
    const { error: deleteError } = await supabase
      .from('pokemon_learnsets')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      logger.error('Error clearing pokemon_learnsets table:', { error: deleteError });
    }
    
    // Insert in batches
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('pokemon_learnsets')
        .insert(batch);
      
      if (error) {
        throw new Error(`Database insert error: ${error.message}`);
      }
      
      logger.info(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)}`);
      
      // Add delay to avoid overwhelming the database
      if (i + BATCH_SIZE < records.length) {
        await sleep(100);
      }
    }
    
    return {
      success: true,
      file: 'learnsets.json',
      recordsProcessed: records.length
    };
  } catch (error) {
    return {
      success: false,
      file: 'learnsets.json',
      recordsProcessed: 0,
      error: error.message
    };
  }
}

// Store official move names from PokeAPI
let officialMoveNames: Record<string, string> | null = null;

// Fetch official move names from PokeAPI for proper formatting
async function fetchOfficialMoveNames(): Promise<Record<string, string>> {
  if (officialMoveNames) return officialMoveNames;
  
  try {
    logger.info('Fetching official move names from PokeAPI...');
    const response = await axios.get('https://pokeapi.co/api/v2/move?limit=2000');
    const names: Record<string, string> = {};
    
    response.data.results.forEach((move: any) => {
      const simplifiedName = move.name.replace(/-/g, '').toLowerCase();
      const properName = move.name
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      names[simplifiedName] = properName;
    });
    
    officialMoveNames = names;
    logger.info(`Loaded ${Object.keys(names).length} official move names`);
    return names;
  } catch (error) {
    logger.error('Failed to fetch official move names:', error);
    return {};
  }
}

// Format move names properly using official reference
function formatMoveName(name: string, officialNames?: Record<string, string>): string {
  if (!name) return 'Unknown';
  
  // Check official names first
  const simplified = name.toLowerCase().replace(/[\s-_]/g, '');
  if (officialNames && officialNames[simplified]) {
    return officialNames[simplified];
  }
  
  // Special cases for moves not in PokeAPI (G-Max, Max, etc.)
  const specialCases: Record<string, string> = {
    '10000000voltthunderbolt': '10,000,000 Volt Thunderbolt',
  };
  
  if (specialCases[name.toLowerCase()]) {
    return specialCases[name.toLowerCase()];
  }
  
  // Handle G-Max and Max moves
  if (name.toLowerCase().startsWith('gmax')) {
    return 'G-Max ' + formatMoveName(name.slice(4), officialNames);
  }
  if (name.toLowerCase().startsWith('max') && /^max[a-z]/.test(name.toLowerCase())) {
    return 'Max ' + formatMoveName(name.slice(3), officialNames);
  }
  
  // Fallback: capitalize first letter
  return name.charAt(0).toUpperCase() + name.slice(1);
}

async function syncMoveData(): Promise<SyncResult> {
  try {
    // First fetch official move names for formatting
    const officialNames = await fetchOfficialMoveNames();
    
    // Moves are served as JSON from Showdown
    const content = await fetchWithRetry(`${SHOWDOWN_BASE_URL}/moves.json`);
    const moves = (typeof content === 'string' ? JSON.parse(content) : content) as MoveData;
    
    const records: MoveCompetitiveDataRecord[] = [];
    
    // Sort moves alphabetically for consistent ID generation
    const sortedMoves = Object.entries(moves).sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    sortedMoves.forEach(([moveName, data], index) => {
      // Transform flags object to array if needed
      const flagsArray = data.flags ? Object.keys(data.flags) : [];
      
      // Build secondary effects object
      let secondaryEffects = null;
      if (data.secondary && data.secondary !== false) {
        secondaryEffects = {
          chance: data.secondary.chance || null,
          status: data.secondary.status || null,
          volatileStatus: data.secondary.volatileStatus || null,
          boosts: data.secondary.boosts || null
        };
      }
      
      // Calculate drain and recoil ratios
      let drainRatio = null;
      if (data.drain && Array.isArray(data.drain) && data.drain.length === 2) {
        drainRatio = data.drain[0] / data.drain[1];  // e.g., [1, 2] = 0.5 (50% drain)
      }
      
      let recoilRatio = null;
      if (data.recoil && Array.isArray(data.recoil) && data.recoil.length === 2) {
        recoilRatio = data.recoil[0] / data.recoil[1];  // e.g., [1, 3] = 0.33 (33% recoil)
      }
      
      records.push({
        move_id: index + 1,  // Use sequential ID to avoid duplicates
        name: formatMoveName(moveName, officialNames),  // Format name using official reference
        type: data.type ? data.type.toLowerCase() : 'normal',  // Add type field
        power: data.basePower || null,  // Changed from base_power to power
        accuracy: data.accuracy === true ? 100 : (data.accuracy || null),
        pp: data.pp || null,  // Added PP field
        priority: data.priority || 0,
        category: data.category ? data.category.toLowerCase() : null,
        target: data.target || null,
        flags: flagsArray,
        secondary_effect: secondaryEffects,  // Changed from secondary_effects to secondary_effect
        description: data.desc || data.shortDesc || null,  // Add description
        short_description: data.shortDesc || null,  // Add short description
        drain_ratio: drainRatio,
        recoil_ratio: recoilRatio,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });
    
    logger.info(`Prepared ${records.length} move records`);
    
    // Clear existing data for full refresh
    const { error: deleteError } = await supabase
      .from('move_competitive_data')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      logger.error('Error clearing move_competitive_data table:', { error: deleteError });
    }
    
    // Insert in batches
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('move_competitive_data')
        .insert(batch);
      
      if (error) {
        throw new Error(`Database insert error: ${error.message}`);
      }
      
      logger.info(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)}`);
    }
    
    return {
      success: true,
      file: 'moves.json',
      recordsProcessed: records.length
    };
  } catch (error) {
    return {
      success: false,
      file: 'moves.json',
      recordsProcessed: 0,
      error: error.message
    };
  }
}

async function syncAbilities(): Promise<SyncResult> {
  try {
    const content = await fetchWithRetry(`${SHOWDOWN_BASE_URL}/abilities.js`);
    
    // Use Function constructor for abilities since it has complex structure (safer than eval)
    let abilities: Record<string, unknown>;
    try {
      const sandbox = { exports: {} };
      // Use Function constructor instead of eval for better security
      const func = new Function('exports', `${content}; return exports.BattleAbilities;`);
      abilities = func(sandbox.exports);
    } catch (error) {
      logger.error('Error parsing abilities:', { error: error.message });
      throw new Error('Failed to parse abilities data');
    }
    
    const records: AbilityRatingRecord[] = [];
    
    // Sort abilities alphabetically for consistent ID generation
    const sortedAbilities = Object.entries(abilities).sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    sortedAbilities.forEach(([abilityName, data]: [string, any], index) => {
      // Skip if no rating available (but allow 0 rating)
      if (data.rating === undefined) {
        return;
      }
      
      // Ensure rating is within valid range (likely -5 to 5 based on data)
      const rating = typeof data.rating === 'number' ? data.rating : 0;
      
      records.push({
        ability_id: data.num || index + 1,  // Use official num or sequential ID
        name: abilityName.toLowerCase(),
        rating: Math.max(-5, Math.min(5, rating)), // Clamp to safe range
        competitive_desc: data.desc || null,
        flags: data.flags || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });
    
    logger.info(`Prepared ${records.length} ability records`);
    
    // Clear existing data for full refresh
    const { error: deleteError } = await supabase
      .from('ability_ratings')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      logger.error('Error clearing ability_ratings table:', { error: deleteError });
    }
    
    // Insert in batches
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('ability_ratings')
        .insert(batch);
      
      if (error) {
        throw new Error(`Database insert error: ${error.message}`);
      }
      
      logger.info(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)}`);
    }
    
    return {
      success: true,
      file: 'abilities.js',
      recordsProcessed: records.length
    };
  } catch (error) {
    return {
      success: false,
      file: 'abilities.js',
      recordsProcessed: 0,
      error: error.message
    };
  }
}

// Sync items data from Showdown
async function syncItems(): Promise<SyncResult> {
  try {
    const content = await fetchWithRetry(`${SHOWDOWN_BASE_URL}/items.js`);
    
    // Parse items data
    let items: Record<string, unknown>;
    try {
      const sandbox = { exports: {} };
      const func = new Function('exports', `${content}; return exports.BattleItems;`);
      items = func(sandbox.exports);
    } catch (error) {
      logger.error('Error parsing items:', { error: error.message });
      throw new Error('Failed to parse items data');
    }
    
    const records: ItemShowdownRecord[] = [];
    
    // Map item categories based on common patterns
    function getItemCategory(itemName: string, itemData: any): string {
      const name = itemName.toLowerCase();
      
      // Berries
      if (name.includes('berry')) return 'berries';
      
      // Medicine/healing items
      if (name.includes('potion') || name.includes('heal') || name.includes('restore') || 
          name.includes('revive') || name.includes('antidote') || name.includes('cure') ||
          name.includes('elixir') || name.includes('ether')) return 'medicine';
      
      // Evolution items
      if (name.includes('stone') || name.includes('scale') || name.includes('claw') ||
          name.includes('fang') || name.includes('crown') || itemData.itemUser) return 'evolution';
      
      // Battle items
      if (name.includes('x ') || name.includes('guard') || name.includes('dire hit')) return 'battle';
      
      // Held items
      if (itemData.fling || itemData.onBasePowerPriority || itemData.boosts || 
          name.includes('orb') || name.includes('band') || name.includes('specs') ||
          name.includes('scarf') || name.includes('lens') || name.includes('focus')) return 'holdable';
      
      // Treasures
      if (name.includes('nugget') || name.includes('pearl') || name.includes('shard') ||
          name.includes('star') || name.includes('comet')) return 'treasures';
      
      // Pokeballs
      if (name.includes('ball') && !name.includes('orb')) return 'pokeballs';
      
      // TMs
      if (name.startsWith('tm') || name.startsWith('tr')) return 'machines';
      
      // Key items
      if (itemData.isNonstandard || name.includes('key') || name.includes('card')) return 'key-items';
      
      return 'misc';
    }
    
    // Sort items alphabetically for consistent ID generation
    const sortedItems = Object.entries(items).sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    sortedItems.forEach(([itemName, data]: [string, any]) => {
      // Skip if not a proper item
      if (!data.name || typeof data.num !== 'number') {
        return;
      }
      
      const record: ItemShowdownRecord = {
        item_id: data.num,
        name: itemName.toLowerCase().replace(/[^a-z0-9]/g, ''),
        display_name: data.name,
        spritenum: data.spritenum || null,
        sprite_url: `https://play.pokemonshowdown.com/sprites/itemicons/${itemName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`,
        generation: data.gen || null,
        description: data.desc || null,
        short_description: data.shortDesc || null,
        fling_power: data.fling?.basePower || null,
        is_choice: data.isChoice || false,
        is_nonstandard: data.isNonstandard || false,
        category: getItemCategory(itemName, data),
        competitive_data: {
          boosts: data.boosts || null,
          flags: data.flags || null,
          condition: data.condition || null,
          onTakeItem: data.onTakeItem || null,
          onStart: data.onStart || null,
          onEnd: data.onEnd || null,
          megaStone: data.megaStone || null,
          megaEvolves: data.megaEvolves || null,
          itemUser: data.itemUser || null,
          zMove: data.zMove || null,
          zMoveType: data.zMoveType || null,
          zMoveFrom: data.zMoveFrom || null
        }
      };
      
      records.push(record);
    });
    
    logger.info(`Parsed ${records.length} items from Showdown`);
    
    // Clear existing data for full refresh
    const { error: deleteError } = await supabase
      .from('items_showdown')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      logger.error('Error clearing items_showdown table:', { error: deleteError });
    }
    
    // Insert in batches
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('items_showdown')
        .insert(batch);
      
      if (error) {
        throw new Error(`Database insert error: ${error.message}`);
      }
      
      logger.info(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)}`);
    }
    
    return {
      success: true,
      file: 'items.js',
      recordsProcessed: records.length
    };
  } catch (error) {
    return {
      success: false,
      file: 'items.js',
      recordsProcessed: 0,
      error: error.message
    };
  }
}

// Main execution
async function main() {
  logger.info('=== Pokemon Showdown Data Sync ===');
  logger.info(`Started at: ${new Date().toISOString()}`);
  logger.info(`Supabase URL: ${supabaseUrl}`);
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const typeOnly = args.includes('--type-only');
  const tiersOnly = args.includes('--tiers-only');
  const learnsetsOnly = args.includes('--learnsets-only');
  const movesOnly = args.includes('--moves-only');
  const abilitiesOnly = args.includes('--abilities-only');
  const itemsOnly = args.includes('--items-only');
  
  if (isDryRun) {
    logger.info('DRY RUN MODE - No data will be written to database');
    logger.info('Testing connection to Showdown...');
    
    try {
      await fetchWithRetry(`${SHOWDOWN_BASE_URL}/typechart.js`);
      logger.info('Successfully connected to Pokemon Showdown data API');
    } catch (error) {
      logger.error('Failed to connect to Pokemon Showdown:', { error: error.message });
    }
    
    return;
  }
  
  // Determine which syncs to run
  const syncsToRun = [];
  
  if (typeOnly) {
    syncsToRun.push(syncTypeEffectiveness());
  } else if (tiersOnly) {
    syncsToRun.push(syncPokemonTiers());
  } else if (learnsetsOnly) {
    syncsToRun.push(syncLearnsets());
  } else if (movesOnly) {
    syncsToRun.push(syncMoveData());
  } else if (abilitiesOnly) {
    syncsToRun.push(syncAbilities());
  } else if (itemsOnly) {
    syncsToRun.push(syncItems());
  } else {
    // Run all syncs
    syncsToRun.push(
      syncTypeEffectiveness(),
      syncPokemonTiers(),
      syncLearnsets(),
      syncMoveData(),
      syncAbilities(),
      syncItems()
    );
  }
  
  // Execute syncs
  const results = await Promise.allSettled(syncsToRun);
  
  // Generate report
  logger.info('\n=== Sync Report ===');
  let totalSuccess = 0;
  let totalRecords = 0;
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { success, file, recordsProcessed, error } = result.value;
      if (success) {
        logger.info(`${file}: ${recordsProcessed} records processed`);
        totalSuccess++;
        totalRecords += recordsProcessed;
      } else {
        logger.error(`${file}: Failed - ${error}`);
      }
    } else {
      logger.error(`Task ${index}: ${result.reason}`);
    }
  });
  
  logger.info(`\nCompleted: ${totalSuccess}/${results.length} tasks successful`);
  logger.info(`Total records processed: ${totalRecords}`);
  logger.info(`Finished at: ${new Date().toISOString()}`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    logger.error('Fatal error:', { error: error.message, stack: error.stack });
    process.exit(1);
  });
}

// Export for testing
export { syncTypeEffectiveness, syncPokemonTiers, syncLearnsets, syncMoveData, syncAbilities };