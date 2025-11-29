import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useNotifications } from '../../hooks/useNotifications';
import { useTheme } from '../../context/UnifiedAppContext';
import logger from '../../utils/logger';
import { Container } from '../ui/Container';

// Type definitions
interface Command {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  keywords: string[];
}

interface Shortcut {
  keys: string[];
  description: string;
  global: boolean;
}

// Keyboard shortcuts manager
export const KeyboardShortcutsManager: React.FC = () => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [commandPalette, setCommandPalette] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { notify } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  // Command palette commands
  const commands: Command[] = [
    {
      id: 'home',
      title: 'Go to Home',
      description: 'Navigate to the homepage',
      icon: '🏠',
      action: () => router.push('/'),
      keywords: ['home', 'main', 'start']
    },
    {
      id: 'pokedex',
      title: 'Open Pokedex',
      description: 'Browse Pokemon database',
      icon: '📚',
      action: () => router.push('/pokedex'),
      keywords: ['pokedex', 'pokemon', 'database']
    },
    {
      id: 'cards',
      title: 'Browse Cards',
      description: 'View Pokemon trading cards',
      icon: '🃏',
      action: () => router.push('/cards'),
      keywords: ['cards', 'tcg', 'trading']
    },
    {
      id: 'favorites',
      title: 'View Favorites',
      description: 'See your favorite Pokemon and cards',
      icon: '❤️',
      action: () => router.push('/favorites'),
      keywords: ['favorites', 'saved', 'liked']
    },
    {
      id: 'trending',
      title: 'Trending Cards',
      description: 'View trending Pokemon cards',
      icon: '🔥',
      action: () => router.push('/trending'),
      keywords: ['trending', 'popular', 'hot']
    },
    {
      id: 'toggle-theme',
      title: 'Toggle Theme',
      description: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`,
      icon: theme === 'dark' ? '☀️' : '🌙',
      action: () => {
        toggleTheme();
        notify.success(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      },
      keywords: ['theme', 'dark', 'light', 'mode']
    },
    {
      id: 'clear-favorites',
      title: 'Clear All Favorites',
      description: 'Remove all items from favorites',
      icon: '🗑️',
      action: () => {
        if (confirm('Are you sure you want to clear all favorites?')) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('favorites');
            notify.success('All favorites cleared');
            location.reload();
          }
        }
      },
      keywords: ['clear', 'delete', 'remove', 'favorites']
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'View all available shortcuts',
      icon: '⌨️',
      action: () => setShowShortcuts(true),
      keywords: ['shortcuts', 'keys', 'help']
    },
    {
      id: 'refresh',
      title: 'Refresh Page',
      description: 'Reload the current page',
      icon: '🔄',
      action: () => router.reload(),
      keywords: ['refresh', 'reload', 'update']
    }
  ];

  // Filter commands based on search term
  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.keywords.some(keyword => keyword.includes(searchTerm.toLowerCase()))
  );

  const shortcuts: Shortcut[] = [
    { keys: ['Ctrl', 'K'], description: 'Open command palette', global: true },
    { keys: ['Ctrl', 'Shift', 'P'], description: 'Go to Pokedex', global: true },
    { keys: ['Ctrl', 'Shift', 'C'], description: 'Go to Cards', global: true },
    { keys: ['Ctrl', 'Shift', 'F'], description: 'Go to Favorites', global: true },
    { keys: ['Ctrl', 'Shift', 'H'], description: 'Go to Home', global: true },
    { keys: ['Ctrl', 'Shift', 'T'], description: 'Toggle theme', global: true },
    { keys: ['F1'], description: 'Show help', global: true },
    { keys: ['?'], description: 'Show keyboard shortcuts', global: true },
    { keys: ['Esc'], description: 'Close modals/panels', global: true },
    { keys: ['F5'], description: 'Refresh page', global: true },
    
    // Page-specific shortcuts
    { keys: ['+', '='], description: 'Zoom in (card view)', global: false },
    { keys: ['-'], description: 'Zoom out (card view)', global: false },
    { keys: ['0'], description: 'Reset zoom (card view)', global: false },
    { keys: ['F'], description: 'Fullscreen (card view)', global: false },
    { keys: ['Space'], description: 'Scroll down', global: false },
    { keys: ['Shift', 'Space'], description: 'Scroll up', global: false },
    { keys: ['Home'], description: 'Go to top', global: false },
    { keys: ['End'], description: 'Go to bottom', global: false }
  ];

  // Execute command
  const executeCommand = useCallback((command: Command) => {
    try {
      command.action();
      setCommandPalette(false);
      setSearchTerm('');
      logger.debug('Command executed', { commandId: command.id });
    } catch (error) {
      logger.error('Failed to execute command', { error, commandId: command.id });
      notify.error('Failed to execute command');
    }
  }, [notify]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPalette(true);
        return;
      }

      // Quick navigation shortcuts
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'p':
            e.preventDefault();
            router.push('/pokedex');
            break;
          case 'c':
            e.preventDefault();
            router.push('/cards');
            break;
          case 'f':
            e.preventDefault();
            router.push('/favorites');
            break;
          case 'h':
            e.preventDefault();
            router.push('/');
            break;
          case 't':
            e.preventDefault();
            toggleTheme();
            notify.success(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
            break;
        }
        return;
      }

      // Help shortcuts
      if (e.key === 'F1') {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }

      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only show shortcuts if not in an input field
        const target = e.target as HTMLElement;
        if (!['INPUT', 'TEXTAREA'].includes(target.tagName)) {
          e.preventDefault();
          setShowShortcuts(true);
        }
        return;
      }

      // Close modals with Escape
      if (e.key === 'Escape') {
        if (commandPalette) {
          setCommandPalette(false);
          setSearchTerm('');
        } else if (showShortcuts) {
          setShowShortcuts(false);
        }
        return;
      }

      // Scroll shortcuts (only if not in input field)
      const target = e.target as HTMLElement;
      if (!['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        if (e.key === ' ') {
          e.preventDefault();
          if (typeof window !== 'undefined') {
            window.scrollBy(0, e.shiftKey ? -window.innerHeight * 0.8 : window.innerHeight * 0.8);
          }
        } else if (e.key === 'Home') {
          e.preventDefault();
          if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
          }
        } else if (e.key === 'End') {
          e.preventDefault();
          if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            window.scrollTo(0, document.body.scrollHeight);
          }
        }
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [router, theme, toggleTheme, notify, commandPalette, showShortcuts]);

  return (
    <>
      {/* Command Palette */}
      {commandPalette && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-32">
          <Container variant="elevated" padding="none" className="w-full max-w-lg mx-4">
            <div className="p-4 border-b border-stone-200 dark:border-stone-700">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type a command or search..."
                  className="w-full pl-10 pr-4 py-2 border-none outline-none bg-transparent text-stone-900 dark:text-stone-100"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((command) => (
                  <button
                    key={command.id}
                    onClick={() => executeCommand(command)}
                    className="w-full text-left px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-center space-x-3"
                  >
                    <span className="text-2xl">{command.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-stone-900 dark:text-stone-100">
                        {command.title}
                      </div>
                      <div className="text-sm text-stone-500 dark:text-stone-400">
                        {command.description}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-stone-500 dark:text-stone-400">
                  No commands found
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 dark:border-stone-700 text-xs text-stone-500 dark:text-stone-400">
              Use ↑↓ to navigate, Enter to select, Esc to close
            </div>
          </Container>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Container variant="elevated" padding="none" className="max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-3">
                    Global Shortcuts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {shortcuts.filter(s => s.global).map((shortcut, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-stone-600 dark:text-stone-300">
                          {shortcut.description}
                        </span>
                        <div className="flex space-x-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <kbd
                              key={keyIndex}
                              className="px-2 py-1 bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded text-sm font-mono"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-3">
                    Page-specific Shortcuts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {shortcuts.filter(s => !s.global).map((shortcut, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-stone-600 dark:text-stone-300">
                          {shortcut.description}
                        </span>
                        <div className="flex space-x-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <kbd
                              key={keyIndex}
                              className="px-2 py-1 bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded text-sm font-mono"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700">
                <p className="text-sm text-stone-500 dark:text-stone-400 text-center">
                  Press <kbd className="px-1 py-0.5 bg-stone-100 dark:bg-stone-700 rounded text-xs">Ctrl+K</kbd> to open the command palette
                </p>
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* Keyboard shortcut indicator (bottom right) */}
      <div className="fixed bottom-4 left-4 z-30 pointer-events-none">
        <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-75">
          Press <kbd className="bg-white bg-opacity-20 px-1 rounded">?</kbd> for shortcuts
        </div>
      </div>
    </>
  );
};

export default KeyboardShortcutsManager;