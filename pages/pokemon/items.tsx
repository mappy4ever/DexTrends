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
import { BsSearch, BsGrid3X3, BsList, BsSortUp, BsSortDown } from 'react-icons/bs';
import { FaChevronUp } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { fetchJSON } from '../../utils/unifiedFetch';
import { requestCache } from '../../utils/UnifiedCacheManager';
import { fetchShowdownItems, getItemSpriteUrl, getItemCategory, ShowdownItem } from '../../utils/showdownData';
import { useInView } from 'react-intersection-observer';

interface Item {
  id: number;
  name: string;
  displayName: string;
  category: string;
  generation?: number;
  effect: string;
  short_effect: string;
  sprite: string;
  fling_power?: number;
  is_choice?: boolean;
  is_competitive?: boolean;
}

type SortOption = 'name' | 'category' | 'generation';
type SortDirection = 'asc' | 'desc';

interface ItemApiResponse {
  id: number;
  name: string;
  category: { name: string };
  cost: number;
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: { name: string };
  }>;
  sprites: { default: string };
  attributes: Array<{ name: string }>;
  fling_power?: number;
  fling_effect?: { name: string };
}

const ITEM_CATEGORIES = [
  { key: 'all', name: 'All', color: 'from-gray-400 to-gray-500' },
  { key: 'medicine', name: 'Medicine', color: 'from-green-400 to-emerald-500' },
  { key: 'berries', name: 'Berries', color: 'from-red-400 to-pink-500' },
  { key: 'holdable', name: 'Competitive', color: 'from-blue-400 to-indigo-500' },
  { key: 'evolution', name: 'Evolution', color: 'from-purple-400 to-violet-500' },
  { key: 'mega-stones', name: 'Mega Stones', color: 'from-red-500 to-pink-600' },
  { key: 'z-crystals', name: 'Z-Crystals', color: 'from-yellow-500 to-orange-500' },
  { key: 'treasures', name: 'Treasures', color: 'from-yellow-400 to-amber-500' },
];

