import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
// Import mobile utils with error handling
let useMobileUtils;
try {
  useMobileUtils = require('../../utils/mobileUtils').useMobileUtils;
} catch (error) {
  useMobileUtils = () => ({ isMobile: true, screenCategory: 'sm', utils: { isTouchDevice: true, hapticFeedback: () => {} } });
}
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import TouchGestures from './TouchGestures';
import logger from '../../utils/logger';

const MobileCardGrid = ({ 
  cards = [], 
  loading = false, 
  onCardSelect,
  onLoadMore,
  selectedCard = null,
  enableGestures = true,
  enableFavorites = true
}) => {
  const { isMobile, screenCategory, utils } = useMobileUtils();
  const [favorites, setFavorites] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'compact'

  // Responsive grid configuration
  const gridConfig = useMemo(() => {
    switch (screenCategory) {
      case 'xs':
        return { cols: 2, itemsPerLoad: 12, cardSize: 'small' };
      case 'sm':
        return { cols: 2, itemsPerLoad: 16, cardSize: 'medium' };
      case 'md':
        return { cols: 3, itemsPerLoad: 18, cardSize: 'medium' };
      case 'lg':
        return { cols: 4, itemsPerLoad: 24, cardSize: 'large' };
      default:
        return { cols: 2, itemsPerLoad: 16, cardSize: 'medium' };
    }
  }, [screenCategory]);

  // Infinite scroll hook
  const {
    visibleItems,
    hasMore,
    isLoading: scrollLoading,
    loadMore,
    sentinelRef
  } = useInfiniteScroll(
    cards,
    gridConfig.itemsPerLoad,
    gridConfig.itemsPerLoad,
    100,
    {
      onLoadMore: onLoadMore,
      useIntersectionObserver: true
    }
  );

  // Handle card interactions
  const handleCardTap = (card) => {
    if (utils.isTouchDevice) {
      utils.hapticFeedback('light');
    }
    
    if (onCardSelect) {
      onCardSelect(card);
    }
    
    logger.debug('Card selected', { cardId: card.id, name: card.name });
  };

  const handleCardDoubleTap = (card) => {
    toggleFavorite(card.id);
    utils.hapticFeedback('medium');
    logger.debug('Card double tapped', { cardId: card.id });
  };

  const toggleFavorite = (cardId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(cardId)) {
        newFavorites.delete(cardId);
      } else {
        newFavorites.add(cardId);
      }
      return newFavorites;
    });
  };

  const toggleViewMode = () => {
    const modes = ['grid', 'list', 'compact'];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setViewMode(modes[nextIndex]);
    utils.hapticFeedback('light');
  };

  // Card size classes
  const getCardClasses = () => {
    const baseClasses = 'relative overflow-hidden rounded-lg bg-white shadow-sm border border-gray-200 transition-all duration-200';
    
    switch (viewMode) {
      case 'list':
        return `${baseClasses} flex items-center p-3 mb-2`;
      case 'compact':
        return `${baseClasses} aspect-[2/3] cursor-pointer transform hover:scale-105 active:scale-95`;
      default: // grid
        return `${baseClasses} aspect-[2/3] cursor-pointer transform hover:scale-105 active:scale-95`;
    }
  };

  const getImageClasses = () => {
    switch (viewMode) {
      case 'list':
        return 'w-16 h-20 object-cover rounded mr-3 flex-shrink-0';
      case 'compact':
        return 'w-full h-full object-cover';
      default: // grid
        return 'w-full h-full object-cover';
    }
  };

  const renderCard = (card, index) => (
    <TouchGestures
      key={card.id}
      enableSwipe={false}
      enableDoubleTap={enableFavorites && enableGestures}
      onDoubleTap={() => handleCardDoubleTap(card)}
      className={getCardClasses()}
    >
      <div
        onClick={() => handleCardTap(card)}
        className={`w-full h-full ${selectedCard?.id === card.id ? 'ring-2 ring-pokemon-blue' : ''}`}
      >
        {viewMode === 'list' ? (
          // List view layout
          (<>
            <div className="relative">
              <Image
                src={card.images?.small || '/placeholder-card.png'}
                alt={card.name || 'Pokemon card'}
                width={64}
                height={80}
                className={getImageClasses()}
                loading={index < 8 ? 'eager' : 'lazy'}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
              
              {/* Favorite indicator */}
              {favorites.has(card.id) && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">❤️</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{card.name}</h3>
              <p className="text-sm text-gray-600 truncate">{card.set?.name}</p>
              {card.cardmarket?.prices?.averageSellPrice && (
                <p className="text-sm font-medium text-pokemon-blue">
                  €{card.cardmarket.prices.averageSellPrice.toFixed(2)}
                </p>
              )}
            </div>
          </>)
        ) : (
          // Grid view layout
          (<>
            <div className="relative w-full h-full">
              <Image
                src={card.images?.small || '/placeholder-card.png'}
                alt={card.name || 'Pokemon card'}
                fill
                className={getImageClasses()}
                loading={index < 8 ? 'eager' : 'lazy'}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
              
              {/* Favorite indicator */}
              {favorites.has(card.id) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">❤️</span>
                </div>
              )}
              
              {/* Card info overlay */}
              {viewMode === 'grid' && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-sm font-medium truncate">{card.name}</p>
                  {card.cardmarket?.prices?.averageSellPrice && (
                    <p className="text-white text-xs">
                      €{card.cardmarket.prices.averageSellPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </>)
        )}
      </div>
    </TouchGestures>
  );

  if (!isMobile) {
    return null; // Use desktop grid component
  }

  return (
    <div className="mobile-card-grid">
      {/* Mobile header with controls */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-gray-900">
          Cards ({cards.length})
        </h2>
        
        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <button
            onClick={toggleViewMode}
            className="p-2 text-gray-600 hover:text-pokemon-blue transition-colors">
            aria-label={`Switch to ${viewMode === 'grid' ? 'list' : viewMode === 'list' ? 'compact' : 'grid'} view`}
          >
            {viewMode === 'grid' && '⊞'}
            {viewMode === 'list' && '☰'}
            {viewMode === 'compact' && '⊡'}
          </button>
          
          {/* Favorites filter */}
          <button
            onClick={() => {
              // TODO: Implement favorites filter
              utils.hapticFeedback('light');
            }}
            className="p-2 text-gray-600 hover:text-red-500 transition-colors">
            aria-label="Show favorites"
          >
            ❤️
          </button>
        </div>
      </div>
      {/* Cards container */}
      <div className={`p-4 ${loading ? 'opacity-50' : ''}`}>
        {viewMode === 'list' ? (
          // List layout
          (<div className="space-y-2">
            {visibleItems.map((card, index) => renderCard(card, index))}
          </div>)
        ) : (
          // Grid layout
          (<div 
            className={`grid gap-3`}
            style={{
              gridTemplateColumns: `repeat(${gridConfig.cols}, minmax(0, 1fr))`
            }}
          >
            {visibleItems.map((card, index) => renderCard(card, index))}
          </div>)
        )}

        {/* Loading indicator */}
        {(loading || scrollLoading) && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-pokemon-blue border-t-transparent rounded-full" />
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {hasMore && (
          <div ref={sentinelRef} className="h-4 w-full" />
        )}

        {/* No more cards indicator */}
        {!hasMore && cards.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>You've seen all the cards!</p>
          </div>
        )}
      </div>
      {/* Bottom padding for mobile navigation */}
      <div className="h-20" />
    </div>
  );
};

export default MobileCardGrid;