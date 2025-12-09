import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../../../ui/Container';
import { TierBadge } from '../../../ui/TierBadge';
import { cn } from '../../../../utils/cn';
import { MdCatchingPokemon } from 'react-icons/md';
import { FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import type { Pokemon, PokemonSpecies } from '../../../../types/pokemon';
import type { CompetitiveTierRecord } from '../../../../utils/supabase';
import type { UsageStats, FormatEligibility } from './types';
import { FORMAT_INFO, FORMAT_STATS } from './constants';

interface FormatStatsProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  competitiveTiers?: CompetitiveTierRecord | null;
  estimatedTier: string;
  formatEligibility: FormatEligibility;
  usageStats: UsageStats;
  baseStatTotal: number;
}

export const FormatStats: React.FC<FormatStatsProps> = ({
  pokemon,
  species,
  competitiveTiers,
  estimatedTier,
  formatEligibility,
  usageStats,
  baseStatTotal
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'standard' | 'nationalDex' | 'otherFormats'>('standard');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Container
        variant="default"
        className="backdrop-blur-xl bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 shadow-xl"
       
      >
        <div className="p-6 md:p-8">
          {/* Format Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                <MdCatchingPokemon className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-stone-500 dark:text-stone-300">
                Competitive Formats
              </h2>
            </div>
          </div>

          {/* Format Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {Object.entries(FORMAT_INFO).map(([key, format]) => {
              const Icon = format.icon;
              const isSelected = selectedFormat === key;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedFormat(key as 'standard' | 'nationalDex' | 'otherFormats')}
                  className={cn(
                    "p-4 rounded-xl transition-all duration-200",
                    "border-2 flex flex-col items-center gap-2",
                    "transform hover:scale-[1.02] active:scale-[0.98]",
                    isSelected
                      ? `bg-gradient-to-br ${format.color} text-white border-transparent shadow-lg`
                      : "bg-white/5 dark:bg-stone-800/50 border-stone-200/50 dark:border-stone-700/50 hover:bg-white/10"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-semibold text-sm">{format.name}</span>
                  <span className="text-xs opacity-80 text-center">{format.description}</span>
                </button>
              );
            })}
          </div>

          {/* Format Content */}
          <div className="space-y-6">
            {selectedFormat === 'standard' && (
              <div className="space-y-6">
                {/* Section Header */}
                <div className="text-center p-4 bg-gradient-to-r from-amber-50 to-amber-50 dark:from-amber-900/10 dark:to-amber-900/10 rounded-xl">
                  <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-2">Standard Format Statistics</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-300">Current generation competitive play</p>
                </div>

                {/* Usage and Win Rate Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Singles Stats */}
                  <div className="p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-stone-800/50 dark:to-stone-800/30 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <MdCatchingPokemon className="w-4 h-4 text-amber-400" />
                      Singles Format
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-stone-600 dark:text-stone-300">Usage Rate</span>
                          <span className="font-bold text-sm">{usageStats.usage.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, usageStats.usage * 10)}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-stone-600 dark:text-stone-300">Win Rate</span>
                          <span className="font-bold text-sm">{usageStats.winRate.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                          <motion.div
                            className={cn(
                              "h-full",
                              usageStats.winRate >= 50
                                ? "bg-gradient-to-r from-green-400 to-green-600"
                                : "bg-gradient-to-r from-orange-400 to-red-500"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${usageStats.winRate}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Doubles Stats */}
                  <div className="p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-stone-800/50 dark:to-stone-800/30 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <MdCatchingPokemon className="w-4 h-4 text-amber-400" />
                      Doubles Format
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-stone-600 dark:text-stone-300">Usage Rate</span>
                          <span className="font-bold text-sm">{FORMAT_STATS.standard.doubles.usage}%</span>
                        </div>
                        <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${FORMAT_STATS.standard.doubles.usage * 10}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-stone-600 dark:text-stone-300">Win Rate</span>
                          <span className="font-bold text-sm">{FORMAT_STATS.standard.doubles.winRate}%</span>
                        </div>
                        <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                          <motion.div
                            className={cn(
                              "h-full",
                              FORMAT_STATS.standard.doubles.winRate >= 50
                                ? "bg-gradient-to-r from-green-400 to-green-600"
                                : "bg-gradient-to-r from-orange-400 to-red-500"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${FORMAT_STATS.standard.doubles.winRate}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-stone-300 dark:via-stone-600 to-transparent" />

                {/* All Tiers, VGC, and Battle Stadium in one row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Current Tiers */}
                  <div className="p-6 bg-gradient-to-br from-white/5 to-white/10 dark:from-stone-800/50 dark:to-stone-800/30 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <MdCatchingPokemon className="w-5 h-5 text-amber-400" />
                      <p className="text-sm font-medium uppercase tracking-wider text-stone-500 dark:text-stone-300">Current Tiers</p>
                    </div>
                    <div className="text-center">
                      {competitiveTiers ? (
                        <div className="flex items-center justify-center gap-4">
                          {competitiveTiers.singles_tier && (
                            <div className="flex flex-col items-center">
                              <p className="text-xs text-stone-500 dark:text-stone-300 mb-1">Singles</p>
                              <TierBadge tier={competitiveTiers.singles_tier} size="md" />
                            </div>
                          )}
                          {competitiveTiers.doubles_tier && (
                            <div className="flex flex-col items-center">
                              <p className="text-xs text-stone-500 dark:text-stone-300 mb-1">Doubles</p>
                              <TierBadge tier={competitiveTiers.doubles_tier} format="doubles" size="md" />
                            </div>
                          )}
                          {!competitiveTiers.singles_tier && !competitiveTiers.doubles_tier && (
                            <TierBadge tier={estimatedTier} size="md" />
                          )}
                        </div>
                      ) : (
                        <div>
                          <TierBadge tier={estimatedTier} size="md" />
                          <p className="text-xs text-stone-500 dark:text-stone-300 italic mt-2">
                            Estimated based on stats
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* VGC Eligibility */}
                  <div className="p-6 bg-gradient-to-br from-white/5 to-white/10 dark:from-stone-800/50 dark:to-stone-800/30 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <MdCatchingPokemon className="w-5 h-5 text-amber-400" />
                      <h4 className="text-sm font-medium uppercase tracking-wider text-stone-500 dark:text-stone-300">VGC Eligibility</h4>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-center">
                      {formatEligibility.vgc ? (
                        <>
                          <FiCheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-stone-700 dark:text-stone-300 font-medium">Legal</span>
                        </>
                      ) : (
                        <>
                          <FiXCircle className="w-5 h-5 text-red-500" />
                          <span className="text-sm text-stone-700 dark:text-stone-300 font-medium">Not Legal</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Battle Stadium */}
                  <div className="p-6 bg-gradient-to-br from-white/5 to-white/10 dark:from-stone-800/50 dark:to-stone-800/30 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <MdCatchingPokemon className="w-5 h-5 text-yellow-400" />
                      <h4 className="text-sm font-medium uppercase tracking-wider text-stone-500 dark:text-stone-300">Battle Stadium</h4>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-center">
                      {formatEligibility.battleStadium ? (
                        <>
                          <FiCheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-stone-700 dark:text-stone-300 font-medium">Legal</span>
                        </>
                      ) : (
                        <>
                          <FiXCircle className="w-5 h-5 text-red-500" />
                          <span className="text-sm text-stone-700 dark:text-stone-300 font-medium">Restricted</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedFormat === 'nationalDex' && (
              <div className="space-y-6">
                {/* Section Header */}
                <div className="text-center p-4 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/10 dark:to-green-900/10 rounded-xl">
                  <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-2">National Dex Format</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-300">All generations with legacy mechanics</p>
                </div>

                {/* National Dex Stats */}
                <div className="p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-stone-800/50 dark:to-stone-800/30 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <MdCatchingPokemon className="w-4 h-4 text-teal-400" />
                    National Dex Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-stone-600 dark:text-stone-300">Usage Rate</span>
                        <span className="font-bold text-sm">{FORMAT_STATS.nationalDex.usage}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-teal-400 to-teal-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${FORMAT_STATS.nationalDex.usage * 10}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-stone-600 dark:text-stone-300">Win Rate</span>
                        <span className="font-bold text-sm">{FORMAT_STATS.nationalDex.winRate}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full",
                            FORMAT_STATS.nationalDex.winRate >= 50
                              ? "bg-gradient-to-r from-green-400 to-green-600"
                              : "bg-gradient-to-r from-orange-400 to-red-500"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${FORMAT_STATS.nationalDex.winRate}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-stone-300 dark:via-stone-600 to-transparent" />

                <div className="text-center p-6 bg-gradient-to-br from-white/5 to-white/10 dark:from-stone-800/50 dark:to-stone-800/30 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <MdCatchingPokemon className="w-5 h-5 text-amber-400" />
                    <p className="text-sm font-medium uppercase tracking-wider text-stone-500 dark:text-stone-300">National Dex Tier</p>
                  </div>
                  {competitiveTiers?.national_dex_tier ? (
                    <TierBadge tier={competitiveTiers.national_dex_tier} format="national-dex" size="lg" />
                  ) : (
                    <div>
                      <TierBadge tier={estimatedTier} format="national-dex" size="lg" />
                      <p className="text-sm text-stone-500 dark:text-stone-300 italic mt-2">
                        Estimated tier - actual may vary
                      </p>
                    </div>
                  )}
                  <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                    <p className="text-sm text-teal-700 dark:text-teal-300">
                      National Dex includes all Pokémon, Mega Evolutions, Z-Moves, and moves from every generation
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedFormat === 'otherFormats' && (
              <div className="space-y-6">
                {/* Section Header */}
                <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/10 dark:to-pink-900/10 rounded-xl">
                  <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-2">Alternative Formats</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-300">Special rulesets and niche metagames</p>
                </div>

                <div className="space-y-4">
                {/* Little Cup */}
                <div className="p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-stone-800/50 dark:to-stone-800/30 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                  <h4 className="font-semibold text-sm mb-2">Little Cup</h4>
                  <div className="flex items-start gap-2">
                    {formatEligibility.littleCup ? (
                      <>
                        <FiCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-stone-600 dark:text-stone-300">Little Cup eligible (Level 5, unevolved)</span>
                      </>
                    ) : (
                      <>
                        <FiXCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-stone-600 dark:text-stone-300">
                          {species.is_baby
                            ? 'Baby Pokémon are banned in Little Cup'
                            : species.evolves_from_species
                            ? 'Has evolved - not LC eligible'
                            : 'Not eligible for Little Cup'}
                        </span>
                      </>
                    )}
                  </div>
                  {formatEligibility.littleCup && (
                    <div className="mt-2 text-xs">
                      <span className="text-stone-500">Usage: </span>
                      <span className="font-bold">{FORMAT_STATS.otherFormats.littleCup.usage}%</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-stone-300 dark:via-stone-600 to-transparent" />

                {/* Monotype */}
                <div className="p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-stone-800/50 dark:to-stone-800/30 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                  <h4 className="font-semibold text-sm mb-2">Monotype</h4>
                  <p className="text-sm text-stone-600 dark:text-stone-300">
                    Good on {pokemon.types?.map(t => t.type.name).join(' and ') || 'Unknown type'} teams
                  </p>
                  <div className="mt-2 text-xs">
                    <span className="text-stone-500">Usage: </span>
                    <span className="font-bold">{FORMAT_STATS.otherFormats.monotype.usage}%</span>
                    <span className="text-stone-500 ml-2">Win Rate: </span>
                    <span className="font-bold">{FORMAT_STATS.otherFormats.monotype.winRate}%</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-stone-300 dark:via-stone-600 to-transparent" />

                {/* NFE */}
                <div className="p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-stone-800/50 dark:to-stone-800/30 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                  <h4 className="font-semibold text-sm mb-2">NFE (Not Fully Evolved)</h4>
                  <div className="flex items-center gap-2">
                    {formatEligibility.nfe ? (
                      <>
                        <FiCheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-stone-600 dark:text-stone-300">Eligible for NFE format</span>
                      </>
                    ) : (
                      <>
                        <FiXCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-stone-600 dark:text-stone-300">Fully evolved - not NFE eligible</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-stone-300 dark:via-stone-600 to-transparent" />

                {/* 1v1 */}
                <div className="p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-stone-800/50 dark:to-stone-800/30 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                  <h4 className="font-semibold text-sm mb-2">1v1</h4>
                  <div className="flex items-center gap-2">
                    {baseStatTotal >= 500 ? (
                      <>
                        <FiCheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-stone-600 dark:text-stone-300">Viable in 1v1 format</span>
                      </>
                    ) : (
                      <>
                        <FiAlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-stone-600 dark:text-stone-300">May struggle in 1v1</span>
                      </>
                    )}
                  </div>
                </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </motion.div>
  );
};
