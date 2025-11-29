import React, { useState } from 'react';
import { fetchJSON } from '../../utils/unifiedFetch';
import { POKEMON_TYPE_COLORS } from '../../utils/unifiedTypeColors';
import { TypeBadge } from '../ui/TypeBadge';
import { InlineLoader } from '../ui/SkeletonLoadingSystem';
import logger from '../../utils/logger';
import type { Pokemon } from '../../types/pokemon';

interface TypeColors {
  single?: string;
  dual: boolean;
  color1?: string;
  color2?: string;
}

export interface PokemonSelectionItemProps {
  pokemon: {
    name: string;
    url: string;
  };
  pokemonId?: number;
  onSelect: (pokemon: Pokemon) => void;
  allPokemonData?: Pokemon | null;
}

/**
 * Pokemon selection item for battle simulator
 * Shows Pokemon name, type color badge, and types
 */
export const PokemonSelectionItem: React.FC<PokemonSelectionItemProps> = ({
  pokemon,
  pokemonId,
  onSelect,
  allPokemonData = null
}) => {
  const [pokemonData, setPokemonData] = useState<Pokemon | null>(allPokemonData);
  const [itemLoading, setItemLoading] = useState(false);

  // Get type colors for dual-type display
  const getTypeColors = (): TypeColors => {
    // Default gray color when no data is loaded yet
    if (!pokemonData?.types || pokemonData.types.length === 0) {
      return { single: '#A8A77A', dual: false }; // Normal type color as fallback
    }

    const types = pokemonData.types;

    if (types.length === 1) {
      const typeName = types[0].type.name.toLowerCase();
      const color = POKEMON_TYPE_COLORS[typeName as keyof typeof POKEMON_TYPE_COLORS] || POKEMON_TYPE_COLORS.normal;
      return { single: color, dual: false };
    } else {
      const type1Name = types[0].type.name.toLowerCase();
      const type2Name = types[1].type.name.toLowerCase();
      const color1 = POKEMON_TYPE_COLORS[type1Name as keyof typeof POKEMON_TYPE_COLORS] || POKEMON_TYPE_COLORS.normal;
      const color2 = POKEMON_TYPE_COLORS[type2Name as keyof typeof POKEMON_TYPE_COLORS] || POKEMON_TYPE_COLORS.normal;
      return {
        dual: true,
        color1: color1,
        color2: color2
      };
    }
  };

  const handleSelect = async () => {
    if (!pokemonData) {
      setItemLoading(true);
      try {
        const data = await fetchJSON<Pokemon>(pokemon.url);
        if (data) {
          setPokemonData(data);
          onSelect(data);
        }
      } catch (err) {
        logger.error('Failed to load Pokemon data:', { error: err });
      } finally {
        setItemLoading(false);
      }
    } else {
      onSelect(pokemonData);
    }
  };

  const colors = getTypeColors();

  return (
    <button
      onClick={handleSelect}
      disabled={itemLoading}
      className="w-full text-left min-h-0 p-4 justify-start bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all duration-200 border border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 shadow-sm hover:shadow-md rounded-lg"
      data-testid="pokemon-option"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Type Color Badge - Rectangular design */}
          <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden relative border border-stone-200 dark:border-stone-600">
            {colors.dual ? (
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-0 w-1/2"
                  style={{ backgroundColor: colors.color1 || '#A8A77A' }}
                />
                <div
                  className="absolute inset-0 w-1/2 left-1/2"
                  style={{ backgroundColor: colors.color2 || '#A8A77A' }}
                />
              </div>
            ) : (
              <div
                className="absolute inset-0 rounded-lg"
                style={{ backgroundColor: colors.single || '#A8A77A' }}
              />
            )}
            {itemLoading ? (
              <div className="relative z-10"><InlineLoader /></div>
            ) : (
              <span className="text-2xl font-bold text-white/90 relative z-10">
                {pokemon.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Pokemon Info */}
          <div className="text-left">
            <div className="font-bold text-lg capitalize text-stone-800 dark:text-stone-200">
              {pokemon.name}
            </div>
            <div className="text-sm text-stone-500">
              #{pokemonId ? pokemonId.toString().padStart(3, '0') : '???'}
            </div>
          </div>
        </div>

        {/* Type Badges */}
        <div className="flex gap-1">
          {pokemonData?.types ? (
            pokemonData.types.map(t => (
              <TypeBadge key={t.type.name} type={t.type.name} size="xs" />
            ))
          ) : (
            <span className="text-sm text-stone-400">Select to load</span>
          )}
        </div>
      </div>
    </button>
  );
};

export default PokemonSelectionItem;
