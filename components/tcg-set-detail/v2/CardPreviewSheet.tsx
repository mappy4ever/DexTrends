import React, { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { cn } from '@/utils/cn';
import { RarityIcon } from '@/components/ui/RarityIcon';
import type { TCGCard } from '@/types/api/cards';

const CARD_FALLBACK = '/back-card.png';

// Preview image component with fallback handling
const PreviewCardImage: React.FC<{ card: TCGCard }> = ({ card }) => {
  const [imgSrc, setImgSrc] = useState(card.images?.large || card.images?.small || CARD_FALLBACK);

  const handleError = useCallback(() => {
    if (imgSrc !== CARD_FALLBACK) {
      setImgSrc(CARD_FALLBACK);
    }
  }, [imgSrc]);

  return (
    <div className="relative bg-gradient-to-b from-stone-100 to-white dark:from-stone-800 dark:to-stone-900 p-4 sm:p-6 flex justify-center">
      <img
        src={imgSrc}
        alt={card.name}
        className={cn(
          'w-auto h-auto',
          'max-w-[200px] sm:max-w-[240px]',
          'max-h-[280px] sm:max-h-[340px]',
          'rounded-lg shadow-2xl',
          'object-contain'
        )}
        draggable={false}
        onError={handleError}
      />
    </div>
  );
};

interface CardPreviewSheetProps {
  card: TCGCard | null;
  isOpen: boolean;
  onClose: () => void;
  onFavoriteToggle?: (card: TCGCard) => void;
  isFavorite?: boolean;
  getPrice?: (card: TCGCard) => number;
}

/**
 * CardPreviewSheet - Bottom sheet preview on mobile, centered modal on desktop
 * Smooth animations, swipe-to-dismiss ready
 */
export const CardPreviewSheet: React.FC<CardPreviewSheetProps> = ({
  card,
  isOpen,
  onClose,
  onFavoriteToggle,
  isFavorite = false,
  getPrice = () => 0
}) => {
  const router = useRouter();

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !card) return null;

  const price = getPrice(card);

  const handleViewDetails = () => {
    // Cache card data for faster navigation
    try {
      sessionStorage.setItem(`card-${card.id}`, JSON.stringify(card));
    } catch { /* ignore */ }
    router.push(`/cards/${card.id}`);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50',
          'bg-black/60 backdrop-blur-sm',
          'animate-in fade-in duration-200'
        )}
        onClick={onClose}
      />

      {/* Sheet - bottom on mobile, center on desktop */}
      <div
        className={cn(
          'fixed z-50',
          // Mobile: bottom sheet
          'inset-x-0 bottom-0',
          'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
          'sm:max-w-md sm:w-full sm:mx-4',
          // Animation
          'animate-in fade-in',
          'slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95',
          'duration-200'
        )}
      >
        <div
          className={cn(
            'bg-white dark:bg-stone-900',
            'rounded-t-3xl sm:rounded-2xl',
            'shadow-2xl',
            'max-h-[85vh] sm:max-h-[90vh]',
            'overflow-hidden',
            'flex flex-col'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle - mobile only */}
          <div className="sm:hidden flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
          </div>

          {/* Close button - desktop only */}
          <button
            onClick={onClose}
            className={cn(
              'hidden sm:flex',
              'absolute top-3 right-3 z-10',
              'w-8 h-8 rounded-full',
              'bg-stone-100 dark:bg-stone-800',
              'items-center justify-center',
              'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300',
              'transition-colors'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Card image with fallback */}
            <PreviewCardImage card={card} />

            {/* Card info */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              {/* Title row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                    {card.name}
                  </h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                    {card.set.name} · #{card.number}
                  </p>
                </div>

                {/* Favorite button */}
                {onFavoriteToggle && (
                  <button
                    onClick={() => onFavoriteToggle(card)}
                    className={cn(
                      'flex-shrink-0',
                      'w-10 h-10 rounded-full',
                      'flex items-center justify-center',
                      'transition-all touch-manipulation',
                      isFavorite
                        ? 'bg-red-500 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-red-500'
                    )}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={isFavorite ? 'currentColor' : 'none'}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Stats row */}
              <div className="flex gap-2 mb-4">
                {/* Rarity */}
                {card.rarity && (
                  <div className="flex-1 bg-stone-50 dark:bg-stone-800 rounded-xl p-3">
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Rarity</p>
                    <div className="flex items-center gap-1.5">
                      <RarityIcon rarity={card.rarity} size="sm" showLabel={false} />
                      <span className="text-sm font-medium text-stone-900 dark:text-white truncate">
                        {card.rarity}
                      </span>
                    </div>
                  </div>
                )}

                {/* Price */}
                {price > 0 && (
                  <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                    <p className="text-[10px] text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">Price</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${price.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Artist */}
              {card.artist && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                  Illustrated by <span className="font-medium text-stone-700 dark:text-stone-300">{card.artist}</span>
                </p>
              )}

              {/* Action button */}
              <button
                onClick={handleViewDetails}
                className={cn(
                  'w-full h-12 rounded-xl',
                  'bg-stone-900 dark:bg-white',
                  'text-white dark:text-stone-900',
                  'font-semibold text-sm',
                  'hover:bg-stone-800 dark:hover:bg-stone-100',
                  'active:scale-[0.98]',
                  'transition-all touch-manipulation'
                )}
              >
                View Full Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardPreviewSheet;
