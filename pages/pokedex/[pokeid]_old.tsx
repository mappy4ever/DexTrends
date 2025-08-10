import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { NextPage } from "next";
import { TypeBadge } from "../../components/ui/TypeBadge";
import { TypeEffectivenessBadge } from "../../components/ui/TypeEffectivenessBadge";
import { useFavorites } from "../../context/UnifiedAppContext";
import { typeEffectiveness, getGeneration } from "../../utils/pokemonutils";
import { fetchJSON } from "../../utils/unifiedFetch";
import { sanitizePokemonName } from "../../utils/pokemonNameSanitizer";
import { fetchTCGCards, fetchPocketCards } from "../../utils/apiutils";
import logger from "../../utils/logger";
import type { AbilityData as AbilityApiData } from "../../types/pokemon";
import EnhancedEvolutionDisplay from "../../components/ui/EnhancedEvolutionDisplay";
import PokemonFormSelector from "../../components/ui/PokemonFormSelector";
import SimplifiedMovesDisplay from "../../components/ui/SimplifiedMovesDisplay";
import CardList from "../../components/CardList";
import PocketCardList from "../../components/PocketCardList";
import { fetchPocketData } from "../../utils/pocketData";
import { getPokemonSDK } from "../../utils/pokemonSDK";
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import { CardGridSkeleton } from "../../components/ui/SkeletonLoader";
import Modal from "../../components/ui/modals/Modal";
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";
import PageErrorBoundary from "../../components/ui/PageErrorBoundary";
import { getTypeUIColors } from "../../utils/pokemonTypeGradients";
import type { Pokemon, PokemonSpecies, Nature, EvolutionChain, PokemonAbility, PokemonStat } from "../../types/api/pokemon";
import type { FavoritePokemon } from "../../context/modules/types";
import type { TCGCard } from "../../types/api/cards";
import type { PocketCard } from "../../types/api/pocket-cards";

// Interface for abilities state
interface AbilityData {
  name: string;
  isHidden: boolean;
  effect: string;
  short_effect: string;
}

// Interface for location encounters
interface LocationAreaEncounter {
  location_area: {
    name: string;
    url: string;
  };
  version_details: {
    encounter_details: {
      chance: number;
      condition_values: { name: string; url: string }[];
      max_level: number;
      method: {
        name: string;
        url: string;
      };
      min_level: number;
    }[];
    max_chance: number;
    version: {
      name: string;
      url: string;
    };
  }[];
}


// Extended TCGCard for Pocket compatibility
interface ExtendedTCGCard extends TCGCard {
  isPocket?: boolean;
}

