import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getHolographicEffect, getRarityGlowClass } from '../../utils/cardEffects';

// Realistic Pokemon TCG rarity rates
const RARITY_RATES = {
  'Secret Rare': 0.005,     // 0.5% - Rainbow/Gold rares
  'Ultra Rare': 0.02,       // 2% - Full Arts, VMAXs
  'Rare Holo': 0.08,        // 8% - Holos, GXs, Vs  
  'Rare': 0.15,             // 15% - Non-holo rares
  'Uncommon': 0.35,         // 35% - Uncommons
  'Common': 0.395           // 39.5% - Commons
};

const PACK_SIZE = 5; // Standard pocket pack size

export default function PackOpening({ 
  expansion, 
  availableCards = [], 
  onPackOpened = () => {},
  onClose = () => {},
  isOpen = false 
}) {
  const [packState, setPackState] = useState('closed'); // closed, shaking, opening, revealing, complete
  const [revealedCards, setRevealedCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [packImage, setPackImage] = useState(null);
  const [hasRareCard, setHasRareCard] = useState(false);

  // Reset when pack opens
  useEffect(() => {
    if (isOpen) {
      setPackState('closed');
      setRevealedCards([]);
      setCurrentCardIndex(0);
      setHasRareCard(false);
      
      // Check if expansion has pack image from API
      if (expansion?.packImage) {
        setPackImage(expansion.packImage);
      } else {
        // Use placeholder with rainbow indicator
        setPackImage(null);
      }
    }
  }, [isOpen, expansion]);

  // Generate pack contents with realistic rarity distribution
  const generatePackCards = () => {
    if (!availableCards.length) return [];

    const packCards = [];
    let hasRareInPack = false;

    // Organize cards by rarity
    const cardsByRarity = {
      'Secret Rare': availableCards.filter(card => 
        card.rarity?.toLowerCase().includes('secret') || 
        card.rarity?.toLowerCase().includes('rainbow') ||
        card.rarity?.includes('★★★')),
      'Ultra Rare': availableCards.filter(card => 
        card.rarity?.toLowerCase().includes('ultra') ||
        card.rarity?.toLowerCase().includes('full art') ||
        card.rarity?.includes('★★')),
      'Rare Holo': availableCards.filter(card => 
        card.rarity?.toLowerCase().includes('rare holo') ||
        card.rarity?.toLowerCase().includes('holo') ||
        card.rarity?.includes('★')),
      'Rare': availableCards.filter(card => 
        card.rarity?.toLowerCase().includes('rare') && 
        !card.rarity?.toLowerCase().includes('holo') &&
        !card.rarity?.toLowerCase().includes('ultra')),
      'Uncommon': availableCards.filter(card => 
        card.rarity?.toLowerCase().includes('uncommon') ||
        card.rarity?.includes('◊◊◊')),
      'Common': availableCards.filter(card => 
        card.rarity?.toLowerCase().includes('common') ||
        card.rarity?.includes('◊'))
    };

    // Generate 5 cards with proper rarity distribution
    for (let i = 0; i < PACK_SIZE; i++) {
      let selectedCard = null;
      let cardRarity = 'common';
      const rand = Math.random();
      
      // Only force rare in last slot if NO rare cards have been selected yet
      const forceRare = i === PACK_SIZE - 1 && !hasRareInPack;
      
      if (forceRare) {
        // Force at least one rare card (any rare tier)
        const rarePool = [...cardsByRarity['Rare'], ...cardsByRarity['Rare Holo'], ...cardsByRarity['Ultra Rare'], ...cardsByRarity['Secret Rare']];
        selectedCard = getRandomCard(rarePool);
        cardRarity = 'rare';
        hasRareInPack = true;
      } else if (rand < RARITY_RATES['Secret Rare']) {
        selectedCard = getRandomCard(cardsByRarity['Secret Rare']);
        cardRarity = 'secret';
        hasRareInPack = true;
      } else if (rand < RARITY_RATES['Secret Rare'] + RARITY_RATES['Ultra Rare']) {
        selectedCard = getRandomCard(cardsByRarity['Ultra Rare']);
        cardRarity = 'ultra';
        hasRareInPack = true;
      } else if (rand < RARITY_RATES['Secret Rare'] + RARITY_RATES['Ultra Rare'] + RARITY_RATES['Rare Holo']) {
        selectedCard = getRandomCard(cardsByRarity['Rare Holo']);
        cardRarity = 'holo';
        hasRareInPack = true;
      } else if (rand < RARITY_RATES['Secret Rare'] + RARITY_RATES['Ultra Rare'] + RARITY_RATES['Rare Holo'] + RARITY_RATES['Rare']) {
        selectedCard = getRandomCard(cardsByRarity['Rare']);
        cardRarity = 'rare';
        hasRareInPack = true;
      } else if (rand < 1 - RARITY_RATES['Common']) {
        selectedCard = getRandomCard(cardsByRarity['Uncommon']);
        cardRarity = 'uncommon';
      } else {
        selectedCard = getRandomCard(cardsByRarity['Common']);
        cardRarity = 'common';
      }

      // Fallback to any card if rarity pool is empty
      if (!selectedCard) {
        selectedCard = availableCards[Math.floor(Math.random() * availableCards.length)];
        cardRarity = 'common';
      }

      packCards.push({
        ...selectedCard,
        packPosition: i,
        isRare: ['secret', 'ultra', 'holo', 'rare'].includes(cardRarity),
        cardRarity
      });
    }

    setHasRareCard(hasRareInPack);
    return packCards;
  };

  const getRandomCard = (cardArray) => {
    if (!cardArray?.length) return null;
    return cardArray[Math.floor(Math.random() * cardArray.length)];
  };

  // Start pack opening sequence
  const openPack = async () => {
    const cards = generatePackCards();
    
    // Pack shaking animation
    setPackState('shaking');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Pack opening
    setPackState('opening');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Card revealing
    setPackState('revealing');
    setRevealedCards(cards);
    
    // Reveal cards one by one
    for (let i = 0; i < cards.length; i++) {
      setCurrentCardIndex(i);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Extra pause for rare cards
      if (cards[i].isRare) {
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    }
    
    setPackState('complete');
    onPackOpened(cards);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-color bg-light-grey">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pokemon-red rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-dark-text">
              {expansion?.name || 'Booster Pack'} Opening
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-light-grey hover:bg-mid-grey transition-colors"
          >
            <svg className="w-5 h-5 text-text-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Pack Opening Area */}
        <div className="p-8 text-center">
          {packState === 'closed' && (
            <div className="space-y-6">
              {/* Pack Image */}
              <div className="relative mx-auto w-48 h-64 mb-6">
                {packImage ? (
                  <Image
                    src={packImage}
                    alt={`${expansion?.name} Pack`}
                    fill
                    className="object-contain rounded-lg"
                  />
                ) : (
                  // Placeholder pack with rainbow indicator
                  <div className="w-full h-full bg-gradient-to-br from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mb-3 mx-auto">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <p className="text-white font-semibold text-sm">PLACEHOLDER</p>
                      <p className="text-white/80 text-xs">Rainbow = Temp</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-dark-text">
                  Ready to Open {expansion?.name} Pack?
                </h3>
                <p className="text-text-grey max-w-md mx-auto">
                  Each pack contains {PACK_SIZE} cards with realistic rarity rates. 
                  At least one rare card is guaranteed!
                </p>
                
                <button
                  onClick={openPack}
                  className="btn-primary px-8 py-4 text-lg font-semibold rounded-lg hover:scale-105 transition-all duration-300"
                >
                  Open Pack
                </button>
              </div>
            </div>
          )}

          {packState === 'shaking' && (
            <div className="space-y-6">
              <div className="relative mx-auto w-48 h-64 animate-pulse">
                <div className={`w-full h-full ${packImage ? '' : 'bg-gradient-to-br from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400'} rounded-lg flex items-center justify-center animate-bounce`}>
                  {packImage ? (
                    <Image
                      src={packImage}
                      alt="Opening pack"
                      fill
                      className="object-contain rounded-lg animate-shake"
                    />
                  ) : (
                    <div className="text-white font-bold">OPENING...</div>
                  )}
                </div>
              </div>
              <p className="text-lg font-semibold text-dark-text animate-pulse">
                Opening pack...
              </p>
            </div>
          )}

          {packState === 'opening' && (
            <div className="space-y-6">
              <div className="text-4xl animate-spin">✨</div>
              <p className="text-xl font-semibold text-dark-text">
                Revealing your cards...
              </p>
            </div>
          )}

          {(packState === 'revealing' || packState === 'complete') && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-dark-text">
                Your Cards!
                {hasRareCard && <span className="text-pokemon-yellow ml-2">⭐</span>}
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {revealedCards.map((card, index) => {
                  const isRevealed = index <= currentCardIndex || packState === 'complete';
                  const holographicClass = getHolographicEffect(card.rarity);
                  const rarityGlow = getRarityGlowClass(card.rarity);
                  
                  return (
                    <div
                      key={index}
                      className={`relative transition-all duration-500 ${
                        isRevealed ? 'opacity-100 scale-100' : 'opacity-30 scale-95'
                      }`}
                    >
                      <div className={`bg-white border border-border-color rounded-lg p-2 ${holographicClass} ${rarityGlow} ${
                        card.isRare ? 'ring-2 ring-pokemon-yellow' : ''
                      }`}>
                        <div className="aspect-[2.5/3.5] relative mb-2 bg-off-white rounded overflow-hidden">
                          <Image
                            src={card.image || '/dextrendslogo.png'}
                            alt={card.name}
                            fill
                            className="object-contain"
                            sizes="200px"
                          />
                        </div>
                        <h4 className="text-xs font-medium text-dark-text line-clamp-2">
                          {card.name}
                        </h4>
                        <p className="text-xs text-text-grey">
                          {card.rarity}
                        </p>
                      </div>
                      
                      {card.isRare && isRevealed && (
                        <div className="absolute -top-2 -right-2 bg-pokemon-yellow text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                          RARE!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {packState === 'complete' && (
                <div className="space-y-4 pt-4">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={openPack}
                      className="btn-clean px-6 py-3 font-semibold"
                    >
                      Open Another Pack
                    </button>
                    <button
                      onClick={onClose}
                      className="btn-primary px-6 py-3 font-semibold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Custom shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-2deg); }
          75% { transform: translateX(5px) rotate(2deg); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}