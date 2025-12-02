import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { fetchPocketData } from '../../../utils/pocketData';
import StyledBackButton from '../../../components/ui/StyledBackButton';
import { createGlassStyle, GradientButton, CircularButton } from '../../../components/ui/design-system';
import { UnifiedSearchBar, EmptyStateGlass, LoadingStateGlass } from '../../../components/ui/glass-components';
import { FaCrown } from 'react-icons/fa';
import FullBleedWrapper from '../../../components/ui/FullBleedWrapper';
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import PocketCardList from '../../../components/PocketCardList';
import type { PocketCard } from '../../../types/api/pocket-cards';
import logger from '../../../utils/logger';

// Extended PocketCard type with additional properties from actual data
interface ExtendedPocketCard extends PocketCard {
  pack?: string;
  type?: string;
  health?: string | number;
  ex?: "Yes" | "No";
  fullart?: "Yes" | "No";
}

interface SetInfo {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cardCount: number;
}

// Set themes with pastel colors matching the app theme
const setThemes: Record<string, { name: string; description: string; emoji: string }> = {
  'genetic-apex': {
    name: 'Genetic Apex',
    description: 'The first expansion set for Pokémon TCG Pocket featuring legendary Pokémon.',
    emoji: '🧬'
  },
  'mythical-island': {
    name: 'Mythical Island',
    description: 'Discover mystical Pokémon from the legendary Mythical Island.',
    emoji: '🏝️'
  },
  'space-time-smackdown': {
    name: 'Space-Time Smackdown',
    description: 'Master time and space with the legendary powers of Dialga and Palkia.',
    emoji: '⏰'
  },
  'triumphant-light': {
    name: 'Triumphant Light',
    description: 'Illuminate your path to victory with brilliant light-type Pokémon.',
    emoji: '✨'
  },
  'shining-revelry': {
    name: 'Shining Revelry',
    description: 'Experience the ultimate rivalry with shining rare Pokémon cards.',
    emoji: '🌟'
  },
  'celestial-guardians': {
    name: 'Celestial Guardians',
    description: 'Harness the celestial powers of the sun and moon guardians.',
    emoji: '🌙'
  },
  'extradimensional-crisis': {
    name: 'Extradimensional Crisis',
    description: 'Battle across dimensions with ultra-rare interdimensional Pokémon.',
    emoji: '🌀'
  },
  'eevee-grove': {
    name: 'Eevee Grove',
    description: 'Celebrate the evolution possibilities with Eevee and all its evolutions.',
    emoji: '🦊'
  },
  'promo-a': {
    name: 'Promo Cards',
    description: 'Exclusive promotional cards available through special events and campaigns.',
    emoji: '🎁'
  }
};

