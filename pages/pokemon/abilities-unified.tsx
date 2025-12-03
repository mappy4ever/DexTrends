import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { NextPage } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import logger from '../../utils/logger';
import { fetchShowdownAbilities } from '../../utils/showdownData';
import { requestCache } from '../../utils/UnifiedCacheManager';
import { CompetitiveTierBadge } from '../../components/ui/CompetitiveTierBadge';
import { cn } from '@/utils/cn';
import { fetchJSON } from '../../utils/unifiedFetch';
import { FiSearch, FiChevronLeft, FiChevronDown, FiChevronUp, FiStar, FiZap, FiShield, FiWind, FiTarget, FiEye, FiX } from 'react-icons/fi';

interface Ability {
  id: number;
  name: string;
  displayName: string;
  effect: string;
  short_effect: string;
  generation?: number;
  rating?: number;
  is_competitive?: boolean;
  category?: string;
  pokemon?: string[];
}

interface AbilityApiResponse {
  id: number;
  name: string;
  pokemon: Array<{
    is_hidden: boolean;
    pokemon: { name: string; url: string };
  }>;
}

// Enhanced categories with icons and better filtering
const ABILITY_CATEGORIES = [
  { key: 'all', name: 'All', icon: <FiStar className="w-4 h-4" />, color: 'from-stone-500 to-stone-600', keywords: [] },
  { key: 'competitive', name: 'Competitive', icon: <FiTarget className="w-4 h-4" />, color: 'from-purple-500 to-pink-500', keywords: [] },
  { key: 'offensive', name: 'Offensive', icon: <FiZap className="w-4 h-4" />, color: 'from-red-500 to-orange-500', keywords: ['attack', 'damage', 'power', 'boost', 'strike', 'punch', 'claw', 'fang', 'bite', 'technician', 'huge power', 'moxie', 'guts', 'sheer force', 'adaptability', 'contrary'] },
  { key: 'defensive', name: 'Defensive', icon: <FiShield className="w-4 h-4" />, color: 'from-blue-500 to-cyan-500', keywords: ['defense', 'protect', 'guard', 'resist', 'immune', 'absorb', 'heal', 'recover', 'regenerator', 'multiscale', 'sturdy', 'intimidate', 'imposter'] },
  { key: 'speed', name: 'Speed', icon: <FiWind className="w-4 h-4" />, color: 'from-yellow-500 to-amber-500', keywords: ['speed', 'swift', 'quick', 'priority', 'faster', 'speed boost', 'chlorophyll', 'sand rush', 'swift swim', 'slush rush', 'prankster', 'gale wings'] },
  { key: 'utility', name: 'Utility', icon: <FiEye className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500', keywords: ['weather', 'terrain', 'ability', 'switch', 'entry', 'hazard', 'trace', 'magic bounce', 'defiant', 'competitive', 'levitate', 'mold breaker'] },
];

// Tier descriptions for the legend
const TIER_INFO = [
  { rating: 5, tier: 'S', name: 'Meta-defining', color: 'from-amber-500 to-yellow-400' },
  { rating: 4, tier: 'A', name: 'Excellent', color: 'from-purple-500 to-violet-400' },
  { rating: 3, tier: 'B', name: 'Good', color: 'from-blue-500 to-cyan-400' },
  { rating: 2, tier: 'C', name: 'Situational', color: 'from-green-500 to-emerald-400' },
  { rating: 1, tier: 'D', name: 'Niche', color: 'from-stone-500 to-stone-400' },
  { rating: 0, tier: 'F', name: 'Weak', color: 'from-red-500 to-rose-400' },
];

const UnifiedAbilitiesPage: NextPage = () => {
  const router = useRouter();
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [abilityPokemon, setAbilityPokemon] = useState<Record<number, any[]>>({});
  const [loadingPokemon, setLoadingPokemon] = useState<Record<number, boolean>>({});
  const [showTierLegend, setShowTierLegend] = useState(false);

  useEffect(() => {
    const fetchAllAbilities = async () => {
      setLoading(true);

      try {
        const cacheKey = 'showdown-abilities-data-v2';
        const cached = await requestCache.get(cacheKey);

        if (cached) {
          setAbilities(cached);
          setLoading(false);
          return;
        }

        const showdownAbilities = await fetchShowdownAbilities();

        if (!showdownAbilities || Object.keys(showdownAbilities).length === 0) {
          throw new Error('Failed to fetch abilities from Showdown');
        }

        const allAbilities: Ability[] = [];

        Object.entries(showdownAbilities).forEach(([abilityKey, abilityData]) => {
          if (!abilityData.name || typeof abilityData.num !== 'number') {
            return;
          }

          // Determine category based on effect
          let category = 'utility';
          const effectLower = (abilityData.desc || '').toLowerCase();

          if (ABILITY_CATEGORIES[2].keywords.some(k => effectLower.includes(k))) category = 'offensive';
          else if (ABILITY_CATEGORIES[3].keywords.some(k => effectLower.includes(k))) category = 'defensive';
          else if (ABILITY_CATEGORIES[4].keywords.some(k => effectLower.includes(k))) category = 'speed';

          const ability: Ability = {
            id: abilityData.num,
            name: abilityKey.toLowerCase().replace(/[^a-z0-9]/g, ''),
            displayName: abilityData.name,
            effect: abilityData.desc || '',
            short_effect: abilityData.shortDesc || abilityData.desc || 'No description available',
            rating: abilityData.rating,
            is_competitive: abilityData.rating !== undefined && abilityData.rating >= 3,
            category,
            pokemon: []
          };

          allAbilities.push(ability);
        });

        allAbilities.sort((a, b) => {
          if (a.rating !== undefined && b.rating !== undefined) {
            if (a.rating !== b.rating) return b.rating - a.rating;
          }
          return a.displayName.localeCompare(b.displayName);
        });

        await requestCache.set(cacheKey, allAbilities);
        setAbilities(allAbilities);
      } catch (error) {
        logger.error('Failed to fetch abilities', { error });
        setAbilities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAbilities();
  }, []);

  const fetchAbilityPokemon = useCallback(async (abilityId: number, abilityName: string) => {
    if (abilityPokemon[abilityId]) return abilityPokemon[abilityId];

    setLoadingPokemon(prev => ({ ...prev, [abilityId]: true }));
    try {
      const response = await fetchJSON(`https://pokeapi.co/api/v2/ability/${abilityName}`) as AbilityApiResponse;
      if (response?.pokemon) {
        setAbilityPokemon(prev => ({ ...prev, [abilityId]: response.pokemon }));
        return response.pokemon;
      }
      return [];
    } catch (error) {
      logger.error('Failed to fetch Pokemon for ability', { error });
      setAbilityPokemon(prev => ({ ...prev, [abilityId]: [] }));
      return [];
    } finally {
      setLoadingPokemon(prev => ({ ...prev, [abilityId]: false }));
    }
  }, [abilityPokemon]);

  // Filter abilities
  const filteredAbilities = useMemo(() => {
    let result = abilities;

    // Category filter
    if (selectedCategory === 'competitive') {
      result = result.filter(a => a.is_competitive);
    } else if (selectedCategory !== 'all') {
      const category = ABILITY_CATEGORIES.find(c => c.key === selectedCategory);
      if (category?.keywords.length) {
        result = result.filter(a => {
          const effectLower = (a.effect || a.short_effect).toLowerCase();
          const nameLower = a.displayName.toLowerCase();
          return category.keywords.some(k => effectLower.includes(k) || nameLower.includes(k));
        });
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.displayName.toLowerCase().includes(query) ||
        a.short_effect.toLowerCase().includes(query) ||
        a.effect.toLowerCase().includes(query)
      );
    }

    return result;
  }, [abilities, selectedCategory, searchQuery]);

  // Stats for display
  const stats = useMemo(() => ({
    total: abilities.length,
    competitive: abilities.filter(a => a.is_competitive).length,
    sTier: abilities.filter(a => a.rating === 5).length,
  }), [abilities]);

  // Get Pokemon ID from URL
  const getPokemonId = (url: string) => {
    const match = url.match(/\/pokemon\/(\d+)\//);
    return match ? parseInt(match[1]) : 1;
  };

  return (
    <>
      <Head>
        <title>Pokémon Abilities | DexTrends</title>
        <meta name="description" content="Complete database of all Pokemon abilities with competitive ratings, effects, and which Pokemon can have them." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 dark:from-stone-950 dark:via-stone-900 dark:to-purple-950">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-30 dark:opacity-20">
            <div className="absolute top-10 left-10 w-64 h-64 bg-purple-400 rounded-full blur-3xl" />
            <div className="absolute top-20 right-20 w-48 h-48 bg-pink-400 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-blue-400 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 pt-6 pb-4">
            {/* Back Button */}
            <button
              onClick={() => router.push('/pokemon')}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors mb-4"
            >
              <FiChevronLeft className="w-4 h-4" />
              Pokémon Hub
            </button>

            {/* Hero Content */}
            <div className="text-center mb-6">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl md:text-5xl font-black mb-3"
              >
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                  Abilities
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto"
              >
                Discover the unique powers that make each Pokémon special
              </motion.p>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-4 sm:gap-8 mb-6"
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">{stats.total}</div>
                <div className="text-xs sm:text-sm text-stone-500">Total</div>
              </div>
              <div className="w-px bg-stone-300 dark:bg-stone-600" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{stats.competitive}</div>
                <div className="text-xs sm:text-sm text-stone-500">Competitive</div>
              </div>
              <div className="w-px bg-stone-300 dark:bg-stone-600" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-pink-600 dark:text-pink-400">{stats.sTier}</div>
                <div className="text-xs sm:text-sm text-stone-500">S-Tier</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Sticky Search & Filters */}
        <div className="sticky top-14 md:top-16 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border-b border-stone-200 dark:border-stone-700">
          <div className="container mx-auto px-4 py-3">
            {/* Search Bar */}
            <div className="relative mb-3">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search abilities by name or effect..."
                className={cn(
                  "w-full pl-12 pr-10 py-3 rounded-xl",
                  "bg-stone-100 dark:bg-stone-800",
                  "border border-stone-200 dark:border-stone-700",
                  "focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                  "text-stone-900 dark:text-white placeholder-stone-400",
                  "transition-all"
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {ABILITY_CATEGORIES.map(category => (
                <motion.button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-all",
                    selectedCategory === category.key
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                  )}
                >
                  {category.icon}
                  {category.name}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Tier Legend Button & Panel */}
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={() => setShowTierLegend(!showTierLegend)}
            className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            {showTierLegend ? <FiChevronUp /> : <FiChevronDown />}
            {showTierLegend ? 'Hide' : 'Show'} Tier Legend
          </button>

          <AnimatePresence>
            {showTierLegend && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-3 p-4 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                  {TIER_INFO.map(tier => (
                    <div key={tier.rating} className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm",
                        `bg-gradient-to-br ${tier.color}`
                      )}>
                        {tier.tier}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-stone-900 dark:text-white">{tier.name}</div>
                        <div className="text-xs text-stone-500">Tier {tier.tier}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <div className="container mx-auto px-4 pb-2">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Showing <span className="font-semibold text-stone-700 dark:text-stone-200">{filteredAbilities.length}</span> abilities
            {selectedCategory !== 'all' && ` in ${ABILITY_CATEGORIES.find(c => c.key === selectedCategory)?.name}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Abilities Grid */}
        <div className="container mx-auto px-4 pb-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-stone-800 rounded-xl p-4 h-32">
                  <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-full mb-2" />
                  <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredAbilities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                <FiSearch className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">No abilities found</h3>
              <p className="text-stone-500 dark:text-stone-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAbilities.map((ability, index) => (
                <motion.div
                  key={ability.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.3) }}
                  className={cn(
                    "bg-white dark:bg-stone-800 rounded-xl overflow-hidden",
                    "border border-stone-200 dark:border-stone-700",
                    "hover:border-purple-300 dark:hover:border-purple-600",
                    "hover:shadow-lg transition-all duration-200"
                  )}
                >
                  {/* Card Header */}
                  <button
                    onClick={() => {
                      if (expandedId === ability.id) {
                        setExpandedId(null);
                      } else {
                        setExpandedId(ability.id);
                        fetchAbilityPokemon(ability.id, ability.name);
                      }
                    }}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-stone-900 dark:text-white text-lg">
                          {ability.displayName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {ability.rating !== undefined && (
                            <CompetitiveTierBadge rating={ability.rating} />
                          )}
                          {ability.is_competitive && (
                            <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                              Competitive
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedId === ability.id ? 180 : 0 }}
                        className="text-stone-400"
                      >
                        <FiChevronDown className="w-5 h-5" />
                      </motion.div>
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-300 line-clamp-2">
                      {ability.short_effect}
                    </p>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedId === ability.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50">
                          {/* Full Effect */}
                          {ability.effect && ability.effect !== ability.short_effect && (
                            <div className="mb-4">
                              <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">
                                Full Description
                              </h4>
                              <p className="text-sm text-stone-700 dark:text-stone-300">
                                {ability.effect}
                              </p>
                            </div>
                          )}

                          {/* Pokemon with this ability */}
                          <div>
                            <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
                              Pokémon with this Ability
                            </h4>
                            {loadingPokemon[ability.id] ? (
                              <div className="flex items-center gap-2 text-sm text-stone-500">
                                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                Loading Pokémon...
                              </div>
                            ) : abilityPokemon[ability.id]?.length ? (
                              <div className="flex flex-wrap gap-2">
                                {abilityPokemon[ability.id].slice(0, 8).map((p: any) => {
                                  const pokemonId = getPokemonId(p.pokemon.url);
                                  return (
                                    <Link
                                      key={p.pokemon.name}
                                      href={`/pokedex/${pokemonId}`}
                                      className="group flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-600 hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                                    >
                                      <Image
                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
                                        alt={p.pokemon.name}
                                        width={24}
                                        height={24}
                                        className="group-hover:scale-110 transition-transform"
                                      />
                                      <span className="text-xs font-medium text-stone-700 dark:text-stone-300 capitalize">
                                        {p.pokemon.name.replace(/-/g, ' ')}
                                      </span>
                                      {p.is_hidden && (
                                        <span className="text-[10px] px-1 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded">
                                          Hidden
                                        </span>
                                      )}
                                    </Link>
                                  );
                                })}
                                {abilityPokemon[ability.id].length > 8 && (
                                  <span className="text-xs text-stone-500 dark:text-stone-400 self-center">
                                    +{abilityPokemon[ability.id].length - 8} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-stone-500 dark:text-stone-400">
                                No Pokémon found with this ability
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Full bleed layout
(UnifiedAbilitiesPage as NextPage & { fullBleed?: boolean }).fullBleed = true;

export default UnifiedAbilitiesPage;
