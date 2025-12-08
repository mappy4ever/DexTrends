/**
 * StickyDeckPanel - Always-visible deck panel with mini thumbnails
 *
 * Desktop: Fixed right sidebar (320px)
 * Mobile: Fixed bottom bar with expand functionality
 */

import React, { memo, useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { EnergyIcon } from '@/components/ui/EnergyIcon';
import type { DeckEntry, DeckStats } from '@/hooks/useDeckBuilder';

interface StickyDeckPanelProps {
  deck: DeckEntry[];
  deckName: string;
  deckStats: DeckStats;
  maxDeckSize: number;
  onRemoveCard: (cardId: string) => void;
  onClearDeck: () => void;
  onViewDeck: () => void;
  onShareDeck: () => void;
  onNameChange: (name: string) => void;
  className?: string;
}

// Mini card thumbnail in the deck grid
const MiniCard = memo(function MiniCard({
  entry,
  onClick
}: {
  entry: DeckEntry;
  onClick: () => void;
}) {
  const imageUrl = entry.card.image || entry.card.thumbnail || '/placeholder-card.png';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative group rounded overflow-hidden',
        'aspect-[2.5/3.5] w-full min-w-[44px]', // Added min-w for touch target
        'bg-stone-200 dark:bg-stone-700',
        'transition-all duration-200',
        'hover:ring-2 hover:ring-red-400 active:scale-95', // Added active feedback
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
        'touch-manipulation' // Optimize for touch
      )}
      aria-label={`Remove ${entry.card.name} from deck`}
    >
      <Image
        src={imageUrl}
        alt={entry.card.name}
        fill
        sizes="48px"
        className="object-cover"
        loading="lazy"
      />

      {/* Count badge */}
      {entry.count > 1 && (
        <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-1 rounded-tl">
          ×{entry.count}
        </div>
      )}

      {/* Remove indicator on hover */}
      <div className={cn(
        'absolute inset-0 bg-red-500/60',
        'flex items-center justify-center',
        'opacity-0 group-hover:opacity-100',
        'transition-opacity duration-150'
      )}>
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    </button>
  );
});

// Empty slot placeholder
const EmptySlot = memo(function EmptySlot({ index }: { index: number }) {
  return (
    <div className={cn(
      'aspect-[2.5/3.5] w-full rounded',
      'bg-stone-100 dark:bg-stone-800',
      'border-2 border-dashed border-stone-300 dark:border-stone-600',
      'flex items-center justify-center'
    )}>
      <span className="text-[10px] text-stone-400 dark:text-stone-500">{index + 1}</span>
    </div>
  );
});

// Type distribution bar
const TypeDistribution = memo(function TypeDistribution({
  distribution,
  totalCards
}: {
  distribution: Record<string, number>;
  totalCards: number;
}) {
  const types = Object.entries(distribution)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  if (types.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 flex-wrap">
        {types.map(([type, count]) => (
          <div key={type} className="flex items-center gap-0.5" title={`${type}: ${count}`}>
            <EnergyIcon type={type} size="xs" />
            <span className="text-xs text-stone-600 dark:text-stone-400">{count}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden flex">
        {types.map(([type], index) => {
          const count = distribution[type];
          const width = (count / totalCards) * 100;
          const colors: Record<string, string> = {
            fire: 'bg-red-500',
            water: 'bg-blue-500',
            grass: 'bg-green-500',
            electric: 'bg-yellow-400',
            lightning: 'bg-yellow-400',
            psychic: 'bg-purple-500',
            fighting: 'bg-orange-600',
            dark: 'bg-gray-700',
            darkness: 'bg-gray-700',
            metal: 'bg-gray-400',
            steel: 'bg-gray-400',
            fairy: 'bg-pink-400',
            dragon: 'bg-indigo-600',
            colorless: 'bg-gray-300',
            trainer: 'bg-emerald-500',
            energy: 'bg-cyan-500'
          };

          return (
            <div
              key={type}
              className={cn(colors[type.toLowerCase()] || 'bg-gray-400')}
              style={{ width: `${width}%` }}
            />
          );
        })}
      </div>
    </div>
  );
});

// Desktop panel component
const DesktopPanel = memo(function DesktopPanel({
  deck,
  deckName,
  deckStats,
  maxDeckSize,
  onRemoveCard,
  onClearDeck,
  onViewDeck,
  onShareDeck,
  onNameChange,
  className
}: StickyDeckPanelProps) {
  const allSlots = Array.from({ length: maxDeckSize }, (_, i) => i);

  return (
    <div className={cn(
      'w-80 bg-white dark:bg-stone-900',
      'border-l border-stone-200 dark:border-stone-700',
      'flex flex-col h-full',
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-700">
        <input
          type="text"
          value={deckName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Deck Name"
          className={cn(
            'w-full px-3 py-2 text-sm font-medium',
            'bg-stone-50 dark:bg-stone-800 rounded-lg',
            'border border-stone-200 dark:border-stone-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'placeholder-stone-400'
          )}
        />

        {/* Progress */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
            {deckStats.totalCards}/{maxDeckSize} cards
          </span>
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            deckStats.isFull
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
          )}>
            {deckStats.remainingSlots} slots left
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300',
              deckStats.isFull ? 'bg-green-500' : 'bg-blue-500'
            )}
            style={{ width: `${(deckStats.totalCards / maxDeckSize) * 100}%` }}
          />
        </div>
      </div>

      {/* Type distribution */}
      {deckStats.totalCards > 0 && (
        <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-700">
          <TypeDistribution
            distribution={deckStats.typeDistribution}
            totalCards={deckStats.totalCards}
          />
        </div>
      )}

      {/* Card Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-5 gap-1.5">
          {allSlots.map((slotIndex) => {
            // Find which card should fill this slot
            let foundEntry: DeckEntry | null = null;
            let tempIndex = 0;

            for (const entry of deck) {
              for (let i = 0; i < entry.count; i++) {
                if (tempIndex === slotIndex) {
                  foundEntry = entry;
                  break;
                }
                tempIndex++;
              }
              if (foundEntry) break;
            }

            if (foundEntry) {
              return (
                <MiniCard
                  key={`${foundEntry.card.id}-${slotIndex}`}
                  entry={foundEntry}
                  onClick={() => onRemoveCard(foundEntry!.card.id)}
                />
              );
            }

            return <EmptySlot key={`empty-${slotIndex}`} index={slotIndex} />;
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t border-stone-200 dark:border-stone-700 space-y-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onViewDeck}
            disabled={deckStats.isEmpty}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              deckStats.isEmpty
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            )}
          >
            View
          </button>
          <button
            type="button"
            onClick={onShareDeck}
            disabled={deckStats.isEmpty}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500',
              deckStats.isEmpty
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            )}
          >
            Share
          </button>
        </div>
        <button
          type="button"
          onClick={onClearDeck}
          disabled={deckStats.isEmpty}
          className={cn(
            'w-full py-2 px-4 rounded-lg font-medium text-sm',
            'transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
            deckStats.isEmpty
              ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
              : 'bg-stone-100 dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400'
          )}
        >
          Clear Deck
        </button>
      </div>
    </div>
  );
});

// Mobile panel component (bottom bar + expandable)
const MobilePanel = memo(function MobilePanel({
  deck,
  deckName,
  deckStats,
  maxDeckSize,
  onRemoveCard,
  onClearDeck,
  onViewDeck,
  onShareDeck,
  onNameChange,
  className
}: StickyDeckPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Panel */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white dark:bg-stone-900',
        'border-t border-stone-200 dark:border-stone-700',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]',
        'transition-all duration-300 ease-out',
        isExpanded ? 'h-[70vh]' : 'h-[80px]', // Reduced collapsed height from 100px to 80px
        'pb-safe', // Safe area for devices with home indicator
        className
      )}>
        {/* Collapsed view - Optimized for mobile */}
        <div className={cn(
          'px-3 py-2',
          isExpanded && 'border-b border-stone-200 dark:border-stone-700'
        )}>
          <div className="flex items-center gap-2">
            {/* Mini card preview (horizontal scroll) - Larger cards for touch */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-1">
                {deck.length > 0 ? (
                  deck.slice(0, 6).map((entry, i) => (
                    <div
                      key={`${entry.card.id}-${i}`}
                      className="w-11 h-[60px] flex-shrink-0 rounded overflow-hidden bg-stone-200 dark:bg-stone-700"
                    >
                      <Image
                        src={entry.card.image || entry.card.thumbnail || '/placeholder-card.png'}
                        alt={entry.card.name}
                        width={44}
                        height={60}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-stone-400 py-4">Tap cards to add</span>
                )}
                {deck.length > 6 && (
                  <div className="w-11 h-[60px] flex-shrink-0 rounded bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
                    <span className="text-xs font-bold text-stone-500">+{deckStats.totalCards - 6}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card count badge - More compact */}
            <div className={cn(
              'flex-shrink-0 min-w-[44px] h-11 px-2 rounded-full',
              'flex items-center justify-center',
              'font-bold text-xs',
              deckStats.isFull
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            )}>
              {deckStats.totalCards}/{maxDeckSize}
            </div>

            {/* Expand button - Larger touch target */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                'flex-shrink-0 min-h-[44px] py-2 px-4 rounded-lg',
                'bg-blue-500 text-white font-medium text-sm',
                'transition-all duration-200 active:scale-95',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                'touch-manipulation'
              )}
            >
              {isExpanded ? 'Close' : 'Deck'}
            </button>
          </div>
        </div>

        {/* Expanded view */}
        {isExpanded && (
          <div className="flex flex-col h-[calc(100%-64px)] overflow-hidden">
            {/* Deck name input - More compact */}
            <div className="px-3 py-2 border-b border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Deck Name"
                  className={cn(
                    'flex-1 px-3 py-2 text-sm font-medium',
                    'bg-stone-50 dark:bg-stone-800 rounded-lg',
                    'border border-stone-200 dark:border-stone-700',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    'min-h-[44px]' // Touch target
                  )}
                />
              </div>

              {/* Type distribution - Compact */}
              {deckStats.totalCards > 0 && (
                <div className="mt-2">
                  <TypeDistribution
                    distribution={deckStats.typeDistribution}
                    totalCards={deckStats.totalCards}
                  />
                </div>
              )}
            </div>

            {/* Card grid (scrollable) - 4 columns for better touch targets */}
            <div className="flex-1 overflow-auto p-3">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: maxDeckSize }, (_, slotIndex) => {
                  let foundEntry: DeckEntry | null = null;
                  let tempIndex = 0;

                  for (const entry of deck) {
                    for (let i = 0; i < entry.count; i++) {
                      if (tempIndex === slotIndex) {
                        foundEntry = entry;
                        break;
                      }
                      tempIndex++;
                    }
                    if (foundEntry) break;
                  }

                  if (foundEntry) {
                    return (
                      <MiniCard
                        key={`${foundEntry.card.id}-${slotIndex}`}
                        entry={foundEntry}
                        onClick={() => onRemoveCard(foundEntry!.card.id)}
                      />
                    );
                  }

                  return <EmptySlot key={`empty-${slotIndex}`} index={slotIndex} />;
                })}
              </div>
            </div>

            {/* Action buttons - With proper touch targets */}
            <div className="p-3 border-t border-stone-200 dark:border-stone-700 pb-safe">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { onViewDeck(); setIsExpanded(false); }}
                  disabled={deckStats.isEmpty}
                  className={cn(
                    'flex-1 min-h-[48px] rounded-lg font-medium text-sm',
                    'transition-all duration-200 active:scale-[0.98]',
                    'touch-manipulation',
                    deckStats.isEmpty
                      ? 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                      : 'bg-blue-500 text-white'
                  )}
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => { onShareDeck(); setIsExpanded(false); }}
                  disabled={deckStats.isEmpty}
                  className={cn(
                    'flex-1 min-h-[48px] rounded-lg font-medium text-sm',
                    'transition-all duration-200 active:scale-[0.98]',
                    'touch-manipulation',
                    deckStats.isEmpty
                      ? 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                      : 'bg-green-500 text-white'
                  )}
                >
                  Share
                </button>
                <button
                  type="button"
                  onClick={onClearDeck}
                  disabled={deckStats.isEmpty}
                  className={cn(
                    'min-h-[48px] px-4 rounded-lg font-medium text-sm',
                    'transition-all duration-200 active:scale-[0.98]',
                    'touch-manipulation',
                    deckStats.isEmpty
                      ? 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  )}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
});

// Main component that switches between desktop and mobile
export function StickyDeckPanel(props: StickyDeckPanelProps) {
  return (
    <>
      {/* Desktop - hidden on mobile */}
      <div className="hidden lg:block h-full">
        <DesktopPanel {...props} />
      </div>

      {/* Mobile - hidden on desktop */}
      <div className="lg:hidden">
        <MobilePanel {...props} />
      </div>
    </>
  );
}