function SetView() {
  const router = useRouter();
  const { setId } = router.query;
  
  // Data state
  const [allCards, setAllCards] = useState<ExtendedPocketCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setInfo, setSetInfo] = useState<SetInfo | null>(null);
  const [search, setSearch] = useState<string>('');
  
  // Load cards and set info on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!setId || typeof setId !== 'string') return;
      logger.debug('SetView loading set', { setId });
      
      // Handle old URL format (e.g., a2b-107) by redirecting to the expansion page
      if (/^[a-z]\d+[a-z]?-\d+$/i.test(setId)) {
        const expansionCode = setId.split('-')[0].toLowerCase();
        const expansionMapping: Record<string, string> = {
          'a1': 'genetic-apex',
          'a1a': 'mythical-island', 
          'a2': 'space-time-smackdown',
          'a2a': 'triumphant-light',
          'a2b': 'shining-revelry',
          'a3': 'celestial-guardians',
          'a3a': 'extradimensional-crisis',
          'a4': 'eevee-grove',
          'pa': 'promo-a'
        };
        
        const correctSetName = expansionMapping[expansionCode] || expansionCode;
        router.replace(`/pocketmode/set/${correctSetName}`);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Load cards data
        const cards = await fetchPocketData() as ExtendedPocketCard[];
        logger.debug('SetView cards loaded', { setId, totalCards: cards.length });
        
        // Get set theme info
        const theme = setThemes[setId] || {
          name: setId.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          description: 'Browse cards from this Pokémon TCG Pocket expansion.',
          emoji: '📦'
        };
        
        // Filter cards based on set
        const setCards = filterCardsBySet(cards, setId);
        
        setAllCards(setCards);
        setSetInfo({
          id: setId,
          name: theme.name,
          description: theme.description,
          emoji: theme.emoji,
          cardCount: setCards.length
        });
        
        setLoading(false);
      } catch (err) {
        logger.error("Error loading set data:", err);
        setError("Failed to load expansion data");
        setLoading(false);
      }
    };
    
    loadData();
  }, [setId, router]);
  
  // Filter cards based on set ID
  const filterCardsBySet = (cards: ExtendedPocketCard[], setId: string): ExtendedPocketCard[] => {
    // Map set names to pack names
    const packMappings: Record<string, string[]> = {
      'genetic-apex': ['Mewtwo', 'Charizard', 'Pikachu'],
      'mythical-island': ['Mythical Island'],
      'space-time-smackdown': ['Dialga', 'Palkia'],
      'triumphant-light': ['Triumphant Light'],
      'shining-revelry': ['Shining Revelry'],
      'celestial-guardians': ['Solgaleo', 'Lunala'],
      'extradimensional-crisis': ['Extradimensional Crisis'],
      'eevee-grove': ['Eevee Grove'],
      'promo-a': [] // Promo cards filtered differently
    };
    
    const packNames = packMappings[setId] || [];
    
    if (setId === 'promo-a') {
      // Filter promo cards
      return cards.filter((card: ExtendedPocketCard) => {
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
    
    // Filter by pack names
    const filtered = cards.filter((card: ExtendedPocketCard) => 
      packNames.includes(card.pack || '')
    );
    
    // Remove duplicates based on card ID
    return Array.from(new Map(filtered.map(card => [card.id, card])).values());
  };

  if (loading) {
    return (
      <FullBleedWrapper gradient="pokedex">
        <div className="min-h-screen flex items-center justify-center">
          <LoadingStateGlass 
            type="spinner" 
            message="Loading expansion cards..."
            size="lg"
          />
        </div>
      </FullBleedWrapper>
    );
  }

  if (error) {
    return (
      <FullBleedWrapper gradient="pokedex">
        <div className="min-h-screen flex items-center justify-center">
          <EmptyStateGlass 
            type="error"
            title="Failed to Load Expansion"
            message={error}
            actionButton={{
              text: "Back to Expansions",
              onClick: () => router.push('/pocketmode/expansions'),
              variant: "primary"
            }}
            className="max-w-md"
          />
        </div>
      </FullBleedWrapper>
    );
  }

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>{setInfo?.name || 'Loading'} | Pokémon Pocket | DexTrends</title>
        <meta name="description" content={setInfo?.description || 'Browse Pokémon TCG Pocket cards'} />
      </Head>
      
      <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto pt-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Back Button */}
          <div className="mb-6">
            <StyledBackButton 
              variant="pocket" 
              text="Back to Expansions"
              onClick={() => router.push('/pocketmode/expansions')}
            />
          </div>
          
          {/* Enhanced Set Header with Glass Morphism */}
          {setInfo && (
            <motion.div 
              className={`${createGlassStyle({
                blur: 'xl',
                opacity: 'medium',
                gradient: true,
                border: 'medium',
                shadow: 'xl',
                rounded: 'xl'
              })} p-6 md:p-8 rounded-xl`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-6">
                <motion.div 
                  className="inline-flex items-center gap-3 mb-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <span className="text-3xl">{setInfo.emoji}</span>
                  <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                    {setInfo.name}
                  </h1>
                </motion.div>
                <motion.p
                  className="text-sm text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {setInfo.description}
                </motion.p>
              </div>
              
              {/* Enhanced Stats Pills */}
              <motion.div 
                className="flex justify-center gap-3 flex-wrap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className={`${createGlassStyle({
                  blur: 'md',
                  opacity: 'subtle',
                  gradient: true,
                  border: 'subtle',
                  shadow: 'md',
                  rounded: 'full'
                })} px-4 py-2`}>
                  <span className="text-sm font-bold bg-gradient-to-r from-amber-600 to-pink-600 bg-clip-text text-transparent">
                    {setInfo.cardCount} Cards
                  </span>
                </div>
                
                <div className={`${createGlassStyle({
                  blur: 'md',
                  opacity: 'subtle',
                  gradient: true,
                  border: 'subtle',
                  shadow: 'md',
                  rounded: 'full'
                })} px-4 py-2`}>
                  <span className="text-sm font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {[...new Set(allCards.map(c => c.type).filter(Boolean))].length} Types
                  </span>
                </div>
                
                <div className={`${createGlassStyle({
                  blur: 'md',
                  opacity: 'subtle',
                  gradient: true,
                  border: 'subtle',
                  shadow: 'md',
                  rounded: 'full'
                })} px-4 py-2`}>
                  <span className="text-sm font-bold bg-gradient-to-r from-pink-600 to-amber-600 bg-clip-text text-transparent">
                    {[...new Set(allCards.map(c => c.rarity).filter(Boolean))].length} Rarities
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Enhanced Cards Display with Glass Morphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Glass Container for Cards */}
          <div className={`${createGlassStyle({
            blur: 'xl',
            opacity: 'medium',
            gradient: true,
            border: 'medium',
            shadow: 'xl',
            rounded: 'xl'
          })} p-6 md:p-8 rounded-xl`}>
            {/* Search Bar with Glass Styling */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <UnifiedSearchBar
                value={search}
                onChange={setSearch}
                placeholder={`Search ${setInfo?.name || 'expansion'} cards...`}
                className="w-full"
                showSearchButton
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              {allCards.filter(card => 
                card.name.toLowerCase().includes(search.toLowerCase())
              ).length === 0 ? (
                <EmptyStateGlass 
                  type="search"
                  title="No Cards Found"
                  message={search 
                    ? `No cards match "${search}" in ${setInfo?.name || 'this expansion'}.`
                    : `No cards found in ${setInfo?.name || 'this expansion'}.`
                  }
                  actionButton={search ? {
                    text: "Clear Search",
                    onClick: () => setSearch(''),
                    variant: "secondary"
                  } : undefined}
                />
              ) : (
                <PocketCardList 
                  cards={allCards.filter(card => 
                    card.name.toLowerCase().includes(search.toLowerCase())
                  )}
                  loading={false}
                  error={undefined}
                  emptyMessage={`No cards found in ${setInfo?.name || 'this expansion'}.`}
                  showPack={false}
                  showRarity={true}
                  showHP={true}
                  showSort={true}
                  imageWidth={110}
                  imageHeight={154}
                  selectedRarityFilter="all"
                  searchValue={search}
                  onSearchChange={setSearch}
                />
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </FullBleedWrapper>
  );
}

// Mark this page as full bleed to remove Layout padding
(SetView as any).fullBleed = true;

export default SetView;