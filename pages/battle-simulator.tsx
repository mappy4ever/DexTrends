import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { fetchData } from '../utils/apiutils';
import { TypeBadge } from '../components/ui/TypeBadge';
import { EnhancedPokemonSelector } from '../components/ui/EnhancedPokemonSelector';
import Modal from '../components/ui/modals/Modal';
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import type { Pokemon, PokemonMove, PokemonType, PokemonStat, PokemonSpecies, Nature, Move } from '../types/api/pokemon';

// Type definitions
interface PokemonSelectionItemProps {
  pokemon: { name: string; url: string };
  pokemonId: string;
  onSelect: (data: Pokemon) => void;
  allPokemonData?: Pokemon | null;
}

interface TypeColors {
  single?: string;
  dual?: boolean;
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

interface BattleLog {
  player: string;
  pokemon: string;
  action: string;
  damage?: number;
  effectiveness?: number;
  critical?: boolean;
  timestamp: Date;
}

const typeColorMap: Record<string, string> = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
  grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
  ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
  steel: '#B7B7CE', fairy: '#D685AD'
};

// Enhanced Pokemon selection component with type colors
function PokemonSelectionItem({ pokemon, pokemonId, onSelect, allPokemonData = null }: PokemonSelectionItemProps) {
  const [pokemonData, setPokemonData] = useState<Pokemon | null>(allPokemonData);
  const [loading, setLoading] = useState(false);

  // Get type colors for dual-type display
  const getTypeColors = (): TypeColors => {
    if (!pokemonData?.types) return { single: '#A8A77A' }; // Default to normal type color
    
    const types = pokemonData.types;
    if (types.length === 1) {
      return { single: typeColorMap[types[0].type.name] || '#A8A77A' };
    } else {
      return {
        dual: true,
        color1: typeColorMap[types[0].type.name] || '#A8A77A',
        color2: typeColorMap[types[1].type.name] || '#A8A77A'
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
      className="w-full p-4 rounded-xl border-2 transition-all transform hover:scale-[1.02] border-gray-200 hover:border-gray-400 bg-white hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Type Color Circle */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden relative">
            {colors.dual ? (
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-0 w-1/2"
                  style={{ backgroundColor: colors.color1 }}
                />
                <div 
                  className="absolute inset-0 w-1/2 left-1/2"
                  style={{ backgroundColor: colors.color2 }}
                />
              </div>
            ) : (
              <div 
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: colors.single }}
              />
            )}
            {loading ? (
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10"></div>
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
              #{pokemonId.padStart(3, '0')}
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
  const [pokemonList, setPokemonList] = useState<Array<{ name: string; url: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [battleLog, setBattleLog] = useState<BattleLog[]>([]);
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
      const response = await fetchData('https://pokeapi.co/api/v2/pokemon?limit=1010') as { results: Array<{ name: string; url: string }> }; // All Pokemon
      setPokemonList(response.results);
    } catch (error) {
      console.error('Failed to load Pokemon list:', error);
    }
  };

  const loadNatures = async () => {
    try {
      const response = await fetchData('https://pokeapi.co/api/v2/nature?limit=25') as { results: Array<{ name: string; url: string }> };
      const naturePromises = response.results.map(nature => fetchData(nature.url) as Promise<Nature>);
      const natureData = await Promise.all(naturePromises);
      setAllNatures(natureData);
    } catch (error) {
      console.error('Failed to load natures:', error);
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
  const selectPokemon = async (pokemon: { name: string; url: string }, player: number) => {
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

  // Due to size constraints, I need to continue the file conversion in the next message
  // This is a partial conversion showing the structure and approach
  
  return (
    <>
      <Head>
        <title>Pokemon Battle Simulator - DexTrends</title>
        <meta name="description" content="Battle Pokemon with real damage calculations and type effectiveness" />
      </Head>
      
      <FullBleedWrapper gradient="pokedex">
        {/* The rest of the JSX will be continued in the next part */}
        <div>Battle Simulator Component - To be completed</div>
      </FullBleedWrapper>
    </>
  );
};

export default BattleSimulator;