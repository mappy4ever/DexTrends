import React, { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { cn } from '@/utils/cn';
import { RarityIcon } from '../ui/RarityIcon';
import type { TCGCard } from '@/types/api/cards';

interface CardPreviewModalProps {
  card: TCGCard | null;
  isOpen: boolean;
  onClose: () => void;
  onFavoriteToggle?: (card: TCGCard) => void;
  isFavorite?: boolean;
  getPrice?: (card: TCGCard) => number;
  setInfo?: { id: string; name: string } | null;
}

/**
 * CardPreviewModal - Clean, focused card preview
 * Features:
 * - Large card image
 * - Key info (name, set, rarity, price)
 * - Actions (view details, save)
 * - Keyboard navigation (Escape to close)
 */
export const CardPreviewModal: React.FC<CardPreviewModalProps> = ({
  card,
  isOpen,
  onClose,
  onFavoriteToggle,
  isFavorite = false,
  getPrice = () => 0,
  setInfo
}) => {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Lock body scroll and add keyboard listener
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
      // Focus trap - focus modal on open
      modalRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !card) return null;

  const price = getPrice(card);

  const handleViewDetails = () => {
    // Store card data for faster loading on detail page
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`card-${card.id}`, JSON.stringify(card));
        if (setInfo) {
          sessionStorage.setItem(`set-${setInfo.id}`, JSON.stringify(setInfo));
        }
      } catch {
        // Ignore storage errors
      }
    }
    router.push(`/cards/${card.id}`);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          className={cn(
            'relative',
            'bg-white dark:bg-stone-900 rounded-2xl',
            'shadow-2xl max-w-lg w-full',
            'max-h-[90vh] overflow-y-auto',
            'animate-in fade-in zoom-in-95 duration-200',
            'my-auto'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button - positioned relative to modal */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className={cn(
              'absolute top-3 right-3 z-10',
              'w-11 h-11 min-w-[44px] min-h-[44px] rounded-full',
              'bg-black/30 hover:bg-black/50 active:bg-black/60',
              'flex items-center justify-center',
              'transition-colors touch-manipulation'
            )}
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Card image section */}
          <div className="relative bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900 flex items-center justify-center p-6 pt-10">
            <img
              src={card.images.large || card.images.small}
              alt={card.name}
              className="max-w-[280px] w-full h-auto rounded-lg shadow-xl"
            />
          </div>

          {/* Card info section */}
          <div className="p-5">
            {/* Title and set */}
            <div className="mb-4">
              <h2 id="modal-title" className="text-xl font-bold text-stone-900 dark:text-white">
                {card.name}
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                {card.set.name} · #{card.number}
              </p>
            </div>

            {/* Stats row */}
            <div className="flex gap-3 mb-5">
              {/* Rarity */}
              {card.rarity && (
                <div className="flex-1 bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Rarity</p>
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
                <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1">Market Price</p>
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

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleViewDetails}
                className={cn(
                  'flex-1 px-4 py-3.5 rounded-xl min-h-[48px]',
                  'bg-stone-900 dark:bg-white',
                  'text-white dark:text-stone-900',
                  'font-semibold text-sm',
                  'hover:bg-stone-800 dark:hover:bg-stone-100',
                  'active:scale-[0.98]',
                  'transition-all touch-manipulation',
                  'focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-2'
                )}
              >
                View Details
              </button>

              {onFavoriteToggle && (
                <button
                  onClick={() => onFavoriteToggle(card)}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-pressed={isFavorite}
                  className={cn(
                    'px-4 py-3.5 rounded-xl min-h-[48px] min-w-[48px]',
                    'font-semibold text-sm',
                    'active:scale-[0.98]',
                    'transition-all touch-manipulation',
                    'focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-2',
                    isFavorite
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  )}
                >
                  {isFavorite ? '♥ Saved' : '♡ Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardPreviewModal;
