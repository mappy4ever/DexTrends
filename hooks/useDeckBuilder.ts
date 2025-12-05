import { useState, useEffect, useMemo, useCallback } from 'react';
import { validateDeck, ValidationResult } from '../utils/deckValidation';
import { analyzeDeckMeta, getMetaSuggestions, MetaAnalysis } from '../utils/metaAnalysis';
import type { PocketCard } from '../types/api/pocket-cards';

/**
 * Extended PocketCard type for deck builder specific fields
 */
export interface ExtendedPocketCard extends PocketCard {
  health?: string;
  type?: string;
  pack?: string;
  category?: string;
}

/**
 * Deck entry interface - a card and its count in the deck
 */
export interface DeckEntry {
  card: ExtendedPocketCard;
  count: number;
}

/**
 * Deck statistics computed from the deck
 */
export interface DeckStats {
  totalCards: number;
  remainingSlots: number;
  typeDistribution: Record<string, number>;
  categoryDistribution: {
    pokemon: number;
    trainer: number;
    energy: number;
  };
  isEmpty: boolean;
  isFull: boolean;
}

/**
 * Saved deck interface for localStorage persistence
 */
export interface SavedDeck {
  id: string;
  name: string;
  cards: DeckEntry[];
  stats: DeckStats;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Deck builder configuration
 */
interface DeckBuilderConfig {
  maxDeckSize?: number;
  maxCopiesPerCard?: number;
  storageKey?: string;
  initialDeck?: DeckEntry[];
  initialDeckName?: string;
}

/**
 * Return type for the useDeckBuilder hook
 */
interface UseDeckBuilderReturn {
  // Deck state
  deck: DeckEntry[];
  deckName: string;
  setDeckName: (name: string) => void;

  // Computed stats
  deckStats: DeckStats;
  validation: ValidationResult | null;
  metaAnalysis: MetaAnalysis | null;
  metaSuggestions: string[];

  // Card operations
  addCard: (card: ExtendedPocketCard) => boolean;
  removeCard: (cardId: string) => void;
  setCardCount: (cardId: string, count: number) => void;
  getCardCount: (cardId: string) => number;
  getBaseNameCountForCard: (card: ExtendedPocketCard) => number;
  clearDeck: () => void;

  // Deck persistence
  saveDeck: () => SavedDeck | null;
  loadDeck: (deckId: string) => boolean;
  deleteSavedDeck: (deckId: string) => void;
  getSavedDecks: () => SavedDeck[];

  // Import/Export
  exportToText: () => string;
  exportToJSON: () => string;
  importFromText: (text: string) => { success: boolean; errors: string[] };
  importFromJSON: (json: string) => { success: boolean; errors: string[] };
  copyToClipboard: () => Promise<boolean>;

  // URL sharing
  generateShareUrl: () => string;
  importFromShareUrl: (encodedData: string) => { success: boolean; errors: string[] };

