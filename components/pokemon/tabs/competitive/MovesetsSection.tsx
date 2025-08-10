import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassContainer } from '../../../ui/design-system';
import { cn } from '../../../../utils/cn';
import { FaChessBishop, FaFistRaised } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { STAT_NAMES } from '../../../../utils/pokemonDetailUtils';
import type { MovesetData } from './types';
import { ROLE_INFO } from './constants';

interface MovesetsSectionProps {
  movesets: MovesetData[];
  loading: boolean;
}

export const MovesetsSection: React.FC<MovesetsSectionProps> = ({ movesets, loading }) => {
  const [expandedMoveset, setExpandedMoveset] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <GlassContainer 
        variant="dark" 
        className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
        animate={false}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                <FaChessBishop className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                Popular Movesets
              </h3>
            </div>
            {loading && <span className="text-xs text-gray-500 dark:text-gray-400 italic">Loading...</span>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movesets.map((moveset, index) => {
              const roleInfo = ROLE_INFO[moveset.name as keyof typeof ROLE_INFO];
              const Icon = roleInfo?.icon || FaChessBishop;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 400 }}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "border rounded-xl overflow-hidden transition-all cursor-pointer",
                    "bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30",
                    "border-gray-200/50 dark:border-gray-700/50",
                    "hover:shadow-lg",
                    expandedMoveset === index && "ring-2 ring-purple-500/50"
                  )}
                  onClick={() => setExpandedMoveset(expandedMoveset === index ? null : index)}
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("w-5 h-5", roleInfo?.color || 'text-purple-400')} />
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {moveset.name}
                        </h5>
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold text-white shadow-md bg-gradient-to-r",
                        moveset.usage >= 40 ? "from-purple-500 to-pink-500" :
                        moveset.usage >= 25 ? "from-blue-500 to-purple-500" :
                        moveset.usage >= 10 ? "from-green-500 to-blue-500" :
                        "from-gray-500 to-gray-600"
                      )}>
                        {moveset.usage}% usage
                      </div>
                    </div>
                    
                    {/* Quick Info */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-white/5 dark:bg-gray-800/50 rounded">
                        <p className="text-gray-500 dark:text-gray-400">Item</p>
                        <p className="font-medium">{moveset.item}</p>
                      </div>
                      <div className="text-center p-2 bg-white/5 dark:bg-gray-800/50 rounded">
                        <p className="text-gray-500 dark:text-gray-400">Ability</p>
                        <p className="font-medium">{moveset.ability}</p>
                      </div>
                      <div className="text-center p-2 bg-white/5 dark:bg-gray-800/50 rounded">
                        <p className="text-gray-500 dark:text-gray-400">Nature</p>
                        <p className="font-medium">{moveset.nature}</p>
                      </div>
                    </div>
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
                        <div className="p-4 space-y-3 border-t border-gray-200/50 dark:border-gray-700/50">
                          {/* EVs */}
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                              <HiSparkles className="w-4 h-4 text-purple-400" />
                              EV Spread
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(moveset.evs).map(([stat, value]) => {
                                if (value === 0) return null;
                                return (
                                  <div
                                    key={stat}
                                    className="flex items-center justify-between px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-sm"
                                  >
                                    <span className="text-purple-700 dark:text-purple-300">{STAT_NAMES[stat]}</span>
                                    <span className="font-bold text-purple-800 dark:text-purple-200">{value}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Moves */}
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                              <FaFistRaised className="w-4 h-4 text-red-400" />
                              Moveset
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {moveset.moves.map(move => (
                                <div
                                  key={move}
                                  className="px-3 py-2 rounded text-sm text-center bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 font-medium"
                                >
                                  {move}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
          
          {/* Data Notice */}
          {!loading && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                * Data calculated based on tier placement, stats, and type matchups
              </p>
            </div>
          )}
        </div>
      </GlassContainer>
    </motion.div>
  );
};