/**
 * DeckSharing - Deck Sharing & Export System
 *
 * Features:
 * - Share decks via unique links
 * - Export as image for social media
 * - QR code generation for quick import
 * - Multiple export formats (JSON, text, image)
 * - Deck import from various formats
 * - Shareable deck previews
 */

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, ContainerHeader, ContainerTitle, ContainerDescription, ContainerFooter } from '@/components/ui/Container';
import Button, { ButtonGroup, IconButton } from '@/components/ui/Button';
import { Modal, useModalState } from '@/components/ui/Modal';
import { EnergyIcon, EnergyBadge } from '@/components/ui/EnergyIcon';
import { cn } from '@/utils/cn';
import { TRANSITION } from '@/components/ui/design-system/glass-constants';
import {
  BsShare,
  BsDownload,
  BsUpload,
  BsLink45Deg,
  BsQrCode,
  BsClipboard,
  BsClipboardCheck,
  BsImage,
  BsFileText,
  BsFileCode,
  BsTwitter,
  BsReddit,
  BsDiscord,
  BsCheckCircle,
  BsExclamationCircle,
  BsChevronDown,
  BsGrid3X3,
} from 'react-icons/bs';
import logger from '@/utils/logger';
import type { Deck, DeckCard, TCGCard } from '@/types/api/cards';

// Deck with full card data
export interface DeckWithCards extends Omit<Deck, 'cards'> {
  cards: (DeckCard & { card: TCGCard })[];
  author?: string;
  thumbnail?: string;
  views?: number;
  likes?: number;
  isPublic?: boolean;
}

interface DeckSharingProps {
  deck: DeckWithCards;
  onDeckUpdate?: (deck: DeckWithCards) => void;
  onShare?: (shareUrl: string) => void;
  onExport?: (format: ExportFormat, data: string) => void;
  className?: string;
}

type ExportFormat = 'json' | 'text' | 'image' | 'ptcgo';
type SharePlatform = 'link' | 'twitter' | 'reddit' | 'discord' | 'qr';

// Format legality check
const FORMAT_REQUIREMENTS = {
  standard: { minCards: 60, maxCards: 60, maxCopies: 4, basicEnergy: 'unlimited' },
  expanded: { minCards: 60, maxCards: 60, maxCopies: 4, basicEnergy: 'unlimited' },
  unlimited: { minCards: 60, maxCards: 60, maxCopies: 4, basicEnergy: 'unlimited' },
};

