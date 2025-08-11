import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokemon, PokemonSpecies } from "../../../types/pokemon";
import type { TypeColors } from '../../../types/pokemon-tabs';
import type { PocketCard } from '../../../types/api/pocket-cards';
import type { TCGCard } from '../../../types/api/cards';
import { GlassContainer } from '../../ui/design-system';
import CardList from '../../CardList';
import PocketCardList from '../../PocketCardList';
import { cn } from '../../../utils/cn';
import { 
  FaLayerGroup, FaMobileAlt, FaGamepad, FaImages,
  FaStar, FaTrophy, FaGem
} from 'react-icons/fa';
import { GiCardPlay, GiCardPick } from 'react-icons/gi';
import { HiSparkles } from 'react-icons/hi';

interface ExtendedPocketCard extends PocketCard {
  health?: string | number;
  pack?: string;
  ex?: "Yes" | "No";
  fullart?: "Yes" | "No";
  type?: string;
}

interface CardsTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  tcgCards?: TCGCard[];
  pocketCards?: ExtendedPocketCard[];
  typeColors?: TypeColors;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CardsTab: React.FC<CardsTabProps> = ({ 
  pokemon, 
  species, 
  tcgCards = [], 
  pocketCards = [],
  typeColors 
}) => {
  const [cardType, setCardType] = useState<'tcg' | 'pocket'>('tcg');
  
  
  return (
    <div className="space-y-6">
      {/* Header with Card Type Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassContainer 
          variant="dark" 
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
          animate={false}
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                  <GiCardPlay className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Card Gallery
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
          <button
            onClick={() => setCardType('tcg')}
            className={cn(
              "px-5 py-2.5 rounded-full font-semibold transition-all duration-300",
              "transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2",
              cardType === 'tcg'
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                : "bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/20"
            )}
          >
            <FaLayerGroup className="w-4 h-4" />
            TCG ({tcgCards.length})
          </button>
          <button
            onClick={() => setCardType('pocket')}
            className={cn(
              "px-5 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-105",
              cardType === 'pocket'
                ? cn(typeColors?.tabActive || '', "text-white shadow-lg")
                : "bg-white/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50"
            )}
          >
            <FaMobileAlt className="w-4 h-4" />
            Pocket ({pocketCards.length})
          </button>
              </div>
            </div>
          </div>
        </GlassContainer>
      </motion.div>
      
      {/* Card Display Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassContainer 
          variant="dark" 
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
          animate={false}
        >
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {cardType === 'tcg' ? (
                tcgCards.length > 0 ? (
                  <motion.div
                    key="tcg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardList cards={tcgCards} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="tcg-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12 space-y-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-600/10 flex items-center justify-center mx-auto">
                      <FaLayerGroup className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No TCG cards found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">This Pokémon doesn't have any TCG cards yet</p>
                    </div>
                  </motion.div>
                )
              ) : (
                pocketCards.length > 0 ? (
                  <motion.div
                    key="pocket"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PocketCardList 
                      cards={pocketCards}
                      loading={false}
                      error={undefined}
                      showPack={true}
                      showRarity={true}
                      showHP={true}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="pocket-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12 space-y-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-600/10 flex items-center justify-center mx-auto">
                      <FaMobileAlt className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No Pocket cards found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">This Pokémon doesn't have any Pocket cards yet</p>
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </GlassContainer>
      </motion.div>
      
      {/* Card Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Total Cards */}
        <motion.div 
          className="group"
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div className="h-full bg-white dark:bg-gray-900/50 rounded-2xl p-5 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center shadow-md shadow-purple-500/10">
                <FaImages className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-purple-400">Total Cards</h3>
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {tcgCards.length + pocketCards.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Combined collection
            </p>
          </div>
        </motion.div>
        
        {/* Card Rarity (placeholder) */}
        <motion.div 
          className="group"
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div className="h-full bg-white dark:bg-gray-900/50 rounded-2xl p-5 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center shadow-md shadow-yellow-500/10">
                <FaStar className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-yellow-400">Rarest Card</h3>
            </div>
            <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {cardType === 'tcg' ? 'Varies by set' : 'Check collection'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Most valuable variant
            </p>
          </div>
        </motion.div>
        
        {/* Sets Featured In */}
        <motion.div 
          className="group"
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div className="h-full bg-white dark:bg-gray-900/50 rounded-2xl p-5 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center shadow-md shadow-green-500/10">
                <GiCardPick className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-green-400">Sets Featured</h3>
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {new Set(tcgCards?.map(card => card.set?.name).filter(Boolean)).size || 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Different TCG sets
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CardsTab;