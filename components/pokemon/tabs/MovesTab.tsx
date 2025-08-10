import React, { Component, ErrorInfo, ReactNode, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logger from "@/utils/logger";
import type { Pokemon, PokemonSpecies } from "../../../types/pokemon";
import type { TypeColors } from '../../../types/pokemon-tabs';
import { GlassContainer } from '../../ui/design-system';
import { PokemonLearnset } from '../PokemonLearnset';
import { cn } from '../../../utils/cn';
import { 
  FaSearch, FaFilter, FaBookOpen, FaStar,
  FaBolt, FaFire, FaWater, FaLeaf, FaSnowflake,
  FaDragon, FaGhost, FaFistRaised, FaBug,
  FaMountain, FaFeather, FaBrain, FaMagic,
  FaShieldAlt, FaRunning, FaGamepad
} from 'react-icons/fa';
import { GiSwordWound, GiPoisonBottle, GiSteelClaws } from 'react-icons/gi';
import { HiSparkles } from 'react-icons/hi';

interface MovesTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  typeColors: TypeColors;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class MovesTabErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('MovesTab error', { error, errorInfo });
  }

  override render() {
    if (this.state.hasError) {
      return (
        <GlassContainer 
          variant="dark" 
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
          animate={false}
        >
          <div className="p-6 md:p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-500 font-semibold mb-2">Error loading moves</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {this.state.error?.message || 'Something went wrong while loading move data'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all"
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

const MovesTab: React.FC<MovesTabProps> = ({ pokemon, species, typeColors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState(9);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Validate pokemon data
  if (!pokemon || !pokemon.name) {
    return (
      <GlassContainer 
        variant="dark" 
        className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
        animate={false}
      >
        <div className="p-6 md:p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500 dark:text-gray-400">
            Pokemon data not available
          </p>
        </div>
      </GlassContainer>
    );
  }

  const getTypeIcon = (type: string) => {
    const typeIcons: Record<string, React.ComponentType> = {
      normal: FaRunning,
      fire: FaFire,
      water: FaWater,
      grass: FaLeaf,
      electric: FaBolt,
      ice: FaSnowflake,
      fighting: FaFistRaised,
      poison: GiPoisonBottle,
      ground: FaMountain,
      flying: FaFeather,
      psychic: FaBrain,
      bug: FaBug,
      rock: FaMountain,
      ghost: FaGhost,
      dragon: FaDragon,
      dark: FaGhost,
      steel: GiSteelClaws,
      fairy: HiSparkles
    };
    return typeIcons[type] || FaStar;
  };

  return (
    <MovesTabErrorBoundary>
      <div className="space-y-6" data-testid="pokemon-moves">
        {/* Header with Search and Filters */}
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Move Pool
                </h2>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      "transform hover:scale-[1.02] active:scale-[0.98]",
                      viewMode === 'grid'
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                        : "bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/20"
                    )}
                  >
                    Grid View
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      "transform hover:scale-[1.02] active:scale-[0.98]",
                      viewMode === 'list'
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                        : "bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/20"
                    )}
                  >
                    List View
                  </button>
                </div>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search moves..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 dark:bg-gray-800/50 rounded-lg 
                             border border-gray-300 dark:border-gray-600 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <FaGamepad className="text-gray-400" />
                  <select
                    value={selectedGeneration}
                    onChange={(e) => setSelectedGeneration(parseInt(e.target.value))}
                    className="px-4 py-3 bg-white/10 dark:bg-gray-800/50 rounded-lg 
                             border border-gray-300 dark:border-gray-600
                             focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {[9, 8, 7, 6, 5, 4, 3, 2, 1].map(gen => (
                      <option key={gen} value={gen}>Generation {gen}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </GlassContainer>
        </motion.div>

        {/* Moves Display */}
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
              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                  <FaBookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-purple-400">
                    Complete Learnset
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Data from Pokemon Showdown
                  </p>
                </div>
              </div>
              
              <PokemonLearnset 
                pokemonId={pokemon.name}
                generation={selectedGeneration}
                className="mt-4"
              />
            </div>
          </GlassContainer>
        </motion.div>

        {/* Move Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Moves */}
            <motion.div 
              className="group"
              whileHover={{ scale: 1.03, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <div className="h-full bg-white dark:bg-gray-900/50 rounded-2xl p-5 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center shadow-md shadow-blue-500/10">
                    <FaBookOpen className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-blue-400">Total Moves</h3>
                </div>
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {pokemon.moves?.length || 0}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Across all generations
                </p>
              </div>
            </motion.div>

            {/* Move Types */}
            <motion.div 
              className="group"
              whileHover={{ scale: 1.03, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <div className="h-full bg-white dark:bg-gray-900/50 rounded-2xl p-5 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center shadow-md shadow-green-500/10">
                    <HiSparkles className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-green-400">Type Coverage</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Physical</span>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Special</span>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <span className="font-semibold">-</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Learning Methods */}
            <motion.div 
              className="group"
              whileHover={{ scale: 1.03, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <div className="h-full bg-white dark:bg-gray-900/50 rounded-2xl p-5 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center shadow-md shadow-purple-500/10">
                    <FaStar className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-purple-400">Learn Methods</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Level Up</span>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">TM/HM</span>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Egg Moves</span>
                    <span className="font-semibold">-</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </MovesTabErrorBoundary>
  );
};

export default MovesTab;