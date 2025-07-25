import React from 'react';
import type { Pokemon, PokemonSpecies } from '../../../types/api/pokemon';
import PokemonGlassCard from '../PokemonGlassCard';
import SimplifiedMovesDisplay from '../../ui/SimplifiedMovesDisplay';

interface MovesTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  typeColors: any;
}

const MovesTab: React.FC<MovesTabProps> = ({ pokemon, species, typeColors }) => {
  return (
    <div className="space-y-6" data-testid="pokemon-moves">
      {/* Header Card */}
      <PokemonGlassCard variant="compact" pokemonTypes={pokemon.types}>
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-serif text-gray-900 dark:text-white">
            Move Pool
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {pokemon.moves?.length || 0} moves available
          </span>
        </div>
      </PokemonGlassCard>

      {/* Moves Display */}
      <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
        {pokemon.moves && pokemon.moves.length > 0 ? (
          <SimplifiedMovesDisplay 
            moves={pokemon.moves} 
            pokemonName={pokemon.name}
          />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No moves data available for this Pokémon</p>
          </div>
        )}
      </PokemonGlassCard>
    </div>
  );
};

export default MovesTab;