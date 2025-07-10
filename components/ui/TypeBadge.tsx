import React, { useState } from 'react';
import Image from 'next/image';
import { typeColors, tcgTypeColors } from '../../utils/pokemonutils';
import { getTypeIcon } from '../../utils/scrapedImageMapping';
import { getTypeStyle } from '../../utils/pokemonTypeColors';

// Type badge component for consistent display of Pokémon types
interface TypeBadgeProps {
  type: string;
  className?: string;
  size?: 'xxs' | 'xs' | 'list' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: ((type?: string) => void) | null;
  isPocketCard?: boolean;
  showIcon?: boolean;
  iconStyle?: 'battrio' | 'pokemon' | 'sv';
}

export function TypeBadge({ 
  type, 
  className = '', 
  size = 'md', 
  onClick = null, 
  isPocketCard = false,
  showIcon = false,
  iconStyle = 'sv'
}: TypeBadgeProps) {
  const [iconError, setIconError] = useState(false);
  
  // Defensive: always string, fallback to ''
  const typeStr = typeof type === 'string' ? type : '';
  const lowerType = typeStr.toLowerCase();
  
  // Use appropriate color system based on mode
  const colorSystem = isPocketCard ? tcgTypeColors : typeColors;
  const colorConfig = (colorSystem as any)[lowerType] || { bg: 'bg-gray-200', text: 'text-gray-800' };
  const colorClass = colorConfig.bg;
  
  // Get exact type colors using inline styles to override any CSS conflicts
  const typeStyle = getTypeStyle(lowerType, isPocketCard);
  
  // Size classes
  const sizeClass = {
    'xxs': 'size-xxs',
    'xs': 'size-xs',
    'list': 'size-list',
    'sm': 'size-sm',
    'md': 'size-md',
    'lg': 'size-lg',
    'xl': 'size-xl'
  }[size] || 'size-md';

  // Size configurations for icon variant
  const sizeConfig = {
    'xxs': { badge: 'h-5 text-xs px-2', icon: 14 },
    'xs': { badge: 'h-6 text-xs px-2', icon: 16 },
    'list': { badge: 'h-7 text-sm px-2.5', icon: 18 },
    'sm': { badge: 'h-8 text-sm px-3', icon: 20 },
    'md': { badge: 'h-10 text-base px-4', icon: 24 },
    'lg': { badge: 'h-12 text-lg px-5', icon: 28 },
    'xl': { badge: 'h-14 text-xl px-6', icon: 32 }
  };
  
  const config = sizeConfig[size] || sizeConfig['md'];
  const iconPaths = showIcon ? getTypeIcon(lowerType, iconStyle) : [];

  const interactiveClasses = onClick ? 'cursor-pointer hover:scale-105' : 'hover:scale-105';

  // Display name
  const displayType = typeStr
    ? typeStr.charAt(0).toUpperCase() + typeStr.slice(1)
    : 'Unknown';

  const handleClick = onClick ? () => onClick(lowerType) : undefined;

  // Render with icon if requested
  if (showIcon) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full font-semibold ${config.badge} ${interactiveClasses} transition-transform duration-200 ${className}`}
        style={typeStyle}
        onClick={handleClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {/* Type Icon */}
        {!iconError && iconPaths.length > 0 && (
          <div className="relative" style={{ width: config.icon, height: config.icon }}>
            <Image
              src={iconPaths[0]}
              alt={`${typeStr} type`}
              width={config.icon}
              height={config.icon}
              objectFit="contain"
              onError={(e: any) => {
                const currentIndex = iconPaths.findIndex(p => e.target.src.includes(p));
                if (currentIndex < iconPaths.length - 1) {
                  e.target.src = iconPaths[currentIndex + 1];
                } else {
                  setIconError(true);
                }
              }}
            />
          </div>
        )}
        
        {/* Type Name */}
        <span className="capitalize">
          {displayType}
        </span>
      </div>
    );
  }

  // Standard badge without icon
  return (
    <span
      className={`type-badge ${sizeClass} ${interactiveClasses} transition-transform duration-200 ${className}`}
      style={typeStyle}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {displayType}
    </span>
  );
}

// Collection of all type badges for selection interfaces
interface TypeBadgeSelectorProps {
  selectedTypes?: string[];
  onChange?: (types: string[]) => void;
}

export function TypeBadgeSelector({ selectedTypes = [], onChange = () => {} }: TypeBadgeSelectorProps) {
  const allTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice', 
    'fighting', 'poison', 'ground', 'flying', 'psychic', 
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];
  
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter((t: any) => t !== type));
    } else {
      onChange([...selectedTypes, type]);
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      {allTypes.map((type: any) => (
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

// Export alias for backward compatibility
export const TypeBadgeWithIcon = TypeBadge;

export default TypeBadge;
