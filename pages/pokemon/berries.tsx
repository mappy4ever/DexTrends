import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeBadge } from '../../components/ui/TypeBadge';
import { cn } from '../../utils/cn';
import logger from '../../utils/logger';
import { fetchJSON } from '../../utils/unifiedFetch';
import { FiSearch, FiChevronDown, FiX, FiClock, FiDroplet, FiHeart, FiShield, FiZap, FiInfo } from 'react-icons/fi';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import PageErrorBoundary from '../../components/ui/PageErrorBoundary';
import { PageHeader } from '../../components/ui/BreadcrumbNavigation';
import { NoSearchResults } from '../../components/ui/EmptyState';

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
  key: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  berries: string[];
  description: string;
}

const BERRY_CATEGORIES: BerryCategory[] = [
  {
    key: 'all',
    name: 'All',
    icon: <FiDroplet className="w-4 h-4" />,
    color: 'from-stone-500 to-stone-600',
    berries: [],
    description: 'All berries in the game'
  },
  {
    key: 'healing',
    name: 'Healing',
    icon: <FiHeart className="w-4 h-4" />,
    color: 'from-pink-500 to-rose-500',
    berries: ['oran', 'sitrus', 'figy', 'wiki', 'mago', 'aguav', 'iapapa'],
    description: 'Restore HP when health is low'
  },
  {
    key: 'status',
    name: 'Status Cure',
    icon: <FiShield className="w-4 h-4" />,
    color: 'from-emerald-500 to-teal-500',
    berries: ['cheri', 'chesto', 'pecha', 'rawst', 'aspear', 'persim', 'lum'],
    description: 'Cure status conditions like paralysis, sleep, etc.'
  },
  {
    key: 'boost',
    name: 'Stat Boost',
    icon: <FiZap className="w-4 h-4" />,
    color: 'from-amber-500 to-orange-500',
    berries: ['liechi', 'ganlon', 'salac', 'petaya', 'apicot', 'lansat', 'starf', 'micle', 'custap', 'jaboca', 'rowap'],
    description: 'Boost stats when HP is low'
  },
  {
    key: 'resist',
    name: 'Type Resist',
    icon: <FiShield className="w-4 h-4" />,
    color: 'from-blue-500 to-indigo-500',
    berries: ['occa', 'passho', 'wacan', 'rindo', 'yache', 'chople', 'kebia', 'shuca', 'coba', 'payapa', 'tanga', 'charti', 'kasib', 'haban', 'colbur', 'babiri', 'chilan', 'roseli'],
    description: 'Reduce damage from super effective moves'
  },
  {
    key: 'ev',
    name: 'EV Reducing',
    icon: <FiDroplet className="w-4 h-4" />,
    color: 'from-purple-500 to-violet-500',
    berries: ['pomeg', 'kelpsy', 'qualot', 'hondew', 'grepa', 'tamato'],
    description: 'Reduce EVs and increase friendship'
  },
];

const FLAVOR_CONFIG: Record<string, { color: string; bgLight: string; bgDark: string; stat: string }> = {
  spicy: { color: 'text-red-600', bgLight: 'bg-red-100', bgDark: 'dark:bg-red-900/40', stat: 'Attack' },
  dry: { color: 'text-blue-600', bgLight: 'bg-blue-100', bgDark: 'dark:bg-blue-900/40', stat: 'Sp. Atk' },
  sweet: { color: 'text-pink-600', bgLight: 'bg-pink-100', bgDark: 'dark:bg-pink-900/40', stat: 'Speed' },
  bitter: { color: 'text-emerald-600', bgLight: 'bg-emerald-100', bgDark: 'dark:bg-emerald-900/40', stat: 'Sp. Def' },
  sour: { color: 'text-amber-600', bgLight: 'bg-amber-100', bgDark: 'dark:bg-amber-900/40', stat: 'Defense' },
};

const FIRMNESS_COLORS: Record<string, string> = {
  'very-soft': 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400',
  'soft': 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
  'hard': 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
  'very-hard': 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  'super-hard': 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
};

const BerriesPage: NextPage = () => {
  const [berries, setBerries] = useState<Berry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'power' | 'growth'>('name');
  const [showFlavorLegend, setShowFlavorLegend] = useState(false);

  useEffect(() => {
    const fetchBerries = async () => {
      setLoading(true);
      try {
        const listData = await fetchJSON<{ results: Array<{ name: string; url: string }> }>(
          'https://pokeapi.co/api/v2/berry?limit=100',
          { useCache: true, cacheTime: 60 * 60 * 1000 }
        );

        if (listData?.results) {
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
    if (selectedCategory !== 'all') {
      const category = BERRY_CATEGORIES.find(c => c.key === selectedCategory);
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

  const stats = useMemo(() => ({
    total: berries.length,
    healing: berries.filter(b => BERRY_CATEGORIES[1].berries.includes(b.name.toLowerCase())).length,
    resist: berries.filter(b => BERRY_CATEGORIES[4].berries.includes(b.name.toLowerCase())).length,
  }), [berries]);

  const getBerrySprite = (berryName: string) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${berryName}-berry.png`;

  const formatBerryName = (name: string): string =>
    name.charAt(0).toUpperCase() + name.slice(1) + ' Berry';

  const getMainFlavor = (berry: Berry): { name: string; potency: number } | null => {
    const flavorsWithPotency = berry.flavors.filter(f => f.potency > 0);
    if (flavorsWithPotency.length === 0) return null;
    return flavorsWithPotency.reduce((max, f) =>
      f.potency > max.potency ? { name: f.flavor.name, potency: f.potency } : max,
      { name: flavorsWithPotency[0].flavor.name, potency: flavorsWithPotency[0].potency }
    );
  };

  return (
    <>
      <Head>
        <title>Berry Database | DexTrends</title>
        <meta name="description" content="Complete guide to all Pokemon berries - effects, flavors, growth times, and Natural Gift types." />
      </Head>

      <PageErrorBoundary pageName="Berry Database">
        <FullBleedWrapper gradient="pokedex">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* PageHeader with Breadcrumbs */}
            <PageHeader
              title="Berry Database"
              description="Discover all berries and their unique effects"
              breadcrumbs={[
                { title: 'Home', href: '/', icon: '🏠', isActive: false },
                { title: 'Pokémon Hub', href: '/pokemon', icon: '🔴', isActive: false },
                { title: 'Berries', href: '/pokemon/berries', icon: '🍇', isActive: true },
              ]}
            >
              {/* Stats Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center gap-4 sm:gap-8 py-4"
              >
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-green-600 dark:text-green-400">{stats.total}</div>
                  <div className="text-xs sm:text-sm text-stone-500">Total</div>
                </div>
                <div className="w-px bg-stone-300 dark:bg-stone-600" />
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-pink-600 dark:text-pink-400">{stats.healing}</div>
                  <div className="text-xs sm:text-sm text-stone-500">Healing</div>
                </div>
                <div className="w-px bg-stone-300 dark:bg-stone-600" />
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">{stats.resist}</div>
                  <div className="text-xs sm:text-sm text-stone-500">Type Resist</div>
                </div>
              </motion.div>
            </PageHeader>

            {/* Sticky Search & Filters */}
            <div className="sticky top-14 md:top-16 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border-b border-stone-200 dark:border-stone-700 -mx-4 px-4">
              <div className="py-3">
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  <div className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search berries..."
                      className={cn(
                        "w-full pl-10 pr-10 py-2.5 rounded-xl",
                        "bg-stone-100 dark:bg-stone-800",
                        "border border-stone-200 dark:border-stone-700",
                        "focus:ring-2 focus:ring-green-500 focus:border-transparent",
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
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm",
                      "bg-stone-100 dark:bg-stone-800",
                      "border border-stone-200 dark:border-stone-700",
                      "focus:ring-2 focus:ring-green-500 focus:border-transparent",
                      "text-stone-900 dark:text-white"
                    )}
                  >
                    <option value="name">Sort by Name</option>
                    <option value="power">Sort by Power</option>
                    <option value="growth">Sort by Growth</option>
                  </select>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {BERRY_CATEGORIES.map(category => (
                    <motion.button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key)}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-full whitespace-nowrap text-xs sm:text-sm font-medium transition-all",
                        selectedCategory === category.key
                          ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                      )}
                    >
                      {category.icon}
                      {category.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Description & Flavor Legend */}
            <div className="py-3">
              {selectedCategory !== 'all' && (
                <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                  {BERRY_CATEGORIES.find(c => c.key === selectedCategory)?.description}
                </p>
              )}

              <button
                onClick={() => setShowFlavorLegend(!showFlavorLegend)}
                className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                <FiInfo className="w-4 h-4" />
                {showFlavorLegend ? 'Hide' : 'Show'} Flavor Legend
              </button>

              <AnimatePresence>
                {showFlavorLegend && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                      <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
                        Flavors affect which Pokémon like or dislike a berry based on their Nature
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(FLAVOR_CONFIG).map(([flavor, config]) => (
                          <div key={flavor} className="flex items-center gap-2">
                            <span className={cn('px-2 py-1 rounded-lg text-xs font-medium capitalize', config.bgLight, config.bgDark, config.color)}>
                              {flavor}
                            </span>
                            <span className="text-xs text-stone-500 dark:text-stone-400">→ {config.stat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results Count */}
            <div className="pb-2">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Showing <span className="font-semibold text-stone-700 dark:text-stone-200">{filteredBerries.length}</span> berries
                {selectedCategory !== 'all' && ` in ${BERRY_CATEGORIES.find(c => c.key === selectedCategory)?.name}`}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            {/* Berry Grid */}
            <div className="pb-8">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white dark:bg-stone-800 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-stone-200 dark:bg-stone-700 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
                          <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredBerries.length === 0 ? (
                <NoSearchResults
                  searchTerm={searchQuery}
                  filterCount={selectedCategory !== 'all' ? 1 : 0}
                  onClear={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredBerries.map((berry, index) => {
                    const mainFlavor = getMainFlavor(berry);

                    return (
                      <motion.div
                        key={berry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.02, 0.3) }}
                        className={cn(
                          "bg-white dark:bg-stone-800 rounded-xl overflow-hidden",
                          "border border-stone-200 dark:border-stone-700",
                          "hover:shadow-lg hover:border-green-300 dark:hover:border-green-600",
                          "transition-all duration-200"
                        )}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Berry Image */}
                            <div className="w-16 h-16 flex-shrink-0 bg-stone-100 dark:bg-stone-700 rounded-xl flex items-center justify-center">
                              <img
                                src={getBerrySprite(berry.name)}
                                alt={berry.name}
                                className="w-12 h-12 object-contain"
                                style={{ imageRendering: 'pixelated' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/placeholder-item.png';
                                }}
                              />
                            </div>

                            {/* Berry Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-stone-900 dark:text-white truncate">
                                {formatBerryName(berry.name)}
                              </h3>

                              {berry.natural_gift_type && (
                                <div className="flex items-center gap-2 mt-1">
                                  <TypeBadge type={berry.natural_gift_type.name} size="xs" />
                                  <span className="text-xs text-stone-500 dark:text-stone-400">
                                    Power {berry.natural_gift_power}
                                  </span>
                                </div>
                              )}

                              {mainFlavor && (
                                <div className="mt-2">
                                  <span className={cn(
                                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                                    FLAVOR_CONFIG[mainFlavor.name].bgLight,
                                    FLAVOR_CONFIG[mainFlavor.name].bgDark,
                                    FLAVOR_CONFIG[mainFlavor.name].color
                                  )}>
                                    {mainFlavor.name}
                                    <span className="opacity-70">({mainFlavor.potency})</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Stats Row */}
                          <div className="grid grid-cols-3 gap-2 mt-4">
                            <div className="text-center bg-stone-50 dark:bg-stone-700/50 rounded-lg p-2">
                              <FiClock className="w-3 h-3 mx-auto text-stone-400 mb-1" />
                              <div className="text-[10px] text-stone-500 dark:text-stone-400">Growth</div>
                              <div className="font-bold text-sm text-stone-900 dark:text-white">{berry.growth_time}h</div>
                            </div>
                            <div className="text-center bg-stone-50 dark:bg-stone-700/50 rounded-lg p-2">
                              <FiDroplet className="w-3 h-3 mx-auto text-stone-400 mb-1" />
                              <div className="text-[10px] text-stone-500 dark:text-stone-400">Harvest</div>
                              <div className="font-bold text-sm text-stone-900 dark:text-white">{berry.max_harvest}</div>
                            </div>
                            <div className="text-center bg-stone-50 dark:bg-stone-700/50 rounded-lg p-2">
                              <FiChevronDown className="w-3 h-3 mx-auto text-stone-400 mb-1" />
                              <div className="text-[10px] text-stone-500 dark:text-stone-400">Size</div>
                              <div className="font-bold text-sm text-stone-900 dark:text-white">{berry.size}mm</div>
                            </div>
                          </div>

                          {/* Firmness */}
                          <div className="mt-3 flex justify-center">
                            <span className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium capitalize',
                              FIRMNESS_COLORS[berry.firmness.name] || 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                            )}>
                              {berry.firmness.name.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </FullBleedWrapper>
      </PageErrorBoundary>
    </>
  );
};

// Full bleed layout
(BerriesPage as NextPage & { fullBleed?: boolean }).fullBleed = true;

export default BerriesPage;
