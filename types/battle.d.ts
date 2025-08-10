export type WeatherType = 'none' | 'sun' | 'rain' | 'sandstorm' | 'hail';
export type TerrainType = 'none' | 'electric' | 'grassy' | 'misty' | 'psychic';
export type StatusEffect = 'none' | 'burn' | 'freeze' | 'paralysis' | 'poison' | 'badpoison' | 'sleep';
export type VolatileStatus = 'confusion' | 'flinch' | 'taunt' | 'encore' | 'disable';
export type StatName = 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed';
export type StatStage = -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface BattleField {
  weather: WeatherType;
  weatherTurns: number;
  terrain: TerrainType;
  terrainTurns: number;
  trickRoom: boolean;
  trickRoomTurns: number;
}

export interface PokemonBattleState {
  hp: number;
  maxHp: number;
  status: StatusEffect;
  statusTurns: number;
  volatileStatus: Set<VolatileStatus>;
  
  stats: {
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  
  statStages: {
    attack: StatStage;
    defense: StatStage;
    specialAttack: StatStage;
    specialDefense: StatStage;
    speed: StatStage;
    accuracy: StatStage;
    evasion: StatStage;
  };
  
  ability: string;
  abilityActive: boolean;
  item: string | null;
  
  lastMoveFailed: boolean;
  lastMoveUsed: string | null;
  protectCounter: number;
  isProtected: boolean;
  moveDisabled: string | null;
  confusionTurns: number;
  sleepTurns: number;
  
  // For badly poisoned
  poisonCounter: number;
  
  // For multi-turn moves
  isCharging: boolean;
  chargingMove: string | null;
}

export interface EnhancedBattleState {
  field: BattleField;
  pokemon1: PokemonBattleState;
  pokemon2: PokemonBattleState;
  turnCount: number;
  lastMoveUsed: string | null;
  currentTurn: 1 | 2;
}

export interface MoveEffect {
  statusEffect?: {
    status: StatusEffect;
    chance: number;
  };
  statChanges?: {
    stat: StatName | 'accuracy' | 'evasion';
    stages: number;
    chance: number;
    target: 'self' | 'opponent';
  }[];
  weather?: WeatherType;
  terrain?: TerrainType;
  healing?: number; // Percentage of max HP
  recoil?: number; // Percentage of damage dealt
  drain?: number; // Percentage of damage dealt to heal
  multiHit?: {
    min: number;
    max: number;
  };
  priority?: number;
  critRate?: number;
  flinchChance?: number;
  confusion?: number;
}

export interface DamageCalculation {
  damage: number;
  effectiveness: number;
  isCritical: boolean;
  isSTAB: boolean;
  weatherBoost: boolean;
  terrainBoost: boolean;
  abilityModifier: number;
}

export interface BattleAction {
  player: 1 | 2;
  move: string;
  priority: number;
  speed: number;
}

export interface BattleResult {
  winner: 1 | 2 | string; // Allow string names as well as player numbers
  turns: number;
  keyMoments: KeyMoment[];
  finalHP: [number, number];
  totalDamageDealt: [number, number];
  // Additional properties for battle history display
  date?: Date;
  winnerPokemon?: string;
  loser?: string;
  loserPokemon?: string;
  moves?: unknown[]; // Can be string or BattleLog objects
}

export interface KeyMoment {
  turn: number;
  description: string;
  type: 'critical' | 'super_effective' | 'status' | 'ko' | 'weather' | 'terrain';
}