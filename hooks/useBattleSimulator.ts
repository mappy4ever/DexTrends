/**
 * useBattleSimulator Hook
 *
 * Manages all state and logic for the Pokemon Battle Simulator.
 * Extracted from the monolithic battle-simulator.tsx page.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchJSON } from '@/utils/unifiedFetch';
import { POKEAPI } from '@/config/api';
import { createInitialBattleState } from '@/utils/battle/core';
import { simulateBattleToCompletion } from '@/utils/battle/simulation';
import logger from '@/utils/logger';
import type { Pokemon, PokemonMove, PokemonSpecies, Nature, Move } from '@/types/pokemon';
import type { EnhancedBattleState, BattleResult } from '@/types/battle';

// Types
export interface BattleConfig {
  level: number;
  nature: string;
  ivs: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  evs: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  moves: PokemonMove[];
  selectedMoves: PokemonMove[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  manualStats: boolean;
}

export interface BattleLog {
  player: string;
  pokemon: string;
  action: string;
  damage?: number;
  effectiveness?: number;
  critical?: boolean;
  timestamp: Date;
}

export interface SelectorPokemon {
  name: string;
  url: string;
}

export interface DamageEffect {
  damage: number;
  position: 'left' | 'right';
  isCritical: boolean;
  effectiveness: number;
}

export interface Announcement {
  message: string;
  type: 'attack' | 'status' | 'victory' | 'info';
}

const DEFAULT_CONFIG: BattleConfig = {
  level: 50,
  nature: 'hardy',
  ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 },
  evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
  moves: [],
  selectedMoves: [],
  stats: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
  manualStats: false
};

// Type effectiveness chart
const TYPE_CHART: Record<string, Record<string, number>> = {
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

export function useBattleSimulator() {
  // Pokemon state
  const [selectedPokemon1, setSelectedPokemon1] = useState<Pokemon | null>(null);
  const [selectedPokemon2, setSelectedPokemon2] = useState<Pokemon | null>(null);
  const [pokemon1Config, setPokemon1Config] = useState<BattleConfig>({ ...DEFAULT_CONFIG });
  const [pokemon2Config, setPokemon2Config] = useState<BattleConfig>({ ...DEFAULT_CONFIG });
  const [pokemonList, setPokemonList] = useState<SelectorPokemon[]>([]);
  const [availableMoves1, setAvailableMoves1] = useState<PokemonMove[]>([]);
  const [availableMoves2, setAvailableMoves2] = useState<PokemonMove[]>([]);

  // Battle state
  const [battleState, setBattleState] = useState<EnhancedBattleState | null>(null);
  const [battleActive, setBattleActive] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<1 | 2 | null>(null);
  const [currentHP1, setCurrentHP1] = useState(0);
  const [currentHP2, setCurrentHP2] = useState(0);
  const [winner, setWinner] = useState<1 | 2 | null>(null);

  // Battle log and history
  const [battleLog, setBattleLog] = useState<(BattleLog | string)[]>([]);
  const [battleHistory, setBattleHistory] = useState<BattleResult[]>([]);
  const [battleResults, setBattleResults] = useState<BattleResult | null>(null);

  // Player names
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');

  // UI state
  const [loading, setLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showBattleResults, setShowBattleResults] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);

  // Visual effects
  const [damageEffect, setDamageEffect] = useState<DamageEffect | null>(null);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [hitTarget, setHitTarget] = useState<1 | 2 | null>(null);

  // Data
  const [allNatures, setAllNatures] = useState<Nature[]>([]);
  const [movesData, setMovesData] = useState<Record<string, Move>>({});

  // Calculate stat using Pokemon formula
  const calculateStat = useCallback((
    baseStat: number,
    iv: number,
    ev: number,
    level: number,
    nature: Nature | undefined,
    statName: string,
    isHP = false
  ): number => {
    if (isHP) {
      return Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100 + level + 10);
    }

    let stat = Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100 + 5);

    if (nature) {
      if (nature.increased_stat?.name === statName) {
        stat = Math.floor(stat * 1.1);
      } else if (nature.decreased_stat?.name === statName) {
        stat = Math.floor(stat * 0.9);
      }
    }

    return stat;
  }, []);

  // Calculate all stats for a Pokemon
  const calculateAllStats = useCallback((pokemon: Pokemon, config: BattleConfig): BattleConfig['stats'] => {
    if (!pokemon?.stats) return config.stats;

    const nature = allNatures.find(n => n.name === config.nature);
    const statsMap: Record<string, keyof BattleConfig['stats']> = {
      hp: 'hp',
      attack: 'attack',
      defense: 'defense',
      'special-attack': 'specialAttack',
      'special-defense': 'specialDefense',
      speed: 'speed'
    };

    const newStats: BattleConfig['stats'] = {
      hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0
    };

    pokemon.stats.forEach(stat => {
      const statKey = statsMap[stat.stat.name];
      if (statKey) {
        newStats[statKey] = calculateStat(
          stat.base_stat,
          config.ivs[statKey],
          config.evs[statKey],
          config.level,
          nature,
          stat.stat.name,
          stat.stat.name === 'hp'
        );
      }
    });

    return newStats;
  }, [allNatures, calculateStat]);

  // Get type effectiveness
  const getTypeEffectiveness = useCallback((moveType: string, defenderTypes: { type: { name: string } }[]): number => {
    let multiplier = 1;
    defenderTypes.forEach(defType => {
      const effectiveness = TYPE_CHART[moveType]?.[defType.type.name];
      if (effectiveness !== undefined) {
        multiplier *= effectiveness;
      }
    });
    return multiplier;
  }, []);

  // Calculate damage
  const calculateDamage = useCallback((
    attacker: { pokemon: Pokemon; config: BattleConfig },
    defender: { pokemon: Pokemon; config: BattleConfig },
    move: PokemonMove
  ): { damage: number; isCritical: boolean; effectiveness: number } => {
    const level = attacker.config.level;
    const moveData = movesData[move.move.name];

    if (!moveData?.power) return { damage: 0, isCritical: false, effectiveness: 1 };

    const isPhysical = moveData.damage_class.name === 'physical';
    const attackStat = isPhysical ? 'attack' : 'specialAttack';
    const defenseStat = isPhysical ? 'defense' : 'specialDefense';

    const attack = attacker.config.stats[attackStat];
    const defense = defender.config.stats[defenseStat];
    const power = moveData.power;

    let damage = ((((2 * level) / 5 + 2) * power * attack / defense) / 50 + 2);

    // STAB
    const hasSTAB = attacker.pokemon.types?.some(type => type.type.name === moveData.type?.name);
    if (hasSTAB) damage *= 1.5;

    // Type effectiveness
    const effectiveness = moveData.type && defender.pokemon.types
      ? getTypeEffectiveness(moveData.type.name, defender.pokemon.types)
      : 1;
    damage *= effectiveness;

    // Random factor
    damage *= (Math.random() * 0.15 + 0.85);

    // Critical hit
    const isCritical = Math.random() < 0.0625;
    if (isCritical) damage *= 1.5;

    return { damage: Math.floor(damage), isCritical, effectiveness };
  }, [movesData, getTypeEffectiveness]);

  // Load Pokemon list
  const loadPokemonList = useCallback(async () => {
    try {
      const response = await fetchJSON<{ results: SelectorPokemon[] }>(POKEAPI.pokemonList(1010, 0));

      if (!response?.results?.length) {
        setPokemonList([
          { name: 'pikachu', url: POKEAPI.pokemon(25) },
          { name: 'charizard', url: POKEAPI.pokemon(6) },
          { name: 'bulbasaur', url: POKEAPI.pokemon(1) },
          { name: 'mewtwo', url: POKEAPI.pokemon(150) },
        ]);
        return;
      }

      setPokemonList(response.results);
    } catch (error) {
      logger.error('Failed to load Pokemon list:', { error });
      setPokemonList([{ name: 'pikachu', url: POKEAPI.pokemon(25) }]);
    }
  }, []);

  // Load natures
  const loadNatures = useCallback(async () => {
    try {
      const response = await fetchJSON<{ results: Array<{ name: string; url: string }> }>(POKEAPI.natureList());

      if (!response?.results?.length) {
        setAllNatures([
          { id: 1, name: 'hardy', increased_stat: null, decreased_stat: null } as Nature,
          { id: 2, name: 'adamant', increased_stat: { name: 'attack' }, decreased_stat: { name: 'special-attack' } } as Nature,
        ]);
        return;
      }

      const naturePromises = response.results.map(nature => fetchJSON<Nature>(nature.url));
      const natureData = await Promise.all(naturePromises);
      setAllNatures(natureData.filter((n): n is Nature => n !== null));
    } catch (error) {
      logger.error('Failed to load natures:', { error });
      setAllNatures([{ id: 1, name: 'hardy', increased_stat: null, decreased_stat: null } as Nature]);
    }
  }, []);

  // Load move data
  const loadMoveData = useCallback(async (moveName: string): Promise<Move | null> => {
    if (movesData[moveName]) return movesData[moveName];

    try {
      const moveData = await fetchJSON<Move>(`https://pokeapi.co/api/v2/move/${moveName}`);
      if (moveData) {
        setMovesData(prev => ({ ...prev, [moveName]: moveData }));
        return moveData;
      }
    } catch (error) {
      logger.error(`Failed to load move data for ${moveName}:`, { error });
    }
    return null;
  }, [movesData]);

  // Select Pokemon
  const selectPokemon = useCallback(async (pokemon: SelectorPokemon, player: 1 | 2) => {
    setLoading(true);
    try {
      const pokemonData = await fetchJSON<Pokemon>(pokemon.url);
      if (!pokemonData) throw new Error('Pokemon data not found');

      const moves = pokemonData.moves || [];

      if (player === 1) {
        setSelectedPokemon1(pokemonData);
        setAvailableMoves1(moves);
        setPokemon1Config(prev => {
          const newConfig = {
            ...prev,
            moves,
            selectedMoves: [],
            manualStats: false,
            ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 },
            evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }
          };
          newConfig.stats = calculateAllStats(pokemonData, newConfig);
          return newConfig;
        });
      } else {
        setSelectedPokemon2(pokemonData);
        setAvailableMoves2(moves);
        setPokemon2Config(prev => {
          const newConfig = {
            ...prev,
            moves,
            selectedMoves: [],
            manualStats: false,
            ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 },
            evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }
          };
          newConfig.stats = calculateAllStats(pokemonData, newConfig);
          return newConfig;
        });
      }
    } catch (error) {
      logger.error('Failed to load Pokemon:', { pokemon: pokemon.name, error });
    } finally {
      setLoading(false);
    }
  }, [calculateAllStats]);

  // Select random Pokemon
  const selectRandomPokemon = useCallback(async (player: 1 | 2) => {
    if (pokemonList.length === 0) return;
    const randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
    await selectPokemon(randomPokemon, player);
  }, [pokemonList, selectPokemon]);

  // Select best moves automatically
  const selectBestMoves = useCallback((pokemon: Pokemon | null, config: BattleConfig, player: 1 | 2) => {
    if (!pokemon || !config.moves?.length) return;

    const scoredMoves = config.moves.map(move => {
      let score = 0;
      const moveData = movesData[move.move.name];

      if (moveData) {
        if (moveData.power) score += Math.min(moveData.power * 0.5, 50);
        if (moveData.accuracy) score += moveData.accuracy * 0.2;
        if (pokemon.types?.some(type => type.type.name === moveData.type?.name)) score += 15;

        const attackStat = config.stats.attack || 0;
        const spAttackStat = config.stats.specialAttack || 0;

        if (moveData.damage_class?.name === 'physical' && attackStat > spAttackStat) score += 10;
        else if (moveData.damage_class?.name === 'special' && spAttackStat > attackStat) score += 10;
        if (moveData.damage_class?.name === 'status') score += 5;
      } else {
        score = 20;
      }

      return { move, score };
    });

    const bestMoves = scoredMoves.sort((a, b) => b.score - a.score).slice(0, 4).map(item => item.move);

    if (player === 1) {
      setPokemon1Config(prev => ({ ...prev, selectedMoves: bestMoves }));
    } else {
      setPokemon2Config(prev => ({ ...prev, selectedMoves: bestMoves }));
    }
  }, [movesData]);

  // Add to battle log
  const addToBattleLog = useCallback((entry: BattleLog | string) => {
    setBattleLog(prev => [...prev, entry]);
  }, []);

  // Start battle
  const startBattle = useCallback(() => {
    if (!selectedPokemon1 || !selectedPokemon2) return;

    const newBattleState = createInitialBattleState(
      selectedPokemon1,
      selectedPokemon2,
      pokemon1Config,
      pokemon2Config
    );
    setBattleState(newBattleState);
    setCurrentHP1(newBattleState.pokemon1.maxHp);
    setCurrentHP2(newBattleState.pokemon2.maxHp);
    setBattleLog([]);
    setBattleActive(true);

    const speed1 = newBattleState.pokemon1.stats.speed;
    const speed2 = newBattleState.pokemon2.stats.speed;
    setCurrentTurn(speed1 >= speed2 ? 1 : 2);

    addToBattleLog({
      player: 'System',
      pokemon: 'Battle',
      action: `Battle started! ${player1Name}'s ${selectedPokemon1.name} vs ${player2Name}'s ${selectedPokemon2.name}`,
      timestamp: new Date()
    });

    if (pokemon1Config.selectedMoves.length === 0) {
      selectBestMoves(selectedPokemon1, pokemon1Config, 1);
    }
    if (pokemon2Config.selectedMoves.length === 0) {
      selectBestMoves(selectedPokemon2, pokemon2Config, 2);
    }
  }, [selectedPokemon1, selectedPokemon2, pokemon1Config, pokemon2Config, player1Name, player2Name, addToBattleLog, selectBestMoves]);

  // Handle victory
  const handleVictory = useCallback((winnerPlayer: 1 | 2) => {
    setWinner(winnerPlayer);
    setBattleActive(false);
    setShowVictoryScreen(true);

    const result: BattleResult = {
      winner: winnerPlayer === 1 ? player1Name : player2Name,
      loser: winnerPlayer === 1 ? player2Name : player1Name,
      winnerPokemon: winnerPlayer === 1 ? selectedPokemon1?.name || '' : selectedPokemon2?.name || '',
      loserPokemon: winnerPlayer === 1 ? selectedPokemon2?.name || '' : selectedPokemon1?.name || '',
      turns: battleLog.length,
      finalHP: [currentHP1, currentHP2],
      keyMoments: [],
      totalDamageDealt: [0, 0],
      date: new Date()
    };

    setBattleHistory(prev => {
      const newHistory = [...prev, result];
      if (typeof window !== 'undefined') {
        localStorage.setItem('battleHistory', JSON.stringify(newHistory));
      }
      return newHistory;
    });

    setAnnouncement({
      message: `${winnerPlayer === 1 ? player1Name : player2Name} wins!`,
      type: 'victory'
    });
  }, [player1Name, player2Name, selectedPokemon1, selectedPokemon2, battleLog.length, currentHP1, currentHP2]);

  // Switch turn
  const switchTurn = useCallback(() => {
    setCurrentTurn(prev => prev === 1 ? 2 : 1);
  }, []);

  // Execute move
  const executeMove = useCallback(async (player: 1 | 2, move: PokemonMove) => {
    if (!battleActive || !selectedPokemon1 || !selectedPokemon2 || !battleState) return;

    const attacker = player === 1
      ? { pokemon: selectedPokemon1, config: pokemon1Config }
      : { pokemon: selectedPokemon2, config: pokemon2Config };
    const defender = player === 1
      ? { pokemon: selectedPokemon2, config: pokemon2Config }
      : { pokemon: selectedPokemon1, config: pokemon1Config };

    const attackerName = player === 1 ? player1Name : player2Name;

    if (!movesData[move.move.name]) {
      await loadMoveData(move.move.name);
    }

    const moveData = movesData[move.move.name];
    if (!moveData) return;

    // Check accuracy
    if (moveData.accuracy && Math.random() * 100 > moveData.accuracy) {
      addToBattleLog({
        player: attackerName,
        pokemon: attacker.pokemon.name,
        action: `${move.move.name.replace('-', ' ')} missed!`,
        timestamp: new Date()
      });
      switchTurn();
      return;
    }

    const { damage, isCritical, effectiveness } = calculateDamage(attacker, defender, move);

    if (player === 1) {
      const newHP = Math.max(0, currentHP2 - damage);
      setCurrentHP2(newHP);
      setHitTarget(2);
      setDamageEffect({ damage, position: 'right', isCritical, effectiveness });
      setTimeout(() => setHitTarget(null), 400);

      if (newHP === 0) {
        handleVictory(1);
        return;
      }
    } else {
      const newHP = Math.max(0, currentHP1 - damage);
      setCurrentHP1(newHP);
      setHitTarget(1);
      setDamageEffect({ damage, position: 'left', isCritical, effectiveness });
      setTimeout(() => setHitTarget(null), 400);

      if (newHP === 0) {
        handleVictory(2);
        return;
      }
    }

    setAnnouncement({
      message: `${attacker.pokemon.name} used ${move.move.name.replace(/-/g, ' ')}!`,
      type: 'attack'
    });

    addToBattleLog({
      player: attackerName,
      pokemon: attacker.pokemon.name,
      action: `used ${move.move.name.replace(/-/g, ' ')}`,
      damage,
      effectiveness,
      critical: isCritical,
      timestamp: new Date()
    });

    switchTurn();
  }, [battleActive, selectedPokemon1, selectedPokemon2, battleState, pokemon1Config, pokemon2Config, player1Name, player2Name, movesData, loadMoveData, calculateDamage, currentHP1, currentHP2, addToBattleLog, switchTurn, handleVictory]);

  // Fast forward battle
  const fastForwardBattle = useCallback(async () => {
    if (!selectedPokemon1 || !selectedPokemon2 || !battleState) return;

    setIsSimulating(true);

    try {
      const moves1 = pokemon1Config.selectedMoves;
      const moves2 = pokemon2Config.selectedMoves;

      if (moves1.length === 0 || moves2.length === 0) {
        logger.error('No moves selected for battle simulation');
        return;
      }

      const results = await simulateBattleToCompletion(
        selectedPokemon1,
        selectedPokemon2,
        pokemon1Config,
        pokemon2Config,
        moves1,
        moves2,
        loadMoveData
      );

      setBattleResults(results);
      setWinner(typeof results.winner === 'number' ? results.winner : null);
      setCurrentHP1(results.finalHP[0]);
      setCurrentHP2(results.finalHP[1]);
      setBattleActive(false);
      setShowBattleResults(true);

      addToBattleLog({
        player: 'System',
        pokemon: 'Battle',
        action: `Battle completed in ${results.turns} turns! ${results.winner === 1 ? player1Name : player2Name} wins!`,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error in fast forward battle:', error);
    } finally {
      setIsSimulating(false);
    }
  }, [selectedPokemon1, selectedPokemon2, battleState, pokemon1Config, pokemon2Config, loadMoveData, player1Name, player2Name, addToBattleLog]);

  // Reset battle
  const resetBattle = useCallback(() => {
    setSelectedPokemon1(null);
    setSelectedPokemon2(null);
    setPokemon1Config({ ...DEFAULT_CONFIG });
    setPokemon2Config({ ...DEFAULT_CONFIG });
    setBattleLog([]);
    setBattleActive(false);
    setBattleState(null);
    setCurrentTurn(null);
    setCurrentHP1(0);
    setCurrentHP2(0);
    setWinner(null);
    setShowVictoryScreen(false);
    setShowBattleResults(false);
    setBattleResults(null);
    setDamageEffect(null);
    setAnnouncement(null);
    setHitTarget(null);
    setAvailableMoves1([]);
    setAvailableMoves2([]);
  }, []);

  // Initialize
  useEffect(() => {
    loadPokemonList();
    loadNatures();

    if (typeof window !== 'undefined') {
      const savedPlayer1 = localStorage.getItem('battleSimulatorPlayer1Name');
      const savedPlayer2 = localStorage.getItem('battleSimulatorPlayer2Name');
      if (savedPlayer1) setPlayer1Name(savedPlayer1);
      if (savedPlayer2) setPlayer2Name(savedPlayer2);

      const savedHistory = localStorage.getItem('battleHistory');
      if (savedHistory) {
        try {
          setBattleHistory(JSON.parse(savedHistory));
        } catch (e) {
          logger.error('Failed to load battle history');
        }
      }
    }
  }, [loadPokemonList, loadNatures]);

  // Save player names
  useEffect(() => {
    if (typeof window !== 'undefined' && player1Name !== 'Player 1') {
      localStorage.setItem('battleSimulatorPlayer1Name', player1Name);
    }
  }, [player1Name]);

  useEffect(() => {
    if (typeof window !== 'undefined' && player2Name !== 'Player 2') {
      localStorage.setItem('battleSimulatorPlayer2Name', player2Name);
    }
  }, [player2Name]);

  // Recalculate stats when config changes
  useEffect(() => {
    if (selectedPokemon1 && !pokemon1Config.manualStats && allNatures.length > 0) {
      const newStats = calculateAllStats(selectedPokemon1, pokemon1Config);
      setPokemon1Config(prev => ({ ...prev, stats: newStats }));
    }
  }, [pokemon1Config.level, pokemon1Config.nature, selectedPokemon1, allNatures.length, calculateAllStats]);

  useEffect(() => {
    if (selectedPokemon2 && !pokemon2Config.manualStats && allNatures.length > 0) {
      const newStats = calculateAllStats(selectedPokemon2, pokemon2Config);
      setPokemon2Config(prev => ({ ...prev, stats: newStats }));
    }
  }, [pokemon2Config.level, pokemon2Config.nature, selectedPokemon2, allNatures.length, calculateAllStats]);

  return {
    // Pokemon state
    selectedPokemon1,
    selectedPokemon2,
    pokemon1Config,
    pokemon2Config,
    setPokemon1Config,
    setPokemon2Config,
    pokemonList,
    availableMoves1,
    availableMoves2,

    // Battle state
    battleState,
    battleActive,
    currentTurn,
    currentHP1,
    currentHP2,
    winner,

    // Battle log and history
    battleLog,
    battleHistory,
    battleResults,

    // Player names
    player1Name,
    player2Name,
    setPlayer1Name,
    setPlayer2Name,

    // UI state
    loading,
    isSimulating,
    showBattleResults,
    showVictoryScreen,
    setShowVictoryScreen,
    setShowBattleResults,

    // Visual effects
    damageEffect,
    announcement,
    hitTarget,
    setDamageEffect,
    setAnnouncement,

    // Data
    allNatures,
    movesData,

    // Actions
    selectPokemon,
    selectRandomPokemon,
    selectBestMoves,
    loadMoveData,
    startBattle,
    executeMove,
    fastForwardBattle,
    resetBattle,
    getTypeEffectiveness,
  };
}
