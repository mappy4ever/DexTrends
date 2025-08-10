import type { Pokemon, PokemonSpecies } from "../types/pokemon";
import { showdownQueries } from './supabase';

interface MovesetSuggestion {
  name: string;
  usage: number;
  item: string;
  ability: string;
  nature: string;
  evs: Record<string, number>;
  moves: string[];
}

interface TeammateSuggestion {
  name: string;
  usage: number;
  reason: string;
}

interface CounterSuggestion {
  name: string;
  winRate: number;
  reason: string;
}

// Nature effects on stats
const NATURE_EFFECTS: Record<string, { boost: string; lower: string }> = {
  Adamant: { boost: 'attack', lower: 'special-attack' },
  Bold: { boost: 'defense', lower: 'attack' },
  Brave: { boost: 'attack', lower: 'speed' },
  Calm: { boost: 'special-defense', lower: 'attack' },
  Careful: { boost: 'special-defense', lower: 'special-attack' },
  Gentle: { boost: 'special-defense', lower: 'defense' },
  Hasty: { boost: 'speed', lower: 'defense' },
  Impish: { boost: 'defense', lower: 'special-attack' },
  Jolly: { boost: 'speed', lower: 'special-attack' },
  Lax: { boost: 'defense', lower: 'special-defense' },
  Lonely: { boost: 'attack', lower: 'defense' },
  Mild: { boost: 'special-attack', lower: 'defense' },
  Modest: { boost: 'special-attack', lower: 'attack' },
  Naive: { boost: 'speed', lower: 'special-defense' },
  Naughty: { boost: 'attack', lower: 'special-defense' },
  Quiet: { boost: 'special-attack', lower: 'speed' },
  Rash: { boost: 'special-attack', lower: 'special-defense' },
  Relaxed: { boost: 'defense', lower: 'speed' },
  Sassy: { boost: 'special-defense', lower: 'speed' },
  Serious: { boost: '', lower: '' }, // Neutral
  Timid: { boost: 'speed', lower: 'attack' },
};

// Common competitive items by role
const ITEMS_BY_ROLE: Record<string, string[]> = {
  'Physical Sweeper': ['Life Orb', 'Choice Band', 'Choice Scarf', 'Leftovers'],
  'Special Sweeper': ['Life Orb', 'Choice Specs', 'Choice Scarf', 'Leftovers'],
  'Wall': ['Leftovers', 'Rocky Helmet', 'Heavy-Duty Boots'],
  'Support': ['Leftovers', 'Light Clay', 'Mental Herb', 'Focus Sash'],
  'Setup Sweeper': ['Life Orb', 'Weakness Policy', 'Leftovers', 'Lum Berry'],
  'Bulky Pivot': ['Leftovers', 'Rocky Helmet', 'Heavy-Duty Boots'],
  'Mixed Attacker': ['Life Orb', 'Expert Belt', 'Leftovers'],
};

// Determine Pokemon's primary role based on stats
export function determinePokemonRole(pokemon: Pokemon): string {
  const stats = pokemon.stats?.reduce((acc, stat) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {} as Record<string, number>) || {};

  const attack = stats['attack'] || 0;
  const spAttack = stats['special-attack'] || 0;
  const defense = stats['defense'] || 0;
  const spDefense = stats['special-defense'] || 0;
  const speed = stats['speed'] || 0;
  const hp = stats['hp'] || 0;

  const physicalBulk = hp + defense;
  const specialBulk = hp + spDefense;
  const totalBulk = physicalBulk + specialBulk;
  const offensiveTotal = attack + spAttack;

  // Determine primary role
  if (speed >= 100) {
    if (attack > spAttack && attack >= 100) return 'Physical Sweeper';
    if (spAttack >= 100) return 'Special Sweeper';
    if (attack >= 80 && spAttack >= 80) return 'Mixed Attacker';
  }

  if (totalBulk >= 300) {
    if (defense > spDefense) return 'Physical Wall';
    if (spDefense > defense) return 'Special Wall';
    return 'Wall';
  }

  if (speed >= 80 && offensiveTotal >= 180) {
    return 'Setup Sweeper';
  }

  if (totalBulk >= 250 && offensiveTotal >= 160) {
    return 'Bulky Pivot';
  }

  // Default based on highest stats
  if (attack > spAttack) return 'Physical Attacker';
  if (spAttack > attack) return 'Special Attacker';
  return 'Support';
}

