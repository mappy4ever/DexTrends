import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TypeBadge } from './TypeBadge';
import { fetchData } from '../../utils/apiutils';

// Simple evolution display that actually works
export default function SimpleEvolutionDisplay({ speciesUrl, currentPokemonId }) {
  const [evolutionChain, setEvolutionChain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvolution = async () => {
      if (!speciesUrl) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get species data
        const speciesData = await fetchData(speciesUrl);
        if (!speciesData.evolution_chain?.url) {
          setEvolutionChain([]);
          return;
        }
        
        // Get evolution chain
        const evoData = await fetchData(speciesData.evolution_chain.url);
        
        // Parse the chain into a flat array
        const parseChain = async (node, evolutionDetails = null) => {
          if (!node) return [];
          
          const speciesId = node.species.url.split('/').slice(-2, -1)[0];
          
          // Get Pokemon data for types
          let types = [];
          try {
            const pokeData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${speciesId}`);
            types = pokeData.types.map(t => t.type.name);
          } catch (e) {
            console.error('Failed to fetch Pokemon data:', e);
          }
          
          const current = {
            name: node.species.name,
            id: speciesId,
            types,
            evolutionDetails,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`
          };
          
          const evolutions = [current];
          
          // Process all evolution branches
          if (node.evolves_to && node.evolves_to.length > 0) {
            for (const evolution of node.evolves_to) {
              const subEvolutions = await parseChain(evolution, evolution.evolution_details?.[0]);
              evolutions.push(...subEvolutions);
            }
          }
          
          return evolutions;
        };
        
        const chain = await parseChain(evoData.chain);
        setEvolutionChain(chain);
        
      } catch (err) {
        console.error('Error loading evolution:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvolution();
  }, [speciesUrl]);

  if (loading) {
    return <div className="text-center py-4">Loading evolution data...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Failed to load evolution data</div>;
  }

  if (!evolutionChain || evolutionChain.length === 0) {
    return <div className="text-center py-4 text-gray-500">This Pokémon does not evolve</div>;
  }

  // Group evolutions by stage
  const stages = [];
  let currentStage = [];
  let lastDetails = null;
  
  evolutionChain.forEach((pokemon, index) => {
    if (index > 0 && pokemon.evolutionDetails !== lastDetails) {
      stages.push(currentStage);
      currentStage = [];
    }
    currentStage.push(pokemon);
    lastDetails = pokemon.evolutionDetails;
  });
  if (currentStage.length > 0) {
    stages.push(currentStage);
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-center gap-4 min-w-max px-4">
        {stages.map((stage, stageIndex) => (
          <React.Fragment key={stageIndex}>
            {stageIndex > 0 && (
              <div className="text-center px-2">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {stage[0]?.evolutionDetails && (
                  <div className="text-xs text-gray-500 mt-1">
                    {formatEvolutionMethod(stage[0].evolutionDetails)}
                  </div>
                )}
              </div>
            )}
            
            <div className={`flex flex-col gap-4 ${stage.length > 1 ? 'border-2 border-dashed border-gray-300 rounded-lg p-3' : ''}`}>
              {stage.map((pokemon) => (
                <Link 
                  key={pokemon.id} 
                  href={`/pokedex/${pokemon.id}`}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all hover:bg-gray-50 ${
                    parseInt(pokemon.id) === parseInt(currentPokemonId) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="relative w-24 h-24 mb-2">
                    <Image
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/dextrendslogo.png';
                      }}
                    />
                  </div>
                  <p className="font-medium capitalize">{pokemon.name.replace(/-/g, ' ')}</p>
                  <p className="text-sm text-gray-500">#{pokemon.id.padStart(3, '0')}</p>
                  <div className="flex gap-1 mt-1">
                    {pokemon.types.map(type => (
                      <TypeBadge key={type} type={type} size="sm" />
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function formatEvolutionMethod(details) {
  if (!details) return 'Evolves';
  
  const parts = [];
  
  if (details.min_level) {
    parts.push(`Lv ${details.min_level}`);
  }
  
  if (details.item) {
    parts.push(details.item.name.replace(/-/g, ' '));
  }
  
  if (details.trigger && details.trigger.name !== 'level-up') {
    parts.push(details.trigger.name.replace(/-/g, ' '));
  }
  
  if (details.min_happiness) {
    parts.push(`Happiness ${details.min_happiness}+`);
  }
  
  if (details.time_of_day) {
    parts.push(`${details.time_of_day} time`);
  }
  
  return parts.join(', ') || 'Evolves';
}