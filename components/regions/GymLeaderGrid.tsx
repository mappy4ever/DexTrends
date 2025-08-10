import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getGymLeaderImage, getBadgeImage } from '../../utils/scrapedImageMapping';
import { TypeGradientBadge } from '../ui/design-system/TypeGradientBadge';
import { gymLeaderTeams } from '../../data/gymLeaderTeams';
import { typeEffectiveness } from '../../utils/pokemonutils';

interface GymLeader {
  name: string;
  type: string;
  badge: string;
  city: string;
}

interface Region {
  id: string;
  color: string;
}

interface GymLeaderGridProps {
  region: Region;
  gymLeaders: GymLeader[];
  theme: string;
}

interface GymLeaderData {
  quote: string;
  signature: string;
  signatureId: number;
  strategy: string;
}

interface TeamData {
  team?: Array<{
    id: number;
    name: string;
    level: number;
  }>;
  weakAgainst?: string[];
  resistantTo?: string[];
}

const GymLeaderGrid: React.FC<GymLeaderGridProps> = ({ region, gymLeaders, theme }) => {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  
  const handleCardFlip = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  
  // Gym leader data
  const gymLeaderData: Record<string, GymLeaderData> = {
    'Brock': { quote: "I believe in rock-hard determination!", signature: "Onix", signatureId: 95, strategy: "Defensive rock formations" },
    'Misty': { quote: "My policy is an all-out offensive with water-type Pokémon!", signature: "Starmie", signatureId: 121, strategy: "Swift aquatic strikes" },
    'Lt. Surge': { quote: "I tell you, electric Pokémon saved me during the war!", signature: "Raichu", signatureId: 26, strategy: "High-voltage offense" },
    'Erika': { quote: "Oh... I must have dozed off. Welcome to Celadon Gym.", signature: "Vileplume", signatureId: 45, strategy: "Status condition tactics" },
    'Koga': { quote: "A ninja should be able to track his prey through darkness!", signature: "Weezing", signatureId: 110, strategy: "Poison and evasion" },
    'Sabrina': { quote: "I had a vision of your arrival!", signature: "Alakazam", signatureId: 65, strategy: "Psychic domination" },
    'Blaine': { quote: "Hah! Hope you brought Burn Heal!", signature: "Arcanine", signatureId: 59, strategy: "Burning intensity" },
    'Giovanni': { quote: "So! I must say, I am impressed you got here.", signature: "Rhyhorn", signatureId: 111, strategy: "Ground-type supremacy" },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .will-change-transform { will-change: transform; }
      `}</style>
      {gymLeaders.map((leader, index) => {
        const leaderData = gymLeaderData[leader.name] || {} as GymLeaderData;
        const teamData = (gymLeaderTeams as any)[leader.name] as TeamData;
        const weaknesses = teamData?.weakAgainst || (typeEffectiveness as any)[leader.type]?.weakTo || [];
        const resistances = teamData?.resistantTo || [];
        const acePokemon = (teamData?.team && teamData.team.length > 0)
          ? teamData.team.reduce((best, p) => best && best.level >= p.level ? best : p)
          : null;
        
        return (
          <motion.div
            key={leader.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: index * 0.06 }}
            className="group relative h-[500px] md:h-[560px] cursor-pointer perspective-1000 select-none"
            onClick={() => handleCardFlip(index)}
          >
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d will-change-transform ${
              flippedCards.has(index) ? 'rotate-y-180' : ''
            }`}>
              {/* Front of card - Full image with minimal info */}
              <div className="absolute inset-0 backface-hidden will-change-transform">
                <div className="relative h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50">
                  {/* Full card image (plain img for reliable fallback) */}
                  <div className="absolute inset-0">
                    <img
                      src={getGymLeaderImage(leader.name, 1)}
                      alt={leader.name}
                      className="w-full h-full object-contain object-top md:object-center p-4"
                      loading={index < 4 ? 'eager' : 'lazy'}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/gym-leader-placeholder.svg'; }}
                    />
                  </div>
                  
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                  
                  {/* Badge Number */}
                  <div className="absolute top-4 left-4 z-20 w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    {index + 1}
                  </div>
                  
                  {/* Type Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <TypeGradientBadge type={leader.type} size="sm" gradient={true} />
                  </div>
                  
                  {/* Minimal info at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                    <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                      {leader.name}
                    </h3>
                    <p className="text-lg text-gray-200 font-medium drop-shadow-lg">
                      {leader.city} Gym Leader
                    </p>
                    <p className="text-sm text-gray-300 mt-1 drop-shadow-lg">
                      {leader.type.charAt(0).toUpperCase() + leader.type.slice(1)} Type Specialist
                    </p>

                    {acePokemon && (
                      <div className="mt-4 flex items-center gap-3 bg-black/30 rounded-xl p-2 border border-white/10 w-fit">
                        {/* Ace sprite */}
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${acePokemon.id}.png`}
                          alt={acePokemon.name}
                          className="w-10 h-10 object-contain"
                          loading="lazy"
                        />
                        <div className="text-gray-200 text-sm font-medium">
                          Ace: <span className="text-white font-semibold">{acePokemon.name}</span>
                          <span className="ml-2 text-xs text-gray-300">Lv. {acePokemon.level}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Flip indicator */}
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-400 animate-pulse">
                        Click to see details
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Back of card - All details */}
              <div className="absolute inset-0 rotate-y-180 backface-hidden will-change-transform">
                <div className="relative h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50 p-8">
                  {/* Glass morphism overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-gray-500/5 rounded-3xl" />
                  
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    {/* Header */}
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold text-white mb-1">{leader.name}</h3>
                      <p className="text-sm text-gray-400">{leader.city} Gym Leader</p>
                    </div>
                    
                    {/* Badge */}
                    <div className="flex flex-col items-center mb-4">
                      {getBadgeImage(leader.badge) && (
                        <div className="w-24 h-24 relative mb-2">
                          <Image
                            src={getBadgeImage(leader.badge)}
                            alt={leader.badge}
                            fill
                            unoptimized
                            className="object-contain filter drop-shadow-lg"
                          />
                        </div>
                      )}
                      <p className="font-bold text-white">{leader.badge}</p>
                    </div>
                    
                    {/* Quote */}
                    {leaderData?.quote && (
                      <div className="mb-4">
                        <p className="text-sm italic text-gray-300 text-center">
                          "{leaderData.quote}"
                        </p>
                      </div>
                    )}
                    
                    {/* Ace / Signature Pokemon */}
                    {(acePokemon || leaderData.signature) && (
                      <div className="mb-4 p-3 rounded-xl bg-gray-800/50 border border-gray-700">
                        <p className="text-xs font-semibold text-gray-400 text-center mb-2">
                          {acePokemon ? 'Ace Pokémon' : 'Signature Pokémon'}
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          <img
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${(acePokemon?.id ?? leaderData.signatureId) || 0}.png`}
                            alt={(acePokemon?.name ?? leaderData.signature) || 'Ace'}
                            className="w-16 h-16 object-contain"
                            loading="lazy"
                          />
                          <div className="text-center">
                            <span className="font-bold text-white block">{(acePokemon?.name ?? leaderData.signature) || ''}</span>
                            {acePokemon && (
                              <span className="text-xs text-gray-300">Lv. {acePokemon.level}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Team preview */}
                    {teamData?.team && teamData.team.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-400 text-center mb-2">Team</p>
                        <div className="flex justify-center flex-wrap gap-3">
                          {teamData.team.slice(0, 6).map((p) => (
                            <div key={`${p.id}-${p.level}`} className="flex items-center gap-2 bg-gray-800/40 rounded-lg px-2 py-1 border border-gray-700/60">
                              <img
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                                alt={p.name}
                                className="w-8 h-8 object-contain"
                                loading="lazy"
                              />
                              <div className="text-xs text-gray-200 font-medium">
                                {p.name}
                                <span className="ml-1 text-[11px] text-gray-400">Lv. {p.level}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Weaknesses & Resistances */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-400 mb-2">Weak Against</p>
                        <div className="flex justify-center flex-wrap gap-2">
                          {weaknesses.slice(0, 4).map((type: string) => (
                            <TypeGradientBadge key={`w-${type}`} type={type} size="xs" gradient={true} />
                          ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-400 mb-2">Resistant To</p>
                        <div className="flex justify-center flex-wrap gap-2">
                          {resistances.slice(0, 4).map((type: string) => (
                            <TypeGradientBadge key={`r-${type}`} type={type} size="xs" gradient={true} />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Flip back indicator */}
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500 animate-pulse">
                        Click to flip back
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default GymLeaderGrid;