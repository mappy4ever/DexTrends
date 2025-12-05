import React, { useEffect, useCallback, useState } from 'react';
import { cn } from '@/utils/cn';
import type { PocketCard } from '@/types/api/pocket-cards';
import { EnergyIcon } from '@/components/ui/EnergyIcon';

const CARD_FALLBACK = '/back-card.png';

interface PocketCardPreviewSheetProps {
  card: PocketCard | null;
  isOpen: boolean;
  onClose: () => void;
}

// Get rarity display
const getRarityDisplay = (rarity?: string): string => {
  if (!rarity) return '';
  return rarity
    .replace(/☆/g, '★')
    .replace(/◊/g, '♦');
};

/**
 * PocketCardPreviewSheet - Bottom sheet for card preview on mobile
 * Matches TCG CardPreviewSheet style
 */
export const PocketCardPreviewSheet: React.FC<PocketCardPreviewSheetProps> = ({
  card,
  isOpen,
  onClose
}) => {
  const [imgSrc, setImgSrc] = useState(CARD_FALLBACK);

  // Update image source when card changes
  useEffect(() => {
    if (card?.image) {
      setImgSrc(card.image);
    } else {
      setImgSrc(CARD_FALLBACK);
    }
  }, [card]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleImageError = useCallback(() => {
    if (imgSrc !== CARD_FALLBACK) {
      setImgSrc(CARD_FALLBACK);
    }
  }, [imgSrc]);

  if (!isOpen || !card) return null;

  // Parse card number from ID (e.g., "a1-001" -> "A1 #001")
  const setCode = card.id?.split('-')[0]?.toUpperCase() || '';
  const cardNumber = card.id?.split('-')[1] || card.number || '???';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className={cn(
        'fixed inset-x-0 bottom-0 z-50',
        'bg-white dark:bg-stone-900',
        'rounded-t-3xl',
        'shadow-2xl',
        'animate-in slide-in-from-bottom duration-300',
        'max-h-[90vh] overflow-hidden',
        'flex flex-col'
      )}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-600" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-safe">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pb-4">
            {/* Card image */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="w-48 sm:w-56 rounded-xl overflow-hidden shadow-lg bg-stone-100 dark:bg-stone-800">
                <img
                  src={imgSrc}
                  alt={card.name}
                  className="w-full aspect-[245/342] object-cover"
                  onError={handleImageError}
                />
              </div>
            </div>

            {/* Card info */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                    {card.name}
                  </h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                    {setCode} #{cardNumber}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {/* Type */}
                {card.types && card.types.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-stone-100 dark:bg-stone-800">
                    <EnergyIcon type={card.types[0]} size="sm" />
                    <span className="text-xs font-medium text-stone-700 dark:text-stone-300 capitalize">
                      {card.types[0]}
                    </span>
                  </div>
                )}

                {/* HP */}
                {card.hp && (
                  <div className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">
                      {card.hp} HP
                    </span>
                  </div>
                )}

                {/* Rarity */}
                {card.rarity && (
                  <div className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {getRarityDisplay(card.rarity)}
                    </span>
                  </div>
                )}

                {/* ex badge */}
                {(card as any).ex === 'Yes' && (
                  <div className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      ex
                    </span>
                  </div>
                )}
              </div>

              {/* Attacks */}
              {card.attacks && card.attacks.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-white mb-2">
                    Attacks
                  </h3>
                  <div className="space-y-2">
                    {card.attacks.map((attack, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/* Energy cost */}
                            <div className="flex gap-0.5">
                              {attack.cost.map((cost, i) => (
                                <EnergyIcon key={i} type={cost} size="xs" />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-stone-900 dark:text-white">
                              {attack.name}
                            </span>
                          </div>
                          {attack.damage && (
                            <span className="text-sm font-bold text-stone-900 dark:text-white">
                              {attack.damage}
                            </span>
                          )}
                        </div>
                        {attack.text && (
                          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                            {attack.text}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Effect (for Trainers) */}
              {card.effect && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-white mb-2">
                    Effect
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    {card.effect}
                  </p>
                </div>
              )}

              {/* Weaknesses & Retreat */}
              {(card.weaknesses || card.retreatCost) && (
                <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-stone-200 dark:border-stone-700">
                  {card.weaknesses && card.weaknesses.length > 0 && (
                    <div>
                      <span className="text-xs text-stone-500 dark:text-stone-400 block mb-1">
                        Weakness
                      </span>
                      <div className="flex items-center gap-1">
                        <EnergyIcon type={card.weaknesses[0].type} size="sm" />
                        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                          {card.weaknesses[0].value}
                        </span>
                      </div>
                    </div>
                  )}

                  {card.retreatCost !== undefined && card.retreatCost > 0 && (
                    <div>
                      <span className="text-xs text-stone-500 dark:text-stone-400 block mb-1">
                        Retreat Cost
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: card.retreatCost }).map((_, i) => (
                          <EnergyIcon key={i} type="colorless" size="sm" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Illustrator */}
              {card.illustrator && (
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-4">
                  Illus. {card.illustrator}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PocketCardPreviewSheet;
