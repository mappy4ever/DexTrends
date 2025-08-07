import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getEliteFourImage, getChampionImage } from '../../utils/scrapedImageMapping';
import { TypeBadge } from '../ui/TypeBadge';
import { typeEffectiveness } from '../../utils/pokemonutils';
import { BsTrophy, BsShieldFill, BsStar } from 'react-icons/bs';

interface EliteFourMember {
  name: string;
  type: string;
  signature?: string;
}

interface Champion {
  name: string;
  signature?: string;
}

interface Region {
  id: string;
}

interface EliteFourGridProps {
  region: Region;
  eliteFour: EliteFourMember[];
  champion: Champion | null;
  theme: string;
}

interface MemberData {
  quote: string;
  strategy: string;
  team: Array<{
    name: string;
    id: number;
    level: number;
    types: string[];
  }>;
}

const EliteFourGrid: React.FC<EliteFourGridProps> = ({ region, eliteFour, champion, theme }) => {
  const [revealChampion, setRevealChampion] = useState(false);
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

  // Elite Four data
  const eliteFourData: Record<string, MemberData> = {
    'Lorelei': {
      quote: "Your Pokémon will be at my mercy when they are frozen solid!",
      strategy: "Freezing tactics with Ice-type precision",
      team: [
        { name: 'Dewgong', id: 87, level: 52, types: ['water', 'ice'] },
        { name: 'Cloyster', id: 91, level: 51, types: ['water', 'ice'] },
        { name: 'Slowbro', id: 80, level: 52, types: ['water', 'psychic'] },
        { name: 'Jynx', id: 124, level: 54, types: ['ice', 'psychic'] },
        { name: 'Lapras', id: 131, level: 54, types: ['water', 'ice'] }
      ]
    },
    'Bruno': {
      quote: "We will grind you down with our superior power!",
      strategy: "Raw fighting power and physical dominance",
      team: [
        { name: 'Onix', id: 95, level: 51, types: ['rock', 'ground'] },
        { name: 'Hitmonchan', id: 107, level: 53, types: ['fighting'] },
        { name: 'Hitmonlee', id: 106, level: 53, types: ['fighting'] },
        { name: 'Onix', id: 95, level: 54, types: ['rock', 'ground'] },
        { name: 'Machamp', id: 68, level: 56, types: ['fighting'] }
      ]
    },
    'Agatha': {
      quote: "I'll show you how a real Trainer battles!",
      strategy: "Ghostly tricks and status conditions",
      team: [
        { name: 'Gengar', id: 94, level: 54, types: ['ghost', 'poison'] },
        { name: 'Golbat', id: 42, level: 54, types: ['poison', 'flying'] },
        { name: 'Haunter', id: 93, level: 53, types: ['ghost', 'poison'] },
        { name: 'Arbok', id: 24, level: 56, types: ['poison'] },
        { name: 'Gengar', id: 94, level: 58, types: ['ghost', 'poison'] }
      ]
    },
    'Lance': {
      quote: "You still need more training. Come back when you get stronger!",
      strategy: "Dragon supremacy and overwhelming force",
      team: [
        { name: 'Gyarados', id: 130, level: 56, types: ['water', 'flying'] },
        { name: 'Dragonair', id: 148, level: 54, types: ['dragon'] },
        { name: 'Dragonair', id: 148, level: 54, types: ['dragon'] },
        { name: 'Aerodactyl', id: 142, level: 58, types: ['rock', 'flying'] },
        { name: 'Dragonite', id: 149, level: 60, types: ['dragon', 'flying'] }
      ]
    }
  };

  const championData: Record<string, MemberData> = {
    'Blue': {
      quote: "Smell ya later!",
      strategy: "Balanced team with no weaknesses",
      team: [
        { name: 'Pidgeot', id: 18, level: 59, types: ['normal', 'flying'] },
        { name: 'Alakazam', id: 65, level: 57, types: ['psychic'] },
        { name: 'Rhydon', id: 112, level: 59, types: ['ground', 'rock'] },
        { name: 'Exeggutor', id: 103, level: 59, types: ['grass', 'psychic'] },
        { name: 'Gyarados', id: 130, level: 59, types: ['water', 'flying'] },
        { name: 'Charizard', id: 6, level: 61, types: ['fire', 'flying'] }
      ]
    }
  };

  return (
    <div className="space-y-12">
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
      
      {/* Elite Four Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {eliteFour.map((member, index) => {
          const memberData = eliteFourData[member.name];
          const weaknesses = (typeEffectiveness as any)[member.type]?.weakTo || [];
          
          return (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative h-[550px] cursor-pointer perspective-1000"
              onClick={() => handleCardFlip(index)}
            >
              <div className={`relative w-full h-full transition-all duration-700 transform-style-preserve-3d ${
                flippedCards.has(index) ? 'rotate-y-180' : ''
              }`}>
                {/* Front of card - Full image with minimal info */}
                <div className="absolute inset-0 backface-hidden">
                  <div className="relative h-full bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-purple-400/30">
                    {/* Full card image */}
                    <Image
                      src={getEliteFourImage(member.name, 1)}
                      alt={member.name}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/95 via-purple-900/30 to-transparent" />
                    
                    {/* Elite Four Badge */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                      <BsShieldFill className="text-white text-sm" />
                      <span className="text-white font-bold text-sm">Elite {index + 1}</span>
                    </div>
                    
                    {/* Type Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <TypeBadge type={member.type} size="lg" variant="gradient" />
                    </div>
                    
                    {/* Minimal info at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                      <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                        {member.name}
                      </h3>
                      <p className="text-lg text-purple-200 font-medium drop-shadow-lg">
                        Elite Four
                      </p>
                      <p className="text-sm text-purple-300 mt-1 drop-shadow-lg">
                        {member.type.charAt(0).toUpperCase() + member.type.slice(1)} Master
                      </p>
                      
                      {/* Flip indicator */}
                      <div className="mt-4 text-center">
                        <p className="text-xs text-purple-400 animate-pulse">
                          Click to see details
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Back of card - All details */}
                <div className="absolute inset-0 rotate-y-180 backface-hidden">
                  <div className="relative h-full bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl shadow-2xl overflow-hidden border border-purple-400/30 p-8">
                    {/* Glass morphism overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-purple-500/5 rounded-3xl" />
                    
                    <div className="relative z-10 h-full flex flex-col">
                      {/* Header */}
                      <div className="text-center mb-4">
                        <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                        <p className="text-sm text-purple-200">Elite Four • {member.type.charAt(0).toUpperCase() + member.type.slice(1)} Master</p>
                      </div>
                      
                      {/* Quote */}
                      {memberData && (
                        <div className="mb-4">
                          <p className="text-sm italic text-purple-100 text-center">
                            "{memberData.quote}"
                          </p>
                        </div>
                      )}
                      
                      {/* Signature Pokemon */}
                      {member.signature && memberData && (
                        <div className="mb-4 p-3 rounded-xl bg-purple-800/30 backdrop-blur-sm border border-purple-400/30">
                          <p className="text-xs font-semibold text-purple-200 text-center mb-2">
                            Signature Pokémon
                          </p>
                          <div className="flex items-center justify-center gap-3">
                            <img
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                                memberData.team.find(p => p.name === member.signature)?.id || 1
                              }.png`}
                              alt={member.signature}
                              className="w-16 h-16 object-contain"
                            />
                            <span className="font-bold text-white">{member.signature}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Team Preview */}
                      {memberData && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-purple-200 text-center mb-3">
                            Full Team
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {memberData.team.slice(0, 6).map((pokemon, idx) => (
                              <div key={idx} className="bg-purple-800/30 backdrop-blur-sm rounded-lg p-2">
                                <img
                                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                                  alt={pokemon.name}
                                  className="w-12 h-12 mx-auto object-contain"
                                />
                                <p className="text-xs text-center text-purple-200 mt-1">
                                  Lv.{pokemon.level}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Strategy */}
                      {memberData && (
                        <div className="mb-4 text-center py-2 px-4 rounded-xl bg-purple-800/30 backdrop-blur-sm border border-purple-400/30">
                          <p className="text-xs font-semibold text-purple-200 mb-1">
                            Battle Strategy
                          </p>
                          <p className="text-sm text-purple-100">
                            {memberData.strategy}
                          </p>
                        </div>
                      )}
                      
                      {/* Weaknesses */}
                      <div className="text-center mt-auto">
                        <p className="text-xs font-semibold text-purple-200 mb-2">
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
                        <p className="text-xs text-purple-400 animate-pulse">
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

      {/* Champion Section */}
      {champion && (
        <div className="mt-12">
          {!revealChampion ? (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                THE FINAL CHALLENGE
              </h4>
              <button
                onClick={() => setRevealChampion(true)}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-xl hover:scale-110 transition-all duration-300 shadow-xl border border-yellow-400/50 hover:shadow-2xl hover:shadow-yellow-500/50"
              >
                <div className="flex items-center gap-3">
                  <BsTrophy className="text-2xl" />
                  <span>REVEAL THE CHAMPION</span>
                  <BsTrophy className="text-2xl" />
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative max-w-2xl mx-auto">
                <div className="relative h-[600px] bg-gradient-to-br from-yellow-500/90 via-amber-600/90 to-orange-600/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-2 border-yellow-400/50">
                  {/* Full card champion image */}
                  <Image
                    src={getChampionImage(champion.name, 1)}
                    alt={champion.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 672px"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder-trainer.png';
                    }}
                  />
                  
                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-radial from-yellow-400/20 via-transparent to-transparent opacity-60" />
                  
                  {/* Champion Crown */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-gradient-to-r from-yellow-600 to-amber-700 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl">
                    <BsTrophy className="text-yellow-200 text-2xl" />
                    <span className="text-white font-black text-xl tracking-wider">CHAMPION</span>
                    <BsTrophy className="text-yellow-200 text-2xl" />
                  </div>
                  
                  {/* Champion info at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-10 z-10">
                    <h3 className="text-5xl font-black text-white mb-3 drop-shadow-lg text-center">
                      {champion.name}
                    </h3>
                    <p className="text-2xl text-yellow-100 font-medium drop-shadow-lg text-center mb-4">
                      Pokémon League Champion
                    </p>
                    
                    {championData[champion.name] && (
                      <>
                        <p className="text-lg italic text-yellow-50 text-center mb-6 drop-shadow-lg">
                          "{championData[champion.name].quote}"
                        </p>
                        
                        {/* Champion team preview */}
                        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-yellow-400/30">
                          <p className="text-sm font-bold text-yellow-200 mb-3 text-center">
                            Champion's Team
                          </p>
                          <div className="grid grid-cols-6 gap-2">
                            {championData[champion.name].team.map((pokemon, idx) => (
                              <div key={idx} className="text-center">
                                <img
                                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                                  alt={pokemon.name}
                                  className="w-16 h-16 mx-auto object-contain filter drop-shadow-lg"
                                />
                                <p className="text-xs text-yellow-100 mt-1">
                                  Lv.{pokemon.level}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default EliteFourGrid;