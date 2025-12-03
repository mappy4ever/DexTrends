import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { fetchPocketData } from '../../utils/pocketData';
import { TypeBadge } from '../../components/ui/TypeBadge';
import { FadeIn, SlideUp } from '../../components/ui/animations';
import BackToTop from '../../components/ui/BaseBackToTop';
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import { FullBleedWrapper } from '../../components/ui/FullBleedWrapper';
import { PageHeader } from '../../components/ui/BreadcrumbNavigation';
import Container from '../../components/ui/Container';
import { useBottomNavigation, BOTTOM_NAV_HEIGHT } from '../../components/ui/BottomNavigation';
import { validateDeck, getDeckSuggestions, ValidationResult } from '../../utils/deckValidation';
import { analyzeDeckMeta, getMetaSuggestions, MetaAnalysis } from '../../utils/metaAnalysis';
import type { PocketCard } from '../../types/api/pocket-cards';

// Extended PocketCard type for deck builder specific fields
interface ExtendedPocketCard extends PocketCard {
  health?: string;
  type?: string;
  pack?: string;
}

// Deck entry interface
interface DeckEntry {
  card: ExtendedPocketCard;
  count: number;
}

// Deck statistics interface
interface DeckStats {
  totalCards: number;
  typeDistribution: Record<string, number>;
  isEmpty: boolean;
  isFull: boolean;
}

// Filter options interface
interface FilterOptions {
  types: string[];
  packs: string[];
  rarities: string[];
}

// Saved deck interface
interface SavedDeck {
  id: string;
  name: string;
  cards: DeckEntry[];
  stats: DeckStats;
  createdAt: string;
}

// Component types
type SortBy = 'name' | 'type' | 'health' | 'rarity' | 'pack';
type ViewMode = 'compact' | 'expanded';
type DeckViewMode = '2x10' | '5x5';

// All available packs
const ALL_PACKS = [
  'Charizard', 'Mewtwo', 'Pikachu', 'Mythical Island',
  'Apex', 'Mythical', 'Celestial', 'Eevee Grove',
  'Dialga', 'Palkia', 'Triumphant Light', 'Shining Revelry',
  'Solgaleo', 'Lunala', 'Extradimensional Crisis'
];

