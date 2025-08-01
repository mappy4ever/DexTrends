import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from root .env file
const envPath = path.resolve(process.cwd(), '.env.local');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env.local:', result.error);
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
  console.error('Missing required environment variables:');
  console.error('SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_KEY:', !!supabaseServiceKey);
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      console.log(`Fetching ${url} (attempt ${i + 1}/${retries})`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'DexTrends/1.0 (https://github.com/moazzam/dextrends)',
          'Accept': 'text/javascript, application/javascript, application/json',
        },
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
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
function parseJavaScriptExports(content: string, exportName: string): any {
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
    console.error(`Error parsing JavaScript for ${exportName}:`, error);
    
    // Fallback: try eval in a sandboxed way (less safe but sometimes necessary)
    try {
      const sandbox = { exports: {} };
      const wrapped = `(function() { const exports = {}; ${content}; return exports.${exportName}; })()`;
      return eval(wrapped);
    } catch (evalError) {
      console.error(`Eval fallback also failed:`, evalError);
      throw new Error(`Failed to parse ${exportName} from JavaScript content`);
    }
  }
}

// Sync functions
async function syncTypeEffectiveness(): Promise<SyncResult> {
  try {
    const content = await fetchWithRetry(`${SHOWDOWN_BASE_URL}/typechart.js`);
    const typeChart = parseJavaScriptExports(content, 'BattleTypeChart') as TypeChartData;
    
    const records: any[] = [];
    
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
    
    console.log(`Prepared ${records.length} type effectiveness records`);
    
    // Clear existing data
    const { error: deleteError } = await supabase
      .from('type_effectiveness')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.error('Error clearing type_effectiveness table:', deleteError);
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
      
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)}`);
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
    
    const records: any[] = [];
    
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
    
    console.log(`Prepared ${records.length} tier records`);
    
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
      
      console.log(`Upserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)}`);
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
    
    const records: any[] = [];
    
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
    
    console.log(`Prepared ${records.length} learnset records`);
    
    // Clear existing data for full refresh
    const { error: deleteError } = await supabase
      .from('pokemon_learnsets')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.error('Error clearing pokemon_learnsets table:', deleteError);
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
      
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)}`);
      
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

async function syncMoveData(): Promise<SyncResult> {
  try {
    // Moves are served as JSON from Showdown
    const content = await fetchWithRetry(`${SHOWDOWN_BASE_URL}/moves.json`);
    const moves = (typeof content === 'string' ? JSON.parse(content) : content) as MoveData;
    
    const records: any[] = [];
    
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
        name: moveName.toLowerCase(),  // Changed from move_name to name
        power: data.basePower || null,  // Changed from base_power to power
        accuracy: data.accuracy === true ? 100 : (data.accuracy || null),
        pp: data.pp || null,  // Added PP field
        priority: data.priority || 0,
        category: data.category ? data.category.toLowerCase() : null,
        target: data.target || null,
        flags: flagsArray,
        secondary_effect: secondaryEffects,  // Changed from secondary_effects to secondary_effect
        drain_ratio: drainRatio,
        recoil_ratio: recoilRatio,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });
    
    console.log(`Prepared ${records.length} move records`);
    
    // Clear existing data for full refresh
    const { error: deleteError } = await supabase
      .from('move_competitive_data')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.error('Error clearing move_competitive_data table:', deleteError);
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
      
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)}`);
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

// Main execution
async function main() {
  console.log('=== Pokemon Showdown Data Sync ===');
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const typeOnly = args.includes('--type-only');
  const tiersOnly = args.includes('--tiers-only');
  const learnsetsOnly = args.includes('--learnsets-only');
  const movesOnly = args.includes('--moves-only');
  
  if (isDryRun) {
    console.log('DRY RUN MODE - No data will be written to database');
    console.log('Testing connection to Showdown...');
    
    try {
      await fetchWithRetry(`${SHOWDOWN_BASE_URL}/typechart.js`);
      console.log('✅ Successfully connected to Pokemon Showdown data API');
    } catch (error) {
      console.error('❌ Failed to connect to Pokemon Showdown:', error.message);
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
  } else {
    // Run all syncs
    syncsToRun.push(
      syncTypeEffectiveness(),
      syncPokemonTiers(),
      syncLearnsets(),
      syncMoveData()
    );
  }
  
  // Execute syncs
  const results = await Promise.allSettled(syncsToRun);
  
  // Generate report
  console.log('\n=== Sync Report ===');
  let totalSuccess = 0;
  let totalRecords = 0;
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { success, file, recordsProcessed, error } = result.value;
      if (success) {
        console.log(`✅ ${file}: ${recordsProcessed} records processed`);
        totalSuccess++;
        totalRecords += recordsProcessed;
      } else {
        console.log(`❌ ${file}: Failed - ${error}`);
      }
    } else {
      console.log(`❌ Task ${index}: ${result.reason}`);
    }
  });
  
  console.log(`\nCompleted: ${totalSuccess}/${results.length} tasks successful`);
  console.log(`Total records processed: ${totalRecords}`);
  console.log(`Finished at: ${new Date().toISOString()}`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export for testing
export { syncTypeEffectiveness, syncPokemonTiers, syncLearnsets, syncMoveData };