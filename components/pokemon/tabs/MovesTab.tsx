import React, { Component, ErrorInfo, ReactNode } from 'react';
import type { Pokemon, PokemonSpecies } from '../../../types/api/pokemon';
import PokemonGlassCard from '../PokemonGlassCard';
import { PokemonLearnset } from '../PokemonLearnset';

interface MovesTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  typeColors: any;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class MovesTabErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MovesTab error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <PokemonGlassCard variant="default">
          <div className="text-center py-8">
            <p className="text-red-500 font-semibold mb-2">Error loading moves</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {this.state.error?.message || 'Something went wrong while loading move data'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </PokemonGlassCard>
      );
    }

    return this.props.children;
  }
}

const MovesTab: React.FC<MovesTabProps> = ({ pokemon, species, typeColors }) => {
  // Validate pokemon data
  if (!pokemon || !pokemon.name) {
    return (
      <div className="text-center py-8 text-red-500">
        Pokemon data not available
      </div>
    );
  }

  return (
    <MovesTabErrorBoundary>
      <div className="space-y-6" data-testid="pokemon-moves">
        {/* Header Card */}
        <PokemonGlassCard variant="compact" pokemonTypes={pokemon.types}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif text-gray-900 dark:text-white">
              Move Pool
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Complete learnset from Pokemon Showdown
            </span>
          </div>
        </PokemonGlassCard>

        {/* Moves Display - Using Showdown Learnset Data */}
        <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
          <PokemonLearnset 
            pokemonId={pokemon.name}
            generation={9}
            className="mt-4"
          />
        </PokemonGlassCard>
      </div>
    </MovesTabErrorBoundary>
  );
};

export default MovesTab;