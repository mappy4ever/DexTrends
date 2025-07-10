import React, { useState, useMemo, useCallback, memo } from "react";
import dynamic from "next/dynamic";
import Modal from "./ui/Modal";
import UnifiedCard from "./ui/UnifiedCard";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { InlineLoadingSpinner } from "./ui/LoadingSpinner";
import { isFeatureEnabled } from "../utils/featureFlags";

// Dynamic import for react-window to reduce bundle size
const VirtualizedGrid = dynamic(
  () => import('react-window').then((mod) => ({ default: mod.FixedSizeGrid })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />
  }
);

// Pocket Card wrapper that uses UnifiedCard
const PocketCard = memo(({ 
  card, 
  cardClassName, 
  showHP, 
  showRarity, 
  rarity, 
  cardFeatures, 
  setZoomedCard,
  imageWidth,
  imageHeight
}) => {
  return (
    <UnifiedCard
      card={card}
      cardType="pocket"
      showHP={showHP}
      showRarity={showRarity}
      showPack={true}
      showArtist={true}
      showTypes={true}
      onMagnifyClick={setZoomedCard ? (card) => setZoomedCard(card) : null}
      className={cardClassName}
      imageWidth={imageWidth}
      imageHeight={imageHeight}
    />
  );
});

PocketCard.displayName = 'PocketCard';

// PocketCardList: displays cards from the Pocket API with enhanced visual design
export default function PocketCardList({ 
  cards, 
  loading, 
  error, 
  emptyMessage = "No Pocket cards found.",
  hideCardCount = false, 
  cardClassName = "", 
  gridClassName = "",
  showPack = true,
  showRarity = true,
  showHP = true,
  showSort = true,
  itemsPerPage = 48, // 6 columns x 8 rows = reasonable page size
  imageWidth = 110, // 50% smaller than 220
  imageHeight = 154 // 50% smaller than 308
}) {
  const [zoomedCard, setZoomedCard] = useState(null);
  const [sortOption, setSortOption] = useState("number");

  // Helper function to parse set code and number for sorting
  const parseCardId = (cardId) => {
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
    return [...cards].sort((a, b) => {
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "number":
          const parsedA = parseCardId(a.id);
          const parsedB = parseCardId(b.id);
          
          // Promos go to the end
          if (parsedA.isPromo !== parsedB.isPromo) {
            return parsedA.isPromo ? 1 : -1;
          }
          
          // Sort by set code first (A1, A1a, A2, A2a, A2b, etc.)
          const setCompare = parsedA.setCode.localeCompare(parsedB.setCode);
          if (setCompare !== 0) {
            return setCompare;
          }
          
          // Then by number within the set
          return parsedA.number - parsedB.number;
        case "hp":
          const hpA = parseInt(a.health) || 0;
          const hpB = parseInt(b.health) || 0;
          return hpB - hpA; // Highest HP first
        case "rarity":
          const rarityOrder = { '★★': 6, '★': 5, '◊◊◊◊': 4, '◊◊◊': 3, '◊◊': 2, '◊': 1 };
          return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
        case "type":
          const typeA = a.type || '';
          const typeB = b.type || '';
          return typeA.localeCompare(typeB);
        case "pack":
          const packA = a.pack || '';
          const packB = b.pack || '';
          return packA.localeCompare(packB);
        case "ex":
          const exA = a.ex === "Yes" ? 1 : 0;
          const exB = b.ex === "Yes" ? 1 : 0;
          return exB - exA; // EX cards first
        case "fullart":
          const faA = a.fullart === "Yes" ? 1 : 0;
          const faB = b.fullart === "Yes" ? 1 : 0;
          return faB - faA; // Full Art cards first
        default:
          return 0;
      }
    });
  }, [cards, sortOption]);

  // Infinite scroll for cards
  const { visibleItems: displayedCards, hasMore, isLoading: scrollLoading, sentinelRef } = useInfiniteScroll(
    sortedCards, 
    24, // Initial visible count
    12  // Load 12 more at a time
  );

  // Reset when sorting changes
  const handleSortChange = useCallback((newSort) => {
    setSortOption(newSort);
  }, []);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
          <div className="w-20 h-20 rounded-full border-4 border-t-primary border-r-primary/70 border-b-primary/40 border-l-transparent animate-spin"></div>
        </div>
        <h3 className="mt-6 text-xl font-semibold">Loading Pocket cards...</h3>
      </div>
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
    {/* Sort Controls */}
    {showSort && cards.length > 0 && (
      <div className="flex justify-end mb-4">
        <select
          id="pocket-sort"
          value={sortOption}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-pokemon-red focus:border-transparent bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <option value="name">Sort: Name</option>
          <option value="number">Sort: #</option>
          <option value="hp">Sort: HP</option>
          <option value="rarity">Sort: Rarity</option>
          <option value="type">Sort: Type</option>
          <option value="pack">Sort: Pack</option>
          <option value="ex">Sort: EX First</option>
          <option value="fullart">Sort: Full Art</option>
        </select>
      </div>
    )}
    
    <div className={gridClassName || "pocket-cards-grid"}>
      {displayedCards.map(card => {
        return (
          <PocketCard
            key={card.id}
            card={card}
            cardClassName={cardClassName}
            showHP={showHP}
            showRarity={showRarity}
            setZoomedCard={setZoomedCard}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
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
          <InlineLoadingSpinner 
            text="Loading more cards..." 
            className="py-4"
          />
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
      <Modal isOpen={true} onClose={() => setZoomedCard(null)}>
        <div className="flex flex-col items-center">
          <Image
            src={zoomedCard.image || "/back-card.png"}
            alt={zoomedCard.name}
            width={400}
            height={560}
            className="rounded-lg shadow-lg"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
            sizes="400px"
          />
          <h3 className="mt-4 text-xl font-bold text-center">{zoomedCard.name}</h3>
          {zoomedCard.pack && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">{zoomedCard.pack}</p>
          )}
        </div>
      </Modal>
    )}
    </>
  );
}