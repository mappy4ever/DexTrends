import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { NextPage } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularButton, GradientButton } from '../../components/ui/design-system';
import { GlassContainer } from '../../components/ui/design-system/GlassContainer';
import { createGlassStyle } from '../../components/ui/design-system/glass-constants';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import logger from '../../utils/logger';
import { BsSearch, BsEye, BsEyeSlash } from 'react-icons/bs';
import { fetchJSON } from '../../utils/unifiedFetch';
import { requestCache } from '../../utils/UnifiedCacheManager';

interface Ability {
  id: number;
  name: string;
  effect: string;
  short_effect: string;
  generation: number;
  is_hidden: boolean;
  pokemon: string[];
}

interface AbilityApiResponse {
  id: number;
  name: string;
  is_main_series: boolean;
  generation: { name: string };
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: { name: string };
  }>;
  pokemon: Array<{
    is_hidden: boolean;
    pokemon: { name: string };
  }>;
}

const ABILITY_CATEGORIES = [
  { key: 'all', name: 'All', color: 'from-gray-400 to-gray-500' },
  { key: 'offensive', name: 'Offensive', color: 'from-red-400 to-orange-500' },
  { key: 'defensive', name: 'Defensive', color: 'from-blue-400 to-cyan-500' },
  { key: 'speed', name: 'Speed', color: 'from-yellow-400 to-amber-500' },
  { key: 'healing', name: 'Healing', color: 'from-green-400 to-emerald-500' },
  { key: 'status', name: 'Status', color: 'from-purple-400 to-pink-500' },
];

const AbilitiesPage: NextPage = () => {
  const router = useRouter();
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [filteredAbilities, setFilteredAbilities] = useState<Ability[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGeneration, setSelectedGeneration] = useState('all');
  const [showHidden, setShowHidden] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [abilitiesPerPage] = useState(24);

  const generations = ['all', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  useEffect(() => {
    const fetchAllAbilities = async () => {
      setLoading(true);
      
      try {
        const cacheKey = 'all-abilities-data';
        const cached = await requestCache.get(cacheKey);
        
        if (cached) {
          setAbilities(cached);
          setFilteredAbilities(cached);
          setLoading(false);
          return;
        }

        const response = await fetchJSON<{ results: Array<{ name: string; url: string }> }>(
          'https://pokeapi.co/api/v2/ability?limit=400'
        );
        
        if (!response?.results) {
          throw new Error('Failed to fetch abilities list');
        }

        const batchSize = 50;
        const allAbilities: Ability[] = [];
        
        for (let i = 0; i < response.results.length; i += batchSize) {
          const batch = response.results.slice(i, i + batchSize);
          const batchPromises = batch.map(async (ability) => {
            try {
              const abilityData = await fetchJSON<AbilityApiResponse>(ability.url);
              if (!abilityData) return null;
              
              const englishEntry = abilityData.effect_entries?.find(e => e.language.name === 'en');
              const pokemonSet = new Set<string>();
              let hasHidden = false;
              
              abilityData.pokemon?.forEach(p => {
                pokemonSet.add(p.pokemon.name);
                if (p.is_hidden) hasHidden = true;
              });
              
              return {
                id: abilityData.id,
                name: abilityData.name.replace(/-/g, ' '),
                effect: englishEntry?.effect || '',
                short_effect: englishEntry?.short_effect || 'No description available',
                generation: parseInt(abilityData.generation?.name?.replace('generation-', '') || '1'),
                is_hidden: hasHidden,
                pokemon: Array.from(pokemonSet).slice(0, 10)
              } as Ability;
            } catch (error) {
              logger.error(`Failed to fetch ability ${ability.name}`, { error });
              return null;
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          allAbilities.push(...batchResults.filter((a): a is Ability => a !== null));
          
          if (i % 100 === 0) {
            setAbilities([...allAbilities]);
            setFilteredAbilities([...allAbilities]);
          }
        }
        
        await requestCache.set(cacheKey, allAbilities);
        setAbilities(allAbilities);
        setFilteredAbilities(allAbilities);
      } catch (error) {
        logger.error('Failed to fetch abilities', { error });
        setAbilities([]);
        setFilteredAbilities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAbilities();
  }, []);

  useEffect(() => {
    let filtered = [...abilities];

    if (searchTerm) {
      filtered = filtered.filter(ability =>
        ability.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ability.short_effect.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ability => {
        const effect = ability.effect.toLowerCase();
        const name = ability.name.toLowerCase();
        
        switch (selectedCategory) {
          case 'offensive':
            return effect.includes('damage') || effect.includes('attack') || effect.includes('power');
          case 'defensive':
            return effect.includes('defense') || effect.includes('protect') || effect.includes('resist');
          case 'speed':
            return effect.includes('speed') || effect.includes('priority') || name.includes('swift');
          case 'healing':
            return effect.includes('heal') || effect.includes('recover') || effect.includes('restore');
          case 'status':
            return effect.includes('status') || effect.includes('paralyze') || effect.includes('burn');
          default:
            return true;
        }
      });
    }

    if (selectedGeneration !== 'all') {
      filtered = filtered.filter(ability => ability.generation === parseInt(selectedGeneration));
    }

    if (!showHidden) {
      filtered = filtered.filter(ability => !ability.is_hidden);
    }

    filtered.sort((a, b) => a.name.localeCompare(b.name));
    setFilteredAbilities(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedGeneration, showHidden, abilities]);

  const currentAbilities = useMemo(() => {
    const indexOfLastAbility = currentPage * abilitiesPerPage;
    const indexOfFirstAbility = indexOfLastAbility - abilitiesPerPage;
    return filteredAbilities.slice(indexOfFirstAbility, indexOfLastAbility);
  }, [filteredAbilities, currentPage, abilitiesPerPage]);

  const totalPages = Math.ceil(filteredAbilities.length / abilitiesPerPage);

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Abilities Database | DexTrends</title>
        <meta name="description" content="Explore all Pokemon abilities with effects and Pokemon that have them" />
      </Head>

      {/* Enhanced Header */}
      <motion.div 
        className={`sticky top-0 z-50 ${createGlassStyle({
          blur: '2xl',
          opacity: 'medium',
          gradient: true,
          border: 'subtle',
          shadow: 'lg',
          rounded: 'sm'
        })} border-b border-white/20`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <CircularButton
              onClick={() => router.push('/pokemon')}
              variant="secondary"
              size="sm"
            >
              ← Back
            </CircularButton>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 tracking-tight">
                Abilities
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Discover Pokemon abilities and their effects
              </p>
            </div>
            
            <div className={`${createGlassStyle({
              blur: 'sm',
              opacity: 'subtle',
              gradient: false,
              border: 'subtle',
              shadow: 'sm',
              rounded: 'lg'
            })} px-3 py-2 rounded-lg text-center`}>
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {loading ? '...' : abilities.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                abilities
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={`${createGlassStyle({
            blur: 'xl',
            opacity: 'medium',
            gradient: true,
            border: 'medium',
            shadow: 'xl',
            rounded: 'xl',
            hover: 'subtle'
          })} mb-8 p-8 rounded-3xl`}>
            {/* Enhanced Search Bar */}
            <div className="relative mb-6">
              <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 text-lg z-10" />
              <input
                type="text"
                placeholder="Search abilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${createGlassStyle({
                  blur: 'md',
                  opacity: 'medium',
                  gradient: false,
                  border: 'medium',
                  shadow: 'md',
                  rounded: 'full'
                })} w-full pl-12 pr-4 py-4 rounded-full text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 transition-all duration-300`}
              />
            </div>

            {/* Enhanced Category Pills */}
            <div className="flex flex-wrap gap-3 mb-6">
              {ABILITY_CATEGORIES.map(category => (
                <motion.button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                    selectedCategory === category.key
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                      : `${createGlassStyle({
                          blur: 'sm',
                          opacity: 'subtle',
                          gradient: false,
                          border: 'subtle',
                          shadow: 'sm',
                          rounded: 'full',
                          hover: 'lift'
                        })} text-gray-700 dark:text-gray-300 hover:scale-105`
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>

            {/* Enhanced Generation Filter and Hidden Toggle */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-2">
                {generations.map(gen => (
                  <motion.button
                    key={gen}
                    onClick={() => setSelectedGeneration(gen)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedGeneration === gen
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                        : `${createGlassStyle({
                            blur: 'sm',
                            opacity: 'subtle',
                            gradient: false,
                            border: 'subtle',
                            shadow: 'sm',
                            rounded: 'full',
                            hover: 'subtle'
                          })} text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200`
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {gen === 'all' ? 'All Gen' : `Gen ${gen}`}
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={() => setShowHidden(!showHidden)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  showHidden
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : `${createGlassStyle({
                        blur: 'sm',
                        opacity: 'medium',
                        gradient: false,
                        border: 'medium',
                        shadow: 'md',
                        rounded: 'full',
                        hover: 'lift'
                      })} text-gray-700 dark:text-gray-300`
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showHidden ? <BsEye /> : <BsEyeSlash />}
                Hidden Abilities
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Abilities Grid */}
        {loading ? (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <div className={`${createGlassStyle({
                blur: 'xl',
                opacity: 'medium',
                gradient: true,
                border: 'medium',
                shadow: 'lg',
                rounded: 'xl'
              })} p-6 rounded-2xl`}>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span>Loading abilities...</span>
                  <span className="text-indigo-500 font-medium">Please wait</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                    animate={{ 
                      x: ['-100%', '100%'],
                      transition: { 
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut"
                      }
                    }}
                  />
                </div>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`${createGlassStyle({
                  blur: 'lg',
                  opacity: 'subtle',
                  gradient: true,
                  border: 'subtle',
                  shadow: 'md',
                  rounded: 'xl'
                })} h-48 animate-pulse rounded-2xl`}>
                  <div className="h-full bg-gradient-to-br from-white/10 to-indigo-100/10 dark:from-gray-700/10 dark:to-purple-700/10 rounded-2xl" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              data-testid="abilities-grid"
            >
              {currentAbilities.map((ability, index) => (
                <motion.div
                  key={ability.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <div className={`${createGlassStyle({
                    blur: 'lg',
                    opacity: 'medium',
                    gradient: true,
                    border: 'medium',
                    shadow: 'lg',
                    rounded: 'xl',
                    hover: 'lift'
                  })} h-full p-6 group cursor-pointer rounded-2xl`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold capitalize bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-purple-700 transition-all duration-300">
                        {ability.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {ability.is_hidden && (
                          <span className={`${createGlassStyle({
                            blur: 'sm',
                            opacity: 'subtle',
                            gradient: false,
                            border: 'subtle',
                            shadow: 'sm',
                            rounded: 'full'
                          })} px-3 py-1 text-xs text-gray-700 dark:text-gray-300 rounded-full`}>
                            Hidden
                          </span>
                        )}
                        <span className="px-3 py-1 text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-sm">
                          Gen {ability.generation}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                      {ability.short_effect}
                    </p>

                    {ability.pokemon.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-2">Pokemon with this ability:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {ability.pokemon.slice(0, 4).map(pokemon => (
                            <span 
                              key={pokemon} 
                              className={`${createGlassStyle({
                                blur: 'sm',
                                opacity: 'subtle',
                                gradient: false,
                                border: 'subtle',
                                shadow: 'sm',
                                rounded: 'full'
                              })} text-xs px-3 py-1 capitalize hover:scale-105 transition-transform duration-200`}
                            >
                              {pokemon.replace(/-/g, ' ')}
                            </span>
                          ))}
                          {ability.pokemon.length > 4 && (
                            <span className="text-xs px-2 py-1 text-indigo-500 font-medium">
                              +{ability.pokemon.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced Pagination with Glass Morphism */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 flex justify-center"
              >
                <div className={`${createGlassStyle({
                  blur: 'xl',
                  opacity: 'medium',
                  gradient: true,
                  border: 'medium',
                  shadow: 'lg',
                  rounded: 'full'
                })} inline-flex gap-3 p-3 rounded-full`}>
                  <GradientButton
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="secondary"
                    size="sm"
                    className="rounded-full min-w-0"
                  >
                    ← Previous
                  </GradientButton>
                  
                  <div className="flex gap-2 items-center">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <motion.button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                              : `${createGlassStyle({
                                  blur: 'sm',
                                  opacity: 'subtle',
                                  gradient: false,
                                  border: 'subtle',
                                  shadow: 'sm',
                                  rounded: 'full',
                                  hover: 'lift'
                                })} text-gray-700 dark:text-gray-300`
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    })}
                  </div>
                  
                  <GradientButton
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    variant="secondary"
                    size="sm"
                    className="rounded-full min-w-0"
                  >
                    Next →
                  </GradientButton>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </FullBleedWrapper>
  );
};

export default AbilitiesPage;