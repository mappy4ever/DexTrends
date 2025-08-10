import React from 'react';
import type { Pokemon, PokemonSpecies, EvolutionChain } from "../../../types/pokemon";
import EvolutionFlow from '../EvolutionFlow';

interface EvolutionTabV2Props {
  pokemon: Pokemon;
  species: PokemonSpecies;
  evolutionChain: EvolutionChain | null;
  typeColors: Record<string, unknown>;
}

const EvolutionTabV2: React.FC<EvolutionTabV2Props> = ({
  pokemon,
  species,
  evolutionChain,
  typeColors
}) => {
  return (
    <div className="space-y-6">
      <EvolutionFlow
        evolutionChain={evolutionChain}
        currentPokemon={pokemon}
        species={species}
        onPokemonClick={(pokemonId) => {
          // Navigate to the selected Pokemon
          window.location.href = `/pokedex/${pokemonId}`;
        }}
      />
    </div>
  );
};

export default EvolutionTabV2;