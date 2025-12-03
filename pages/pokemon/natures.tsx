import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { FiChevronLeft, FiSearch, FiChevronUp, FiChevronDown, FiInfo, FiX, FiGrid, FiList } from 'react-icons/fi';

interface Nature {
  name: string;
  increasedStat: string | null;
  decreasedStat: string | null;
  flavor: string;
  description: string;
}

const STATS = ['Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];

const STAT_CONFIG: Record<string, { color: string; bgLight: string; bgDark: string; gradient: string }> = {
  'Attack': { color: 'text-red-600', bgLight: 'bg-red-100', bgDark: 'dark:bg-red-900/40', gradient: 'from-red-500 to-orange-500' },
  'Defense': { color: 'text-amber-600', bgLight: 'bg-amber-100', bgDark: 'dark:bg-amber-900/40', gradient: 'from-amber-500 to-yellow-500' },
  'Sp. Atk': { color: 'text-blue-600', bgLight: 'bg-blue-100', bgDark: 'dark:bg-blue-900/40', gradient: 'from-blue-500 to-indigo-500' },
  'Sp. Def': { color: 'text-emerald-600', bgLight: 'bg-emerald-100', bgDark: 'dark:bg-emerald-900/40', gradient: 'from-emerald-500 to-teal-500' },
  'Speed': { color: 'text-pink-600', bgLight: 'bg-pink-100', bgDark: 'dark:bg-pink-900/40', gradient: 'from-pink-500 to-rose-500' },
};

// Complete list of all 25 Pokemon natures
const NATURES: Nature[] = [
  // Neutral natures
  { name: 'Hardy', increasedStat: null, decreasedStat: null, flavor: 'Likes any flavor', description: 'A balanced nature with no stat modifications.' },
  { name: 'Docile', increasedStat: null, decreasedStat: null, flavor: 'Likes any flavor', description: 'A balanced nature with no stat modifications.' },
  { name: 'Serious', increasedStat: null, decreasedStat: null, flavor: 'Likes any flavor', description: 'A balanced nature with no stat modifications.' },
  { name: 'Bashful', increasedStat: null, decreasedStat: null, flavor: 'Likes any flavor', description: 'A balanced nature with no stat modifications.' },
  { name: 'Quirky', increasedStat: null, decreasedStat: null, flavor: 'Likes any flavor', description: 'A balanced nature with no stat modifications.' },

  // Attack increasing
  { name: 'Lonely', increasedStat: 'Attack', decreasedStat: 'Defense', flavor: 'Likes Spicy, dislikes Sour', description: 'Great for physical attackers that can afford lower Defense.' },
  { name: 'Brave', increasedStat: 'Attack', decreasedStat: 'Speed', flavor: 'Likes Spicy, dislikes Sweet', description: 'Ideal for Trick Room teams or slow physical powerhouses.' },
  { name: 'Adamant', increasedStat: 'Attack', decreasedStat: 'Sp. Atk', flavor: 'Likes Spicy, dislikes Dry', description: 'The most popular nature for physical attackers.' },
  { name: 'Naughty', increasedStat: 'Attack', decreasedStat: 'Sp. Def', flavor: 'Likes Spicy, dislikes Bitter', description: 'For mixed attackers prioritizing physical moves.' },

  // Defense increasing
  { name: 'Bold', increasedStat: 'Defense', decreasedStat: 'Attack', flavor: 'Likes Sour, dislikes Spicy', description: 'Perfect for physical walls that use special moves.' },
  { name: 'Relaxed', increasedStat: 'Defense', decreasedStat: 'Speed', flavor: 'Likes Sour, dislikes Sweet', description: 'Great for Trick Room walls or slow tanks.' },
  { name: 'Impish', increasedStat: 'Defense', decreasedStat: 'Sp. Atk', flavor: 'Likes Sour, dislikes Dry', description: 'Ideal for physical walls using status moves.' },
  { name: 'Lax', increasedStat: 'Defense', decreasedStat: 'Sp. Def', flavor: 'Likes Sour, dislikes Bitter', description: 'Rarely used due to lowering Sp. Def.' },

  // Sp. Atk increasing
  { name: 'Modest', increasedStat: 'Sp. Atk', decreasedStat: 'Attack', flavor: 'Likes Dry, dislikes Spicy', description: 'The most popular nature for special attackers.' },
  { name: 'Mild', increasedStat: 'Sp. Atk', decreasedStat: 'Defense', flavor: 'Likes Dry, dislikes Sour', description: 'For special attackers that can afford lower Defense.' },
  { name: 'Quiet', increasedStat: 'Sp. Atk', decreasedStat: 'Speed', flavor: 'Likes Dry, dislikes Sweet', description: 'Perfect for Trick Room special attackers.' },
  { name: 'Rash', increasedStat: 'Sp. Atk', decreasedStat: 'Sp. Def', flavor: 'Likes Dry, dislikes Bitter', description: 'For mixed attackers prioritizing special moves.' },

  // Sp. Def increasing
  { name: 'Calm', increasedStat: 'Sp. Def', decreasedStat: 'Attack', flavor: 'Likes Bitter, dislikes Spicy', description: 'Ideal for special walls using status moves.' },
  { name: 'Gentle', increasedStat: 'Sp. Def', decreasedStat: 'Defense', flavor: 'Likes Bitter, dislikes Sour', description: 'Rarely used due to lowering Defense.' },
  { name: 'Sassy', increasedStat: 'Sp. Def', decreasedStat: 'Speed', flavor: 'Likes Bitter, dislikes Sweet', description: 'Great for Trick Room special walls.' },
  { name: 'Careful', increasedStat: 'Sp. Def', decreasedStat: 'Sp. Atk', flavor: 'Likes Bitter, dislikes Dry', description: 'Perfect for special walls using physical moves.' },

  // Speed increasing
  { name: 'Timid', increasedStat: 'Speed', decreasedStat: 'Attack', flavor: 'Likes Sweet, dislikes Spicy', description: 'The most popular nature for fast special attackers.' },
  { name: 'Hasty', increasedStat: 'Speed', decreasedStat: 'Defense', flavor: 'Likes Sweet, dislikes Sour', description: 'For speedsters that can afford lower Defense.' },
  { name: 'Jolly', increasedStat: 'Speed', decreasedStat: 'Sp. Atk', flavor: 'Likes Sweet, dislikes Dry', description: 'The most popular nature for fast physical attackers.' },
  { name: 'Naive', increasedStat: 'Speed', decreasedStat: 'Sp. Def', flavor: 'Likes Sweet, dislikes Bitter', description: 'For fast mixed attackers.' },
];

// Competitive recommendations with descriptions
const COMPETITIVE_RECOMMENDATIONS = [
  { role: 'Physical Attacker', natures: ['Adamant', 'Jolly'], description: 'Max Attack or Speed', icon: '⚔️', color: 'from-red-500 to-orange-500' },
  { role: 'Special Attacker', natures: ['Modest', 'Timid'], description: 'Max Sp. Atk or Speed', icon: '✨', color: 'from-blue-500 to-indigo-500' },
  { role: 'Physical Wall', natures: ['Impish', 'Bold'], description: 'Max Defense', icon: '🛡️', color: 'from-amber-500 to-yellow-500' },
  { role: 'Special Wall', natures: ['Calm', 'Careful'], description: 'Max Sp. Def', icon: '🔮', color: 'from-emerald-500 to-teal-500' },
  { role: 'Trick Room', natures: ['Brave', 'Quiet'], description: 'Minimize Speed', icon: '⏰', color: 'from-purple-500 to-pink-500' },
  { role: 'Mixed Attacker', natures: ['Naive', 'Hasty'], description: 'Speed + Both Attacks', icon: '🌀', color: 'from-rose-500 to-pink-500' },
];

const NaturesPage: NextPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStat, setFilterStat] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards');
  const [showInfo, setShowInfo] = useState(false);

  const filteredNatures = useMemo(() => {
    return NATURES.filter(nature => {
      const matchesSearch = nature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nature.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = !filterStat ||
        nature.increasedStat === filterStat ||
        nature.decreasedStat === filterStat;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterStat]);

  const stats = useMemo(() => ({
    total: NATURES.length,
    neutral: NATURES.filter(n => !n.increasedStat).length,
    effective: NATURES.filter(n => n.increasedStat).length,
  }), []);

  const renderStatBadge = (stat: string | null, isIncrease: boolean) => {
    if (!stat) {
      return (
        <span className="text-xs text-stone-400 dark:text-stone-500 italic">None</span>
      );
    }
    const config = STAT_CONFIG[stat];
    return (
      <span className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        config.bgLight, config.bgDark, config.color
      )}>
        {isIncrease ? (
          <FiChevronUp className="w-3 h-3 text-green-500" />
        ) : (
          <FiChevronDown className="w-3 h-3 text-red-500" />
        )}
        {stat}
      </span>
    );
  };

  return (
    <>
      <Head>
        <title>Pokémon Natures Guide | DexTrends</title>
        <meta name="description" content="Complete guide to all 25 Pokemon natures with stat effects, competitive recommendations, and nature chart matrix." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 dark:from-stone-950 dark:via-stone-900 dark:to-amber-950">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-30 dark:opacity-20">
            <div className="absolute top-10 left-10 w-64 h-64 bg-amber-400 rounded-full blur-3xl" />
            <div className="absolute top-20 right-20 w-48 h-48 bg-orange-400 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-yellow-400 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 pt-6 pb-4">
            {/* Back Button */}
            <button
              onClick={() => router.push('/pokemon')}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors mb-4"
            >
              <FiChevronLeft className="w-4 h-4" />
              Pokémon Hub
            </button>

            {/* Hero Content */}
            <div className="text-center mb-6">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl md:text-5xl font-black mb-3"
              >
                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Natures Guide
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto"
              >
                Master the 25 natures that shape your Pokémon&apos;s stats
              </motion.p>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-4 sm:gap-8 mb-4"
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{stats.total}</div>
                <div className="text-xs sm:text-sm text-stone-500">Total</div>
              </div>
              <div className="w-px bg-stone-300 dark:bg-stone-600" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">{stats.effective}</div>
                <div className="text-xs sm:text-sm text-stone-500">Effective</div>
              </div>
              <div className="w-px bg-stone-300 dark:bg-stone-600" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-stone-600 dark:text-stone-400">{stats.neutral}</div>
                <div className="text-xs sm:text-sm text-stone-500">Neutral</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* How It Works */}
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          >
            <FiInfo className="w-4 h-4" />
            {showInfo ? 'Hide' : 'Show'} How Natures Work
          </button>

          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-stone-700 dark:text-stone-300">
                    Each nature increases one stat by <span className="font-bold text-green-600">+10%</span> and decreases another by <span className="font-bold text-red-600">-10%</span>.
                    Five neutral natures (Hardy, Docile, Serious, Bashful, Quirky) have no effect.
                    <span className="font-medium"> Natures do not affect HP.</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Competitive Recommendations */}
        <div className="container mx-auto px-4 pb-4">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-3">Competitive Guide</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {COMPETITIVE_RECOMMENDATIONS.map((rec) => (
              <motion.div
                key={rec.role}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "p-3 rounded-xl bg-gradient-to-br text-white",
                  rec.color
                )}
              >
                <div className="text-xl mb-1">{rec.icon}</div>
                <div className="text-xs font-bold mb-1">{rec.role}</div>
                <div className="text-[10px] opacity-80 mb-2">{rec.description}</div>
                <div className="flex flex-wrap gap-1">
                  {rec.natures.map(n => (
                    <span key={n} className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded-full font-medium">
                      {n}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="sticky top-14 md:top-16 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border-b border-stone-200 dark:border-stone-700">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search natures..."
                  className={cn(
                    "w-full pl-10 pr-10 py-2.5 rounded-xl",
                    "bg-stone-100 dark:bg-stone-800",
                    "border border-stone-200 dark:border-stone-700",
                    "focus:ring-2 focus:ring-amber-500 focus:border-transparent",
                    "text-stone-900 dark:text-white placeholder-stone-400",
                    "transition-all text-sm"
                  )}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    viewMode === 'cards'
                      ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-white'
                      : 'text-stone-500 dark:text-stone-400'
                  )}
                >
                  <FiGrid className="w-4 h-4" />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    viewMode === 'chart'
                      ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-white'
                      : 'text-stone-500 dark:text-stone-400'
                  )}
                >
                  <FiList className="w-4 h-4" />
                  Chart
                </button>
              </div>
            </div>

            {/* Stat Filter Pills */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setFilterStat(null)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                  !filterStat
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                )}
              >
                All Stats
              </button>
              {STATS.map(stat => {
                const config = STAT_CONFIG[stat];
                return (
                  <button
                    key={stat}
                    onClick={() => setFilterStat(filterStat === stat ? null : stat)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                      filterStat === stat
                        ? `bg-gradient-to-r ${config.gradient} text-white`
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    )}
                  >
                    {stat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="container mx-auto px-4 py-3">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Showing <span className="font-semibold text-stone-700 dark:text-stone-200">{filteredNatures.length}</span> natures
            {filterStat && ` affecting ${filterStat}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pb-8">
          {/* Chart View */}
          {viewMode === 'chart' && (
            <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
              <div className="p-4 border-b border-stone-200 dark:border-stone-700">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">Nature Matrix</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">Row = Increased Stat (+10%) | Column = Decreased Stat (-10%)</p>
              </div>
              <div className="overflow-x-auto p-4">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr>
                      <th className="p-2 text-xs font-medium text-stone-500 dark:text-stone-400">+↓ / -→</th>
                      {STATS.map(stat => (
                        <th key={stat} className="p-2">
                          <span className={cn(
                            'inline-block text-xs font-medium px-2 py-1 rounded-lg',
                            STAT_CONFIG[stat].bgLight, STAT_CONFIG[stat].bgDark, STAT_CONFIG[stat].color
                          )}>
                            {stat}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {STATS.map(increasedStat => (
                      <tr key={increasedStat}>
                        <td className="p-2">
                          <span className={cn(
                            'inline-block text-xs font-medium px-2 py-1 rounded-lg',
                            STAT_CONFIG[increasedStat].bgLight, STAT_CONFIG[increasedStat].bgDark, STAT_CONFIG[increasedStat].color
                          )}>
                            {increasedStat}
                          </span>
                        </td>
                        {STATS.map(decreasedStat => {
                          const nature = NATURES.find(n => n.increasedStat === increasedStat && n.decreasedStat === decreasedStat);
                          const isNeutral = increasedStat === decreasedStat;

                          return (
                            <td key={decreasedStat} className="p-2 text-center">
                              {isNeutral ? (
                                <span className="text-xs text-stone-400 dark:text-stone-500 italic">Neutral</span>
                              ) : nature ? (
                                <span className="text-sm font-medium text-stone-900 dark:text-white px-2 py-1 bg-stone-100 dark:bg-stone-700 rounded-lg">
                                  {nature.name}
                                </span>
                              ) : (
                                <span className="text-stone-300 dark:text-stone-600">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cards View */}
          {viewMode === 'cards' && (
            <>
              {filteredNatures.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    <FiSearch className="w-8 h-8 text-stone-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">No natures found</h3>
                  <p className="text-stone-500 dark:text-stone-400">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredNatures.map((nature, index) => {
                    const isNeutral = !nature.increasedStat;
                    const statConfig = nature.increasedStat ? STAT_CONFIG[nature.increasedStat] : null;

                    return (
                      <motion.div
                        key={nature.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.03, 0.3) }}
                        className={cn(
                          "bg-white dark:bg-stone-800 rounded-xl overflow-hidden",
                          "border border-stone-200 dark:border-stone-700",
                          "hover:shadow-lg transition-all duration-200",
                          isNeutral && "border-dashed"
                        )}
                      >
                        {/* Header with gradient for effective natures */}
                        {!isNeutral && statConfig && (
                          <div className={cn("h-1 bg-gradient-to-r", statConfig.gradient)} />
                        )}

                        <div className="p-4">
                          {/* Nature Name */}
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                              {nature.name}
                            </h3>
                            {isNeutral && (
                              <span className="text-xs px-2 py-0.5 bg-stone-100 dark:bg-stone-700 rounded-full text-stone-500">
                                Neutral
                              </span>
                            )}
                          </div>

                          {/* Stat Changes */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-stone-500 dark:text-stone-400">Increase</span>
                              {renderStatBadge(nature.increasedStat, true)}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-stone-500 dark:text-stone-400">Decrease</span>
                              {renderStatBadge(nature.decreasedStat, false)}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-stone-600 dark:text-stone-400 mb-2">
                            {nature.description}
                          </p>

                          {/* Flavor */}
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 italic">
                            {nature.flavor}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Stat Legend */}
        <div className="container mx-auto px-4 pb-8">
          <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-white mb-3">Stat Legend</h3>
            <div className="flex flex-wrap gap-3">
              {STATS.map(stat => {
                const config = STAT_CONFIG[stat];
                return (
                  <div key={stat} className="flex items-center gap-2">
                    <span className={cn('px-2 py-1 rounded-lg text-xs font-medium', config.bgLight, config.bgDark, config.color)}>
                      {stat}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      {stat === 'Sp. Atk' ? 'Special Attack' : stat === 'Sp. Def' ? 'Special Defense' : stat}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Full bleed layout
(NaturesPage as NextPage & { fullBleed?: boolean }).fullBleed = true;

export default NaturesPage;