const ItemsPage: NextPage = () => {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(48);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllItems = async () => {
      setLoading(true);
      
      try {
        const cacheKey = 'showdown-items-data';
        const cached = await requestCache.get(cacheKey);
        
        if (cached) {
          setItems(cached);
          setFilteredItems(cached);
          setLoading(false);
          return;
        }

        // Fetch from Showdown - much faster than PokeAPI
        const showdownItems = await fetchShowdownItems();
        
        if (!showdownItems || Object.keys(showdownItems).length === 0) {
          throw new Error('Failed to fetch items from Showdown');
        }

        const allItems: Item[] = [];
        
        // Convert Showdown items to our format
        Object.entries(showdownItems).forEach(([itemKey, itemData]) => {
          // Skip items without proper data
          if (!itemData.name || typeof itemData.num !== 'number') {
            return;
          }
          
          const item: Item = {
            id: itemData.num,
            name: itemKey.toLowerCase().replace(/[^a-z0-9]/g, ''),
            displayName: itemData.name,
            category: getItemCategory(itemKey, itemData),
            generation: itemData.gen,
            effect: itemData.desc || '',
            short_effect: itemData.shortDesc || itemData.desc || 'No description available',
            sprite: getItemSpriteUrl(itemKey),
            fling_power: itemData.fling?.basePower,
            is_choice: itemData.isChoice || false,
            is_competitive: !!(itemData.boosts || itemData.isChoice || 
                             (itemData.fling && itemData.fling.basePower))
          };
          
          allItems.push(item);
        });
        
        // Sort items alphabetically by display name
        allItems.sort((a, b) => a.displayName.localeCompare(b.displayName));
        
        await requestCache.set(cacheKey, allItems);
        setItems(allItems);
        setFilteredItems(allItems);
        setLoadingProgress(100);
      } catch (error) {
        logger.error('Failed to fetch items', { error });
        setItems([]);
        setFilteredItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems();
  }, []);

  // Filter and sort items
  useEffect(() => {
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.short_effect.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLetter) {
      filtered = filtered.filter(item => 
        item.displayName.toUpperCase().startsWith(selectedLetter)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => {
        const category = item.category.toLowerCase();
        // Direct category match since we're now using our own categorization
        return category === selectedCategory;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case 'name':
          comparison = a.displayName.localeCompare(b.displayName);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          if (comparison === 0) {
            comparison = a.displayName.localeCompare(b.displayName);
          }
          break;
        case 'generation':
          if (a.generation !== undefined && b.generation !== undefined) {
            comparison = a.generation - b.generation;
          } else if (a.generation !== undefined) {
            comparison = -1;
          } else if (b.generation !== undefined) {
            comparison = 1;
          } else {
            comparison = a.displayName.localeCompare(b.displayName);
          }
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredItems(filtered);
    setVisibleCount(48); // Reset visible count when filters change
  }, [searchTerm, selectedCategory, selectedLetter, sortOption, sortDirection, items]);

  // Lazy loading with intersection observer
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && visibleCount < filteredItems.length) {
      setVisibleCount(prev => Math.min(prev + 48, filteredItems.length));
    }
  }, [inView, visibleCount, filteredItems.length]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  // Generate alphabet array
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Items Collection | DexTrends</title>
        <meta name="description" content="Browse the complete collection of Pokemon items, berries, and hold items" />
      </Head>

      {/* Header */}
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-1 tracking-tight">
                Items
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Browse Pokemon items and equipment
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
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {loading ? '...' : items.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                items
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
            {/* Search Bar */}
            <div className="relative mb-6">
              <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg z-10" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${createGlassStyle({
                  blur: 'md',
                  opacity: 'medium',
                  gradient: false,
                  border: 'medium',
                  shadow: 'md',
                  rounded: 'full'
                })} w-full pl-12 pr-4 py-4 rounded-full text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-300 transition-all duration-300`}
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
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
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
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/30 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 hover:bg-white/50'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting Options and View Mode */}
            <div className="mb-4 p-3 bg-white/20 dark:bg-gray-800/20 rounded-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Sort:</p>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="px-3 py-1 text-xs bg-white/30 dark:bg-gray-700/30 rounded-lg border border-white/20 dark:border-gray-600/20 text-gray-700 dark:text-gray-300"
                  >
                    <option value="name">Name</option>
                    <option value="category">Category</option>
                    <option value="generation">Generation</option>
                  </select>
                  <button
                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-1 bg-white/30 dark:bg-gray-700/30 rounded-lg border border-white/20 dark:border-gray-600/20 text-gray-700 dark:text-gray-300 hover:bg-white/50 transition-all"
                  >
                    {sortDirection === 'asc' ? <BsSortUp className="text-sm" /> : <BsSortDown className="text-sm" />}
                  </button>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/30 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 hover:bg-white/50'
                    }`}
                  >
                    <BsGrid3X3 className="text-sm" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/30 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 hover:bg-white/50'
                    }`}
                  >
                    <BsList className="text-sm" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-3">
              {ITEM_CATEGORIES.map(category => (
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

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {visibleItems.length} of {filteredItems.length} items
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {loadingProgress > 0 && (
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
                    <span>Loading items...</span>
                    <span className="text-purple-500 font-medium">{loadingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`${createGlassStyle({
                  blur: 'lg',
                  opacity: 'subtle',
                  gradient: true,
                  border: 'subtle',
                  shadow: 'md',
                  rounded: 'xl'
                })} h-32 animate-pulse rounded-2xl`}>
                  <div className="h-full bg-gradient-to-br from-white/10 to-purple-100/10 dark:from-gray-700/10 dark:to-purple-700/10 rounded-2xl" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Items Grid/List */}
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  ref={containerRef}
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
                  data-testid="items-grid"
                >
                  {visibleItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(index * 0.01, 0.3) }}
                    >
                      <div 
                        className={`${createGlassStyle({
                          blur: 'lg',
                          opacity: 'medium',
                          gradient: true,
                          border: 'medium',
                          shadow: 'md',
                          rounded: 'xl',
                          hover: 'lift'
                        })} group cursor-pointer h-full flex flex-col items-center justify-center p-4 rounded-2xl`}
                      >
                        <div className="relative w-16 h-16 mb-2">
                          <img 
                            src={item.sprite} 
                            alt={item.displayName}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              // Fallback to PokeAPI sprite URL
                              const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name}.png`;
                              if (target.src !== fallbackUrl) {
                                target.src = fallbackUrl;
                              } else {
                                // If both fail, show placeholder
                                target.style.display = 'none';
                                const placeholder = document.createElement('div');
                                placeholder.className = 'w-full h-full rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center';
                                placeholder.innerHTML = '<span class="text-lg text-gray-500 dark:text-gray-400 font-bold">?</span>';
                                target.parentElement?.appendChild(placeholder);
                              }
                            }}
                          />
                        </div>
                        <h3 className="text-sm font-semibold text-center text-gray-800 dark:text-gray-200 line-clamp-1">
                          {item.displayName}
                        </h3>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {item.is_competitive && (
                            <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
                              Comp
                            </span>
                          )}
                          {item.generation && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Gen {item.generation}
                            </span>
                          )}
                        </div>
                        
                        {/* Enhanced Hover Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-3 backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-2xl border border-white/30 dark:border-gray-700/30 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-10">
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">{item.short_effect}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 capitalize">{item.category.replace(/-/g, ' ')}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  ref={containerRef}
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {visibleItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(index * 0.01, 0.3) }}
                    >
                      <div className={`${createGlassStyle({
                        blur: 'lg',
                        opacity: 'medium',
                        gradient: true,
                        border: 'medium',
                        shadow: 'md',
                        rounded: 'xl',
                        hover: 'subtle'
                      })} p-4 rounded-xl`}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 flex-shrink-0 relative">
                            <img 
                              src={item.sprite} 
                              alt={item.displayName} 
                              className="w-full h-full object-contain"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                // Fallback to PokeAPI sprite URL
                                const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name}.png`;
                                if (target.src !== fallbackUrl) {
                                  target.src = fallbackUrl;
                                } else {
                                  // If both fail, show placeholder
                                  target.style.display = 'none';
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'w-full h-full rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center';
                                  placeholder.innerHTML = '<span class="text-xs text-gray-500 dark:text-gray-400 font-bold">?</span>';
                                  target.parentElement?.appendChild(placeholder);
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-800 dark:text-gray-200">{item.displayName}</h3>
                              {item.is_competitive && (
                                <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
                                  Competitive
                                </span>
                              )}
                              {item.is_choice && (
                                <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full">
                                  Choice
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{item.short_effect}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 capitalize">{item.category.replace(/-/g, ' ')}</p>
                            {item.generation && (
                              <p className="text-xs text-gray-400">Gen {item.generation}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Load More Trigger */}
            {visibleCount < filteredItems.length && (
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Loading more items... ({visibleCount}/{filteredItems.length})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll to Top Button */}
            {visibleCount > 96 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 flex justify-center"
              >
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setVisibleCount(48);
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

export default ItemsPage;