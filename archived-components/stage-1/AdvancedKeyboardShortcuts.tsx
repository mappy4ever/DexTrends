import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { 
  CommandLineIcon, 
  BookmarkIcon, 
  MagnifyingGlassIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
  EyeIcon,
  StarIcon,
  FolderIcon,
  CogIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../../hooks/useNotifications';

// Type definitions
interface Command {
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
  shortcut?: string;
  context?: string[];
  condition?: () => boolean;
}

interface CommandWithId extends Command {
  id: string;
}

interface MacroStep {
  command: string;
  timestamp: number;
}

interface CustomShortcut {
  title: string;
  description: string;
  macro?: MacroStep[];
  created: number;
  shortcut?: string;
}

interface SavedShortcuts {
  customShortcuts: Record<string, CustomShortcut>;
  recentCommands: CommandWithId[];
}

interface CurrentContext {
  page?: string;
}

interface AdvancedKeyboardShortcutsProps {
  onBulkOperations?: (operation: string, items: unknown[]) => void;
  onCardSelection?: (type: 'all' | 'none') => void;
  onViewMode?: (mode: 'grid' | 'list' | 'compact') => void;
  onExport?: (items: unknown[]) => void;
  onShare?: () => void;
  currentContext?: CurrentContext;
  selectedItems?: unknown[];
}

type ActiveMode = 'command' | 'search' | 'macro';

/**
 * Advanced Keyboard Shortcuts System for Power Users
 * Enhanced command palette, macros, custom shortcuts, and workflow automation
 */
const AdvancedKeyboardShortcuts: React.FC<AdvancedKeyboardShortcutsProps> = ({ 
  onBulkOperations,
  onCardSelection,
  onViewMode,
  onExport,
  onShare,
  currentContext = {},
  selectedItems = []
}) => {
  const [commandPalette, setCommandPalette] = useState(false);
  const [macroRecording, setMacroRecording] = useState(false);
  const [customShortcuts, setCustomShortcuts] = useState<Record<string, CustomShortcut>>({});
  const [recentCommands, setRecentCommands] = useState<CommandWithId[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMode, setActiveMode] = useState<ActiveMode>('command');
  const [recordedMacro, setRecordedMacro] = useState<MacroStep[]>([]);
  const [macroName, setMacroName] = useState('');
  const [shortcuts, setShortcuts] = useState<string[]>([]);
  
  const router = useRouter();
  const { notify } = useNotifications();
  const inputRef = useRef<HTMLInputElement>(null);

  // Macro recording functions
  const startMacroRecording = useCallback(() => {
    setMacroRecording(true);
    setRecordedMacro([]);
    notify.info('Macro recording started');
  }, [notify]);

  const stopMacroRecording = useCallback(() => {
    setMacroRecording(false);
    if (recordedMacro.length > 0) {
      // Show save macro dialog
      const name = prompt('Enter macro name:');
      if (name) {
        const newShortcuts = {
          ...customShortcuts,
          [name]: {
            title: name,
            description: `Custom macro with ${recordedMacro.length} steps`,
            macro: recordedMacro,
            created: Date.now()
          }
        };
        setCustomShortcuts(newShortcuts);
        saveShortcuts(newShortcuts, recentCommands);
        notify.success(`Macro "${name}" saved`);
      }
    }
    setRecordedMacro([]);
  }, [recordedMacro, customShortcuts, recentCommands, notify]);

  // Load saved shortcuts and macros
  useEffect(() => {
    const saved = localStorage.getItem('advancedShortcuts');
    if (saved) {
      const parsed: SavedShortcuts = JSON.parse(saved);
      setCustomShortcuts(parsed.customShortcuts || {});
      setRecentCommands(parsed.recentCommands || []);
    }
  }, []);

  // Save shortcuts to localStorage
  const saveShortcuts = (shortcuts: Record<string, CustomShortcut>, recent: CommandWithId[]) => {
    localStorage.setItem('advancedShortcuts', JSON.stringify({
      customShortcuts: shortcuts,
      recentCommands: recent
    }));
  };

  // Advanced command registry
  const advancedCommands: Record<string, Command> = useMemo(() => ({
    // Navigation & UI
    'nav:home': {
      title: 'Go to Home',
      description: 'Navigate to homepage',
      icon: <BookmarkIcon className="h-4 w-4" />,
      category: 'navigation',
      action: () => router.push('/'),
      shortcut: 'ctrl+shift+h'
    },
    'nav:search': {
      title: 'Focus Search',
      description: 'Focus on search input',
      icon: <MagnifyingGlassIcon className="h-4 w-4" />,
      category: 'navigation',
      action: () => {
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      },
      shortcut: 'ctrl+f'
    },
    'ui:toggle-sidebar': {
      title: 'Toggle Sidebar',
      description: 'Show/hide sidebar',
      icon: <FolderIcon className="h-4 w-4" />,
      category: 'ui',
      action: () => {
        // Implement sidebar toggle logic
        notify.info('Sidebar toggled');
      },
      shortcut: 'ctrl+b'
    },
    'ui:fullscreen': {
      title: 'Toggle Fullscreen',
      description: 'Enter/exit fullscreen mode',
      icon: <EyeIcon className="h-4 w-4" />,
      category: 'ui',
      action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      },
      shortcut: 'f11'
    },

    // Card Operations
    'cards:select-all': {
      title: 'Select All Cards',
      description: 'Select all visible cards',
      icon: <DocumentDuplicateIcon className="h-4 w-4" />,
      category: 'cards',
      action: () => onCardSelection?.('all'),
      shortcut: 'ctrl+a',
      context: ['cards', 'collection']
    },
    'cards:select-none': {
      title: 'Clear Selection',
      description: 'Deselect all cards',
      icon: <MinusIcon className="h-4 w-4" />,
      category: 'cards',
      action: () => onCardSelection?.('none'),
      shortcut: 'ctrl+d',
      context: ['cards', 'collection']
    },
    'cards:favorite-selected': {
      title: 'Add Selected to Favorites',
      description: 'Add all selected cards to favorites',
      icon: <StarIcon className="h-4 w-4" />,
      category: 'cards',
      action: () => onBulkOperations?.('addToFavorites', selectedItems),
      shortcut: 'ctrl+shift+f',
      condition: () => selectedItems.length > 0
    },
    'cards:export-selected': {
      title: 'Export Selected Cards',
      description: 'Export selected cards to file',
      icon: <ShareIcon className="h-4 w-4" />,
      category: 'cards',
      action: () => onExport?.(selectedItems),
      shortcut: 'ctrl+e',
      condition: () => selectedItems.length > 0
    },

    // View Modes
    'view:grid': {
      title: 'Grid View',
      description: 'Switch to grid layout',
      icon: <CogIcon className="h-4 w-4" />,
      category: 'view',
      action: () => onViewMode?.('grid'),
      shortcut: '1'
    },
    'view:list': {
      title: 'List View',
      description: 'Switch to list layout',
      icon: <CogIcon className="h-4 w-4" />,
      category: 'view',
      action: () => onViewMode?.('list'),
      shortcut: '2'
    },
    'view:compact': {
      title: 'Compact View',
      description: 'Switch to compact layout',
      icon: <CogIcon className="h-4 w-4" />,
      category: 'view',
      action: () => onViewMode?.('compact'),
      shortcut: '3'
    },

    // Quick Actions
    'quick:refresh': {
      title: 'Refresh Data',
      description: 'Reload current data',
      icon: <ArrowPathIcon className="h-4 w-4" />,
      category: 'quick',
      action: () => router.reload(),
      shortcut: 'f5'
    },
    'quick:share-page': {
      title: 'Share Current Page',
      description: 'Share link to current page',
      icon: <ShareIcon className="h-4 w-4" />,
      category: 'quick',
      action: () => {
        navigator.clipboard.writeText(`${window.location.origin}${router.asPath}`);
        notify.success('Page link copied to clipboard');
      },
      shortcut: 'ctrl+shift+s'
    },
    'quick:print': {
      title: 'Print Page',
      description: 'Print current page',
      icon: <DocumentDuplicateIcon className="h-4 w-4" />,
      category: 'quick',
      action: () => window.print(),
      shortcut: 'ctrl+p'
    },

    // Search & Filter
    'search:advanced': {
      title: 'Advanced Search',
      description: 'Open advanced search modal',
      icon: <MagnifyingGlassIcon className="h-4 w-4" />,
      category: 'search',
      action: () => {
        // Open advanced search modal
        notify.info('Opening advanced search...');
      },
      shortcut: 'ctrl+shift+f'
    },
    'filter:rarity': {
      title: 'Filter by Rarity',
      description: 'Quick rarity filter',
      icon: <StarIcon className="h-4 w-4" />,
      category: 'filter',
      action: () => {
        // Implement rarity filter
        setActiveMode('search');
        setSearchQuery('rarity:');
      },
      shortcut: 'alt+r'
    },
    'filter:price': {
      title: 'Filter by Price',
      description: 'Quick price filter',
      icon: <CogIcon className="h-4 w-4" />,
      category: 'filter',
      action: () => {
        setActiveMode('search');
        setSearchQuery('price:');
      },
      shortcut: 'alt+p'
    },

    // Macro System
    'macro:start-recording': {
      title: 'Start Macro Recording',
      description: 'Begin recording a macro',
      icon: <PlusIcon className="h-4 w-4" />,
      category: 'macro',
      action: () => startMacroRecording(),
      shortcut: 'ctrl+shift+r'
    },
    'macro:stop-recording': {
      title: 'Stop Macro Recording',
      description: 'Stop recording current macro',
      icon: <MinusIcon className="h-4 w-4" />,
      category: 'macro',
      action: () => stopMacroRecording(),
      shortcut: 'ctrl+shift+s',
      condition: () => macroRecording
    }
  }), [onBulkOperations, onCardSelection, onViewMode, onExport, selectedItems, router, notify, setActiveMode, setSearchQuery, macroRecording, startMacroRecording, stopMacroRecording]);

  // Filter commands based on context and conditions
  const getAvailableCommands = (): CommandWithId[] => {
    return Object.entries(advancedCommands)
      .filter(([key, command]) => {
        // Check context
        if (command.context && !command.context.includes(currentContext.page || '')) {
          return false;
        }
        
        // Check conditions
        if (command.condition && !command.condition()) {
          return false;
        }
        
        return true;
      })
      .map(([key, command]) => ({ ...command, id: key }));
  };

  // Filter commands based on search
  const filteredCommands = getAvailableCommands().filter(command => {
    if (!searchQuery) return true;
    
    // Handle special search syntax
    if (searchQuery.includes(':')) {
      const [prefix, value] = searchQuery.split(':');
      if (prefix === 'category') {
        return command.category === value;
      }
      if (prefix === 'shortcut') {
        return command.shortcut?.includes(value);
      }
    }
    
    return (
      command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Execute command
  const executeCommand = useCallback((command: CommandWithId) => {
    try {
      command.action();
      
      // Add to recent commands
      const newRecent = [command, ...recentCommands.filter(c => c.id !== command.id)].slice(0, 10);
      setRecentCommands(newRecent);
      saveShortcuts(customShortcuts, newRecent);
      
      // Record in macro if recording
      if (macroRecording) {
        setRecordedMacro(prev => [...prev, { command: command.id, timestamp: Date.now() }]);
      }
      
      setCommandPalette(false);
      setSearchQuery('');
      notify.success(`Executed: ${command.title}`);
    } catch (error) {
      notify.error(`Failed to execute: ${command.title}`);
    }
  }, [customShortcuts, recentCommands, macroRecording, notify]);


  // Execute macro
  const executeMacro = useCallback(async (macro: CustomShortcut) => {
    if (!macro.macro) return;
    
    for (const step of macro.macro) {
      const command = advancedCommands[step.command];
      if (command) {
        command.action();
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between steps
      }
    }
    notify.success(`Executed macro: ${macro.title}`);
  }, [advancedCommands, notify]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPalette(true);
        setActiveMode('command');
        return;
      }

      // Quick search mode
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setCommandPalette(true);
        setActiveMode('search');
        return;
      }

      // Execute shortcuts
      const shortcutKey = [
        e.ctrlKey && 'ctrl',
        e.shiftKey && 'shift',
        e.altKey && 'alt',
        e.metaKey && 'meta',
        e.key.toLowerCase()
      ].filter(Boolean).join('+');

      // Check built-in commands
      const command = Object.entries(advancedCommands).find(([_, cmd]) => cmd.shortcut === shortcutKey);
      if (command) {
        e.preventDefault();
        executeCommand({ ...command[1], id: command[0] });
        return;
      }

      // Check custom shortcuts
      const customCommand = Object.values(customShortcuts).find(cmd => cmd.shortcut === shortcutKey);
      if (customCommand) {
        e.preventDefault();
        if (customCommand.macro) {
          executeMacro(customCommand);
        }
        return;
      }

      // Close command palette
      if (e.key === 'Escape' && commandPalette) {
        setCommandPalette(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [commandPalette, customShortcuts, executeCommand, executeMacro, advancedCommands]);

  // Focus input when palette opens
  useEffect(() => {
    if (commandPalette && inputRef.current) {
      inputRef.current.focus();
    }
  }, [commandPalette]);

  return (
    <>
      {/* Macro Recording Indicator */}
      {macroRecording && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
            <span className="font-medium">Recording Macro ({recordedMacro.length} steps)</span>
            <button
              onClick={stopMacroRecording}
              className="ml-2 text-white hover:text-gray-200">
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Advanced Command Palette */}
      {commandPalette && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-32">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveMode('command')}
                    className={`px-3 py-1 text-sm rounded ${
                      activeMode === 'command'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Commands
                  </button>
                  <button
                    onClick={() => setActiveMode('search')}
                    className={`px-3 py-1 text-sm rounded ${
                      activeMode === 'search'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Search
                  </button>
                  <button
                    onClick={() => setActiveMode('macro')}
                    className={`px-3 py-1 text-sm rounded ${
                      activeMode === 'macro'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Macros
                  </button>
                </div>
              </div>
              
              <div className="mt-3 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {activeMode === 'command' && <CommandLineIcon className="w-5 h-5" />}
                  {activeMode === 'search' && <MagnifyingGlassIcon className="w-5 h-5" />}
                  {activeMode === 'macro' && <CogIcon className="w-5 h-5" />}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeMode === 'command' ? 'Type a command...' :
                    activeMode === 'search' ? 'Search cards, sets, or use filters...' :
                    'Select or create a macro...'
                  }
                  className="w-full pl-10 pr-4 py-2 border-none outline-none bg-transparent text-gray-900 dark:text-gray-100" />
              </div>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {activeMode === 'command' && (
                <>
                  {searchQuery === '' && recentCommands.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                        Recent Commands
                      </div>
                      {recentCommands.slice(0, 3).map((command, index) => (
                        <button
                          key={index}
                          onClick={() => executeCommand(command)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3 rounded">
                          {command.icon}
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {command.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {command.description}
                            </div>
                          </div>
                          {command.shortcut && (
                            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                              {command.shortcut}
                            </kbd>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {filteredCommands.length > 0 ? (
                    <div className="p-2">
                      {searchQuery !== '' && (
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                          Commands ({filteredCommands.length})
                        </div>
                      )}
                      {filteredCommands.map((command, index) => (
                        <button
                          key={command.id}
                          onClick={() => executeCommand(command)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3 rounded">
                          {command.icon}
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {command.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {command.description}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400 capitalize">{command.category}</div>
                            {command.shortcut && (
                              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                {command.shortcut}
                              </kbd>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery !== '' && (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No commands found for "{searchQuery}"
                      <div className="text-xs mt-2">
                        Try "category:cards" or "shortcut:ctrl" for advanced search
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeMode === 'macro' && (
                <div className="p-2">
                  {Object.values(customShortcuts).length > 0 ? (
                    Object.entries(customShortcuts).map(([key, macro]) => (
                      <button
                        key={key}
                        onClick={() => executeMacro(macro)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3 rounded">
                        <CogIcon className="h-4 w-4" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {macro.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {macro.description}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {macro.macro?.length} steps
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No macros created yet
                      <div className="text-xs mt-2">
                        Press Ctrl+Shift+R to start recording a macro
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <div>
                {selectedItems.length > 0 && `${selectedItems.length} items selected`}
                {macroRecording && ' • Macro recording'}
              </div>
              <div>
                ↑↓ navigate • Enter select • Esc close
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick shortcut hint */}
      <div className="fixed bottom-4 right-4 z-30 pointer-events-none">
        <div className="bg-black bg-opacity-60 text-white text-xs px-3 py-2 rounded-lg">
          <kbd className="bg-white bg-opacity-20 px-1 rounded mr-1">Ctrl+K</kbd>
          Command Palette
          {macroRecording && (
            <span className="ml-2 text-red-300">
              • Recording...
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default AdvancedKeyboardShortcuts;