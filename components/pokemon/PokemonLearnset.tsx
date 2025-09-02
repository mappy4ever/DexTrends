import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { showdownQueries, PokemonLearnsetRecord, MoveCompetitiveDataRecord } from '@/utils/supabase';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { EnhancedMoveDisplay } from './EnhancedMoveDisplay';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { PillBadgeGroup } from '@/components/ui/PillBadgeGroup';
import { POKEMON_TYPE_COLORS } from '@/utils/unifiedTypeColors';
import logger from '@/utils/logger';

interface PokemonLearnsetProps {
  pokemonId: string;
  generation?: number;
  className?: string;
}

interface GroupedMoves {
  [method: string]: PokemonLearnsetRecord[];
}

const learnMethodLabels: Record<string, string> = {
  'level-up': 'Level Up',
  'machine': 'TM/HM',
  'egg': 'Egg Moves',
  'tutor': 'Move Tutor',
  'other': 'Other'
};

export function PokemonLearnset({ 
  pokemonId, 
  generation = 9,
  className 
}: PokemonLearnsetProps) {
  const [moves, setMoves] = useState<PokemonLearnsetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedGeneration, setSelectedGeneration] = useState<number>(generation);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [moveDataMap, setMoveDataMap] = useState<Map<string, MoveCompetitiveDataRecord>>(new Map());
  const [showCumulative, setShowCumulative] = useState<boolean>(true); // Show cumulative moves by default
  const [loadingMoveData, setLoadingMoveData] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ensure selectedGeneration is within valid bounds
  useEffect(() => {
    if (selectedGeneration > generation) {
      setSelectedGeneration(generation);
    } else if (selectedGeneration < 1) {
      setSelectedGeneration(1);
    }
  }, [selectedGeneration, generation]);

  useEffect(() => {
    async function fetchLearnset() {
      try {
        setLoading(true);
        setError(null);
        
        // Validate inputs
        if (!pokemonId) {
          throw new Error('Pokemon ID is required');
        }
        
        // Check if showdownQueries is available
        if (!showdownQueries || typeof showdownQueries.getPokemonLearnset !== 'function') {
          logger.error('Showdown queries not available:', { showdownQueries });
          throw new Error('Showdown data not available. Check Supabase configuration.');
        }
        
        // Fetch learnset for the maximum generation to get all moves
        const learnset = await showdownQueries.getPokemonLearnset(
          pokemonId,
          generation // Always fetch from max generation
        );
        
        // Handle null/undefined response
        if (!learnset) {
          setMoves([]);
          return;
        }
        
        // Ensure learnset is an array
        const movesArray = Array.isArray(learnset) ? learnset : [];
        
        // Validate move data in development only
        if (process.env.NODE_ENV === 'development') {
          const genCounts = movesArray.reduce((acc, move) => {
            const gen = move.generation || 'unknown';
            acc[gen] = (acc[gen] || 0) + 1;
            return acc;
          }, {} as Record<string | number, number>);
          
          logger.debug(`[PokemonLearnset] Fetched ${movesArray.length} moves for ${pokemonId}. Generation distribution:`, { genCounts });
        }
        
        // Always set all moves, filtering will be done in filteredMoves
        setMoves(movesArray);
      } catch (err) {
        logger.error('Failed to fetch learnset:', { err });
        setError(err instanceof Error ? err.message : 'Failed to load move data');
        setMoves([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    }

    fetchLearnset();
  }, [pokemonId, generation]); // Use max generation, not selected

  // Fetch move data for all moves with debouncing
  useEffect(() => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Debounce the fetch to avoid rapid successive calls
    fetchTimeoutRef.current = setTimeout(async () => {
      if (moves.length === 0) {
        setMoveDataMap(new Map());
        return;
      }
      
      setLoadingMoveData(true);
      const newMoveDataMap = new Map<string, MoveCompetitiveDataRecord>();
      
      // Check if showdownQueries is available
      if (!showdownQueries || typeof showdownQueries.getMoveData !== 'function') {
        logger.warn('Showdown queries not available for move data');
        setLoadingMoveData(false);
        return;
      }
      
      try {
        // Fetch data for all unique moves with batching to prevent overload
        const uniqueMoves = [...new Set(moves.map(m => m.move_name))];
        const batchSize = 10; // Process moves in batches
        
        for (let i = 0; i < uniqueMoves.length; i += batchSize) {
          const batch = uniqueMoves.slice(i, i + batchSize);
          const batchPromises = batch.map(async (moveName) => {
            try {
              const data = await showdownQueries.getMoveData(moveName);
              if (data) {
                newMoveDataMap.set(moveName, data);
              }
            } catch (error) {
              logger.error(`Failed to fetch data for move ${moveName}:`, { error, moveName });
            }
          });
          
          await Promise.all(batchPromises);
        }
        
        setMoveDataMap(newMoveDataMap);
      } catch (error) {
        logger.error('Error fetching move data:', { error });
      } finally {
        setLoadingMoveData(false);
      }
    }, 500); // 500ms debounce
    
    // Cleanup on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [moves]);

  // Calculate moves after generation and method filters (for determining available types/categories)
  const movesAfterBasicFilters = useMemo(() => {
    // First, validate and filter out moves with invalid generation data
    let validMoves = moves.filter(move => {
      // Ensure move has a valid generation between 1 and 9
      const gen = move.generation;
      return gen && gen >= 1 && gen <= 9;
    });
    
    // Filter by generation based on cumulative setting
    let movesToProcess = validMoves;
    if (showCumulative) {
      // Show all moves up to and including selected generation
      movesToProcess = validMoves.filter(move => move.generation <= selectedGeneration);
    } else {
      // Show only moves introduced in the selected generation
      movesToProcess = validMoves.filter(move => move.generation === selectedGeneration);
    }
    
    // Filter by method if needed
    if (selectedMethod !== 'all') {
      movesToProcess = movesToProcess.filter(move => move.learn_method === selectedMethod);
    }
    
    // Then deduplicate moves by name, keeping the earliest generation/method
    const moveMap = new Map<string, PokemonLearnsetRecord & { generations: number[] }>();
    
    movesToProcess.forEach(move => {
      const existing = moveMap.get(move.move_name);
      if (!existing || move.generation < existing.generation) {
        moveMap.set(move.move_name, {
          ...move,
          generations: existing ? [...existing.generations, move.generation] : [move.generation]
        });
      } else if (existing && !existing.generations.includes(move.generation)) {
        existing.generations.push(move.generation);
      }
    });
    
    const result = Array.from(moveMap.values());
    
    // Debug logging in development only
    if (process.env.NODE_ENV === 'development' && result.length === 0 && validMoves.length > 0) {
      logger.warn('[PokemonLearnset] No moves after filtering', { validMovesCount: validMoves.length, selectedGeneration, showCumulative, selectedMethod });
    }
    
    return result;
  }, [moves, selectedMethod, showCumulative, selectedGeneration]);

  // Deduplicate moves and filter based on selected types and categories
  const filteredMoves = useMemo(() => {
    let filtered = movesAfterBasicFilters;
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(move => 
        move.move_name.toLowerCase().includes(searchLower) ||
        move.move_name.replace(/-/g, ' ').toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by type
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(move => {
        const moveData = moveDataMap.get(move.move_name);
        // If no move data, include it if "unknown" is selected
        if (!moveData) {
          return selectedTypes.includes('unknown');
        }
        return selectedTypes.includes(moveData.type || 'unknown');
      });
    }
    
    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(move => {
        const moveData = moveDataMap.get(move.move_name);
        // If no move data, include it if "unknown" is selected
        if (!moveData) {
          return selectedCategories.includes('unknown');
        }
        return selectedCategories.includes(moveData.category || 'unknown');
      });
    }
    
    return filtered;
  }, [movesAfterBasicFilters, selectedTypes, selectedCategories, moveDataMap, searchTerm]);

  // Group moves by learn method
  const groupedMoves = useMemo(() => {
    const groups: GroupedMoves = {};
    
    filteredMoves.forEach(move => {
      if (!groups[move.learn_method]) {
        groups[move.learn_method] = [];
      }
      groups[move.learn_method].push(move);
    });

    // Sort level-up moves by level
    if (groups['level-up']) {
      groups['level-up'].sort((a, b) => (a.level || 0) - (b.level || 0));
    }

    return groups;
  }, [filteredMoves]);

  const availableMethods = useMemo(() => {
    const methods = new Set(moves.map(m => m.learn_method));
    return ['all', ...Array.from(methods)];
  }, [moves]);

  // Get available types and categories from move data (based on current generation/method filters)
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    let hasUnknown = false;
    
    movesAfterBasicFilters.forEach(move => {
      const moveData = moveDataMap.get(move.move_name);
      if (moveData?.type) {
        types.add(moveData.type);
      } else {
        hasUnknown = true;
      }
    });
    
    const sortedTypes = Array.from(types).sort();
    // Add "unknown" at the end if there are moves without type data
    if (hasUnknown || (movesAfterBasicFilters.length > 0 && types.size === 0)) {
      sortedTypes.push('unknown');
    }
    
    return sortedTypes;
  }, [movesAfterBasicFilters, moveDataMap]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    let hasUnknown = false;
    
    movesAfterBasicFilters.forEach(move => {
      const moveData = moveDataMap.get(move.move_name);
      if (moveData?.category) {
        categories.add(moveData.category);
      } else {
        hasUnknown = true;
      }
    });
    
    const sortedCategories = Array.from(categories).sort();
    // Add "unknown" at the end if there are moves without category data
    if (hasUnknown || (movesAfterBasicFilters.length > 0 && categories.size === 0)) {
      sortedCategories.push('unknown');
    }
    
    return sortedCategories;
  }, [movesAfterBasicFilters, moveDataMap]);

  // Clean up selected types/categories that are no longer available
  useEffect(() => {
    if (selectedTypes.length > 0) {
      const validTypes = selectedTypes.filter(type => availableTypes.includes(type));
      if (validTypes.length !== selectedTypes.length) {
        setSelectedTypes(validTypes);
      }
    }
  }, [availableTypes, selectedTypes]);

  useEffect(() => {
    if (selectedCategories.length > 0) {
      const validCategories = selectedCategories.filter(cat => availableCategories.includes(cat));
      if (validCategories.length !== selectedCategories.length) {
        setSelectedCategories(validCategories);
      }
    }
  }, [availableCategories, selectedCategories]);

  // Create filter options for PillBadgeGroup
  const typeFilterOptions = useMemo(() => {
    return availableTypes.map(type => ({
      id: type,
      label: type === 'unknown' ? 'Unknown' : type.charAt(0).toUpperCase() + type.slice(1),
      color: type === 'unknown' ? '#9ca3af' : (POKEMON_TYPE_COLORS[type] || '#68a090')
    }));
  }, [availableTypes]);

  const categoryFilterOptions = useMemo(() => {
    const categoryLabels = {
      physical: 'Physical',
      special: 'Special',
      status: 'Status',
      unknown: 'Unknown'
    };
    
    return availableCategories.map(category => ({
      id: category,
      label: categoryLabels[category as keyof typeof categoryLabels] || category
    }));
  }, [availableCategories]);

  const methodFilterOptions = useMemo(() => {
    return availableMethods.map(method => ({
      id: method,
      label: method === 'all' ? 'All Moves' : learnMethodLabels[method] || method
    }));
  }, [availableMethods]);

  const generations = Array.from({ length: generation }, (_, i) => i + 1);
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedMethod('all');
    setSelectedGeneration(generation);
    setSelectedTypes([]);
    setSelectedCategories([]);
    setSearchTerm('');
    setShowCumulative(true);
  };

  if (loading) {
    return (
      <div className={cn('space-y-4', className)} data-testid="learnset-loading">
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('text-center py-8 text-red-500', className)}>
        {error}
      </div>
    );
  }

  if (moves.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500 dark:text-gray-400', className)}>
        No moves found for this Pokémon
      </div>
    );
  }
  
  // Check if we have valid moves after filtering
  const hasValidMoves = moves.some(move => move.generation && move.generation >= 1 && move.generation <= 9);
  if (!hasValidMoves) {
    return (
      <div className={cn('text-center py-8 text-red-500', className)}>
        Move data appears to be invalid. Please check the database configuration.
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)} data-testid="pokemon-learnset">
      {/* Filters */}
      <div className="space-y-4">
        {/* Search and Reset */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search moves..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
        
        {/* Generation selector with cumulative toggle */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Generation:</label>
            <select
              data-testid="generation-select"
              value={selectedGeneration}
              onChange={(e) => setSelectedGeneration(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {generations.map(gen => (
                <option key={gen} value={gen}>Gen {gen}</option>
              ))}
            </select>
          </div>
          
          {/* Cumulative toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cumulative-toggle"
              checked={showCumulative}
              onChange={(e) => setShowCumulative(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="cumulative-toggle" className="text-sm text-gray-700 dark:text-gray-300">
              Show all moves up to Gen {selectedGeneration}
            </label>
          </div>
        </div>

        {/* Method filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Learn Method:</label>
          <PillBadgeGroup
            options={methodFilterOptions}
            value={selectedMethod}
            onChange={(value) => setSelectedMethod(value as string)}
            variant="outlined"
            size="sm"
            showAll={false}
          />
        </div>

        {/* Type filter */}
        {availableTypes.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Filter by Type:</label>
            <PillBadgeGroup
              options={typeFilterOptions}
              value={selectedTypes}
              onChange={(value) => setSelectedTypes(value as string[])}
              variant="filled"
              size="sm"
              multiple
              showAll
              maxVisible={10}
            />
          </div>
        )}

        {/* Category filter */}
        {availableCategories.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Filter by Category:</label>
            <PillBadgeGroup
              options={categoryFilterOptions}
              value={selectedCategories}
              onChange={(value) => setSelectedCategories(value as string[])}
              variant="outlined"
              size="sm"
              multiple
              showAll
            />
          </div>
        )}
      </div>

      {/* Move count summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Total Moves: {filteredMoves.length}
            {loadingMoveData && (
              <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                (Loading move details...)
              </span>
            )}
          </span>
          <span className="text-xs text-blue-600 dark:text-blue-300">
            {showCumulative 
              ? `Showing all moves available up to Generation ${selectedGeneration}`
              : `Showing only moves introduced in Generation ${selectedGeneration}`
            }
          </span>
        </div>
      </div>

      {/* Moves display */}
      {selectedMethod === 'all' ? (
        // Grouped view with better organization
        <div className="space-y-8">
          {Object.entries(groupedMoves)
            .sort(([a], [b]) => {
              // Sort by method priority
              const order = ['level-up', 'machine', 'egg', 'tutor', 'other'];
              return order.indexOf(a) - order.indexOf(b);
            })
            .map(([method, methodMoves]) => (
            <div key={method} className="relative">
              <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pb-2">
                <div className="flex items-center justify-between border-b-2 border-gray-200 dark:border-gray-700 pb-2">
                  <h3 className="text-lg font-bold flex items-center gap-3">
                    {method === 'level-up' && <span className="text-green-500 text-sm">LV</span>}
                    {method === 'machine' && <span className="text-blue-500 text-sm">TM</span>}
                    {method === 'egg' && <span className="text-pink-500 text-sm">EGG</span>}
                    {method === 'tutor' && <span className="text-purple-500 text-sm">TUT</span>}
                    {learnMethodLabels[method] || method}
                  </h3>
                  <span className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {methodMoves.length} moves
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3 overflow-visible">
                {methodMoves.map((move, index) => (
                  <MoveItem 
                    key={`${move.move_name}-${index}`} 
                    move={move} 
                    moveData={moveDataMap.get(move.move_name) || null}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Single method view with count
        <div>
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredMoves.length} {learnMethodLabels[selectedMethod]?.toLowerCase() || selectedMethod} moves
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-visible">
            {filteredMoves.map((move, index) => (
              <MoveItem 
                key={`${move.move_name}-${index}`} 
                move={move} 
                moveData={moveDataMap.get(move.move_name) || null}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual move item component
interface MoveItemProps {
  move: PokemonLearnsetRecord;
  moveData: MoveCompetitiveDataRecord | null;
}

function MoveItem({ move, moveData }: MoveItemProps) {
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();
  
  const displayName = move.move_name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Determine move type - use moveData if available, otherwise try to infer from move name
  const moveType = moveData?.type || 'normal';

  const handleMoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/pokemon/moves/${move.move_name}`);
  };

  return (
    <div className="space-y-2 overflow-visible">
      <div 
        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer overflow-visible" 
        data-testid="move-item"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex-1">
          <div 
            className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer inline-block"
            onClick={handleMoveClick}
          >
            {displayName}
          </div>
          
          {/* Always show type badge and move stats */}
          <div className="flex items-center gap-2 mt-1">
            <TypeBadge type={moveType} size="sm" />
            {moveData && (
              <>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {moveData.power ? `Power: ${moveData.power}` : 'Power: —'} / 
                  {moveData.accuracy ? `Acc: ${moveData.accuracy}%` : 'Acc: —'}
                </span>
                <CategoryIcon category={moveData.category} size={14} />
              </>
            )}
          </div>
          
          {/* Learn method info with generation indicators */}
          <div className="flex items-center gap-2 mt-1">
            {move.learn_method === 'level-up' && move.level && (
              <div className="text-sm text-gray-500 dark:text-gray-400">Level {move.level}</div>
            )}
            {move.learn_method === 'machine' && (
              <div className="text-sm text-gray-500 dark:text-gray-400">TM/HM</div>
            )}
            {/* Show all generations this move is available in */}
            {(move as any).generations && (move as any).generations.length > 1 && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Gens: {(move as any).generations.sort((a: number, b: number) => a - b).join(', ')}
              </div>
            )}
            {!((move as any).generations && (move as any).generations.length > 1) && (
              <div className="text-xs text-gray-400 dark:text-gray-500">Gen {move.generation}</div>
            )}
          </div>
        </div>
        <div className="ml-2">
          <svg 
            className={cn("w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform", showDetails && "rotate-180")} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {showDetails && (
        <EnhancedMoveDisplay 
          moveName={move.move_name} 
          className="ml-4"
        />
      )}
    </div>
  );
}