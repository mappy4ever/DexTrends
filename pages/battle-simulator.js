import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { fetchData } from '../utils/apiutils';
import { TypeBadge } from '../components/ui/TypeBadge';
import { EnhancedPokemonSelector } from '../components/ui/EnhancedPokemonSelector';
import Modal from '../components/ui/modals/Modal';
import { FullBleedWrapper } from '../components/ui/FullBleedWrapper';

// Enhanced Pokemon selection component with type colors
function PokemonSelectionItem({ pokemon, pokemonId, onSelect, allPokemonData = null }) {
  const [pokemonData, setPokemonData] = useState(allPokemonData);
  const [loading, setLoading] = useState(false);

  // Get type colors for dual-type display
  const getTypeColors = () => {
    if (!pokemonData?.types) return { single: 'bg-gray-200' };
    
    const typeColorMap = {
      normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
      grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
      ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
      rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
      steel: '#B7B7CE', fairy: '#D685AD'
    };

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
        const data = await fetchData(pokemon.url);
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
              <>
                <div 
                  className="absolute inset-0 w-1/2"
                  style={{ backgroundColor: colors.color1 }}
                ></div>
                <div 
                  className="absolute inset-0 w-1/2 left-1/2"
                  style={{ backgroundColor: colors.color2 }}
                ></div>
              </>
            ) : (
              <div 
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: colors.single }}
              ></div>
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

