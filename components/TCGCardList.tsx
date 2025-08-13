import React, { useState, useMemo, useCallback, memo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Modal from "./ui/modals/Modal";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { InlineLoader } from '@/components/ui/SkeletonLoadingSystem';
import { SmartSkeleton } from "./ui/SkeletonLoader";
import type { TCGCard } from "../types/api/cards";
import logger from "@/utils/logger";

// Dynamic import for react-window to reduce bundle size
const VirtualizedGrid = dynamic(
  () => import('react-window').then((mod) => ({ default: mod.FixedSizeGrid })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />
  }
);

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
}

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
  getPrice
}) => {
  // Get card details
  const setId = card.set?.id || '';
  const setName = card.set?.name || '';
  const cardNumber = card.number || '???';
  const price = getPrice ? getPrice(card) : 0;
  
  // Get rarity display and colors
  const getRarityPillColor = (rarity?: string) => {
    if (!rarity) return 'from-gray-100/80 to-gray-200/80';
    const lower = rarity.toLowerCase();
    
    if (lower.includes('secret')) return 'from-purple-300/90 to-pink-300/90';
    if (lower.includes('ultra')) return 'from-purple-200/90 to-pink-200/90';
    if (lower.includes('rare')) {
      if (lower.includes('holo')) return 'from-blue-200/90 to-purple-200/90';
      return 'from-blue-100/80 to-blue-200/80';
    }
    if (lower.includes('uncommon')) return 'from-green-100/80 to-green-200/80';
    return 'from-gray-100/80 to-gray-200/80';
  };
  
  // Get subtle type-based gradient for card background
  const getTypeGradient = (types?: string[]) => {
    if (!types || types.length === 0) return '';
    const primaryType = types[0].toLowerCase();
    
    const typeColors: Record<string, string> = {
      'grass': 'from-green-100/60 via-green-50/40 via-70% to-transparent',
      'fire': 'from-red-100/60 via-orange-50/40 via-70% to-transparent',
      'water': 'from-blue-100/60 via-cyan-50/40 via-70% to-transparent',
      'lightning': 'from-yellow-100/60 via-amber-50/40 via-70% to-transparent',
      'electric': 'from-yellow-100/60 via-amber-50/40 via-70% to-transparent',
      'psychic': 'from-purple-100/60 via-pink-50/40 via-70% to-transparent',
      'fighting': 'from-orange-100/60 via-red-50/40 via-70% to-transparent',
      'darkness': 'from-purple-100/60 via-gray-50/40 via-70% to-transparent',
      'dark': 'from-purple-100/60 via-gray-50/40 via-70% to-transparent',
      'metal': 'from-gray-100/60 via-slate-50/40 via-70% to-transparent',
      'steel': 'from-gray-100/60 via-slate-50/40 via-70% to-transparent',
      'dragon': 'from-indigo-100/60 via-purple-50/40 via-70% to-transparent',
      'colorless': 'from-gray-50/60 via-gray-50/40 via-70% to-transparent',
      'fairy': 'from-pink-100/60 via-rose-50/40 via-70% to-transparent',
    };
    
    return typeColors[primaryType] || '';
  };
  
  return (
    <div className="group relative">
      {/* Main Card Container - Mobile Optimized Glass */}
      <div
        className={`
          backdrop-blur-xl bg-white/90 dark:bg-gray-800/90
          rounded-3xl p-3
          border-2 border-gray-300/50 dark:border-gray-600/50
          shadow-lg hover:shadow-2xl
          transform transition-all duration-300
          hover:scale-[1.03] hover:-translate-y-1
          cursor-pointer
          drop-shadow-md
          relative overflow-hidden
          ${cardClassName}
        `}
        onClick={() => onCardClick?.(card)}
      >
        {/* Subtle type-based gradient overlay */}
        {card.types && (
          <div className={`absolute inset-0 bg-gradient-to-b ${getTypeGradient(card.types)} pointer-events-none rounded-3xl opacity-80`} />
        )}
        
        {/* Card content with relative positioning to be above gradient */}
        <div className="relative z-10">
          {/* Compact Image Container */}
          <div className="relative rounded-2xl overflow-hidden mb-2 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800">
            <img
              src={card.images?.small || '/back-card.png'}
              alt={card.name}
              width={imageWidth}
              height={imageHeight}
              className="w-full h-auto object-contain"
              loading="lazy"
            />
            
            {/* Rarity Badge - Top Right */}
            {showRarity && card.rarity && (
              <div className="absolute top-2 right-2">
                <div className={`
                  px-2 py-1 rounded-full
                  backdrop-blur-md bg-gradient-to-r ${getRarityPillColor(card.rarity)}
                  text-xs font-bold
                  border border-white/50
                  shadow-sm
                `}>
                  {card.rarity.split(' ')[0]}
                </div>
              </div>
            )}
            
            {/* Magnify Button - Small and Subtle */}
            {setZoomedCard && (
              <button
                className="
                  absolute bottom-1 right-1
                  w-6 h-6 rounded-full
                  backdrop-blur-md bg-white/70 dark:bg-gray-800/70
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
                <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Card Info Section */}
          <div className="space-y-1.5">
            {/* Name */}
            <div className="px-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate block">
                {card.name}
              </span>
            </div>
            
            {/* Price and Set Info Row */}
            <div className="flex items-center justify-between px-1 gap-1">
              {/* Price Display */}
              {showPrice && price > 0 && (
                <span className="
                  text-xs px-2.5 py-1 rounded-full
                  bg-gradient-to-r from-purple-100/90 to-pink-100/90 dark:from-purple-900/40 dark:to-pink-900/40
                  backdrop-blur-md
                  font-bold text-purple-700 dark:text-purple-300
                  border border-white/50 dark:border-purple-400/30
                  shadow-lg shadow-purple-500/20 dark:shadow-purple-500/10
                  hover:shadow-xl hover:shadow-purple-500/30 dark:hover:shadow-purple-500/20
                  transition-all duration-200
                ">
                  ${price.toFixed(2)}
                </span>
              )}
              
              {/* Set Badge */}
              {showSet && (
                <span className="
                  text-xs px-2 py-0.5 rounded-full
                  bg-gray-100/70 dark:bg-gray-700/70
                  text-gray-600 dark:text-gray-400
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
}

// TCGCardList: displays TCG cards with enhanced visual design matching PocketCardList
export default function TCGCardList({ 
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
  getRarityRank = () => 0
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
        <p className="text-gray-600 dark:text-gray-400 mt-2">{error}</p>
      </div>
    );
  }
  
  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">{emptyMessage}</h3>
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
          <div className="relative flex-1 max-w-xs bg-gray-50/90 dark:bg-gray-800/90 rounded-full p-1 shadow-lg border border-gray-300 dark:border-gray-700/40">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-9 pr-9 py-1.5 bg-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:ring-offset-0 transition-all"
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
                  className="absolute inset-y-0 right-0 pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
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
          backdrop-blur-md bg-white/80 dark:bg-gray-800/80
          rounded-full px-4 py-2
          border border-white/40 dark:border-gray-700/40
          shadow-lg
          inline-flex items-center gap-2
        ">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mr-1">Sort by:</span>
          
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
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-md border inline-flex items-center gap-1 ${
              sortOption === 'price' 
                ? 'bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300/50 text-purple-700 dark:text-purple-300' 
                : 'bg-white/60 dark:bg-gray-800/60 border-white/30 text-gray-600 dark:text-gray-400 hover:bg-white/80'
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
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-md border inline-flex items-center gap-1 ${
              sortOption === 'name' 
                ? 'bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300/50 text-purple-700 dark:text-purple-300' 
                : 'bg-white/60 dark:bg-gray-800/60 border-white/30 text-gray-600 dark:text-gray-400 hover:bg-white/80'
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
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-md border inline-flex items-center gap-1 ${
              sortOption === 'rarity' 
                ? 'bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300/50 text-purple-700 dark:text-purple-300' 
                : 'bg-white/60 dark:bg-gray-800/60 border-white/30 text-gray-600 dark:text-gray-400 hover:bg-white/80'
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
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-md border inline-flex items-center gap-1 ${
              sortOption === 'number' 
                ? 'bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300/50 text-purple-700 dark:text-purple-300' 
                : 'bg-white/60 dark:bg-gray-800/60 border-white/30 text-gray-600 dark:text-gray-400 hover:bg-white/80'
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
    
    <div className={gridClassName || "grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"}>
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
      <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {displayedCards.length} of {sortedCards.length} cards
        {hasMore && !scrollLoading && (
          <div className="text-xs text-primary mt-1">
            Scroll down to load more...
          </div>
        )}
      </div>
    )}

    {!hideCardCount && !scrollLoading && !hasMore && sortedCards.length > 0 && (
      <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
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
            src={zoomedCard.images?.large || "/back-card.png"}
            alt={zoomedCard.name}
            width={400}
            height={560}
            className="rounded-lg shadow-lg"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
            sizes="400px"
          />
          <h3 className="mt-4 text-xl font-bold text-center">{zoomedCard.name}</h3>
          {zoomedCard.set?.name && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">{zoomedCard.set.name}</p>
          )}
        </div>
      </Modal>
    )}
    </>
  );
}