function DeckBuilder() {
  const router = useRouter();
  const { hasBottomNav } = useBottomNavigation();

  // Card data state
  const [allCards, setAllCards] = useState<ExtendedPocketCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Deck state
  const [deck, setDeck] = useState<DeckEntry[]>([]);
  const [deckName, setDeckName] = useState<string>('My Pocket Deck');
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [zoomedCard, setZoomedCard] = useState<ExtendedPocketCard | null>(null);
  const [deckZoomIndex, setDeckZoomIndex] = useState<number | null>(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [deckViewMode, setDeckViewMode] = useState<DeckViewMode>('2x10');
  
  // Import/Export state
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showShareView, setShowShareView] = useState<boolean>(false);
  
  // Validation and analysis state
  const [activeTab, setActiveTab] = useState<'builder' | 'analysis' | 'validation'>('builder');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [metaAnalysis, setMetaAnalysis] = useState<MetaAnalysis | null>(null);
  const [metaSuggestions, setMetaSuggestions] = useState<string[]>([]);
  
  // Constants matching Pokemon Pocket
  const MAX_DECK_SIZE = 20;
  const MAX_COPIES_PER_CARD = 2;
  
  // Validate and analyze deck when it changes
  useEffect(() => {
    if (deck.length > 0) {
      // Convert deck entries to validation format
      const deckCards = deck.map(entry => ({
        ...entry.card,
        quantity: entry.count,
        supertype: entry.card.type ? 'Pokémon' : 'Trainer'
      }));
      
      // Run validation
      const validationResult = validateDeck(deckCards, 'pocket');
      setValidation(validationResult);
      
      // Run meta analysis
      const metaResult = analyzeDeckMeta(deckCards, 'pocket');
      setMetaAnalysis(metaResult);
      
      // Generate meta suggestions
      const suggestions = getMetaSuggestions(metaResult);
      setMetaSuggestions(suggestions);
    } else {
      setValidation(null);
      setMetaAnalysis(null);
      setMetaSuggestions([]);
    }
  }, [deck]);
  
  // Load cards on component mount
  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true);
        const data = await fetchPocketData();
        setAllCards(data as ExtendedPocketCard[] || []);
      } catch (err) {
        setError('Failed to load cards');
      } finally {
        setLoading(false);
      }
    };
    
    loadCards();
  }, []);

  // Helper function to get display type (handles trainer subtypes)
  const getDisplayType = useCallback((type: string | undefined, card: ExtendedPocketCard): string => {
    const lowerType = type?.toLowerCase() || '';
    
    if (lowerType === 'trainer') {
      const name = card.name?.toLowerCase() || '';
      
      const fossilPatterns = [/^helix fossil$/, /^dome fossil$/, /^old amber$/];
      const toolPatterns = [
        /tool$/, /^rocky helmet/, /^muscle band/, /^leftovers/, /^float stone/, /^choice band/, /^focus sash/, /^weakness policy/, /^air balloon/,
        /berry$/, /^lam berry/, /^oran berry/, /^sitrus berry/, /^pecha berry/, /^cheri berry/, /^aspear berry/,
        /cape$/, /^giant cape/, /^rescue cape/, /band$/, /^poison band/, /^expert band/, /^team band/,
        /barb$/, /^poison barb/, /^toxic barb/, /cord$/, /^electrical cord/, /^power cord/,
        /stone$/, /^evolution stone/, /^fire stone/, /^water stone/, /^thunder stone/, /^leaf stone/,
        /^protective/, /^defense/, /^shield/, /^energy/, /^double colorless energy/, /^rainbow energy/,
        /^lucky/, /^amulet/, /^charm/, /^crystal/, /^scope/, /^specs/, /^goggles/
      ];
      const supporterPatterns = [
        /^professor/, /^dr\./, /^mr\./, /^ms\./, /^mrs\./, /^captain/, /^gym leader/, /^elite/,
        /^team .* (grunt|admin|boss|leader)/, /grunt$/, /admin$/, /boss$/,
        /'s (advice|training|encouragement|help|research|orders|conviction|dedication|determination|resolve)$/,
        /research$/, /analysis$/, /theory$/,
        /^(erika|misty|blaine|koga|giovanni|brock|lt\. surge|sabrina|bill|oak|red)$/,
        /^(blue|green|yellow|gold|silver|crystal|ruby|sapphire)$/,
        /^(cynthia|lance|steven|wallace|diantha|iris|alder)$/,
        /^team/, /rocket/, /aqua/, /magma/, /galactic/, /plasma/, /flare/
      ];
      
      const itemPatterns = [
        /potion$/, /^potion$/, /^super potion/, /^hyper potion/, /^max potion/,
        /ball$/, /^poke ball/, /^great ball/, /^ultra ball/,
        /^x /, // X Speed, X Attack, etc.
        /^switch/, /^rope/, /candy$/, /^rare candy/
      ];
      
      if (fossilPatterns.some(pattern => pattern.test(name))) return 'Fossil';
      if (toolPatterns.some(pattern => pattern.test(name))) return 'Tool';
      if (itemPatterns.some(pattern => pattern.test(name))) return 'Item';
      if (supporterPatterns.some(pattern => pattern.test(name))) return 'Supporter';
      
      const words = card.name?.split(' ') || [];
      if (words.length <= 3 && words[0] && /^[A-Z]/.test(words[0])) {
        const personIndicators = ['grunt', 'admin', 'boss', 'leader', 'trainer', 'champion', 'rival'];
        if (personIndicators.some(indicator => name.includes(indicator))) return 'Supporter';
        if (words.length === 1 && /^[A-Z][a-z]+$/.test(words[0])) return 'Supporter';
      }
      
      return 'Item';
    }
    
    return type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : '';
  }, []);

  // Get unique values for filters
  const filterOptions = useMemo<FilterOptions>(() => {
    if (!allCards.length) return { types: [], packs: [], rarities: [] };
    
    // Get base types from cards
    const baseTypes = [...new Set(allCards.map(card => card.type).filter(Boolean) as string[])].sort();
    // Add trainer subtypes as separate filter options
    const types = baseTypes.includes('trainer') 
      ? [...baseTypes.filter(t => t !== 'trainer'), 'item', 'supporter', 'tool'].sort()
      : baseTypes;
    
    // Show all available packs from ALL_PACKS that have cards
    const allPacks = [...new Set(allCards.map(card => card.pack).filter(Boolean) as string[])];
    const packs = ALL_PACKS.filter(pack => allPacks.includes(pack));
    const rarities = [...new Set(allCards.map(card => card.rarity).filter(Boolean) as string[])].sort();
    
    return { types, packs, rarities };
  }, [allCards]);

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let filtered = allCards.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Handle trainer subtype filtering
      let matchesType = selectedTypes.length === 0;
      if (!matchesType && card.type) {
        const cardTypeLower = card.type.toLowerCase();
        if (cardTypeLower === 'trainer') {
          // Check if any selected trainer subtype matches
          const displayType = getDisplayType(card.type, card).toLowerCase();
          matchesType = selectedTypes.includes(displayType);
        } else {
          // For non-trainer cards, check direct type match
          matchesType = selectedTypes.includes(cardTypeLower);
        }
      } else if (!matchesType && card.types) {
        // For cards with multiple types (array)
        matchesType = card.types.some(t => selectedTypes.includes(t.toLowerCase()));
      }
      
      const matchesPack = selectedPacks.length === 0 || (card.pack && selectedPacks.includes(card.pack));
      const matchesRarity = selectedRarities.length === 0 || (card.rarity && selectedRarities.includes(card.rarity));
      
      return matchesSearch && matchesType && matchesPack && matchesRarity;
    });
    
    // Sort cards
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        case 'health':
          return parseInt(b.health || '0') - parseInt(a.health || '0');
        case 'rarity':
          return (a.rarity || '').localeCompare(b.rarity || '');
        case 'pack':
          return (a.pack || '').localeCompare(b.pack || '');
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [allCards, searchTerm, selectedTypes, selectedPacks, selectedRarities, sortBy, getDisplayType]);

  // Deck statistics
  const deckStats = useMemo<DeckStats>(() => {
    const totalCards = deck.reduce((sum, entry) => sum + entry.count, 0);
    const typeDistribution: Record<string, number> = {};
    
    deck.forEach(entry => {
      const type = entry.card.type || 'unknown';
      typeDistribution[type] = (typeDistribution[type] || 0) + entry.count;
    });
    
    return {
      totalCards,
      typeDistribution,
      isEmpty: totalCards === 0,
      isFull: totalCards >= MAX_DECK_SIZE
    };
  }, [deck]);

  // Add card to deck
  const addCardToDeck = useCallback((card: ExtendedPocketCard) => {
    setDeck(prevDeck => {
      const existingIndex = prevDeck.findIndex(entry => entry.card.id === card.id);
      const totalCards = prevDeck.reduce((sum, entry) => sum + entry.count, 0);
      
      if (totalCards >= MAX_DECK_SIZE && existingIndex === -1) return prevDeck;
      
      if (existingIndex >= 0) {
        const currentCount = prevDeck[existingIndex].count;
        if (currentCount >= MAX_COPIES_PER_CARD || totalCards >= MAX_DECK_SIZE) return prevDeck;
        
        const newDeck = [...prevDeck];
        newDeck[existingIndex].count += 1;
        return newDeck;
      } else {
        return [...prevDeck, { card, count: 1 }];
      }
    });
  }, []);

  // Remove card from deck
  const removeCardFromDeck = useCallback((cardId: string) => {
    setDeck(prevDeck => {
      const existingIndex = prevDeck.findIndex(entry => entry.card.id === cardId);
      if (existingIndex === -1) return prevDeck;
      
      const newDeck = [...prevDeck];
      if (newDeck[existingIndex].count > 1) {
        newDeck[existingIndex].count -= 1;
      } else {
        newDeck.splice(existingIndex, 1);
      }
      
      return newDeck;
    });
  }, []);

  // Add default cards (2x Professor Oak + 2x Pokeball)
  const addDefaultCards = useCallback(() => {
    const professorOak = allCards.find(card => 
      card.name.toLowerCase() === 'professor oak' || 
      card.name.toLowerCase() === 'professor research' ||
      card.name.toLowerCase() === 'professor\'s research'
    );
    const pokeball = allCards.find(card => 
      card.name.toLowerCase() === 'poke ball' || 
      card.name.toLowerCase() === 'poké ball' ||
      card.name.toLowerCase() === 'pokeball'
    );

    if (professorOak) {
      addCardToDeck(professorOak);
      addCardToDeck(professorOak);
    }
    if (pokeball) {
      addCardToDeck(pokeball);
      addCardToDeck(pokeball);
    }
  }, [allCards, addCardToDeck]);

  // Get card count in deck
  const getCardCountInDeck = useCallback((cardId: string): number => {
    const entry = deck.find(entry => entry.card.id === cardId);
    return entry ? entry.count : 0;
  }, [deck]);

  // Clear entire deck
  const clearDeck = useCallback(() => {
    setDeck([]);
  }, []);

  // Save deck
  const saveDeck = useCallback(() => {
    if (deckStats.totalCards === 0) {
      alert('Cannot save an empty deck');
      return;
    }
    
    const deckData: SavedDeck = {
      id: `deck_${Date.now()}`,
      name: deckName.trim() || 'Unnamed Deck',
      cards: deck,
      stats: deckStats,
      createdAt: new Date().toISOString()
    };
    
    try {
      if (typeof window !== 'undefined') {
        const savedDecks = JSON.parse(localStorage.getItem('pocketDecks') || '[]') as SavedDeck[];
        savedDecks.push(deckData);
        localStorage.setItem('pocketDecks', JSON.stringify(savedDecks));
        alert('Deck saved successfully!');
        setShowSaveModal(false);
      } else {
        alert('Saving is not available on server-side');
      }
    } catch (error) {
      alert('Failed to save deck');
    }
  }, [deck, deckName, deckStats]);

  // Export deck to text format
  const exportDeckToText = useCallback((): string => {
    if (deck.length === 0) return '';
    
    const deckText = deck
      .map(entry => `${entry.card.name} x${entry.count}`)
      .join('\n');
    
    return `Deck Name: ${deckName}\nTotal Cards: ${deckStats.totalCards}\n\n${deckText}`;
  }, [deck, deckName, deckStats]);

  // Copy deck to clipboard (SSR safe)
  const copyDeckToClipboard = useCallback(async () => {
    if (typeof window === 'undefined') {
      alert('Clipboard functionality is not available on server');
      return;
    }
    
    const deckText = exportDeckToText();
    try {
      await navigator.clipboard.writeText(deckText);
      alert('Deck copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers (SSR safe)
      if (typeof document !== 'undefined') {
        const textArea = document.createElement('textarea');
        textArea.value = deckText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          alert('Deck copied to clipboard!');
        } catch (err) {
          alert('Failed to copy deck to clipboard');
        }
        document.body.removeChild(textArea);
      } else {
        alert('Clipboard functionality is not available');
      }
    }
  }, [exportDeckToText]);

  // Download deck as text file (SSR safe)
  const downloadDeck = useCallback(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      alert('Download functionality is not available on server');
      return;
    }
    
    const deckText = exportDeckToText();
    const blob = new Blob([deckText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deckName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_deck.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportDeckToText, deckName]);

  // Parse deck from text
  const parseDeckFromText = useCallback((text: string): { cards: DeckEntry[], errors: string[] } => {
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
      
      // Parse card line - supports various formats
      const formats = [
        /^(.+?)\s*x\s*(\d+)$/i,           // Card Name x2
        /^(\d+)\s*x?\s*(.+)$/,             // 2x Card Name or 2 Card Name
        /^(.+?)\s*\*\s*(\d+)$/,            // Card Name * 2
        /^(.+?)\s+(\d+)$/,                 // Card Name 2
      ];
      
      let matched = false;
      for (const format of formats) {
        const match = trimmedLine.match(format);
        if (match) {
          let cardName: string;
          let count: number;
          
          // Determine which group is the card name and which is the count
          if (formats.indexOf(format) === 1) {
            // Format: 2x Card Name
            count = parseInt(match[1]);
            cardName = match[2];
          } else {
            // Other formats: Card Name x2
            cardName = match[1];
            count = parseInt(match[2]);
          }
          
          cardName = cardName.trim();
          
          // Validate count
          if (count < 1 || count > MAX_COPIES_PER_CARD) {
            errors.push(`Invalid count for "${cardName}": ${count} (must be 1-${MAX_COPIES_PER_CARD})`);
            continue;
          }
          
          // Find the card
          const card = allCards.find(c => 
            c.name.toLowerCase() === cardName.toLowerCase() ||
            c.name.toLowerCase().replace(/['']/g, "'") === cardName.toLowerCase().replace(/['']/g, "'") ||
            c.name.toLowerCase().replace(/\s+/g, '') === cardName.toLowerCase().replace(/\s+/g, '')
          );
          
          if (card) {
            // Check if card already exists in parsed deck
            const existingEntry = parsedCards.find(entry => entry.card.id === card.id);
            if (existingEntry) {
              existingEntry.count = Math.min(existingEntry.count + count, MAX_COPIES_PER_CARD);
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
      
      if (!matched && trimmedLine) {
        // Try to match as just a card name (assume count of 1)
        const card = allCards.find(c => 
          c.name.toLowerCase() === trimmedLine.toLowerCase() ||
          c.name.toLowerCase().replace(/['']/g, "'") === trimmedLine.toLowerCase().replace(/['']/g, "'")
        );
        
        if (card) {
          const existingEntry = parsedCards.find(entry => entry.card.id === card.id);
          if (existingEntry) {
            existingEntry.count = Math.min(existingEntry.count + 1, MAX_COPIES_PER_CARD);
          } else {
            parsedCards.push({ card: card as ExtendedPocketCard, count: 1 });
          }
        } else {
          errors.push(`Invalid line or card not found: "${trimmedLine}"`);
        }
      }
    }
    
    // Check total deck size
    const totalCards = parsedCards.reduce((sum, entry) => sum + entry.count, 0);
    if (totalCards > MAX_DECK_SIZE) {
      errors.push(`Deck size exceeds maximum (${totalCards}/${MAX_DECK_SIZE}). Some cards may be excluded.`);
    }
    
    return { cards: parsedCards, errors };
  }, [allCards]);

  // Import deck from text
  const importDeck = useCallback(() => {
    setImportError('');
    
    if (!importText.trim()) {
      setImportError('Please enter a deck list');
      return;
    }
    
    const { cards, errors } = parseDeckFromText(importText);
    
    if (cards.length === 0) {
      setImportError('No valid cards found in the deck list');
      return;
    }
    
    // Clear current deck and add imported cards
    setDeck([]);
    
    // Add cards up to the deck limit
    let totalAdded = 0;
    const newDeck: DeckEntry[] = [];
    
    for (const entry of cards) {
      if (totalAdded >= MAX_DECK_SIZE) break;
      
      const cardsToAdd = Math.min(entry.count, MAX_DECK_SIZE - totalAdded);
      if (cardsToAdd > 0) {
        newDeck.push({ ...entry, count: cardsToAdd });
        totalAdded += cardsToAdd;
      }
    }
    
    setDeck(newDeck);
    
    // Show any errors as a summary
    if (errors.length > 0) {
      alert(`Deck imported with warnings:\n\n${errors.join('\n')}`);
    } else {
      alert('Deck imported successfully!');
    }
    
    setShowImportModal(false);
    setImportText('');
  }, [importText, parseDeckFromText]);

  // Toggle filter selection
  const toggleFilter = useCallback((value: string, setFunction: React.Dispatch<React.SetStateAction<string[]>>) => {
    setFunction(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  }, []);

  // Type colors for filters
  const getTypeColor = (type: string | undefined): string => {
    const typeColors: Record<string, string> = {
      fire: 'bg-red-500 hover:bg-red-600 text-white',
      water: 'bg-blue-500 hover:bg-blue-600 text-white',
      grass: 'bg-green-500 hover:bg-green-600 text-white',
      electric: 'bg-yellow-400 hover:bg-yellow-500 text-black',
      lightning: 'bg-yellow-400 hover:bg-yellow-500 text-black',
      psychic: 'bg-pink-500 hover:bg-pink-600 text-white',
      fighting: 'bg-orange-600 hover:bg-orange-700 text-white',
      darkness: 'bg-stone-800 hover:bg-stone-900 text-white',
      metal: 'bg-stone-500 hover:bg-stone-600 text-white',
      dragon: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      colorless: 'bg-stone-300 hover:bg-stone-400 text-stone-800',
      trainer: 'bg-purple-500 hover:bg-purple-600 text-white',
      item: 'bg-blue-500 hover:bg-blue-600 text-white',
      supporter: 'bg-orange-500 hover:bg-orange-600 text-white',
      tool: 'bg-purple-600 hover:bg-purple-700 text-white'
    };
    return typeColors[type?.toLowerCase() || ''] || 'bg-stone-400 hover:bg-stone-500 text-white';
  };

  // Pack colors
  const getPackColor = (pack: string): string => {
    const packColors: Record<string, string> = {
      'Charizard': 'bg-orange-500 hover:bg-orange-600',
      'Mewtwo': 'bg-purple-500 hover:bg-purple-600',
      'Pikachu': 'bg-yellow-400 hover:bg-yellow-500 text-black',
      'Mythical Island': 'bg-pink-500 hover:bg-pink-600',
      'Apex': 'bg-red-600 hover:bg-red-700',
      'Mythical': 'bg-indigo-500 hover:bg-indigo-600',
      'Celestial': 'bg-cyan-500 hover:bg-cyan-600',
      'Eevee Grove': 'bg-green-500 hover:bg-green-600',
      'Dialga': 'bg-blue-600 hover:bg-blue-700',
      'Palkia': 'bg-purple-600 hover:bg-purple-700',
      'Triumphant Light': 'bg-yellow-500 hover:bg-yellow-600 text-black',
      'Shining Revelry': 'bg-pink-600 hover:bg-pink-700',
      'Solgaleo': 'bg-amber-500 hover:bg-amber-600',
      'Lunala': 'bg-indigo-600 hover:bg-indigo-700',
      'Extradimensional Crisis': 'bg-violet-500 hover:bg-violet-600'
    };
    return packColors[pack] || 'bg-stone-500 hover:bg-stone-600';
  };

  // Rarity colors
  const getRarityColor = (rarity: string | undefined): string => {
    const rarityColors: Record<string, string> = {
      '◊': 'from-stone-400 to-stone-500',
      '◊◊': 'from-green-400 to-green-500',
      '◊◊◊': 'from-blue-400 to-blue-500',
      '◊◊◊◊': 'from-purple-400 to-purple-500',
      '★': 'from-yellow-400 to-amber-500',
      '★★': 'from-red-400 to-rose-500',
      '☆☆☆': 'from-pink-400 to-fuchsia-500'
    };
    return rarityColors[rarity || ''] || 'from-stone-400 to-stone-500';
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Deck Builder | Pokemon Pocket | DexTrends</title>
        </Head>
        <PageLoader text="Loading Deck Builder..." />
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <Head>
          <title>Deck Builder | Pokemon Pocket | DexTrends</title>
        </Head>
        <div className="bg-white dark:bg-stone-800 rounded-xl p-8 text-center shadow-xl max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Error</h2>
          <p className="text-stone-600 dark:text-stone-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <FullBleedWrapper gradient="pocket">
      <Head>
        <title>Pokemon Pocket Deck Builder | DexTrends</title>
        <meta name="description" content="Build and customize your Pokemon Pocket decks with our advanced deck builder" />
      </Head>
      <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* PageHeader with Breadcrumbs */}
        <PageHeader
          title="Deck Builder"
          description="Build and customize your Pokémon TCG Pocket decks"
          breadcrumbs={[
            { title: 'Home', href: '/', icon: '🏠', isActive: false },
            { title: 'Pocket Mode', href: '/pocketmode', icon: '📱', isActive: false },
            { title: 'Deck Builder', href: '/pocketmode/deckbuilder', icon: '🏗️', isActive: true },
          ]}
        >
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg font-medium transition-colors"
            >
              Import
            </button>
            {!deckStats.isEmpty && (
              <>
                <button
                  onClick={() => setShowShareView(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Share
                </button>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium transition-colors"
                >
                  Export
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition-colors"
                >
                  Save
                </button>
                <Link
                  href="/pocketmode/decks"
                  className="px-3 py-1.5 bg-stone-600 hover:bg-stone-700 text-white text-sm rounded-lg font-medium transition-colors"
                >
                  My Decks
                </Link>
              </>
            )}
          </div>
        </PageHeader>
      </div>

      {/* Sticky Deck View at Top */}
      <div className="sticky top-16 z-30 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Deck Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">Your Deck</h2>
              <div className={`text-xl font-bold ${
                deckStats.isFull ? 'text-green-600' : 
                deckStats.totalCards > 15 ? 'text-yellow-600' : 
                'text-stone-600 dark:text-stone-300'
              }`}>
                {deckStats.totalCards}/{MAX_DECK_SIZE}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Deck Zoom Button */}
              {!deckStats.isEmpty && (
                <button
                  onClick={() => setDeckZoomIndex(0)}
                  className="p-1.5 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 rounded-lg transition-colors"
                  title="View deck cards"
                >
                  <svg className="w-5 h-5 text-stone-700 dark:text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>
              )}
              
              {/* Actions */}
              <button
                onClick={addDefaultCards}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                + Starter
              </button>
              {!deckStats.isEmpty && (
                <button
                  onClick={clearDeck}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          {/* Deck Cards Grid */}
          <div className="w-full">
            {deck.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-stone-400">
                <div className="text-center">
                  <div className="text-3xl mb-2">🎴</div>
                  <p className="text-sm">Add cards to build your deck</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-10 grid-rows-2 gap-1 sm:gap-1.5 lg:gap-2 max-w-full mx-auto">
                {/* Fill grid with cards and empty slots */}
                {Array.from({ length: 20 }, (_, index) => {
                  // Calculate which card/count this slot represents
                  let cardIndex = 0;
                  let countIndex = index;
                  
                  for (const entry of deck) {
                    if (countIndex < entry.count) {
                      return (
                        <div
                          key={`slot-${index}`}
                          onClick={() => removeCardFromDeck(entry.card.id)}
                          className="relative aspect-[3/4] cursor-pointer group"
                        >
                          <div className="relative w-full h-full bg-stone-100 dark:bg-stone-700 rounded-md lg:rounded-lg overflow-hidden border border-stone-200 dark:border-stone-600 hover:border-red-500 transition-all hover:scale-105">
                            <Image
                              src={entry.card.image || "/back-card.png"}
                              alt={entry.card.name}
                              fill
                              className="object-contain"
                              sizes="(max-width: 640px) 50px, (max-width: 1024px) 70px, (max-width: 1536px) 90px, 110px"
                            />
                            
                            {/* HP Badge */}
                            {entry.card.health && (
                              <div className="absolute top-0.5 right-0.5 bg-red-600 text-white text-[8px] sm:text-[10px] font-bold px-0.5 sm:px-1 py-0.5 rounded-full">
                                {entry.card.health}
                              </div>
                            )}
                            
                            {/* EX Badge */}
                            {(entry.card.rarity === 'Crown Rare' || entry.card.name.toLowerCase().includes(' ex')) && (
                              <div className="absolute top-3 sm:top-4 right-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-[8px] sm:text-[10px] font-bold px-0.5 sm:px-1 py-0.5 rounded-full">
                                EX
                              </div>
                            )}
                            
                            {/* Remove overlay */}
                            <div className="absolute inset-0 bg-red-600/0 hover:bg-red-600/20 transition-colors flex items-center justify-center">
                              <span className="text-white text-sm sm:text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity">×</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    countIndex -= entry.count;
                  }
                  
                  // Empty slot
                  return (
                    <div
                      key={`empty-${index}`}
                      className="relative aspect-[3/4] bg-stone-100 dark:bg-stone-700 rounded-md lg:rounded-lg border border-dashed border-stone-300 dark:border-stone-600 opacity-30"
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 p-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('builder')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'builder'
                    ? 'bg-pokemon-red text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
              >
                Card Browser
              </button>
              <button
                onClick={() => setActiveTab('validation')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'validation'
                    ? 'bg-pokemon-red text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
              >
                Validation
                {validation && !validation.isValid && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {validation.errors.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'analysis'
                    ? 'bg-pokemon-red text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
              >
                Meta Analysis
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'builder' && (
            <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 shadow-sm border border-stone-200 dark:border-stone-700">
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pokemon-red focus:border-transparent transition-all text-stone-900 dark:text-white placeholder-stone-400"
                  />
                </div>
              </div>

              {/* Simplified Filters */}
              <div className="space-y-3">
                {/* Type Filters */}
                <div>
                  <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-2 uppercase tracking-wider">Types</label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.types.map(type => {
                      const displayType = getDisplayType(type, { type } as ExtendedPocketCard);
                      return (
                        <button
                          key={type}
                          onClick={() => toggleFilter(type, setSelectedTypes)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            selectedTypes.includes(type)
                              ? `${getTypeColor(type)} shadow-md scale-105`
                              : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                          }`}
                        >
                          {displayType}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rarity Filters */}
                <div>
                  <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-2 uppercase tracking-wider">Rarity</label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.rarities.map(rarity => (
                      <button
                        key={rarity}
                        onClick={() => toggleFilter(rarity, setSelectedRarities)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          selectedRarities.includes(rarity)
                            ? `bg-gradient-to-r ${getRarityColor(rarity)} text-white shadow-md scale-105`
                            : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                        }`}
                      >
                        {rarity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pack Filters - Core packs only */}
                <div>
                  <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-2 uppercase tracking-wider">Packs</label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.packs.map(pack => (
                      <button
                        key={pack}
                        onClick={() => toggleFilter(pack, setSelectedPacks)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all text-white ${
                          selectedPacks.includes(pack)
                            ? `${getPackColor(pack)} shadow-md scale-105`
                            : 'bg-stone-400 hover:bg-stone-500 opacity-60'
                        }`}
                      >
                        {pack}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-700">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="px-3 py-1.5 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pokemon-red text-stone-900 dark:text-white"
                  >
                    <option value="name">Name</option>
                    <option value="type">Type</option>
                    <option value="health">Health</option>
                    <option value="rarity">Rarity</option>
                  </select>
                  <div className="text-sm text-stone-500 dark:text-stone-300">
                    {filteredCards.length} cards
                  </div>
                </div>
              </div>
            </div>

            {/* Card Grid - Responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3 lg:gap-4">
              {filteredCards.map((card) => {
                const countInDeck = getCardCountInDeck(card.id);
                const canAdd = countInDeck < MAX_COPIES_PER_CARD && !deckStats.isFull;
                const isEX = card.rarity === 'Crown Rare' || card.name.toLowerCase().includes(' ex');
                
                return (
                  <div
                    key={card.id}
                    onClick={() => canAdd && addCardToDeck(card)}
                    className={`group relative bg-white dark:bg-stone-800 rounded-lg shadow-sm border transition-all duration-300 overflow-hidden ${
                      !canAdd 
                        ? 'border-stone-200 dark:border-stone-700 opacity-50 cursor-not-allowed' 
                        : countInDeck > 0
                          ? 'border-2 border-green-500 cursor-pointer hover:shadow-lg hover:scale-105 hover:border-green-400'
                          : 'border border-stone-200 dark:border-stone-700 cursor-pointer hover:shadow-lg hover:scale-105 hover:border-pokemon-blue hover:border-2'
                    }`}
                  >
                    {/* Count Badge - Centered and larger */}
                    {countInDeck > 0 && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-green-500 text-white text-lg font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-white">
                        {countInDeck}
                      </div>
                    )}
                    
                    {/* Card Image */}
                    <div className="relative w-full aspect-[3/4] bg-stone-100 dark:bg-stone-700">
                      <Image
                        src={card.image || "/back-card.png"}
                        alt={card.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 160px, (max-width: 1280px) 180px, 200px"
                      />
                      
                      {/* HP Badge - Positioned at top right */}
                      {card.health && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                          {card.health} HP
                        </div>
                      )}
                      
                      {/* EX Badge - Positioned under HP badge */}
                      {isEX && (
                        <div className={`absolute right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-md ${
                          card.health ? 'top-8' : 'top-2'
                        }`}>
                          EX
                        </div>
                      )}
                      
                      {/* Magnifier Button - Positioned at top left */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedCard(card);
                        }}
                        className="absolute top-2 left-2 p-1.5 bg-white/90 dark:bg-stone-800/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                        title="View card details"
                      >
                        <svg className="w-4 h-4 text-stone-700 dark:text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </button>
                      
                      {/* Hover Overlay */}
                      {canAdd && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <div className="text-white text-sm font-semibold text-center drop-shadow-lg">
                              {card.name}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}
        </div>

          {/* Validation Tab */}
          {activeTab === 'validation' && validation && (
            <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 p-6">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4">Deck Validation</h3>
              
              {/* Validation Status */}
              <div className={`mb-6 p-4 rounded-lg ${
                validation.isValid 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {validation.isValid ? (
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={`font-semibold ${
                    validation.isValid 
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {validation.isValid ? 'Deck is valid for Pocket format' : 'Deck has validation issues'}
                  </span>
                </div>
              </div>

              {/* Errors */}
              {validation.errors.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3">Errors</h4>
                  <div className="space-y-2">
                    {validation.errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="text-red-700 dark:text-red-300">{error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">Warnings</h4>
                  <div className="space-y-2">
                    {validation.warnings.map((warning, index) => (
                      <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="text-yellow-700 dark:text-yellow-300">{warning}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {validation.suggestions.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">Suggestions</h4>
                  <div className="space-y-2">
                    {validation.suggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="text-amber-700 dark:text-amber-300">{suggestion}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deck Statistics */}
              {validation.stats && (
                <div>
                  <h4 className="font-semibold text-stone-900 dark:text-white mb-3">Deck Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-stone-50 dark:bg-stone-700 rounded-lg">
                      <div className="text-2xl font-bold text-stone-900 dark:text-white">
                        {validation.stats.totalCards}
                      </div>
                      <div className="text-sm text-stone-500 dark:text-stone-300">Total Cards</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 dark:bg-stone-700 rounded-lg">
                      <div className="text-2xl font-bold text-stone-900 dark:text-white">
                        {validation.stats.pokemon}
                      </div>
                      <div className="text-sm text-stone-500 dark:text-stone-300">Pokémon</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 dark:bg-stone-700 rounded-lg">
                      <div className="text-2xl font-bold text-stone-900 dark:text-white">
                        {validation.stats.trainers}
                      </div>
                      <div className="text-sm text-stone-500 dark:text-stone-300">Trainers</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 dark:bg-stone-700 rounded-lg">
                      <div className="text-2xl font-bold text-stone-900 dark:text-white">
                        {validation.stats.basicPokemon}
                      </div>
                      <div className="text-sm text-stone-500 dark:text-stone-300">Basic Pokémon</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Meta Analysis Tab */}
          {activeTab === 'analysis' && metaAnalysis && (
            <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 p-6">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4">Meta Game Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-stone-50 dark:bg-stone-700 rounded-lg">
                  <div className="text-3xl font-bold text-stone-900 dark:text-white">
                    {metaAnalysis.score}
                  </div>
                  <div className="text-sm text-stone-500 dark:text-stone-300">Meta Score</div>
                </div>
                <div className="text-center p-4 bg-stone-50 dark:bg-stone-700 rounded-lg">
                  <div className="text-2xl font-bold text-stone-900 dark:text-white">
                    {metaAnalysis.tier}
                  </div>
                  <div className="text-sm text-stone-500 dark:text-stone-300">Tier Rating</div>
                </div>
                <div className="text-center p-4 bg-stone-50 dark:bg-stone-700 rounded-lg">
                  <div className="text-2xl font-bold text-stone-900 dark:text-white">
                    {metaAnalysis.consistency}%
                  </div>
                  <div className="text-sm text-stone-500 dark:text-stone-300">Consistency</div>
                </div>
              </div>

              {/* Deck Archetype */}
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="text-sm text-amber-600 dark:text-amber-400 mb-1">Identified Archetype</div>
                <div className="text-xl font-bold text-amber-900 dark:text-amber-100">{metaAnalysis.archetype}</div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">Strengths</h4>
                  <div className="space-y-2">
                    {metaAnalysis.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-stone-700 dark:text-stone-300">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3">Weaknesses</h4>
                  <div className="space-y-2">
                    {metaAnalysis.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-stone-700 dark:text-stone-300">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Matchup Analysis */}
              <div className="mb-6">
                <h4 className="font-semibold text-stone-900 dark:text-white mb-3">Predicted Matchups</h4>
                <div className="space-y-2">
                  {metaAnalysis.matchups.map((matchup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-700 rounded-lg">
                      <span className="font-medium text-stone-900 dark:text-white">{matchup.archetype}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-stone-200 dark:bg-stone-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              matchup.winRate >= 60 ? 'bg-green-500' :
                              matchup.winRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${matchup.winRate}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold w-12 text-right ${
                          matchup.difficulty === 'favorable' ? 'text-green-600 dark:text-green-400' :
                          matchup.difficulty === 'unfavorable' ? 'text-red-600 dark:text-red-400' :
                          'text-stone-600 dark:text-stone-300'
                        }`}>
                          {matchup.winRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta Suggestions */}
              {metaSuggestions && metaSuggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">Improvement Suggestions</h4>
                  <div className="space-y-2">
                    {metaSuggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                        <div className="text-purple-700 dark:text-purple-300">{suggestion}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      
      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">Save Deck</h3>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="Enter deck name..."
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pokemon-red text-stone-900 dark:text-white mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveDeck}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-800 rounded-xl p-6 max-w-2xl w-full shadow-2xl">
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">Import Deck</h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 mb-4">
              Paste your deck list below. Supported formats:
              <br />• Card Name x2
              <br />• 2x Card Name
              <br />• Card Name * 2
              <br />• Card Name (one per line)
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste deck list here..."
              className="w-full h-64 px-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pokemon-red text-stone-900 dark:text-white mb-4 font-mono text-sm"
              autoFocus
            />
            {importError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">{importError}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportText('');
                  setImportError('');
                }}
                className="flex-1 px-4 py-2 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={importDeck}
                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-800 rounded-xl p-6 max-w-2xl w-full shadow-2xl">
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">Export Deck</h3>
            <div className="bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg p-4 mb-4">
              <pre className="text-sm font-mono text-stone-900 dark:text-white whitespace-pre-wrap">
                {exportDeckToText()}
              </pre>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={copyDeckToClipboard}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy to Clipboard
              </button>
              <button
                onClick={downloadDeck}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full px-4 py-2 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Share View Modal - Screenshot-friendly deck display */}
      {showShareView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
            {/* Shareable Content */}
            <div id="deck-share-image" className="p-6">
              {/* Header with Branding */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{deckName}</h2>
                  <p className="text-stone-400 text-sm">Pokémon Pocket Deck • {deckStats.totalCards}/20 cards</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">DexTrends</div>
                  <div className="text-[10px] text-stone-500">dextrends.com</div>
                </div>
              </div>

              {/* Deck Grid - 5x4 layout for screenshots */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {Array.from({ length: 20 }, (_, index) => {
                  let cardIndex = 0;
                  let countIndex = index;

                  for (const entry of deck) {
                    if (countIndex < entry.count) {
                      return (
                        <div
                          key={`share-slot-${index}`}
                          className="relative aspect-[3/4] rounded-lg overflow-hidden bg-stone-700/50"
                        >
                          <Image
                            src={entry.card.image || "/back-card.png"}
                            alt={entry.card.name}
                            fill
                            className="object-contain"
                            sizes="100px"
                          />
                        </div>
                      );
                    }
                    countIndex -= entry.count;
                  }

                  return (
                    <div
                      key={`share-empty-${index}`}
                      className="relative aspect-[3/4] rounded-lg bg-stone-700/30 border border-dashed border-stone-600"
                    />
                  );
                })}
              </div>

              {/* Stats Summary */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-stone-700/50">
                <div className="flex gap-6">
                  {Object.entries(deckStats.typeDistribution).slice(0, 4).map(([type, count]) => (
                    <div key={type} className="text-center">
                      <div className="text-lg font-bold text-white">{count}</div>
                      <div className="text-[10px] text-stone-400 capitalize">{type}</div>
                    </div>
                  ))}
                </div>
                {metaAnalysis && (
                  <div className="text-right">
                    <div className="text-sm font-bold text-amber-400">{metaAnalysis.archetype}</div>
                    <div className="text-[10px] text-stone-400">Meta Score: {metaAnalysis.score}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions - Outside shareable area */}
            <div className="p-4 bg-stone-900/80 border-t border-stone-700 flex flex-col sm:flex-row gap-3">
              <p className="text-xs text-stone-400 sm:flex-1">
                Screenshot this view or use the buttons to share your deck.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const deckText = `${deckName}\n${deckStats.totalCards}/20 cards\n\n${deck.map(e => `${e.card.name} x${e.count}`).join('\n')}\n\nBuilt with DexTrends`;
                    if (typeof navigator !== 'undefined' && navigator.share) {
                      try {
                        await navigator.share({
                          title: deckName,
                          text: deckText,
                        });
                      } catch (err) {
                        // User cancelled share
                      }
                    } else {
                      await navigator.clipboard.writeText(deckText);
                      alert('Deck copied to clipboard!');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
                <button
                  onClick={() => setShowShareView(false)}
                  className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {zoomedCard && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setZoomedCard(null)}
        >
          <div 
            className="relative max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomedCard(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-stone-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-white dark:bg-stone-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="relative aspect-[3/4]">
                <Image
                  src={zoomedCard.image || "/back-card.png"}
                  alt={zoomedCard.name}
                  fill
                  className="object-contain"
                  sizes="400px"
                  priority
                />
              </div>
              <div className="p-4 space-y-3">
                <h3 className="text-xl font-bold text-stone-900 dark:text-white">{zoomedCard.name}</h3>
                <div className="flex items-center gap-2">
                  {zoomedCard.type && (
                    <TypeBadge type={zoomedCard.type} size="sm" />
                  )}
                  {zoomedCard.health && (
                    <span className="px-2 py-1 bg-red-600 text-white text-sm font-bold rounded-full">
                      {zoomedCard.health} HP
                    </span>
                  )}
                  {zoomedCard.rarity && (
                    <span className="px-2 py-1 bg-purple-600 text-white text-sm font-bold rounded-full">
                      {zoomedCard.rarity}
                    </span>
                  )}
                </div>
                {zoomedCard.pack && (
                  <p className="text-sm text-stone-600 dark:text-stone-300">
                    Pack: <span className="font-medium">{zoomedCard.pack}</span>
                  </p>
                )}
                <button
                  onClick={() => {
                    if (getCardCountInDeck(zoomedCard.id) < MAX_COPIES_PER_CARD && !deckStats.isFull) {
                      addCardToDeck(zoomedCard);
                    }
                    setZoomedCard(null);
                  }}
                  disabled={getCardCountInDeck(zoomedCard.id) >= MAX_COPIES_PER_CARD || deckStats.isFull}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    getCardCountInDeck(zoomedCard.id) >= MAX_COPIES_PER_CARD || deckStats.isFull
                      ? 'bg-stone-200 dark:bg-stone-700 text-stone-400 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  {getCardCountInDeck(zoomedCard.id) >= MAX_COPIES_PER_CARD 
                    ? 'Max copies reached' 
                    : deckStats.isFull 
                      ? 'Deck is full'
                      : `Add to Deck (${getCardCountInDeck(zoomedCard.id)}/2)`
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deck Zoom Modal */}
      {deckZoomIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setDeckZoomIndex(null)}
        >
          <div 
            className="relative max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => {
                  const flatDeck = deck.flatMap(entry => Array(entry.count).fill(entry.card));
                  const prevIndex = deckZoomIndex > 0 ? deckZoomIndex - 1 : flatDeck.length - 1;
                  setDeckZoomIndex(prevIndex);
                }}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                disabled={deck.length === 0}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-white text-lg font-medium">
                {(() => {
                  const flatDeck = deck.flatMap(entry => Array(entry.count).fill(entry.card));
                  return `${deckZoomIndex + 1} / ${flatDeck.length}`;
                })()}
              </div>
              
              <button
                onClick={() => {
                  const flatDeck = deck.flatMap(entry => Array(entry.count).fill(entry.card));
                  const nextIndex = deckZoomIndex < flatDeck.length - 1 ? deckZoomIndex + 1 : 0;
                  setDeckZoomIndex(nextIndex);
                }}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                disabled={deck.length === 0}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Card Display */}
            {(() => {
              const flatDeck = deck.flatMap(entry => Array(entry.count).fill(entry.card));
              const currentCard = flatDeck[deckZoomIndex];
              
              if (!currentCard) return null;
              
              return (
                <div className="bg-white dark:bg-stone-800 rounded-xl overflow-hidden shadow-2xl">
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={currentCard.image || "/back-card.png"}
                      alt={currentCard.name}
                      fill
                      className="object-contain"
                      sizes="400px"
                      priority
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="text-xl font-bold text-stone-900 dark:text-white">{currentCard.name}</h3>
                    <div className="flex items-center gap-2">
                      {currentCard.type && (
                        <TypeBadge type={currentCard.type} size="sm" />
                      )}
                      {currentCard.health && (
                        <span className="px-2 py-1 bg-red-600 text-white text-sm font-bold rounded-full">
                          {currentCard.health} HP
                        </span>
                      )}
                      {currentCard.rarity && (
                        <span className="px-2 py-1 bg-purple-600 text-white text-sm font-bold rounded-full">
                          {currentCard.rarity}
                        </span>
                      )}
                    </div>
                    {currentCard.pack && (
                      <p className="text-sm text-stone-600 dark:text-stone-300">
                        Pack: <span className="font-medium">{currentCard.pack}</span>
                      </p>
                    )}
                    <button
                      onClick={() => {
                        removeCardFromDeck(currentCard.id);
                        // Update index if needed
                        const newFlatDeck = deck.flatMap(entry => Array(entry.count).fill(entry.card));
                        if (deckZoomIndex >= newFlatDeck.length && newFlatDeck.length > 0) {
                          setDeckZoomIndex(newFlatDeck.length - 1);
                        } else if (newFlatDeck.length === 0) {
                          setDeckZoomIndex(null);
                        }
                      }}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Remove from Deck
                    </button>
                  </div>
                </div>
              );
            })()}
            
            {/* Close button */}
            <button
              onClick={() => setDeckZoomIndex(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-stone-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Save/View Actions - Fixed above BottomNavigation */}
      <div
        className="lg:hidden fixed left-0 right-0 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 p-4 z-40"
        style={{ bottom: hasBottomNav ? BOTTOM_NAV_HEIGHT : 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-stone-900 dark:text-white">Actions</h3>
            <div className={`text-lg font-bold ${
              deckStats.isFull ? 'text-green-600' : 
              deckStats.totalCards > 15 ? 'text-yellow-600' : 
              'text-stone-600 dark:text-stone-300'
            }`}>
              {deckStats.totalCards}/{MAX_DECK_SIZE}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addDefaultCards}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg font-medium transition-colors"
            >
              + Starter
            </button>
            {!deckStats.isEmpty && (
              <button
                onClick={clearDeck}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        {/* Import/Export/Share buttons for mobile */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg font-medium transition-colors"
          >
            Import
          </button>
          {!deckStats.isEmpty && (
            <>
              <button
                onClick={() => setShowShareView(true)}
                className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Share
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Export
              </button>
            </>
          )}
        </div>
        
        {/* Horizontal scrolling deck preview */}
        {deck.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {deck.map((entry) => (
              Array.from({ length: entry.count }, (_, i) => (
                <div
                  key={`${entry.card.id}-${i}`}
                  onClick={() => removeCardFromDeck(entry.card.id)}
                  className="flex-shrink-0 w-12 cursor-pointer group"
                >
                  <div className="relative aspect-[3/4] bg-stone-100 dark:bg-stone-700 rounded overflow-hidden border border-stone-200 dark:border-stone-600 hover:border-red-500 transition-colors">
                    <Image
                      src={entry.card.image || "/back-card.png"}
                      alt={entry.card.name}
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  </div>
                </div>
              ))
            ))}
          </div>
        )}
      </div>

      {/* Add padding to prevent content from being hidden behind mobile deck bar + bottom nav */}
      <div
        className="lg:hidden"
        style={{ height: hasBottomNav ? 180 : 120 }}
      />

      <BackToTop />
      </div>
    </FullBleedWrapper>
  );
}

// Mark this page as full bleed to remove Layout padding
(DeckBuilder as any).fullBleed = true;

export default DeckBuilder;