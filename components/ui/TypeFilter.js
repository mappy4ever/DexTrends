import React from "react";
import { TypeBadge } from "./TypeBadge"; // Updated path

/**
 * A component for filtering Pokémon cards by type
 * @param {Object} props Component props 
 * @param {Array} props.types Array of available types
 * @param {string} props.selectedType Currently selected type filter
 * @param {Function} props.onTypeChange Handler for type change
 * @param {boolean} props.compact Display in compact form (optional)
 * @param {boolean} props.isPocketCard Whether to use Pocket card colors (optional)
 */
export function TypeFilter({ types = [], selectedType, onTypeChange, compact = false, isPocketCard = false }) {
  if (!types || types.length === 0) {
    return null;
  }

  // Filter out "all" type and sort the remaining types
  const sortedTypes = types.filter(t => t !== "all");

  // Get type-specific ring color for selected state
  const getTypeRingColor = (type) => {
    const typeColors = {
      fire: 'ring-red-500 shadow-red-500/25',
      water: 'ring-blue-500 shadow-blue-500/25',
      grass: 'ring-green-500 shadow-green-500/25',
      electric: 'ring-yellow-400 shadow-yellow-400/25',
      lightning: 'ring-yellow-400 shadow-yellow-400/25',
      psychic: 'ring-pink-500 shadow-pink-500/25',
      ice: 'ring-cyan-400 shadow-cyan-400/25',
      dragon: 'ring-indigo-600 shadow-indigo-600/25',
      dark: 'ring-gray-800 shadow-gray-800/25',
      darkness: 'ring-gray-800 shadow-gray-800/25',
      fairy: 'ring-pink-400 shadow-pink-400/25',
      normal: 'ring-gray-400 shadow-gray-400/25',
      fighting: 'ring-orange-600 shadow-orange-600/25',
      flying: 'ring-indigo-400 shadow-indigo-400/25',
      poison: 'ring-purple-500 shadow-purple-500/25',
      ground: 'ring-yellow-600 shadow-yellow-600/25',
      rock: 'ring-stone-500 shadow-stone-500/25',
      bug: 'ring-lime-400 shadow-lime-400/25',
      ghost: 'ring-purple-600 shadow-purple-600/25',
      steel: 'ring-slate-500 shadow-slate-500/25',
      metal: 'ring-slate-500 shadow-slate-500/25',
      colorless: 'ring-gray-300 shadow-gray-300/25',
      trainer: 'ring-emerald-500 shadow-emerald-500/25',
      item: 'ring-blue-500 shadow-blue-500/25',
      supporter: 'ring-orange-500 shadow-orange-500/25',
      tool: 'ring-purple-500 shadow-purple-500/25'
    };
    return typeColors[type.toLowerCase()] || 'ring-red-500 shadow-red-500/25';
  };

  return (
    <div className={`flex ${compact ? 'flex-wrap gap-1.5' : 'gap-2 overflow-x-auto py-2 px-1'}`}>
      {sortedTypes.map(type => (
        <button
          key={type}
          onClick={() => onTypeChange(type)}
          className={`transition-all ${
            compact ? 'scale-90' : ''
          } ${
            selectedType === type
              ? `ring-2 ring-offset-1 scale-105 shadow-lg ${getTypeRingColor(type)}`
              : 'opacity-70 hover:opacity-100 hover:scale-105'
          }`}
          title={`Filter by ${type + ' type'}`}
        >
          <TypeBadge type={type} size={compact ? "sm" : "md"} isPocketCard={isPocketCard} />
        </button>
      ))}
    </div>
  );
}
