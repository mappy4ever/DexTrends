import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '../../utils/cn';
import { TYPOGRAPHY, TRANSITION, SPRING_PHYSICS } from '../ui/design-system/glass-constants';
import { ComparisonStat } from '../ui/StatDisplay';
import { Container } from '../ui/Container';
import Button from '../ui/Button';
import { IoClose, IoSearch, IoSwapHorizontal, IoTrophy } from 'react-icons/io5';
import { fetchJSON } from '../../utils/unifiedFetch';
import { API_CONFIG } from '../../config/api';
import logger from '../../utils/logger';

// ===========================================
// TYPES
// ===========================================

interface PokemonBasicInfo {
  id: number;
  name: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  sprite: string;
  types: string[];
}

interface PokemonComparePanelProps {
  pokemon1: PokemonBasicInfo;
  pokemon2?: PokemonBasicInfo | null;
  onSelectPokemon?: () => void;
  onClose?: () => void;
  className?: string;
}

// ===========================================
// STAT LABELS
// ===========================================

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  specialAttack: 'Sp. Attack',
  specialDefense: 'Sp. Defense',
  speed: 'Speed',
};

// ===========================================
// HELPERS
// ===========================================

function getStatTotal(stats: PokemonBasicInfo['stats']): number {
  return Object.values(stats).reduce((sum, val) => sum + val, 0);
}

function getStatWins(stats1: PokemonBasicInfo['stats'], stats2: PokemonBasicInfo['stats']): { pokemon1: number; pokemon2: number; ties: number } {
  let pokemon1Wins = 0;
  let pokemon2Wins = 0;
  let ties = 0;

  Object.keys(stats1).forEach((key) => {
    const stat1 = stats1[key as keyof PokemonBasicInfo['stats']];
    const stat2 = stats2[key as keyof PokemonBasicInfo['stats']];
    if (stat1 > stat2) pokemon1Wins++;
    else if (stat2 > stat1) pokemon2Wins++;
    else ties++;
  });

  return { pokemon1: pokemon1Wins, pokemon2: pokemon2Wins, ties };
}

// ===========================================
// POKEMON SEARCH MODAL
// ===========================================

interface PokemonSearchProps {
  onSelect: (pokemon: PokemonBasicInfo) => void;
  onClose: () => void;
  excludeId?: number;
}

