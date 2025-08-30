import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import logger from '../utils/logger';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
  enabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: Shortcut[];
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export const useKeyboardShortcuts = ({
  shortcuts,
  enabled = true,
  preventDefault = true,
  stopPropagation = false,
}: UseKeyboardShortcutsOptions) => {
  const activeShortcuts = useRef<Map<string, Shortcut>>(new Map());

  // Generate shortcut key
  const generateKey = useCallback((shortcut: Shortcut): string => {
    const parts = [];
    if (shortcut.ctrl) parts.push('ctrl');
    if (shortcut.alt) parts.push('alt');
    if (shortcut.shift) parts.push('shift');
    if (shortcut.meta) parts.push('meta');
    parts.push(shortcut.key.toLowerCase());
    return parts.join('+');
  }, []);

  // Check if event matches shortcut
  const matchesShortcut = useCallback((event: KeyboardEvent, shortcut: Shortcut): boolean => {
    const key = event.key.toLowerCase();
    const code = event.code.toLowerCase();
    
    // Check key or code
    const keyMatch = key === shortcut.key.toLowerCase() || 
                     code === shortcut.key.toLowerCase() ||
                     code === `key${shortcut.key.toLowerCase()}`;
    
    if (!keyMatch) return false;

    // Check modifiers
    const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
    const altMatch = shortcut.alt ? event.altKey : !event.altKey;
    const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
    
    return ctrlMatch && altMatch && shiftMatch;
  }, []);

  // Handle keydown event
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Skip if focus is in an input field
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    // Check all shortcuts
    for (const shortcut of shortcuts) {
      if (shortcut.enabled === false) continue;
      
      if (matchesShortcut(event, shortcut)) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        
        try {
          shortcut.action();
          logger.debug('Keyboard shortcut triggered', { 
            key: generateKey(shortcut),
            description: shortcut.description 
          });
        } catch (error) {
          logger.error('Error executing keyboard shortcut', { error, shortcut });
        }
        
        break;
      }
    }
  }, [enabled, shortcuts, matchesShortcut, preventDefault, stopPropagation, generateKey]);

  // Setup event listeners
  useEffect(() => {
    if (!enabled) return;

    // Update active shortcuts map
    activeShortcuts.current.clear();
    shortcuts.forEach(shortcut => {
      if (shortcut.enabled !== false) {
        activeShortcuts.current.set(generateKey(shortcut), shortcut);
      }
    });

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, shortcuts, handleKeyDown, generateKey]);

  // Get all active shortcuts for display
  const getActiveShortcuts = useCallback((): Array<{ key: string; description: string }> => {
    return Array.from(activeShortcuts.current.entries()).map(([key, shortcut]) => ({
      key: key.replace(/\+/g, ' + ').toUpperCase(),
      description: shortcut.description || 'No description',
    }));
  }, []);

  return {
    getActiveShortcuts,
  };
};

// Global keyboard shortcuts hook
export const useGlobalKeyboardShortcuts = () => {
  const router = useRouter();

  const shortcuts: Shortcut[] = [
    // Navigation
    {
      key: 'h',
      action: () => router.push('/'),
      description: 'Go to Home',
    },
    {
      key: 'p',
      action: () => router.push('/pokedex'),
      description: 'Open Pokedex',
    },
    {
      key: 't',
      action: () => router.push('/tcgexpansions'),
      description: 'Open TCG Sets',
    },
    {
      key: 'm',
      action: () => router.push('/pocketmode'),
      description: 'Open Pocket Mode',
    },
    {
      key: 'Escape',
      action: () => router.back(),
      description: 'Go Back',
    },
    
    // Search
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      description: 'Focus Search',
    },
    {
      key: 'k',
      ctrl: true,
      action: () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      description: 'Quick Search (Ctrl+K)',
    },
    
    // View modes
    {
      key: 'g',
      action: () => {
        const gridButton = document.querySelector('[aria-label*="grid"], button[title*="Grid"]') as HTMLButtonElement;
        if (gridButton) gridButton.click();
      },
      description: 'Grid View',
    },
    {
      key: 'l',
      action: () => {
        const listButton = document.querySelector('[aria-label*="list"], button[title*="List"]') as HTMLButtonElement;
        if (listButton) listButton.click();
      },
      description: 'List View',
    },
    
    // Actions
    {
      key: 'r',
      ctrl: true,
      action: () => window.location.reload(),
      description: 'Refresh Page (Ctrl+R)',
    },
    {
      key: 'a',
      ctrl: true,
      action: () => {
        const selectAllButton = document.querySelector('[aria-label*="Select all"]') as HTMLButtonElement;
        if (selectAllButton) selectAllButton.click();
      },
      description: 'Select All (Ctrl+A)',
    },
    {
      key: 'd',
      ctrl: true,
      action: () => {
        const deselectButton = document.querySelector('[aria-label*="Deselect"]') as HTMLButtonElement;
        if (deselectButton) deselectButton.click();
      },
      description: 'Deselect All (Ctrl+D)',
    },
    
    // Export
    {
      key: 'e',
      ctrl: true,
      action: () => {
        const exportButton = document.querySelector('button:has-text("Export"), [aria-label*="Export"]') as HTMLButtonElement;
        if (exportButton) exportButton.click();
      },
      description: 'Export Data (Ctrl+E)',
    },
    
    // Help
    {
      key: '?',
      shift: true,
      action: () => {
        // Show shortcuts modal
        const event = new CustomEvent('show-shortcuts');
        window.dispatchEvent(event);
      },
      description: 'Show Keyboard Shortcuts (?)',
    },
  ];

  useKeyboardShortcuts({ shortcuts });

  return shortcuts;
};

// Page-specific shortcuts hook
export const usePageKeyboardShortcuts = (pageShortcuts: Shortcut[]) => {
  const combinedShortcuts = [
    ...pageShortcuts,
  ];

  useKeyboardShortcuts({ shortcuts: combinedShortcuts });
  
  return combinedShortcuts;
};