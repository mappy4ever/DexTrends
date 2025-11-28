import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { CircularButton } from '../../components/ui/design-system';
import { createGlassStyle } from '../../components/ui/design-system/glass-constants';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import logger from '../../utils/logger';
import { fetchShowdownAbilities } from '../../utils/showdownData';
import { requestCache } from '../../utils/UnifiedCacheManager';
import { UnifiedDataTable, Column } from '../../components/unified/UnifiedDataTable';
import { CompetitiveTierBadge } from '../../components/ui/CompetitiveTierBadge';
import { cn } from '@/utils/cn';
import { fetchJSON } from '../../utils/unifiedFetch';

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

interface AbilityApiResponse {
  id: number;
  name: string;
  pokemon: Array<{
    is_hidden: boolean;
    pokemon: { name: string; url: string };
  }>;
}

const ABILITY_CATEGORIES = [
  { key: 'all', name: 'All', color: 'from-stone-400 to-stone-500' },
  { key: 'competitive', name: 'Competitive', color: 'from-amber-400 to-pink-500' },
  { key: 'offensive', name: 'Offensive', color: 'from-red-400 to-orange-500' },
  { key: 'defensive', name: 'Defensive', color: 'from-amber-400 to-cyan-500' },
  { key: 'speed', name: 'Speed', color: 'from-yellow-400 to-amber-500' },
];

/**
 * Unified Abilities Page
 * 
 * Features:
 * - Single responsive component for all viewports
 * - UnifiedDataTable with card/table views
 * - Virtual scrolling for performance
 * - Smart column prioritization
 * - No conditional mobile/desktop rendering
 * - Expandable rows for Pokemon lists
 */
const UnifiedAbilitiesPage: NextPage = () => {
  const router = useRouter();
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [abilityPokemon, setAbilityPokemon] = useState<Record<number, any[]>>({});
  const [loadingPokemon, setLoadingPokemon] = useState<Record<number, boolean>>({});
  
  const glassStyle = createGlassStyle({
    blur: '2xl',
    opacity: 'medium',
    gradient: true,
    border: 'subtle',
    shadow: 'lg',
    rounded: 'sm'
  });

  useEffect(() => {
    const fetchAllAbilities = async () => {
      setLoading(true);
      
      try {
        const cacheKey = 'showdown-abilities-data';
        const cached = await requestCache.get(cacheKey);
        
        if (cached) {
          setAbilities(cached);
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
            generation: undefined,
            pokemon: []
          };
          
          allAbilities.push(ability);
        });
        
        // Sort abilities by rating (highest first) then alphabetically
        allAbilities.sort((a, b) => {
          if (a.rating !== undefined && b.rating !== undefined) {
            if (a.rating !== b.rating) {
              return b.rating - a.rating;
            }
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

  // Fetch Pokemon for ability (for expanded view)
  const fetchAbilityPokemon = useCallback(async (abilityId: number, abilityName: string) => {
    if (abilityPokemon[abilityId]) {
      return abilityPokemon[abilityId];
    }

    setLoadingPokemon(prev => ({ ...prev, [abilityId]: true }));
    try {
      const response = await fetchJSON(`https://pokeapi.co/api/v2/ability/${abilityName}`) as AbilityApiResponse;
      if (response && response.pokemon) {
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

  // Filter abilities by category
  const filteredAbilities = useMemo(() => {
    if (selectedCategory === 'all') {
      return abilities;
    }
    if (selectedCategory === 'competitive') {
      return abilities.filter(a => a.is_competitive);
    }
    // For other categories, you could implement keyword matching
    return abilities;
  }, [abilities, selectedCategory]);

  // Define columns for UnifiedDataTable
  const columns: Column<Ability>[] = [
    {
      key: 'displayName',
      label: 'Ability',
      priority: 'primary',
      sortable: true,
      renderCell: (ability: Ability) => (
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium text-stone-900 dark:text-white">
              {ability.displayName}
            </div>
            {ability.is_competitive && (
              <span className="inline-block text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded mt-0.5">
                Competitive
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'rating',
      label: 'Tier',
      priority: 'secondary',
      sortable: true,
      align: 'center',
      renderCell: (ability: Ability) => (
        ability.rating !== undefined ? (
          <CompetitiveTierBadge rating={ability.rating} />
        ) : (
          <span className="text-stone-400">-</span>
        )
      )
    },
    {
      key: 'short_effect',
      label: 'Effect',
      priority: 'detail',
      sortable: false,
      renderCell: (ability: Ability) => (
        <div className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
          {ability.short_effect}
        </div>
      ),
      width: '50%'
    }
  ];

  // Custom card renderer for mobile view
  const renderMobileCard = (ability: Ability) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-stone-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-stone-900 dark:text-white">
            {ability.displayName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {ability.rating !== undefined && (
              <CompetitiveTierBadge rating={ability.rating} />
            )}
            {ability.is_competitive && (
              <span className="text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded">
                Competitive
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-3">
        {ability.short_effect}
      </p>
    </motion.div>
  );

  // Expanded row renderer
  const renderExpanded = (ability: Ability) => (
    <div className="p-4 bg-stone-50 dark:bg-stone-900">
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Full Description
          </h4>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {ability.effect || ability.short_effect}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            Pokémon with this ability
          </h4>
          <button
            onClick={async () => {
              const pokemon = await fetchAbilityPokemon(ability.id, ability.name);
              // This would trigger a re-render with the fetched Pokemon
            }}
            className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
          >
            {loadingPokemon[ability.id] ? (
              'Loading...'
            ) : abilityPokemon[ability.id] ? (
              <div className="flex flex-wrap gap-2">
                {abilityPokemon[ability.id].slice(0, 10).map((p: any) => (
                  <span
                    key={p.pokemon.name}
                    className="px-2 py-1 bg-stone-200 dark:bg-stone-700 rounded text-xs"
                  >
                    {p.pokemon.name}
                    {p.is_hidden && ' (H)'}
                  </span>
                ))}
                {abilityPokemon[ability.id].length > 10 && (
                  <span className="text-xs text-stone-500">
                    +{abilityPokemon[ability.id].length - 10} more
                  </span>
                )}
              </div>
            ) : (
              'Click to load Pokémon'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Abilities Collection | DexTrends</title>
        <meta name="description" content="Explore all Pokemon abilities with descriptions, competitive ratings, and Pokemon that have them" />
      </Head>

      {/* Header - Responsive */}
      <motion.div 
        className={cn('sticky top-0 z-50', glassStyle, 'border-b border-white/20')}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <CircularButton
              onClick={() => router.push('/pokemon')}
              variant="secondary"
              size="sm"
              className="scale-90 sm:scale-100"
            >
              ← Back
            </CircularButton>
            
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                Abilities
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 hidden sm:block">
                Explore Pokemon abilities and effects
              </p>
            </div>
            
            <div className={cn(
              createGlassStyle({ blur: 'sm', opacity: 'subtle' }),
              'px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-center'
            )}>
              <div className="text-sm sm:text-lg font-bold text-amber-600 dark:text-amber-400">
                {filteredAbilities.length}
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Abilities</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Filter - Responsive scrollable */}
      <div className="sticky top-[73px] sm:top-[89px] z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-200 dark:border-stone-700">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {ABILITY_CATEGORIES.map(category => (
              <motion.button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-all',
                  selectedCategory === category.key
                    ? 'bg-gradient-to-r text-white shadow-lg ' + category.color
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                )}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Tier Legend - Responsive */}
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400">
              Competitive Tiers:
            </span>
            <div className="flex gap-2 sm:gap-3 overflow-x-auto">
              {[5, 4, 3, 2, 1, 0].map(rating => (
                <div key={rating} className="flex items-center gap-1">
                  <CompetitiveTierBadge rating={rating} />
                  <span className="text-xs text-stone-500 dark:text-stone-500 hidden sm:inline">
                    {rating === 5 ? 'S' : rating === 4 ? 'A' : rating === 3 ? 'B' : rating === 2 ? 'C' : rating === 1 ? 'D' : 'F'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-6 sm:pb-8">
        <UnifiedDataTable
          data={filteredAbilities}
          columns={columns}
          loading={loading}
          virtualize={true}
          itemHeight={80}
          searchable={true}
          searchPlaceholder="Search abilities by name or effect..."
          getItemKey={(ability) => ability.id.toString()}
          renderMobileCard={renderMobileCard}
          expandable={true}
          renderExpanded={renderExpanded}
          defaultSort="rating"
          defaultSortDirection="desc"
        />
      </div>
    </FullBleedWrapper>
  );
};

export default UnifiedAbilitiesPage;