  // Constants
  MAX_DECK_SIZE: number;
  MAX_COPIES_PER_CARD: number;
}

// Pocket TCG constants
const DEFAULT_MAX_DECK_SIZE = 20;
const DEFAULT_MAX_COPIES_PER_CARD = 2;
const DEFAULT_STORAGE_KEY = 'pocketDecks';

/**
 * Get the base name for deck limit checking
 * Pokemon TCG Pocket rules:
 * - Max 2 copies of cards with the same NAME
 * - "ex" versions are considered DIFFERENT from regular (e.g., "Pikachu" vs "Pikachu ex")
 * - For Trainers: All variants (FA, regular, etc.) of same card name count together
 */
function getBaseName(card: ExtendedPocketCard): string {
  const name = card.name.trim();

  // For Pokemon: Check if it's an "ex" variant - these are separate
  // "Pikachu ex" stays as "Pikachu ex", "Pikachu" stays as "Pikachu"
  // They can coexist in the deck

  // For Trainers (Supporter, Item, Tool): Remove art variants
  // "Professor's Research" and "Professor's Research (Full Art)" = same card
  const type = (card.type || '').toLowerCase();
  const category = (card.category || '').toLowerCase();

  if (type === 'trainer' || type === 'supporter' || type === 'item' || type === 'tool' ||
      category === 'trainer' || category === 'supporter' || category === 'item' || category === 'tool') {
    // Remove common art variant suffixes for trainers
    return name
      .replace(/\s*\(Full Art\)/i, '')
      .replace(/\s*\(Illustration Rare\)/i, '')
      .replace(/\s*\(Special Art Rare\)/i, '')
      .replace(/\s*\(SAR\)/i, '')
      .replace(/\s*\(FA\)/i, '')
      .replace(/\s*\(IR\)/i, '')
      .trim();
  }

  // For Pokemon: Keep the name as-is (ex variants are different cards)
  return name;
}

/**
 * Custom hook for managing Pokemon Pocket deck building state
 * Extracts all deck-related logic for reusability and cleaner components
 */
export function useDeckBuilder(
  availableCards: ExtendedPocketCard[],
  config: DeckBuilderConfig = {}
): UseDeckBuilderReturn {
  const {
    maxDeckSize = DEFAULT_MAX_DECK_SIZE,
    maxCopiesPerCard = DEFAULT_MAX_COPIES_PER_CARD,
    storageKey = DEFAULT_STORAGE_KEY,
    initialDeck = [],
    initialDeckName = 'My Pocket Deck'
  } = config;

  // Core deck state
  const [deck, setDeck] = useState<DeckEntry[]>(initialDeck);
  const [deckName, setDeckName] = useState<string>(initialDeckName);

  // Validation state
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [metaAnalysis, setMetaAnalysis] = useState<MetaAnalysis | null>(null);
  const [metaSuggestions, setMetaSuggestions] = useState<string[]>([]);

  // Compute deck statistics
  const deckStats = useMemo<DeckStats>(() => {
    const totalCards = deck.reduce((sum, entry) => sum + entry.count, 0);
    const typeDistribution: Record<string, number> = {};
    const categoryDistribution = { pokemon: 0, trainer: 0, energy: 0 };

    deck.forEach(entry => {
      const type = entry.card.type?.toLowerCase() || 'unknown';
      typeDistribution[type] = (typeDistribution[type] || 0) + entry.count;

      // Categorize cards
      if (type === 'trainer' || type === 'item' || type === 'supporter' || type === 'tool') {
        categoryDistribution.trainer += entry.count;
      } else if (type === 'energy') {
        categoryDistribution.energy += entry.count;
      } else {
        categoryDistribution.pokemon += entry.count;
      }
    });

    return {
      totalCards,
      remainingSlots: maxDeckSize - totalCards,
      typeDistribution,
      categoryDistribution,
      isEmpty: totalCards === 0,
      isFull: totalCards >= maxDeckSize
    };
  }, [deck, maxDeckSize]);

  // Run validation when deck changes
  useEffect(() => {
    if (deck.length > 0) {
      const deckCards = deck.map(entry => ({
        ...entry.card,
        quantity: entry.count,
        supertype: entry.card.type?.toLowerCase() === 'trainer' ? 'Trainer' : 'Pokémon'
      }));

      const validationResult = validateDeck(deckCards, 'pocket');
      setValidation(validationResult);

      const metaResult = analyzeDeckMeta(deckCards, 'pocket');
      setMetaAnalysis(metaResult);

      const suggestions = getMetaSuggestions(metaResult);
      setMetaSuggestions(suggestions);
    } else {
      setValidation(null);
      setMetaAnalysis(null);
      setMetaSuggestions([]);
    }
  }, [deck]);

  // Get count of cards with the same base name in the deck
  // This enforces the rule: max 2 copies of cards with same NAME
  const getBaseNameCount = useCallback((deck: DeckEntry[], card: ExtendedPocketCard): number => {
    const baseName = getBaseName(card);
    return deck.reduce((sum, entry) => {
      if (getBaseName(entry.card) === baseName) {
        return sum + entry.count;
      }
      return sum;
    }, 0);
  }, []);

  // Add card to deck
  const addCard = useCallback((card: ExtendedPocketCard): boolean => {
    let added = false;

    setDeck(prevDeck => {
      const existingIndex = prevDeck.findIndex(entry => entry.card.id === card.id);
      const totalCards = prevDeck.reduce((sum, entry) => sum + entry.count, 0);

      // Can't add if deck is full
      if (totalCards >= maxDeckSize) {
        return prevDeck;
      }

      // Check by BASE NAME count - this enforces the 2-copy rule by Pokemon/card name
      // Example: "Pikachu" from set A + "Pikachu" from set B = 2 total (at limit)
      // But "Pikachu" + "Pikachu ex" = allowed (different base names)
      const baseNameCount = getBaseNameCount(prevDeck, card);
      if (baseNameCount >= maxCopiesPerCard) {
        return prevDeck;
      }

      if (existingIndex >= 0) {
        // Card already exists by ID, increment its count
        const newDeck = [...prevDeck];
        newDeck[existingIndex] = {
          ...newDeck[existingIndex],
          count: newDeck[existingIndex].count + 1
        };
        added = true;
        return newDeck;
      } else {
        // Add new card entry
        added = true;
        return [...prevDeck, { card, count: 1 }];
      }
    });

    return added;
  }, [maxDeckSize, maxCopiesPerCard, getBaseNameCount]);

  // Remove one copy of a card from deck
  const removeCard = useCallback((cardId: string) => {
    setDeck(prevDeck => {
      const existingIndex = prevDeck.findIndex(entry => entry.card.id === cardId);
      if (existingIndex === -1) return prevDeck;

      const newDeck = [...prevDeck];
      if (newDeck[existingIndex].count > 1) {
        newDeck[existingIndex] = {
          ...newDeck[existingIndex],
          count: newDeck[existingIndex].count - 1
        };
      } else {
        newDeck.splice(existingIndex, 1);
      }

      return newDeck;
    });
  }, []);

  // Set exact count for a card
  const setCardCount = useCallback((cardId: string, count: number) => {
    if (count < 0 || count > maxCopiesPerCard) return;

    setDeck(prevDeck => {
      const existingIndex = prevDeck.findIndex(entry => entry.card.id === cardId);

      if (count === 0) {
        // Remove card
        if (existingIndex === -1) return prevDeck;
        const newDeck = [...prevDeck];
        newDeck.splice(existingIndex, 1);
        return newDeck;
      }

      if (existingIndex >= 0) {
        const newDeck = [...prevDeck];
        newDeck[existingIndex] = {
          ...newDeck[existingIndex],
          count
        };
        return newDeck;
      }

      return prevDeck;
    });
  }, [maxCopiesPerCard]);

  // Get count of a specific card in deck (by card ID)
  const getCardCount = useCallback((cardId: string): number => {
    const entry = deck.find(entry => entry.card.id === cardId);
    return entry ? entry.count : 0;
  }, [deck]);

  // Get count of cards with the same base name (for limit checking)
  // This returns the total count of all cards that share the same base name
  const getBaseNameCountForCard = useCallback((card: ExtendedPocketCard): number => {
    const baseName = getBaseName(card);
    return deck.reduce((sum, entry) => {
      if (getBaseName(entry.card) === baseName) {
        return sum + entry.count;
      }
      return sum;
    }, 0);
  }, [deck]);

  // Clear entire deck
  const clearDeck = useCallback(() => {
    setDeck([]);
  }, []);

  // Save deck to localStorage
  const saveDeck = useCallback((): SavedDeck | null => {
    if (deckStats.totalCards === 0) return null;
    if (typeof window === 'undefined') return null;

    const now = new Date().toISOString();
    const deckData: SavedDeck = {
      id: `deck_${Date.now()}`,
      name: deckName.trim() || 'Unnamed Deck',
      cards: deck,
      stats: deckStats,
      createdAt: now,
      updatedAt: now
    };

    try {
      const savedDecks = JSON.parse(localStorage.getItem(storageKey) || '[]') as SavedDeck[];
      savedDecks.push(deckData);
      localStorage.setItem(storageKey, JSON.stringify(savedDecks));
      return deckData;
    } catch {
      return null;
    }
  }, [deck, deckName, deckStats, storageKey]);

  // Load deck from localStorage by ID
  const loadDeck = useCallback((deckId: string): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      const savedDecks = JSON.parse(localStorage.getItem(storageKey) || '[]') as SavedDeck[];
      const savedDeck = savedDecks.find(d => d.id === deckId);

      if (savedDeck) {
        setDeck(savedDeck.cards);
        setDeckName(savedDeck.name);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [storageKey]);

  // Delete saved deck from localStorage
  const deleteSavedDeck = useCallback((deckId: string) => {
    if (typeof window === 'undefined') return;

    try {
      const savedDecks = JSON.parse(localStorage.getItem(storageKey) || '[]') as SavedDeck[];
      const filtered = savedDecks.filter(d => d.id !== deckId);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    } catch {
      // Ignore errors
    }
  }, [storageKey]);

  // Get all saved decks
  const getSavedDecks = useCallback((): SavedDeck[] => {
    if (typeof window === 'undefined') return [];

    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]') as SavedDeck[];
    } catch {
      return [];
    }
  }, [storageKey]);

