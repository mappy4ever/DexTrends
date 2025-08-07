import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Image from 'next/image';
import type { Pokemon, PokemonSpecies } from '../../../types/api/pokemon';
import { GlassContainer } from '../../ui/design-system';
import { TypeBadge } from '../../ui/TypeBadge';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import { cn } from '../../../utils/cn';
import { 
  FaMars, 
  FaVenus, 
  FaEgg, 
  FaClock, 
  FaHeart, 
  FaDna,
  FaSearch,
  FaStar,
  FaInfoCircle,
  FaWalking
} from 'react-icons/fa';
import { GiEggClutch } from 'react-icons/gi';
import {
  calculateBreedingInfo,
  formatEggGroupName,
  getEggGroupColor,
  calculateShinyOdds,
  getBreedingItems,
  formatHatchTime,
  canBreedTogether
} from '../../../utils/breedingUtils';
import { POKEMON_TYPE_COLORS } from '../../../utils/unifiedTypeColors';

interface BreedingTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  typeColors: Record<string, string>;
}

interface EggMove {
  name: string;
  type: string;
  category: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  machine?: string;
}

interface CompatiblePokemon {
  name: string;
  sprite: string;
  types: string[];
  eggGroups: string[];
}

const BreedingTab: React.FC<BreedingTabProps> = ({ pokemon, species, typeColors }) => {
  const router = useRouter();
  const [eggMoves, setEggMoves] = useState<EggMove[]>([]);
  const [compatiblePokemon, setCompatiblePokemon] = useState<CompatiblePokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompatible, setShowCompatible] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'physical' | 'special' | 'status'>('all');
  const [showShinyCalc, setShowShinyCalc] = useState(false);
  const [hasMasuda, setHasMasuda] = useState(false);
  const [hasShinyCharm, setHasShinyCharm] = useState(false);

  const breedingInfo = useMemo(() => calculateBreedingInfo(species), [species]);

  useEffect(() => {
    loadBreedingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon.id, species.id]);

  const loadBreedingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load egg moves with full data
      const eggMovesPromises = (pokemon.moves || [])
        .filter(move => 
          move?.version_group_details?.some(v => v?.move_learn_method?.name === 'egg')
        )
        .slice(0, 20) // Limit to prevent too many API calls
        .map(async (moveData) => {
          const moveDetails: any = await fetchJSON(moveData.move.url);
          if (moveDetails) {
            return {
              name: moveDetails.name,
              type: moveDetails.type?.name || 'normal',
              category: moveDetails.damage_class?.name || 'status',
              power: moveDetails.power,
              accuracy: moveDetails.accuracy,
              pp: moveDetails.pp || 0,
              machine: moveDetails.machines?.find((m: any) => 
                m.version_group.name === 'sword-shield'
              )?.machine?.url
            };
          } else {
            return null;
          }
        });
      
      const moveResults = await Promise.allSettled(eggMovesPromises);
      const moves = moveResults
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => (result as PromiseFulfilledResult<EggMove | null>).value)
        .filter(Boolean) as EggMove[];
      setEggMoves(moves);
      
      // Load compatible Pokemon from egg groups
      if (breedingInfo.canBreed && species.egg_groups?.length > 0) {
        const compatibleList: CompatiblePokemon[] = [];
        
        for (const group of species.egg_groups) {
          if (group.name === 'no-eggs') continue;
          
          const groupData: any = await fetchJSON(group.url);
          if (groupData) {
            const pokemonInGroup = groupData.pokemon_species || [];
            
            // Get a sample of compatible Pokemon (limit to avoid too many requests)
            const samplePokemon = pokemonInGroup
              .filter((p: any) => p.name !== pokemon.name)
              .slice(0, 10);
            
            for (const compatibleSpecies of samplePokemon) {
              const pokemonData: any = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${compatibleSpecies.name}`);
              if (pokemonData) {
                compatibleList.push({
                  name: pokemonData.name,
                  sprite: pokemonData.sprites?.front_default || '',
                  types: pokemonData.types?.map((t: any) => t.type.name) || [],
                  eggGroups: [group.name]
                });
              }
            }
          } else {
            logger.error(`Error loading egg group ${group.name}`);
          }
        }
        
        setCompatiblePokemon(compatibleList);
      }
      
    } catch (err) {
      logger.error('Error loading breeding data:', err);
      setError('Failed to load breeding data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter egg moves based on search and category
  const filteredMoves = useMemo(() => {
    return eggMoves.filter(move => {
      const matchesSearch = move.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || move.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [eggMoves, searchTerm, selectedCategory]);

  const shinyOdds = useMemo(() => {
    return calculateShinyOdds(hasMasuda, hasShinyCharm);
  }, [hasMasuda, hasShinyCharm]);

  // Get type color
  const getTypeColor = (type: string): string => {
    return POKEMON_TYPE_COLORS[type.toLowerCase()] || POKEMON_TYPE_COLORS.normal;
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => {
              setError(null);
              loadBreedingData();
            }}
            className="ml-4 underline hover:text-red-800 dark:hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Breeding Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Basic Info Card */}
        <motion.div 
          className="group"
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div className="h-full bg-white dark:bg-gray-900/50 rounded-2xl p-4 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center shadow-md shadow-purple-500/10">
                <FaEgg className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-purple-400">Breeding Overview</h3>
            </div>
            
            <div className="space-y-4">
            {/* Can Breed Status */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <FaDna className="w-4 h-4 opacity-70" />
                Breeding Status
              </span>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold",
                breedingInfo.canBreed 
                  ? "bg-green-500/20 text-green-500" 
                  : "bg-red-500/20 text-red-500"
              )}>
                {breedingInfo.canBreed ? 'Can Breed' : 'Cannot Breed'}
              </span>
            </div>

            {/* Egg Groups */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <FaEgg className="w-4 h-4 opacity-70" />
                Egg Groups
              </span>
              <div className="flex flex-wrap gap-2 justify-end">
                {breedingInfo.eggGroups.map(group => (
                  <span
                    key={group}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium text-white",
                      "bg-gradient-to-r",
                      getEggGroupColor(group)
                    )}
                  >
                    {formatEggGroupName(group)}
                  </span>
                ))}
              </div>
            </div>

            {/* Gender Ratio */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <FaHeart className="w-4 h-4 opacity-70" />
                  Gender Ratio
                </span>
              </div>
              {breedingInfo.genderRatio.genderless ? (
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 text-center">
                  Genderless
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <FaMars className="text-blue-500 text-lg" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 w-12">
                    {breedingInfo.genderRatio.male.toFixed(1)}%
                  </span>
                  <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                    <motion.div
                      className="absolute left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${breedingInfo.genderRatio.male}%` }}
                      transition={{ duration: 0.8 }}
                    />
                    <motion.div
                      className="absolute right-0 h-full bg-gradient-to-l from-pink-400 to-pink-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${breedingInfo.genderRatio.female}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 w-12 text-right">
                    {breedingInfo.genderRatio.female.toFixed(1)}%
                  </span>
                  <FaVenus className="text-pink-500 text-lg" />
                </div>
              )}
            </div>

            {/* Special Baby Item */}
            {breedingInfo.babyItem && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm">
                  <FaInfoCircle className="inline mr-2 text-yellow-500" />
                  Requires <span className="font-bold">{breedingInfo.babyItem}</span> to produce baby form
                </p>
              </div>
            )}
            </div>
          </div>
        </motion.div>

        {/* Hatch Info Card */}
        <motion.div 
          className="group"
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div className="h-full bg-white dark:bg-gray-900/50 rounded-2xl p-4 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center shadow-md shadow-orange-500/10">
                <FaClock className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-orange-400">Hatch Information</h3>
            </div>

            <div className="space-y-3">
            {/* Hatch Time Title */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <FaClock className="w-4 h-4 opacity-70" />
                Hatch Time
              </span>
            </div>
            
            {/* Hatch Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-white/10 dark:bg-gray-800/30 rounded-lg">
                <GiEggClutch className="w-10 h-10 text-orange-400 flex-shrink-0" />
                <div>
                  <div className="text-2xl font-bold text-orange-500">
                    {breedingInfo.hatchCycles}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Egg Cycles</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/10 dark:bg-gray-800/30 rounded-lg">
                <FaWalking className="w-10 h-10 text-blue-400 flex-shrink-0" />
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {breedingInfo.hatchSteps.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Steps</div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-600 dark:text-gray-400">
              Approximately {formatHatchTime(breedingInfo.hatchSteps)} with Flame Body
            </p>

            {/* Base Happiness */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <FaHeart className="w-4 h-4 text-red-500 opacity-70" />
                  Base Happiness
                </span>
              </div>
              <div className="relative">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-400 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((species.base_happiness || 70) / 255) * 100}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-bold text-white drop-shadow-md text-sm">
                    {species.base_happiness || 70}/255
                  </span>
                </div>
              </div>
            </div>

            {/* Shiny Calculator */}
            <div>
              <button
                onClick={() => setShowShinyCalc(!showShinyCalc)}
                className={cn(
                  "w-full px-4 py-2 rounded-lg font-medium transition-all",
                  "bg-gradient-to-r from-yellow-400 to-orange-500",
                  "text-white hover:shadow-lg transform hover:scale-[1.02]"
                )}
              >
                <FaStar className="inline mr-2" />
                Shiny Odds Calculator
              </button>
              
              <AnimatePresence>
                {showShinyCalc && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-3"
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasMasuda}
                        onChange={(e) => setHasMasuda(e.target.checked)}
                        className="w-5 h-5 rounded text-blue-500"
                      />
                      <span>Masuda Method (Foreign Parent)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasShinyCharm}
                        onChange={(e) => setHasShinyCharm(e.target.checked)}
                        className="w-5 h-5 rounded text-blue-500"
                      />
                      <span>Shiny Charm</span>
                    </label>
                    <div className="p-4 bg-yellow-500/10 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-500">
                        {shinyOdds.odds}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {shinyOdds.percentage} chance
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Egg Moves */}
      {eggMoves.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassContainer 
            variant="dark" 
            className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
            animate={false}
          >
            <div className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Egg Moves ({eggMoves.length})</h2>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search moves..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 dark:bg-gray-800/50 rounded-lg 
                             border border-gray-300 dark:border-gray-600 
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="px-4 py-2 bg-white/10 dark:bg-gray-800/50 rounded-lg 
                           border border-gray-300 dark:border-gray-600
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="physical">Physical</option>
                  <option value="special">Special</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            {/* Moves Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMoves.map((move, index) => (
                <motion.div
                  key={move.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-4 rounded-lg border bg-white/50 dark:bg-gray-800/50
                           border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold capitalize">
                      {move.name.replace('-', ' ')}
                    </h5>
                    <TypeBadge type={move.type} size="sm" />
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className={cn(
                      "px-2 py-0.5 rounded",
                      move.category === 'physical' && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
                      move.category === 'special' && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                      move.category === 'status' && "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
                    )}>
                      {move.category}
                    </span>
                    {move.power && <span>Pwr: {move.power}</span>}
                    {move.accuracy && <span>Acc: {move.accuracy}%</span>}
                    <span>PP: {move.pp}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredMoves.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No moves found matching your criteria
              </div>
            )}
            </div>
          </GlassContainer>
        </motion.div>
      )}

      {/* Compatible Pokemon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassContainer 
          variant="dark" 
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
          animate={false}
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between cursor-pointer mb-4" onClick={() => setShowCompatible(!showCompatible)}>
              <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Breeding Partners</h2>
              <motion.div
                animate={{ rotate: showCompatible ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </div>

          <AnimatePresence>
            {showCompatible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Loading compatible Pokémon...</p>
                  </div>
                ) : !breedingInfo.canBreed ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    This Pokémon cannot breed
                  </div>
                ) : compatiblePokemon.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {compatiblePokemon.map((compatible, index) => (
                      <motion.div
                        key={compatible.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2
                                 border border-gray-200 dark:border-gray-700
                                 hover:shadow-md cursor-pointer transition-all
                                 hover:transform hover:scale-105"
                        onClick={() => router.push(`/pokedex/${compatible.name}`)}
                      >
                        {compatible.sprite && (
                          <Image
                            src={compatible.sprite}
                            alt={compatible.name}
                            width={64}
                            height={64}
                            className="mx-auto"
                          />
                        )}
                        <p className="text-center text-xs font-medium capitalize mt-1">
                          {compatible.name.replace('-', ' ')}
                        </p>
                        <div className="flex justify-center gap-1 mt-1 flex-wrap">
                          {compatible.types.map(type => (
                            <span
                              key={type}
                              className="inline-block px-2 py-0.5 text-[10px] font-semibold text-white rounded-full uppercase"
                              style={{ backgroundColor: getTypeColor(type) }}
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading breeding partners...
                  </div>
                )}
                
                {compatiblePokemon.length > 0 && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Showing sample partners from the same egg groups
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </GlassContainer>
      </motion.div>

      {/* Breeding Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassContainer 
          variant="dark" 
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
          animate={false}
        >
          <div className="p-6 md:p-8">
            <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-6">
              Useful Breeding Items
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getBreedingItems().map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center p-1">
                    <img 
                      src={item.spriteUrl} 
                      alt={item.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('span');
                          fallback.className = 'text-xs font-medium';
                          fallback.textContent = 'Item';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold">{item.name}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.effect}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassContainer>
      </motion.div>
    </div>
  );
};

export default BreedingTab;