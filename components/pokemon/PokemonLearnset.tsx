import React, { useEffect, useState, useMemo } from 'react';
import { showdownQueries, PokemonLearnsetRecord } from '@/utils/supabase';
import { cn } from '@/utils/cn';
import { TypeGradientBadge } from '@/components/ui/design-system/TypeGradientBadge';
import Skeleton from '@/components/ui/SkeletonLoader';
import { EnhancedMoveDisplay } from './EnhancedMoveDisplay';

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

const learnMethodIcons: Record<string, string> = {
  'level-up': '📈',
  'machine': '💿',
  'egg': '🥚',
  'tutor': '👨‍🏫',
  'other': '❓'
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

  useEffect(() => {
    async function fetchLearnset() {
      try {
        setLoading(true);
        setError(null);
        
        const learnset = await showdownQueries.getPokemonLearnset(
          pokemonId,
          selectedGeneration
        );
        
        if (selectedMethod !== 'all') {
          setMoves(learnset.filter(move => move.learn_method === selectedMethod));
        } else {
          setMoves(learnset);
        }
      } catch (err) {
        console.error('Failed to fetch learnset:', err);
        setError('Failed to load move data');
      } finally {
        setLoading(false);
      }
    }

    fetchLearnset();
  }, [pokemonId, selectedGeneration, selectedMethod]);

  // Group moves by learn method
  const groupedMoves = useMemo(() => {
    const groups: GroupedMoves = {};
    
    moves.forEach(move => {
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
  }, [moves]);

  const availableMethods = useMemo(() => {
    const methods = new Set(moves.map(m => m.learn_method));
    return ['all', ...Array.from(methods)];
  }, [moves]);

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
      <div className={cn('text-center py-8 text-gray-500', className)}>
        No moves found for this Pokémon
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)} data-testid="pokemon-learnset">
      {/* Filters */}
      <div className="space-y-3">
        {/* Generation selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Generation:</label>
          <select
            data-testid="generation-select"
            value={selectedGeneration}
            onChange={(e) => setSelectedGeneration(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {generations.map(gen => (
              <option key={gen} value={gen}>Gen {gen}</option>
            ))}
          </select>
        </div>

        {/* Method filter */}
        <div className="flex flex-wrap gap-2">
          {availableMethods.map(method => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                selectedMethod === method
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {method === 'all' ? 'All Moves' : (
                <>
                  <span className="mr-1">{learnMethodIcons[method] || ''}</span>
                  {learnMethodLabels[method] || method}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Moves display */}
      {selectedMethod === 'all' ? (
        // Grouped view
        <div className="space-y-6">
          {Object.entries(groupedMoves).map(([method, methodMoves]) => (
            <div key={method}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>{learnMethodIcons[method] || ''}</span>
                {learnMethodLabels[method] || method}
                <span className="text-sm text-gray-500 font-normal">
                  ({methodMoves.length} moves)
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {methodMoves.map((move, index) => (
                  <MoveItem key={`${move.move_name}-${index}`} move={move} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Single method view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {moves.map((move, index) => (
            <MoveItem key={`${move.move_name}-${index}`} move={move} />
          ))}
        </div>
      )}
    </div>
  );
}

// Individual move item component
interface MoveItemProps {
  move: PokemonLearnsetRecord;
}

function MoveItem({ move }: MoveItemProps) {
  const [showDetails, setShowDetails] = useState(false);
  const displayName = move.move_name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="space-y-2">
      <div 
        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
        data-testid="move-item"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex-1">
          <div className="font-medium text-gray-900">{displayName}</div>
          {move.learn_method === 'level-up' && move.level && (
            <div className="text-sm text-gray-500">Level {move.level}</div>
          )}
          {move.learn_method === 'machine' && (
            <div className="text-sm text-gray-500">TM/HM</div>
          )}
          <div className="text-xs text-gray-400 mt-0.5">Gen {move.generation}</div>
        </div>
        <div className="ml-2">
          <svg 
            className={cn("w-5 h-5 text-gray-400 transition-transform", showDetails && "rotate-180")} 
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