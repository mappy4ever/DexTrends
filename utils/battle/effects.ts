import { PokemonBattleState, StatusEffect, BattleField, MoveEffect } from '@/types/battle';
import { Move } from "../../types/pokemon";
import { applyStatStageChange } from './core';

export const applyStatusEffect = (
  pokemon: PokemonBattleState,
  status: StatusEffect,
  sourceMove?: string
): { success: boolean; message: string } => {
  // Can't apply status if already has one
  if (pokemon.status !== 'none') {
    return { success: false, message: 'already has a status condition' };
  }
  
  // Some status immunities
  if (status === 'burn' && pokemon.ability === 'water-veil') {
    return { success: false, message: 'protected by Water Veil' };
  }
  if (status === 'poison' && pokemon.ability === 'immunity') {
    return { success: false, message: 'protected by Immunity' };
  }
  if (status === 'sleep' && pokemon.ability === 'insomnia') {
    return { success: false, message: 'protected by Insomnia' };
  }
  
  pokemon.status = status;
  
  // Set initial counters
  if (status === 'sleep') {
    pokemon.sleepTurns = Math.floor(Math.random() * 3) + 1; // 1-3 turns
  }
  if (status === 'badpoison') {
    pokemon.poisonCounter = 1;
  }
  
  return { success: true, message: getStatusMessage(status) };
};

const getStatusMessage = (status: StatusEffect): string => {
  switch (status) {
    case 'burn': return 'was burned!';
    case 'freeze': return 'was frozen solid!';
    case 'paralysis': return 'is paralyzed!';
    case 'poison': return 'was poisoned!';
    case 'badpoison': return 'was badly poisoned!';
    case 'sleep': return 'fell asleep!';
    default: return '';
  }
};

export const processStatusDamage = (pokemon: PokemonBattleState): number => {
  let damage = 0;
  
  switch (pokemon.status) {
    case 'burn':
      damage = Math.floor(pokemon.maxHp / 16);
      break;
    case 'poison':
      damage = Math.floor(pokemon.maxHp / 8);
      break;
    case 'badpoison':
      damage = Math.floor(pokemon.maxHp * pokemon.poisonCounter / 16);
      pokemon.poisonCounter++;
      break;
  }
  
  pokemon.hp = Math.max(0, pokemon.hp - damage);
  return damage;
};

export const processEndOfTurn = (
  pokemon: PokemonBattleState,
  field: BattleField
): { damage: number; healed: number; messages: string[] } => {
  const messages: string[] = [];
  let damage = 0;
  let healed = 0;
  
  // Status damage
  const statusDamage = processStatusDamage(pokemon);
  if (statusDamage > 0) {
    damage += statusDamage;
    messages.push(`hurt by ${pokemon.status}!`);
  }
  
  // Weather damage
  if (field.weather === 'sandstorm' && 
      !['rock', 'ground', 'steel'].includes(pokemon.ability) &&
      pokemon.ability !== 'sand-veil' && pokemon.ability !== 'sand-rush') {
    const weatherDamage = Math.floor(pokemon.maxHp / 16);
    pokemon.hp = Math.max(0, pokemon.hp - weatherDamage);
    damage += weatherDamage;
    messages.push('buffeted by the sandstorm!');
  }
  
  if (field.weather === 'hail' && 
      pokemon.ability !== 'ice-body' && pokemon.ability !== 'snow-cloak') {
    const weatherDamage = Math.floor(pokemon.maxHp / 16);
    pokemon.hp = Math.max(0, pokemon.hp - weatherDamage);
    damage += weatherDamage;
    messages.push('buffeted by the hail!');
  }
  
  // Terrain healing
  if (field.terrain === 'grassy' && pokemon.ability !== 'levitate') {
    const terrainHeal = Math.floor(pokemon.maxHp / 16);
    const actualHeal = Math.min(terrainHeal, pokemon.maxHp - pokemon.hp);
    pokemon.hp += actualHeal;
    healed += actualHeal;
    if (actualHeal > 0) {
      messages.push('healed by the grassy terrain!');
    }
  }
  
  // Ability effects
  if (pokemon.ability === 'speed-boost') {
    const newSpeed = applyStatStageChange(pokemon.statStages.speed, 1);
    if (newSpeed !== pokemon.statStages.speed) {
      pokemon.statStages.speed = newSpeed;
      messages.push("Speed Boost raised its Speed!");
    }
  }
  
  // Reduce sleep counter
  if (pokemon.status === 'sleep' && pokemon.sleepTurns > 0) {
    pokemon.sleepTurns--;
    if (pokemon.sleepTurns === 0) {
      pokemon.status = 'none';
      messages.push('woke up!');
    }
  }
  
  // Clear volatile status
  pokemon.volatileStatus.delete('flinch');
  
  return { damage, healed, messages };
};

