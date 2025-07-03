/**
 * Pokemon Stats Tab Component
 * Displays Pokemon base stats with visual indicators
 */

import React from 'react';
import { FadeIn } from '../ui/animations';

const PokemonStatsTab = ({ pokemonDetails }) => {
  if (!pokemonDetails?.stats) {
    return (
      <FadeIn>
        <div className="glass-elevated p-6 rounded-2xl shadow-lg border-0">
          <p className="text-center text-gray-500 dark:text-gray-400">No stats data available.</p>
        </div>
      </FadeIn>
    );
  }

  const getStatColor = (value) => {
    if (value >= 150) return 'bg-purple-500';
    if (value >= 120) return 'bg-red-500';
    if (value >= 100) return 'bg-orange-500';
    if (value >= 80) return 'bg-yellow-500';
    if (value >= 60) return 'bg-green-500';
    if (value >= 40) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getStatName = (statName) => {
    const nameMap = {
      'hp': 'HP',
      'attack': 'Attack',
      'defense': 'Defense',
      'special-attack': 'Sp. Attack',
      'special-defense': 'Sp. Defense',
      'speed': 'Speed'
    };
    return nameMap[statName] || statName;
  };

  const totalStats = pokemonDetails.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

  return (
    <FadeIn>
      <div className="glass-elevated p-6 rounded-2xl shadow-lg border-0">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Base Stats</h3>
        
        <div className="space-y-4">
          {pokemonDetails.stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300 text-right">
                {getStatName(stat.stat.name)}
              </div>
              <div className="w-12 text-center text-sm font-bold text-gray-900 dark:text-white">
                {stat.base_stat}
              </div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getStatColor(stat.base_stat)}`}
                  style={{ width: `${Math.min((stat.base_stat / 200) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="w-12 text-right">
                {stat.effort > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                    +{stat.effort} EV
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {/* Total Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-gray-900 dark:text-white">Base Stat Total</span>
              <span className="font-bold text-xl text-gray-900 dark:text-white">{totalStats}</span>
            </div>
            <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${Math.min((totalStats / 720) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
              Max possible: 720
            </div>
          </div>
        </div>

        {/* Stats Categories */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <h4 className="font-bold text-red-800 dark:text-red-200 mb-2">Offensive</h4>
            <div className="text-sm text-red-700 dark:text-red-300">
              <div>Attack: {pokemonDetails.stats.find(s => s.stat.name === 'attack')?.base_stat || 0}</div>
              <div>Sp. Attack: {pokemonDetails.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0}</div>
              <div className="font-medium mt-1">
                Total: {(pokemonDetails.stats.find(s => s.stat.name === 'attack')?.base_stat || 0) + 
                       (pokemonDetails.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0)}
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">Defensive</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <div>HP: {pokemonDetails.stats.find(s => s.stat.name === 'hp')?.base_stat || 0}</div>
              <div>Defense: {pokemonDetails.stats.find(s => s.stat.name === 'defense')?.base_stat || 0}</div>
              <div>Sp. Defense: {pokemonDetails.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0}</div>
              <div className="font-medium mt-1">
                Total: {(pokemonDetails.stats.find(s => s.stat.name === 'hp')?.base_stat || 0) + 
                       (pokemonDetails.stats.find(s => s.stat.name === 'defense')?.base_stat || 0) +
                       (pokemonDetails.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0)}
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 className="font-bold text-green-800 dark:text-green-200 mb-2">Speed</h4>
            <div className="text-sm text-green-700 dark:text-green-300">
              <div>Speed: {pokemonDetails.stats.find(s => s.stat.name === 'speed')?.base_stat || 0}</div>
              <div className="mt-2 text-xs">
                {pokemonDetails.stats.find(s => s.stat.name === 'speed')?.base_stat >= 100 
                  ? 'Very Fast' 
                  : pokemonDetails.stats.find(s => s.stat.name === 'speed')?.base_stat >= 80 
                  ? 'Fast' 
                  : pokemonDetails.stats.find(s => s.stat.name === 'speed')?.base_stat >= 60 
                  ? 'Average' 
                  : pokemonDetails.stats.find(s => s.stat.name === 'speed')?.base_stat >= 40 
                  ? 'Slow' 
                  : 'Very Slow'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default PokemonStatsTab;