const PokemonDetail: NextPage = () => {
  const router = useRouter();
  const { pokeid, form } = router.query;
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [tcgCards, setTcgCards] = useState<TCGCard[]>([]);
  const [pocketCards, setPocketCards] = useState<PocketCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState<boolean>(false);
  const [abilities, setAbilities] = useState<Record<string, AbilityData>>({});
  const [cardType, setCardType] = useState<'tcg' | 'pocket'>('tcg');
  const [zoomedCard, setZoomedCard] = useState<TCGCard | PocketCard | null>(null);
  const [locationAreaEncounters, setLocationAreaEncounters] = useState<LocationAreaEncounter[]>([]);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChain | null>(null);
  const [selectedNature, setSelectedNature] = useState<string>('hardy');
  const [selectedLevel, setSelectedLevel] = useState<number>(50);
  const [natureData, setNatureData] = useState<Nature | null>(null);
  const [allNatures, setAllNatures] = useState<Nature[]>([]);
  const [showStatsCalculator, setShowStatsCalculator] = useState<boolean>(false);
  const [hasOpenedCalculator, setHasOpenedCalculator] = useState<boolean>(false);

  // Load specific nature data (cached)
  const loadNatureData = useCallback(async (natureName: string) => {
    try {
      const data = await fetchJSON<Nature>(`https://pokeapi.co/api/v2/nature/${natureName}`);
      if (data) {
        setNatureData(data);
      } else {
        logger.error('Failed to fetch nature data:', { natureName });
      }
    } catch (err) {
      logger.error('Error loading nature data:', { error: err });
    }
  }, []);

  // Load all available natures
  const loadAllNatures = useCallback(async () => {
    try {
      const response = await fetchJSON<{ results: { name: string; url: string }[] }>('https://pokeapi.co/api/v2/nature/');
      if (!response) {
        logger.error('Failed to fetch natures list');
        return;
      }
      // Load full data for each nature
      const naturesWithData = await Promise.all(
        response.results.map(async (nature: { name: string; url: string }) => {
          try {
            const natureData = await fetchJSON<Nature>(nature.url);
            return natureData || { name: nature.name };
          } catch (err) {
            logger.error(`Error loading nature:`, { natureName: nature.name, error: err });
            return { name: nature.name };
          }
        })
      );
      setAllNatures(naturesWithData as Nature[]);
      // Load default nature data
      await loadNatureData('hardy');
    } catch (err) {
      logger.error('Error loading natures:', { error: err });
    }
  }, [loadNatureData]);

  useEffect(() => {
    // Wait for router to be ready and pokeid to be available
    if (!router.isReady || !pokeid) return;

    const loadPokemon = async () => {
      try {
        setLoading(true);
        setError(null);

        logger.debug('Loading Pokemon with ID:', { pokeid, form });
        
        // Handle regional forms
        let pokemonIdentifier: string;
        if (form && typeof form === 'string') {
          // Construct regional form name (e.g., "vulpix-alolan")
          pokemonIdentifier = `${pokeid as string}-${form.toLowerCase()}`;
        } else {
          pokemonIdentifier = pokeid as string;
        }
        
        // Sanitize the Pokemon identifier for API calls
        const sanitizedId = sanitizePokemonName(pokemonIdentifier);
        logger.debug('Sanitized Pokemon ID:', { sanitizedId });

        // Load Pokemon basic data (cached)
        const pokemonData = await fetchJSON<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${sanitizedId}`);
        if (!pokemonData) {
          throw new Error(`Pokemon not found: ${sanitizedId}`);
        }
        setPokemon(pokemonData);

        // Load species data (cached)
        const speciesData = await fetchJSON<PokemonSpecies>(`https://pokeapi.co/api/v2/pokemon-species/${sanitizedId}`);
        if (!speciesData) {
          throw new Error(`Species not found: ${sanitizedId}`);
        }
        setSpecies(speciesData);

        // Load abilities
        await loadAbilities(pokemonData.abilities);

        // Load location encounters
        await loadLocationEncounters(pokemonData.location_area_encounters);

        // Load evolution chain
        if (speciesData.evolution_chain) {
          await loadEvolutionChain(speciesData.evolution_chain.url);
        }

        // Load all natures
        await loadAllNatures();

        // Load TCG cards for this Pokemon
        await loadCards(pokemonData.name);

      } catch (err: unknown) {
        logger.error('Error loading Pokemon:', { error: err });
        setError(`Failed to load Pokemon data: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    loadPokemon();
  }, [router.isReady, pokeid, form, loadAllNatures]);

  // Load location encounters
  const loadLocationEncounters = async (encountersUrl?: string) => {
    if (!encountersUrl) return;
    
    try {
      const encounters = await fetchJSON(encountersUrl);
      if (!encounters) {
        logger.error('Failed to fetch location encounters');
        return;
      }
      setLocationAreaEncounters(encounters as LocationAreaEncounter[]);
    } catch (err) {
      logger.error('Error loading location encounters:', { error: err });
      setLocationAreaEncounters([]);
    }
  };

  // Load evolution chain
  const loadEvolutionChain = async (evolutionUrl: string) => {
    if (!evolutionUrl) return;
    
    try {
      const chainData = await fetchJSON<EvolutionChain>(evolutionUrl);
      if (!chainData) {
        logger.error('Failed to fetch evolution chain');
        setEvolutionChain(null);
        return;
      }
      setEvolutionChain(chainData as EvolutionChain);
    } catch (err) {
      logger.error('Error loading evolution chain:', { error: err });
      setEvolutionChain(null);
    }
  };

  // These functions have been moved before useEffect to avoid temporal dead zone issues

  // Handle nature change
  const handleNatureChange = async (nature: string) => {
    setSelectedNature(nature);
    await loadNatureData(nature);
  };

  // Calculate stat with nature modifier and level
  const calculateStat = (baseStat: number, statName: string, level: number = selectedLevel): number => {
    const iv = 31; // Perfect IV
    const ev = 0; // No EVs for now
    
    // HP calculation is different
    if (statName === 'hp') {
      return Math.floor(((2 * baseStat + iv + ev/4) * level / 100) + level + 10);
    }
    
    // Other stats
    let natureModifier = 1.0;
    if (natureData) {
      if (natureData.increased_stat?.name === statName) natureModifier = 1.1;
      else if (natureData.decreased_stat?.name === statName) natureModifier = 0.9;
    }
    
    return Math.floor((((2 * baseStat + iv + ev/4) * level / 100) + 5) * natureModifier);
  };

  // Load abilities data
  const loadAbilities = async (abilitiesList?: PokemonAbility[]) => {
    if (!abilitiesList || abilitiesList.length === 0) return;
    
    const abilitiesData: Record<string, AbilityData> = {};
    
    for (const abilityInfo of abilitiesList) {
      try {
        const abilityData = await fetchJSON<AbilityApiData>(abilityInfo.ability.url);
        if (!abilityData) {
          logger.error(`Failed to fetch ability data for ${abilityInfo.ability.name}`);
          continue;
        }
        const englishEntry = abilityData.effect_entries.find(entry => entry.language.name === 'en');
        
        abilitiesData[abilityInfo.ability.name] = {
          name: abilityInfo.ability.name,
          isHidden: abilityInfo.is_hidden,
          effect: englishEntry?.effect || 'No description available.',
          short_effect: englishEntry?.short_effect || 'No short description available.'
        };
      } catch (err) {
        logger.error('Error loading ability:', { abilityName: abilityInfo.ability.name, error: err });
      }
    }
    
    setAbilities(abilitiesData);
  };

  // Load cards for this Pokemon
  const loadCards = async (pokemonName: string) => {
    if (!pokemonName) return;
    
    setCardsLoading(true);
    logger.debug('[Card Loading] Starting to load cards for:', { pokemonName });
    
    try {
      // Load TCG cards (cached) - sanitization is handled internally
      const tcgCardsData = await fetchTCGCards(pokemonName);
      logger.debug('[Card Loading] TCG cards loaded:', { count: tcgCardsData?.length || 0 });
      setTcgCards(tcgCardsData || []);
      
      // Load Pocket cards (cached) - sanitization is handled internally
      const pocketCardsData = await fetchPocketCards(pokemonName);
      logger.debug('[Card Loading] Pocket cards loaded:', { count: pocketCardsData?.length || 0 });
      setPocketCards(pocketCardsData || []);
    } catch (err) {
      logger.error('[Card Loading] Error loading cards:', { error: err });
      setTcgCards([]);
      setPocketCards([]);
    } finally {
      setCardsLoading(false);
    }
  };

  // Get type effectiveness
  const getTypeEffectiveness = () => {
    if (!pokemon?.types) return { weaknesses: [], resistances: [], immunities: [] };
    
    const typeNames = pokemon.types.map(t => t.type.name);
    
    // Calculate combined type effectiveness
    const weaknesses = new Set<string>();
    const resistances = new Set<string>();
    const immunities = new Set<string>();
    
    // For each type the Pokemon has
    typeNames.forEach(typeName => {
      const typeData = typeEffectiveness[typeName.toLowerCase()];
      if (!typeData) return;
      
      // Add weaknesses
      typeData.weakTo.forEach(weak => weaknesses.add(weak));
      
      // Add resistances
      typeData.resistantTo.forEach(resist => resistances.add(resist));
      
      // Add immunities
      typeData.immuneTo.forEach(immune => immunities.add(immune));
    });
    
    // Remove types that are both weak and resistant (dual-type interactions)
    const finalWeaknesses = Array.from(weaknesses).filter(type => !resistances.has(type) && !immunities.has(type));
    const finalResistances = Array.from(resistances).filter(type => !weaknesses.has(type));
    
    return {
      weaknesses: finalWeaknesses,
      resistances: finalResistances,
      immunities: Array.from(immunities)
    };
  };

  // Get flavor text
  const getFlavorText = () => {
    if (!species?.flavor_text_entries) return 'No description available.';
    
    const englishEntry = species.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    
    if (englishEntry) {
      return englishEntry.flavor_text.replace(/\f/g, ' ');
    }
    
    return 'No description available.';
  };

  // Get genus
  const getGenus = () => {
    if (!species?.genera) return 'Unknown Pokémon';
    
    const englishGenus = species.genera.find(
      genus => genus.language.name === 'en'
    );
    
    return englishGenus?.genus || 'Unknown Pokémon';
  };

  // Get egg groups
  const getEggGroups = () => {
    if (!species?.egg_groups) return ['Unknown'];
    
    return species.egg_groups.map(group => 
      group.name.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    );
  };

  // Calculate gender ratio
  const getGenderRatio = () => {
    if (!species || species.gender_rate === -1) {
      return { male: 0, female: 0, genderless: true };
    }
    
    const femaleRatio = species.gender_rate / 8 * 100;
    const maleRatio = 100 - femaleRatio;
    
    return { male: maleRatio, female: femaleRatio, genderless: false };
  };

  // Get generation number
  const getGenerationNumber = () => {
    if (!species?.generation) return 1;
    
    const genMatch = species.generation.name.match(/generation-(.+)/);
    if (genMatch) {
      const romanNumerals: Record<string, number> = {
        'i': 1, 'ii': 2, 'iii': 3, 'iv': 4,
        'v': 5, 'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9
      };
      return romanNumerals[genMatch[1]] || 1;
    }
    
    return 1;
  };

  // Format stat name
  const formatStatName = (statName: string) => {
    const statNames: Record<string, string> = {
      'hp': 'HP',
      'attack': 'Attack',
      'defense': 'Defense',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      'speed': 'Speed'
    };
    
    return statNames[statName] || statName;
  };

  // Get stat color gradient
  const getStatColor = (statName: string) => {
    const statColors: Record<string, string> = {
      'hp': 'from-red-400 to-red-600',
      'attack': 'from-orange-400 to-orange-600',
      'defense': 'from-yellow-400 to-yellow-600',
      'special-attack': 'from-blue-400 to-blue-600',
      'special-defense': 'from-green-400 to-green-600',
      'speed': 'from-pink-400 to-pink-600'
    };
    
    return statColors[statName] || 'from-gray-400 to-gray-600';
  };

  // Get max stat for percentage calculation
  const getMaxStat = (statName: string) => {
    // Base stat maxes (not including EVs/IVs/Nature)
    const maxStats: Record<string, number> = {
      'hp': 255,        // Blissey
      'attack': 190,    // Mega Mewtwo X
      'defense': 230,   // Shuckle
      'special-attack': 194,  // Mega Mewtwo Y
      'special-defense': 230, // Shuckle
      'speed': 200      // Regieleki
    };
    
    return maxStats[statName] || 255;
  };

  // Render type effectiveness section
  const renderTypeEffectiveness = () => {
    const effectiveness = getTypeEffectiveness();
    
    return (
      <div className="space-y-4">
        {effectiveness.weaknesses.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Weak to (2x damage)</h4>
            <div className="flex flex-wrap gap-2">
              {effectiveness.weaknesses.map(type => (
                <TypeEffectivenessBadge key={type} type={type} multiplier={2} />
              ))}
            </div>
          </div>
        )}
        
        {effectiveness.resistances.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Resistant to (0.5x damage)</h4>
            <div className="flex flex-wrap gap-2">
              {effectiveness.resistances.map(type => (
                <TypeEffectivenessBadge key={type} type={type} multiplier={0.5} />
              ))}
            </div>
          </div>
        )}
        
        {effectiveness.immunities.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Immune to (0x damage)</h4>
            <div className="flex flex-wrap gap-2">
              {effectiveness.immunities.map(type => (
                <TypeEffectivenessBadge key={type} type={type} multiplier={0} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render stats section
  const renderStats = () => {
    if (!pokemon?.stats) return null;
    
    const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    
    return (
      <div className={`${typeColors.cardBg} p-4 rounded-2xl shadow-lg`} data-testid="pokemon-stats">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Base Stats</h3>
            {!hasOpenedCalculator && (
              <button
                onClick={() => {
                  setShowStatsCalculator(true);
                  setHasOpenedCalculator(true);
                }}
                className={`px-4 py-2 text-sm font-semibold ${typeColors.tabActive} text-white rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
              >
                📊 Show Calculator
              </button>
            )}
          </div>
        
        {showStatsCalculator && (
          <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            {/* Reset Button */}
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold">Stats Calculator</h4>
              <button
                onClick={() => {
                  setSelectedLevel(50);
                  setSelectedNature('hardy');
                  handleNatureChange('hardy');
                }}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
              >
                Reset
              </button>
            </div>

            {/* Nature Grid */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nature
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {allNatures.map((nature) => {
                  const isSelected = nature.name === selectedNature;
                  const increased = nature.increased_stat?.name;
                  const decreased = nature.decreased_stat?.name;
                  
                  return (
                    <button
                      key={nature.name}
                      onClick={() => handleNatureChange(nature.name)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                        isSelected 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg' 
                          : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className={`capitalize text-sm ${isSelected ? 'font-bold' : ''}`}>
                        {nature.name}
                      </div>
                      {increased && decreased ? (
                        <div className="flex gap-1 mt-1 justify-center">
                          <div className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs px-1.5 py-0.5 rounded font-bold">
                            +{increased === 'attack' ? 'Atk' :
                              increased === 'defense' ? 'Def' :
                              increased === 'special-attack' ? 'SpA' : 
                              increased === 'special-defense' ? 'SpD' : 
                              increased === 'speed' ? 'Spe' : increased.slice(0, 3)}
                          </div>
                          <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs px-1.5 py-0.5 rounded font-bold">
                            -{decreased === 'attack' ? 'Atk' :
                              decreased === 'defense' ? 'Def' :
                              decreased === 'special-attack' ? 'SpA' : 
                              decreased === 'special-defense' ? 'SpD' : 
                              decreased === 'speed' ? 'Spe' : decreased.slice(0, 3)}
                          </div>
                        </div>
                      ) : (
                        <div className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                          Neutral
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Level Slider */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span className="text-lg font-bold">Level: {selectedLevel}</span>
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, 
                      #3B82F6 0%, 
                      #3B82F6 ${selectedLevel}%, 
                      #E5E7EB ${selectedLevel}%, 
                      #E5E7EB 100%)`
                  }}
                />
                {/* Level markers */}
                <div className="absolute w-full flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>
              {/* Quick level buttons */}
              <div className="flex gap-2 mt-3">
                {[1, 50, 100].map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      selectedLevel === level
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Lv {level}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-200/50 dark:bg-gray-700/50 rounded-lg p-2">
              <p className="flex items-center gap-2">
                <span>ℹ️</span>
                Calculated with perfect IVs (31) and no EVs
              </p>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {pokemon.stats.map(stat => {
            const percentage = (stat.base_stat / getMaxStat(stat.stat.name)) * 100;
            const calculatedStat = showStatsCalculator ? calculateStat(stat.base_stat, stat.stat.name) : null;
            const isIncreased = natureData?.increased_stat?.name === stat.stat.name;
            const isDecreased = natureData?.decreased_stat?.name === stat.stat.name;
            
            return (
              <div key={stat.stat.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatStatName(stat.stat.name)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{stat.base_stat}</span>
                    {showStatsCalculator && calculatedStat && (
                      <>
                        <span className="text-sm text-gray-500">→</span>
                        <span className={`text-sm font-bold ${
                          isIncreased ? 'text-red-500' : 
                          isDecreased ? 'text-blue-500' : 
                          'text-gray-700 dark:text-gray-300'
                        }`}>
                          {calculatedStat}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`absolute h-full bg-gradient-to-r ${getStatColor(stat.stat.name)} transition-all duration-500 rounded-full shadow-sm`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-700 dark:text-gray-300">Total</span>
              <span className="text-xl font-bold">{totalStats}</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  };

  // Render abilities section
  const renderAbilities = () => {
    if (!pokemon?.abilities || pokemon.abilities.length === 0) return null;
    
    return (
      <div className="space-y-4" data-testid="pokemon-abilities">
        <h3 className="text-xl font-bold mb-4">Abilities</h3>
        
        <div className="space-y-3">
          {pokemon.abilities.map(abilityInfo => {
            const ability = abilities[abilityInfo.ability.name];
            
            return (
              <div
                key={abilityInfo.ability.name}
                className={`p-4 rounded-lg ${
                  abilityInfo.is_hidden
                    ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg capitalize">
                    {abilityInfo.ability.name.replace(/-/g, ' ')}
                  </h4>
                  {abilityInfo.is_hidden && (
                    <span className="px-2 py-1 text-xs font-medium bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded">
                      Hidden Ability
                    </span>
                  )}
                </div>
                
                {ability && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {ability.short_effect || ability.effect}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render location encounters
  const renderLocationEncounters = () => {
    if (!locationAreaEncounters || locationAreaEncounters.length === 0) return null;
    
    // Group by game version
    const encountersByVersion: Record<string, any[]> = {};
    
    locationAreaEncounters.forEach(encounter => {
      encounter.version_details.forEach(versionDetail => {
        const versionName = versionDetail.version.name;
        if (!encountersByVersion[versionName]) {
          encountersByVersion[versionName] = [];
        }
        
        encountersByVersion[versionName].push({
          location: encounter.location_area.name.replace(/-/g, ' '),
          maxChance: versionDetail.max_chance,
          details: versionDetail.encounter_details
        });
      });
    });
    
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-4">Location Encounters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(encountersByVersion).map(([version, encounters]) => (
            <div key={version} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-bold mb-2 capitalize">{version.replace(/-/g, ' ')}</h4>
              
              <div className="space-y-2">
                {encounters.slice(0, 5).map((encounter, index) => (
                  <div key={index} className="text-sm">
                    <span className="capitalize">{encounter.location}</span>
                    {encounter.maxChance && (
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        ({encounter.maxChance}% chance)
                      </span>
                    )}
                  </div>
                ))}
                
                {encounters.length > 5 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    +{encounters.length - 5} more locations
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render card gallery section
  const renderCardGallery = () => {
    const displayCards = cardType === 'tcg' ? tcgCards : pocketCards;
    
    return (
      <div className={`${typeColors.cardBg} p-4 rounded-2xl shadow-lg`}>
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Card Gallery</h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCardType('tcg')}
                className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  cardType === 'tcg'
                    ? `${typeColors.tabActive} text-white shadow-lg`
                    : 'bg-white/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50'
                }`}
              >
                🎴 TCG ({tcgCards.length})
              </button>
              <button
                onClick={() => setCardType('pocket')}
                className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  cardType === 'pocket'
                    ? `${typeColors.tabActive} text-white shadow-lg`
                    : 'bg-white/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50'
                }`}
              >
                📱 Pocket ({pocketCards.length})
              </button>
            </div>
          </div>
        
        {cardsLoading ? (
          <CardGridSkeleton 
            count={12}
            columns={6}
            showPrice={true}
            showSet={true}
            showTypes={true}
            className="animate-fadeIn mt-4"
          />
        ) : displayCards.length > 0 ? (
          cardType === 'tcg' ? (
            <CardList 
              cards={tcgCards}
              // CardList handles its own zoom modal internally
            />
          ) : (
            <PocketCardList 
              cards={pocketCards}
              loading={false}
              error={undefined}
              showPack={true}
              showRarity={true}
              showHP={true}
            />
          )
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-lg">No {cardType === 'tcg' ? 'TCG' : 'Pocket'} cards found for this Pokémon</p>
          </div>
        )}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <PageLoader text="Loading Pokémon details..." />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/pokedex')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Pokédex
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!pokemon || !species) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Pokémon not found</p>
          <button
            onClick={() => router.push('/pokedex')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Pokédex
          </button>
        </div>
      </div>
    );
  }

  // Get UI colors based on types
  const typeColors = getTypeUIColors(pokemon.types || []);
  const isFavorite = favorites.pokemon.some((p: FavoritePokemon) => p.id === pokemon.id);

  return (
    <PageErrorBoundary pageName="Pokemon Detail">
      <Head>
        <title>{pokemon?.name ? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1) : 'Pokemon'} - Pokédex | DexTrends</title>
        <meta 
          name="description" 
          content={`View detailed information about ${pokemon?.name || 'this Pokemon'}, including stats, abilities, evolution chain, and more.`} 
        />
      </Head>
      
      <style jsx>{`
        /* Type-specific gradient colors for Pokemon rings */
        .from-poke-normal { --tw-gradient-from: #A8A878; }
        .from-poke-fire { --tw-gradient-from: #F08030; }
        .from-poke-water { --tw-gradient-from: #6890F0; }
        .from-poke-electric { --tw-gradient-from: #F8D030; }
        .from-poke-grass { --tw-gradient-from: #78C850; }
        .from-poke-ice { --tw-gradient-from: #98D8D8; }
        .from-poke-fighting { --tw-gradient-from: #C03028; }
        .from-poke-poison { --tw-gradient-from: #A040A0; }
        .from-poke-ground { --tw-gradient-from: #E0C068; }
        .from-poke-flying { --tw-gradient-from: #A890F0; }
        .from-poke-psychic { --tw-gradient-from: #F85888; }
        .from-poke-bug { --tw-gradient-from: #A8B820; }
        .from-poke-rock { --tw-gradient-from: #B8A038; }
        .from-poke-ghost { --tw-gradient-from: #705898; }
        .from-poke-dragon { --tw-gradient-from: #7038F8; }
        .from-poke-dark { --tw-gradient-from: #705848; }
        .from-poke-steel { --tw-gradient-from: #B8B8D0; }
        .from-poke-fairy { --tw-gradient-from: #EE99AC; }
        
        .to-poke-normal { --tw-gradient-to: #8B8B59; }
        .to-poke-fire { --tw-gradient-to: #C54B1D; }
        .to-poke-water { --tw-gradient-to: #4A6BC3; }
        .to-poke-electric { --tw-gradient-to: #C5A724; }
        .to-poke-grass { --tw-gradient-to: #5F9E3F; }
        .to-poke-ice { --tw-gradient-to: #7AAEAD; }
        .to-poke-fighting { --tw-gradient-to: #99251E; }
        .to-poke-poison { --tw-gradient-to: #813380; }
        .to-poke-ground { --tw-gradient-to: #B39953; }
        .to-poke-flying { --tw-gradient-to: #8973C3; }
        .to-poke-psychic { --tw-gradient-to: #C6466D; }
        .to-poke-bug { --tw-gradient-to: #8B9519; }
        .to-poke-rock { --tw-gradient-to: #93802C; }
        .to-poke-ghost { --tw-gradient-to: #5A477A; }
        .to-poke-dragon { --tw-gradient-to: #592CC6; }
        .to-poke-dark { --tw-gradient-to: #5A473A; }
        .to-poke-steel { --tw-gradient-to: #9595AA; }
        .to-poke-fairy { --tw-gradient-to: #C47A8A; }
      `}</style>

      <FullBleedWrapper 
        gradient="pokemon-type"
        pokemonTypes={pokemon.types}
      >
        <div className="min-h-screen">
          {/* Header */}
          <div className="sticky top-0 z-40 backdrop-blur-md">
            <div className="bg-gradient-to-b from-white/90 to-white/80 dark:from-gray-900/90 dark:to-gray-900/80 border-b border-white/30 dark:border-gray-700/30">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => router.push('/pokedex')}
                    className={`group flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 border border-${typeColors.border}/30 dark:border-${typeColors.borderDark}/30`}
                  >
                    <svg className={`w-5 h-5 text-${typeColors.text} dark:text-${typeColors.textDark} group-hover:-translate-x-1 transition-transform duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Back to Pokédex</span>
                  </button>

                  <button
                    onClick={() => {
                      if (isFavorite) {
                        removeFromFavorites('pokemon', pokemon.id);
                      } else {
                        const favoritePokemon: FavoritePokemon = {
                          id: typeof pokemon.id === 'string' ? parseInt(pokemon.id) : pokemon.id,
                          name: pokemon.name,
                          types: pokemon.types?.map(t => t.type.name),
                          sprite: pokemon.sprites?.front_default || undefined,
                          addedAt: Date.now()
                        };
                        addToFavorites('pokemon', favoritePokemon);
                      }
                    }}
                    className={`group flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg backdrop-blur-sm border ${
                      isFavorite 
                        ? `${typeColors.tabActive} text-white` 
                        : `bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:${typeColors.tabActive} hover:text-white border-${typeColors.border}/30 dark:border-${typeColors.borderDark}/30`
                    }`}
                  >
                    <span className="text-lg">{isFavorite ? '❤️' : '🤍'}</span>
                    <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-8">
            {/* Pokemon Info Header */}
            <div className={`bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-8 mb-8`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Image and basic info */}
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    {/* Circular border container with extra space for double ring */}
                    <div className="relative w-80 h-80 mx-auto">
                      {/* Outer ring with type gradient for dual types */}
                      <div className={`absolute inset-0 rounded-full p-1 shadow-2xl transition-all duration-300 ${
                        pokemon.types && pokemon.types.length > 1
                          ? `bg-gradient-to-br from-poke-${pokemon.types[0].type.name} to-poke-${pokemon.types[1].type.name}`
                          : pokemon.types
                          ? `bg-gradient-to-br from-poke-${pokemon.types[0].type.name} to-poke-${pokemon.types[0].type.name}`
                          : 'bg-gradient-to-br from-gray-400 to-gray-600'
                      }`}>
                        {/* Second ring for dual types */}
                        {pokemon.types && pokemon.types.length > 1 && (
                          <div className={`absolute inset-1 rounded-full bg-gradient-to-br from-poke-${pokemon.types[1].type.name} to-poke-${pokemon.types[0].type.name} p-1`} />
                        )}
                        
                        {/* White inner ring */}
                        <div className={`${pokemon.types && pokemon.types.length > 1 ? 'absolute inset-2' : 'w-full h-full'} rounded-full bg-white dark:bg-gray-800 p-2`}>
                          {/* Inner circle with subtle gradient background */}
                          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 shadow-inner overflow-hidden">
                            {pokemon.sprites?.other?.['official-artwork']?.front_default ? (
                              <img
                                src={pokemon.sprites.other['official-artwork'].front_default}
                                alt={pokemon.name}
                                className="absolute inset-0 w-full h-full object-contain p-6"
                                data-testid="pokemon-sprite"
                              />
                            ) : pokemon.sprites?.front_default ? (
                              <img
                                src={pokemon.sprites.front_default}
                                alt={pokemon.name}
                                className="absolute inset-0 w-full h-full object-contain p-6"
                                data-testid="pokemon-sprite"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">
                                No image available
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Shiny toggle */}
                      {pokemon.sprites?.other?.['official-artwork']?.front_shiny && (
                        <button
                          className="absolute top-2 right-2 p-3 bg-yellow-400 text-white rounded-full shadow-lg hover:bg-yellow-500 transition-all duration-300 hover:scale-110 z-10"
                          title="View shiny form"
                        >
                          <span className="text-lg">✨</span>
                        </button>
                      )}
                      
                      {/* Special status badges */}
                      {(species?.is_legendary || species?.is_mythical) && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {species.is_legendary && (
                            <span className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                              <span>⭐</span> Legendary
                            </span>
                          )}
                          {species.is_mythical && (
                            <span className="bg-purple-500 text-white text-sm px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                              <span>✨</span> Mythical
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold mb-2 capitalize" data-testid="pokemon-name">{pokemon.name}</h1>
                  <p className="text-gray-500 dark:text-gray-400 mb-4" data-testid="pokemon-genus">{getGenus()}</p>
                  
                  <div className="flex justify-center gap-2 mb-4">
                    {pokemon.types?.map(typeInfo => (
                      <TypeBadge key={typeInfo.slot} type={typeInfo.type.name} size="lg" />
                    ))}
                  </div>

                  <div className="flex justify-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Height:</span>{' '}
                      <span className="font-medium">{((pokemon.height || 0) / 10).toFixed(1)}m</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Weight:</span>{' '}
                      <span className="font-medium">{((pokemon.weight || 0) / 10).toFixed(1)}kg</span>
                    </div>
                  </div>
                </div>

                {/* Right: Details */}
                <div className="space-y-6">
                  {/* Description Card */}
                  <div className={`${typeColors.cardBg} p-4 rounded-2xl shadow-lg`}>
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-4">
                      <h3 className="font-bold text-lg mb-2">Description</h3>
                      <p className="text-gray-600 dark:text-gray-400">{getFlavorText()}</p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`${typeColors.cardBg} p-3 rounded-xl shadow-md`}>
                      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3">
                        <h4 className={`font-medium text-${typeColors.text} dark:text-${typeColors.textDark} text-sm mb-1`}>National №</h4>
                        <p className="font-bold text-lg" data-testid="pokemon-number">#{String(pokemon.id).padStart(4, '0')}</p>
                      </div>
                    </div>
                    <div className={`${typeColors.cardBg} p-3 rounded-xl shadow-md`}>
                      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3">
                        <h4 className={`font-medium text-${typeColors.text} dark:text-${typeColors.textDark} text-sm mb-1`}>Generation</h4>
                        <p className="font-bold text-lg">{getGenerationNumber()}</p>
                      </div>
                    </div>
                    <div className={`${typeColors.cardBg} p-3 rounded-xl shadow-md`}>
                      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3">
                        <h4 className={`font-medium text-${typeColors.text} dark:text-${typeColors.textDark} text-sm mb-1`}>Egg Groups</h4>
                        <p className="font-bold">{getEggGroups().join(', ')}</p>
                      </div>
                    </div>
                    <div className={`${typeColors.cardBg} p-3 rounded-xl shadow-md`}>
                      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3">
                        <h4 className={`font-medium text-${typeColors.text} dark:text-${typeColors.textDark} text-sm mb-1`}>Gender Ratio</h4>
                        {(() => {
                          const genderRatio = getGenderRatio();
                          if (genderRatio.genderless) {
                            return <p className="font-bold">Genderless</p>;
                          }
                          return (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-500 font-bold">♂ {genderRatio.male}%</span>
                              <span className="text-pink-500 font-bold">♀ {genderRatio.female}%</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    
                    {/* Visual Catch Rate */}
                    <div className={`${typeColors.cardBg} p-3 rounded-xl shadow-md col-span-2`}>
                      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3">
                        <h4 className={`font-medium text-${typeColors.text} dark:text-${typeColors.textDark} text-sm mb-2`}>Catch Rate</h4>
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14">
                            <svg className="w-14 h-14 transform -rotate-90">
                              <circle
                                cx="28"
                                cy="28"
                                r="24"
                                stroke="#e5e7eb"
                                strokeWidth="6"
                                fill="none"
                              />
                              <circle
                                cx="28"
                                cy="28"
                                r="24"
                                stroke={species?.capture_rate && species.capture_rate > 200 ? '#10b981' : species?.capture_rate && species.capture_rate > 100 ? '#f59e0b' : '#ef4444'}
                                strokeWidth="6"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 24}`}
                                strokeDashoffset={`${2 * Math.PI * 24 * (1 - (species?.capture_rate || 0) / 255)}`}
                                className="transition-all duration-1000"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold">{species?.capture_rate || '?'}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-gray-100 font-medium text-sm">{species?.capture_rate ? `${((species.capture_rate / 255) * 100).toFixed(1)}%` : 'Unknown'}</p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">
                              {species?.capture_rate && species.capture_rate > 200 ? 'Very Easy' : 
                               species?.capture_rate && species.capture_rate > 150 ? 'Easy' :
                               species?.capture_rate && species.capture_rate > 100 ? 'Medium' :
                               species?.capture_rate && species.capture_rate > 50 ? 'Hard' :
                               species?.capture_rate && species.capture_rate > 0 ? 'Very Hard' : 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Base Stats Summary */}
                    <div className={`${typeColors.cardBg} p-3 rounded-xl shadow-md col-span-2`}>
                      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3">
                        <h4 className={`font-medium text-${typeColors.text} dark:text-${typeColors.textDark} text-sm mb-1`}>Base Stats Total</h4>
                        <p className="font-bold text-lg">{pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Form selector if multiple forms */}
                  {species.varieties && species.varieties.length > 1 && (
                    <PokemonFormSelector
                      pokemon={pokemon}
                      species={species}
                      onFormChange={async (formData) => {
                        // Update the current Pokemon data with the new form data
                        setPokemon(formData);
                        
                        // Reload cards for the new form
                        await loadCards(sanitizePokemonName(formData.name));
                        
                        // Update abilities for the new form
                        const newAbilities: Record<string, AbilityData> = {};
                        for (const ab of formData.abilities || []) {
                          try {
                            const abilityData = await fetchJSON<AbilityApiData>(ab.ability.url);
                            if (!abilityData) continue;
                            const englishEffect = abilityData.effect_entries?.find(e => e.language.name === 'en');
                            const englishShortEffect = abilityData.flavor_text_entries?.find(f => f.language.name === 'en');
                            
                            newAbilities[ab.ability.name] = {
                              name: ab.ability.name,
                              isHidden: ab.is_hidden,
                              effect: englishEffect?.effect || '',
                              short_effect: englishShortEffect?.flavor_text || englishEffect?.short_effect || ''
                            };
                          } catch (error) {
                            logger.error('Error loading ability:', { abilityName: ab.ability.name, error });
                          }
                        }
                        setAbilities(newAbilities);
                        
                        // Reload species data for the new form - important for evolution chain
                        try {
                          const newSpeciesData = await fetchJSON<PokemonSpecies>(`https://pokeapi.co/api/v2/pokemon-species/${formData.id || sanitizePokemonName(formData.name)}`);
                          if (!newSpeciesData) {
                            logger.error('Failed to fetch species data for form');
                            return;
                          }
                          setSpecies(newSpeciesData);
                          
                          // Reload evolution chain if it exists
                          if (newSpeciesData.evolution_chain) {
                            await loadEvolutionChain(newSpeciesData.evolution_chain.url);
                          }
                        } catch (error) {
                          logger.error('Error loading species data for form:', { error });
                        }
                        
                        // Reload location encounters for the new form
                        if (formData.location_area_encounters) {
                          await loadLocationEncounters(formData.location_area_encounters);
                        }
                        
                        // Update the URL without navigating - handle both numeric and string IDs
                        const formId = formData.id || formData.name;
                        // Use router.replace to properly update the route
                        router.replace(`/pokedex/${formId}`, undefined, { shallow: true });
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className={`bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-800/95 dark:to-gray-900/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 overflow-hidden`}>
              <div className="p-4 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="flex gap-2 overflow-x-auto">
                  {['overview', 'stats', 'evolution', 'moves', 'cards'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 rounded-full font-semibold capitalize transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
                        activeTab === tab
                          ? `${typeColors.tabActive} text-white shadow-lg`
                          : 'bg-white/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-600/80 border border-gray-200/50 dark:border-gray-600/50'
                      }`}
                    >
                      {tab === 'overview' && '📋'} 
                      {tab === 'stats' && '📊'} 
                      {tab === 'evolution' && '🔄'} 
                      {tab === 'moves' && '⚔️'} 
                      {tab === 'cards' && '🎴'} {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Abilities Section */}
                    {renderAbilities()}
                    
                    {/* Evolution Chain */}
                    {species?.evolution_chain?.url && (
                      <div className={`${typeColors.cardBg} p-4 rounded-2xl shadow-lg`}>
                        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6">
                          <h3 className="text-xl font-bold mb-4">Evolution Chain</h3>
                          <EnhancedEvolutionDisplay 
                            speciesUrl={`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}/`}
                            currentPokemonId={pokemon.id}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Type Effectiveness */}
                    <div className={`${typeColors.cardBg} p-4 rounded-2xl shadow-lg`}>
                      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-4">Type Effectiveness</h3>
                        {renderTypeEffectiveness()}
                      </div>
                    </div>
                    
                    {/* Location Encounters */}
                    {locationAreaEncounters.length > 0 && (
                      <div className={`${typeColors.cardBg} p-4 rounded-2xl shadow-lg`}>
                        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6">
                          {renderLocationEncounters()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stats Tab */}
                {activeTab === 'stats' && renderStats()}

                {/* Evolution Tab */}
                {activeTab === 'evolution' && species && (
                  <EnhancedEvolutionDisplay 
                    speciesUrl={`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}/`}
                    currentPokemonId={pokemon.id}
                  />
                )}

                {/* Moves Tab */}
                {activeTab === 'moves' && pokemon.moves && (
                  <div data-testid="pokemon-moves">
                    <SimplifiedMovesDisplay 
                      moves={pokemon.moves} 
                      pokemonName={pokemon.name}
                    />
                  </div>
                )}

                {/* Cards Tab */}
                {activeTab === 'cards' && renderCardGallery()}
              </div>
            </div>
          </div>
        </div>
      </FullBleedWrapper>

      {/* Card zoom modal */}
      {zoomedCard && (
        <Modal
          isOpen={!!zoomedCard}
          onClose={() => setZoomedCard(null)}
          title={zoomedCard.name}
        >
          <div className="flex justify-center">
            <img
              src={'images' in zoomedCard ? zoomedCard.images.large : zoomedCard.image}
              alt={zoomedCard.name}
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </Modal>
      )}
    </PageErrorBoundary>
  );
};

export default PokemonDetail;