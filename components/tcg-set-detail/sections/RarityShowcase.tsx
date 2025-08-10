import React, { useMemo } from 'react';
import Image from 'next/image';
import { GlassContainer } from '../../ui/design-system/GlassContainer';
// SmartRecommendationEngine removed - simplified version
import { CompactPriceIndicator } from '../../ui/PriceIndicator';
// Import removed - EnhancedAnimationSystem not needed as a wrapper
// Import removed - FloatingActionSystem not used in minimal version
import { getRaritySymbol, getRarityGlowClass, getRarityTier, shouldHaveHolographicEffect } from '../../../utils/tcgRaritySymbols';
import { motion, AnimatePresence } from 'framer-motion';
import { getPrice, getPriceNumeric } from '../../../utils/pokemonutils';
import type { TCGCard } from '../../../types/api/cards';

interface RarityShowcaseProps {
  cards: TCGCard[];
  onCardClick: (card: TCGCard) => void;
}

export default function RarityShowcase({ cards, onCardClick }: RarityShowcaseProps) {
  // Group cards by rarity and sort by value within each group
  const cardsByRarity = useMemo(() => {
    const grouped = cards.reduce((acc, card) => {
      if (!card.rarity) return acc;
      if (!acc[card.rarity]) acc[card.rarity] = [];
      acc[card.rarity].push(card);
      return acc;
    }, {} as Record<string, TCGCard[]>);

    // Sort cards within each rarity by price
    Object.keys(grouped).forEach(rarity => {
      grouped[rarity].sort((a, b) => getPriceNumeric(b) - getPriceNumeric(a));
    });

    return grouped;
  }, [cards]);

  // Define showcase rarities in order of importance
  const showcaseRarities = [
    'Rare Secret',
    'Special Illustration Rare', 
    'Rare Rainbow',
    'Hyper Rare',
    'Rare Ultra',
    'Illustration Rare',
    'Shiny Rare',
    'Double Rare',
    'Rare Holo VMAX',
    'Rare Holo VSTAR',
    'Rare Holo V',
    'Rare Holo'
  ];

  // Filter to only rarities that exist in this set
  const availableShowcaseRarities = showcaseRarities.filter(
    rarity => cardsByRarity[rarity] && cardsByRarity[rarity].length > 0
  );

  if (availableShowcaseRarities.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const rarityVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <GlassContainer variant="light">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-purple-600 bg-clip-text text-transparent">
              Rarity Showcase
            </h2>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-500"
            >
              {availableShowcaseRarities.length} rare types available
            </motion.div>
          </div>
          
          <div className="space-y-6">
            {availableShowcaseRarities.slice(0, 6).map((rarity, rarityIndex) => {
              const rarityCards = cardsByRarity[rarity];
              const tier = getRarityTier(rarity);
              
              return (
                <motion.div
                  key={rarity}
                  variants={rarityVariants}
                  className={`${tier === 'secret' || tier === 'ultra' ? 'relative overflow-hidden' : ''}`}
                >
                  {/* Holographic background effect for ultra/secret rarities */}
                  {shouldHaveHolographicEffect(rarity) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-yellow-400/10 animate-gradient-shift" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        className="relative w-7 h-7"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Image 
                          src={getRaritySymbol(rarity)} 
                          alt={rarity}
                          width={28}
                          height={28}
                          className="w-7 h-7"
                        />
                      </motion.div>
                      <h3 className={`text-lg font-semibold ${
                        tier === 'secret' ? 'text-purple-600' :
                        tier === 'ultra' ? 'text-yellow-600' :
                        'text-gray-700 dark:text-gray-300'
                      }`}>
                        {rarity}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({rarityCards.length} {rarityCards.length === 1 ? 'card' : 'cards'})
                      </span>
                    </div>
                    
                    <div className="relative">
                      <motion.div 
                        className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide"
                        whileTap={{ cursor: "grabbing" }}
                      >
                        <AnimatePresence>
                          {rarityCards.slice(0, 8).map((card, cardIndex) => (
                            <motion.div
                              key={card.id}
                              className="flex-shrink-0 group"
                              initial={{ opacity: 0, scale: 0.8, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ 
                                delay: rarityIndex * 0.1 + cardIndex * 0.05,
                                type: "spring" as const,
                                stiffness: 200
                              }}
                              whileHover={{ y: -10, transition: { duration: 0.2 } }}
                            >
                              <div
                                className={`relative cursor-pointer ${getRarityGlowClass(card.rarity)} rounded-lg transition-all duration-300`}
                                onClick={() => onCardClick(card)}
                              >
                                {/* Card Image */}
                                <div className="relative overflow-hidden rounded-lg">
                                  <img 
                                    src={card.images.small} 
                                    alt={card.name}
                                    className="w-32 h-44 object-cover"
                                    loading="lazy"
                                  />
                                  
                                  {/* Holographic overlay for special cards */}
                                  {shouldHaveHolographicEffect(card.rarity) && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                  )}
                                  
                                  {/* Quick Actions on Hover */}
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <button
                                      onClick={() => onCardClick(card)}
                                      className="w-full text-white text-xs py-1 px-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Price Badge */}
                                <div className="absolute top-2 left-2">
                                  <CompactPriceIndicator 
                                    cardId={card.id}
                                    currentPrice={`$${getPriceNumeric(card).toFixed(2)}`}
                                    variantType="market"
                                  />
                                </div>
                                
                                {/* Card Number */}
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                  #{card.number}
                                </div>
                              </div>
                              
                              {/* Card Name */}
                              <p className="text-xs font-medium mt-2 text-center truncate max-w-[128px]">
                                {card.name}
                              </p>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                      
                      {/* Scroll Indicator */}
                      {rarityCards.length > 8 && (
                        <motion.div
                          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Smart Recommendations Section - Placeholder for now */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
              More Cards Coming Soon...
            </h3>
          </motion.div>
        </GlassContainer>
      </motion.div>
  );
}