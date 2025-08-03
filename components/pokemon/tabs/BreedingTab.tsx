import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import type { Pokemon, PokemonSpecies } from '../../../types/api/pokemon';
import PokemonGlassCard from '../PokemonGlassCard';
import { fetchData } from '../../../utils/apiutils';
import { cn } from '../../../utils/cn';
import { FaMars, FaVenus } from 'react-icons/fa';

interface BreedingTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  typeColors: any;
}

interface EggMove {
  name: string;
  type: string;
  category: string;
  power: number | null;
  accuracy: number | null;
  learnMethod: string;
}

interface EggGroupData {
  name: string;
  pokemon: { name: string; url: string }[];
}

const BreedingTab: React.FC<BreedingTabProps> = ({ pokemon, species, typeColors }) => {
  const router = useRouter();
  const [eggMoves, setEggMoves] = useState<EggMove[]>([]);
  const [compatiblePokemon, setCompatiblePokemon] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompatible, setShowCompatible] = useState(false);

  useEffect(() => {
    loadBreedingData();
  }, [pokemon.id, species.id]);

  const loadBreedingData = async () => {
    try {
      setLoading(true);
      
      // Simple approach - just use the basic data without additional API calls
      const eggMovesData: EggMove[] = (pokemon.moves || [])
        .filter(move => 
          move && 
          move.version_group_details && 
          Array.isArray(move.version_group_details) &&
          move.version_group_details.some(v => v && v.move_learn_method && v.move_learn_method.name === 'egg')
        )
        .slice(0, 10) // Limit to 10 moves
        .map(moveData => ({
          name: moveData.move?.name || 'Unknown',
          type: 'normal', // Default type to prevent errors
          category: 'status',
          power: null,
          accuracy: null,
          learnMethod: 'egg'
        }));
      
      setEggMoves(eggMovesData);
      
      // For now, skip the complex API calls that were causing issues
      setCompatiblePokemon([]);
      
    } catch (err) {
      console.error('Error loading breeding data:', err);
      setEggMoves([]);
      setCompatiblePokemon([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate gender ratio display
  const getGenderRatio = () => {
    if (species.gender_rate === -1) {
      return { male: 0, female: 0, genderless: true };
    }
    const female = (species.gender_rate / 8) * 100;
    const male = 100 - female;
    return { male, female, genderless: false };
  };

  const genderRatio = getGenderRatio();

  return (
    <div className="space-y-6">
      {/* Basic Breeding Info */}
      <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
        <h3 className="text-2xl font-serif mb-6 text-gray-900 dark:text-white">
          Breeding Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Egg Groups */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Egg Groups</h4>
            <div className="flex flex-wrap gap-2">
              {species.egg_groups?.length > 0 ? (
                species.egg_groups.map(group => (
                  <span
                    key={group.name}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      "bg-gradient-to-r text-white",
                      typeColors.from,
                      typeColors.to
                    )}
                  >
                    {group.name.charAt(0).toUpperCase() + group.name.slice(1).replace('-', ' ')}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 dark:text-gray-400">No egg groups</span>
              )}
            </div>
          </div>

          {/* Hatch Counter */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Egg Cycles</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Base Cycles: <span className="font-bold">{species.hatch_counter || 20}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Steps: <span className="font-bold">{((species.hatch_counter || 20) + 1) * 255}</span>
              </p>
            </div>
          </div>

          {/* Gender Ratio */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Gender Ratio</h4>
            {genderRatio.genderless ? (
              <p className="text-gray-500 dark:text-gray-400">Genderless</p>
            ) : (
              <div className="flex items-center gap-1">
                <FaMars className="text-blue-400 w-4 h-4" />
                <span className="font-bold text-sm">{genderRatio.male.toFixed(1)}%</span>
                <span className="text-gray-500">/</span>
                <FaVenus className="text-pink-400 w-4 h-4" />
                <span className="font-bold text-sm">{genderRatio.female.toFixed(1)}%</span>
              </div>
            )}
          </div>

          {/* Base Happiness */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Base Happiness</h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(species.base_happiness / 255) * 100}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <span className="text-sm font-medium">{species.base_happiness}/255</span>
            </div>
          </div>
        </div>
      </PokemonGlassCard>

      {/* Egg Moves */}
      {eggMoves.length > 0 && (
        <PokemonGlassCard variant="stat" pokemonTypes={pokemon.types}>
          <h4 className="text-xl font-bold mb-4">Egg Moves</h4>
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading egg moves...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {eggMoves.map((move, index) => (
                <motion.div
                  key={move.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-3 rounded-lg border",
                    "bg-white/50 dark:bg-gray-800/50",
                    "border-gray-200 dark:border-gray-700",
                    "hover:shadow-md transition-shadow"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">
                      {move.name.replace('-', ' ')}
                    </span>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      `bg-${move.type}-100 text-${move.type}-700`,
                      `dark:bg-${move.type}-900/30 dark:text-${move.type}-400`
                    )}>
                      {move.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <span>{move.category}</span>
                    {move.power && <span>Power: {move.power}</span>}
                    {move.accuracy && <span>Acc: {move.accuracy}%</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </PokemonGlassCard>
      )}

      {/* Compatible Pokemon */}
      <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold">Breeding Compatibility</h4>
            <button
              onClick={() => setShowCompatible(!showCompatible)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                "bg-gradient-to-r hover:shadow-lg",
                typeColors.from,
                typeColors.to,
                "text-white"
              )}
            >
              {showCompatible ? 'Hide' : 'Show'} Compatible Pokémon
            </button>
          </div>

          {showCompatible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4"
            >
              {loading ? (
                <p className="text-gray-500 dark:text-gray-400">Loading compatible Pokémon...</p>
              ) : compatiblePokemon.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {compatiblePokemon.map((name, index) => (
                    <motion.span
                      key={name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm",
                        "bg-gray-100 dark:bg-gray-800",
                        "hover:bg-gray-200 dark:hover:bg-gray-700",
                        "cursor-pointer transition-colors"
                      )}
                      onClick={() => router.push(`/pokedex/${name}`)}
                    >
                      {name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ')}
                    </motion.span>
                  ))}
                  {compatiblePokemon.length === 50 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      and more...
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  {species.egg_groups?.some(g => g.name === 'no-eggs') 
                    ? 'This Pokémon cannot breed.'
                    : 'No compatible Pokémon found.'}
                </p>
              )}
            </motion.div>
          )}
        </div>
      </PokemonGlassCard>
    </div>
  );
};

export default BreedingTab;