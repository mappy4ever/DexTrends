import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokemon, PokemonSpecies } from "../../types/pokemon";
import { TypeBadge } from '../ui/TypeBadge';
import PokemonGlassCard from './PokemonGlassCard';
import { getTypeUIColors, getTypeRingGradient } from '../../utils/pokemonTypeGradients';
import { calculateCatchRate, calculateGenderRatio } from '../../utils/pokemonDetailUtils';
import { CircularButton } from '../ui/design-system';
import { useFavorites } from '../../context/UnifiedAppContext';
import { cn } from '../../utils/cn';
import { FaHeart, FaRegHeart, FaShare, FaStar } from 'react-icons/fa';
import TypeEffectivenessChart from './TypeEffectivenessChart';
import ShareMenu from '../ui/ShareMenu';
import { sharePokemon } from '../../utils/shareUtils';

interface PokemonHeroSectionProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  showShiny: boolean;
  onShinyToggle: () => void;
  onFormChange?: (formId: string) => void;
}

const PokemonHeroSection: React.FC<PokemonHeroSectionProps> = ({
  pokemon,
  species,
  showShiny,
  onShinyToggle,
  onFormChange
}) => {
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const [imageLoading, setImageLoading] = useState(true);
  
  // Get type colors for subtle theming
  const typeColors = getTypeUIColors(pokemon.types || []);
  const ringGradient = getTypeRingGradient(pokemon.types || []);
  
  // Calculate stats
  const totalStats = pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0;
  const catchRate = calculateCatchRate(species.capture_rate);
  const genderRatio = calculateGenderRatio(species.gender_rate);
  
  // Check if favorited
  const isFavorite = favorites.pokemon.some((p: Pokemon) => p.id === pokemon.id);
  
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
    if (!species.generation) return 'Generation I';
    const genMatch = species.generation.name.match(/generation-(.+)/);
    if (genMatch) {
      const romanNumerals: Record<string, string> = {
        'i': 'I', 'ii': 'II', 'iii': 'III', 'iv': 'IV',
        'v': 'V', 'vi': 'VI', 'vii': 'VII', 'viii': 'VIII', 'ix': 'IX'
      };
      return `Generation ${romanNumerals[genMatch[1]] || 'I'}`;
    }
    return 'Generation I';
  };
  
  return (
    <div className="relative">
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left: Pokemon Display */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Classic portrait frame */}
            <div className="relative w-80 h-80 mx-auto">
              {/* Elegant double border frame */}
              <div className="absolute inset-0 rounded-full border-2 border-gray-300 dark:border-gray-600" />
              <div className="absolute inset-2 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl">
                {/* Type-colored accent - static, subtle */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${ringGradient} opacity-10`} />
                
                {/* Clean white inner area */}
                <div className="absolute inset-4 rounded-full bg-white dark:bg-gray-900 shadow-inner">
                  {/* Pokemon image container */}
                  <div className="relative w-full h-full rounded-full bg-gray-50 dark:bg-gray-800 overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={`${pokemon.id}-${showShiny}`}
                        src={getSpriteUrl()}
                        alt={pokemon.name}
                        className="absolute inset-0 w-full h-full object-contain p-6"
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
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                {/* Shiny toggle */}
                {pokemon.sprites?.other?.['official-artwork']?.front_shiny && (
                  <CircularButton
                    size="icon"
                    variant={showShiny ? 'primary' : 'secondary'}
                    onClick={onShinyToggle}
                    className="shadow-lg"
                    title="Toggle shiny form"
                  >
                    <FaStar className={showShiny ? 'text-yellow-400' : ''} />
                  </CircularButton>
                )}
                
                {/* Forms button */}
                {species.varieties && species.varieties.length > 1 && (
                  <CircularButton
                    size="icon"
                    variant="secondary"
                    onClick={() => {/* Open forms modal */}}
                    className="shadow-lg"
                    title="View forms"
                  >
                    <span className="text-lg">🔄</span>
                  </CircularButton>
                )}
              </div>
              
              {/* Classic nameplate style for Legendary/Mythical */}
              {(species.is_legendary || species.is_mythical) && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-b from-amber-200 to-amber-300 dark:from-amber-700 dark:to-amber-800 px-6 py-2 rounded-md shadow-lg border border-amber-400 dark:border-amber-600">
                    <span className="text-xs font-serif tracking-widest text-amber-900 dark:text-amber-100 uppercase">
                      {species.is_legendary ? 'Legendary' : 'Mythical'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right: Pokemon Info */}
        <div className="space-y-6">
          {/* Name and basic info */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-serif capitalize mb-3 tracking-wide" data-testid="pokemon-name">
              {pokemon.name.replace(/-/g, ' ')}
            </h1>
            <p className="text-xl uppercase tracking-widest text-gray-600 dark:text-gray-300 mb-4" data-testid="pokemon-genus">
              {species.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown Pokémon'}
            </p>
            
            {/* Types */}
            <div className="flex justify-center lg:justify-start gap-2 mb-4">
              {pokemon.types?.map(typeInfo => (
                <TypeBadge key={typeInfo.slot} type={typeInfo.type.name} size="lg" />
              ))}
            </div>
            
            {/* Quick info */}
            <div className="flex justify-center lg:justify-start gap-8 text-base">
              <div>
                <span className="text-gray-600 dark:text-gray-400 font-medium">Height:</span>{' '}
                <span className="font-bold text-lg">{((pokemon.height || 0) / 10).toFixed(1)}m</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400 font-medium">Weight:</span>{' '}
                <span className="font-bold text-lg">{((pokemon.weight || 0) / 10).toFixed(1)}kg</span>
              </div>
            </div>
          </div>
          
          {/* Classic two-column info layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Pokedex Data */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Pokédex Data
              </h3>
              <dl className="space-y-3">
                <div className="flex justify-between items-center">
                  <dt className="text-sm text-gray-600 dark:text-gray-400">National №</dt>
                  <dd className="font-mono font-semibold text-base" data-testid="pokemon-number">
                    #{String(pokemon.id).padStart(4, '0')}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Type</dt>
                  <dd className="flex gap-2">
                    {pokemon.types?.map(typeInfo => (
                      <TypeBadge key={typeInfo.slot} type={typeInfo.type.name} size="sm" />
                    ))}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Species</dt>
                  <dd className="font-semibold text-sm">
                    {species.genera?.find(g => g.language.name === 'en')?.genus?.replace(' Pokémon', '') || 'Unknown'}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Generation</dt>
                  <dd className="font-semibold text-sm">{getGenerationText()}</dd>
                </div>
              </dl>
            </div>
            
            {/* Right: Training Data */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Training Data
              </h3>
              <dl className="space-y-3">
                <div className="flex justify-between items-center">
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Base Stats</dt>
                  <dd className="font-mono font-semibold text-base">{totalStats}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Catch Rate</dt>
                  <dd className={cn("font-mono font-semibold text-base", catchRate.color)}>
                    {catchRate.percentage.toFixed(0)}%
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Base Exp.</dt>
                  <dd className="font-mono font-semibold text-base">
                    {pokemon.base_experience || '—'}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</dt>
                  <dd className="font-semibold text-sm capitalize">
                    {species.growth_rate?.name.replace(/-/g, ' ') || '—'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Gender Ratio */}
          {!genderRatio.genderless && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Gender Ratio
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-blue-700 dark:text-blue-400 text-xl font-bold flex items-center gap-2">
                    ♂ {genderRatio.male.toFixed(1)}%
                  </span>
                  <span className="text-pink-700 dark:text-pink-400 text-xl font-bold flex items-center gap-2">
                    {genderRatio.female.toFixed(1)}% ♀
                  </span>
                </div>
                <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-500"
                    style={{ width: `${genderRatio.male}%` }}
                  />
                  <div 
                    className="absolute inset-y-0 right-0 bg-gradient-to-l from-pink-600 to-pink-500"
                    style={{ width: `${genderRatio.female}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-1 h-full bg-white/30" style={{ marginLeft: `${genderRatio.male}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Type Effectiveness */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Type Effectiveness
            </h3>
            <TypeEffectivenessChart types={pokemon.types || []} variant="compact" />
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3 justify-center lg:justify-start">
            <CircularButton
              variant={isFavorite ? 'primary' : 'secondary'}
              onClick={() => {
                if (isFavorite) {
                  removeFromFavorites('pokemon', pokemon.id);
                } else {
                  addToFavorites('pokemon', pokemon);
                }
              }}
              leftIcon={isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            >
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </CircularButton>
            
            <ShareMenu
              onShare={(method) => sharePokemon(pokemon, method)}
              trigger={
                <CircularButton
                  variant="secondary"
                  leftIcon={<FaShare />}
                >
                  Share
                </CircularButton>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonHeroSection;