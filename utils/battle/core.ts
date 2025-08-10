import { EnhancedBattleState, PokemonBattleState, WeatherType, TerrainType, StatusEffect, StatStage } from '@/types/battle';
import { Pokemon, Move } from "../types/pokemon";

interface PokemonBattleConfig {
  level: number;
  ivs?: {
    hp?: number;
    attack?: number;
    defense?: number;
    specialAttack?: number;
    specialDefense?: number;
    speed?: number;
  };
  evs?: {
    hp?: number;
    attack?: number;
    defense?: number;
    specialAttack?: number;
    specialDefense?: number;
    speed?: number;
  };
  stats: {
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
}

export const createInitialBattleState = (
  pokemon1: Pokemon,
  pokemon2: Pokemon,
  config1: PokemonBattleConfig,
  config2: PokemonBattleConfig
): EnhancedBattleState => {
  return {
    field: {
      weather: 'none',
      weatherTurns: 0,
      terrain: 'none',
      terrainTurns: 0,
      trickRoom: false,
      trickRoomTurns: 0,
    },
    pokemon1: createPokemonBattleState(pokemon1, config1),
    pokemon2: createPokemonBattleState(pokemon2, config2),
    turnCount: 0,
    lastMoveUsed: null,
    currentTurn: 1,
  };
};

const createPokemonBattleState = (pokemon: Pokemon, config: PokemonBattleConfig): PokemonBattleState => {
  const maxHp = calculateHP(
    pokemon.stats?.find(s => s.stat.name === 'hp')?.base_stat || 100,
    config.ivs?.hp || 31,
    config.evs?.hp || 0,
    config.level
  );

  return {
    hp: maxHp,
    maxHp,
    status: 'none',
    statusTurns: 0,
    volatileStatus: new Set(),
    stats: {
      attack: config.stats.attack,
      defense: config.stats.defense,
      specialAttack: config.stats.specialAttack,
      specialDefense: config.stats.specialDefense,
      speed: config.stats.speed,
    },
    statStages: {
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
      accuracy: 0,
      evasion: 0,
    },
    ability: pokemon.abilities?.[0]?.ability.name || '',
    abilityActive: true,
    item: null,
    lastMoveFailed: false,
    lastMoveUsed: null,
    protectCounter: 0,
    isProtected: false,
    moveDisabled: null,
    confusionTurns: 0,
    sleepTurns: 0,
    poisonCounter: 1,
    isCharging: false,
    chargingMove: null,
  };
};

export const calculateHP = (base: number, iv: number, ev: number, level: number): number => {
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
};

export const getStatStageMultiplier = (stage: StatStage, isAccuracyOrEvasion = false): number => {
  if (isAccuracyOrEvasion) {
    const multipliers = [0.33, 0.36, 0.43, 0.5, 0.6, 0.75, 1, 1.33, 1.66, 2, 2.33, 2.66, 3];
    return multipliers[stage + 6];
  }
  
  if (stage >= 0) {
    return (2 + stage) / 2;
  } else {
    return 2 / (2 - stage);
  }
};

export const applyStatStageChange = (
  current: StatStage,
  change: number
): StatStage => {
  const newStage = Math.max(-6, Math.min(6, current + change));
  return newStage as StatStage;
};

export const getWeatherDamageMultiplier = (
  weather: WeatherType,
  moveType: string
): number => {
  if (weather === 'sun') {
    if (moveType === 'fire') return 1.5;
    if (moveType === 'water') return 0.5;
  } else if (weather === 'rain') {
    if (moveType === 'water') return 1.5;
    if (moveType === 'fire') return 0.5;
  }
  return 1;
};

export const getTerrainDamageMultiplier = (
  terrain: TerrainType,
  moveType: string,
  isGrounded: boolean
): number => {
  if (!isGrounded) return 1;
  
  if (terrain === 'electric' && moveType === 'electric') return 1.3;
  if (terrain === 'grassy' && moveType === 'grass') return 1.3;
  if (terrain === 'psychic' && moveType === 'psychic') return 1.3;
  if (terrain === 'misty' && moveType === 'dragon') return 0.5;
  
  return 1;
};

export const canPokemonMove = (pokemon: PokemonBattleState): { canMove: boolean; reason?: string } => {
  // Check paralysis
  if (pokemon.status === 'paralysis' && Math.random() < 0.25) {
    return { canMove: false, reason: 'fully paralyzed' };
  }
  
  // Check sleep
  if (pokemon.status === 'sleep') {
    return { canMove: false, reason: 'fast asleep' };
  }
  
  // Check freeze
  if (pokemon.status === 'freeze') {
    if (Math.random() < 0.2) {
      // 20% chance to thaw
      pokemon.status = 'none';
      return { canMove: true };
    }
    return { canMove: false, reason: 'frozen solid' };
  }
  
  // Check confusion
  if (pokemon.volatileStatus.has('confusion') && Math.random() < 0.33) {
    return { canMove: false, reason: 'hurt itself in confusion' };
  }
  
  // Check flinch
  if (pokemon.volatileStatus.has('flinch')) {
    pokemon.volatileStatus.delete('flinch'); // Flinch only lasts one turn
    return { canMove: false, reason: 'flinched' };
  }
  
  return { canMove: true };
};

export const calculateTurnOrder = (
  state: EnhancedBattleState,
  move1Priority: number,
  move2Priority: number
): 1 | 2 => {
  // Priority moves go first
  if (move1Priority > move2Priority) return 1;
  if (move2Priority > move1Priority) return 2;
  
  // Calculate effective speeds
  let speed1 = state.pokemon1.stats.speed * getStatStageMultiplier(state.pokemon1.statStages.speed);
  let speed2 = state.pokemon2.stats.speed * getStatStageMultiplier(state.pokemon2.statStages.speed);
  
  // Paralysis halves speed
  if (state.pokemon1.status === 'paralysis') speed1 *= 0.5;
  if (state.pokemon2.status === 'paralysis') speed2 *= 0.5;
  
  // Trick Room reverses speed order
  if (state.field.trickRoom) {
    return speed1 <= speed2 ? 1 : 2;
  }
  
  return speed1 >= speed2 ? 1 : 2;
};