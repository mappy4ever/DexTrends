import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import BottomSheet from '../mobile/BottomSheet';
import hapticFeedback from '../../utils/hapticFeedback';
import { fetchShowdownItems, getItemSpriteUrl, getItemCategory } from '../../utils/showdownData';
import { requestCache } from '../../utils/UnifiedCacheManager';
import logger from '../../utils/logger';
import { useDebounce } from '../../hooks/useDebounce';

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
  { key: 'all', name: 'All', icon: '📦', color: 'from-gray-400 to-gray-500' },
  { key: 'medicine', name: 'Medicine', icon: '💊', color: 'from-green-400 to-emerald-500' },
  { key: 'berries', name: 'Berries', icon: '🍓', color: 'from-red-400 to-pink-500' },
  { key: 'holdable', name: 'Competitive', icon: '⚔️', color: 'from-blue-400 to-indigo-500' },
  { key: 'evolution', name: 'Evolution', icon: '✨', color: 'from-purple-400 to-violet-500' },
  { key: 'mega-stones', name: 'Mega Stones', icon: '💎', color: 'from-red-500 to-pink-600' },
  { key: 'z-crystals', name: 'Z-Crystals', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  { key: 'treasures', name: 'Treasures', icon: '💰', color: 'from-yellow-400 to-amber-500' },
];

const MobileItemsPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch items on mount
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

        const showdownItems = await fetchShowdownItems();
        
        if (!showdownItems || Object.keys(showdownItems).length === 0) {
          throw new Error('Failed to fetch items from Showdown');
        }

        const allItems: Item[] = [];
        
        for (const [itemName, itemData] of Object.entries(showdownItems)) {
          if (!itemData || typeof itemData !== 'object') continue;
          
          const category = getItemCategory(itemName, itemData);
          
          // Filter out useless items
          const isUseful = category !== 'misc' && 
                          !itemName.includes('mail') && 
                          !itemName.includes('fossil') &&
                          itemData.desc && 
                          itemData.desc.length > 10;
          
          if (!isUseful) continue;
          
          allItems.push({
            id: allItems.length + 1,
            name: itemName,
            displayName: itemData.name || itemName.replace(/-/g, ' '),
            category: category,
            generation: itemData.gen || 1,
            effect: itemData.desc || '',
            short_effect: itemData.shortDesc || itemData.desc || '',
            sprite: getItemSpriteUrl(itemName),
            fling_power: itemData.fling?.basePower,
            is_choice: itemName.includes('choice'),
            is_competitive: category === 'holdable' || category === 'berries'
          });
        }
        
        const sortedItems = allItems.sort((a, b) => a.displayName.localeCompare(b.displayName));
        
        await requestCache.set(cacheKey, sortedItems); // Will use default TTL
        setItems(sortedItems);
        setFilteredItems(sortedItems);
      } catch (error) {
        logger.error('Failed to fetch items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems();
  }, []);

  // Filter items
  useEffect(() => {
    let filtered = [...items];
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(item => 
        item.displayName.toLowerCase().includes(searchLower) ||
        item.effect.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredItems(filtered);
  }, [items, selectedCategory, debouncedSearch]);

  // Handle item selection
  const handleItemPress = useCallback((item: Item) => {
    hapticFeedback.light();
    setSelectedItem(item);
  }, []);

  // Item card component
  const ItemCard = useCallback(({ item }: { item: Item }) => (
    <motion.div
      className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20"
      whileTap={{ scale: 0.98 }}
      onClick={() => handleItemPress(item)}
    >
      <div className="flex items-center space-x-3">
        <div className="relative w-12 h-12 bg-white/10 rounded-lg p-1">
          <Image
            src={item.sprite}
            alt={item.displayName}
            fill
            className="object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/items/default.png';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm capitalize truncate">
            {item.displayName}
          </h3>
          <p className="text-xs text-white/60 line-clamp-2">
            {item.short_effect}
          </p>
        </div>
        {item.is_competitive && (
          <div className="px-2 py-1 bg-blue-500/20 rounded-full">
            <span className="text-xs text-blue-300">Competitive</span>
          </div>
        )}
      </div>
    </motion.div>
  ), [handleItemPress]);

  // Category filter chip
  const CategoryChip = ({ category }: { category: typeof ITEM_CATEGORIES[0] }) => (
    <motion.button
      className={`px-4 py-2 rounded-full flex items-center space-x-2 whitespace-nowrap ${
        selectedCategory === category.key
          ? 'bg-gradient-to-r text-white'
          : 'bg-white/10 text-white/70'
      }`}
      style={{
        backgroundImage: selectedCategory === category.key 
          ? `linear-gradient(to right, var(--tw-gradient-stops))` 
          : undefined
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        hapticFeedback.light();
        setSelectedCategory(category.key);
      }}
    >
      <span className="text-lg">{category.icon}</span>
      <span className="text-sm font-medium">{category.name}</span>
    </motion.button>
  );

  return (
    <div className="mobile-items-page min-h-screen pb-20">
      {/* Sticky Header with Search */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-sm">
        <div className="px-4 py-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
                onClick={() => {
                  setSearchTerm('');
                  searchInputRef.current?.focus();
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Category Filters - Horizontal Scroll */}
          <div className="mt-3 -mx-4 px-4">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
              {ITEM_CATEGORIES.map(category => (
                <CategoryChip key={category.key} category={category} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="px-4 pb-2 text-xs text-white/60">
          {loading ? 'Loading items...' : `${filteredItems.length} items found`}
        </div>
      </div>

      {/* Items Grid */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="grid gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl h-20 animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid gap-3">
            {filteredItems.slice(0, 100).map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-white/60">No items found</p>
            {searchTerm && (
              <p className="text-sm text-white/40 mt-2">
                Try adjusting your search or filters
              </p>
            )}
          </div>
        )}
      </div>

      {/* Item Detail Bottom Sheet */}
      <BottomSheet
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.displayName || ''}
      >
        {selectedItem && (
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 bg-white/10 rounded-xl p-2">
                <Image
                  src={selectedItem.sprite}
                  alt={selectedItem.displayName}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold capitalize">{selectedItem.displayName}</h2>
                <p className="text-sm text-white/60 capitalize">{selectedItem.category}</p>
                {selectedItem.generation && (
                  <p className="text-xs text-white/40">Gen {selectedItem.generation}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-white/60 mb-1">Effect</h3>
                <p className="text-sm">{selectedItem.effect}</p>
              </div>
              
              {selectedItem.fling_power && (
                <div>
                  <h3 className="font-semibold text-sm text-white/60 mb-1">Fling Power</h3>
                  <p className="text-sm">{selectedItem.fling_power}</p>
                </div>
              )}
              
              {selectedItem.is_competitive && (
                <div className="flex items-center space-x-2 p-3 bg-blue-500/20 rounded-lg">
                  <span className="text-blue-400">⚔️</span>
                  <span className="text-sm">Commonly used in competitive battles</span>
                </div>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default MobileItemsPage;