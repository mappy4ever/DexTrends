import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { fetchData } from '../utils/apiutils';
import { POKEMON_TYPE_COLORS } from '../utils/pokemonTypeColors';
import { TypeBadge } from '../components/ui/TypeBadge';
import { EnhancedPokemonSelector, type Pokemon as SelectorPokemon } from '../components/ui/EnhancedPokemonSelector';
import Modal from '../components/ui/modals/Modal';
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import { InlineLoader } from '../utils/unifiedLoading';
import PageErrorBoundary from '../components/ui/PageErrorBoundary';
import { SmartTooltip } from '../components/qol/ContextualHelp';
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
        const data = await fetchData(pokemon.url) as Pokemon;
        setPokemonData(data);
        onSelect(data);
      } catch (err) {
        console.error('Failed to load Pokemon data:', err);
      } finally {
        setLoading(false);
      }
    } else {
      onSelect(pokemonData);
    }
  };

  const colors = getTypeColors();

  return (
    <button
      onClick={handleSelect}
      disabled={loading}
      className="w-full card hover-lift"
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
    </button>
  );
}

const BattleSimulator: NextPage = () => {
  const [selectedPokemon1, setSelectedPokemon1] = useState<Pokemon | null>(null);
  const [selectedPokemon2, setSelectedPokemon2] = useState<Pokemon | null>(null);
  const [showPokemonSelector, setShowPokemonSelector] = useState<number | null>(null); // 1 or 2
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonList, setPokemonList] = useState<SelectorPokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
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
  }, []);

  // Recalculate stats when config changes for Pokemon 1
  useEffect(() => {
    if (selectedPokemon1 && !pokemon1Config.manualStats && allNatures.length > 0) {
      const newStats = calculateAllStats(selectedPokemon1, pokemon1Config);
      setPokemon1Config(prev => ({
        ...prev,
        stats: newStats
      }));
    }
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
  }, [pokemon2Config.level, pokemon2Config.nature, selectedPokemon2, allNatures.length]); // Removed IVs and EVs from deps to avoid too many updates

  const loadPokemonList = async () => {
    try {
      const response = await fetchData('https://pokeapi.co/api/v2/pokemon?limit=1010') as { results: SelectorPokemon[] }; // All Pokemon
      
      // Handle case where response doesn't have results (e.g., mocked API)
      if (!response || !response.results || !Array.isArray(response.results)) {
        console.warn('No Pokemon list available, using defaults');
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
      console.error('Failed to load Pokemon list:', error);
      // Provide default Pokemon on error
      setPokemonList([
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
      ]);
    }
  };

  const loadNatures = async () => {
    try {
      const response = await fetchData('https://pokeapi.co/api/v2/nature?limit=25') as { results: Array<{ name: string; url: string }> };
      
      // Handle case where response doesn't have results (e.g., mocked API)
      if (!response || !response.results || !Array.isArray(response.results)) {
        console.warn('No nature data available, using defaults');
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
      
      const naturePromises = response.results.map(nature => fetchData(nature.url) as Promise<Nature>);
      const natureData = await Promise.all(naturePromises);
      setAllNatures(natureData);
    } catch (error) {
      console.error('Failed to load natures:', error);
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
      const pokemonData = await fetchData(pokemon.url) as Pokemon;
      const speciesData = pokemonData.species ? await fetchData(pokemonData.species.url) as PokemonSpecies : null;
      
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
      console.error('Failed to load Pokemon:', error);
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
  const loadMoveData = async (moveName: string) => {
    if (movesData[moveName]) return; // Already loaded
    
    try {
      const moveData = await fetchData(`https://pokeapi.co/api/v2/move/${moveName}`) as Move;
      setMovesData(prev => ({ ...prev, [moveName]: moveData }));
    } catch (error) {
      console.error(`Failed to load move data for ${moveName}:`, error);
    }
  };

  // Load move data for selected moves
  useEffect(() => {
    const allMoves = [...pokemon1Config.selectedMoves, ...pokemon2Config.selectedMoves];
    allMoves.forEach(move => loadMoveData(move.move.name));
  }, [pokemon1Config.selectedMoves, pokemon2Config.selectedMoves]);

  // Load move data when showing move selector
  useEffect(() => {
    if (showMoveSelector) {
      const moves = showMoveSelector === 1 ? availableMoves1 : availableMoves2;
      // Load first 10 moves immediately for better UX
      moves.slice(0, 10).forEach(move => loadMoveData(move.move.name));
    }
  }, [showMoveSelector, availableMoves1, availableMoves2]);

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

  const runBattle = async () => {
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
          <h1 className="text-4xl font-bold text-center mb-8">Pokemon Battle Simulator</h1>
          
          {/* Battle Arena */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Pokemon 1 */}
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Pokemon 1</h2>
                {selectedPokemon1 ? (
                  <div className="space-y-4" data-testid="selected-pokemon">
                    <div className="relative inline-block">
                      <Image
                        src={selectedPokemon1.sprites?.front_default || '/pokemon-placeholder.png'}
                        alt={selectedPokemon1.name}
                        width={200}
                        height={200}
                        className="mx-auto"
                      />
                    </div>
                    <h3 className="text-xl font-semibold capitalize">{selectedPokemon1.name}</h3>
                    <div className="flex justify-center gap-2">
                      {selectedPokemon1.types?.map((t: PokemonType) => (
                        <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      Level: {pokemon1Config.level} | HP: {pokemon1Config.stats.hp}/{pokemon1Config.stats.hp}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPokemonSelector(1)}
                    className="w-full p-6 border-2 border-dashed border-gray-300 rounded-3xl hover:border-gray-400 transition-all hover-lift"
                    data-testid="pokemon-select"
                  >
                    <span className="text-gray-500">Click to select Pokemon</span>
                  </button>
                )}
              </div>

              {/* VS Divider */}
              <div className="hidden md:flex items-center justify-center">
                <div className="text-4xl font-bold text-gray-400">VS</div>
              </div>

              {/* Pokemon 2 */}
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Pokemon 2</h2>
                {selectedPokemon2 ? (
                  <div className="space-y-4" data-testid="selected-pokemon">
                    <div className="relative inline-block">
                      <Image
                        src={selectedPokemon2.sprites?.front_default || '/pokemon-placeholder.png'}
                        alt={selectedPokemon2.name}
                        width={200}
                        height={200}
                        className="mx-auto"
                      />
                    </div>
                    <h3 className="text-xl font-semibold capitalize">{selectedPokemon2.name}</h3>
                    <div className="flex justify-center gap-2">
                      {selectedPokemon2.types?.map((t: PokemonType) => (
                        <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      Level: {pokemon2Config.level} | HP: {pokemon2Config.stats.hp}/{pokemon2Config.stats.hp}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPokemonSelector(2)}
                    className="w-full p-6 border-2 border-dashed border-gray-300 rounded-3xl hover:border-gray-400 transition-all hover-lift"
                    data-testid="pokemon-select"
                  >
                    <span className="text-gray-500">Click to select Pokemon</span>
                  </button>
                )}
              </div>
            </div>

            {/* Battle Controls */}
            {selectedPokemon1 && selectedPokemon2 && (
              <div className="text-center">
                <button
                  onClick={runBattle}
                  className="btn bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 px-8 py-3 text-lg font-bold"
                >
                  {battleActive ? 'Battle in Progress...' : 'Start Battle!'}
                </button>
                {(selectedPokemon1 || selectedPokemon2 || battleLog.length > 0) && (
                  <button
                    onClick={resetBattle}
                    className="ml-4 btn bg-gray-700 text-white px-6 py-3 font-bold"
                  >
                    Reset Battle
                  </button>
                )}
              </div>
            )}
          </div>

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
              <p className="mb-4">Select up to 4 moves:</p>
              {/* Move selection UI to be implemented */}
            </div>
          </Modal>

          {battleLog.length > 0 && (
            <div className="mt-8">
              <h3 className="font-bold mb-2">Battle Log</h3>
              <div className="bg-white rounded-xl p-4 space-y-1">
                {battleLog.map((entry, index) => (
                  <div key={index}>{entry}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FullBleedWrapper>
    </PageErrorBoundary>
  );
};

export default BattleSimulator;
(BattleSimulator as any).fullBleed = true;

