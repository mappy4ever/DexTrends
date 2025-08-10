import { EnhancedBattleState, BattleResult, KeyMoment } from '@/types/battle';
import { Pokemon, Move, PokemonMove } from "../../types/pokemon";
import { createInitialBattleState, PokemonBattleConfig } from './core';
import { executeTurn } from './moves';
import { processEndOfTurn } from './effects';

export const simulateBattleToCompletion = async (
  pokemon1: Pokemon,
  pokemon2: Pokemon,
  config1: unknown,
  config2: unknown,
  moves1: PokemonMove[],
  moves2: PokemonMove[],
  loadMoveData: (moveName: string) => Promise<Move | null>
): Promise<BattleResult> => {
  // Type guard to ensure configs match expected interface
  const safeConfig1 = config1 as PokemonBattleConfig;
  const safeConfig2 = config2 as PokemonBattleConfig;
  const state = createInitialBattleState(pokemon1, pokemon2, safeConfig1, safeConfig2);
  const keyMoments: KeyMoment[] = [];
  const totalDamage: [number, number] = [0, 0];
  
  // Load all move data upfront
  const moveData1: (Move | null)[] = await Promise.all(
    moves1.map(m => loadMoveData(m.move.name))
  );
  const moveData2: (Move | null)[] = await Promise.all(
    moves2.map(m => loadMoveData(m.move.name))
  );
  
  // Filter out null moves
  const validMoves1 = moveData1.filter((m): m is Move => m !== null);
  const validMoves2 = moveData2.filter((m): m is Move => m !== null);
  
  if (validMoves1.length === 0 || validMoves2.length === 0) {
    throw new Error('Pokemon must have at least one valid move');
  }
  
  // Battle loop
  while (state.pokemon1.hp > 0 && state.pokemon2.hp > 0 && state.turnCount < 100) {
    // Select moves (AI logic)
    const move1 = selectBestMove(state, 1, validMoves1, pokemon2);
    const move2 = selectBestMove(state, 2, validMoves2, pokemon1);
    
    // Track HP before turn
    const hp1Before = state.pokemon1.hp;
    const hp2Before = state.pokemon2.hp;
    
    // Execute turn
    const turnResult = executeTurn(state, pokemon1, pokemon2, move1, move2);
    keyMoments.push(...turnResult.keyMoments);
    
    // Calculate damage dealt
    const damage1 = hp2Before - state.pokemon2.hp;
    const damage2 = hp1Before - state.pokemon1.hp;
    totalDamage[0] += damage1;
    totalDamage[1] += damage2;
    
    // Process end of turn effects
    const endTurn1 = processEndOfTurn(state.pokemon1, state.field);
    const endTurn2 = processEndOfTurn(state.pokemon2, state.field);
    
    // Update field effects
    if (state.field.weatherTurns > 0) {
      state.field.weatherTurns--;
      if (state.field.weatherTurns === 0) {
        state.field.weather = 'none';
      }
    }
    if (state.field.terrainTurns > 0) {
      state.field.terrainTurns--;
      if (state.field.terrainTurns === 0) {
        state.field.terrain = 'none';
      }
    }
  }
  
  // Determine winner
  const winner = state.pokemon1.hp > 0 ? 1 : 2;
  
  return {
    winner,
    turns: state.turnCount,
    keyMoments: keyMoments.slice(0, 10), // Keep top 10 moments
    finalHP: [state.pokemon1.hp, state.pokemon2.hp],
    totalDamageDealt: totalDamage,
  };
};

const selectBestMove = (
  state: EnhancedBattleState,
  player: 1 | 2,
  moves: Move[],
  opponent: Pokemon
): Move => {
  const attacker = player === 1 ? state.pokemon1 : state.pokemon2;
  const defender = player === 1 ? state.pokemon2 : state.pokemon1;
  
  // Score each move
  const moveScores = moves.map(move => {
    let score = 0;
    
    // Base score from power
    if (move.power) {
      score += move.power;
    }
    
    // STAB bonus
    const hasSTAB = (player === 1 ? state.pokemon1 : state.pokemon2).ability; // Simplified check
    if (hasSTAB) {
      score += 20;
    }
    
    // Type effectiveness (simplified)
    // Would need full type chart implementation
    
    // Status move value
    if (!move.power && move.meta?.ailment?.name && defender.status === 'none') {
      score += 50; // Value status moves when opponent has no status
    }
    
    // Healing move value
    if (move.meta?.healing && attacker.hp < attacker.maxHp * 0.5) {
      score += 80;
    }
    
    // Priority move value when low HP
    if (move.priority > 0 && attacker.hp < attacker.maxHp * 0.3) {
      score += 40;
    }
    
    // Avoid recoil when low HP
    if (move.meta?.drain && move.meta.drain < 0 && attacker.hp < attacker.maxHp * 0.3) {
      score -= 30;
    }
    
    return { move, score };
  });
  
  // Sort by score and add some randomness
  moveScores.sort((a, b) => b.score - a.score);
  
  // 70% chance to pick best move, 20% second best, 10% random
  const rand = Math.random();
  if (rand < 0.7 && moveScores[0]) {
    return moveScores[0].move;
  } else if (rand < 0.9 && moveScores[1]) {
    return moveScores[1].move;
  }
  
  // Random fallback
  return moves[Math.floor(Math.random() * moves.length)];
};