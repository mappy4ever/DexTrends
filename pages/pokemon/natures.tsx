import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { Container } from '../../components/ui/Container';
import { PageHeader } from '../../components/ui/BreadcrumbNavigation';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import { cn } from '../../utils/cn';
import { FaArrowUp, FaArrowDown, FaMinus, FaSearch, FaFilter, FaInfoCircle } from 'react-icons/fa';

interface Nature {
  name: string;
  increasedStat: string | null;
  decreasedStat: string | null;
  flavor: string;
  description: string;
}

const STATS = ['Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];

const STAT_COLORS: Record<string, string> = {
  'Attack': 'text-red-500 bg-red-50 dark:bg-red-900/30',
  'Defense': 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30',
  'Sp. Atk': 'text-blue-500 bg-blue-50 dark:bg-blue-900/30',
  'Sp. Def': 'text-green-500 bg-green-50 dark:bg-green-900/30',
  'Speed': 'text-pink-500 bg-pink-50 dark:bg-pink-900/30',
};

// Complete list of all 25 Pokemon natures
const NATURES: Nature[] = [
  // Neutral natures (no stat changes)
  { name: 'Hardy', increasedStat: null, decreasedStat: null, flavor: 'Likes any flavor', description: 'A balanced nature with no stat modifications.' },
  { name: 'Docile', increasedStat: null, decreasedStat: null, flavor: 'Likes any flavor', description: 'A balanced nature with no stat modifications.' },
  { name: 'Serious', increasedStat: null, decreasedStat: null, flavor: 'Likes any flavor', description: 'A balanced nature with no stat modifications.' },
  { name: 'Bashful', increasedStat: null, decreasedStat: null, flavor: 'Likes any flavor', description: 'A balanced nature with no stat modifications.' },
  { name: 'Quirky', increasedStat: null, decreasedStat: null, flavor: 'Likes any flavor', description: 'A balanced nature with no stat modifications.' },

  // Attack increasing natures
  { name: 'Lonely', increasedStat: 'Attack', decreasedStat: 'Defense', flavor: 'Likes Spicy, dislikes Sour', description: 'Great for physical attackers that can afford lower Defense.' },
  { name: 'Brave', increasedStat: 'Attack', decreasedStat: 'Speed', flavor: 'Likes Spicy, dislikes Sweet', description: 'Ideal for Trick Room teams or slow physical powerhouses.' },
  { name: 'Adamant', increasedStat: 'Attack', decreasedStat: 'Sp. Atk', flavor: 'Likes Spicy, dislikes Dry', description: 'The most popular nature for physical attackers.' },
  { name: 'Naughty', increasedStat: 'Attack', decreasedStat: 'Sp. Def', flavor: 'Likes Spicy, dislikes Bitter', description: 'For mixed attackers prioritizing physical moves.' },

  // Defense increasing natures
  { name: 'Bold', increasedStat: 'Defense', decreasedStat: 'Attack', flavor: 'Likes Sour, dislikes Spicy', description: 'Perfect for physical walls that use special moves.' },
  { name: 'Relaxed', increasedStat: 'Defense', decreasedStat: 'Speed', flavor: 'Likes Sour, dislikes Sweet', description: 'Great for Trick Room walls or slow tanks.' },
  { name: 'Impish', increasedStat: 'Defense', decreasedStat: 'Sp. Atk', flavor: 'Likes Sour, dislikes Dry', description: 'Ideal for physical walls using status moves.' },
  { name: 'Lax', increasedStat: 'Defense', decreasedStat: 'Sp. Def', flavor: 'Likes Sour, dislikes Bitter', description: 'Rarely used due to lowering Sp. Def.' },

  // Sp. Atk increasing natures
  { name: 'Modest', increasedStat: 'Sp. Atk', decreasedStat: 'Attack', flavor: 'Likes Dry, dislikes Spicy', description: 'The most popular nature for special attackers.' },
  { name: 'Mild', increasedStat: 'Sp. Atk', decreasedStat: 'Defense', flavor: 'Likes Dry, dislikes Sour', description: 'For special attackers that can afford lower Defense.' },
  { name: 'Quiet', increasedStat: 'Sp. Atk', decreasedStat: 'Speed', flavor: 'Likes Dry, dislikes Sweet', description: 'Perfect for Trick Room special attackers.' },
  { name: 'Rash', increasedStat: 'Sp. Atk', decreasedStat: 'Sp. Def', flavor: 'Likes Dry, dislikes Bitter', description: 'For mixed attackers prioritizing special moves.' },

  // Sp. Def increasing natures
  { name: 'Calm', increasedStat: 'Sp. Def', decreasedStat: 'Attack', flavor: 'Likes Bitter, dislikes Spicy', description: 'Ideal for special walls using status moves.' },
  { name: 'Gentle', increasedStat: 'Sp. Def', decreasedStat: 'Defense', flavor: 'Likes Bitter, dislikes Sour', description: 'Rarely used due to lowering Defense.' },
  { name: 'Sassy', increasedStat: 'Sp. Def', decreasedStat: 'Speed', flavor: 'Likes Bitter, dislikes Sweet', description: 'Great for Trick Room special walls.' },
  { name: 'Careful', increasedStat: 'Sp. Def', decreasedStat: 'Sp. Atk', flavor: 'Likes Bitter, dislikes Dry', description: 'Perfect for special walls using physical moves.' },

  // Speed increasing natures
  { name: 'Timid', increasedStat: 'Speed', decreasedStat: 'Attack', flavor: 'Likes Sweet, dislikes Spicy', description: 'The most popular nature for fast special attackers.' },
  { name: 'Hasty', increasedStat: 'Speed', decreasedStat: 'Defense', flavor: 'Likes Sweet, dislikes Sour', description: 'For speedsters that can afford lower Defense.' },
  { name: 'Jolly', increasedStat: 'Speed', decreasedStat: 'Sp. Atk', flavor: 'Likes Sweet, dislikes Dry', description: 'The most popular nature for fast physical attackers.' },
  { name: 'Naive', increasedStat: 'Speed', decreasedStat: 'Sp. Def', flavor: 'Likes Sweet, dislikes Bitter', description: 'For fast mixed attackers.' },
];

// Competitive recommendations
const COMPETITIVE_NATURES = {
  physicalAttacker: ['Adamant', 'Jolly'],
  specialAttacker: ['Modest', 'Timid'],
  physicalWall: ['Impish', 'Bold'],
  specialWall: ['Calm', 'Careful'],
  trickRoom: ['Brave', 'Quiet'],
  mixed: ['Naive', 'Hasty', 'Naughty', 'Rash'],
};

/**
 * Pokemon Natures Reference Page
 *
 * Features:
 * - Complete list of all 25 natures
 * - Stat modification visualization
 * - Nature chart matrix
 * - Competitive recommendations
 * - Search and filter
 */
const NaturesPage: NextPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStat, setFilterStat] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards');

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

  const renderStatChange = (stat: string | null, isIncrease: boolean) => {
    if (!stat) {
      return (
        <span className="text-stone-400 flex items-center gap-1">
          <FaMinus className="w-3 h-3" />
          None
        </span>
      );
    }
    return (
      <span className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium',
        STAT_COLORS[stat]
      )}>
        {isIncrease ? (
          <FaArrowUp className="w-3 h-3 text-green-500" />
        ) : (
          <FaArrowDown className="w-3 h-3 text-red-500" />
        )}
        {stat}
      </span>
    );
  };

  const renderNatureChart = () => {
    const statOrder = ['Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];

    return (
      <Container variant="elevated" className="p-4 sm:p-6 overflow-x-auto">
        <h3 className="text-lg font-bold text-stone-800 dark:text-white mb-4 text-center">
          Nature Chart Matrix
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-300 mb-6 text-center">
          Row = Increased Stat (+10%) | Column = Decreased Stat (-10%)
        </p>

        <div className="min-w-[600px]">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 text-xs font-medium text-stone-500 dark:text-stone-300">
                  +↓ / -→
                </th>
                {statOrder.map(stat => (
                  <th key={stat} className="p-2">
                    <span className={cn(
                      'text-xs font-medium px-2 py-1 rounded',
                      STAT_COLORS[stat]
                    )}>
                      {stat}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statOrder.map(increasedStat => (
                <tr key={increasedStat}>
                  <td className="p-2">
                    <span className={cn(
                      'text-xs font-medium px-2 py-1 rounded',
                      STAT_COLORS[increasedStat]
                    )}>
                      {increasedStat}
                    </span>
                  </td>
                  {statOrder.map(decreasedStat => {
                    const nature = NATURES.find(
                      n => n.increasedStat === increasedStat && n.decreasedStat === decreasedStat
                    );
                    const isNeutral = increasedStat === decreasedStat;
                    const neutralNatures = NATURES.filter(n => !n.increasedStat && !n.decreasedStat);

                    return (
                      <td key={decreasedStat} className="p-2 text-center">
                        {isNeutral ? (
                          <span className="text-xs text-stone-400 dark:text-stone-500">
                            {neutralNatures.map(n => n.name).join(', ')}
                          </span>
                        ) : nature ? (
                          <motion.span
                            whileHover={{ scale: 1.1 }}
                            className={cn(
                              'inline-block px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer',
                              'bg-stone-100 dark:bg-stone-700 hover:bg-amber-100 dark:hover:bg-amber-900/30',
                              'transition-colors'
                            )}
                          >
                            {nature.name}
                          </motion.span>
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
      </Container>
    );
  };

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Pokemon Natures Guide | DexTrends</title>
        <meta name="description" content="Complete guide to all 25 Pokemon natures - stat modifications, competitive recommendations, and nature chart matrix." />
      </Head>

      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Pokemon Natures"
          description="Complete guide to all 25 natures and their stat effects"
          breadcrumbs={[
            { title: 'Home', href: '/', icon: '🏠', isActive: false },
            { title: 'Pokemon', href: '/pokemon', icon: '📖', isActive: false },
            { title: 'Natures', href: '/pokemon/natures', icon: '🧬', isActive: true },
          ]}
        />
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Quick Info */}
        <Container variant="gradient" className="p-4 sm:p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <FaInfoCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-800 dark:text-white mb-1">
                How Natures Work
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300">
                Each nature increases one stat by 10% and decreases another by 10%.
                Five neutral natures (Hardy, Docile, Serious, Bashful, Quirky) have no effect.
                Natures do not affect HP.
              </p>
            </div>
          </div>
        </Container>

        {/* Competitive Recommendations */}
        <Container variant="elevated" className="p-4 sm:p-6 mb-6">
          <h3 className="font-bold text-stone-800 dark:text-white mb-4">
            Competitive Recommendations
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(COMPETITIVE_NATURES).map(([role, natures]) => (
              <div key={role} className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-3">
                <div className="text-xs font-medium text-stone-500 dark:text-stone-300 mb-2 capitalize">
                  {role.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="space-y-1">
                  {natures.map(nature => (
                    <span
                      key={nature}
                      className="block text-sm font-medium text-stone-800 dark:text-white"
                    >
                      {nature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search natures..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Stat Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <motion.button
              onClick={() => setFilterStat(null)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                !filterStat
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
              )}
            >
              All
            </motion.button>
            {STATS.map(stat => (
              <motion.button
                key={stat}
                onClick={() => setFilterStat(filterStat === stat ? null : stat)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                  filterStat === stat
                    ? STAT_COLORS[stat].replace('text-', 'bg-').split(' ')[0] + ' text-white'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                )}
              >
                {stat}
              </motion.button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                viewMode === 'cards'
                  ? 'bg-white dark:bg-stone-700 shadow-sm'
                  : 'text-stone-500 dark:text-stone-300'
              )}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                viewMode === 'chart'
                  ? 'bg-white dark:bg-stone-700 shadow-sm'
                  : 'text-stone-500 dark:text-stone-300'
              )}
            >
              Chart
            </button>
          </div>
        </div>

        {/* Chart View */}
        {viewMode === 'chart' && renderNatureChart()}

        {/* Cards View */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNatures.map((nature, index) => (
              <motion.div
                key={nature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Container
                  variant="elevated"
                  className={cn(
                    'p-4 h-full',
                    !nature.increasedStat && 'border-dashed border-2 border-stone-200 dark:border-stone-700'
                  )}
                >
                  {/* Nature Name */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-stone-800 dark:text-white">
                      {nature.name}
                    </h3>
                    {!nature.increasedStat && (
                      <span className="text-xs px-2 py-1 bg-stone-100 dark:bg-stone-700 rounded-full text-stone-500">
                        Neutral
                      </span>
                    )}
                  </div>

                  {/* Stat Changes */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500 dark:text-stone-300 w-16">Increase:</span>
                      {renderStatChange(nature.increasedStat, true)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500 dark:text-stone-300 w-16">Decrease:</span>
                      {renderStatChange(nature.decreasedStat, false)}
                    </div>
                  </div>

                  {/* Flavor */}
                  <div className="text-xs text-stone-500 dark:text-stone-300 mb-3">
                    {nature.flavor}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-stone-600 dark:text-stone-300">
                    {nature.description}
                  </p>
                </Container>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredNatures.length === 0 && (
          <Container variant="elevated" className="p-8 text-center">
            <FaSearch className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-800 dark:text-white mb-2">
              No natures found
            </h3>
            <p className="text-stone-500 dark:text-stone-300">
              Try adjusting your search or filter criteria
            </p>
          </Container>
        )}

        {/* Stats Legend */}
        <Container variant="elevated" className="p-4 mt-6">
          <h3 className="font-semibold text-stone-800 dark:text-white mb-3">
            Stat Legend
          </h3>
          <div className="flex flex-wrap gap-3">
            {STATS.map(stat => (
              <div key={stat} className="flex items-center gap-2">
                <span className={cn(
                  'px-2 py-1 rounded text-sm font-medium',
                  STAT_COLORS[stat]
                )}>
                  {stat}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-300">
                  {stat === 'Sp. Atk' ? 'Special Attack' :
                   stat === 'Sp. Def' ? 'Special Defense' : stat}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </FullBleedWrapper>
  );
};

export default NaturesPage;
