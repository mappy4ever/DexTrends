/**
 * Deep Linking System for PWA
 * Handles deep links, URL parsing, and native app integration
 */

import logger from './logger';

interface DeepLinkData {
  type: 'card' | 'pokemon' | 'set' | 'search' | 'share' | 'hash';
  cardId?: string;
  pokeId?: string;
  setId?: string;
  query?: string;
  filters?: Record<string, string>;
  shareData?: ShareData;
  action?: string;
  collection?: string;
  route?: string;
  params?: string[];
  source?: string;
  cardName?: string;
  cardNumber?: string;
  setTotal?: string;
}

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

interface LinkOptions {
  utm?: Record<string, string>;
  share?: boolean;
}

interface CardData {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
}

type DeepLinkHandler = (data: DeepLinkData) => void;

interface ExtendedWindow extends Window {
  next?: {
    router: {
      push: (url: string) => void;
    };
  };
}

interface ExtendedNavigator extends Navigator {
  getInstalledRelatedApps?: () => Promise<Array<{ id: string; platform: string; url?: string }>>;
}

declare const gtag: (
  command: string,
  eventName: string,
  parameters: Record<string, any>
) => void;

class DeepLinking {
  private isClient: boolean;
  private routes: Map<string, string>;
  private handlers: Map<string, DeepLinkHandler>;
  private urlParams: URLSearchParams;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    this.routes = new Map();
    this.handlers = new Map();
    this.urlParams = new URLSearchParams();
    
