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
import { BsSearch, BsGrid3X3, BsList } from 'react-icons/bs';
import { FiX } from 'react-icons/fi';
import { fetchJSON } from '../../utils/unifiedFetch';
import { requestCache } from '../../utils/UnifiedCacheManager';

interface Item {
  id: number;
  name: string;
  category: string;
  cost: number;
  effect: string;
  short_effect: string;
  sprite: string;
  attributes: string[];
  fling_power?: number;
  fling_effect?: string;
}

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
  { key: 'holdable', name: 'Hold Items', color: 'from-blue-400 to-indigo-500' },
  { key: 'evolution', name: 'Evolution', color: 'from-purple-400 to-violet-500' },
  { key: 'treasures', name: 'Treasures', color: 'from-yellow-400 to-amber-500' },
];

const ItemsPage: NextPage = () => {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(36);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const fetchAllItems = async () => {
      setLoading(true);
      
      try {
        const cacheKey = 'all-items-data';
        const cached = await requestCache.get(cacheKey);
        
        if (cached) {
          setItems(cached);
          setFilteredItems(cached);
          setLoading(false);
          return;
        }

        const response = await fetchJSON<{ results: Array<{ name: string; url: string }> }>(
          'https://pokeapi.co/api/v2/item?limit=2200'
        );
        
        if (!response?.results) {
          throw new Error('Failed to fetch items list');
        }

        const batchSize = 50;
        const allItems: Item[] = [];
        
        for (let i = 0; i < response.results.length; i += batchSize) {
          const batch = response.results.slice(i, i + batchSize);
          const batchPromises = batch.map(async (item) => {
            try {
              const itemData = await fetchJSON<ItemApiResponse>(item.url);
              if (!itemData) return null;
              
              const englishEntry = itemData.effect_entries?.find(e => e.language.name === 'en');
              
              return {
                id: itemData.id,
                name: itemData.name.replace(/-/g, ' '),
                category: itemData.category.name,
                cost: itemData.cost,
                effect: englishEntry?.effect || '',
                short_effect: englishEntry?.short_effect || 'No description available',
                sprite: itemData.sprites?.default || '',
                attributes: itemData.attributes?.map(a => a.name) || [],
                fling_power: itemData.fling_power,
                fling_effect: itemData.fling_effect?.name
              } as Item;
            } catch (error) {
              logger.error(`Failed to fetch item ${item.name}`, { error });
              return null;
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          allItems.push(...batchResults.filter((item): item is Item => item !== null));
          
          if (i % 100 === 0) {
            setItems([...allItems]);
            setFilteredItems([...allItems]);
            setLoadingProgress(Math.round((i / response.results.length) * 100));
          }
        }
        
        await requestCache.set(cacheKey, allItems);
        setItems(allItems);
        setFilteredItems(allItems);
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

  useEffect(() => {
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.short_effect.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => {
        const category = item.category.toLowerCase();
        const attributes = item.attributes.join(' ').toLowerCase();
        
        switch (selectedCategory) {
          case 'medicine':
            return category.includes('medicine') || category.includes('healing');
          case 'berries':
            return category.includes('berries') || item.name.includes('berry');
          case 'holdable':
            return attributes.includes('holdable') || attributes.includes('held');
          case 'evolution':
            return category.includes('evolution');
          case 'treasures':
            return category.includes('treasure') || category.includes('collectibles');
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => a.name.localeCompare(b.name));
    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, items]);

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Items Collection | DexTrends</title>
        <meta name="description" content="Browse the complete collection of Pokemon items, berries, and hold items" />
      </Head>

      {/* Header */}
      <motion.div 
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 dark:bg-gray-900/5 border-b border-white/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <CircularButton
              onClick={() => router.push('/pokemon')}
              variant="secondary"
              size="sm"
            >
              Back
            </CircularButton>
            
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Items
            </h1>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {loading ? 'Loading...' : `${items.length} items`}
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
          <GlassContainer className="mb-8" padding="lg" rounded="3xl">
            {/* Search Bar */}
            <div className="relative mb-6">
              <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {ITEM_CATEGORIES.map(category => (
                <motion.button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.key
                      ? 'bg-gradient-to-r text-white shadow-lg scale-105'
                      : 'bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                  style={{
                    backgroundImage: selectedCategory === category.key 
                      ? `linear-gradient(to right, var(--tw-gradient-stops))`
                      : undefined,
                    '--tw-gradient-from': selectedCategory === category.key 
                      ? category.color.split(' ')[0].replace('from-', '') 
                      : undefined,
                    '--tw-gradient-to': selectedCategory === category.key 
                      ? category.color.split(' ')[2].replace('to-', '') 
                      : undefined,
                  } as React.CSSProperties}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredItems.length} items
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all ${
                    viewMode === 'grid'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/30 dark:bg-gray-800/30 hover:bg-white/50'
                  }`}
                >
                  <BsGrid3X3 />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all ${
                    viewMode === 'list'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/30 dark:bg-gray-800/30 hover:bg-white/50'
                  }`}
                >
                  <BsList />
                </button>
              </div>
            </div>
          </GlassContainer>
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
                })} p-4 rounded-2xl`}>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Loading items...</span>
                    <span>{loadingProgress}%</span>
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
                  blur: 'md',
                  opacity: 'subtle',
                  gradient: true,
                  border: 'subtle',
                  shadow: 'md',
                  rounded: 'xl'
                })} h-32 animate-pulse rounded-2xl`}>
                  <div className="h-full bg-gradient-to-br from-white/20 to-white/10 dark:from-gray-700/20 dark:to-gray-700/10 rounded-2xl" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Items Grid */}
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
                  data-testid="items-grid"
                >
                  {currentItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
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
                          {item.sprite ? (
                            <img 
                              src={item.sprite} 
                              alt={item.name}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700" />
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-center capitalize text-gray-800 dark:text-gray-200 line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          ${item.cost.toLocaleString()}
                        </p>
                        
                        {/* Enhanced Hover Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-3 backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-2xl border border-white/30 dark:border-gray-700/30 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-10">
                          <p className="text-xs text-gray-600 dark:text-gray-400">{item.short_effect}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {currentItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
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
                          <div className="w-12 h-12 flex-shrink-0">
                            {item.sprite ? (
                              <img src={item.sprite} alt={item.name} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold capitalize text-gray-800 dark:text-gray-200">{item.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{item.short_effect}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">${item.cost.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 capitalize">{item.category.replace(/-/g, ' ')}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

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
                })} inline-flex gap-2 p-2 rounded-full`}>
                <GradientButton
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="secondary"
                  className="rounded-full"
                >
                  ← Previous
                </GradientButton>
                
                <div className="flex gap-1 items-center">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'bg-white/30 dark:bg-gray-800/30 hover:bg-white/50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <GradientButton
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="secondary"
                  className="rounded-full"
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

export default ItemsPage;