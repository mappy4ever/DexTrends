/**
 * EV Optimizer Page
 * Advanced tool for optimizing Pokemon EVs with visual feedback
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { getPokemonSDK } from '../../utils/pokemonSDK';
import { FadeIn, SlideUp } from '../../components/ui/animations/animations';
import { TypeBadge } from '../../components/ui/TypeBadge';
import { GlassContainer } from '../../components/ui/design-system/GlassContainer';
import { CircularCard } from '../../components/ui/design-system/CircularCard';
import { GradientButton } from '../../components/ui/design-system/GradientButton';
import { TypeGradientBadge } from '../../components/ui/design-system/TypeGradientBadge';
import { PageLoader } from '../../utils/unifiedLoading';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import StyledBackButton from '../../components/ui/StyledBackButton';
import { 
  calculateAllStats, 
  NATURE_MODIFIERS, 
  STAT_NAMES,
  calculateSpeedTier,
  optimizeEVsForStat
} from '../../utils/statCalculations';
import type { TeamMember, StatSpread, Nature } from '../../types/team-builder';
import type { Pokemon } from '../../types/api/pokemon';

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
      
      const filtered = results.results.filter((p: any) => 
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      
      const detailedResults = await Promise.all(
        // @ts-ignore - Pokemon SDK types issue
        filtered.slice(0, 6).map(p => sdk.pokemon.get(p.name))
      );
      
      setSearchResults(detailedResults as Pokemon[]);
    } catch (error) {
      console.error('Error searching Pokemon:', error);
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
  const baseStats = selectedPokemon?.stats?.reduce((acc, stat) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {} as Record<string, number>) || {};

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
          {/* Header */}
          <div className="mb-8">
            <StyledBackButton 
              variant="default" 
              text="Back to Team Builder"
              onClick={() => router.push('/team-builder/advanced')}
              className="mb-4"
            />
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                EV Optimizer
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Visualize and optimize your Pokemon's effort values with advanced heat mapping
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pokemon Selection */}
            <div className="lg:col-span-1">
              <GlassContainer variant="medium">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Select Pokemon</h2>
                
                <input
                  type="text"
                  placeholder="Search Pokemon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-full glass-light border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />

                {loading && (
                  <div className="mt-4 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
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
                        className="w-full p-3 glass-light rounded-xl hover:glass-medium transition-all flex items-center gap-3 group"
                      >
                        <Image
                          src={pokemon.sprites?.front_default || '/dextrendslogo.png'}
                          alt={pokemon.name}
                          width={48}
                          height={48}
                        />
                        <div className="text-left">
                          <div className="font-medium capitalize">{pokemon.name}</div>
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
                    <GlassContainer variant="light" rounded="2xl" padding="md">
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
                          className="w-full px-3 py-2 rounded-full glass-light border border-gray-200 dark:border-gray-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Nature</label>
                        <select
                          value={nature}
                          onChange={(e) => setNature(e.target.value)}
                          className="w-full px-3 py-2 rounded-full glass-light border border-gray-200 dark:border-gray-700"
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
                    </GlassContainer>
                  </div>
                )}
              </GlassContainer>

              {/* Speed Calculator */}
              {selectedPokemon && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
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
                          className="flex-1 px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                          placeholder="Enter target"
                        />
                        <button
                          onClick={optimizeForSpeed}
                          disabled={!targetSpeed}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                            className="w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                          >
                            <span>{benchmark.name}</span>
                            <span className="text-gray-500">{benchmark.speed}</span>
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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Select a Pokemon
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a Pokemon to start optimizing its EVs
                  </p>
                </div>
              )}

              {/* Current Stats Display */}
              {selectedPokemon && currentStats && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Final Stats</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {Object.entries(currentStats).map(([stat, value]) => (
                      <div key={stat} className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {value}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
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

export default EVOptimizer;