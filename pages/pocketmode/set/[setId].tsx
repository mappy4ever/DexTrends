import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { fetchPocketData } from '../../../utils/pocketData';
import StyledBackButton from '../../../components/ui/StyledBackButton';
import { GlassContainer } from '../../../components/ui/design-system/GlassContainer';
import { FaCrown } from 'react-icons/fa';
import FullBleedWrapper from '../../../components/ui/FullBleedWrapper';
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import PocketCardList from '../../../components/PocketCardList';
import type { PocketCard } from '../../../types/api/pocket-cards';
import logger from '../../../utils/logger';

// Extended PocketCard type with additional properties from actual data
interface ExtendedPocketCard extends Omit<PocketCard, 'rarity' | 'hp'> {
  pack?: string;
  type?: string;
  rarity?: string;
  hp?: string;
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
    return <PageLoader text="Loading expansion cards..." />;
  }

  if (error) {
    return (
      <FullBleedWrapper gradient="tcg">
        <div className="min-h-screen flex items-center justify-center">
          <GlassContainer variant="colored" className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button 
              onClick={() => router.push('/pocketmode/expansions')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Back to Expansions
            </button>
          </GlassContainer>
        </div>
      </FullBleedWrapper>
    );
  }

  return (
    <FullBleedWrapper gradient="tcg">
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
          
          {/* Set Info Card with Compact Glass Morphism */}
          {setInfo && (
            <motion.div 
              className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-3xl p-4 border border-white/50 dark:border-gray-700/50 shadow-2xl shadow-gray-400/30 dark:shadow-black/50"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-3">
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="text-2xl">{setInfo.emoji}</span>
                  <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    {setInfo.name}
                  </h1>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  {setInfo.description}
                </p>
              </div>
              
              {/* Stats Pills - Compact */}
              <div className="flex justify-center gap-2 flex-wrap">
                <div className="px-3 py-1 backdrop-blur-xl bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full border border-white/50">
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    {setInfo.cardCount} Cards
                  </span>
                </div>
                
                <div className="px-3 py-1 backdrop-blur-xl bg-gradient-to-r from-blue-100/80 to-purple-100/80 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full border border-white/50">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    {[...new Set(allCards.map(c => c.type).filter(Boolean))].length} Types
                  </span>
                </div>
                
                <div className="px-3 py-1 backdrop-blur-xl bg-gradient-to-r from-pink-100/80 to-purple-100/80 dark:from-pink-900/30 dark:to-purple-900/30 rounded-full border border-white/50">
                  <span className="text-xs font-semibold text-pink-700 dark:text-pink-300">
                    {[...new Set(allCards.map(c => c.rarity).filter(Boolean))].length} Rarities
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Cards Display using PocketCardList */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Glass Container for Cards - Simplified */}
          <div className="bg-gray-200/60 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-2xl">
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
          </div>
        </motion.div>
      </div>
    </FullBleedWrapper>
  );
}

// Mark this page as full bleed to remove Layout padding
(SetView as any).fullBleed = true;

export default SetView;