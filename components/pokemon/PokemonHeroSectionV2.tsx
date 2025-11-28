import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from '../ui/LazyMotion';
import type { Pokemon, PokemonSpecies } from "../../types/pokemon";
import { TypeBadge } from '../ui/TypeBadge';
import { CircularCard } from '../ui/design-system';
import { Container } from '../ui/Container';
import { getTypeUIColors, getTypeRingGradient } from '../../utils/pokemonTypeGradients';
import { calculateCatchRate, calculateGenderRatio } from '../../utils/pokemonDetailUtils';
import { cn } from '../../utils/cn';
import { FaStar } from 'react-icons/fa';
import PokemonStatRing from './PokemonStatRing';

interface PokemonHeroSectionV2Props {
  pokemon: Pokemon;
  species: PokemonSpecies;
  showShiny: boolean;
  onShinyToggle: () => void;
  onFormChange?: (formId: string) => void;
}

const PokemonHeroSectionV2: React.FC<PokemonHeroSectionV2Props> = ({
  pokemon,
  species,
  showShiny,
  onShinyToggle,
  onFormChange
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  
  // Get type colors for subtle theming
  const typeColors = getTypeUIColors(pokemon.types || []);
  const ringGradient = getTypeRingGradient(pokemon.types || []);
  
  // Calculate key stats
  const stats = useMemo(() => pokemon.stats || [], [pokemon.stats]);
  const totalStats = useMemo(() => stats.reduce((sum, stat) => sum + stat.base_stat, 0), [stats]);
  const catchRate = calculateCatchRate(species.capture_rate);
  const genderRatio = calculateGenderRatio(species.gender_rate);
  
  // Get primary stats for display
  const primaryStats = useMemo(() => {
    return {
      hp: stats.find(s => s.stat.name === 'hp')?.base_stat || 0,
      attack: stats.find(s => s.stat.name === 'attack')?.base_stat || 0,
      defense: stats.find(s => s.stat.name === 'defense')?.base_stat || 0,
      speed: stats.find(s => s.stat.name === 'speed')?.base_stat || 0
    };
  }, [stats]);
  
  // Get sprite URL
  const getSpriteUrl = () => {
    if (showShiny && pokemon.sprites?.other?.['official-artwork']?.front_shiny) {
      return pokemon.sprites.other['official-artwork'].front_shiny;
    }
    if (pokemon.sprites?.other?.['official-artwork']?.front_default) {
      return pokemon.sprites.other['official-artwork'].front_default;
    }
    return pokemon.sprites?.front_default || '';
  };
  
  // Get generation text
  const getGenerationText = () => {
    if (!species.generation) return 'I';
    const genMatch = species.generation.name.match(/generation-(.+)/);
    if (genMatch) {
      const romanNumerals: Record<string, string> = {
        'i': 'I', 'ii': 'II', 'iii': 'III', 'iv': 'IV',
        'v': 'V', 'vi': 'VI', 'vii': 'VII', 'viii': 'VIII', 'ix': 'IX'
      };
      return romanNumerals[genMatch[1]] || 'I';
    }
    return 'I';
  };
  
  return (
    <Container variant="default" className="relative overflow-hidden">
      {/* Subtle type-based background gradient */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `linear-gradient(to bottom right, ${typeColors.accent}, ${typeColors.animationAccent})`
        }}
      />
      
      {/* Main content grid - responsive */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 p-4 lg:p-8">
        {/* Left: Pokemon Display with responsive stat layout */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Desktop: Pokemon with surrounding stat rings */}
          <div className="hidden lg:block relative">
            {/* Stat rings positioned around the Pokemon - responsive */}
            <div className="absolute -top-12 xl:-top-16 -left-12 xl:-left-16 z-10">
              <PokemonStatRing
                stat="hp"
                value={primaryStats.hp}
                size="sm"
                typeColors={{ from: typeColors.accent, to: typeColors.animationAccent }}
                animate
              />
            </div>
            <div className="absolute -top-12 xl:-top-16 -right-12 xl:-right-16 z-10">
              <PokemonStatRing
                stat="attack"
                value={primaryStats.attack}
                size="sm"
                typeColors={{ from: typeColors.accent, to: typeColors.animationAccent }}
                animate
              />
            </div>
            <div className="absolute -bottom-12 xl:-bottom-16 -left-12 xl:-left-16 z-10">
              <PokemonStatRing
                stat="defense"
                value={primaryStats.defense}
                size="sm"
                typeColors={{ from: typeColors.accent, to: typeColors.animationAccent }}
                animate
              />
            </div>
            <div className="absolute -bottom-12 xl:-bottom-16 -right-12 xl:-right-16 z-10">
              <PokemonStatRing
                stat="speed"
                value={primaryStats.speed}
                size="sm"
                typeColors={{ from: typeColors.accent, to: typeColors.animationAccent }}
                animate
              />
            </div>
            
            {/* Main Pokemon display */}
            <CircularCard size="xl" className="relative">
              <div className="relative w-full h-full p-6">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${pokemon.id}-${showShiny}`}
                    src={getSpriteUrl()}
                    alt={pokemon.name}
                    className="w-full h-full object-contain"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    onLoad={() => setImageLoading(false)}
                    data-testid="pokemon-sprite"
                  />
                </AnimatePresence>
                
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </CircularCard>
            
            {/* Shiny toggle */}
            {pokemon.sprites?.other?.['official-artwork']?.front_shiny && (
              <motion.button
                onClick={onShinyToggle}
                className={cn(
                  "absolute top-2 right-2 lg:top-4 lg:right-4 p-2 lg:p-3 rounded-full z-20",
                  "bg-white dark:bg-stone-800 shadow-lg",
                  "hover:shadow-xl transition-all duration-200"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaStar className={cn(
                  "w-4 h-4 lg:w-5 lg:h-5",
                  showShiny ? "text-yellow-400" : "text-stone-400"
                )} />
              </motion.button>
            )}
          </div>
          
          {/* Mobile & Tablet: Horizontal stat rings */}
          <div className="lg:hidden">
            <CircularCard size="xl" className="relative">
              <div className="relative w-full h-full p-6">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${pokemon.id}-${showShiny}`}
                    src={getSpriteUrl()}
                    alt={pokemon.name}
                    className="w-full h-full object-contain"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    onLoad={() => setImageLoading(false)}
                    data-testid="pokemon-sprite"
                  />
                </AnimatePresence>
                
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </CircularCard>
            
            {/* Horizontal stat rings for mobile */}
            <div className="flex justify-center gap-4 mt-6 overflow-x-auto px-4">
              <PokemonStatRing
                stat="hp"
                value={primaryStats.hp}
                size="sm"
                typeColors={{ from: typeColors.accent, to: typeColors.animationAccent }}
                animate
              />
              <PokemonStatRing
                stat="attack"
                value={primaryStats.attack}
                size="sm"
                typeColors={{ from: typeColors.accent, to: typeColors.animationAccent }}
                animate
              />
              <PokemonStatRing
                stat="defense"
                value={primaryStats.defense}
                size="sm"
                typeColors={{ from: typeColors.accent, to: typeColors.animationAccent }}
                animate
              />
              <PokemonStatRing
                stat="speed"
                value={primaryStats.speed}
                size="sm"
                typeColors={{ from: typeColors.accent, to: typeColors.animationAccent }}
                animate
              />
            </div>
          </div>
          
          {/* Total stats indicator */}
          <div className="text-center mt-4">
            <div className="text-sm text-stone-600 dark:text-stone-400">Total Base Stats</div>
            <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-500 to-pink-500 text-transparent bg-clip-text">
              {totalStats}
            </div>
          </div>
        </div>
        
        {/* Center: Core Information */}
        <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
          {/* Pokemon name and number */}
          <div>
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
              <span className="text-sm font-mono text-stone-600 dark:text-stone-400">
                #{String(pokemon.id).padStart(4, '0')}
              </span>
              <span className="text-sm px-2 py-1 bg-stone-200 dark:bg-stone-700 rounded">
                Gen {getGenerationText()}
              </span>
              {(species.is_legendary || species.is_mythical) && (
                <span className="text-sm px-2 py-1 bg-gradient-to-r from-amber-200 to-amber-300 dark:from-amber-700 dark:to-amber-800 text-amber-900 dark:text-amber-100 rounded">
                  {species.is_legendary ? 'Legendary' : 'Mythical'}
                </span>
              )}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold capitalize mb-2" data-testid="pokemon-name">
              {pokemon.name.replace(/-/g, ' ')}
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-300" data-testid="pokemon-genus">
              {species.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown Pokémon'}
            </p>
          </div>
          
          {/* Types */}
          <div className="flex justify-center lg:justify-start gap-2">
            {pokemon.types?.map(typeInfo => (
              <TypeBadge key={typeInfo.slot} type={typeInfo.type.name} size="lg" />
            ))}
          </div>
          
          {/* Physical characteristics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4">
              <div className="text-sm text-stone-600 dark:text-stone-400">Height</div>
              <div className="text-2xl font-bold">{((pokemon.height || 0) / 10).toFixed(1)}m</div>
            </div>
            <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4">
              <div className="text-sm text-stone-600 dark:text-stone-400">Weight</div>
              <div className="text-2xl font-bold">{((pokemon.weight || 0) / 10).toFixed(1)}kg</div>
            </div>
          </div>
          
          {/* Abilities preview */}
          <div>
            <h3 className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-2">Abilities</h3>
            <div className="flex flex-wrap gap-2">
              {pokemon.abilities?.map(ability => (
                <span
                  key={ability.ability.name}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm",
                    ability.is_hidden
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
                      : "bg-stone-200 dark:bg-stone-700"
                  )}
                >
                  {ability.ability.name.replace(/-/g, ' ')}
                  {ability.is_hidden && ' (H)'}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right: Quick Stats & Info */}
        <div className="space-y-4">
          {/* Catch rate visual */}
          <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-600 dark:text-stone-400">Catch Rate</span>
              <span className={cn("font-bold", catchRate.color)}>
                {catchRate.percentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full bg-gradient-to-r", catchRate.color)}
                initial={{ width: 0 }}
                animate={{ width: `${catchRate.percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
          
          {/* Gender ratio */}
          {!genderRatio.genderless && (
            <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4">
              <div className="text-sm text-stone-600 dark:text-stone-400 mb-2">Gender Ratio</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  ♂ {genderRatio.male.toFixed(0)}%
                </span>
                <span className="text-pink-600 dark:text-pink-400 font-bold">
                  {genderRatio.female.toFixed(0)}% ♀
                </span>
              </div>
              <div className="relative h-4 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-blue-500"
                  style={{ width: `${genderRatio.male}%` }}
                />
                <div 
                  className="absolute inset-y-0 right-0 bg-pink-500"
                  style={{ width: `${genderRatio.female}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Training info */}
          <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm">Training</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-400">Base EXP</span>
                <span className="font-mono font-semibold">{pokemon.base_experience || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-400">Growth</span>
                <span className="font-semibold capitalize">
                  {species.growth_rate?.name.replace(/-/g, ' ') || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-400">Egg Groups</span>
                <span className="font-semibold capitalize">
                  {species.egg_groups?.map(g => g.name).join(', ').replace(/-/g, ' ') || '—'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Forms selector if available */}
          {species.varieties && species.varieties.length > 1 && (
            <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-2">Forms</h3>
              <select 
                className="w-full p-2 bg-white dark:bg-stone-700 rounded"
                onChange={(e) => onFormChange?.(e.target.value)}
                value={pokemon.name}
              >
                {species.varieties.map(variety => (
                  <option key={variety.pokemon.name} value={variety.pokemon.name}>
                    {variety.pokemon.name.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default PokemonHeroSectionV2;