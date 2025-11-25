import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { GlassContainer } from '../../../ui/glass-components';
import { MdCatchingPokemon } from 'react-icons/md';
import { PokemonListItem } from './PokemonListItem';
import type { TeammateData, CounterData } from './types';

interface TeammatesCountersSectionProps {
  teammates: TeammateData[];
  counters: CounterData[];
  loading: boolean;
}

export const TeammatesCountersSection: React.FC<TeammatesCountersSectionProps> = ({ 
  teammates, 
  counters, 
  loading 
}) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Common Teammates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassContainer 
          variant="dark" 
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl h-full"
          animate={false}
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center">
                  <MdCatchingPokemon className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Common Teammates
                </h3>
              </div>
              {loading && <span className="text-xs text-gray-500 dark:text-gray-400 italic">Loading...</span>}
            </div>
            <div className="space-y-3">
              {teammates.map((teammate, index) => (
                <motion.div
                  key={teammate.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PokemonListItem
                    name={teammate.name}
                    value={teammate.usage}
                    valueLabel="pair rate"
                    onClick={() => router.push(`/pokedex/${teammate.name.toLowerCase()}`)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </GlassContainer>
      </motion.div>

      {/* Top Counters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassContainer 
          variant="dark" 
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl h-full"
          animate={false}
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center">
                <MdCatchingPokemon className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                Top Counters
              </h3>
            </div>
            <div className="space-y-3">
              {counters.map((counter, index) => (
                <motion.div
                  key={counter.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PokemonListItem
                    name={counter.name}
                    value={counter.winRate}
                    valueLabel="win vs"
                    isCounter={true}
                    onClick={() => router.push(`/pokedex/${counter.name.toLowerCase()}`)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </GlassContainer>
      </motion.div>
    </div>
  );
};