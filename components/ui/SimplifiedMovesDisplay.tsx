import React, { useState, useEffect } from 'react';
import { TypeBadge } from './TypeBadge';
import { fetchJSON } from '../../utils/unifiedFetch';

interface Move {
  move: {
    name: string;
    url: string;
  };
  version_group_details: VersionGroupDetail[];
}

interface VersionGroupDetail {
  level_learned_at: number;
  move_learn_method: {
    name: string;
  };
  version_group: {
    name: string;
  };
}

interface MoveData {
  name: string;
  type: {
    name: string;
  };
  damage_class?: {
    name: string;
  };
  power: number | null;
  accuracy: number | null;
  pp: number;
}

interface GroupedMove extends Move {
  level: number;
  moveData?: MoveData;
  versionGroup: string;
  machineNumber?: string | null;
}

interface SimplifiedMovesDisplayProps {
  moves: Move[];
  pokemonName: string;
}

type MoveMethod = 'level-up' | 'machine' | 'egg' | 'tutor';

const SimplifiedMovesDisplay: React.FC<SimplifiedMovesDisplayProps> = ({ moves, pokemonName }) => {
  const [movesData, setMovesData] = useState<Record<string, MoveData>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MoveMethod>('level-up');
  const [selectedVersion, setSelectedVersion] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadMovesData();
  }, [moves]);

  // Version groups mapping
  const versionGroups: Record<string, string> = {
    'all': 'All Games',
    'red-blue': 'Red/Blue/Yellow',
    'gold-silver': 'Gold/Silver/Crystal',
    'ruby-sapphire': 'Ruby/Sapphire/Emerald',
    'diamond-pearl': 'Diamond/Pearl/Platinum',
    'black-white': 'Black/White/B2W2',
    'x-y': 'X/Y',
    'sun-moon': 'Sun/Moon/USUM',
    'sword-shield': 'Sword/Shield',
    'scarlet-violet': 'Scarlet/Violet'
  };

  // Extract TM/HM number from move data
  const extractMachineNumber = (moveName: string, versionDetail: VersionGroupDetail): string | null => {
    // The API doesn't directly provide TM/HM numbers, so we'll need to parse them
    // This is a simplified approach - in a real app, you'd want a comprehensive mapping
    return null; // For now, return null as the API doesn't provide this directly
  };

  const loadMovesData = async (): Promise<void> => {
    setLoading(true);
    const newMovesData: Record<string, MoveData> = {};
    
    // Get unique move names to avoid loading duplicates
    const uniqueMoveNames = [...new Set(moves.map(m => m.move.name))];
    // Load data for first 30 unique moves to balance performance and data
    const movesToLoad = uniqueMoveNames.slice(0, 30);
    
    for (const moveName of movesToLoad) {
      try {
        const moveData = await fetchJSON<any>(`https://pokeapi.co/api/v2/move/${moveName}`);
        newMovesData[moveName] = moveData;
      } catch (error) {
        console.error(`Failed to load move: ${moveName}`, error);
      }
    }
    
    setMovesData(newMovesData);
    setLoading(false);
  };

  // Group moves by learn method and deduplicate
  const groupedMoves: Record<MoveMethod, Record<string, GroupedMove>> = {
    'level-up': {},
    'machine': {},
    'egg': {},
    'tutor': {}
  };

  // First, collect all moves with their learn methods
  moves.forEach(moveInfo => {
    moveInfo.version_group_details.forEach(versionDetail => {
      // Filter by version if selected
      if (selectedVersion !== 'all') {
        const versionGroupName = versionDetail.version_group.name;
        if (!versionGroupName.includes(selectedVersion)) {
          return;
        }
      }

      const method = versionDetail.move_learn_method.name as MoveMethod;
      if (groupedMoves[method]) {
        const moveName = moveInfo.move.name;
        
        // For level-up moves, keep the lowest level
        if (method === 'level-up') {
          if (!groupedMoves[method][moveName] || 
              versionDetail.level_learned_at < groupedMoves[method][moveName].level) {
            groupedMoves[method][moveName] = {
              ...moveInfo,
              level: versionDetail.level_learned_at,
              moveData: movesData[moveInfo.move.name],
              versionGroup: versionDetail.version_group.name
            };
          }
        } else {
          // For other methods, just keep one instance
          groupedMoves[method][moveName] = {
            ...moveInfo,
            level: versionDetail.level_learned_at,
            moveData: movesData[moveInfo.move.name],
            versionGroup: versionDetail.version_group.name,
            machineNumber: method === 'machine' ? extractMachineNumber(moveInfo.move.name, versionDetail) : null
          };
        }
      }
    });
  });

  // Convert objects to arrays
  const finalGroupedMoves: Record<MoveMethod, GroupedMove[]> = {
    'level-up': Object.values(groupedMoves['level-up']).sort((a, b) => a.level - b.level),
    'machine': Object.values(groupedMoves['machine']),
    'egg': Object.values(groupedMoves['egg']),
    'tutor': Object.values(groupedMoves['tutor'])
  };

  const renderMovesTable = (movesList: GroupedMove[], showLevel = false, showMachine = false) => {
    if (movesList.length === 0) return <p className="text-gray-500 text-center py-4">No moves found</p>;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              {showLevel && <th className="px-2 py-2 text-left font-medium text-gray-700">Level</th>}
              {showMachine && <th className="px-2 py-2 text-left font-medium text-gray-700">TM</th>}
              <th className="px-2 py-2 text-left font-medium text-gray-700">Move</th>
              <th className="px-2 py-2 text-center font-medium text-gray-700">Type</th>
              <th className="px-2 py-2 text-center font-medium text-gray-700">Cat.</th>
              <th className="px-2 py-2 text-center font-medium text-gray-700">Pwr.</th>
              <th className="px-2 py-2 text-center font-medium text-gray-700">Acc.</th>
              <th className="px-2 py-2 text-center font-medium text-gray-700">PP</th>
            </tr>
          </thead>
          <tbody>
            {movesList.map((move, index) => {
              const moveData = move.moveData;
              const damageClass = moveData?.damage_class?.name || 'status';
              
              return (
                <tr key={`${move.move.name}-${index}`} className="border-b border-gray-200 hover:bg-gray-50">
                  {showLevel && (
                    <td className="px-2 py-2 text-center font-medium">
                      {move.level > 0 ? move.level : '—'}
                    </td>
                  )}
                  {showMachine && (
                    <td className="px-2 py-2 text-center font-medium">
                      {move.machineNumber || '—'}
                    </td>
                  )}
                  <td className="px-2 py-2 font-medium capitalize">
                    {move.move.name.replace(/-/g, ' ')}
                  </td>
                  <td className="px-2 py-2 text-center">
                    {moveData && <TypeBadge type={moveData.type.name} size="sm" />}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      damageClass === 'physical' ? 'bg-red-600 text-yellow-300' :
                      damageClass === 'special' ? 'bg-blue-900 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {damageClass === 'physical' ? 'Physical' :
                       damageClass === 'special' ? 'Special' :
                       'Status'}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center font-medium">
                    {moveData?.power || '—'}
                  </td>
                  <td className="px-2 py-2 text-center font-medium">
                    {moveData?.accuracy ? `${moveData.accuracy}%` : '—'}
                  </td>
                  <td className="px-2 py-2 text-center font-medium">
                    {moveData?.pp || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const tabs = [
    { id: 'level-up' as MoveMethod, label: 'Level Up', count: finalGroupedMoves['level-up'].length },
    { id: 'machine' as MoveMethod, label: 'TM/HM', count: finalGroupedMoves['machine'].length },
    { id: 'egg' as MoveMethod, label: 'Egg Moves', count: finalGroupedMoves['egg'].length },
    { id: 'tutor' as MoveMethod, label: 'Move Tutor', count: finalGroupedMoves['tutor'].length }
  ];

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading moves data...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Moves</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Game Version
          </label>
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pokemon-red focus:border-transparent"
          >
            {Object.entries(versionGroups).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-pokemon-red border-b-2 border-pokemon-red'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {activeTab === 'level-up' && renderMovesTable(finalGroupedMoves['level-up'], true, false)}
        {activeTab === 'machine' && renderMovesTable(finalGroupedMoves['machine'], false, true)}
        {activeTab === 'egg' && renderMovesTable(finalGroupedMoves['egg'], false, false)}
        {activeTab === 'tutor' && renderMovesTable(finalGroupedMoves['tutor'], false, false)}
      </div>
    </div>
  );
};

export default SimplifiedMovesDisplay;