export const parseMoveEffects = (move: Move): MoveEffect => {
  const effects: MoveEffect = {};
  
  // Priority
  if (move.priority !== 0) {
    effects.priority = move.priority;
  }
  
  // Critical hit rate
  if (move.meta?.crit_rate && move.meta.crit_rate > 0) {
    effects.critRate = move.meta.crit_rate;
  }
  
  // Status effect
  if (move.meta?.ailment && move.meta.ailment.name !== 'none') {
    effects.statusEffect = {
      status: mapAilmentToStatus(move.meta.ailment.name),
      chance: move.meta.ailment_chance || 100,
    };
  }
  
  // Stat changes
  if (move.stat_changes && move.stat_changes.length > 0) {
    effects.statChanges = move.stat_changes.map(change => ({
      stat: mapStatName(change.stat.name),
      stages: change.change,
      chance: move.meta?.stat_chance || 100,
      target: change.change > 0 && move.target.name === 'user' ? 'self' : 'opponent',
    }));
  }
  
  // Flinch
  if (move.meta?.flinch_chance && move.meta.flinch_chance > 0) {
    effects.flinchChance = move.meta.flinch_chance;
  }
  
  // Healing
  if (move.meta?.healing && move.meta.healing > 0) {
    effects.healing = move.meta.healing;
  }
  
  // Recoil
  if (move.meta?.min_hits && move.meta.max_hits) {
    effects.multiHit = {
      min: move.meta.min_hits,
      max: move.meta.max_hits,
    };
  }
  
  // Drain
  if (move.meta?.drain && move.meta.drain !== 0) {
    if (move.meta.drain > 0) {
      effects.drain = move.meta.drain;
    } else {
      effects.recoil = Math.abs(move.meta.drain);
    }
  }
  
  return effects;
};

const mapAilmentToStatus = (ailment: string): StatusEffect => {
  const mapping: { [key: string]: StatusEffect } = {
    'burn': 'burn',
    'freeze': 'freeze',
    'paralysis': 'paralysis',
    'poison': 'poison',
    'bad-poison': 'badpoison',
    'sleep': 'sleep',
  };
  return mapping[ailment] || 'none';
};

const mapStatName = (statName: string): string => {
  const mapping: { [key: string]: string } = {
    'attack': 'attack',
    'defense': 'defense',
    'special-attack': 'specialAttack',
    'special-defense': 'specialDefense',
    'speed': 'speed',
    'accuracy': 'accuracy',
    'evasion': 'evasion',
  };
  return mapping[statName] || statName;
};

export const applyMoveEffects = (
  attacker: PokemonBattleState,
  defender: PokemonBattleState,
  effects: MoveEffect,
  damage: number
): string[] => {
  const messages: string[] = [];
  
  // Apply status effect
  if (effects.statusEffect && Math.random() * 100 < effects.statusEffect.chance) {
    const result = applyStatusEffect(defender, effects.statusEffect.status);
    if (result.success) {
      messages.push(result.message);
    }
  }
  
  // Apply stat changes
  if (effects.statChanges) {
    for (const change of effects.statChanges) {
      if (Math.random() * 100 < change.chance) {
        const target = change.target === 'self' ? attacker : defender;
        const statName = change.stat as keyof typeof target.statStages;
        const oldStage = target.statStages[statName];
        const newStage = applyStatStageChange(oldStage, change.stages);
        
        if (newStage !== oldStage) {
          target.statStages[statName] = newStage;
          const stageDiff = Math.abs(change.stages);
          const direction = change.stages > 0 ? 'rose' : 'fell';
          const amount = stageDiff > 1 ? 'sharply' : '';
          messages.push(`${change.stat} ${direction} ${amount}!`);
        }
      }
    }
  }
  
  // Apply flinch
  if (effects.flinchChance && Math.random() * 100 < effects.flinchChance) {
    defender.volatileStatus.add('flinch');
  }
  
  // Apply healing
  if (effects.healing && damage === 0) {
    const healAmount = Math.floor(attacker.maxHp * effects.healing / 100);
    const actualHeal = Math.min(healAmount, attacker.maxHp - attacker.hp);
    attacker.hp += actualHeal;
    if (actualHeal > 0) {
      messages.push('HP was restored!');
    }
  }
  
  // Apply drain
  if (effects.drain && damage > 0) {
    const drainAmount = Math.floor(damage * effects.drain / 100);
    const actualHeal = Math.min(drainAmount, attacker.maxHp - attacker.hp);
    attacker.hp += actualHeal;
    if (actualHeal > 0) {
      messages.push('drained HP!');
    }
  }
  
  // Apply recoil
  if (effects.recoil && damage > 0) {
    const recoilDamage = Math.floor(damage * effects.recoil / 100);
    attacker.hp = Math.max(0, attacker.hp - recoilDamage);
    messages.push('damaged by recoil!');
  }
  
  return messages;
};