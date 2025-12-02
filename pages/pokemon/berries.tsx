import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { Container } from '../../components/ui/Container';
import { PageHeader } from '../../components/ui/BreadcrumbNavigation';
import { TypeBadge } from '../../components/ui/TypeBadge';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import { cn } from '../../utils/cn';
import logger from '../../utils/logger';
import { fetchJSON } from '../../utils/unifiedFetch';
import { FaSearch, FaLeaf, FaClock, FaFire, FaShieldAlt, FaHeart, FaBolt, FaAppleAlt } from 'react-icons/fa';

interface Berry {
  id: number;
  name: string;
  growth_time: number;
  max_harvest: number;
  natural_gift_power: number;
  natural_gift_type: { name: string } | null;
  size: number;
  smoothness: number;
  soil_dryness: number;
  firmness: { name: string };
  flavors: Array<{
    potency: number;
    flavor: { name: string };
  }>;
  item: { name: string; url: string };
}

interface BerryCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
  berries: string[];
  description: string;
}

const BERRY_CATEGORIES: BerryCategory[] = [
  {
    name: 'Healing',
    icon: <FaHeart className="w-4 h-4" />,
    color: 'from-pink-400 to-rose-500',
    berries: ['oran', 'sitrus', 'figy', 'wiki', 'mago', 'aguav', 'iapapa'],
    description: 'Restore HP when health is low'
  },
  {
    name: 'Status Cure',
    icon: <FaShieldAlt className="w-4 h-4" />,
    color: 'from-green-400 to-emerald-500',
    berries: ['cheri', 'chesto', 'pecha', 'rawst', 'aspear', 'persim', 'lum'],
    description: 'Cure status conditions like paralysis, sleep, etc.'
  },
  {
    name: 'Stat Boost',
    icon: <FaBolt className="w-4 h-4" />,
    color: 'from-amber-400 to-orange-500',
    berries: ['liechi', 'ganlon', 'salac', 'petaya', 'apicot', 'lansat', 'starf', 'micle', 'custap', 'jaboca', 'rowap'],
    description: 'Boost stats when HP is low'
  },
  {
    name: 'Type Resist',
    icon: <FaShieldAlt className="w-4 h-4" />,
    color: 'from-blue-400 to-cyan-500',
    berries: ['occa', 'passho', 'wacan', 'rindo', 'yache', 'chople', 'kebia', 'shuca', 'coba', 'payapa', 'tanga', 'charti', 'kasib', 'haban', 'colbur', 'babiri', 'chilan', 'roseli'],
    description: 'Reduce damage from super effective moves'
  },
  {
    name: 'EV Reducing',
    icon: <FaLeaf className="w-4 h-4" />,
    color: 'from-purple-400 to-violet-500',
    berries: ['pomeg', 'kelpsy', 'qualot', 'hondew', 'grepa', 'tamato'],
    description: 'Reduce EVs and increase friendship'
  },
];

const FLAVOR_COLORS: Record<string, string> = {
  spicy: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  dry: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  sweet: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  bitter: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  sour: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
};

const FIRMNESS_COLORS: Record<string, string> = {
  'very-soft': 'bg-pink-100 text-pink-700',
  'soft': 'bg-green-100 text-green-700',
  'hard': 'bg-amber-100 text-amber-700',
  'very-hard': 'bg-red-100 text-red-700',
  'super-hard': 'bg-purple-100 text-purple-700',
};

/**
 * Berry Database Page
 *
 * Features:
 * - Complete list of all berries
 * - Category filtering
 * - Flavor profiles
 * - Natural Gift type and power
 * - Growth time information
 */
