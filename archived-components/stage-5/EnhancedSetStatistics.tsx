import React from 'react';
import { motion } from 'framer-motion';
import { GlassContainer } from './design-system/GlassContainer';
import { cn } from '@/utils/cn';
import type { TCGCard } from '@/types/api/cards';

interface CardWithMarketPrice extends TCGCard {
  marketPrice: number;
}

interface SetStatistics {
  rarityDistribution: Record<string, number>;
  valueByRarity: Record<string, { total: number; average: number; count: number }>;
  highestValueCards: CardWithMarketPrice[];
}

interface EnhancedSetStatisticsProps {
  statistics: SetStatistics;
  totalCards: number;
  onCardClick?: (card: TCGCard) => void;
  className?: string;
}

export const EnhancedSetStatistics: React.FC<EnhancedSetStatisticsProps> = ({
  statistics,
  totalCards,
  onCardClick,
  className
}) => {
  const totalValue = statistics.valueByRarity 
    ? Object.values(statistics.valueByRarity).reduce((sum, rarity) => sum + rarity.total, 0) 
    : 0;

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    const lower = rarity.toLowerCase();
    if (lower.includes('secret')) return 'from-purple-400 to-pink-400';
    if (lower.includes('rainbow')) return 'from-red-400 via-yellow-400 to-purple-400';
    if (lower.includes('ultra')) return 'from-purple-300 to-pink-300';
    if (lower.includes('holo')) return 'from-blue-300 to-purple-300';
    if (lower.includes('rare')) return 'from-blue-200 to-blue-300';
    if (lower.includes('uncommon')) return 'from-green-200 to-green-300';
    return 'from-gray-200 to-gray-300';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rarity Distribution */}
        <GlassContainer
          variant="dark"
          blur="lg"
          rounded="3xl"
          hover
          className="relative overflow-hidden"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-pink-100/20" />
          
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              Rarity Distribution
            </h3>
            
            <div className="space-y-3">
              {Object.entries(statistics.rarityDistribution || {})
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([rarity, count], index) => (
                  <motion.div
                    key={rarity}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rarity}</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / totalCards) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.05 }}
                        className={cn(
                          'h-full rounded-full bg-gradient-to-r',
                          getRarityColor(rarity)
                        )}
                      />
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </GlassContainer>

        {/* Value by Rarity */}
        <GlassContainer
          variant="dark"
          blur="lg"
          rounded="3xl"
          hover
          className="relative overflow-hidden"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 via-transparent to-emerald-100/20" />
          
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">$</span>
              </div>
              Average Value
            </h3>
            
            <div className="space-y-3">
              {Object.entries(statistics.valueByRarity || {})
                .sort(([,a], [,b]) => b.average - a.average)
                .slice(0, 6)
                .map(([rarity, data], index) => (
                  <motion.div
                    key={rarity}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex justify-between items-center p-2 rounded-xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rarity}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">({data.count})</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        ${data.average.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </GlassContainer>

        {/* Set Summary */}
        <GlassContainer
          variant="dark"
          blur="lg"
          rounded="3xl"
          hover
          className="relative overflow-hidden"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-indigo-100/20" />
          
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Set Overview
            </h3>
            
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-2xl bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-blue-900/30 dark:to-purple-900/30 backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {totalCards}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Cards</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-3 rounded-2xl bg-gradient-to-r from-green-100/50 to-emerald-100/50 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${totalValue.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Market Value</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-3 rounded-2xl bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/30 dark:to-pink-900/30 backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  ${totalCards > 0 ? (totalValue / totalCards).toFixed(2) : '0.00'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Average Card Value</div>
              </motion.div>
            </div>
          </div>
        </GlassContainer>
      </div>

      {/* Highest Value Cards */}
      {statistics.highestValueCards.length > 0 && (
        <GlassContainer
          variant="dark"
          blur="lg"
          rounded="3xl"
          className="relative overflow-hidden"
        >
          {/* Premium gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/10 via-transparent to-amber-100/10" />
          
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 flex items-center justify-center animate-pulse">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              Most Valuable Cards
            </h3>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {statistics.highestValueCards.slice(0, 8).map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <div 
                    className="rounded-2xl overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-white/30 dark:border-gray-700/30 transform hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl"
                    onClick={() => onCardClick?.(card)}
                  >
                    {/* Rank Badge */}
                    <div className="absolute top-1 left-1 z-10">
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white',
                        index === 0 && 'bg-gradient-to-r from-yellow-400 to-amber-500',
                        index === 1 && 'bg-gradient-to-r from-gray-300 to-gray-400',
                        index === 2 && 'bg-gradient-to-r from-orange-400 to-orange-600',
                        index > 2 && 'bg-gradient-to-r from-purple-400 to-purple-600'
                      )}>
                        {index + 1}
                      </div>
                    </div>
                    
                    <img 
                      src={card.images.small} 
                      alt={card.name}
                      className="w-full h-auto"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                  
                  <div className="mt-2 text-center">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate px-1">
                      {card.name}
                    </p>
                    <p className="text-xs font-bold text-green-600 dark:text-green-400">
                      ${card.marketPrice.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassContainer>
      )}
    </div>
  );
};

export default EnhancedSetStatistics;