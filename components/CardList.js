import React, { useState, useMemo, useCallback, memo } from "react";
import Image from "next/image";
import Modal from "./ui/modals/Modal";
import UnifiedCard from "./ui/UnifiedCard";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { InlineLoadingSpinner } from "./ui/loading/LoadingSpinner";
import { isFeatureEnabled } from "../utils/featureFlags";

// Custom comparison function for React.memo
const arePropsEqual = (prevProps, nextProps) => {
  // Check if cards array length changed
  if (prevProps.cards?.length !== nextProps.cards?.length) return false;
  
  // Check if loading/error states changed
  if (prevProps.loading !== nextProps.loading) return false;
  if (prevProps.error !== nextProps.error) return false;
  
  // Check if sort option changed
  if (prevProps.initialSortOption !== nextProps.initialSortOption) return false;
  
  // For cards array, only check if the array reference changed
  // Individual card updates will be handled by UnifiedCard's own memoization
  if (prevProps.cards !== nextProps.cards) return false;
  
  // Check if callback functions changed (they should be stable with useCallback)
  if (prevProps.onCardClick !== nextProps.onCardClick) return false;
  if (prevProps.onRarityClick !== nextProps.onRarityClick) return false;
  if (prevProps.getPrice !== nextProps.getPrice) return false;
  if (prevProps.getReleaseDate !== nextProps.getReleaseDate) return false;
  if (prevProps.getRarityRank !== nextProps.getRarityRank) return false;
  
  return true;
};

const CardList = memo(({
  cards = [],
  loading = false,
  error = null,
  initialSortOption = "price",
  onCardClick = () => {},
  onRarityClick,
  getPrice = () => 0,
  getReleaseDate = () => "0000-00-00",
  getRarityRank = () => 0,
}) => {
  // Local sort state
  const [sortOption, setSortOption] = useState(initialSortOption);
  const [zoomedCard, setZoomedCard] = useState(null);
  
  // Memoized callbacks to prevent unnecessary re-renders
  const handleSortChange = useCallback((e) => {
    setSortOption(e.target.value);
  }, []);
  
  const handleMagnifyClick = useCallback((card) => {
    setZoomedCard(card);
  }, []);
  
  const handleCloseModal = useCallback(() => {
    setZoomedCard(null);
  }, []);
  
  const handleCardClick = useCallback((card) => {
    onCardClick(card);
  }, [onCardClick]);

  // Sorting logic
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      if (sortOption === "price") {
        return getPrice(b) - getPrice(a);
      }
      if (sortOption === "releaseDate") {
        return (
          new Date(getReleaseDate(b)).getTime() -
          new Date(getReleaseDate(a)).getTime()
        );
      }
      if (sortOption === "rarity") {
        return getRarityRank(b) - getRarityRank(a);
      }
      return 0;
    });
  }, [cards, sortOption, getPrice, getReleaseDate, getRarityRank]);

  // Infinite scroll for cards
  const { visibleItems: visibleCards, hasMore, isLoading: scrollLoading, sentinelRef } = useInfiniteScroll(
    sortedCards, 
    24, // Initial visible count
    12  // Load 12 more at a time
  );

  return (
    <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 transition-all duration-300 animate-fadeIn">
      {loading && <p className="text-center text-content-muted">Loading cards...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="flex justify-center mb-6">
        <label htmlFor="sort" className="mr-2 font-semibold">Sort by:</label>
        <select
          id="sort"
          value={sortOption}
          onChange={handleSortChange}
          className="border border-gray-300 rounded px-3 py-1"
        >
          <option value="price">Price</option>
          <option value="releaseDate">Release Date</option>
          <option value="rarity">Rarity</option>
        </select>
      </div>

      {/* Card grid: always one big flex-wrap, not split by anything else */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
        {visibleCards.map((card) => {
          // Add current price to card object for UnifiedCard to access
          const cardWithPrice = {
            ...card,
            currentPrice: getPrice(card)
          };

          return (
            <UnifiedCard
              key={card.id}
              card={cardWithPrice}
              cardType="tcg"
              showPrice={true}
              showSet={true}
              showTypes={true}
              showRarity={true}
              onMagnifyClick={handleMagnifyClick}
              onCardClick={handleCardClick}
              className="animate-fadeIn"
            />
          );
        })}
      </div>

      {/* Intersection Observer sentinel for infinite scroll */}
      {hasMore && (
        <div 
          ref={sentinelRef} 
          className="h-20 w-full flex items-center justify-center mt-4"
          style={{ minHeight: '80px' }}
        >
          {scrollLoading && (
            <InlineLoadingSpinner 
              text="Loading more cards..." 
              className="mt-2"
            />
          )}
        </div>
      )}

      {!loading && !error && cards.length === 0 && (
        <p className="text-center text-content-muted mt-12">
          No cards found for this Pokémon.
        </p>
      )}

      {!loading && !scrollLoading && !hasMore && cards.length > 0 && (
        <div className="text-center mt-8 text-gray-500 dark:text-gray-400">
          All {cards.length} cards loaded
        </div>
      )}

      {/* Modal for zoomed card */}
      {zoomedCard && (
        <Modal isOpen={!!zoomedCard} onClose={handleCloseModal}>
          <div className="flex flex-col items-center p-4">
            <Image
              src={zoomedCard.images?.large || '/back-card.png'}
              alt={zoomedCard.name}
              width={400}
              height={560}
              className="rounded-lg shadow-2xl mb-4"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
              sizes="400px"
            />
            <button
              className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              onClick={handleCloseModal}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}, arePropsEqual);

CardList.displayName = 'CardList';

export default CardList;
