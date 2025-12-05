import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { NextPage } from "next";
import { motion, AnimatePresence } from "framer-motion";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { UnifiedDataTable, Column } from "@/components/unified/UnifiedDataTable";
import { fetchJSON } from "@/utils/unifiedFetch";
import { showdownQueries, PokemonLearnsetRecord } from "@/utils/supabase";
import { getPokemonIdFromName } from "@/utils/pokemonNameIdMap";
import logger from "@/utils/logger";
import { cn } from "@/utils/cn";
import { FiChevronLeft, FiZap, FiTarget, FiActivity } from 'react-icons/fi';

/**
 * Unified Moves Page - Production-ready responsive design
 * 
 * Features:
 * - One codebase for all devices
 * - Responsive data table (cards on mobile, table on desktop)
 * - Virtual scrolling for performance
 * - Smart column prioritization
 * - No duplicate code or conditional rendering
 */

interface Move {
  id: number;
  name: string;
  type: string;
  category: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  effect_chance: number | null;
  effect: string;
  short_effect: string;
  generation: number;
}

interface MoveApiResponse {
  id: number;
  name: string;
  type: { name: string };
  damage_class: { name: string };
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  effect_chance: number | null;
  generation: { name: string };
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: { name: string };
  }>;
}

const MovesPage: NextPage = () => {
  const router = useRouter();
  const [moves, setMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [expandedMoveId, setExpandedMoveId] = useState<number | null>(null);
  const [moveLearners, setMoveLearners] = useState<Record<number, PokemonLearnsetRecord[]>>({});
  const [learnersLoading, setLearnersLoading] = useState<Record<number, boolean>>({});

  // Load moves data
  useEffect(() => {
    const loadMoves = async () => {
      try {
        setLoading(true);
        
        // Get list of all moves
        const movesList = await fetchJSON<{ results: Array<{ name: string; url: string }> }>(
          'https://pokeapi.co/api/v2/move?limit=1000'
        );
        
        if (!movesList?.results) {
          throw new Error('Failed to fetch moves list');
        }
        
        // Create placeholders first for fast initial load
        const placeholderMoves: Move[] = movesList.results.map((m, index) => ({
          id: index + 1,
          name: m.name,
          type: 'normal',
          category: 'physical',
          power: null,
          accuracy: null,
          pp: 0,
          priority: 0,
          effect_chance: null,
          effect: '',
          short_effect: '',
          generation: 1
        }));
        
        setMoves(placeholderMoves);
        setLoading(false);
        
        // Load detailed data in batches
        const batchSize = 20;
        const allMoves = [...placeholderMoves];
        
        for (let i = 0; i < movesList.results.length; i += batchSize) {
          const batch = movesList.results.slice(i, i + batchSize);
          const promises = batch.map(async (move) => {
            try {
              const data = await fetchJSON<MoveApiResponse>(move.url);
              if (!data) return null;
              
              const englishEffect = data.effect_entries?.find(e => e.language.name === 'en');
              
              return {
                id: data.id,
                name: data.name,
                type: data.type.name,
                category: data.damage_class.name,
                power: data.power,
                accuracy: data.accuracy,
                pp: data.pp,
                priority: data.priority,
                effect_chance: data.effect_chance,
                effect: englishEffect?.effect || '',
                short_effect: englishEffect?.short_effect || '',
                generation: parseInt(data.generation.name.split('-')[1]) || 1
              };
            } catch (error) {
              logger.error('Failed to load move details', { move: move.name, error });
              return null;
            }
          });
          
          const batchResults = await Promise.all(promises);
          batchResults.forEach((result, index) => {
            if (result) {
              const moveIndex = i + index;
              if (moveIndex < allMoves.length) {
                allMoves[moveIndex] = result;
              }
            }
          });
          
          setMoves([...allMoves]);
          
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        logger.info('All moves loaded successfully');
      } catch (error) {
        logger.error('Failed to load moves', { error });
        setLoading(false);
      }
    };
    
    loadMoves();
  }, []);

  // Load Pokemon that can learn a move
  const loadMoveLearners = useCallback(async (moveId: number, moveName: string) => {
    if (moveLearners[moveId] || learnersLoading[moveId]) return;
    
    setLearnersLoading(prev => ({ ...prev, [moveId]: true }));
    
    try {
      const learners = await showdownQueries.getPokemonByMove(moveName);
      setMoveLearners(prev => ({ ...prev, [moveId]: learners || [] }));
    } catch (error) {
      logger.error('Failed to load move learners', { moveId, moveName, error });
      setMoveLearners(prev => ({ ...prev, [moveId]: [] }));
    } finally {
      setLearnersLoading(prev => ({ ...prev, [moveId]: false }));
    }
  }, [moveLearners, learnersLoading]);

  // Handle move expansion
  const handleToggleExpand = useCallback((moveId: number, moveName: string) => {
    setExpandedMoveId(prev => prev === moveId ? null : moveId);
    if (expandedMoveId !== moveId) {
      loadMoveLearners(moveId, moveName);
    }
  }, [expandedMoveId, loadMoveLearners]);


  // Filter moves
  const filteredMoves = useMemo(() => {
    let filtered = [...moves];
    
    if (selectedType) {
      filtered = filtered.filter(m => m.type === selectedType);
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }
    
    return filtered;
  }, [moves, selectedType, selectedCategory]);

  // Define table columns
  const columns: Column<Move>[] = [
    {
      key: 'name',
      label: 'Move',
      sortable: true,
      priority: 'primary',
      renderCell: (move) => (
        <Link href={`/pokemon/moves/${move.name}`}>
          <span className="font-semibold text-amber-600 dark:text-amber-400 hover:underline capitalize">
            {move.name.replace(/-/g, ' ')}
          </span>
        </Link>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      priority: 'primary',
      width: '120px',
      renderCell: (move) => <TypeBadge type={move.type} size="sm" />
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      priority: 'secondary',
      width: '120px',
      renderCell: (move) => (
        <CategoryIcon category={move.category} size={18} showLabel={true} />
      )
    },
    {
      key: 'power',
      label: 'Power',
      sortable: true,
      priority: 'secondary',
      width: '80px',
      align: 'center',
      renderCell: (move) => (
        <span className={cn(
          'font-medium',
          move.power && move.power >= 100 && 'text-red-600 dark:text-red-400',
          move.power && move.power >= 80 && move.power < 100 && 'text-orange-600 dark:text-orange-400'
        )}>
          {move.power || '-'}
        </span>
      )
    },
    {
      key: 'accuracy',
      label: 'Acc',
      mobileLabel: 'Acc',
      sortable: true,
      priority: 'secondary',
      width: '80px',
      align: 'center',
      renderCell: (move) => (
        <span className={cn(
          'text-sm',
          move.accuracy === 100 && 'text-green-600 dark:text-green-400',
          move.accuracy && move.accuracy < 100 && 'text-yellow-600 dark:text-yellow-400'
        )}>
          {move.accuracy ? `${move.accuracy}%` : '-'}
        </span>
      )
    },
    {
      key: 'pp',
      label: 'PP',
      sortable: true,
      priority: 'detail',
      width: '60px',
      align: 'center'
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      priority: 'detail',
      width: '80px',
      align: 'center',
      renderCell: (move) => (
        <span className={cn(
          'text-sm font-medium',
          move.priority > 0 && 'text-green-600 dark:text-green-400',
          move.priority < 0 && 'text-red-600 dark:text-red-400'
        )}>
          {move.priority > 0 ? `+${move.priority}` : move.priority}
        </span>
      )
    },
    {
      key: 'short_effect',
      label: 'Effect',
      priority: 'detail',
      renderCell: (move) => (
        <span className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
          {move.short_effect || move.effect || 'No description available'}
        </span>
      )
    }
  ];

  // Render expanded content
  const renderExpanded = useCallback((move: Move) => {
    const learners = moveLearners[move.id] || [];
    const isLoading = learnersLoading[move.id];
    
    return (
      <div className="space-y-4">
        {/* Full effect description */}
        <div>
          <h4 className="font-semibold text-sm mb-2 text-stone-700 dark:text-stone-300">Full Description</h4>
          <p className="text-sm text-stone-600 dark:text-stone-300">
            {move.effect || move.short_effect || 'No description available'}
          </p>
        </div>
        
        {/* Move details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-stone-500 dark:text-stone-300">Generation:</span>
            <span className="ml-2 font-medium">Gen {move.generation}</span>
          </div>
          {move.effect_chance && (
            <div>
              <span className="text-stone-500 dark:text-stone-300">Effect Chance:</span>
              <span className="ml-2 font-medium">{move.effect_chance}%</span>
            </div>
          )}
        </div>
        
        {/* Pokemon that can learn this move */}
        <div>
          <h4 className="font-semibold text-sm mb-2 text-stone-700 dark:text-stone-300">
            Pokémon that can learn {move.name.replace(/-/g, ' ')}
          </h4>
          {isLoading ? (
            <div className="text-sm text-stone-500">Loading...</div>
          ) : learners.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {learners.slice(0, 20).map(learner => {
                const pokemonId = getPokemonIdFromName(learner.pokemon_id);
                return (
                  <Link
                    key={learner.pokemon_id}
                    href={`/pokedex/${pokemonId || learner.pokemon_id}`}
                    className="px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-full text-sm hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors capitalize"
                  >
                    {learner.pokemon_id.replace(/-/g, ' ')}
                  </Link>
                );
              })}
              {learners.length > 20 && (
                <span className="px-3 py-1 text-sm text-stone-500">
                  +{learners.length - 20} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-stone-500">No Pokémon data available</p>
          )}
        </div>
      </div>
    );
  }, [moveLearners, learnersLoading]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: moves.length,
    physical: moves.filter(m => m.category === 'physical').length,
    special: moves.filter(m => m.category === 'special').length,
    status: moves.filter(m => m.category === 'status').length,
  }), [moves]);

  return (
    <>
      <Head>
        <title>Pokémon Moves | DexTrends</title>
        <meta name="description" content="Browse all Pokémon moves with details on power, accuracy, type, and effects" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50 dark:from-stone-950 dark:via-stone-900 dark:to-orange-950">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-30 dark:opacity-20">
            <div className="absolute top-10 left-10 w-64 h-64 bg-orange-400 rounded-full blur-3xl" />
            <div className="absolute top-20 right-20 w-48 h-48 bg-amber-400 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-red-400 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 pt-6 pb-4">
            {/* Back Button */}
            <button
              onClick={() => router.push('/pokemon')}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors mb-4"
            >
              <FiChevronLeft className="w-4 h-4" />
              Pokémon Hub
            </button>

            {/* Hero Content */}
            <div className="text-center mb-6">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl md:text-5xl font-black mb-3"
              >
                <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 bg-clip-text text-transparent">
                  Moves Database
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto"
              >
                Explore all Pokémon moves with power, accuracy, and effects
              </motion.p>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-4 sm:gap-8 mb-4"
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">{stats.total}</div>
                <div className="text-xs sm:text-sm text-stone-500">Total</div>
              </div>
              <div className="w-px bg-stone-300 dark:bg-stone-600" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">{stats.physical}</div>
                <div className="text-xs sm:text-sm text-stone-500">Physical</div>
              </div>
              <div className="w-px bg-stone-300 dark:bg-stone-600" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">{stats.special}</div>
                <div className="text-xs sm:text-sm text-stone-500">Special</div>
              </div>
              <div className="w-px bg-stone-300 dark:bg-stone-600" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-stone-600 dark:text-stone-400">{stats.status}</div>
                <div className="text-xs sm:text-sm text-stone-500">Status</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Sticky Filter Bar */}
        <div className="sticky top-14 md:top-16 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border-b border-stone-200 dark:border-stone-700">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Type Filter Pills */}
              <div className="flex-1">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    onClick={() => setSelectedType('')}
                    className={cn(
                      'flex-shrink-0 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all',
                      selectedType === ''
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    )}
                  >
                    All Types
                  </button>
                  {['fire', 'water', 'grass', 'electric', 'psychic', 'fighting', 'dark', 'dragon', 'fairy', 'steel'].map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(selectedType === type ? '' : type)}
                      className={cn(
                        'flex-shrink-0 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all capitalize',
                        selectedType === type
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Buttons */}
              <div className="flex gap-2">
                {[
                  { key: '', label: 'All', icon: FiTarget },
                  { key: 'physical', label: 'Physical', icon: FiZap },
                  { key: 'special', label: 'Special', icon: FiActivity },
                  { key: 'status', label: 'Status', icon: FiTarget },
                ].map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all',
                      selectedCategory === cat.key
                        ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    )}
                  >
                    <cat.icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="container mx-auto px-4 py-3">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Showing <span className="font-semibold text-stone-700 dark:text-stone-200">{filteredMoves.length}</span> moves
            {selectedType && ` of type ${selectedType}`}
            {selectedCategory && ` (${selectedCategory})`}
          </p>
        </div>

        {/* Unified Data Table */}
        <div className="container mx-auto px-4 pb-8">
          <UnifiedDataTable
            data={filteredMoves}
            columns={columns}
            getItemKey={(move) => move.id}
            onItemClick={(move) => router.push(`/pokemon/moves/${move.name}`)}
            loading={loading}
            searchable={true}
            searchKeys={['name', 'effect', 'short_effect']}
            searchPlaceholder="Search moves..."
            defaultSort="name"
            expandable={true}
            renderExpanded={renderExpanded}
            virtualize={true}
            striped={true}
            hover={true}
          />
        </div>
      </div>
    </>
  );
};

// Full bleed layout
(MovesPage as NextPage & { fullBleed?: boolean }).fullBleed = true;

export default MovesPage;