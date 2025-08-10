import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { fetchPocketData } from '../../../utils/pocketData';
import { TypeBadge } from '../../../components/ui/TypeBadge';
import StyledBackButton from '../../../components/ui/StyledBackButton';
import { fetchJSON } from '../../../utils/unifiedFetch';
import { GlassContainer } from '../../../components/ui/design-system/GlassContainer';
import { GradientButton } from '../../../components/ui/design-system/GradientButton';
import FullBleedWrapper from '../../../components/ui/FullBleedWrapper';
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import { useDebounce } from '../../../hooks/useDebounce';
import type { PocketCard } from '../../../types/api/pocket-cards';
import logger from '../../../utils/logger';

// Extended PocketCard type with additional properties from actual data
interface ExtendedPocketCard extends Omit<PocketCard, 'rarity' | 'hp'> {
  pack?: string;
  type?: string;
  rarity?: string; // Override to string as actual data uses string
  hp?: string; // Override to string as actual data uses string
}

interface SetInfo {
  id: string;
  name: string;
  description: string;
}

interface SetTheme {
  gradient: string;
  emoji: string;
  name: string;
}

interface FilterOptions {
  types: string[];
  rarities: string[];
}

function SetView() {
  const router = useRouter();
  const { setId } = router.query;
  
  // Data state
  const [allCards, setAllCards] = useState<ExtendedPocketCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setInfo, setSetInfo] = useState<SetInfo | null>(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Load cards and set info on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!setId || typeof setId !== 'string') return;
      logger.debug('SetView loading set', { setId });
      
      // Handle old URL format (e.g., a2b-107) by redirecting to the expansion page
      if (/^[a-z]\d+[a-z]?-\d+$/i.test(setId)) {
        // Extract the expansion code (e.g., a2b from a2b-107)
        const expansionCode = setId.split('-')[0].toLowerCase();
        
        // Map old expansion codes to correct set names
        const expansionMapping: Record<string, string> = {
          'a1': 'genetic-apex',
          'a1a': 'mythical-island', 
          'a2': 'space-time-smackdown',
          'a2a': 'triumphant-light',
          'a2b': 'shining-revelry', // Fix: a2b should redirect to shining-revelry
          'a3': 'celestial-guardians',
          'a3a': 'extradimensional-crisis'
        };
        
        const correctSetName = expansionMapping[expansionCode] || expansionCode;
        router.replace(`/pocketmode/set/${correctSetName}`);
        return;
      }
      
      try {
        setLoading(true);
        
        // Load cards data
        const cards = await fetchPocketData() as ExtendedPocketCard[];
        logger.debug('SetView cards loaded', { setId, totalCards: cards.length });
        logger.debug('SetView sample pack names', { 
          setId, 
          samplePackNames: [...new Set(cards.slice(0, 20).map((c: { pack?: string }) => c.pack))].filter(Boolean) 
        });
        setAllCards(cards || []);
        
        // Load set information from API
        try {
          const expansions = await fetchJSON<SetInfo[]>("/api/pocket-expansions", {
            useCache: true,
            cacheTime: 10 * 60 * 1000, // Cache for 10 minutes (stable data)
            timeout: 5000,
            retries: 2
          });
          const currentSet = expansions?.find((exp: SetInfo) => exp.id === setId);
          setSetInfo(currentSet || null);
        } catch (error) {
          logger.warn('Failed to load set information', { setId, error: error.message });
        }
        
      } catch (err) {
        setError('Failed to load set data');
        logger.error('Error loading set data', { setId, error: err.message, stack: err.stack });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [setId, router]);

  // Filter cards for this set
  const setCards = useMemo(() => {
    if (!allCards.length || !setId || typeof setId !== 'string') return [];
    
    // Debug: Log unique pack names to understand data structure
    const uniquePacks = [...new Set(allCards.map(card => card.pack).filter(Boolean))];
    logger.debug('Available pack names in data', { uniquePacks: uniquePacks.slice(0, 20), totalPacks: uniquePacks.length });
    
    // Map set IDs to pack names - handle multiple formats
    const setNameMap: Record<string, string[]> = {
      // Genetic Apex packs
      'mewtwo': ['Mewtwo'],
      'charizard': ['Charizard'], 
      'pikachu': ['Pikachu'],
      'genetic-apex': ['Mewtwo', 'Charizard', 'Pikachu', 'Shared(Genetic Apex)'],
      'a1': ['Mewtwo', 'Charizard', 'Pikachu', 'Shared(Genetic Apex)'],
      
      // Mythical Island
      'mythical-island': ['Mythical Island'],
      'a1a': ['Mythical Island'],
      
      // Space-Time Smackdown
      'space-time-smackdown': ['Dialga', 'Palkia'],
      'a2': ['Dialga', 'Palkia'],
      'dialga': ['Dialga'],
      'palkia': ['Palkia'],
      
      // Other expansions
      'triumphant-light': ['Triumphant Light'],
      'a2a': ['Triumphant Light'],
      'shining-revelry': ['Shining Revelry'],
      'a2b': ['Shining Revelry'],
      'celestial-guardians': ['Solgaleo', 'Lunala'],
      'a3': ['Solgaleo', 'Lunala'],
      'extradimensional-crisis': ['Extradimensional Crisis'],
      'a3a': ['Extradimensional Crisis'],
      'eevee-grove': ['Eevee Grove'],
      'promo-a': ['Promo-A', 'Premium Tournament Collection - Gengar ex', 'Launch Promo-A', 
                   'Oversized Card Binder Pack Opening Promo-A', 'Player Rewards Program Promo-A',
                   'Shop Promo-A', 'Premium Tournament Collection - Emblem (Fire)', 
                   'Premium Tournament Collection - Emblem (Grass)', 'Premium Tournament Collection - Emblem (Lightning)',
                   'Premium Tournament Collection - Emblem (Psychic)', 'Premium Tournament Collection - Emblem (Water)',
                   'Premium Pass (Premium) Promo-A', 'Special Campaign Promo-A', 'Wonder Pick Promo-A']
    };
    
    const packNames = setNameMap[setId] || [];
    
    // First try exact match
    let filteredCards = allCards.filter(card => packNames.includes(card.pack || ''));
    
    // If no cards found, try case-insensitive and partial matching
    if (filteredCards.length === 0 && packNames.length > 0) {
      const lowerPackNames = packNames.map(p => p.toLowerCase());
      filteredCards = allCards.filter(card => {
        const cardPack = (card.pack || '').toLowerCase();
        // Check if card pack contains any of the expected pack names
        return lowerPackNames.some(packName => 
          cardPack.includes(packName) || packName.includes(cardPack)
        );
      });
    }
    
    // If still no cards and it's a promo set, include all promo cards
    if (filteredCards.length === 0 && setId === 'promo-a') {
      filteredCards = allCards.filter(card => {
        const packName = (card.pack || '').toLowerCase();
        return packName.includes('promo') || 
               packName.includes('promotional') || 
               packName.includes('special') ||
               packName.includes('shop') ||
               packName.includes('campaign') ||
               packName.includes('premium') ||
               packName.includes('wonder');
      });
    }
    
    // Remove duplicates based on card ID
    const uniqueCards = Array.from(new Map(filteredCards.map(card => [card.id, card])).values());
    
    logger.debug('SetView cards filtered', { 
      setId, 
      filteredCount: uniqueCards.length, 
      packNames,
      sampleCards: uniqueCards.slice(0, 5).map(c => ({ id: c.id, name: c.name, pack: c.pack }))
    });
    return uniqueCards;
  }, [allCards, setId]);

  // Get unique values for filters
  const filterOptions = useMemo((): FilterOptions => {
    if (!setCards.length) return { types: [], rarities: [] };
    
    const types = [...new Set(setCards.map(card => card.type).filter((t): t is string => Boolean(t)))].sort();
    const rarities = [...new Set(setCards.map(card => card.rarity).filter(Boolean))].sort() as string[];
    
    return { types, rarities };
  }, [setCards]);

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let filtered = setCards.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || card.type === selectedType;
      const matchesRarity = !selectedRarity || card.rarity === selectedRarity;
      
      return matchesSearch && matchesType && matchesRarity;
    });
    
    // Sort cards
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        case 'health':
          return parseInt(b.hp || '0', 10) - parseInt(a.hp || '0', 10);
        case 'rarity':
          return (a.rarity || '').localeCompare(b.rarity || '');
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [setCards, searchTerm, selectedType, selectedRarity, sortBy]);

  // Get set theme
  const getSetTheme = (setId: string | undefined): SetTheme => {
    const themes: Record<string, SetTheme> = {
      'mewtwo': {
        gradient: 'from-purple-600 via-pink-600 to-purple-800',
        emoji: '🔮',
        name: 'Genetic Apex: Mewtwo'
      },
      'charizard': {
        gradient: 'from-red-600 via-orange-600 to-red-800',
        emoji: '🔥',
        name: 'Genetic Apex: Charizard'
      },
      'pikachu': {
        gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
        emoji: '⚡',
        name: 'Genetic Apex: Pikachu'
      }
    };
    return themes[setId || ''] || {
      gradient: 'from-blue-600 via-cyan-600 to-blue-800',
      emoji: '📦',
      name: 'Unknown Set'
    };
  };

  const theme = getSetTheme(setId as string);

  // Pokemon Pocket style rarity colors
  const getRarityColor = (rarity: string | undefined): string => {
    if (!rarity) return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    if (rarity.includes('★★')) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
    if (rarity.includes('★')) return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white';
    if (rarity.includes('◊◊◊◊')) return 'bg-gradient-to-r from-pink-500 to-pink-700 text-white';
    if (rarity.includes('◊◊◊')) return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white';
    if (rarity.includes('◊◊')) return 'bg-gradient-to-r from-green-500 to-green-700 text-white';
    return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Head>
          <title>Loading Set | Pokemon Pocket | DexTrends</title>
        </Head>
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-2xl font-bold text-white mb-2">Loading Set...</h3>
          <p className="text-gray-300">Preparing card collection</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Head>
          <title>Error | Pokemon Pocket | DexTrends</title>
        </Head>
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <Head>
        <title>{theme.name} | Pokemon Pocket | DexTrends</title>
        <meta name="description" content={`Browse all cards from ${theme.name} in Pokemon Pocket`} />
      </Head>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <StyledBackButton 
                variant="pocket" 
                text="Back to Packs"
                onClick={() => router.push('/pocketmode/expansions')}
                className="text-yellow-400 hover:text-yellow-300"
              />
              <div className="flex items-center gap-3">
                <div className="text-4xl animate-bounce">{theme.emoji}</div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                  {theme.name}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <span className="text-sm font-medium">Total Cards: </span>
                <span className="text-yellow-400 font-bold">{setCards.length}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <span className="text-sm font-medium">Showing: </span>
                <span className="text-yellow-400 font-bold">{filteredCards.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Set Description */}
        {setInfo && (
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                {setInfo.name}
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6">
                {setInfo.description}
              </p>
              
              {/* Set Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`bg-gradient-to-r ${theme.gradient} bg-opacity-20 rounded-xl p-4 border border-white/10`}>
                  <div className="text-2xl font-bold text-white">{setCards.length}</div>
                  <div className="text-sm text-gray-300">Total Cards</div>
                </div>
                <div className={`bg-gradient-to-r ${theme.gradient} bg-opacity-20 rounded-xl p-4 border border-white/10`}>
                  <div className="text-2xl font-bold text-white">{filterOptions.types.length}</div>
                  <div className="text-sm text-gray-300">Types</div>
                </div>
                <div className={`bg-gradient-to-r ${theme.gradient} bg-opacity-20 rounded-xl p-4 border border-white/10`}>
                  <div className="text-2xl font-bold text-white">{filterOptions.rarities.length}</div>
                  <div className="text-sm text-gray-300">Rarities</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-black/50 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {filterOptions.types.map(type => (
                <option key={type} value={type} className="bg-gray-800">{type}</option>
              ))}
            </select>
            
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Rarities</option>
              {filterOptions.rarities.map(rarity => (
                <option key={rarity} value={rarity} className="bg-gray-800">{rarity}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name" className="bg-gray-800">Sort by Name</option>
              <option value="type" className="bg-gray-800">Sort by Type</option>
              <option value="health" className="bg-gray-800">Sort by Health</option>
              <option value="rarity" className="bg-gray-800">Sort by Rarity</option>
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

          {/* Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassContainer variant="light">
              <h2 className="text-2xl font-bold mb-4">
                Cards ({filteredCards.length} {filteredCards.length !== setCards.length && `of ${setCards.length}`})
              </h2>
              
              {filteredCards.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold mb-4">No cards found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredCards.map((card) => (
                    <Link key={card.id} href={`/pocketmode/${card.id}`}>
                      <motion.div 
                        className="group glass-light rounded-2xl p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-200 hover:scale-105 cursor-pointer"
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative w-full aspect-[3/4] mb-3 overflow-hidden rounded-lg">
                          <Image
                            src={card.image || "/dextrendslogo.png"}
                            alt={card.name}
                            fill
                            className="object-contain transition-transform duration-200 group-hover:scale-110"
                            loading="lazy"
                            sizes="(max-width: 640px) 150px, (max-width: 768px) 120px, 100px"
                          />
                        </div>
                        
                        <div className="text-center">
                          <h4 className="font-medium text-sm mb-2 line-clamp-2">{card.name}</h4>
                          
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <TypeBadge type={card.type || ''} size="sm" />
                          </div>
                          
                          <div className="text-xs mb-2">
                            <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRarityColor(card.rarity)}`}>
                              {card.rarity}
                            </div>
                            {card.hp && (
                              <div className="text-gray-600 dark:text-gray-400 mt-1">HP: {card.hp}</div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCards.map((card) => (
                    <Link key={card.id} href={`/pocketmode/${card.id}`}>
                      <motion.div 
                        className="group glass-light rounded-2xl p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-200 cursor-pointer"
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-20 flex-shrink-0">
                            <Image
                              src={card.image || "/dextrendslogo.png"}
                              alt={card.name}
                              fill
                              className="object-contain rounded"
                              sizes="64px"
                            />
                          </div>
                          
                          <div className="flex-grow">
                            <h4 className="font-medium text-lg mb-1">{card.name}</h4>
                            <div className="flex items-center gap-3 mb-2">
                              <TypeBadge type={card.type || ''} size="sm" />
                              <span className={`text-xs px-2 py-1 rounded font-medium ${getRarityColor(card.rarity)}`}>
                                {card.rarity}
                              </span>
                              {card.hp && (
                                <span className="text-gray-600 dark:text-gray-400 text-sm">HP: {card.hp}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </GlassContainer>
          </motion.div>
      </div>
    </div>
  );
}

// Mark this page as full bleed to remove Layout padding
(SetView as any).fullBleed = true;

export default SetView;