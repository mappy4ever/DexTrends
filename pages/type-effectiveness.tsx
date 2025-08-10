import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { fetchJSON } from '../utils/unifiedFetch';
import { TypeBadge } from '../components/ui/TypeBadge';
import { DualTypeCalculator } from '../components/ui/TypeAnalysis';
import { GlassContainer } from '../components/ui/design-system/GlassContainer';
import CircularButton from '../components/ui/CircularButton';
import { TypeGradientBadge } from '../components/ui/design-system/TypeGradientBadge';
import LazyWrapper from '../components/ui/LazyWrapper';

// Lazy load CircularTypeMatrix
const LazyCircularTypeMatrix = React.lazy(() => import('../components/ui/CircularTypeMatrix'));
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import { NextPage } from 'next';
import { motion, AnimatePresence } from '../components/ui/LazyMotion';
import { FadeIn, SlideUp, StaggeredChildren } from '../components/ui/animations/animations';
import { BsChevronUp, BsChevronDown } from 'react-icons/bs';
import { THEME, TYPE_GRADIENTS, themeClass } from '../utils/theme';
import { useTheme } from '../context/UnifiedAppContext';
import type { TypeInfo } from "../types/pokemon";
import { useAccessibilityPreferences } from '../hooks/useUserPreferences';
import logger from '../utils/logger';
import type { ClickHandler, KeyHandler } from '../types/common';

// Type definitions
interface DamageRelations {
  double_damage_from?: Array<{ name: string; url: string }>;
  double_damage_to?: Array<{ name: string; url: string }>;
  half_damage_from?: Array<{ name: string; url: string }>;
  half_damage_to?: Array<{ name: string; url: string }>;
  no_damage_from?: Array<{ name: string; url: string }>;
  no_damage_to?: Array<{ name: string; url: string }>;
}

interface TypeData {
  name: string;
  damageRelations: DamageRelations;
  pokemon: Array<{ pokemon: { name: string; url: string } }>;
  moves: Array<{ name: string; url: string }>;
  generation: { name: string; url: string };
}

interface EffectivenessStyle {
  text: string;
  color: string;
  bg: string;
  border: string;
  symbol: string;
}

type PokemonType = 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice' | 
  'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug' | 
  'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

const TYPE_COLORS: Record<PokemonType, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
};

const TYPE_ICONS: Record<PokemonType, string> = {
  normal: '',
  fire: '',
  water: '',
  electric: '',
  grass: '',
  ice: '',
  fighting: '',
  poison: '',
  ground: '',
  flying: '',
  psychic: '',
  bug: '',
  rock: '',
  ghost: '',
  dragon: '',
  dark: '',
  steel: '',
  fairy: ''
};

const EFFECTIVENESS_DESCRIPTIONS: Record<number, EffectivenessStyle> = {
  2: { 
    text: 'Super Effective', 
    color: 'text-green-700', 
    bg: 'bg-gradient-to-br from-green-50 to-green-100', 
    border: 'border-green-300',
    symbol: '2×' 
  },
  0.5: { 
    text: 'Not Very Effective', 
    color: 'text-red-700', 
    bg: 'bg-gradient-to-br from-red-50 to-red-100', 
    border: 'border-red-300',
    symbol: '½×' 
  },
  0: { 
    text: 'No Effect', 
    color: 'text-gray-700', 
    bg: 'bg-gradient-to-br from-gray-50 to-gray-100', 
    border: 'border-gray-300',
    symbol: '0×' 
  },
  1: { 
    text: 'Normal Damage', 
    color: 'text-blue-700', 
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100', 
    border: 'border-blue-300',
    symbol: '1×' 
  }
};

