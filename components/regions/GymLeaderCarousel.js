import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { getGymLeaderImage, getBadgeImage } from '../../utils/scrapedImageMapping';
import { TypeBadge } from '../ui/TypeBadge';
import { FadeIn, CardHover } from '../ui/animations';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

const GymLeaderCarousel = ({ region, gymLeaders, theme }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef(null);

  // Gym leader quotes/facts and signature Pokemon
  const gymLeaderData = {
    'Brock': { quote: "I believe in rock-hard determination!", signature: "Onix", signatureId: 95, strategy: "Defensive rock formations" },
    'Misty': { quote: "My policy is an all-out offensive with water-type Pokémon!", signature: "Starmie", signatureId: 121, strategy: "Swift aquatic strikes" },
    'Lt. Surge': { quote: "I tell you, electric Pokémon saved me during the war!", signature: "Raichu", signatureId: 26, strategy: "High-voltage offense" },
    'Erika': { quote: "Oh... I must have dozed off. Welcome to Celadon Gym.", signature: "Vileplume", signatureId: 45, strategy: "Status condition tactics" },
    'Koga': { quote: "A ninja should be able to track his prey through darkness!", signature: "Weezing", signatureId: 110, strategy: "Poison and evasion" },
    'Sabrina': { quote: "I had a vision of your arrival!", signature: "Alakazam", signatureId: 65, strategy: "Psychic domination" },
    'Blaine': { quote: "Hah! Hope you brought Burn Heal!", signature: "Arcanine", signatureId: 59, strategy: "Burning intensity" },
    'Giovanni': { quote: "So! I must say, I am impressed you got here.", signature: "Rhyhorn", signatureId: 111, strategy: "Ground-type supremacy" },
    'Falkner': { quote: "I'll show you the real power of the magnificent bird Pokémon!", signature: "Pidgeot", signatureId: 18, strategy: "Aerial superiority" },
    'Bugsy': { quote: "Bug Pokémon are the best!", signature: "Scyther", signatureId: 123, strategy: "Speed and precision" },
    'Whitney': { quote: "Everyone was into Pokémon, so I got into it, too!", signature: "Miltank", signatureId: 241, strategy: "Rollout devastation" },
    'Morty': { quote: "I can see what you cannot!", signature: "Gengar", signatureId: 94, strategy: "Ghostly misdirection" },
    'Chuck': { quote: "WAHAHAH! I knew you'd come to my gym!", signature: "Machamp", signatureId: 68, strategy: "Raw fighting power" },
    'Jasmine': { quote: "Um... Thank you for your help at the Lighthouse...", signature: "Steelix", signatureId: 208, strategy: "Steel wall defense" },
    'Pryce': { quote: "Pokémon have many experiences in their lives. I, too, have seen and suffered much.", signature: "Piloswine", signatureId: 221, strategy: "Ice age endurance" },
    'Clair': { quote: "I am Clair. The world's best dragon master.", signature: "Kingdra", signatureId: 230, strategy: "Dragon fury" },
    // Hoenn
    'Roxanne': { quote: "I became a Gym Leader so that I may apply what I learned at the Trainer's School.", signature: "Nosepass", signatureId: 299, strategy: "Rock-solid defense" },
    'Brawly': { quote: "A big wave is coming! Let's see if you can ride it!", signature: "Makuhita", signatureId: 296, strategy: "Fighting spirit" },
    'Wattson': { quote: "Wahahahah! Now, that is amusing!", signature: "Magneton", signatureId: 82, strategy: "Electric personality" },
    'Flannery': { quote: "Welcome... Oh, wait. I'm the Gym Leader here!", signature: "Torkoal", signatureId: 324, strategy: "Burning passion" },
    'Norman': { quote: "I'm surprised you managed to get past my gym trainers.", signature: "Slaking", signatureId: 289, strategy: "Balanced power" },
    'Winona': { quote: "I have become one with bird Pokémon and have soared the skies.", signature: "Altaria", signatureId: 334, strategy: "Graceful flight" },
    'Tate': { quote: "We can make...", signature: "Solrock", signatureId: 338, strategy: "Psychic twin power" },
    'Liza': { quote: "...Any attack ineffective!", signature: "Lunatone", signatureId: 337, strategy: "Psychic twin power" },
    'Juan': { quote: "Please, you shall bear witness to our artistry!", signature: "Kingdra", signatureId: 230, strategy: "Water elegance" },
    'Wallace': { quote: "I, the Champion, shall show you the power of my Water types!", signature: "Milotic", signatureId: 350, strategy: "Beauty and power" },
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

  // Handle carousel navigation
  const scrollToLeader = (index) => {
    if (carouselRef.current) {
      const cardWidth = 600; // Updated card width
      const scrollPosition = index * (cardWidth + 24); // 24px gap
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  };

  const handlePrev = () => {
    const newIndex = activeIndex > 0 ? activeIndex - 1 : gymLeaders.length - 1;
    scrollToLeader(newIndex);
  };

  const handleNext = () => {
    const newIndex = activeIndex < gymLeaders.length - 1 ? activeIndex + 1 : 0;
    scrollToLeader(newIndex);
  };

  // Touch/Mouse drag handling
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">
              Gym Leader Challenge
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Defeat all {gymLeaders.length} Gym Leaders to become the Champion
            </p>
          </div>
        </FadeIn>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-4 shadow-xl hover:scale-110 transition-transform"
          >
            <BsChevronLeft className="text-2xl" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-4 shadow-xl hover:scale-110 transition-transform"
          >
            <BsChevronRight className="text-2xl" />
          </button>

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-8 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleDragEnd}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {gymLeaders.map((leader, index) => (
              <div
                key={leader.name}
                className="flex-shrink-0 w-[600px] relative"
              >
                <CardHover>
                  <div className={`relative h-[900px] rounded-3xl overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } shadow-2xl`}>
                    {/* Type-themed background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${getTypeGradient(leader.type)} opacity-20`} />
                    
                    {/* Leader Image */}
                    <div className="relative h-[550px] overflow-hidden">
                      <Image
                        src={getGymLeaderImage(leader.name, 1)}
                        alt={leader.name}
                        fill
                        className="object-contain"
                        onError={(e) => {
                          // Try different image numbers
                          const currentSrc = e.target.src;
                          const match = currentSrc.match(/-(\d+)\.(png|jpg)$/);
                          if (match) {
                            const num = parseInt(match[1]);
                            if (num < 5) {
                              e.target.src = getGymLeaderImage(leader.name, num + 1);
                            } else {
                              e.target.src = `/images/gym-leaders/${leader.name.toLowerCase()}.png`;
                            }
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Badge */}
                      <div className="absolute top-4 right-4 w-28 h-28">
                        <Image
                          src={getBadgeImage(leader.badge, region.id)}
                          alt={leader.badge}
                          fill
                          className="object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Leader Number */}
                      <div className="absolute top-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">#{index + 1}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative p-6">
                      <h3 className="text-4xl font-bold mb-2">{leader.name}</h3>
                      <p className="text-xl text-gray-600 dark:text-gray-400 mb-3">{leader.city}</p>
                      
                      {/* Type Badge */}
                      <div className="mb-4">
                        <TypeBadge type={leader.type} size="lg" />
                      </div>

                      {/* Signature Pokemon Section */}
                      {gymLeaderData[leader.name] && (
                        <div className="mb-6 p-6 rounded-xl bg-white/10 dark:bg-black/10 backdrop-blur-sm">
                          <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 flex-shrink-0">
                              <Image
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${gymLeaderData[leader.name].signatureId}.png`}
                                alt={gymLeaderData[leader.name].signature}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Signature Pokémon</p>
                              <p className="text-2xl font-bold">{gymLeaderData[leader.name].signature}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{gymLeaderData[leader.name].strategy}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quote */}
                      <p className="text-base italic text-gray-600 dark:text-gray-400 mb-6">
                        "{gymLeaderData[leader.name]?.quote || `Master of ${leader.type}-type Pokémon!`}"
                      </p>

                      {/* Badge Name */}
                      <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r ${region.color} text-white font-semibold text-lg`}>
                        <span>{leader.badge}</span>
                      </div>
                      
                      {/* Challenge Button */}
                      <div className="mt-6">
                        <button className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105">
                          Challenge {leader.name}!
                        </button>
                      </div>
                    </div>

                  </div>
                </CardHover>
              </div>
            ))}
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {gymLeaders.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToLeader(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex 
                    ? `w-8 bg-gradient-to-r ${region.color}` 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default GymLeaderCarousel;