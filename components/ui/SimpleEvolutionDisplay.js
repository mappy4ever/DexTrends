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
  const [isShiny, setIsShiny] = useState(false);

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
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`,
            shinySprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${speciesId}.png`
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

  const renderEeveeEvolutionDisplay = () => {
    const eevee = evolutionChain.find(p => p.name.toLowerCase() === 'eevee');
    const evolutions = evolutionChain.filter(p => p.name.toLowerCase() !== 'eevee');
    
    return (
      <div className="w-full">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsShiny(!isShiny)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              isShiny 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span>Shiny</span>
          </button>
        </div>
        
        <div className="relative flex justify-center items-center mx-auto" style={{ height: '650px', width: '100%', maxWidth: '850px' }}>
          {/* Eevee in the center */}
          {eevee && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <Link 
                href={`/pokedex/${eevee.id}`}>
                className={`flex flex-col items-center p-2 transition-all hover:scale-110 ${
                  parseInt(eevee.id) === parseInt(currentPokemonId) ? 'scale-110' : ''
                }`}
              >
                <div className="relative w-28 h-28">
                  <Image
                    src={isShiny ? eevee.shinySprite : eevee.sprite}
                    alt={eevee.name}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/dextrendslogo.png';
                    }}
                  />
                </div>
                <p className="font-bold capitalize text-base text-amber-800 -mt-4">{eevee.name}</p>
                <p className="text-xs text-gray-500 -mt-1">#{eevee.id.padStart(3, '0')}</p>
                <div className="flex gap-1 mt-1">
                  {eevee.types.map(type => (
                    <TypeBadge key={type} type={type} size="xs" />
                  ))}
                </div>
              </Link>
            </div>
          )}
          
          {/* Evolutions arranged in a circle */}
          {evolutions.map((evolution, index) => {
            // Arrange evolutions in proper order starting from top and going clockwise
            // Order: Vaporeon (top), Jolteon, Flareon, Espeon, Umbreon, Leafeon, Glaceon, Sylveon
            const angle = (360 / evolutions.length) * index - 90; // Start from top
            const radian = (angle * Math.PI) / 180;
            const radius = 230; // Slightly larger radius with expanded container
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;
            return (
              <div key={evolution.id}>
                {/* Evolution Pokemon positioned in circle */}
                <div
                  className="absolute"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <Link 
                    href={`/pokedex/${evolution.id}`}>
                    className={`flex flex-col items-center p-2 transition-all hover:scale-110 ${
                      parseInt(evolution.id) === parseInt(currentPokemonId) ? 'scale-110' : ''
                    }`}
                  >
                    <div className="relative w-24 h-24 mb-1">
                      <Image
                        src={isShiny ? evolution.shinySprite : evolution.sprite}
                        alt={evolution.name}
                        fill
                        className="object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/dextrendslogo.png';
                        }}
                      />
                    </div>
                    <p className="font-medium capitalize text-sm">{evolution.name.replace(/-/g, ' ')}</p>
                    <p className="text-xs text-gray-500">#{evolution.id.padStart(3, '0')}</p>
                    <div className="flex gap-1 mt-1">
                      {evolution.types.map(type => (
                        <TypeBadge key={type} type={type} size="sm" />
                      ))}
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!evolutionChain || evolutionChain.length === 0) {
    return <div className="text-center py-4 text-gray-500">This Pokémon does not evolve</div>;
  }

  // Check if this is an Eevee evolution line
  const isEeveeFamily = evolutionChain.some(pokemon => pokemon.name.toLowerCase() === 'eevee');
  
  if (isEeveeFamily) {
    return renderEeveeEvolutionDisplay();
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
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsShiny(!isShiny)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            isShiny 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span>Shiny</span>
        </button>
      </div>
      <div className="flex items-start gap-4 flex-wrap">
        {stages.map((stage, stageIndex) => (
          <React.Fragment key={stageIndex}>
            {stageIndex > 0 && (
              <div className="flex flex-col justify-center items-center px-2 mt-16">
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
                  key={pokemon.id}>
                  href={`/pokedex/${pokemon.id}`}
                  className={`flex flex-col items-center p-3 m-1 transition-all hover:scale-110 ${
                    parseInt(pokemon.id) === parseInt(currentPokemonId) ? 'scale-110' : ''
                  }`}
                >
                  <div className="relative w-32 h-32 mb-2">
                    <Image
                      src={isShiny ? pokemon.shinySprite : pokemon.sprite}
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