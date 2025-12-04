/**
 * DeckPreviewModal - Screenshot-optimized deck preview
 *
 * Features:
 * - Toggle between 4x5 grid and 2x10 list views
 * - Clean layout optimized for screenshots
 * - Type distribution footer with EnergyIcon symbols
 * - One-tap save image using html2canvas
 * - DexTrends watermark
 */

import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { EnergyIcon } from '@/components/ui/EnergyIcon';
import type { DeckEntry, DeckStats } from '@/hooks/useDeckBuilder';

type ViewMode = 'grid' | 'list';

interface DeckPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: DeckEntry[];
  deckName: string;
  deckStats: DeckStats;
  onShare: () => void;
}

// Dynamic import for html2canvas to avoid SSR issues
type Html2CanvasFunc = (element: HTMLElement, options?: object) => Promise<HTMLCanvasElement>;
let html2canvasLib: Html2CanvasFunc | null = null;

async function loadHtml2Canvas(): Promise<Html2CanvasFunc | null> {
  if (!html2canvasLib) {
    const imported = await import('html2canvas');
    html2canvasLib = imported.default as Html2CanvasFunc;
  }
  return html2canvasLib;
}

// Grid view card
const GridCard = memo(function GridCard({ entry }: { entry: DeckEntry }) {
  const imageUrl = entry.card.image || entry.card.thumbnail || '/placeholder-card.png';

  return (
    <div className="relative aspect-[2.5/3.5] rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-700">
      <Image
        src={imageUrl}
        alt={entry.card.name}
        fill
        sizes="80px"
        className="object-cover"
        unoptimized // For screenshot capture
      />
      {entry.count > 1 && (
        <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
          ×{entry.count}
        </div>
      )}
    </div>
  );
});

// List view card
const ListCard = memo(function ListCard({ entry }: { entry: DeckEntry }) {
  const imageUrl = entry.card.image || entry.card.thumbnail || '/placeholder-card.png';
  const type = entry.card.type?.toLowerCase() || 'colorless';

  return (
    <div className={cn(
      'flex items-center gap-3 p-2 rounded-lg',
      'bg-stone-50 dark:bg-stone-800'
    )}>
      <div className="w-10 h-14 flex-shrink-0 relative rounded overflow-hidden bg-stone-200">
        <Image
          src={imageUrl}
          alt={entry.card.name}
          fill
          sizes="40px"
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-stone-900 dark:text-white truncate">
          {entry.card.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <EnergyIcon type={type} size="xs" />
          {entry.card.health && (
            <span className="text-xs text-stone-500">HP {entry.card.health}</span>
          )}
        </div>
      </div>
      <div className={cn(
        'w-8 h-8 flex-shrink-0 rounded-full',
        'bg-blue-100 dark:bg-blue-900/30',
        'flex items-center justify-center',
        'font-bold text-sm text-blue-700 dark:text-blue-300'
      )}>
        {entry.count}
      </div>
    </div>
  );
});

// Type distribution for footer
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

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {types.map(([type, count]) => (
        <div key={type} className="flex items-center gap-1.5">
          <EnergyIcon type={type} size="sm" />
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
            {count}
          </span>
        </div>
      ))}
    </div>
  );
});

export const DeckPreviewModal = memo(function DeckPreviewModal({
  isOpen,
  onClose,
  deck,
  deckName,
  deckStats,
  onShare
}: DeckPreviewModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isSaving, setIsSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Save deck as image
  const saveAsImage = useCallback(async () => {
    if (!previewRef.current || isSaving) return;

    setIsSaving(true);
    try {
      const canvas = await loadHtml2Canvas();
      if (!canvas) throw new Error('Failed to load html2canvas');

      const element = previewRef.current;
      const canvasResult = await canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // High DPI for crisp images
        useCORS: true,
        logging: false
      });

      // Convert to blob and download
      canvasResult.toBlob((blob: Blob | null) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const filename = `${deckName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_deck.png`;

        // Try native share on mobile
        if (navigator.share && navigator.canShare?.({ files: [new File([blob], filename, { type: 'image/png' })] })) {
          navigator.share({
            files: [new File([blob], filename, { type: 'image/png' })],
            title: deckName,
            text: `Check out my Pokemon Pocket deck: ${deckName}`
          }).catch(() => {
            // Fallback to download
            downloadImage(url, filename);
          });
        } else {
          downloadImage(url, filename);
        }

        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to save image:', error);
      alert('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [deckName, isSaving]);

  if (!isOpen) return null;

  // Expand deck entries to individual cards for grid view
  const expandedCards: DeckEntry[] = [];
  deck.forEach(entry => {
    for (let i = 0; i < entry.count; i++) {
      expandedCards.push({ ...entry, count: 1 });
    }
  });

  // Fill remaining slots with empty for grid
  const gridSlots = 20;
  while (expandedCards.length < gridSlots) {
    expandedCards.push(null as unknown as DeckEntry);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        'relative w-full max-w-lg mx-4',
        'bg-white dark:bg-stone-900 rounded-2xl',
        'shadow-2xl',
        'max-h-[90vh] overflow-hidden flex flex-col'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white">
            Deck Preview
          </h2>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-1.5 rounded text-sm font-medium',
                'transition-colors duration-150',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-stone-700 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              )}
            >
              4×5 Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1.5 rounded text-sm font-medium',
                'transition-colors duration-150',
                viewMode === 'list'
                  ? 'bg-white dark:bg-stone-700 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              )}
            >
              2×10 List
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              'p-2 rounded-full',
              'hover:bg-stone-100 dark:hover:bg-stone-800',
              'transition-colors duration-150'
            )}
          >
            <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview Content (for screenshot) */}
        <div className="flex-1 overflow-auto">
          <div
            ref={previewRef}
            className="p-4 bg-white dark:bg-stone-900"
          >
            {/* Deck Title */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                {deckName}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {deckStats.totalCards}/20 Cards
              </p>
            </div>

            {/* Card Grid (4x5) */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-4 gap-2">
                {expandedCards.slice(0, 20).map((entry, index) => (
                  entry ? (
                    <GridCard key={`${entry.card.id}-${index}`} entry={entry} />
                  ) : (
                    <div
                      key={`empty-${index}`}
                      className={cn(
                        'aspect-[2.5/3.5] rounded-lg',
                        'bg-stone-100 dark:bg-stone-800',
                        'border-2 border-dashed border-stone-300 dark:border-stone-600'
                      )}
                    />
                  )
                ))}
              </div>
            )}

            {/* Card List (2x10) */}
            {viewMode === 'list' && (
              <div className="grid grid-cols-2 gap-2">
                {deck.map((entry, index) => (
                  <ListCard key={`${entry.card.id}-${index}`} entry={entry} />
                ))}
              </div>
            )}

            {/* Type Distribution */}
            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
              <TypeDistribution
                distribution={deckStats.typeDistribution}
                totalCards={deckStats.totalCards}
              />
            </div>

            {/* Watermark */}
            <div className="mt-4 text-center">
              <p className="text-xs text-stone-400 dark:text-stone-500">
                Created with DexTrends
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-700 flex gap-3">
          <button
            type="button"
            onClick={saveAsImage}
            disabled={isSaving}
            className={cn(
              'flex-1 py-3 rounded-xl font-medium',
              'bg-blue-500 hover:bg-blue-600 text-white',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              'flex items-center justify-center gap-2',
              isSaving && 'opacity-70 cursor-wait'
            )}
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Save Image</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onShare}
            className={cn(
              'flex-1 py-3 rounded-xl font-medium',
              'bg-green-500 hover:bg-green-600 text-white',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500',
              'flex items-center justify-center gap-2'
            )}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
});

// Helper function to download image
function downloadImage(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
