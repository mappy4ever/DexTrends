import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFavorites } from '../../../context/UnifiedAppContext';
import { TypeBadge } from '../TypeBadge';
import Link from 'next/link';
import logger from '../../../utils/logger';
import type { FavoriteCard } from '../../../context/modules/types';
// import { PokemonTCGCard } from '../../../types';
interface PokemonTCGCard {
  id: string;
  name: string;
  number?: string;
  artist?: string;
  rarity?: string;
  images: {
    small: string;
    large: string;
  };
  set: {
    id?: string;
    name: string;
    images?: {
      symbol?: string;
    };
  };
  types?: string[];
  hp?: string;
  [key: string]: unknown;
}

const EnhancedCardModal = ({ card, isOpen, onClose }: { card: PokemonTCGCard; isOpen: boolean; onClose: () => void }) => {
  const [zoom, setZoom] = useState(1);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  
  const isCardFavorite = (cardId: string) => {
    return favorites?.cards?.some((card: FavoriteCard) => card.id === cardId) || false;
  };
  
  const toggleCardFavorite = (card: PokemonTCGCard) => {
    if (isCardFavorite(card.id)) {
      removeFromFavorites('cards', card.id);
    } else {
      const favoriteCard: FavoriteCard = {
        id: card.id,
        name: card.name,
        set: card.set ? { id: card.set.id || '', name: card.set.name } : undefined,
        images: card.images,
        addedAt: Date.now()
      };
      addToFavorites('cards', favoriteCard);
    }
  };

  const zoomIn = useCallback((): void => {
    setZoom(prev => Math.min(prev * 1.25, 5));
  }, []);

  const zoomOut = useCallback((): void => {
    setZoom(prev => Math.max(prev / 1.25, 0.5));
  }, []);

  const resetZoom = useCallback((): void => {
    setZoom(1);
    setDragPosition({ x: 0, y: 0 });
  }, []);

  const toggleFullscreen = useCallback((): void => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Reset zoom and position when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setDragPosition({ x: 0, y: 0 });
      setIsFullscreen(false);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          } else {
            onClose();
          }
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          resetZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose, zoomIn, zoomOut, resetZoom, toggleFullscreen]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(zoom + delta, 0.5), 5);
    setZoom(newZoom);
  };

  // Touch/mouse drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - dragPosition.x,
      y: e.clientY - dragPosition.y
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - dragPosition.x,
        y: touch.clientY - dragPosition.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setDragPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    setDragPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleMouseUp = (): void => {
    setIsDragging(false);
  };

  // Double click/tap to zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (zoom === 1) {
      setZoom(2.5);
      // Center zoom on click position
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const centerX = (rect.width / 2) - e.clientX + rect.left;
        const centerY = (rect.height / 2) - e.clientY + rect.top;
        setDragPosition({ x: centerX, y: centerY });
      }
    } else {
      resetZoom();
    }
  };

  const handleFavoriteToggle = (): void => {
    if (card) {
      toggleCardFavorite(card);
      logger.debug('Card favorite toggled from modal', { cardId: card.id });
    }
  };

  if (!isOpen || !card) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isFullscreen ? 'bg-black' : 'bg-black bg-opacity-75'} flex items-center justify-center transition-all duration-300`}>
      {/* Background overlay */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className={`relative ${isFullscreen ? 'w-full h-full' : 'max-w-6xl max-h-[90vh] w-full mx-4'} bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-2xl`}>
        {/* Header with controls */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold truncate">{card.name}</h2>
              <span className="text-sm opacity-75">#{card.number}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Zoom controls */}
              <div className="flex items-center space-x-1 bg-black/30 rounded-lg px-2 py-1">
                <button
                  onClick={zoomOut}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded transition-colors"
                  title="Zoom Out (-)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                
                <span className="text-sm min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
                
                <button
                  onClick={zoomIn}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded transition-colors"
                  title="Zoom In (+)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                
                <button
                  onClick={resetZoom}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded transition-colors ml-1"
                  title="Reset Zoom (0)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              {/* Action buttons */}
              <button
                onClick={handleFavoriteToggle}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  isCardFavorite(card.id) 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
                title={isCardFavorite(card.id) ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <svg className="w-4 h-4" fill={isCardFavorite(card.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}
              >
                {isFullscreen ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15H4.5M9 15v4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded transition-colors"
                title="Close (Esc)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Image container */}
        <div 
          ref={containerRef}
          className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <img
              ref={imageRef}
              src={card.images?.large || '/dextrendslogo.png'}
              alt={card.name}
              className="max-w-none transition-transform duration-200 select-none"
              style={{
                transform: `scale(${zoom}) translate(${dragPosition.x / zoom}px, ${dragPosition.y / zoom}px)`,
                transformOrigin: 'center center'
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* Card info overlay (bottom) */}
        {!isFullscreen && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex justify-between items-end text-white">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  {card.set?.images?.symbol && (
                    <img 
                      src={card.set.images.symbol} 
                      alt={card.set?.name || 'Set'}
                      className="h-4 w-4 object-contain"
                    />
                  )}
                  <span className="text-sm opacity-75">{card.set?.name || 'Unknown Set'}</span>
                  {card.rarity && (
                    <span className="text-xs px-2 py-0.5 bg-white/20 rounded">
                      {card.rarity}
                    </span>
                  )}
                </div>
                
                {card.types && card.types.length > 0 && (
                  <div className="flex space-x-1">
                    {card.types.map((type: string) => (
                      <TypeBadge key={type} type={type} size="sm" />
                    ))}
                  </div>
                )}
              </div>

              <div className="text-right">
                {card.hp && (
                  <div className="text-lg font-bold">{card.hp} HP</div>
                )}
                <Link 
                  href={`/cards/${card.id}`}
                  className="text-sm text-blue-300 hover:text-blue-100 underline"
                  onClick={onClose}
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard shortcuts help */}
        <div className="absolute top-16 right-4 text-white text-xs opacity-50 pointer-events-none">
          <div>Scroll: Zoom • Double-click: Toggle Zoom</div>
          <div>+/- : Zoom • 0: Reset • F: Fullscreen • Esc: Close</div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCardModal;