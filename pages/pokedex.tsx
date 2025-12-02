import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { fetchJSON } from '@/utils/unifiedFetch';
import { UnifiedGrid } from '@/components/unified/UnifiedGrid';
import { PokemonDisplay as PokemonCardRenderer } from '@/components/ui/PokemonDisplay';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { PageHeader } from '@/components/ui/BreadcrumbNavigation';
import Container from '@/components/ui/Container';
import Modal from '@/components/ui/Modal';
import { IoClose, IoFilter, IoSearch } from 'react-icons/io5';
import { POKEMON_TYPE_COLORS } from '@/utils/unifiedTypeColors';
import { getGeneration } from '@/utils/pokemonutils';
import { useDebounce } from '@/hooks/useDebounce';
import { useViewport } from '@/hooks/useViewport';
import logger from '@/utils/logger';
import { cn } from '@/utils/cn';
import { SkeletonPokemonCard } from '@/components/ui/Skeleton';
import { SectionDivider } from '@/components/ui/SectionDivider';
import type { Pokemon as APIPokemon, PokemonType, PokemonStat } from '@/types/api/pokemon';

/**
 * Pokédex - Clean, responsive design
 *
 * Features:
 * - Unified mobile + desktop experience
 * - Type-based filtering with visual badges
 * - Generation & category filters
 * - Virtual scrolling for performance
 * - Sticky search bar
 */

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  generation?: string;
  isLegendary?: boolean;
  isMythical?: boolean;
  isStarter?: boolean;
  height?: number;
  weight?: number;
  stats?: Array<{ base_stat: number; stat: { name: string } }>;
  totalStats?: number;
}

interface PokemonGridItem {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  types: string[];
  raw: Pokemon;
}

const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;

const GENERATIONS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'] as const;

const CATEGORIES = [
  { value: 'starter', label: 'Starters', icon: '🌟' },
  { value: 'legendary', label: 'Legendary', icon: '⚡' },
  { value: 'mythical', label: 'Mythical', icon: '✨' },
] as const;

const TOTAL_POKEMON = 1025;
const BATCH_SIZE = 20;

const STARTER_IDS = new Set([
  1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393,
  495, 498, 501, 650, 653, 656, 722, 725, 728, 810, 813, 816,
  906, 909, 912
]);

