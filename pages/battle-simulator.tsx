import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { fetchJSON } from '../utils/unifiedFetch';
import { POKEMON_TYPE_COLORS } from '../utils/pokemonTypeColors';
import { TypeBadge } from '../components/ui/TypeBadge';
import { GlassContainer } from '../components/ui/design-system/GlassContainer';
import { CircularCard } from '../components/ui/design-system/CircularCard';
import CircularButton from '../components/ui/CircularButton';
import StandardCard from '../components/ui/StandardCard';
import { TypeGradientBadge } from '../components/ui/design-system/TypeGradientBadge';
import { EnhancedPokemonSelector, type Pokemon as SelectorPokemon } from '../components/ui/EnhancedPokemonSelector';
import Modal from '../components/ui/modals/Modal';
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import { InlineLoader } from '../utils/unifiedLoading';
import PageErrorBoundary from '../components/ui/PageErrorBoundary';
import { SmartTooltip } from '../components/qol/ContextualHelp';
import logger from '../utils/logger';
import type { Pokemon, PokemonMove, PokemonType, PokemonStat, PokemonSpecies, Nature, Move } from '../types/api/pokemon';

// Type definitions

interface TypeColors {
  single?: string;
  dual: boolean;
  color1?: string;
  color2?: string;
}

interface BattleConfig {
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

// Battle log entry interface for interactive battles
interface BattleLog {
  player: string;
  pokemon: string;
  action: string;
  damage?: number;
  effectiveness?: number;
  critical?: boolean;
  timestamp: Date;
}

// Props interface for PokemonSelectionItem
interface PokemonSelectionItemProps {
  pokemon: {
    name: string;
    url: string;
  };
  pokemonId?: number;
  onSelect: (pokemon: Pokemon) => void;
  allPokemonData?: Pokemon | null;
}

// Enhanced Pokemon selection component with type colors
function PokemonSelectionItem({ pokemon, pokemonId, onSelect, allPokemonData = null }: PokemonSelectionItemProps) {
  const [pokemonData, setPokemonData] = useState<Pokemon | null>(allPokemonData);
  const [loading, setLoading] = useState(false);

  // Get type colors for dual-type display
  const getTypeColors = (): TypeColors => {
    // Default gray color when no data is loaded yet
    if (!pokemonData?.types || pokemonData.types.length === 0) {
      return { single: '#A8A77A', dual: false }; // Normal type color as fallback
    }
    
    const types = pokemonData.types;
    
    if (types.length === 1) {
      const typeName = types[0].type.name.toLowerCase();
      const color = POKEMON_TYPE_COLORS[typeName as keyof typeof POKEMON_TYPE_COLORS] || POKEMON_TYPE_COLORS.normal;
      return { single: color, dual: false };
    } else {
      const type1Name = types[0].type.name.toLowerCase();
      const type2Name = types[1].type.name.toLowerCase();
      const color1 = POKEMON_TYPE_COLORS[type1Name as keyof typeof POKEMON_TYPE_COLORS] || POKEMON_TYPE_COLORS.normal;
      const color2 = POKEMON_TYPE_COLORS[type2Name as keyof typeof POKEMON_TYPE_COLORS] || POKEMON_TYPE_COLORS.normal;
      return {
        dual: true,
        color1: color1,
        color2: color2
      };
    }
  };

  const handleSelect = async () => {
    if (!pokemonData) {
      setLoading(true);
      try {
        const data = await fetchJSON<Pokemon>(pokemon.url);
        if (data) {
          setPokemonData(data);
          onSelect(data);
        }
      } catch (err) {
        logger.error('Failed to load Pokemon data:', { error: err });
      } finally {
        setLoading(false);
      }
    } else {
      onSelect(pokemonData);
    }
  };

  const colors = getTypeColors();

  return (
    <CircularButton
      onClick={handleSelect}
      disabled={loading}
      variant="ghost"
      className="w-full text-left min-h-0 p-4 justify-start"
      data-testid="pokemon-option"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Type Color Circle */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden relative">
            {colors.dual ? (
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-0 w-1/2"
                  style={{ backgroundColor: colors.color1 || '#A8A77A' }}
                />
                <div 
                  className="absolute inset-0 w-1/2 left-1/2"
                  style={{ backgroundColor: colors.color2 || '#A8A77A' }}
                />
              </div>
            ) : (
              <div 
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: colors.single || '#A8A77A' }}
              />
            )}
            {loading ? (
              <div className="relative z-10"><InlineLoader /></div>
            ) : (
              <span className="text-2xl font-bold text-white/90 relative z-10">
                {pokemon.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          {/* Pokemon Info */}
          <div className="text-left">
            <div className="font-bold text-lg capitalize text-gray-800">
              {pokemon.name}
            </div>
            <div className="text-sm text-gray-500">
              #{pokemonId ? pokemonId.toString().padStart(3, '0') : '???'}
            </div>
          </div>
        </div>

        {/* Type Badges */}
        <div className="flex gap-1">
          {pokemonData?.types ? (
            pokemonData.types.map(t => (
              <TypeBadge key={t.type.name} type={t.type.name} size="xs" />
            ))
          ) : (
            <span className="text-sm text-gray-400">Select to load</span>
          )}
        </div>
      </div>
    </CircularButton>
  );
}

const BattleSimulator: NextPage = () => {
  const [selectedPokemon1, setSelectedPokemon1] = useState<Pokemon | null>(null);
  const [selectedPokemon2, setSelectedPokemon2] = useState<Pokemon | null>(null);
  const [showPokemonSelector, setShowPokemonSelector] = useState<number | null>(null); // 1 or 2
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonList, setPokemonList] = useState<SelectorPokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [battleLog, setBattleLog] = useState<(BattleLog | string)[]>([]);
  const [battleActive, setBattleActive] = useState(false);
  const [showMoveSelector, setShowMoveSelector] = useState<number | null>(null); // 1 or 2
  const [availableMoves1, setAvailableMoves1] = useState<PokemonMove[]>([]);
  const [availableMoves2, setAvailableMoves2] = useState<PokemonMove[]>([]);
  const [allNatures, setAllNatures] = useState<Nature[]>([]);
  const [showIVsEVs1, setShowIVsEVs1] = useState(false);
  const [showIVsEVs2, setShowIVsEVs2] = useState(false);
  const [movesData, setMovesData] = useState<Record<string, Move>>({});
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [editingPlayer1, setEditingPlayer1] = useState(false);
  const [editingPlayer2, setEditingPlayer2] = useState(false);
  const [currentHP1, setCurrentHP1] = useState(0);
  const [currentHP2, setCurrentHP2] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<1 | 2 | null>(null);
  const [selectedMove1, setSelectedMove1] = useState<PokemonMove | null>(null);
  const [selectedMove2, setSelectedMove2] = useState<PokemonMove | null>(null);
  const [battleHistory, setBattleHistory] = useState<any[]>([]);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [battleStats, setBattleStats] = useState<any>({});
  const [autoBattle, setAutoBattle] = useState(false);
  const [autoBattleSpeed, setAutoBattleSpeed] = useState(2); // 1=slow, 2=normal, 3=fast
  const [sideLayout, setSideLayout] = useState(false);
  const [weather, setWeather] = useState('none');
  const [battleFormat, setBattleFormat] = useState('singles');
  const [battleRules, setBattleRules] = useState('standard');
  const [moveSearchTerm, setMoveSearchTerm] = useState('');
  const [moveFilter, setMoveFilter] = useState('all'); // all, physical, special, status
  
  // Pokemon stats configuration
  const [pokemon1Config, setPokemon1Config] = useState<BattleConfig>({
    level: 50,
    nature: 'hardy',
    ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 },
    evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
    moves: [],
    selectedMoves: [], // Up to 4 moves
    stats: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
    manualStats: false
  });
  
