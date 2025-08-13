import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { getGymLeaderImage, getBadgeImage } from '../../utils/scrapedImageMapping';
import { TypeBadge } from '../ui/TypeBadge';
import { FadeIn } from '../ui/animations/animations';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { gymLeaderTeams } from '../../data/gymLeaderTeams';
import { typeEffectiveness } from '../../utils/pokemonutils';
import CircularGymLeaderCard from '../ui/cards/CircularGymLeaderCard';

// Type definitions
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

interface GymLeaderData {
  quote: string;
  signature: string;
  signatureId: number;
  strategy: string;
}

interface Pokemon {
  id: number;
  name: string;
  level: number;
}

interface TeamData {
  team?: Pokemon[];
  weakAgainst?: string[];
}

interface TransformedPokemon {
  name: string;
  sprite: string;
}

interface GymLeaderCarouselProps {
  region: Region;
  gymLeaders: GymLeader[];
  theme: string;
}

const GymLeaderCarousel: React.FC<GymLeaderCarouselProps> = ({ region, gymLeaders, theme }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Initialize carousel to center first card on mount
  useEffect(() => {
    if (carouselRef.current) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        scrollToLeader(0);
      }, 100);
    }
  }, []);

  // Gym leader quotes/facts and signature Pokemon
  const gymLeaderData: Record<string, GymLeaderData> = {
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
    // Kalos Gym Leaders
    'Viola': { quote: "Whether it's the tears of frustration that follow or the blossoming of joy that awaits us...the outcome will be decided by this match!", signature: "Vivillon", signatureId: 666, strategy: "Bug-type photography" },
    'Grant': { quote: "I never lose when it comes to rock climbing! That's because I scale the wall of each and every challenge I face!", signature: "Tyrunt", signatureId: 696, strategy: "Fossil resurrection" },
    'Korrina': { quote: "Time for Lady Korrina's big appearance!", signature: "Lucario", signatureId: 448, strategy: "Mega Evolution mastery" },
    'Ramos': { quote: "Hohoho! So, you've come to challenge me! It has been quite some time since we've had a child around.", signature: "Gogoat", signatureId: 673, strategy: "Grass-type gardening" },
    'Clemont': { quote: "My invention to measure the bond between Pokémon and Trainer says that you're bonded incredible well!", signature: "Heliolisk", signatureId: 695, strategy: "Electric innovation" },
    'Valerie': { quote: "Oh, if it isn't a young Trainer... You seem to possess a silver tongue. I can tell, for I am also a believer in the power of words.", signature: "Sylveon", signatureId: 700, strategy: "Fairy-type mystique" },
    'Olympia': { quote: "I can see it! What you wish for! You want to be the Champion!", signature: "Meowstic", signatureId: 678, strategy: "Psychic foresight" },
    'Wulfric': { quote: "You and your Pokémon's power are a thing of beauty! I can feel it.", signature: "Avalugg", signatureId: 713, strategy: "Ice wall tactics" },
  };


  // Handle carousel navigation
  const scrollToLeader = (index: number) => {
    if (carouselRef.current) {
      const isMobile = window.innerWidth <= 850;
      const cardWidth = isMobile ? (window.innerWidth - 64) : 900; // Match actual card width
      const gap = isMobile ? 24 : 48; // Gap between cards (gap-12 = 48px)
      const cushionPadding = isMobile ? 32 : 200; // Cushion padding for first/last cards
      
      // Calculate scroll position to center the card
      const containerWidth = carouselRef.current.offsetWidth;
      const scrollPosition = index * (cardWidth + gap) + cushionPadding - (containerWidth - cardWidth) / 2;
      
      carouselRef.current.scrollTo({
        left: Math.max(0, scrollPosition), // Ensure we don't scroll past the beginning
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
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current!.offsetLeft);
    setScrollLeft(carouselRef.current!.scrollLeft);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current!.offsetLeft);
    setScrollLeft(carouselRef.current!.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current!.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current!.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - carouselRef.current!.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current!.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative">
      <FadeIn>
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Gym Leader Challenge
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Defeat all {gymLeaders.length} Gym Leaders to earn their badges
          </p>
        </div>
      </FadeIn>

      {/* Carousel Container */}
      <div className="relative">
          {/* Navigation Buttons - Enhanced Design */}
          <button
            onClick={handlePrev}
            className="absolute -left-4 sm:-left-8 md:-left-20 top-1/2 -translate-y-1/2 z-20 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-full p-3 md:p-4 shadow-xl hover:scale-110 transition-all duration-300 group"
          >
            <BsChevronLeft className="text-2xl text-gray-700 dark:text-gray-200 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            onClick={handleNext}
            className="absolute -right-4 sm:-right-8 md:-right-20 top-1/2 -translate-y-1/2 z-20 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-full p-3 md:p-4 shadow-xl hover:scale-110 transition-all duration-300 group"
          >
            <BsChevronRight className="text-2xl text-gray-700 dark:text-gray-200 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide pb-12 px-4 sm:px-8 md:px-16"
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
              WebkitOverflowScrolling: 'touch',
              minHeight: '450px'
            }}
          >
            {gymLeaders.map((leader, index) => {
              // Handle special case for Tate & Liza (twin gym leaders)
              let teamData: TeamData | undefined;
              if (leader.name === 'Tate & Liza') {
                // Combine both Tate and Liza's teams
                const tateData = gymLeaderTeams['Tate'] as TeamData;
                const lizaData = gymLeaderTeams['Liza'] as TeamData;
                if (tateData && lizaData) {
                  teamData = {
                    ...tateData,
                    team: [...(tateData.team || []), ...(lizaData.team || [])]
                  };
                }
              } else {
                teamData = (gymLeaderTeams as any)[leader.name] as TeamData;
              }
              
              const weaknesses = teamData?.weakAgainst || (typeEffectiveness as any)[leader.type]?.weakTo || [];
              const leaderData = gymLeaderData[leader.name] || {} as GymLeaderData;
              
              // Transform team data to match GymLeaderCard format
              const transformedTeam: TransformedPokemon[] = teamData?.team?.map(pokemon => ({
                name: pokemon.name,
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
              })) || [
                // Fallback team data for testing
                { name: 'Geodude', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/74.png' },
                { name: 'Onix', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/95.png' },
                { name: 'Graveler', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/75.png' },
                { name: 'Golem', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/76.png' }
              ];

              // Calculate recommended level (average of team levels)
              const recommendedLevel = teamData?.team?.length && teamData.team.length > 0 
                ? Math.round(teamData.team.reduce((sum, pokemon) => sum + pokemon.level, 0) / teamData.team.length)
                : undefined;
              
              return (
                <div
                  key={leader.name}
                  className="flex-shrink-0"
                  style={{ width: '384px' }} // Adjusted for circular card width
                >
                  <CircularGymLeaderCard
                    name={leader.name}
                    region={region.id}
                    type={leader.type}
                    badge={leader.badge}
                    badgeImage={getBadgeImage(leader.badge)}
                    image={getGymLeaderImage(leader.name, 1)}
                    team={transformedTeam}
                    strengths={(typeEffectiveness as any)[leader.type]?.strongAgainst || []}
                    weaknesses={weaknesses}
                    quote={leaderData.quote || `Master of ${leader.type}-type Pokémon!`}
                    funFact={leaderData.strategy || `${leader.name} is the ${leader.city} Gym Leader specializing in ${leader.type}-type Pokémon.`}
                    gymTown={leader.city}
                    recommendedLevel={recommendedLevel}
                    acePokemon={leaderData.signature && leaderData.signatureId ? {
                      name: leaderData.signature,
                      id: leaderData.signatureId,
                      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${leaderData.signatureId}.png`
                    } : undefined}
                  />
                </div>
              );
            })}
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-3 mt-8">
            {gymLeaders.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToLeader(index)}
                className={`h-3 rounded-full transition-all ${
                  index === activeIndex 
                    ? `w-12 bg-gradient-to-r ${region.color}` 
                    : 'w-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
  );
};

export default GymLeaderCarousel;