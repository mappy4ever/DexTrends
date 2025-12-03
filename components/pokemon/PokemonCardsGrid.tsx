import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { cn } from '@/utils/cn';
import { RarityIcon } from '@/components/ui/RarityIcon';
import type { TCGCard } from '@/types/api/cards';
import type { PocketCard } from '@/types/api/pocket-cards';
import { FaCrown } from 'react-icons/fa';

// Extended pocket card interface
interface ExtendedPocketCard extends PocketCard {
  health?: string | number;
  pack?: string;
  type?: string;
}

interface PokemonCardsGridProps {
  tcgCards?: TCGCard[];
  pocketCards?: ExtendedPocketCard[];
  cardType: 'tcg' | 'pocket';
  showPrices?: boolean;
  getPrice?: (card: TCGCard) => number;
}

/**
 * PokemonCardsGrid - Dense, mobile-first card grid for Pokemon detail page
 * Matches the style of TCG Set detail page (CardGrid.tsx)
 */
export const PokemonCardsGrid: React.FC<PokemonCardsGridProps> = ({
  tcgCards = [],
  pocketCards = [],
  cardType,
  showPrices = true,
  getPrice = (card) => {
    const tcgPlayer = card.tcgplayer?.prices;
    if (!tcgPlayer) return 0;
    const priceTypes = ['holofoil', 'reverseHolofoil', 'normal', '1stEditionHolofoil', 'unlimitedHolofoil'];
    for (const type of priceTypes) {
      const priceData = tcgPlayer[type as keyof typeof tcgPlayer];
      if (priceData?.market) return priceData.market;
    }
    return 0;
  }
}) => {
  const router = useRouter();
  const [selectedCard, setSelectedCard] = useState<TCGCard | ExtendedPocketCard | null>(null);

  const handleCardClick = useCallback((card: TCGCard | ExtendedPocketCard) => {
    setSelectedCard(card);
  }, []);

  const handleClosePreview = useCallback(() => {
    setSelectedCard(null);
  }, []);

  const handleViewDetails = useCallback(() => {
    if (!selectedCard) return;

    if (cardType === 'tcg') {
      const card = selectedCard as TCGCard;
      try {
        sessionStorage.setItem(`card-${card.id}`, JSON.stringify(card));
      } catch { /* ignore */ }
      router.push(`/cards/${card.id}`);
    } else {
      const card = selectedCard as ExtendedPocketCard;
      router.push(`/pocket/cards/${card.id}`);
    }
    setSelectedCard(null);
  }, [selectedCard, cardType, router]);

  // Render TCG cards grid
  if (cardType === 'tcg') {
    if (tcgCards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white">No TCG cards found</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">This Pokemon doesn't have any TCG cards yet</p>
        </div>
      );
    }

    return (
      <>
        <div className={cn(
          'grid gap-2 sm:gap-3',
          'grid-cols-3',
          'xs:grid-cols-4',
          'sm:grid-cols-5',
          'md:grid-cols-6',
          'lg:grid-cols-7',
          'xl:grid-cols-8',
          '2xl:grid-cols-10'
        )}>
          {tcgCards.map((card) => {
            const price = getPrice(card);

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={cn(
                  'relative group',
                  'rounded-lg overflow-hidden',
                  'bg-stone-100 dark:bg-stone-800',
                  'transition-all duration-150',
                  'hover:z-10 hover:scale-[1.03] hover:shadow-xl',
                  'active:scale-[0.98]',
                  'focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-1',
                  'touch-manipulation'
                )}
              >
                <img
                  src={card.images?.small || '/back-card.png'}
                  alt={card.name}
                  className="w-full aspect-[245/342] object-cover"
                  loading="lazy"
                  draggable={false}
                />

                {/* Always-visible info bar at bottom */}
                <div className={cn(
                  'absolute inset-x-0 bottom-0',
                  'bg-black/75 backdrop-blur-sm',
                  'px-1.5 py-1',
                  'flex flex-col gap-0.5'
                )}>
                  <p className="text-white text-[10px] sm:text-xs font-semibold line-clamp-1 leading-tight">
                    {card.name}
                  </p>
                  {showPrices && price > 0 && (
                    <p className="text-green-400 text-[10px] sm:text-xs font-bold leading-tight">
                      ${price.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Card number badge - top left */}
                <div className={cn(
                  'absolute top-1 left-1',
                  'px-1 py-0.5 rounded',
                  'bg-black/60 backdrop-blur-sm',
                  'text-white text-[9px] font-medium'
                )}>
                  #{card.number}
                </div>

                {/* High value badge - top right */}
                {showPrices && price >= 50 && (
                  <div className={cn(
                    'absolute top-1 right-1',
                    'px-1.5 py-0.5 rounded',
                    'bg-amber-500/90 backdrop-blur-sm',
                    'text-white text-[10px] font-bold',
                    'shadow-sm'
                  )}>
                    ${price >= 100 ? Math.floor(price) : price.toFixed(0)}+
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Preview Sheet for TCG */}
        {selectedCard && cardType === 'tcg' && (
          <CardPreviewSheet
            card={selectedCard as TCGCard}
            isOpen={!!selectedCard}
            onClose={handleClosePreview}
            onViewDetails={handleViewDetails}
            getPrice={getPrice}
          />
        )}
      </>
    );
  }

  // Render Pocket cards grid
  if (pocketCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-stone-900 dark:text-white">No Pocket cards found</h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">This Pokemon doesn't have any Pocket cards yet</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn(
        'grid gap-2 sm:gap-3',
        'grid-cols-3',
        'xs:grid-cols-4',
        'sm:grid-cols-5',
        'md:grid-cols-6',
        'lg:grid-cols-7',
        'xl:grid-cols-8',
        '2xl:grid-cols-10'
      )}>
        {pocketCards.map((card) => {
          const rarityStr = String(card.rarity || '');
          const isCrownRare = rarityStr === 'Crown Rare' || rarityStr === '👑' || rarityStr === '♕';
          const isStarRarity = rarityStr.includes('★') || rarityStr.includes('☆') || rarityStr.includes('Rare');

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={cn(
                'relative group',
                'rounded-lg overflow-hidden',
                'bg-stone-100 dark:bg-stone-800',
                'transition-all duration-150',
                'hover:z-10 hover:scale-[1.03] hover:shadow-xl',
                'active:scale-[0.98]',
                'focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-1',
                'touch-manipulation'
              )}
            >
              <img
                src={card.image || '/back-card.png'}
                alt={card.name}
                className="w-full aspect-[245/342] object-cover"
                loading="lazy"
                draggable={false}
              />

              {/* Always-visible info bar at bottom - matches TCG style */}
              <div className={cn(
                'absolute inset-x-0 bottom-0',
                'bg-black/75 backdrop-blur-sm',
                'px-1.5 py-1',
                'flex flex-col gap-0.5'
              )}>
                <p className="text-white text-[10px] sm:text-xs font-semibold line-clamp-1 leading-tight">
                  {card.name}
                </p>
              </div>

              {/* Rarity badge for special cards */}
              {(isCrownRare || isStarRarity) && (
                <div className={cn(
                  'absolute top-1 right-1',
                  'px-1.5 py-0.5 rounded',
                  'bg-amber-500/90 backdrop-blur-sm',
                  'text-white text-[10px] font-bold',
                  'shadow-sm flex items-center gap-0.5'
                )}>
                  {isCrownRare ? (
                    <FaCrown className="w-3 h-3" />
                  ) : (
                    <span>{card.rarity?.replace(/☆/g, '★')}</span>
                  )}
                </div>
              )}

              {/* Card number badge */}
              <div className={cn(
                'absolute bottom-1 left-1',
                'px-1 py-0.5 rounded',
                'bg-black/60 backdrop-blur-sm',
                'text-white text-[9px] font-medium',
                'opacity-60 group-hover:opacity-0',
                'transition-opacity'
              )}>
                #{card.id?.split('-')[1] || '???'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Preview Sheet for Pocket */}
      {selectedCard && cardType === 'pocket' && (
        <PocketCardPreviewSheet
          card={selectedCard as ExtendedPocketCard}
          isOpen={!!selectedCard}
          onClose={handleClosePreview}
          onViewDetails={handleViewDetails}
        />
      )}
    </>
  );
};

// TCG Card Preview Sheet Component
interface CardPreviewSheetProps {
  card: TCGCard;
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: () => void;
  getPrice: (card: TCGCard) => number;
}

const CardPreviewSheet: React.FC<CardPreviewSheetProps> = ({
  card,
  isOpen,
  onClose,
  onViewDetails,
  getPrice
}) => {
  const price = getPrice(card);

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
    return undefined;
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

      {/* Sheet */}
      <div
        className={cn(
          'fixed z-50',
          'inset-x-0 bottom-0',
          'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
          'sm:max-w-md sm:w-full sm:mx-4',
          'animate-in fade-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95',
          'duration-200'
        )}
      >
        <div
          className={cn(
            'bg-white dark:bg-stone-900',
            'rounded-t-3xl sm:rounded-2xl',
            'shadow-2xl',
            'max-h-[85vh] sm:max-h-[90vh]',
            'overflow-hidden flex flex-col'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle - mobile only */}
          <div className="sm:hidden flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
          </div>

          {/* Close button - desktop */}
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Card image */}
            <div className="relative bg-gradient-to-b from-stone-100 to-white dark:from-stone-800 dark:to-stone-900 p-4 sm:p-6 flex justify-center">
              <img
                src={card.images?.large || card.images?.small}
                alt={card.name}
                className={cn(
                  'w-auto h-auto',
                  'max-w-[200px] sm:max-w-[240px]',
                  'max-h-[280px] sm:max-h-[340px]',
                  'rounded-lg shadow-2xl object-contain'
                )}
                draggable={false}
              />
            </div>

            {/* Card info */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                    {card.name}
                  </h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                    {card.set?.name} · #{card.number}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-2 mb-4">
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

                {price > 0 && (
                  <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                    <p className="text-[10px] text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">Price</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${price.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {card.artist && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                  Illustrated by <span className="font-medium text-stone-700 dark:text-stone-300">{card.artist}</span>
                </p>
              )}

              <button
                onClick={onViewDetails}
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

// Pocket Card Preview Sheet Component
interface PocketCardPreviewSheetProps {
  card: ExtendedPocketCard;
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: () => void;
}

const PocketCardPreviewSheet: React.FC<PocketCardPreviewSheetProps> = ({
  card,
  isOpen,
  onClose,
  onViewDetails
}) => {
  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
    return undefined;
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rarityStr = String(card.rarity || '');
  const isCrownRare = rarityStr === 'Crown Rare' || rarityStr === '👑' || rarityStr === '♕';
  const getRarityDisplay = (rarity?: string) => {
    if (!rarity) return null;
    if (isCrownRare) return null;
    return rarity.replace(/☆/g, '★').replace(/◊/g, '♦');
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

      {/* Sheet */}
      <div
        className={cn(
          'fixed z-50',
          'inset-x-0 bottom-0',
          'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
          'sm:max-w-md sm:w-full sm:mx-4',
          'animate-in fade-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95',
          'duration-200'
        )}
      >
        <div
          className={cn(
            'bg-white dark:bg-stone-900',
            'rounded-t-3xl sm:rounded-2xl',
            'shadow-2xl',
            'max-h-[85vh] sm:max-h-[90vh]',
            'overflow-hidden flex flex-col'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle - mobile only */}
          <div className="sm:hidden flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
          </div>

          {/* Close button - desktop */}
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Card image */}
            <div className="relative bg-gradient-to-b from-stone-100 to-white dark:from-stone-800 dark:to-stone-900 p-4 sm:p-6 flex justify-center">
              <img
                src={card.image || '/back-card.png'}
                alt={card.name}
                className={cn(
                  'w-auto h-auto',
                  'max-w-[200px] sm:max-w-[240px]',
                  'max-h-[280px] sm:max-h-[340px]',
                  'rounded-lg shadow-2xl object-contain'
                )}
                draggable={false}
              />
            </div>

            {/* Card info */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                    {card.name}
                  </h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                    {card.id?.split('-')[0]?.toUpperCase()} · #{card.id?.split('-')[1] || '???'}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-2 mb-4">
                {card.rarity && (
                  <div className="flex-1 bg-stone-50 dark:bg-stone-800 rounded-xl p-3">
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">Rarity</p>
                    <div className="flex items-center gap-1.5">
                      {isCrownRare ? (
                        <FaCrown className="text-amber-500" size={16} />
                      ) : (
                        <span className="text-amber-500 font-bold">{getRarityDisplay(card.rarity)}</span>
                      )}
                    </div>
                  </div>
                )}

                {card.health && (
                  <div className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                    <p className="text-[10px] text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">HP</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {card.health}
                    </p>
                  </div>
                )}

                {card.type && (
                  <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Type</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 capitalize">
                      {card.type}
                    </p>
                  </div>
                )}
              </div>

              {card.pack && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                  From <span className="font-medium text-stone-700 dark:text-stone-300">{card.pack}</span>
                </p>
              )}

              <button
                onClick={onViewDetails}
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

export default PokemonCardsGrid;
