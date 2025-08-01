import { useCallback } from 'react';
import { useNotifications } from './useNotifications';
import logger from '../utils/logger';

export const useSmartNotifications = () => {
  const { notify } = useNotifications();

  const notifyCardAction = useCallback((action: string, card: { name: string }) => {
    switch (action) {
      case 'favorited':
        notify.cardAdded(card.name);
        break;
      case 'unfavorited':
        notify.info(`${card.name} removed from favorites`);
        break;
      case 'shared':
        notify.success(`${card.name} link copied to clipboard!`);
        break;
      default:
        notify.info(`Action completed for ${card.name}`);
    }
  }, [notify]);

  const notifySearchResult = useCallback((query: string, resultCount: number) => {
    if (resultCount === 0) {
      notify.warning(`No results found for "${query}"`, {
        actions: [
          {
            label: 'Clear Search',
            handler: () => {
              // Clear search logic
              logger.debug('Clear search triggered from notification');
            }
          }
        ]
      });
    } else if (resultCount === 1) {
      notify.pokemonFound(`1 result for "${query}"`);
    } else {
      notify.info(`Found ${resultCount} results for "${query}"`);
    }
  }, [notify]);

  const notifyNetworkStatus = useCallback((isOnline: boolean) => {
    if (isOnline) {
      notify.success('Connection restored! 🌐');
    } else {
      notify.warning('You are offline. Some features may be limited.', {
        persistent: true
      });
    }
  }, [notify]);

  return {
    notifyCardAction,
    notifySearchResult,
    notifyNetworkStatus
  };
};