// Generate EV spread based on role and stats
export function generateEVSpread(pokemon: Pokemon, role: string): Record<string, number> {
  const evs = {
    hp: 0,
    attack: 0,
    defense: 0,
    'special-attack': 0,
    'special-defense': 0,
    speed: 0,
  };

  const stats = pokemon.stats?.reduce((acc, stat) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {} as Record<string, number>) || {};

  switch (role) {
    case 'Physical Sweeper':
      evs.attack = 252;
      evs.speed = 252;
      evs.hp = 4;
      break;

    case 'Special Sweeper':
      evs['special-attack'] = 252;
      evs.speed = 252;
      evs['special-defense'] = 4;
      break;

    case 'Wall':
    case 'Physical Wall':
      evs.hp = 252;
      evs.defense = 252;
      evs['special-defense'] = 4;
      break;

    case 'Special Wall':
      evs.hp = 252;
      evs['special-defense'] = 252;
      evs.defense = 4;
      break;

    case 'Bulky Pivot':
      evs.hp = 248;
      if (stats['attack'] > stats['special-attack']) {
        evs.attack = 252;
        evs.defense = 8;
      } else {
        evs['special-attack'] = 252;
        evs['special-defense'] = 8;
      }
      break;

    case 'Mixed Attacker':
      evs.attack = 128;
      evs['special-attack'] = 128;
      evs.speed = 252;
      break;

    case 'Setup Sweeper':
      if (stats['attack'] > stats['special-attack']) {
        evs.attack = 252;
        evs.speed = 252;
        evs.hp = 4;
      } else {
        evs['special-attack'] = 252;
        evs.speed = 252;
        evs.hp = 4;
      }
      break;

    default:
      // Balanced spread
      evs.hp = 252;
      if (stats['attack'] > stats['special-attack']) {
        evs.attack = 252;
      } else {
        evs['special-attack'] = 252;
      }
      evs.speed = 4;
  }

  return evs;
}

// Suggest nature based on role and stats
export function suggestNature(pokemon: Pokemon, role: string): string {
  const stats = pokemon.stats?.reduce((acc, stat) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {} as Record<string, number>) || {};

  const speed = stats['speed'] || 0;
  const attack = stats['attack'] || 0;
  const spAttack = stats['special-attack'] || 0;

  // Speed-focused roles
  if (role.includes('Sweeper') && speed >= 80) {
    if (attack > spAttack) return 'Jolly'; // +Speed, -SpA
    return 'Timid'; // +Speed, -Atk
  }

  // Bulky roles
  if (role.includes('Wall') || role.includes('Bulky')) {
    if (role.includes('Physical')) return 'Impish'; // +Def, -SpA
    if (role.includes('Special')) return 'Calm'; // +SpD, -Atk
    return 'Bold'; // +Def, -Atk
  }

  // Power-focused roles
  if (attack > spAttack) return 'Adamant'; // +Atk, -SpA
  return 'Modest'; // +SpA, -Atk
}

// Generate movesets based on available moves and role
export async function generateMovesets(
  pokemon: Pokemon,
  species: PokemonSpecies,
  learnset: unknown[]
): Promise<MovesetSuggestion[]> {
  const movesets: MovesetSuggestion[] = [];
  const role = determinePokemonRole(pokemon);
  
  // Get all learnable moves
  const learnableMoves = learnset
    .filter((entry): entry is { move_name: string } => 
      typeof entry === 'object' && 
      entry !== null && 
      'move_name' in entry && 
      typeof (entry as any).move_name === 'string'
    )
    .map(entry => entry.move_name);
  
  // Categories of moves for different roles
  const setupMoves = ['swords-dance', 'dragon-dance', 'calm-mind', 'nasty-plot', 'shell-smash', 'quiver-dance'];
  const recoveryMoves = ['recover', 'roost', 'synthesis', 'moonlight', 'morning-sun', 'slack-off', 'soft-boiled'];
  const hazardMoves = ['stealth-rock', 'spikes', 'toxic-spikes'];
  const statusMoves = ['thunder-wave', 'toxic', 'will-o-wisp', 'sleep-powder', 'spore'];
  const pivotMoves = ['u-turn', 'volt-switch', 'flip-turn', 'teleport', 'parting-shot'];
  
  // Primary moveset based on role
  const primaryMoveset: MovesetSuggestion = {
    name: role,
    usage: 45 + Math.random() * 20, // 45-65% usage
    item: ITEMS_BY_ROLE[role]?.[0] || 'Leftovers',
    ability: pokemon.abilities?.[0]?.ability.name || 'No Ability',
    nature: suggestNature(pokemon, role),
    evs: generateEVSpread(pokemon, role),
    moves: [],
  };

  // Select moves based on role
  switch (role) {
    case 'Physical Sweeper':
    case 'Special Sweeper':
    case 'Setup Sweeper': {
      // Setup move
      const setupMove = setupMoves.find(m => learnableMoves.includes(m));
      if (setupMove) primaryMoveset.moves.push(setupMove);
      
      // STAB moves
      const stabs = await findSTABMoves(pokemon, learnableMoves, role.includes('Physical'));
      primaryMoveset.moves.push(...stabs.slice(0, 2));
      
      // Coverage move
      const coverage = await findCoverageMoves(pokemon, learnableMoves, role.includes('Physical'));
      if (coverage.length > 0) primaryMoveset.moves.push(coverage[0]);
      
      // Priority or recovery
      const priority = findPriorityMoves(learnableMoves, role.includes('Physical'));
      if (priority.length > 0 && primaryMoveset.moves.length < 4) {
        primaryMoveset.moves.push(priority[0]);
      }
      break;
    }

    case 'Wall':
    case 'Physical Wall':
    case 'Special Wall': {
      // Recovery move
      const recovery = recoveryMoves.find(m => learnableMoves.includes(m));
      if (recovery) primaryMoveset.moves.push(recovery);
      
      // Hazards
      const hazard = hazardMoves.find(m => learnableMoves.includes(m));
      if (hazard) primaryMoveset.moves.push(hazard);
      
      // Status move
      const status = statusMoves.find(m => learnableMoves.includes(m));
      if (status) primaryMoveset.moves.push(status);
      
      // STAB attack
      const stabs = await findSTABMoves(pokemon, learnableMoves, true);
      if (stabs.length > 0) primaryMoveset.moves.push(stabs[0]);
      break;
    }

    case 'Bulky Pivot': {
      // Pivot move
      const pivot = pivotMoves.find(m => learnableMoves.includes(m));
      if (pivot) primaryMoveset.moves.push(pivot);
      
      // Hazards or status
      const hazard = hazardMoves.find(m => learnableMoves.includes(m));
      if (hazard) primaryMoveset.moves.push(hazard);
      
      // STAB moves
      const stabs = await findSTABMoves(pokemon, learnableMoves, true);
      primaryMoveset.moves.push(...stabs.slice(0, 2));
      
      // Recovery if available
      const recovery = recoveryMoves.find(m => learnableMoves.includes(m));
      if (recovery && primaryMoveset.moves.length < 4) {
        primaryMoveset.moves.push(recovery);
      }
      break;
    }

    default: {
      // Generic good moves
      const stabs = await findSTABMoves(pokemon, learnableMoves, true);
      primaryMoveset.moves.push(...stabs.slice(0, 2));
      
      const coverage = await findCoverageMoves(pokemon, learnableMoves, true);
      primaryMoveset.moves.push(...coverage.slice(0, 2));
    }
  }

  // Ensure we have exactly 4 moves
  while (primaryMoveset.moves.length < 4 && learnableMoves.length > primaryMoveset.moves.length) {
    const remainingMoves = learnableMoves.filter(m => !primaryMoveset.moves.includes(m));
    if (remainingMoves.length > 0) {
      primaryMoveset.moves.push(remainingMoves[0]);
    } else {
      break;
    }
  }

  primaryMoveset.moves = primaryMoveset.moves.slice(0, 4);
  movesets.push(primaryMoveset);

  // Generate 1-2 alternative sets
  if (pokemon.abilities && pokemon.abilities.length > 1) {
    const altMoveset = { ...primaryMoveset };
    altMoveset.name = `${role} (${pokemon.abilities[1].ability.name})`;
    altMoveset.ability = pokemon.abilities[1].ability.name;
    altMoveset.usage = 20 + Math.random() * 15; // 20-35% usage
    altMoveset.item = ITEMS_BY_ROLE[role]?.[1] || 'Choice Specs';
    movesets.push(altMoveset);
  }

  return movesets;
}

// Find STAB (Same Type Attack Bonus) moves
async function findSTABMoves(
  pokemon: Pokemon,
  learnableMoves: string[],
  preferPhysical: boolean
): Promise<string[]> {
  const types = pokemon.types?.map(t => t.type.name) || [];
  const stabMoves: string[] = [];

  // This is a simplified version - in a real implementation, 
  // we'd query the moves database for type and power
  const commonSTABMoves: Record<string, string[]> = {
    water: ['surf', 'hydro-pump', 'scald', 'waterfall', 'liquidation', 'aqua-jet'],
    fire: ['flamethrower', 'fire-blast', 'flare-blitz', 'fire-punch', 'heat-wave'],
    grass: ['energy-ball', 'leaf-blade', 'giga-drain', 'power-whip', 'leaf-storm'],
    electric: ['thunderbolt', 'thunder', 'wild-charge', 'volt-switch', 'discharge'],
    psychic: ['psychic', 'psyshock', 'zen-headbutt', 'psycho-cut', 'future-sight'],
    ice: ['ice-beam', 'blizzard', 'ice-punch', 'icicle-crash', 'freeze-dry'],
    dragon: ['dragon-pulse', 'draco-meteor', 'dragon-claw', 'outrage', 'dragon-rush'],
    dark: ['dark-pulse', 'knock-off', 'crunch', 'sucker-punch', 'foul-play'],
    fighting: ['close-combat', 'focus-blast', 'drain-punch', 'high-jump-kick', 'aura-sphere'],
    flying: ['air-slash', 'hurricane', 'brave-bird', 'aerial-ace', 'acrobatics'],
    poison: ['sludge-bomb', 'poison-jab', 'gunk-shot', 'sludge-wave', 'venoshock'],
    ground: ['earthquake', 'earth-power', 'drill-run', 'high-horsepower', 'stomping-tantrum'],
    rock: ['stone-edge', 'rock-slide', 'power-gem', 'rock-blast', 'head-smash'],
    bug: ['bug-buzz', 'u-turn', 'megahorn', 'x-scissor', 'first-impression'],
    ghost: ['shadow-ball', 'shadow-claw', 'phantom-force', 'hex', 'poltergeist'],
    steel: ['flash-cannon', 'iron-head', 'meteor-mash', 'heavy-slam', 'smart-strike'],
    fairy: ['moonblast', 'dazzling-gleam', 'play-rough', 'draining-kiss', 'misty-explosion'],
    normal: ['return', 'body-slam', 'double-edge', 'extreme-speed', 'hyper-voice'],
  };

  for (const type of types) {
    const typeMoves = commonSTABMoves[type] || [];
    const availableSTAB = typeMoves.filter(m => learnableMoves.includes(m));
    stabMoves.push(...availableSTAB);
  }

  return [...new Set(stabMoves)].slice(0, 3);
}

// Find coverage moves for type weaknesses
async function findCoverageMoves(
  pokemon: Pokemon,
  learnableMoves: string[],
  preferPhysical: boolean
): Promise<string[]> {
  const types = pokemon.types?.map(t => t.type.name) || [];
  const coverageMoves: string[] = [];

  // Common coverage moves by type they cover
  const coverageOptions: Record<string, string[]> = {
    fire: ['flamethrower', 'fire-blast', 'fire-punch', 'heat-wave'],
    water: ['scald', 'surf', 'aqua-tail', 'waterfall'],
    grass: ['energy-ball', 'grass-knot', 'power-whip', 'leaf-blade'],
    electric: ['thunderbolt', 'thunder-punch', 'wild-charge'],
    ice: ['ice-beam', 'ice-punch', 'freeze-dry'],
    fighting: ['focus-blast', 'close-combat', 'superpower', 'aura-sphere'],
    ground: ['earthquake', 'earth-power', 'drill-run'],
    rock: ['stone-edge', 'rock-slide', 'power-gem'],
  };

  // Get moves that aren't STAB
  for (const [type, moves] of Object.entries(coverageOptions)) {
    if (!types.includes(type)) {
      const available = moves.filter(m => learnableMoves.includes(m));
      coverageMoves.push(...available);
    }
  }

  return [...new Set(coverageMoves)].slice(0, 3);
}

// Find priority moves
function findPriorityMoves(learnableMoves: string[], preferPhysical: boolean): string[] {
  const priorityMoves = [
    'extreme-speed', 'fake-out', 'quick-attack', 'aqua-jet', 'bullet-punch',
    'ice-shard', 'shadow-sneak', 'sucker-punch', 'mach-punch', 'vacuum-wave',
  ];

  return priorityMoves.filter(m => learnableMoves.includes(m));
}

// Generate teammate suggestions based on type synergy
export async function generateTeammates(
  pokemon: Pokemon,
  species: PokemonSpecies
): Promise<TeammateSuggestion[]> {
  const types = pokemon.types?.map(t => t.type.name) || [];
  const teammates: TeammateSuggestion[] = [];

  // Type synergy suggestions
  const typeSynergies: Record<string, string[]> = {
    water: ['grass', 'electric'],
    fire: ['water', 'rock', 'ground'],
    grass: ['fire', 'flying', 'poison'],
    electric: ['ground'],
    flying: ['electric', 'rock', 'steel'],
    psychic: ['dark', 'steel'],
    dark: ['fighting', 'fairy'],
    dragon: ['steel', 'fairy'],
    fairy: ['steel', 'poison'],
    steel: ['fire', 'water', 'electric'],
    ground: ['water', 'grass', 'ice'],
    rock: ['water', 'grass', 'steel'],
    ice: ['fire', 'steel', 'water'],
    fighting: ['psychic', 'fairy', 'flying'],
    poison: ['ground', 'psychic', 'steel'],
    bug: ['flying', 'rock', 'fire'],
    ghost: ['dark', 'normal'],
    normal: ['fighting'],
  };

  // Common strong Pokemon by type
  const strongPokemonByType: Record<string, string[]> = {
    steel: ['ferrothorn', 'heatran', 'corviknight', 'scizor', 'skarmory'],
    water: ['toxapex', 'rotom-wash', 'gastrodon', 'swampert', 'slowbro'],
    dragon: ['garchomp', 'dragapult', 'dragonite', 'hydreigon', 'salamence'],
    fairy: ['clefable', 'tapu-koko', 'grimmsnarl', 'hatterene', 'togekiss'],
    ground: ['landorus-therian', 'garchomp', 'excadrill', 'hippowdon', 'gliscor'],
    flying: ['landorus-therian', 'tornadus-therian', 'zapdos', 'corviknight', 'mandibuzz'],
    dark: ['tyranitar', 'hydreigon', 'weavile', 'grimmsnarl', 'mandibuzz'],
    grass: ['ferrothorn', 'kartana', 'rillaboom', 'tangrowth', 'amoonguss'],
  };

  // Find types that cover our weaknesses
  const weaknessCovers = new Set<string>();
  types.forEach(type => {
    const covers = typeSynergies[type] || [];
    covers.forEach(t => weaknessCovers.add(t));
  });

  // Generate teammates
  weaknessCovers.forEach(coverType => {
    const options = strongPokemonByType[coverType] || [];
    if (options.length > 0) {
      const teammate = options[Math.floor(Math.random() * Math.min(2, options.length))];
      teammates.push({
        name: teammate,
        usage: 30 + Math.random() * 20, // 30-50%
        reason: `Provides ${coverType} coverage for ${types.join('/')}'s weaknesses`,
      });
    }
  });

  // Add some general good teammates
  const generalGoodTeammates = [
    { name: 'landorus-therian', reason: 'Excellent pivot and Intimidate support' },
    { name: 'ferrothorn', reason: 'Great defensive typing and hazard setter' },
    { name: 'tapu-koko', reason: 'Sets Electric Terrain and provides speed control' },
    { name: 'heatran', reason: 'Excellent defensive typing and Stealth Rock' },
    { name: 'toxapex', reason: 'Regenerator and excellent physical wall' },
  ];

  // Add 2-3 general teammates
  const remainingSlots = Math.max(0, 5 - teammates.length);
  for (let i = 0; i < Math.min(remainingSlots, 3); i++) {
    const teammate = generalGoodTeammates[i];
    if (!teammates.find(t => t.name === teammate.name)) {
      teammates.push({
        ...teammate,
        usage: 25 + Math.random() * 15, // 25-40%
      });
    }
  }

  return teammates.slice(0, 5);
}

// Generate counter suggestions based on type effectiveness
export async function generateCounters(
  pokemon: Pokemon,
  species: PokemonSpecies
): Promise<CounterSuggestion[]> {
  const types = pokemon.types?.map(t => t.type.name) || [];
  const stats = pokemon.stats?.reduce((acc, stat) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {} as Record<string, number>) || {};

  const counters: CounterSuggestion[] = [];

  // Type effectiveness counters
  const superEffectiveTypes: Record<string, string[]> = {
    water: ['grass', 'electric'],
    fire: ['water', 'ground', 'rock'],
    grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
    electric: ['ground'],
    psychic: ['bug', 'ghost', 'dark'],
    ice: ['fire', 'fighting', 'rock', 'steel'],
    dragon: ['ice', 'dragon', 'fairy'],
    dark: ['fighting', 'bug', 'fairy'],
    fighting: ['flying', 'psychic', 'fairy'],
    flying: ['electric', 'ice', 'rock'],
    poison: ['ground', 'psychic'],
    ground: ['water', 'grass', 'ice'],
    rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
    bug: ['fire', 'flying', 'rock'],
    ghost: ['ghost', 'dark'],
    steel: ['fire', 'fighting', 'ground'],
    fairy: ['poison', 'steel'],
    normal: ['fighting'],
  };

  // Strong Pokemon that can counter
  const countersByType: Record<string, { name: string; reason: string }[]> = {
    electric: [
      { name: 'tapu-koko', reason: 'Fast Electric attacker with Thunderbolt' },
      { name: 'zapdos', reason: 'Bulky with STAB Thunderbolt and Heat Wave' },
    ],
    water: [
      { name: 'rotom-wash', reason: 'Levitate ability and STAB Hydro Pump' },
      { name: 'toxapex', reason: 'Regenerator and Scald burns' },
    ],
    grass: [
      { name: 'ferrothorn', reason: 'Resists common moves and Power Whip' },
      { name: 'kartana', reason: 'Beast Boost and powerful Leaf Blade' },
    ],
    ground: [
      { name: 'landorus-therian', reason: 'Intimidate and STAB Earthquake' },
      { name: 'garchomp', reason: 'High speed and STAB Earthquake' },
    ],
    ice: [
      { name: 'weavile', reason: 'Priority Ice Shard and high Speed' },
      { name: 'kyurem', reason: 'Powerful Ice Beam and coverage' },
    ],
    fairy: [
      { name: 'tapu-lele', reason: 'Psychic Terrain and STAB Moonblast' },
      { name: 'clefable', reason: 'Magic Guard and Moonblast' },
    ],
  };

  // Find super effective types against this Pokemon
  const threatTypes = new Set<string>();
  types.forEach(type => {
    const threats = superEffectiveTypes[type] || [];
    threats.forEach(t => threatTypes.add(t));
  });

  // Generate counters based on threatening types
  threatTypes.forEach(threatType => {
    const potentialCounters = countersByType[threatType] || [];
    potentialCounters.forEach(counter => {
      // Calculate estimated win rate based on type advantage and stats
      const baseWinRate = 65; // Base win rate for type advantage
      const speedDiff = stats['speed'] < 80 ? 10 : 0; // Bonus if we're slow
      const bulkPenalty = (stats['hp'] + stats['defense'] + stats['special-defense']) < 200 ? 10 : 0;
      
      counters.push({
        name: counter.name,
        winRate: Math.min(90, baseWinRate + speedDiff + bulkPenalty),
        reason: counter.reason,
      });
    });
  });

  // Add stat-based counters
  if (stats['defense'] < stats['special-defense']) {
    counters.push({
      name: 'garchomp',
      winRate: 70,
      reason: 'Targets weaker Defense with Earthquake',
    });
  } else {
    counters.push({
      name: 'dragapult',
      winRate: 68,
      reason: 'Targets weaker Special Defense with Shadow Ball',
    });
  }

  // Sort by win rate and return top 5
  return counters
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 5);
}

// Calculate usage and win rate estimates based on tier and stats
export function calculateUsageStats(pokemon: Pokemon, tier: string | null): {
  usage: number;
  winRate: number;
} {
  const baseStatTotal = pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0;
  
  // Base usage on tier
  const tierUsage: Record<string, number> = {
    'Uber': 3.5,
    'OU': 4.5,
    'UU': 3.0,
    'RU': 2.0,
    'NU': 1.5,
    'PU': 1.0,
    'ZU': 0.5,
    'Untiered': 0.3,
  };

  const baseUsage = tierUsage[tier || 'Untiered'] || 0.5;
  
  // Adjust based on stats
  const statBonus = baseStatTotal > 600 ? 1.5 : 
                    baseStatTotal > 500 ? 1.0 :
                    baseStatTotal > 400 ? 0.5 : 0;

  const usage = Math.min(10, baseUsage + statBonus + (Math.random() * 0.5 - 0.25));

  // Calculate win rate based on tier and stats
  const baseWinRate = tier === 'Uber' ? 52 :
                      tier === 'OU' ? 50 :
                      tier === 'UU' ? 49 :
                      48;

  const statWinBonus = baseStatTotal > 600 ? 2 :
                       baseStatTotal > 500 ? 1 :
                       baseStatTotal > 400 ? 0 : -1;

  const winRate = Math.max(40, Math.min(60, baseWinRate + statWinBonus + (Math.random() * 4 - 2)));

  return { usage, winRate };
}