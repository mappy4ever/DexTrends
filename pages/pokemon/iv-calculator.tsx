import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../../components/ui/Container';
import { PageHeader } from '../../components/ui/BreadcrumbNavigation';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import { cn } from '../../utils/cn';
import logger from '../../utils/logger';
import { fetchJSON } from '../../utils/unifiedFetch';
import {
  FaCalculator, FaSearch, FaInfoCircle, FaCheck, FaTimes,
  FaChartBar, FaQuestion, FaDna, FaStar
} from 'react-icons/fa';

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other?: {
      'official-artwork'?: {
        front_default: string;
      };
    };
  };
  stats: Array<{ base_stat: number; stat: { name: string } }>;
}

interface PokemonSearchResult {
  name: string;
  url: string;
}

interface IVResult {
  stat: string;
  possibleIVs: number[];
  rating: 'perfect' | 'good' | 'decent' | 'bad';
}

const STAT_NAMES: Record<string, string> = {
  'hp': 'HP',
  'attack': 'Attack',
  'defense': 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  'speed': 'Speed'
};

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

const NATURES: Record<string, { increase: string | null; decrease: string | null }> = {
  'Hardy': { increase: null, decrease: null },
  'Lonely': { increase: 'attack', decrease: 'defense' },
  'Brave': { increase: 'attack', decrease: 'speed' },
  'Adamant': { increase: 'attack', decrease: 'special-attack' },
  'Naughty': { increase: 'attack', decrease: 'special-defense' },
  'Bold': { increase: 'defense', decrease: 'attack' },
  'Docile': { increase: null, decrease: null },
  'Relaxed': { increase: 'defense', decrease: 'speed' },
  'Impish': { increase: 'defense', decrease: 'special-attack' },
  'Lax': { increase: 'defense', decrease: 'special-defense' },
  'Timid': { increase: 'speed', decrease: 'attack' },
  'Hasty': { increase: 'speed', decrease: 'defense' },
  'Serious': { increase: null, decrease: null },
  'Jolly': { increase: 'speed', decrease: 'special-attack' },
  'Naive': { increase: 'speed', decrease: 'special-defense' },
  'Modest': { increase: 'special-attack', decrease: 'attack' },
  'Mild': { increase: 'special-attack', decrease: 'defense' },
  'Quiet': { increase: 'special-attack', decrease: 'speed' },
  'Bashful': { increase: null, decrease: null },
  'Rash': { increase: 'special-attack', decrease: 'special-defense' },
  'Calm': { increase: 'special-defense', decrease: 'attack' },
  'Gentle': { increase: 'special-defense', decrease: 'defense' },
  'Sassy': { increase: 'special-defense', decrease: 'speed' },
  'Careful': { increase: 'special-defense', decrease: 'special-attack' },
  'Quirky': { increase: null, decrease: null },
};

