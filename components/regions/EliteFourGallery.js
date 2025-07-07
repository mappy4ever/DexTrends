import React, { useState } from 'react';
import Image from 'next/image';
import { getEliteFourImage, getChampionImage } from '../../utils/scrapedImageMapping';
import { TypeBadge } from '../ui/TypeBadge';
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from '../ui/animations';
import { BsTrophy, BsShieldFill } from 'react-icons/bs';

const EliteFourGallery = ({ region, eliteFour, champion, theme }) => {
  const [revealChampion, setRevealChampion] = useState(false);

  const getTypeGradient = (type) => {
    const gradients = {
      normal: 'from-gray-400 to-gray-600',
      fire: 'from-red-400 to-orange-600',
      water: 'from-blue-400 to-blue-600',
      electric: 'from-yellow-300 to-yellow-600',
      grass: 'from-green-400 to-green-600',
      ice: 'from-blue-300 to-cyan-500',
      fighting: 'from-red-600 to-red-800',
      poison: 'from-purple-400 to-purple-600',
      ground: 'from-yellow-600 to-yellow-800',
      flying: 'from-blue-300 to-indigo-400',
      psychic: 'from-pink-400 to-pink-600',
      bug: 'from-green-300 to-green-500',
      rock: 'from-yellow-700 to-yellow-900',
      ghost: 'from-purple-600 to-purple-800',
      dragon: 'from-indigo-600 to-purple-700',
      dark: 'from-gray-700 to-gray-900',
      steel: 'from-gray-400 to-gray-600',
      fairy: 'from-pink-300 to-pink-500'
    };
    return gradients[type] || 'from-gray-400 to-gray-600';
  };

  // Don't render if no Elite Four data
  if (!eliteFour || eliteFour.length === 0) {
    return null;
  }

  return (
    <div className={`py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">
              Elite Four & Champion
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              The ultimate challenge awaits at the Pokémon League
            </p>
          </div>
        </FadeIn>

        {/* Elite Four Grid */}
        <StaggeredChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {eliteFour.map((member, index) => (
            <SlideUp key={member.name}>
              <CardHover>
                <div className={`relative h-[600px] rounded-2xl overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                } shadow-xl group`}>
                  {/* Type-themed background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getTypeGradient(member.type)} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  
                  {/* Member Image */}
                  <div className="relative h-[350px] overflow-hidden">
                    <Image
                      src={getEliteFourImage(member.name, 1)}
                      alt={member.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // Try different numbered versions
                        const currentSrc = e.target.src;
                        if (currentSrc.includes('-1.png')) {
                          e.target.src = `/images/scraped/elite-four/${member.name.toLowerCase()}-2.png`;
                        } else if (currentSrc.includes('-2.png')) {
                          e.target.src = `/images/scraped/elite-four/${member.name.toLowerCase()}-3.png`;
                        } else {
                          // Hide image if no alternatives work
                          e.target.style.display = 'none';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    
                    {/* Elite Four Number */}
                    <div className="absolute top-4 left-4 w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                      <span className="text-white font-bold text-2xl">E{index + 1}</span>
                    </div>

                    {/* Shield Icon */}
                    <div className="absolute top-4 right-4">
                      <BsShieldFill className="text-4xl text-white/80" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative p-6">
                    <h3 className="text-3xl font-bold mb-2">{member.name}</h3>
                    <div className="mb-3">
                      <TypeBadge type={member.type} size="md" />
                    </div>
                    
                    {/* Signature Pokemon */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Signature Pokémon</p>
                      <p className="text-xl font-bold">{member.signature}</p>
                    </div>
                    
                    {/* Elite Four Title */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getTypeGradient(member.type)} text-white font-semibold`}>
                      <BsShieldFill className="text-sm" />
                      <span>Elite Four</span>
                    </div>

                    {/* Elite Four Badge */}
                    <div className="absolute bottom-4 right-4">
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getTypeGradient(member.type)} opacity-20`} />
                    </div>
                  </div>
                </div>
              </CardHover>
            </SlideUp>
          ))}
        </StaggeredChildren>

        {/* Champion Section */}
        {champion && (
          <div className="relative">
            {/* Reveal Button */}
            {!revealChampion && (
              <FadeIn>
                <div className="text-center mb-8">
                  <button
                    onClick={() => setRevealChampion(true)}
                    className={`px-8 py-4 rounded-full bg-gradient-to-r ${region.color} text-white font-bold text-xl hover:scale-105 transition-transform shadow-xl`}
                  >
                    Reveal the Champion
                  </button>
                </div>
              </FadeIn>
            )}

            {/* Champion Card */}
            {revealChampion && (
              <SlideUp>
                <div className={`relative rounded-3xl overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                } shadow-2xl`}>
                  {/* Animated gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${region.color} opacity-20`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 to-transparent animate-pulse" />
                  </div>

                  <div className="relative grid md:grid-cols-2 gap-8 p-8">
                    {/* Champion Image */}
                    <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
                      <Image
                        src={getChampionImage(champion.name, 1)}
                        alt={champion.name}
                        fill
                        className="object-contain hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Try different numbered versions
                          const currentSrc = e.target.src;
                          if (currentSrc.includes('-1.png')) {
                            e.target.src = `/images/scraped/champions/${champion.name.toLowerCase()}-2.png`;
                          } else if (currentSrc.includes('-2.png')) {
                            e.target.src = `/images/scraped/champions/${champion.name.toLowerCase()}-3.png`;
                          } else {
                            e.target.src = `/images/champions/${champion.name.toLowerCase()}.png`;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      
                      {/* Champion Crown */}
                      <div className="absolute top-8 left-1/2 -translate-x-1/2">
                        <BsTrophy className="text-6xl text-yellow-400 drop-shadow-2xl" />
                      </div>
                    </div>

                    {/* Champion Details */}
                    <div className="flex flex-col justify-center">
                      <div className="mb-8">
                        <h3 className="text-5xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                          CHAMPION
                        </h3>
                        <h4 className="text-4xl font-bold mb-4">{champion.name}</h4>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Team Type</p>
                          <p className="text-2xl font-semibold">{champion.team}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Signature Pokémon</p>
                          <p className="text-2xl font-semibold">{champion.signature}</p>
                        </div>
                      </div>

                      {/* Champion Quote */}
                      <div className={`p-6 rounded-xl bg-gradient-to-r ${region.color} text-white`}>
                        <p className="text-lg italic">
                          "Being the Champion means accepting every challenge that comes your way!"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl" />
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl" />
                </div>
              </SlideUp>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EliteFourGallery;