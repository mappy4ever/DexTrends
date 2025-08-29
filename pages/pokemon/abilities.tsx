import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { NextPage } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularButton, GradientButton } from '../../components/ui/design-system';
import { GlassContainer } from '../../components/ui/design-system/GlassContainer';
import { createGlassStyle } from '../../components/ui/design-system/glass-constants';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import logger from '../../utils/logger';
import { BsSearch, BsEye, BsEyeSlash, BsSortUp, BsSortDown, BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { FaChevronUp } from 'react-icons/fa';
import { fetchJSON } from '../../utils/unifiedFetch';
import { requestCache } from '../../utils/UnifiedCacheManager';
import { fetchShowdownAbilities, ShowdownAbility } from '../../utils/showdownData';
import { CompetitiveTierBadge, TierLegend } from '../../components/ui/CompetitiveTierBadge';
import { useInView } from 'react-intersection-observer';

interface Ability {
  id: number;
  name: string;
  displayName: string;
  effect: string;
  short_effect: string;
  generation?: number;
  rating?: number;
  is_competitive?: boolean;
  pokemon?: string[];
}

type SortOption = 'name' | 'tier' | 'generation';
type SortDirection = 'asc' | 'desc';

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
    pokemon: { name: string; url: string };
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
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('tier');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedAbilityId, setExpandedAbilityId] = useState<number | null>(null);
  const [abilityPokemon, setAbilityPokemon] = useState<Record<number, any[]>>({});
  const [loadingPokemon, setLoadingPokemon] = useState<Record<number, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(24);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllAbilities = async () => {
      setLoading(true);
      
      try {
        const cacheKey = 'showdown-abilities-data';
        const cached = await requestCache.get(cacheKey);
        
        if (cached) {
          setAbilities(cached);
          setFilteredAbilities(cached);
          setLoading(false);
          return;
        }

        // Fetch from Showdown - much faster and includes ratings
        const showdownAbilities = await fetchShowdownAbilities();
        
        if (!showdownAbilities || Object.keys(showdownAbilities).length === 0) {
          throw new Error('Failed to fetch abilities from Showdown');
        }

        const allAbilities: Ability[] = [];
        
        // Convert Showdown abilities to our format
        Object.entries(showdownAbilities).forEach(([abilityKey, abilityData]) => {
          // Skip if not a proper ability
          if (!abilityData.name || typeof abilityData.num !== 'number') {
            return;
          }
          
          const ability: Ability = {
            id: abilityData.num,
            name: abilityKey.toLowerCase().replace(/[^a-z0-9]/g, ''),
            displayName: abilityData.name,
            effect: abilityData.desc || '',
            short_effect: abilityData.shortDesc || abilityData.desc || 'No description available',
            rating: abilityData.rating,
            is_competitive: abilityData.rating !== undefined && abilityData.rating >= 3,
            generation: undefined, // Showdown doesn't provide generation info
            pokemon: [] // Will be fetched on demand
          };
          
          allAbilities.push(ability);
        });
        
        // Sort abilities by rating (highest first) then alphabetically
        allAbilities.sort((a, b) => {
          if (a.rating !== undefined && b.rating !== undefined) {
            if (a.rating !== b.rating) {
              return b.rating - a.rating; // Higher rating first
            }
          }
          return a.displayName.localeCompare(b.displayName);
        });
        
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

  // Fetch Pokemon for selected ability
  const fetchAbilityPokemon = useCallback(async (abilityId: number, abilityName: string) => {
    if (abilityPokemon[abilityId]) {
      return;
    }

    setLoadingPokemon(prev => ({ ...prev, [abilityId]: true }));
    try {
      const response = await fetchJSON(`https://pokeapi.co/api/v2/ability/${abilityName}`) as AbilityApiResponse;
      if (response && response.pokemon) {
        setAbilityPokemon(prev => ({ ...prev, [abilityId]: response.pokemon }));
      }
    } catch (error) {
      logger.error('Failed to fetch Pokemon for ability', { error });
      setAbilityPokemon(prev => ({ ...prev, [abilityId]: [] }));
    } finally {
      setLoadingPokemon(prev => ({ ...prev, [abilityId]: false }));
    }
  }, [abilityPokemon]);

  // Toggle ability expansion
  const toggleAbilityExpansion = useCallback((ability: Ability) => {
    if (expandedAbilityId === ability.id) {
      setExpandedAbilityId(null);
    } else {
      setExpandedAbilityId(ability.id);
      fetchAbilityPokemon(ability.id, ability.name);
    }
  }, [expandedAbilityId, fetchAbilityPokemon]);

  // Filter and sort abilities
  useEffect(() => {
    let filtered = [...abilities];

    if (searchTerm) {
      filtered = filtered.filter(ability =>
        ability.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ability.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ability.short_effect.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLetter) {
      filtered = filtered.filter(ability => 
        ability.displayName.toUpperCase().startsWith(selectedLetter)
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

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case 'name':
          comparison = a.displayName.localeCompare(b.displayName);
          break;
        case 'tier':
          if (a.rating !== undefined && b.rating !== undefined) {
            comparison = b.rating - a.rating;
          } else if (a.rating !== undefined) {
            comparison = -1;
          } else if (b.rating !== undefined) {
            comparison = 1;
          } else {
            comparison = a.displayName.localeCompare(b.displayName);
          }
          break;
        case 'generation':
          if (a.generation !== undefined && b.generation !== undefined) {
            comparison = a.generation - b.generation;
          } else {
            comparison = a.displayName.localeCompare(b.displayName);
          }
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredAbilities(filtered);
    setVisibleCount(24); // Reset visible count when filters change
  }, [searchTerm, selectedCategory, selectedLetter, sortOption, sortDirection, abilities]);

  // Lazy loading with intersection observer
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && visibleCount < filteredAbilities.length) {
      setVisibleCount(prev => Math.min(prev + 24, filteredAbilities.length));
    }
  }, [inView, visibleCount, filteredAbilities.length]);

  const visibleAbilities = useMemo(() => {
    return filteredAbilities.slice(0, visibleCount);
  }, [filteredAbilities, visibleCount]);

  // Generate alphabet array
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

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

            {/* Alphabet Filter */}
            <div className="mb-4 p-3 bg-white/20 dark:bg-gray-800/20 rounded-xl">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Quick Navigation:</p>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedLetter(null)}
                  className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                    selectedLetter === null
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : 'bg-white/30 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 hover:bg-white/50'
                  }`}
                >
                  All
                </button>
                {alphabet.map(letter => (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(letter)}
                    className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                      selectedLetter === letter
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                        : 'bg-white/30 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 hover:bg-white/50'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting Options */}
            <div className="mb-4 p-3 bg-white/20 dark:bg-gray-800/20 rounded-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Sort By:</p>
                <div className="flex items-center gap-2">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="px-3 py-1 text-xs bg-white/30 dark:bg-gray-700/30 rounded-lg border border-white/20 dark:border-gray-600/20 text-gray-700 dark:text-gray-300"
                  >
                    <option value="tier">Tier</option>
                    <option value="name">Name</option>
                    <option value="generation">Generation</option>
                  </select>
                  <button
                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-1 bg-white/30 dark:bg-gray-700/30 rounded-lg border border-white/20 dark:border-gray-600/20 text-gray-700 dark:text-gray-300 hover:bg-white/50 transition-all"
                  >
                    {sortDirection === 'asc' ? <BsSortUp className="text-sm" /> : <BsSortDown className="text-sm" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Tier Legend */}
            <div className="mb-4 p-3 bg-white/20 dark:bg-gray-800/20 rounded-xl">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Competitive Tier Ratings:</p>
              <TierLegend className="text-xs" />
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
              ref={containerRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              data-testid="abilities-grid"
            >
              {visibleAbilities.map((ability, index) => (
                <motion.div
                  key={ability.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="relative"
                >
                  <div 
                    className={`${createGlassStyle({
                      blur: 'lg',
                      opacity: 'medium',
                      gradient: true,
                      border: 'medium',
                      shadow: 'lg',
                      rounded: 'xl',
                      hover: 'lift'
                    })} p-6 group cursor-pointer rounded-2xl transition-all ${
                      expandedAbilityId === ability.id ? 'ring-2 ring-indigo-400 scale-[1.02]' : ''
                    }`}
                    onClick={() => toggleAbilityExpansion(ability)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-purple-700 transition-all duration-300">
                        {ability.displayName}
                      </h3>
                      <div className="flex items-center gap-2">
                        {ability.rating !== undefined && (
                          <CompetitiveTierBadge 
                            rating={ability.rating} 
                            size="xs" 
                            showValue={false}
                          />
                        )}
                        <div className="text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 transition-colors">
                          {expandedAbilityId === ability.id ? <BsChevronUp /> : <BsChevronDown />}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                      {ability.short_effect}
                    </p>
                  </div>

                  {/* Expanded Pokemon List */}
                  <AnimatePresence>
                    {expandedAbilityId === ability.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className={`${createGlassStyle({
                          blur: 'md',
                          opacity: 'subtle',
                          gradient: false,
                          border: 'subtle',
                          shadow: 'sm',
                          rounded: 'lg'
                        })} mt-2 p-4 rounded-lg`}>
                          {loadingPokemon[ability.id] ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                              Loading Pokemon...
                            </div>
                          ) : abilityPokemon[ability.id] && abilityPokemon[ability.id].length > 0 ? (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                Pokemon with this ability:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {abilityPokemon[ability.id].slice(0, 15).map((entry: any, idx: number) => (
                                  <button
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const pokemonId = entry.pokemon.url.split('/').filter(Boolean).pop();
                                      router.push(`/pokedex/${pokemonId}`);
                                    }}
                                    className="px-2 py-1 bg-white/50 dark:bg-gray-700/50 rounded text-xs hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all capitalize"
                                  >
                                    {entry.pokemon.name.replace('-', ' ')}
                                  </button>
                                ))}
                                {abilityPokemon[ability.id].length > 15 && (
                                  <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                                    +{abilityPokemon[ability.id].length - 15} more
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              No Pokemon data available
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>

            {/* Load More Trigger */}
            {visibleCount < filteredAbilities.length && (
              <div ref={inViewRef} className="flex justify-center mt-8">
                <div className={`${createGlassStyle({
                  blur: 'lg',
                  opacity: 'medium',
                  gradient: true,
                  border: 'medium',
                  shadow: 'md',
                  rounded: 'full'
                })} px-6 py-3 rounded-full`}>
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Loading more abilities... ({visibleCount}/{filteredAbilities.length})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll to Top Button */}
            {visibleCount > 48 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 flex justify-center"
              >
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setVisibleCount(24);
                  }}
                  className={`${createGlassStyle({
                    blur: 'xl',
                    opacity: 'medium',
                    gradient: true,
                    border: 'medium',
                    shadow: 'lg',
                    rounded: 'full',
                    hover: 'lift'
                  })} px-6 py-3 rounded-full flex items-center gap-2`}
                >
                  <FaChevronUp className="text-sm" />
                  <span className="text-sm font-semibold">Back to Top</span>
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </FullBleedWrapper>
  );
};

export default AbilitiesPage;