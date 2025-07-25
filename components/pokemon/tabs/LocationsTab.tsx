import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokemon, PokemonSpecies, LocationAreaEncounterDetail } from '../../../types/api/pokemon';
import PokemonGlassCard from '../PokemonGlassCard';
import { cn } from '../../../utils/cn';

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
  'sun': 7, 'moon': 7, 'ultra-sun': 7, 'ultra-moon': 7,
  'sword': 8, 'shield': 8, 'brilliant-diamond': 8, 'shining-pearl': 8,
  'scarlet': 9, 'violet': 9
};

const GENERATION_COLORS = [
  '', // 0 (unused)
  'from-red-500 to-blue-500',
  'from-yellow-500 to-silver-500',
  'from-red-500 to-green-500',
  'from-blue-600 to-pink-500',
  'from-gray-800 to-gray-600',
  'from-blue-500 to-red-500',
  'from-orange-500 to-blue-500',
  'from-blue-600 to-purple-600',
  'from-red-600 to-violet-600'
];

const LocationsTab: React.FC<LocationsTabProps> = ({ pokemon, species, locationEncounters = [], typeColors }) => {
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  // Process location encounters by game
  const gameLocations = useMemo(() => {
    const locations: Record<string, GameLocation> = {};
    
    locationEncounters.forEach(encounter => {
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
  }, [locationEncounters]);

  // Group locations by generation
  const locationsByGeneration = useMemo(() => {
    const grouped: Record<number, GameLocation[]> = {};
    gameLocations.forEach(loc => {
      if (!grouped[loc.generation]) grouped[loc.generation] = [];
      grouped[loc.generation].push(loc);
    });
    return grouped;
  }, [gameLocations]);

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

      {/* Generation Filter */}
      {gameLocations.length > 0 && (
        <PokemonGlassCard variant="stat" pokemonTypes={pokemon.types}>
          <h4 className="text-lg font-bold mb-4">Filter by Generation</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGeneration(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedGeneration === null
                  ? "bg-gradient-to-r text-white " + typeColors.from + " " + typeColors.to
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              )}
            >
              All Generations
            </button>
            {Object.keys(locationsByGeneration).sort((a, b) => Number(b) - Number(a)).map(gen => (
              <button
                key={gen}
                onClick={() => setSelectedGeneration(Number(gen))}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  selectedGeneration === Number(gen)
                    ? "bg-gradient-to-r text-white " + GENERATION_COLORS[Number(gen)]
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              >
                Gen {gen}
              </button>
            ))}
          </div>
        </PokemonGlassCard>
      )}

      {/* Location Encounters */}
      {gameLocations.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {Object.entries(locationsByGeneration)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([generation, games]) => {
                if (selectedGeneration !== null && Number(generation) !== selectedGeneration) {
                  return null;
                }
                
                return (
                  <motion.div
                    key={generation}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm text-white bg-gradient-to-r",
                        GENERATION_COLORS[Number(generation)]
                      )}>
                        Generation {generation}
                      </span>
                    </h3>
                    
                    {games.map(game => (
                      <PokemonGlassCard 
                        key={game.game} 
                        variant="default" 
                        pokemonTypes={pokemon.types}
                        className="cursor-pointer"
                        onClick={() => setExpandedGame(expandedGame === game.game ? null : game.game)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold capitalize">
                              Pokémon {game.game.split('-').map(w => 
                                w.charAt(0).toUpperCase() + w.slice(1)
                              ).join(' ')}
                            </h4>
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
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-3 space-y-2">
                                  {game.locations.map((loc, idx) => (
                                    <motion.div
                                      key={`${loc.area}-${idx}`}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.05 }}
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
                    ))}
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      ) : (
        <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              No wild encounter data available for this Pokémon.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              This Pokémon may be obtained through evolution, events, or other special methods.
            </p>
          </div>
        </PokemonGlassCard>
      )}
    </div>
  );
};

export default LocationsTab;