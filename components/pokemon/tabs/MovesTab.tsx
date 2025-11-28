import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logger from "@/utils/logger";
import type { Pokemon, PokemonSpecies } from "../../../types/pokemon";
import type { TypeColors } from '../../../types/pokemon-tabs';
import { Container } from '../../ui/Container';
import { PokemonLearnset } from '../PokemonLearnset';
import { cn } from '../../../utils/cn';
import { TypeBadge } from '../../ui/TypeBadge';
import { CategoryIcon } from '../../ui/CategoryIcon';
import { showdownQueries, PokemonLearnsetRecord, MoveCompetitiveDataRecord } from '@/utils/supabase';
import { 
  FaSearch, FaFilter, FaBookOpen, FaStar, FaChartBar,
  FaBolt, FaFire, FaWater, FaLeaf, FaSnowflake,
  FaDragon, FaGhost, FaFistRaised, FaBug,
  FaMountain, FaFeather, FaBrain, FaShieldAlt
} from 'react-icons/fa';
import { BsChevronDown, BsChevronUp, BsLightning, BsShield } from 'react-icons/bs';
import { HiSparkles } from 'react-icons/hi';

interface MovesTabV2Props {
  pokemon: Pokemon;
  species: PokemonSpecies;
  typeColors?: TypeColors;
}

interface GroupedMoves {
  [method: string]: PokemonLearnsetRecord[];
}

const learnMethodLabels: Record<string, string> = {
  'level-up': 'Level Up',
  'machine': 'TM/TR',
  'egg': 'Egg Moves',
  'tutor': 'Move Tutor',
  'other': 'Other'
};

const learnMethodColors: Record<string, string> = {
  'level-up': 'from-green-400 to-green-500',
  'machine': 'from-amber-400 to-amber-500',
  'egg': 'from-pink-400 to-pink-500',
  'tutor': 'from-amber-400 to-amber-500',
  'other': 'from-stone-400 to-stone-500'
};