    if (this.isClient) {
      this.initialize();
    }
  }

  private initialize(): void {
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

  private parseCurrentURL(): void {
    if (!this.isClient) return;

    const url = new URL(window.location.href);
    this.urlParams = url.searchParams;
    
    // Check for deep link parameters
    const deepLinkData = this.extractDeepLinkData(url);
    
    if (deepLinkData) {
      this.handleDeepLink(deepLinkData);
    }
  }

  private extractDeepLinkData(url: URL): DeepLinkData | null {
    const data: Partial<DeepLinkData> = {};
    
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
    if (url.pathname.includes('/tcgexpansions/')) {
      const setId = url.pathname.split('/tcgexpansions/')[1];
      data.type = 'set';
      data.setId = setId;
    }
    
    // Extract search parameters
    if (url.searchParams.has('search')) {
      data.type = 'search';
      data.query = url.searchParams.get('search') || '';
      data.filters = {};
      
      // Extract filter parameters
      ['rarity', 'type', 'set', 'price_min', 'price_max'].forEach(filter => {
        if (url.searchParams.has(filter)) {
          data.filters![filter] = url.searchParams.get(filter)!;
        }
      });
    }
    
    // Extract share data
    if (url.searchParams.has('share')) {
      data.type = 'share';
      data.shareData = {
        title: url.searchParams.get('title') || undefined,
        text: url.searchParams.get('text') || undefined,
        url: url.searchParams.get('url') || undefined
      };
    }
    
    // Extract app-specific parameters
    if (url.searchParams.has('action')) {
      data.action = url.searchParams.get('action') || undefined;
    }
    
    if (url.searchParams.has('collection')) {
      data.collection = url.searchParams.get('collection') || undefined;
    }
    
    return data.type ? data as DeepLinkData : null;
  }

  private setupProtocolHandlers(): void {
    // Register protocol handler for pokemon:// URLs
    if ('registerProtocolHandler' in navigator) {
      try {
        navigator.registerProtocolHandler(
          'web+pokemon',
          window.location.origin + '/cards?pokemon=%s'
        );
        
        logger.debug('Protocol handler registered for web+pokemon');
      } catch (error) {
        logger.warn('Failed to register protocol handler:', error);
      }
    }
  }

  private setupURLListeners(): void {
    // Listen for URL changes (back/forward navigation)
    window.addEventListener('popstate', () => {
      this.parseCurrentURL();
    });
    
    // Listen for hash changes
    window.addEventListener('hashchange', (event) => {
      this.handleHashChange(event);
    });
  }

  private setupShareTargetHandling(): void {
    // Handle share target data from PWA manifest
    if (this.urlParams.has('title') || this.urlParams.has('text') || this.urlParams.has('url')) {
      const shareData: ShareData = {
        title: this.urlParams.get('title') || undefined,
        text: this.urlParams.get('text') || undefined,
        url: this.urlParams.get('url') || undefined
      };
      
      this.handleShareTarget(shareData);
    }
  }

  private handleDeepLink(data: DeepLinkData): void {
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

  private navigateToDeepLink(data: DeepLinkData): void {
    // Use Next.js router if available
    const extWindow = window as ExtendedWindow;
    if (extWindow.next && extWindow.next.router) {
      const router = extWindow.next.router;
      
      switch (data.type) {
        case 'card':
          if (data.cardId) {
            router.push(`/cards/${data.cardId}`);
          }
          break;
        case 'pokemon':
          if (data.pokeId) {
            router.push(`/pokedex/${data.pokeId}`);
          }
          break;
        case 'set':
          if (data.setId) {
            router.push(`/tcgexpansions/${data.setId}`);
          }
          break;
        case 'search':
          if (data.query) {
            const searchParams = new URLSearchParams();
            searchParams.set('search', data.query);
            Object.entries(data.filters || {}).forEach(([key, value]) => {
              searchParams.set(key, value);
            });
            router.push(`/cards?${searchParams.toString()}`);
          }
          break;
      }
    }
  }

  private handleHashChange(event: HashChangeEvent): void {
    const hash = window.location.hash.slice(1);
    
    if (hash) {
      // Parse hash-based routing
      const [route, ...params] = hash.split('/');
      
      const data: DeepLinkData = {
        type: 'hash',
        route,
        params
      };
      
      this.handleDeepLink(data);
    }
  }

  private handleShareTarget(shareData: ShareData): void {
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

  private extractCardInfoFromShare(shareData: ShareData): Partial<DeepLinkData> | null {
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
  registerHandler(type: string, handler: DeepLinkHandler): void {
    this.handlers.set(type, handler);
    logger.debug('Deep link handler registered:', { type });
  }

  unregisterHandler(type: string): void {
    this.handlers.delete(type);
    logger.debug('Deep link handler unregistered:', { type });
  }

  // Generate deep links
  generateCardLink(cardId: string, options: LinkOptions = {}): string {
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

  generateSearchLink(query: string, filters: Record<string, string> = {}, options: LinkOptions = {}): string {
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

  generatePokemonLink(pokeId: string, options: LinkOptions = {}): string {
    const url = new URL(`${window.location.origin}/pokedex/${pokeId}`);
    
    if (options.utm) {
      Object.entries(options.utm).forEach(([key, value]) => {
        url.searchParams.set(`utm_${key}`, value);
      });
    }
    
    return url.toString();
  }

  generateSetLink(setId: string, options: LinkOptions = {}): string {
    const url = new URL(`${window.location.origin}/tcgexpansions/${setId}`);
    
    if (options.utm) {
      Object.entries(options.utm).forEach(([key, value]) => {
        url.searchParams.set(`utm_${key}`, value);
      });
    }
    
    return url.toString();
  }

  // Share functionality
  async shareCard(cardData: CardData): Promise<boolean> {
    const shareData: ShareData = {
      title: `${cardData.name} - DexTrends`,
      text: `Check out this ${cardData.name} Pokemon card on DexTrends!`,
      url: this.generateCardLink(cardData.id, { share: true, utm: { source: 'share', medium: 'native' } })
    };
    
    return this.share(shareData);
  }

  async shareSearch(query: string, filters: Record<string, string> = {}): Promise<boolean> {
    const shareData: ShareData = {
      title: `Pokemon Card Search: "${query}" - DexTrends`,
      text: `Found some great Pokemon cards for "${query}" on DexTrends!`,
      url: this.generateSearchLink(query, filters, { utm: { source: 'share', medium: 'native' } })
    };
    
    return this.share(shareData);
  }

  async shareCollection(collection: Collection): Promise<boolean> {
    const shareData: ShareData = {
      title: `${collection.name} Collection - DexTrends`,
      text: `Check out my ${collection.name} Pokemon card collection on DexTrends!`,
      url: `${window.location.origin}/collections/${collection.id}?share=true&utm_source=share&utm_medium=native`
    };
    
    return this.share(shareData);
  }

  async share(shareData: ShareData): Promise<boolean> {
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
      if (error instanceof Error && error.name !== 'AbortError') {
        logger.error('Share failed:', error);
      }
      return false;
    }
  }

  private async fallbackShare(shareData: ShareData): Promise<boolean> {
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

  private showShareSuccess(message: string): void {
    // Emit event for UI to show success message
    window.dispatchEvent(new CustomEvent('shareSuccess', {
      detail: { message }
    }));
  }

  private showShareOptions(shareData: ShareData): void {
    // Emit event for UI to show share options
    window.dispatchEvent(new CustomEvent('shareOptionsRequested', {
      detail: shareData
    }));
  }

  // URL utilities
  getCurrentPath(): string {
    return this.isClient ? window.location.pathname : '';
  }

  getCurrentParams(): URLSearchParams {
    return this.isClient ? new URLSearchParams(window.location.search) : new URLSearchParams();
  }

  updateURL(path: string, params: Record<string, any> = {}, replace: boolean = false): void {
    if (!this.isClient) return;
    
    const url = new URL(window.location.origin + path);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
    
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({}, '', url.toString());
  }

  // App shortcuts support
  setupAppShortcuts(): void {
    const navigator = window.navigator as ExtendedNavigator;
    
    // This would be handled by the manifest.json shortcuts
    // But we can enhance with dynamic shortcuts
    if ('getInstalledRelatedApps' in navigator && navigator.getInstalledRelatedApps) {
      navigator.getInstalledRelatedApps().then(apps => {
        if (apps.length > 0) {
          logger.debug('Related apps found:', apps);
        }
      });
    }
  }

  // Deep link analytics
  trackDeepLink(data: DeepLinkData): void {
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