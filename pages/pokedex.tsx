import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { fetchJSON } from '@/utils/unifiedFetch';
import { UnifiedGrid } from '@/components/unified/UnifiedGrid';
import { AdaptiveModal, useAdaptiveModal } from '@/components/unified';
import { PokemonDisplay as PokemonCardRenderer } from '@/components/ui/PokemonDisplay';
const CompactPokemonCard = (props: any) => <PokemonCardRenderer {...props} variant="compact" />;
import { TypeBadge } from '@/components/ui/TypeBadge';
import { PageHeader } from '@/components/ui/BreadcrumbNavigation';
import { ActiveFilterPills } from '@/components/ui/FilterDrawer';
import { IoClose } from 'react-icons/io5';
import { getGeneration } from '@/utils/pokemonutils';
import { useDebounce } from '@/hooks/useDebounce';
import logger from '@/utils/logger';
import { cn } from '@/utils/cn';
import { SkeletonPokemonCard } from '@/components/ui/Skeleton';
import { PullToRefresh } from '@/components/ui/gestures/PullToRefresh';
import type { Pokemon as APIPokemon, PokemonType, PokemonStat } from '@/types/api/pokemon';

/**
 * Unified Pokédex - Production-ready responsive design
 * 
 * Features:
 * - One codebase for all devices
 * - Elegant circular card design with type gradients
 * - Virtual scrolling for performance
 * - Mobile-first responsive layout
 * - Sophisticated filtering system
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

const TOTAL_POKEMON = 1025;
const BATCH_SIZE = 50;

const UnifiedPokedex: NextPage = () => {
  const router = useRouter();
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'stats'>('id');
  
  const debouncedSearch = useDebounce(searchTerm, 300);
  const filterModal = useAdaptiveModal();
  
  // Viewport detection for column optimization
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 375
  );
  
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Helper functions
  const checkIfStarter = (id: number): boolean => {
    const starterIds = [
      1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393,
      495, 498, 501, 650, 653, 656, 722, 725, 728, 810, 813, 816,
      906, 909, 912
    ];
    return starterIds.includes(id);
  };
  
  // Load Pokémon data progressively
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
          isStarter: checkIfStarter(i + 1)
        }));
        
        setPokemon(placeholders);
        setLoading(false);
        
        // Load real data in batches
        const allPokemon = [...placeholders];
        
        for (let start = 1; start <= TOTAL_POKEMON; start += BATCH_SIZE) {
          const promises = [];
          for (let id = start; id < start + BATCH_SIZE && id <= TOTAL_POKEMON; id++) {
            promises.push(
              fetchJSON<APIPokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`)
                .then((data) => (data ? {
                  id: typeof data.id === 'string' ? parseInt(data.id, 10) : data.id,
                  name: data.name,
                  sprite: data.sprites?.other?.['official-artwork']?.front_default || 
                          data.sprites?.front_default || 
                          '/dextrendslogo.png',
                  types: data.types?.map((t: PokemonType) => t.type.name) || [],
                  generation: getGeneration(typeof data.id === 'string' ? parseInt(data.id, 10) : data.id).toString(),
                  isStarter: checkIfStarter(typeof data.id === 'string' ? parseInt(data.id, 10) : data.id),
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
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Load species data for legendary/mythical status
        for (let id = 1; id <= TOTAL_POKEMON; id++) {
          try {
            const species = await fetchJSON<any>(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
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
  
  // Filter and sort Pokémon
  const filteredPokemon = useMemo(() => {
    let filtered = [...pokemon];
    
    // Search filter
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.id.toString() === term
      );
    }
    
    // Type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(p => 
        selectedTypes.some(type => p.types.includes(type))
      );
    }
    
    // Generation filter
    if (selectedGeneration) {
      filtered = filtered.filter(p => p.generation === selectedGeneration);
    }
    
    // Category filter
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
    
    // Sort
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
  
  // Handle Pokémon click
  const handlePokemonClick = useCallback((item: PokemonGridItem) => {
    router.push(`/pokedex/${item.id}`);
  }, [router]);
  
  // Custom Pokémon card renderer
  const renderPokemonCard = useCallback((item: PokemonGridItem, index: number, dimensions: { width: number; height: number }) => {
    // Use compact card for mobile or when many columns
    const useCompact = viewportWidth < 768 || dimensions.width < 120;
    
    const CardComponent = useCompact ? CompactPokemonCard : PokemonCardRenderer;
    
    return (
      <CardComponent
        id={item.raw.id}
        name={item.raw.name}
        sprite={item.raw.sprite}
        types={item.raw.types}
        onClick={() => handlePokemonClick(item)}
        width={dimensions.width}
        height={dimensions.height}
        isLegendary={item.raw.isLegendary}
        isMythical={item.raw.isMythical}
        isStarter={item.raw.isStarter}
      />
    );
  }, [handlePokemonClick, viewportWidth]);
  
  // Render filters
  const renderFilters = () => (
    <div className="space-y-6 p-4">
      {/* Type Filter */}
      <div>
        <h3 className="font-semibold mb-3 text-stone-700 dark:text-stone-300">Type</h3>
        <div className="grid grid-cols-3 gap-2">
          {['normal', 'fire', 'water', 'electric', 'grass', 'ice',
            'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
            'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'].map(type => (
            <button
              key={type}
              onClick={() => {
                setSelectedTypes(prev =>
                  prev.includes(type)
                    ? prev.filter(t => t !== type)
                    : [...prev, type]
                );
              }}
              className={cn(
                'relative min-h-[36px] p-1 rounded-lg transition-all touch-target',
                selectedTypes.includes(type)
                  ? 'ring-2 ring-amber-500 bg-stone-100 dark:bg-stone-800'
                  : 'hover:bg-stone-100 dark:hover:bg-stone-800'
              )}
            >
              <TypeBadge type={type} size="sm" />
              {selectedTypes.includes(type) && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
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
      <div>
        <h3 className="font-semibold mb-3 text-stone-700 dark:text-stone-300">Generation</h3>
        <div className="flex flex-wrap gap-2">
          {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'].map(gen => (
            <button
              key={gen}
              onClick={() => {
                setSelectedGeneration(selectedGeneration === gen ? '' : gen);
              }}
              className={cn(
                'min-h-[44px] px-4 py-2 rounded-full font-medium transition-all touch-target',
                selectedGeneration === gen
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
              )}
            >
              Gen {gen}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="font-semibold mb-3 text-stone-700 dark:text-stone-300">Category</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'starter', label: 'Starter' },
            { value: 'legendary', label: 'Legendary' },
            { value: 'mythical', label: 'Mythical' }
          ].map(cat => (
            <button
              key={cat.value}
              onClick={() => {
                setSelectedCategory(selectedCategory === cat.value ? '' : cat.value);
              }}
              className={cn(
                'min-h-[44px] py-2 px-4 rounded-lg font-medium transition-all touch-target',
                selectedCategory === cat.value
                  ? 'bg-green-500 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <h3 className="font-semibold mb-3 text-stone-700 dark:text-stone-300">Sort By</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'id' as const, label: 'Number' },
            { value: 'name' as const, label: 'Name' },
            { value: 'stats' as const, label: 'Stats' }
          ].map(sort => (
            <button
              key={sort.value}
              onClick={() => setSortBy(sort.value)}
              className={cn(
                'min-h-[44px] py-2 px-4 rounded-lg font-medium transition-all touch-target',
                sortBy === sort.value
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              )}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedGeneration('');
    setSelectedCategory('');
    setSortBy('id');
  };
  
  const handleRefresh = async () => {
    // Reload Pokemon data
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate refresh
    window.location.reload(); // Simple refresh for now
  };
  
  const hasActiveFilters = searchTerm || selectedTypes.length > 0 || selectedGeneration || selectedCategory || sortBy !== 'id';
  
  // Intelligent column configuration
  const columnConfig = {
    mobile: viewportWidth <= 390 ? 2 : 3,    // 2 cols on very small, 3 on mobile
    tablet: 4,                                // 4 cols on tablet
    laptop: 5,                                // 5 cols on laptop
    desktop: 6,                               // 6 cols on desktop
    wide: 8                                   // 8 cols on wide screens
  };
  
  const isMobile = viewportWidth <= 640;
  
  const mainContent = (
    <>
      <Head>
        <title>Pokédex - DexTrends</title>
        <meta name="description" content="Browse all Pokémon with our elegant, responsive Pokédex" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-b from-[#FFFDF7] to-[#FBF8F3] dark:from-stone-900 dark:to-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Page Header with Breadcrumbs */}
          <PageHeader
            title="Pokédex"
            description={`Explore ${TOTAL_POKEMON} Pokémon with detailed stats, abilities, and more`}
            breadcrumbs={[
              { title: 'Home', href: '/', icon: '🏠', isActive: false },
              { title: 'Pokédex', href: '/pokedex', icon: '📚', isActive: true },
            ]}
          >
            {/* Stats Pills */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 dark:bg-stone-800/80 rounded-full shadow-sm border border-stone-100 dark:border-stone-700">
                <span className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300">
                  {filteredPokemon.length} Found
                </span>
              </div>
              {loading && (
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-100/80 dark:bg-amber-900/30 rounded-full">
                  <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">Loading...</span>
                </div>
              )}
            </div>
          </PageHeader>
          
          {/* Search and Filter Bar */}
          <div className="sticky top-0 z-20 bg-white/90 dark:bg-stone-900/90 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm border border-stone-100 dark:border-stone-800">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search Pokémon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full min-h-[44px] px-4 py-2.5 sm:py-3 pl-14 sm:pl-16 text-base bg-stone-100 dark:bg-stone-800 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all touch-manipulation"
                  style={{ fontSize: '16px' }}
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter Button */}
              <button
                onClick={filterModal.open}
                className={cn(
                  'min-h-[44px] px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all flex items-center justify-center gap-2 touch-target',
                  hasActiveFilters
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                )}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {hasActiveFilters && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {selectedTypes.length + (selectedGeneration ? 1 : 0) + (selectedCategory ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Clear Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="min-h-[44px] px-4 sm:px-6 py-2.5 sm:py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-medium transition-all hover:bg-red-200 dark:hover:bg-red-900/50 touch-target"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Type Filters - Desktop Only */}
            <div className="hidden lg:flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-stone-200/50 dark:border-stone-700/50">
              {['fire', 'water', 'grass', 'electric', 'psychic', 'dragon', 'dark', 'fairy', 'fighting', 'steel'].map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedTypes(prev =>
                      prev.includes(type)
                        ? prev.filter(t => t !== type)
                        : [...prev, type]
                    );
                  }}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-all',
                    selectedTypes.includes(type)
                      ? 'ring-2 ring-amber-500 ring-offset-1'
                      : 'opacity-80 hover:opacity-100'
                  )}
                >
                  <TypeBadge type={type} size="sm" />
                </button>
              ))}
              <button
                onClick={filterModal.open}
                className="px-3 py-1 rounded-full text-xs font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
              >
                + More types
              </button>
            </div>

            {/* Active Filter Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-stone-200/50 dark:border-stone-700/50">
                {selectedTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedTypes(prev => prev.filter(t => t !== type))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                  >
                    <span className="capitalize">{type}</span>
                    <IoClose className="w-3 h-3" />
                  </button>
                ))}
                {selectedGeneration && (
                  <button
                    onClick={() => setSelectedGeneration('')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <span>Gen {selectedGeneration}</span>
                    <IoClose className="w-3 h-3" />
                  </button>
                )}
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <span className="capitalize">{selectedCategory}</span>
                    <IoClose className="w-3 h-3" />
                  </button>
                )}
                {sortBy !== 'id' && (
                  <button
                    onClick={() => setSortBy('id')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    <span>Sort: {sortBy === 'name' ? 'Name' : 'Stats'}</span>
                    <IoClose className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
          
          {/* Unified Grid - The Heart of the System */}
          {loading && pokemon.length === 0 ? (
            <div className={cn(
              'grid gap-3 sm:gap-4 md:gap-5',
              viewportWidth <= 390 ? 'grid-cols-2' : 
              viewportWidth <= 640 ? 'grid-cols-3' :
              viewportWidth <= 768 ? 'grid-cols-4' :
              viewportWidth <= 1024 ? 'grid-cols-5' :
              viewportWidth <= 1440 ? 'grid-cols-6' :
              'grid-cols-8'
            )}>
              {Array.from({ length: 24 }).map((_, index) => (
                <SkeletonPokemonCard key={index} />
              ))}
            </div>
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
              className="min-h-[600px]"
            />
          )}
          
          {/* Filter Modal */}
          <AdaptiveModal
            isOpen={filterModal.isOpen}
            onClose={filterModal.close}
            title="Filter Pokémon"
            size="md"
          >
            {renderFilters()}
            <div className="flex gap-3 p-4 border-t border-stone-200 dark:border-stone-700">
              <button
                onClick={clearFilters}
                className="flex-1 min-h-[44px] py-3 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors touch-target"
              >
                Reset
              </button>
              <button
                onClick={filterModal.close}
                className="flex-1 min-h-[44px] py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors touch-target"
              >
                Apply
              </button>
            </div>
          </AdaptiveModal>
        </div>
      </div>
    </>
  );
  
  return isMobile ? (
    <PullToRefresh onRefresh={handleRefresh}>
      {mainContent}
    </PullToRefresh>
  ) : (
    mainContent
  );
};

export default UnifiedPokedex;