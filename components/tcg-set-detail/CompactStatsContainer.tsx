import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { createGlassStyle } from '../ui/design-system/glass-constants';
import { UnifiedStatsGraph } from './UnifiedStatsGraph';
import { CardShowcase } from './CardShowcase';
import type { TCGCard } from '@/types/api/cards';

interface CompactStatsContainerProps {
  cards: TCGCard[];
  rarityDistribution: Record<string, number>;
  valueByRarity: Record<string, { total: number; average: number; count: number }>;
  highestValueCards: TCGCard[];
  getPrice: (card: TCGCard) => number;
  onCardClick?: (card: TCGCard) => void;
}

export const CompactStatsContainer: React.FC<CompactStatsContainerProps> = ({
  cards,
  rarityDistribution,
  valueByRarity,
  highestValueCards,
  getPrice,
  onCardClick
}) => {
  if (!cards || cards.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        createGlassStyle({
          blur: 'xl',
          opacity: 'medium',
          gradient: true,
          border: 'medium',
          rounded: 'xl',
          shadow: 'xl'
        }),
        'p-6 md:p-8 mb-8 relative overflow-hidden'
      )}
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/5 via-transparent to-blue-100/5 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Set Insights
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Quick overview of set statistics and top cards
              </p>
            </div>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Live data</span>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Statistics Graph */}
          <div className={cn(
            'rounded-xl p-4',
            createGlassStyle({
              blur: 'md',
              opacity: 'subtle',
              border: 'subtle',
              rounded: 'lg'
            })
          )}>
            <UnifiedStatsGraph
              cards={cards}
              rarityDistribution={rarityDistribution}
              valueByRarity={valueByRarity}
              getPrice={getPrice}
            />
          </div>
          
          {/* Right: Most Valuable Cards */}
          <div className={cn(
            'rounded-xl p-4',
            createGlassStyle({
              blur: 'md',
              opacity: 'subtle',
              border: 'subtle',
              rounded: 'lg'
            })
          )}>
            <CardShowcase
              cards={highestValueCards.slice(0, 5)}
              title="Top Value Cards"
              getPrice={getPrice}
              onCardClick={onCardClick}
            />
          </div>
        </div>
        
        {/* Bottom Stats Bar */}
        <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Cards */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {cards.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Cards</div>
            </div>
            
            {/* Unique Rarities */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {Object.keys(rarityDistribution).length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Rarities</div>
            </div>
            
            {/* Valuable Cards (>$10) */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {cards.filter(card => getPrice(card) > 10).length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Cards &gt;$10</div>
            </div>
            
            {/* Premium Cards (>$50) */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {cards.filter(card => getPrice(card) > 50).length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Premium Cards</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CompactStatsContainer;