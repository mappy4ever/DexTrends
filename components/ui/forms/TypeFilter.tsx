import React from "react";
import { TypeBadge } from "../TypeBadge";

interface TypeFilterProps {
  types?: string[];
  selectedType?: string | null;
  onTypeChange?: (type: string | null) => void;
  compact?: boolean;
  isPocketCard?: boolean;
}

/**
 * A component for filtering Pokémon cards by type
 * @param {Object} props Component props 
 * @param {Array} props.types Array of available types
 * @param {string} props.selectedType Currently selected type filter
 * @param {Function} props.onTypeChange Handler for type change
 * @param {boolean} props.compact Display in compact form (optional)
 * @param {boolean} props.isPocketCard Whether to use Pocket card colors (optional)
 */
export function TypeFilter({ types = [], selectedType, onTypeChange, compact = false, isPocketCard = false }: TypeFilterProps) {
  if (!types || types.length === 0) {
    return null;
  }

  // Make sure "all" is always the first option
  const sortedTypes = ["all", ...types.filter((t: string) => t !== "all")];

  return (
    <div className={`flex ${compact ? 'flex-wrap gap-2' : 'gap-2 overflow-x-auto py-2 px-1'}`}>
      {sortedTypes.map((type: string) => (
        <button
          key={type}
          onClick={() => onTypeChange?.(type)}
          className={`transition-all touch-manipulation min-h-[36px] ${
            selectedType === type
              ? 'ring-2 ring-red-500 ring-offset-1 scale-105 shadow-lg shadow-red-500/25'
              : 'opacity-80 hover:opacity-100 hover:scale-105'
          }`}
          title={`Filter by ${type === 'all' ? 'all types' : type + ' type'}`}
        >
          {type === "all" ? (
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white text-sm font-medium flex items-center justify-center min-h-[36px]">
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

export default TypeFilter;
