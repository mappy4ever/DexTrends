import { EnhancedBattleState, BattleAction, KeyMoment } from '@/types/battle';
import { Pokemon, Move } from "../types/pokemon";
import { canPokemonMove, calculateTurnOrder } from './core';
import { calculateDamage } from './damage';
import { parseMoveEffects, applyMoveEffects, applyStatusEffect } from './effects';
import { isObject, hasProperty, isNumber } from '../typeGuards';

export interface MoveExecutionResult {
  success: boolean;
  damage: number;
  messages: string[];
  keyMoments: KeyMoment[];
}

export const executeTurn = (
  state: EnhancedBattleState,
  pokemon1Data: Pokemon,
  pokemon2Data: Pokemon,
  move1: Move | null,
  move2: Move | null
): { state: EnhancedBattleState; log: string[]; keyMoments: KeyMoment[] } => {
  const log: string[] = [];
  const keyMoments: KeyMoment[] = [];
  
  // Determine turn order
  const move1Priority = move1?.priority || 0;
  const move2Priority = move2?.priority || 0;
  const firstMover = calculateTurnOrder(state, move1Priority, move2Priority);
  
  // Execute moves in order
  if (firstMover === 1 && move1) {
    const result = executeMove(state, 1, pokemon1Data, pokemon2Data, move1);
    log.push(...result.messages);
    keyMoments.push(...result.keyMoments);
    
    // Check if Pokemon 2 can still move
    if (state.pokemon2.hp > 0 && move2) {
      const result2 = executeMove(state, 2, pokemon2Data, pokemon1Data, move2);
      log.push(...result2.messages);
      keyMoments.push(...result2.keyMoments);
    }
  } else if (move2) {
    const result = executeMove(state, 2, pokemon2Data, pokemon1Data, move2);
    log.push(...result.messages);
    keyMoments.push(...result.keyMoments);
    
    // Check if Pokemon 1 can still move
    if (state.pokemon1.hp > 0 && move1) {
      const result1 = executeMove(state, 1, pokemon1Data, pokemon2Data, move1);
      log.push(...result1.messages);
      keyMoments.push(...result1.keyMoments);
    }
  }
  
  state.turnCount++;
  return { state, log, keyMoments };
};

export const executeMove = (
  state: EnhancedBattleState,
  attackerNum: 1 | 2,
  attackerData: Pokemon,
  defenderData: Pokemon,
  move: Move
): MoveExecutionResult => {
  const attacker = attackerNum === 1 ? state.pokemon1 : state.pokemon2;
  const defender = attackerNum === 1 ? state.pokemon2 : state.pokemon1;
  const messages: string[] = [];
  const keyMoments: KeyMoment[] = [];
  
  // Check if Pokemon can move
  const moveCheck = canPokemonMove(attacker);
  if (!moveCheck.canMove) {
    messages.push(`can't move! (${moveCheck.reason})`);
    
    // Handle confusion self-damage
    if (moveCheck.reason === 'hurt itself in confusion') {
      const confusionDamage = Math.floor(attacker.maxHp / 8);
      attacker.hp = Math.max(0, attacker.hp - confusionDamage);
      messages.push(`hurt itself in its confusion!`);
    }
    
    return { success: false, damage: 0, messages, keyMoments };
  }
  
  // Check accuracy
  const accuracy = calculateAccuracy(move, attacker, defender);
  if (Math.random() > accuracy) {
    messages.push(`${move.name} missed!`);
    return { success: false, damage: 0, messages, keyMoments };
  }
  
  // Check if protected
  if (defender.isProtected && move.target.name !== 'user') {
    messages.push(`protected itself!`);
    return { success: false, damage: 0, messages, keyMoments };
  }
  
  messages.push(`used ${move.name}!`);
  
  // Calculate and apply damage
  const damageCalc = calculateDamage(
    { pokemon: attackerData, state: attacker },
    { pokemon: defenderData, state: defender },
    move,
    state.field
  );
  
  let totalDamage = damageCalc.damage;
  
  // Handle multi-hit moves
  const effects = parseMoveEffects(move);
  if (effects.multiHit) {
    const hits = getMultiHitCount(effects.multiHit.min, effects.multiHit.max);
    totalDamage = damageCalc.damage * hits;
    messages.push(`Hit ${hits} times!`);
  }
  
  // Apply damage
  defender.hp = Math.max(0, defender.hp - totalDamage);
  
  // Add effectiveness message
  if (damageCalc.effectiveness > 1) {
    messages.push("It's super effective!");
    keyMoments.push({
      turn: state.turnCount,
      description: `Super effective ${move.name}!`,
      type: 'super_effective',
    });
  } else if (damageCalc.effectiveness < 1 && damageCalc.effectiveness > 0) {
    messages.push("It's not very effective...");
  } else if (damageCalc.effectiveness === 0) {
    messages.push("It had no effect!");
  }
  
  // Critical hit
  if (damageCalc.isCritical) {
    messages.push("A critical hit!");
    keyMoments.push({
      turn: state.turnCount,
      description: `Critical hit with ${move.name}!`,
      type: 'critical',
    });
  }
  
  // Apply move effects
  const effectMessages = applyMoveEffects(attacker, defender, effects, totalDamage);
  messages.push(...effectMessages);
  
  // Handle special move effects
  handleSpecialMoveEffects(state, move, attackerNum);
  
  // Update last move used
  attacker.lastMoveUsed = move.name;
  state.lastMoveUsed = move.name;
  
  // Check for KO
  if (defender.hp === 0) {
    messages.push(`was knocked out!`);
    keyMoments.push({
      turn: state.turnCount,
      description: `${move.name} knocked out the opponent!`,
      type: 'ko',
    });
  }
  
  return { success: true, damage: totalDamage, messages, keyMoments };
};

