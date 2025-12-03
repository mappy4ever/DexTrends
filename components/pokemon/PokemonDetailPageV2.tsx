/**
 * PokemonDetailPageV2 - Complete redesign of Pokemon details
 *
 * Design principles:
 * - Single scrollable page (Cards is the only separate view)
 * - Clean, sophisticated, mobile-first
 * - No redundant elements
 * - Clear visual hierarchy
 * - Classic, timeless feel
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { Pokemon, PokemonSpecies, EvolutionChain, PokemonType } from '@/types/pokemon';
import type { TCGCard } from '@/types/api/cards';
import type { PocketCard } from '@/types/api/pocket-cards';

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

type ViewMode = 'info' | 'cards';

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
    'special-attack': 'SP.A',
    'special-defense': 'SP.D',
    speed: 'SPD',
  };
  return abbrs[statName] || statName.toUpperCase();
};

// Type effectiveness calculation
const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

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

const calculateTypeEffectiveness = (types: string[]): { weaknesses: string[]; resistances: string[]; immunities: string[] } => {
  const multipliers: Record<string, number> = {};

  // Initialize all types with 1x
  Object.keys(DEFENSE_CHART).forEach(type => {
    multipliers[type] = 1;
  });

  // Calculate combined effectiveness
  types.forEach(pokemonType => {
    const typeDefenses = DEFENSE_CHART[pokemonType.toLowerCase()];
    if (typeDefenses) {
      Object.entries(typeDefenses).forEach(([attackType, mult]) => {
        multipliers[attackType] = (multipliers[attackType] || 1) * mult;
      });
    }
  });

  const weaknesses: string[] = [];
  const resistances: string[] = [];
  const immunities: string[] = [];

  Object.entries(multipliers).forEach(([type, mult]) => {
    if (mult === 0) immunities.push(type);
    else if (mult >= 2) weaknesses.push(type);
    else if (mult < 1) resistances.push(type);
  });

  return { weaknesses, resistances, immunities };
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

// Navigation Header
const NavHeader: React.FC<{
  pokemonName: string;
  pokemonId: number;
  adjacentPokemon?: PokemonDetailPageV2Props['adjacentPokemon'];
}> = ({ pokemonName, pokemonId, adjacentPokemon }) => {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Back button */}
        <button
          onClick={() => router.push('/pokedex')}
          className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium hidden sm:inline">Pokédex</span>
        </button>

        {/* Center: Pokemon name and ID */}
        <div className="text-center">
          <h1 className="text-lg font-bold text-stone-900 dark:text-white">
            {capitalize(pokemonName)}
          </h1>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {formatPokemonId(pokemonId)}
          </span>
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center gap-1">
          {adjacentPokemon?.prev && (
            <Link
              href={`/pokedex/${adjacentPokemon.prev.id}`}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
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
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
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

  // Get sprite URL
  const spriteUrl = isShiny
    ? pokemon.sprites?.other?.['official-artwork']?.front_shiny || pokemon.sprites?.front_shiny
    : pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default;

  // Get flavor text (English, most recent)
  const flavorText = useMemo(() => {
    const entries = species.flavor_text_entries?.filter(e => e.language.name === 'en') || [];
    const text = entries[entries.length - 1]?.flavor_text || '';
    return text.replace(/\f/g, ' ').replace(/\n/g, ' ');
  }, [species]);

  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background based on type */}
      <div className={cn(
        "absolute inset-0 opacity-10",
        `bg-gradient-to-b from-${primaryType} to-transparent`
      )} />

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* Pokemon Image */}
          <div className="relative flex-shrink-0">
            <div className="w-48 h-48 md:w-64 md:h-64 relative">
              {spriteUrl ? (
                <Image
                  src={spriteUrl}
                  alt={pokemon.name}
                  fill
                  className="object-contain drop-shadow-lg"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center">
                  <span className="text-4xl">?</span>
                </div>
              )}
            </div>

            {/* Shiny toggle button */}
            <button
              onClick={onShinyToggle}
              className={cn(
                "absolute bottom-0 right-0 p-2 rounded-full transition-all",
                isShiny
                  ? "bg-amber-400 text-amber-900 shadow-lg shadow-amber-400/30"
                  : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-300"
              )}
              title={isShiny ? "Show normal" : "Show shiny"}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2l2.5 5.5L18 8.5l-4 4.5 1 6-5-3-5 3 1-6-4-4.5 5.5-1z" />
              </svg>
            </button>
          </div>

          {/* Pokemon Info */}
          <div className="flex-1 text-center md:text-left">
            {/* Types */}
            <div className="flex justify-center md:justify-start gap-2 mb-4">
              {(pokemon.types || []).map(({ type }) => (
                <span
                  key={type.name}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium text-white",
                    `bg-${type.name}`
                  )}
                  style={{
                    backgroundColor: getTypeColor(type.name)
                  }}
                >
                  {capitalize(type.name)}
                </span>
              ))}
            </div>

            {/* Description */}
            {flavorText && (
              <p className="text-stone-600 dark:text-stone-400 text-sm md:text-base leading-relaxed mb-4">
                {flavorText}
              </p>
            )}

            {/* Quick facts */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm">
              {pokemon.height != null && (
                <div>
                  <span className="text-stone-500 dark:text-stone-500">Height</span>
                  <span className="ml-2 font-medium text-stone-900 dark:text-white">
                    {formatHeight(pokemon.height)}
                  </span>
                </div>
              )}
              {pokemon.weight != null && (
                <div>
                  <span className="text-stone-500 dark:text-stone-500">Weight</span>
                  <span className="ml-2 font-medium text-stone-900 dark:text-white">
                    {formatWeight(pokemon.weight)}
                  </span>
                </div>
              )}
              {species.generation && (
                <div>
                  <span className="text-stone-500 dark:text-stone-500">Generation</span>
                  <span className="ml-2 font-medium text-stone-900 dark:text-white">
                    {species.generation.name.replace('generation-', '').toUpperCase()}
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

// Stats Section
const StatsSection: React.FC<{ pokemon: Pokemon }> = ({ pokemon }) => {
  const stats = pokemon.stats || [];
  const totalStats = stats.reduce((sum, stat) => sum + stat.base_stat, 0);

  if (stats.length === 0) return null;

  return (
    <Section title="Base Stats" subtitle={`Total: ${totalStats}`}>
      <div className="space-y-3">
        {stats.map(({ stat, base_stat }) => (
          <div key={stat.name} className="flex items-center gap-3">
            <span className="w-12 text-xs font-medium text-stone-500 dark:text-stone-400 text-right">
              {getStatAbbr(stat.name)}
            </span>
            <span className="w-8 text-sm font-bold text-stone-900 dark:text-white text-right">
              {base_stat}
            </span>
            <div className="flex-1 h-2.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", getStatColor(stat.name))}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((base_stat / 255) * 100, 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
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
    <Section title="Type Effectiveness">
      <div className="space-y-4">
        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">
              Weak to ({weaknesses.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {weaknesses.map(type => (
                <TypeBadge key={type} type={type} />
              ))}
            </div>
          </div>
        )}

        {/* Resistances */}
        {resistances.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
              Resistant to ({resistances.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {resistances.map(type => (
                <TypeBadge key={type} type={type} />
              ))}
            </div>
          </div>
        )}

        {/* Immunities */}
        {immunities.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-stone-600 dark:text-stone-400 mb-2">
              Immune to ({immunities.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {immunities.map(type => (
                <TypeBadge key={type} type={type} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
};

// Type Badge
const TypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <span
    className="px-2.5 py-1 rounded text-xs font-medium text-white"
    style={{ backgroundColor: getTypeColor(type) }}
  >
    {capitalize(type)}
  </span>
);

// Abilities Section
const AbilitiesSection: React.FC<{
  pokemon: Pokemon;
  abilities?: Record<string, AbilityData>;
}> = ({ pokemon, abilities }) => {
  const [expandedAbility, setExpandedAbility] = useState<string | null>(null);

  const pokemonAbilities = pokemon.abilities || [];

  if (pokemonAbilities.length === 0) return null;

  return (
    <Section title="Abilities">
      <div className="space-y-2">
        {pokemonAbilities.map(({ ability, is_hidden }) => {
          const abilityData = abilities?.[ability.name];
          const isExpanded = expandedAbility === ability.name;

          // Get effect text from our AbilityData structure
          const effectText = abilityData?.short_effect || abilityData?.effect;

          return (
            <button
              key={ability.name}
              onClick={() => setExpandedAbility(isExpanded ? null : ability.name)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-colors",
                "bg-stone-100 dark:bg-stone-800",
                "hover:bg-stone-200 dark:hover:bg-stone-700"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-900 dark:text-white">
                    {capitalize(ability.name)}
                  </span>
                  {is_hidden && (
                    <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded">
                      Hidden
                    </span>
                  )}
                </div>
                <svg
                  className={cn(
                    "w-4 h-4 text-stone-400 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <AnimatePresence>
                {isExpanded && effectText && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed"
                  >
                    {effectText}
                  </motion.p>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </Section>
  );
};

// Evolution Section
const EvolutionSection: React.FC<{
  evolutionChain?: EvolutionChain | null;
  currentPokemonId: number;
}> = ({ evolutionChain, currentPokemonId }) => {
  if (!evolutionChain?.chain) return null;

  // Flatten evolution chain
  const evolutions: Array<{
    name: string;
    id: number;
    trigger?: string;
    minLevel?: number;
    item?: string;
  }> = [];

  const extractEvolutions = (chain: any) => {
    const urlParts = chain.species.url.split('/');
    const id = parseInt(urlParts[urlParts.length - 2]);

    evolutions.push({
      name: chain.species.name,
      id,
    });

    chain.evolves_to?.forEach((evolution: any) => {
      const details = evolution.evolution_details?.[0];
      const evoUrlParts = evolution.species.url.split('/');
      const evoId = parseInt(evoUrlParts[evoUrlParts.length - 2]);

      evolutions.push({
        name: evolution.species.name,
        id: evoId,
        trigger: details?.trigger?.name,
        minLevel: details?.min_level,
        item: details?.item?.name || details?.held_item?.name,
      });

      evolution.evolves_to?.forEach((finalEvo: any) => {
        const finalDetails = finalEvo.evolution_details?.[0];
        const finalUrlParts = finalEvo.species.url.split('/');
        const finalId = parseInt(finalUrlParts[finalUrlParts.length - 2]);

        evolutions.push({
          name: finalEvo.species.name,
          id: finalId,
          trigger: finalDetails?.trigger?.name,
          minLevel: finalDetails?.min_level,
          item: finalDetails?.item?.name || finalDetails?.held_item?.name,
        });
      });
    });
  };

  extractEvolutions(evolutionChain.chain);

  // Remove duplicates
  const uniqueEvolutions = evolutions.filter(
    (evo, index, self) => self.findIndex(e => e.id === evo.id) === index
  );

  if (uniqueEvolutions.length <= 1) return null;

  return (
    <Section title="Evolution">
      <div className="flex items-center justify-center gap-2 md:gap-4 overflow-x-auto py-2">
        {uniqueEvolutions.map((evo, index) => (
          <React.Fragment key={evo.id}>
            {index > 0 && (
              <div className="flex flex-col items-center text-stone-400 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {evo.minLevel && (
                  <span className="text-xs">Lv.{evo.minLevel}</span>
                )}
                {evo.item && (
                  <span className="text-xs">{capitalize(evo.item)}</span>
                )}
              </div>
            )}

            <Link
              href={`/pokedex/${evo.id}`}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-all flex-shrink-0",
                evo.id === currentPokemonId
                  ? "bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-400"
                  : "hover:bg-stone-100 dark:hover:bg-stone-800"
              )}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 relative">
                <Image
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`}
                  alt={evo.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300 mt-1">
                {capitalize(evo.name)}
              </span>
            </Link>
          </React.Fragment>
        ))}
      </div>
    </Section>
  );
};

// Breeding Section
const BreedingSection: React.FC<{ species: PokemonSpecies }> = ({ species }) => {
  const genderRate = species.gender_rate;

  // -1 means genderless, 0-8 represents female ratio in eighths
  const getGenderDisplay = () => {
    if (genderRate === -1) return { male: null, female: null, genderless: true };
    const femalePercent = (genderRate / 8) * 100;
    const malePercent = 100 - femalePercent;
    return { male: malePercent, female: femalePercent, genderless: false };
  };

  const gender = getGenderDisplay();

  const eggGroups = species.egg_groups?.map(g => capitalize(g.name)).join(', ') || 'Unknown';

  // Hatch counter is in cycles, each cycle is ~256 steps
  const hatchSteps = species.hatch_counter ? species.hatch_counter * 256 : null;

  return (
    <Section title="Breeding">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Gender */}
        <div>
          <span className="text-xs text-stone-500 dark:text-stone-400 block mb-1">Gender</span>
          {gender.genderless ? (
            <span className="font-medium text-stone-700 dark:text-stone-300">Genderless</span>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-500">♂ {gender.male?.toFixed(1)}%</span>
              <span className="text-pink-500">♀ {gender.female?.toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Egg Groups */}
        <div>
          <span className="text-xs text-stone-500 dark:text-stone-400 block mb-1">Egg Groups</span>
          <span className="font-medium text-stone-700 dark:text-stone-300 text-sm">{eggGroups}</span>
        </div>

        {/* Hatch Time */}
        {hatchSteps && (
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 block mb-1">Hatch Steps</span>
            <span className="font-medium text-stone-700 dark:text-stone-300 text-sm">
              ~{hatchSteps.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </Section>
  );
};

// Moves Section (Collapsible)
const MovesSection: React.FC<{ pokemon: Pokemon }> = ({ pokemon }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Group moves by learn method
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

    // Sort level-up moves by level
    groups['level-up'].sort((a, b) => (a.level || 0) - (b.level || 0));

    return groups;
  }, [pokemon.moves]);

  const totalMoves = Object.values(groupedMoves).reduce((sum, arr) => sum + arr.length, 0);

  // Filter moves by search
  const filterMoves = (moves: Array<{ name: string; level?: number }>) => {
    if (!searchQuery) return moves;
    return moves.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <Section
      title="Moves"
      subtitle={`${totalMoves} total`}
      action={
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-amber-600 dark:text-amber-400 font-medium"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      }
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search moves..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-stone-100 dark:bg-stone-800 border-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Level-up moves */}
            {filterMoves(groupedMoves['level-up']).length > 0 && (
              <MoveGroup
                title="Level Up"
                moves={filterMoves(groupedMoves['level-up'])}
                showLevel
              />
            )}

            {/* TM/HM moves */}
            {filterMoves(groupedMoves['machine']).length > 0 && (
              <MoveGroup
                title="TM / HM"
                moves={filterMoves(groupedMoves['machine'])}
              />
            )}

            {/* Egg moves */}
            {filterMoves(groupedMoves['egg']).length > 0 && (
              <MoveGroup
                title="Egg Moves"
                moves={filterMoves(groupedMoves['egg'])}
              />
            )}

            {/* Tutor moves */}
            {filterMoves(groupedMoves['tutor']).length > 0 && (
              <MoveGroup
                title="Move Tutor"
                moves={filterMoves(groupedMoves['tutor'])}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!isExpanded && (
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Tap "Expand" to see all {totalMoves} moves this Pokémon can learn.
        </p>
      )}
    </Section>
  );
};

// Move Group
const MoveGroup: React.FC<{
  title: string;
  moves: Array<{ name: string; level?: number }>;
  showLevel?: boolean;
}> = ({ title, moves, showLevel }) => (
  <div className="mb-4">
    <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
      {title} ({moves.length})
    </h4>
    <div className="flex flex-wrap gap-1.5">
      {moves.map(move => (
        <span
          key={move.name}
          className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded text-xs"
        >
          {showLevel && move.level !== undefined && move.level > 0 && (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {move.level}
            </span>
          )}
          <span className="text-stone-700 dark:text-stone-300">
            {capitalize(move.name)}
          </span>
        </span>
      ))}
    </div>
  </div>
);

// Section Container
const Section: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, action, children }) => (
  <section className="py-6 border-b border-stone-200 dark:border-stone-800 last:border-b-0">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-white">{title}</h2>
        {subtitle && (
          <span className="text-sm text-stone-500 dark:text-stone-400">{subtitle}</span>
        )}
      </div>
      {action}
    </div>
    {children}
  </section>
);

// Cards View (Separate Tab)
const CardsView: React.FC<{
  tcgCards?: TCGCard[];
  pocketCards?: PocketCard[];
  pokemonName: string;
}> = ({ tcgCards, pocketCards, pokemonName }) => {
  const [cardType, setCardType] = useState<'tcg' | 'pocket'>('tcg');

  // Get cards based on selected type
  const tcgCount = tcgCards?.length || 0;
  const pocketCount = pocketCards?.length || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Card type toggle */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setCardType('tcg')}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            cardType === 'tcg'
              ? "bg-amber-500 text-white"
              : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
          )}
        >
          TCG Cards {tcgCount > 0 ? `(${tcgCount})` : ''}
        </button>
        <button
          onClick={() => setCardType('pocket')}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            cardType === 'pocket'
              ? "bg-amber-500 text-white"
              : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
          )}
        >
          Pocket Cards {pocketCount > 0 ? `(${pocketCount})` : ''}
        </button>
      </div>

      {/* Cards grid */}
      {cardType === 'tcg' ? (
        tcgCards && tcgCards.length > 0 ? (
          <div className="clean-card-grid">
            {tcgCards.map((card) => (
              <div key={card.id} className="clean-card-with-info">
                <div className="clean-card-image-wrapper">
                  <img
                    src={card.images?.small || '/back-card.png'}
                    alt={card.name}
                    className="clean-card-image"
                    loading="lazy"
                  />
                </div>
                <div className="clean-card-info">
                  <span className="clean-card-info-name">{card.name}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-stone-500 dark:text-stone-400">
              No TCG cards found for {capitalize(pokemonName)}.
            </p>
          </div>
        )
      ) : (
        pocketCards && pocketCards.length > 0 ? (
          <div className="clean-card-grid">
            {pocketCards.map((card) => (
              <div key={card.id} className="clean-card-with-info">
                <div className="clean-card-image-wrapper">
                  <img
                    src={card.image || '/back-card.png'}
                    alt={card.name}
                    className="clean-card-image"
                    loading="lazy"
                  />
                </div>
                <div className="clean-card-info">
                  <span className="clean-card-info-name">{card.name}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-stone-500 dark:text-stone-400">
              No Pocket cards found for {capitalize(pokemonName)}.
            </p>
          </div>
        )
      )}
    </div>
  );
};

// View Toggle (Info vs Cards)
const ViewToggle: React.FC<{
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  hasCards: boolean;
}> = ({ viewMode, onViewChange, hasCards }) => {
  if (!hasCards) return null;

  return (
    <div className="sticky top-14 z-30 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex">
          <button
            onClick={() => onViewChange('info')}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
              viewMode === 'info'
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-stone-500 hover:text-stone-700"
            )}
          >
            Info
          </button>
          <button
            onClick={() => onViewChange('cards')}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
              viewMode === 'cards'
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-stone-500 hover:text-stone-700"
            )}
          >
            Cards
          </button>
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

  // Use parent's shiny state if provided, otherwise use local state
  const isShiny = onShinyToggle ? showShiny : localShiny;
  const handleShinyToggle = onShinyToggle || (() => setLocalShiny(!localShiny));

  const hasCards = Boolean((tcgCards && tcgCards.length > 0) || (pocketCards && pocketCards.length > 0));
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
        hasCards={hasCards}
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'info' ? (
          <motion.main
            key="info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Hero Section */}
            <HeroSection
              pokemon={pokemon}
              species={species}
              isShiny={isShiny}
              onShinyToggle={handleShinyToggle}
            />

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4">
              {/* Stats */}
              <StatsSection pokemon={pokemon} />

              {/* Type Effectiveness */}
              <TypeEffectivenessSection types={types} />

              {/* Abilities */}
              <AbilitiesSection pokemon={pokemon} abilities={abilities} />

              {/* Evolution */}
              <EvolutionSection
                evolutionChain={evolutionChain}
                currentPokemonId={pokemonId}
              />

              {/* Breeding */}
              <BreedingSection species={species} />

              {/* Moves */}
              <MovesSection pokemon={pokemon} />
            </div>
          </motion.main>
        ) : (
          <motion.main
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CardsView
              tcgCards={tcgCards}
              pocketCards={pocketCards}
              pokemonName={pokemon.name}
            />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PokemonDetailPageV2;
