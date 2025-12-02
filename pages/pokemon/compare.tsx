import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../../components/ui/Container';
import { PageHeader } from '../../components/ui/BreadcrumbNavigation';
import { TypeBadge } from '../../components/ui/TypeBadge';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import Button from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import logger from '../../utils/logger';
import { fetchJSON } from '../../utils/unifiedFetch';
import { FaExchangeAlt, FaSearch, FaTimes, FaTrophy, FaShieldAlt, FaBolt, FaHeart } from 'react-icons/fa';

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
  types: Array<{ type: { name: string } }>;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
  height: number;
  weight: number;
  abilities: Array<{ ability: { name: string }; is_hidden: boolean }>;
  base_experience: number;
}

interface PokemonSearchResult {
  name: string;
  url: string;
}

const STAT_NAMES: Record<string, string> = {
  'hp': 'HP',
  'attack': 'Attack',
  'defense': 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  'speed': 'Speed'
};

const STAT_COLORS: Record<string, string> = {
  'hp': 'from-red-500 to-red-600',
  'attack': 'from-orange-500 to-orange-600',
  'defense': 'from-yellow-500 to-yellow-600',
  'special-attack': 'from-blue-500 to-blue-600',
  'special-defense': 'from-green-500 to-green-600',
  'speed': 'from-pink-500 to-pink-600'
};

/**
 * Pokemon Comparison Tool
 *
 * Features:
 * - Side-by-side Pokemon comparison
 * - Visual stat comparison bars
 * - Type effectiveness analysis
 * - Ability comparison
 * - Winner highlighting per stat
 */
