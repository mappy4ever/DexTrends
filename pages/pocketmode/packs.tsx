import React, { useState, useEffect, useMemo } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { fetchPocketData } from '../../utils/pocketData';
import { TypeBadge } from '../../components/ui/TypeBadge';
import PackOpening from '../../components/ui/PackOpening';
import StyledBackButton from '../../components/ui/StyledBackButton';
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import logger from '../../utils/logger';
import type { PocketCard } from '../../types/api/pocket-cards';

// Extended PocketCard with additional properties used in packs
interface ExtendedPocketCard extends PocketCard {
  pack?: string;
  type?: string;
}

// Type definitions
interface Expansion {
  id: string;
  name: string;
  cards: PocketCard[];
  types: string[];
  rarities: string[];
  totalCards: number;
  featuredCards: PocketCard[];
  displayName: string;
  setCode: string;
  setName: string;
  releaseDate: string;
  description: string;
  theme: ExpansionTheme;
  packImage: string | null;
  packPrice: number;
  guaranteedRare: boolean;
}

interface ExpansionTheme {
  gradient: string;
  accentColor: string;
  emoji: string;
  bgPattern: string;
  glowColor: string;
}

interface RarityInfo {
  color: string;
  textColor: string;
  glow: string;
  border: string;
  bg: string;
  rarity: string;
}

