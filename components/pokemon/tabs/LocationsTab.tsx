import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokemon, PokemonSpecies, LocationAreaEncounterDetail } from '../../../types/api/pokemon';
import PokemonGlassCard from '../PokemonGlassCard';
import { cn } from '../../../utils/cn';
import { FaGamepad } from 'react-icons/fa';
import { getAnimationProps, UI_ANIMATION_SETS } from '../../../utils/standardizedAnimations';

interface LocationsTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  locationEncounters?: LocationAreaEncounterDetail[];
  typeColors: any;
}

interface GameLocation {
  game: string;
  generation: number;
  locations: {
    area: string;
    method: string;
    conditions: string[];
    chance: number;
    minLevel: number;
    maxLevel: number;
  }[];
}

const GAME_GENERATION_MAP: Record<string, number> = {
  'red': 1, 'blue': 1, 'yellow': 1,
  'gold': 2, 'silver': 2, 'crystal': 2,
  'ruby': 3, 'sapphire': 3, 'emerald': 3, 'firered': 3, 'leafgreen': 3,
  'diamond': 4, 'pearl': 4, 'platinum': 4, 'heartgold': 4, 'soulsilver': 4,
  'black': 5, 'white': 5, 'black-2': 5, 'white-2': 5,
  'x': 6, 'y': 6, 'omega-ruby': 6, 'alpha-sapphire': 6,
  'sun': 7, 'moon': 7, 'ultra-sun': 7, 'ultra-moon': 7, 'lets-go-pikachu': 7, 'lets-go-eevee': 7,
  'sword': 8, 'shield': 8, 'brilliant-diamond': 8, 'shining-pearl': 8, 'legends-arceus': 8,
  'scarlet': 9, 'violet': 9
};


// Map game versions to console types
const GAME_CONSOLE_MAP: Record<string, string> = {
  'red': 'gameboy', 'blue': 'gameboy', 'yellow': 'gameboy',
  'gold': 'gameboy-color', 'silver': 'gameboy-color', 'crystal': 'gameboy-color',
  'ruby': 'gameboy-advance', 'sapphire': 'gameboy-advance', 'emerald': 'gameboy-advance',
  'firered': 'gameboy-advance', 'leafgreen': 'gameboy-advance',
  'diamond': 'ds', 'pearl': 'ds', 'platinum': 'ds',
  'heartgold': 'ds', 'soulsilver': 'ds',
  'black': 'ds', 'white': 'ds', 'black-2': 'ds', 'white-2': 'ds',
  'x': '3ds', 'y': '3ds',
  'omega-ruby': '3ds', 'alpha-sapphire': '3ds',
  'sun': '3ds', 'moon': '3ds', 'ultra-sun': '3ds', 'ultra-moon': '3ds',
  'lets-go-pikachu': 'switch', 'lets-go-eevee': 'switch',
  'sword': 'switch', 'shield': 'switch',
  'legends-arceus': 'switch',
  'scarlet': 'switch', 'violet': 'switch'
};

// Generation info with proper naming format
const GENERATION_INFO = [
  { gen: '', region: '', colors: '' }, // 0 (unused)
  { gen: 'Gen 1', region: 'Kanto Region', colors: 'from-red-500 to-blue-500' },
  { gen: 'Gen 2', region: 'Johto Region', colors: 'from-yellow-500 to-silver-500' },
  { gen: 'Gen 3', region: 'Hoenn Region', colors: 'from-red-500 to-green-500' },
  { gen: 'Gen 4', region: 'Sinnoh Region', colors: 'from-blue-600 to-pink-500' },
  { gen: 'Gen 5', region: 'Unova Region', colors: 'from-gray-800 to-gray-600' },
  { gen: 'Gen 6', region: 'Kalos Region', colors: 'from-blue-500 to-red-500' },
  { gen: 'Gen 7', region: 'Alola Region', colors: 'from-orange-500 to-blue-500' },
  { gen: 'Gen 8', region: 'Galar Region', colors: 'from-blue-600 to-purple-600' },
  { gen: 'Gen 9', region: 'Paldea Region', colors: 'from-red-600 to-violet-600' }
];

