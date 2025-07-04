import React from 'react';
import Image from 'next/image';
import { CardHover } from './animations'; // Assuming CardHover is needed for grid
import { TypeBadge } from './TypeBadge';
import { getGeneration } from '../../utils/pokemonutils'; // For generation badge if not passed as prop

const PokemonCardItem = ({
  poke,
  isFavorite,
  viewMode,
  cardSize, // specific to grid view
  onNavigate,
  onToggleFavorite,
  getSpriteFn, // e.g., getOfficialArtworkSpriteUrl
}) => {
  const pokeId = String(poke.id); // Ensure pokeId is a string
  const generation = getGeneration(pokeId);

  // Define size classes for grid view, similar to what was in pokedex.js
  const gridSizeClasses = {
    compact: 'w-22 h-22 sm:w-28 sm:h-28',
    regular: 'w-32 h-32 sm:w-36 sm:h-36',
    large: 'w-40 h-40 sm:w-44 sm:h-44 lg:w-48 lg:h-48',
  };
  const currentGridSizeClass = gridSizeClasses[cardSize] || gridSizeClasses['regular'];

  if (viewMode === 'grid') {
    return (
      <CardHover
        className="flex flex-col items-center rounded-xl bg-gradient-to-br p-4 border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md group relative transition-all duration-300 overflow-hidden" onClick={() => onNavigate(pokeId)}>
        <button
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all transform ${
            isFavorite
              ? 'text-red-500 bg-red-50 dark:bg-red-900/30 shadow-sm rotate-0'
              : 'text-gray-400 bg-gray-100/70 dark:bg-gray-800/70 opacity-0 group-hover:opacity-100 hover:rotate-12'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(pokeId);
          }}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg width="18" height="18" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" className="transform transition-transform duration-300">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorite ? 2.5 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gray-100/50 dark:bg-gray-700/30 z-0"></div>
        <div className="absolute top-3 left-3 opacity-20 font-bold text-2xl text-black/30 dark:text-white/20">
          #{pokeId.padStart(3, '0')}
        </div>
        <div className="relative flex items-center justify-center w-full mb-3 z-10 cursor-pointer">
          <div className="absolute inset-0 rounded-full bg-transparent dark:bg-transparent transform scale-75 group-hover:scale-90 transition-transform duration-300"></div>
          <Image
            src={getSpriteFn(poke.id)} // Use poke.id directly
            alt={poke.name}
            width={120} // Base width, actual size controlled by className
            height={120} // Base height
            className={`${currentGridSizeClass} object-contain drop-shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 z-10`}
            onError={(e) => { e.currentTarget.src = "/back-card.png"; }}
            priority={false} // Consider priority for above-the-fold items if applicable
          />
          <div className="absolute bottom-0 right-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-sm border border-blue-400/30 z-20">
            {generation}
          </div>
        </div>
        <h3 className="capitalize font-bold text-sm md:text-base text-center mb-1 group-hover:text-primary transition-colors truncate w-full px-1 z-10">
          {poke.name.replace(/-/g, ' ')}
        </h3>
        <div className="flex gap-1.5 mt-1 flex-wrap justify-center z-10">
          {poke.types && poke.types.map(type => (
            <TypeBadge key={type} type={type} size="sm" className="shadow-sm" />
          ))}
        </div>
      </CardHover>
    );
  } else if (viewMode === 'list') {
    const primaryType = poke.types && poke.types.length > 0 ? poke.types[0] : null;
    return (
      <div
        className="group flex items-center bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl border border-gray-200/80 dark:border-gray-700/80 hover:border-primary/30 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden" onClick={() => onNavigate(pokeId)}>
        {primaryType && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:to-primary/5 transition-colors duration-500"></div>
        )}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-6xl opacity-5 dark:opacity-10 pointer-events-none">
          #{pokeId.padStart(3, '0')}
        </div>
        <div className="relative flex-shrink-0 mr-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Image
              src={getSpriteFn(poke.id)} // Use poke.id directly
              alt={poke.name}
              width={80}
              height={80}
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm transition-all duration-300 group-hover:scale-110"
                      onError={(e) => { e.currentTarget.src = "/back-card.png"; }}
                    />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md border border-white dark:border-gray-800">
            {generation}
          </div>
        </div>
        <div className="flex-grow pr-10">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
            <h3 className="capitalize font-bold text-lg group-hover:text-primary transition-colors">
              {poke.name.replace(/-/g, ' ')}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-mono border border-gray-200 dark:border-gray-600">
              #{pokeId.padStart(3, '0')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {poke.types && poke.types.map(type => (
              <TypeBadge key={type} type={type} size="sm" className="shadow-sm" />
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 absolute right-4 top-1/2 -translate-y-1/2">
          <button
            className={`p-2 rounded-full transition-all duration-300 transform ${
              isFavorite
                ? 'bg-red-50 dark:bg-red-500/20 text-red-500'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 opacity-70 group-hover:opacity-100 hover:scale-110'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(pokeId);
            }}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg width="20" height="20" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"
              className={isFavorite ? "animate-pulse-once" : ""}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorite ? 2.5 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }
  return null; // Should not happen if viewMode is always 'grid' or 'list'
};

export default React.memo(PokemonCardItem);
