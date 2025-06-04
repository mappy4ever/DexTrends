import React from 'react';

// Type badge component for consistent display of Pokémon types
export function TypeBadge({ type, className = '', size = 'md', onClick = null }) {
  // Get colors from the hardcoded type color mapping
  const typeLower = type?.toLowerCase() || '';
  
  // Pokémon type color direct mapping (no Tailwind classes)
  const typeColorMap = {
    normal: { bg: "#A8A878", text: "#FFFFFF" },
    fire: { bg: "#F08030", text: "#FFFFFF" },
    water: { bg: "#6890F0", text: "#FFFFFF" },
    grass: { bg: "#78C850", text: "#FFFFFF" },
    electric: { bg: "#F8D030", text: "#212121" },
    ice: { bg: "#98D8D8", text: "#212121" },
    fighting: { bg: "#C03028", text: "#FFFFFF" },
    poison: { bg: "#A040A0", text: "#FFFFFF" },
    ground: { bg: "#E0C068", text: "#212121" },
    flying: { bg: "#A890F0", text: "#FFFFFF" },
    psychic: { bg: "#F85888", text: "#FFFFFF" },
    bug: { bg: "#A8B820", text: "#FFFFFF" },
    rock: { bg: "#B8A038", text: "#FFFFFF" },
    ghost: { bg: "#705898", text: "#FFFFFF" },
    dragon: { bg: "#7038F8", text: "#FFFFFF" },
    dark: { bg: "#705848", text: "#FFFFFF" },
    steel: { bg: "#B8B8D0", text: "#212121" },
    fairy: { bg: "#EE99AC", text: "#FFFFFF" },
    unknown: { bg: "#68A090", text: "#FFFFFF" }
  };
  
  const colors = typeColorMap[typeLower] || { bg: "#A8A878", text: "#FFFFFF" };
  
  // Size classes
  const sizeClasses = {
    'sm': 'px-2 py-0.5 text-xs',
    'md': 'px-3 py-1 text-sm',
    'lg': 'px-4 py-1.5 text-base'
  };
  
  const interactiveClasses = onClick ? 'cursor-pointer hover:opacity-90' : '';

  return (
    <span 
      className={`${sizeClasses[size]} rounded-full font-bold uppercase transition-all ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ 
        backgroundColor: colors.bg,
        color: colors.text,
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
          className={selectedTypes.includes(type) ? 'ring-2 ring-offset-1 ring-primary' : 'opacity-90'}
          onClick={() => toggleType(type)}
        />
      ))}
    </div>
  );
}

export default TypeBadge;
