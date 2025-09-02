import React, { useState, useEffect, useCallback } from 'react';
import { fetchJSON } from '../../utils/unifiedFetch';
import logger from "@/utils/logger";
import { TypeBadge } from './TypeBadge';

// Types
interface MoveLearnMethod {
  name: string;
}

interface VersionGroupDetail {
  level_learned_at: number;
  move_learn_method: MoveLearnMethod;
}

interface Move {
  name: string;
  url: string;
}

interface MoveInfo {
  move: Move;
  version_group_details: VersionGroupDetail[];
}

interface ExtendedMoveInfo extends MoveInfo {
  level: number;
  method: string;
}

interface Type {
  name: string;
}

interface DamageClass {
  name: string;
}

interface EffectEntry {
  language: {
    name: string;
  };
  short_effect?: string;
  effect?: string;
}

interface MoveData {
  name: string;
  type?: Type;
  damage_class?: DamageClass;
  power?: number;
  accuracy?: number;
  pp?: number;
  effect_entries?: EffectEntry[];
  versionDetails?: VersionGroupDetail[];
}

interface MovesDataMap {
  [key: string]: MoveData;
}

interface GroupedMoves {
  [key: string]: ExtendedMoveInfo[];
}

interface EnhancedMovesDisplayProps {
  moves: MoveInfo[];
  pokemonName: string;
}

interface MoveCardProps {
  moveInfo: ExtendedMoveInfo;
  moveData?: MoveData;
}

type FilterType = 'all' | 'level' | 'tm' | 'egg' | 'tutor';