export function PokemonSearchModal({ onSelect, onClose, excludeId }: PokemonSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ name: string; url: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [allPokemon, setAllPokemon] = useState<Array<{ name: string; url: string }>>([]);

  // Load all Pokemon on mount
  useEffect(() => {
    const loadPokemon = async () => {
      try {
        const data = await fetchJSON<{ results: Array<{ name: string; url: string }> }>(
          `${API_CONFIG.POKEAPI_BASE_URL}/pokemon?limit=1025`
        );
        if (data?.results) {
          setAllPokemon(data.results);
        }
      } catch (err) {
        logger.error('Failed to load Pokemon list:', err);
      }
    };
    loadPokemon();
  }, []);

  // Filter results based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults(allPokemon.slice(0, 20));
      return;
    }

    const filtered = allPokemon.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 20);
    setResults(filtered);
  }, [query, allPokemon]);

  // Handle selection
  const handleSelect = async (pokemon: { name: string; url: string }) => {
    setLoading(true);
    try {
      const data = await fetchJSON<any>(pokemon.url);
      if (data) {
        const pokemonInfo: PokemonBasicInfo = {
          id: data.id,
          name: data.name,
          stats: {
            hp: data.stats.find((s: any) => s.stat.name === 'hp')?.base_stat || 0,
            attack: data.stats.find((s: any) => s.stat.name === 'attack')?.base_stat || 0,
            defense: data.stats.find((s: any) => s.stat.name === 'defense')?.base_stat || 0,
            specialAttack: data.stats.find((s: any) => s.stat.name === 'special-attack')?.base_stat || 0,
            specialDefense: data.stats.find((s: any) => s.stat.name === 'special-defense')?.base_stat || 0,
            speed: data.stats.find((s: any) => s.stat.name === 'speed')?.base_stat || 0,
          },
          sprite: data.sprites?.front_default || '',
          types: data.types?.map((t: any) => t.type.name) || [],
        };
        onSelect(pokemonInfo);
      }
    } catch (err) {
      logger.error('Failed to load Pokemon:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={SPRING_PHYSICS.gentle}
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className={cn(TYPOGRAPHY.heading.h4)}>Select Pokemon</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name..."
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-xl',
                'bg-stone-100 dark:bg-stone-800',
                'border border-stone-200 dark:border-stone-700',
                'focus:outline-none focus:ring-2 focus:ring-amber-500',
                'text-stone-900 dark:text-white placeholder-stone-400'
              )}
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-stone-500">
              No Pokemon found
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((pokemon) => {
                const id = parseInt(pokemon.url.split('/').filter(Boolean).pop() || '0');
                const isExcluded = id === excludeId;

                return (
                  <button
                    key={pokemon.name}
                    onClick={() => !isExcluded && handleSelect(pokemon)}
                    disabled={isExcluded}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl',
                      'transition-all duration-150',
                      isExcluded
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer'
                    )}
                  >
                    <Image
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                      alt={pokemon.name}
                      width={48}
                      height={48}
                      className="w-12 h-12"
                    />
                    <span className="font-medium capitalize text-stone-900 dark:text-white">
                      {pokemon.name.replace(/-/g, ' ')}
                    </span>
                    <span className="text-sm text-stone-400">
                      #{String(id).padStart(3, '0')}
                    </span>
                    {isExcluded && (
                      <span className="ml-auto text-xs text-stone-400">(Current)</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===========================================
// MAIN COMPARE PANEL
// ===========================================

export function PokemonComparePanel({
  pokemon1,
  pokemon2,
  onSelectPokemon,
  onClose,
  className,
}: PokemonComparePanelProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [comparePokemon, setComparePokemon] = useState<PokemonBasicInfo | null>(pokemon2 || null);

  // Calculate comparison stats
  const comparison = useMemo(() => {
    if (!comparePokemon) return null;

    const wins = getStatWins(pokemon1.stats, comparePokemon.stats);
    const total1 = getStatTotal(pokemon1.stats);
    const total2 = getStatTotal(comparePokemon.stats);

    return { wins, total1, total2 };
  }, [pokemon1, comparePokemon]);

  const handleSelectPokemon = (pokemon: PokemonBasicInfo) => {
    setComparePokemon(pokemon);
    setShowSearch(false);
  };

  return (
    <>
      <Container
        variant="default"
        className={cn(
          'backdrop-blur-xl bg-white dark:bg-stone-900/50',
          'border border-stone-200 dark:border-stone-700 shadow-xl',
          className
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className={cn(TYPOGRAPHY.label, 'text-stone-700 dark:text-stone-300')}>
              COMPARE STATS
            </h3>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowSearch(true)}
                icon={<IoSwapHorizontal className="w-4 h-4" />}
              >
                {comparePokemon ? 'Change' : 'Select Pokemon'}
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <IoClose className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {comparePokemon ? (
            <>
              {/* Pokemon Headers */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-6 items-center">
                {/* Pokemon 1 */}
                <div className="flex items-center gap-3">
                  {pokemon1.sprite && (
                    <Image
                      src={pokemon1.sprite}
                      alt={pokemon1.name}
                      width={64}
                      height={64}
                      className="w-16 h-16"
                    />
                  )}
                  <div>
                    <p className="font-bold capitalize text-stone-900 dark:text-white">
                      {pokemon1.name.replace(/-/g, ' ')}
                    </p>
                    <p className="text-sm text-stone-500">
                      Total: <span className="font-semibold text-stone-700 dark:text-stone-300">{comparison?.total1}</span>
                    </p>
                  </div>
                </div>

                {/* Dotted Divider */}
                <div className="h-16 border-l-2 border-dashed border-stone-200 dark:border-stone-700" />

                {/* Pokemon 2 */}
                <div className="flex items-center gap-3 justify-end text-right">
                  <div>
                    <p className="font-bold capitalize text-stone-900 dark:text-white">
                      {comparePokemon.name.replace(/-/g, ' ')}
                    </p>
                    <p className="text-sm text-stone-500">
                      Total: <span className="font-semibold text-stone-700 dark:text-stone-300">{comparison?.total2}</span>
                    </p>
                  </div>
                  {comparePokemon.sprite && (
                    <Image
                      src={comparePokemon.sprite}
                      alt={comparePokemon.name}
                      width={64}
                      height={64}
                      className="w-16 h-16"
                    />
                  )}
                </div>
              </div>

              {/* Stat Comparison Bars */}
              <div className="space-y-3 mb-6">
                {Object.keys(pokemon1.stats).map((key) => (
                  <ComparisonStat
                    key={key}
                    label={STAT_LABELS[key]}
                    value1={pokemon1.stats[key as keyof PokemonBasicInfo['stats']]}
                    value2={comparePokemon.stats[key as keyof PokemonBasicInfo['stats']]}
                    label1={pokemon1.name}
                    label2={comparePokemon.name}
                  />
                ))}
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-800/50">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className={cn(
                      'text-2xl font-bold',
                      comparison && comparison.wins.pokemon1 > comparison.wins.pokemon2
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-stone-600 dark:text-stone-400'
                    )}>
                      {comparison?.wins.pokemon1}
                    </div>
                    <div className="text-xs text-stone-500 uppercase tracking-wide">
                      {pokemon1.name.split('-')[0]} wins
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-stone-400">
                      {comparison?.wins.ties}
                    </div>
                    <div className="text-xs text-stone-500 uppercase tracking-wide">
                      Ties
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      'text-2xl font-bold',
                      comparison && comparison.wins.pokemon2 > comparison.wins.pokemon1
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-stone-600 dark:text-stone-400'
                    )}>
                      {comparison?.wins.pokemon2}
                    </div>
                    <div className="text-xs text-stone-500 uppercase tracking-wide">
                      {comparePokemon.name.split('-')[0]} wins
                    </div>
                  </div>
                </div>

                {/* Overall Winner */}
                {comparison && (comparison.wins.pokemon1 !== comparison.wins.pokemon2) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 text-center"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <IoTrophy className="w-5 h-5 text-amber-500" />
                      <span className="font-semibold text-stone-900 dark:text-white capitalize">
                        {comparison.wins.pokemon1 > comparison.wins.pokemon2
                          ? pokemon1.name.replace(/-/g, ' ')
                          : comparePokemon.name.replace(/-/g, ' ')
                        }
                      </span>
                      <span className="text-stone-500">has better base stats overall</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                <IoSwapHorizontal className="w-8 h-8 text-stone-400" />
              </div>
              <h4 className="font-semibold text-stone-900 dark:text-white mb-2">
                Compare with another Pokemon
              </h4>
              <p className="text-sm text-stone-500 mb-4">
                Select a Pokemon to compare base stats side by side
              </p>
              <Button
                variant="primary"
                onClick={() => setShowSearch(true)}
              >
                Select Pokemon
              </Button>
            </div>
          )}
        </div>
      </Container>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <PokemonSearchModal
            onSelect={handleSelectPokemon}
            onClose={() => setShowSearch(false)}
            excludeId={pokemon1.id}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default PokemonComparePanel;
