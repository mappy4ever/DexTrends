import React, { useState, useMemo, memo } from "react";
import Image from "next/image";
import Modal from '@/components/ui/Modal';
import type { PocketRarity } from "@/types/api/pocket-cards";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { InlineLoader } from '@/components/ui/SkeletonLoadingSystem';
import { CardGridSkeleton } from "./ui/Skeleton";
import { FaCrown } from "react-icons/fa";
import { ErrorBoundaryWrapper } from "./ui/ErrorBoundary";
import type { PocketCard } from "../types/api/pocket-cards";

// Extended interface for pocket cards with additional display properties
interface ExtendedPocketCard extends PocketCard {
  health?: string | number;
  pack?: string;
  ex?: "Yes" | "No";
  fullart?: "Yes" | "No";
  type?: string;
}

// Re-added type - used by pages
type RarityFilter = "all" | "◊" | "◊◊" | "◊◊◊" | "◊◊◊◊" | "★" | "☆☆" | "★★" | "fullart" | "immersive";

// Card display variant type
type CardVariant = 'default' | 'clean';


// Pocket Card wrapper props
interface PocketCardProps {
  card: ExtendedPocketCard;
  cardClassName?: string;
  showRarity: boolean;
  rarity?: string;
  cardFeatures?: unknown;
  setZoomedCard?: (card: ExtendedPocketCard | null) => void;
  imageWidth: number;
  imageHeight: number;
  onCardClick?: (card: ExtendedPocketCard) => void;
  variant?: CardVariant;
}

