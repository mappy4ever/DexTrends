import React, { useState, useRef, useCallback } from 'react';
import { useMobileUtils } from '../../utils/mobileUtils';
import EnhancedSwipeGestures from './EnhancedSwipeGestures';
import logger from '../../utils/logger';

const GestureCardSorting = ({
  cards = [],
  onCardAction,
  onSort,
  onFilter,
  className = '',
  enableGestureSorting = true,
  enableGestureFiltering = true,
  swipeActions = {
    left: { action: 'favorite', icon: '❤️', color: '#ef4444', label: 'Favorite' },
    right: { action: 'collection', icon: '📚', color: '#10b981', label: 'Add to Collection' },
    up: { action: 'share', icon: '📤', color: '#3b82f6', label: 'Share' },
    down: { action: 'details', icon: '👁️', color: '#8b5cf6', label: 'View Details' }
  }
}) => {
  const { utils } = useMobileUtils();
  const [activeCard, setActiveCard] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [sortMode, setSortMode] = useState('gesture');
  const [filterMode, setFilterMode] = useState('all');
  const gestureTimeoutRef = useRef(null);

  // Gesture patterns for sorting
  const sortGestures = {
    'circle-clockwise': { sort: 'price-asc', label: 'Price Low to High' },
    'circle-counter': { sort: 'price-desc', label: 'Price High to Low' },
    'zigzag-horizontal': { sort: 'name-asc', label: 'Name A-Z' },
    'zigzag-vertical': { sort: 'rarity', label: 'By Rarity' }
  };

  // Handle individual card swipe actions
  const handleCardSwipe = useCallback((cardId, direction, swipeData) => {
    const action = swipeActions[direction];
    if (!action) return;

    setActiveCard(cardId);
    setSwipeDirection(direction);
    
    // Visual feedback
    utils.hapticFeedback('medium');
    
    // Execute action after brief delay for visual feedback
    setTimeout(() => {
      if (onCardAction) {
        onCardAction(cardId, action.action, swipeData);
      }
      setActiveCard(null);
      setSwipeDirection(null);
    }, 200);

    logger.debug('Card swipe action', { cardId, direction, action: action.action });
  }, [swipeActions, onCardAction, utils]);

  // Handle complex gesture patterns for sorting
  const handleGesturePattern = useCallback((pattern) => {
    if (!enableGestureSorting) return;

    const sortConfig = sortGestures[pattern];
    if (sortConfig) {
      utils.hapticFeedback('heavy');
      
      if (onSort) {
        onSort(sortConfig.sort);
      }
      
      setSortMode(sortConfig.sort);
      
      // Show feedback
      showGestureFeedback(`Sorted by ${sortConfig.label}`);
      
      logger.debug('Gesture sort applied', { pattern, sort: sortConfig.sort });
    }
  }, [enableGestureSorting, sortGestures, onSort, utils]);

  // Handle double tap for quick actions
  const handleDoubleTap = useCallback((position) => {
    // Toggle between grid and list view
    utils.hapticFeedback('medium');
    
    // Find card at position (simplified for demo)
    const cardElements = document.querySelectorAll('.gesture-card');
    const tappedCard = Array.from(cardElements).find(el => {
      const rect = el.getBoundingClientRect();
      return position.x >= rect.left && position.x <= rect.right &&
             position.y >= rect.top && position.y <= rect.bottom;
    });

    if (tappedCard) {
      const cardId = tappedCard.dataset.cardId;
      handleCardSwipe(cardId, 'details', { type: 'double-tap' });
    }
  }, [utils, handleCardSwipe]);

  // Handle long press for context menu
  const handleLongPress = useCallback((position) => {
    utils.hapticFeedback('heavy');
    
    // Show context menu (simplified for demo)
    showContextMenu(position);
    
    logger.debug('Long press context menu', { position });
  }, [utils]);

  // Show gesture feedback
  const showGestureFeedback = (message) => {
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      pointer-events: none;
      backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      document.body.removeChild(feedback);
    }, 2000);
  };

  // Show context menu
  const showContextMenu = (position) => {
    // Simplified context menu implementation
    const menu = document.createElement('div');
    menu.style.cssText = `
      position: fixed;
      top: ${position.y}px;
      left: ${position.x}px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      padding: 8px;
      z-index: 1000;
      min-width: 150px;
    `;
    
    const actions = ['Select All', 'Clear Filters', 'Sort Options', 'View Settings'];
    actions.forEach(action => {
      const item = document.createElement('div');
      item.textContent = action;
      item.style.cssText = `
        padding: 12px 16px;
        cursor: pointer;
        border-radius: 8px;
        font-size: 14px;
        transition: background-color 0.2s;
      `;
      item.addEventListener('click', () => {
        handleContextAction(action);
        document.body.removeChild(menu);
      });
      menu.appendChild(item);
    });
    
    document.body.appendChild(menu);
    
    // Remove on click outside
    setTimeout(() => {
      const clickHandler = (e) => {
        if (!menu.contains(e.target)) {
          document.body.removeChild(menu);
          document.removeEventListener('click', clickHandler);
        }
      };
      document.addEventListener('click', clickHandler);
    }, 100);
  };

  // Handle context menu actions
  const handleContextAction = (action) => {
    switch (action) {
      case 'Select All':
        // Implement select all logic
        break;
      case 'Clear Filters':
        setFilterMode('all');
        if (onFilter) onFilter('all');
        break;
      case 'Sort Options':
        // Show sort options
        break;
      case 'View Settings':
        // Show view settings
        break;
    }
    
    logger.debug('Context action executed', { action });
  };

  // Filter cards based on gestures or other criteria
  const getFilteredCards = () => {
    let filtered = [...cards];
    
    switch (filterMode) {
      case 'favorites':
        filtered = filtered.filter(card => card.isFavorite);
        break;
      case 'collection':
        filtered = filtered.filter(card => card.inCollection);
        break;
      case 'high-value':
        filtered = filtered.filter(card => card.price > 100);
        break;
      default:
        // Show all cards
        break;
    }
    
    return filtered;
  };

  const filteredCards = getFilteredCards();

  return (
    <div className={`gesture-card-sorting ${className}`}>
      {/* Gesture Instructions */}
      <div className="gesture-instructions mb-4 p-3 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Gesture Controls</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
          <div>👈 {swipeActions.left.label}</div>
          <div>👉 {swipeActions.right.label}</div>
          <div>👆 {swipeActions.up.label}</div>
          <div>👇 {swipeActions.down.label}</div>
        </div>
        <div className="mt-2 text-xs text-blue-700">
          Double tap for details • Long press for menu
        </div>
      </div>

      {/* Current Sort/Filter Display */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {filteredCards.length} cards • Sorted by {sortMode}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterMode(filterMode === 'all' ? 'favorites' : 'all')}
            className="px-3 py-1 text-xs bg-gray-100 rounded-full">

            {filterMode === 'all' ? 'Show Favorites' : 'Show All'}
          </button>
        </div>
      </div>

      {/* Cards Grid with Gesture Support */}
      <EnhancedSwipeGestures
        onSwipeLeft={(data) => activeCard && handleCardSwipe(activeCard, 'left', data)}
        onSwipeRight={(data) => activeCard && handleCardSwipe(activeCard, 'right', data)}
        onSwipeUp={(data) => activeCard && handleCardSwipe(activeCard, 'up', data)}
        onSwipeDown={(data) => activeCard && handleCardSwipe(activeCard, 'down', data)}
        onDoubleTap={handleDoubleTap}
        onLongPress={handleLongPress}
        enableSwipe={true}
        enableDoubleTap={true}
        enableLongPress={true}
        className="cards-container">

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              data-card-id={card.id}
              className={`gesture-card relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
                activeCard === card.id ? 'transform scale-95' : ''
              }`}
              onTouchStart={() => setActiveCard(card.id)}
              style={{
                transform: activeCard === card.id && swipeDirection ? 
                  `translateX(${swipeDirection === 'left' ? '-10px' : swipeDirection === 'right' ? '10px' : '0'}) translateY(${swipeDirection === 'up' ? '-10px' : swipeDirection === 'down' ? '10px' : '0'})` : 
                  'none'
              }}
            >
              {/* Card Image */}
              <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full h-full object-cover" loading="lazy" />
              </div>
              
              {/* Card Info */}
              <div className="p-3">
                <h3 className="text-sm font-semibold truncate">{card.name}</h3>
                <p className="text-xs text-gray-600">{card.set}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-green-600">
                    ${card.price?.toFixed(2) || 'N/A'}
                  </span>
                  <span className="text-xs text-gray-500">{card.rarity}</span>
                </div>
              </div>
              
              {/* Swipe Action Indicator */}
              {activeCard === card.id && swipeDirection && (
                <div 
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    background: `${swipeActions[swipeDirection]?.color}20`,
                    backdropFilter: 'blur(2px)'
                  }}
                >
                  <div 
                    className="text-2xl p-4 rounded-full"
                    style={{ 
                      background: swipeActions[swipeDirection]?.color,
                      color: 'white'
                    }}
                  >
                    {swipeActions[swipeDirection]?.icon}
                  </div>
                </div>
              )}
              
              {/* Status Indicators */}
              <div className="absolute top-2 right-2 flex space-x-1">
                {card.isFavorite && (
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                    ❤️
                  </div>
                )}
                {card.inCollection && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </EnhancedSwipeGestures>
      
      {/* Empty State */}
      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No cards found</h3>
          <p className="text-gray-500">Try adjusting your filters or search criteria</p>
        </div>
      )}
    </div>
  );
};

export default GestureCardSorting;