const IV_RATINGS = {
  perfect: { label: 'Perfect', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  good: { label: 'Good', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  decent: { label: 'Decent', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  bad: { label: 'Poor', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
};

/**
 * IV Calculator Page
 *
 * Features:
 * - Calculate possible IVs from Pokemon stats
 * - Nature selection
 * - EV input
 * - IV range visualization
 * - IV rating system
 */
const IVCalculatorPage: NextPage = () => {
  const [allPokemon, setAllPokemon] = useState<PokemonSearchResult[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PokemonSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculator inputs
  const [level, setLevel] = useState(50);
  const [nature, setNature] = useState('Hardy');
  const [stats, setStats] = useState<Record<string, number>>({
    'hp': 0,
    'attack': 0,
    'defense': 0,
    'special-attack': 0,
    'special-defense': 0,
    'speed': 0
  });
  const [evs, setEvs] = useState<Record<string, number>>({
    'hp': 0,
    'attack': 0,
    'defense': 0,
    'special-attack': 0,
    'special-defense': 0,
    'speed': 0
  });

  const [results, setResults] = useState<IVResult[] | null>(null);

  // Fetch Pokemon list
  useEffect(() => {
    const fetchPokemonList = async () => {
      try {
        const data = await fetchJSON<{ results: PokemonSearchResult[] }>(
          'https://pokeapi.co/api/v2/pokemon?limit=1025',
          { useCache: true, cacheTime: 60 * 60 * 1000 }
        );
        if (data?.results) {
          setAllPokemon(data.results);
        }
      } catch (error) {
        logger.error('Failed to fetch Pokemon list', { error });
      }
    };
    fetchPokemonList();
  }, []);

  // Filter suggestions
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const filtered = allPokemon
        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 8);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, allPokemon]);

  // Load Pokemon
  const loadPokemon = async (name: string) => {
    setLoading(true);
    setShowSuggestions(false);
    try {
      const data = await fetchJSON<Pokemon>(
        `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`,
        { useCache: true, cacheTime: 30 * 60 * 1000 }
      );
      if (data) {
        setSelectedPokemon(data);
        setSearchQuery('');
        setResults(null);
      }
    } catch (error) {
      logger.error('Failed to load Pokemon', { error, name });
    } finally {
      setLoading(false);
    }
  };

  // Calculate IVs
  const calculateIVs = () => {
    if (!selectedPokemon) return;

    const results: IVResult[] = [];

    STAT_ORDER.forEach(statName => {
      const baseStat = selectedPokemon.stats.find(s => s.stat.name === statName)?.base_stat || 0;
      const currentStat = stats[statName];
      const currentEV = evs[statName];

      const natureModifier = getNatureModifier(statName);
      const possibleIVs: number[] = [];

      // Calculate possible IVs (0-31)
      for (let iv = 0; iv <= 31; iv++) {
        const calculatedStat = calculateStatValue(statName, baseStat, iv, currentEV, level, natureModifier);
        if (calculatedStat === currentStat) {
          possibleIVs.push(iv);
        }
      }

      // Rate the IVs
      let rating: IVResult['rating'] = 'bad';
      if (possibleIVs.length > 0) {
        const maxIV = Math.max(...possibleIVs);
        if (maxIV === 31) rating = 'perfect';
        else if (maxIV >= 26) rating = 'good';
        else if (maxIV >= 16) rating = 'decent';
      }

      results.push({
        stat: statName,
        possibleIVs,
        rating
      });
    });

    setResults(results);
  };

  const getNatureModifier = (statName: string): number => {
    const natureData = NATURES[nature];
    if (!natureData) return 1;
    if (natureData.increase === statName) return 1.1;
    if (natureData.decrease === statName) return 0.9;
    return 1;
  };

  const calculateStatValue = (
    statName: string,
    baseStat: number,
    iv: number,
    ev: number,
    level: number,
    natureModifier: number
  ): number => {
    if (statName === 'hp') {
      // HP formula
      return Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
    } else {
      // Other stats formula
      return Math.floor((Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + 5) * natureModifier);
    }
  };

  const formatPokemonName = (name: string): string => {
    return name.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getIVRangeText = (ivs: number[]): string => {
    if (ivs.length === 0) return 'No match';
    if (ivs.length === 1) return ivs[0].toString();
    const min = Math.min(...ivs);
    const max = Math.max(...ivs);
    if (min === max) return min.toString();
    return `${min} - ${max}`;
  };

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>IV Calculator | DexTrends</title>
        <meta name="description" content="Calculate your Pokemon's Individual Values (IVs) based on their stats, level, nature, and EVs." />
      </Head>

      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="IV Calculator"
          description="Calculate your Pokemon's hidden Individual Values"
          breadcrumbs={[
            { title: 'Home', href: '/', icon: '🏠', isActive: false },
            { title: 'Pokemon', href: '/pokemon', icon: '📖', isActive: false },
            { title: 'IV Calculator', href: '/pokemon/iv-calculator', icon: '🧬', isActive: true },
          ]}
        />
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Info Box */}
        <Container variant="gradient" className="p-4 sm:p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FaInfoCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-800 dark:text-white mb-1">
                What are IVs?
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Individual Values (IVs) are hidden numbers from 0-31 that determine your Pokemon's potential.
                Higher IVs mean higher stats. A Pokemon with 31 IVs in a stat is considered "perfect" in that stat.
              </p>
            </div>
          </div>
        </Container>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Pokemon Selection */}
            <Container variant="elevated" className="p-4 sm:p-6">
              <h3 className="font-bold text-stone-800 dark:text-white mb-4 flex items-center gap-2">
                <FaSearch className="text-amber-500" />
                Select Pokemon
              </h3>

              {selectedPokemon ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-stone-50 dark:bg-stone-700 rounded-xl flex items-center justify-center">
                    <img
                      src={selectedPokemon.sprites.other?.['official-artwork']?.front_default || selectedPokemon.sprites.front_default}
                      alt={selectedPokemon.name}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-800 dark:text-white">
                      {formatPokemonName(selectedPokemon.name)}
                    </h4>
                    <p className="text-sm text-stone-500">#{selectedPokemon.id.toString().padStart(4, '0')}</p>
                    <div className="flex gap-2 mt-2 text-xs">
                      {selectedPokemon.stats.map(s => (
                        <span key={s.stat.name} className="bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">
                          {STAT_NAMES[s.stat.name]}: {s.base_stat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPokemon(null)}
                    className="p-2 rounded-full bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search for a Pokemon..."
                    className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />

                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden"
                      >
                        {suggestions.map((p, i) => (
                          <button
                            key={p.name}
                            onClick={() => loadPokemon(p.name)}
                            className={cn(
                              'w-full px-4 py-3 text-left hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors flex items-center gap-3',
                              i !== suggestions.length - 1 && 'border-b border-stone-100 dark:border-stone-700'
                            )}
                          >
                            <img
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.url.split('/').filter(Boolean).pop()}.png`}
                              alt={p.name}
                              className="w-10 h-10"
                            />
                            <span className="font-medium capitalize">{formatPokemonName(p.name)}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </Container>

            {/* Level and Nature */}
            {selectedPokemon && (
              <Container variant="elevated" className="p-4 sm:p-6">
                <h3 className="font-bold text-stone-800 dark:text-white mb-4">
                  Pokemon Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Level */}
                  <div>
                    <label className="text-sm font-medium text-stone-600 dark:text-stone-400 mb-2 block">
                      Level
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={level}
                      onChange={(e) => setLevel(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Nature */}
                  <div>
                    <label className="text-sm font-medium text-stone-600 dark:text-stone-400 mb-2 block">
                      Nature
                    </label>
                    <select
                      value={nature}
                      onChange={(e) => setNature(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {Object.keys(NATURES).map(n => (
                        <option key={n} value={n}>
                          {n}
                          {NATURES[n].increase && ` (+${STAT_NAMES[NATURES[n].increase!]}, -${STAT_NAMES[NATURES[n].decrease!]})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Container>
            )}

            {/* Stats Input */}
            {selectedPokemon && (
              <Container variant="elevated" className="p-4 sm:p-6">
                <h3 className="font-bold text-stone-800 dark:text-white mb-4 flex items-center gap-2">
                  <FaChartBar className="text-amber-500" />
                  Enter Current Stats
                </h3>

                <div className="space-y-4">
                  {STAT_ORDER.map(statName => {
                    const baseStat = selectedPokemon.stats.find(s => s.stat.name === statName)?.base_stat || 0;
                    const natureEffect = NATURES[nature];
                    const isIncreased = natureEffect?.increase === statName;
                    const isDecreased = natureEffect?.decrease === statName;

                    return (
                      <div key={statName} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3">
                          <span className={cn(
                            'text-sm font-medium',
                            isIncreased && 'text-green-500',
                            isDecreased && 'text-red-500'
                          )}>
                            {STAT_NAMES[statName]}
                            {isIncreased && ' ↑'}
                            {isDecreased && ' ↓'}
                          </span>
                        </div>
                        <div className="col-span-5">
                          <input
                            type="number"
                            min={0}
                            value={stats[statName]}
                            onChange={(e) => setStats({
                              ...stats,
                              [statName]: parseInt(e.target.value) || 0
                            })}
                            placeholder="Stat"
                            className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="number"
                            min={0}
                            max={252}
                            value={evs[statName]}
                            onChange={(e) => setEvs({
                              ...evs,
                              [statName]: Math.min(252, parseInt(e.target.value) || 0)
                            })}
                            placeholder="EVs"
                            className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <motion.button
                  onClick={calculateIVs}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <FaCalculator className="w-4 h-4" />
                  Calculate IVs
                </motion.button>
              </Container>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Results */}
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Container variant="elevated" className="p-4 sm:p-6">
                  <h3 className="font-bold text-stone-800 dark:text-white mb-4 flex items-center gap-2">
                    <FaDna className="text-purple-500" />
                    IV Results
                  </h3>

                  <div className="space-y-4">
                    {results.map(result => {
                      const ratingInfo = IV_RATINGS[result.rating];

                      return (
                        <div key={result.stat} className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-stone-800 dark:text-white">
                              {STAT_NAMES[result.stat]}
                            </span>
                            <span className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              ratingInfo.bg,
                              ratingInfo.color
                            )}>
                              {ratingInfo.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-stone-800 dark:text-white">
                              {getIVRangeText(result.possibleIVs)}
                            </span>
                            {result.possibleIVs.includes(31) && (
                              <FaStar className="w-5 h-5 text-amber-500" />
                            )}
                          </div>

                          {/* IV Bar Visualization */}
                          <div className="mt-2 h-2 bg-stone-200 dark:bg-stone-600 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(Math.max(...result.possibleIVs, 0) / 31) * 100}%`
                              }}
                              transition={{ duration: 0.5 }}
                              className={cn(
                                'h-full rounded-full',
                                result.rating === 'perfect' ? 'bg-amber-500' :
                                result.rating === 'good' ? 'bg-green-500' :
                                result.rating === 'decent' ? 'bg-blue-500' : 'bg-red-500'
                              )}
                            />
                          </div>

                          {result.possibleIVs.length === 0 && (
                            <p className="text-xs text-red-500 mt-2">
                              No valid IV found - check your inputs
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Overall Rating */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
                    <div className="text-center">
                      <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                        Overall IV Rating
                      </p>
                      <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                        {Math.round(
                          results.reduce((sum, r) =>
                            sum + (r.possibleIVs.length > 0 ? Math.max(...r.possibleIVs) : 0), 0
                          ) / 6
                        )} / 31
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Average of maximum possible IVs
                      </p>
                    </div>
                  </div>
                </Container>
              </motion.div>
            )}

            {/* IV Guide */}
            <Container variant="elevated" className="p-4 sm:p-6">
              <h3 className="font-bold text-stone-800 dark:text-white mb-4 flex items-center gap-2">
                <FaQuestion className="text-blue-500" />
                IV Rating Guide
              </h3>

              <div className="space-y-3">
                {Object.entries(IV_RATINGS).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium w-20 text-center',
                      value.bg,
                      value.color
                    )}>
                      {value.label}
                    </span>
                    <span className="text-sm text-stone-600 dark:text-stone-400">
                      {key === 'perfect' ? '31 IVs - Maximum potential' :
                       key === 'good' ? '26-30 IVs - Great stats' :
                       key === 'decent' ? '16-25 IVs - Average stats' :
                       '0-15 IVs - Below average'}
                    </span>
                  </div>
                ))}
              </div>
            </Container>

            {/* Tips */}
            <Container variant="elevated" className="p-4 sm:p-6">
              <h3 className="font-bold text-stone-800 dark:text-white mb-3">
                Tips for Accurate Calculation
              </h3>
              <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
                <li className="flex items-start gap-2">
                  <FaCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Use Pokemon at higher levels for more accurate results
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Enter EVs as accurately as possible
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Make sure you've selected the correct nature
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  If no match is found, double-check your stat values
                </li>
              </ul>
            </Container>
          </div>
        </div>
      </div>
    </FullBleedWrapper>
  );
};

export default IVCalculatorPage;