// Type info for detailed views
const TYPE_INFO: Record<PokemonType, { gradient: string; hero: string; description: string }> = {
  normal: { 
    gradient: 'from-gray-400 to-gray-600', 
    hero: 'from-gray-100 via-gray-50 to-white',
    description: 'The jack-of-all-trades type with a vast movepool but no resistances' 
  },
  fire: { 
    gradient: 'from-orange-400 to-red-600', 
    hero: 'from-orange-100 via-red-50 to-yellow-50',
    description: 'Burns through the competition with scorching attacks' 
  },
  water: { 
    gradient: 'from-blue-400 to-blue-600', 
    hero: 'from-blue-100 via-cyan-50 to-blue-50',
    description: 'Flows through battles with versatility and balance' 
  },
  electric: { 
    gradient: 'from-yellow-300 to-yellow-500', 
    hero: 'from-yellow-100 via-yellow-50 to-orange-50',
    description: 'Strikes fast with paralysis and shocking speed' 
  },
  grass: { 
    gradient: 'from-green-400 to-green-600', 
    hero: 'from-green-100 via-emerald-50 to-lime-50',
    description: 'Rooted in nature with healing and status moves' 
  },
  ice: { 
    gradient: 'from-cyan-300 to-blue-400', 
    hero: 'from-cyan-100 via-blue-50 to-indigo-50',
    description: 'Freezes foes but shatters under pressure' 
  },
  fighting: { 
    gradient: 'from-red-600 to-red-800', 
    hero: 'from-red-100 via-rose-50 to-pink-50',
    description: 'Masters of close combat with unmatched physical power' 
  },
  poison: { 
    gradient: 'from-purple-500 to-purple-700', 
    hero: 'from-purple-100 via-violet-50 to-purple-50',
    description: 'Toxic tactics that wear down opponents over time' 
  },
  ground: { 
    gradient: 'from-yellow-600 to-yellow-800', 
    hero: 'from-yellow-100 via-amber-50 to-orange-50',
    description: 'Earth-shaking power immune to electric attacks' 
  },
  flying: { 
    gradient: 'from-blue-300 to-indigo-400', 
    hero: 'from-sky-100 via-blue-50 to-indigo-50',
    description: 'Soars above ground attacks with aerial superiority' 
  },
  psychic: { 
    gradient: 'from-pink-400 to-pink-600', 
    hero: 'from-pink-100 via-fuchsia-50 to-purple-50',
    description: 'Mind over matter with powerful special attacks' 
  },
  bug: { 
    gradient: 'from-green-500 to-lime-600', 
    hero: 'from-lime-100 via-green-50 to-emerald-50',
    description: 'Small but mighty with rapid evolution and unique moves' 
  },
  rock: { 
    gradient: 'from-yellow-700 to-yellow-900', 
    hero: 'from-stone-100 via-amber-50 to-yellow-50',
    description: 'Solid defense that weathers any storm' 
  },
  ghost: { 
    gradient: 'from-purple-600 to-purple-800', 
    hero: 'from-purple-100 via-violet-50 to-indigo-50',
    description: 'Phases through normal attacks with supernatural power' 
  },
  dragon: { 
    gradient: 'from-indigo-600 to-purple-700', 
    hero: 'from-indigo-100 via-purple-50 to-violet-50',
    description: 'Legendary might with overwhelming stats' 
  },
  dark: { 
    gradient: 'from-gray-700 to-gray-900', 
    hero: 'from-gray-100 via-slate-50 to-zinc-50',
    description: 'Fights dirty with immunity to psychic attacks' 
  },
  steel: { 
    gradient: 'from-gray-400 to-gray-600', 
    hero: 'from-gray-100 via-silver-50 to-slate-50',
    description: 'The ultimate defensive fortress with countless resistances' 
  },
  fairy: { 
    gradient: 'from-pink-300 to-pink-500', 
    hero: 'from-pink-100 via-rose-50 to-fuchsia-50',
    description: 'Mystical power that conquers dragons' 
  }
};

