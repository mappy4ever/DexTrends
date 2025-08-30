import React from 'react';
import { cn } from '@/utils/cn';
import { POKEMON_TYPE_COLORS } from '@/utils/unifiedTypeColors';

interface MobileTypeFilterProps {
  types: string[];
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
  onClear?: () => void;
}

// Type icons using emojis for compact display
const TYPE_ICONS: Record<string, string> = {
  normal: '⚪',
  fire: '🔥',
  water: '💧',
  electric: '⚡',
  grass: '🌿',
  ice: '❄️',
  fighting: '👊',
  poison: '☠️',
  ground: '🏔️',
  flying: '🦅',
  psychic: '🔮',
  bug: '🐛',
  rock: '🪨',
  ghost: '👻',
  dragon: '🐉',
  dark: '🌑',
  steel: '⚙️',
  fairy: '✨'
};

export const MobileTypeFilter: React.FC<MobileTypeFilterProps> = ({
  types,
  selectedTypes,
  onTypeToggle,
  onClear
}) => {
  return (
    <div className="space-y-3">
      {/* Header with Clear button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">Type</h3>
        {selectedTypes.length > 0 && onClear && (
          <button
            onClick={onClear}
            className="text-xs text-red-500 font-medium px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/20"
          >
            Clear
          </button>
        )}
      </div>

      {/* Type grid - 4 per row, smaller badges */}
      <div className="grid grid-cols-4 gap-1.5">
        {types.map(type => {
          const isSelected = selectedTypes.includes(type);
          const typeKey = type.toLowerCase();
          const bgColor = POKEMON_TYPE_COLORS[typeKey];
          
          return (
            <button
              key={type}
              onClick={() => onTypeToggle(type)}
              className={cn(
                "relative px-2 py-2.5 rounded-full text-xs font-semibold",
                "transition-all duration-200 capitalize",
                "flex flex-col items-center justify-center gap-0.5",
                "min-h-[3.5rem]", // Fixed height for consistency
                isSelected ? [
                  "text-white shadow-lg scale-105",
                  "ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900"
                ] : [
                  "text-white/90",
                  "opacity-60 hover:opacity-100"
                ]
              )}
              style={{
                backgroundColor: isSelected ? bgColor : `${bgColor}88`,
                ...(isSelected && {
                  ringColor: bgColor,
                  boxShadow: `0 4px 12px ${bgColor}66`
                })
              }}
            >
              {/* Type emoji icon */}
              <span className="text-base leading-none">
                {TYPE_ICONS[typeKey] || '⚪'}
              </span>
              {/* Type name */}
              <span className="text-[10px] uppercase tracking-wide">
                {type}
              </span>
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-2.5 h-2.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};