// Console-specific icon mapping with distinct colors
const getConsoleIcon = (console: string): React.ReactNode => {
  switch (console) {
    case 'gameboy':
      return <FaGamepad className="text-green-600" title="Game Boy" />;
    case 'gameboy-color':
      return <FaGamepad className="text-purple-600" title="Game Boy Color" />;
    case 'gameboy-advance':
      return <FaGamepad className="text-blue-600" title="Game Boy Advance" />;
    case 'ds':
      return <FaGamepad className="text-gray-700" title="Nintendo DS" />;
    case '3ds':
      return <FaGamepad className="text-red-600" title="Nintendo 3DS" />;
    case 'switch':
      return <FaGamepad className="text-red-500" title="Nintendo Switch" />;
    default:
      return <FaGamepad className="text-gray-600" />;
  }
};

const LocationsTab: React.FC<LocationsTabProps> = ({ pokemon, species, locationEncounters = [], typeColors }) => {
  // Early return if no data to prevent processing errors
  if (!pokemon || !species) {
    return (
      <PokemonGlassCard className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Loading location data...</p>
      </PokemonGlassCard>
    );
  }
  
  // Safety check for locationEncounters
  const safeLocationEncounters = Array.isArray(locationEncounters) ? locationEncounters : [];
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [selectedConsole, setSelectedConsole] = useState<string | null>(null);
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  // Process location encounters by game
  const gameLocations = useMemo(() => {
    const locations: Record<string, GameLocation> = {};
    
    safeLocationEncounters.forEach(encounter => {
      encounter.version_details.forEach(versionDetail => {
        const gameName = versionDetail.version.name;
        const generation = GAME_GENERATION_MAP[gameName] || 0;
        
        if (!locations[gameName]) {
          locations[gameName] = {
            game: gameName,
            generation,
            locations: []
          };
        }
        
        versionDetail.encounter_details.forEach(detail => {
          locations[gameName].locations.push({
            area: encounter.location_area.name.replace(/-/g, ' '),
            method: detail.method.name.replace(/-/g, ' '),
            conditions: detail.condition_values.map(c => c.name.replace(/-/g, ' ')),
            chance: detail.chance,
            minLevel: detail.min_level,
            maxLevel: detail.max_level
          });
        });
      });
    });
    
    // Sort by generation and game name
    return Object.values(locations).sort((a, b) => {
      if (a.generation !== b.generation) return b.generation - a.generation;
      return a.game.localeCompare(b.game);
    });
  }, [safeLocationEncounters]);

  // Group locations by generation
  const locationsByGeneration = useMemo(() => {
    const grouped: Record<number, GameLocation[]> = {};
    gameLocations.forEach(loc => {
      if (!grouped[loc.generation]) grouped[loc.generation] = [];
      grouped[loc.generation].push(loc);
    });
    return grouped;
  }, [gameLocations]);

  // Get unique consoles from games
  const availableConsoles = useMemo(() => {
    const consoles = new Set<string>();
    gameLocations.forEach(game => {
      const console = GAME_CONSOLE_MAP[game.game];
      if (console) consoles.add(console);
    });
    return Array.from(consoles);
  }, [gameLocations]);

  // Filter games by console if selected
  const filteredGameLocations = useMemo(() => {
    if (!selectedConsole) return gameLocations;
    return gameLocations.filter(game => GAME_CONSOLE_MAP[game.game] === selectedConsole);
  }, [gameLocations, selectedConsole]);

  // Group filtered locations by generation
  const filteredLocationsByGeneration = useMemo(() => {
    const grouped: Record<number, GameLocation[]> = {};
    filteredGameLocations.forEach(loc => {
      if (!grouped[loc.generation]) grouped[loc.generation] = [];
      grouped[loc.generation].push(loc);
    });
    return grouped;
  }, [filteredGameLocations]);

  // Get habitat info
  const habitat = species.habitat ? species.habitat.name.replace(/-/g, ' ') : null;

  return (
    <div className="space-y-6">
      {/* Habitat Info */}
      {habitat && (
        <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Natural Habitat</h3>
            <span className={cn(
              "px-4 py-2 rounded-full text-sm font-medium",
              "bg-gradient-to-r text-white",
              typeColors.from,
              typeColors.to
            )}>
              {habitat.charAt(0).toUpperCase() + habitat.slice(1)}
            </span>
          </div>
        </PokemonGlassCard>
      )}

      {/* Filters */}
      {gameLocations.length > 0 && (
        <div className="space-y-4">
          {/* Era Filter */}
          <PokemonGlassCard variant="stat" pokemonTypes={pokemon.types}>
            <h4 className="text-lg font-bold mb-4">Filter by Era</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {setSelectedGeneration(null); setSelectedConsole(null);}}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  selectedGeneration === null && selectedConsole === null
                    ? "bg-gradient-to-r text-white " + typeColors.from + " " + typeColors.to
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              >
                All Eras
              </button>
              {Object.keys(locationsByGeneration).sort((a, b) => Number(b) - Number(a)).map(gen => (
                <button
                  key={gen}
                  onClick={() => {setSelectedGeneration(Number(gen)); setSelectedConsole(null);}}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    selectedGeneration === Number(gen)
                      ? "bg-gradient-to-r text-white " + (GENERATION_INFO[Number(gen)]?.colors || 'from-gray-500 to-gray-600')
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  )}
                >
                  ({GENERATION_INFO[Number(gen)]?.gen || `Gen ${gen}`})
                </button>
              ))}
            </div>
          </PokemonGlassCard>

          {/* Console Filter */}
          {availableConsoles.length > 1 && (
            <PokemonGlassCard variant="stat" pokemonTypes={pokemon.types}>
              <h4 className="text-lg font-bold mb-4">Filter by Console</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedConsole(null)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                    selectedConsole === null
                      ? "bg-gradient-to-r text-white " + typeColors.from + " " + typeColors.to
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  )}
                >
                  <FaGamepad />
                  All Consoles
                </button>
                {availableConsoles.map(console => (
                  <button
                    key={console}
                    onClick={() => {setSelectedConsole(console); setSelectedGeneration(null);}}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                      selectedConsole === console
                        ? "bg-gradient-to-r text-white " + typeColors.from + " " + typeColors.to
                        : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    )}
                  >
                    {getConsoleIcon(console)}
                    {console.charAt(0).toUpperCase() + console.slice(1).replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </PokemonGlassCard>
          )}
        </div>
      )}

      {/* Location Encounters */}
      {gameLocations.length > 0 ? (
        <div className="space-y-4">
          {/* Info message about data availability */}
          <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
            <div className="flex items-start gap-3">
              <div className="text-blue-500 mt-1">
                <FaGamepad className="text-lg" />
              </div>
              <div className="text-sm">
                <p className="text-gray-700 dark:text-gray-300 mb-1">
                  <strong>Location data available for generations 1-7.</strong>
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  Gen 8-9 games (Sword/Shield, Scarlet/Violet) have limited wild encounter data in the Pokémon API due to different gameplay mechanics.
                </p>
              </div>
            </div>
          </PokemonGlassCard>
          
          <AnimatePresence mode="wait">
            {Object.entries(selectedConsole || selectedGeneration !== null ? filteredLocationsByGeneration : locationsByGeneration)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([generation, games]) => {
                if (selectedGeneration !== null && Number(generation) !== selectedGeneration) {
                  return null;
                }
                
                return (
                  <motion.div
                    key={generation}
                    {...getAnimationProps('slideUp')}
                    className="space-y-3"
                  >
                    <h3 className="text-lg font-bold flex items-center gap-3">
                      <span className={cn(
                        "px-4 py-2 rounded-full text-sm text-white bg-gradient-to-r flex items-center gap-2",
                        GENERATION_INFO[Number(generation)]?.colors || 'from-gray-500 to-gray-600'
                      )}>
                        <span className="text-lg">
                          <FaGamepad />
                        </span>
                        ({GENERATION_INFO[Number(generation)]?.gen || `Gen ${generation}`})
                      </span>
                      <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
                        {GENERATION_INFO[Number(generation)]?.region || 'Unknown Region'}
                      </span>
                    </h3>
                    
                    {games.map(game => (
                      <motion.div key={game.game} {...UI_ANIMATION_SETS.card}>
                        <PokemonGlassCard 
                          variant="default" 
                          pokemonTypes={pokemon.types}
                          className="cursor-pointer"
                          onClick={() => setExpandedGame(expandedGame === game.game ? null : game.game)}
                        >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">
                                {getConsoleIcon(GAME_CONSOLE_MAP[game.game] || 'gameboy')}
                              </span>
                              <div>
                                <h4 className="font-semibold capitalize">
                                  Pokémon {game.game ? game.game.split('-').map(w => 
                                    w.charAt(0).toUpperCase() + w.slice(1)
                                  ).join(' ') : 'Unknown Game'}
                                </h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                  {game.game ? (GAME_CONSOLE_MAP[game.game] || 'gameboy').replace(/-/g, ' ') : 'gameboy'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {game.locations.length} location{game.locations.length !== 1 ? 's' : ''}
                              </span>
                              <motion.svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                animate={{ rotate: expandedGame === game.game ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </motion.svg>
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {expandedGame === game.game && (
                              <motion.div
                                {...getAnimationProps('slideDown')}
                                className="overflow-hidden"
                              >
                                <div className="pt-3 space-y-2">
                                  {game.locations.map((loc, idx) => (
                                    <motion.div
                                      key={`${loc.area}-${idx}`}
                                      {...getAnimationProps('staggerItem', { delay: idx * 0.05 })}
                                      className={cn(
                                        "p-3 rounded-lg",
                                        "bg-gray-100 dark:bg-gray-800"
                                      )}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                          <h5 className="font-medium capitalize">
                                            {loc.area}
                                          </h5>
                                          <div className="flex flex-wrap gap-2 text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">
                                              Method: <span className="capitalize">{loc.method}</span>
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                              Level: {loc.minLevel}{loc.maxLevel !== loc.minLevel && `-${loc.maxLevel}`}
                                            </span>
                                            {loc.chance < 100 && (
                                              <span className="text-gray-600 dark:text-gray-400">
                                                Chance: {loc.chance}%
                                              </span>
                                            )}
                                          </div>
                                          {loc.conditions.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                              {loc.conditions.map(condition => (
                                                <span
                                                  key={condition}
                                                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs capitalize"
                                                >
                                                  {condition}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        </PokemonGlassCard>
                      </motion.div>
                    ))}
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      ) : (
        <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
          <div className="text-center py-8 space-y-4">
            <div className="text-4xl mb-4">
              <FaGamepad className="text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">
              No Location Data Available
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                This Pokémon doesn't have wild encounter location data in our database.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Why is this happening?
                </h4>
                <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs list-disc list-inside">
                  <li><strong>Gen 8-9 limitations:</strong> Newer games (Sword/Shield, Scarlet/Violet) have limited location data in the Pokémon API</li>
                  <li><strong>Starter Pokémon:</strong> Usually obtained as gifts rather than wild encounters</li>
                  <li><strong>Legendary/Mythical:</strong> Often found through special events or story encounters</li>
                  <li><strong>Evolution-only:</strong> Some Pokémon can only be obtained by evolving others</li>
                </ul>
              </div>
              <p className="text-gray-500 dark:text-gray-500 text-xs">
                Try checking the <strong>Evolution</strong> or <strong>Breeding</strong> tabs for alternative methods to obtain this Pokémon.
              </p>
            </div>
          </div>
        </PokemonGlassCard>
      )}
    </div>
  );
};

export default LocationsTab;