// Types array constant
const POKEMON_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const TypeEffectiveness: NextPage = () => {
  const { theme } = useTheme();
  const { highContrast: isHighContrast, reduceMotion } = useAccessibilityPreferences();
  const [typeData, setTypeData] = useState<Record<string, TypeData>>({});
  const [loading, setLoading] = useState(true);
  const [selectedAttackType, setSelectedAttackType] = useState<PokemonType | null>(null);
  const [selectedDefendType, setSelectedDefendType] = useState<PokemonType | null>(null);
  const [expandedType, setExpandedType] = useState<PokemonType | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ attack: PokemonType; defend: PokemonType } | null>(null);


  useEffect(() => {
    const loadTypeData = async () => {
      setLoading(true);
      const data: Record<string, TypeData> = {};
      
      for (const type of POKEMON_TYPES) {
        try {
          const typeInfo = await fetchJSON<TypeInfo>(`https://pokeapi.co/api/v2/type/${type}`);
          data[type] = {
            name: type,
            damageRelations: typeInfo!.damage_relations,
            pokemon: typeInfo!.pokemon?.slice(0, 10) || [],
            moves: typeInfo!.moves?.slice(0, 5) || [],
            generation: typeInfo!.generation
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error(`Failed to load type ${type}:`, { error: errorMessage });
        }
      }
      
      setTypeData(data);
      setLoading(false);
    };
    
    loadTypeData();
  }, []);

  const getEffectiveness = (attackType: string, defendType: string): number => {
    if (!typeData[attackType]) return 1;
    
    const relations = typeData[attackType].damageRelations;
    if (!relations) return 1;
    
    if (relations.no_damage_to?.some(t => t.name === defendType)) return 0;
    if (relations.double_damage_to?.some(t => t.name === defendType)) return 2;
    if (relations.half_damage_to?.some(t => t.name === defendType)) return 0.5;
    
    return 1;
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return <PageLoader text="Loading type effectiveness data..." />;
  }

  return (
    <>
      <Head>
        <title>Pokémon Type Effectiveness Guide | DexTrends</title>
        <meta name="description" content="Master Pokémon battles with our comprehensive type effectiveness guide. Interactive charts, detailed analysis, and battle strategies." />
      </Head>

      <div className="min-h-screen relative">
        {/* Gradient Background */}
        <div className="fixed inset-0 gradient-bg-primary opacity-10 -z-10" />
        {/* Skip Navigation for Accessibility */}
        <a 
          href="#type-chart" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
        {/* Hero Section with Enhanced Gradient */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden py-20">
          {/* Multiple Gradient Layers */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 gradient-bg-primary opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-gray-900" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center px-4">
            <motion.h1 
              className={themeClass(THEME.typography.h1, THEME.colors.text.primary, 'mb-6')}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Type Effectiveness
            </motion.h1>
            <motion.p 
              className={themeClass('text-2xl md:text-3xl', THEME.colors.text.secondary, 'mb-12')}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Master the art of Pokémon battle matchups
            </motion.p>
            
            {/* Quick Navigation */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <CircularButton
                onClick={() => scrollToSection('type-chart')}
                variant="secondary"
                size="lg"
              >
                View Type Chart
              </CircularButton>
              <CircularButton
                onClick={() => scrollToSection('interactive')}
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Interactive Explorer
              </CircularButton>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <BsChevronDown className={themeClass('text-4xl', THEME.colors.text.secondary)} />
          </motion.div>
        </section>

        {/* Type Chart Section */}
        <section id="type-chart" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <FadeIn>
              <h2 className={themeClass(THEME.typography.h2, 'text-center', THEME.colors.text.primary, 'mb-4')}>
                Complete Type Chart
              </h2>
              <p className={themeClass('text-xl text-center', THEME.colors.text.secondary, 'mb-12')}>
                Click any cell to explore detailed type interactions
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className={themeClass(
                THEME.colors.background.translucent,
                THEME.rounded.xl,
                THEME.shadows['2xl'],
                'p-8 overflow-hidden'
              )}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="p-3 text-sm font-bold text-gray-700 sticky left-0 bg-white/90 backdrop-blur-sm z-10">
                          ATK → DEF
                        </th>
                        {POKEMON_TYPES.map(type => (
                          <th key={type} className="p-2">
                            <div className="flex flex-col items-center gap-1">
                              <TypeBadge type={type} size="xs" />
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {POKEMON_TYPES.map(attackType => (
                        <tr key={attackType}>
                          <td className="p-2 sticky left-0 bg-white/90 backdrop-blur-sm z-10">
                            <div className="flex items-center gap-2">
                              <TypeBadge type={attackType} size="sm" />
                            </div>
                          </td>
                          {POKEMON_TYPES.map(defendType => {
                            const effectiveness = getEffectiveness(attackType, defendType);
                            const style = EFFECTIVENESS_DESCRIPTIONS[effectiveness];
                            const isHovered = hoveredCell?.attack === attackType && hoveredCell?.defend === defendType;
                            
                            return (
                              <td key={`${attackType}-${defendType}`} className="p-1">
                                <motion.button
                                  className={`
                                    w-full h-12 rounded-xl font-bold text-sm
                                    ${style.bg} ${style.color} ${style.border} border-2
                                    hover:scale-110 hover:shadow-lg transition-all duration-200
                                    ${isHovered ? 'scale-110 shadow-lg z-20' : ''}
                                  `}
                                  onClick={() => {
                                    setSelectedAttackType(attackType);
                                    setSelectedDefendType(defendType);
                                    scrollToSection('interactive');
                                  }}
                                  onMouseEnter={() => setHoveredCell({ attack: attackType, defend: defendType })}
                                  onMouseLeave={() => setHoveredCell(null)}
                                  whileHover={reduceMotion ? {} : { scale: 1.1 }}
                                  whileTap={reduceMotion ? {} : { scale: 0.95 }}
                                  role="button"
                                  tabIndex={0}
                                  aria-label={`${attackType} attacks ${defendType}: ${effectiveness}x damage`}
                                  onKeyDown={(e: React.KeyboardEvent) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setSelectedAttackType(attackType);
                                      setSelectedDefendType(defendType);
                                      scrollToSection('interactive');
                                    }
                                  }}
                                >
                                  {style.symbol}
                                </motion.button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  {Object.entries(EFFECTIVENESS_DESCRIPTIONS).map(([value, style]) => (
                    <div 
                      key={value} 
                      className={`
                        flex items-center gap-3 px-6 py-3 rounded-full 
                        ${style.bg} ${style.border} border-2
                      `}
                    >
                      <span className={`text-2xl font-bold ${style.color}`}>{style.symbol}</span>
                      <span className={`font-semibold ${style.color}`}>{style.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* New Circular Type Matrix Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto">
            <FadeIn>
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-pokemon-red to-pokemon-blue bg-clip-text text-transparent">
                Circular Type Explorer
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
                A modern, visual approach to type matchups
              </p>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              {typeData && Object.keys(typeData).length > 0 && (
                <LazyWrapper variant="circular" height={400}>
                  <LazyCircularTypeMatrix
                  typeData={new Map(Object.entries(typeData))}
                  selectedType={selectedAttackType || undefined}
                  onTypeSelect={(type) => {
                    setSelectedAttackType(type as PokemonType);
                    // Optionally scroll to interactive section
                    scrollToSection('interactive');
                  }}
                  />
                </LazyWrapper>
              )}
            </FadeIn>
          </div>
        </section>

        {/* Interactive Explorer Section */}
        <section id="interactive" className={themeClass(
          'py-20 px-4',
          'bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800'
        )}>
          <div className="max-w-7xl mx-auto">
            <FadeIn>
              <h2 className="text-5xl font-bold text-center text-gray-800 mb-4">
                Interactive Type Explorer
              </h2>
              <p className="text-xl text-center text-gray-600 mb-12">
                Select types to see their battle interactions
              </p>
            </FadeIn>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Attack Type Selector */}
              <FadeIn delay={0.2}>
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                    Attacking Type
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {POKEMON_TYPES.map(type => (
                      <motion.button
                        key={type}
                        onClick={() => setSelectedAttackType(type)}
                        className={`
                          relative p-4 rounded-2xl transition-all duration-300
                          ${selectedAttackType === type 
                            ? 'ring-4 ring-blue-400 shadow-lg scale-105' 
                            : 'hover:shadow-md hover:scale-105'}
                        `}
                        style={{ 
                          background: selectedAttackType === type 
                            ? `linear-gradient(135deg, ${TYPE_COLORS[type]}40, ${TYPE_COLORS[type]}20)`
                            : `linear-gradient(135deg, ${TYPE_COLORS[type]}20, ${TYPE_COLORS[type]}10)`
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-center">
                          <TypeBadge type={type} size="sm" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* Defend Type Selector */}
              <FadeIn delay={0.3}>
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                    Defending Type
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {POKEMON_TYPES.map(type => (
                      <motion.button
                        key={type}
                        onClick={() => setSelectedDefendType(type)}
                        className={`
                          relative p-4 rounded-2xl transition-all duration-300
                          ${selectedDefendType === type 
                            ? 'ring-4 ring-red-400 shadow-lg scale-105' 
                            : 'hover:shadow-md hover:scale-105'}
                        `}
                        style={{ 
                          background: selectedDefendType === type 
                            ? `linear-gradient(135deg, ${TYPE_COLORS[type]}40, ${TYPE_COLORS[type]}20)`
                            : `linear-gradient(135deg, ${TYPE_COLORS[type]}20, ${TYPE_COLORS[type]}10)`
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-center">
                          <TypeBadge type={type} size="sm" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Battle Result */}
            <AnimatePresence>
              {selectedAttackType && selectedDefendType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="mt-12"
                >
                  <FadeIn>
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12">
                      <div className="text-center">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-8">Battle Result</h3>
                        
                        <div className="flex items-center justify-center gap-8 mb-8">
                          <motion.div 
                            className="text-center"
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <TypeBadge type={selectedAttackType} size="lg" />
                            <p className="text-sm text-gray-600 mt-2">Attacking</p>
                          </motion.div>
                          
                          
                          <motion.div 
                            className="text-center"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <TypeBadge type={selectedDefendType} size="lg" />
                            <p className="text-sm text-gray-600 mt-2">Defending</p>
                          </motion.div>
                        </div>
                        
                        {(() => {
                          const effectiveness = getEffectiveness(selectedAttackType, selectedDefendType);
                          const style = EFFECTIVENESS_DESCRIPTIONS[effectiveness];
                          
                          return (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.6, type: "spring" }}
                              className={`
                                inline-block px-12 py-6 rounded-3xl
                                ${style.bg} ${style.border} border-4
                              `}
                            >
                              <div className="flex items-center gap-4">
                                <span className={`text-5xl font-bold ${style.color}`}>
                                  {style.symbol}
                                </span>
                                <div className="text-left">
                                  <p className={`text-2xl font-bold ${style.color}`}>
                                    {style.text}
                                  </p>
                                  <p className={`text-lg ${style.color} opacity-80`}>
                                    {effectiveness}× damage multiplier
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })()}
                      </div>
                    </div>
                  </FadeIn>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Type Deep Dives Section */}
        <section id="type-details" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <FadeIn>
              <h2 className="text-5xl font-bold text-center text-gray-800 mb-4">
                Explore Type Details...
              </h2>
              <p className="text-xl text-center text-gray-600 mb-12">
                Click any type to explore its strengths, weaknesses, and strategies
              </p>
            </FadeIn>

            {/* Type Selector - Horizontal List */}
            <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-md -mx-4 px-4 py-4 mb-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex overflow-x-auto gap-3 scrollbar-hide">
                  {POKEMON_TYPES.map((type) => (
                    <motion.button
                      key={type}
                      onClick={() => setExpandedType(expandedType === type ? null : type)}
                      className={`
                        px-4 py-3 rounded-2xl whitespace-nowrap transition-all duration-300
                        ${expandedType === type 
                          ? 'ring-4 ring-blue-400 shadow-lg scale-105' 
                          : 'hover:scale-105 hover:shadow-lg'}
                      `}
                      style={{
                        background: expandedType === type
                          ? `linear-gradient(135deg, ${TYPE_COLORS[type]}40, ${TYPE_COLORS[type]}20)`
                          : `linear-gradient(135deg, ${TYPE_COLORS[type]}20, ${TYPE_COLORS[type]}10)`
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <TypeBadge type={type} size="sm" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Expanded Type Details Container */}
            <AnimatePresence mode="wait">
              {expandedType && (
                <motion.div
                  key={expandedType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <div 
                    className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2"
                    style={{
                      borderColor: `${TYPE_COLORS[expandedType]}40`,
                      background: `linear-gradient(135deg, ${TYPE_COLORS[expandedType]}10, ${TYPE_COLORS[expandedType]}05)`
                    }}
                  >
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <TypeBadge type={expandedType} size="lg" />
                          <div>
                            <h3 className="text-2xl font-semibold capitalize text-gray-800">{expandedType} Type</h3>
                            <p className="text-gray-600 mt-1">{TYPE_INFO[expandedType].description}</p>
                          </div>
                        </div>
                        <CircularButton 
                          onClick={() => setExpandedType(null)}
                          variant="ghost"
                          size="sm"
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <BsChevronUp className="text-2xl" />
                        </CircularButton>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Offensive Matchups */}
                      <div className="space-y-6">
                        <h4 className="text-xl font-medium text-gray-800 border-b border-gray-200 pb-2">Offensive Matchups</h4>
                        
                        {typeData[expandedType]?.damageRelations.double_damage_to && 
                         typeData[expandedType].damageRelations.double_damage_to.length > 0 && (
                          <div>
                            <p className="font-semibold text-green-700 mb-3">
                              Super Effective Against (2×)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {typeData[expandedType].damageRelations.double_damage_to.map(t => (
                                <TypeBadge key={t.name} type={t.name as PokemonType} size="sm" />
                              ))}
                            </div>
                          </div>
                        )}

                        {typeData[expandedType]?.damageRelations.half_damage_to && 
                         typeData[expandedType].damageRelations.half_damage_to.length > 0 && (
                          <div>
                            <p className="font-semibold text-red-700 mb-3">
                              Not Very Effective Against (0.5×)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {typeData[expandedType].damageRelations.half_damage_to.map(t => (
                                <TypeBadge key={t.name} type={t.name as PokemonType} size="sm" />
                              ))}
                            </div>
                          </div>
                        )}

                        {typeData[expandedType]?.damageRelations.no_damage_to && 
                         typeData[expandedType].damageRelations.no_damage_to.length > 0 && (
                          <div>
                            <p className="font-semibold text-gray-700 mb-3">
                              No Effect Against (0×)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {typeData[expandedType].damageRelations.no_damage_to.map(t => (
                                <TypeBadge key={t.name} type={t.name as PokemonType} size="sm" />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Defensive Matchups */}
                      <div className="space-y-6">
                        <h4 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">Defensive Matchups</h4>
                        
                        {typeData[expandedType]?.damageRelations.double_damage_from && 
                         typeData[expandedType].damageRelations.double_damage_from.length > 0 && (
                          <div>
                            <p className="font-semibold text-orange-700 mb-3">
                              Weak To (Takes 2×)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {typeData[expandedType].damageRelations.double_damage_from.map(t => (
                                <TypeBadge key={t.name} type={t.name as PokemonType} size="sm" />
                              ))}
                            </div>
                          </div>
                        )}

                        {typeData[expandedType]?.damageRelations.half_damage_from && 
                         typeData[expandedType].damageRelations.half_damage_from.length > 0 && (
                          <div>
                            <p className="font-semibold text-blue-700 mb-3">
                              Resists (Takes 0.5×)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {typeData[expandedType].damageRelations.half_damage_from.map(t => (
                                <TypeBadge key={t.name} type={t.name as PokemonType} size="sm" />
                              ))}
                            </div>
                          </div>
                        )}

                        {typeData[expandedType]?.damageRelations.no_damage_from && 
                         typeData[expandedType].damageRelations.no_damage_from.length > 0 && (
                          <div>
                            <p className="font-semibold text-purple-700 mb-3">
                              Immune To (Takes 0×)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {typeData[expandedType].damageRelations.no_damage_from.map(t => (
                                <TypeBadge key={t.name} type={t.name as PokemonType} size="sm" />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Example Pokemon and Battle Tips */}
                    <div className="grid md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-200">
                      {typeData[expandedType]?.pokemon && typeData[expandedType].pokemon.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-800 mb-3">Example Pokémon</h4>
                          <div className="flex flex-wrap gap-2">
                            {typeData[expandedType].pokemon.slice(0, 10).map(p => (
                              <span 
                                key={p.pokemon.name}
                                className="px-3 py-1 bg-white/70 rounded-full text-sm capitalize border border-gray-200"
                              >
                                {p.pokemon.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-bold text-gray-800 mb-3">Battle Tips</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• {TYPE_INFO[expandedType].hero}</li>
                          <li>• Consider STAB bonus when using {expandedType}-type moves</li>
                          <li>• Watch for common dual-type combinations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Advanced Tools Section */}
        <section id="advanced" className="py-20 px-4 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
          <div className="max-w-7xl mx-auto">
            <FadeIn>
              <h2 className="text-5xl font-bold text-center text-gray-800 mb-4">
                Advanced Tools
              </h2>
              <p className="text-xl text-center text-gray-600 mb-12">
                Master complex type interactions and strategies
              </p>
            </FadeIn>

            <div className="space-y-8">
              {/* Dual Type Calculator */}
              <FadeIn delay={0.2}>
                <DualTypeCalculator />
              </FadeIn>

              {/* Type Statistics */}
              <FadeIn delay={0.4}>
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Type Statistics & Insights
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                      <h4 className="font-bold text-green-800 mb-4">
                        Most Offensive Types
                      </h4>
                      <div className="space-y-3">
                        {['fighting', 'rock', 'ground'].map(type => (
                          <div key={type} className="flex items-center gap-3">
                            <TypeBadge type={type as PokemonType} size="sm" />
                            <span className="text-sm text-green-700">Many super effective matchups</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
                      <h4 className="font-bold text-blue-800 mb-4">
                        Most Defensive Types
                      </h4>
                      <div className="space-y-3">
                        {['steel', 'fire', 'water'].map(type => (
                          <div key={type} className="flex items-center gap-3">
                            <TypeBadge type={type as PokemonType} size="sm" />
                            <span className="text-sm text-blue-700">Many resistances</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                      <h4 className="font-bold text-purple-800 mb-4">
                        Most Balanced Types
                      </h4>
                      <div className="space-y-3">
                        {['water', 'flying', 'psychic'].map(type => (
                          <div key={type} className="flex items-center gap-3">
                            <TypeBadge type={type as PokemonType} size="sm" />
                            <span className="text-sm text-purple-700">Well-rounded coverage</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Battle Strategy Tips */}
              <FadeIn delay={0.6}>
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Pro Battle Strategy Tips
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-orange-800 mb-4">
                        Offensive Strategies
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <span className="text-green-500 text-xl">•</span>
                          <div>
                            <p className="font-semibold">STAB Bonus</p>
                            <p className="text-sm text-gray-600">Same Type Attack Bonus gives 1.5× damage when a Pokémon uses moves of its own type</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-green-500 text-xl">•</span>
                          <div>
                            <p className="font-semibold">Coverage Moves</p>
                            <p className="text-sm text-gray-600">Teach your Pokémon moves of different types to hit more weaknesses</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-green-500 text-xl">•</span>
                          <div>
                            <p className="font-semibold">Type Combos</p>
                            <p className="text-sm text-gray-600">Some type combinations have excellent offensive coverage together</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-blue-800 mb-4">
                        Defensive Strategies
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <span className="text-blue-500 text-xl">•</span>
                          <div>
                            <p className="font-semibold">Type Synergy</p>
                            <p className="text-sm text-gray-600">Build teams where Pokémon cover each other&apos;s weaknesses</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-blue-500 text-xl">•</span>
                          <div>
                            <p className="font-semibold">Immunity Abuse</p>
                            <p className="text-sm text-gray-600">Use immunities strategically to switch in safely</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-blue-500 text-xl">•</span>
                          <div>
                            <p className="font-semibold">Resistance Stacking</p>
                            <p className="text-sm text-gray-600">Dual types can stack resistances for incredible bulk</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <motion.div 
          className="fixed bottom-8 right-8 flex flex-col gap-2"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <CircularButton
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            variant="secondary"
            size="sm"
            className="shadow-lg hover:shadow-xl backdrop-blur-sm"
            title="Back to top"
          >
            <BsChevronUp className="text-xl" />
          </CircularButton>
        </motion.div>
      </div>
    </>
  );
};

// Mark this page as fullBleed to remove default padding
interface PageComponent extends NextPage {
  fullBleed?: boolean;
}

(TypeEffectiveness as PageComponent).fullBleed = true;

export default TypeEffectiveness;