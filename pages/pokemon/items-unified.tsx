import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import logger from '../../utils/logger';
import { fetchShowdownItems, getItemSpriteUrl, getItemCategory, ShowdownItem } from '../../utils/showdownData';
import { requestCache } from '../../utils/UnifiedCacheManager';
import { UnifiedDataTable, Column } from '../../components/unified/UnifiedDataTable';
import { cn } from '@/utils/cn';
import { FiChevronLeft, FiPackage, FiHeart, FiZap, FiStar } from 'react-icons/fi';

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

const ITEM_CATEGORIES = [
  { key: 'all', name: 'All', color: 'from-stone-400 to-stone-500' },
  { key: 'medicine', name: 'Medicine', color: 'from-green-400 to-emerald-500' },
  { key: 'berries', name: 'Berries', color: 'from-red-400 to-pink-500' },
  { key: 'holdable', name: 'Competitive', color: 'from-amber-400 to-amber-500' },
  { key: 'evolution', name: 'Evolution', color: 'from-amber-400 to-amber-500' },
  { key: 'mega-stones', name: 'Mega Stones', color: 'from-red-500 to-pink-600' },
  { key: 'z-crystals', name: 'Z-Crystals', color: 'from-yellow-500 to-orange-500' },
  { key: 'treasures', name: 'Treasures', color: 'from-yellow-400 to-amber-500' },
];

/**
 * Unified Items Page
 * 
 * Features:
 * - Single responsive component for all viewports
 * - UnifiedDataTable with card/table views
 * - Virtual scrolling for performance
 * - Smart column prioritization
 * - No conditional mobile/desktop rendering
 */
