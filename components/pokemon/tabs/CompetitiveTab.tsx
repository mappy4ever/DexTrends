import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokemon, PokemonSpecies } from '../../../types/api/pokemon';
import PokemonGlassCard from '../PokemonGlassCard';
import { cn } from '../../../utils/cn';
import { STAT_NAMES } from '../../../utils/pokemonDetailUtils';

interface CompetitiveTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  typeColors: any;
}

// Mock competitive data (in a real app, this would come from an API)
const TIER_LIST = ['Uber', 'OU', 'UU', 'RU', 'NU', 'PU', 'Untiered'];

const SAMPLE_MOVESETS = [
  {
    name: 'Physical Sweeper',
    usage: 45.3,
    item: 'Life Orb',
    ability: 'Intimidate',
    nature: 'Adamant',
    evs: { hp: 0, attack: 252, defense: 0, 'special-attack': 0, 'special-defense': 4, speed: 252 },
    moves: ['Dragon Dance', 'Earthquake', 'Ice Fang', 'Waterfall']
  },
  {
    name: 'Bulky Pivot',
    usage: 32.7,
    item: 'Leftovers',
    ability: 'Intimidate',
    nature: 'Impish',
    evs: { hp: 248, attack: 8, defense: 252, 'special-attack': 0, 'special-defense': 0, speed: 0 },
    moves: ['Stealth Rock', 'Earthquake', 'Ice Fang', 'Roar']
  },
  {
    name: 'Mega Sweeper',
    usage: 22.0,
    item: 'Gyaradosite',
    ability: 'Mold Breaker',
    nature: 'Jolly',
    evs: { hp: 0, attack: 252, defense: 0, 'special-attack': 0, 'special-defense': 4, speed: 252 },
    moves: ['Dragon Dance', 'Crunch', 'Ice Fang', 'Waterfall']
  }
];

const COMMON_TEAMMATES = [
  { name: 'Ferrothorn', usage: 42.1 },
  { name: 'Landorus-Therian', usage: 38.7 },
  { name: 'Tapu Koko', usage: 35.2 },
  { name: 'Heatran', usage: 31.9 },
  { name: 'Toxapex', usage: 28.4 }
];

const COUNTERS = [
  { name: 'Tapu Koko', winRate: 78.3 },
  { name: 'Rotom-Wash', winRate: 71.2 },
  { name: 'Ferrothorn', winRate: 68.9 },
  { name: 'Zapdos', winRate: 66.4 },
  { name: 'Tangrowth', winRate: 63.7 }
];