const EnhancedMovesDisplay: React.FC<EnhancedMovesDisplayProps> = ({ moves, pokemonName }) => {
  const [movesData, setMovesData] = useState<MovesDataMap>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  const loadMovesData = useCallback(async () => {
    setLoading(true);
    const moveDetails: MovesDataMap = {};
    
    // Load first 30 moves to avoid too many API calls and improve performance
    const movesToLoad = moves.slice(0, 30);
    
    for (const moveInfo of movesToLoad) {
      try {
        const moveData = await fetchJSON<any>(moveInfo.move.url);
        moveDetails[moveInfo.move.name] = {
          ...moveData,
          versionDetails: moveInfo.version_group_details
        };
      } catch (err) {
        logger.error(`Failed to load move ${moveInfo.move.name}:`, err);
      }
    }
    
    setMovesData(moveDetails);
    setLoading(false);
  }, [moves]);

  useEffect(() => {
    loadMovesData();
  }, [loadMovesData]);

  // Group moves by learn method
  const groupedMoves: GroupedMoves = {};
  moves.forEach(moveInfo => {
    const latestVersion = moveInfo.version_group_details[moveInfo.version_group_details.length - 1];
    if (!latestVersion) return;
    
    const method = latestVersion.move_learn_method.name;
    if (!groupedMoves[method]) {
      groupedMoves[method] = [];
    }
    
    groupedMoves[method].push({
      ...moveInfo,
      level: latestVersion.level_learned_at,
      method: method
    });
  });

  // Sort level-up moves by level
  if (groupedMoves['level-up']) {
    groupedMoves['level-up'].sort((a, b) => a.level - b.level);
  }

  const getFilteredMoves = (): ExtendedMoveInfo[] => {
    if (filter === 'all') {
      return moves.map(moveInfo => {
        const latestVersion = moveInfo.version_group_details[moveInfo.version_group_details.length - 1];
        return {
          ...moveInfo,
          level: latestVersion?.level_learned_at || 0,
          method: latestVersion?.move_learn_method.name || 'unknown'
        };
      });
    }
    if (filter === 'level') return groupedMoves['level-up'] || [];
    if (filter === 'tm') return groupedMoves['machine'] || [];
    if (filter === 'egg') return groupedMoves['egg'] || [];
    if (filter === 'tutor') return groupedMoves['tutor'] || [];
    return [];
  };

  const filteredMoves = getFilteredMoves();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          Moves ({moves.length} total)
        </h3>
        <div className="flex gap-2">
          {[
            { value: 'all' as FilterType, label: 'All' },
            { value: 'level' as FilterType, label: 'Level Up' },
            { value: 'tm' as FilterType, label: 'TM/HM' },
            { value: 'egg' as FilterType, label: 'Egg' },
            { value: 'tutor' as FilterType, label: 'Tutor' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                filter === option.value
                  ? 'bg-pokemon-red text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pokemon-red mx-auto mb-2"></div>
          <p className="text-gray-600">Loading move details...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filter === 'all' ? (
            // Show grouped view for "all"
            Object.entries(groupedMoves).map(([method, methodMoves]) => (
              <div key={method} className="space-y-3">
                <h4 className="font-semibold text-gray-700 capitalize">
                  {method.replace(/-/g, ' ')} ({methodMoves.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {methodMoves.slice(0, 9).map(moveInfo => (
                    <MoveCard
                      key={`${moveInfo.move.name}-${method}`}
                      moveInfo={moveInfo}
                      moveData={movesData[moveInfo.move.name]}
                    />
                  ))}
                </div>
                {methodMoves.length > 9 && (
                  <p className="text-sm text-gray-500 text-center mt-4">
                    +{methodMoves.length - 9} more {method.replace(/-/g, ' ')} moves
                  </p>
                )}
              </div>
            ))
          ) : (
            // Show filtered view
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredMoves.map(moveInfo => (
                <MoveCard
                  key={moveInfo.move.name}
                  moveInfo={moveInfo}
                  moveData={movesData[moveInfo.move.name]}
                />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

const MoveCard: React.FC<MoveCardProps> = ({ moveInfo, moveData }) => {
  const moveName = moveInfo.move.name.replace(/-/g, ' ');
  const level = moveInfo.level;
  
  // Helper to format move type
  const formatType = (type?: string): string => {
    return type ? type.toUpperCase() : 'UNKNOWN';
  };
  
  // Helper to format damage class
  const formatCategory = (category?: string): string => {
    return category ? category.toUpperCase() : 'STATUS';
  };
  
  // Get category colors
  const getCategoryColors = (category?: string): string => {
    const upperCategory = category?.toUpperCase();
    switch (upperCategory) {
      case 'PHYSICAL':
        return 'bg-red-100 text-red-700';
      case 'SPECIAL':
        return 'bg-blue-100 text-blue-700';
      case 'STATUS':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-3 hover:shadow-md transition-all">
      {/* Top Section - Name + Tags */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 capitalize">{moveName}</h3>
          {level > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">Level {level}</p>
          )}
        </div>
        {moveData && moveData.type?.name && (
          <div className="flex gap-1 flex-wrap justify-end">
            <TypeBadge 
              type={moveData.type.name} 
              size="xs"
              className="!w-16"
            />
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColors(moveData.damage_class?.name)}`}>
              {formatCategory(moveData.damage_class?.name)}
            </span>
          </div>
        )}
      </div>
      
      {moveData ? (
        <>
          {/* Middle Section - Stats Grid */}
          <div className="flex justify-between text-sm text-gray-600">
            <div className="text-center">
              <span className="font-semibold text-gray-900">
                {moveData.power || '—'}
              </span>
              <br />
              <span className="text-xs">Power</span>
            </div>
            <div className="text-center">
              <span className="font-semibold text-gray-900">
                {moveData.accuracy ? `${moveData.accuracy}%` : '—'}
              </span>
              <br />
              <span className="text-xs">Accuracy</span>
            </div>
            <div className="text-center">
              <span className="font-semibold text-gray-900">
                {moveData.pp || '—'}
              </span>
              <br />
              <span className="text-xs">PP</span>
            </div>
          </div>
          
          {/* Bottom Section - Effect Description */}
          {(moveData.effect_entries?.find(e => e.language.name === 'en')?.short_effect || 
            moveData.effect_entries?.find(e => e.language.name === 'en')?.effect) && (
            <p className="text-xs italic text-gray-500 border-t pt-3">
              {moveData.effect_entries?.find(e => e.language.name === 'en')?.short_effect || 
               moveData.effect_entries?.find(e => e.language.name === 'en')?.effect}
            </p>
          )}
        </>
      ) : (
        <div className="text-center py-2">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMovesDisplay;