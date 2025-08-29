import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { createGlassStyle } from '../ui/design-system/glass-constants';
import { RarityBadge, RarityFilterBar } from './RarityBadge';
import type { TCGCard, CardSet } from '@/types/api/cards';

interface UnifiedSetDashboardProps {
  setInfo: CardSet;
  cards: TCGCard[];
  statistics: {
    rarityDistribution: Record<string, number>;
    valueByRarity: Record<string, { total: number; average: number; count: number }>;
  };
  onCardClick?: (card: TCGCard) => void;
  ownedCards?: Set<string>;
  wishlistCards?: Set<string>;
  onToggleOwned?: (cardId: string) => void;
  onToggleWishlist?: (cardId: string) => void;
}

// Compact metric card component
const MetricCard: React.FC<{
  label: string;
  value: string | number;
  trend?: number;
  sparkline?: number[];
  icon?: React.ReactNode;
  color?: string;
}> = ({ label, value, trend, sparkline, icon, color = 'purple' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative p-3',
        createGlassStyle({
          blur: 'md',
          opacity: 'medium',
          border: 'medium',
          rounded: 'lg',
          shadow: 'sm'
        })
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
          {trend !== undefined && (
            <p className={cn(
              'text-xs mt-1',
              trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'
            )}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            `bg-gradient-to-br from-${color}-400/20 to-${color}-600/20`
          )}>
            {icon}
          </div>
        )}
      </div>
      
      {/* Inline sparkline */}
      {sparkline && sparkline.length > 0 && (
        <div className="mt-2 h-8">
          <svg className="w-full h-full" viewBox={`0 0 ${sparkline.length * 10} 32`}>
            <polyline
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              points={sparkline.map((v, i) => `${i * 10},${32 - (v / Math.max(...sparkline)) * 28}`).join(' ')}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={`rgb(168 85 247)`} />
                <stop offset="100%" stopColor={`rgb(236 72 153)`} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
    </motion.div>
  );
};

// Compact card preview component
const CardPreview: React.FC<{
  card: TCGCard;
  size?: 'xs' | 'sm' | 'md';
  showPrice?: boolean;
  isOwned?: boolean;
  onClick?: () => void;
}> = ({ card, size = 'sm', showPrice = true, isOwned = false, onClick }) => {
  const sizeConfig = {
    xs: { width: 60, height: 84 },
    sm: { width: 80, height: 112 },
    md: { width: 120, height: 168 }
  };
  
  const config = sizeConfig[size];
  const price = card.tcgplayer?.prices
    ? Object.values(card.tcgplayer.prices)[0]?.market || 0
    : 0;
  
  return (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.05, zIndex: 10 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className={cn(
        'relative rounded-lg overflow-hidden',
        'ring-1 ring-gray-200/50 dark:ring-gray-700/50',
        'group-hover:ring-2 group-hover:ring-purple-500/50',
        'transition-all duration-200',
        isOwned && 'ring-2 ring-green-500/50'
      )}>
        <Image
          src={card.images.small}
          alt={card.name}
          width={config.width}
          height={config.height}
          className="object-cover"
          loading="lazy"
        />
        
        {/* Owned indicator */}
        {isOwned && (
          <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Price overlay */}
        {showPrice && price > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-xs font-semibold text-white text-center">
              ${price.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const UnifiedSetDashboard: React.FC<UnifiedSetDashboardProps> = ({
  setInfo,
  cards,
  statistics,
  onCardClick,
  ownedCards = new Set(),
  wishlistCards = new Set(),
  onToggleOwned,
  onToggleWishlist
}) => {
  const [collectionMode, setCollectionMode] = useState(false);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Calculate key metrics
  const totalValue = useMemo(() => {
    return cards.reduce((sum, card) => {
      const price = card.tcgplayer?.prices
        ? Object.values(card.tcgplayer.prices)[0]?.market || 0
        : 0;
      return sum + price;
    }, 0);
  }, [cards]);
  
  const topCards = useMemo(() => {
    return [...cards]
      .sort((a, b) => {
        const priceA = a.tcgplayer?.prices ? Object.values(a.tcgplayer.prices)[0]?.market || 0 : 0;
        const priceB = b.tcgplayer?.prices ? Object.values(b.tcgplayer.prices)[0]?.market || 0 : 0;
        return priceB - priceA;
      })
      .slice(0, 10);
  }, [cards]);
  
  const availableRarities = useMemo(() => {
    return [...new Set(cards.map(c => c.rarity).filter(Boolean))] as string[];
  }, [cards]);
  
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      if (selectedRarity && card.rarity !== selectedRarity) return false;
      if (searchQuery && !card.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [cards, selectedRarity, searchQuery]);
  
  const completionPercentage = (ownedCards.size / cards.length) * 100;
  
  return (
    <div className="relative min-h-screen">
      {/* Compact Header Section */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-900/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Set Info */}
            <div className="flex items-center gap-3">
              {setInfo.images?.symbol && (
                <Image
                  src={setInfo.images.symbol}
                  alt={setInfo.name}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{setInfo.name}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {setInfo.series} • {cards.length} cards
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Collection Mode Toggle */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setCollectionMode(!collectionMode)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  collectionMode
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {collectionMode ? 'Exit Collection' : 'Collection Mode'}
              </motion.button>
              
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'px-2 py-1 rounded-md text-xs transition-all duration-200',
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'px-2 py-1 rounded-md text-xs transition-all duration-200',
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  List
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress Bar for Collection */}
          {collectionMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>{ownedCards.size} / {cards.length} owned</span>
                <span>{completionPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <MetricCard
            label="Total Value"
            value={`$${totalValue.toFixed(2)}`}
            trend={5.2}
            sparkline={[20, 22, 19, 24, 28, 26, 30]}
            color="green"
          />
          <MetricCard
            label="Avg. Price"
            value={`$${(totalValue / cards.length).toFixed(2)}`}
            trend={-1.3}
            color="blue"
          />
          <MetricCard
            label="Chase Cards"
            value={topCards.filter(c => {
              const price = c.tcgplayer?.prices ? Object.values(c.tcgplayer.prices)[0]?.market || 0 : 0;
              return price > 50;
            }).length}
            color="purple"
          />
          <MetricCard
            label="Rarities"
            value={availableRarities.length}
            color="pink"
          />
          <MetricCard
            label="Collection"
            value={`${completionPercentage.toFixed(0)}%`}
            trend={collectionMode ? 2.1 : undefined}
            color="emerald"
          />
          <MetricCard
            label="Wishlist"
            value={wishlistCards.size}
            color="amber"
          />
        </div>
        
        {/* Top Cards Showcase Strip */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top Value Cards</h2>
            <button className="text-xs text-purple-500 hover:text-purple-600 transition-colors">
              View All →
            </button>
          </div>
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {topCards.map((card, index) => (
                <CardPreview
                  key={card.id}
                  card={card}
                  size="md"
                  isOwned={ownedCards.has(card.id)}
                  onClick={() => onCardClick?.(card)}
                />
              ))}
            </div>
            {/* Fade edges for scroll indication */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none" />
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="mb-6 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full px-4 py-2 pl-10 text-sm rounded-xl',
                'bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg',
                'border border-gray-200/50 dark:border-gray-700/50',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
                'placeholder-gray-400 dark:placeholder-gray-500'
              )}
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Rarity Filter */}
          <RarityFilterBar
            selectedRarity={selectedRarity}
            onRaritySelect={setSelectedRarity}
            availableRarities={availableRarities}
          />
        </div>
        
        {/* Cards Grid/List */}
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2'
            : 'space-y-2'
        )}>
          {filteredCards.map(card => (
            viewMode === 'grid' ? (
              <CardPreview
                key={card.id}
                card={card}
                size="sm"
                isOwned={ownedCards.has(card.id)}
                onClick={() => {
                  if (collectionMode) {
                    onToggleOwned?.(card.id);
                  } else {
                    onCardClick?.(card);
                  }
                }}
              />
            ) : (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg',
                  createGlassStyle({
                    blur: 'sm',
                    opacity: 'subtle',
                    border: 'subtle',
                    rounded: 'lg',
                    shadow: 'sm'
                  }),
                  'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors'
                )}
                onClick={() => {
                  if (collectionMode) {
                    onToggleOwned?.(card.id);
                  } else {
                    onCardClick?.(card);
                  }
                }}
              >
                <CardPreview
                  card={card}
                  size="xs"
                  showPrice={false}
                  isOwned={ownedCards.has(card.id)}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{card.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <RarityBadge rarity={card.rarity || 'Common'} size="xs" />
                    <span className="text-xs text-gray-500">#{card.number}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${card.tcgplayer?.prices ? Object.values(card.tcgplayer.prices)[0]?.market?.toFixed(2) || '0.00' : '0.00'}
                  </p>
                </div>
              </motion.div>
            )
          ))}
        </div>
      </div>
      
      {/* Floating Collection Toolbar */}
      <AnimatePresence>
        {collectionMode && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40"
          >
            <div className={cn(
              'p-4 rounded-2xl shadow-2xl',
              createGlassStyle({
                blur: 'xl',
                opacity: 'strong',
                border: 'strong',
                rounded: 'xl',
                shadow: 'xl'
              }),
              'bg-gradient-to-r from-green-50/90 to-emerald-50/90 dark:from-green-900/30 dark:to-emerald-900/30'
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Collection Progress
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {ownedCards.size} owned • {wishlistCards.size} wishlist
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
                    Export
                  </button>
                  <button
                    onClick={() => setCollectionMode(false)}
                    className="px-3 py-1.5 bg-red-500/20 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnifiedSetDashboard;