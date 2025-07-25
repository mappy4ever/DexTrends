import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokemon, PokemonSpecies, Nature } from '../../../types/api/pokemon';
import PokemonGlassCard from '../PokemonGlassCard';
import { calculateStatWithModifiers, STAT_NAMES, STAT_COLORS } from '../../../utils/pokemonDetailUtils';
import { cn } from '../../../utils/cn';

interface StatsTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  natureData?: Nature | null;
  allNatures?: Nature[];
  onNatureChange?: (nature: string) => void;
  selectedNature?: string;
  selectedLevel?: number;
  onLevelChange?: (level: number) => void;
  typeColors: any;
}

interface StatModifiers {
  hp: { ev: number; iv: number };
  attack: { ev: number; iv: number };
  defense: { ev: number; iv: number };
  'special-attack': { ev: number; iv: number };
  'special-defense': { ev: number; iv: number };
  speed: { ev: number; iv: number };
}

const StatsTab: React.FC<StatsTabProps> = ({ 
  pokemon, 
  species, 
  natureData,
  allNatures = [],
  onNatureChange,
  selectedNature = 'hardy',
  selectedLevel = 50,
  onLevelChange,
  typeColors 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [visualizationType, setVisualizationType] = useState<'bars' | 'hexagon'>('hexagon');
  const [statModifiers, setStatModifiers] = useState<StatModifiers>({
    hp: { ev: 0, iv: 31 },
    attack: { ev: 0, iv: 31 },
    defense: { ev: 0, iv: 31 },
    'special-attack': { ev: 0, iv: 31 },
    'special-defense': { ev: 0, iv: 31 },
    speed: { ev: 0, iv: 31 }
  });

  // Calculate total EVs
  const totalEVs = useMemo(() => {
    return Object.values(statModifiers).reduce((sum, stat) => sum + stat.ev, 0);
  }, [statModifiers]);

  // Calculate actual stats with modifiers
  const calculatedStats = useMemo(() => {
    const stats: Record<string, { base: number; actual: number; percentile: number }> = {};
    
    (pokemon.stats || []).forEach(stat => {
      const baseStat = stat.base_stat;
      const statName = stat.stat.name;
      const modifiers = statModifiers[statName as keyof StatModifiers];
      
      const actual = calculateStatWithModifiers(
        baseStat,
        statName,
        {
          level: selectedLevel,
          evs: { [statName]: modifiers?.ev || 0 },
          ivs: { [statName]: modifiers?.iv || 31 }
        } as any,
        natureData
      );
      
      // Calculate percentile (assuming max stat around 714 for Blissey HP)
      const maxPossibleStat = statName === 'hp' ? 714 : 504;
      const percentile = (actual / maxPossibleStat) * 100;
      
      stats[statName] = { base: baseStat, actual, percentile };
    });
    
    return stats;
  }, [pokemon.stats, statModifiers, selectedLevel, natureData]);

  const updateStatModifier = (statName: string, type: 'ev' | 'iv', value: number) => {
    setStatModifiers(prev => ({
      ...prev,
      [statName]: {
        ...prev[statName as keyof StatModifiers],
        [type]: value
      }
    }));
  };

  const resetStats = () => {
    setStatModifiers({
      hp: { ev: 0, iv: 31 },
      attack: { ev: 0, iv: 31 },
      defense: { ev: 0, iv: 31 },
      'special-attack': { ev: 0, iv: 31 },
      'special-defense': { ev: 0, iv: 31 },
      speed: { ev: 0, iv: 31 }
    });
  };

  const exportBuild = () => {
    const build = {
      pokemon: pokemon.name,
      level: selectedLevel,
      nature: selectedNature,
      evs: Object.entries(statModifiers).reduce((acc, [stat, mods]) => ({
        ...acc,
        [stat]: mods.ev
      }), {}),
      ivs: Object.entries(statModifiers).reduce((acc, [stat, mods]) => ({
        ...acc,
        [stat]: mods.iv
      }), {})
    };
    
    navigator.clipboard.writeText(JSON.stringify(build, null, 2));
    // TODO: Add toast notification
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Display */}
      <PokemonGlassCard>
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-2xl font-serif text-gray-900 dark:text-white">
              Base Statistics
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setVisualizationType(visualizationType === 'bars' ? 'hexagon' : 'bars')}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl"
              >
                {visualizationType === 'bars' ? '⬡ Hexagon View' : '█ Bar View'}
              </button>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                {showAdvanced ? 'Simple View' : 'Advanced Calculator'}
              </button>
            </div>
          </div>

          {/* Hexagon Visualization */}
          {visualizationType === 'hexagon' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-xs mx-auto md:max-w-sm aspect-square">
                <StatHexagon stats={{
                  hp: pokemon.stats?.find(s => s.stat.name === 'hp')?.base_stat || 0,
                  attack: pokemon.stats?.find(s => s.stat.name === 'attack')?.base_stat || 0,
                  defense: pokemon.stats?.find(s => s.stat.name === 'defense')?.base_stat || 0,
                  spAttack: pokemon.stats?.find(s => s.stat.name === 'special-attack')?.base_stat || 0,
                  spDefense: pokemon.stats?.find(s => s.stat.name === 'special-defense')?.base_stat || 0,
                  speed: pokemon.stats?.find(s => s.stat.name === 'speed')?.base_stat || 0
                }} typeColors={typeColors} />
              </div>
            </motion.div>
          )}

          {/* Base Stats Bars */}
          {visualizationType === 'bars' && (
          <div className="space-y-4">
            {(pokemon.stats || []).map((stat, index) => {
              const statName = stat.stat.name;
              const displayName = STAT_NAMES[statName] || statName;
              const statColor = STAT_COLORS[statName] || 'gray';
              const calculated = calculatedStats[statName];
              const natureModifier = natureData?.increased_stat?.name === statName ? 1.1 
                : natureData?.decreased_stat?.name === statName ? 0.9 : 1;
              
              return (
                <motion.div 
                  key={statName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">
                        {displayName}
                      </span>
                      {natureModifier !== 1 && (
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded border",
                          natureModifier > 1 ? "border-red-300 text-red-700 dark:border-red-700 dark:text-red-300" 
                            : "border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300"
                        )}>
                          {natureModifier > 1 ? '+10%' : '-10%'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {stat.base_stat}
                      </span>
                      {showAdvanced && (
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          → {calculated.actual}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Classic Stat Bar */}
                  <div className="relative h-6 bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden">
                    {/* Value markers */}
                    {[50, 100, 150, 200].map(marker => (
                      <div
                        key={marker}
                        className="absolute top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"
                        style={{ left: `${(marker / 255) * 100}%` }}
                      />
                    ))}
                    {/* Stat bar */}
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-400 dark:to-gray-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(stat.base_stat / 255) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                    />
                    {/* Value label */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-mono font-bold text-gray-900 dark:text-white mix-blend-difference">
                        {stat.base_stat}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          )}

          {/* Total Base Stats */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Total Base Stats
              </span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0}
              </span>
            </div>
          </div>
        </div>
      </PokemonGlassCard>

      {/* Advanced Calculator */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Controls */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm overflow-hidden">
              <div className="space-y-6">
                <h4 className="text-xl font-bold">Stat Calculator</h4>
                
                {/* Level and Nature */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Level</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={selectedLevel}
                      onChange={(e) => onLevelChange?.(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1</span>
                      <span className="font-bold">{selectedLevel}</span>
                      <span>100</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Nature</label>
                    <select
                      value={selectedNature}
                      onChange={(e) => onNatureChange?.(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-gray-500 dark:focus:border-gray-400 focus:outline-none transition-colors"
                    >
                      {allNatures.map(nature => (
                        <option key={nature.name} value={nature.name}>
                          {nature.name.charAt(0).toUpperCase() + nature.name.slice(1)}
                          {nature.increased_stat && nature.decreased_stat && (
                            ` (+${STAT_NAMES[nature.increased_stat.name]} -${STAT_NAMES[nature.decreased_stat.name]})`
                          )}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* EV Warning */}
                {totalEVs > 510 && (
                  <div className="border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 p-3 rounded text-sm font-medium">
                    Total EVs: {totalEVs}/510 (Maximum exceeded!)
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={resetStats}
                    className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={exportBuild}
                    className="px-4 py-2 rounded-lg bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
                  >
                    Export Build
                  </button>
                </div>
              </div>
            </div>

            {/* Individual Stat Controls */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm overflow-hidden">
              <div className="space-y-6">
                <h4 className="text-lg font-bold">Individual Values & Effort Values</h4>
                
                {(pokemon.stats || []).map(stat => {
                  const statName = stat.stat.name;
                  const displayName = STAT_NAMES[statName] || statName;
                  const modifiers = statModifiers[statName as keyof StatModifiers];
                  
                  return (
                    <div key={statName} className="space-y-3">
                      <h5 className="font-medium">{displayName}</h5>
                      
                      {/* EVs */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>EVs</span>
                          <span>{modifiers.ev}/252</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="252"
                          step="4"
                          value={modifiers.ev}
                          onChange={(e) => updateStatModifier(statName, 'ev', Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      
                      {/* IVs */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>IVs</span>
                          <span>{modifiers.iv}/31</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="31"
                          value={modifiers.iv}
                          onChange={(e) => updateStatModifier(statName, 'iv', Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Hexagon stat visualization component
const StatHexagon: React.FC<{ stats: Record<string, number>; typeColors?: any }> = ({ stats, typeColors }) => {
  const statOrder = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'];
  const maxStat = 255;
  const centerX = 160;
  const centerY = 160;
  const radius = 120;
  
  // Calculate points for hexagon
  const points = statOrder.map((stat, index) => {
    const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
    const value = stats[stat] || 0;
    const distance = (value / maxStat) * radius;
    
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
    };
  });
  
  // Create path string
  const pathString = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';
  
  // Create background hexagon
  const bgPoints = statOrder.map((_, index) => {
    const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  });
  
  const bgPathString = bgPoints.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';

  // Stat labels with full names
  const statLabels: Record<string, string> = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    spAttack: 'Sp. Atk',
    spDefense: 'Sp. Def',
    speed: 'Speed'
  };
  
  return (
    <svg viewBox="0 0 320 320" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="hexagonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={typeColors?.primary || '#3B82F6'} />
          <stop offset="100%" stopColor={typeColors?.secondary || '#8B5CF6'} />
        </linearGradient>
        <radialGradient id="hexagonRadialGradient">
          <stop offset="0%" stopColor={typeColors?.primary || '#3B82F6'} stopOpacity="0.2" />
          <stop offset="100%" stopColor={typeColors?.secondary || '#8B5CF6'} stopOpacity="0.6" />
        </radialGradient>
      </defs>

      {/* Grid lines with circular style */}
      {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
        <polygon
          key={scale}
          points={bgPoints.map(p => `${centerX + (p.x - centerX) * scale},${centerY + (p.y - centerY) * scale}`).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-gray-200 dark:text-gray-700"
          opacity={0.3}
          strokeDasharray={scale < 1 ? "5,5" : "none"}
        />
      ))}
      
      {/* Background hexagon with gradient border */}
      <path
        d={bgPathString}
        fill="none"
        stroke="url(#hexagonGradient)"
        strokeWidth="3"
        opacity="0.5"
      />
      
      {/* Stats polygon with gradient fill */}
      <motion.path
        d={pathString}
        fill="url(#hexagonRadialGradient)"
        stroke="url(#hexagonGradient)"
        strokeWidth="3"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      
      {/* Stat points with animations */}
      {points.map((point, index) => (
        <motion.circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="6"
          fill="url(#hexagonGradient)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        />
      ))}
      
      {/* Stat labels with values */}
      {statOrder.map((stat, index) => {
        const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
        const labelDistance = radius + 35;
        const x = centerX + Math.cos(angle) * labelDistance;
        const y = centerY + Math.sin(angle) * labelDistance;
        
        return (
          <g key={stat}>
            <text
              x={x}
              y={y - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-semibold fill-current text-gray-700 dark:text-gray-300"
            >
              {statLabels[stat]}
            </text>
            <text
              x={x}
              y={y + 8}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-lg font-bold fill-current text-gray-900 dark:text-white"
            >
              {stats[stat]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default StatsTab;