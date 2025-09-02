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
import { getGeneration } from '@/utils/pokemonutils';
import { useDebounce } from '@/hooks/useDebounce';
import logger from '@/utils/logger';
import { cn } from '@/utils/cn';
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
        <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Type</h3>
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
                'relative p-1 rounded-lg transition-all',
                selectedTypes.includes(type)
                  ? 'ring-2 ring-primary-500 bg-gray-100 dark:bg-gray-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
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
        <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Generation</h3>
        <div className="flex flex-wrap gap-2">
          {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'].map(gen => (
            <button
              key={gen}
              onClick={() => {
                setSelectedGeneration(selectedGeneration === gen ? '' : gen);
              }}
              className={cn(
                'px-4 py-2 rounded-full font-medium transition-all',
                selectedGeneration === gen
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              Gen {gen}
            </button>
          ))}
        </div>
      </div>
      
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Category</h3>
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
                'py-2 px-4 rounded-lg font-medium transition-all',
                selectedCategory === cat.value
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Sort Options */}
      <div>
        <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Sort By</h3>
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
                'py-2 px-4 rounded-lg font-medium transition-all',
                sortBy === sort.value
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800'
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
  
  const hasActiveFilters = searchTerm || selectedTypes.length > 0 || selectedGeneration || selectedCategory || sortBy !== 'id';
  
  // Intelligent column configuration
  const columnConfig = {
    mobile: viewportWidth <= 390 ? 2 : 3,    // 2 cols on very small, 3 on mobile
    tablet: 4,                                // 4 cols on tablet
    laptop: 5,                                // 5 cols on laptop
    desktop: 6,                               // 6 cols on desktop
    wide: 8                                   // 8 cols on wide screens
  };
  
  return (
    <>
      <Head>
        <title>Pokédex - DexTrends</title>
        <meta name="description" content="Browse all Pokémon with our elegant, responsive Pokédex" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pokédex
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredPokemon.length} of {TOTAL_POKEMON} Pokémon
            </p>
            
            {/* Stats Pills */}
            <div className="flex justify-center gap-3 mt-4">
              <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full shadow-md">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {filteredPokemon.length} Found
                </span>
              </div>
              {loading && (
                <div className="px-4 py-2 bg-blue-100/80 dark:bg-blue-900/80 backdrop-blur rounded-full">
                  <span className="text-blue-600 dark:text-blue-400">Loading...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl p-4 mb-6 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search Pokémon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Filter Button */}
              <button
                onClick={filterModal.open}
                className={cn(
                  'px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2',
                  hasActiveFilters
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
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
                  className="px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-medium transition-all hover:bg-red-200 dark:hover:bg-red-900/50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          {/* Unified Grid - The Heart of the System */}
          <UnifiedGrid
            items={gridItems}
            onItemClick={handlePokemonClick}
            columns={columnConfig}
            gap="responsive"
            virtualize={true}
            loading={loading && pokemon.length === 0}
            renderItem={renderPokemonCard}
            enableHaptics={true}
            className="min-h-[600px]"
          />
          
          {/* Filter Modal */}
          <AdaptiveModal
            isOpen={filterModal.isOpen}
            onClose={filterModal.close}
            title="Filter Pokémon"
            size="md"
          >
            {renderFilters()}
            <div className="flex gap-3 p-4 border-t dark:border-gray-700">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={filterModal.close}
                className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </AdaptiveModal>
        </div>
      </div>
    </>
  );
};

export default UnifiedPokedex;