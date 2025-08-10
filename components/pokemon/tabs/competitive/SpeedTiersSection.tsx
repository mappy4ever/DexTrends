import React from 'react';
import { motion } from 'framer-motion';
import { GlassContainer } from '../../../ui/design-system';
import { MdCatchingPokemon } from 'react-icons/md';
import { FaRunning, FaStar, FaExchangeAlt } from 'react-icons/fa';
import type { Pokemon } from '../../../../types/pokemon';

interface SpeedTiersSectionProps {
  pokemon: Pokemon;
}

export const SpeedTiersSection: React.FC<SpeedTiersSectionProps> = ({ pokemon }) => {
  const speedStat = pokemon.stats?.find(s => s.stat.name === 'speed');
  
  if (!speedStat) return null;

  const baseSpeed = speedStat.base_stat;
  const maxSpeed = Math.floor((baseSpeed * 2 + 99 + 31 + 63) * 1.1);
  const scarfSpeed = Math.floor(maxSpeed * 1.5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <GlassContainer 
        variant="dark" 
        className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
        animate={false}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center">
              <MdCatchingPokemon className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
              Speed Tiers
            </h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div 
                className="group"
                whileHover={{ scale: 1.03, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="text-center p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FaRunning className="w-4 h-4 text-blue-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Base Speed</p>
                  </div>
                  <p className="text-2xl font-bold">{baseSpeed}</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="group"
                whileHover={{ scale: 1.03, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="text-center p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FaStar className="w-4 h-4 text-green-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Max Speed</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {maxSpeed}
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                className="group"
                whileHover={{ scale: 1.03, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="text-center p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FaExchangeAlt className="w-4 h-4 text-purple-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Scarf Speed</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {scarfSpeed}
                  </p>
                </div>
              </motion.div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Speed calculations assume Level 100, 31 IVs, 252 EVs, and positive nature
            </p>
          </div>
        </div>
      </GlassContainer>
    </motion.div>
  );
};