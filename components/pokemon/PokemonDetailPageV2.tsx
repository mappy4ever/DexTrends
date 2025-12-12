/**
 * PokemonDetailPageV2 - Complete redesign of Pokemon details
 *
 * Design principles:
 * - Single scrollable page (Cards is the only separate view)
 * - Clean, sophisticated, mobile-first
 * - No redundant elements
 * - Clear visual hierarchy
 * - Classic, timeless feel
 * - High quality, polished appearance
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TYPE_COLORS } from '@/components/ui/design-system/glass-constants';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { Pokemon, PokemonSpecies, EvolutionChain, PokemonType } from '@/types/pokemon';
import type { TCGCard } from '@/types/api/cards';
import type { PocketCard } from '@/types/api/pocket-cards';
import { FiTarget, FiTrendingUp, FiMaximize2, FiActivity, FiHeart } from 'react-icons/fi';
// Domain-specific icons - documented exceptions
import { FaEgg, FaGem } from 'react-icons/fa';
import { GiSparkles } from 'react-icons/gi';
import { PokemonBadges } from '@/components/ui/ClassificationBadge';
import { EvolutionItemDisplay } from '@/components/ui/EvolutionItemIcon';
import {
  isUltraBeast,
  isParadoxPast,
  isParadoxFuture,
  isStarter,
} from '@/utils/pokemonClassifications';

// =============================================================================
// TYPES
// =============================================================================

interface AbilityData {
  name: string;
  isHidden: boolean;
  effect: string;
  short_effect: string;
}

interface PokemonDetailPageV2Props {
  pokemon: Pokemon;
  species: PokemonSpecies;
  abilities?: Record<string, AbilityData>;
  evolutionChain?: EvolutionChain | null;
  adjacentPokemon?: {
    prev: { id: number; name: string; types: PokemonType[] } | null;
    next: { id: number; name: string; types: PokemonType[] } | null;
  };
  tcgCards?: TCGCard[];
  pocketCards?: PocketCard[];
  showShiny?: boolean;
  onShinyToggle?: () => void;
}

type ViewMode = 'info' | 'tcg' | 'pocket';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatPokemonId = (id: number): string => {
  return `#${id.toString().padStart(4, '0')}`;
};

const formatHeight = (decimeters: number): string => {
  const meters = decimeters / 10;
  const feet = Math.floor(meters * 3.28084);
  const inches = Math.round((meters * 3.28084 - feet) * 12);
  return `${meters.toFixed(1)}m (${feet}'${inches}")`;
};

const formatWeight = (hectograms: number): string => {
  const kg = hectograms / 10;
  const lbs = kg * 2.20462;
  return `${kg.toFixed(1)}kg (${lbs.toFixed(1)} lbs)`;
};

const capitalize = (str: string): string => {
  return str.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const getStatColor = (statName: string): string => {
  const colors: Record<string, string> = {
    hp: 'bg-red-500',
    attack: 'bg-orange-500',
    defense: 'bg-amber-500',
    'special-attack': 'bg-blue-500',
    'special-defense': 'bg-green-500',
    speed: 'bg-pink-500',
  };
  return colors[statName] || 'bg-stone-500';
};

const getStatAbbr = (statName: string): string => {
  const abbrs: Record<string, string> = {
    hp: 'HP',
    attack: 'ATK',
    defense: 'DEF',
    'special-attack': 'SP.ATK',
    'special-defense': 'SP.DEF',
    speed: 'SPD',
  };
  return abbrs[statName] || statName.toUpperCase();
};

// Type color helper
const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
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
    fairy: '#EE99AC',
  };
  return colors[type.toLowerCase()] || '#A8A878';
};

// Type effectiveness calculation
const DEFENSE_CHART: Record<string, Record<string, number>> = {
  normal: { fighting: 2, ghost: 0 },
  fire: { fire: 0.5, water: 2, grass: 0.5, ice: 0.5, ground: 2, bug: 0.5, rock: 2, steel: 0.5, fairy: 0.5 },
  water: { fire: 0.5, water: 0.5, electric: 2, grass: 2, ice: 0.5, steel: 0.5 },
  electric: { electric: 0.5, ground: 2, flying: 0.5, steel: 0.5 },
  grass: { fire: 2, water: 0.5, electric: 0.5, grass: 0.5, ice: 2, poison: 2, ground: 0.5, flying: 2, bug: 2 },
  ice: { fire: 2, ice: 0.5, fighting: 2, rock: 2, steel: 2 },
  fighting: { flying: 2, psychic: 2, bug: 0.5, rock: 0.5, dark: 0.5, fairy: 2 },
  poison: { grass: 0.5, fighting: 0.5, poison: 0.5, ground: 2, psychic: 2, bug: 0.5, fairy: 0.5 },
  ground: { water: 2, electric: 0, grass: 2, ice: 2, poison: 0.5, rock: 0.5 },
  flying: { electric: 2, grass: 0.5, ice: 2, fighting: 0.5, ground: 0, bug: 0.5, rock: 2 },
  psychic: { fighting: 0.5, psychic: 0.5, bug: 2, ghost: 2, dark: 2 },
  bug: { fire: 2, grass: 0.5, fighting: 0.5, ground: 0.5, flying: 2, rock: 2 },
  rock: { normal: 0.5, fire: 0.5, water: 2, grass: 2, fighting: 2, poison: 0.5, ground: 2, flying: 0.5, steel: 2 },
  ghost: { normal: 0, fighting: 0, poison: 0.5, bug: 0.5, ghost: 2, dark: 2 },
  dragon: { fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5, dragon: 2, ice: 2, fairy: 2 },
  dark: { fighting: 2, psychic: 0, bug: 2, ghost: 0.5, dark: 0.5, fairy: 2 },
  steel: { normal: 0.5, fire: 2, grass: 0.5, ice: 0.5, fighting: 2, poison: 0, ground: 2, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 0.5, dragon: 0.5, steel: 0.5, fairy: 0.5 },
  fairy: { fighting: 0.5, poison: 2, bug: 0.5, dragon: 0, dark: 0.5, steel: 2 },
};

const calculateTypeEffectiveness = (types: string[]): {
  weaknesses: { type: string; multiplier: number }[];
  resistances: { type: string; multiplier: number }[];
  immunities: string[]
} => {
  const multipliers: Record<string, number> = {};

  Object.keys(DEFENSE_CHART).forEach(type => {
    multipliers[type] = 1;
  });

  types.forEach(pokemonType => {
    const typeDefenses = DEFENSE_CHART[pokemonType.toLowerCase()];
    if (typeDefenses) {
      Object.entries(typeDefenses).forEach(([attackType, mult]) => {
        multipliers[attackType] = (multipliers[attackType] || 1) * mult;
      });
    }
  });

  const weaknesses: { type: string; multiplier: number }[] = [];
  const resistances: { type: string; multiplier: number }[] = [];
  const immunities: string[] = [];

  Object.entries(multipliers).forEach(([type, mult]) => {
    if (mult === 0) immunities.push(type);
    else if (mult >= 2) weaknesses.push({ type, multiplier: mult });
    else if (mult < 1) resistances.push({ type, multiplier: mult });
  });

  // Sort by multiplier (highest first for weaknesses, lowest first for resistances)
  weaknesses.sort((a, b) => b.multiplier - a.multiplier);
  resistances.sort((a, b) => a.multiplier - b.multiplier);

  return { weaknesses, resistances, immunities };
};

// Growth rate descriptions
const GROWTH_RATE_INFO: Record<string, { label: string; description: string }> = {
  'slow': { label: 'Slow', description: '1,250,000 EXP to level 100' },
  'medium': { label: 'Medium Fast', description: '1,000,000 EXP to level 100' },
  'medium-slow': { label: 'Medium Slow', description: '1,059,860 EXP to level 100' },
  'fast': { label: 'Fast', description: '800,000 EXP to level 100' },
  'slow-then-very-fast': { label: 'Erratic', description: '600,000 EXP to level 100' },
  'fast-then-very-slow': { label: 'Fluctuating', description: '1,640,000 EXP to level 100' },
};

// Egg group descriptions for breeding compatibility
const EGG_GROUP_INFO: Record<string, string> = {
  'monster': 'Large reptilian and dinosaur-like Pokemon',
  'water1': 'Amphibious Pokemon that live near water',
  'water2': 'Fish and fully aquatic Pokemon',
  'water3': 'Invertebrate sea creatures',
  'bug': 'Insect and arachnid Pokemon',
  'flying': 'Winged and bird-like Pokemon',
  'field': 'Land-dwelling mammals and similar Pokemon',
  'fairy': 'Small, cute, and mystical Pokemon',
  'grass': 'Plant-based and fungal Pokemon',
  'human-like': 'Bipedal humanoid Pokemon',
  'mineral': 'Rock, crystal, and inorganic Pokemon',
  'amorphous': 'Pokemon with no fixed form',
  'ditto': 'Can breed with almost any Pokemon',
  'dragon': 'Draconic and serpentine Pokemon',
  'no-eggs': 'Cannot breed',
  'undiscovered': 'Cannot breed (legendaries, babies)',
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

// Classification Badges Section - extracted to avoid IIFE in JSX
const ClassificationBadgesSection: React.FC<{
  pokemon: Pokemon;
  species: PokemonSpecies;
}> = ({ pokemon, species }) => {
  const pokemonId = typeof pokemon.id === 'string' ? parseInt(pokemon.id, 10) : pokemon.id;

  return (
    <div className="flex justify-center md:justify-start">
      <PokemonBadges
        pokemonId={pokemonId}
        pokemonName={pokemon.name}
        isLegendary={species.is_legendary}
        isMythical={species.is_mythical}
        isUltraBeast={isUltraBeast(pokemonId)}
        isParadoxPast={isParadoxPast(pokemonId)}
        isParadoxFuture={isParadoxFuture(pokemonId)}
        isStarter={isStarter(pokemonId)}
        size="sm"
      />
    </div>
  );
};

// Shiny Sparkle Icon (not a star)
const ShinyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L13.09 8.26L18 6L15.74 10.91L22 12L15.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L8.26 13.09L2 12L8.26 10.91L6 6L10.91 8.26L12 2Z" />
  </svg>
);

// Navigation Header
const NavHeader: React.FC<{
  pokemonName: string;
  pokemonId: number;
  adjacentPokemon?: PokemonDetailPageV2Props['adjacentPokemon'];
}> = ({ pokemonName, pokemonId, adjacentPokemon }) => {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Back button */}
        <button
          onClick={() => router.push('/pokedex')}
          className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium hidden sm:inline">Pokedex</span>
        </button>

        {/* Center: Pokemon name and ID */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight">
            {capitalize(pokemonName)}
          </h1>
          <span className="text-sm text-stone-500 dark:text-stone-400 font-mono">
            {formatPokemonId(pokemonId)}
          </span>
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center gap-1">
          {adjacentPokemon?.prev && (
            <Link
              href={`/pokedex/${adjacentPokemon.prev.id}`}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title={capitalize(adjacentPokemon.prev.name)}
            >
              <svg className="w-5 h-5 text-stone-600 dark:text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          {adjacentPokemon?.next && (
            <Link
              href={`/pokedex/${adjacentPokemon.next.id}`}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title={capitalize(adjacentPokemon.next.name)}
            >
              <svg className="w-5 h-5 text-stone-600 dark:text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

// Hero Section
const HeroSection: React.FC<{
  pokemon: Pokemon;
  species: PokemonSpecies;
  isShiny: boolean;
  onShinyToggle: () => void;
}> = ({ pokemon, species, isShiny, onShinyToggle }) => {
  const primaryType = pokemon.types?.[0]?.type.name || 'normal';

  const spriteUrl = isShiny
    ? pokemon.sprites?.other?.['official-artwork']?.front_shiny || pokemon.sprites?.front_shiny
    : pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default;

  const flavorText = useMemo(() => {
    const entries = species.flavor_text_entries?.filter(e => e.language.name === 'en') || [];
    const text = entries[entries.length - 1]?.flavor_text || '';
    return text.replace(/\f/g, ' ').replace(/\n/g, ' ');
  }, [species]);

  const genus = useMemo(() => {
    const entry = species.genera?.find(g => g.language.name === 'en');
    return entry?.genus || '';
  }, [species]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-50 to-white dark:from-stone-800 dark:to-stone-900">
      {/* Type-colored accent */}
      <div
        className="absolute inset-0 opacity-5"
        style={{ backgroundColor: getTypeColor(primaryType) }}
      />

      <div className="relative max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Pokemon Image */}
          <div className="relative flex-shrink-0">
            <motion.div
              className="w-56 h-56 md:w-72 md:h-72 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {spriteUrl ? (
                <Image
                  src={spriteUrl}
                  alt={pokemon.name}
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center">
                  <span className="text-6xl">?</span>
                </div>
              )}
            </motion.div>

            {/* Shiny toggle button - sparkle icon, not star */}
            <motion.button
              onClick={onShinyToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "absolute bottom-2 right-2 p-3 rounded-full transition-all shadow-lg",
                isShiny
                  ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white"
                  : "bg-white dark:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-amber-500 border border-stone-200 dark:border-stone-700"
              )}
              title={isShiny ? "Show normal coloration" : "Show shiny coloration"}
            >
              <ShinyIcon className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Pokemon Info */}
          <div className="flex-1 text-center md:text-left space-y-3">
            {/* Pokemon Name & Number */}
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <h1 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-white capitalize">
                  {capitalize(pokemon.name.split('-')[0])}
                </h1>
                <span className="text-xl md:text-2xl font-semibold text-stone-400 dark:text-stone-500">
                  {formatPokemonId(typeof pokemon.id === 'string' ? parseInt(pokemon.id, 10) : pokemon.id)}
                </span>
              </div>
              {/* Genus */}
              {genus && (
                <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">
                  {genus}
                </p>
              )}
            </div>

            {/* Types */}
            <div className="flex justify-center md:justify-start gap-2">
              {(pokemon.types || []).map(({ type }) => (
                <span
                  key={type.name}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold text-white shadow-sm"
                  style={{ backgroundColor: getTypeColor(type.name) }}
                >
                  {capitalize(type.name)}
                </span>
              ))}
            </div>

            {/* Classification Badges */}
            <ClassificationBadgesSection
              pokemon={pokemon}
              species={species}
            />

            {/* Description */}
            {flavorText && (
              <p className="text-stone-600 dark:text-stone-300 text-base leading-relaxed max-w-xl">
                {flavorText}
              </p>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {pokemon.height != null && (
                <div className="bg-white dark:bg-stone-800 rounded-xl p-3 shadow-sm border border-stone-100 dark:border-stone-700 transition-colors hover:bg-stone-50 dark:hover:bg-stone-700/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FiMaximize2 className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-xs text-stone-500 dark:text-stone-400">Height</span>
                  </div>
                  <span className="font-semibold text-stone-900 dark:text-white text-sm">
                    {formatHeight(pokemon.height)}
                  </span>
                </div>
              )}
              {pokemon.weight != null && (
                <div className="bg-white dark:bg-stone-800 rounded-xl p-3 shadow-sm border border-stone-100 dark:border-stone-700 transition-colors hover:bg-stone-50 dark:hover:bg-stone-700/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FiActivity className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-xs text-stone-500 dark:text-stone-400">Weight</span>
                  </div>
                  <span className="font-semibold text-stone-900 dark:text-white text-sm">
                    {formatWeight(pokemon.weight)}
                  </span>
                </div>
              )}
              {species.generation && (
                <div className="bg-white dark:bg-stone-800 rounded-xl p-3 shadow-sm border border-stone-100 dark:border-stone-700 transition-colors hover:bg-stone-50 dark:hover:bg-stone-700/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FiTrendingUp className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-xs text-stone-500 dark:text-stone-400">Generation</span>
                  </div>
                  <span className="font-semibold text-stone-900 dark:text-white text-sm">
                    {species.generation.name.replace('generation-', '').toUpperCase()}
                  </span>
                </div>
              )}
              {species.base_happiness !== undefined && (
                <div className="bg-white dark:bg-stone-800 rounded-xl p-3 shadow-sm border border-stone-100 dark:border-stone-700 transition-colors hover:bg-stone-50 dark:hover:bg-stone-700/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FiHeart className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-xs text-stone-500 dark:text-stone-400">Base Happiness</span>
                  </div>
                  <span className="font-semibold text-stone-900 dark:text-white text-sm">
                    {species.base_happiness}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Stats calculation helper
const calculateStat = (
  base: number,
  iv: number,
  ev: number,
  level: number,
  nature: number,
  isHp: boolean
): number => {
  if (isHp) {
    // HP formula: ((2 * Base + IV + EV/4) * Level / 100) + Level + 10
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  }
  // Other stats: (((2 * Base + IV + EV/4) * Level / 100) + 5) * Nature
  return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * nature);
};

// Stats Section with Level/IV Calculator
const StatsSection: React.FC<{ pokemon: Pokemon }> = ({ pokemon }) => {
  const stats = pokemon.stats || [];
  const [level, setLevel] = useState(50);
  const [ivMode, setIvMode] = useState<'base' | 'perfect' | 'zero'>('base');

  if (stats.length === 0) return null;

  const totalBaseStats = stats.reduce((sum, stat) => sum + stat.base_stat, 0);

  // Get IV value based on mode
  const getIV = () => ivMode === 'perfect' ? 31 : ivMode === 'zero' ? 0 : 0;
  const getEV = () => ivMode === 'base' ? 0 : 0; // For simplicity, EVs at 0

  const getStatRating = (value: number) => {
    if (value >= 150) return 'Outstanding';
    if (value >= 120) return 'Excellent';
    if (value >= 90) return 'Good';
    if (value >= 60) return 'Average';
    if (value >= 30) return 'Below Average';
    return 'Poor';
  };

  return (
    <Section
      title="Base Stats"
      subtitle={`Total: ${totalBaseStats}`}
      action={
        <div className="flex items-center gap-2 flex-wrap">
          {/* Level Selector */}
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg px-2 py-1">
            <span className="text-xs text-stone-500 dark:text-stone-400">Lv.</span>
            <select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="bg-transparent text-sm font-semibold text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
            >
              {[1, 5, 10, 25, 50, 100].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* IV Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700">
            {[
              { value: 'base' as const, label: 'Base' },
              { value: 'perfect' as const, label: '31 IV' },
              { value: 'zero' as const, label: '0 IV' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setIvMode(value)}
                className={cn(
                  "px-2 py-1 text-xs font-medium transition-colors",
                  ivMode === value
                    ? "bg-amber-500 text-white"
                    : "bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {stats.map(({ stat, base_stat }) => {
          const isHp = stat.name === 'hp';
          const calculatedStat = ivMode === 'base'
            ? base_stat
            : calculateStat(base_stat, getIV(), getEV(), level, 1.0, isHp);

          return (
            <div key={stat.name} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-14 text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                    {getStatAbbr(stat.name)}
                  </span>
                  <span className="text-sm font-bold text-stone-900 dark:text-white tabular-nums min-w-[2rem]">
                    {base_stat}
                  </span>
                  {ivMode !== 'base' && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      → {calculatedStat}
                    </span>
                  )}
                </div>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {getStatRating(base_stat)}
                </span>
              </div>
              <div className="h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", getStatColor(stat.name))}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((base_stat / 255) * 100, 100)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {ivMode !== 'base' && (
        <p className="mt-3 text-xs text-stone-500 dark:text-stone-400 text-center">
          Showing calculated stats at Level {level} with {ivMode === 'perfect' ? '31' : '0'} IVs, 0 EVs, neutral nature
        </p>
      )}
    </Section>
  );
};

// Type Effectiveness Section
const TypeEffectivenessSection: React.FC<{ types: string[] }> = ({ types }) => {
  const { weaknesses, resistances, immunities } = useMemo(
    () => calculateTypeEffectiveness(types),
    [types]
  );

  if (weaknesses.length === 0 && resistances.length === 0 && immunities.length === 0) {
    return null;
  }

  return (
    <Section title="Type Matchups">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
            <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Weak To
            </h4>
            <div className="flex flex-wrap gap-2">
              {weaknesses.map(({ type, multiplier }) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: getTypeColor(type) }}
                >
                  {capitalize(type)}
                  <span className="opacity-75">x{multiplier}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resistances */}
        {resistances.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
            <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Resistant To
            </h4>
            <div className="flex flex-wrap gap-2">
              {resistances.map(({ type, multiplier }) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: getTypeColor(type) }}
                >
                  {capitalize(type)}
                  <span className="opacity-75">x{multiplier}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Immunities */}
        {immunities.length > 0 && (
          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Immune To
            </h4>
            <div className="flex flex-wrap gap-2">
              {immunities.map(type => (
                <span
                  key={type}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: getTypeColor(type) }}
                >
                  {capitalize(type)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
};

// Abilities Section - Shows all abilities expanded by default
const AbilitiesSection: React.FC<{
  pokemon: Pokemon;
  abilities?: Record<string, AbilityData>;
}> = ({ pokemon, abilities }) => {
  const pokemonAbilities = pokemon.abilities || [];

  if (pokemonAbilities.length === 0) return null;

  return (
    <Section title="Abilities">
      <div className="grid gap-4 md:grid-cols-2">
        {pokemonAbilities.map(({ ability, is_hidden }) => {
          const abilityData = abilities?.[ability.name];
          const effectText = abilityData?.effect || abilityData?.short_effect;

          return (
            <div
              key={ability.name}
              className={cn(
                "p-4 rounded-xl border transition-all",
                is_hidden
                  ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50"
                  : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-stone-900 dark:text-white">
                  {capitalize(ability.name)}
                </h4>
                {is_hidden && (
                  <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-medium rounded-full flex-shrink-0">
                    Hidden
                  </span>
                )}
              </div>
              {effectText ? (
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {effectText}
                </p>
              ) : (
                <p className="text-sm text-stone-400 dark:text-stone-500 italic">
                  Effect description not available
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
};

// Helper to detect regional form suffix from Pokemon name
const getRegionalSuffix = (pokemonName: string): string | null => {
  const regionalPatterns = ['-alola', '-galar', '-hisui', '-paldea'];
  for (const pattern of regionalPatterns) {
    if (pokemonName.includes(pattern)) {
      return pattern;
    }
  }
  return null;
};

// Regional-exclusive evolutions: Pokemon that ONLY evolve from regional forms
// These are new species (not forms) that were introduced alongside regional variants
// NOTE: This data is also stored in Supabase (regional_exclusive_evolutions table)
// These hardcoded values serve as fallback if Supabase is unavailable
const REGIONAL_EXCLUSIVE_EVOLUTIONS: Record<string, string> = {
  // Galarian exclusives (Gen 8) - species name -> required regional form suffix
  'sirfetchd': '-galar',      // Only from Galarian Farfetch'd
  'perrserker': '-galar',     // Only from Galarian Meowth
  'mr-rime': '-galar',        // Only from Galarian Mr. Mime
  'cursola': '-galar',        // Only from Galarian Corsola
  'obstagoon': '-galar',      // Only from Galarian Linoone
  'runerigus': '-galar',      // Only from Galarian Yamask
  // Hisuian exclusives (Legends Arceus)
  'sneasler': '-hisui',       // Only from Hisuian Sneasel
  'overqwil': '-hisui',       // Only from Hisuian Qwilfish
  'basculegion': '-hisui',    // Only from White-Striped Basculin (Hisuian)
};

// Pokemon that DON'T evolve in their base form but DO evolve in regional form
// NOTE: This data is also stored in Supabase (base_form_no_evolution table)
const BASE_FORM_NO_EVOLUTION: Set<string> = new Set([
  'farfetchd',   // Regular Farfetch'd doesn't evolve
  'corsola',     // Regular Corsola doesn't evolve
]);

// Evolution Section with comprehensive regional form support
const EvolutionSection: React.FC<{
  evolutionChain?: EvolutionChain | null;
  currentPokemonId: number;
  currentPokemonName?: string;
}> = ({ evolutionChain, currentPokemonId, currentPokemonName }) => {
  const [evolutionData, setEvolutionData] = useState<Array<{
    name: string;
    displayName: string;
    id: number;
    sprite: string;
    trigger?: string;
    minLevel?: number;
    item?: string;
  }> | null>(null);
  const [loading, setLoading] = useState(true);

  // Detect if current Pokemon is a regional form
  const regionalSuffix = currentPokemonName ? getRegionalSuffix(currentPokemonName) : null;
  const baseSpeciesName = currentPokemonName?.split('-')[0] || '';

  useEffect(() => {
    if (!evolutionChain?.chain) {
      setLoading(false);
      return;
    }

    const buildEvolutionChain = async () => {
      const getIdFromUrl = (url: string): number => {
        const parts = url.split('/');
        return parseInt(parts[parts.length - 2]);
      };

      // Helper to fetch Pokemon data
      const fetchPokemonData = async (nameOrId: string | number) => {
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
          if (response.ok) {
            const data = await response.json();
            return {
              id: data.id,
              name: data.name,
              sprite: data.sprites?.other?.['official-artwork']?.front_default ||
                      data.sprites?.front_default ||
                      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,
            };
          }
        } catch {}
        return null;
      };

      // Helper to format display name
      const formatDisplayName = (name: string): string => {
        const suffix = getRegionalSuffix(name);
        if (suffix) {
          const baseName = name.replace(suffix, '');
          const regionNames: Record<string, string> = {
            '-alola': 'Alolan',
            '-galar': 'Galarian',
            '-hisui': 'Hisuian',
            '-paldea': 'Paldean',
          };
          return `${regionNames[suffix] || ''} ${capitalize(baseName)}`;
        }
        return capitalize(name.replace(/-/g, ' '));
      };

      // Build flat list of all evolutions in chain with parent info
      interface ChainNode {
        name: string;
        speciesId: number;
        parentName: string | null;
        trigger?: string;
        minLevel?: number;
        item?: string;
      }

      const allNodes: ChainNode[] = [];

      const traverseChain = (node: any, parentName: string | null = null) => {
        const speciesId = getIdFromUrl(node.species.url);
        const details = node.evolution_details?.[0];

        allNodes.push({
          name: node.species.name,
          speciesId,
          parentName,
          trigger: details?.trigger?.name,
          minLevel: details?.min_level,
          item: details?.item?.name || details?.held_item?.name,
        });

        node.evolves_to?.forEach((evo: any) => {
          traverseChain(evo, node.species.name);
        });
      };

      traverseChain(evolutionChain.chain);

      // CASE 1: Viewing a REGIONAL FORM
      if (regionalSuffix) {
        const result: typeof evolutionData = [];

        // Find the path in the base chain that corresponds to current Pokemon
        const currentBaseNode = allNodes.find(n => n.name === baseSpeciesName);
        if (!currentBaseNode) {
          setLoading(false);
          return;
        }

        // Build path: get ancestors (pre-evolutions)
        const ancestors: ChainNode[] = [];
        let current: ChainNode | undefined = currentBaseNode;
        while (current?.parentName) {
          const parent = allNodes.find(n => n.name === current!.parentName);
          if (parent) {
            ancestors.unshift(parent);
            current = parent;
          } else {
            break;
          }
        }

        // Add ancestors as regional forms
        for (const ancestor of ancestors) {
          const regionalName = `${ancestor.name}${regionalSuffix}`;
          const data = await fetchPokemonData(regionalName);
          if (data) {
            result.push({
              ...data,
              displayName: formatDisplayName(data.name),
              trigger: ancestor.trigger,
              minLevel: ancestor.minLevel,
              item: ancestor.item,
            });
          }
        }

        // Add current Pokemon (the regional form we're viewing)
        const currentData = await fetchPokemonData(currentPokemonName!);
        if (currentData) {
          result.push({
            ...currentData,
            displayName: formatDisplayName(currentData.name),
            trigger: currentBaseNode.trigger,
            minLevel: currentBaseNode.minLevel,
            item: currentBaseNode.item,
          });
        }

        // Find evolutions from current base species
        const evolutions = allNodes.filter(n => n.parentName === baseSpeciesName);

        for (const evo of evolutions) {
          // Check if this evolution requires this specific regional form
          const requiredRegion = REGIONAL_EXCLUSIVE_EVOLUTIONS[evo.name];

          if (requiredRegion === regionalSuffix) {
            // This evolution is exclusive to our regional form - show it
            const data = await fetchPokemonData(evo.name);
            if (data) {
              result.push({
                ...data,
                displayName: formatDisplayName(data.name),
                trigger: evo.trigger,
                minLevel: evo.minLevel,
                item: evo.item,
              });
            }
          } else if (!requiredRegion) {
            // Not regional-exclusive - check if regional form of evolution exists
            const regionalEvoName = `${evo.name}${regionalSuffix}`;
            const regionalData = await fetchPokemonData(regionalEvoName);

            if (regionalData) {
              result.push({
                ...regionalData,
                displayName: formatDisplayName(regionalData.name),
                trigger: evo.trigger,
                minLevel: evo.minLevel,
                item: evo.item,
              });
            }
          }
          // If requiredRegion exists but doesn't match our suffix, skip (wrong regional line)
        }

        if (result.length > 0) {
          setEvolutionData(result);
        }
      }
      // CASE 2: Viewing a BASE FORM
      else {
        // Check if this base form doesn't evolve
        if (BASE_FORM_NO_EVOLUTION.has(baseSpeciesName)) {
          setLoading(false);
          return;
        }

        // Find path from root to current Pokemon
        const findPathToTarget = (targetId: number, targetName: string): ChainNode[] => {
          const path: ChainNode[] = [];

          // Find the target node
          const targetNode = allNodes.find(n =>
            n.speciesId === targetId || n.name === targetName
          );

          if (!targetNode) return [];

          // Build path from target back to root
          let current: ChainNode | undefined = targetNode;
          while (current) {
            path.unshift(current);
            if (current.parentName) {
              current = allNodes.find(n => n.name === current!.parentName);
            } else {
              break;
            }
          }

          return path;
        };

        const path = findPathToTarget(currentPokemonId, baseSpeciesName);

        if (path.length > 0) {
          const result: typeof evolutionData = [];

          for (const node of path) {
            // Skip regional-exclusive evolutions for base forms
            if (REGIONAL_EXCLUSIVE_EVOLUTIONS[node.name]) {
              continue;
            }

            const data = await fetchPokemonData(node.speciesId);
            if (data) {
              result.push({
                ...data,
                displayName: formatDisplayName(data.name),
                trigger: node.trigger,
                minLevel: node.minLevel,
                item: node.item,
              });
            }
          }

          if (result.length > 0) {
            setEvolutionData(result);
          }
        }
      }

      setLoading(false);
    };

    buildEvolutionChain();
  }, [evolutionChain, currentPokemonId, currentPokemonName, regionalSuffix, baseSpeciesName]);

  if (loading || !evolutionData || evolutionData.length <= 1) {
    return null;
  }

  return (
    <Section title="Evolution Chain">
      <div className="flex items-center justify-center gap-2 md:gap-6 overflow-x-auto py-4 px-2">
        {evolutionData.map((evo, index) => (
          <React.Fragment key={evo.id}>
            {index > 0 && (
              <div className="flex flex-col items-center text-stone-400 flex-shrink-0 px-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {evo.minLevel && (
                  <span className="text-xs font-medium mt-1">Lv. {evo.minLevel}</span>
                )}
                {evo.item && (
                  <div className="mt-1">
                    <EvolutionItemDisplay item={evo.item} size="sm" labelPosition="bottom" />
                  </div>
                )}
              </div>
            )}

            <Link
              href={`/pokedex/${evo.id}`}
              className={cn(
                "flex flex-col items-center p-3 rounded-xl transition-all flex-shrink-0",
                evo.id === currentPokemonId
                  ? "bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-400 shadow-lg"
                  : "hover:bg-stone-100 dark:hover:bg-stone-800"
              )}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 relative">
                <Image
                  src={evo.sprite}
                  alt={evo.displayName}
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300 mt-2 text-center">
                {evo.displayName}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                #{evo.id.toString().padStart(4, '0')}
              </span>
            </Link>
          </React.Fragment>
        ))}
      </div>
    </Section>
  );
};

// Training & Breeding Section - Combined with more info
const TrainingBreedingSection: React.FC<{ species: PokemonSpecies; pokemon: Pokemon }> = ({ species, pokemon }) => {
  const genderRate = species.gender_rate;

  const getGenderDisplay = () => {
    if (genderRate === -1) return { male: null, female: null, genderless: true };
    const femalePercent = (genderRate / 8) * 100;
    const malePercent = 100 - femalePercent;
    return { male: malePercent, female: femalePercent, genderless: false };
  };

  const gender = getGenderDisplay();
  const eggGroups = species.egg_groups || [];
  const hatchSteps = species.hatch_counter ? species.hatch_counter * 256 : null;
  const growthRate = species.growth_rate?.name;
  const growthInfo = growthRate ? GROWTH_RATE_INFO[growthRate] : null;
  const catchRate = species.capture_rate;
  const baseExp = pokemon.base_experience;

  return (
    <Section title="Training & Breeding">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Training Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide">Training</h4>

          <div className="grid grid-cols-2 gap-3">
            {catchRate !== undefined && (
              <InfoCard
                label="Catch Rate"
                value={String(catchRate)}
                hint={catchRate <= 45 ? 'Difficult' : catchRate >= 200 ? 'Easy' : 'Moderate'}
                icon={<FiTarget className="w-3.5 h-3.5" />}
              />
            )}
            {baseExp !== undefined && (
              <InfoCard
                label="Base EXP"
                value={String(baseExp)}
                icon={<FiTrendingUp className="w-3.5 h-3.5" />}
              />
            )}
            {growthInfo && (
              <InfoCard
                label="Growth Rate"
                value={growthInfo.label}
                hint={growthInfo.description}
                icon={<FiActivity className="w-3.5 h-3.5" />}
                className="col-span-2"
              />
            )}
          </div>
        </div>

        {/* Breeding Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide">Breeding</h4>

          {/* Gender Ratio */}
          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4">
            <span className="text-xs text-stone-500 dark:text-stone-400 block mb-2">Gender Ratio</span>
            {gender.genderless ? (
              <span className="font-medium text-stone-600 dark:text-stone-300">Genderless</span>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Male {gender.male?.toFixed(1)}%</span>
                  <span className="text-pink-600 dark:text-pink-400 font-medium">Female {gender.female?.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden flex">
                  <div className="bg-blue-500 h-full" style={{ width: `${gender.male}%` }} />
                  <div className="bg-pink-500 h-full" style={{ width: `${gender.female}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Egg Groups with compatibility info */}
          {eggGroups.length > 0 && (
            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4">
              <span className="text-xs text-stone-500 dark:text-stone-400 block mb-2">Egg Groups</span>
              <div className="space-y-2">
                {eggGroups.map(group => (
                  <div key={group.name} className="flex items-start gap-2">
                    <span className="px-2 py-0.5 bg-stone-200 dark:bg-stone-700 rounded text-sm font-medium text-stone-700 dark:text-stone-300">
                      {capitalize(group.name)}
                    </span>
                    {EGG_GROUP_INFO[group.name] && (
                      <span className="text-xs text-stone-500 dark:text-stone-400 pt-0.5">
                        {EGG_GROUP_INFO[group.name]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hatch Steps */}
          {hatchSteps && (
            <InfoCard
              label="Egg Cycles"
              value={`${species.hatch_counter} cycles`}
              hint={`~${hatchSteps.toLocaleString()} steps`}
              icon={<FaEgg className="w-3.5 h-3.5" />}
            />
          )}
        </div>
      </div>
    </Section>
  );
};

// Info Card component for consistent styling
const InfoCard: React.FC<{
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}> = ({ label, value, hint, icon, className }) => (
  <div className={cn("bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800/70", className)}>
    <div className="flex items-center gap-1.5 mb-1">
      {icon && <span className="text-stone-400 dark:text-stone-500">{icon}</span>}
      <span className="text-xs text-stone-500 dark:text-stone-400">{label}</span>
    </div>
    <span className="font-semibold text-stone-900 dark:text-white">{value}</span>
    {hint && <span className="text-xs text-stone-500 dark:text-stone-400 block mt-0.5">{hint}</span>}
  </div>
);

// Move types cache - shared across component instances
const moveTypesCache: Record<string, string> = {};

// Moves Section - Expanded by default with better display and type coloring
const MovesSection: React.FC<{ pokemon: Pokemon }> = ({ pokemon }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'level-up' | 'machine' | 'egg' | 'tutor'>('level-up');
  const [searchQuery, setSearchQuery] = useState('');
  const [moveTypes, setMoveTypes] = useState<Record<string, string>>(moveTypesCache);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const groupedMoves = useMemo(() => {
    const groups: Record<string, Array<{ name: string; level?: number }>> = {
      'level-up': [],
      'machine': [],
      'egg': [],
      'tutor': [],
    };

    pokemon.moves?.forEach(move => {
      move.version_group_details.forEach((detail: { move_learn_method: { name: string }; level_learned_at: number }) => {
        const method = detail.move_learn_method.name;
        if (groups[method]) {
          const existing = groups[method].find(m => m.name === move.move.name);
          if (!existing) {
            groups[method].push({
              name: move.move.name,
              level: detail.level_learned_at,
            });
          }
        }
      });
    });

    groups['level-up'].sort((a, b) => (a.level || 0) - (b.level || 0));

    return groups;
  }, [pokemon.moves]);

  // Fetch move types for current tab
  const fetchMoveTypes = useCallback(async (moves: Array<{ name: string }>) => {
    const uncachedMoves = moves.filter(m => !moveTypesCache[m.name]);
    if (uncachedMoves.length === 0) return;

    setLoadingTypes(true);

    // Batch fetch in chunks of 10 to avoid overwhelming the API
    const chunkSize = 10;
    for (let i = 0; i < uncachedMoves.length; i += chunkSize) {
      const chunk = uncachedMoves.slice(i, i + chunkSize);

      await Promise.all(
        chunk.map(async (move) => {
          try {
            const response = await fetch(`https://pokeapi.co/api/v2/move/${move.name}`);
            if (response.ok) {
              const data = await response.json();
              const typeName = data.type?.name || 'normal';
              moveTypesCache[move.name] = typeName;
            }
          } catch {
            // Silently fail - move will show without type color
          }
        })
      );

      // Update state after each chunk
      setMoveTypes({ ...moveTypesCache });
    }

    setLoadingTypes(false);
  }, []);

  // Fetch types when tab changes
  useEffect(() => {
    const currentMoves = groupedMoves[activeTab] || [];
    fetchMoveTypes(currentMoves);
  }, [activeTab, groupedMoves, fetchMoveTypes]);

  const tabs = [
    { id: 'level-up', label: 'Level Up', count: groupedMoves['level-up'].length },
    { id: 'machine', label: 'TM/HM', count: groupedMoves['machine'].length },
    { id: 'egg', label: 'Egg', count: groupedMoves['egg'].length },
    { id: 'tutor', label: 'Tutor', count: groupedMoves['tutor'].length },
  ].filter(tab => tab.count > 0);

  const currentMoves = groupedMoves[activeTab] || [];
  const filteredMoves = searchQuery
    ? currentMoves.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : currentMoves;

  const totalMoves = Object.values(groupedMoves).reduce((sum, arr) => sum + arr.length, 0);

  // Helper to get type-based styling
  const getMoveTypeStyle = (moveName: string) => {
    const moveType = moveTypes[moveName];
    if (!moveType || !TYPE_COLORS[moveType]) {
      return {};
    }
    const color = TYPE_COLORS[moveType];
    return {
      backgroundColor: `${color}20`, // 20 = 12.5% opacity
      borderColor: `${color}60`, // 60 = 37.5% opacity
    };
  };

  const getMoveTypeBadgeStyle = (moveName: string) => {
    const moveType = moveTypes[moveName];
    if (!moveType || !TYPE_COLORS[moveType]) {
      return {};
    }
    return {
      backgroundColor: TYPE_COLORS[moveType],
    };
  };

  if (totalMoves === 0) return null;

  return (
    <Section title="Moves" subtitle={`${totalMoves} total moves`}>
      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search moves..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
            )}
          >
            {tab.label}
            <span className="ml-1.5 opacity-75">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Loading indicator */}
      {loadingTypes && (
        <div className="text-xs text-stone-500 dark:text-stone-400 mb-2 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Loading move types...
        </div>
      )}

      {/* Moves Grid - All tabs now use consistent grid layout with type colors */}
      <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
        <div className="p-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {filteredMoves.map(move => {
            const moveType = moveTypes[move.name];
            return (
              <button
                key={move.name}
                onClick={() => router.push(`/moves/${move.name}`)}
                className="px-2 py-1.5 rounded-lg text-center group transition-all duration-200 border cursor-pointer hover:scale-105 hover:shadow-md"
                style={{
                  ...getMoveTypeStyle(move.name),
                  ...((!moveType || !TYPE_COLORS[moveType]) && {
                    backgroundColor: 'var(--move-default-bg)',
                    borderColor: 'var(--move-default-border)',
                  }),
                }}
                title={moveType ? capitalize(moveType) : undefined}
              >
                <span className="text-xs text-stone-700 dark:text-stone-200 flex items-center gap-1.5">
                  {activeTab === 'level-up' && move.level !== undefined && (
                    <>
                      <span className="text-stone-400 dark:text-stone-500 font-normal shrink-0">
                        {move.level === 0 ? 'Evo' : `Lv.${move.level}`}
                      </span>
                      <span className="text-stone-300 dark:text-stone-600">·</span>
                    </>
                  )}
                  <span className="font-medium truncate">{capitalize(move.name)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredMoves.length === 0 && (
        <p className="text-center py-8 text-stone-500 dark:text-stone-400">
          No moves found matching &quot;{searchQuery}&quot;
        </p>
      )}

      {/* CSS variables for default move styling */}
      <style jsx>{`
        :root {
          --move-default-bg: rgb(255 255 255);
          --move-default-border: rgb(229 231 235);
        }
        :global(.dark) {
          --move-default-bg: rgb(41 37 36);
          --move-default-border: rgb(68 64 60);
        }
      `}</style>
    </Section>
  );
};

// Mega & Special Forms Section
interface MegaFormData {
  name: string;
  id: number;
  sprite: string;
  types: string[];
  stats?: { name: string; value: number }[];
}

const MegaFormsSection: React.FC<{
  species: PokemonSpecies;
  currentPokemonId: number;
}> = ({ species, currentPokemonId }) => {
  const [megaForms, setMegaForms] = useState<MegaFormData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMegaForms = async () => {
      if (!species?.varieties) {
        setLoading(false);
        return;
      }

      // Filter for mega, gmax, and regional forms
      const specialVarieties = species.varieties.filter(v =>
        !v.is_default && (
          v.pokemon.name.includes('-mega') ||
          v.pokemon.name.includes('-gmax') ||
          v.pokemon.name.includes('-alola') ||
          v.pokemon.name.includes('-galar') ||
          v.pokemon.name.includes('-hisui') ||
          v.pokemon.name.includes('-paldea')
        )
      );

      if (specialVarieties.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const formsData = await Promise.all(
          specialVarieties.map(async (variety) => {
            const response = await fetch(variety.pokemon.url);
            const data = await response.json();
            return {
              name: variety.pokemon.name,
              id: data.id,
              sprite: data.sprites?.other?.['official-artwork']?.front_default ||
                      data.sprites?.front_default,
              types: data.types?.map((t: { type: { name: string } }) => t.type.name) || [],
              stats: data.stats?.map((s: { stat: { name: string }; base_stat: number }) => ({
                name: s.stat.name,
                value: s.base_stat
              }))
            };
          })
        );
        setMegaForms(formsData);
      } catch (error) {
        console.error('Failed to fetch mega forms:', error);
      }
      setLoading(false);
    };

    fetchMegaForms();
  }, [species?.varieties]);

  if (loading) {
    return null; // Don't show section while loading
  }

  if (megaForms.length === 0) {
    return null;
  }

  // Helper to get form display name
  const getFormDisplayName = (name: string): string => {
    if (name.includes('-mega-x')) return 'Mega X';
    if (name.includes('-mega-y')) return 'Mega Y';
    if (name.includes('-mega')) return 'Mega';
    if (name.includes('-gmax')) return 'Gigantamax';
    if (name.includes('-alola')) return 'Alolan';
    if (name.includes('-galar')) return 'Galarian';
    if (name.includes('-hisui')) return 'Hisuian';
    if (name.includes('-paldea')) return 'Paldean';
    return name;
  };

  // Helper to get form badge color
  const getFormBadgeColor = (name: string): string => {
    if (name.includes('-mega-x')) return 'from-blue-500 to-indigo-600';
    if (name.includes('-mega-y')) return 'from-red-500 to-pink-600';
    if (name.includes('-mega')) return 'from-purple-500 to-violet-600';
    if (name.includes('-gmax')) return 'from-red-500 to-orange-600';
    if (name.includes('-alola')) return 'from-amber-400 to-orange-500';
    if (name.includes('-galar')) return 'from-pink-500 to-rose-600';
    if (name.includes('-hisui')) return 'from-teal-500 to-cyan-600';
    if (name.includes('-paldea')) return 'from-violet-500 to-purple-600';
    return 'from-stone-500 to-stone-600';
  };

  // Helper to check if form is regional
  const isRegionalForm = (name: string): boolean => {
    return name.includes('-alola') ||
           name.includes('-galar') ||
           name.includes('-hisui') ||
           name.includes('-paldea');
  };

  // Helper to get mega stone name
  const getMegaStoneName = (pokemonName: string): string => {
    const baseName = pokemonName.split('-')[0];
    if (pokemonName.includes('-mega-x')) return `${capitalize(baseName)}ite X`;
    if (pokemonName.includes('-mega-y')) return `${capitalize(baseName)}ite Y`;
    if (pokemonName.includes('-mega')) return `${capitalize(baseName)}ite`;
    if (pokemonName.includes('-gmax')) return 'Max Soup';
    return '';
  };

  // Helper to get region description
  const getRegionDescription = (name: string): string => {
    if (name.includes('-alola')) return 'Found in the Alola region';
    if (name.includes('-galar')) return 'Found in the Galar region';
    if (name.includes('-hisui')) return 'Found in ancient Hisui';
    if (name.includes('-paldea')) return 'Found in the Paldea region';
    return '';
  };

  // Helper to get full form name (e.g., "Mega Venusaur", "Alolan Raichu")
  const getFullFormName = (name: string): string => {
    const baseName = name.split('-')[0];
    const capitalizedBase = capitalize(baseName);

    if (name.includes('-mega-x')) return `Mega ${capitalizedBase} X`;
    if (name.includes('-mega-y')) return `Mega ${capitalizedBase} Y`;
    if (name.includes('-mega')) return `Mega ${capitalizedBase}`;
    if (name.includes('-gmax')) return `Gigantamax ${capitalizedBase}`;
    if (name.includes('-alola')) return `Alolan ${capitalizedBase}`;
    if (name.includes('-galar')) return `Galarian ${capitalizedBase}`;
    if (name.includes('-hisui')) return `Hisuian ${capitalizedBase}`;
    if (name.includes('-paldea')) return `Paldean ${capitalizedBase}`;
    return capitalizedBase;
  };

  return (
    <Section title="Special Forms" subtitle={`${megaForms.length} form${megaForms.length > 1 ? 's' : ''} available`}>
      <div className="grid gap-4 md:grid-cols-2">
        {megaForms.map((form) => (
          <Link
            key={form.name}
            href={`/pokedex/${currentPokemonId}?form=${form.name.split('-').slice(1).join('-')}`}
            className="group relative bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-4 hover:shadow-lg transition-all hover:border-stone-300 dark:hover:border-stone-600"
          >
            <div className="flex items-start gap-4">
              {/* Form Image */}
              <div className="relative w-24 h-24 flex-shrink-0">
                {form.sprite ? (
                  <Image
                    src={form.sprite}
                    alt={form.name}
                    fill
                    className="object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-200 dark:bg-stone-700 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">?</span>
                  </div>
                )}
              </div>

              {/* Form Info */}
              <div className="flex-1 min-w-0">
                {/* Form Name */}
                <h4 className="font-semibold text-stone-900 dark:text-white mb-1">
                  {getFullFormName(form.name)}
                </h4>

                {/* Form Badge */}
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold text-white mb-2",
                  "bg-gradient-to-r",
                  getFormBadgeColor(form.name)
                )}>
                  <GiSparkles className="w-3 h-3" />
                  {getFormDisplayName(form.name)}
                </span>

                {/* Types */}
                <div className="flex gap-1.5 mb-2">
                  {form.types.map(type => (
                    <span
                      key={type}
                      className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: getTypeColor(type) }}
                    >
                      {capitalize(type)}
                    </span>
                  ))}
                </div>

                {/* Requirement / Description */}
                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                  {form.name.includes('-mega') ? (
                    <>
                      <FaGem className="w-3 h-3 text-purple-500" />
                      <span>Requires {getMegaStoneName(form.name)}</span>
                    </>
                  ) : form.name.includes('-gmax') ? (
                    <>
                      <GiSparkles className="w-3 h-3 text-red-500" />
                      <span>Requires Max Soup</span>
                    </>
                  ) : isRegionalForm(form.name) ? (
                    <>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{getRegionDescription(form.name)}</span>
                    </>
                  ) : null}
                </div>

                {/* Quick Stats Preview */}
                {form.stats && (
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="text-stone-500 dark:text-stone-400">
                      BST: <span className="font-semibold text-stone-700 dark:text-stone-300">
                        {form.stats.reduce((acc, s) => acc + s.value, 0)}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Arrow indicator */}
              <div className="text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
};

// Section Container
const Section: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, action, children }) => (
  <section className="py-8 border-b border-stone-200 dark:border-stone-800 last:border-b-0">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-white">{title}</h2>
        {subtitle && (
          <span className="text-sm text-stone-500 dark:text-stone-400">{subtitle}</span>
        )}
      </div>
      {action}
    </div>
    {children}
  </section>
);

// Cards View - Separate TCG and Pocket
const CardsView: React.FC<{
  cards: TCGCard[] | PocketCard[];
  type: 'tcg' | 'pocket';
  pokemonName: string;
}> = ({ cards, type, pokemonName }) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center py-16 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700">
          <div className="w-16 h-16 mx-auto mb-4 bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-stone-600 dark:text-stone-300 font-medium">
            No {type === 'tcg' ? 'TCG' : 'Pocket'} cards found for {capitalize(pokemonName)}
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Check back later for card additions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-4 text-sm text-stone-500 dark:text-stone-400">
        {cards.length} card{cards.length !== 1 ? 's' : ''} found
      </div>
      <div className="clean-card-grid">
        {cards.map((card) => (
          <div key={card.id} className="clean-card-with-info">
            <div className="clean-card-image-wrapper">
              <img
                src={type === 'tcg'
                  ? (card as TCGCard).images?.small || '/back-card.png'
                  : (card as PocketCard).image || '/back-card.png'
                }
                alt={card.name}
                className="clean-card-image"
                loading="lazy"
              />
            </div>
            <div className="clean-card-info">
              <span className="clean-card-info-name text-stone-900 dark:text-white">{card.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// View Toggle - Now with 3 options: Info, TCG Cards, Pocket Cards
const ViewToggle: React.FC<{
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  tcgCount: number;
  pocketCount: number;
}> = ({ viewMode, onViewChange, tcgCount, pocketCount }) => {
  const hasCards = tcgCount > 0 || pocketCount > 0;

  if (!hasCards) return null;

  return (
    <div className="sticky top-16 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex">
          <button
            onClick={() => onViewChange('info')}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
              viewMode === 'info'
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
            )}
          >
            Info
          </button>
          {tcgCount > 0 && (
            <button
              onClick={() => onViewChange('tcg')}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                viewMode === 'tcg'
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
              )}
            >
              TCG Cards ({tcgCount})
            </button>
          )}
          {pocketCount > 0 && (
            <button
              onClick={() => onViewChange('pocket')}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                viewMode === 'pocket'
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
              )}
            >
              Pocket ({pocketCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const PokemonDetailPageV2: React.FC<PokemonDetailPageV2Props> = ({
  pokemon,
  species,
  abilities,
  evolutionChain,
  adjacentPokemon,
  tcgCards,
  pocketCards,
  showShiny = false,
  onShinyToggle,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('info');
  const [localShiny, setLocalShiny] = useState(showShiny);

  const isShiny = onShinyToggle ? showShiny : localShiny;
  const handleShinyToggle = onShinyToggle || (() => setLocalShiny(!localShiny));

  const tcgCount = tcgCards?.length || 0;
  const pocketCount = pocketCards?.length || 0;
  const types = (pokemon.types || []).map(t => t.type.name);
  const pokemonId = typeof pokemon.id === 'string' ? parseInt(pokemon.id, 10) : pokemon.id;

  return (
    <div className="min-h-screen bg-white dark:bg-stone-900">
      {/* Navigation Header */}
      <NavHeader
        pokemonName={pokemon.name}
        pokemonId={pokemonId}
        adjacentPokemon={adjacentPokemon}
      />

      {/* View Toggle */}
      <ViewToggle
        viewMode={viewMode}
        onViewChange={setViewMode}
        tcgCount={tcgCount}
        pocketCount={pocketCount}
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'info' ? (
          <motion.main
            key="info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Hero Section */}
            <HeroSection
              pokemon={pokemon}
              species={species}
              isShiny={isShiny}
              onShinyToggle={handleShinyToggle}
            />

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 pb-12">
              {/* Stats */}
              <StatsSection pokemon={pokemon} />

              {/* Type Effectiveness */}
              <TypeEffectivenessSection types={types} />

              {/* Abilities - Now expanded by default */}
              <AbilitiesSection pokemon={pokemon} abilities={abilities} />

              {/* Evolution */}
              <EvolutionSection
                evolutionChain={evolutionChain}
                currentPokemonId={pokemonId}
                currentPokemonName={pokemon.name}
              />

              {/* Mega & Special Forms */}
              <MegaFormsSection
                species={species}
                currentPokemonId={pokemonId}
              />

              {/* Training & Breeding - Combined section with more info */}
              <TrainingBreedingSection species={species} pokemon={pokemon} />

              {/* Moves - Expanded by default with better display */}
              <MovesSection pokemon={pokemon} />
            </div>
          </motion.main>
        ) : viewMode === 'tcg' ? (
          <motion.main
            key="tcg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardsView
              cards={tcgCards || []}
              type="tcg"
              pokemonName={pokemon.name}
            />
          </motion.main>
        ) : (
          <motion.main
            key="pocket"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardsView
              cards={pocketCards || []}
              type="pocket"
              pokemonName={pokemon.name}
            />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PokemonDetailPageV2;