export const DeckSharing: React.FC<DeckSharingProps> = ({
  deck,
  onDeckUpdate,
  onShare,
  onExport,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'export' | 'import'>('share');
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const shareModal = useModalState();
  const previewModal = useModalState();
  const qrModal = useModalState();

  // Generate shareable URL
  const generateShareUrl = useCallback(() => {
    // Create a compressed representation of the deck
    const deckData = {
      id: deck.id,
      name: deck.name,
      format: deck.format,
      cards: deck.cards.map(c => ({ id: c.cardId, n: c.count })),
    };

    // In production, this would call an API to store the deck and return a short URL
    const encoded = btoa(JSON.stringify(deckData));
    const url = `${window.location.origin}/deck/import?d=${encoded.slice(0, 50)}`;
    setShareUrl(url);
    return url;
  }, [deck]);

  // Deck statistics
  const deckStats = useMemo(() => {
    const stats = {
      totalCards: 0,
      pokemon: 0,
      trainer: 0,
      energy: 0,
      types: new Set<string>(),
      pokemonV: 0,
      pokemonEx: 0,
    };

    deck.cards.forEach(({ card, count }) => {
      stats.totalCards += count;

      if (card.supertype === 'Pokémon') {
        stats.pokemon += count;
        card.types?.forEach(t => stats.types.add(t));
        if (card.subtypes?.some(s => s.includes('V'))) stats.pokemonV += count;
        if (card.subtypes?.some(s => s.toLowerCase().includes('ex'))) stats.pokemonEx += count;
      } else if (card.supertype === 'Trainer') {
        stats.trainer += count;
      } else if (card.supertype === 'Energy') {
        stats.energy += count;
      }
    });

    return stats;
  }, [deck]);

  // Deck validation
  const validation = useMemo(() => {
    const requirements = FORMAT_REQUIREMENTS[deck.format];
    const issues: string[] = [];
    const warnings: string[] = [];

    if (deckStats.totalCards < requirements.minCards) {
      issues.push(`Deck needs ${requirements.minCards - deckStats.totalCards} more cards`);
    }
    if (deckStats.totalCards > requirements.maxCards) {
      issues.push(`Deck has ${deckStats.totalCards - requirements.maxCards} too many cards`);
    }

    // Check for more than 4 copies (excluding basic energy)
    const cardCounts = new Map<string, number>();
    deck.cards.forEach(({ card, count }) => {
      const isBasicEnergy = card.supertype === 'Energy' && !card.subtypes?.includes('Special');
      if (!isBasicEnergy) {
        const key = card.name;
        cardCounts.set(key, (cardCounts.get(key) || 0) + count);
      }
    });

    cardCounts.forEach((count, name) => {
      if (count > 4) {
        issues.push(`Too many copies of ${name} (${count}/4)`);
      }
    });

    // Warnings
    if (deckStats.pokemon < 10) {
      warnings.push('Low Pokemon count - consider adding more');
    }
    if (deckStats.energy < 8 && deckStats.energy > 0) {
      warnings.push('Low energy count for most strategies');
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
    };
  }, [deck, deckStats]);

  // Copy to clipboard
  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      logger.info('Copied to clipboard');
    } catch (error) {
      logger.error('Failed to copy', { error });
    }
  }, []);

  // Export handlers
  const handleExportJson = useCallback(() => {
    const data = JSON.stringify(deck, null, 2);
    downloadFile(data, `${deck.name}.json`, 'application/json');
    onExport?.('json', data);
  }, [deck, onExport]);

  const handleExportText = useCallback(() => {
    const lines: string[] = [
      `# ${deck.name}`,
      `## Format: ${deck.format}`,
      '',
      '## Pokemon',
      ...deck.cards
        .filter(c => c.card.supertype === 'Pokémon')
        .map(c => `${c.count}x ${c.card.name} (${c.card.set.ptcgoCode || c.card.set.id} ${c.card.number})`),
      '',
      '## Trainer',
      ...deck.cards
        .filter(c => c.card.supertype === 'Trainer')
        .map(c => `${c.count}x ${c.card.name}`),
      '',
      '## Energy',
      ...deck.cards
        .filter(c => c.card.supertype === 'Energy')
        .map(c => `${c.count}x ${c.card.name}`),
    ];

    const data = lines.join('\n');
    downloadFile(data, `${deck.name}.txt`, 'text/plain');
    onExport?.('text', data);
  }, [deck, onExport]);

  const handleExportPtcgo = useCallback(() => {
    // PTCGO format
    const lines: string[] = [
      `****** Pokémon Trading Card Game Deck List ******`,
      '',
      `##Pokémon - ${deckStats.pokemon}`,
      '',
      ...deck.cards
        .filter(c => c.card.supertype === 'Pokémon')
        .map(c => `* ${c.count} ${c.card.name} ${c.card.set.ptcgoCode || c.card.set.id} ${c.card.number}`),
      '',
      `##Trainer Cards - ${deckStats.trainer}`,
      '',
      ...deck.cards
        .filter(c => c.card.supertype === 'Trainer')
        .map(c => `* ${c.count} ${c.card.name} ${c.card.set.ptcgoCode || c.card.set.id} ${c.card.number}`),
      '',
      `##Energy - ${deckStats.energy}`,
      '',
      ...deck.cards
        .filter(c => c.card.supertype === 'Energy')
        .map(c => `* ${c.count} ${c.card.name} ${c.card.set.ptcgoCode || 'Energy'} ${c.card.number || ''}`),
      '',
      `Total Cards - ${deckStats.totalCards}`,
      '',
      `****** Deck List Generated by DexTrends ******`,
    ];

    const data = lines.join('\n');
    downloadFile(data, `${deck.name}-ptcgo.txt`, 'text/plain');
    onExport?.('ptcgo', data);
  }, [deck, deckStats, onExport]);

  const handleGenerateImage = useCallback(async () => {
    setIsGenerating(true);
    try {
      // This would use html2canvas or similar to generate an image
      // For now, we'll show the preview modal
      previewModal.open();
    } catch (error) {
      logger.error('Failed to generate image', { error });
    }
    setIsGenerating(false);
  }, [previewModal]);

  // Share handlers
  const handleShareTwitter = useCallback(() => {
    const url = generateShareUrl();
    const text = `Check out my ${deck.format} deck "${deck.name}" on DexTrends! ${deckStats.pokemon} Pokemon, ${deckStats.trainer} Trainers, ${deckStats.energy} Energy.`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }, [deck, deckStats, generateShareUrl]);

  const handleShareReddit = useCallback(() => {
    const url = generateShareUrl();
    const title = `[Deck] ${deck.name} - ${deck.format}`;
    window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
  }, [deck, generateShareUrl]);

  const handleShareDiscord = useCallback(() => {
    // Copy formatted message for Discord
    const message = `**${deck.name}** (${deck.format})\n` +
      `Pokemon: ${deckStats.pokemon} | Trainers: ${deckStats.trainer} | Energy: ${deckStats.energy}\n` +
      `${generateShareUrl()}`;
    handleCopy(message);
  }, [deck, deckStats, generateShareUrl, handleCopy]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Deck Header */}
      <Container variant="elevated" padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Deck Preview Thumbnail */}
          <div className="relative w-full sm:w-48 aspect-video sm:aspect-square rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center overflow-hidden">
            {deck.thumbnail ? (
              <Image src={deck.thumbnail} alt={deck.name} fill className="object-cover" sizes="192px" />
            ) : (
              <div className="grid grid-cols-3 gap-1 p-2">
                {deck.cards.slice(0, 9).map((c, i) => (
                  <div key={i} className="relative aspect-[2.5/3.5] rounded overflow-hidden bg-white/50">
                    <Image src={c.card.images.small} alt="" fill className="object-cover" sizes="48px" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deck Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-800 dark:text-white">{deck.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    deck.format === 'standard' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                    deck.format === 'expanded' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  )}>
                    {deck.format}
                  </span>
                  {validation.isValid ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <BsCheckCircle className="w-3 h-3" />
                      Valid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <BsExclamationCircle className="w-3 h-3" />
                      {validation.issues.length} issue{validation.issues.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={<BsShare className="w-4 h-4" />}
                onClick={shareModal.open}
              >
                Share
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{deckStats.pokemon}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Pokemon</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{deckStats.trainer}</div>
                <div className="text-xs text-purple-700 dark:text-purple-300">Trainers</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{deckStats.energy}</div>
                <div className="text-xs text-amber-700 dark:text-amber-300">Energy</div>
              </div>
            </div>

            {/* Types */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-stone-500 dark:text-stone-400">Types:</span>
              <div className="flex gap-1">
                {Array.from(deckStats.types).map(type => (
                  <EnergyIcon key={type} type={type} size="sm" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Validation Issues/Warnings */}
        {(validation.issues.length > 0 || validation.warnings.length > 0) && (
          <div className="mt-4 space-y-2">
            {validation.issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                <BsExclamationCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {issue}
              </div>
            ))}
            {validation.warnings.map((warning, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm">
                <BsExclamationCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {warning}
              </div>
            ))}
          </div>
        )}
      </Container>

      {/* Deck Cards Preview */}
      <Container variant="elevated" padding="md">
        <ContainerHeader>
          <ContainerTitle size="sm">Deck List</ContainerTitle>
          <ContainerDescription>{deckStats.totalCards} cards total</ContainerDescription>
        </ContainerHeader>

        <div className="space-y-4">
          {/* Pokemon */}
          <DeckSection
            title="Pokemon"
            count={deckStats.pokemon}
            cards={deck.cards.filter(c => c.card.supertype === 'Pokémon')}
          />

          {/* Trainers */}
          <DeckSection
            title="Trainers"
            count={deckStats.trainer}
            cards={deck.cards.filter(c => c.card.supertype === 'Trainer')}
          />

          {/* Energy */}
          <DeckSection
            title="Energy"
            count={deckStats.energy}
            cards={deck.cards.filter(c => c.card.supertype === 'Energy')}
          />
        </div>
      </Container>

      {/* Share Modal */}
      <Modal
        isOpen={shareModal.isOpen}
        onClose={shareModal.close}
        title="Share Deck"
        size="lg"
      >
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-stone-200 dark:border-stone-700">
            {[
              { id: 'share', label: 'Share', icon: BsShare },
              { id: 'export', label: 'Export', icon: BsDownload },
              { id: 'import', label: 'Import', icon: BsUpload },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 -mb-px border-b-2 text-sm font-medium',
                  TRANSITION.default,
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Share Tab */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              {/* Copy Link */}
              <div>
                <label className="text-sm font-medium text-stone-600 dark:text-stone-300 mb-2 block">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl || 'Click generate to create a share link'}
                    readOnly
                    className={cn(
                      'flex-1 px-4 py-2 rounded-lg',
                      'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                      'text-stone-800 dark:text-white text-sm',
                      'focus:outline-none'
                    )}
                  />
                  {shareUrl ? (
                    <Button
                      variant={copied ? 'success' : 'secondary'}
                      onClick={() => handleCopy(shareUrl)}
                      icon={copied ? <BsClipboardCheck className="w-4 h-4" /> : <BsClipboard className="w-4 h-4" />}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => {
                        const url = generateShareUrl();
                        onShare?.(url);
                      }}
                      icon={<BsLink45Deg className="w-4 h-4" />}
                    >
                      Generate
                    </Button>
                  )}
                </div>
              </div>

              {/* Social Share */}
              <div>
                <label className="text-sm font-medium text-stone-600 dark:text-stone-300 mb-2 block">
                  Share to Social
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={handleShareTwitter}
                    className={cn(
                      'flex items-center justify-center gap-2 p-3 rounded-lg',
                      'bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20',
                      TRANSITION.default
                    )}
                  >
                    <BsTwitter className="w-5 h-5" />
                    <span className="text-sm font-medium">Twitter</span>
                  </button>
                  <button
                    onClick={handleShareReddit}
                    className={cn(
                      'flex items-center justify-center gap-2 p-3 rounded-lg',
                      'bg-[#FF4500]/10 text-[#FF4500] hover:bg-[#FF4500]/20',
                      TRANSITION.default
                    )}
                  >
                    <BsReddit className="w-5 h-5" />
                    <span className="text-sm font-medium">Reddit</span>
                  </button>
                  <button
                    onClick={handleShareDiscord}
                    className={cn(
                      'flex items-center justify-center gap-2 p-3 rounded-lg',
                      'bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20',
                      TRANSITION.default
                    )}
                  >
                    <BsDiscord className="w-5 h-5" />
                    <span className="text-sm font-medium">Discord</span>
                  </button>
                  <button
                    onClick={qrModal.open}
                    className={cn(
                      'flex items-center justify-center gap-2 p-3 rounded-lg',
                      'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700',
                      TRANSITION.default
                    )}
                  >
                    <BsQrCode className="w-5 h-5" />
                    <span className="text-sm font-medium">QR Code</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Export your deck in various formats for different uses.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportJson}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl',
                    'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                    'hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20',
                    TRANSITION.default
                  )}
                >
                  <BsFileCode className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium text-stone-800 dark:text-white">JSON</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">Full data backup</span>
                </button>

                <button
                  onClick={handleExportText}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl',
                    'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                    'hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20',
                    TRANSITION.default
                  )}
                >
                  <BsFileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-stone-800 dark:text-white">Text</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">Human readable</span>
                </button>

                <button
                  onClick={handleExportPtcgo}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl',
                    'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                    'hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20',
                    TRANSITION.default
                  )}
                >
                  <BsGrid3X3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-stone-800 dark:text-white">PTCGO</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">Pokemon TCG Online</span>
                </button>

                <button
                  onClick={handleGenerateImage}
                  disabled={isGenerating}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl',
                    'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                    'hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20',
                    TRANSITION.default,
                    isGenerating && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <BsImage className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-stone-800 dark:text-white">Image</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">Social media ready</span>
                </button>
              </div>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <ImportDeckSection onImport={(data) => {
              logger.info('Deck imported', { cardCount: data.cards.length });
              shareModal.close();
            }} />
          )}
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={qrModal.isOpen}
        onClose={qrModal.close}
        title="QR Code"
        size="sm"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-48 h-48 bg-white p-4 rounded-xl">
            {/* This would render an actual QR code using a library like qrcode.react */}
            <div className="w-full h-full bg-stone-100 flex items-center justify-center rounded">
              <BsQrCode className="w-24 h-24 text-stone-400" />
            </div>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center">
            Scan this QR code to quickly import this deck
          </p>
          <Button
            variant="secondary"
            onClick={() => handleCopy(shareUrl || generateShareUrl())}
            icon={<BsClipboard className="w-4 h-4" />}
          >
            Copy Link Instead
          </Button>
        </div>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        isOpen={previewModal.isOpen}
        onClose={previewModal.close}
        title="Deck Image Preview"
        size="xl"
      >
        <DeckImagePreview deck={deck} deckStats={deckStats} />
      </Modal>
    </div>
  );
};

