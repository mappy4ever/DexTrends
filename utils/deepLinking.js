/**
 * Deep Linking System for PWA
 * Handles deep links, URL parsing, and native app integration
 */

import logger from './logger';

class DeepLinking {
  constructor() {
    this.isClient = typeof window !== 'undefined';
    this.routes = new Map();
    this.handlers = new Map();
    this.urlParams = new URLSearchParams();
    
    if (this.isClient) {
      this.initialize();
    }
  }

  initialize() {
    // Parse initial URL
    this.parseCurrentURL();
    
    // Setup protocol handlers
    this.setupProtocolHandlers();
    
    // Setup URL change listeners
    this.setupURLListeners();
    
    // Setup share target handling
    this.setupShareTargetHandling();
    
    logger.debug('Deep linking initialized');
  }

  parseCurrentURL() {
    if (!this.isClient) return;

    const url = new URL(window.location.href);
    this.urlParams = url.searchParams;
    
    // Check for deep link parameters
    const deepLinkData = this.extractDeepLinkData(url);
    
    if (deepLinkData) {
      this.handleDeepLink(deepLinkData);
    }
  }

  extractDeepLinkData(url) {
    const data = {};
    
    // Extract card information
    if (url.pathname.includes('/cards/')) {
      const cardId = url.pathname.split('/cards/')[1];
      data.type = 'card';
      data.cardId = cardId;
    }
    
    // Extract Pokemon information
    if (url.pathname.includes('/pokedex/')) {
      const pokeId = url.pathname.split('/pokedex/')[1];
      data.type = 'pokemon';
      data.pokeId = pokeId;
    }
    
    // Extract set information
    if (url.pathname.includes('/tcgsets/')) {
      const setId = url.pathname.split('/tcgsets/')[1];
      data.type = 'set';
      data.setId = setId;
    }
    
    // Extract search parameters
    if (url.searchParams.has('search')) {
      data.type = 'search';
      data.query = url.searchParams.get('search');
      data.filters = {};
      
      // Extract filter parameters
      ['rarity', 'type', 'set', 'price_min', 'price_max'].forEach(filter => {
        if (url.searchParams.has(filter)) {
          data.filters[filter] = url.searchParams.get(filter);
        }
      });
    }
    
    // Extract share data
    if (url.searchParams.has('share')) {
      data.type = 'share';
      data.shareData = {
        title: url.searchParams.get('title'),
        text: url.searchParams.get('text'),
        url: url.searchParams.get('url')
      };
    }
    
    // Extract app-specific parameters
    if (url.searchParams.has('action')) {
      data.action = url.searchParams.get('action');
    }
    
    if (url.searchParams.has('collection')) {
      data.collection = url.searchParams.get('collection');
    }
    
    return Object.keys(data).length > 0 ? data : null;
  }

  setupProtocolHandlers() {
    // Register protocol handler for pokemon:// URLs
    if ('registerProtocolHandler' in navigator) {
      try {
        navigator.registerProtocolHandler(
          'web+pokemon',
          window.location.origin + '/cards?pokemon=%s',
          'DexTrends Pokemon Handler'
        );
        
        logger.debug('Protocol handler registered for web+pokemon');
      } catch (error) {
        logger.warn('Failed to register protocol handler:', error);
      }
    }
  }

  setupURLListeners() {
    // Listen for URL changes (back/forward navigation)
    window.addEventListener('popstate', (event) => {
      this.parseCurrentURL();
    });
    
    // Listen for hash changes
    window.addEventListener('hashchange', (event) => {
      this.handleHashChange(event);
    });
  }

  setupShareTargetHandling() {
    // Handle share target data from PWA manifest
    if (this.urlParams.has('title') || this.urlParams.has('text') || this.urlParams.has('url')) {
      const shareData = {
        title: this.urlParams.get('title'),
        text: this.urlParams.get('text'),
        url: this.urlParams.get('url')
      };
      
      this.handleShareTarget(shareData);
    }
  }