const Expansions: NextPage = () => {
  const router = useRouter();
  
  // Data state
  const [allCards, setAllCards] = useState<ExtendedPocketCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [selectedExpansion, setSelectedExpansion] = useState<Expansion | null>(null);
  const [showPackOpening, setShowPackOpening] = useState(false);
  const [packOpenCount, setPackOpenCount] = useState(0);
  const [lastOpenedCards, setLastOpenedCards] = useState<ExtendedPocketCard[]>([]);
  const [packHistory, setPackHistory] = useState<Array<{
    expansion: string;
    cards: ExtendedPocketCard[];
    timestamp: number;
  }>>([]);
  
  // Load cards and pack history on component mount
  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true);
        const data = await fetchPocketData();
        setAllCards(data || []);
        
        // Load pack history from localStorage
        const savedHistory = localStorage.getItem('packOpeningHistory');
        if (savedHistory) {
          const history = JSON.parse(savedHistory);
          setPackHistory(history);
          setPackOpenCount(history.length);
        }
      } catch (err) {
        setError('Failed to load expansions');
        logger.error('Error loading pocket cards:', { error: err });
      } finally {
        setLoading(false);
      }
    };
    
    loadCards();
  }, []);

  // Generate expansion data from cards - excluding promo sets
  const expansions = useMemo((): Expansion[] => {
    if (!allCards.length) return [];
    
    const expansionMap: Record<string, {
      id: string;
      name: string;
      cards: ExtendedPocketCard[];
      types: Set<string>;
      rarities: Set<string>;
      totalCards: number;
      featuredCards: ExtendedPocketCard[];
    }> = {};
    
    // Filter out promo cards and redistribute shared cards to individual packs
    const mainSetCards = allCards.filter(card => {
      const packName = (card.pack || '').toLowerCase();
      // Exclude promo packs and small sets
      return !packName.includes('promo') && 
             !packName.includes('promotional') && 
             !packName.includes('special') &&
             !packName.includes('shop') &&
             !packName.includes('campaign') &&
             !packName.includes('premium') &&
             !packName.includes('wonder') &&
             packName !== 'unknown' &&
             packName !== '';
    });
    
    logger.debug('Cards loading summary:', { totalCards: allCards.length, mainSetCards: mainSetCards.length });
    
    // Redistribute shared cards to individual packs based on type
    const redistributedCards = mainSetCards.map(card => {
      if (card.pack === 'Shared(Genetic Apex)') {
        const cardType = (card.type || '').toLowerCase();
        
        // Redistribute based on type affinity
        if (['grass', 'psychic', 'darkness', 'dark'].includes(cardType)) {
          return { ...card, pack: 'Mewtwo' };
        } else if (['lightning', 'electric'].includes(cardType)) {
          return { ...card, pack: 'Pikachu' };
        } else if (['water', 'fighting', 'fire'].includes(cardType)) {
          return { ...card, pack: 'Charizard' };
        } else {
          // Colorless and other types - distribute evenly
          const hash = card.name.charCodeAt(0) % 3;
          const packs = ['Mewtwo', 'Pikachu', 'Charizard'];
          return { ...card, pack: packs[hash] };
        }
      }
      return card;
    });
    
    redistributedCards.forEach(card => {
      const packName = card.pack || 'Unknown';
      
      if (!expansionMap[packName]) {
        expansionMap[packName] = {
          id: packName.toLowerCase().replace(/\s+/g, '-'),
          name: packName,
          cards: [],
          types: new Set(),
          rarities: new Set(),
          totalCards: 0,
          featuredCards: []
        };
      }
      
      expansionMap[packName].cards.push(card);
      if (card.type) {
        expansionMap[packName].types.add(card.type);
      }
      expansionMap[packName].rarities.add(card.rarity);
      expansionMap[packName].totalCards++;
    });
    
    // Get only real expansions with sufficient card counts
    const realExpansions = Object.values(expansionMap).filter(expansion => {
      const name = expansion.name;
      const cardCount = expansion.totalCards;
      
      // Filter out shared and placeholder packs
      if (name.includes('Shared(') || 
          name.includes('PLACEHOLDER') ||
          name.includes('Extra Dimensional') ||
          name.includes('Space Time') ||
          name.includes('Celestial Guardian')) {
        return false;
      }
      
      // Log pack details for debugging
      logger.debug(`Pack details:`, { name, cardCount });
      
      // Keep all packs with at least 50 cards to ensure good variety
      return cardCount >= 50;
    });
    
    logger.debug('Real expansions found:', realExpansions.map(e => ({ name: e.name, totalCards: e.totalCards })));
    
    return realExpansions
    .filter(expansion => expansion.totalCards >= 20) // Adjusted threshold to match actual data
    .map(expansion => {
      // Get featured cards (rare cards for showcase)
      const rareCards = expansion.cards
        .filter(card => card.rarity.includes('★') || card.rarity.includes('◊◊◊'))
        .slice(0, 6);
      
      const featuredCards = rareCards.length > 0 ? rareCards : expansion.cards.slice(0, 6);
      
      return {
        ...expansion,
        types: Array.from(expansion.types),
        rarities: Array.from(expansion.rarities),
        featuredCards,
        displayName: getDisplayName(expansion.name),
        setCode: getSetCode(expansion.name),
        setName: getSetName(expansion.name),
        releaseDate: getExpansionReleaseDate(expansion.name),
        description: getExpansionDescription(expansion.name),
        theme: getExpansionTheme(expansion.name),
        packImage: getExpansionPackImage(expansion.name),
        packPrice: 5,
        guaranteedRare: true
      };
    }).sort((a, b) => {
      // Sort by set code order
      const order: Record<string, number> = {
        'A1': 1, 'A1a': 2, 'A2': 3, 'A2a': 4, 'A2b': 5, 'A3': 6, 'A3a': 7
      };
      return (order[a.setCode] || 999) - (order[b.setCode] || 999);
    });
  }, [allCards]);

  // Helper functions for expansion metadata
  function getExpansionReleaseDate(name: string): string {
    const releaseDates: Record<string, string> = {
      'Mewtwo': '2024-10-30',
      'Charizard': '2024-10-30', 
      'Pikachu': '2024-10-30'
    };
    return releaseDates[name] || '2024-10-30';
  }

  // Helper functions for clean expansion mapping
  function getDisplayName(name: string): string {
    const displayNames: Record<string, string> = {
      'Mewtwo': 'Mewtwo',
      'Charizard': 'Charizard',
      'Pikachu': 'Pikachu',
      'Mythical Island': 'Mew',
      'Dialga': 'Dialga',
      'Palkia': 'Palkia',
      'Triumphant Light': 'Arceus',
      'Shining Revelry': 'Shining Revelry',
      'Solgaleo': 'Solgaleo',
      'Lunala': 'Lunala',
      'Extradimensional Crisis': 'Buzzwole'
    };
    return displayNames[name] || name;
  }
  
  function getSetCode(name: string): string {
    const setCodes: Record<string, string> = {
      'Mewtwo': 'A1',
      'Charizard': 'A1',
      'Pikachu': 'A1',
      'Mythical Island': 'A1a',
      'Dialga': 'A2',
      'Palkia': 'A2',
      'Triumphant Light': 'A2a',
      'Shining Revelry': 'A2b',
      'Solgaleo': 'A3',
      'Lunala': 'A3',
      'Extradimensional Crisis': 'A3a'
    };
    return setCodes[name] || '';
  }
  
  function getSetName(name: string): string {
    const setNames: Record<string, string> = {
      'Mewtwo': 'Genetic Apex',
      'Charizard': 'Genetic Apex',
      'Pikachu': 'Genetic Apex',
      'Mythical Island': 'Mythical Island',
      'Dialga': 'Space-Time Smackdown',
      'Palkia': 'Space-Time Smackdown',
      'Triumphant Light': 'Triumphant Light',
      'Shining Revelry': 'Shining Revelry',
      'Solgaleo': 'Celestial Guardians',
      'Lunala': 'Celestial Guardians',
      'Extradimensional Crisis': 'Extradimensional Crisis'
    };
    return setNames[name] || name;
  }
  
  // Map expansion names to booster pack images - exact specifications only
  function getExpansionPackImage(name: string): string | null {
    const packImages: Record<string, string> = {
      // Genetic Apex (A1)
      'Mewtwo': '/images/PocketBoosterPacks/apexmewtwo.png',
      'Charizard': '/images/PocketBoosterPacks/apexcharizard.png', 
      'Pikachu': '/images/PocketBoosterPacks/apexpikachu.png',
      
      // Mythical Island (A1a)
      'Mythical Island': '/images/PocketBoosterPacks/mythicalisland.png',
      
      // Space-Time Smackdown (A2)
      'Dialga': '/images/PocketBoosterPacks/spacetimedialga.png',
      'Palkia': '/images/PocketBoosterPacks/spacetimepalkia.png',
      
      // Triumphant Light (A2a)
      'Triumphant Light': '/images/PocketBoosterPacks/triumphantlight.png',
      
      // Shining Revelry (A2b)
      'Shining Revelry': '/images/PocketBoosterPacks/shinningrivalrycharizard.png',
      
      // Eevee Grove (if we want to include it)
      'Eevee Grove': '/images/PocketBoosterPacks/eeveegrove2.png',
      
      // Celestial Guardians (A3)
      'Solgaleo': '/images/PocketBoosterPacks/celestialguardiansol.png',
      'Lunala': '/images/PocketBoosterPacks/celestialguardianlun.png',
      
      // Extradimensional Crisis (A3a)
      'Extradimensional Crisis': '/images/PocketBoosterPacks/extradimensionalcrisis.png'
    };
    return packImages[name] || null;
  }

  function getExpansionDescription(name: string): string {
    const descriptions: Record<string, string> = {
      'Mewtwo': 'Harness the psychic powers of the legendary Mewtwo and dominate with mind-bending abilities.',
      'Charizard': 'Unleash the fiery fury of Charizard and incinerate your opponents with blazing attacks.',
      'Pikachu': 'Channel the electric energy of Pikachu and shock your way to victory with lightning speed.',
      'Space Time Dialga': 'Master time itself with the temporal powers of the legendary Dialga.',
      'Space Time Palkia': 'Bend space and dimensions with the cosmic might of Palkia.',
      'Celestial Guardian': 'Harness the radiant power of Solgaleo, guardian of the sun.',
      'Celestial Guardian Luna': 'Embrace the mysterious lunar energy of Lunala, guardian of the moon.',
      'Triumphant Light': 'Illuminate your path to victory with brilliant light-type Pokemon.',
      'Shining Revelry': 'Experience the ultimate celebration with shining rare Pokemon cards.',
      'Mythical Island': 'Discover mystical Pokemon from the legendary Mythical Island.',
      'Eevee Grove': 'Explore the diverse evolutions of Eevee in this nature-themed expansion.',
      'Extradimensional Crisis': 'Battle across dimensions with ultra-rare interdimensional Pokemon.'
    };
    return descriptions[name] || `Discover the incredible power of ${name} in this exciting expansion.`;
  }

  function getExpansionTheme(name: string): ExpansionTheme {
    const themes: Record<string, ExpansionTheme> = {
      'Mewtwo': {
        gradient: 'from-purple-600 via-pink-600 to-purple-800',
        accentColor: 'purple',
        emoji: '🔮',
        bgPattern: 'radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)',
        glowColor: 'shadow-purple-500/50'
      },
      'Charizard': {
        gradient: 'from-red-600 via-orange-600 to-red-800',
        accentColor: 'red',
        emoji: '🔥',
        bgPattern: 'radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.3) 0%, transparent 50%)',
        glowColor: 'shadow-red-500/50'
      },
      'Pikachu': {
        gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
        accentColor: 'yellow',
        emoji: '⚡',
        bgPattern: 'radial-gradient(circle at 50% 80%, rgba(251, 191, 36, 0.3) 0%, transparent 50%)',
        glowColor: 'shadow-yellow-500/50'
      },
      'Triumphant Light': {
        gradient: 'from-yellow-300 via-white to-yellow-500',
        accentColor: 'yellow',
        emoji: '✨',
        bgPattern: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.3) 0%, transparent 50%)',
        glowColor: 'shadow-yellow-500/50'
      },
      'Shining Revelry': {
        gradient: 'from-red-500 via-orange-500 to-yellow-500',
        accentColor: 'orange',
        emoji: '🌟',
        bgPattern: 'radial-gradient(circle at 60% 40%, rgba(239, 68, 68, 0.3) 0%, transparent 50%)',
        glowColor: 'shadow-red-500/50'
      },
      'Mythical Island': {
        gradient: 'from-emerald-600 via-teal-600 to-emerald-800',
        accentColor: 'emerald',
        emoji: '🏝️',
        bgPattern: 'radial-gradient(circle at 60% 40%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
        glowColor: 'shadow-emerald-500/50'
      },
      'Eevee Grove': {
        gradient: 'from-green-500 via-emerald-500 to-green-700',
        accentColor: 'green',
        emoji: '🌳',
        bgPattern: 'radial-gradient(circle at 40% 60%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)',
        glowColor: 'shadow-green-500/50'
      },
      'Extradimensional Crisis': {
        gradient: 'from-violet-600 via-purple-600 to-indigo-800',
        accentColor: 'violet',
        emoji: '🌀',
        bgPattern: 'radial-gradient(circle at 30% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
        glowColor: 'shadow-violet-500/50'
      },
      'Solgaleo': {
        gradient: 'from-orange-500 via-yellow-500 to-orange-700',
        accentColor: 'orange',
        emoji: '☀️',
        bgPattern: 'radial-gradient(circle at 50% 30%, rgba(251, 146, 60, 0.3) 0%, transparent 50%)',
        glowColor: 'shadow-orange-500/50'
      },
      'Lunala': {
        gradient: 'from-purple-800 via-indigo-700 to-purple-900',
        accentColor: 'purple',
        emoji: '🌙',
        bgPattern: 'radial-gradient(circle at 40% 60%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)',
        glowColor: 'shadow-purple-500/50'
      },
      'Dialga': {
        gradient: 'from-blue-700 via-steel-600 to-blue-900',
        accentColor: 'blue',
        emoji: '⏰',
        bgPattern: 'radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
        glowColor: 'shadow-blue-500/50'
      },
      'Palkia': {
        gradient: 'from-pink-600 via-purple-600 to-pink-800',
        accentColor: 'pink',
        emoji: '🌌',
        bgPattern: 'radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
        glowColor: 'shadow-pink-500/50'
      }
    };
    return themes[name] || {
      gradient: 'from-blue-600 via-cyan-600 to-blue-800',
      accentColor: 'blue',
      emoji: '📦',
      bgPattern: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
      glowColor: 'shadow-blue-500/50'
    };
  }

  // Open pack with new clean component
  const openBoosterPack = (expansion: Expansion) => {
    setSelectedExpansion(expansion);
    setShowPackOpening(true);
  };

  // Handle pack opened callback
  const handlePackOpened = (cards: ExtendedPocketCard[]) => {
    setLastOpenedCards(cards);
    setPackOpenCount(prev => prev + 1);
    
    // Save to pack history
    if (selectedExpansion) {
      const newHistoryItem = {
        expansion: selectedExpansion.name,
        cards: cards,
        timestamp: Date.now()
      };
      
      const updatedHistory = [...packHistory, newHistoryItem];
      setPackHistory(updatedHistory);
      
      // Save to localStorage (keep last 100 packs)
      const historyToSave = updatedHistory.slice(-100);
      localStorage.setItem('packOpeningHistory', JSON.stringify(historyToSave));
    }
  };

  // Close pack opening modal
  const closePackOpening = () => {
    setShowPackOpening(false);
    setSelectedExpansion(null);
  };

  // Get rarity color and effects
  const getRarityInfo = (rarity: string): RarityInfo => {
    if (rarity.includes('★★')) return {
      color: 'from-yellow-400 to-yellow-600',
      textColor: 'text-black',
      glow: 'drop-shadow-lg shadow-yellow-400/50',
      border: 'border-yellow-400',
      bg: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      rarity: 'Crown Rare'
    };
    if (rarity.includes('★')) return {
      color: 'from-purple-500 to-purple-700',
      textColor: 'text-white',
      glow: 'drop-shadow-lg shadow-purple-500/50',
      border: 'border-purple-500',
      bg: 'bg-gradient-to-r from-purple-500 to-purple-700',
      rarity: 'EX Rare'
    };
    if (rarity.includes('◊◊◊◊')) return {
      color: 'from-pink-500 to-pink-700',
      textColor: 'text-white',
      glow: 'drop-shadow-md shadow-pink-500/50',
      border: 'border-pink-500',
      bg: 'bg-gradient-to-r from-pink-500 to-pink-700',
      rarity: 'Double Rare'
    };
    if (rarity.includes('◊◊◊')) return {
      color: 'from-blue-500 to-blue-700',
      textColor: 'text-white',
      glow: 'drop-shadow-md shadow-blue-500/50',
      border: 'border-blue-500',
      bg: 'bg-gradient-to-r from-blue-500 to-blue-700',
      rarity: 'Rare'
    };
    if (rarity.includes('◊◊')) return {
      color: 'from-green-500 to-green-700',
      textColor: 'text-white',
      glow: 'drop-shadow-sm shadow-green-500/50',
      border: 'border-green-500',
      bg: 'bg-gradient-to-r from-green-500 to-green-700',
      rarity: 'Uncommon'
    };
    return {
      color: 'from-gray-400 to-gray-600',
      textColor: 'text-white',
      glow: 'drop-shadow-sm',
      border: 'border-gray-400',
      bg: 'bg-gradient-to-r from-gray-400 to-gray-600',
      rarity: 'Common'
    };
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Expansions | Pokemon Pocket | DexTrends</title>
        </Head>
        <PageLoader text="Loading Expansions..." />
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Head>
          <title>Expansions | Pokemon Pocket | DexTrends</title>
        </Head>
        <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-12 text-center border border-red-500/20 shadow-2xl">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-3xl font-bold mb-4 text-red-400">Oops! Something went wrong</h2>
          <p className="text-gray-300 mb-8 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <Head>
        <title>Pack Opening | Pokemon Pocket | DexTrends</title>
        <meta name="description" content="Experience realistic Pokemon Pocket booster pack opening with authentic rarity rates" />
      </Head>
      {/* Clean Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border-color shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <StyledBackButton 
                variant="pocket" 
                text="Back to Pocket Mode"
                onClick={() => router.push('/pocketmode')}
              />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pokemon-red rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-dark-text">
                  Pack Opening
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-light-grey rounded-lg px-4 py-2 border border-border-color">
                <span className="text-sm font-medium text-text-grey">Packs Opened: </span>
                <span className="text-pokemon-red font-bold">{packOpenCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-pokemon-green/10 text-pokemon-green px-3 py-1 rounded-full text-sm font-medium border border-pokemon-green/20">
                  {expansions.length} Booster Packs
                </span>
              </div>
              {packHistory.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Clear pack opening history?')) {
                      setPackHistory([]);
                      setPackOpenCount(0);
                      localStorage.removeItem('packOpeningHistory');
                    }
                  }}
                  className="text-sm text-text-grey hover:text-pokemon-red transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Clean Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-pokemon-red mb-4">
            Booster Pack Opening
          </h2>
          <p className="text-lg text-text-grey max-w-2xl mx-auto leading-relaxed">
            Experience realistic Pokémon TCG Pocket pack opening with authentic rarity rates, 
            <span className="font-semibold text-dark-text"> guaranteed rare cards</span>, and 
            <span className="font-semibold text-dark-text"> smooth animations</span>.
          </p>
        </div>

        {/* Expansion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {expansions.map((expansion, index) => {
            return (
              <div
                key={expansion.id}
                className="group bg-white border border-border-color rounded-lg shadow-sm card-holographic overflow-hidden hover:shadow-lg hover:border-pokemon-red/20 transition-all duration-300"
                data-testid="pack-item"
              >
                {/* Pack Image - Vertical Showcase */}
                <div className="relative h-64 bg-light-grey rounded-t-lg overflow-hidden flex items-center justify-center">
                  {expansion.packImage ? (
                    <div className="relative w-32 h-48">
                      <Image
                        src={expansion.packImage}
                        alt={`${expansion.name} pack`}
                        fill
                        className="object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                        unoptimized={true} // Small pack images don't need optimization
                      />
                    </div>
                  ) : (
                    // Clean placeholder with rainbow indicator
                    (<div className="w-32 h-48 bg-gradient-to-br from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 flex items-center justify-center relative rounded-lg">
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-lg"></div>
                      <div className="relative z-10 text-center text-white">
                        <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mb-2 mx-auto">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <p className="font-semibold text-sm">PLACEHOLDER</p>
                        <p className="text-xs opacity-80">Rainbow = Temp</p>
                      </div>
                    </div>)
                  )}
                </div>
                {/* Pack Info */}
                <div className="p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-dark-text mb-2">{expansion.name}</h3>
                    <p className="text-text-grey text-sm leading-relaxed">
                      {expansion.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-light-grey rounded-lg p-3 text-center border border-border-color">
                      <div className="text-lg font-bold text-dark-text">
                        {expansion.totalCards}
                      </div>
                      <div className="text-xs text-text-grey">Total Cards</div>
                    </div>
                    <div className="bg-light-grey rounded-lg p-3 text-center border border-border-color">
                      <div className="text-lg font-bold text-dark-text">
                        {expansion.types.length}
                      </div>
                      <div className="text-xs text-text-grey">Types</div>
                    </div>
                  </div>

                  {/* Types Preview */}
                  <div className="mb-6">
                    <div className="text-sm font-semibold mb-2 text-dark-text">Featured Types</div>
                    <div className="flex flex-wrap justify-center gap-1">
                      {expansion.types.slice(0, 4).map(type => (
                        <TypeBadge key={type} type={type} size="sm" />
                      ))}
                      {expansion.types.length > 4 && (
                        <span className="bg-light-grey text-text-grey px-2 py-1 rounded-full text-xs border border-border-color">
                          +{expansion.types.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => openBoosterPack(expansion)}
                      disabled={showPackOpening}
                      className="w-full btn-primary py-3 font-semibold text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="open-pack"
                    >
                      {showPackOpening ? 'Opening Pack...' : 'Open Pack'}
                    </button>
                    
                    <Link href={`/pocketmode/expansions`}>
                      <button className="w-full btn-clean py-2 font-medium">
                        Browse Expansions
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pack Opening Statistics */}
        {packHistory.length > 0 && (
          <div className="bg-white rounded-lg border border-border-color shadow-sm p-8 mb-8">
            <h3 className="text-2xl font-bold text-dark-text mb-6 text-center">
              Your Pack Opening Stats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-light-grey rounded-lg p-4 text-center border border-border-color">
                <div className="text-2xl font-bold text-pokemon-red">{packOpenCount}</div>
                <div className="text-sm text-text-grey">Total Packs Opened</div>
              </div>
              <div className="bg-light-grey rounded-lg p-4 text-center border border-border-color">
                <div className="text-2xl font-bold text-pokemon-yellow">
                  {packHistory.reduce((acc, pack) => 
                    acc + pack.cards.filter(c => c.rarity?.includes('★') || c.rarity?.includes('◊◊◊')).length, 0
                  )}
                </div>
                <div className="text-sm text-text-grey">Rare Cards Pulled</div>
              </div>
              <div className="bg-light-grey rounded-lg p-4 text-center border border-border-color">
                <div className="text-2xl font-bold text-pokemon-blue">
                  {packOpenCount > 0 ? (Math.round((packHistory.reduce((acc, pack) => 
                    acc + pack.cards.filter(c => c.rarity?.includes('★') || c.rarity?.includes('◊◊◊')).length, 0
                  ) / packOpenCount) * 100) / 100) : 0}
                </div>
                <div className="text-sm text-text-grey">Avg Rares per Pack</div>
              </div>
              <div className="bg-light-grey rounded-lg p-4 text-center border border-border-color">
                <div className="text-2xl font-bold text-pokemon-green">
                  {Object.keys(packHistory.reduce((acc, pack) => {
                    acc[pack.expansion] = true;
                    return acc;
                  }, {} as Record<string, boolean>)).length}
                </div>
                <div className="text-sm text-text-grey">Different Packs Tried</div>
              </div>
            </div>
          </div>
        )}

        {/* Clean Feature Highlights */}
        <div className="bg-white rounded-lg border border-border-color shadow-sm p-8 text-center">
          <h3 className="text-2xl font-bold text-dark-text mb-6">
            Pack Opening Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group cursor-pointer hover:bg-light-grey p-4 rounded-lg transition-all">
              <div className="w-12 h-12 bg-pokemon-blue text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-dark-text">Authentic Experience</h4>
              <p className="text-text-grey text-sm">Experience realistic pack opening with distribution matching Pokemon Pocket cards</p>
            </div>
            <div className="group cursor-pointer hover:bg-light-grey p-4 rounded-lg transition-all">
              <div className="w-12 h-12 bg-pokemon-green text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1.5M9 21v-5a2 2 0 012-2h2a2 2 0 012 2v5" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-dark-text">Free & Fun</h4>
              <p className="text-text-grey text-sm">Open unlimited packs and discover new cards without any cost or limits</p>
            </div>
            <div className="group cursor-pointer hover:bg-light-grey p-4 rounded-lg transition-all">
              <div className="w-12 h-12 bg-pokemon-yellow text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-dark-text">Beautiful Animations</h4>
              <p className="text-text-grey text-sm">Enjoy smooth animations and satisfying card reveals with special effects</p>
            </div>
          </div>
        </div>
      </div>
      {/* Pack Opening Modal */}
      <PackOpening 
        expansion={selectedExpansion}
        availableCards={selectedExpansion?.cards || []}
        onPackOpened={handlePackOpened}
        onClose={closePackOpening}
        isOpen={showPackOpening}
      />
    </div>
  );
};

export default Expansions;