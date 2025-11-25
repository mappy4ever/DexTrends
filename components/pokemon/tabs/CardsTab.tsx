import React, { useState, useEffect, Component, ErrorInfo, ReactNode, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokemon, PokemonSpecies } from "../../../types/pokemon";
import type { TypeColors } from '../../../types/pokemon-tabs';
import type { PocketCard } from '../../../types/api/pocket-cards';
import type { TCGCard } from '../../../types/api/cards';
import { GlassContainer } from '../../ui/glass-components';
import CardList from '../../CardList';
import PocketCardList from '../../PocketCardList';
import { cn } from '../../../utils/cn';
import logger from '@/utils/logger';
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

// Error Boundary for Cards
class CardsErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('CardsTab error:', { error: error.message, errorInfo });
  }

  override render() {
    if (this.state.hasError) {
      return (
        <GlassContainer variant="dark" className="backdrop-blur-xl" animate={false}>
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-500 font-semibold mb-2">Error loading cards</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {this.state.error?.message || 'Something went wrong while loading the cards'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </GlassContainer>
      );
    }

    return this.props.children;
  }
}

const CardsTab: React.FC<CardsTabProps> = ({ 
  pokemon, 
  species, 
  tcgCards = [], 
  pocketCards = [],
  typeColors 
}) => {
  const [cardType, setCardType] = useState<'tcg' | 'pocket'>('tcg');
  const [cardsError, setCardsError] = useState<string | null>(null);

  // Validate and sanitize card data
  const validTcgCards = useMemo(() => {
    try {
      logger.debug('CardsTab: Processing TCG cards', { 
        tcgCards, 
        isArray: Array.isArray(tcgCards),
        length: tcgCards?.length,
        firstCard: tcgCards?.[0],
        typeofFirst: typeof tcgCards?.[0]
      });
      if (!Array.isArray(tcgCards)) return [];
      const filtered = tcgCards.filter(card => card && typeof card === 'object');
      logger.debug('CardsTab: Valid TCG cards', { 
        count: filtered.length,
        firstFilteredCard: filtered[0]
      });
      return filtered;
    } catch (error) {
      logger.error('Error processing TCG cards:', { error });
      return [];
    }
  }, [tcgCards]);

  const validPocketCards = useMemo(() => {
    try {
      logger.debug('CardsTab: Processing Pocket cards', { 
        pocketCards, 
        isArray: Array.isArray(pocketCards),
        length: pocketCards?.length 
      });
      if (!Array.isArray(pocketCards)) return [];
      const filtered = pocketCards.filter(card => card && typeof card === 'object');
      logger.debug('CardsTab: Valid Pocket cards', { count: filtered.length });
      return filtered;
    } catch (error) {
      logger.error('Error processing Pocket cards:', { error });
      return [];
    }
  }, [pocketCards]);
  
  return (
    <CardsErrorBoundary>
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
            TCG ({validTcgCards.length})
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
            Pocket ({validPocketCards.length})
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
                validTcgCards.length > 0 ? (
                  <motion.div
                    key="tcg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardList cards={validTcgCards} />
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
                validPocketCards.length > 0 ? (
                  <motion.div
                    key="pocket"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PocketCardList 
                      cards={validPocketCards}
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
              {validTcgCards.length + validPocketCards.length}
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
              {new Set(validTcgCards?.map(card => card.set?.name).filter(Boolean)).size || 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Different TCG sets
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
    </CardsErrorBoundary>
  );
};

export default CardsTab;