  handleDeepLink(data) {
    logger.debug('Handling deep link:', data);
    
    // Emit custom event for app components to handle
    window.dispatchEvent(new CustomEvent('deepLinkReceived', {
      detail: data
    }));
    
    // Execute registered handlers
    const handler = this.handlers.get(data.type);
    if (handler) {
      try {
        handler(data);
      } catch (error) {
        logger.error('Deep link handler error:', error);
      }
    }
    
    // Navigate based on type
    this.navigateToDeepLink(data);
  }

  navigateToDeepLink(data) {
    // Use Next.js router if available
    if (window.next && window.next.router) {
      const router = window.next.router;
      
      switch (data.type) {
        case 'card':
          router.push(`/cards/${data.cardId}`);
          break;
        case 'pokemon':
          router.push(`/pokedex/${data.pokeId}`);
          break;
        case 'set':
          router.push(`/tcgsets/${data.setId}`);
          break;
        case 'search':
          const searchParams = new URLSearchParams();
          searchParams.set('search', data.query);
          Object.entries(data.filters || {}).forEach(([key, value]) => {
            searchParams.set(key, value);
          });
          router.push(`/cards?${searchParams.toString()}`);
          break;
      }
    }
  }

  handleHashChange(event) {
    const hash = window.location.hash.slice(1);
    
    if (hash) {
      // Parse hash-based routing
      const [route, ...params] = hash.split('/');
      
      const data = {
        type: 'hash',
        route,
        params
      };
      
      this.handleDeepLink(data);
    }
  }

  handleShareTarget(shareData) {
    logger.debug('Handling share target:', shareData);
    
    // Extract Pokemon card information from shared content
    const cardInfo = this.extractCardInfoFromShare(shareData);
    
    if (cardInfo) {
      this.handleDeepLink({
        type: 'card',
        ...cardInfo,
        source: 'share'
      });
    } else {
      // Generic share handling
      window.dispatchEvent(new CustomEvent('shareTargetReceived', {
        detail: shareData
      }));
    }
  }

  extractCardInfoFromShare(shareData) {
    const { title, text, url } = shareData;
    
    // Try to extract from URL
    if (url) {
      try {
        const sharedUrl = new URL(url);
        return this.extractDeepLinkData(sharedUrl);
      } catch (error) {
        logger.debug('Failed to parse shared URL:', error);
      }
    }
    
    // Try to extract from text
    if (text) {
      // Look for Pokemon card patterns
      const cardPattern = /(?:pokemon|card|tcg).*?([a-zA-Z\s]+)\s*(?:#)?(\d+)(?:\/(\d+))?/i;
      const match = text.match(cardPattern);
      
      if (match) {
        return {
          cardName: match[1].trim(),
          cardNumber: match[2],
          setTotal: match[3]
        };
      }
    }
    
    return null;
  }

  // Register handlers for different deep link types
  registerHandler(type, handler) {
    this.handlers.set(type, handler);
    logger.debug('Deep link handler registered:', type);
  }

  unregisterHandler(type) {
    this.handlers.delete(type);
    logger.debug('Deep link handler unregistered:', type);
  }

  // Generate deep links
  generateCardLink(cardId, options = {}) {
    const url = new URL(`${window.location.origin}/cards/${cardId}`);
    
    if (options.utm) {
      Object.entries(options.utm).forEach(([key, value]) => {
        url.searchParams.set(`utm_${key}`, value);
      });
    }
    
    if (options.share) {
      url.searchParams.set('share', 'true');
    }
    
    return url.toString();
  }

  generateSearchLink(query, filters = {}, options = {}) {
    const url = new URL(`${window.location.origin}/cards`);
    
    url.searchParams.set('search', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    if (options.utm) {
      Object.entries(options.utm).forEach(([key, value]) => {
        url.searchParams.set(`utm_${key}`, value);
      });
    }
    
    return url.toString();
  }

  generatePokemonLink(pokeId, options = {}) {
    const url = new URL(`${window.location.origin}/pokedex/${pokeId}`);
    
    if (options.utm) {
      Object.entries(options.utm).forEach(([key, value]) => {
        url.searchParams.set(`utm_${key}`, value);
      });
    }
    
    return url.toString();
  }

  generateSetLink(setId, options = {}) {
    const url = new URL(`${window.location.origin}/tcgsets/${setId}`);
    
    if (options.utm) {
      Object.entries(options.utm).forEach(([key, value]) => {
        url.searchParams.set(`utm_${key}`, value);
      });
    }
    
    return url.toString();
  }

  // Share functionality
  async shareCard(cardData) {
    const shareData = {
      title: `${cardData.name} - DexTrends`,
      text: `Check out this ${cardData.name} Pokemon card on DexTrends!`,
      url: this.generateCardLink(cardData.id, { share: true, utm: { source: 'share', medium: 'native' } })
    };
    
    return this.share(shareData);
  }

  async shareSearch(query, filters = {}) {
    const shareData = {
      title: `Pokemon Card Search: "${query}" - DexTrends`,
      text: `Found some great Pokemon cards for "${query}" on DexTrends!`,
      url: this.generateSearchLink(query, filters, { utm: { source: 'share', medium: 'native' } })
    };
    
    return this.share(shareData);
  }

  async shareCollection(collection) {
    const shareData = {
      title: `${collection.name} Collection - DexTrends`,
      text: `Check out my ${collection.name} Pokemon card collection on DexTrends!`,
      url: `${window.location.origin}/collections/${collection.id}?share=true&utm_source=share&utm_medium=native`
    };
    
    return this.share(shareData);
  }

  async share(shareData) {
    if (!this.isClient) return false;
    
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        logger.debug('Native share successful');
        return true;
      } else {
        // Fallback to clipboard or other sharing methods
        return this.fallbackShare(shareData);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        logger.error('Share failed:', error);
      }
      return false;
    }
  }

  async fallbackShare(shareData) {
    // Try clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        
        // Show success message
        this.showShareSuccess('Link copied to clipboard!');
        return true;
      } catch (error) {
        logger.debug('Clipboard share failed:', error);
      }
    }
    
    // Fallback to other sharing methods
    this.showShareOptions(shareData);
    return true;
  }

  showShareSuccess(message) {
    // Emit event for UI to show success message
    window.dispatchEvent(new CustomEvent('shareSuccess', {
      detail: { message }
    }));
  }

  showShareOptions(shareData) {
    // Emit event for UI to show share options
    window.dispatchEvent(new CustomEvent('shareOptionsRequested', {
      detail: shareData
    }));
  }

  // URL utilities
  getCurrentPath() {
    return this.isClient ? window.location.pathname : '';
  }

  getCurrentParams() {
    return this.isClient ? new URLSearchParams(window.location.search) : new URLSearchParams();
  }

  updateURL(path, params = {}, replace = false) {
    if (!this.isClient) return;
    
    const url = new URL(window.location.origin + path);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, value);
      }
    });
    
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({}, '', url.toString());
  }

  // App shortcuts support
  setupAppShortcuts() {
    // This would be handled by the manifest.json shortcuts
    // But we can enhance with dynamic shortcuts
    if ('getInstalledRelatedApps' in navigator) {
      navigator.getInstalledRelatedApps().then(apps => {
        if (apps.length > 0) {
          logger.debug('Related apps found:', apps);
        }
      });
    }
  }

  // Deep link analytics
  trackDeepLink(data) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'deep_link_used', {
        event_category: 'Deep Link',
        event_label: data.type,
        custom_map: {
          link_type: data.type,
          link_source: data.source || 'direct'
        }
      });
    }
    
    logger.debug('Deep link tracked:', data);
  }
}

// Create singleton instance
const deepLinking = new DeepLinking();

export default deepLinking;