// Pocket Card wrapper with new glass design
const PocketCard = memo<PocketCardProps>(({
  card,
  cardClassName,
  showRarity,
  setZoomedCard,
  imageWidth,
  imageHeight,
  onCardClick,
  variant = 'default'
}) => {
  // Parse card details
  const setId = card.id?.split('-')[0]?.toUpperCase() || 'A1';
  const cardNumber = card.id?.split('-')[1] || '???';

  // Get rarity display
  const getRarityDisplay = (rarity?: string) => {
    if (!rarity) return null;
    // Don't display symbol for Crown Rare as we'll use FaCrown icon
    if (rarity === '👑' || rarity === '♕') return null;
    // Convert outline stars (☆) to filled stars (★) for better visual impact
    // Convert outline diamonds (◊) to filled diamonds (♦) with grey color
    let displayRarity = rarity
      .replace(/☆/g, '★')  // Replace white/outline stars with black/filled stars
      .replace(/◊/g, '♦');  // Replace outline diamonds with filled diamonds
    return displayRarity;
  };


  // Check if rarity should have gold/shiny text
  const isGoldRarity = (rarity?: string) => {
    if (!rarity) return false;
    // Crown Rare uses FaCrown icon, not gold text
    if (rarity === '👑' || rarity === '♕') return false;
    // Always apply gold styling to star rarities
    // Check for both black star (★) and white star (☆) and other star variations
    return rarity.includes('★') || rarity.includes('☆') || rarity.includes('⭐') ||
           rarity === '☆☆' || rarity === '☆☆☆';
  };

  // Get subtle type-based gradient for card background
  const getTypeGradient = (type?: string) => {
    if (!type) return '';
    const typeColors: Record<string, string> = {
      'grass': 'from-green-100/60 via-green-50/40 via-70% to-transparent',
      'fire': 'from-red-100/60 via-orange-50/40 via-70% to-transparent',
      'water': 'from-amber-100/60 via-amber-50/40 via-70% to-transparent',
      'lightning': 'from-yellow-100/60 via-amber-50/40 via-70% to-transparent',
      'electric': 'from-yellow-100/60 via-amber-50/40 via-70% to-transparent',
      'psychic': 'from-amber-100/60 via-amber-50/40 via-70% to-transparent',
      'fighting': 'from-orange-100/60 via-red-50/40 via-70% to-transparent',
      'darkness': 'from-amber-100/60 via-stone-50/40 via-70% to-transparent',
      'dark': 'from-amber-100/60 via-stone-50/40 via-70% to-transparent',
      'metal': 'from-stone-100/60 via-stone-50/40 via-70% to-transparent',
      'steel': 'from-stone-100/60 via-stone-50/40 via-70% to-transparent',
      'dragon': 'from-amber-100/60 via-amber-50/40 via-70% to-transparent',
      'colorless': 'from-stone-50/60 via-stone-50/40 via-70% to-transparent',
      'fairy': 'from-pink-100/60 via-rose-50/40 via-70% to-transparent',
    };
    const typeLower = type.toLowerCase();
    return typeColors[typeLower] || '';
  };

  // Clean variant - minimal, space-efficient design with subtle black outline
  if (variant === 'clean') {
    return (
      <div
        className="clean-card-with-info group cursor-pointer"
        onClick={() => onCardClick?.(card)}
      >
        <div className="clean-card-image-wrapper">
          <img
            src={card.image || '/back-card.png'}
            alt={card.name}
            className="clean-card-image"
            loading="lazy"
          />
          {/* Magnify Button */}
          {setZoomedCard && (
            <button
              className="clean-card-magnify"
              onClick={(e) => {
                e.stopPropagation();
                setZoomedCard(card);
              }}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
          {/* Hover overlay with name */}
          <div className="clean-card-overlay">
            <span className="clean-card-name">{card.name}</span>
          </div>
        </div>
        {/* Minimal info below card */}
        <div className="clean-card-info">
          <span className="clean-card-info-name">{card.name}</span>
        </div>
      </div>
    );
  }

  // Default variant - original glass design
  return (
    <div className="group relative">
      {/* Main Card Container - Mobile Optimized Glass */}
      <div
        className={`
          backdrop-blur-xl bg-white/90 dark:bg-stone-800/90
          rounded-xl p-2 sm:p-3
          border-2 border-stone-300/50 dark:border-stone-600/50
          shadow-lg hover:shadow-2xl
          transform transition-all duration-150
          hover:scale-[1.02] hover:-translate-y-1
          cursor-pointer
          drop-shadow-md
          relative overflow-visible
          min-h-[240px]
          ${cardClassName}
        `}
        onClick={() => onCardClick?.(card)}
      >
        {/* Subtle type-based gradient overlay */}
        {card.type && (
          <div className={`absolute inset-0 bg-gradient-to-b ${getTypeGradient(card.type)} pointer-events-none rounded-xl opacity-80`} />
        )}

        {/* Card content with relative positioning to be above gradient */}
        <div className="relative z-10 flex flex-col h-full">
        {/* Compact Image Container */}
        <div className="relative rounded-xl overflow-hidden mb-2 bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-700 dark:to-stone-800 flex-shrink-0">
          <div className="aspect-[110/154] relative">
            <img
              src={card.image || '/back-card.png'}
              alt={card.name}
              width={imageWidth}
              height={imageHeight}
              className="absolute inset-0 w-full h-full object-contain"
              loading="lazy"
            />
          </div>


          {/* Magnify Button - Small and Subtle */}
          {setZoomedCard && (
            <button
              className="
                absolute bottom-1 right-1
                w-6 h-6 rounded-full
                backdrop-blur-md bg-white/70 dark:bg-stone-800/70
                flex items-center justify-center
                shadow-sm border border-white/30
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
              "
              onClick={(e) => {
                e.stopPropagation();
                setZoomedCard(card);
              }}
            >
              <svg className="w-3 h-3 text-stone-600 dark:text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
        </div>

        {/* Card Info Section - Two Rows */}
        <div className="space-y-1 flex-grow flex flex-col justify-end pb-1">
          {/* First Row - Card Name (Centered) */}
          <div className="px-1 text-center">
            <span className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 line-clamp-2 break-words">
              {card.name}
            </span>
          </div>

          {/* Second Row - Set Info and Rarity (Switched) */}
          <div className="flex items-center justify-between px-1 gap-1 flex-shrink-0">
            {/* Set Badge with Card Number (Now on Left) */}
            <span className="
              text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full
              bg-stone-100/70 dark:bg-stone-700/70
              text-stone-600 dark:text-stone-300
              font-medium
              truncate max-w-[60%]
            ">
              {setId} #{cardNumber}
            </span>

            {/* Rarity Display (Now on Right) */}
            {showRarity && card.rarity && (
              <div className="flex-shrink-0">
                {/* Check for Crown Rare specifically */}
                {(card.rarity === ('👑' as PocketRarity) || card.rarity === ('♕' as PocketRarity)) ? (
                  // Crown - Smaller size, raised higher
                  <FaCrown className="text-amber-500 -mt-1" size={16} />
                ) : isGoldRarity(card.rarity) ? (
                  // Other gold rarities (stars) - same color as crown
                  <span className="font-bold text-amber-500 text-sm">
                    {getRarityDisplay(card.rarity)}
                  </span>
                ) : (
                  // Non-gold rarities (diamonds) - all use same purple-pink palette
                  <span className="text-sm font-bold bg-gradient-to-r from-amber-300 via-amber-300 to-amber-300 bg-clip-text text-transparent">
                    {getRarityDisplay(card.rarity)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
});

PocketCard.displayName = 'PocketCard';

// Component props
interface PocketCardListProps {
  cards: ExtendedPocketCard[];
  loading: boolean;
  error?: string;
  emptyMessage?: string;
  hideCardCount?: boolean;
  cardClassName?: string;
  gridClassName?: string;
  showPack?: boolean;
  showRarity?: boolean;
  showHP?: boolean; // Re-added - used by pages
  showSort?: boolean;
  itemsPerPage?: number;
  imageWidth?: number;
  imageHeight?: number;
  selectedRarityFilter?: string | RarityFilter; // Re-added - used by pages
  onCardClick?: (card: ExtendedPocketCard) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Display variant: 'default' for current glass design, 'clean' for minimal Pokemon Zone style */
  variant?: CardVariant;
}

// Helper interface for parsed card ID
interface ParsedCardId {
  setCode: string;
  number: number;
  isPromo: boolean;
}

// PocketCardList: displays cards from the Pocket API with enhanced visual design
function PocketCardListInner({
  cards,
  loading,
  error,
  emptyMessage = "No Pocket cards found.",
  hideCardCount = false,
  cardClassName = "",
  gridClassName = "",
  showRarity = true,
  showSort = true,
  imageWidth = 110, // 50% smaller than 220
  imageHeight = 154, // 50% smaller than 308
  onCardClick,
  searchValue = '',
  onSearchChange,
  variant = 'default'
}: PocketCardListProps) {
  const [zoomedCard, setZoomedCard] = useState<ExtendedPocketCard | null>(null);
  const [sortOption, setSortOption] = useState<string>("number");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Helper function to parse set code and number for sorting
  const parseCardId = (cardId: string): ParsedCardId => {
    if (!cardId) return { setCode: 'zzz', number: 9999, isPromo: false };
    
    const id = cardId.toLowerCase();
    
    // Check if it's a promo card
    const isPromo = id.includes('promo') || id.includes('p-') || id.includes('-p');
    
    // Parse set code and number (e.g., "a1-001", "a2b-045")
    const parts = id.split('-');
    if (parts.length >= 2) {
      const setCode = parts[0];
      const number = parseInt(parts[1]) || 0;
      return { setCode, number, isPromo };
    }
    
    // Fallback for cards without proper format
    return { setCode: 'zzz', number: 9999, isPromo };
  };

  // Sorting logic for Pocket cards
  const sortedCards = useMemo(() => {
    const sorted = [...cards].sort((a, b) => {
      let result = 0;
      
      switch (sortOption) {
        case "name":
          result = a.name.localeCompare(b.name);
          break;
        case "number":
          const parsedA = parseCardId(a.id);
          const parsedB = parseCardId(b.id);

          // Promos go to the end
          if (parsedA.isPromo !== parsedB.isPromo) {
            result = parsedA.isPromo ? 1 : -1;
          } else {
            // Sort by set code first (A1, A1a, A2, A2a, A2b, etc.)
            const setCompare = parsedA.setCode.localeCompare(parsedB.setCode);
            if (setCompare !== 0) {
              result = setCompare;
            } else {
              // Then by number within the set
              result = parsedA.number - parsedB.number;
            }
          }
          break;
        case "hp":
          const hpA = parseInt(String(a.health || a.hp || 0)) || 0;
          const hpB = parseInt(String(b.health || b.hp || 0)) || 0;
          // Cards without HP (Trainers) go to end
          if (hpA === 0 && hpB === 0) {
            result = 0;
          } else if (hpA === 0) {
            result = 1;
          } else if (hpB === 0) {
            result = -1;
          } else {
            result = hpA - hpB;
          }
          break;
        case "rarity":
          const rarityOrder: Record<string, number> = {
            '👑': 8,     // Crown - highest
            '★★★': 7,   // Three stars
            '★★': 6,    // Two stars
            '★': 5,     // One star
            '◊◊◊◊': 4,  // Four diamonds
            '◊◊◊': 3,   // Three diamonds
            '◊◊': 2,    // Two diamonds
            '◊': 1      // One diamond
          };
          result = (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0); // Will be reversed if desc
          break;
        case "category": {
          // Sort by supertype: Pokemon first, then Trainer, then Energy
          const categoryOrder: Record<string, number> = {
            'Pokémon': 1,
            'Pokemon': 1,
            'Trainer': 2,
            'Energy': 3
          };
          const supertypeA = String(a.supertype || '');
          const supertypeB = String(b.supertype || '');
          const catA = categoryOrder[supertypeA] || 4;
          const catB = categoryOrder[supertypeB] || 4;
          if (catA !== catB) {
            result = catA - catB;
          } else if (supertypeA.toLowerCase() === 'trainer') {
            // Within Trainers, sort by subtype: Supporter > Item > Tool > Fossil
            const trainerOrder: Record<string, number> = {
              'supporter': 1, 'Supporter': 1,
              'item': 2, 'Item': 2,
              'tool': 3, 'Tool': 3,
              'fossil': 4, 'Fossil': 4
            };
            const subA = trainerOrder[(a.subtypes?.[0] || a.type || '').toLowerCase()] || 5;
            const subB = trainerOrder[(b.subtypes?.[0] || b.type || '').toLowerCase()] || 5;
            result = subA - subB;
          } else {
            result = 0;
          }
          break;
        }
        case "type": {
          // Sort by energy type with proper ordering
          const typeOrder: Record<string, number> = {
            'grass': 1, 'Grass': 1,
            'fire': 2, 'Fire': 2,
            'water': 3, 'Water': 3,
            'lightning': 4, 'Lightning': 4, 'electric': 4, 'Electric': 4,
            'psychic': 5, 'Psychic': 5,
            'fighting': 6, 'Fighting': 6,
            'darkness': 7, 'Darkness': 7, 'dark': 7, 'Dark': 7,
            'metal': 8, 'Metal': 8, 'steel': 8, 'Steel': 8,
            'dragon': 9, 'Dragon': 9,
            'colorless': 10, 'Colorless': 10,
            'fairy': 11, 'Fairy': 11,
            // Trainer types go after energy types
            'supporter': 20, 'Supporter': 20,
            'item': 21, 'Item': 21,
            'tool': 22, 'Tool': 22,
            'fossil': 23, 'Fossil': 23
          };
          const typeA = a.types?.[0] || a.type || '';
          const typeB = b.types?.[0] || b.type || '';
          const orderA = typeOrder[typeA] || typeOrder[typeA.toLowerCase()] || 99;
          const orderB = typeOrder[typeB] || typeOrder[typeB.toLowerCase()] || 99;
          result = orderA - orderB;
          break;
        }
        case "pack":
          const packA = a.pack || '';
          const packB = b.pack || '';
          result = packA.localeCompare(packB);
          break;
        case "ex":
          const exA = a.ex === "Yes" ? 1 : 0;
          const exB = b.ex === "Yes" ? 1 : 0;
          result = exA - exB; // Will be reversed if desc
          break;
        case "fullart":
          const faA = a.fullart === "Yes" ? 1 : 0;
          const faB = b.fullart === "Yes" ? 1 : 0;
          result = faA - faB; // Will be reversed if desc
          break;
        default:
          return 0;
      }
      
      // Apply sort direction
      return sortDirection === 'desc' ? -result : result;
    });
    
    return sorted;
  }, [cards, sortOption, sortDirection]);

  // Infinite scroll for cards
  const { visibleItems: displayedCards, hasMore, isLoading: scrollLoading, sentinelRef } = useInfiniteScroll(
    sortedCards, 
    24, // Initial visible count
    12  // Load 12 more at a time
  );


  if (loading) {
    return (
      <CardGridSkeleton 
        count={20}
        cols={{ default: 2, sm: 3, md: 4, lg: 5 }}
        cardProps={{
          showPrice: false,
          showTypes: true
        }}
        className="animate-fadeIn"
      />
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-24 h-24 mb-6">
          <svg className="w-24 h-24 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-red-600">Error Loading Cards</h3>
        <p className="text-stone-600 dark:text-stone-300 mt-2">{error}</p>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg className="w-16 h-16 text-stone-400 dark:text-stone-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-medium text-stone-600 dark:text-stone-300">{emptyMessage}</h3>
      </div>
    );
  }
  
  return (
    <>
    {/* Search and Sort Controls in One Row */}
    {((showSort || onSearchChange) && cards.length > 0) && (
      <div className="flex justify-between items-center mb-6 gap-4">
        {/* Search Bar on Left */}
        {onSearchChange && (
          <div className="relative flex-1 max-w-xs bg-stone-50/90 dark:bg-stone-800/90 rounded-full p-1 shadow-lg border border-stone-300 dark:border-stone-700/40">
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-1.5 bg-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:ring-offset-0 transition-all text-stone-900 dark:text-white placeholder-stone-400"
                placeholder="Search cards..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  outline: 'none',
                  boxShadow: 'none'
                }}
              />
              {searchValue && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
                  onClick={() => onSearchChange('')}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Sort Controls on Right */}
        {showSort && (
        <div className="
          backdrop-blur-md bg-white/80 dark:bg-stone-800/80
          rounded-full px-4 py-2
          border border-white/40 dark:border-stone-700/40
          shadow-lg
          inline-flex items-center gap-2
        ">
          <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 mr-1">Sort by:</span>
          
          {/* Sort by Collector # */}
          <button
            onClick={() => {
              if (sortOption === 'number') {
                setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setSortOption('number');
                setSortDirection('asc');
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-md border inline-flex items-center gap-1 ${
              sortOption === 'number'
                ? 'bg-gradient-to-r from-amber-100/80 to-amber-100/80 dark:from-amber-900/30 dark:to-amber-900/30 border-amber-300/50 text-amber-700 dark:text-amber-300'
                : 'bg-white/60 dark:bg-stone-800/60 border-white/30 text-stone-600 dark:text-stone-300 hover:bg-white/80'
            }`}
          >
            <span>Collector #</span>
            {sortOption === 'number' && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            )}
          </button>

          {/* Sort by Name */}
          <button
            onClick={() => {
              if (sortOption === 'name') {
                setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setSortOption('name');
                setSortDirection('asc');
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-md border inline-flex items-center gap-1 ${
              sortOption === 'name'
                ? 'bg-gradient-to-r from-amber-100/80 to-amber-100/80 dark:from-amber-900/30 dark:to-amber-900/30 border-amber-300/50 text-amber-700 dark:text-amber-300'
                : 'bg-white/60 dark:bg-stone-800/60 border-white/30 text-stone-600 dark:text-stone-300 hover:bg-white/80'
            }`}
          >
            <span>Name</span>
            {sortOption === 'name' && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            )}
          </button>

          {/* Sort by Rarity */}
          <button
            onClick={() => {
              if (sortOption === 'rarity') {
                setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setSortOption('rarity');
                setSortDirection('desc'); // Default to highest rarity first
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-md border inline-flex items-center gap-1 ${
              sortOption === 'rarity'
                ? 'bg-gradient-to-r from-amber-100/80 to-amber-100/80 dark:from-amber-900/30 dark:to-amber-900/30 border-amber-300/50 text-amber-700 dark:text-amber-300'
                : 'bg-white/60 dark:bg-stone-800/60 border-white/30 text-stone-600 dark:text-stone-300 hover:bg-white/80'
            }`}
          >
            <span>Rarity</span>
            {sortOption === 'rarity' && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            )}
          </button>
          
          {/* Sort by Type */}
          <button
            onClick={() => {
              if (sortOption === 'type') {
                setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setSortOption('type');
                setSortDirection('asc');
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-md border inline-flex items-center gap-1 ${
              sortOption === 'type'
                ? 'bg-gradient-to-r from-amber-100/80 to-amber-100/80 dark:from-amber-900/30 dark:to-amber-900/30 border-amber-300/50 text-amber-700 dark:text-amber-300'
                : 'bg-white/60 dark:bg-stone-800/60 border-white/30 text-stone-600 dark:text-stone-300 hover:bg-white/80'
            }`}
          >
            <span>Type</span>
            {sortOption === 'type' && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            )}
          </button>

          {/* Sort by HP */}
          <button
            onClick={() => {
              if (sortOption === 'hp') {
                setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setSortOption('hp');
                setSortDirection('desc'); // Default to highest HP first
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-md border inline-flex items-center gap-1 ${
              sortOption === 'hp'
                ? 'bg-gradient-to-r from-amber-100/80 to-amber-100/80 dark:from-amber-900/30 dark:to-amber-900/30 border-amber-300/50 text-amber-700 dark:text-amber-300'
                : 'bg-white/60 dark:bg-stone-800/60 border-white/30 text-stone-600 dark:text-stone-300 hover:bg-white/80'
            }`}
          >
            <span>HP</span>
            {sortOption === 'hp' && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            )}
          </button>

          {/* Sort by Category (Pokemon/Trainer/Energy) */}
          <button
            onClick={() => {
              if (sortOption === 'category') {
                setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setSortOption('category');
                setSortDirection('asc'); // Pokemon first, then Trainer, then Energy
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-md border inline-flex items-center gap-1 ${
              sortOption === 'category'
                ? 'bg-gradient-to-r from-amber-100/80 to-amber-100/80 dark:from-amber-900/30 dark:to-amber-900/30 border-amber-300/50 text-amber-700 dark:text-amber-300'
                : 'bg-white/60 dark:bg-stone-800/60 border-white/30 text-stone-600 dark:text-stone-300 hover:bg-white/80'
            }`}
          >
            <span>Category</span>
            {sortOption === 'category' && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            )}
          </button>
        </div>
        )}
      </div>
    )}
    
    <div className={gridClassName || (variant === 'clean' ? "clean-card-grid" : "grid grid-cols-2 min-420:grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 min-420:gap-3 sm:gap-4")}>
      {displayedCards.map((card, _index) => {
        return (
          <PocketCard
            key={card.id}
            card={card}
            cardClassName={cardClassName}
            showRarity={showRarity}
            setZoomedCard={setZoomedCard}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            onCardClick={onCardClick}
            variant={variant}
          />
        );
      })}
    </div>

    {/* Intersection Observer sentinel for infinite scroll */}
    {hasMore && (
      <div 
        ref={sentinelRef} 
        className="h-20 w-full flex items-center justify-center transition-all duration-300"
        style={{ minHeight: '80px' }}
      >
        {scrollLoading ? (
          <InlineLoader text="Loading more cards..." />
        ) : (
          <div className="h-20" /> 
        )}
      </div>
    )}

    {/* Cards Count Info */}
    {!hideCardCount && sortedCards.length > 0 && (
      <div className="text-center mt-4 text-sm text-stone-600 dark:text-stone-300">
        Showing {displayedCards.length} of {sortedCards.length} cards
        {hasMore && !scrollLoading && (
          <div className="text-xs text-primary mt-1">
            Scroll down to load more...
          </div>
        )}
      </div>
    )}

    {!hideCardCount && !scrollLoading && !hasMore && sortedCards.length > 0 && (
      <div className="text-center mt-4 text-sm text-stone-500 dark:text-stone-300">
        All {sortedCards.length} cards loaded
      </div>
    )}
    
    {/* Zoom Modal */}
    {zoomedCard && (
      <Modal 
        isOpen={true} 
        onClose={() => setZoomedCard(null)}
        showCloseButton={true}
        closeOnBackdrop={true}
      >
        <div className="flex flex-col items-center">
          <Image
            src={zoomedCard.image || "/back-card.png"}
            alt={zoomedCard.name}
            width={400}
            height={560}
            className="rounded-lg shadow-lg"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aaAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
            sizes="400px"
          />
          <h3 className="mt-4 text-xl font-bold text-center">{zoomedCard.name}</h3>
          {zoomedCard.pack && (
            <p className="text-stone-600 dark:text-stone-300 mt-2">{zoomedCard.pack}</p>
          )}
        </div>
      </Modal>
    )}
    </>
  );
}

// Export component wrapped with error boundary
export default function PocketCardList(props: PocketCardListProps) {
  return (
    <ErrorBoundaryWrapper
      context="PocketCardList"
      fallback={
        <div className="min-h-96 flex items-center justify-center p-8">
          <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 text-center max-w-md shadow-md">
            <div className="text-4xl mb-4">🎴</div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Unable to load cards</h3>
            <p className="text-stone-600 mb-4">There was an error loading the Pocket cards. Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      }
    >
      <PocketCardListInner {...props} />
    </ErrorBoundaryWrapper>
  );
}