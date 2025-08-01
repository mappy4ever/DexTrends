import React, { useEffect, useState, useMemo } from 'react';
import { showdownQueries, PokemonLearnsetRecord, MoveCompetitiveDataRecord } from '@/utils/supabase';
import { cn } from '@/utils/cn';
import Skeleton from '@/components/ui/SkeletonLoader';
import { EnhancedMoveDisplay } from './EnhancedMoveDisplay';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { PillBadgeGroup } from '@/components/ui/PillBadgeGroup';
import { POKEMON_TYPE_COLORS } from '@/utils/pokemonTypeColors';

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
          console.error('Showdown queries not available:', showdownQueries);
          throw new Error('Showdown data not available. Check Supabase configuration.');
        }
        
        const learnset = await showdownQueries.getPokemonLearnset(
          pokemonId,
          selectedGeneration
        );
        
        // Handle null/undefined response
        if (!learnset) {
          setMoves([]);
          return;
        }
        
        // Ensure learnset is an array
        const movesArray = Array.isArray(learnset) ? learnset : [];
        
        if (selectedMethod !== 'all') {
          setMoves(movesArray.filter(move => move.learn_method === selectedMethod));
        } else {
          setMoves(movesArray);
        }
      } catch (err) {
        console.error('Failed to fetch learnset:', err);
        setError(err instanceof Error ? err.message : 'Failed to load move data');
        setMoves([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    }

    fetchLearnset();
  }, [pokemonId, selectedGeneration, selectedMethod]);

  // Fetch move data for all moves
  useEffect(() => {
    async function fetchAllMoveData() {
      if (moves.length === 0) return;
      
      const newMoveDataMap = new Map<string, MoveCompetitiveDataRecord>();
      
      // Fetch data for all unique moves
      const uniqueMoves = [...new Set(moves.map(m => m.move_name))];
      const moveDataPromises = uniqueMoves.map(async (moveName) => {
        try {
          const data = await showdownQueries.getMoveData(moveName);
          if (data) {
            newMoveDataMap.set(moveName, data);
          }
        } catch (error) {
          console.error(`Failed to fetch data for move ${moveName}:`, error);
        }
      });
      
      await Promise.all(moveDataPromises);
      setMoveDataMap(newMoveDataMap);
    }
    
    fetchAllMoveData();
  }, [moves]);

  // Filter moves based on selected types and categories
  const filteredMoves = useMemo(() => {
    let filtered = moves;
    
    // Filter by type
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(move => {
        const moveData = moveDataMap.get(move.move_name);
        return moveData && selectedTypes.includes(moveData.type || 'normal');
      });
    }
    
    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(move => {
        const moveData = moveDataMap.get(move.move_name);
        return moveData && selectedCategories.includes(moveData.category || 'physical');
      });
    }
    
    return filtered;
  }, [moves, selectedTypes, selectedCategories, moveDataMap]);

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
    const methods = new Set(filteredMoves.map(m => m.learn_method));
    return ['all', ...Array.from(methods)];
  }, [filteredMoves]);

  // Get available types and categories from move data
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

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    moves.forEach(move => {
      const moveData = moveDataMap.get(move.move_name);
      if (moveData?.category) {
        categories.add(moveData.category);
      }
    });
    return Array.from(categories);
  }, [moves, moveDataMap]);

  // Create filter options for PillBadgeGroup
  const typeFilterOptions = useMemo(() => {
    return availableTypes.map(type => ({
      id: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      color: POKEMON_TYPE_COLORS[type] || '#68a090'
    }));
  }, [availableTypes]);

  const categoryFilterOptions = useMemo(() => {
    const categoryLabels = {
      physical: 'Physical',
      special: 'Special',
      status: 'Status'
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

  return (
    <div className={cn('space-y-4', className)} data-testid="pokemon-learnset">
      {/* Filters */}
      <div className="space-y-4">
        {/* Generation selector */}
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

      {/* Moves display */}
      {selectedMethod === 'all' ? (
        // Grouped view
        <div className="space-y-6">
          {Object.entries(groupedMoves).map(([method, methodMoves]) => (
            <div key={method}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                {learnMethodLabels[method] || method}
                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                  ({methodMoves.length} moves)
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
        // Single method view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredMoves.map((move, index) => (
            <MoveItem 
              key={`${move.move_name}-${index}`} 
              move={move} 
              moveData={moveDataMap.get(move.move_name) || null}
            />
          ))}
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
  
  const displayName = move.move_name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="space-y-2">
      <div 
        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer" 
        data-testid="move-item"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-gray-100">{displayName}</div>
          
          {/* Move data badges */}
          {moveData ? (
            <div className="flex items-center gap-2 mt-1">
              <TypeBadge type={moveData.type || 'normal'} size="sm" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {moveData.base_power ? `Power: ${moveData.base_power}` : 'Power: —'} / 
                {moveData.accuracy ? `Acc: ${moveData.accuracy}%` : 'Acc: —'}
              </span>
              <CategoryIcon category={moveData.category} size={14} />
            </div>
          ) : null}
          
          {/* Learn method info */}
          <div className="flex items-center gap-2 mt-1">
            {move.learn_method === 'level-up' && move.level && (
              <div className="text-sm text-gray-500 dark:text-gray-400">Level {move.level}</div>
            )}
            {move.learn_method === 'machine' && (
              <div className="text-sm text-gray-500 dark:text-gray-400">TM/HM</div>
            )}
            <div className="text-xs text-gray-400 dark:text-gray-500">Gen {move.generation}</div>
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