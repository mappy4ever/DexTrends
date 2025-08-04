import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokemon, PokemonSpecies, Nature } from '../../../types/api/pokemon';
import { GlassContainer } from '../../ui/design-system';
import CircularButton from '../../ui/CircularButton';
import PokemonStatRadar from '../PokemonStatRadar';
import PokemonStatBars from '../PokemonStatBars';
import { cn } from '../../../utils/cn';
import { 
  FaChartBar, FaChartLine, FaCalculator, FaDna, 
  FaFlask, FaRunning, FaShieldAlt, FaBolt,
  FaHeart, FaStar, FaMedal, FaGamepad
} from 'react-icons/fa';
import { GiSwordWound, GiMagicShield } from 'react-icons/gi';
import { HiSparkles } from 'react-icons/hi';

interface StatsTabV2Props {
  pokemon: Pokemon;
  species: PokemonSpecies;
  natureData?: Nature | null;
  allNatures?: Nature[];
  onNatureChange?: (nature: string) => void;
  selectedNature?: string;
  selectedLevel?: number;
  onLevelChange?: (level: number) => void;
  typeColors: Record<string, string>;
}

const STAT_NAMES: Record<string, string> = {
  'hp': 'HP',
  'attack': 'Attack',
  'defense': 'Defense',
  'special-attack': 'Sp. Attack',
  'special-defense': 'Sp. Defense',
  'speed': 'Speed'
};

const StatsTabV2: React.FC<StatsTabV2Props> = ({
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
  // State for perfect IVs/EVs toggle
  const [usePerfectStats, setUsePerfectStats] = useState(false);
  // Calculate stats with nature modifiers
  const calculatedStats = useMemo(() => {
    const stats = pokemon.stats || [];
    
    // For realistic EV distribution when max EVs is checked:
    // Typically invest 252 EVs in two best stats, 4 in another
    const getEVsForStat = (statName: string, index: number) => {
      if (!usePerfectStats) return 0;
      
      // Find the two highest base stats
      const sortedStats = [...stats].sort((a, b) => b.base_stat - a.base_stat);
      const topTwoStats = sortedStats.slice(0, 2).map(s => s.stat.name);
      
      if (topTwoStats.includes(statName)) {
        return 252/4; // 252 EVs = 63 stat points
      } else if (index === 0) { // HP often gets the remaining 4 EVs
        return 4/4; // 4 EVs = 1 stat point
      }
      return 0;
    };
    
    return stats.map((stat, index) => {
      const baseStat = stat.base_stat;
      let natureModifier = 1;
      
      if (natureData) {
        if (natureData.increased_stat?.name === stat.stat.name) {
          natureModifier = 1.1;
        } else if (natureData.decreased_stat?.name === stat.stat.name) {
          natureModifier = 0.9;
        }
      }
      
      // Calculate actual stat at given level
      let actualStat: number;
      const evValue = getEVsForStat(stat.stat.name, index);
      
      if (stat.stat.name === 'hp') {
        actualStat = Math.floor(((2 * baseStat + 31 + evValue) * selectedLevel) / 100) + selectedLevel + 10;
      } else {
        actualStat = Math.floor((Math.floor(((2 * baseStat + 31 + evValue) * selectedLevel) / 100) + 5) * natureModifier);
      }
      
      return {
        name: stat.stat.name,
        baseStat,
        actualStat,
        effort: stat.effort,
        natureModifier
      };
    });
  }, [pokemon.stats, natureData, selectedLevel, usePerfectStats]);
  
  // Calculate total base stats (for ranking)
  const totalBaseStats = useMemo(() => {
    return pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0;
  }, [pokemon.stats]);
  
  // Calculate total actual stats (with level/nature modifiers)
  const totalActualStats = useMemo(() => {
    return calculatedStats.reduce((sum, stat) => sum + stat.actualStat, 0);
  }, [calculatedStats]);
  
  // Get stat ranking (based on base stats for consistency)
  const getStatRanking = (total: number) => {
    if (total >= 600) return { rank: 'Legendary', color: 'bg-purple-500' };
    if (total >= 540) return { rank: 'Excellent', color: 'bg-indigo-500' };
    if (total >= 500) return { rank: 'Very Strong', color: 'bg-emerald-500' };
    if (total >= 450) return { rank: 'Strong', color: 'bg-green-500' };
    if (total >= 400) return { rank: 'Good', color: 'bg-blue-500' };
    if (total >= 350) return { rank: 'Average', color: 'bg-yellow-500' };
    if (total >= 300) return { rank: 'Below Average', color: 'bg-orange-500' };
    return { rank: 'Weak', color: 'bg-red-500' };
  };
  
  const ranking = getStatRanking(totalBaseStats);
  
  return (
    <div className="space-y-6">
      {/* Stats Display */}
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
          <div className="flex flex-col h-full">
            <div className="p-6 md:p-8 flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Stats Distribution
                </h2>
                
                {/* Perfect Stats Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePerfectStats}
                    onChange={(e) => setUsePerfectStats(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Optimized EVs
                  </span>
                </label>
              </div>
              
              <PokemonStatBars
                key={`stats-${selectedNature}-${usePerfectStats}`}
                stats={calculatedStats}
                selectedLevel={selectedLevel}
                typeColors={typeColors}
                animate={false}
                totalStats={totalActualStats}
                baseTotal={totalBaseStats}
                ranking={ranking}
                showNotes={false}
              />
            </div>
            
            {/* Notes at bottom */}
            <div className="px-6 pb-4 md:px-8 md:pb-6 space-y-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>Minimum stats are calculated with 0 EVs, IVs of 0, and (if applicable) a hindering nature.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>
                  {usePerfectStats 
                    ? "Stats shown with optimal EV spread: 252 EVs in two highest base stats, 4 in HP (510 total, game-legal)."
                    : "Stats shown use perfect IVs (31) with no EVs. Check 'Max EVs' to see optimized EV distribution."
                  }
                </span>
              </div>
            </div>
          </div>
        </GlassContainer>
      </motion.div>
      
      {/* Nature, Level, and EV Yield in single row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Nature Selector - Compact */}
        <div className="bg-white dark:bg-gray-900/50 rounded-2xl p-4 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center">
              <FaFlask className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-green-400">Nature</h3>
          </div>
          <select
            value={selectedNature}
            onChange={(e) => onNatureChange?.(e.target.value)}
            className="w-full p-2 text-sm bg-white/10 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          >
            {allNatures.map(nature => (
              <option key={nature.name} value={nature.name}>
                {nature.name.charAt(0).toUpperCase() + nature.name.slice(1)}
              </option>
            ))}
          </select>
          
          {natureData && (
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              {natureData.increased_stat && natureData.decreased_stat ? (
                <span>+{STAT_NAMES[natureData.increased_stat.name]} -{STAT_NAMES[natureData.decreased_stat.name]}</span>
              ) : (
                <span>No stat changes (neutral nature)</span>
              )}
            </div>
          )}
        </div>
        
        {/* Level Selector - Compact */}
        <div className="bg-white dark:bg-gray-900/50 rounded-2xl p-4 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                <FaGamepad className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-blue-400">Level</h3>
            </div>
            <span className="text-xl font-bold">{selectedLevel}</span>
          </div>
          
          <input
            type="range"
            min="1"
            max="100"
            value={selectedLevel}
            onChange={(e) => onLevelChange?.(parseInt(e.target.value))}
            className="w-full mb-4"
          />
          
          {/* Quick level buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 25, 50, 100].map(level => (
              <div key={level} className="flex flex-col items-center">
                <button
                  className={cn(
                    "w-10 h-10 text-xs rounded-full transition-all flex items-center justify-center font-semibold",
                    selectedLevel === level 
                      ? "bg-blue-500 text-white shadow-lg" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  )}
                  onClick={() => onLevelChange?.(level)}
                >
                  {level}
                </button>
                {level === 50 && (
                  <span className="text-[8px] mt-1 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* EV Yield - Compact */}
        <div className="bg-white dark:bg-gray-900/50 rounded-2xl p-4 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
              <FaDna className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">EV Yield</h3>
          </div>
          
          <div className="space-y-2">
            {calculatedStats.filter(stat => stat.effort > 0).map(stat => (
              <div
                key={stat.name}
                className="bg-purple-100 dark:bg-purple-900/30 rounded-lg px-3 py-2 flex items-center justify-between"
              >
                <span className="text-sm font-medium">{STAT_NAMES[stat.name]}</span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  +{stat.effort}
                </span>
              </div>
            ))}
            {calculatedStats.filter(stat => stat.effort > 0).length === 0 && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 py-4">
                No EVs yielded
              </div>
            )}
          </div>
          
          {calculatedStats.filter(stat => stat.effort > 0).length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Effort Values gained when defeating this Pokémon
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StatsTabV2;