  // Export deck to text format
  const exportToText = useCallback((): string => {
    if (deck.length === 0) return '';

    const lines = [
      `Deck Name: ${deckName}`,
      `Total Cards: ${deckStats.totalCards}`,
      '',
      ...deck.map(entry => `${entry.count}x ${entry.card.name}`)
    ];

    return lines.join('\n');
  }, [deck, deckName, deckStats.totalCards]);

  // Export deck to JSON format
  const exportToJSON = useCallback((): string => {
    return JSON.stringify({
      name: deckName,
      format: 'pocket',
      totalCards: deckStats.totalCards,
      cards: deck.map(entry => ({
        id: entry.card.id,
        name: entry.card.name,
        count: entry.count,
        type: entry.card.type,
        pack: entry.card.pack
      }))
    }, null, 2);
  }, [deck, deckName, deckStats.totalCards]);

  // Import deck from text format
  const importFromText = useCallback((text: string): { success: boolean; errors: string[] } => {
    const lines = text.trim().split('\n');
    const parsedCards: DeckEntry[] = [];
    const errors: string[] = [];
    let skipHeader = true;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Skip header lines
      if (skipHeader && (trimmedLine.startsWith('Deck Name:') || trimmedLine.startsWith('Total Cards:'))) {
        continue;
      }
      skipHeader = false;

      // Parse card line - supports: "2x Card Name", "Card Name x2"
      const formats = [
        /^(\d+)x?\s+(.+)$/i,           // 2x Card Name or 2 Card Name
        /^(.+?)\s*x\s*(\d+)$/i,         // Card Name x2
      ];

      let matched = false;
      for (const format of formats) {
        const match = trimmedLine.match(format);
        if (match) {
          let cardName: string;
          let count: number;

          if (format === formats[0]) {
            count = parseInt(match[1]);
            cardName = match[2].trim();
          } else {
            cardName = match[1].trim();
            count = parseInt(match[2]);
          }

          if (count < 1 || count > maxCopiesPerCard) {
            errors.push(`Invalid count for "${cardName}": ${count}`);
            continue;
          }

          // Find card in available cards
          const card = availableCards.find(c =>
            c.name.toLowerCase() === cardName.toLowerCase() ||
            c.name.toLowerCase().replace(/['']/g, "'") === cardName.toLowerCase().replace(/['']/g, "'")
          );

          if (card) {
            const existingEntry = parsedCards.find(e => e.card.id === card.id);
            if (existingEntry) {
              existingEntry.count = Math.min(existingEntry.count + count, maxCopiesPerCard);
            } else {
              parsedCards.push({ card: card as ExtendedPocketCard, count });
            }
          } else {
            errors.push(`Card not found: "${cardName}"`);
          }

          matched = true;
          break;
        }
      }

      if (!matched) {
        // Try as just a card name (count of 1)
        const card = availableCards.find(c =>
          c.name.toLowerCase() === trimmedLine.toLowerCase()
        );

        if (card) {
          const existingEntry = parsedCards.find(e => e.card.id === card.id);
          if (existingEntry) {
            existingEntry.count = Math.min(existingEntry.count + 1, maxCopiesPerCard);
          } else {
            parsedCards.push({ card: card as ExtendedPocketCard, count: 1 });
          }
        }
      }
    }

    if (parsedCards.length === 0) {
      return { success: false, errors: ['No valid cards found'] };
    }

    // Enforce deck size limit
    let totalAdded = 0;
    const newDeck: DeckEntry[] = [];

    for (const entry of parsedCards) {
      if (totalAdded >= maxDeckSize) break;
      const cardsToAdd = Math.min(entry.count, maxDeckSize - totalAdded);
      if (cardsToAdd > 0) {
        newDeck.push({ ...entry, count: cardsToAdd });
        totalAdded += cardsToAdd;
      }
    }

    setDeck(newDeck);
    return { success: true, errors };
  }, [availableCards, maxDeckSize, maxCopiesPerCard]);

  // Import deck from JSON format
  const importFromJSON = useCallback((json: string): { success: boolean; errors: string[] } => {
    try {
      const data = JSON.parse(json);
      const errors: string[] = [];
      const parsedCards: DeckEntry[] = [];

      if (data.name) {
        setDeckName(data.name);
      }

      if (!Array.isArray(data.cards)) {
        return { success: false, errors: ['Invalid JSON format: missing cards array'] };
      }

      for (const item of data.cards) {
        const card = availableCards.find(c => c.id === item.id || c.name === item.name);
        if (card) {
          parsedCards.push({
            card: card as ExtendedPocketCard,
            count: Math.min(item.count || 1, maxCopiesPerCard)
          });
        } else {
          errors.push(`Card not found: ${item.name || item.id}`);
        }
      }

      if (parsedCards.length === 0) {
        return { success: false, errors: ['No valid cards found'] };
      }

      setDeck(parsedCards);
      return { success: true, errors };
    } catch {
      return { success: false, errors: ['Invalid JSON format'] };
    }
  }, [availableCards, maxCopiesPerCard]);

  // Copy deck to clipboard
  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    const deckText = exportToText();
    try {
      await navigator.clipboard.writeText(deckText);
      return true;
    } catch {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = deckText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch {
        return false;
      }
    }
  }, [exportToText]);

  // Generate shareable URL
  const generateShareUrl = useCallback((): string => {
    if (typeof window === 'undefined') return '';

    const shareData = {
      n: deckName,
      c: deck.map(e => ({ i: e.card.id, c: e.count }))
    };

    const encoded = btoa(JSON.stringify(shareData));
    return `${window.location.origin}/pocketmode/deckbuilder?d=${encoded}`;
  }, [deck, deckName]);

  // Import from share URL
  const importFromShareUrl = useCallback((encodedData: string): { success: boolean; errors: string[] } => {
    try {
      const decoded = JSON.parse(atob(encodedData));
      const errors: string[] = [];
      const parsedCards: DeckEntry[] = [];

      if (decoded.n) {
        setDeckName(decoded.n);
      }

      if (Array.isArray(decoded.c)) {
        for (const item of decoded.c) {
          const card = availableCards.find(c => c.id === item.i);
          if (card) {
            parsedCards.push({
              card: card as ExtendedPocketCard,
              count: Math.min(item.c || 1, maxCopiesPerCard)
            });
          }
        }
      }

      if (parsedCards.length > 0) {
        setDeck(parsedCards);
        return { success: true, errors };
      }

      return { success: false, errors: ['No valid cards found in shared deck'] };
    } catch {
      return { success: false, errors: ['Invalid share link'] };
    }
  }, [availableCards, maxCopiesPerCard]);

  return {
    // Deck state
    deck,
    deckName,
    setDeckName,

    // Computed stats
    deckStats,
    validation,
    metaAnalysis,
    metaSuggestions,

    // Card operations
    addCard,
    removeCard,
    setCardCount,
    getCardCount,
    getBaseNameCountForCard,
    clearDeck,

    // Deck persistence
    saveDeck,
    loadDeck,
    deleteSavedDeck,
    getSavedDecks,

    // Import/Export
    exportToText,
    exportToJSON,
    importFromText,
    importFromJSON,
    copyToClipboard,

    // URL sharing
    generateShareUrl,
    importFromShareUrl,

    // Constants
    MAX_DECK_SIZE: maxDeckSize,
    MAX_COPIES_PER_CARD: maxCopiesPerCard
  };
}
