import React, { useState, useMemo, useCallback, memo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import Modal from '@/components/ui/Modal';
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { InlineLoader } from '@/components/ui/SkeletonLoadingSystem';
import { Skeleton as SmartSkeleton } from "./ui/Skeleton";
import PriceIndicator from './ui/PriceIndicator';
const PriceDisplay = PriceIndicator; // Alias for backward compatibility
import { ErrorBoundaryWrapper } from "./ui/ErrorBoundary";
import { RarityIcon } from './ui/RarityIcon';
import type { TCGCard } from "../types/api/cards";
import logger from "@/utils/logger";

// Dynamic import for react-window to reduce bundle size
const VirtualizedGrid = dynamic(
  () => import('react-window').then((mod) => ({ default: mod.FixedSizeGrid })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-stone-200 h-96 rounded-lg" />
  }
);

// Card display variant type
type CardVariant = 'default' | 'clean';

// TCG Card wrapper props
interface TCGCardProps {
  card: TCGCard;
  cardClassName?: string;
  showPrice: boolean;
  showRarity: boolean;
  showSet: boolean;
  setZoomedCard?: (card: TCGCard | null) => void;
  imageWidth: number;
  imageHeight: number;
  onCardClick?: (card: TCGCard) => void;
  getPrice?: (card: TCGCard) => number;
  variant?: CardVariant;
}


// Helper function to determine the actual rarity based on card data
const getActualRarity = (card: TCGCard): string => {
  // If the rarity is already "Black White Rare" (note: no & in API response), keep it
  if (card.rarity === 'Black White Rare') {
    return 'Black & White Rare'; // Add the & for display
  }
  
  // Check if it's a secret rare (card number > set total)
  const cardNumber = parseInt(card.number);
  const setTotal = card.set.printedTotal;
  const isSecretRare = cardNumber > setTotal;
  
  // Specific cards that should be Black & White Rare
  // Victini from both White Flare and Black Bolt returns "Rare" but should be "Black & White Rare"
  const isBlackWhiteStyleRare = 
    (card.name === 'Victini' && card.number === '172' && card.set.id === 'rsv10pt5') || // White Flare
    (card.name === 'Victini' && card.number === '171' && card.set.id === 'zsv10pt5');    // Black Bolt
  
  if (isBlackWhiteStyleRare) {
    return 'Black & White Rare';
  }
  
  // Black & White era sets (bw1-bw11, including Noble Victories)
  const blackWhiteSets = [
    'bw1', 'bw2', 'bw3', 'bw4', 'bw5', 'bw6', 'bw7', 'bw8', 'bw9', 'bw10', 'bw11',
    'bwp', 'dv1', 'bct', 'lds'
  ];
  
  const isBlackWhiteSet = blackWhiteSets.includes(card.set.id.toLowerCase());
  
  // If it's a regular Black & White era card with "Rare" rarity and has holofoil prices, it's "Rare Holo"
  if (isBlackWhiteSet && card.rarity === 'Rare' && card.tcgplayer?.prices?.holofoil) {
    return 'Rare Holo';
  }
  
  // For other sets, if rarity is "Rare" and has holofoil but no normal prices, it's likely "Rare Holo"
  if (card.rarity === 'Rare' && card.tcgplayer?.prices?.holofoil && !card.tcgplayer?.prices?.normal) {
    return 'Rare Holo';
  }
  
  return card.rarity || 'Common';
};

// TCG Card wrapper with glass design matching PocketCard
const TCGCardItem = memo<TCGCardProps>(({
  card,
  cardClassName,
  showPrice,
  showRarity,
  showSet,
  setZoomedCard,
  imageWidth,
  imageHeight,
  onCardClick,
  getPrice,
  variant = 'default'
}) => {
  const router = useRouter();
  // Get card details
  const setId = card.set?.id || '';
  const setName = card.set?.name || '';
  const cardNumber = card.number || '???';
  const price = getPrice ? getPrice(card) : 0;

  // Get subtle type-based gradient for card background
  const getTypeGradient = (types?: string[]) => {
    if (!types || types.length === 0) return '';
    const primaryType = types[0].toLowerCase();

    const typeColors: Record<string, string> = {
      'grass': 'from-green-100/60 via-green-50/40 via-70% to-transparent',
      'fire': 'from-red-100/60 via-orange-50/40 via-70% to-transparent',
      'water': 'from-amber-100/60 via-cyan-50/40 via-70% to-transparent',
      'lightning': 'from-yellow-100/60 via-amber-50/40 via-70% to-transparent',
      'electric': 'from-yellow-100/60 via-amber-50/40 via-70% to-transparent',
      'psychic': 'from-amber-100/60 via-pink-50/40 via-70% to-transparent',
      'fighting': 'from-orange-100/60 via-red-50/40 via-70% to-transparent',
      'darkness': 'from-amber-100/60 via-stone-50/40 via-70% to-transparent',
      'dark': 'from-amber-100/60 via-stone-50/40 via-70% to-transparent',
      'metal': 'from-stone-100/60 via-stone-50/40 via-70% to-transparent',
      'steel': 'from-stone-100/60 via-stone-50/40 via-70% to-transparent',
      'dragon': 'from-amber-100/60 via-amber-50/40 via-70% to-transparent',
      'colorless': 'from-stone-50/60 via-stone-50/40 via-70% to-transparent',
      'fairy': 'from-pink-100/60 via-rose-50/40 via-70% to-transparent',
    };

    return typeColors[primaryType] || '';
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
            src={card.images?.small || '/back-card.png'}
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
          <button
            className="clean-card-info-name hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/cards/${card.id}`);
            }}
          >
            {card.name}
          </button>
          {showPrice && price > 0 && (
            <div className="clean-card-info-price">${price.toFixed(2)}</div>
          )}
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
          bg-white dark:bg-stone-800/90
          rounded-xl p-2 sm:p-3
          border-2 border-stone-200/50 dark:border-stone-600/50
          shadow-lg hover:shadow-2xl
          transition-all duration-150
          hover:scale-[1.02] hover:-translate-y-1
          cursor-pointer
          drop-shadow-md
          relative overflow-visible
          min-h-[260px]
          ${cardClassName}
        `}
        onClick={(e) => {
          // Don't trigger if clicking on the card name link
          if ((e.target as HTMLElement).closest('.card-name-link')) {
            return;
          }
          onCardClick?.(card);
        }}
      >
        {/* Subtle type-based gradient overlay */}
        {card.types && (
          <div className={`absolute inset-0 bg-gradient-to-b ${getTypeGradient(card.types)} pointer-events-none rounded-xl opacity-80`} />
        )}

        {/* Rarity Badge - Top Right Corner in Circle */}
        {showRarity && card.rarity && (
          <div className="absolute top-3 right-3 z-20">
            <div className="
              w-8 h-8 rounded-full
              bg-white/80 dark:bg-stone-800/80
              border-2 border-stone-200/50 dark:border-stone-600/50
              shadow-lg
              flex items-center justify-center
              ring-1 ring-stone-300/50 dark:ring-stone-500/50
            ">
              <RarityIcon
                rarity={getActualRarity(card)}
                size="xs"
                showLabel={false}
              />
            </div>
          </div>
        )}

        {/* Card content with relative positioning to be above gradient */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Card Name at Top - Clickable for direct navigation */}
          <div className="px-1 mb-2 flex justify-center flex-shrink-0">
            <button
              className="card-name-link text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 block line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] text-center hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer px-1 sm:px-2 mr-6 sm:mr-8"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/cards/${card.id}`);
              }}
            >
              {/* Replace spaces and hyphens with non-breaking versions to keep names together */}
              {card.name
                .replace(/Team Rocket's/gi, "TR's") // Abbreviate Team Rocket's to TR's
                .replace(/ ex$/i, '\u00A0ex') // Keep 'ex' with the name
                .replace(/-/g, '\u2011') // Replace all hyphens with non-breaking hyphens
              }
            </button>
          </div>

          {/* Compact Image Container */}
          <div className="relative rounded-xl overflow-hidden mb-2 bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-700 dark:to-stone-800 flex-shrink-0">
            <div className="aspect-[110/154] relative">
              <img
                src={card.images?.small || '/back-card.png'}
                alt={card.name}
                width={imageWidth}
                height={imageHeight}
                className="absolute inset-0 w-full h-full object-contain"
                loading="lazy"
              />
            </div>

            {/* Rarity display removed from image - now shown in bottom row */}

            {/* Magnify Button - Small and Subtle */}
            {setZoomedCard && (
              <button
                className="
                  absolute bottom-1 right-1
                  w-6 h-6 rounded-full
                  bg-white/70 dark:bg-stone-800/70
                  flex items-center justify-center
                  shadow-sm border border-stone-200/30
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

          {/* Bottom Info Row - Price and Set */}
          <div className="flex items-center justify-between px-1 gap-1">
            {/* Enhanced Price Display */}
            {showPrice && price > 0 && (
              <PriceDisplay
                price={price}
                size="sm"
                variant={price >= 100 ? 'premium' : price >= 50 ? 'sale' : 'default'}
                animated={true}
              />
            )}

            {/* Set Badge */}
            {showSet && (
              <span className="
                text-xs px-2 py-0.5 rounded-full
                bg-stone-100/70 dark:bg-stone-700/70
                text-stone-600 dark:text-stone-300
                font-medium
                truncate
              ">
                {setId} #{cardNumber}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

TCGCardItem.displayName = 'TCGCardItem';

// Component props
interface TCGCardListProps {
  cards: TCGCard[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  hideCardCount?: boolean;
  cardClassName?: string;
  gridClassName?: string;
  showPrice?: boolean;
  showRarity?: boolean;
  showSet?: boolean;
  showSort?: boolean;
  showSearch?: boolean;
  itemsPerPage?: number;
  imageWidth?: number;
  imageHeight?: number;
  onCardClick?: (card: TCGCard) => void;
  getPrice?: (card: TCGCard) => number;
  getReleaseDate?: (card: TCGCard) => string;
  getRarityRank?: (card: TCGCard) => number;
  /** Display variant: 'default' for current glass design, 'clean' for minimal Pokemon Zone style */
  variant?: CardVariant;
}

// TCGCardList: displays TCG cards with enhanced visual design matching PocketCardList
function TCGCardListInner({
  cards,
  loading = false,
  error,
  emptyMessage = "No cards found.",
  hideCardCount = false,
  cardClassName = "",
  gridClassName = "",
  showPrice = true,
  showRarity = true,
  showSet = true,
  showSort = true,
  showSearch = true,
  imageWidth = 110,
  imageHeight = 154,
  onCardClick,
  getPrice = () => 0,
  getReleaseDate = () => "0000-00-00",
  getRarityRank = () => 0,
  variant = 'default'
}: TCGCardListProps) {
  const [zoomedCard, setZoomedCard] = useState<TCGCard | null>(null);
  const [sortOption, setSortOption] = useState<string>("price");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchValue, setSearchValue] = useState<string>('');

  // Filter cards by search
  const searchedCards = useMemo(() => {
    if (!searchValue) return cards;
    const search = searchValue.toLowerCase();
    return cards.filter(card => 
      card.name.toLowerCase().includes(search) ||
      card.set?.name?.toLowerCase().includes(search) ||
      card.number?.includes(search)
    );
  }, [cards, searchValue]);

  // Sorting logic for TCG cards
  const sortedCards = useMemo(() => {
    const sorted = [...searchedCards].sort((a, b) => {
      let result = 0;
      
      switch (sortOption) {
        case "name":
          result = a.name.localeCompare(b.name);
          break;
        case "number":
          const numA = parseInt(a.number || '9999');
          const numB = parseInt(b.number || '9999');
          result = numA - numB;
          break;
        case "price":
          result = getPrice(a) - getPrice(b);
          break;
        case "releaseDate":
          result = new Date(getReleaseDate(a)).getTime() - new Date(getReleaseDate(b)).getTime();
          break;
        case "rarity":
          result = getRarityRank(a) - getRarityRank(b);
          break;
        default:
          return 0;
      }
      
      // Apply sort direction
      return sortDirection === 'desc' ? -result : result;
    });
    
    return sorted;
  }, [searchedCards, sortOption, sortDirection, getPrice, getReleaseDate, getRarityRank]);

  // Infinite scroll for cards
  const { visibleItems: displayedCards, hasMore, isLoading: scrollLoading, sentinelRef } = useInfiniteScroll(
    sortedCards, 
    24, // Initial visible count
    12  // Load 12 more at a time
  );

  if (loading) {
    return (
      <SmartSkeleton 
        type="card-grid"
        count={20}
        showPrice={true}
        showTypes={true}
        showHP={false}
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
    {((showSort || showSearch) && cards.length > 0) && (
      <div className="flex justify-between items-center mb-6 gap-4">
        {/* Search Bar on Left */}
        {showSearch && (
          <div className="relative flex-1 max-w-xs bg-stone-50/90 dark:bg-stone-800/90 rounded-full p-1 shadow-lg border border-stone-200 dark:border-stone-700/40">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-stone-400 dark:text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-9 pr-9 py-1.5 bg-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:ring-offset-0 transition-all"
                placeholder="Search cards..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
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
                  onClick={() => setSearchValue('')}
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
          bg-white/80 dark:bg-stone-800/80
          rounded-full px-4 py-2
          border border-stone-200/40 dark:border-stone-700/40
          shadow-lg
          inline-flex items-center gap-2
        ">
          <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 mr-1">Sort by:</span>
          
          {/* Sort by Price */}
          <button
            onClick={() => {
              if (sortOption === 'price') {
                setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setSortOption('price');
                setSortDirection('desc');
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border inline-flex items-center gap-1 ${
              sortOption === 'price'
                ? 'bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-300/50 text-amber-700 dark:text-amber-300'
                : 'bg-white/60 dark:bg-stone-800/60 border-stone-200/30 text-stone-600 dark:text-stone-300 hover:bg-white/80'
            }`}
          >
            <span>Price</span>
            {sortOption === 'price' && (
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
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border inline-flex items-center gap-1 ${
              sortOption === 'name'
                ? 'bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-300/50 text-amber-700 dark:text-amber-300'
                : 'bg-white/60 dark:bg-stone-800/60 border-stone-200/30 text-stone-600 dark:text-stone-300 hover:bg-white/80'
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
                setSortDirection('desc');
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border inline-flex items-center gap-1 ${
              sortOption === 'rarity'
                ? 'bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-300/50 text-amber-700 dark:text-amber-300'
                : 'bg-white/60 dark:bg-stone-800/60 border-stone-200/30 text-stone-600 dark:text-stone-300 hover:bg-white/80'
            }`}
          >
            <span>Rarity</span>
            {sortOption === 'rarity' && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            )}
          </button>
          
          {/* Sort by Number */}
          <button
            onClick={() => {
              if (sortOption === 'number') {
                setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setSortOption('number');
                setSortDirection('asc');
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border inline-flex items-center gap-1 ${
              sortOption === 'number'
                ? 'bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-300/50 text-amber-700 dark:text-amber-300'
                : 'bg-white/60 dark:bg-stone-800/60 border-stone-200/30 text-stone-600 dark:text-stone-300 hover:bg-white/80'
            }`}
          >
            <span>#</span>
            {sortOption === 'number' && (
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
      {displayedCards.map((card) => {
        return (
          <TCGCardItem
            key={card.id}
            card={card}
            cardClassName={cardClassName}
            showPrice={showPrice}
            showRarity={showRarity}
            showSet={showSet}
            setZoomedCard={setZoomedCard}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            onCardClick={onCardClick}
            getPrice={getPrice}
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
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
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
    
    {/* Zoom Modal - Enhanced Design */}
    {zoomedCard && (
      <Modal
        isOpen={true}
        onClose={() => setZoomedCard(null)}
        showCloseButton={true}
        closeOnBackdrop={true}
      >
        <div className="flex flex-col md:flex-row gap-6 p-2 sm:p-4 max-w-4xl">
          {/* Card Image */}
          <div className="flex-shrink-0 flex justify-center">
            <div className="relative">
              <Image
                src={zoomedCard.images?.large || "/back-card.png"}
                alt={zoomedCard.name}
                width={300}
                height={420}
                className="rounded-xl shadow-2xl"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
                sizes="(max-width: 768px) 250px, 300px"
              />
              {/* Glow effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-400/30 to-orange-500/30 blur-2xl rounded-full scale-75" />
            </div>
          </div>

          {/* Card Details */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Name and Set */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-800 dark:text-white">
                {zoomedCard.name}
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                {zoomedCard.set?.name} • #{zoomedCard.number}/{zoomedCard.set?.printedTotal || '?'}
              </p>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Rarity */}
              {zoomedCard.rarity && (
                <div className="bg-stone-100 dark:bg-stone-700/50 rounded-lg p-3">
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Rarity</p>
                  <div className="flex items-center gap-2">
                    <RarityIcon rarity={getActualRarity(zoomedCard)} size="sm" showLabel={true} />
                  </div>
                </div>
              )}

              {/* HP */}
              {zoomedCard.hp && (
                <div className="bg-stone-100 dark:bg-stone-700/50 rounded-lg p-3">
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">HP</p>
                  <p className="font-bold text-red-600 dark:text-red-400">{zoomedCard.hp}</p>
                </div>
              )}

              {/* Type */}
              {zoomedCard.types && zoomedCard.types.length > 0 && (
                <div className="bg-stone-100 dark:bg-stone-700/50 rounded-lg p-3">
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Type</p>
                  <p className="font-medium text-stone-800 dark:text-stone-200">{zoomedCard.types.join(', ')}</p>
                </div>
              )}

              {/* Artist */}
              {zoomedCard.artist && (
                <div className="bg-stone-100 dark:bg-stone-700/50 rounded-lg p-3">
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Artist</p>
                  <p className="font-medium text-stone-800 dark:text-stone-200 text-sm truncate">{zoomedCard.artist}</p>
                </div>
              )}
            </div>

            {/* Price Section */}
            {zoomedCard.tcgplayer?.prices && Object.keys(zoomedCard.tcgplayer.prices).length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700/50">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  Market Prices
                </p>
                <div className="space-y-1">
                  {Object.entries(zoomedCard.tcgplayer.prices || {})
                    .filter(([, prices]) => prices && prices.market)
                    .map(([type, prices]) => (
                      <div key={type} className="flex justify-between items-center text-sm">
                        <span className="text-stone-600 dark:text-stone-300 capitalize">
                          {type.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          ${prices?.market?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* View Full Details Button */}
            <button
              onClick={() => {
                setZoomedCard(null);
                window.location.href = `/cards/${zoomedCard.id}`;
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-xl transition-all duration-150 shadow-lg hover:shadow-xl"
            >
              View Full Details
            </button>
          </div>
        </div>
      </Modal>
    )}
    </>
  );
}

// Export component wrapped with error boundary
export default function TCGCardList(props: TCGCardListProps) {
  return (
    <ErrorBoundaryWrapper
      context="TCGCardList"
      fallback={
        <div className="min-h-96 flex items-center justify-center p-8">
          <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 text-center max-w-md shadow-md">
            <div className="text-4xl mb-4">🎴</div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Unable to load TCG cards</h3>
            <p className="text-stone-600 mb-4">There was an error loading the Trading Card Game cards. Please try refreshing the page.</p>
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
      <TCGCardListInner {...props} />
    </ErrorBoundaryWrapper>
  );
}