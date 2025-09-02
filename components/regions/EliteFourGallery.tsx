import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { getEliteFourImage, getChampionImage } from '../../utils/scrapedImageMapping';
import { TypeBadge } from '../ui/TypeBadge';
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from '../ui/animations/animations';
import { BsTrophy, BsShieldFill, BsStar, BsLightning, BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { typeEffectiveness } from '../../utils/pokemonutils';
import { PokemonDisplay } from '../ui/PokemonDisplay';
const EliteFourTile = PokemonDisplay;
const ChampionTile = PokemonDisplay;

// Type definitions
interface Pokemon {
  name: string;
  id: number;
  level: number;
  types: string[];
  mega?: boolean;
}

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
  name: string;
}

interface MemberData {
  quote: string;
  strategy: string;
  team: Pokemon[];
  achievements?: string[];
  funFact?: string;
}

interface EliteFourGalleryProps {
  region: Region;
  eliteFour: EliteFourMember[];
  champion: Champion | null;
  theme: string;
}

const EliteFourGallery: React.FC<EliteFourGalleryProps> = ({ region, eliteFour, champion, theme }) => {
  const [revealChampion, setRevealChampion] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Elite Four team data with full Pokemon teams
  const eliteFourData: Record<string, MemberData> = {
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
    },
    // Kalos Elite Four
    'Malva': {
      quote: "I was a member of Team Flare, so I'm used to heated battles!",
      strategy: "Scorching Fire-type offense with media flair",
      team: [
        { name: 'Pyroar', id: 668, level: 63, types: ['fire', 'normal'] },
        { name: 'Torkoal', id: 324, level: 63, types: ['fire'] },
        { name: 'Chandelure', id: 609, level: 63, types: ['ghost', 'fire'] },
        { name: 'Talonflame', id: 663, level: 65, types: ['fire', 'flying'] }
      ]
    },
    'Siebold': {
      quote: "Cooking is subtle! You must discern flavors that only you can sense!",
      strategy: "Elegant Water-type cuisine with refined technique",
      team: [
        { name: 'Clawitzer', id: 693, level: 63, types: ['water'] },
        { name: 'Gyarados', id: 130, level: 63, types: ['water', 'flying'] },
        { name: 'Barbaracle', id: 689, level: 63, types: ['rock', 'water'] },
        { name: 'Starmie', id: 121, level: 65, types: ['water', 'psychic'] }
      ]
    },
    'Wikstrom': {
      quote: "Chivalrous knights and Pokémon come together as one!",
      strategy: "Noble Steel-type defense with knightly honor",
      team: [
        { name: 'Klefki', id: 707, level: 63, types: ['steel', 'fairy'] },
        { name: 'Probopass', id: 476, level: 63, types: ['rock', 'steel'] },
        { name: 'Scizor', id: 212, level: 63, types: ['bug', 'steel'] },
        { name: 'Aegislash', id: 681, level: 65, types: ['steel', 'ghost'] }
      ]
    },
    'Drasna': {
      quote: "Oh, dear! You're quite the adorable Trainer, but you've also got a fierce side to you!",
      strategy: "Mystical Dragon-type wisdom with ancient power",
      team: [
        { name: 'Dragalge', id: 691, level: 63, types: ['poison', 'dragon'] },
        { name: 'Druddigon', id: 621, level: 63, types: ['dragon'] },
        { name: 'Altaria', id: 334, level: 63, types: ['dragon', 'flying'] },
        { name: 'Noivern', id: 715, level: 65, types: ['flying', 'dragon'] }
      ]
    }
  };

  // Champion data
  const championData: Record<string, MemberData> = {
    'Blue': {
      quote: "I'm the most powerful trainer in the world!",
      strategy: "Balanced team with no weaknesses",
      achievements: [
        "Youngest Gym Leader in Kanto history",
        "Former Pokémon League Champion",
        "Grandson of Professor Oak",
        "Viridian City Gym Leader"
      ],
      team: [
        { name: 'Pidgeot', id: 18, level: 59, types: ['normal', 'flying'] },
        { name: 'Alakazam', id: 65, level: 57, types: ['psychic'] },
        { name: 'Rhydon', id: 112, level: 59, types: ['ground', 'rock'] },
        { name: 'Exeggutor', id: 103, level: 59, types: ['grass', 'psychic'] },
        { name: 'Gyarados', id: 130, level: 59, types: ['water', 'flying'] },
        { name: 'Arcanine', id: 59, level: 61, types: ['fire'] }
      ],
      funFact: "Blue was the Champion for only a few minutes before being defeated by Red. Despite this, he remains one of the strongest trainers in the Pokémon world."
    },
    'Lance': {
      quote: "I still can't believe my dragons lost to you!",
      strategy: "Dragon mastery and overwhelming force",
      achievements: [
        "Dragon Master of the Elite Four",
        "Johto League Champion",
        "Leader of the G-Men",
        "Protector of Dragon's Den"
      ],
      team: [
        { name: 'Gyarados', id: 130, level: 44, types: ['water', 'flying'] },
        { name: 'Dragonite', id: 149, level: 47, types: ['dragon', 'flying'] },
        { name: 'Dragonite', id: 149, level: 47, types: ['dragon', 'flying'] },
        { name: 'Aerodactyl', id: 142, level: 48, types: ['rock', 'flying'] },
        { name: 'Charizard', id: 6, level: 48, types: ['fire', 'flying'] },
        { name: 'Dragonite', id: 149, level: 50, types: ['dragon', 'flying'] }
      ],
      funFact: "Lance owns multiple Dragonite that know illegal moves. His Dragonite can use Barrier and Hyper Beam at levels where they shouldn't know these moves!"
    },
    'Steven': {
      quote: "I, the Champion, fall in defeat... ",
      strategy: "Steel-type defense and strategic offense",
      achievements: [
        "Hoenn League Champion",
        "Stone collector and researcher",
        "Son of Devon Corporation president",
        "Mentor to many trainers"
      ],
      team: [
        { name: 'Skarmory', id: 227, level: 57, types: ['steel', 'flying'] },
        { name: 'Claydol', id: 344, level: 55, types: ['ground', 'psychic'] },
        { name: 'Aggron', id: 306, level: 56, types: ['steel', 'rock'] },
        { name: 'Cradily', id: 346, level: 56, types: ['rock', 'grass'] },
        { name: 'Armaldo', id: 348, level: 56, types: ['rock', 'bug'] },
        { name: 'Metagross', id: 376, level: 58, types: ['steel', 'psychic'] }
      ],
      funFact: "Steven's hobby is collecting rare stones. He can often be found in caves searching for rare minerals, and his villa is filled with his stone collection."
    },
    'Wallace': {
      quote: "I, the Champion, fall in defeat... Congratulations!",
      strategy: "Water elegance and type coverage",
      achievements: [
        "Sootopolis City Gym Leader",
        "Hoenn League Champion",
        "Contest Master",
        "Mentor to his niece Lisia"
      ],
      team: [
        { name: 'Wailord', id: 321, level: 57, types: ['water'] },
        { name: 'Tentacruel', id: 73, level: 55, types: ['water', 'poison'] },
        { name: 'Ludicolo', id: 272, level: 56, types: ['water', 'grass'] },
        { name: 'Whiscash', id: 340, level: 56, types: ['water', 'ground'] },
        { name: 'Gyarados', id: 130, level: 56, types: ['water', 'flying'] },
        { name: 'Milotic', id: 350, level: 58, types: ['water'] }
      ],
      funFact: "Wallace is not just a powerful trainer but also an artist. He's a top Pokémon Coordinator and views battles as a form of art, emphasizing beauty in combat."
    },
    'Cynthia': {
      quote: "I won't lose!",
      strategy: "Perfect team composition and tactics",
      achievements: [
        "Sinnoh League Champion",
        "Mythology researcher",
        "Undefeated for years",
        "Archaeological discoveries"
      ],
      team: [
        { name: 'Spiritomb', id: 442, level: 58, types: ['ghost', 'dark'] },
        { name: 'Roserade', id: 407, level: 58, types: ['grass', 'poison'] },
        { name: 'Togekiss', id: 468, level: 60, types: ['fairy', 'flying'] },
        { name: 'Lucario', id: 448, level: 60, types: ['fighting', 'steel'] },
        { name: 'Milotic', id: 350, level: 58, types: ['water'] },
        { name: 'Garchomp', id: 445, level: 62, types: ['dragon', 'ground'] }
      ],
      funFact: "Cynthia is fascinated by mythology and spends her free time researching ancient ruins. She's particularly interested in the mythology surrounding the creation of the Sinnoh region."
    },
    'Alder': {
      quote: "Unbelievable! You're more than just talented!",
      strategy: "Diverse team with unique moves",
      achievements: [
        "Unova League Champion",
        "Wandering trainer",
        "Mentor to young trainers",
        "Bug-type enthusiast"
      ],
      team: [
        { name: 'Accelgor', id: 617, level: 75, types: ['bug'] },
        { name: 'Bouffalant', id: 626, level: 75, types: ['normal'] },
        { name: 'Druddigon', id: 621, level: 75, types: ['dragon'] },
        { name: 'Vanilluxe', id: 584, level: 75, types: ['ice'] },
        { name: 'Escavalier', id: 589, level: 75, types: ['bug', 'steel'] },
        { name: 'Volcarona', id: 637, level: 77, types: ['bug', 'fire'] }
      ],
      funFact: "Alder travels the region with his Pokémon instead of staying at the Pokémon League. He believes that bonding with Pokémon is more important than just being strong."
    },
    'Diantha': {
      quote: "Witnessing the noble spirits of you and your Pokémon in battle has really touched my heart.",
      strategy: "Mega Evolution mastery",
      achievements: [
        "Kalos League Champion",
        "Famous movie star",
        "Fashion icon",
        "Mega Evolution expert"
      ],
      team: [
        { name: 'Hawlucha', id: 701, level: 64, types: ['fighting', 'flying'] },
        { name: 'Tyrantrum', id: 697, level: 65, types: ['rock', 'dragon'] },
        { name: 'Aurorus', id: 699, level: 65, types: ['rock', 'ice'] },
        { name: 'Gourgeist', id: 711, level: 65, types: ['ghost', 'grass'] },
        { name: 'Goodra', id: 706, level: 66, types: ['dragon'] },
        { name: 'Gardevoir', id: 282, level: 68, types: ['psychic', 'fairy'], mega: true }
      ],
      funFact: "Diantha is a famous movie star when she's not defending her Champion title. She's known for her elegance both in battle and on the silver screen."
    },
    'Professor Kukui': {
      quote: "I'm so glad I got to meet you and your Pokémon!",
      strategy: "Type diversity and Z-Moves",
      achievements: [
        "Pokémon Professor",
        "Alola League founder",
        "First Alola Champion",
        "Masked Royal wrestler"
      ],
      team: [
        { name: 'Lycanroc', id: 745, level: 57, types: ['rock'] },
        { name: 'Braviary', id: 628, level: 56, types: ['normal', 'flying'] },
        { name: 'Magnezone', id: 462, level: 56, types: ['electric', 'steel'] },
        { name: 'Snorlax', id: 143, level: 56, types: ['normal'] },
        { name: 'Primarina', id: 730, level: 58, types: ['water', 'fairy'] },
        { name: 'Incineroar', id: 727, level: 58, types: ['fire', 'dark'] }
      ],
      funFact: "Professor Kukui has a secret identity as the Masked Royal, a famous Battle Royal wrestler. His wife Burnet is one of the few who knows his secret!"
    },
    'Leon': {
      quote: "My time as Champion is over... But what a champion time it's been!",
      strategy: "Gigantamax Charizard sweep",
      achievements: [
        "Undefeated Champion for years",
        "Youngest Champion in Galar history",
        "Battle Tower founder",
        "Terrible sense of direction"
      ],
      team: [
        { name: 'Aegislash', id: 681, level: 62, types: ['steel', 'ghost'] },
        { name: 'Dragapult', id: 887, level: 62, types: ['dragon', 'ghost'] },
        { name: 'Haxorus', id: 612, level: 63, types: ['dragon'] },
        { name: 'Seismitoad', id: 537, level: 64, types: ['water', 'ground'] },
        { name: 'Mr. Rime', id: 866, level: 64, types: ['ice', 'psychic'] },
        { name: 'Charizard', id: 6, level: 65, types: ['fire', 'flying'] }
      ],
      funFact: "Despite being an undefeated Champion, Leon has a terrible sense of direction and often gets lost even in familiar places. His Charizard often has to guide him!"
    },
    'Geeta': {
      quote: "I look forward to news of all your future successes!",
      strategy: "Strategic field control",
      achievements: [
        "Top Champion of Paldea",
        "Pokémon League Chairwoman",
        "Academy collaborator",
        "Paldea's strongest trainer"
      ],
      team: [
        { name: 'Espathra', id: 956, level: 61, types: ['psychic'] },
        { name: 'Avalugg', id: 713, level: 61, types: ['ice'] },
        { name: 'Kingambit', id: 983, level: 61, types: ['dark', 'steel'] },
        { name: 'Veluza', id: 976, level: 61, types: ['water', 'psychic'] },
        { name: 'Gogoat', id: 673, level: 61, types: ['grass'] },
        { name: 'Glimmora', id: 970, level: 62, types: ['rock', 'poison'] }
      ],
      funFact: "Geeta leads with her ace Glimmora to set up Toxic Spikes, showing her strategic approach. However, many trainers consider her team composition questionable for a Champion."
    }
  };

  // Handle carousel navigation
  const scrollToMember = (index: number) => {
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
    const newIndex = activeIndex > 0 ? activeIndex - 1 : eliteFour.length - 1;
    scrollToMember(newIndex);
  };

  const handleNext = () => {
    const newIndex = activeIndex < eliteFour.length - 1 ? activeIndex + 1 : 0;
    scrollToMember(newIndex);
  };

  // Touch/Mouse drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Don't render if no Elite Four data
  if (!eliteFour || eliteFour.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      {/* Elite Four Header */}
      <FadeIn>
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
            Elite Four & Champion
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            The ultimate challenge awaits at the Pokémon League
          </p>
        </div>
      </FadeIn>

      {/* Elite Four Carousel */}
      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute -left-4 sm:-left-8 md:-left-16 top-1/2 -translate-y-1/2 z-20 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-full p-3 md:p-4 shadow-xl hover:scale-110 transition-all duration-300 group"
        >
          <BsChevronLeft className="text-2xl text-gray-700 dark:text-gray-200 group-hover:-translate-x-1 transition-transform" />
        </button>
        <button
          onClick={handleNext}
          className="absolute -right-4 sm:-right-8 md:-right-16 top-1/2 -translate-y-1/2 z-20 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-full p-3 md:p-4 shadow-xl hover:scale-110 transition-all duration-300 group"
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
            minHeight: '500px'
          }}
        >
          {eliteFour.map((member, index) => {
            const memberData = eliteFourData[member.name] || {};
            const weaknesses = (typeEffectiveness as any)[member.type]?.weakTo || [];
            
            // Transform team data to match EliteFourCard format
            const transformedTeam = memberData.team?.map(pokemon => ({
              name: pokemon.name,
              sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
            })) || [];
            
            return (
              <div
                key={member.name}
                className="flex-shrink-0"
                style={{ width: '900px' }}
              >
                <EliteFourTile
                  name={member.name}
                  region={region.id}
                  type={member.type}
                  rank={index + 1}
                  image={getEliteFourImage(member.name, 1)}
                  team={transformedTeam}
                  signature={member.signature || ''}
                  strengths={(typeEffectiveness as any)[member.type]?.strongAgainst || []}
                  weaknesses={weaknesses}
                  quote={memberData.quote || `Master of ${member.type}-type Pokémon!`}
                  strategy={memberData.strategy || `Elite Four member specializing in ${member.type}-type Pokémon.`}
                  difficulty={4}
                />
              </div>
            );
          })}
        </div>
        
        {/* Progress Indicators - Elite Four Style */}
        <div className="flex justify-center gap-3 mt-8">
          {eliteFour.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToMember(index)}
              className={`h-4 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'w-16 bg-gradient-to-r from-purple-500 via-yellow-500 to-purple-500 shadow-lg animate-pulse' 
                  : 'w-4 bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-600 hover:to-indigo-600 hover:scale-110'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Champion Section */}
      {champion && (
          <div className="relative">
            {/* Reveal Button - Enhanced */}
            {!revealChampion && (
              <FadeIn>
                <div className="text-center mb-12 relative">
                  {/* Champion aura background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 via-amber-500/30 to-yellow-500/30 blur-3xl -z-10 animate-pulse"></div>
                  
                  {/* Champion title */}
                  <div className="mb-6">
                    <h4 className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent mb-2">
                      THE FINAL CHALLENGE
                    </h4>
                    <div className="flex items-center justify-center gap-2 text-yellow-500">
                      <BsStar className="animate-spin" />
                      <BsStar className="animate-pulse" />
                      <BsStar className="animate-spin" />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setRevealChampion(true)}
                    className="px-8 py-4 rounded-full backdrop-blur-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-xl hover:scale-110 transition-all duration-300 shadow-xl border border-yellow-400/50"
                  >
                    <div className="flex items-center gap-3">
                      <BsTrophy className="text-2xl" />
                      <span>REVEAL THE CHAMPION</span>
                      <BsTrophy className="text-2xl" />
                    </div>
                  </button>
                  
                  <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 font-semibold">
                    Face the ultimate test of your skills
                  </p>
                </div>
              </FadeIn>
            )}

            {/* Champion Card */}
            {revealChampion && champion && championData[champion.name] && (
              <SlideUp>
                <div className="flex justify-center relative mt-8">
                  
                  <ChampionTile
                    name={champion.name}
                    region={region.id}
                    title={`${region.name} League Champion`}
                    image={getChampionImage(champion.name, 1)}
                    team={championData[champion.name].team.map(pokemon => ({
                      name: pokemon.name,
                      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
                      level: pokemon.level
                    }))}
                    signature={champion.signature || ''}
                    achievements={championData[champion.name].achievements}
                    quote={championData[champion.name].quote}
                    strategy={championData[champion.name].funFact || ''}
                    difficulty={5}
                  />
                </div>
              </SlideUp>
            )}
          </div>
        )}
    </div>
  );
};

export default EliteFourGallery;