const UnifiedPokedex: NextPage = () => {
  const router = useRouter();
  const viewport = useViewport();

  // Data state
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'stats'>('id');

  // UI state
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Load Pokémon data
  useEffect(() => {
    const loadPokemon = async () => {
      try {
        setLoading(true);

        // Create placeholders immediately
        const placeholders: Pokemon[] = Array.from({ length: TOTAL_POKEMON }, (_, i) => ({
          id: i + 1,
          name: `pokemon-${i + 1}`,
          sprite: '/dextrendslogo.png',
          types: [],
          generation: getGeneration(i + 1).toString(),
          isStarter: STARTER_IDS.has(i + 1)
        }));

        setPokemon(placeholders);
        setLoading(false);

        // Load real data in batches
        const allPokemon = [...placeholders];

        for (let start = 1; start <= TOTAL_POKEMON; start += BATCH_SIZE) {
          const promises = [];
          for (let id = start; id < start + BATCH_SIZE && id <= TOTAL_POKEMON; id++) {
            promises.push(
              fetchJSON<APIPokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`, {
                useCache: true,
                cacheTime: 60 * 60 * 1000,
                timeout: 10000
              })
                .then((data) => (data ? {
                  id: typeof data.id === 'string' ? parseInt(data.id, 10) : data.id,
                  name: data.name,
                  sprite: data.sprites?.other?.['official-artwork']?.front_default ||
                          data.sprites?.front_default ||
                          '/dextrendslogo.png',
                  types: data.types?.map((t: PokemonType) => t.type.name) || [],
                  generation: getGeneration(typeof data.id === 'string' ? parseInt(data.id, 10) : data.id).toString(),
                  isStarter: STARTER_IDS.has(typeof data.id === 'string' ? parseInt(data.id, 10) : data.id),
                  height: data.height,
                  weight: data.weight,
                  stats: data.stats,
                  totalStats: data.stats?.reduce((acc: number, stat: PokemonStat) => acc + stat.base_stat, 0) || 0
                } : null))
                .catch(() => null)
            );
          }

          const batchResults = await Promise.all(promises);
          batchResults.forEach(result => {
            if (result) {
              allPokemon[result.id - 1] = result;
            }
          });

          setPokemon([...allPokemon]);
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Load species data for legendary/mythical status
        for (let id = 1; id <= TOTAL_POKEMON; id++) {
          try {
            const species = await fetchJSON<{ is_legendary: boolean; is_mythical: boolean }>(
              `https://pokeapi.co/api/v2/pokemon-species/${id}`,
              { useCache: true, cacheTime: 60 * 60 * 1000, timeout: 10000 }
            );
            if (species) {
              allPokemon[id - 1].isLegendary = species.is_legendary;
              allPokemon[id - 1].isMythical = species.is_mythical;
            }
          } catch {
            // Continue without species data
          }
        }

        setPokemon([...allPokemon]);
        logger.info('All Pokémon loaded successfully');
      } catch (error) {
        logger.error('Failed to load Pokémon', { error });
      }
    };

    loadPokemon();
  }, []);

  // Filter and sort
  const filteredPokemon = useMemo(() => {
    let filtered = [...pokemon];

    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.id.toString() === term
      );
    }

    if (selectedTypes.length > 0) {
      filtered = filtered.filter(p =>
        selectedTypes.some(type => p.types.includes(type))
      );
    }

    if (selectedGeneration) {
      filtered = filtered.filter(p => p.generation === selectedGeneration);
    }

    if (selectedCategory) {
      switch (selectedCategory) {
        case 'starter':
          filtered = filtered.filter(p => p.isStarter);
          break;
        case 'legendary':
          filtered = filtered.filter(p => p.isLegendary);
          break;
        case 'mythical':
          filtered = filtered.filter(p => p.isMythical);
          break;
      }
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stats':
          return (b.totalStats || 0) - (a.totalStats || 0);
        default:
          return a.id - b.id;
      }
    });

    return filtered;
  }, [pokemon, debouncedSearch, selectedTypes, selectedGeneration, selectedCategory, sortBy]);

  // Transform to grid items
  const gridItems: PokemonGridItem[] = useMemo(() =>
    filteredPokemon.map(p => ({
      id: p.id,
      image: p.sprite,
      title: p.name,
      subtitle: `#${String(p.id).padStart(3, '0')}`,
      types: p.types,
      raw: p
    })),
    [filteredPokemon]
  );

  const handlePokemonClick = useCallback((item: PokemonGridItem) => {
    router.push(`/pokedex/${item.id}`);
  }, [router]);

  const renderPokemonCard = useCallback((item: PokemonGridItem, _index: number, dimensions: { width: number; height: number }) => {
    return (
      <PokemonCardRenderer
        id={item.raw.id}
        name={item.raw.name}
        sprite={item.raw.sprite}
        types={item.raw.types}
        onClick={() => handlePokemonClick(item)}
        width={Math.min(dimensions.width - 24, 80)}
        height={Math.min(dimensions.height - 60, 80)}
        // Use listing variant for clean, minimal cards
        variant="listing"
        // Don't show stats or badges in listing - those are for detail page
        showStats={false}
        showBadges={false}
      />
    );
  }, [handlePokemonClick]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedGeneration('');
    setSelectedCategory('');
    setSortBy('id');
  };

  const activeFilterCount = selectedTypes.length + (selectedGeneration ? 1 : 0) + (selectedCategory ? 1 : 0) + (sortBy !== 'id' ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0 || searchTerm;

  // Responsive column config using Tailwind breakpoints
  const columnConfig = {
    mobile: 2,
    tablet: 4,
    laptop: 5,
    desktop: 6,
    wide: 7
  };

  return (
    <>
      <Head>
        <title>Pokédex - DexTrends</title>
        <meta name="description" content="Browse all Pokémon with our elegant, responsive Pokédex" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-[#FFFDF7] to-[#FBF8F3] dark:from-stone-900 dark:to-stone-950">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">

          {/* Page Header */}
          <PageHeader
            title="Pokédex"
            description={`Explore all ${TOTAL_POKEMON} Pokémon`}
            breadcrumbs={[
              { title: 'Home', href: '/', icon: '🏠', isActive: false },
              { title: 'Pokédex', href: '/pokedex', icon: '📚', isActive: true },
            ]}
          >
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-full">
                {filteredPokemon.length} found
              </span>
              {loading && (
                <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full animate-pulse">
                  Loading...
                </span>
              )}
            </div>
          </PageHeader>

          {/* Search & Filter Bar - Sticky below navbar */}
          <div className="sticky top-[48px] md:top-[64px] z-20 -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 py-3 bg-[#FFFDF7] dark:bg-stone-900 shadow-sm mb-4">
            {/* Search Input - Prominent, full width */}
            <div className="relative mb-3">
              <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
              <input
                type="text"
                placeholder="Search Pokemon by name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full min-h-[52px] pl-12 pr-16 py-3 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                style={{ fontSize: '16px' }}
              />
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-14 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors active:scale-95"
                >
                  <IoClose className="w-4 h-4 text-stone-400" />
                </button>
              ) : null}
              {/* Filter button inside search bar */}
              <button
                onClick={() => setFilterModalOpen(true)}
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-xl transition-all touch-manipulation active:scale-95',
                  hasActiveFilters
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                )}
              >
                <IoFilter className="w-5 h-5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Type Filter Pills - Horizontal scroll */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-hide">
              {ALL_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={cn(
                    'flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-all touch-manipulation min-h-[36px] active:scale-95',
                    selectedTypes.includes(type)
                      ? 'text-white shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  )}
                  style={{
                    backgroundColor: selectedTypes.includes(type)
                      ? POKEMON_TYPE_COLORS[type]
                      : undefined
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Active Non-Type Filters */}
            {(selectedGeneration || selectedCategory || sortBy !== 'id') && (
              <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
                {selectedGeneration && (
                  <button
                    onClick={() => setSelectedGeneration('')}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    Gen {selectedGeneration}
                    <IoClose className="w-3.5 h-3.5" />
                  </button>
                )}
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors capitalize"
                  >
                    {selectedCategory}
                    <IoClose className="w-3.5 h-3.5" />
                  </button>
                )}
                {sortBy !== 'id' && (
                  <button
                    onClick={() => setSortBy('id')}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full text-sm hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                  >
                    Sort: {sortBy === 'name' ? 'A-Z' : 'Stats'}
                    <IoClose className="w-3.5 h-3.5" />
                  </button>
                )}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex-shrink-0 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Subtle divider before grid */}
          <SectionDivider variant="space" spacing="sm" />

          {/* Pokemon Grid */}
          {loading && pokemon.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 18 }).map((_, index) => (
                <SkeletonPokemonCard key={index} />
              ))}
            </div>
          ) : filteredPokemon.length === 0 ? (
            <Container variant="default" padding="lg" className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-stone-700 dark:text-stone-300 mb-2">
                No Pokémon found
              </h3>
              <p className="text-stone-500 dark:text-stone-300 mb-4">
                Try adjusting your search or filters
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
              >
                Clear Filters
              </button>
            </Container>
          ) : (
            <UnifiedGrid
              items={gridItems}
              onItemClick={handlePokemonClick}
              columns={columnConfig}
              gap="responsive"
              virtualize={true}
              loading={false}
              renderItem={renderPokemonCard}
              enableHaptics={true}
              className="min-h-[400px]"
            />
          )}

          {/* Filter Modal */}
          <Modal
            isOpen={filterModalOpen}
            onClose={() => setFilterModalOpen(false)}
            title="Filter Pokémon"
            size="md"
            mobileAsSheet={true}
          >
            <div className="overflow-y-auto max-h-[60vh] sm:max-h-[70vh]">
              {/* Type Filter */}
              <div className="p-4 border-b border-stone-200 dark:border-stone-700">
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Type</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {ALL_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={cn(
                        'relative min-h-[44px] p-2 rounded-xl transition-all flex items-center justify-center',
                        selectedTypes.includes(type)
                          ? 'bg-stone-100 dark:bg-stone-800 ring-2 ring-amber-500'
                          : 'bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800'
                      )}
                    >
                      <TypeBadge type={type} size="sm" />
                      {selectedTypes.includes(type) && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generation Filter */}
              <div className="p-4 border-b border-stone-200 dark:border-stone-700">
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Generation</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {GENERATIONS.map(gen => (
                    <button
                      key={gen}
                      onClick={() => setSelectedGeneration(selectedGeneration === gen ? '' : gen)}
                      className={cn(
                        'min-h-[44px] py-2.5 px-3 rounded-xl font-medium transition-all text-sm',
                        selectedGeneration === gen
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                          : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                      )}
                    >
                      Gen {gen}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="p-4 border-b border-stone-200 dark:border-stone-700">
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Category</h3>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(selectedCategory === cat.value ? '' : cat.value)}
                      className={cn(
                        'min-h-[44px] py-2.5 px-3 rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-1.5',
                        selectedCategory === cat.value
                          ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                          : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                      )}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="p-4">
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Sort By</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'id' as const, label: 'Number', icon: '#' },
                    { value: 'name' as const, label: 'A-Z', icon: 'Aa' },
                    { value: 'stats' as const, label: 'Stats', icon: '📊' }
                  ].map(sort => (
                    <button
                      key={sort.value}
                      onClick={() => setSortBy(sort.value)}
                      className={cn(
                        'min-h-[44px] py-2.5 px-3 rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-1.5',
                        sortBy === sort.value
                          ? 'bg-stone-800 dark:bg-white text-white dark:text-stone-900 shadow-md'
                          : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                      )}
                    >
                      <span className="text-base">{sort.icon}</span>
                      <span>{sort.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-4 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
              <button
                onClick={clearFilters}
                className="flex-1 min-h-[44px] py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="flex-1 min-h-[44px] py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/25"
              >
                Show {filteredPokemon.length} Results
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default UnifiedPokedex;
