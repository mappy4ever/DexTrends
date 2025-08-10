/**
 * IV/EV Heat Map Visualizer Component
 * Interactive 3D visualization for stat optimization
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RadarChart, BarChart } from '../ui/LazyChart';
import { 
  calculateAllStats, 
  calculateEVGains, 
  getRemainingEVs, 
  validateEVSpread,
  COMPETITIVE_SPREADS,
  STAT_SHORT_NAMES,
  generateEVHeatMapData
} from '../../utils/statCalculations';
import type { TeamMember, StatSpread } from '../../types/team-builder';
import type { Pokemon } from "../../types/pokemon";

// Chart.js registration is handled by LazyChart component

interface EVHeatMapProps {
  pokemon: Pokemon;
  teamMember?: TeamMember;
  onEVUpdate?: (evs: StatSpread) => void;
  level?: number;
  nature?: string;
}

interface DragState {
  isDragging: boolean;
  stat: keyof StatSpread | null;
  startValue: number;
}

const EVHeatMap: React.FC<EVHeatMapProps> = ({
  pokemon,
  teamMember,
  onEVUpdate,
  level = 50,
  nature = 'Hardy',
}) => {
  // State
  const [evs, setEvs] = useState<StatSpread>(
    teamMember?.evs || { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }
  );
  const [ivs] = useState<StatSpread>(
    teamMember?.ivs || { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 }
  );
  const [selectedSpread, setSelectedSpread] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    stat: null,
    startValue: 0,
  });
  const [hoveredStat, setHoveredStat] = useState<keyof StatSpread | null>(null);

  // Get base stats
  const baseStats = useMemo(() => {
    const stats: Record<string, number> = {};
    pokemon.stats?.forEach(stat => {
      stats[stat.stat.name] = stat.base_stat;
    });
    return stats;
  }, [pokemon]);

  // Calculate current stats
  const currentStats = useMemo(() => 
    calculateAllStats(baseStats, ivs, evs, level, nature),
    [baseStats, ivs, evs, level, nature]
  );

  // EV validation
  const validation = useMemo(() => validateEVSpread(evs), [evs]);
  const remainingEVs = useMemo(() => getRemainingEVs(evs), [evs]);

  // Heat map data
  const heatMapData = useMemo(() => 
    generateEVHeatMapData(baseStats, evs, level, nature),
    [baseStats, evs, level, nature]
  );

  // Update EVs with validation
  const updateEV = useCallback((stat: keyof StatSpread, value: number) => {
    const newValue = Math.max(0, Math.min(252, value));
    const newEvs = { ...evs, [stat]: newValue };
    
    // Check total EVs don't exceed 510
    const total = Object.values(newEvs).reduce((sum, ev) => sum + ev, 0);
    if (total > 510) {
      // Reduce from other stats proportionally
      const excess = total - 510;
      const otherStats = Object.keys(newEvs).filter(s => s !== stat) as (keyof StatSpread)[];
      const reduction = Math.ceil(excess / otherStats.length);
      
      otherStats.forEach(s => {
        newEvs[s] = Math.max(0, newEvs[s] - reduction);
      });
    }
    
    setEvs(newEvs);
    onEVUpdate?.(newEvs);
  }, [evs, onEVUpdate]);

  // Apply competitive spread
  const applySpread = useCallback((spreadKey: string) => {
    const spread = COMPETITIVE_SPREADS[spreadKey as keyof typeof COMPETITIVE_SPREADS];
    if (spread) {
      setEvs(spread.evs);
      setSelectedSpread(spreadKey);
      onEVUpdate?.(spread.evs);
    }
  }, [onEVUpdate]);

  // Drag handlers
  const handleDragStart = (stat: keyof StatSpread, e: React.MouseEvent) => {
    setDragState({
      isDragging: true,
      stat,
      startValue: evs[stat],
    });
    e.preventDefault();
  };

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.stat) return;
    
    const deltaY = e.movementY;
    const change = -deltaY * 4; // 4 EVs per pixel
    const newValue = evs[dragState.stat] + change;
    
    updateEV(dragState.stat, newValue);
  }, [dragState, evs, updateEV]);

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      stat: null,
      startValue: 0,
    });
  }, []);

  // Set up drag listeners
  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
    return undefined;
  }, [dragState.isDragging, handleDragMove, handleDragEnd]);

  // Radar chart data
  const radarData = {
    labels: Object.values(STAT_SHORT_NAMES),
    datasets: [
      {
        label: 'Base Stats',
        data: ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'].map(
          stat => baseStats[stat === 'specialAttack' ? 'special-attack' : 
                             stat === 'specialDefense' ? 'special-defense' : stat] || 0
        ),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
      },
      {
        label: 'Current Stats',
        data: Object.values(currentStats),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: Math.max(...Object.values(currentStats)) + 50,
        ticks: {
          stepSize: 50,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: { dataset: { label?: string }, parsed: { r: number }, dataIndex: number }) => {
            const label = context.dataset.label || '';
            const value = context.parsed.r;
            const statIndex = context.dataIndex;
            const statName = Object.keys(STAT_SHORT_NAMES)[statIndex];
            const evValue = evs[statName as keyof StatSpread];
            
            if (label === 'Current Stats') {
              return `${label}: ${value} (${evValue} EVs)`;
            }
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  // EV bar chart data
  const barData = {
    labels: Object.values(STAT_SHORT_NAMES),
    datasets: [
      {
        label: 'EVs',
        data: Object.values(evs),
        backgroundColor: Object.keys(evs).map((stat, index) => {
          const efficiency = heatMapData[index]?.efficiency || 0;
          // Color based on efficiency
          if (efficiency > 0.4) return 'rgba(34, 197, 94, 0.8)'; // Green
          if (efficiency > 0.3) return 'rgba(251, 191, 36, 0.8)'; // Yellow
          return 'rgba(239, 68, 68, 0.8)'; // Red
        }),
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 252,
        ticks: {
          stepSize: 52,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: { parsed: { y: number }, dataIndex: number }) => {
            const value = context.parsed.y;
            const statIndex = context.dataIndex;
            const statKey = Object.keys(evs)[statIndex] as keyof StatSpread;
            const statName = Object.keys(STAT_SHORT_NAMES)[statIndex];
            const baseStat = baseStats[statName === 'specialAttack' ? 'special-attack' : 
                                       statName === 'specialDefense' ? 'special-defense' : statName] || 0;
            
            const { gain } = calculateEVGains(baseStat, 0, value, level, nature, statKey);
            
            return [`${value} EVs`, `+${gain} stat points`];
          },
        },
      },
    },
    onClick: (event: unknown, elements: Array<{ index: number }>) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const stat = Object.keys(evs)[index] as keyof StatSpread;
        setHoveredStat(stat);
      }
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          EV Optimization Heat Map
        </h3>
        <div className="text-sm">
          <span className="text-gray-600 dark:text-gray-400">Remaining EVs: </span>
          <span className={`font-bold ${remainingEVs > 0 ? 'text-blue-600' : 'text-green-600'}`}>
            {remainingEVs}
          </span>
        </div>
      </div>

      {/* Validation Errors */}
      {!validation.valid && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">EV Spread Issues:</p>
          <ul className="mt-1 text-xs text-red-500 dark:text-red-300 list-disc list-inside">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Stat Distribution</h4>
          <div className="h-[300px]">
            <RadarChart data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* EV Bar Chart */}
        <div>
          <h4 className="text-lg font-semibold mb-3">EV Allocation</h4>
          <div className="h-[300px]">
            <BarChart data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* EV Sliders */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-3">Fine-tune EVs</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(evs).map(([stat, value]) => {
            const statKey = stat as keyof StatSpread;
            const baseStat = baseStats[stat === 'specialAttack' ? 'special-attack' : 
                                       stat === 'specialDefense' ? 'special-defense' : stat] || 0;
            const { gain } = calculateEVGains(baseStat, 0, value, level, nature, statKey);
            
            return (
              <div 
                key={stat} 
                className={`p-3 rounded-lg border ${
                  hoveredStat === stat ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 
                  'border-gray-200 dark:border-gray-700'
                }`}
                onMouseEnter={() => setHoveredStat(statKey)}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">{STAT_SHORT_NAMES[stat]}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold">{value}</span>
                    <span className="text-xs text-gray-500 ml-1">EVs</span>
                    <div className="text-xs text-green-600 dark:text-green-400">+{gain} stat</div>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="252"
                    step="4"
                    value={value}
                    onChange={(e) => updateEV(statKey, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(value / 252) * 100}%, #E5E7EB ${(value / 252) * 100}%, #E5E7EB 100%)`,
                    }}
                  />
                  <div
                    className="absolute -top-1 w-4 h-4 bg-blue-600 rounded-full cursor-grab active:cursor-grabbing"
                    style={{ left: `${(value / 252) * 100}%`, transform: 'translateX(-50%)' }}
                    onMouseDown={(e) => handleDragStart(statKey, e)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competitive Spreads */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-3">Competitive Spreads</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {Object.entries(COMPETITIVE_SPREADS).map(([key, spread]) => (
            <button
              key={key}
              onClick={() => applySpread(key)}
              className={`p-2 rounded-lg text-xs font-medium transition-all ${
                selectedSpread === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={spread.description}
            >
              {spread.name}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            const resetEvs = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
            setEvs(resetEvs);
            setSelectedSpread(null);
            onEVUpdate?.(resetEvs);
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Reset EVs
        </button>
      </div>
    </div>
  );
};

export default EVHeatMap;