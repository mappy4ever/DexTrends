import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { fetchPocketData } from '../../utils/pocketData';
import { TypeBadge } from '../../components/ui/TypeBadge';

export default function Expansions() {
  const router = useRouter();
  
  // Data state
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [selectedExpansion, setSelectedExpansion] = useState(null);
  const [showPackModal, setShowPackModal] = useState(false);
  const [packOpeningCards, setPackOpeningCards] = useState([]);
  const [isOpeningPack, setIsOpeningPack] = useState(false);
  const [packAnimation, setPackAnimation] = useState('idle'); // idle, shaking, opening, revealing
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [packOpenCount, setPackOpenCount] = useState(0);
  const [rareCardFound, setRareCardFound] = useState(false);
  
  // Load cards on component mount
  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true);
        const data = await fetchPocketData();
        setAllCards(data || []);
      } catch (err) {
        setError('Failed to load expansions');
        console.error('Error loading pocket cards:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadCards();
  }, []);

  // Generate expansion data from cards
  const expansions = useMemo(() => {
    if (!allCards.length) return [];
    
    const expansionMap = {};
    
    allCards.forEach(card => {
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
      expansionMap[packName].types.add(card.type);
      expansionMap[packName].rarities.add(card.rarity);
      expansionMap[packName].totalCards++;
    });
    
    // Convert to array and add additional metadata
    return Object.values(expansionMap).map(expansion => {
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
        releaseDate: getExpansionReleaseDate(expansion.name),
        description: getExpansionDescription(expansion.name),
        theme: getExpansionTheme(expansion.name),
        packPrice: 5,
        guaranteedRare: true
      };
    }).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
  }, [allCards]);

  // Helper functions for expansion metadata
  function getExpansionReleaseDate(name) {
    const releaseDates = {
      'Mewtwo': '2024-10-30',
      'Charizard': '2024-10-30', 
      'Pikachu': '2024-10-30'
    };
    return releaseDates[name] || '2024-10-30';
  }

  function getExpansionDescription(name) {
    const descriptions = {
      'Mewtwo': 'Harness the psychic powers of the legendary Mewtwo and dominate with mind-bending abilities.',
      'Charizard': 'Unleash the fiery fury of Charizard and incinerate your opponents with blazing attacks.',
      'Pikachu': 'Channel the electric energy of Pikachu and shock your way to victory with lightning speed.'
    };
    return descriptions[name] || `Discover the incredible power of ${name} in this exciting expansion.`;
  }

  function getExpansionTheme(name) {
    const themes = {
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

  // Enhanced pack opening with animations
  const openBoosterPack = async (expansion) => {
    if (isOpeningPack) return;
    
    setSelectedExpansion(expansion);
    setIsOpeningPack(true);
    setShowPackModal(true);
    setPackOpeningCards([]);
    setPackAnimation('shaking');
    setRareCardFound(false);
    
    // Pack shaking animation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPackAnimation('opening');
    
    // Generate random pack contents with enhanced rarity system
    const packCards = [];
    const cards = expansion.cards;
    let hasRare = false;
    
    for (let i = 0; i < 5; i++) {
      let selectedCard;
      const randomValue = Math.random();
      
      // Guarantee at least one rare in the last slot if none found
      const guaranteeRare = i === 4 && !hasRare;
      
      if (guaranteeRare || randomValue < 0.02) { // Ultra rare or guaranteed rare
        const ultraRares = cards.filter(c => c.rarity.includes('★★'));
        if (ultraRares.length > 0) {
          selectedCard = ultraRares[Math.floor(Math.random() * ultraRares.length)];
          hasRare = true;
          setRareCardFound(true);
        }
      } 
      
      if (!selectedCard && (guaranteeRare || randomValue < 0.08)) { // Rare
        const rares = cards.filter(c => c.rarity.includes('★') || c.rarity.includes('◊◊◊◊'));
        if (rares.length > 0) {
          selectedCard = rares[Math.floor(Math.random() * rares.length)];
          hasRare = true;
        }
      }
      
      if (!selectedCard && randomValue < 0.25) { // Uncommon
        const uncommons = cards.filter(c => c.rarity.includes('◊◊◊'));
        selectedCard = uncommons[Math.floor(Math.random() * uncommons.length)] || cards[Math.floor(Math.random() * cards.length)];
      } else if (!selectedCard && randomValue < 0.50) { // Less common
        const lessCommons = cards.filter(c => c.rarity.includes('◊◊'));
        selectedCard = lessCommons[Math.floor(Math.random() * lessCommons.length)] || cards[Math.floor(Math.random() * cards.length)];
      } else if (!selectedCard) { // Common
        const commons = cards.filter(c => c.rarity.includes('◊') && !c.rarity.includes('◊◊'));
        selectedCard = commons[Math.floor(Math.random() * commons.length)] || cards[Math.floor(Math.random() * cards.length)];
      }
      
      packCards.push(selectedCard);
    }
    
    // Card revealing animation
    setPackAnimation('revealing');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reveal cards one by one with dramatic effect
    for (let i = 0; i < packCards.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setPackOpeningCards(prev => [...prev, { ...packCards[i], revealed: true }]);
      
      // Extra dramatic pause for rare cards
      if (packCards[i].rarity.includes('★')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setPackAnimation('completed');
    setIsOpeningPack(false);
    setPackOpenCount(prev => prev + 1);
  };

  // Get rarity color and effects
  const getRarityInfo = (rarity) => {
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Head>
          <title>Expansions | Pokemon Pocket | DexTrends</title>
        </Head>
        <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/20 shadow-2xl">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-yellow-400 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl animate-pulse">📦</div>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">Loading Expansions...</h3>
          <p className="text-gray-300 text-lg">Preparing the ultimate pack opening experience</p>
        </div>
      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
      <Head>
        <title>Expansions | Pokemon Pocket | DexTrends</title>
        <meta name="description" content="Experience the thrill of opening Pokemon Pocket booster packs" />
      </Head>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-bounce" style={{animationDelay: '0s'}}>⚡</div>
        <div className="absolute top-40 right-20 text-4xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}>🔥</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-25 animate-bounce" style={{animationDelay: '2s'}}>🔮</div>
        <div className="absolute bottom-40 right-10 text-3xl opacity-20 animate-pulse" style={{animationDelay: '3s'}}>✨</div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link 
                href="/pocketmode" 
                className="group flex items-center gap-3 text-yellow-400 hover:text-yellow-300 font-semibold transition-all transform hover:scale-105"
              >
                <svg className="w-6 h-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Pocket Mode
              </Link>
              <div className="flex items-center gap-3">
                <div className="text-4xl animate-bounce">📦</div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                  Booster Pack Central
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <span className="text-sm font-medium">Packs Opened: </span>
                <span className="text-yellow-400 font-bold">{packOpenCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/30">
                  📦 {expansions.length} Expansions
                </span>
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30">
                  🎲 Pack Simulator
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-8">
            <h2 className="text-6xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              OPEN LEGENDARY PACKS
            </h2>
            <div className="absolute -top-6 -right-6 text-4xl animate-spin" style={{animationDuration: '3s'}}>✨</div>
          </div>
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience the ultimate thrill of opening free booster packs with our advanced simulator featuring 
            <span className="text-yellow-400 font-bold"> realistic rarities</span>,
            <span className="text-pink-400 font-bold"> dramatic animations</span>, and
            <span className="text-purple-400 font-bold"> guaranteed rare cards</span>!
          </p>
        </div>

        {/* Expansion Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {expansions.map((expansion, index) => {
            const theme = expansion.theme;
            
            return (
              <div
                key={expansion.id}
                className="group relative"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Background Effect */}
                <div 
                  className="absolute inset-0 rounded-3xl opacity-30 blur-xl transition-all duration-700 group-hover:opacity-50"
                  style={{ background: theme.bgPattern }}
                />
                
                <div className={`relative bg-black/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 transition-all duration-500 hover:border-white/40 hover:shadow-2xl ${theme.glowColor} group-hover:shadow-2xl transform hover:scale-105`}>
                  {/* Pack Artwork */}
                  <div className="relative mb-8">
                    <div className={`w-48 h-64 mx-auto bg-gradient-to-b ${theme.gradient} rounded-2xl shadow-2xl relative overflow-hidden border-4 border-white/20 group-hover:border-white/40 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3`}>
                      {/* Holographic Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Pack Image or Fallback */}
                      {expansion.packArt || expansion.logoUrl ? (
                        <div className="absolute inset-0">
                          <Image
                            src={expansion.packArt || expansion.logoUrl}
                            alt={`${expansion.name} pack`}
                            fill
                            className="object-cover rounded-xl"
                            onError={(e) => {
                              // Fallback to emoji design if image fails
                              e.target.style.display = 'none';
                            }}
                          />
                          {/* Overlay for text */}
                          <div className="absolute inset-0 bg-black/20 rounded-xl" />
                          <div className="absolute bottom-4 left-4 right-4 text-center">
                            <div className="text-white font-bold text-lg drop-shadow-lg">
                              {expansion.name}
                            </div>
                            <div className="text-white/90 text-sm mt-1">
                              {expansion.symbol || 'Genetic Apex'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Fallback emoji design
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                          <div className="text-8xl mb-4 animate-pulse group-hover:animate-bounce">
                            {theme.emoji}
                          </div>
                          <div className="text-white font-bold text-xl drop-shadow-lg">
                            {expansion.name}
                          </div>
                          <div className="text-white/80 text-sm mt-2">
                            Genetic Apex
                          </div>
                        </div>
                      )}
                      
                      {/* Shine Effect */}
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                    
                    {/* Pack Stats */}
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                        <span className="text-xs font-medium text-white">💎 {expansion.totalCards} Cards</span>
                      </div>
                    </div>
                  </div>

                  {/* Expansion Info */}
                  <div className="text-center space-y-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-3 text-white">{expansion.name}</h3>
                      <p className="text-gray-300 leading-relaxed">
                        {expansion.description}
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`bg-gradient-to-r ${theme.gradient} bg-opacity-20 rounded-xl p-4 border border-white/10`}>
                        <div className="text-2xl font-bold text-white">
                          {expansion.totalCards}
                        </div>
                        <div className="text-sm text-gray-300">Total Cards</div>
                      </div>
                      <div className={`bg-gradient-to-r ${theme.gradient} bg-opacity-20 rounded-xl p-4 border border-white/10`}>
                        <div className="text-2xl font-bold text-white">
                          {expansion.types.length}
                        </div>
                        <div className="text-sm text-gray-300">Types</div>
                      </div>
                    </div>

                    {/* Types Preview */}
                    <div>
                      <div className="text-sm font-semibold mb-3 text-gray-300">Featured Types</div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {expansion.types.slice(0, 4).map(type => (
                          <TypeBadge key={type} type={type} size="sm" />
                        ))}
                        {expansion.types.length > 4 && (
                          <span className="bg-white/10 text-white px-2 py-1 rounded-full text-xs">
                            +{expansion.types.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => openBoosterPack(expansion)}
                      disabled={isOpeningPack}
                      className={`w-full bg-gradient-to-r ${theme.gradient} hover:shadow-2xl text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/20 hover:border-white/40`}
                    >
                      {isOpeningPack ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          Opening Pack...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-2xl">{theme.emoji}</span>
                          <span>OPEN FREE PACK</span>
                          <span className="text-2xl animate-bounce">✨</span>
                        </div>
                      )}
                    </button>
                    
                    <Link href={`/pocketmode/set/${expansion.id}`}>
                      <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all border border-white/20 hover:border-white/40">
                        📋 Browse All Cards
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Highlights */}
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-12 border border-white/20 text-center">
          <h3 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            🎯 Collection Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group cursor-pointer transform hover:scale-105 transition-all">
              <div className="text-5xl mb-4 group-hover:animate-bounce">📊</div>
              <h4 className="text-xl font-bold mb-2 text-white">Authentic Experience</h4>
              <p className="text-gray-300">Experience realistic pack opening with distribution matching Pokemon Pocket cards</p>
            </div>
            <div className="group cursor-pointer transform hover:scale-105 transition-all">
              <div className="text-5xl mb-4 group-hover:animate-pulse">🎁</div>
              <h4 className="text-xl font-bold mb-2 text-white">Free & Fun</h4>
              <p className="text-gray-300">Open unlimited packs and discover new cards without any cost or limits</p>
            </div>
            <div className="group cursor-pointer transform hover:scale-105 transition-all">
              <div className="text-5xl mb-4 group-hover:animate-spin">✨</div>
              <h4 className="text-xl font-bold mb-2 text-white">Beautiful Animations</h4>
              <p className="text-gray-300">Enjoy smooth animations and satisfying card reveals with special effects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Pack Opening Modal */}
      {showPackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-black/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-6xl border border-white/20 shadow-2xl">
            {packAnimation === 'shaking' && (
              <div className="text-center">
                <h3 className="text-4xl font-bold text-white mb-4">🎁 Get Ready...</h3>
                <p className="text-xl text-gray-300 mb-8">Your pack is about to be opened!</p>
                <div className="flex justify-center mb-8">
                  <div className={`w-64 h-80 bg-gradient-to-b ${selectedExpansion?.theme.gradient} rounded-2xl shadow-2xl animate-bounce border-4 border-white/30 relative overflow-hidden`}>
                    {selectedExpansion?.packArt || selectedExpansion?.logoUrl ? (
                      <div className="absolute inset-0">
                        <Image
                          src={selectedExpansion.packArt || selectedExpansion.logoUrl}
                          alt={`${selectedExpansion.name} pack`}
                          fill
                          className="object-cover rounded-xl"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-xl" />
                        <div className="absolute bottom-6 left-6 right-6 text-center">
                          <div className="text-white font-bold text-2xl drop-shadow-lg">
                            {selectedExpansion.name}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-8xl mb-4 animate-pulse">
                            {selectedExpansion?.theme.emoji}
                          </div>
                          <div className="text-white font-bold text-2xl">
                            {selectedExpansion?.name}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-lg text-yellow-400 animate-pulse">Shaking the pack for luck... 🤞</div>
              </div>
            )}

            {packAnimation === 'opening' && (
              <div className="text-center">
                <h3 className="text-4xl font-bold text-white mb-4">📦 Opening Pack...</h3>
                <div className="text-6xl animate-spin mb-8">🌟</div>
                <div className="text-lg text-purple-400 animate-pulse">Revealing your cards...</div>
              </div>
            )}

            {packAnimation === 'revealing' && (
              <div className="text-center">
                <h3 className="text-4xl font-bold text-white mb-6">✨ Your Cards Are Here!</h3>
                {rareCardFound && (
                  <div className="mb-6">
                    <div className="text-6xl animate-bounce mb-2">🎉</div>
                    <div className="text-2xl font-bold text-yellow-400 animate-pulse">RARE CARD FOUND!</div>
                  </div>
                )}
              </div>
            )}

            {(packAnimation === 'revealing' || packAnimation === 'completed') && packOpeningCards.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {packOpeningCards.map((card, index) => {
                  const rarityInfo = getRarityInfo(card.rarity);
                  
                  return (
                    <div
                      key={`${card.id}-${index}`}
                      className={`group bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center transition-all duration-500 transform hover:scale-110 border-2 ${rarityInfo.border} hover:shadow-2xl ${rarityInfo.glow}`}
                      style={{ 
                        animationDelay: `${index * 200}ms`,
                        animation: card.revealed ? 'slideInUp 0.6s ease-out' : 'none'
                      }}
                    >
                      <div className="relative w-full aspect-[3/4] mb-4 overflow-hidden rounded-xl">
                        <Image
                          src={card.image || "/dextrendslogo.png"}
                          alt={card.name}
                          fill
                          className="object-contain transition-transform duration-300 group-hover:scale-110"
                          sizes="250px"
                        />
                        {card.rarity.includes('★') && (
                          <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 to-transparent animate-pulse" />
                        )}
                      </div>
                      
                      <h4 className="font-bold text-lg mb-2 text-white line-clamp-2">{card.name}</h4>
                      
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <TypeBadge type={card.type} size="sm" />
                      </div>
                      
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${rarityInfo.bg} ${rarityInfo.textColor} shadow-lg`}>
                        {rarityInfo.rarity}
                      </div>
                      
                      {card.health && (
                        <div className="text-sm text-gray-300 mt-2">
                          HP: {card.health}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {packAnimation === 'completed' && (
              <div className="text-center">
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => openBoosterPack(selectedExpansion)}
                    className={`bg-gradient-to-r ${selectedExpansion?.theme.gradient} hover:shadow-xl text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105`}
                  >
                    🎲 Open Another Pack
                  </button>
                  <button
                    onClick={() => setShowPackModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expansion Details Modal */}
      {selectedExpansion && !showPackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-black/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-7xl max-h-[90vh] border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{selectedExpansion.theme.emoji}</div>
                <h3 className="text-4xl font-bold text-white">{selectedExpansion.name}</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className={`${selectedExpansion.theme.bg} text-white px-4 py-2 rounded-full text-sm font-bold`}>
                  {selectedExpansion.totalCards} cards
                </span>
                <button
                  onClick={() => setSelectedExpansion(null)}
                  className="text-gray-400 hover:text-white transition-colors text-3xl"
                >
                  ×
                </button>
              </div>
            </div>

            <p className="text-xl text-gray-300 mb-8">
              {selectedExpansion.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
              {selectedExpansion.cards.map((card) => (
                <Link 
                  key={card.id} 
                  href={`/pocketmode/${card.id}`}
                  className="block group"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center hover:bg-white/20 transition-all transform hover:scale-105 border border-white/10 hover:border-white/30">
                    <div className="relative w-full aspect-[3/4] mb-3">
                      <Image
                        src={card.image || "/dextrendslogo.png"}
                        alt={card.name}
                        fill
                        className="object-contain rounded transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        sizes="150px"
                      />
                    </div>
                    <h4 className="font-medium text-sm mb-2 text-white line-clamp-2">{card.name}</h4>
                    <TypeBadge type={card.type} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(100px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}