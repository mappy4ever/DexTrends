import React from 'react';

// Direct type-to-color mapping for Pocket cards
const typeColors = {
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  grass: 'bg-green-500',
  electric: 'bg-yellow-400',
  lightning: 'bg-yellow-400', // Pocket alias for electric
  psychic: 'bg-pink-500',
  ice: 'bg-cyan-400',
  dragon: 'bg-indigo-600',
  dark: 'bg-gray-800',
  darkness: 'bg-gray-800', // Pocket alias for dark
  fairy: 'bg-pink-400',
  normal: 'bg-gray-400',
  fighting: 'bg-orange-600',
  flying: 'bg-indigo-400',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-600',
  rock: 'bg-stone-500',
  bug: 'bg-lime-400',
  ghost: 'bg-purple-600',
  steel: 'bg-slate-500',
  metal: 'bg-slate-500', // Pocket alias for steel
  colorless: 'bg-gray-300',
  trainer: 'bg-emerald-500'
};

// Type badge component for consistent display of Pokémon types
export function TypeBadge({ type, className = '', size = 'md', onClick = null, isPocketCard = false }) {
  // Defensive: always string, fallback to ''
  const typeStr = typeof type === 'string' ? type : '';
  const lowerType = typeStr.toLowerCase();
  
  // Get color class
  const colorClass = typeColors[lowerType] || 'bg-gray-200';
  
  // Size classes
  const sizeClass = {
    'list': 'size-list',
    'sm': 'size-sm',
    'md': 'size-md',
    'lg': 'size-lg'
  }[size] || 'size-md';

  const interactiveClasses = onClick ? 'cursor-pointer hover:scale-105' : 'hover:scale-105';

  // Display name
  const displayType = typeStr
    ? typeStr.charAt(0).toUpperCase() + typeStr.slice(1)
    : 'Unknown';

  return (
    <span
      className={`type-badge ${colorClass} ${sizeClass} ${interactiveClasses} transition-transform duration-200 ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {displayType}
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