const UnifiedItemsPage: NextPage = () => {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchAllItems = async () => {
      setLoading(true);
      
      try {
        const cacheKey = 'showdown-items-data';
        const cached = await requestCache.get(cacheKey);
        
        if (cached) {
          setItems(cached);
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
      } catch (error) {
        logger.error('Failed to fetch items', { error });
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems();
  }, []);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') {
      return items;
    }
    return items.filter(item => item.category.toLowerCase() === selectedCategory);
  }, [items, selectedCategory]);

  // Define columns for UnifiedDataTable
  const columns: Column<Item>[] = [
    {
      key: 'sprite',
      label: 'Item',
      priority: 'primary',
      sortable: false,
      renderCell: (item: Item) => (
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
            <img 
              src={item.sprite} 
              alt={item.displayName}
              className="w-full h-full object-contain pixelated"
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-stone-900 dark:text-white truncate">
              {item.displayName}
            </div>
            {item.is_competitive && (
              <span className="inline-block text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded mt-0.5">
                Competitive
              </span>
            )}
          </div>
        </div>
      ),
      width: 'auto'
    },
    {
      key: 'category',
      label: 'Category',
      priority: 'secondary',
      sortable: true,
      renderCell: (item: Item) => {
        const categoryInfo = ITEM_CATEGORIES.find(c => c.key === item.category.toLowerCase());
        return (
          <span className={cn(
            'inline-block px-2 py-1 rounded-full text-xs font-medium',
            'bg-gradient-to-r text-white',
            categoryInfo ? `${categoryInfo.color}` : 'from-stone-400 to-stone-500'
          )}>
            {item.category}
          </span>
        );
      }
    },
    {
      key: 'short_effect',
      label: 'Effect',
      priority: 'detail',
      sortable: false,
      renderCell: (item: Item) => (
        <div className="text-sm text-stone-600 dark:text-stone-300 line-clamp-2">
          {item.short_effect}
        </div>
      ),
      width: '40%'
    },
    {
      key: 'generation',
      label: 'Gen',
      priority: 'detail',
      sortable: true,
      align: 'center',
      renderCell: (item: Item) => item.generation ? (
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {item.generation}
        </span>
      ) : '-'
    },
    {
      key: 'fling_power',
      label: 'Fling',
      priority: 'detail',
      sortable: true,
      align: 'center',
      renderCell: (item: Item) => item.fling_power ? (
        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
          {item.fling_power}
        </span>
      ) : '-'
    }
  ];

  // Custom card renderer for mobile view
  const renderMobileCard = (item: Item) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-stone-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
    >
      <div className="flex gap-3">
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-stone-100 dark:bg-stone-700 rounded-lg">
          <img 
            src={item.sprite} 
            alt={item.displayName}
            className="w-12 h-12 object-contain pixelated"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 dark:text-white truncate">
            {item.displayName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {ITEM_CATEGORIES.find(c => c.key === item.category.toLowerCase()) && (
              <span className={cn(
                'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                'bg-gradient-to-r text-white',
                ITEM_CATEGORIES.find(c => c.key === item.category.toLowerCase())?.color
              )}>
                {item.category}
              </span>
            )}
            {item.is_competitive && (
              <span className="text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded">
                Competitive
              </span>
            )}
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 line-clamp-2">
            {item.short_effect}
          </p>
          <div className="flex gap-4 mt-2 text-xs text-stone-500 dark:text-stone-500">
            {item.generation && (
              <span>Gen {item.generation}</span>
            )}
            {item.fling_power && (
              <span className="text-orange-600 dark:text-orange-400">
                Fling: {item.fling_power}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Calculate stats
  const stats = useMemo(() => ({
    total: items.length,
    medicine: items.filter(i => i.category === 'medicine').length,
    competitive: items.filter(i => i.is_competitive).length,
    berries: items.filter(i => i.category === 'berries').length,
  }), [items]);

  return (
    <>
      <Head>
        <title>Items Database | DexTrends</title>
        <meta name="description" content="Browse the complete collection of Pokemon items, berries, and hold items" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-pink-50 dark:from-stone-950 dark:via-stone-900 dark:to-amber-950">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-30 dark:opacity-20">
            <div className="absolute top-10 left-10 w-64 h-64 bg-amber-400 rounded-full blur-3xl" />
            <div className="absolute top-20 right-20 w-48 h-48 bg-pink-400 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-red-400 rounded-full blur-3xl" />
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
                <span className="bg-gradient-to-r from-amber-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                  Items Database
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto"
              >
                Explore all Pokémon items, hold items, and equipment
              </motion.p>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-4 sm:gap-8 mb-4"
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{stats.total}</div>
                <div className="text-xs sm:text-sm text-stone-500">Total</div>
              </div>
              <div className="w-px bg-stone-300 dark:bg-stone-600" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-green-600 dark:text-green-400">{stats.medicine}</div>
                <div className="text-xs sm:text-sm text-stone-500">Medicine</div>
              </div>
              <div className="w-px bg-stone-300 dark:bg-stone-600" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">{stats.competitive}</div>
                <div className="text-xs sm:text-sm text-stone-500">Competitive</div>
              </div>
              <div className="w-px bg-stone-300 dark:bg-stone-600" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">{stats.berries}</div>
                <div className="text-xs sm:text-sm text-stone-500">Berries</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Sticky Category Filter */}
        <div className="sticky top-14 md:top-16 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border-b border-stone-200 dark:border-stone-700">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {ITEM_CATEGORIES.map(category => (
                <motion.button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-all',
                    selectedCategory === category.key
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  )}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="container mx-auto px-4 py-3">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Showing <span className="font-semibold text-stone-700 dark:text-stone-200">{filteredItems.length}</span> items
            {selectedCategory !== 'all' && ` in ${ITEM_CATEGORIES.find(c => c.key === selectedCategory)?.name}`}
          </p>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pb-8">
          <UnifiedDataTable
            data={filteredItems}
            columns={columns}
            loading={loading}
            virtualize={true}
            itemHeight={80}
            searchable={true}
            searchPlaceholder="Search items by name or effect..."
            getItemKey={(item) => item.id.toString()}
            renderMobileCard={renderMobileCard}
          />
        </div>
      </div>
    </>
  );
};

// Full bleed layout
(UnifiedItemsPage as NextPage & { fullBleed?: boolean }).fullBleed = true;

export default UnifiedItemsPage;