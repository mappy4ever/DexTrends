import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { TypeBadge } from "./ui/TypeBadge";
import Modal from "./Modal";

// PocketCardList: displays cards from the Pocket API with enhanced visual design
export default function PocketCardList({ 
  cards, 
  loading, 
  error, 
  emptyMessage = "No Pocket cards found.", 
  cardClassName = "", 
  gridClassName = "",
  showPack = true,
  showRarity = true,
  showHP = true,
  showSort = true
}) {
  const [zoomedCard, setZoomedCard] = useState(null);
  const [sortOption, setSortOption] = useState("name");

  // Sorting logic for Pocket cards
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "hp":
          const hpA = parseInt(a.health) || 0;
          const hpB = parseInt(b.health) || 0;
          return hpB - hpA; // Highest HP first
        case "rarity":
          const rarityOrder = { '★★': 6, '★': 5, '◊◊◊◊': 4, '◊◊◊': 3, '◊◊': 2, '◊': 1 };
          return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
        case "type":
          const typeA = a.type || '';
          const typeB = b.type || '';
          return typeA.localeCompare(typeB);
        case "pack":
          const packA = a.pack || '';
          const packB = b.pack || '';
          return packA.localeCompare(packB);
        case "ex":
          const exA = a.ex === "Yes" ? 1 : 0;
          const exB = b.ex === "Yes" ? 1 : 0;
          return exB - exA; // EX cards first
        case "fullart":
          const faA = a.fullart === "Yes" ? 1 : 0;
          const faB = b.fullart === "Yes" ? 1 : 0;
          return faB - faA; // Full Art cards first
        default:
          return 0;
      }
    });
  }, [cards, sortOption]);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
          <div className="w-20 h-20 rounded-full border-4 border-t-primary border-r-primary/70 border-b-primary/40 border-l-transparent animate-spin"></div>
        </div>
        <h3 className="mt-6 text-xl font-semibold">Loading Pocket cards...</h3>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-24 h-24 mb-6">
          <svg className="w-24 h-24 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-red-600">Error Loading Cards</h3>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    );
  }
  
  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-medium text-gray-600">{emptyMessage}</h3>
      </div>
    );
  }
  
  return (
    <>
    {/* Sort Controls */}
    {showSort && cards.length > 0 && (
      <div className="flex justify-center mb-6">
        <label htmlFor="pocket-sort" className="mr-2 font-semibold">Sort by:</label>
        <select
          id="pocket-sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="input"
        >
          <option value="name">Name</option>
          <option value="hp">HP (Highest First)</option>
          <option value="rarity">Rarity</option>
          <option value="type">Type</option>
          <option value="pack">Pack</option>
          <option value="ex">EX Cards First</option>
          <option value="fullart">Full Art First</option>
        </select>
      </div>
    )}
    
    <div className={gridClassName || "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-5 md:gap-7 justify-center"}>
      {sortedCards.map(card => {
        // Convert single type to array for consistency
        const cardTypes = card.type ? [card.type] : (card.types || []);
        
        // Enhanced rarity display mapping with better colors and gradients
        const rarityDisplay = {
          '◊': { 
            label: 'C', 
            color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300',
            glow: 'shadow-gray-200/50' 
          },
          '◊◊': { 
            label: 'U', 
            color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
            glow: 'shadow-green-200/50' 
          },
          '◊◊◊': { 
            label: 'R', 
            color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
            glow: 'shadow-blue-200/50' 
          },
          '◊◊◊◊': { 
            label: 'RR', 
            color: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300',
            glow: 'shadow-purple-200/50' 
          },
          '★': { 
            label: 'EX', 
            color: 'bg-gradient-to-r from-yellow-100 to-amber-200 text-amber-800 border-amber-300',
            glow: 'shadow-amber-200/50' 
          },
          '★★': { 
            label: 'Crown', 
            color: 'bg-gradient-to-r from-red-100 to-rose-200 text-red-800 border-red-300',
            glow: 'shadow-red-200/50' 
          }
        };
        
        const rarity = rarityDisplay[card.rarity] || { 
          label: '?', 
          color: 'bg-gray-100 text-gray-500 border-gray-200',
          glow: 'shadow-gray-100/50' 
        };
        
        // Determine card features for tags
        const getCardFeatures = (card) => {
          const features = [];
          
          // Evolution Stage detection
          if (card.name.toLowerCase().includes('stage 2') || card.name.toLowerCase().includes('final evolution')) {
            features.push({ type: 'stage', label: 'Stage 2', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' });
          } else if (card.name.toLowerCase().includes('stage 1') || card.name.toLowerCase().includes('evolution')) {
            features.push({ type: 'stage', label: 'Stage 1', color: 'bg-blue-100 text-blue-800 border-blue-300' });
          } else if (card.name.toLowerCase().includes('basic')) {
            features.push({ type: 'stage', label: 'Basic', color: 'bg-gray-100 text-gray-800 border-gray-300' });
          }
          
          // Promo detection
          if (card.pack && card.pack.toLowerCase().includes('promo')) {
            features.push({ type: 'promo', label: 'Promo', color: 'bg-orange-100 text-orange-800 border-orange-300' });
          }
          
          // Special card types
          if (card.name.toLowerCase().includes('rainbow')) {
            features.push({ type: 'special', label: 'Rainbow', color: 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 border-purple-300' });
          }
          
          if (card.name.toLowerCase().includes('secret')) {
            features.push({ type: 'special', label: 'Secret', color: 'bg-slate-100 text-slate-800 border-slate-300' });
          }
          
          return features;
        };

        const cardFeatures = getCardFeatures(card);

        const handleCardClick = (e) => {
          // Prevent navigation if a link or button was clicked
          if (
            e.target.closest('a') ||
            e.target.closest('button') ||
            e.target.closest('.magnifier-icon')
          ) return;
          window.location.href = `/pocketmode/${card.id}`;
        };

        return (
          <div
            key={card.id}
            className={cardClassName || 
              `card p-3 md:p-4 flex flex-col items-center bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 animate-fadeIn group ring-0
              hover:border-primary/90 hover:ring-2 hover:ring-primary/60 hover:-translate-y-2 hover:bg-primary/5 hover:shadow-xl
              focus-within:border-primary/90 focus-within:ring-2 focus-within:ring-primary/60 focus-within:-translate-y-2 focus-within:bg-primary/5 focus-within:shadow-xl`
            }
            style={{ boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)', cursor: 'pointer' }}
            tabIndex={0}
            onClick={handleCardClick}
          >
            <div className="w-full flex flex-col items-center relative">
              <Link href={`/pocketmode/${card.id}`} legacyBehavior>
                <a
                  className="block w-full"
                  tabIndex={-1}
                  onClick={e => e.stopPropagation()}
                >
                  <Image
                    src={card.image || "/back-card.png"}
                    alt={card.name}
                    width={220}
                    height={308}
                    className="rounded-app-md mb-2 object-cover shadow-md hover:shadow-lg transition-all"
                    priority={false}
                    onError={(e) => {
                      const target = e.target;
                      if (target && target.src !== window.location.origin + '/back-card.png') {
                        target.src = '/back-card.png';
                      }
                    }}
                    unoptimized
                  />
                </a>
              </Link>
            </div>
            
            {/* Card Name with Magnifier */}
            <h3 className="text-lg font-bold text-text-heading text-center mb-1 group-hover:text-primary group-focus-within:text-primary transition-colors duration-200 flex items-center justify-center gap-2">
              <Link href={`/pocketmode/${card.id}`} legacyBehavior>
                <a className="text-blue-900 hover:text-blue-700 focus:text-blue-700 hover:underline focus:underline outline-none focus-visible:ring-2 focus-visible:ring-primary px-1 rounded" tabIndex={0} title={`View card details for ${card.name}`} onClick={e => e.stopPropagation()}>
                  {card.name}
                </a>
              </Link>
              <button
                className="magnifier-icon ml-1 p-1 rounded-full hover:bg-gray-200 focus:bg-gray-300 focus:outline-none"
                title="Zoom card"
                tabIndex={0}
                onClick={e => { e.stopPropagation(); setZoomedCard(card); }}
                aria-label="Zoom card"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            </h3>
            
            {/* Card Feature Tags */}
            <div className="flex flex-wrap justify-center gap-1 mb-2">
              {/* Type Badge */}
              {cardTypes.length > 0 && (
                <TypeBadge type={cardTypes[0]} size="sm" isPocketCard={true} />
              )}
              
              {/* HP Tag */}
              {showHP && card.health && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                  {card.health}HP
                </span>
              )}
              
              {/* EX Tag */}
              {card.ex === "Yes" && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                  EX
                </span>
              )}
              
              {/* Full Art Tag */}
              {card.fullart === "Yes" && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                  Full Art
                </span>
              )}
              
              {/* Rarity Tag */}
              {showRarity && card.rarity && (
                <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold border ${rarity.color} ${rarity.glow} shadow-sm`}>
                  {rarity.label}
                </span>
              )}
              
              {/* Additional Card Features */}
              {cardFeatures.map((feature, index) => (
                <span 
                  key={`${feature.type}-${index}`}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${feature.color}`}
                >
                  {feature.label}
                </span>
              ))}
            </div>
            
            {/* Pack and Artist Info */}
            <div className="text-center space-y-1">
              {showPack && card.pack && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {card.pack}
                </div>
              )}
              
              {card.artist && (
                <div className="text-xs text-gray-400 dark:text-gray-500 italic">
                  by {card.artist}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
    
    {/* Zoom Modal */}
    {zoomedCard && (
      <Modal isOpen={true} onClose={() => setZoomedCard(null)}>
        <div className="flex flex-col items-center">
          <Image
            src={zoomedCard.image || "/back-card.png"}
            alt={zoomedCard.name}
            width={400}
            height={560}
            className="rounded-lg shadow-lg"
            unoptimized
          />
          <h3 className="mt-4 text-xl font-bold text-center">{zoomedCard.name}</h3>
          {zoomedCard.pack && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">{zoomedCard.pack}</p>
          )}
        </div>
      </Modal>
    )}
    </>
  );
}