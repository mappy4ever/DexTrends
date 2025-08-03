import React, { useState, useEffect } from 'react';
import type { Pokemon, PokemonSpecies } from '../../../types/api/pokemon';
import PokemonGlassCard from '../PokemonGlassCard';
import CardList from '../../CardList';
import PocketCardList from '../../PocketCardList';
import { cn } from '../../../utils/cn';

interface CardsTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  tcgCards?: any[];
  pocketCards?: any[];
  typeColors: any;
}

const CardsTab: React.FC<CardsTabProps> = ({ 
  pokemon, 
  species, 
  tcgCards = [], 
  pocketCards = [],
  typeColors 
}) => {
  const [cardType, setCardType] = useState<'tcg' | 'pocket'>('tcg');
  
  
  return (
    <PokemonGlassCard variant="default" pokemonTypes={pokemon.types} padding="lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Card Gallery</h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCardType('tcg')}
            className={cn(
              "px-5 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-105",
              cardType === 'tcg'
                ? cn(typeColors.tabActive, "text-white shadow-lg")
                : "bg-white/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50"
            )}
          >
            🎴 TCG ({tcgCards.length})
          </button>
          <button
            onClick={() => setCardType('pocket')}
            className={cn(
              "px-5 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-105",
              cardType === 'pocket'
                ? cn(typeColors.tabActive, "text-white shadow-lg")
                : "bg-white/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50"
            )}
          >
            📱 Pocket ({pocketCards.length})
          </button>
        </div>
      </div>
      
      {cardType === 'tcg' ? (
        tcgCards.length > 0 ? (
          <CardList cards={tcgCards} />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-lg">No TCG cards found for this Pokémon</p>
          </div>
        )
      ) : (
        pocketCards.length > 0 ? (
          <PocketCardList 
            cards={pocketCards}
            loading={false}
            error={undefined}
            showPack={true}
            showRarity={true}
            showHP={true}
          />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-lg">No Pocket cards found for this Pokémon</p>
          </div>
        )
      )}
    </PokemonGlassCard>
  );
};

export default CardsTab;