const BerriesPage: NextPage = () => {
  const [berries, setBerries] = useState<Berry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'power' | 'growth'>('name');

  useEffect(() => {
    const fetchBerries = async () => {
      setLoading(true);
      try {
        // Fetch all berries list
        const listData = await fetchJSON<{ results: Array<{ name: string; url: string }> }>(
          'https://pokeapi.co/api/v2/berry?limit=100',
          { useCache: true, cacheTime: 60 * 60 * 1000 }
        );

        if (listData?.results) {
          // Fetch details for each berry (in parallel)
          const berryPromises = listData.results.map(async (berry) => {
            const data = await fetchJSON<Berry>(
              `https://pokeapi.co/api/v2/berry/${berry.name}`,
              { useCache: true, cacheTime: 60 * 60 * 1000 }
            );
            return data;
          });

          const berryResults = await Promise.all(berryPromises);
          const validBerries = berryResults.filter((b): b is Berry => b !== null);
          setBerries(validBerries);
        }
      } catch (error) {
        logger.error('Failed to fetch berries', { error });
      } finally {
        setLoading(false);
      }
    };

    fetchBerries();
  }, []);

  const filteredBerries = useMemo(() => {
    let filtered = berries;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(berry =>
        berry.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      const category = BERRY_CATEGORIES.find(c => c.name === selectedCategory);
      if (category) {
        filtered = filtered.filter(berry =>
          category.berries.includes(berry.name.toLowerCase())
        );
      }
    }

    // Sort
    switch (sortBy) {
      case 'power':
        filtered = [...filtered].sort((a, b) => b.natural_gift_power - a.natural_gift_power);
        break;
      case 'growth':
        filtered = [...filtered].sort((a, b) => a.growth_time - b.growth_time);
        break;
      default:
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [berries, searchQuery, selectedCategory, sortBy]);

  const getBerrySprite = (berryName: string) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${berryName}-berry.png`;
  };

  const formatBerryName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1) + ' Berry';
  };

  const getMainFlavor = (berry: Berry): { name: string; potency: number } | null => {
    const flavorsWithPotency = berry.flavors.filter(f => f.potency > 0);
    if (flavorsWithPotency.length === 0) return null;
    return flavorsWithPotency.reduce((max, f) =>
      f.potency > max.potency ? { name: f.flavor.name, potency: f.potency } : max,
      { name: flavorsWithPotency[0].flavor.name, potency: flavorsWithPotency[0].potency }
    );
  };

  const renderBerryCard = (berry: Berry, index: number) => {
    const mainFlavor = getMainFlavor(berry);

    return (
      <motion.div
        key={berry.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
      >
        <Container variant="elevated" className="p-4 h-full hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-3">
            {/* Berry Image */}
            <div className="w-16 h-16 flex-shrink-0 bg-stone-50 dark:bg-stone-700 rounded-xl flex items-center justify-center">
              <img
                src={getBerrySprite(berry.name)}
                alt={berry.name}
                className="w-12 h-12 object-contain pixelated"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder-item.png';
                }}
              />
            </div>

            {/* Berry Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-stone-800 dark:text-white truncate">
                {formatBerryName(berry.name)}
              </h3>

              {/* Type Badge */}
              {berry.natural_gift_type && (
                <div className="flex items-center gap-2 mt-1">
                  <TypeBadge type={berry.natural_gift_type.name} size="xs" />
                  <span className="text-xs text-stone-500 dark:text-stone-300">
                    Power: {berry.natural_gift_power}
                  </span>
                </div>
              )}

              {/* Flavor */}
              {mainFlavor && (
                <div className="mt-2">
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                    FLAVOR_COLORS[mainFlavor.name]
                  )}>
                    {mainFlavor.name.charAt(0).toUpperCase() + mainFlavor.name.slice(1)}
                    <span className="opacity-70">({mainFlavor.potency})</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-2">
              <FaClock className="w-3 h-3 mx-auto text-stone-400 mb-1" />
              <div className="text-xs text-stone-500 dark:text-stone-300">Growth</div>
              <div className="font-semibold text-stone-800 dark:text-white text-sm">
                {berry.growth_time}h
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-2">
              <FaAppleAlt className="w-3 h-3 mx-auto text-stone-400 mb-1" />
              <div className="text-xs text-stone-500 dark:text-stone-300">Harvest</div>
              <div className="font-semibold text-stone-800 dark:text-white text-sm">
                {berry.max_harvest}
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-2">
              <FaLeaf className="w-3 h-3 mx-auto text-stone-400 mb-1" />
              <div className="text-xs text-stone-500 dark:text-stone-300">Size</div>
              <div className="font-semibold text-stone-800 dark:text-white text-sm">
                {berry.size}mm
              </div>
            </div>
          </div>

          {/* Firmness Badge */}
          <div className="mt-3 flex justify-center">
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium capitalize',
              FIRMNESS_COLORS[berry.firmness.name] || 'bg-stone-100 text-stone-700'
            )}>
              {berry.firmness.name.replace('-', ' ')}
            </span>
          </div>
        </Container>
      </motion.div>
    );
  };

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Berry Database | DexTrends</title>
        <meta name="description" content="Complete guide to all Pokemon berries - effects, flavors, growth times, and Natural Gift types." />
      </Head>

      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Berry Database"
          description="Complete guide to all Pokemon berries"
          breadcrumbs={[
            { title: 'Home', href: '/', icon: '🏠', isActive: false },
            { title: 'Pokemon', href: '/pokemon', icon: '📖', isActive: false },
            { title: 'Berries', href: '/pokemon/berries', icon: '🍓', isActive: true },
          ]}
        />
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Category Pills */}
        <Container variant="elevated" className="p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <motion.button
              onClick={() => setSelectedCategory(null)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2',
                !selectedCategory
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
              )}
            >
              <FaAppleAlt className="w-4 h-4" />
              All Berries
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                {berries.length}
              </span>
            </motion.button>

            {BERRY_CATEGORIES.map(category => {
              const count = berries.filter(b =>
                category.berries.includes(b.name.toLowerCase())
              ).length;

              return (
                <motion.button
                  key={category.name}
                  onClick={() => setSelectedCategory(
                    selectedCategory === category.name ? null : category.name
                  )}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2',
                    selectedCategory === category.name
                      ? `bg-gradient-to-r ${category.color} text-white`
                      : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                  )}
                >
                  {category.icon}
                  {category.name}
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-xs',
                    selectedCategory === category.name
                      ? 'bg-white/20'
                      : 'bg-stone-200 dark:bg-stone-600'
                  )}>
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Category Description */}
          {selectedCategory && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-stone-500 dark:text-stone-300"
            >
              {BERRY_CATEGORIES.find(c => c.name === selectedCategory)?.description}
            </motion.p>
          )}
        </Container>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search berries..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="name">Sort by Name</option>
            <option value="power">Sort by Power</option>
            <option value="growth">Sort by Growth Time</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Container key={i} variant="elevated" className="p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-stone-200 dark:bg-stone-700 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
                  </div>
                </div>
              </Container>
            ))}
          </div>
        )}

        {/* Berry Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBerries.map((berry, index) => renderBerryCard(berry, index))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredBerries.length === 0 && (
          <Container variant="elevated" className="p-8 text-center">
            <FaSearch className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-800 dark:text-white mb-2">
              No berries found
            </h3>
            <p className="text-stone-500 dark:text-stone-300">
              Try adjusting your search or filter criteria
            </p>
          </Container>
        )}

        {/* Flavor Legend */}
        <Container variant="elevated" className="p-4 mt-6">
          <h3 className="font-semibold text-stone-800 dark:text-white mb-3">
            Flavor Legend
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-300 mb-3">
            Flavors affect which Pokemon like or dislike a berry based on their Nature
          </p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(FLAVOR_COLORS).map(([flavor, colorClass]) => (
              <div key={flavor} className="flex items-center gap-2">
                <span className={cn(
                  'px-2 py-1 rounded text-xs font-medium capitalize',
                  colorClass
                )}>
                  {flavor}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-300">
                  {flavor === 'spicy' ? '→ Attack' :
                   flavor === 'dry' ? '→ Sp. Atk' :
                   flavor === 'sweet' ? '→ Speed' :
                   flavor === 'bitter' ? '→ Sp. Def' : '→ Defense'}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </FullBleedWrapper>
  );
};

export default BerriesPage;
