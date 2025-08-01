import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Pokemon, PokemonSpecies, Nature } from '../../../types/api/pokemon';
import { GlassContainer, CircularButton } from '../../ui/design-system';
import PokemonStatRing from '../PokemonStatRing';
import { cn } from '../../../utils/cn';

interface StatsTabV2Props {
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
      {/* Stats Overview Header */}
      <GlassContainer variant="dark" className="p-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Total Base Stats</h3>
          <div className={cn(
            "text-5xl font-bold bg-gradient-to-r text-transparent bg-clip-text mb-2",
            ranking.color
          )}>
            {totalBaseStats}
          </div>
          <span className={cn(
            "px-4 py-2 rounded-full text-sm font-medium inline-block",
            "bg-gradient-to-r text-white",
            ranking.color
          )}>
            {ranking.rank}
          </span>
        </div>
      </GlassContainer>
      
      {/* Circular Stat Display */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
        {calculatedStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <PokemonStatRing
              stat={stat.name}
              value={stat.baseStat}
              size="lg"
              typeColors={typeColors}
              animate
            />
            <div className="mt-3">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {STAT_NAMES[stat.name]}
              </div>
              <div className="text-lg font-bold">
                {stat.actualStat}
                {stat.natureModifier !== 1 && (
                  <span className={cn(
                    "text-sm ml-1",
                    stat.natureModifier > 1 ? "text-green-500" : "text-red-500"
                  )}>
                    {stat.natureModifier > 1 ? '↑' : '↓'}
                  </span>
                )}
              </div>
              {stat.effort > 0 && (
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  +{stat.effort} EV
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Nature & Level Calculator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nature Selector */}
        <GlassContainer variant="dark" className="p-6">
          <h4 className="font-bold text-lg mb-4">Nature</h4>
          <select
            value={selectedNature}
            onChange={(e) => onNatureChange?.(e.target.value)}
            className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600"
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
        </GlassContainer>
        
        {/* Level Selector */}
        <GlassContainer variant="dark" className="p-6">
          <h4 className="font-bold text-lg mb-4">Level</h4>
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
        </GlassContainer>
      </div>
      
      {/* EV Yield Information */}
      <GlassContainer variant="dark" className="p-6">
        <h4 className="font-bold text-lg mb-4">EV Yield</h4>
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
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Effort Values gained when defeating this Pokémon
        </div>
      </GlassContainer>
    </div>
  );
};

export default StatsTabV2;