import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { Pokemon, PokemonSpecies } from "../../types/pokemon";
import { TypeBadge } from '../ui/TypeBadge';
import { GlassContainer } from '../ui/design-system';
import { getTypeUIColors } from '../../utils/pokemonTypeGradients';
import { calculateCatchRate, calculateGenderRatio, getStatColor } from '../../utils/pokemonDetailUtils';
import { cn } from '../../utils/cn';
import { FaStar, FaRuler, FaWeight, FaMars, FaVenus, FaHeart, FaTag } from 'react-icons/fa';
import { useFavorites } from '../../hooks/useUnifiedApp';
import PokemonFormSelector from './PokemonFormSelector';

interface PokemonHeroSectionV3Props {
  pokemon: Pokemon;
  species: PokemonSpecies;
  showShiny: boolean;
  onShinyToggle: () => void;
  onFormChange?: (formId: string) => void;
}

const PokemonHeroSectionV3: React.FC<PokemonHeroSectionV3Props> = ({
  pokemon,
  species,
  showShiny,
  onShinyToggle,
  onFormChange
}) => {
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  
  // Check if this Pokemon is already favorited
  const isFavorited = favorites.pokemon?.some((fav: { id: string }) => fav.id === pokemon.id.toString());
  
  // Safety check - return early if essential data is missing
  if (!pokemon || !species) {
    return (
      <div className="w-full">
        <div className="relative overflow-hidden p-6 md:p-8 bg-gray-100/80 dark:bg-gray-900/40 rounded-lg">
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Loading Pokémon data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Get type colors for theming
  const typeColors = getTypeUIColors(pokemon.types || []);
  
  // Calculate stats
  const stats = pokemon.stats || [];
  const totalStats = stats.reduce((sum, stat) => sum + (stat?.base_stat || 0), 0);
  const catchRate = calculateCatchRate(species?.capture_rate || 45);
  const genderRatio = calculateGenderRatio(species?.gender_rate || 4);
  
  // Get sprite URL
  const getSpriteUrl = () => {
    if (showShiny && pokemon.sprites?.other?.['official-artwork']?.front_shiny) {
      return pokemon.sprites.other['official-artwork'].front_shiny;
    }
    return pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default || '';
  };
  
  // Format height and weight
  const formatHeight = (height: number) => {
    const meters = height / 10;
    const feet = Math.floor(meters * 3.28084);
    const inches = Math.round((meters * 3.28084 - feet) * 12);
    return { meters: meters.toFixed(1), feet, inches };
  };
  
  const formatWeight = (weight: number) => {
    const kg = weight / 10;
    const lbs = (kg * 2.20462).toFixed(1);
    return { kg: kg.toFixed(1), lbs };
  };
  
  const height = formatHeight(pokemon.height || 0);
  const weight = formatWeight(pokemon.weight || 0);
  
  // Get generation
  const generationRoman = species?.generation?.name?.replace('generation-', '').toUpperCase() || 'I';
  
  // Roman to number mapping
  const ROMAN_TO_NUMBER: Record<string, string> = {
    'I': '1',
    'II': '2',
    'III': '3',
    'IV': '4',
    'V': '5',
    'VI': '6',
    'VII': '7',
    'VIII': '8',
    'IX': '9'
  };
  
  // Generation to region mapping
  const GENERATION_TO_REGION: Record<string, string> = {
    'I': 'Kanto',
    'II': 'Johto',
    'III': 'Hoenn',
    'IV': 'Sinnoh',
    'V': 'Unova',
    'VI': 'Kalos',
    'VII': 'Alola',
    'VIII': 'Galar',
    'IX': 'Paldea'
  };
  
  const generation = ROMAN_TO_NUMBER[generationRoman] || '1';
  const regionName = GENERATION_TO_REGION[generationRoman] || 'Unknown';
  
  // Format Pokemon display name properly
  const formatPokemonDisplayName = (pokemonName: string, speciesName?: string) => {
    if (!pokemonName) return '';
    
    // If it's the base form, just capitalize
    if (!pokemonName.includes('-') || pokemonName === speciesName) {
      return pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
    }
    
    // Extract base name and form suffix
    const baseName = speciesName || pokemonName.split('-')[0];
    const baseNameCapitalized = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    
    // Handle Mega forms
    if (pokemonName.includes('-mega')) {
      if (pokemonName.includes('-mega-x')) return `Mega ${baseNameCapitalized} X`;
      if (pokemonName.includes('-mega-y')) return `Mega ${baseNameCapitalized} Y`;
      return `Mega ${baseNameCapitalized}`;
    }
    
    // Handle Regional forms
    if (pokemonName.includes('-alola')) return `Alolan ${baseNameCapitalized}`;
    if (pokemonName.includes('-galar')) return `Galarian ${baseNameCapitalized}`;
    if (pokemonName.includes('-hisui')) return `Hisuian ${baseNameCapitalized}`;
    if (pokemonName.includes('-paldea')) return `Paldean ${baseNameCapitalized}`;
    
    // Handle Gigantamax
    if (pokemonName.includes('-gmax')) return `Gigantamax ${baseNameCapitalized}`;
    
    // Handle other specific forms
    const formPatterns: Record<string, string> = {
      '-origin': 'Origin Forme',
      '-therian': 'Therian Forme',
      '-incarnate': 'Incarnate Forme',
      '-sky': 'Sky Forme',
      '-land': 'Land Forme',
      '-blade': 'Blade Forme',
      '-shield': 'Shield Forme',
      '-school': 'School Form',
      '-solo': 'Solo Form',
      '-complete': 'Complete Forme',
      '-eternamax': 'Eternamax'
    };
    
    for (const [pattern, formName] of Object.entries(formPatterns)) {
      if (pokemonName.includes(pattern)) {
        return `${baseNameCapitalized} ${formName}`;
      }
    }
    
    // Special cases (Rotom, Castform, etc.)
    if (baseName === 'rotom') {
      const rotomForms: Record<string, string> = {
        'heat': 'Heat Rotom',
        'wash': 'Wash Rotom',
        'frost': 'Frost Rotom',
        'fan': 'Fan Rotom',
        'mow': 'Mow Rotom'
      };
      const formType = pokemonName.split('-')[1];
      return rotomForms[formType] || baseNameCapitalized;
    }
    
    if (baseName === 'castform') {
      const castformForms: Record<string, string> = {
        'sunny': 'Sunny Form Castform',
        'rainy': 'Rainy Form Castform',
        'snowy': 'Snowy Form Castform'
      };
      const formType = pokemonName.split('-')[1];
      return castformForms[formType] || baseNameCapitalized;
    }
    
    if (baseName === 'deoxys') {
      const deoxysForms: Record<string, string> = {
        'attack': 'Attack Forme Deoxys',
        'defense': 'Defense Forme Deoxys',
        'speed': 'Speed Forme Deoxys'
      };
      const formType = pokemonName.split('-')[1];
      return deoxysForms[formType] || baseNameCapitalized;
    }
    
    // Default: capitalize each part
    return pokemonName.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };
  
  // Prepare forms data - filter out unwanted forms
  const availableForms = species?.varieties?.filter(variety => {
    const name = variety.pokemon.name;
    const baseId = species.id.toString();
    
    // Skip cosmetic forms
    if (name.includes('totem') || 
        name.includes('cosplay') || 
        name.includes('cap') ||
        name.includes('starter')) {
      return false;
    }
    
    // Include default form and real alternate forms
    return variety.is_default || 
           name.includes('mega') || 
           name.includes('alola') || 
           name.includes('galar') || 
           name.includes('hisui') || 
           name.includes('paldea') ||
           name.includes('gmax') ||
           name.includes('rotom') ||
           name.includes('castform') ||
           name.includes('deoxys') ||
           name.includes('origin') ||
           name.includes('therian') ||
           name.includes('incarnate') ||
           name.includes('sky') ||
           name.includes('land') ||
           name.includes('blade') ||
           name.includes('shield') ||
           name.includes('school') ||
           name.includes('solo') ||
           name.includes('complete') ||
           name.includes('eternamax');
  }).map(variety => ({
    name: variety.pokemon.name,
    displayName: variety.pokemon.name,
    url: variety.pokemon.url,
    isDefault: variety.is_default
  })) || [];
  
  return (
    <div className="w-full">
      <GlassContainer variant="dark" className="relative overflow-hidden p-6 md:p-8 bg-gray-100/80 dark:bg-gray-900/40">
        {/* Subtle type gradient background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, ${typeColors.accent}, ${typeColors.animationAccent})`
          }}
        />
        
        {/* Content Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Pokemon Image and Basic Info */}
          <div className="flex flex-col items-center space-y-4 relative">
            {/* Action Buttons - Stacked vertically on left */}
            <div className="absolute -top-2 sm:-top-4 left-2 sm:left-4 flex flex-col gap-1 sm:gap-2 z-30">
              {/* Favorite Button */}
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const pokemonData = {
                    id: pokemon.id.toString(),
                    name: pokemon.name,
                    types: pokemon.types,
                    sprite: pokemon.sprites?.front_default || '',
                    stats: pokemon.stats
                  };
                  
                  if (isFavorited) {
                    removeFromFavorites('pokemon', pokemon.id.toString());
                  } else {
                    addToFavorites('pokemon', pokemonData);
                  }
                }}
                className={cn(
                  "p-2 sm:p-3 rounded-full backdrop-blur-md transition-all border cursor-pointer",
                  isFavorited 
                    ? "bg-red-500/20 text-red-400 border-red-400/30 hover:bg-red-500/30" 
                    : "bg-white/10 text-gray-400 border-white/20 hover:bg-red-500/20 hover:text-red-400 hover:border-red-400/30"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                type="button"
              >
                <FaHeart className={cn("w-4 h-4 sm:w-5 sm:h-5 pointer-events-none", isFavorited && "fill-current")} />
              </motion.button>
              
              {/* Shiny Toggle */}
              <motion.button
                onClick={onShinyToggle}
                className={cn(
                  "p-2 sm:p-3 rounded-full backdrop-blur-md transition-all",
                  showShiny 
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30" 
                    : "bg-white/10 text-gray-400 border border-white/20 hover:bg-white/20"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaStar className={cn("w-4 h-4 sm:w-5 sm:h-5", showShiny && "drop-shadow-glow")} />
              </motion.button>
            </div>
            
            {/* Pokemon Image with Glow */}
            <motion.div 
              className="relative w-[340px] h-[340px]"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div 
                className="absolute inset-0 rounded-full blur-3xl opacity-30 -z-10"
                style={{ background: typeColors.accent }}
              />
              {/* Pokemon Sprite - Single container for both regular and shiny */}
              <Image
                src={getSpriteUrl()}
                alt={`${pokemon.name}${showShiny ? ' shiny' : ''}`}
                fill
                className="drop-shadow-2xl object-contain"
                priority
                sizes="340px"
              />
            </motion.div>
            
            {/* Name and Types */}
            <div className="text-center space-y-3">
              <div>
                <motion.h1 
                  className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-wide transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  animate={{ 
                    y: [0, -2, 0],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {formatPokemonDisplayName(pokemon.name, species?.name)}
                </motion.h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {species.genera?.find(g => g.language.name === 'en')?.genus || 'Pokemon'}
                </p>
              </div>
              
              {/* Form Selector */}
              {availableForms.length > 1 && (
                <div className="flex justify-center mt-3 mb-3">
                  <PokemonFormSelector
                    forms={availableForms}
                    selectedForm={pokemon.name}
                    onFormChange={onFormChange || (() => {})}
                    typeColors={typeColors}
                  />
                </div>
              )}
              
              <div className="flex gap-2 justify-center">
                {pokemon.types?.map((type, index) => (
                  <TypeBadge key={index} type={type.type.name} size="lg" />
                ))}
              </div>
            </div>
          </div>
          
          {/* Right: Compact Stats Grid */}
          <div className="space-y-6">
            
            {/* Base Stats - Compact Bars */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Base Stats</h3>
              <div className="space-y-2">
                {stats.map((stat, index) => {
                  const percentage = (stat.base_stat / 255) * 100;
                  const statName = stat.stat.name.replace('-', ' ');
                  const statGradient = getStatColor(stat.stat.name, pokemon.types?.map(t => t.type.name));
                  
                  return (
                    <motion.div 
                      key={stat.stat.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 w-20 capitalize drop-shadow-sm">
                          {statName}
                        </span>
                        <div className="flex-1 relative">
                          <div className="h-3 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full overflow-hidden shadow-sm">
                            <motion.div
                              className={cn("h-full rounded-full bg-gradient-to-r relative overflow-hidden", statGradient)}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                              style={{
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.3)',
                              }}
                            >
                              {/* Smooth glass shine effect across entire bar */}
                              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10" />
                              {/* Subtle edge glow */}
                              <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </motion.div>
                          </div>
                        </div>
                        <span className="text-sm font-bold w-10 text-right text-gray-700 dark:text-gray-200 drop-shadow-sm">{stat.base_stat}</span>
                      </div>
                    </motion.div>
                  );
                })}
                
                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</span>
                  <span className="text-lg font-bold" style={{ color: typeColors.accent }}>{totalStats}</span>
                </div>
              </div>
            </div>
            
            {/* Additional Info Row - All in one container */}
            <div className="flex items-center justify-center mt-6">
              {/* Unified Stats Container */}
              <motion.div 
                className="relative rounded-2xl px-3 py-2 sm:px-6 sm:py-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 flex flex-wrap items-stretch gap-2 sm:gap-4 transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {/* Pokédex Number */}
                <div className="flex flex-col items-center justify-between min-w-[60px] sm:min-w-[80px]">
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 sm:mb-2">Pokédex #</span>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                      {String(pokemon.id).padStart(3, '0')}
                    </span>
                  </div>
                </div>
                
                {/* Vertical Divider */}
                <div className="hidden sm:block w-px bg-gray-300 dark:bg-gray-600 self-stretch"></div>
                
                {/* Height and Weight - Stacked with Label */}
                <div className="flex flex-col items-center justify-between min-w-[50px] sm:min-w-[60px]">
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 sm:mb-2">Size</span>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1">
                        <FaRuler className="w-3 h-3 text-blue-500 drop-shadow-sm" />
                        <span className="text-xs sm:text-sm font-bold">{height.meters}m</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <FaWeight className="w-3 h-3 text-purple-500 drop-shadow-sm" />
                        <span className="text-xs sm:text-sm font-bold">{weight.kg}kg</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Vertical Divider */}
                <div className="hidden sm:block w-px bg-gray-300 dark:bg-gray-600 self-stretch"></div>
                
                {/* Capture Rate with Label */}
                <div className="flex flex-col items-center justify-between min-w-[60px] sm:min-w-[80px]">
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 sm:mb-2">Capture</span>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                        <svg viewBox="0 0 40 40" className="w-full h-full">
                          <circle cx="20" cy="20" r="15" fill="white" stroke="#374151" strokeWidth="2" />
                          <path d={`M 5 20 A 15 15 0 0 1 35 20`} fill="#dc2626" stroke="none" />
                          <path
                            d={`M 5 20 A 15 15 0 0 1 ${20 + 15 * Math.cos(Math.PI - (catchRate.percentage / 100) * Math.PI)} ${20 - 15 * Math.sin(Math.PI - (catchRate.percentage / 100) * Math.PI)}`}
                            fill="none"
                            stroke="#7f1d1d"
                            strokeWidth="2"
                            className="transition-all duration-700"
                          />
                          <rect x="5" y="19" width="30" height="2" fill="#374151" />
                          <circle cx="20" cy="20" r="5" fill="white" stroke="#374151" strokeWidth="2" />
                          <circle cx="20" cy="20" r="2" fill="#374151" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">{catchRate.percentage}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Vertical Divider */}
                <div className="hidden sm:block w-px bg-gray-300 dark:bg-gray-600 self-stretch"></div>
                
                {/* Gender Ratio with Label */}
                <div className="flex flex-col items-center justify-between min-w-[70px] sm:min-w-[100px]">
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 sm:mb-2">Gender</span>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-1">
                      {genderRatio.genderless ? (
                        <span className="text-gray-500 text-xs sm:text-sm font-semibold">Genderless</span>
                      ) : (
                        <>
                          <FaMars className="text-blue-500 w-3 h-3 sm:w-4 sm:h-4 drop-shadow-sm" />
                          <span className="font-bold text-xs sm:text-sm">{genderRatio.male}%</span>
                          <span className="text-gray-400 text-xs sm:text-sm">/</span>
                          <FaVenus className="text-pink-500 w-3 h-3 sm:w-4 sm:h-4 drop-shadow-sm" />
                          <span className="font-bold text-xs sm:text-sm">{genderRatio.female}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Vertical Divider */}
                <div className="hidden sm:block w-px bg-gray-300 dark:bg-gray-600 self-stretch"></div>
                
                {/* Generation Badge with Label */}
                <div className="flex flex-col items-center justify-between min-w-[80px] sm:min-w-[120px]">
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 sm:mb-2">Region</span>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs sm:text-sm font-bold shadow-sm">
                      {regionName} (Gen {generation})
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </GlassContainer>
    </div>
  );
};

export default PokemonHeroSectionV3;