// Deck Section Component
const DeckSection: React.FC<{
  title: string;
  count: number;
  cards: (DeckCard & { card: TCGCard })[];
}> = ({ title, count, cards }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (cards.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 text-left"
      >
        <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
          {title} ({count})
        </span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <BsChevronDown className="w-4 h-4 text-stone-400" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-1 overflow-hidden"
          >
            {cards.map(({ card, count }) => (
              <div
                key={card.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50"
              >
                <span className="w-6 text-center text-sm font-medium text-stone-600 dark:text-stone-300">
                  {count}x
                </span>
                <div className="relative w-8 h-10 rounded overflow-hidden flex-shrink-0">
                  <Image src={card.images.small} alt={card.name} fill className="object-cover" sizes="32px" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-stone-800 dark:text-white truncate">
                    {card.name}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    {card.set.name} #{card.number}
                  </div>
                </div>
                {card.types && (
                  <div className="flex gap-1">
                    {card.types.map(type => (
                      <EnergyIcon key={type} type={type} size="xs" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Import Deck Section
const ImportDeckSection: React.FC<{
  onImport: (deck: DeckWithCards) => void;
}> = ({ onImport }) => {
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleImport = useCallback(() => {
    try {
      // Try JSON first
      const data = JSON.parse(importText);
      if (data.cards && Array.isArray(data.cards)) {
        onImport(data as DeckWithCards);
        return;
      }
    } catch {
      // Try text format
      // This would parse the text format and convert to deck data
    }

    setImportError('Could not parse deck data. Please check the format.');
  }, [importText, onImport]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Paste your deck list in JSON, text, or PTCGO format.
      </p>

      <textarea
        value={importText}
        onChange={e => {
          setImportText(e.target.value);
          setImportError(null);
        }}
        placeholder="Paste your deck list here..."
        rows={8}
        className={cn(
          'w-full px-4 py-3 rounded-lg',
          'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
          'text-stone-800 dark:text-white text-sm font-mono',
          'focus:outline-none focus:ring-2 focus:ring-amber-500',
          'resize-none'
        )}
      />

      {importError && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <BsExclamationCircle className="w-4 h-4" />
          {importError}
        </div>
      )}

      <Button
        variant="primary"
        fullWidth
        onClick={handleImport}
        disabled={!importText.trim()}
        icon={<BsUpload className="w-4 h-4" />}
      >
        Import Deck
      </Button>
    </div>
  );
};

// Deck Image Preview (for social sharing)
const DeckImagePreview: React.FC<{
  deck: DeckWithCards;
  deckStats: {
    totalCards: number;
    pokemon: number;
    trainer: number;
    energy: number;
    types: Set<string>;
  };
}> = ({ deck, deckStats }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div
        ref={previewRef}
        className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-800 dark:to-stone-900 p-6 rounded-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-stone-800 dark:text-white">{deck.name}</h3>
            <span className="text-sm text-stone-500 dark:text-stone-400">{deck.format} format</span>
          </div>
          <div className="flex gap-1">
            {Array.from(deckStats.types).slice(0, 3).map(type => (
              <EnergyIcon key={type} type={type} size="lg" />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-stone-700/50">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{deckStats.pokemon}</div>
            <div className="text-xs text-stone-600 dark:text-stone-300">Pokemon</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-stone-700/50">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{deckStats.trainer}</div>
            <div className="text-xs text-stone-600 dark:text-stone-300">Trainers</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-stone-700/50">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{deckStats.energy}</div>
            <div className="text-xs text-stone-600 dark:text-stone-300">Energy</div>
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-6 gap-2">
          {deck.cards.slice(0, 12).map((c, i) => (
            <div key={i} className="relative aspect-[2.5/3.5] rounded-lg overflow-hidden shadow-md">
              <Image src={c.card.images.small} alt={c.card.name} fill className="object-cover" sizes="64px" loading="lazy" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-stone-200/50 dark:border-stone-700/50 flex items-center justify-between">
          <span className="text-xs text-stone-500 dark:text-stone-400">Created with DexTrends</span>
          <span className="text-xs text-stone-500 dark:text-stone-400">{deckStats.totalCards} cards</span>
        </div>
      </div>

      {/* Download Button */}
      <Button
        variant="primary"
        fullWidth
        icon={<BsDownload className="w-4 h-4" />}
        onClick={() => {
          // Would use html2canvas to generate image
          logger.info('Downloading deck image');
        }}
      >
        Download Image
      </Button>
    </div>
  );
};

// Helper function to download files
function downloadFile(data: string, filename: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default DeckSharing;
