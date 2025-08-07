import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getGymLeaderImage, getBadgeImage } from '../../utils/scrapedImageMapping';
import { TypeBadge } from '../ui/TypeBadge';
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
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
      {gymLeaders.map((leader, index) => {
        const leaderData = gymLeaderData[leader.name] || {} as GymLeaderData;
        const teamData = (gymLeaderTeams as any)[leader.name] as TeamData;
        const weaknesses = teamData?.weakAgainst || (typeEffectiveness as any)[leader.type]?.weakTo || [];
        
        return (
          <motion.div
            key={leader.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative h-[500px] cursor-pointer perspective-1000"
            onClick={() => handleCardFlip(index)}
          >
            <div className={`relative w-full h-full transition-all duration-700 transform-style-preserve-3d ${
              flippedCards.has(index) ? 'rotate-y-180' : ''
            }`}>
              {/* Front of card - Full image with minimal info */}
              <div className="absolute inset-0 backface-hidden">
                <div className="relative h-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50">
                  {/* Full card image */}
                  <Image
                    src={getGymLeaderImage(leader.name, 1)}
                    alt={leader.name}
                    fill
                    className="object-cover object-top"
                    priority={index < 4}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder-trainer.png';
                    }}
                  />
                  
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  {/* Badge Number */}
                  <div className="absolute top-4 left-4 z-20 w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    {index + 1}
                  </div>
                  
                  {/* Type Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <TypeBadge type={leader.type} size="lg" variant="gradient" />
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
              <div className="absolute inset-0 rotate-y-180 backface-hidden">
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
                            className="object-contain filter drop-shadow-lg"
                          />
                        </div>
                      )}
                      <p className="font-bold text-white">{leader.badge}</p>
                    </div>
                    
                    {/* Quote */}
                    <div className="mb-4">
                      <p className="text-sm italic text-gray-300 text-center">
                        "{leaderData.quote}"
                      </p>
                    </div>
                    
                    {/* Signature Pokemon */}
                    {leaderData.signature && (
                      <div className="mb-4 p-3 rounded-xl bg-gray-800/50 border border-gray-700">
                        <p className="text-xs font-semibold text-gray-400 text-center mb-2">
                          Signature Pokémon
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          <img
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${leaderData.signatureId}.png`}
                            alt={leaderData.signature}
                            className="w-16 h-16 object-contain"
                          />
                          <span className="font-bold text-white">{leaderData.signature}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Weaknesses */}
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-400 mb-2">
                        Weak Against
                      </p>
                      <div className="flex justify-center flex-wrap gap-2">
                        {weaknesses.slice(0, 3).map((type) => (
                          <TypeBadge key={type} type={type} size="sm" />
                        ))}
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