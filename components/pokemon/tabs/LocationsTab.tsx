import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokemon, PokemonSpecies, LocationAreaEncounterDetail } from "../../../types/pokemon";
import { GlassContainer } from '../../ui/glass-components';
import { cn } from '../../../utils/cn';
import { 
  FaGamepad, FaMapMarkerAlt, FaGlobeAmericas, FaFilter,
  FaTree
} from 'react-icons/fa';

// Animation helper
const getAnimationProps = (_variant: string, delay: number = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay }
});

interface LocationsTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  locationEncounters?: LocationAreaEncounterDetail[];
  typeColors?: Record<string, unknown>;
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
  // Hooks must be called before any conditional returns
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [selectedConsole, setSelectedConsole] = useState<string | null>(null);
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  
  // Safety check for locationEncounters
  const safeLocationEncounters = useMemo(() => 
    Array.isArray(locationEncounters) ? locationEncounters : [], 
    [locationEncounters]
  );

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
  const habitat = species?.habitat ? species.habitat.name.replace(/-/g, ' ') : null;

  // Early return if no data to prevent processing errors
  if (!pokemon || !species) {
    return (
      <GlassContainer 
        variant="dark" 
        className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl p-8 text-center"
        animate={false}
      >
        <p className="text-gray-500 dark:text-gray-400">Loading location data...</p>
      </GlassContainer>
    );
  }

  return (
    <div className="space-y-4">
      {/* Consolidated Filters */}
      {(habitat || gameLocations.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassContainer 
            variant="dark" 
            className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
            animate={false}
          >
            <div className="p-4 md:p-6 space-y-4">
              {/* Habitat */}
              {habitat && (
                <div className="flex items-center gap-3">
                  <FaTree className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Natural Habitat:</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-green-600 text-white">
                    {habitat.charAt(0).toUpperCase() + habitat.slice(1)}
                  </span>
                </div>
              )}
              
              {/* Era Filter */}
              {gameLocations.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FaFilter className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Filter by Era</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => {setSelectedGeneration(null); setSelectedConsole(null);}}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                        "transform hover:scale-[1.02] active:scale-[0.98]",
                        selectedGeneration === null && selectedConsole === null
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                          : "bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/20"
                      )}
                    >
                      All
                    </button>
                    {Object.keys(locationsByGeneration).sort((a, b) => Number(b) - Number(a)).map(gen => (
                      <button
                        key={gen}
                        onClick={() => {setSelectedGeneration(Number(gen)); setSelectedConsole(null);}}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                          "transform hover:scale-[1.02] active:scale-[0.98]",
                          selectedGeneration === Number(gen)
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                            : "bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/20"
                        )}
                      >
                        {GENERATION_INFO[Number(gen)]?.gen || `Gen ${gen}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Console Filter */}
              {availableConsoles.length > 1 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FaGamepad className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Filter by Console</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['3ds', 'ds', 'gameboy-advance', 'gameboy-color', 'gameboy'].map(console => {
                      if (!availableConsoles.includes(console)) return null;
                      return (
                        <button
                          key={console}
                          onClick={() => {setSelectedConsole(selectedConsole === console ? null : console); setSelectedGeneration(null);}}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5",
                            "transform hover:scale-[1.02] active:scale-[0.98]",
                            selectedConsole === console
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                              : "bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/20"
                          )}
                        >
                          {getConsoleIcon(console)}
                          <span className="capitalize">
                            {console === '3ds' ? '3DS' : 
                             console === 'ds' ? 'DS' : 
                             console === 'gameboy' ? 'GB' :
                             console === 'gameboy-color' ? 'GBC' :
                             console === 'gameboy-advance' ? 'GBA' : console}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </GlassContainer>
        </motion.div>
      )}

      {/* Info Banner */}
      {gameLocations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
            <FaGamepad className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Location data available for generations 1-7. Gen 8-9 games (Sword/Shield, Scarlet/Violet) have limited wild encounter data in the Pokémon API due to different gameplay mechanics.
            </p>
          </div>
        </motion.div>
      )}

      {/* Location Encounters */}
      {gameLocations.length > 0 ? (
        <div className="space-y-4">
          
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
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r",
                        GENERATION_INFO[Number(generation)]?.colors || 'from-gray-500 to-gray-600'
                      )}>
                        {GENERATION_INFO[Number(generation)]?.gen || `Gen ${generation}`}
                      </span>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {GENERATION_INFO[Number(generation)]?.region || 'Unknown Region'}
                      </span>
                    </h3>
                    
                    {games.map(game => (
                      <motion.div 
                        key={game.game}
                        className="group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                        <div 
                          className="bg-white dark:bg-gray-900/50 rounded-lg p-3 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow transition-all duration-300 cursor-pointer hover:shadow-md"
                          onClick={() => setExpandedGame(expandedGame === game.game ? null : game.game)}
                        >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {getConsoleIcon(GAME_CONSOLE_MAP[game.game] || 'gameboy')}
                              </span>
                              <h4 className="text-sm font-medium capitalize">
                                {game.game ? game.game.split('-').map(w => 
                                  w.charAt(0).toUpperCase() + w.slice(1)
                                ).join(' ') : 'Unknown Game'}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {game.locations.length} loc{game.locations.length !== 1 ? 's' : ''}
                              </span>
                              <motion.svg
                                className="w-4 h-4 text-gray-400"
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
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-2 space-y-1.5">
                                  {game.locations.map((loc, idx) => (
                                    <motion.div
                                      key={`${loc.area}-${idx}`}
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: idx * 0.03 }}
                                      className="p-2 rounded bg-gray-100 dark:bg-gray-800"
                                    >
                                      <div className="space-y-1">
                                        <h5 className="text-xs font-medium capitalize">
                                          {loc.area}
                                        </h5>
                                        <div className="flex flex-wrap gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                                          <span>Method: <span className="capitalize">{loc.method}</span></span>
                                          <span>Lv. {loc.minLevel}{loc.maxLevel !== loc.minLevel && `-${loc.maxLevel}`}</span>
                                          {loc.chance < 100 && (
                                            <span>{loc.chance}%</span>
                                          )}
                                        </div>
                                        {loc.conditions.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {loc.conditions.map(condition => (
                                              <span
                                                key={condition}
                                                className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] capitalize"
                                              >
                                                {condition}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassContainer 
            variant="dark" 
            className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
            animate={false}
          >
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <FaGamepad className="text-2xl text-gray-400" />
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  No Location Data Available
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This Pokémon doesn't have wild encounter location data in our database.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Common reasons:</p>
                <ul className="text-[11px] text-blue-600 dark:text-blue-400 space-y-0.5 list-disc list-inside">
                  <li>Gen 8-9 games have limited location data in the API</li>
                  <li>Starter Pokémon are obtained as gifts</li>
                  <li>Legendary/Mythical found through special events</li>
                  <li>Evolution-only Pokémon</li>
                </ul>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-500">
                Check the Evolution or Breeding tabs for alternative methods to obtain this Pokémon.
              </p>
            </div>
          </GlassContainer>
        </motion.div>
      )}
    </div>
  );
};

export default LocationsTab;