const calculateAccuracy = (move: Move, attacker: unknown, defender: unknown): number => {
  if (!move.accuracy) return 1; // Moves with no accuracy always hit
  
  let accuracy = move.accuracy / 100;
  
  // Apply accuracy/evasion stages if stat stages exist
  if (isObject(attacker) && hasProperty(attacker, 'statStages') &&
      isObject(defender) && hasProperty(defender, 'statStages') &&
      isObject(attacker.statStages) && hasProperty(attacker.statStages, 'accuracy') &&
      isObject(defender.statStages) && hasProperty(defender.statStages, 'evasion') &&
      isNumber(attacker.statStages.accuracy) && isNumber(defender.statStages.evasion)) {
    const accuracyMultiplier = attacker.statStages.accuracy - defender.statStages.evasion;
    if (accuracyMultiplier > 0) {
      accuracy *= (3 + accuracyMultiplier) / 3;
    } else if (accuracyMultiplier < 0) {
      accuracy *= 3 / (3 - accuracyMultiplier);
    }
  }
  
  // Weather effects
  // Thunder in rain, Blizzard in hail always hit
  // (implement based on move name and weather)
  
  return Math.min(1, accuracy);
};

const getMultiHitCount = (min: number, max: number): number => {
  if (min === max) return min;
  
  // 2-5 hit distribution
  if (min === 2 && max === 5) {
    const rand = Math.random();
    if (rand < 0.375) return 2;
    if (rand < 0.75) return 3;
    if (rand < 0.875) return 4;
    return 5;
  }
  
  // Default: random between min and max
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const handleSpecialMoveEffects = (state: EnhancedBattleState, move: Move, attackerNum: 1 | 2): void => {
  const moveName = move.name.toLowerCase();
  
  // Weather moves
  if (moveName === 'sunny-day') {
    state.field.weather = 'sun';
    state.field.weatherTurns = 5;
  } else if (moveName === 'rain-dance') {
    state.field.weather = 'rain';
    state.field.weatherTurns = 5;
  } else if (moveName === 'sandstorm') {
    state.field.weather = 'sandstorm';
    state.field.weatherTurns = 5;
  } else if (moveName === 'hail') {
    state.field.weather = 'hail';
    state.field.weatherTurns = 5;
  }
  
  // Terrain moves
  if (moveName === 'electric-terrain') {
    state.field.terrain = 'electric';
    state.field.terrainTurns = 5;
  } else if (moveName === 'grassy-terrain') {
    state.field.terrain = 'grassy';
    state.field.terrainTurns = 5;
  } else if (moveName === 'misty-terrain') {
    state.field.terrain = 'misty';
    state.field.terrainTurns = 5;
  } else if (moveName === 'psychic-terrain') {
    state.field.terrain = 'psychic';
    state.field.terrainTurns = 5;
  }
  
  // Protection moves
  if (moveName === 'protect' || moveName === 'detect') {
    const attacker = attackerNum === 1 ? state.pokemon1 : state.pokemon2;
    attacker.isProtected = true;
    attacker.protectCounter++;
  }
};