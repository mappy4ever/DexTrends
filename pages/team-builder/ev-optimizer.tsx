/**
 * EV Optimizer Page
 * Advanced tool for optimizing Pokemon EVs with visual feedback
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { getPokemonSDK } from '../../utils/pokemonSDK';
import { FadeIn, SlideUp } from '../../components/ui/animations/animations';
import { TypeBadge } from '../../components/ui/TypeBadge';
import { Container } from '../../components/ui/Container';
import { CircularCard } from '../../components/ui/design-system/CircularCard';
import { GradientButton } from '../../components/ui/design-system';
import { TypeGradientBadge } from '../../components/ui/design-system/TypeGradientBadge';
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import StyledBackButton from '../../components/ui/StyledBackButton';
import { PageHeader } from '../../components/ui/BreadcrumbNavigation';
import { IoInformationCircle, IoHelpCircle, IoClose } from 'react-icons/io5';
import { TYPOGRAPHY } from '../../components/ui/design-system/glass-constants';
import { cn } from '../../utils/cn';
import { 
  calculateAllStats, 
  NATURE_MODIFIERS, 
  STAT_NAMES,
  calculateSpeedTier,
  optimizeEVsForStat
} from '../../utils/statCalculations';
import type { TeamMember, StatSpread, Nature } from '../../types/team-builder';
import type { Pokemon } from "../../types/pokemon";
import logger from '../../utils/logger';

// Dynamic import for the heat map component
const EVHeatMap = dynamic(
  () => import('../../components/team-builder/EVHeatMap'),
  { 
    ssr: false,
    loading: () => <div className="h-[600px] flex items-center justify-center">Loading EV optimizer...</div>
  }
);

interface SpeedBenchmark {
  name: string;
  speed: number;
  description: string;
}

const COMMON_SPEED_BENCHMARKS: SpeedBenchmark[] = [
  { name: 'Dragapult', speed: 142, description: 'Base 142 Speed' },
  { name: 'Garchomp', speed: 102, description: 'Base 102 Speed' },
  { name: 'Tapu Koko', speed: 130, description: 'Base 130 Speed' },
  { name: 'Landorus-T', speed: 91, description: 'Base 91 Speed' },
  { name: 'Aegislash', speed: 60, description: 'Base 60 Speed' },
];

// Onboarding Tooltip Component
function OnboardingTip({ title, children, onDismiss }: { title: string; children: React.ReactNode; onDismiss: () => void }) {
  return (
    <div className="relative p-4 mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
      >
        <IoClose className="w-4 h-4 text-blue-500" />
      </button>
      <div className="flex gap-3">
        <IoHelpCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">{title}</h4>
          <div className="text-sm text-blue-700 dark:text-blue-400">{children}</div>
        </div>
      </div>
    </div>
  );
}

const EVOptimizer: NextPage = () => {
  const router = useRouter();
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState(50);
  const [nature, setNature] = useState('Hardy');
  const [evs, setEvs] = useState<StatSpread>({
    hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0
  });
  const [ivs, setIvs] = useState<StatSpread>({
    hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31
  });
  const [speedModifiers, setSpeedModifiers] = useState({
    choiceScarf: false,
    tailwind: false,
    trickRoom: false,
    paralysis: false,
    speedBoost: 0,
    sticky: false,
  });
  const [targetSpeed, setTargetSpeed] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Search for Pokemon
  const searchPokemon = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const sdk = getPokemonSDK();
      // @ts-ignore - Pokemon SDK types issue
      const results = await sdk.pokemon.list({ limit: 20 });
      
      const filtered = results.results.filter((p: { name: string }) => 
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      
      const detailedResults = await Promise.all(
        // @ts-ignore - Pokemon SDK types issue
        filtered.slice(0, 6).map(p => sdk.pokemon.get(p.name))
      );
      
      setSearchResults(detailedResults as Pokemon[]);
    } catch (error) {
      logger.error('Error searching Pokemon:', { error });
      setSearchResults([]);
    }
    setLoading(false);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPokemon(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchPokemon]);

  // Get base stats
  const baseStats = useMemo(() => {
    return selectedPokemon?.stats?.reduce((acc, stat) => {
      acc[stat.stat.name] = stat.base_stat;
      return acc;
    }, {} as Record<string, number>) || {};
  }, [selectedPokemon]);

  // Calculate current stats
  const currentStats = selectedPokemon ? 
    calculateAllStats(baseStats, ivs, evs, level, nature) : null;

  // Calculate current speed with modifiers
  const currentSpeed = currentStats ? 
    calculateSpeedTier(
      baseStats.speed || 0, 
      ivs.speed, 
      evs.speed, 
      level, 
      nature, 
      speedModifiers
    ) : 0;

  // Optimize for target speed
  const optimizeForSpeed = useCallback(() => {
    if (!targetSpeed || !selectedPokemon) return;
    
    const optimalEVs = optimizeEVsForStat(
      targetSpeed,
      baseStats.speed || 0,
      ivs.speed,
      level,
      nature,
      'speed'
    );
    
    setEvs(prev => ({ ...prev, speed: optimalEVs }));
  }, [targetSpeed, selectedPokemon, baseStats, ivs, level, nature]);

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>EV Optimizer | Advanced Team Builder | DexTrends</title>
        <meta name="description" content="Optimize your Pokemon's EVs with visual heat maps and competitive spreads" />
      </Head>

      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-bg-tertiary opacity-15" />
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        <FadeIn>
          {/* Page Header with Breadcrumbs */}
          <PageHeader
            title="EV Optimizer"
            description="Visualize and optimize your Pokemon's effort values with advanced tools"
            breadcrumbs={[
              { title: 'Home', href: '/', icon: '🏠', isActive: false },
              { title: 'Team Builder', href: '/team-builder', icon: '👥', isActive: false },
              { title: 'EV Optimizer', href: '/team-builder/ev-optimizer', icon: '📊', isActive: true },
            ]}
          />

          {/* Onboarding Tip */}
          {showOnboarding && (
            <OnboardingTip
              title="What are EVs?"
              onDismiss={() => setShowOnboarding(false)}
            >
              <p className="mb-2">
                <strong>EVs (Effort Values)</strong> are hidden stats that boost your Pokemon's power.
                Each Pokemon can have up to <strong>510 total EVs</strong>, with a max of <strong>252</strong> in any single stat.
              </p>
              <p>
                💡 <strong>Quick Tip:</strong> Most competitive spreads invest 252 in two stats and 4 in a third.
                Use the speed calculator to outspeed specific threats!
              </p>
            </OnboardingTip>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pokemon Selection */}
            <div className="lg:col-span-1">
              <Container variant="default">
                <h2 className="text-xl font-bold mb-4 text-stone-800 dark:text-stone-200">Select Pokemon</h2>
                
                <input
                  type="text"
                  placeholder="Search Pokemon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-stone-50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />

                {loading && (
                  <div className="mt-4 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {searchResults.map((pokemon) => (
                      <button
                        key={pokemon.id}
                        onClick={() => {
                          setSelectedPokemon(pokemon);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="w-full p-3 bg-stone-50 dark:bg-stone-700/50 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition-all flex items-center gap-3 group"
                      >
                        <Image
                          src={pokemon.sprites?.front_default || '/dextrendslogo.png'}
                          alt={pokemon.name}
                          width={48}
                          height={48}
                        />
                        <div className="text-left">
                          <div className="font-medium capitalize text-amber-800 dark:text-amber-200">{pokemon.name}</div>
                          <div className="flex gap-1">
                            {pokemon.types?.map((t) => (
                              <TypeGradientBadge key={t.type.name} type={t.type.name} size="xs" />
                            )) || null}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedPokemon && (
                  <div className="mt-6">
                    <Container variant="outline" rounded="xl" padding="md">
                      <div className="flex items-center justify-center mb-4">
                        <CircularCard
                          size="md"
                          image={selectedPokemon.sprites?.front_default || '/dextrendslogo.png'}
                          alt={selectedPokemon.name}
                          title={selectedPokemon.name}
                          gradientFrom={selectedPokemon.types?.[0]?.type.name || 'normal'}
                          gradientTo={selectedPokemon.types?.[1]?.type.name || selectedPokemon.types?.[0]?.type.name || 'normal'}
                        />
                      </div>
                      <div className="text-center mb-4">
                        <div className="flex justify-center gap-1">
                          {selectedPokemon.types?.map((t) => (
                            <TypeGradientBadge key={t.type.name} type={t.type.name} size="sm" gradient={true} />
                          )) || null}
                        </div>
                      </div>

                    {/* Configuration */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Level</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={level}
                          onChange={(e) => setLevel(parseInt(e.target.value) || 50)}
                          className="w-full px-3 py-2 rounded-full bg-stone-50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Nature</label>
                        <select
                          value={nature}
                          onChange={(e) => setNature(e.target.value)}
                          className="w-full px-3 py-2 rounded-full bg-stone-50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-700"
                        >
                          {Object.entries(NATURE_MODIFIERS).map(([name, mods]) => (
                            <option key={name} value={name}>
                              {name} {mods.increased && mods.decreased && 
                                `(+${STAT_NAMES[mods.increased] || mods.increased}, -${STAT_NAMES[mods.decreased] || mods.decreased})`
                              }
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    </Container>
                  </div>
                )}
              </Container>

              {/* Speed Calculator */}
              {selectedPokemon && (
                <div className="mt-6 bg-white dark:bg-stone-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Speed Calculator</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Speed:</span>
                      <span className="font-bold text-lg">{Math.abs(currentSpeed)}</span>
                    </div>

                    {/* Speed Modifiers */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={speedModifiers.choiceScarf}
                          onChange={(e) => setSpeedModifiers(prev => ({ ...prev, choiceScarf: e.target.checked }))}
                        />
                        <span className="text-sm">Choice Scarf (1.5x)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={speedModifiers.tailwind}
                          onChange={(e) => setSpeedModifiers(prev => ({ ...prev, tailwind: e.target.checked }))}
                        />
                        <span className="text-sm">Tailwind (2x)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={speedModifiers.trickRoom}
                          onChange={(e) => setSpeedModifiers(prev => ({ ...prev, trickRoom: e.target.checked }))}
                        />
                        <span className="text-sm">Trick Room</span>
                      </label>
                    </div>

                    {/* Target Speed */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Target Speed</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={targetSpeed || ''}
                          onChange={(e) => setTargetSpeed(parseInt(e.target.value) || null)}
                          className="flex-1 px-3 py-1 rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800"
                          placeholder="Enter target"
                        />
                        <button
                          onClick={optimizeForSpeed}
                          disabled={!targetSpeed}
                          className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:bg-stone-400 disabled:cursor-not-allowed"
                        >
                          Optimize
                        </button>
                      </div>
                    </div>

                    {/* Speed Benchmarks */}
                    <div>
                      <p className="text-sm font-medium mb-2">Common Benchmarks</p>
                      <div className="space-y-1">
                        {COMMON_SPEED_BENCHMARKS.map((benchmark) => (
                          <button
                            key={benchmark.name}
                            onClick={() => setTargetSpeed(benchmark.speed)}
                            className="w-full text-left px-2 py-1 text-xs rounded hover:bg-stone-100 dark:hover:bg-stone-700 flex justify-between items-center"
                          >
                            <span>{benchmark.name}</span>
                            <span className="text-stone-600">{benchmark.speed}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* EV Heat Map */}
            <div className="lg:col-span-2">
              {selectedPokemon ? (
                <EVHeatMap
                  pokemon={selectedPokemon}
                  onEVUpdate={setEvs}
                  level={level}
                  nature={nature}
                />
              ) : (
                <div className="bg-white dark:bg-stone-800 rounded-lg shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-stone-800 dark:text-white mb-2">
                    Select a Pokemon
                  </h3>
                  <p className="text-stone-600 dark:text-stone-300">
                    Choose a Pokemon to start optimizing its EVs
                  </p>
                </div>
              )}

              {/* Current Stats Display */}
              {selectedPokemon && currentStats && (
                <div className="mt-6 bg-white dark:bg-stone-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Final Stats</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {Object.entries(currentStats).map(([stat, value]) => (
                      <div key={stat} className="text-center">
                        <div className="text-2xl font-bold text-stone-900 dark:text-white">
                          {value}
                        </div>
                        <div className="text-xs text-stone-600 dark:text-stone-300">
                          {STAT_NAMES[stat]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </FullBleedWrapper>
  );
};

// Mark this page as full bleed to remove Layout padding
(EVOptimizer as any).fullBleed = true;

export default EVOptimizer;