import React, { useState, useEffect, useMemo } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { fetchJSON } from '@/utils/unifiedFetch';
import { PokemonDisplay as PokemonCardRenderer } from '@/components/ui/PokemonDisplay';
import { TypeBadge } from '@/components/ui/TypeBadge';
import Container from '@/components/ui/Container';
import Modal from '@/components/ui/Modal';
import { FiX, FiFilter, FiSearch } from 'react-icons/fi';
import { POKEMON_TYPE_COLORS } from '@/utils/unifiedTypeColors';
import { getGeneration } from '@/utils/pokemonutils';
import { useDebounce } from '@/hooks/useDebounce';
import {
  isUltraBeast,
  isParadoxPokemon,
  isParadoxPast,
  isParadoxFuture,
} from '@/utils/pokemonClassifications';
import logger from '@/utils/logger';
import { cn } from '@/utils/cn';
import { NoSearchResults } from '@/components/ui/EmptyState';
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
  isUltraBeast?: boolean;
  isParadox?: boolean;
  paradoxType?: 'past' | 'future';
  height?: number;
  weight?: number;
  stats?: Array<{ base_stat: number; stat: { name: string } }>;
  totalStats?: number;
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
  { value: 'ultra-beast', label: 'Ultra Beast', icon: '🌀' },
  { value: 'paradox', label: 'Paradox', icon: '⏳' },
] as const;

const TOTAL_POKEMON = 1025;
const BATCH_SIZE = 50; // Increased from 20 for faster loading

const STARTER_IDS = new Set([
  1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393,
  495, 498, 501, 650, 653, 656, 722, 725, 728, 810, 813, 816,
  906, 909, 912
]);

const UnifiedPokedex: NextPage = () => {
  const router = useRouter();

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

  // Load Pokémon data - optimized for fast initial load
  useEffect(() => {
    const loadPokemon = async () => {
      try {
        setLoading(true);

        // Create placeholders with skeleton-ready state
        const allPokemon: Pokemon[] = Array.from({ length: TOTAL_POKEMON }, (_, i) => ({
          id: i + 1,
          name: `pokemon-${i + 1}`,
          sprite: '', // Empty = show skeleton
          types: [],
          generation: getGeneration(i + 1).toString(),
          isStarter: STARTER_IDS.has(i + 1)
        }));

        setPokemon(allPokemon);

        // Helper to load a single Pokemon with both basic and species data
        const loadPokemonData = async (id: number): Promise<Pokemon | null> => {
          try {
            // Fetch Pokemon and species data in PARALLEL
            const [pokemonData, speciesData] = await Promise.all([
              fetchJSON<APIPokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`, {
                useCache: true,
                cacheTime: 24 * 60 * 60 * 1000, // 24 hours cache
                timeout: 8000
              }),
              fetchJSON<{ is_legendary: boolean; is_mythical: boolean }>(
                `https://pokeapi.co/api/v2/pokemon-species/${id}`,
                { useCache: true, cacheTime: 24 * 60 * 60 * 1000, timeout: 8000 }
              ).catch(() => null) // Species can fail silently
            ]);

            if (!pokemonData) return null;

            const numId = typeof pokemonData.id === 'string' ? parseInt(pokemonData.id, 10) : pokemonData.id;
            return {
              id: numId,
              name: pokemonData.name,
              sprite: pokemonData.sprites?.other?.['official-artwork']?.front_default ||
                      pokemonData.sprites?.front_default ||
                      '/dextrendslogo.png',
              types: pokemonData.types?.map((t: PokemonType) => t.type.name) || [],
              generation: getGeneration(numId).toString(),
              isStarter: STARTER_IDS.has(numId),
              isLegendary: speciesData?.is_legendary || false,
              isMythical: speciesData?.is_mythical || false,
              isUltraBeast: isUltraBeast(numId),
              isParadox: isParadoxPokemon(numId),
              paradoxType: isParadoxPast(numId) ? 'past' : isParadoxFuture(numId) ? 'future' : undefined,
              height: pokemonData.height,
              weight: pokemonData.weight,
              stats: pokemonData.stats,
              totalStats: pokemonData.stats?.reduce((acc: number, stat: PokemonStat) => acc + stat.base_stat, 0) || 0
            };
          } catch {
            return null;
          }
        };

        // Load in batches without artificial delays
        let loadedCount = 0;
        for (let start = 1; start <= TOTAL_POKEMON; start += BATCH_SIZE) {
          const batchPromises: Promise<Pokemon | null>[] = [];

          for (let id = start; id < start + BATCH_SIZE && id <= TOTAL_POKEMON; id++) {
            batchPromises.push(loadPokemonData(id));
          }

          const batchResults = await Promise.all(batchPromises);

          // Update allPokemon array with results
          batchResults.forEach(result => {
            if (result) {
              allPokemon[result.id - 1] = result;
              loadedCount++;
            }
          });

          // Update state after each batch for progressive loading
          setPokemon([...allPokemon]);

          // Mark loading as complete after first batch (fast initial paint)
          if (start === 1) {
            setLoading(false);
          }

          // Minimal delay only if needed for rate limiting (reduced from 200ms)
          if (start + BATCH_SIZE <= TOTAL_POKEMON) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        logger.info('All Pokémon loaded successfully', { count: loadedCount });
      } catch (error) {
        logger.error('Failed to load Pokémon', { error });
        setLoading(false);
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
        case 'ultra-beast':
          filtered = filtered.filter(p => p.isUltraBeast);
          break;
        case 'paradox':
          filtered = filtered.filter(p => p.isParadox);
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

  return (
    <>
      <Head>
        <title>Pokédex - DexTrends</title>
        <meta name="description" content="Browse all Pokémon with our elegant, responsive Pokédex" />
      </Head>

      <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
        {/* Compact Header */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6">
            {/* Top bar with title and count */}
            <div className="flex items-center justify-between py-2 sm:py-3">
              <div className="flex items-center gap-3">
                <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">Pokédex</h1>
                <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs sm:text-sm font-semibold rounded-full">
                  {filteredPokemon.length.toLocaleString()}
                </span>
                {loading && (
                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* Filter button */}
              <button
                onClick={() => setFilterModalOpen(true)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                  hasActiveFilters
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                )}
              >
                <FiFilter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-white text-amber-600 text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Search bar - compact */}
            <div className="pb-2 sm:pb-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by name or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-10 pr-10 bg-stone-100 dark:bg-stone-800 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-stone-400"
                  style={{ fontSize: '16px' }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full"
                  >
                    <FiX className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Type pills - single row horizontal scroll */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 sm:pb-3 -mx-3 px-3 scrollbar-hide">
              {ALL_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={cn(
                    'flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold transition-all',
                    selectedTypes.includes(type)
                      ? 'text-white shadow-sm scale-105'
                      : 'bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-300 dark:hover:bg-stone-700'
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

            {/* Active filters row - only if filters active */}
            {(selectedGeneration || selectedCategory || sortBy !== 'id') && (
              <div className="flex items-center gap-2 pb-2 overflow-x-auto scrollbar-hide">
                {selectedGeneration && (
                  <button
                    onClick={() => setSelectedGeneration('')}
                    className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                  >
                    Gen {selectedGeneration}
                    <FiX className="w-3 h-3" />
                  </button>
                )}
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium capitalize"
                  >
                    {selectedCategory}
                    <FiX className="w-3 h-3" />
                  </button>
                )}
                {sortBy !== 'id' && (
                  <button
                    onClick={() => setSortBy('id')}
                    className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-full text-xs font-medium"
                  >
                    {sortBy === 'name' ? 'A-Z' : 'Stats'}
                    <FiX className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={clearFilters}
                  className="flex-shrink-0 px-2 py-1 text-xs text-red-600 dark:text-red-400 font-medium"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pokemon Grid - Full width, tighter spacing */}
        <div className="max-w-[1600px] mx-auto px-2 sm:px-3 lg:px-4 py-3 sm:py-4">
          {loading && pokemon.length === 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3">
              {Array.from({ length: 24 }).map((_, index) => (
                <div key={index} className="aspect-[3/4] rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
              ))}
            </div>
          ) : filteredPokemon.length === 0 ? (
            <Container variant="default" padding="lg">
              <NoSearchResults
                searchTerm={searchTerm || undefined}
                filterCount={activeFilterCount}
                onClear={clearFilters}
              />
            </Container>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3">
              {filteredPokemon.map((p) => (
                <PokemonCardRenderer
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  sprite={p.sprite}
                  types={p.types}
                  onClick={() => router.push(`/pokedex/${p.id}`)}
                  variant="listing"
                  showStats={false}
                  showBadges={false}
                />
              ))}
            </div>
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
