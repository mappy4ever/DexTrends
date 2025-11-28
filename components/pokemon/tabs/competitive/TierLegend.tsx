import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../../../ui/Container';
import { TierBadge } from '../../../ui/TierBadge';
import { cn } from '../../../../utils/cn';
import { MdCatchingPokemon } from 'react-icons/md';
import { TIER_INFO, ROLE_INFO } from './constants';

export const TierLegend: React.FC = () => {
  const [showTierLegend, setShowTierLegend] = useState(false);
  const [showRoles, setShowRoles] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container 
        variant="default" 
        className="backdrop-blur-xl bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 shadow-xl"
       
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                <MdCatchingPokemon className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400">
                Competitive Information
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTierLegend(!showTierLegend)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  "transform hover:scale-[1.02] active:scale-[0.98]",
                  showTierLegend
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                    : "bg-white/10 text-stone-600 dark:text-stone-300 border border-stone-200/50 dark:border-stone-600/50 hover:bg-white/20"
                )}
              >
                {showTierLegend ? 'Hide' : 'Show'} Tiers
              </button>
              <button
                onClick={() => setShowRoles(!showRoles)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  "transform hover:scale-[1.02] active:scale-[0.98]",
                  showRoles
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                    : "bg-white/10 text-stone-600 dark:text-stone-300 border border-stone-200/50 dark:border-stone-600/50 hover:bg-white/20"
                )}
              >
                {showRoles ? 'Hide' : 'Show'} Roles
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {showTierLegend && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4 mt-6">Competitive Tiers Explained</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(TIER_INFO).map(([tier, info], index) => (
                    <motion.div
                      key={tier}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="p-3 rounded-xl bg-white/5 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <TierBadge tier={tier} size="sm" />
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400">
                        {info.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {showRoles && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4 mt-6">Competitive Roles Explained</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(ROLE_INFO).map(([role, info], index) => {
                    const Icon = info.icon;
                    return (
                      <motion.div
                        key={role}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="p-3 rounded-xl bg-white/5 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={cn("w-5 h-5", info.color)} />
                          <span className="font-semibold text-sm">{role}</span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400">
                          {info.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </motion.div>
  );
};