const CompetitiveTab: React.FC<CompetitiveTabProps> = ({ pokemon, species, typeColors }) => {
  const [expandedMoveset, setExpandedMoveset] = useState<number | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'singles' | 'doubles'>('singles');
  
  // Calculate base stat total for tier estimation
  const baseStatTotal = pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0;
  const estimatedTier = baseStatTotal >= 600 ? 'Uber' : 
                       baseStatTotal >= 500 ? 'OU' : 
                       baseStatTotal >= 450 ? 'UU' : 
                       baseStatTotal >= 400 ? 'RU' : 'NU';

  return (
    <div className="space-y-6">
      {/* Format Selector */}
      <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-serif text-gray-900 dark:text-white">
            Competitive Overview
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFormat('singles')}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedFormat === 'singles'
                  ? "bg-gradient-to-r text-white " + typeColors.from + " " + typeColors.to
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              )}
            >
              Singles
            </button>
            <button
              onClick={() => setSelectedFormat('doubles')}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedFormat === 'doubles'
                  ? "bg-gradient-to-r text-white " + typeColors.from + " " + typeColors.to
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              )}
            >
              Doubles
            </button>
          </div>
        </div>

        {/* Tier and Usage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Tier</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {estimatedTier}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Usage Rate</p>
            <p className="text-2xl font-bold">
              {((baseStatTotal / 700) * 15).toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {(45 + (baseStatTotal / 700) * 10).toFixed(1)}%
            </p>
          </div>
        </div>
      </PokemonGlassCard>

      {/* Common Movesets */}
      <PokemonGlassCard variant="stat" pokemonTypes={pokemon.types}>
        <h4 className="text-xl font-bold mb-4">Popular Movesets</h4>
        <div className="space-y-3">
          {SAMPLE_MOVESETS.map((moveset, index) => (
            <motion.div
              key={index}
              className={cn(
                "border rounded-lg overflow-hidden transition-all cursor-pointer",
                "bg-white/50 dark:bg-gray-800/50",
                "border-gray-200 dark:border-gray-700",
                "hover:shadow-md"
              )}
              onClick={() => setExpandedMoveset(expandedMoveset === index ? null : index)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h5 className="font-semibold">{moveset.name}</h5>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {moveset.usage}% usage
                    </span>
                  </div>
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: expandedMoveset === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </div>
                
                <AnimatePresence>
                  {expandedMoveset === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Item:</span>
                            <span className="ml-2 font-medium">{moveset.item}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Ability:</span>
                            <span className="ml-2 font-medium">{moveset.ability}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Nature:</span>
                            <span className="ml-2 font-medium">{moveset.nature}</span>
                          </div>
                        </div>
                        
                        {/* EVs */}
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">EVs:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(moveset.evs).map(([stat, value]) => {
                              if (value === 0) return null;
                              return (
                                <span
                                  key={stat}
                                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs"
                                >
                                  {value} {STAT_NAMES[stat]}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Moves */}
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Moves:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {moveset.moves.map(move => (
                              <span
                                key={move}
                                className={cn(
                                  "px-3 py-1 rounded text-sm text-center",
                                  "bg-gradient-to-r text-white",
                                  typeColors.from,
                                  typeColors.to
                                )}
                              >
                                {move}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </PokemonGlassCard>

      {/* Teammates and Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Common Teammates */}
        <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
          <h4 className="text-lg font-bold mb-4">Common Teammates</h4>
          <div className="space-y-2">
            {COMMON_TEAMMATES.map((teammate, index) => (
              <motion.div
                key={teammate.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/pokedex/${teammate.name.toLowerCase()}`}
              >
                <span className="font-medium">{teammate.name}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {teammate.usage}% pair rate
                </span>
              </motion.div>
            ))}
          </div>
        </PokemonGlassCard>

        {/* Top Counters */}
        <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
          <h4 className="text-lg font-bold mb-4">Top Counters</h4>
          <div className="space-y-2">
            {COUNTERS.map((counter, index) => (
              <motion.div
                key={counter.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/pokedex/${counter.name.toLowerCase()}`}
              >
                <span className="font-medium">{counter.name}</span>
                <span className="text-sm text-red-600 dark:text-red-400">
                  {counter.winRate}% win rate
                </span>
              </motion.div>
            ))}
          </div>
        </PokemonGlassCard>
      </div>

      {/* Speed Tiers */}
      <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
        <h4 className="text-lg font-bold mb-4">Speed Tiers</h4>
        <div className="space-y-3">
          {pokemon.stats?.find(s => s.stat.name === 'speed') && (
            <>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Base Speed</p>
                  <p className="text-xl font-bold">{pokemon.stats?.find(s => s.stat.name === 'speed')?.base_stat}</p>
                </div>
                <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Max Speed (Jolly)</p>
                  <p className="text-xl font-bold">
                    {Math.floor((pokemon.stats?.find(s => s.stat.name === 'speed')?.base_stat || 0) * 2 + 99 + 31 + 63) * 1.1}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Scarf Speed</p>
                  <p className="text-xl font-bold">
                    {Math.floor(Math.floor((pokemon.stats?.find(s => s.stat.name === 'speed')?.base_stat || 0) * 2 + 99 + 31 + 63) * 1.1 * 1.5)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Speed calculations assume Level 100, 31 IVs, 252 EVs, and positive nature
              </p>
            </>
          )}
        </div>
      </PokemonGlassCard>
    </div>
  );
};

export default CompetitiveTab;