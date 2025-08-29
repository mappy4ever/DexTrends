import React, { useState } from 'react';
import { TypeBadge } from '../ui/TypeBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { createGlassStyle } from '../ui/design-system/glass-constants';
import { POKEMON_TYPES, calculateTypeEffectiveness, getEffectivenessLabel } from '../../utils/typeEffectiveness';

interface TypeEffectivenessCardsProps {
  className?: string;
}

export const TypeEffectivenessCards: React.FC<TypeEffectivenessCardsProps> = ({ className = '' }) => {
  const [selectedAttacker, setSelectedAttacker] = useState<string>('fire');
  const [showDefenderDetails, setShowDefenderDetails] = useState(false);

  const getEffectivenessColor = (multiplier: number): string => {
    if (multiplier === 0) return 'bg-gray-500';
    if (multiplier === 0.25) return 'bg-red-700';
    if (multiplier === 0.5) return 'bg-red-500';
    if (multiplier === 2) return 'bg-green-500';
    if (multiplier === 4) return 'bg-green-700';
    return 'bg-gray-400';
  };

  const getEffectivenessEmoji = (multiplier: number): string => {
    if (multiplier === 0) return '🚫';
    if (multiplier === 0.25) return '💔';
    if (multiplier === 0.5) return '⬇️';
    if (multiplier === 2) return '⬆️';
    if (multiplier === 4) return '💪';
    return '➖';
  };

  const calculateAllEffectiveness = (attacker: string) => {
    const results = POKEMON_TYPES.map(defender => {
      const effectiveness = calculateTypeEffectiveness(attacker, [defender]);
      return {
        defender,
        effectiveness,
        label: getEffectivenessLabel(effectiveness)
      };
    });

    // Sort by effectiveness (highest first)
    return results.sort((a, b) => b.effectiveness - a.effectiveness);
  };

  const effectivenessResults = calculateAllEffectiveness(selectedAttacker);
  
  // Group by effectiveness
  const groupedResults = {
    superEffective: effectivenessResults.filter(r => r.effectiveness >= 2),
    normal: effectivenessResults.filter(r => r.effectiveness === 1),
    notVeryEffective: effectivenessResults.filter(r => r.effectiveness < 1 && r.effectiveness > 0),
    noEffect: effectivenessResults.filter(r => r.effectiveness === 0)
  };

  return (
    <div className={`mobile-type-effectiveness ${className}`}>
      {/* Attacker Type Selector */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200">
          Select Attacking Type
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {POKEMON_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSelectedAttacker(type)}
              className={`p-2 rounded-lg transition-all ${
                selectedAttacker === type
                  ? 'ring-2 ring-blue-500 scale-105'
                  : 'hover:scale-105'
              }`}
            >
              <TypeBadge type={type} size="sm" />
            </button>
          ))}
        </div>
      </div>

      {/* Selected Attacker Display */}
      <motion.div
        className={`${createGlassStyle({
          blur: 'lg',
          opacity: 'medium',
          gradient: true,
          rounded: 'xl',
          shadow: 'lg'
        })} p-4 mb-6`}
        key={selectedAttacker}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Attacking with:</span>
          <TypeBadge type={selectedAttacker} size="md" />
        </div>

        {/* Toggle for detailed view */}
        <button
          onClick={() => setShowDefenderDetails(!showDefenderDetails)}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg font-medium"
        >
          {showDefenderDetails ? 'Show Summary' : 'Show All Matchups'}
        </button>
      </motion.div>

      {/* Effectiveness Display */}
      <AnimatePresence mode="wait">
        {showDefenderDetails ? (
          /* Detailed View - All Matchups */
          <motion.div
            key="detailed"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-2"
          >
            {effectivenessResults.map((result, index) => (
              <motion.div
                key={result.defender}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`${createGlassStyle({
                  blur: 'sm',
                  opacity: 'subtle',
                  rounded: 'lg',
                  shadow: 'sm'
                })} p-3 flex items-center justify-between`}
              >
                <TypeBadge type={result.defender} size="sm" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {result.label}
                  </span>
                  <div className={`px-2 py-1 rounded-full text-white text-xs font-bold ${getEffectivenessColor(result.effectiveness)}`}>
                    {result.effectiveness}x
                  </div>
                  <span className="text-lg">
                    {getEffectivenessEmoji(result.effectiveness)}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Summary View - Grouped by Effectiveness */
          <motion.div
            key="summary"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Super Effective */}
            {groupedResults.superEffective.length > 0 && (
              <div className={`${createGlassStyle({
                blur: 'md',
                opacity: 'subtle',
                rounded: 'xl',
                shadow: 'md'
              })} p-4 border-2 border-green-500/30`}>
                <h4 className="font-bold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                  <span>Super Effective</span>
                  <span className="text-xl">⬆️</span>
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {groupedResults.superEffective.map(r => (
                    <div key={r.defender} className="flex items-center gap-1">
                      <TypeBadge type={r.defender} size="xs" />
                      <span className="text-xs font-bold text-green-600">
                        {r.effectiveness}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not Very Effective */}
            {groupedResults.notVeryEffective.length > 0 && (
              <div className={`${createGlassStyle({
                blur: 'md',
                opacity: 'subtle',
                rounded: 'xl',
                shadow: 'md'
              })} p-4 border-2 border-red-500/30`}>
                <h4 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                  <span>Not Very Effective</span>
                  <span className="text-xl">⬇️</span>
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {groupedResults.notVeryEffective.map(r => (
                    <div key={r.defender} className="flex items-center gap-1">
                      <TypeBadge type={r.defender} size="xs" />
                      <span className="text-xs font-bold text-red-600">
                        {r.effectiveness}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Effect */}
            {groupedResults.noEffect.length > 0 && (
              <div className={`${createGlassStyle({
                blur: 'md',
                opacity: 'subtle',
                rounded: 'xl',
                shadow: 'md'
              })} p-4 border-2 border-gray-500/30`}>
                <h4 className="font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <span>No Effect</span>
                  <span className="text-xl">🚫</span>
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {groupedResults.noEffect.map(r => (
                    <div key={r.defender} className="flex items-center gap-1">
                      <TypeBadge type={r.defender} size="xs" />
                      <span className="text-xs font-bold text-gray-600">
                        0x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Normal Damage */}
            {groupedResults.normal.length > 0 && (
              <div className={`${createGlassStyle({
                blur: 'md',
                opacity: 'subtle',
                rounded: 'xl',
                shadow: 'md'
              })} p-4`}>
                <h4 className="font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <span>Normal Damage</span>
                  <span className="text-xl">➖</span>
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {groupedResults.normal.map(r => (
                    <div key={r.defender} className="flex items-center gap-1">
                      <TypeBadge type={r.defender} size="xs" />
                      <span className="text-xs text-gray-500">
                        1x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};