/**
 * ShareDeckSheet - Integrated deck sharing options
 *
 * Features:
 * - Save Image (primary action)
 * - Copy Link (shareable URL)
 * - Social sharing (Twitter, Discord, Reddit)
 * - Export JSON/Text (secondary)
 */

import React, { memo, useState, useCallback, useEffect } from 'react';
import { cn } from '@/utils/cn';
import type { DeckEntry, DeckStats } from '@/hooks/useDeckBuilder';

interface ShareDeckSheetProps {
  isOpen: boolean;
  onClose: () => void;
  deck: DeckEntry[];
  deckName: string;
  deckStats: DeckStats;
  onSaveImage: () => void;
  shareUrl: string;
  exportText: string;
  exportJSON: string;
}

// Copy to clipboard helper
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers without clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

// Share button component
const ShareButton = memo(function ShareButton({
  icon,
  label,
  color,
  onClick,
  disabled = false
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-4 rounded-xl',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
        'min-h-[80px]',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95',
        color
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
});

export const ShareDeckSheet = memo(function ShareDeckSheet({
  isOpen,
  onClose,
  deck,
  deckName,
  deckStats,
  onSaveImage,
  shareUrl,
  exportText,
  exportJSON
}: ShareDeckSheetProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [showExports, setShowExports] = useState(false);

  // Close on escape
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

  // Reset copied state after delay
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  // Copy link handler
  const handleCopyLink = useCallback(async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied('link');
    }
  }, [shareUrl]);

  // Copy deck list handler
  const handleCopyDeckList = useCallback(async () => {
    const success = await copyToClipboard(exportText);
    if (success) {
      setCopied('deck');
    }
  }, [exportText]);

  // Download handler
  const handleDownload = useCallback((content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Social share handlers
  const shareToTwitter = useCallback(() => {
    const text = `Check out my Pokemon Pocket deck: ${deckName} (${deckStats.totalCards}/20 cards)`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  }, [deckName, deckStats.totalCards, shareUrl]);

  const shareToReddit = useCallback(() => {
    const title = `My Pokemon Pocket Deck: ${deckName}`;
    const url = `https://www.reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  }, [deckName, shareUrl]);

  const shareToDiscord = useCallback(async () => {
    const text = `**${deckName}** (${deckStats.totalCards}/20 cards)\n${shareUrl}\n\n${exportText}`;
    const success = await copyToClipboard(text);
    if (success) {
      setCopied('discord');
    }
  }, [deckName, deckStats.totalCards, shareUrl, exportText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className={cn(
        'relative w-full sm:max-w-md',
        'bg-white dark:bg-stone-900',
        'rounded-t-2xl sm:rounded-2xl',
        'shadow-2xl',
        'max-h-[85vh] overflow-hidden flex flex-col',
        'animate-in slide-in-from-bottom duration-300'
      )}>
        {/* Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3">
          <div className="w-10 h-1 bg-stone-300 dark:bg-stone-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-white">
              Share Deck
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {deckName} • {deckStats.totalCards} cards
            </p>
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

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* Primary Actions */}
          <div>
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
              Share Options
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <ShareButton
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                }
                label="Save Image"
                color="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                onClick={onSaveImage}
              />
              <ShareButton
                icon={
                  copied === 'link' ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  )
                }
                label={copied === 'link' ? 'Copied!' : 'Copy Link'}
                color="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                onClick={handleCopyLink}
              />
              <ShareButton
                icon={
                  copied === 'deck' ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )
                }
                label={copied === 'deck' ? 'Copied!' : 'Copy List'}
                color="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                onClick={handleCopyDeckList}
              />
            </div>
          </div>

          {/* Social Sharing */}
          <div>
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
              Share on Social
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <ShareButton
                icon={
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                }
                label="Twitter/X"
                color="bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white"
                onClick={shareToTwitter}
              />
              <ShareButton
                icon={
                  copied === 'discord' ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                    </svg>
                  )
                }
                label={copied === 'discord' ? 'Copied!' : 'Discord'}
                color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                onClick={shareToDiscord}
              />
              <ShareButton
                icon={
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                }
                label="Reddit"
                color="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                onClick={shareToReddit}
              />
            </div>
          </div>

          {/* Export Options (collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setShowExports(!showExports)}
              className={cn(
                'w-full flex items-center justify-between p-3 rounded-lg',
                'bg-stone-50 dark:bg-stone-800',
                'text-sm font-medium text-stone-700 dark:text-stone-300',
                'hover:bg-stone-100 dark:hover:bg-stone-700',
                'transition-colors duration-150'
              )}
            >
              <span>Export Options</span>
              <svg
                className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  showExports && 'rotate-180'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showExports && (
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => handleDownload(exportText, `${deckName.replace(/[^a-z0-9]/gi, '_')}_deck.txt`, 'text/plain')}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg',
                    'bg-stone-50 dark:bg-stone-800',
                    'hover:bg-stone-100 dark:hover:bg-stone-700',
                    'transition-colors duration-150'
                  )}
                >
                  <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium text-stone-900 dark:text-white">Download as Text</p>
                    <p className="text-xs text-stone-500">Human-readable deck list</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(exportJSON, `${deckName.replace(/[^a-z0-9]/gi, '_')}_deck.json`, 'application/json')}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg',
                    'bg-stone-50 dark:bg-stone-800',
                    'hover:bg-stone-100 dark:hover:bg-stone-700',
                    'transition-colors duration-150'
                  )}
                >
                  <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium text-stone-900 dark:text-white">Download as JSON</p>
                    <p className="text-xs text-stone-500">For importing in other apps</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
