import { PokemonBattleState, BattleField, DamageCalculation } from '@/types/battle';
import { Pokemon, Move } from "../types/pokemon";
import { getStatStageMultiplier, getWeatherDamageMultiplier, getTerrainDamageMultiplier } from './core';

export const calculateDamage = (
  attacker: { pokemon: Pokemon; state: PokemonBattleState },
  defender: { pokemon: Pokemon; state: PokemonBattleState },
  move: Move,
  field: BattleField
): DamageCalculation => {
  // Non-damaging moves
  if (!move.power || move.power === 0) {
    return {
      damage: 0,
      effectiveness: 1,
      isCritical: false,
      isSTAB: false,
      weatherBoost: false,
      terrainBoost: false,
      abilityModifier: 1,
    };
  }

  const level = 50; // Default level for calculations
  const movePower = move.power;
  const moveType = move.type.name;
  const isPhysical = move.damage_class.name === 'physical';
  
  // Get attack and defense stats with stages
  const attackStat = isPhysical ? 'attack' : 'specialAttack';
  const defenseStat = isPhysical ? 'defense' : 'specialDefense';
  
  let attack = attacker.state.stats[attackStat] * getStatStageMultiplier(attacker.state.statStages[attackStat]);
  let defense = defender.state.stats[defenseStat] * getStatStageMultiplier(defender.state.statStages[defenseStat]);
  
  // Burn halves physical attack
  if (attacker.state.status === 'burn' && isPhysical) {
    attack *= 0.5;
  }
  
  // Calculate base damage
  let damage = ((((2 * level) / 5 + 2) * movePower * attack / defense) / 50 + 2);
  
  // STAB (Same Type Attack Bonus)
  const isSTAB = attacker.pokemon.types?.some(type => type.type.name === moveType) || false;
  if (isSTAB) {
    damage *= 1.5;
  }
  
  // Type effectiveness
  const effectiveness = getTypeEffectiveness(moveType, defender.pokemon.types || []);
  damage *= effectiveness;
  
  // Weather modifier
  const weatherBoost = field.weather !== 'none';
  damage *= getWeatherDamageMultiplier(field.weather, moveType);
  
  // Terrain modifier
  const isGrounded = !defender.pokemon.types?.some(t => t.type.name === 'flying') && 
                     defender.state.ability !== 'levitate';
  const terrainBoost = field.terrain !== 'none' && isGrounded;
  damage *= getTerrainDamageMultiplier(field.terrain, moveType, isGrounded);
  
  // Critical hit
  const critChance = getCriticalHitChance(move.meta?.crit_rate || 0);
  const isCritical = Math.random() < critChance;
  if (isCritical) {
    damage *= 1.5;
  }
  
  // Random factor (85-100%)
  damage *= (Math.random() * 0.15 + 0.85);
  
  // Ability modifiers (simplified)
  let abilityModifier = 1;
  abilityModifier *= getAttackAbilityModifier(attacker.state.ability, moveType, defender.pokemon);
  abilityModifier *= getDefenseAbilityModifier(defender.state.ability, moveType, attacker.pokemon);
  damage *= abilityModifier;
  
  return {
    damage: Math.floor(damage),
    effectiveness,
    isCritical,
    isSTAB,
    weatherBoost,
    terrainBoost,
    abilityModifier,
  };
};

export const getTypeEffectiveness = (attackType: string, defenderTypes: { type: { name: string } }[]): number => {
  const typeChart: { [key: string]: { [key: string]: number } } = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
  };

  let multiplier = 1;
  for (const defenderType of defenderTypes) {
    const effectiveness = typeChart[attackType]?.[defenderType.type.name] ?? 1;
    multiplier *= effectiveness;
  }
  
  return multiplier;
};

const getCriticalHitChance = (critRate: number): number => {
  const chances = [0.0625, 0.125, 0.5, 1]; // Stage 0, 1, 2, 3+
  return chances[Math.min(critRate, 3)];
};

const getAttackAbilityModifier = (ability: string, moveType: string, defender: Pokemon): number => {
  let modifier = 1;
  
  // Type-boosting abilities
  if (ability === 'blaze' && moveType === 'fire') modifier *= 1.5;
  if (ability === 'torrent' && moveType === 'water') modifier *= 1.5;
  if (ability === 'overgrow' && moveType === 'grass') modifier *= 1.5;
  if (ability === 'swarm' && moveType === 'bug') modifier *= 1.5;
  
  // Other offensive abilities
  if (ability === 'adaptability') modifier *= 1.33; // Enhanced STAB
  if (ability === 'technician' && moveType === 'normal') modifier *= 1.5; // For moves with 60 or less power
  if (ability === 'iron-fist' && ['punch', 'fist'].some(w => moveType.includes(w))) modifier *= 1.2;
  
  return modifier;
};

const getDefenseAbilityModifier = (ability: string, moveType: string, attacker: Pokemon): number => {
  let modifier = 1;
  
  // Type resistances
  if (ability === 'heatproof' && moveType === 'fire') modifier *= 0.5;
  if (ability === 'water-absorb' && moveType === 'water') modifier = 0; // Actually heals, but we'll handle that separately
  if (ability === 'volt-absorb' && moveType === 'electric') modifier = 0;
  if (ability === 'levitate' && moveType === 'ground') modifier = 0;
  if (ability === 'flash-fire' && moveType === 'fire') modifier = 0;
  
  // Damage reduction abilities
  if (ability === 'thick-fat' && (moveType === 'fire' || moveType === 'ice')) modifier *= 0.5;
  if (ability === 'filter' || ability === 'solid-rock') modifier *= 0.75; // For super effective moves
  
  return modifier;
};