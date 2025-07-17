import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TypeBadge } from './TypeBadge';

interface TCGPrices {
  normal?: {
    market?: number;
    [key: string]: any;
  };
  holofoil?: {
    market?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

interface Card {
  id: string;
  name: string;
  images?: {
    small?: string;
    [key: string]: any;
  };
  image?: string;
  set?: {
    name: string;
    [key: string]: any;
  };
  number?: string;
  types?: string[];
  hp?: string;
  rarity?: string;
  tcgplayer?: {
    prices: TCGPrices;
    [key: string]: any;
  };
  [key: string]: any;
}

type CardVariant = 'default' | 'compact' | 'detailed';

interface MobileCardProps {
  card: Card;
  variant?: CardVariant;
  showPrice?: boolean;
  onClick?: (card: Card) => void;
  className?: string;
}

/**
 * MobileCard - iPhone-optimized card component using the design system
 * Demonstrates proper implementation of touch targets, spacing, and typography
 */
const MobileCard: React.FC<MobileCardProps> = ({ 
  card, 
  variant = 'default',
  showPrice = false,
  onClick,
  className = ''
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent click if tapping on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) return;
    
    if (onClick) {
      onClick(card);
    }
  };

  return (
    <div 
      className={`
        card-ios 
        mobile-card 
        group 
        relative 
        ${variant === 'compact' ? 'p-3' : 'p-4'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Card Image Container */}
      <div className="relative aspect-[3/4] mb-3 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={card.images?.small || card.image || '/back-card.png'}
          alt={card.name}
          fill
          sizes="(max-width: 375px) 150px, (max-width: 430px) 180px, 200px"
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
        />
        
        {/* Hover Overlay - Touch optimized */}
        <div className="absolute inset-0 bg-black/0 group-active:bg-black/10 transition-colors duration-150" />
        
        {/* Quick Action Button */}
        {variant !== 'compact' && (
          <button 
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity touch-target"
            onClick={(e) => {
              e.stopPropagation();
              // Handle quick action
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="space-y-2">
        {/* Card Name */}
        <h3 className={`
          font-medium 
          ${variant === 'compact' ? 'text-sm' : 'text-base'} 
          ${variant === 'detailed' ? 'text-lg' : ''}
          line-clamp-1
        `}>
          {card.name}
        </h3>

        {/* Card Meta Info */}
        {variant !== 'compact' && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            {card.set?.name && (
              <>
                <span className="truncate">{card.set.name}</span>
                {card.number && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span>#{card.number}</span>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Type Badges */}
        {card.types && card.types.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {card.types.map(type => (
              <TypeBadge 
                key={type} 
                type={type} 
                size={variant === 'compact' ? 'xs' : 'sm'}
              />
            ))}
          </div>
        )}

        {/* Additional Info */}
        {variant === 'detailed' && (
          <div className="pt-2 space-y-1">
            {card.hp && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">HP</span>
                <span className="text-sm font-semibold text-red-600">{card.hp}</span>
              </div>
            )}
            
            {card.rarity && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Rarity</span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                  {card.rarity}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Price Display */}
        {showPrice && card.tcgplayer?.prices && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Market</span>
              <span className="text-sm font-semibold text-green-600">
                ${card.tcgplayer.prices.holofoil?.market || card.tcgplayer.prices.normal?.market || '—'}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        {variant === 'detailed' && (
          <Link 
            href={`/cards/${card.id}`}
            className="btn-ios btn-ios-secondary w-full mt-3 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

interface MobileCardListItemProps {
  card: Card;
  onClick?: (card: Card) => void;
}

// Compact List Item Variant
export const MobileCardListItem: React.FC<MobileCardListItemProps> = ({ card, onClick }) => (
  <div 
    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 touch-target cursor-pointer active:bg-gray-50 transition-colors"
    onClick={() => onClick?.(card)}
  >
    {/* Thumbnail */}
    <div className="relative w-12 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
      <Image
        src={card.images?.small || card.image || '/back-card.png'}
        alt={card.name}
        fill
        sizes="48px"
        className="object-cover"
      />
    </div>
    
    {/* Content */}
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-sm truncate">{card.name}</h4>
      <p className="text-xs text-gray-600 truncate">
        {card.set?.name} • #{card.number}
      </p>
    </div>
    
    {/* Chevron */}
    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </div>
);

interface MobileCardGridProps {
  cards: Card[];
  variant?: CardVariant;
  columns?: 2 | 3 | 'auto';
}

// Grid Layout Helper
export const MobileCardGrid: React.FC<MobileCardGridProps> = ({ cards, variant = 'default', columns = 'auto' }) => {
  const getGridClass = (): string => {
    switch (columns) {
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 'auto':
      default:
        return 'grid-cols-2 sm:grid-cols-3';
    }
  };

  return (
    <div className={`grid ${getGridClass()} gap-3 sm:gap-4`}>
      {cards.map(card => (
        <MobileCard 
          key={card.id} 
          card={card} 
          variant={variant}
        />
      ))}
    </div>
  );
};

export default MobileCard;