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
    <div className="grid grid-cols-1 min-420:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 min-420:gap-6 md:gap-8">
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
            className="group relative h-[500px] md:h-[560px] cursor-pointer perspective-1000 select-none transform hover:-translate-y-2 transition-transform duration-300"
            onClick={() => handleCardFlip(index)}
          >
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d will-change-transform ${
              flippedCards.has(index) ? 'rotate-y-180' : ''
            }`}>
              {/* Front of card - Full image with minimal info */}
              <div className="absolute inset-0 backface-hidden will-change-transform">
                <div className={`relative h-full rounded-3xl overflow-hidden border border-gray-200/50 bg-gradient-to-br ${
                  leader.type === 'ice' ? 'from-white to-cyan-50/50' :
                  leader.type === 'fire' ? 'from-white to-orange-50/50' :
                  leader.type === 'water' ? 'from-white to-blue-50/50' :
                  leader.type === 'grass' ? 'from-white to-green-50/50' :
                  leader.type === 'electric' ? 'from-white to-yellow-50/50' :
                  leader.type === 'psychic' ? 'from-white to-purple-50/50' :
                  leader.type === 'dragon' ? 'from-white to-indigo-50/50' :
                  leader.type === 'dark' ? 'from-white to-gray-100/50' :
                  leader.type === 'steel' ? 'from-white to-slate-50/50' :
                  leader.type === 'fairy' ? 'from-white to-pink-50/50' :
                  leader.type === 'fighting' ? 'from-white to-red-50/50' :
                  leader.type === 'poison' ? 'from-white to-purple-50/50' :
                  leader.type === 'ground' ? 'from-white to-amber-50/50' :
                  leader.type === 'rock' ? 'from-white to-stone-50/50' :
                  leader.type === 'bug' ? 'from-white to-lime-50/50' :
                  leader.type === 'ghost' ? 'from-white to-purple-100/50' :
                  leader.type === 'flying' ? 'from-white to-sky-50/50' :
                  leader.type === 'normal' ? 'from-white to-gray-50/50' :
                  'from-white to-gray-50/50'
                }`} style={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}>
                  {/* Gym Leader Name, City, and Title at very top */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 text-center">
                    <div className="bg-white/70 backdrop-blur-md rounded-full px-6 py-2 shadow-2xl border-2 border-white/50">
                      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-600 tracking-tight uppercase whitespace-nowrap">
                        {leader.name}
                      </h2>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 font-semibold">
                        {leader.city}
                      </p>
                      <p className="text-xs text-gray-600 font-medium">
                        Gym Leader
                      </p>
                    </div>
                  </div>
                  {/* Ace Pokemon - watermark style bottom right */}
                  {(acePokemon || leaderData.signature) && (
                    <div className="absolute bottom-2 -right-8 z-20">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${(acePokemon?.id ?? leaderData.signatureId) || 0}.png`}
                        alt={acePokemon?.name || leaderData.signature}
                        className="w-48 h-48 object-contain opacity-30"
                        loading="lazy"
                        style={{ mixBlendMode: 'multiply' }}
                      />
                    </div>
                  )}
                  {/* Circular portrait container - centered horizontally and moved further down */}
                  <div className="absolute top-32 left-1/2 transform -translate-x-1/2">
                    {/* Colorful splash behind circle - muted pastels */}
                    <div className={`absolute -top-12 -left-12 w-72 h-72 rounded-full blur-3xl opacity-25 ${
                      leader.type === 'ice' ? 'bg-gradient-to-r from-cyan-200 via-blue-300 to-cyan-200' :
                      leader.type === 'fire' ? 'bg-gradient-to-r from-orange-200 via-red-300 to-orange-200' :
                      leader.type === 'water' ? 'bg-gradient-to-r from-blue-200 via-cyan-300 to-blue-200' :
                      leader.type === 'grass' ? 'bg-gradient-to-r from-green-200 via-lime-300 to-green-200' :
                      leader.type === 'electric' ? 'bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-200' :
                      leader.type === 'psychic' ? 'bg-gradient-to-r from-purple-200 via-pink-300 to-purple-200' :
                      leader.type === 'dragon' ? 'bg-gradient-to-r from-indigo-200 via-purple-300 to-indigo-200' :
                      leader.type === 'dark' ? 'bg-gradient-to-r from-gray-300 via-slate-400 to-gray-300' :
                      leader.type === 'steel' ? 'bg-gradient-to-r from-slate-200 via-gray-300 to-slate-200' :
                      leader.type === 'fairy' ? 'bg-gradient-to-r from-pink-200 via-rose-300 to-pink-200' :
                      leader.type === 'fighting' ? 'bg-gradient-to-r from-red-300 via-orange-400 to-red-300' :
                      leader.type === 'poison' ? 'bg-gradient-to-r from-purple-200 via-pink-300 to-purple-200' :
                      leader.type === 'ground' ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300' :
                      leader.type === 'rock' ? 'bg-gradient-to-r from-stone-200 via-amber-300 to-stone-200' :
                      leader.type === 'bug' ? 'bg-gradient-to-r from-lime-200 via-green-300 to-lime-200' :
                      leader.type === 'ghost' ? 'bg-gradient-to-r from-purple-200 via-indigo-300 to-purple-200' :
                      leader.type === 'flying' ? 'bg-gradient-to-r from-sky-200 via-blue-300 to-sky-200' :
                      leader.type === 'normal' ? 'bg-gradient-to-r from-stone-200 via-gray-300 to-stone-200' :
                      'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200'
                    }`}></div>
                    {/* Inner content container */}
                    <div className="relative w-56 h-56">
                      {/* Glass-style transparent circle - EXACT same as name container */}
                      <div className="absolute inset-0 rounded-full bg-white/70 backdrop-blur-md shadow-2xl border-2 border-white/50 overflow-hidden">
                        {/* Gym leader image directly inside glass container */}
                        <div className="absolute inset-0 flex items-center justify-center p-2">
                          <img
                            src={getGymLeaderImage(leader.name, 1)}
                            alt={leader.name}
                            className="w-full h-full object-contain filter drop-shadow-2xl"
                            style={{ maxWidth: '90%', maxHeight: '90%', filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
                            loading={index < 4 ? 'eager' : 'lazy'}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/gym-leader-placeholder.svg'; }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Badges at bottom left - stacked vertically */}
                  <div className="absolute bottom-5 left-5 z-40">
                    <div className="flex flex-col items-center gap-2">
                      {/* Gym Badge on top */}
                      <div>
                        {getBadgeImage(leader.badge) ? (
                          <Image
                            src={getBadgeImage(leader.badge)}
                            alt={leader.badge}
                            width={56}
                            height={56}
                            unoptimized
                            className="object-contain filter drop-shadow-lg"
                          />
                        ) : (
                          <div className="text-3xl filter drop-shadow-lg">🏅</div>
                        )}
                      </div>
                      {/* Type Badge below */}
                      <div>
                        <TypeGradientBadge type={leader.type} size="xs" gradient={true} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Flip indicator at top right - positioned below name to avoid overlap */}
                  <div className="absolute top-20 right-5 z-40">
                    <div className="w-10 h-10 bg-white/70 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border border-white/50">
                      <span className="text-gray-700 font-bold text-2xl flex items-center justify-center">›</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Back of card - Clean Modern Layout */}
              <div className="absolute inset-0 rotate-y-180 backface-hidden will-change-transform">
                <div className={`relative h-full rounded-3xl border border-gray-200/50 ${
                  leader.type === 'ice' ? 'bg-gradient-to-br from-cyan-50 to-blue-100' :
                  leader.type === 'fire' ? 'bg-gradient-to-br from-orange-50 to-red-100' :
                  leader.type === 'water' ? 'bg-gradient-to-br from-blue-50 to-cyan-100' :
                  leader.type === 'grass' ? 'bg-gradient-to-br from-green-50 to-lime-100' :
                  leader.type === 'electric' ? 'bg-gradient-to-br from-yellow-50 to-amber-100' :
                  leader.type === 'psychic' ? 'bg-gradient-to-br from-purple-50 to-pink-100' :
                  leader.type === 'dragon' ? 'bg-gradient-to-br from-indigo-50 to-purple-100' :
                  leader.type === 'dark' ? 'bg-gradient-to-br from-gray-100 to-slate-200' :
                  leader.type === 'steel' ? 'bg-gradient-to-br from-slate-50 to-gray-100' :
                  leader.type === 'fairy' ? 'bg-gradient-to-br from-pink-50 to-rose-100' :
                  leader.type === 'fighting' ? 'bg-gradient-to-br from-red-50 to-orange-100' :
                  leader.type === 'poison' ? 'bg-gradient-to-br from-purple-50 to-pink-100' :
                  leader.type === 'ground' ? 'bg-gradient-to-br from-amber-50 to-yellow-100' :
                  leader.type === 'rock' ? 'bg-gradient-to-br from-stone-50 to-amber-100' :
                  leader.type === 'bug' ? 'bg-gradient-to-br from-lime-50 to-green-100' :
                  leader.type === 'ghost' ? 'bg-gradient-to-br from-purple-50 to-indigo-100' :
                  leader.type === 'flying' ? 'bg-gradient-to-br from-sky-50 to-blue-100' :
                  leader.type === 'normal' ? 'bg-gradient-to-br from-stone-50 to-gray-100' :
                  'bg-gradient-to-br from-gray-50 to-gray-100'
                }`} style={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}>
                  
                  <div className="h-full flex flex-col p-4 overflow-y-auto">
                    {/* Header - Gym Leader Portrait Circle */}
                    <div className="flex flex-col items-center mb-3">
                      <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${
                        leader.type === 'ice' ? 'border-cyan-400' :
                        leader.type === 'fire' ? 'border-orange-400' :
                        leader.type === 'water' ? 'border-blue-400' :
                        leader.type === 'grass' ? 'border-green-400' :
                        leader.type === 'electric' ? 'border-yellow-400' :
                        leader.type === 'psychic' ? 'border-purple-400' :
                        leader.type === 'dragon' ? 'border-indigo-400' :
                        leader.type === 'dark' ? 'border-gray-700' :
                        leader.type === 'steel' ? 'border-gray-400' :
                        leader.type === 'fairy' ? 'border-pink-400' :
                        leader.type === 'fighting' ? 'border-red-500' :
                        leader.type === 'poison' ? 'border-purple-500' :
                        leader.type === 'ground' ? 'border-amber-500' :
                        leader.type === 'rock' ? 'border-stone-500' :
                        leader.type === 'bug' ? 'border-lime-400' :
                        leader.type === 'ghost' ? 'border-purple-600' :
                        leader.type === 'flying' ? 'border-sky-400' :
                        leader.type === 'normal' ? 'border-gray-500' :
                        'border-gray-400'
                      } bg-gradient-to-br ${
                        leader.type === 'ice' ? 'from-cyan-100 to-blue-200' :
                        leader.type === 'fire' ? 'from-orange-100 to-red-200' :
                        leader.type === 'water' ? 'from-blue-100 to-cyan-200' :
                        leader.type === 'grass' ? 'from-green-100 to-lime-200' :
                        leader.type === 'electric' ? 'from-yellow-100 to-amber-200' :
                        leader.type === 'psychic' ? 'from-purple-100 to-pink-200' :
                        leader.type === 'dragon' ? 'from-indigo-100 to-purple-200' :
                        leader.type === 'dark' ? 'from-gray-200 to-slate-300' :
                        leader.type === 'steel' ? 'from-slate-100 to-gray-200' :
                        leader.type === 'fairy' ? 'from-pink-100 to-rose-200' :
                        leader.type === 'fighting' ? 'from-red-100 to-orange-200' :
                        leader.type === 'poison' ? 'from-purple-100 to-pink-200' :
                        leader.type === 'ground' ? 'from-amber-100 to-yellow-200' :
                        leader.type === 'rock' ? 'from-stone-100 to-amber-200' :
                        leader.type === 'bug' ? 'from-lime-100 to-green-200' :
                        leader.type === 'ghost' ? 'from-purple-100 to-indigo-200' :
                        leader.type === 'flying' ? 'from-sky-100 to-blue-200' :
                        leader.type === 'normal' ? 'from-stone-100 to-gray-200' :
                        'from-gray-100 to-gray-200'
                      } flex items-center justify-center`}>
                        <img
                          src={getGymLeaderImage(leader.name, 1)}
                          alt={leader.name}
                          className="w-20 h-20 object-contain"
                          loading="lazy"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/gym-leader-placeholder.svg'; }}
                        />
                      </div>
                      <h2 className="text-2xl font-black text-gray-700 mt-2">
                        {leader.name}
                      </h2>
                    </div>

                    {/* Badge Section with Divider Lines */}
                    <div className="relative mb-3">
                      {/* Lines on each side of badge */}
                      <div className="absolute left-0 right-0 top-[27px] flex items-center gap-4">
                        <div className="flex-1 border-t-2 border-gray-300/50"></div>
                        <div className="w-20"></div> {/* Space for badge */}
                        <div className="flex-1 border-t-2 border-gray-300/50"></div>
                      </div>
                      <div className="relative flex flex-col items-center">
                        <div className="bg-white/90 rounded-full p-3 shadow-md z-10">
                          {getBadgeImage(leader.badge) ? (
                            <Image
                              src={getBadgeImage(leader.badge)}
                              alt={leader.badge}
                              width={48}
                              height={48}
                              unoptimized
                              className="object-contain"
                            />
                          ) : (
                            <div className="text-3xl">🏅</div>
                          )}
                        </div>
                        <p className="text-center text-xs font-bold text-gray-600 uppercase tracking-wider mt-2">
                          {leader.badge}
                        </p>
                      </div>
                    </div>
                    
                    {/* Full Team Section with Ace Highlighted */}
                    <div className="flex-1 flex flex-col">
                      <p className="text-xs uppercase tracking-wider text-gray-600 font-bold text-center mb-2">
                        TEAM
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Create 6 slots, fill with team or empty spaces */}
                        {Array.from({ length: 6 }).map((_, index) => {
                          const pokemon = teamData?.team?.[index];
                          const isAce = pokemon && acePokemon && (
                            pokemon.id === acePokemon.id || 
                            pokemon.id === leaderData.signatureId ||
                            pokemon.name === leaderData.signature
                          );
                          
                          if (!pokemon) {
                            // Empty slot - show grey pokeball
                            return (
                              <div key={`empty-${index}`} className="flex flex-col items-center">
                                <div className="bg-white/30 rounded-lg p-2 w-full h-16 flex justify-center items-center border border-gray-200">
                                  <svg className="w-10 h-10 opacity-30" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="50" cy="50" r="45" stroke="#9CA3AF" strokeWidth="4"/>
                                    <path d="M5 50h90" stroke="#9CA3AF" strokeWidth="4"/>
                                    <circle cx="50" cy="50" r="12" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="4"/>
                                    <circle cx="50" cy="50" r="6" fill="#9CA3AF"/>
                                  </svg>
                                </div>
                              </div>
                            );
                          }
                          
                          return (
                            <div key={`${pokemon.id}-${pokemon.level}`} className="flex flex-col items-center">
                              <div className={`rounded-lg p-2 w-full flex justify-center ${
                                isAce 
                                  ? 'bg-white/90 border-2 border-gray-400'
                                  : 'bg-white/50 border border-gray-200'
                              }`}>
                                <img
                                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                                  alt={pokemon.name}
                                  className="w-12 h-12 object-contain"
                                  loading="lazy"
                                />
                              </div>
                              <p className="text-[11px] font-semibold text-gray-700 text-center mt-1 truncate w-full">
                                {pokemon.name}
                              </p>
                              <p className="text-[10px] text-gray-600">Lv. {pokemon.level}</p>
                            </div>
                          );
                        })}
                      </div>
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