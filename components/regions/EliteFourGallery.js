import React, { useState } from 'react';
import Image from 'next/image';
import { getEliteFourImage, getChampionImage } from '../../utils/scrapedImageMapping';
import { TypeBadge } from '../ui/TypeBadge';
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from '../ui/animations';
import { BsTrophy, BsShieldFill, BsStar, BsLightning } from 'react-icons/bs';
import { typeEffectiveness } from '../../data/gymLeaderTeams';
import styles from '../../styles/FlipCard.module.css';

const EliteFourGallery = ({ region, eliteFour, champion, theme }) => {
  const [revealChampion, setRevealChampion] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const [championFlipped, setChampionFlipped] = useState(false);

  // Toggle card flip state
  const toggleFlip = (memberName) => {
    setFlippedCards(prev => ({ ...prev, [memberName]: !prev[memberName] }));
  };

  // Elite Four team data with full Pokemon teams
  const eliteFourData = {
    // Kanto Elite Four
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
    },
    // Johto Elite Four
    'Will': {
      quote: "I have trained all around the world, making my psychic Pokémon powerful.",
      strategy: "Psychic mastery and mind games",
      team: [
        { name: 'Xatu', id: 178, level: 40, types: ['psychic', 'flying'] },
        { name: 'Jynx', id: 124, level: 41, types: ['ice', 'psychic'] },
        { name: 'Exeggutor', id: 103, level: 41, types: ['grass', 'psychic'] },
        { name: 'Slowbro', id: 80, level: 41, types: ['water', 'psychic'] },
        { name: 'Xatu', id: 178, level: 42, types: ['psychic', 'flying'] }
      ]
    },
    'Karen': {
      quote: "Strong Pokémon. Weak Pokémon. That is only the selfish perception of people.",
      strategy: "Dark-type mastery and unpredictability",
      team: [
        { name: 'Umbreon', id: 197, level: 42, types: ['dark'] },
        { name: 'Vileplume', id: 45, level: 42, types: ['grass', 'poison'] },
        { name: 'Gengar', id: 94, level: 45, types: ['ghost', 'poison'] },
        { name: 'Murkrow', id: 198, level: 44, types: ['dark', 'flying'] },
        { name: 'Houndoom', id: 229, level: 47, types: ['dark', 'fire'] }
      ]
    },
    // Hoenn Elite Four
    'Sidney': {
      quote: "I like that look you're giving me. I guess you'll give me a good match.",
      strategy: "Dark-type aggression and mind games",
      team: [
        { name: 'Mightyena', id: 262, level: 46, types: ['dark'] },
        { name: 'Shiftry', id: 275, level: 48, types: ['grass', 'dark'] },
        { name: 'Cacturne', id: 332, level: 46, types: ['grass', 'dark'] },
        { name: 'Crawdaunt', id: 342, level: 48, types: ['water', 'dark'] },
        { name: 'Absol', id: 359, level: 49, types: ['dark'] }
      ]
    },
    'Phoebe': {
      quote: "I did my training on Mt. Pyre. While I trained there, I gained the ability to commune with Ghost-type Pokémon.",
      strategy: "Ghostly tricks and spiritual power",
      team: [
        { name: 'Dusclops', id: 356, level: 48, types: ['ghost'] },
        { name: 'Banette', id: 354, level: 49, types: ['ghost'] },
        { name: 'Sableye', id: 302, level: 50, types: ['dark', 'ghost'] },
        { name: 'Banette', id: 354, level: 49, types: ['ghost'] },
        { name: 'Dusclops', id: 356, level: 51, types: ['ghost'] }
      ]
    },
    'Glacia': {
      quote: "I've traveled from afar to Hoenn so that I may hone my ice skills.",
      strategy: "Ice-cold precision and frozen battlefield",
      team: [
        { name: 'Sealeo', id: 364, level: 50, types: ['ice', 'water'] },
        { name: 'Glalie', id: 362, level: 50, types: ['ice'] },
        { name: 'Sealeo', id: 364, level: 52, types: ['ice', 'water'] },
        { name: 'Glalie', id: 362, level: 52, types: ['ice'] },
        { name: 'Walrein', id: 365, level: 53, types: ['ice', 'water'] }
      ]
    },
    'Drake': {
      quote: "I am the last of the Pokémon League Elite Four. There is no turning back now!",
      strategy: "Dragon-type supremacy and aerial dominance",
      team: [
        { name: 'Shelgon', id: 372, level: 52, types: ['dragon'] },
        { name: 'Altaria', id: 334, level: 54, types: ['dragon', 'flying'] },
        { name: 'Flygon', id: 330, level: 53, types: ['ground', 'dragon'] },
        { name: 'Flygon', id: 330, level: 53, types: ['ground', 'dragon'] },
        { name: 'Salamence', id: 373, level: 55, types: ['dragon', 'flying'] }
      ]
    }
  };

  // Champion data
  const championData = {
    'Blue': {
      quote: "I'm the most powerful trainer in the world!",
      strategy: "Balanced team with no weaknesses",
      team: [
        { name: 'Pidgeot', id: 18, level: 59, types: ['normal', 'flying'] },
        { name: 'Alakazam', id: 65, level: 57, types: ['psychic'] },
        { name: 'Rhydon', id: 112, level: 59, types: ['ground', 'rock'] },
        { name: 'Exeggutor', id: 103, level: 59, types: ['grass', 'psychic'] },
        { name: 'Gyarados', id: 130, level: 59, types: ['water', 'flying'] },
        { name: 'Arcanine', id: 59, level: 61, types: ['fire'] }
      ]
    },
    'Lance': {
      quote: "I still can't believe my dragons lost to you!",
      strategy: "Dragon mastery and overwhelming force",
      team: [
        { name: 'Gyarados', id: 130, level: 44, types: ['water', 'flying'] },
        { name: 'Dragonite', id: 149, level: 47, types: ['dragon', 'flying'] },
        { name: 'Dragonite', id: 149, level: 47, types: ['dragon', 'flying'] },
        { name: 'Aerodactyl', id: 142, level: 48, types: ['rock', 'flying'] },
        { name: 'Charizard', id: 6, level: 48, types: ['fire', 'flying'] },
        { name: 'Dragonite', id: 149, level: 50, types: ['dragon', 'flying'] }
      ]
    },
    'Steven': {
      quote: "I, the Champion, fall in defeat... ",
      strategy: "Steel-type defense and strategic offense",
      team: [
        { name: 'Skarmory', id: 227, level: 57, types: ['steel', 'flying'] },
        { name: 'Claydol', id: 344, level: 55, types: ['ground', 'psychic'] },
        { name: 'Aggron', id: 306, level: 56, types: ['steel', 'rock'] },
        { name: 'Cradily', id: 346, level: 56, types: ['rock', 'grass'] },
        { name: 'Armaldo', id: 348, level: 56, types: ['rock', 'bug'] },
        { name: 'Metagross', id: 376, level: 58, types: ['steel', 'psychic'] }
      ]
    },
    'Wallace': {
      quote: "I, the Champion, fall in defeat... Congratulations!",
      strategy: "Water elegance and type coverage",
      team: [
        { name: 'Wailord', id: 321, level: 57, types: ['water'] },
        { name: 'Tentacruel', id: 73, level: 55, types: ['water', 'poison'] },
        { name: 'Ludicolo', id: 272, level: 56, types: ['water', 'grass'] },
        { name: 'Whiscash', id: 340, level: 56, types: ['water', 'ground'] },
        { name: 'Gyarados', id: 130, level: 56, types: ['water', 'flying'] },
        { name: 'Milotic', id: 350, level: 58, types: ['water'] }
      ]
    },
    'Cynthia': {
      quote: "I won't lose!",
      strategy: "Perfect team composition and tactics",
      team: [
        { name: 'Spiritomb', id: 442, level: 58, types: ['ghost', 'dark'] },
        { name: 'Roserade', id: 407, level: 58, types: ['grass', 'poison'] },
        { name: 'Togekiss', id: 468, level: 60, types: ['fairy', 'flying'] },
        { name: 'Lucario', id: 448, level: 60, types: ['fighting', 'steel'] },
        { name: 'Milotic', id: 350, level: 58, types: ['water'] },
        { name: 'Garchomp', id: 445, level: 62, types: ['dragon', 'ground'] }
      ]
    }
  };

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
    <div className="mt-12">
      <FadeIn>
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2">
            Elite Four & Champion
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400">
            The ultimate challenge awaits at the Pokémon League
          </p>
        </div>
      </FadeIn>

      {/* Elite Four Cards - Flip cards matching gym leader design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {eliteFour.map((member, index) => {
            const memberData = eliteFourData[member.name] || {};
            const weaknesses = typeEffectiveness[member.type]?.weakTo || [];
            const isFlipped = flippedCards[member.name];
            
            return (
              <SlideUp key={member.name}>
                <div 
                  className={`relative h-[700px] ${styles.perspective1000} cursor-pointer`}
                  onClick={() => toggleFlip(member.name)}
                >
                  <div className={`${styles.flipCard} ${isFlipped ? styles.flipped : ''}`}>
                    {/* Front Side - Just the Elite Four member image */}
                    <div className={styles.flipCardFront}>
                      <div className={`relative h-full w-full rounded-3xl overflow-hidden ${
                        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
                      } shadow-2xl`}>
                        <Image
                          src={getEliteFourImage(member.name, 1)}
                          alt={member.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const currentSrc = e.target.src;
                            if (currentSrc.includes('-1.png')) {
                              e.target.src = `/images/scraped/elite-four/${member.name.toLowerCase()}-2.png`;
                            } else if (currentSrc.includes('-2.png')) {
                              e.target.src = `/images/scraped/elite-four/${member.name.toLowerCase()}-3.png`;
                            } else {
                              e.target.src = `/images/elite-four/${member.name.toLowerCase()}.png`;
                            }
                          }}
                        />
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        
                        {/* Elite Four indicator */}
                        <div className="absolute top-6 left-6 flex items-center gap-3">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center shadow-xl border-4 border-white/30">
                            <span className="text-white font-black text-3xl">E{index + 1}</span>
                          </div>
                          <BsShieldFill className="text-5xl text-purple-400/80" />
                        </div>
                        
                        {/* Flip indicator */}
                        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-2 shadow-lg">
                          <span className="text-gray-900 font-bold">Click to flip</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Back Side - Information with cutting through effect */}
                    <div className={styles.flipCardBack}>
                      <div className={`relative h-full w-full rounded-3xl overflow-hidden ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                      } shadow-2xl`}>
                        {/* Type-themed background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${getTypeGradient(member.type)} opacity-10`} />
                        
                        {/* Cutting through Elite Four member image */}
                        <div className="absolute left-0 top-0 h-full w-[280px] z-10">
                          <div className="relative h-full w-full">
                            <Image
                              src={getEliteFourImage(member.name, 1)}
                              alt={member.name}
                              fill
                              className="object-cover"
                              style={{ 
                                clipPath: 'polygon(0 0, 85% 0, 100% 100%, 0 100%)',
                                filter: 'drop-shadow(10px 0 20px rgba(0,0,0,0.3))'
                              }}
                              onError={(e) => {
                                const currentSrc = e.target.src;
                                if (currentSrc.includes('-1.png')) {
                                  e.target.src = `/images/scraped/elite-four/${member.name.toLowerCase()}-2.png`;
                                } else if (currentSrc.includes('-2.png')) {
                                  e.target.src = `/images/scraped/elite-four/${member.name.toLowerCase()}-3.png`;
                                } else {
                                  e.target.src = `/images/elite-four/${member.name.toLowerCase()}.png`;
                                }
                              }}
                            />
                            {/* Edge gradient for blending */}
                            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent via-black/20 to-transparent" />
                          </div>
                        </div>

                        {/* Content flowing around the image */}
                        <div className="relative h-full pl-[250px] pr-8 py-8 overflow-y-auto">
                          {/* Header section */}
                          <div className="mb-6">
                            {/* Elite Four Number Badge */}
                            <div className="inline-flex items-center gap-2 mb-3">
                              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center shadow-xl">
                                <span className="text-white font-black text-2xl">E{index + 1}</span>
                              </div>
                              <BsShieldFill className="text-4xl text-purple-400" />
                            </div>
                            
                            <h3 className="text-4xl font-black mb-2" style={{ fontFamily: '"Comic Sans MS", "Marker Felt", fantasy' }}>
                              {member.name}
                            </h3>
                            <p className="text-xl text-gray-600 dark:text-gray-400 mb-3">Elite Four Member</p>
                            
                            {/* Type Badge */}
                            <div className="flex items-center gap-3 mb-4">
                              <TypeBadge type={member.type} size="lg" />
                              <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                                {member.type.charAt(0).toUpperCase() + member.type.slice(1)}-type Specialist
                              </span>
                            </div>
                          </div>

                          {/* Quote */}
                          <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
                            <p className="text-lg italic text-gray-700 dark:text-gray-300">
                              "{memberData.quote || `Master of ${member.type}-type Pokémon!`}"
                            </p>
                          </div>

                          {/* Strategy & Signature */}
                          <div className="mb-5 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Battle Strategy</p>
                              <p className="text-base font-bold">{memberData.strategy || 'Type mastery'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Signature Pokémon</p>
                              <p className="text-base font-bold">{member.signature}</p>
                            </div>
                          </div>

                          {/* Weak Against Section */}
                          {weaknesses.length > 0 && (
                            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
                              <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">WEAK AGAINST:</p>
                              <div className="flex flex-wrap gap-2">
                                {weaknesses.map(type => (
                                  <TypeBadge key={type} type={type} size="sm" />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Pokemon Team Grid */}
                          {memberData.team && (
                            <div>
                              <h4 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">
                                Full Team
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {memberData.team.map((pokemon, idx) => (
                                  <div key={idx} className="bg-white/50 dark:bg-black/30 rounded-lg p-2 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                      <div className="relative w-12 h-12 flex-shrink-0">
                                        <Image
                                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                                          alt={pokemon.name}
                                          fill
                                          className="object-contain"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{pokemon.name}</p>
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs text-gray-600 dark:text-gray-400">Lv.{pokemon.level}</span>
                                          {pokemon.types.map(type => (
                                            <span key={type} className={`text-xs px-1.5 py-0.5 rounded bg-gradient-to-r ${getTypeGradient(type)} text-white`}>
                                              {type}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SlideUp>
            );
          })}
      </div>

      {/* Champion Section */}
      {champion && (
          <div className="relative">
            {/* Reveal Button */}
            {!revealChampion && (
              <FadeIn>
                <div className="text-center mb-12">
                  <button
                    onClick={() => setRevealChampion(true)}
                    className={`px-12 py-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-black text-2xl hover:scale-110 transition-all duration-300 shadow-2xl animate-pulse`}
                  >
                    <div className="flex items-center gap-3">
                      <BsTrophy className="text-3xl" />
                      <span>REVEAL THE CHAMPION</span>
                      <BsTrophy className="text-3xl" />
                    </div>
                  </button>
                </div>
              </FadeIn>
            )}

            {/* Champion Card - Flippable design */}
            {revealChampion && (
              <SlideUp>
                <div 
                  className={`relative h-[1000px] ${styles.perspective1000} cursor-pointer`}
                  onClick={() => setChampionFlipped(!championFlipped)}
                >
                  <div className={`${styles.flipCard} ${championFlipped ? styles.flipped : ''}`}>
                    {/* Front Side - Just the champion image with effects */}
                    <div className={styles.flipCardFront}>
                      <div className={`relative h-full w-full rounded-3xl overflow-hidden ${
                        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                      } shadow-2xl`}>
                        {/* Animated gradient background with stars */}
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-red-500/20">
                          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/30 to-transparent animate-pulse" />
                          {/* Sparkle effects */}
                          <div className="absolute top-10 left-10">
                            <BsStar className="text-4xl text-yellow-400/50 animate-ping" />
                          </div>
                          <div className="absolute top-20 right-20">
                            <BsStar className="text-3xl text-yellow-400/40 animate-ping animation-delay-200" />
                          </div>
                          <div className="absolute bottom-20 left-20">
                            <BsStar className="text-5xl text-yellow-400/30 animate-ping animation-delay-400" />
                          </div>
                        </div>

                        {/* Champion Image */}
                        <Image
                          src={getChampionImage(champion.name, 1)}
                          alt={champion.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Champion Crown Animation */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 animate-bounce">
                          <BsTrophy className="text-8xl text-yellow-400 drop-shadow-2xl" />
                        </div>

                        {/* Champion Title */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
                          <h3 className="text-7xl font-black mb-2 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent animate-pulse" style={{ fontFamily: '"Comic Sans MS", "Marker Felt", fantasy' }}>
                            CHAMPION
                          </h3>
                          <h4 className="text-5xl font-bold text-white drop-shadow-2xl">{champion.name}</h4>
                        </div>
                        
                        {/* Flip indicator */}
                        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-2 shadow-lg">
                          <span className="text-gray-900 font-bold">Click to flip</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Back Side - Information with cutting through effect */}
                    <div className={styles.flipCardBack}>
                      <div className={`relative h-full w-full rounded-3xl overflow-hidden ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                      } shadow-2xl`}>
                        {/* Golden background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-orange-500/10 to-red-500/10" />
                        
                        {/* Cutting through champion image */}
                        <div className="absolute left-0 top-0 h-full w-[400px] z-10">
                          <div className="relative h-full w-full">
                            <Image
                              src={getChampionImage(champion.name, 1)}
                              alt={champion.name}
                              fill
                              className="object-cover"
                              style={{ 
                                clipPath: 'polygon(0 0, 85% 0, 100% 100%, 0 100%)',
                                filter: 'drop-shadow(10px 0 20px rgba(0,0,0,0.3))'
                              }}
                              onError={(e) => {
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
                            {/* Edge gradient for blending */}
                            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent via-black/20 to-transparent" />
                          </div>
                        </div>

                        {/* Content flowing around the image */}
                        <div className="relative h-full pl-[380px] pr-8 py-8 overflow-y-auto">
                          {/* Header section */}
                          <div className="mb-6">
                            {/* Champion Badge */}
                            <div className="inline-flex items-center gap-2 mb-3">
                              <BsTrophy className="text-6xl text-yellow-400" />
                            </div>
                            
                            <h3 className="text-6xl font-black mb-2 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent" style={{ fontFamily: '"Comic Sans MS", "Marker Felt", fantasy' }}>
                              CHAMPION
                            </h3>
                            <h4 className="text-4xl font-bold mb-4">{champion.name}</h4>
                          </div>

                          {championData[champion.name] && (
                            <>
                              {/* Quote Section */}
                              <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-2 border-yellow-400/30">
                                <p className="text-xl italic font-semibold text-gray-800 dark:text-gray-200">
                                  "{championData[champion.name].quote}"
                                </p>
                              </div>

                              {/* Strategy and Info Grid */}
                              <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Battle Strategy</p>
                                  <p className="text-xl font-black">{championData[champion.name].strategy}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Signature Pokémon</p>
                                  <p className="text-xl font-black">{champion.signature}</p>
                                </div>
                              </div>

                              {/* Full Champion Team */}
                              <div className="mb-6">
                                <h4 className="text-2xl font-black mb-4">Champion's Elite Team</h4>
                                <div className="grid grid-cols-2 gap-3">
                                  {championData[champion.name].team.map((pokemon, idx) => (
                                    <div key={idx} className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-3 border-2 border-yellow-400/30">
                                      <div className="flex items-center gap-3">
                                        <div className="relative w-16 h-16 flex-shrink-0">
                                          <Image
                                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                                            alt={pokemon.name}
                                            fill
                                            className="object-contain"
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-black text-base">{pokemon.name}</p>
                                          <p className="text-sm text-gray-600 dark:text-gray-400 font-bold">Lv. {pokemon.level}</p>
                                          <div className="flex gap-1 mt-1">
                                            {pokemon.types.map(type => (
                                              <span key={type} className={`text-xs px-2 py-0.5 rounded bg-gradient-to-r ${getTypeGradient(type)} text-white font-semibold`}>
                                                {type}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Type Coverage Analysis */}
                              <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800">
                                <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">CHAMPION'S TYPE COVERAGE</p>
                                <div className="flex flex-wrap gap-2">
                                  {[...new Set(championData[champion.name].team.flatMap(p => p.types))].map(type => (
                                    <TypeBadge key={type} type={type} size="sm" />
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SlideUp>
            )}
          </div>
        )}
    </div>
  );
};

export default EliteFourGallery;