  const [pokemon2Config, setPokemon2Config] = useState<BattleConfig>({
    level: 50,
    nature: 'hardy',
    ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 },
    evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
    moves: [],
    selectedMoves: [], // Up to 4 moves
    stats: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
    manualStats: false
  });

  // Load initial Pokemon list and natures
  useEffect(() => {
    loadPokemonList();
    loadNatures();
    // Load saved trainer names from localStorage
    const savedPlayer1 = localStorage.getItem('battleSimulatorPlayer1Name');
    const savedPlayer2 = localStorage.getItem('battleSimulatorPlayer2Name');
    if (savedPlayer1) setPlayer1Name(savedPlayer1);
    if (savedPlayer2) setPlayer2Name(savedPlayer2);
    
    // Load battle history
    const savedHistory = localStorage.getItem('battleHistory');
    if (savedHistory) {
      try {
        setBattleHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load battle history:', e);
      }
    }
  }, []);

  // Save trainer names to localStorage
  useEffect(() => {
    if (player1Name !== 'Player 1') {
      localStorage.setItem('battleSimulatorPlayer1Name', player1Name);
    }
  }, [player1Name]);

  useEffect(() => {
    if (player2Name !== 'Player 2') {
      localStorage.setItem('battleSimulatorPlayer2Name', player2Name);
    }
  }, [player2Name]);

  // Recalculate stats when config changes for Pokemon 1
  useEffect(() => {
    if (selectedPokemon1 && !pokemon1Config.manualStats && allNatures.length > 0) {
      const newStats = calculateAllStats(selectedPokemon1, pokemon1Config);
      setPokemon1Config(prev => ({
        ...prev,
        stats: newStats
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon1Config.level, pokemon1Config.nature, selectedPokemon1, allNatures.length]); // Removed IVs and EVs from deps to avoid too many updates

  // Recalculate stats when config changes for Pokemon 2
  useEffect(() => {
    if (selectedPokemon2 && !pokemon2Config.manualStats && allNatures.length > 0) {
      const newStats = calculateAllStats(selectedPokemon2, pokemon2Config);
      setPokemon2Config(prev => ({
        ...prev,
        stats: newStats
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon2Config.level, pokemon2Config.nature, selectedPokemon2, allNatures.length]); // Removed IVs and EVs from deps to avoid too many updates

  const loadPokemonList = async () => {
    try {
      const response = await fetchJSON<{ results: SelectorPokemon[] }>('https://pokeapi.co/api/v2/pokemon?limit=1010'); // All Pokemon
      
      // Handle case where response doesn't have results (e.g., mocked API)
      if (!response || !response.results || !Array.isArray(response.results)) {
        logger.warn('No Pokemon list available, using defaults');
        // Provide some default Pokemon for testing
        setPokemonList([
          { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
          { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'mewtwo', url: 'https://pokeapi.co/api/v2/pokemon/150/' },
          { name: 'garchomp', url: 'https://pokeapi.co/api/v2/pokemon/445/' },
        ]);
        return;
      }
      
      setPokemonList(response.results);
    } catch (error) {
      logger.error('Failed to load Pokemon list:', { error });
      // Provide default Pokemon on error
      setPokemonList([
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
      ]);
    }
  };

  const loadNatures = async () => {
    try {
      const response = await fetchJSON<{ results: Array<{ name: string; url: string }> }>('https://pokeapi.co/api/v2/nature?limit=25');
      
      // Handle case where response doesn't have results (e.g., mocked API)
      if (!response || !response.results || !Array.isArray(response.results)) {
        logger.warn('No nature data available, using defaults');
        // Provide default natures for testing
        setAllNatures([
          { id: 1, name: 'hardy', increased_stat: null, decreased_stat: null } as Nature,
          { id: 2, name: 'lonely', increased_stat: { name: 'attack' }, decreased_stat: { name: 'defense' } } as Nature,
          { id: 3, name: 'brave', increased_stat: { name: 'attack' }, decreased_stat: { name: 'speed' } } as Nature,
          { id: 4, name: 'adamant', increased_stat: { name: 'attack' }, decreased_stat: { name: 'special-attack' } } as Nature,
          { id: 5, name: 'naughty', increased_stat: { name: 'attack' }, decreased_stat: { name: 'special-defense' } } as Nature,
        ]);
        return;
      }
      
      const naturePromises = response.results.map(nature => fetchJSON<Nature>(nature.url));
      const natureData = await Promise.all(naturePromises);
      // Filter out null values from failed API calls
      const validNatures = natureData.filter((nature): nature is Nature => nature !== null);
      setAllNatures(validNatures);
    } catch (error) {
      logger.error('Failed to load natures:', { error });
      // Provide default natures on error
      setAllNatures([
        { id: 1, name: 'hardy', increased_stat: null, decreased_stat: null } as Nature,
      ]);
    }
  };

  // Calculate stat based on Pokemon formula
  const calculateStat = (baseStat: number, iv: number, ev: number, level: number, nature: Nature | undefined, statName: string, isHP = false): number => {
    if (isHP) {
      return Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100 + level + 10);
    }
    
    let stat = Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100 + 5);
    
    // Apply nature modifier
    if (nature) {
      if (nature.increased_stat && nature.increased_stat.name === statName) {
        stat = Math.floor(stat * 1.1);
      } else if (nature.decreased_stat && nature.decreased_stat.name === statName) {
        stat = Math.floor(stat * 0.9);
      }
    }
    
    return stat;
  };

  // Calculate all stats for a Pokemon
  const calculateAllStats = (pokemon: Pokemon, config: BattleConfig): BattleConfig['stats'] => {
    if (!pokemon || !pokemon.stats) return config.stats;
    
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
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0
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
  };

  // Load Pokemon data when selected
  const selectPokemon = async (pokemon: SelectorPokemon, player: number) => {
    setLoading(true);
    try {
      const pokemonData = await fetchJSON<Pokemon>(pokemon.url);
      if (!pokemonData) {
        throw new Error('Pokemon data not found');
      }
      const speciesData = pokemonData.species ? await fetchJSON<PokemonSpecies>(pokemonData.species.url) : null;
      
      // Load move data - get all moves
      const moves = pokemonData.moves || [];
      
      if (player === 1) {
        setSelectedPokemon1(pokemonData);
        setAvailableMoves1(moves);
        setPokemon1Config(prev => {
          const newConfig = { 
            ...prev, 
            moves: moves,
            selectedMoves: [], // Reset selected moves
            manualStats: false,
            ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 }, // Max IVs
            evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 } // Reset EVs
          };
          // Calculate stats with realistic IVs
          newConfig.stats = calculateAllStats(pokemonData, newConfig);
          return newConfig;
        });
      } else {
        setSelectedPokemon2(pokemonData);
        setAvailableMoves2(moves);
        setPokemon2Config(prev => {
          const newConfig = { 
            ...prev, 
            moves: moves,
            selectedMoves: [], // Reset selected moves
            manualStats: false,
            ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 }, // Max IVs
            evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 } // Reset EVs
          };
          // Calculate stats with realistic IVs
          newConfig.stats = calculateAllStats(pokemonData, newConfig);
          return newConfig;
        });
      }
      
      setShowPokemonSelector(null);
    } catch (error) {
      logger.error('Failed to load Pokemon:', { pokemon: pokemon.name, error });
    } finally {
      setLoading(false);
    }
  };

  // Get base stats from Pokemon data
  const getBaseStats = (pokemonData: Pokemon | null) => {
    const baseStats = {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0
    };

    if (pokemonData?.stats) {
      pokemonData.stats.forEach(stat => {
        const statName = stat.stat.name.replace('-', '');
        if (statName === 'hp') baseStats.hp = stat.base_stat;
        else if (statName === 'attack') baseStats.attack = stat.base_stat;
        else if (statName === 'defense') baseStats.defense = stat.base_stat;
        else if (statName === 'specialattack') baseStats.specialAttack = stat.base_stat;
        else if (statName === 'specialdefense') baseStats.specialDefense = stat.base_stat;
        else if (statName === 'speed') baseStats.speed = stat.base_stat;
      });
    }

    return baseStats;
  };

  // Random Pokemon selection
  const selectRandomPokemon = async (player: number) => {
    if (pokemonList.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    const randomPokemon = pokemonList[randomIndex];
    
    await selectPokemon(randomPokemon, player);
  };

  // Best moves selection logic
  const selectBestMoves = (pokemon: Pokemon | null, config: BattleConfig, player: number) => {
    if (!pokemon || !config.moves || config.moves.length === 0) return;

    const moves = config.moves;
    
    // Score moves based on various factors
    const scoredMoves = moves.map(move => {
      let score = 0;
      const moveName = move.move.name;
      const moveData = movesData[moveName];
      
      if (moveData) {
        // Power scoring
        if (moveData.power) {
          score += Math.min(moveData.power * 0.5, 50); // Max 50 points from power
        }
        
        // Accuracy scoring
        if (moveData.accuracy) {
          score += moveData.accuracy * 0.2; // Max 20 points from accuracy
        }
        
        // STAB (Same Type Attack Bonus)
        if (pokemon.types && pokemon.types.some(type => type.type.name === moveData.type?.name)) {
          score += 15; // STAB bonus
        }
        
        // Damage class preference (physical for high attack, special for high sp.attack)
        const attackStat = config.stats.attack || 0;
        const spAttackStat = config.stats.specialAttack || 0;
        
        if (moveData.damage_class?.name === 'physical' && attackStat > spAttackStat) {
          score += 10;
        } else if (moveData.damage_class?.name === 'special' && spAttackStat > attackStat) {
          score += 10;
        }
        
        // Status moves get moderate score
        if (moveData.damage_class?.name === 'status') {
          score += 5;
        }
      } else {
        // Default score for moves without data
        score = 20;
      }
      
      return { move, score, moveData };
    });
    
    // Sort by score and take top 4
    const bestMoves = scoredMoves
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => item.move);
    
    // Update the configuration
    if (player === 1) {
      setPokemon1Config(prev => ({ ...prev, selectedMoves: bestMoves }));
    } else {
      setPokemon2Config(prev => ({ ...prev, selectedMoves: bestMoves }));
    }
  };


  // Load move data
  const loadMoveData = useCallback(async (moveName: string) => {
    if (movesData[moveName]) return; // Already loaded
    
    try {
      const moveData = await fetchJSON<Move>(`https://pokeapi.co/api/v2/move/${moveName}`);
      if (moveData) {
        setMovesData(prev => ({ ...prev, [moveName]: moveData }));
      }
    } catch (error) {
      logger.error(`Failed to load move data for ${moveName}:`, { moveName, error });
    }
  }, [movesData]);

  // Load move data for selected moves
  useEffect(() => {
    const allMoves = [...pokemon1Config.selectedMoves, ...pokemon2Config.selectedMoves];
    allMoves.forEach(move => loadMoveData(move.move.name));
  }, [pokemon1Config.selectedMoves, pokemon2Config.selectedMoves, loadMoveData]);

  // Load move data when showing move selector
  useEffect(() => {
    if (showMoveSelector) {
      const moves = showMoveSelector === 1 ? availableMoves1 : availableMoves2;
      // Load first 10 moves immediately for better UX
      moves.slice(0, 10).forEach(move => loadMoveData(move.move.name));
    }
  }, [showMoveSelector, availableMoves1, availableMoves2, loadMoveData]);

  // Get type effectiveness multiplier
  const getTypeEffectiveness = (moveType: string, defenderTypes: PokemonType[]): number => {
    const typeChart: Record<string, Record<string, number>> = {
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
    defenderTypes.forEach(defType => {
      const effectiveness = typeChart[moveType]?.[defType.type.name];
      if (effectiveness !== undefined) {
        multiplier *= effectiveness;
      }
    });
    return multiplier;
  };

  // Calculate damage using actual Pokemon damage formula
  const calculateDamage = (attacker: { pokemon: Pokemon; config: BattleConfig }, defender: { pokemon: Pokemon; config: BattleConfig }, move: PokemonMove): number => {
    const level = attacker.config.level;
    const moveData = movesData[move.move.name];
    
    if (!moveData || !moveData.power) return 0;
    
    // Determine if physical or special
    const isPhysical = moveData.damage_class.name === 'physical';
    
    // Get the appropriate attack and defense stats
    const attackStat = isPhysical ? 'attack' : 'specialAttack';
    const defenseStat = isPhysical ? 'defense' : 'specialDefense';
    
    const attack = attacker.config.stats[attackStat];
    const defense = defender.config.stats[defenseStat];
    const power = moveData.power;
    
    // Basic damage formula
    let damage = ((((2 * level) / 5 + 2) * power * attack / defense) / 50 + 2);
    
    // STAB (Same Type Attack Bonus)
    const hasSTAB = attacker.pokemon.types && moveData.type && attacker.pokemon.types.some(type => type.type.name === moveData.type.name);
    if (hasSTAB) damage *= 1.5;
    
    // Type effectiveness
    if (moveData.type && defender.pokemon.types) {
      const effectiveness = getTypeEffectiveness(moveData.type.name, defender.pokemon.types);
      damage *= effectiveness;
    }
    
    // Random factor (85-100%)
    damage *= (Math.random() * 0.15 + 0.85);
    
    // Critical hit (6.25% chance)
    const isCritical = Math.random() < 0.0625;
    if (isCritical) damage *= 1.5;
    
    return Math.floor(damage);
  };

  // Start battle
  const startBattle = () => {
    if (!selectedPokemon1 || !selectedPokemon2) return;
    
    // Reset HP
    setCurrentHP1(pokemon1Config.stats.hp);
    setCurrentHP2(pokemon2Config.stats.hp);
    
    // Clear battle log
    setBattleLog([]);
    
    // Set battle active
    setBattleActive(true);
    
    // Determine first turn based on speed
    const speed1 = pokemon1Config.stats.speed;
    const speed2 = pokemon2Config.stats.speed;
    setCurrentTurn(speed1 >= speed2 ? 1 : 2);
    
    // Add to battle log
    addToBattleLog({
      player: 'System',
      pokemon: 'Battle',
      action: `Battle started! ${player1Name}'s ${selectedPokemon1.name} vs ${player2Name}'s ${selectedPokemon2.name}${autoBattle ? ' (Auto Battle)' : ''}`,
      timestamp: new Date()
    });
    
    // Auto-select moves if not selected
    if (pokemon1Config.selectedMoves.length === 0) {
      selectBestMoves(selectedPokemon1, pokemon1Config, 1);
    }
    if (pokemon2Config.selectedMoves.length === 0) {
      selectBestMoves(selectedPokemon2, pokemon2Config, 2);
    }
    
    // Start auto battle if enabled
    if (autoBattle) {
      setTimeout(() => {
        executeAutoBattleTurn();
      }, 1000);
    }
  };

  // Execute move
  const executeMove = async (player: 1 | 2, move: PokemonMove) => {
    if (!battleActive || !selectedPokemon1 || !selectedPokemon2) return;
    
    const attacker = player === 1 ? 
      { pokemon: selectedPokemon1, config: pokemon1Config } : 
      { pokemon: selectedPokemon2, config: pokemon2Config };
    const defender = player === 1 ? 
      { pokemon: selectedPokemon2, config: pokemon2Config } : 
      { pokemon: selectedPokemon1, config: pokemon1Config };
    
    const attackerName = player === 1 ? player1Name : player2Name;
    const defenderName = player === 1 ? player2Name : player1Name;
    
    // Load move data if not loaded
    if (!movesData[move.move.name]) {
      await loadMoveData(move.move.name);
    }
    
    const moveData = movesData[move.move.name];
    
    // Check accuracy
    if (moveData?.accuracy && Math.random() * 100 > moveData.accuracy) {
      addToBattleLog({
        player: attackerName,
        pokemon: attacker.pokemon.name,
        action: `${move.move.name.replace('-', ' ')} missed!`,
        timestamp: new Date()
      });
      switchTurn();
      return;
    }
    
    // Calculate damage
    const damage = calculateDamage(attacker, defender, move);
    const effectiveness = moveData?.type && defender.pokemon.types ? 
      getTypeEffectiveness(moveData.type.name, defender.pokemon.types) : 1;
    const isCritical = damage > 0 && Math.random() < 0.0625;
    
    // Apply damage
    if (player === 1) {
      const newHP = Math.max(0, currentHP2 - damage);
      setCurrentHP2(newHP);
      
      // Animate
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
      
      // Check for victory
      if (newHP === 0) {
        handleVictory(1);
        return;
      }
    } else {
      const newHP = Math.max(0, currentHP1 - damage);
      setCurrentHP1(newHP);
      
      // Animate
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
      
      // Check for victory
      if (newHP === 0) {
        handleVictory(2);
        return;
      }
    }
    
    // Add to battle log
    addToBattleLog({
      player: attackerName,
      pokemon: attacker.pokemon.name,
      action: `used ${move.move.name.replace('-', ' ')}`,
      damage: damage,
      effectiveness: effectiveness,
      critical: isCritical,
      timestamp: new Date()
    });
    
    // Switch turn
    switchTurn();
  };

  // Add to battle log
  const addToBattleLog = (log: BattleLog) => {
    setBattleLog(prev => [...prev, log]);
  };

  // Switch turn
  const switchTurn = () => {
    setCurrentTurn(prev => prev === 1 ? 2 : 1);
    
    // Continue auto battle if enabled
    if (autoBattle && battleActive) {
      const delay = autoBattleSpeed === 1 ? 3000 : autoBattleSpeed === 2 ? 2000 : 1000;
      setTimeout(() => {
        executeAutoBattleTurn();
      }, delay);
    }
  };
  
  // Execute auto battle turn
  const executeAutoBattleTurn = () => {
    if (!battleActive || !currentTurn) return;
    
    const currentPlayerMoves = currentTurn === 1 ? pokemon1Config.selectedMoves : pokemon2Config.selectedMoves;
    
    if (currentPlayerMoves.length === 0) {
      // End battle if no moves available
      endBattle();
      return;
    }
    
    // Select a random move (or best move with some strategy)
    const selectedMove = selectAutoBattleMove(currentTurn, currentPlayerMoves);
    
    if (selectedMove) {
      executeMove(currentTurn, selectedMove);
    }
  };
  
  // Select move for auto battle
  const selectAutoBattleMove = (player: 1 | 2, moves: PokemonMove[]): PokemonMove | null => {
    if (moves.length === 0) return null;
    
    // Simple AI: prefer moves with higher power and STAB
    const pokemon = player === 1 ? selectedPokemon1 : selectedPokemon2;
    const config = player === 1 ? pokemon1Config : pokemon2Config;
    
    const scoredMoves = moves.map(move => {
      let score = Math.random() * 10; // Add some randomness
      const moveData = movesData[move.move.name];
      
      if (moveData) {
        // Prefer moves with higher power
        if (moveData.power) {
          score += moveData.power * 0.3;
        }
        
        // STAB bonus
        if (pokemon?.types && moveData.type && pokemon.types.some(type => type.type.name === moveData.type.name)) {
          score += 20;
        }
        
        // Prefer moves that match the Pokemon's better attacking stat
        const isPhysical = moveData.damage_class?.name === 'physical';
        const isSpecial = moveData.damage_class?.name === 'special';
        
        if (isPhysical && config.stats.attack > config.stats.specialAttack) {
          score += 15;
        } else if (isSpecial && config.stats.specialAttack > config.stats.attack) {
          score += 15;
        }
      }
      
      return { move, score };
    });
    
    // Sort by score and return the best move
    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0].move;
  };

  // Handle victory
  const handleVictory = (winner: 1 | 2) => {
    setBattleActive(false);
    setWinner(winner);
    setShowVictoryScreen(true);
    
    const winnerName = winner === 1 ? player1Name : player2Name;
    const winnerPokemon = winner === 1 ? selectedPokemon1 : selectedPokemon2;
    
    addToBattleLog({
      player: 'System',
      pokemon: 'Battle',
      action: `${winnerName}'s ${winnerPokemon?.name} wins!`,
      timestamp: new Date()
    });
    
    // Save to battle history
    const battleRecord = {
      date: new Date(),
      winner: winnerName,
      winnerPokemon: winnerPokemon?.name,
      loser: winner === 1 ? player2Name : player1Name,
      loserPokemon: winner === 1 ? selectedPokemon2?.name : selectedPokemon1?.name,
      moves: battleLog.filter(log => typeof log === 'object' && 'damage' in log && log.damage)
    };
    
    setBattleHistory(prev => [...prev, battleRecord]);
    localStorage.setItem('battleHistory', JSON.stringify([...battleHistory, battleRecord]));
  };

  // End battle
  const endBattle = () => {
    setBattleActive(false);
    setCurrentTurn(null);
    setBattleLog([]);
    setShowVictoryScreen(false);
    setWinner(null);
    setAutoBattle(false); // Reset auto battle
  };

  // Due to size constraints, I need to continue the file conversion in the next message
  // This is a partial conversion showing the structure and approach
  
  const runQuickBattle = async () => {
    setBattleActive(true);
    setBattleLog([]);

    if (
      pokemon1Config.selectedMoves.length === 0 ||
      pokemon2Config.selectedMoves.length === 0
    ) {
      setBattleLog([
        'Please select moves for both Pokemon before starting the battle!',
      ]);
      setBattleActive(false);
      return;
    }

    const allMoves = [
      ...pokemon1Config.selectedMoves,
      ...pokemon2Config.selectedMoves,
    ];
    for (const move of allMoves) {
      if (!movesData[move.move.name]) {
        await loadMoveData(move.move.name);
      }
    }

    const p1 = {
      pokemon: selectedPokemon1!,
      config: pokemon1Config,
      currentHP: pokemon1Config.stats.hp,
      maxHP: pokemon1Config.stats.hp,
      name:
        selectedPokemon1!.name.charAt(0).toUpperCase() +
        selectedPokemon1!.name.slice(1),
    };

    const p2 = {
      pokemon: selectedPokemon2!,
      config: pokemon2Config,
      currentHP: pokemon2Config.stats.hp,
      maxHP: pokemon2Config.stats.hp,
      name:
        selectedPokemon2!.name.charAt(0).toUpperCase() +
        selectedPokemon2!.name.slice(1),
    };

    const log: string[] = [];
    let turn = 1;

    log.push(`=== BATTLE START ===`);
    log.push(
      `Player 1's ${p1.name} (Level ${p1.config.level}) - HP: ${p1.currentHP}/${p1.maxHP}`,
    );
    log.push(
      `Player 2's ${p2.name} (Level ${p2.config.level}) - HP: ${p2.currentHP}/${p2.maxHP}`,
    );
    log.push('');

    while (p1.currentHP > 0 && p2.currentHP > 0 && turn <= 50) {
      log.push(`--- Turn ${turn} ---`);

      const p1Speed = p1.config.stats.speed;
      const p2Speed = p2.config.stats.speed;

      let first = p1Speed >= p2Speed ? p1 : p2;
      let second = p1Speed >= p2Speed ? p2 : p1;
      let firstPlayer = p1Speed >= p2Speed ? 'Player 1' : 'Player 2';
      let secondPlayer = p1Speed >= p2Speed ? 'Player 2' : 'Player 1';

      const firstMoveIndex = Math.floor(
        Math.random() * first.config.selectedMoves.length,
      );
      const firstSelectedMove = first.config.selectedMoves[firstMoveIndex];
      const firstMoveData = movesData[firstSelectedMove.move.name];

      if (firstMoveData) {
        if (firstMoveData.power) {
          const damage = calculateDamage(first, second, firstSelectedMove);
          const effectiveness =
            firstMoveData.type && second.pokemon.types
              ? getTypeEffectiveness(
                  firstMoveData.type.name,
                  second.pokemon.types,
                )
              : 1;
          second.currentHP = Math.max(0, second.currentHP - damage);

          log.push(
            `${firstPlayer}'s ${first.name} used ${firstMoveData.name
              .replace(/-/g, ' ')
              .toUpperCase()}!`,
          );

          if (effectiveness > 1) log.push(`It's super effective!`);
          else if (effectiveness < 1 && effectiveness > 0)
            log.push(`It's not very effective...`);
          else if (effectiveness === 0)
            log.push(`It doesn't affect ${second.name}...`);

          log.push(
            `${secondPlayer}'s ${second.name} took ${damage} damage! (${second.currentHP}/${second.maxHP} HP remaining)`,
          );

          if (second.currentHP <= 0) {
            log.push('');
            log.push(`${secondPlayer}'s ${second.name} fainted!`);
            log.push(`${firstPlayer}'s ${first.name} wins the battle!`);
            break;
          }
        } else {
          log.push(
            `${firstPlayer}'s ${first.name} used ${firstMoveData.name
              .replace(/-/g, ' ')
              .toUpperCase()}!`,
          );
          log.push(`(Status moves are not yet implemented)`);
        }
      } else {
        const struggleDamage = Math.floor((40 * first.config.level) / 50);
        second.currentHP = Math.max(0, second.currentHP - struggleDamage);
        log.push(`${firstPlayer}'s ${first.name} used STRUGGLE!`);
        log.push(
          `${secondPlayer}'s ${second.name} took ${struggleDamage} damage! (${second.currentHP}/${second.maxHP} HP remaining)`,
        );

        if (second.currentHP <= 0) {
          log.push('');
          log.push(`${secondPlayer}'s ${second.name} fainted!`);
          log.push(`${firstPlayer}'s ${first.name} wins the battle!`);
          break;
        }
      }

      if (second.currentHP > 0) {
        const secondMoveIndex = Math.floor(
          Math.random() * second.config.selectedMoves.length,
        );
        const secondSelectedMove = second.config.selectedMoves[secondMoveIndex];
        const secondMoveData = movesData[secondSelectedMove.move.name];

        if (secondMoveData) {
          if (secondMoveData.power) {
            const damage = calculateDamage(second, first, secondSelectedMove);
            const effectiveness =
              secondMoveData.type && first.pokemon.types
                ? getTypeEffectiveness(
                    secondMoveData.type.name,
                    first.pokemon.types,
                  )
                : 1;
            first.currentHP = Math.max(0, first.currentHP - damage);

            log.push(
              `${secondPlayer}'s ${second.name} used ${secondMoveData.name
                .replace(/-/g, ' ')
                .toUpperCase()}!`,
            );

            if (effectiveness > 1) log.push(`It's super effective!`);
            else if (effectiveness < 1 && effectiveness > 0)
              log.push(`It's not very effective...`);
            else if (effectiveness === 0)
              log.push(`It doesn't affect ${first.name}...`);

            log.push(
              `${firstPlayer}'s ${first.name} took ${damage} damage! (${first.currentHP}/${first.maxHP} HP remaining)`,
            );

            if (first.currentHP <= 0) {
              log.push('');
              log.push(`${firstPlayer}'s ${first.name} fainted!`);
              log.push(`${secondPlayer}'s ${second.name} wins the battle!`);
              break;
            }
          } else {
            log.push(
              `${secondPlayer}'s ${second.name} used ${secondMoveData.name
                .replace(/-/g, ' ')
                .toUpperCase()}!`,
            );
            log.push(`(Status moves are not yet implemented)`);
          }
        } else {
          const struggleDamage = Math.floor((40 * second.config.level) / 50);
          first.currentHP = Math.max(0, first.currentHP - struggleDamage);
          log.push(`${secondPlayer}'s ${second.name} used STRUGGLE!`);
          log.push(
            `${firstPlayer}'s ${first.name} took ${struggleDamage} damage! (${first.currentHP}/${first.maxHP} HP remaining)`,
          );

          if (first.currentHP <= 0) {
            log.push('');
            log.push(`${firstPlayer}'s ${first.name} fainted!`);
            log.push(`${secondPlayer}'s ${second.name} wins the battle!`);
            break;
          }
        }
      }

      log.push('');
      turn++;
    }

    if (turn > 50) {
      log.push(`Battle ended due to turn limit!`);
      if (p1.currentHP > p2.currentHP) {
        log.push(`Player 1's ${p1.name} wins by HP advantage!`);
      } else if (p2.currentHP > p1.currentHP) {
        log.push(`Player 2's ${p2.name} wins by HP advantage!`);
      } else {
        log.push(`It's a draw!`);
      }
    }

    setBattleLog(log);
    setBattleActive(false);
  };

  const resetBattle = () => {
    setBattleLog([]);
    setBattleActive(false);
    setSelectedPokemon1(null);
    setSelectedPokemon2(null);
    setPokemon1Config({
      level: 50,
      nature: 'hardy',
      ivs: {
        hp: 31,
        attack: 31,
        defense: 31,
        specialAttack: 31,
        specialDefense: 31,
        speed: 31,
      },
      evs: {
        hp: 0,
        attack: 0,
        defense: 0,
        specialAttack: 0,
        specialDefense: 0,
        speed: 0,
      },
      moves: [],
      selectedMoves: [],
      stats: {
        hp: 0,
        attack: 0,
        defense: 0,
        specialAttack: 0,
        specialDefense: 0,
        speed: 0,
      },
      manualStats: false,
    });
    setPokemon2Config({
      level: 50,
      nature: 'hardy',
      ivs: {
        hp: 31,
        attack: 31,
        defense: 31,
        specialAttack: 31,
        specialDefense: 31,
        speed: 31,
      },
      evs: {
        hp: 0,
        attack: 0,
        defense: 0,
        specialAttack: 0,
        specialDefense: 0,
        speed: 0,
      },
      moves: [],
      selectedMoves: [],
      stats: {
        hp: 0,
        attack: 0,
        defense: 0,
        specialAttack: 0,
        specialDefense: 0,
        speed: 0,
      },
      manualStats: false,
    });
    setAvailableMoves1([]);
    setAvailableMoves2([]);
  };

  return (
    <PageErrorBoundary pageName="Battle Simulator">
      <Head>
        <title>Pokemon Battle Simulator - DexTrends</title>
        <meta name="description" content="Battle Pokemon with real damage calculations and type effectiveness" />
      </Head>
      
      <FullBleedWrapper gradient="pokedex">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Section with Gradient */}
          <div className="relative mb-12">
            <div className="absolute inset-0 gradient-bg-primary opacity-20 rounded-3xl blur-3xl" />
            <div className="relative text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pokemon-red to-pink-600 bg-clip-text text-transparent">
                Pokemon Battle Simulator
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Experience epic battles with real damage calculations
              </p>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="flex justify-center gap-4 mb-6">
            <Link href="/team-builder/advanced">
              <CircularButton
                variant="primary"
                size="lg"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                  </svg>
                }
              >
                Advanced Team Builder
              </CircularButton>
            </Link>
            <Link href="/battle-simulator/damage-calc">
              <CircularButton
                variant="secondary"
                size="lg"
              >
                Damage Calculator
              </CircularButton>
            </Link>
          </div>
          
          {/* Battle Format Selection */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Format:</label>
              <select
                value={battleFormat}
                onChange={(e) => setBattleFormat(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="singles">Singles</option>
                <option value="doubles">Doubles</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Weather:</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="sun">Harsh Sunlight</option>
                <option value="rain">Rain</option>
                <option value="sandstorm">Sandstorm</option>
                <option value="hail">Hail</option>
              </select>
            </div>
            <CircularButton
              onClick={() => {
                selectRandomPokemon(1);
                selectRandomPokemon(2);
              }}
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Random Battle!
            </CircularButton>
            <CircularButton
              onClick={() => setSideLayout(!sideLayout)}
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              {sideLayout ? 'Grid Layout' : 'Side Layout'}
            </CircularButton>
          </div>
          
          {/* Battle Arena */}
          <StandardCard variant="featured" className="p-8 mb-8">
            <div className={`${sideLayout ? 'flex flex-col lg:flex-row gap-6' : 'grid grid-cols-1 md:grid-cols-2 gap-8'} mb-8`}>
              {/* Pokemon 1 */}
              <div className={`text-center ${sideLayout ? 'lg:flex-1 bg-blue-50 rounded-xl p-6' : ''}`}>
                {/* Editable Trainer Name */}
                <div className="mb-4">
                  {editingPlayer1 ? (
                    <input
                      type="text"
                      value={player1Name}
                      onChange={(e) => setPlayer1Name(e.target.value)}
                      onBlur={() => setEditingPlayer1(false)}
                      onKeyPress={(e) => e.key === 'Enter' && setEditingPlayer1(false)}
                      className="text-3xl font-semibold text-center bg-transparent border-b-2 border-blue-600 text-blue-700 outline-none px-2"
                      autoFocus
                    />
                  ) : (
                    <h2 
                      className="text-3xl font-semibold text-blue-700 cursor-pointer hover:text-blue-800 transition-colors inline-flex items-center gap-2"
                      onClick={() => setEditingPlayer1(true)}
                    >
                      {player1Name}
                      <svg className="w-5 h-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </h2>
                  )}
                </div>
                {selectedPokemon1 ? (
                  <div>
                    {/* Config Buttons */}
                    <div className="flex justify-center gap-2 mb-3">
                      <CircularButton
                        onClick={() => setShowIVsEVs1(!showIVsEVs1)}
                        variant="secondary"
                        size="sm"
                      >
                        {showIVsEVs1 ? 'Hide' : 'Show'} IVs/EVs
                      </CircularButton>
                      <CircularButton
                        onClick={() => setShowMoveSelector(1)}
                        variant="secondary"
                        size="sm"
                      >
                        Select Moves ({pokemon1Config.selectedMoves.length}/4)
                      </CircularButton>
                    </div>
                  <div className="space-y-4" data-testid="selected-pokemon">
                    <div className={`relative inline-block ${isAnimating && 'animate-shake'}`}>
                      <Image
                        src={selectedPokemon1.sprites?.front_default || '/pokemon-placeholder.png'}
                        alt={selectedPokemon1.name}
                        width={200}
                        height={200}
                        className="mx-auto pokemon-sprite"
                      />
                      {/* Battle Effects Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="battle-effects" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold capitalize">{selectedPokemon1.name}</h3>
                    <div className="flex justify-center gap-2">
                      {selectedPokemon1.types?.map((t: PokemonType) => (
                        <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
                      ))}
                    </div>
                    {/* HP Bar */}
                    <div className="w-full max-w-xs mx-auto">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>HP</span>
                        <span>{currentHP1 || pokemon1Config.stats.hp}/{pokemon1Config.stats.hp}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ease-out ${
                            ((currentHP1 || pokemon1Config.stats.hp) / pokemon1Config.stats.hp) > 0.5 ? 'bg-green-500' :
                            ((currentHP1 || pokemon1Config.stats.hp) / pokemon1Config.stats.hp) > 0.2 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${((currentHP1 || pokemon1Config.stats.hp) / pokemon1Config.stats.hp) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Level: {pokemon1Config.level}
                    </div>
                    
                    {/* IVs/EVs Configuration */}
                    {showIVsEVs1 && (
                      <div className="mt-4 bg-blue-50 rounded-lg p-4 text-left">
                        <h4 className="text-xl font-medium text-gray-700 mb-3">Stats Configuration</h4>
                        
                        {/* Nature Selection */}
                        <div className="mb-3">
                          <label className="text-sm font-medium text-gray-600">Nature</label>
                          <select
                            value={pokemon1Config.nature}
                            onChange={(e) => setPokemon1Config(prev => ({ ...prev, nature: e.target.value }))}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {allNatures.map(nature => (
                              <option key={nature.name} value={nature.name}>
                                {nature.name} {nature.increased_stat && nature.decreased_stat && 
                                  `(+${nature.increased_stat.name.replace('special-', 'Sp.')}, -${nature.decreased_stat.name.replace('special-', 'Sp.')})`
                                }
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Stats Display */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(pokemon1Config.stats).map(([stat, value]) => (
                            <div key={stat} className="flex justify-between">
                              <span className="capitalize">{stat.replace('special', 'Sp.').replace('Attack', ' Atk').replace('Defense', ' Def')}</span>
                              <span className="font-semibold">{value}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Quick Presets */}
                        <div className="mt-3 flex gap-2">
                          <CircularButton
                            onClick={() => {
                              setPokemon1Config(prev => ({
                                ...prev,
                                nature: 'adamant',
                                evs: { hp: 252, attack: 252, defense: 0, specialAttack: 0, specialDefense: 4, speed: 0 }
                              }));
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                          >
                            Physical Sweeper
                          </CircularButton>
                          <CircularButton
                            onClick={() => {
                              setPokemon1Config(prev => ({
                                ...prev,
                                nature: 'modest',
                                evs: { hp: 4, attack: 0, defense: 0, specialAttack: 252, specialDefense: 0, speed: 252 }
                              }));
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                          >
                            Special Sweeper
                          </CircularButton>
                        </div>
                      </div>
                    )}
                  </div>
                  </div>
                ) : (
                  <CircularButton
                    onClick={() => setShowPokemonSelector(1)}
                    variant="ghost"
                    className="w-full p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 min-h-[100px]"
                    data-testid="pokemon-select"
                  >
                    <span className="text-gray-500">Click to select Pokemon</span>
                  </CircularButton>
                )}
              </div>

              {/* VS Divider */}
              <div className={`${sideLayout ? 'lg:flex' : 'hidden md:flex'} items-center justify-center ${sideLayout ? 'lg:flex-col lg:justify-center lg:px-4' : ''}`}>
                <div className={`${sideLayout ? 'lg:bg-white lg:rounded-full lg:w-16 lg:h-16 lg:flex lg:items-center lg:justify-center lg:shadow-lg' : ''}`}>
                  <div className="text-4xl font-bold text-gray-400">VS</div>
                </div>
                {sideLayout && (
                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-500 font-medium">Battle Arena</div>
                    {battleActive && (
                      <div className="mt-2 text-xs text-gray-400">
                        Turn {battleLog.filter(log => typeof log === 'object' && 'damage' in log && log.damage).length + 1}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pokemon 2 */}
              <div className={`text-center ${sideLayout ? 'lg:flex-1 bg-red-50 rounded-xl p-6' : ''}`}>
                {/* Editable Trainer Name */}
                <div className="mb-4">
                  {editingPlayer2 ? (
                    <input
                      type="text"
                      value={player2Name}
                      onChange={(e) => setPlayer2Name(e.target.value)}
                      onBlur={() => setEditingPlayer2(false)}
                      onKeyPress={(e) => e.key === 'Enter' && setEditingPlayer2(false)}
                      className="text-3xl font-semibold text-center bg-transparent border-b-2 border-red-600 text-red-700 outline-none px-2"
                      autoFocus
                    />
                  ) : (
                    <h2 
                      className="text-3xl font-semibold text-red-700 cursor-pointer hover:text-red-800 transition-colors inline-flex items-center gap-2"
                      onClick={() => setEditingPlayer2(true)}
                    >
                      {player2Name}
                      <svg className="w-5 h-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </h2>
                  )}
                </div>
                {selectedPokemon2 ? (
                  <div>
                    {/* Config Buttons */}
                    <div className="flex justify-center gap-2 mb-3">
                      <CircularButton
                        onClick={() => setShowIVsEVs2(!showIVsEVs2)}
                        variant="secondary"
                        size="sm"
                      >
                        {showIVsEVs2 ? 'Hide' : 'Show'} IVs/EVs
                      </CircularButton>
                      <CircularButton
                        onClick={() => setShowMoveSelector(2)}
                        variant="secondary"
                        size="sm"
                      >
                        Select Moves ({pokemon2Config.selectedMoves.length}/4)
                      </CircularButton>
                    </div>
                  <div className="space-y-4" data-testid="selected-pokemon">
                    <div className={`relative inline-block ${isAnimating && 'animate-shake'}`}>
                      <Image
                        src={selectedPokemon2.sprites?.front_default || '/pokemon-placeholder.png'}
                        alt={selectedPokemon2.name}
                        width={200}
                        height={200}
                        className="mx-auto pokemon-sprite"
                      />
                      {/* Battle Effects Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="battle-effects" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold capitalize">{selectedPokemon2.name}</h3>
                    <div className="flex justify-center gap-2">
                      {selectedPokemon2.types?.map((t: PokemonType) => (
                        <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
                      ))}
                    </div>
                    {/* HP Bar */}
                    <div className="w-full max-w-xs mx-auto">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>HP</span>
                        <span>{currentHP2 || pokemon2Config.stats.hp}/{pokemon2Config.stats.hp}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ease-out ${
                            ((currentHP2 || pokemon2Config.stats.hp) / pokemon2Config.stats.hp) > 0.5 ? 'bg-green-500' :
                            ((currentHP2 || pokemon2Config.stats.hp) / pokemon2Config.stats.hp) > 0.2 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${((currentHP2 || pokemon2Config.stats.hp) / pokemon2Config.stats.hp) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Level: {pokemon2Config.level}
                    </div>
                    
                    {/* IVs/EVs Configuration */}
                    {showIVsEVs2 && (
                      <div className="mt-4 bg-red-50 rounded-lg p-4 text-left">
                        <h4 className="text-xl font-medium text-gray-700 mb-3">Stats Configuration</h4>
                        
                        {/* Nature Selection */}
                        <div className="mb-3">
                          <label className="text-sm font-medium text-gray-600">Nature</label>
                          <select
                            value={pokemon2Config.nature}
                            onChange={(e) => setPokemon2Config(prev => ({ ...prev, nature: e.target.value }))}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            {allNatures.map(nature => (
                              <option key={nature.name} value={nature.name}>
                                {nature.name} {nature.increased_stat && nature.decreased_stat && 
                                  `(+${nature.increased_stat.name.replace('special-', 'Sp.')}, -${nature.decreased_stat.name.replace('special-', 'Sp.')})`
                                }
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Stats Display */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(pokemon2Config.stats).map(([stat, value]) => (
                            <div key={stat} className="flex justify-between">
                              <span className="capitalize">{stat.replace('special', 'Sp.').replace('Attack', ' Atk').replace('Defense', ' Def')}</span>
                              <span className="font-semibold">{value}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Quick Presets */}
                        <div className="mt-3 flex gap-2">
                          <CircularButton
                            onClick={() => {
                              setPokemon2Config(prev => ({
                                ...prev,
                                nature: 'adamant',
                                evs: { hp: 252, attack: 252, defense: 0, specialAttack: 0, specialDefense: 4, speed: 0 }
                              }));
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                          >
                            Physical Sweeper
                          </CircularButton>
                          <CircularButton
                            onClick={() => {
                              setPokemon2Config(prev => ({
                                ...prev,
                                nature: 'modest',
                                evs: { hp: 4, attack: 0, defense: 0, specialAttack: 252, specialDefense: 0, speed: 252 }
                              }));
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                          >
                            Special Sweeper
                          </CircularButton>
                        </div>
                      </div>
                    )}
                  </div>
                  </div>
                ) : (
                  <CircularButton
                    onClick={() => setShowPokemonSelector(2)}
                    variant="ghost"
                    className="w-full p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 min-h-[100px]"
                    data-testid="pokemon-select"
                  >
                    <span className="text-gray-500">Click to select Pokemon</span>
                  </CircularButton>
                )}
              </div>
            </div>

            {/* Battle Controls */}
            {selectedPokemon1 && selectedPokemon2 && (
              <div className="text-center">
                {!battleActive ? (
                  <div className="space-y-4">
                    <CircularButton
                      onClick={() => startBattle()}
                      variant="primary"
                      size="lg"
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                    >
                      Start Battle!
                    </CircularButton>
                    
                    {/* Auto Battle Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={autoBattle}
                          onChange={(e) => setAutoBattle(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">Auto Battle</span>
                      </label>
                      
                      {autoBattle && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Speed:</span>
                          <select
                            value={autoBattleSpeed}
                            onChange={(e) => setAutoBattleSpeed(Number(e.target.value))}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value={1}>Slow</option>
                            <option value={2}>Normal</option>
                            <option value={3}>Fast</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Turn Indicator */}
                    <div className="text-center mb-4">
                      <div className="text-lg font-semibold text-gray-700">
                        {currentTurn === 1 ? `${player1Name}'s Turn` : `${player2Name}'s Turn`}
                      </div>
                      {autoBattle && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600 font-medium">Auto Battle Active</span>
                          <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Move Selection */}
                    {currentTurn === 1 && pokemon1Config.selectedMoves.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {pokemon1Config.selectedMoves.map((move, index) => {
                          const moveData = movesData[move.move.name];
                          return (
                            <CircularButton
                              key={index}
                              onClick={() => executeMove(1, move)}
                              variant="ghost"
                              size="md"
                              className={`p-4 border-2 min-h-[80px] ${
                                moveData?.type ? `bg-${moveData.type.name}-100 border-${moveData.type.name}-300 hover:bg-${moveData.type.name}-200` : 'bg-gray-100 border-gray-300'
                              }`}
                            >
                              <div>
                                <div className="font-semibold capitalize">{move.move.name.replace('-', ' ')}</div>
                                {moveData && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Power: {moveData.power || '-'} | Acc: {moveData.accuracy || '-'}%
                                  </div>
                                )}
                              </div>
                            </CircularButton>
                          );
                        })}
                      </div>
                    )}
                    
                    {currentTurn === 2 && pokemon2Config.selectedMoves.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {pokemon2Config.selectedMoves.map((move, index) => {
                          const moveData = movesData[move.move.name];
                          return (
                            <CircularButton
                              key={index}
                              onClick={() => executeMove(2, move)}
                              variant="ghost"
                              size="md"
                              className={`p-4 border-2 min-h-[80px] ${
                                moveData?.type ? `bg-${moveData.type.name}-100 border-${moveData.type.name}-300 hover:bg-${moveData.type.name}-200` : 'bg-gray-100 border-gray-300'
                              }`}
                            >
                              <div>
                                <div className="font-semibold capitalize">{move.move.name.replace('-', ' ')}</div>
                                {moveData && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Power: {moveData.power || '-'} | Acc: {moveData.accuracy || '-'}%
                                  </div>
                                )}
                              </div>
                            </CircularButton>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Battle Controls */}
                    <div className="flex gap-3 justify-center">
                      <CircularButton
                        onClick={() => setAutoBattle(!autoBattle)}
                        variant="primary"
                        size="sm"
                        className={autoBattle ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'}
                      >
                        {autoBattle ? 'Stop Auto' : 'Auto Battle'}
                      </CircularButton>
                      
                      {autoBattle && (
                        <select
                          value={autoBattleSpeed}
                          onChange={(e) => setAutoBattleSpeed(Number(e.target.value))}
                          className="px-3 py-2 border border-gray-300 rounded text-sm"
                        >
                          <option value={1}>Slow</option>
                          <option value={2}>Normal</option>
                          <option value={3}>Fast</option>
                        </select>
                      )}
                      
                      <CircularButton
                        onClick={() => endBattle()}
                        variant="secondary"
                        size="sm"
                      >
                        End Battle
                      </CircularButton>
                    </div>
                  </div>
                )}
                
                {/* Quick Battle Option */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-xl font-medium mb-3 text-center text-gray-700">Alternative Battle Mode</h4>
                  <div className="flex gap-3 justify-center">
                    <CircularButton
                      onClick={runQuickBattle}
                      disabled={battleActive}
                      variant="primary"
                      size="md"
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50"
                    >
                      {battleActive ? 'Battle in Progress...' : 'Quick Battle (Auto)'}
                    </CircularButton>
                    {(selectedPokemon1 || selectedPokemon2 || battleLog.length > 0) && (
                      <CircularButton
                        onClick={resetBattle}
                        variant="secondary"
                        size="md"
                        className="bg-gray-700 hover:bg-gray-800"
                      >
                        Reset All
                      </CircularButton>
                    )}
                  </div>
                </div>
              </div>
            )}
          </StandardCard>

          {/* Battle Log */}
          {battleLog.length > 0 && (
            <StandardCard variant="featured" className="p-6 mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Battle Log</h3>
              <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto space-y-2">
                {battleLog.map((log, index) => {
                  // Handle string logs from Quick Battle
                  if (typeof log === 'string') {
                    return (
                      <div 
                        key={index}
                        className="p-3 rounded-lg text-sm bg-white border border-gray-200"
                      >
                        <span className="text-gray-600">{log}</span>
                      </div>
                    );
                  }
                  
                  // Handle BattleLog objects from Interactive Battle
                  const battleLogEntry = log as BattleLog;
                  return (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        battleLogEntry.critical ? 'bg-yellow-100 border border-yellow-300' :
                        battleLogEntry.effectiveness && battleLogEntry.effectiveness > 1 ? 'bg-green-100 border border-green-300' :
                        battleLogEntry.effectiveness && battleLogEntry.effectiveness < 1 ? 'bg-red-100 border border-red-300' :
                        'bg-white border border-gray-200'
                      } animate-fadeIn`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-700">{battleLogEntry.player}</span>
                          <span className="text-gray-500 mx-2">•</span>
                          <span className="font-medium capitalize">{battleLogEntry.pokemon}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(battleLogEntry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-gray-600">{battleLogEntry.action}</span>
                        {battleLogEntry.damage && (
                          <span className="ml-2 font-bold text-red-600">
                            -{battleLogEntry.damage} HP
                          </span>
                        )}
                        {battleLogEntry.effectiveness && battleLogEntry.effectiveness !== 1 && (
                          <span className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${
                            battleLogEntry.effectiveness > 1 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                          }`}>
                            {battleLogEntry.effectiveness > 1 ? 'Super Effective!' : 'Not Very Effective'}
                          </span>
                        )}
                        {battleLogEntry.critical && (
                          <span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-yellow-200 text-yellow-800">
                            Critical Hit!
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </StandardCard>
          )}

          {/* Battle History */}
          {battleHistory.length > 0 && (
            <StandardCard variant="featured" className="p-6">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Battle History</h3>
              <div className="space-y-3">
                {battleHistory.slice(-5).reverse().map((battle, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-800">
                          {battle.winner}'s {battle.winnerPokemon} defeated {battle.loser}'s {battle.loserPokemon}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {battle.moves.length} moves • {new Date(battle.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-2xl">🏆</div>
                    </div>
                  </div>
                ))}
              </div>
            </StandardCard>
          )}

          {/* Pokemon Selector Modal */}
          <Modal
            isOpen={showPokemonSelector !== null}
            onClose={() => setShowPokemonSelector(null)}
            title={`Select Pokemon ${showPokemonSelector}`}
          >
            <div className="p-4">
              <EnhancedPokemonSelector
                isOpen={true}
                onClose={() => {}}
                onSelect={(pokemon: SelectorPokemon) => {
                  if (showPokemonSelector === 1) {
                    selectPokemon(pokemon, 1);
                  } else {
                    selectPokemon(pokemon, 2);
                  }
                  setShowPokemonSelector(null);
                }}
                pokemonList={pokemonList}
                loading={loading}
                playerNumber={showPokemonSelector}
              />
            </div>
          </Modal>

          {/* Move Selector Modal */}
          <Modal
            isOpen={showMoveSelector !== null}
            onClose={() => setShowMoveSelector(null)}
            title="Select Moves"
          >
            <div className="p-4">
              <div className="mb-4">
                <p className="font-semibold text-gray-700">Select up to 4 moves:</p>
                <p className="text-sm text-gray-500">Selected: {showMoveSelector === 1 ? pokemon1Config.selectedMoves.length : pokemon2Config.selectedMoves.length}/4</p>
              </div>
              
              {/* Move Filters */}
              <div className="mb-4 space-y-2">
                <input
                  type="text"
                  placeholder="Search moves..."
                  value={moveSearchTerm}
                  onChange={(e) => setMoveSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <CircularButton
                    onClick={() => setMoveFilter('all')}
                    variant={moveFilter === 'all' ? 'primary' : 'secondary'}
                    size="sm"
                    className={moveFilter === 'all' ? 'bg-blue-500' : ''}
                  >
                    All
                  </CircularButton>
                  <CircularButton
                    onClick={() => setMoveFilter('physical')}
                    variant={moveFilter === 'physical' ? 'primary' : 'secondary'}
                    size="sm"
                    className={moveFilter === 'physical' ? 'bg-red-500' : ''}
                  >
                    Physical
                  </CircularButton>
                  <CircularButton
                    onClick={() => setMoveFilter('special')}
                    variant={moveFilter === 'special' ? 'primary' : 'secondary'}
                    size="sm"
                    className={moveFilter === 'special' ? 'bg-purple-500' : ''}
                  >
                    Special
                  </CircularButton>
                  <CircularButton
                    onClick={() => setMoveFilter('status')}
                    variant={moveFilter === 'status' ? 'primary' : 'secondary'}
                    size="sm"
                    className={moveFilter === 'status' ? 'bg-gray-500' : ''}
                  >
                    Status
                  </CircularButton>
                </div>
              </div>
              
              {/* Move List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {(() => {
                  const moves = showMoveSelector === 1 ? availableMoves1 : availableMoves2;
                  const selectedMoves = showMoveSelector === 1 ? pokemon1Config.selectedMoves : pokemon2Config.selectedMoves;
                  const pokemon = showMoveSelector === 1 ? selectedPokemon1 : selectedPokemon2;
                  
                  return moves
                    .filter(move => {
                      if (!moveSearchTerm) return true;
                      return move.move.name.toLowerCase().includes(moveSearchTerm.toLowerCase());
                    })
                    .filter(move => {
                      if (moveFilter === 'all') return true;
                      const moveData = movesData[move.move.name];
                      return moveData?.damage_class?.name === moveFilter;
                    })
                    .map((move, index) => {
                      const moveData = movesData[move.move.name];
                      const isSelected = selectedMoves.some(m => m.move.name === move.move.name);
                      const isSTAB = pokemon?.types && moveData?.type && 
                        pokemon.types.some(t => t.type.name === moveData.type.name);
                      
                      return (
                        <div
                          key={index}
                          onClick={() => {
                            if (showMoveSelector === 1) {
                              if (isSelected) {
                                setPokemon1Config(prev => ({
                                  ...prev,
                                  selectedMoves: prev.selectedMoves.filter(m => m.move.name !== move.move.name)
                                }));
                              } else if (pokemon1Config.selectedMoves.length < 4) {
                                setPokemon1Config(prev => ({
                                  ...prev,
                                  selectedMoves: [...prev.selectedMoves, move]
                                }));
                              }
                            } else {
                              if (isSelected) {
                                setPokemon2Config(prev => ({
                                  ...prev,
                                  selectedMoves: prev.selectedMoves.filter(m => m.move.name !== move.move.name)
                                }));
                              } else if (pokemon2Config.selectedMoves.length < 4) {
                                setPokemon2Config(prev => ({
                                  ...prev,
                                  selectedMoves: [...prev.selectedMoves, move]
                                }));
                              }
                            }
                          }}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold capitalize">
                                {move.move.name.replace('-', ' ')}
                                {isSTAB && <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">STAB</span>}
                              </div>
                              {moveData && (
                                <div className="text-sm text-gray-600 mt-1">
                                  <span className="mr-3">Power: {moveData.power || '-'}</span>
                                  <span className="mr-3">Accuracy: {moveData.accuracy || '-'}%</span>
                                  <span className="mr-3">PP: {moveData.pp || '-'}</span>
                                  {moveData.type && <TypeBadge type={moveData.type.name} size="xs" />}
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <CircularButton
                  onClick={() => {
                    selectBestMoves(
                      showMoveSelector === 1 ? selectedPokemon1! : selectedPokemon2!,
                      showMoveSelector === 1 ? pokemon1Config : pokemon2Config,
                      showMoveSelector!
                    );
                  }}
                  variant="primary"
                  size="lg"
                  className="flex-1"
                >
                  Auto-Select Best
                </CircularButton>
                <CircularButton
                  onClick={() => setShowMoveSelector(null)}
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                >
                  Done
                </CircularButton>
              </div>
            </div>
          </Modal>

          {/* Victory Screen Modal */}
          <Modal
            isOpen={showVictoryScreen}
            onClose={() => setShowVictoryScreen(false)}
            title="Battle Complete!"
          >
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {winner === 1 ? player1Name : player2Name} Wins!
                </h2>
                <p className="text-lg text-gray-600">
                  with {winner === 1 ? selectedPokemon1?.name : selectedPokemon2?.name}
                </p>
              </div>
              
              {/* Battle Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Battle Summary</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Total Turns: {battleLog.filter(log => typeof log === 'object' && 'damage' in log && log.damage).length}</div>
                  <div>Total Damage Dealt: {battleLog.reduce((sum, log) => sum + (typeof log === 'object' && 'damage' in log ? log.damage || 0 : 0), 0)}</div>
                  <div>Critical Hits: {battleLog.filter(log => typeof log === 'object' && 'critical' in log && log.critical).length}</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <CircularButton
                  onClick={() => {
                    setShowVictoryScreen(false);
                    endBattle();
                  }}
                  variant="primary"
                  size="lg"
                  className="flex-1"
                >
                  New Battle
                </CircularButton>
                <CircularButton
                  onClick={() => {
                    setShowVictoryScreen(false);
                    // Swap Pokemon
                    const temp1 = selectedPokemon1;
                    const temp2 = selectedPokemon2;
                    const tempConfig1 = pokemon1Config;
                    const tempConfig2 = pokemon2Config;
                    setSelectedPokemon1(temp2);
                    setSelectedPokemon2(temp1);
                    setPokemon1Config(tempConfig2);
                    setPokemon2Config(tempConfig1);
                    endBattle();
                  }}
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                >
                  Rematch (Swap)
                </CircularButton>
              </div>
            </div>
          </Modal>

          {battleLog.length > 0 && (
            <div className="mt-8">
              <h3 className="font-bold mb-2">Battle Log</h3>
              <div className="bg-white rounded-xl p-4 space-y-1">
                {battleLog.map((entry, index) => (
                  <div key={index}>
                    {typeof entry === 'string' ? entry : `${entry.player}: ${entry.action}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FullBleedWrapper>

      {/* Battle Animation Styles */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        @keyframes flash {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.8; }
        }

        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .pokemon-sprite {
          transition: all 0.3s ease;
        }

        .pokemon-sprite:hover {
          transform: scale(1.05);
        }

        .battle-effects {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .battle-effects.fire {
          background: radial-gradient(circle, rgba(255,69,0,0.6), transparent);
          animation: flash 0.5s ease;
        }

        .battle-effects.water {
          background: radial-gradient(circle, rgba(0,149,255,0.6), transparent);
          animation: flash 0.5s ease;
        }

        .battle-effects.electric {
          background: radial-gradient(circle, rgba(255,255,0,0.6), transparent);
          animation: flash 0.5s ease;
        }

        .battle-effects.grass {
          background: radial-gradient(circle, rgba(34,197,94,0.6), transparent);
          animation: flash 0.5s ease;
        }
      `}</style>
    </PageErrorBoundary>
  );
};

export default BattleSimulator;
(BattleSimulator as any).fullBleed = true;