export default function BattleSimulator() {
  const [selectedPokemon1, setSelectedPokemon1] = useState(null);
  const [selectedPokemon2, setSelectedPokemon2] = useState(null);
  const [showPokemonSelector, setShowPokemonSelector] = useState(null); // 1 or 2
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [battleLog, setBattleLog] = useState([]);
  const [battleActive, setBattleActive] = useState(false);
  const [showMoveSelector, setShowMoveSelector] = useState(null); // 1 or 2
  const [availableMoves1, setAvailableMoves1] = useState([]);
  const [availableMoves2, setAvailableMoves2] = useState([]);
  const [allNatures, setAllNatures] = useState([]);
  const [showIVsEVs1, setShowIVsEVs1] = useState(false);
  const [showIVsEVs2, setShowIVsEVs2] = useState(false);
  const [movesData, setMovesData] = useState({});
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
  const [pokemon1Config, setPokemon1Config] = useState({
    level: 50,
    nature: 'hardy',
    ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 },
    evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
    moves: [],
    selectedMoves: [], // Up to 4 moves
    stats: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
    manualStats: false
  });
  
  const [pokemon2Config, setPokemon2Config] = useState({
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
      const response = await fetchData('https://pokeapi.co/api/v2/pokemon?limit=1010'); // All Pokemon
      setPokemonList(response.results);
    } catch (error) {
      console.error('Failed to load Pokemon list:', error);
    }
  };

  const loadNatures = async () => {
    try {
      const response = await fetchData('https://pokeapi.co/api/v2/nature?limit=25');
      const naturePromises = response.results.map(nature => fetchData(nature.url));
      const natureData = await Promise.all(naturePromises);
      setAllNatures(natureData);
    } catch (error) {
      console.error('Failed to load natures:', error);
    }
  };

  // Calculate stat based on Pokemon formula
  const calculateStat = (baseStat, iv, ev, level, nature, statName, isHP = false) => {
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
  const calculateAllStats = (pokemon, config) => {
    if (!pokemon || !pokemon.stats) return config.stats;
    
    const nature = allNatures.find(n => n.name === config.nature);
    const statsMap = {
      hp: 'hp',
      attack: 'attack',
      defense: 'defense',
      'special-attack': 'specialAttack',
      'special-defense': 'specialDefense',
      speed: 'speed'
    };
    
    const newStats = {};
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
  const selectPokemon = async (pokemon, player) => {
    setLoading(true);
    try {
      const pokemonData = await fetchData(pokemon.url);
      const speciesData = await fetchData(pokemonData.species.url);
      
      // Load move data - get all moves
      const moves = pokemonData.moves;
      
      if (player === 1) {
        setSelectedPokemon1({ ...pokemonData, species: speciesData });
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
        setSelectedPokemon2({ ...pokemonData, species: speciesData });
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
  const getBaseStats = (pokemonData) => {
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
  const selectRandomPokemon = async (player) => {
    if (pokemonList.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    const randomPokemon = pokemonList[randomIndex];
    
    await selectPokemon(randomPokemon, player);
  };

  // Best moves selection logic
  const selectBestMoves = (pokemon, config, player) => {
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
        if (pokemon.types.some(type => type.type.name === moveData.type?.name)) {
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
  const loadMoveData = async (moveName) => {
    if (movesData[moveName]) return; // Already loaded
    
    try {
      const moveData = await fetchData(`https://pokeapi.co/api/v2/move/${moveName}`);
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
  const getTypeEffectiveness = (moveType, defenderTypes) => {
    const typeChart = {
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
  const calculateDamage = (attacker, defender, move) => {
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
    
    // Calculate base damage
    let damage = Math.floor(((2 * level / 5 + 2) * power * attack / defense) / 50 + 2);
    
    // Apply STAB (Same Type Attack Bonus)
    const hasSTAB = attacker.pokemon.types.some(t => t.type.name === moveData.type.name);
    if (hasSTAB) damage = Math.floor(damage * 1.5);
    
    // Apply type effectiveness
    const effectiveness = getTypeEffectiveness(moveData.type.name, defender.pokemon.types);
    damage = Math.floor(damage * effectiveness);
    
    // Apply random factor (85-100%)
    const random = Math.random() * (100 - 85) + 85;
    damage = Math.floor(damage * random / 100);
    
    return { damage: Math.max(1, damage), effectiveness };
  };

  // Run battle simulation
  const runBattle = async () => {
    setBattleActive(true);
    setBattleLog([]);
    
    // Check if both Pokemon have moves selected
    if (pokemon1Config.selectedMoves.length === 0 || pokemon2Config.selectedMoves.length === 0) {
      setBattleLog(['Please select moves for both Pokemon before starting the battle!']);
      setBattleActive(false);
      return;
    }
    
    // Load all move data first
    const allMoves = [...pokemon1Config.selectedMoves, ...pokemon2Config.selectedMoves];
    for (const move of allMoves) {
      if (!movesData[move.move.name]) {
        await loadMoveData(move.move.name);
      }
    }
    
    // Initialize battle state
    const p1 = { 
      pokemon: selectedPokemon1, 
      config: pokemon1Config, 
      currentHP: pokemon1Config.stats.hp,
      maxHP: pokemon1Config.stats.hp,
      name: selectedPokemon1.name.charAt(0).toUpperCase() + selectedPokemon1.name.slice(1)
    };
    
    const p2 = { 
      pokemon: selectedPokemon2, 
      config: pokemon2Config, 
      currentHP: pokemon2Config.stats.hp,
      maxHP: pokemon2Config.stats.hp,
      name: selectedPokemon2.name.charAt(0).toUpperCase() + selectedPokemon2.name.slice(1)
    };
    
    const log = [];
    let turn = 1;
    
    log.push(`=== BATTLE START ===`);
    log.push(`Player 1's ${p1.name} (Level ${p1.config.level}) - HP: ${p1.currentHP}/${p1.maxHP}`);
    log.push(`Player 2's ${p2.name} (Level ${p2.config.level}) - HP: ${p2.currentHP}/${p2.maxHP}`);
    log.push('');
    
    // Battle loop
    while (p1.currentHP > 0 && p2.currentHP > 0 && turn <= 50) {
      log.push(`--- Turn ${turn} ---`);
      
      // Determine turn order based on speed
      const p1Speed = p1.config.stats.speed;
      const p2Speed = p2.config.stats.speed;
      
      let first = p1Speed >= p2Speed ? p1 : p2;
      let second = p1Speed >= p2Speed ? p2 : p1;
      let firstPlayer = p1Speed >= p2Speed ? "Player 1" : "Player 2";
      let secondPlayer = p1Speed >= p2Speed ? "Player 2" : "Player 1";
      
      // First attacker's turn
      const firstMoveIndex = Math.floor(Math.random() * first.config.selectedMoves.length);
      const firstSelectedMove = first.config.selectedMoves[firstMoveIndex];
      const firstMoveData = movesData[firstSelectedMove.move.name];
      
      if (firstMoveData) {
        if (firstMoveData.power) {
          const { damage, effectiveness } = calculateDamage(first, second, firstSelectedMove);
          second.currentHP = Math.max(0, second.currentHP - damage);
          
          log.push(`${firstPlayer}'s ${first.name} used ${firstMoveData.name.replace(/-/g, ' ').toUpperCase()}!`);
          
          if (effectiveness > 1) log.push(`It's super effective!`);
          else if (effectiveness < 1 && effectiveness > 0) log.push(`It's not very effective...`);
          else if (effectiveness === 0) log.push(`It doesn't affect ${second.name}...`);
          
          log.push(`${secondPlayer}'s ${second.name} took ${damage} damage! (${second.currentHP}/${second.maxHP} HP remaining)`);
          
          if (second.currentHP <= 0) {
            log.push('');
            log.push(`${secondPlayer}'s ${second.name} fainted!`);
            log.push(`${firstPlayer}'s ${first.name} wins the battle!`);
            break;
          }
        } else {
          // Status move
          log.push(`${firstPlayer}'s ${first.name} used ${firstMoveData.name.replace(/-/g, ' ').toUpperCase()}!`);
          log.push(`(Status moves are not yet implemented)`);
        }
      } else {
        // Struggle if no move data
        const struggleDamage = Math.floor(40 * first.config.level / 50);
        second.currentHP = Math.max(0, second.currentHP - struggleDamage);
        log.push(`${firstPlayer}'s ${first.name} used STRUGGLE!`);
        log.push(`${secondPlayer}'s ${second.name} took ${struggleDamage} damage! (${second.currentHP}/${second.maxHP} HP remaining)`);
        
        if (second.currentHP <= 0) {
          log.push('');
          log.push(`${secondPlayer}'s ${second.name} fainted!`);
          log.push(`${firstPlayer}'s ${first.name} wins the battle!`);
          break;
        }
      }
      
      // Second attacker's turn
      if (second.currentHP > 0) {
        const secondMoveIndex = Math.floor(Math.random() * second.config.selectedMoves.length);
        const secondSelectedMove = second.config.selectedMoves[secondMoveIndex];
        const secondMoveData = movesData[secondSelectedMove.move.name];
        
        if (secondMoveData) {
          if (secondMoveData.power) {
            const { damage, effectiveness } = calculateDamage(second, first, secondSelectedMove);
            first.currentHP = Math.max(0, first.currentHP - damage);
            
            log.push(`${secondPlayer}'s ${second.name} used ${secondMoveData.name.replace(/-/g, ' ').toUpperCase()}!`);
            
            if (effectiveness > 1) log.push(`It's super effective!`);
            else if (effectiveness < 1 && effectiveness > 0) log.push(`It's not very effective...`);
            else if (effectiveness === 0) log.push(`It doesn't affect ${first.name}...`);
            
            log.push(`${firstPlayer}'s ${first.name} took ${damage} damage! (${first.currentHP}/${first.maxHP} HP remaining)`);
            
            if (first.currentHP <= 0) {
              log.push('');
              log.push(`${firstPlayer}'s ${first.name} fainted!`);
              log.push(`${secondPlayer}'s ${second.name} wins the battle!`);
              break;
            }
          } else {
            // Status move
            log.push(`${secondPlayer}'s ${second.name} used ${secondMoveData.name.replace(/-/g, ' ').toUpperCase()}!`);
            log.push(`(Status moves are not yet implemented)`);
          }
        } else {
          // Struggle if no move data
          const struggleDamage = Math.floor(40 * second.config.level / 50);
          first.currentHP = Math.max(0, first.currentHP - struggleDamage);
          log.push(`${secondPlayer}'s ${second.name} used STRUGGLE!`);
          log.push(`${firstPlayer}'s ${first.name} took ${struggleDamage} damage! (${first.currentHP}/${first.maxHP} HP remaining)`);
          
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

  // Reset battle function
  const resetBattle = () => {
    setBattleLog([]);
    setBattleActive(false);
    setSelectedPokemon1(null);
    setSelectedPokemon2(null);
    setPokemon1Config({
      level: 50,
      nature: 'hardy',
      ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 },
      evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
      moves: [],
      selectedMoves: [],
      stats: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
      manualStats: false
    });
    setPokemon2Config({
      level: 50,
      nature: 'hardy',
      ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 },
      evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
      moves: [],
      selectedMoves: [],
      stats: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
      manualStats: false
    });
    setAvailableMoves1([]);
    setAvailableMoves2([]);
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        /* Hide spinner arrows on number inputs */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      <Head>
        <title>Battle Simulator | DexTrends</title>
        <meta name="description" content="Simulate Pokemon battles and test strategies" />
      </Head>

      <FullBleedWrapper gradient="pokedex">
        <div className="max-w-7xl mx-auto py-8">
        {/* Weather and Battle Format Selectors */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Battle Format</h3>
            <div className="flex flex-wrap gap-2">
              {['singles', 'doubles', 'triples'].map(format => (
                <button
                  key={format}
                  onClick={() => setBattleFormat(format)}
                  className={`px-4 py-2 rounded-full font-medium transition-all capitalize ${
                    battleFormat === format
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Weather</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'none', label: 'None' },
                { key: 'sunny', label: 'Sunny ☀️' },
                { key: 'rain', label: 'Rain 🌧️' },
                { key: 'sandstorm', label: 'Sandstorm 🌪️' },
                { key: 'hail', label: 'Hail ❄️' }
              ].map(weatherOption => (
                <button
                  key={weatherOption.key}
                  onClick={() => setWeather(weatherOption.key)}
                  className={`px-3 py-2 rounded-full font-medium transition-all text-sm ${
                    weather === weatherOption.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {weatherOption.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Battle Rules</h3>
            <div className="flex flex-wrap gap-2">
              {['standard', 'vgc', 'smogon'].map(rule => (
                <button
                  key={rule}
                  onClick={() => setBattleRules(rule)}
                  className={`px-4 py-2 rounded-full font-medium transition-all capitalize ${
                    battleRules === rule
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {rule}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Battle Arena */}
        <div className="relative bg-gradient-to-b from-sky-100 to-green-100 rounded-3xl shadow-2xl p-8 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-400 rounded-full filter blur-3xl"></div>
          </div>
          
          {/* Pokemon Display Section with VS */}
          <div className="relative mb-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              {/* Player 1 Pokemon */}
              <div className="text-center">
                {editingPlayer1 ? (
                  <input
                    type="text"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    onBlur={() => setEditingPlayer1(false)}
                    onKeyPress={(e) => e.key === 'Enter' && setEditingPlayer1(false)}
                    className="text-2xl md:text-3xl font-bold text-center bg-transparent border-b-2 border-blue-600 text-blue-700 mb-4 outline-none"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <h2 
                      className="text-2xl md:text-3xl font-bold text-blue-700 cursor-pointer hover:text-blue-800"
                      onClick={() => setEditingPlayer1(true)}
                    >
                      {player1Name}
                    </h2>
                    <button
                      onClick={() => setEditingPlayer1(true)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Edit name"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )}
                {selectedPokemon1 ? (
                  <div>
                    <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-3 group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-pulse opacity-20"></div>
                      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-50 to-blue-100 p-2 shadow-lg">
                        <Image
                          src={selectedPokemon1.sprites?.other?.["official-artwork"]?.front_default || selectedPokemon1.sprites?.front_default}
                          alt={selectedPokemon1.name}
                          fill
                          className="object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <button
                        onClick={() => setShowPokemonSelector(1)}
                        className="absolute -right-2 -bottom-2 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                        title="Change Pokemon"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold capitalize bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      {player1Name}&apos;s {selectedPokemon1.name}
                    </h3>
                    <div className="flex gap-2 justify-center mt-2">
                      {selectedPokemon1.types.map(t => (
                        <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl text-blue-400">?</span>
                  </div>
                )}
              </div>

              {/* VS Divider */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-red-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-white rounded-full px-6 py-3 md:px-10 md:py-6 shadow-2xl">
                  <span className="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">VS</span>
                </div>
              </div>

              {/* Player 2 Pokemon */}
              <div className="text-center">
                {editingPlayer2 ? (
                  <input
                    type="text"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    onBlur={() => setEditingPlayer2(false)}
                    onKeyPress={(e) => e.key === 'Enter' && setEditingPlayer2(false)}
                    className="text-2xl md:text-3xl font-bold text-center bg-transparent border-b-2 border-red-600 text-red-700 mb-4 outline-none"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <h2 
                      className="text-2xl md:text-3xl font-bold text-red-700 cursor-pointer hover:text-red-800"
                      onClick={() => setEditingPlayer2(true)}
                    >
                      {player2Name}
                    </h2>
                    <button
                      onClick={() => setEditingPlayer2(true)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Edit name"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )}
                {selectedPokemon2 ? (
                  <div>
                    <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-3 group">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-pulse opacity-20"></div>
                      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-red-50 to-red-100 p-2 shadow-lg">
                        <Image
                          src={selectedPokemon2.sprites?.other?.["official-artwork"]?.front_default || selectedPokemon2.sprites?.front_default}
                          alt={selectedPokemon2.name}
                          fill
                          className="object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <button
                        onClick={() => setShowPokemonSelector(2)}
                        className="absolute -right-2 -bottom-2 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                        title="Change Pokemon"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold capitalize bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                      {player2Name}&apos;s {selectedPokemon2.name}
                    </h3>
                    <div className="flex gap-2 justify-center mt-2">
                      {selectedPokemon2.types.map(t => (
                        <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl text-red-400">?</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 rounded-2xl p-6">
            {/* Player 1 Configuration */}
            <div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-blue-200 hover:shadow-2xl transition-all duration-300">
                {selectedPokemon1 ? (
                  <div>

                    {/* Configuration */}
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-xl p-3">
                        <label className="block font-semibold text-blue-900 mb-2 text-sm">Level</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={pokemon1Config.level}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val >= 1 && val <= 100) {
                                setPokemon1Config(prev => ({ ...prev, level: val }));
                              }
                            }}
                            className="w-16 px-2 py-1 border-2 border-blue-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-center font-bold"
                          />
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={pokemon1Config.level}
                            onChange={(e) => setPokemon1Config(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(pokemon1Config.level - 1) / 99 * 100}%, #e5e7eb ${(pokemon1Config.level - 1) / 99 * 100}%, #e5e7eb 100%)`
                            }}
                          />
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-3">
                        <label className="block font-semibold text-blue-900 mb-2 text-sm">Nature</label>
                        <div className="relative">
                          <div className="bg-white border-2 border-blue-200 rounded-lg p-3 cursor-pointer hover:border-blue-400 transition-all"
                               onClick={() => document.getElementById('nature-select-1').classList.toggle('hidden')}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-blue-900 text-lg capitalize">
                                  {pokemon1Config.nature}
                                </div>
                                {(() => {
                                  const nature = allNatures.find(n => n.name === pokemon1Config.nature);
                                  if (nature?.increased_stat && nature?.decreased_stat) {
                                    return (
                                      <div className="flex gap-2 mt-1">
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                          +{nature.increased_stat.name.replace('special-', 'Sp.')}
                                        </span>
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                          -{nature.decreased_stat.name.replace('special-', 'Sp.')}
                                        </span>
                                      </div>
                                    );
                                  }
                                  return <span className="text-xs text-gray-500">No stat changes</span>;
                                })()}
                              </div>
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          
                          <div id="nature-select-1" className="hidden absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto">
                            {allNatures.map(nature => (
                              <button
                                key={nature.name}
                                onClick={() => {
                                  setPokemon1Config(prev => ({ ...prev, nature: nature.name }));
                                  document.getElementById('nature-select-1').classList.add('hidden');
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium capitalize">{nature.name}</div>
                                {nature.increased_stat && nature.decreased_stat ? (
                                  <div className="flex gap-2 mt-1">
                                    <span className="text-xs text-green-600">+{nature.increased_stat.name.replace('special-', 'Sp.')}</span>
                                    <span className="text-xs text-red-600">-{nature.decreased_stat.name.replace('special-', 'Sp.')}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">Neutral</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* IVs/EVs Collapsible Section */}
                      <div className="bg-blue-50 rounded-xl shadow-md">
                        <button
                          onClick={() => setShowIVsEVs1(!showIVsEVs1)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-100/50 rounded-xl transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-blue-900">IVs & EVs Configuration</span>
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              Advanced
                            </span>
                          </div>
                          <div className={`transform transition-transform duration-300 ${showIVsEVs1 ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        
                        {showIVsEVs1 && (
                          <div className="px-4 pb-4 space-y-4 animate-fadeIn">
                            {/* IV and EV Headers with Info */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <label className="font-semibold text-blue-900 text-sm">IVs & EVs Configuration</label>
                                <div className="relative group">
                                  <button className="text-blue-600 hover:text-blue-800">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </button>
                                  <div className="absolute right-0 w-64 p-3 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-xs">
                                    <p className="font-semibold mb-1">IVs vs EVs</p>
                                    <p className="text-gray-600 mb-2"><strong>IVs:</strong> 0-31 per stat, determined at birth</p>
                                    <p className="text-gray-600"><strong>EVs:</strong> 0-252 per stat, 510 total. Every 4 EVs = +1 stat at level 100</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Quick Presets */}
                            <div>
                              <p className="text-xs font-medium text-blue-700 mb-2">Quick Actions:</p>
                              <div className="grid grid-cols-1 gap-1 mb-2">
                                <button
                                  onClick={() => {
                                    setPokemon1Config(prev => {
                                      const newConfig = {
                                        ...prev,
                                        ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 }
                                      };
                                      if (!newConfig.manualStats && selectedPokemon1) {
                                        newConfig.stats = calculateAllStats(selectedPokemon1, newConfig);
                                      }
                                      return newConfig;
                                    });
                                  }}
                                  className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs hover:bg-gray-200 transition-colors"
                                >
                                  Max IVs
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <button
                                  onClick={() => setPokemon1Config(prev => ({
                                    ...prev,
                                    evs: { hp: 0, attack: 252, defense: 0, specialAttack: 0, specialDefense: 4, speed: 252 }
                                  }))}
                                  className="px-2 py-1 bg-white border border-blue-300 rounded text-xs hover:bg-blue-100 transition-colors"
                                >
                                  Physical Sweeper
                                </button>
                                <button
                                  onClick={() => setPokemon1Config(prev => ({
                                    ...prev,
                                    evs: { hp: 0, attack: 0, defense: 0, specialAttack: 252, specialDefense: 4, speed: 252 }
                                  }))}
                                  className="px-2 py-1 bg-white border border-blue-300 rounded text-xs hover:bg-blue-100 transition-colors"
                                >
                                  Special Sweeper
                                </button>
                                <button
                                  onClick={() => setPokemon1Config(prev => ({
                                    ...prev,
                                    evs: { hp: 252, attack: 0, defense: 252, specialAttack: 0, specialDefense: 4, speed: 0 }
                                  }))}
                                  className="px-2 py-1 bg-white border border-blue-300 rounded text-xs hover:bg-blue-100 transition-colors"
                                >
                                  Physical Tank
                                </button>
                                <button
                                  onClick={() => setPokemon1Config(prev => ({
                                    ...prev,
                                    evs: { hp: 252, attack: 0, defense: 4, specialAttack: 0, specialDefense: 252, speed: 0 }
                                  }))}
                                  className="px-2 py-1 bg-white border border-blue-300 rounded text-xs hover:bg-blue-100 transition-colors"
                                >
                                  Special Tank
                                </button>
                              </div>
                            </div>

                            {/* IVs and EVs Side by Side */}
                            <div className="grid grid-cols-2 gap-4">
                              {/* IVs Section */}
                              <div>
                                <label className="block font-semibold text-blue-900 mb-2 text-xs text-center">IVs (0-31)</label>
                                <div className="grid grid-cols-2 gap-1">
                                  {Object.entries(pokemon1Config.ivs).map(([stat, value]) => (
                                    <div key={stat} className="bg-white rounded-lg p-1.5 border border-blue-200">
                                      <label className="text-xs font-medium text-blue-700 capitalize block mb-1 text-center">
                                        {stat.replace('special', 'Sp.')}
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="31"
                                        value={value}
                                        onChange={(e) => {
                                          setPokemon1Config(prev => {
                                            const newConfig = {
                                              ...prev,
                                              ivs: { ...prev.ivs, [stat]: Math.min(31, Math.max(0, parseInt(e.target.value) || 0)) }
                                            };
                                            // Auto-recalculate stats when IVs change
                                            if (!newConfig.manualStats && selectedPokemon1) {
                                              newConfig.stats = calculateAllStats(selectedPokemon1, newConfig);
                                            }
                                            return newConfig;
                                          });
                                        }}
                                        className="w-full px-1 py-1 border border-blue-200 rounded text-xs text-center font-bold focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                                      />
                                      <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-blue-500 transition-all duration-300"
                                          style={{ width: `${(value / 31) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={() => {
                                    setPokemon1Config(prev => {
                                      const newConfig = {
                                        ...prev,
                                        ivs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }
                                      };
                                      if (!newConfig.manualStats && selectedPokemon1) {
                                        newConfig.stats = calculateAllStats(selectedPokemon1, newConfig);
                                      }
                                      return newConfig;
                                    });
                                  }}
                                  className="w-full mt-2 px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs hover:bg-gray-200 transition-colors"
                                >
                                  Reset IVs
                                </button>
                              </div>

                              {/* EVs Section */}
                              <div>
                                <label className="block font-semibold text-blue-900 mb-2 text-xs text-center">EVs (0-252)</label>
                                <div className="grid grid-cols-2 gap-1">
                                  {Object.entries(pokemon1Config.evs).map(([stat, value]) => (
                                    <div key={stat} className="bg-white rounded-lg p-1.5 border border-orange-200">
                                      <label className="text-xs font-medium text-orange-700 capitalize block mb-1 text-center">
                                        {stat.replace('special', 'Sp.')} <span className="text-orange-600 font-bold">+{Math.floor(value / 4)}</span>
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="252"
                                        value={value}
                                        onChange={(e) => {
                                          setPokemon1Config(prev => {
                                            const newConfig = {
                                              ...prev,
                                              evs: { ...prev.evs, [stat]: Math.min(252, parseInt(e.target.value) || 0) }
                                            };
                                            // Auto-recalculate stats when EVs change
                                            if (!newConfig.manualStats && selectedPokemon1) {
                                              newConfig.stats = calculateAllStats(selectedPokemon1, newConfig);
                                            }
                                            return newConfig;
                                          });
                                        }}
                                        className="w-full px-1 py-1 border border-orange-200 rounded text-xs text-center font-bold focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                                      />
                                      <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300"
                                          style={{ width: `${(value / 252) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={() => {
                                    setPokemon1Config(prev => {
                                      const newConfig = {
                                        ...prev,
                                        evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }
                                      };
                                      if (!newConfig.manualStats && selectedPokemon1) {
                                        newConfig.stats = calculateAllStats(selectedPokemon1, newConfig);
                                      }
                                      return newConfig;
                                    });
                                  }}
                                  className="w-full mt-2 px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs hover:bg-gray-200 transition-colors"
                                >
                                  Reset EVs
                                </button>
                              </div>
                            </div>
                            
                            <div className={`mt-2 text-xs text-center font-semibold ${
                              Object.values(pokemon1Config.evs).reduce((sum, ev) => sum + ev, 0) > 510 
                                ? 'text-red-600' 
                                : 'text-orange-700'
                            }`}>
                              Total EVs: {Object.values(pokemon1Config.evs).reduce((sum, ev) => sum + ev, 0)}/510
                              {Object.values(pokemon1Config.evs).reduce((sum, ev) => sum + ev, 0) > 510 && 
                                <span className="block text-red-600">⚠️ Over limit!</span>
                              }
                            </div>
                            
                            {!pokemon1Config.manualStats && (
                              <button
                                onClick={() => {
                                  const newStats = calculateAllStats(selectedPokemon1, pokemon1Config);
                                  setPokemon1Config(prev => ({ ...prev, stats: newStats }));
                                }}
                                className="w-full mt-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
                              >
                                Recalculate Stats
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="bg-gradient-to-br from-indigo-50 to-pink-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <label className="block font-semibold text-indigo-900 text-sm">Battle Stats</label>
                          <button
                            onClick={() => setPokemon1Config(prev => ({ ...prev, manualStats: !prev.manualStats }))}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors"
                            title={pokemon1Config.manualStats ? "Switch to auto calculate" : "Manual edit stats"}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(pokemon1Config.stats).map(([stat, value]) => {
                            const maxStat = stat === 'hp' ? 714 : 658; // Max possible stats
                            const percentage = (value / maxStat) * 100;
                            
                            // Color coding based on stat value
                            let barColor = 'bg-red-400';
                            if (value >= 150) barColor = 'bg-green-600';
                            else if (value >= 120) barColor = 'bg-green-500';
                            else if (value >= 100) barColor = 'bg-green-400';
                            else if (value >= 80) barColor = 'bg-yellow-400';
                            else if (value >= 60) barColor = 'bg-yellow-500';
                            else if (value >= 40) barColor = 'bg-orange-400';
                            else if (value >= 20) barColor = 'bg-red-500';
                            
                            return (
                              <div key={stat} className="bg-white rounded-lg p-2">
                                <div className="flex justify-between items-center mb-1">
                                  <label className="text-xs font-semibold text-gray-700 capitalize">
                                    {stat.replace('special', 'Sp.')}
                                  </label>
                                  <div className="flex items-center gap-2">
                                    {selectedPokemon1?.stats && (
                                      <span className="text-xs text-gray-500">
                                        Base: {selectedPokemon1.stats.find(s => s.stat.name.replace('-', '') === stat.replace('special', 'special'))?.base_stat || '?'}
                                      </span>
                                    )}
                                    {pokemon1Config.manualStats ? (
                                      <input
                                        type="number"
                                        min="1"
                                        max="999"
                                        value={value}
                                        onChange={(e) => setPokemon1Config(prev => ({
                                          ...prev,
                                          stats: { ...prev.stats, [stat]: parseInt(e.target.value) || 0 }
                                        }))}
                                        className="w-16 px-1 py-0.5 border-2 border-gray-300 rounded text-xs text-center font-bold"
                                      />
                                    ) : (
                                      <span className="text-sm font-bold text-gray-800">{value}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`${barColor} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-3">
                        <label className="block font-semibold text-cyan-900 mb-2 text-sm">Battle Moves</label>
                        {pokemon1Config.selectedMoves.length > 0 ? (
                          <div className="space-y-2 mb-3">
                            {pokemon1Config.selectedMoves.map((move, idx) => (
                              <div key={idx} className="bg-white border-2 border-cyan-200 px-3 py-2 rounded-lg hover:bg-cyan-50 transition-all">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium capitalize text-cyan-800">
                                    {move.move.name.replace(/-/g, ' ')}
                                  </span>
                                  {movesData[move.move.name] && (
                                    <TypeBadge 
                                      type={movesData[move.move.name].type?.name} 
                                      size="xs"
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4 bg-white rounded-lg mb-3">No moves selected</p>
                        )}
                        <button 
                          onClick={() => setShowMoveSelector(1)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-md"
                        >
                          Select Moves ({pokemon1Config.selectedMoves.length}/4)
                        </button>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center animate-pulse">
                      <svg className="w-16 h-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-600 mb-4">No Pokemon Selected</p>
                    <button 
                      onClick={() => setShowPokemonSelector(1)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                      Choose Pokemon
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Player 2 Configuration */}
            <div>
              {selectedPokemon2 ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-red-200 hover:shadow-2xl transition-all duration-300">
                  <div>

                    {/* Configuration */}
                    <div className="space-y-4">
                      <div className="bg-red-50 rounded-xl p-3">
                        <label className="block font-semibold text-red-900 mb-2 text-sm">Level</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={pokemon2Config.level}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val >= 1 && val <= 100) {
                                setPokemon2Config(prev => ({ ...prev, level: val }));
                              }
                            }}
                            className="w-16 px-2 py-1 border-2 border-red-200 rounded-lg focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-center font-bold"
                          />
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={pokemon2Config.level}
                            onChange={(e) => setPokemon2Config(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(pokemon2Config.level - 1) / 99 * 100}%, #e5e7eb ${(pokemon2Config.level - 1) / 99 * 100}%, #e5e7eb 100%)`
                            }}
                          />
                        </div>
                      </div>

                      <div className="bg-red-50 rounded-xl p-3">
                        <label className="block font-semibold text-red-900 mb-2 text-sm">Nature</label>
                        <div className="relative">
                          <div className="bg-white border-2 border-red-200 rounded-lg p-3 cursor-pointer hover:border-red-400 transition-all"
                               onClick={() => document.getElementById('nature-select-2').classList.toggle('hidden')}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-red-900 text-lg capitalize">
                                  {pokemon2Config.nature}
                                </div>
                                {(() => {
                                  const nature = allNatures.find(n => n.name === pokemon2Config.nature);
                                  if (nature?.increased_stat && nature?.decreased_stat) {
                                    return (
                                      <div className="flex gap-2 mt-1">
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                          +{nature.increased_stat.name.replace('special-', 'Sp.')}
                                        </span>
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                          -{nature.decreased_stat.name.replace('special-', 'Sp.')}
                                        </span>
                                      </div>
                                    );
                                  }
                                  return <span className="text-xs text-gray-500">No stat changes</span>;
                                })()}
                              </div>
                              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          
                          <div id="nature-select-2" className="hidden absolute top-full left-0 right-0 mt-1 bg-white border-2 border-red-200 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto">
                            {allNatures.map(nature => (
                              <button
                                key={nature.name}
                                onClick={() => {
                                  setPokemon2Config(prev => ({ ...prev, nature: nature.name }));
                                  document.getElementById('nature-select-2').classList.add('hidden');
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-red-50 transition-colors border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium capitalize">{nature.name}</div>
                                {nature.increased_stat && nature.decreased_stat ? (
                                  <div className="flex gap-2 mt-1">
                                    <span className="text-xs text-green-600">+{nature.increased_stat.name.replace('special-', 'Sp.')}</span>
                                    <span className="text-xs text-red-600">-{nature.decreased_stat.name.replace('special-', 'Sp.')}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">Neutral</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* IVs/EVs Collapsible Section */}
                      <div className="bg-red-50 rounded-xl shadow-md">
                        <button
                          onClick={() => setShowIVsEVs2(!showIVsEVs2)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-red-100/50 rounded-xl transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-red-900">IVs & EVs Configuration</span>
                            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                              Advanced
                            </span>
                          </div>
                          <div className={`transform transition-transform duration-300 ${showIVsEVs2 ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        
                        {showIVsEVs2 && (
                          <div className="px-4 pb-4 space-y-4 animate-fadeIn">
                            {/* IV and EV Headers with Info */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <label className="font-semibold text-red-900 text-sm">IVs & EVs Configuration</label>
                                <div className="relative group">
                                  <button className="text-red-600 hover:text-red-800">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </button>
                                  <div className="absolute right-0 w-64 p-3 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-xs">
                                    <p className="font-semibold mb-1">IVs vs EVs</p>
                                    <p className="text-gray-600 mb-2"><strong>IVs:</strong> 0-31 per stat, determined at birth</p>
                                    <p className="text-gray-600"><strong>EVs:</strong> 0-252 per stat, 510 total. Every 4 EVs = +1 stat at level 100</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Quick Actions */}
                            <div>
                              <p className="text-xs font-medium text-red-700 mb-2">Quick Actions:</p>
                              <div className="flex justify-center mb-2">
                                <button
                                  onClick={() => {
                                    setPokemon2Config(prev => {
                                      const newConfig = {
                                        ...prev,
                                        ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 }
                                      };
                                      if (!newConfig.manualStats && selectedPokemon2) {
                                        newConfig.stats = calculateAllStats(selectedPokemon2, newConfig);
                                      }
                                      return newConfig;
                                    });
                                  }}
                                  className="px-2 py-1 bg-white border border-red-300 rounded text-xs hover:bg-red-100 transition-colors"
                                >
                                  Max IVs
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <button
                                  onClick={() => setPokemon2Config(prev => ({
                                    ...prev,
                                    evs: { hp: 0, attack: 252, defense: 0, specialAttack: 0, specialDefense: 4, speed: 252 }
                                  }))}
                                  className="px-2 py-1 bg-white border border-red-300 rounded text-xs hover:bg-red-100 transition-colors"
                                >
                                  Physical Sweeper
                                </button>
                                <button
                                  onClick={() => setPokemon2Config(prev => ({
                                    ...prev,
                                    evs: { hp: 0, attack: 0, defense: 0, specialAttack: 252, specialDefense: 4, speed: 252 }
                                  }))}
                                  className="px-2 py-1 bg-white border border-red-300 rounded text-xs hover:bg-red-100 transition-colors"
                                >
                                  Special Sweeper
                                </button>
                                <button
                                  onClick={() => setPokemon2Config(prev => ({
                                    ...prev,
                                    evs: { hp: 252, attack: 0, defense: 252, specialAttack: 0, specialDefense: 4, speed: 0 }
                                  }))}
                                  className="px-2 py-1 bg-white border border-red-300 rounded text-xs hover:bg-red-100 transition-colors"
                                >
                                  Physical Tank
                                </button>
                                <button
                                  onClick={() => setPokemon2Config(prev => ({
                                    ...prev,
                                    evs: { hp: 252, attack: 0, defense: 4, specialAttack: 0, specialDefense: 252, speed: 0 }
                                  }))}
                                  className="px-2 py-1 bg-white border border-red-300 rounded text-xs hover:bg-red-100 transition-colors"
                                >
                                  Special Tank
                                </button>
                              </div>
                            </div>

                            {/* IVs and EVs Side by Side */}
                            <div className="grid grid-cols-2 gap-4">
                              {/* IVs Section */}
                              <div>
                                <label className="block font-semibold text-red-900 mb-2 text-xs text-center">IVs (0-31)</label>
                                <div className="grid grid-cols-2 gap-1">
                                  {Object.entries(pokemon2Config.ivs).map(([stat, value]) => (
                                    <div key={stat} className="bg-white rounded-lg p-1.5 border border-red-200">
                                      <label className="text-xs font-medium text-red-700 capitalize block mb-1 text-center">
                                        {stat.replace('special', 'Sp.')}
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="31"
                                        value={value}
                                        onChange={(e) => {
                                          setPokemon2Config(prev => {
                                            const newConfig = {
                                              ...prev,
                                              ivs: { ...prev.ivs, [stat]: Math.min(31, Math.max(0, parseInt(e.target.value) || 0)) }
                                            };
                                            // Auto-recalculate stats when IVs change
                                            if (!newConfig.manualStats && selectedPokemon2) {
                                              newConfig.stats = calculateAllStats(selectedPokemon2, newConfig);
                                            }
                                            return newConfig;
                                          });
                                        }}
                                        className="w-full px-1 py-1 border border-red-200 rounded text-xs text-center font-bold focus:border-red-400 focus:ring-1 focus:ring-red-100"
                                      />
                                      <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-red-500 transition-all duration-300"
                                          style={{ width: `${(value / 31) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Reset IVs Button */}
                                <button
                                  onClick={() => {
                                    setPokemon2Config(prev => {
                                      const newConfig = {
                                        ...prev,
                                        ivs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }
                                      };
                                      if (!newConfig.manualStats && selectedPokemon2) {
                                        newConfig.stats = calculateAllStats(selectedPokemon2, newConfig);
                                      }
                                      return newConfig;
                                    });
                                  }}
                                  className="w-full mt-2 px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                                >
                                  Reset IVs
                                </button>
                              </div>

                              {/* EVs Section */}
                              <div>
                                <label className="block font-semibold text-red-900 mb-2 text-xs text-center">EVs (0-252)</label>
                                <div className="grid grid-cols-2 gap-1">
                                  {Object.entries(pokemon2Config.evs).map(([stat, value]) => (
                                    <div key={stat} className="bg-white rounded-lg p-1.5 border border-red-200">
                                      <label className="text-xs font-medium text-red-700 capitalize block mb-1 text-center">
                                        {stat.replace('special', 'Sp.')} <span className="text-red-600 font-bold">+{Math.floor(value / 4)}</span>
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="252"
                                        value={value}
                                        onChange={(e) => {
                                          setPokemon2Config(prev => {
                                            const newConfig = {
                                              ...prev,
                                              evs: { ...prev.evs, [stat]: Math.min(252, parseInt(e.target.value) || 0) }
                                            };
                                            // Auto-recalculate stats when EVs change
                                            if (!newConfig.manualStats && selectedPokemon2) {
                                              newConfig.stats = calculateAllStats(selectedPokemon2, newConfig);
                                            }
                                            return newConfig;
                                          });
                                        }}
                                        className="w-full px-1 py-1 border border-red-200 rounded text-xs text-center font-bold focus:border-red-400 focus:ring-1 focus:ring-red-100"
                                      />
                                      <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-red-500 transition-all duration-300"
                                          style={{ width: `${(value / 252) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Reset EVs Button */}
                                <button
                                  onClick={() => {
                                    setPokemon2Config(prev => {
                                      const newConfig = {
                                        ...prev,
                                        evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }
                                      };
                                      if (!newConfig.manualStats && selectedPokemon2) {
                                        newConfig.stats = calculateAllStats(selectedPokemon2, newConfig);
                                      }
                                      return newConfig;
                                    });
                                  }}
                                  className="w-full mt-2 px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                                >
                                  Reset EVs
                                </button>
                              </div>
                            </div>
                            
                            <div className={`mt-2 text-xs text-center font-semibold ${
                              Object.values(pokemon2Config.evs).reduce((sum, ev) => sum + ev, 0) > 510 
                                ? 'text-red-600' 
                                : 'text-red-700'
                            }`}>
                              Total EVs: {Object.values(pokemon2Config.evs).reduce((sum, ev) => sum + ev, 0)}/510
                              {Object.values(pokemon2Config.evs).reduce((sum, ev) => sum + ev, 0) > 510 && 
                                <span className="block text-red-600">⚠️ Over limit!</span>
                              }
                            </div>
                            {!pokemon2Config.manualStats && (
                              <button
                                onClick={() => {
                                  const newStats = calculateAllStats(selectedPokemon2, pokemon2Config);
                                  setPokemon2Config(prev => ({ ...prev, stats: newStats }));
                                }}
                                className="w-full mt-2 px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-xs font-semibold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
                              >
                                Recalculate Stats
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="bg-red-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <label className="block font-semibold text-red-900 text-sm">Battle Stats</label>
                          <button
                            onClick={() => setPokemon2Config(prev => ({ ...prev, manualStats: !prev.manualStats }))}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title={pokemon2Config.manualStats ? "Switch to auto calculate" : "Manual edit stats"}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(pokemon2Config.stats).map(([stat, value]) => {
                            const maxStat = stat === 'hp' ? 714 : 658; // Max possible stats
                            const percentage = (value / maxStat) * 100;
                            
                            // Color coding based on stat value
                            let barColor = 'bg-red-400';
                            if (value >= 150) barColor = 'bg-green-600';
                            else if (value >= 120) barColor = 'bg-green-500';
                            else if (value >= 100) barColor = 'bg-green-400';
                            else if (value >= 80) barColor = 'bg-yellow-400';
                            else if (value >= 60) barColor = 'bg-yellow-500';
                            else if (value >= 40) barColor = 'bg-orange-400';
                            else if (value >= 20) barColor = 'bg-red-500';
                            
                            return (
                              <div key={stat} className="bg-white rounded-lg p-2">
                                <div className="flex justify-between items-center mb-1">
                                  <label className="text-xs font-semibold text-gray-700 capitalize">
                                    {stat.replace('special', 'Sp.')}
                                  </label>
                                  <div className="flex items-center gap-2">
                                    {selectedPokemon2?.stats && (
                                      <span className="text-xs text-gray-500">
                                        Base: {selectedPokemon2.stats.find(s => s.stat.name.replace('-', '') === stat.replace('special', 'special'))?.base_stat || '?'}
                                      </span>
                                    )}
                                    {pokemon2Config.manualStats ? (
                                      <input
                                        type="number"
                                        min="1"
                                        max="999"
                                        value={value}
                                        onChange={(e) => setPokemon2Config(prev => ({
                                          ...prev,
                                          stats: { ...prev.stats, [stat]: parseInt(e.target.value) || 0 }
                                        }))}
                                        className="w-16 px-1 py-0.5 border-2 border-gray-300 rounded text-xs text-center font-bold"
                                      />
                                    ) : (
                                      <span className="text-sm font-bold text-gray-800">{value}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`${barColor} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-red-50 rounded-xl p-3">
                        <label className="block font-semibold text-red-900 mb-2 text-sm">Battle Moves</label>
                        {pokemon2Config.selectedMoves.length > 0 ? (
                          <div className="space-y-2 mb-3">
                            {pokemon2Config.selectedMoves.map((move, idx) => (
                              <div key={idx} className="bg-white border-2 border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition-all">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium capitalize text-red-800">
                                    {move.move.name.replace(/-/g, ' ')}
                                  </span>
                                  {movesData[move.move.name] && (
                                    <TypeBadge 
                                      type={movesData[move.move.name].type?.name} 
                                      size="xs"
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4 bg-white rounded-lg mb-3">No moves selected</p>
                        )}
                        <button 
                          onClick={() => setShowMoveSelector(2)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-md"
                        >
                          Select Moves ({pokemon2Config.selectedMoves.length}/4)
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-red-200 hover:shadow-2xl transition-all duration-300">
                  <div className="text-center py-12">
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center animate-pulse">
                      <svg className="w-16 h-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-600 mb-4">No Pokemon Selected</p>
                    <button 
                      onClick={() => setShowPokemonSelector(2)}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                      Select Pokemon
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Battle Controls - moved inside the grid */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <div className="text-center relative">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={runBattle}
                    className="relative px-12 py-4 text-xl font-black text-white rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    disabled={!selectedPokemon1 || !selectedPokemon2 || battleActive}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-full shadow-lg animate-pulse"></span>
                    <span className="relative">
                      {battleActive ? 'Battle in Progress...' : 'Start Battle!'}
                    </span>
                  </button>
                  
                  {(selectedPokemon1 || selectedPokemon2 || battleLog.length > 0) && (
                    <button 
                      onClick={resetBattle}
                      className="relative px-8 py-4 text-lg font-bold text-white rounded-full transition-all transform hover:scale-105"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full shadow-lg"></span>
                      <span className="relative flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset Battle
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Log */}
        {battleLog.length > 0 && (
          <div className="mt-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur-xl opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-xl p-6 border-2 border-yellow-200">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">Battle Log</h3>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 max-h-64 overflow-y-auto border border-yellow-200">
                {battleLog.map((entry, index) => (
                  <div key={index} className={`py-2 px-3 rounded-lg mb-1 ${
                    entry.includes('Turn') 
                      ? 'font-bold text-gray-800 bg-white shadow-sm' 
                      : entry.includes('wins!') 
                        ? 'text-lg font-black bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-4 rounded-xl shadow-lg animate-pulse' 
                        : 'text-gray-700'
                  }`}>
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Enhanced Pokemon Selection Modal */}
      <EnhancedPokemonSelector
        isOpen={!!showPokemonSelector}
        onClose={() => setShowPokemonSelector(null)}
        onSelect={(pokemon) => selectPokemon(pokemon, showPokemonSelector)}
        pokemonList={pokemonList}
        loading={loading}
        playerNumber={showPokemonSelector}
      />

      {/* Move Selection Modal */}
      {showMoveSelector && (
        <Modal isOpen={true} onClose={() => setShowMoveSelector(null)}>
          <div className="p-6">
            <h2 className="text-3xl font-bold text-center mb-2">
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Select Moves
              </span>
            </h2>
            <p className="text-center text-lg font-medium text-gray-700 mb-4 capitalize">
              {showMoveSelector === 1 ? selectedPokemon1?.name : selectedPokemon2?.name}
            </p>
            
            {/* Selected Moves Count */}
            <div className="mb-4 text-center">
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full">
                <span className="text-lg font-bold text-cyan-800">
                  Selected: {showMoveSelector === 1 ? pokemon1Config.selectedMoves.length : pokemon2Config.selectedMoves.length}/4
                </span>
              </div>
            </div>
            
            {/* Move Search and Filters */}
            <div className="mb-4 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search moves..."
                  value={moveSearchTerm}
                  onChange={(e) => setMoveSearchTerm(e.target.value)}
                  className="w-full px-10 py-3 border-2 border-cyan-300 rounded-full focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500 transition-all"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Move Filters */}
              <div className="flex flex-wrap gap-2 justify-center">
                {['all', 'physical', 'special', 'status'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setMoveFilter(filter)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      moveFilter === filter
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Best Moves Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    const pokemon = showMoveSelector === 1 ? selectedPokemon1 : selectedPokemon2;
                    const config = showMoveSelector === 1 ? pokemon1Config : pokemon2Config;
                    selectBestMoves(pokemon, config, showMoveSelector);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full font-bold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  ⭐ Select Best Moves
                </button>
              </div>
            </div>
            
            {/* Moves List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {(showMoveSelector === 1 ? availableMoves1 : availableMoves2)
                .filter(moveInfo => {
                  // Search filter
                  const searchMatch = moveInfo.move.name.toLowerCase().includes(moveSearchTerm.toLowerCase());
                  
                  // Move type filter
                  if (moveFilter === 'all') return searchMatch;
                  
                  const moveData = movesData[moveInfo.move.name];
                  if (!moveData) return searchMatch; // Show if no data loaded yet
                  
                  if (moveFilter === 'physical') {
                    return searchMatch && moveData.damage_class?.name === 'physical';
                  } else if (moveFilter === 'special') {
                    return searchMatch && moveData.damage_class?.name === 'special';
                  } else if (moveFilter === 'status') {
                    return searchMatch && moveData.damage_class?.name === 'status';
                  }
                  
                  return searchMatch;
                })
                .map((moveInfo, index) => {
                const isSelected = showMoveSelector === 1 
                  ? pokemon1Config.selectedMoves.some(m => m.move.name === moveInfo.move.name)
                  : pokemon2Config.selectedMoves.some(m => m.move.name === moveInfo.move.name);
                
                const canSelect = showMoveSelector === 1 
                  ? pokemon1Config.selectedMoves.length < 4
                  : pokemon2Config.selectedMoves.length < 4;
                
                return (
                  <button
                    key={index}
                    data-move-name={moveInfo.move.name}
                    onClick={() => {
                      if (showMoveSelector === 1) {
                        if (isSelected) {
                          setPokemon1Config(prev => ({
                            ...prev,
                            selectedMoves: prev.selectedMoves.filter(m => m.move.name !== moveInfo.move.name)
                          }));
                        } else if (canSelect) {
                          setPokemon1Config(prev => ({
                            ...prev,
                            selectedMoves: [...prev.selectedMoves, moveInfo]
                          }));
                        }
                      } else {
                        if (isSelected) {
                          setPokemon2Config(prev => ({
                            ...prev,
                            selectedMoves: prev.selectedMoves.filter(m => m.move.name !== moveInfo.move.name)
                          }));
                        } else if (canSelect) {
                          setPokemon2Config(prev => ({
                            ...prev,
                            selectedMoves: [...prev.selectedMoves, moveInfo]
                          }));
                        }
                      }
                    }}
                    className={`move-item group w-full text-left px-4 py-3 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                      isSelected 
                        ? 'border-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-cyan-300 hover:bg-gray-50'
                    } ${!canSelect && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!canSelect && !isSelected}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="capitalize font-bold text-gray-800 group-hover:text-cyan-700 transition-colors">
                            {moveInfo.move.name.replace(/-/g, ' ')}
                          </div>
                          {movesData[moveInfo.move.name] && (
                            <TypeBadge 
                              type={movesData[moveInfo.move.name].type?.name} 
                              size="xs"
                            />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {moveInfo.version_group_details[0]?.move_learn_method?.name === 'level-up' 
                            ? `Level ${moveInfo.version_group_details[0]?.level_learned_at}`
                            : moveInfo.version_group_details[0]?.move_learn_method?.name.replace(/-/g, ' ')
                          }
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center animate-bounce ml-2">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowMoveSelector(null)}
                className="px-10 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </FullBleedWrapper>
    </>
  );
}

// Mark this page as fullBleed to remove default padding
BattleSimulator.fullBleed = true;