/**
 * Pokemon Evolution Tab Component
 * Displays Pokemon evolution chain
 */

import React, { useState } from 'react';
import { FadeIn } from '../ui/animations';
import EvolutionTreeRenderer from '../ui/EvolutionTreeRenderer';

const PokemonEvolutionTab = ({ pokemonDetails, processedEvolutions, formatEvolutionDetails }) => {
  const [showShinyEvolutionSprite, setShowShinyEvolutionSprite] = useState(false);

  return (
    <FadeIn>
      <div className="glass-elevated p-6 rounded-2xl shadow-lg border-0">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Evolution Chain</h3>
          <button
            onClick={() => setShowShinyEvolutionSprite(!showShinyEvolutionSprite)}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5"
            title={showShinyEvolutionSprite ? "Show default sprites" : "Show shiny sprites"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              <path d="M5 3v4"/>
              <path d="M19 17v4"/>
              <path d="M3 5h4"/>
              <path d="M17 19h4"/>
            </svg>
            {showShinyEvolutionSprite ? "Default" : "Shiny"}
          </button>
        </div>
        
        {/* Eevee special case */}
        {pokemonDetails?.name === 'eevee' && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded text-yellow-900 dark:text-yellow-100 text-center font-semibold">
            Eevee has multiple unique evolutions! Select any branch below to explore its forms.
          </div>
        )}
        
        {processedEvolutions ? (
          <EvolutionTreeRenderer
            node={processedEvolutions}
            showShiny={showShinyEvolutionSprite}
            currentId={pokemonDetails?.id}
            formatEvolutionDetails={formatEvolutionDetails}
          />
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">No evolution data available.</p>
        )}
      </div>
    </FadeIn>
  );
};

export default PokemonEvolutionTab;