import React, { useMemo } from 'react';
import Image from 'next/image';
import { GlassContainer } from '../../ui/design-system/GlassContainer';
import MarketAnalytics from '../../MarketAnalytics';
import CollectionTracker from '../../ui/CollectionTracker';
import PriceHistoryChart from '../../ui/charts/PriceHistoryChart';
import { motion } from 'framer-motion';
import { getRaritySymbol, getRarityTier } from '../../../utils/tcgRaritySymbols';
import type { SetStatistics, CardWithMarketPrice } from '../types';
import type { TCGCard } from '../../../types/api/cards';

interface SetStatsProps {
  statistics: SetStatistics;
  cards: TCGCard[];
  setId: string;
}

export default function SetStats({ statistics, cards, setId }: SetStatsProps) {
  // Calculate total market value
  const totalValue = useMemo(() => {
    return Object.values(statistics.valueByRarity).reduce((sum, rarity) => sum + rarity.total, 0);
  }, [statistics.valueByRarity]);

  // Sort rarities by tier
  const sortedRarities = useMemo(() => {
    return Object.entries(statistics.rarityDistribution).sort((a, b) => {
      const tierOrder = { 'secret': 5, 'ultra': 4, 'rare': 3, 'uncommon': 2, 'common': 1 };
      const tierA = tierOrder[getRarityTier(a[0])] || 0;
      const tierB = tierOrder[getRarityTier(b[0])] || 0;
      return tierB - tierA;
    });
  }, [statistics.rarityDistribution]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-8"
    >
      {cards.length > 0 && (
        <GlassContainer variant="light" className="mb-8">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Set Statistics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rarity Distribution with symbols */}
            <motion.div variants={itemVariants} className="glass-light rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                Rarity Distribution
              </h3>
              <div className="space-y-3">
                {sortedRarities.map(([rarity, count]) => {
                  const percentage = ((count / cards.length) * 100).toFixed(1);
                  const tier = getRarityTier(rarity);
                  
                  return (
                    <motion.div 
                      key={rarity} 
                      className="flex items-center justify-between"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="relative w-6 h-6"
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Image 
                            src={getRaritySymbol(rarity)} 
                            alt={rarity}
                            width={24}
                            height={24}
                            className="w-6 h-6"
                          />
                        </motion.div>
                        <span className={`text-sm ${
                          tier === 'secret' ? 'text-purple-600 font-semibold' :
                          tier === 'ultra' ? 'text-yellow-600 font-semibold' :
                          tier === 'rare' ? 'text-blue-600' :
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                          {rarity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{count}</span>
                        <span className="text-xs text-gray-500">({percentage}%)</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Value Analytics */}
            <motion.div variants={itemVariants} className="glass-light rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">💰</span>
                Value Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Market Value</span>
                  <span className="font-bold text-lg text-green-600">${totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Average Card Value</span>
                  <span className="font-medium">
                    ${cards.length > 0 ? (totalValue / cards.length).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <p className="text-xs text-gray-500 mb-2">Top Value Rarities</p>
                  {Object.entries(statistics.valueByRarity)
                    .sort(([,a], [,b]) => b.average - a.average)
                    .slice(0, 3)
                    .map(([rarity, data]) => (
                      <div key={rarity} className="flex justify-between text-sm">
                        <span className="text-gray-600">{rarity}</span>
                        <span className="font-medium text-green-600">
                          ${data.average.toFixed(2)} avg
                        </span>
                      </div>
                    ))}
                </div>
              </div>
              
              {/* Mini price chart for set value trend */}
              {statistics.highestValueCards.length > 0 && (
                <div className="mt-4">
                  <PriceHistoryChart
                    cardId={statistics.highestValueCards[0].id}
                  />
                </div>
              )}
            </motion.div>

            {/* Collection Progress */}
            <motion.div variants={itemVariants}>
              <CollectionTracker 
                allCards={cards}
              />
            </motion.div>
          </div>

          {/* Highest Value Cards Preview */}
          {statistics.highestValueCards.length > 0 && (
            <motion.div 
              variants={itemVariants}
              className="mt-8 glass-light rounded-xl p-4"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">⭐</span>
                Top Value Cards
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {statistics.highestValueCards.slice(0, 5).map((card: CardWithMarketPrice, index) => (
                  <motion.div 
                    key={card.id} 
                    className="flex-shrink-0 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative">
                      <div className="relative w-24 h-32">
                        <Image 
                          src={card.images.small} 
                          alt={card.name}
                          width={96}
                          height={128}
                          className="object-cover rounded-lg shadow-md"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R"
                        />
                      </div>
                      <div className="absolute top-1 right-1 w-5 h-5">
                        <Image 
                          src={getRaritySymbol(card.rarity)} 
                          alt={card.rarity || 'unknown'}
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                      </div>
                    </div>
                    <p className="text-xs font-medium mt-2 truncate max-w-[96px]">{card.name}</p>
                    <p className="text-sm font-bold text-green-600">
                      ${card.marketPrice.toFixed(2)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </GlassContainer>
      )}
    </motion.div>
  );
}