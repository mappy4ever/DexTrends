import React, { useState } from 'react';
import { Modal } from './Modal';
import PokeballLoader from './PokeballLoader';

// Types
export interface Pokemon {
  name: string;
  url: string;
}

interface EnhancedPokemonSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pokemon: Pokemon) => void;
  pokemonList?: Pokemon[];
  loading?: boolean;
  playerNumber?: number | null;
  title?: string;
}

interface PokemonSelectionItemProps {
  pokemon: Pokemon;
  index: number;
  onSelect: (pokemon: Pokemon) => void;
}

type SortBy = 'id' | 'name';

// Pokemon selection item component
const PokemonSelectionItem: React.FC<PokemonSelectionItemProps> = ({ pokemon, index, onSelect }) => {
  const pokemonId = pokemon.url.split('/').slice(-2)[0];
  
  return (
    <button
      onClick={() => onSelect(pokemon)}
      data-testid="pokemon-option"
      className="w-full p-4 rounded-xl border-2 transition-all transform hover:scale-[1.02] border-stone-200 hover:border-amber-400 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Type Color Circle - placeholder until Pokemon data is loaded */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stone-300 to-stone-400 flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {pokemon.name.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Pokemon Info */}
          <div className="text-left">
            <div className="font-bold text-lg capitalize text-stone-800">
              {pokemon.name}
            </div>
            <div className="text-sm text-stone-500">
              #{pokemonId.padStart(3, '0')}
            </div>
          </div>
        </div>
        
        {/* Quick select indicator */}
        <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
};

// Enhanced Pokemon Selector with search, filter, and random selection
export const EnhancedPokemonSelector: React.FC<EnhancedPokemonSelectorProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  pokemonList = [],
  loading = false,
  playerNumber = null,
  title = "Choose a Pokémon"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('id');

  // Filter and sort Pokemon
  const filteredPokemon = pokemonList
    .filter(pokemon => 
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'id') {
        const aId = parseInt(a.url.split('/').slice(-2)[0]);
        const bId = parseInt(b.url.split('/').slice(-2)[0]);
        return aId - bId;
      }
      return 0;
    });

  // Select random Pokemon
  const selectRandomPokemon = () => {
    if (filteredPokemon.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredPokemon.length);
    const randomPokemon = filteredPokemon[randomIndex];
    onSelect(randomPokemon);
  };

  const modalTitle = playerNumber 
    ? `Select Pokémon for Player ${playerNumber}`
    : title;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="5xl"
      className="max-h-[90vh]"
    >
      <div className="p-6">
        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Pokémon by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-12 py-3 border-2 border-stone-300 rounded-full focus:ring-4 focus:ring-amber-500 focus:ring-opacity-20 focus:border-blue-500 transition-all text-lg"
              autoFocus
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-stone-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-1 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="id">Pokédex Number</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
            
            {/* Random Button */}
            <button
              onClick={selectRandomPokemon}
              disabled={filteredPokemon.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              🎲 Random Pokémon
            </button>
          </div>
          
          {/* Results Count */}
          <div className="text-sm text-stone-600 text-center">
            {loading ? 'Loading...' : `${filteredPokemon.length} Pokémon available`}
          </div>
        </div>
        
        {/* Pokemon Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <PokeballLoader size="large" text="Loading Pokémon..." />
          </div>
        ) : filteredPokemon.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-stone-700 mb-2">No Pokémon Found</h3>
            <p className="text-stone-500">
              {searchTerm ? `No Pokémon match "${searchTerm}"` : 'No Pokémon available'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100">
            {filteredPokemon.map((pokemon, index) => (
              <PokemonSelectionItem
                key={pokemon.name}
                pokemon={pokemon}
                index={index}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EnhancedPokemonSelector;