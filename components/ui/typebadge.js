import React from 'react';
import { typeColors } from '../../utils/pokemonutils';

// Type badge component for consistent display of Pokémon types
export function TypeBadge({ type, className = '', size = 'md', onClick = null }) {
  // Get colors from the type colors mapping
  const typeLower = type?.toLowerCase() || '';
  const colors = typeColors[typeLower] || { bg: "bg-gray-200", text: "text-gray-800", border: "border-gray-300", hover: "hover:bg-gray-300" };
  
  // Size classes
  const sizeClasses = {
    'sm': 'px-2 py-0.5 text-xs',
    'md': 'px-3 py-1 text-sm',
    'lg': 'px-4 py-1.5 text-base'
  };
  
  const interactiveClasses = onClick ? `cursor-pointer ${colors.hover}` : '';

  return (
    <span 
      className={`${sizeClasses[size]} rounded-full font-bold uppercase ${colors.bg} ${colors.text} transition-all ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ 
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)', 
        textShadow: '0 1px 1px rgba(0,0,0,0.1)'
      }}
    >
      {type}
    </span>
  );
}

// Collection of all type badges for selection interfaces
export function TypeBadgeSelector({ selectedTypes = [], onChange = () => {} }) {
  const allTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice', 
    'fighting', 'poison', 'ground', 'flying', 'psychic', 
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];
  
  const toggleType = (type) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter(t => t !== type));
    } else {
      onChange([...selectedTypes, type]);
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      {allTypes.map(type => (
        <TypeBadge 
          key={type} 
          type={type}
          size="md"
          className={selectedTypes.includes(type) ? 'ring-2 ring-offset-1 ring-primary' : 'opacity-80'}
          onClick={() => toggleType(type)}
        />
      ))}
    </div>
  );
}

export default TypeBadge;
