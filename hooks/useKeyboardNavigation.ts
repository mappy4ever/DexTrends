import { useEffect } from 'react';
import { useAccessibility } from './useAccessibility';

export function useKeyboardNavigation() {
  const { preferences } = useAccessibility();

  useEffect(() => {
    if (!preferences.keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab navigation enhancement
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }

      // Escape key to close modals/dropdowns
      if (e.key === 'Escape') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.closest('[role="dialog"]')) {
          const dialog = activeElement.closest('[role="dialog"]');
          if (dialog) {
            const closeButton = dialog.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLElement;
            if (closeButton) {
              closeButton.click();
            }
          }
        }
      }
    };

    const handleMouseDown = (): void => {
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [preferences.keyboardNavigation]);
}