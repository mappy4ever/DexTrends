import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokemon, PokemonSpecies, Nature } from "../../../types/pokemon";
import type { TypeColors } from '../../../types/pokemon-tabs';
import { GlassContainer } from '../../ui/design-system';
import CircularButton from '../../ui/CircularButton';
import PokemonStatRadar from '../PokemonStatRadar';
import PokemonStatBars from '../PokemonStatBars';
import BaseStatsRanking from '../BaseStatsRanking';
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
  typeColors: TypeColors;
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
  // Remove viewMode state as we only use bar chart now
  // Calculate stats with nature modifiers
  const calculatedStats = useMemo(() => {
    const stats = pokemon.stats || [];
    
    return stats.map(stat => {
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
      if (stat.stat.name === 'hp') {
        actualStat = Math.floor(((2 * baseStat + 31 + 252/4) * selectedLevel) / 100) + selectedLevel + 10;
      } else {
        actualStat = Math.floor((Math.floor(((2 * baseStat + 31 + 252/4) * selectedLevel) / 100) + 5) * natureModifier);
      }
      
      return {
        name: stat.stat.name,
        baseStat,
        actualStat,
        effort: stat.effort,
        natureModifier
      };
    });
  }, [pokemon.stats, natureData, selectedLevel]);
  
  // Calculate total base stats
  const totalBaseStats = useMemo(() => {
    return pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0;
  }, [pokemon.stats]);
  
  // Get stat ranking (how this Pokemon compares to others)
  const getStatRanking = (total: number) => {
    if (total >= 700) return { rank: 'Legendary', color: 'from-purple-500 to-pink-500' };
    if (total >= 600) return { rank: 'Pseudo-Legendary', color: 'from-blue-500 to-purple-500' };
    if (total >= 500) return { rank: 'Very Strong', color: 'from-green-500 to-blue-500' };
    if (total >= 400) return { rank: 'Above Average', color: 'from-yellow-500 to-green-500' };
    if (total >= 300) return { rank: 'Average', color: 'from-orange-500 to-yellow-500' };
    return { rank: 'Below Average', color: 'from-red-500 to-orange-500' };
  };
  
  const ranking = getStatRanking(totalBaseStats);
  
  return (
    <div className="space-y-6">
      {/* Stats Display with Toggle */}
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
          <div className="p-6 md:p-8">
            <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-6">
              Stats Distribution
            </h2>
            
            <PokemonStatBars
              stats={calculatedStats}
              selectedLevel={selectedLevel}
              typeColors={typeColors}
              animate
            />
        
        {/* Total Stats Display - Bottom Right */}
        <div className="mt-6 flex justify-end">
          <div className="text-right">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
              Total
            </div>
            <div className="text-3xl font-bold" style={{ color: 'rgb(23, 162, 184)' }}>
              {totalBaseStats}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Other Pokémon with this total
            </div>
          </div>
        </div>
          </div>
        </GlassContainer>
      </motion.div>
      
      {/* Nature & Level Calculator and Base Stats Ranking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Nature Selector */}
        <motion.div 
          className="group"
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div className="h-full bg-white dark:bg-gray-900/50 rounded-2xl p-5 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center shadow-md shadow-green-500/10">
                <FaFlask className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-green-400">Nature</h3>
            </div>
            <select
              value={selectedNature}
              onChange={(e) => onNatureChange?.(e.target.value)}
              className="w-full p-3 bg-white/10 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
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
          
          {natureData && (
            <div className="mt-4 space-y-2 text-sm">
              {natureData.increased_stat && (
                <div className="flex items-center gap-2">
                  <span className="text-green-500">↑</span>
                  <span>Increases {STAT_NAMES[natureData.increased_stat.name]}</span>
                </div>
              )}
              {natureData.decreased_stat && (
                <div className="flex items-center gap-2">
                  <span className="text-red-500">↓</span>
                  <span>Decreases {STAT_NAMES[natureData.decreased_stat.name]}</span>
                </div>
              )}
              {!natureData.increased_stat && !natureData.decreased_stat && (
                <div className="text-gray-600 dark:text-gray-400">
                  No stat changes (neutral nature)
                </div>
              )}
            </div>
          )}
          </div>
        </motion.div>
        
        {/* Level Selector */}
        <motion.div 
          className="group"
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div className="h-full bg-white dark:bg-gray-900/50 rounded-2xl p-5 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center shadow-md shadow-blue-500/10">
                <FaGamepad className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-blue-400">Level</h3>
            </div>
          <div className="space-y-4">
            <input
              type="range"
              min="1"
              max="100"
              value={selectedLevel}
              onChange={(e) => onLevelChange?.(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Level</span>
              <span className="text-2xl font-bold">{selectedLevel}</span>
            </div>
            
            {/* Quick level buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 50, 75, 100].map(level => (
                <CircularButton
                  key={level}
                  size="sm"
                  variant={selectedLevel === level ? 'primary' : 'secondary'}
                  onClick={() => onLevelChange?.(level)}
                >
                  {level}
                </CircularButton>
              ))}
            </div>
          </div>
          </div>
        </motion.div>
        
        {/* Base Stats Ranking */}
        <motion.div 
          className="group"
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <BaseStatsRanking 
            totalStats={totalBaseStats}
            pokemonName={pokemon.name}
          />
        </motion.div>
      </motion.div>
      
      {/* EV Yield Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassContainer 
          variant="dark" 
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
          animate={false}
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                <FaDna className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                EV Yield
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {calculatedStats.filter(stat => stat.effort > 0).map(stat => (
            <div
              key={stat.name}
              className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 text-center"
            >
              <div className="font-medium">{STAT_NAMES[stat.name]}</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                +{stat.effort}
              </div>
            </div>
          ))}
          {calculatedStats.filter(stat => stat.effort > 0).length === 0 && (
            <div className="col-span-full text-center text-gray-600 dark:text-gray-400">
              No EVs yielded
            </div>
          )}
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
              Effort Values gained when defeating this Pokémon
            </div>
          </div>
        </GlassContainer>
      </motion.div>
      
      {/* Individual Stat Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassContainer 
          variant="dark" 
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
          animate={false}
        >
          <div className="p-6 md:p-8">
            <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-6">
              Detailed Stat Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {calculatedStats.map((stat, index) => {
                const getStatIcon = (statName: string) => {
                  switch (statName) {
                    case 'hp': return FaHeart;
                    case 'attack': return GiSwordWound;
                    case 'defense': return FaShieldAlt;
                    case 'special-attack': return HiSparkles;
                    case 'special-defense': return GiMagicShield;
                    case 'speed': return FaBolt;
                    default: return FaStar;
                  }
                };
                const Icon = getStatIcon(stat.name);
                const statPercentage = (stat.baseStat / 255) * 100;
                
                return (
                  <motion.div
                    key={stat.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 400 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="font-semibold text-sm uppercase">{STAT_NAMES[stat.name]}</span>
                      </div>
                      {stat.natureModifier !== 1 && (
                        <span className={cn(
                          "text-sm font-bold",
                          stat.natureModifier > 1 ? "text-green-500" : "text-red-500"
                        )}>
                          {stat.natureModifier > 1 ? '+10%' : '-10%'}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Base</span>
                        <span className="font-bold">{stat.baseStat}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${statPercentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">At Lv.{selectedLevel}</span>
                        <span className="font-bold text-lg">{stat.actualStat}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </GlassContainer>
      </motion.div>
    </div>
  );
};

export default StatsTabV2;