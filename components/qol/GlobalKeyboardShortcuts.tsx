import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';


const GlobalKeyboardShortcuts: React.FC = () => {
  const router = useRouter();

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Ctrl/Cmd + K for search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      if (typeof document !== 'undefined') {
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        if (searchInput) {
          searchInput.focus();
        }
      }
      return;
    }

    // Don't process other shortcuts if modifier keys are held
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    switch (event.key) {
      case 'h':
        router.push('/');
        break;
      case 'p':
        router.push('/pokedex');
        break;
      case 't':
        router.push('/tcgexpansions');
        break;
      case 'k':
        router.push('/pocketmode');
        break;
      case 'f':
        router.push('/favorites');
        break;
      case 'l':
        router.push('/leaderboard');
        break;
      case '?':
        // Show keyboard shortcuts help
        showKeyboardHelp();
        break;
      case 'Escape':
        // Close any open modals
        if (typeof document !== 'undefined') {
          const closeButtons = document.querySelectorAll<HTMLButtonElement>('[data-close-modal]');
          closeButtons.forEach(button => button.click());
        }
        break;
      default:
        break;
    }
  }, [router]);

  const showKeyboardHelp = (): void => {
    if (typeof document === 'undefined') return;
    
    const helpContent = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="this.remove()">
        <div class="bg-white dark:bg-stone-800 rounded-lg p-6 max-w-md mx-4" onclick="event.stopPropagation()">
          <h3 class="text-lg font-bold mb-4 text-stone-900 dark:text-white">Keyboard Shortcuts</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-stone-600 dark:text-stone-400">Search</span>
              <span class="font-mono bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">Ctrl+K</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-600 dark:text-stone-400">Home</span>
              <span class="font-mono bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">H</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-600 dark:text-stone-400">Pokedex</span>
              <span class="font-mono bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">P</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-600 dark:text-stone-400">TCG Sets</span>
              <span class="font-mono bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">T</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-600 dark:text-stone-400">Pocket Mode</span>
              <span class="font-mono bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">K</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-600 dark:text-stone-400">Favorites</span>
              <span class="font-mono bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">F</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-600 dark:text-stone-400">Leaderboard</span>
              <span class="font-mono bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">L</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-600 dark:text-stone-400">Help</span>
              <span class="font-mono bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">?</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-600 dark:text-stone-400">Close Modal</span>
              <span class="font-mono bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded">Esc</span>
            </div>
          </div>
          <button class="mt-4 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600" onclick="this.closest('.fixed').remove()">
            Close
          </button>
        </div>
      </div>
    `;
    
    const helpModal = document.createElement('div');
    helpModal.innerHTML = helpContent;
    if (helpModal.firstElementChild) {
      document.body.appendChild(helpModal.firstElementChild);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
    return undefined;
  }, [handleKeyPress]);

  return null;
};

export default GlobalKeyboardShortcuts;