const PokemonComparePage: NextPage = () => {
  const router = useRouter();
  const [pokemon1, setPokemon1] = useState<Pokemon | null>(null);
  const [pokemon2, setPokemon2] = useState<Pokemon | null>(null);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [suggestions1, setSuggestions1] = useState<PokemonSearchResult[]>([]);
  const [suggestions2, setSuggestions2] = useState<PokemonSearchResult[]>([]);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [allPokemon, setAllPokemon] = useState<PokemonSearchResult[]>([]);
  const [showSuggestions1, setShowSuggestions1] = useState(false);
  const [showSuggestions2, setShowSuggestions2] = useState(false);

  // Fetch all Pokemon names for search
  useEffect(() => {
    const fetchAllPokemon = async () => {
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
    fetchAllPokemon();
  }, []);

  // Check for URL params
  useEffect(() => {
    const { p1, p2 } = router.query;
    if (p1 && typeof p1 === 'string') {
      loadPokemon(p1, 1);
    }
    if (p2 && typeof p2 === 'string') {
      loadPokemon(p2, 2);
    }
  }, [router.query]);

  // Filter suggestions based on search
  useEffect(() => {
    if (search1.length >= 2) {
      const filtered = allPokemon
        .filter(p => p.name.toLowerCase().includes(search1.toLowerCase()))
        .slice(0, 8);
      setSuggestions1(filtered);
    } else {
      setSuggestions1([]);
    }
  }, [search1, allPokemon]);

  useEffect(() => {
    if (search2.length >= 2) {
      const filtered = allPokemon
        .filter(p => p.name.toLowerCase().includes(search2.toLowerCase()))
        .slice(0, 8);
      setSuggestions2(filtered);
    } else {
      setSuggestions2([]);
    }
  }, [search2, allPokemon]);

  const loadPokemon = async (nameOrId: string, slot: 1 | 2) => {
    const setLoading = slot === 1 ? setLoading1 : setLoading2;
    const setPokemon = slot === 1 ? setPokemon1 : setPokemon2;
    const setSearch = slot === 1 ? setSearch1 : setSearch2;
    const setShowSuggestions = slot === 1 ? setShowSuggestions1 : setShowSuggestions2;

    setLoading(true);
    setShowSuggestions(false);
    try {
      const data = await fetchJSON<Pokemon>(
        `https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}`,
        { useCache: true, cacheTime: 30 * 60 * 1000 }
      );
      if (data) {
        setPokemon(data);
        setSearch('');
        // Update URL
        const newQuery = { ...router.query };
        if (slot === 1) newQuery.p1 = data.name;
        else newQuery.p2 = data.name;
        router.replace({ query: newQuery }, undefined, { shallow: true });
      }
    } catch (error) {
      logger.error('Failed to load Pokemon', { error, nameOrId });
    } finally {
      setLoading(false);
    }
  };

  const swapPokemon = () => {
    const temp = pokemon1;
    setPokemon1(pokemon2);
    setPokemon2(temp);
    const newQuery = { ...router.query };
    if (pokemon2) newQuery.p1 = pokemon2.name;
    else delete newQuery.p1;
    if (pokemon1) newQuery.p2 = pokemon1.name;
    else delete newQuery.p2;
    router.replace({ query: newQuery }, undefined, { shallow: true });
  };

  const clearPokemon = (slot: 1 | 2) => {
    if (slot === 1) {
      setPokemon1(null);
      const newQuery = { ...router.query };
      delete newQuery.p1;
      router.replace({ query: newQuery }, undefined, { shallow: true });
    } else {
      setPokemon2(null);
      const newQuery = { ...router.query };
      delete newQuery.p2;
      router.replace({ query: newQuery }, undefined, { shallow: true });
    }
  };

  const getStatValue = (pokemon: Pokemon, statName: string): number => {
    const stat = pokemon.stats.find(s => s.stat.name === statName);
    return stat?.base_stat || 0;
  };

  const getTotalStats = (pokemon: Pokemon): number => {
    return pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
  };

  const getWinner = (stat: string): 1 | 2 | 0 => {
    if (!pokemon1 || !pokemon2) return 0;
    const val1 = getStatValue(pokemon1, stat);
    const val2 = getStatValue(pokemon2, stat);
    if (val1 > val2) return 1;
    if (val2 > val1) return 2;
    return 0;
  };

  const getOverallWinner = (): 1 | 2 | 0 => {
    if (!pokemon1 || !pokemon2) return 0;
    const total1 = getTotalStats(pokemon1);
    const total2 = getTotalStats(pokemon2);
    if (total1 > total2) return 1;
    if (total2 > total1) return 2;
    return 0;
  };

  const formatPokemonName = (name: string): string => {
    return name.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const renderPokemonSelector = (
    slot: 1 | 2,
    pokemon: Pokemon | null,
    search: string,
    setSearch: (s: string) => void,
    suggestions: PokemonSearchResult[],
    showSuggestions: boolean,
    setShowSuggestions: (s: boolean) => void,
    loading: boolean
  ) => (
    <Container variant="elevated" className="p-4 sm:p-6 relative">
      {pokemon ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Clear button */}
          <button
            onClick={() => clearPokemon(slot)}
            className="absolute top-3 right-3 p-2 rounded-full bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
          >
            <FaTimes className="w-4 h-4 text-stone-500" />
          </button>

          {/* Pokemon Image */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4">
            <img
              src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default}
              alt={pokemon.name}
              className="w-full h-full object-contain drop-shadow-lg"
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs px-2 py-0.5 rounded-full">
              #{pokemon.id.toString().padStart(4, '0')}
            </div>
          </div>

          {/* Name */}
          <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-2">
            {formatPokemonName(pokemon.name)}
          </h3>

          {/* Types */}
          <div className="flex justify-center gap-2 mb-4">
            {pokemon.types.map(t => (
              <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-stone-50 dark:bg-stone-700 rounded-lg p-2">
              <div className="text-stone-500 dark:text-stone-400 text-xs">Height</div>
              <div className="font-semibold">{(pokemon.height / 10).toFixed(1)}m</div>
            </div>
            <div className="bg-stone-50 dark:bg-stone-700 rounded-lg p-2">
              <div className="text-stone-500 dark:text-stone-400 text-xs">Weight</div>
              <div className="font-semibold">{(pokemon.weight / 10).toFixed(1)}kg</div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-8">
          <div className="relative">
            <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-700 rounded-xl px-4 py-3">
              <FaSearch className="text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search Pokemon..."
                className="flex-1 bg-transparent outline-none text-stone-800 dark:text-white placeholder-stone-400"
              />
              {loading && (
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {/* Suggestions Dropdown */}
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
                      onClick={() => loadPokemon(p.name, slot)}
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
                      <span className="font-medium text-stone-800 dark:text-white capitalize">
                        {formatPokemonName(p.name)}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Popular Pokemon Quick Select */}
          <div className="mt-6">
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">Popular choices:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['pikachu', 'charizard', 'mewtwo', 'garchomp', 'dragonite', 'tyranitar'].map(name => (
                <button
                  key={name}
                  onClick={() => loadPokemon(name, slot)}
                  className="px-3 py-1.5 bg-stone-100 dark:bg-stone-700 rounded-full text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900 hover:text-amber-700 dark:hover:text-amber-300 transition-colors capitalize"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Container>
  );

  const renderStatComparison = () => {
    if (!pokemon1 || !pokemon2) return null;

    const stats = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    const maxStat = 255; // Max possible base stat

    return (
      <Container variant="elevated" className="p-4 sm:p-6">
        <h3 className="text-lg font-bold text-stone-800 dark:text-white mb-6 text-center flex items-center justify-center gap-2">
          <FaBolt className="text-amber-500" />
          Base Stats Comparison
        </h3>

        <div className="space-y-4">
          {stats.map(stat => {
            const val1 = getStatValue(pokemon1, stat);
            const val2 = getStatValue(pokemon2, stat);
            const winner = getWinner(stat);

            return (
              <div key={stat} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className={cn(
                    'font-medium',
                    winner === 1 ? 'text-green-600 dark:text-green-400' : 'text-stone-600 dark:text-stone-400'
                  )}>
                    {val1}
                    {winner === 1 && <FaTrophy className="inline ml-1 text-amber-500 w-3 h-3" />}
                  </span>
                  <span className="font-semibold text-stone-800 dark:text-white">
                    {STAT_NAMES[stat]}
                  </span>
                  <span className={cn(
                    'font-medium',
                    winner === 2 ? 'text-green-600 dark:text-green-400' : 'text-stone-600 dark:text-stone-400'
                  )}>
                    {winner === 2 && <FaTrophy className="inline mr-1 text-amber-500 w-3 h-3" />}
                    {val2}
                  </span>
                </div>

                <div className="flex gap-1 items-center">
                  {/* Pokemon 1 bar (right aligned) */}
                  <div className="flex-1 h-4 bg-stone-100 dark:bg-stone-700 rounded-l-full overflow-hidden flex justify-end">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(val1 / maxStat) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={cn(
                        'h-full rounded-l-full bg-gradient-to-r',
                        STAT_COLORS[stat],
                        winner === 1 && 'ring-2 ring-green-400'
                      )}
                    />
                  </div>

                  <div className="w-px h-6 bg-stone-300 dark:bg-stone-600" />

                  {/* Pokemon 2 bar (left aligned) */}
                  <div className="flex-1 h-4 bg-stone-100 dark:bg-stone-700 rounded-r-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(val2 / maxStat) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={cn(
                        'h-full rounded-r-full bg-gradient-to-r',
                        STAT_COLORS[stat],
                        winner === 2 && 'ring-2 ring-green-400'
                      )}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Total Stats */}
          <div className="pt-4 mt-4 border-t border-stone-200 dark:border-stone-700">
            <div className="flex justify-between items-center">
              <div className={cn(
                'text-center',
                getOverallWinner() === 1 && 'text-green-600 dark:text-green-400'
              )}>
                <div className="text-2xl font-bold">
                  {getTotalStats(pokemon1)}
                  {getOverallWinner() === 1 && <FaTrophy className="inline ml-2 text-amber-500" />}
                </div>
                <div className="text-xs text-stone-500">Total</div>
              </div>
              <div className="text-lg font-bold text-stone-400">vs</div>
              <div className={cn(
                'text-center',
                getOverallWinner() === 2 && 'text-green-600 dark:text-green-400'
              )}>
                <div className="text-2xl font-bold">
                  {getOverallWinner() === 2 && <FaTrophy className="inline mr-2 text-amber-500" />}
                  {getTotalStats(pokemon2)}
                </div>
                <div className="text-xs text-stone-500">Total</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  };

  const renderAbilityComparison = () => {
    if (!pokemon1 || !pokemon2) return null;

    return (
      <Container variant="elevated" className="p-4 sm:p-6">
        <h3 className="text-lg font-bold text-stone-800 dark:text-white mb-4 text-center flex items-center justify-center gap-2">
          <FaShieldAlt className="text-purple-500" />
          Abilities
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Pokemon 1 Abilities */}
          <div className="space-y-2">
            {pokemon1.abilities.map(a => (
              <div
                key={a.ability.name}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm',
                  a.is_hidden
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                )}
              >
                <span className="capitalize">{formatPokemonName(a.ability.name)}</span>
                {a.is_hidden && (
                  <span className="ml-1 text-xs opacity-70">(Hidden)</span>
                )}
              </div>
            ))}
          </div>

          {/* Pokemon 2 Abilities */}
          <div className="space-y-2">
            {pokemon2.abilities.map(a => (
              <div
                key={a.ability.name}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm',
                  a.is_hidden
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                )}
              >
                <span className="capitalize">{formatPokemonName(a.ability.name)}</span>
                {a.is_hidden && (
                  <span className="ml-1 text-xs opacity-70">(Hidden)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    );
  };

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>
          {pokemon1 && pokemon2
            ? `${formatPokemonName(pokemon1.name)} vs ${formatPokemonName(pokemon2.name)} | DexTrends`
            : 'Pokemon Comparison Tool | DexTrends'}
        </title>
        <meta name="description" content="Compare Pokemon side by side - stats, abilities, types, and more. Find the best Pokemon for your team!" />
      </Head>

      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Pokemon Comparison"
          description="Compare any two Pokemon side by side"
          breadcrumbs={[
            { title: 'Home', href: '/', icon: '🏠', isActive: false },
            { title: 'Pokemon', href: '/pokemon', icon: '📖', isActive: false },
            { title: 'Compare', href: '/pokemon/compare', icon: '⚖️', isActive: true },
          ]}
        />
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Pokemon Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center mb-2">
              <span className="text-sm font-medium text-stone-500 dark:text-stone-400">Pokemon 1</span>
            </div>
            {renderPokemonSelector(
              1, pokemon1, search1, setSearch1, suggestions1, showSuggestions1, setShowSuggestions1, loading1
            )}
          </motion.div>

          {/* Swap Button */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 z-10" style={{ top: '280px' }}>
            <motion.button
              onClick={swapPokemon}
              disabled={!pokemon1 && !pokemon2}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'p-4 rounded-full bg-amber-500 text-white shadow-lg',
                'hover:bg-amber-600 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <FaExchangeAlt className="w-5 h-5" />
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center mb-2">
              <span className="text-sm font-medium text-stone-500 dark:text-stone-400">Pokemon 2</span>
            </div>
            {renderPokemonSelector(
              2, pokemon2, search2, setSearch2, suggestions2, showSuggestions2, setShowSuggestions2, loading2
            )}
          </motion.div>
        </div>

        {/* Mobile Swap Button */}
        <div className="md:hidden flex justify-center mb-6">
          <motion.button
            onClick={swapPokemon}
            disabled={!pokemon1 && !pokemon2}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'px-6 py-3 rounded-xl bg-amber-500 text-white font-medium shadow-lg',
              'hover:bg-amber-600 transition-colors flex items-center gap-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <FaExchangeAlt className="w-4 h-4" />
            Swap Pokemon
          </motion.button>
        </div>

        {/* Comparison Results */}
        <AnimatePresence>
          {pokemon1 && pokemon2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats Comparison */}
              {renderStatComparison()}

              {/* Abilities Comparison */}
              {renderAbilityComparison()}

              {/* View Details Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => router.push(`/pokedex/${pokemon1.id}`)}
                  variant="secondary"
                  className="w-full"
                >
                  View {formatPokemonName(pokemon1.name)} Details
                </Button>
                <Button
                  onClick={() => router.push(`/pokedex/${pokemon2.id}`)}
                  variant="secondary"
                  className="w-full"
                >
                  View {formatPokemonName(pokemon2.name)} Details
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!pokemon1 && !pokemon2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Container variant="elevated" className="p-8 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeart className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-2">
                Select Pokemon to Compare
              </h3>
              <p className="text-stone-600 dark:text-stone-400">
                Choose two Pokemon above to see a detailed side-by-side comparison of their stats, abilities, and more.
              </p>
            </Container>
          </motion.div>
        )}
      </div>
    </FullBleedWrapper>
  );
};

export default PokemonComparePage;
