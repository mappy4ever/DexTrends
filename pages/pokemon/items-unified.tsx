import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { CircularButton } from '../../components/ui/design-system';
import { createGlassStyle } from '../../components/ui/design-system/glass-constants';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import logger from '../../utils/logger';
import { fetchShowdownItems, getItemSpriteUrl, getItemCategory, ShowdownItem } from '../../utils/showdownData';
import { requestCache } from '../../utils/UnifiedCacheManager';
import { UnifiedDataTable, Column } from '../../components/unified/UnifiedDataTable';
import { cn } from '@/utils/cn';

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
  
  const glassStyle = createGlassStyle({
    blur: '2xl',
    opacity: 'medium',
    gradient: true,
    border: 'subtle',
    shadow: 'lg',
    rounded: 'sm'
  });

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
        <div className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
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
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 line-clamp-2">
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

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Items Collection | DexTrends</title>
        <meta name="description" content="Browse the complete collection of Pokemon items, berries, and hold items" />
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
                Items
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 hidden sm:block">
                Browse Pokemon items and equipment
              </p>
            </div>
            
            <div className={cn(
              createGlassStyle({ blur: 'sm', opacity: 'subtle' }),
              'px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-center'
            )}>
              <div className="text-sm sm:text-lg font-bold text-amber-600 dark:text-amber-400">
                {filteredItems.length}
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Items</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Filter - Responsive scrollable */}
      <div className="sticky top-[73px] sm:top-[89px] z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-200 dark:border-stone-700">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {ITEM_CATEGORIES.map(category => (
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

      {/* Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
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
    </FullBleedWrapper>
  );
};

export default UnifiedItemsPage;