const MovesTabV2: React.FC<MovesTabV2Props> = ({ pokemon, species, typeColors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState(9);
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedMove, setExpandedMove] = useState<string | null>(null);
  const [moves, setMoves] = useState<PokemonLearnsetRecord[]>([]);
  const [moveDataMap, setMoveDataMap] = useState<Map<string, MoveCompetitiveDataRecord>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showCumulative, setShowCumulative] = useState(true);

  // Fetch moves data
  useEffect(() => {
    async function fetchMoves() {
      if (!pokemon?.name) return;
      
      try {
        setLoading(true);
        const learnset = await showdownQueries.getPokemonLearnset(pokemon.name, selectedGeneration);
        
        if (learnset && Array.isArray(learnset)) {
          setMoves(learnset);
          
          // Fetch move details for all moves
          const uniqueMoves = [...new Set(learnset.map(m => m.move_name))];
          const moveData = new Map<string, MoveCompetitiveDataRecord>();
          
          // Batch fetch move data
          const batchSize = 10;
          for (let i = 0; i < uniqueMoves.length; i += batchSize) {
            const batch = uniqueMoves.slice(i, i + batchSize);
            await Promise.all(
              batch.map(async (moveName) => {
                try {
                  const data = await showdownQueries.getMoveData(moveName);
                  if (data) {
                    moveData.set(moveName, data);
                  }
                } catch (error) {
                  logger.debug(`Failed to fetch data for move ${moveName}`, { error });
                }
              })
            );
          }
          
          setMoveDataMap(moveData);
        }
      } catch (error) {
        logger.error('Failed to fetch moves:', { error });
      } finally {
        setLoading(false);
      }
    }

    fetchMoves();
  }, [pokemon?.name, selectedGeneration]);

  // Filter and process moves
  const processedMoves = useMemo(() => {
    let filtered = moves;

    // Filter by generation
    if (!showCumulative) {
      filtered = filtered.filter(m => m.generation === selectedGeneration);
    } else {
      filtered = filtered.filter(m => m.generation <= selectedGeneration);
    }

    // Filter by method
    if (selectedMethod !== 'all') {
      filtered = filtered.filter(m => m.learn_method === selectedMethod);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(m => {
        const moveData = moveDataMap.get(m.move_name);
        return moveData?.type === selectedType;
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => {
        const moveData = moveDataMap.get(m.move_name);
        return moveData?.category === selectedCategory;
      });
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.move_name.toLowerCase().includes(search) ||
        m.move_name.replace(/-/g, ' ').toLowerCase().includes(search)
      );
    }

    // Remove duplicates by move name
    const uniqueMoves = new Map<string, PokemonLearnsetRecord>();
    filtered.forEach(move => {
      if (!uniqueMoves.has(move.move_name) || 
          (move.level && (!uniqueMoves.get(move.move_name)?.level || 
           move.level < uniqueMoves.get(move.move_name)!.level!))) {
        uniqueMoves.set(move.move_name, move);
      }
    });

    return Array.from(uniqueMoves.values());
  }, [moves, searchTerm, selectedGeneration, selectedMethod, selectedType, selectedCategory, showCumulative, moveDataMap]);

  // Group moves by method
  const groupedMoves = useMemo(() => {
    const groups: GroupedMoves = {};
    
    processedMoves.forEach(move => {
      const method = move.learn_method || 'other';
      if (!groups[method]) {
        groups[method] = [];
      }
      groups[method].push(move);
    });

    // Sort level-up moves by level
    if (groups['level-up']) {
      groups['level-up'].sort((a, b) => (a.level || 0) - (b.level || 0));
    }

    return groups;
  }, [processedMoves]);

  // Calculate statistics
  const stats = useMemo(() => {
    const typeCount = new Map<string, number>();
    const categoryCount = new Map<string, number>();
    
    processedMoves.forEach(move => {
      const moveData = moveDataMap.get(move.move_name);
      if (moveData) {
        typeCount.set(moveData.type || '', (typeCount.get(moveData.type || '') || 0) + 1);
        categoryCount.set(moveData.category || '', (categoryCount.get(moveData.category || '') || 0) + 1);
      }
    });

    return {
      total: processedMoves.length,
      byType: typeCount,
      byCategory: categoryCount,
      physical: categoryCount.get('physical') || 0,
      special: categoryCount.get('special') || 0,
      status: categoryCount.get('status') || 0
    };
  }, [processedMoves, moveDataMap]);

  // Get available types from move data
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    moves.forEach(move => {
      const moveData = moveDataMap.get(move.move_name);
      if (moveData?.type) {
        types.add(moveData.type);
      }
    });
    return Array.from(types).sort();
  }, [moves, moveDataMap]);

  const formatMoveName = (name: string) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!pokemon || !pokemon.name) {
    return (
      <Container variant="default" className="backdrop-blur-xl">
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-stone-500">Pokemon data not available</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Container variant="default" className="backdrop-blur-xl">
          <div className="p-6">
            {/* Title and Generation Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400">
                Move Pool Analysis
              </h2>
              
              <div className="flex items-center gap-4">
                <select
                  value={selectedGeneration}
                  onChange={(e) => setSelectedGeneration(Number(e.target.value))}
                  className="px-4 py-2 bg-white/10 dark:bg-stone-800/50 rounded-lg border border-stone-300 dark:border-stone-600"
                >
                  {[9, 8, 7, 6, 5, 4, 3, 2, 1].map(gen => (
                    <option key={gen} value={gen}>Generation {gen}</option>
                  ))}
                </select>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCumulative}
                    onChange={(e) => setShowCumulative(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span className="text-sm text-stone-600 dark:text-stone-400">
                    Show all up to Gen {selectedGeneration}
                  </span>
                </label>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search moves..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 dark:bg-stone-800/50 rounded-lg border border-stone-300 dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {/* Method Filter */}
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedMethod('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    selectedMethod === 'all'
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                      : "bg-white/10 text-stone-600 dark:text-stone-300"
                  )}
                >
                  All Methods
                </button>
                {Object.keys(learnMethodLabels).map(method => (
                  <button
                    key={method}
                    onClick={() => setSelectedMethod(method)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      selectedMethod === method
                        ? `bg-gradient-to-r ${learnMethodColors[method]} text-white`
                        : "bg-white/10 text-stone-600 dark:text-stone-300"
                    )}
                  >
                    {learnMethodLabels[method]}
                  </button>
                ))}
              </div>

              {/* Type Filter */}
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedType('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    selectedType === 'all'
                      ? "bg-gradient-to-r from-stone-500 to-stone-600 text-white"
                      : "bg-white/10 text-stone-600 dark:text-stone-300"
                  )}
                >
                  All Types
                </button>
                {availableTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      selectedType === type
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                        : "bg-white/10 text-stone-600 dark:text-stone-300"
                    )}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    selectedCategory === 'all'
                      ? "bg-gradient-to-r from-stone-500 to-stone-600 text-white"
                      : "bg-white/10 text-stone-600 dark:text-stone-300"
                  )}
                >
                  All Categories
                </button>
                {['physical', 'special', 'status'].map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      selectedCategory === category
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                        : "bg-white/10 text-stone-600 dark:text-stone-300"
                    )}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {/* Total Moves */}
        <Container variant="default" className="backdrop-blur-xl">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                <FaBookOpen className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Total Moves</h3>
            </div>
            <div className="text-3xl font-bold text-stone-800 dark:text-stone-100">
              {stats.total}
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              Available moves
            </p>
          </div>
        </Container>

        {/* Physical Moves */}
        <Container variant="default" className="backdrop-blur-xl">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center">
                <FaFistRaised className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">Physical</h3>
            </div>
            <div className="text-3xl font-bold text-stone-800 dark:text-stone-100">
              {stats.physical}
            </div>
            <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full"
                style={{ width: `${stats.total > 0 ? (stats.physical / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </Container>

        {/* Special Moves */}
        <Container variant="default" className="backdrop-blur-xl">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                <BsLightning className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Special</h3>
            </div>
            <div className="text-3xl font-bold text-stone-800 dark:text-stone-100">
              {stats.special}
            </div>
            <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full"
                style={{ width: `${stats.total > 0 ? (stats.special / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </Container>

        {/* Status Moves */}
        <Container variant="default" className="backdrop-blur-xl">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-500/20 to-stone-600/10 flex items-center justify-center">
                <BsShield className="w-5 h-5 text-stone-400" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Status</h3>
            </div>
            <div className="text-3xl font-bold text-stone-800 dark:text-stone-100">
              {stats.status}
            </div>
            <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-stone-400 to-stone-500 h-2 rounded-full"
                style={{ width: `${stats.total > 0 ? (stats.status / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </Container>
      </motion.div>

      {/* Moves Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Container variant="default" className="backdrop-blur-xl">
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                <p className="mt-4 text-stone-500">Loading moves...</p>
              </div>
            ) : processedMoves.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-stone-500">No moves found matching your filters</p>
              </div>
            ) : selectedMethod === 'all' ? (
              // Grouped view
              <div className="space-y-8">
                {Object.entries(groupedMoves)
                  .sort(([a], [b]) => {
                    const order = ['level-up', 'machine', 'egg', 'tutor', 'other'];
                    return order.indexOf(a) - order.indexOf(b);
                  })
                  .map(([method, methodMoves]) => (
                    <div key={method}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={cn(
                          "text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent",
                          learnMethodColors[method] || 'from-stone-400 to-stone-500'
                        )}>
                          {learnMethodLabels[method] || method}
                        </h3>
                        <span className="text-sm bg-stone-200 dark:bg-stone-700 px-3 py-1 rounded-full">
                          {methodMoves.length} moves
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {methodMoves.map((move, index) => (
                          <MoveCard
                            key={`${move.move_name}-${index}`}
                            move={move}
                            moveData={moveDataMap.get(move.move_name) || null}
                            expanded={expandedMove === move.move_name}
                            onToggle={() => setExpandedMove(
                              expandedMove === move.move_name ? null : move.move_name
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              // Single method view
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {processedMoves.map((move, index) => (
                  <MoveCard
                    key={`${move.move_name}-${index}`}
                    move={move}
                    moveData={moveDataMap.get(move.move_name) || null}
                    expanded={expandedMove === move.move_name}
                    onToggle={() => setExpandedMove(
                      expandedMove === move.move_name ? null : move.move_name
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </Container>
      </motion.div>
    </div>
  );
};

// Move Card Component
interface MoveCardProps {
  move: PokemonLearnsetRecord;
  moveData: MoveCompetitiveDataRecord | null;
  expanded: boolean;
  onToggle: () => void;
}

const MoveCard: React.FC<MoveCardProps> = ({ move, moveData, expanded, onToggle }) => {
  const formatMoveName = (name: string) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <motion.div
      layout
      className="bg-white/5 dark:bg-stone-800/50 rounded-lg p-4 hover:bg-white/10 dark:hover:bg-stone-700/50 transition-all cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
            {formatMoveName(move.move_name)}
          </h4>
          
          <div className="flex items-center gap-2 mb-2">
            {moveData && (
              <>
                <TypeBadge type={moveData.type || ''} size="sm" />
                <CategoryIcon category={moveData.category || null} size={16} />
              </>
            )}
            {move.learn_method === 'level-up' && move.level && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                Lv. {move.level}
              </span>
            )}
          </div>

          {moveData && (
            <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-400">
              {moveData.power && (
                <span>Power: {moveData.power}</span>
              )}
              {moveData.accuracy && (
                <span>Acc: {moveData.accuracy}%</span>
              )}
              {moveData.pp && (
                <span>PP: {moveData.pp}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="ml-2">
          {expanded ? (
            <BsChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <BsChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && moveData && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700"
          >
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {'No description available'}
            </p>
            {moveData.priority !== 0 && (
              <p className="text-xs text-stone-500 dark:text-stone-500 mt-2">
                Priority: {moveData.priority > 0 ? '+' : ''}{moveData.priority}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MovesTabV2;