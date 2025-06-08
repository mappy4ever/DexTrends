import React from "react";
import { TypeBadge } from "./TypeBadge"; // Updated path

/**
 * A component for filtering Pokémon cards by type
 * @param {Object} props Component props 
 * @param {Array} props.types Array of available types
 * @param {string} props.selectedType Currently selected type filter
 * @param {Function} props.onTypeChange Handler for type change
 * @param {boolean} props.compact Display in compact form (optional)
 */
export function TypeFilter({ types = [], selectedType, onTypeChange, compact = false }) {
  if (!types || types.length === 0) {
    return null;
  }

  // Make sure "all" is always the first option
  const sortedTypes = ["all", ...types.filter(t => t !== "all")];

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
              ? 'ring-2 ring-primary ring-offset-1 scale-105 shadow-sm'
              : 'opacity-70 hover:opacity-100'
          }`}
          title={`Filter by ${type === 'all' ? 'all types' : type + ' type'}`}
        >
          {type === "all" ? (
            <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium flex items-center justify-center ${
              compact ? 'h-6' : 'h-7'
            }`}>
              All Types
            </div>
          ) : (
            <TypeBadge type={type} size={compact ? "sm" : "md"} />
          )}
        </button>
      ))}
    </div>
  );
}
