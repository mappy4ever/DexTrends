import React, { useState, useEffect, useRef } from "react";
import { NextPage } from 'next';
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, SlideUp, StaggeredChildren } from "../../components/ui/animations/animations";
import { TypeBadge } from "../../components/ui/TypeBadge";
import { PageLoader } from "../../utils/unifiedLoading";
import { BsChevronRight, BsChevronDown, BsChevronUp, BsStar, BsStarFill } from "react-icons/bs";
import { GiSwordWound, GiShield, GiSpeedometer, GiHearts, GiBrain, GiEyeShield } from "react-icons/gi";
import { FaFire, FaLeaf, FaWater } from "react-icons/fa";
import { THEME, themeClass, getTypeGradient } from "../../utils/theme";
import { useTheme } from "../../context/UnifiedAppContext";

// Type definitions
interface Evolution {
  id: number;
  name: string;
  level: number;
  types?: string[];
}

interface Stats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

interface Starter {
  id: number;
  name: string;
  types: string[];
  category?: string;
  abilities?: string[];
  evolutions: Evolution[];
  stats: Stats;
  description: string;
  strategy?: string;
  funFacts?: string[];
  signature?: string;
  strengths?: string[];
  weaknesses?: string[];
}

interface Generation {
  generation: number;
  region: string;
  games?: string[];
  description?: string;
  starters: Starter[];
}

// Import comprehensive starter data
const starterDataByRegion: Record<string, any> = {
  kanto: {
    region: "Kanto",
    generation: 1,
    games: ["Red", "Blue", "Yellow", "FireRed", "LeafGreen"],
    description: "The original trio that started it all. These Pokémon have become iconic symbols of the franchise.",
    starters: [
      {
        id: 1,
        name: "Bulbasaur",
        types: ["grass", "poison"],
        category: "Seed Pokémon",
        abilities: ["Overgrow", "Chlorophyll (Hidden)"],
        evolutions: [
          { id: 1, name: "Bulbasaur", level: 1, types: ["grass", "poison"] },
          { id: 2, name: "Ivysaur", level: 16, types: ["grass", "poison"] },
          { id: 3, name: "Venusaur", level: 32, types: ["grass", "poison"] }
        ],
        stats: { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 },
        description: "A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.",
        strategy: "Bulbasaur is excellent for beginners due to type advantages against early gyms. Venusaur excels as a defensive tank with access to status moves like Sleep Powder and Leech Seed.",
        funFacts: [
          "First Pokémon in the National Dex",
          "Only starter with dual typing from the start",
          "Ash's Bulbasaur refused to evolve in the anime"
        ],
        signature: "Frenzy Plant",
        strengths: ["Water", "Electric", "Grass", "Fighting"],
        weaknesses: ["Fire", "Flying", "Ice", "Psychic"]
      },
      {
        id: 4,
        name: "Charmander",
        types: ["fire"],
        category: "Lizard Pokémon",
        abilities: ["Blaze", "Solar Power (Hidden)"],
        evolutions: [
          { id: 4, name: "Charmander", level: 1, types: ["fire"] },
          { id: 5, name: "Charmeleon", level: 16, types: ["fire"] },
          { id: 6, name: "Charizard", level: 36, types: ["fire", "flying"] }
        ],
        stats: { hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 },
        description: "The flame that burns at the tip of its tail is an indication of its emotions. The flame wavers when it is happy.",
        strategy: "Hard mode for Kanto beginners but rewarding. Charizard becomes a powerful special attacker with great coverage moves and two Mega Evolution forms.",
        funFacts: [
          "Most popular starter according to polls",
          "Charizard is not a Dragon-type despite appearance",
          "Has two different Mega Evolutions"
        ],
        signature: "Blast Burn",
        strengths: ["Grass", "Ice", "Bug", "Steel"],
        weaknesses: ["Water", "Electric", "Rock"]
      },
      {
        id: 7,
        name: "Squirtle",
        types: ["water"],
        category: "Tiny Turtle Pokémon",
        abilities: ["Torrent", "Rain Dish (Hidden)"],
        evolutions: [
          { id: 7, name: "Squirtle", level: 1, types: ["water"] },
          { id: 8, name: "Wartortle", level: 16, types: ["water"] },
          { id: 9, name: "Blastoise", level: 36, types: ["water"] }
        ],
        stats: { hp: 44, attack: 48, defense: 65, spAttack: 50, spDefense: 64, speed: 43 },
        description: "After birth, its back swells and hardens into a shell. It powerfully sprays foam from its mouth.",
        strategy: "Balanced choice for Kanto. Blastoise is a defensive powerhouse with access to powerful Water moves and good coverage options like Ice Beam.",
        funFacts: [
          "Leader of the Squirtle Squad in the anime",
          "Blastoise has water cannons that can punch through steel",
          "Popular in competitive play for its bulk"
        ],
        signature: "Hydro Cannon",
        strengths: ["Fire", "Ground", "Rock"],
        weaknesses: ["Electric", "Grass"]
      }
    ]
  },
  // Add other regions with similar detailed data...
};

// Convert to generation array format
const startersByGeneration: Generation[] = Object.values(starterDataByRegion).map(region => ({
  generation: region.generation,
  region: region.region,
  games: region.games,
  description: region.description,
  starters: region.starters
}));

// Add all generations data
const allGenerations: Generation[] = [
  {
    generation: 1,
    region: "Kanto",
    games: ["Red", "Blue", "Yellow"],
    description: "The original trio that started it all",
    starters: [
      {
        id: 1,
        name: "Bulbasaur",
        types: ["grass", "poison"],
        evolutions: [
          { id: 1, name: "Bulbasaur", level: 1 },
          { id: 2, name: "Ivysaur", level: 16 },
          { id: 3, name: "Venusaur", level: 32 }
        ],
        stats: { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 },
        description: "A strange seed was planted on its back at birth."
      },
      {
        id: 4,
        name: "Charmander",
        types: ["fire"],
        evolutions: [
          { id: 4, name: "Charmander", level: 1 },
          { id: 5, name: "Charmeleon", level: 16 },
          { id: 6, name: "Charizard", level: 36 }
        ],
        stats: { hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 },
        description: "The flame at the tip of its tail indicates its emotions."
      },
      {
        id: 7,
        name: "Squirtle",
        types: ["water"],
        evolutions: [
          { id: 7, name: "Squirtle", level: 1 },
          { id: 8, name: "Wartortle", level: 16 },
          { id: 9, name: "Blastoise", level: 36 }
        ],
        stats: { hp: 44, attack: 48, defense: 65, spAttack: 50, spDefense: 64, speed: 43 },
        description: "Its shell hardens after birth to protect it."
      }
    ]
  },
  {
    generation: 2,
    region: "Johto",
    games: ["Gold", "Silver", "Crystal"],
    description: "The Johto starters continue the tradition",
    starters: [
      {
        id: 152,
        name: "Chikorita",
        types: ["grass"],
        evolutions: [
          { id: 152, name: "Chikorita", level: 1 },
          { id: 153, name: "Bayleef", level: 16 },
          { id: 154, name: "Meganium", level: 32 }
        ],
        stats: { hp: 45, attack: 49, defense: 65, spAttack: 49, spDefense: 65, speed: 45 },
        description: "A sweet aroma gently wafts from the leaf on its head."
      },
      {
        id: 155,
        name: "Cyndaquil",
        types: ["fire"],
        evolutions: [
          { id: 155, name: "Cyndaquil", level: 1 },
          { id: 156, name: "Quilava", level: 14 },
          { id: 157, name: "Typhlosion", level: 36 }
        ],
        stats: { hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 },
        description: "It is timid and always curls itself up in a ball."
      },
      {
        id: 158,
        name: "Totodile",
        types: ["water"],
        evolutions: [
          { id: 158, name: "Totodile", level: 1 },
          { id: 159, name: "Croconaw", level: 18 },
          { id: 160, name: "Feraligatr", level: 30 }
        ],
        stats: { hp: 50, attack: 65, defense: 64, spAttack: 44, spDefense: 48, speed: 43 },
        description: "Its well-developed jaws are powerful and capable of crushing anything."
      }
    ]
  },
  {
    generation: 3,
    region: "Hoenn",
    games: ["Ruby", "Sapphire", "Emerald"],
    description: "Hoenn introduces dual-type final evolutions",
    starters: [
      {
        id: 252,
        name: "Treecko",
        types: ["grass"],
        evolutions: [
          { id: 252, name: "Treecko", level: 1 },
          { id: 253, name: "Grovyle", level: 16 },
          { id: 254, name: "Sceptile", level: 36 }
        ],
        stats: { hp: 40, attack: 45, defense: 35, spAttack: 65, spDefense: 55, speed: 70 },
        description: "It quickly scales even vertical walls."
      },
      {
        id: 255,
        name: "Torchic",
        types: ["fire"],
        evolutions: [
          { id: 255, name: "Torchic", level: 1 },
          { id: 256, name: "Combusken", level: 16 },
          { id: 257, name: "Blaziken", level: 36 }
        ],
        stats: { hp: 45, attack: 60, defense: 40, spAttack: 70, spDefense: 50, speed: 45 },
        description: "It has a flame sac inside its belly that perpetually burns."
      },
      {
        id: 258,
        name: "Mudkip",
        types: ["water"],
        evolutions: [
          { id: 258, name: "Mudkip", level: 1 },
          { id: 259, name: "Marshtomp", level: 16 },
          { id: 260, name: "Swampert", level: 36 }
        ],
        stats: { hp: 50, attack: 70, defense: 50, spAttack: 50, spDefense: 50, speed: 40 },
        description: "The fin on its head is a radar that senses movements."
      }
    ]
  },
  {
    generation: 4,
    region: "Sinnoh",
    games: ["Diamond", "Pearl", "Platinum"],
    description: "Sinnoh starters bring diverse strategies",
    starters: [
      {
        id: 387,
        name: "Turtwig",
        types: ["grass"],
        evolutions: [
          { id: 387, name: "Turtwig", level: 1 },
          { id: 388, name: "Grotle", level: 18 },
          { id: 389, name: "Torterra", level: 32 }
        ],
        stats: { hp: 55, attack: 68, defense: 64, spAttack: 45, spDefense: 55, speed: 31 },
        description: "Made from soil, the shell on its back hardens when it drinks water."
      },
      {
        id: 390,
        name: "Chimchar",
        types: ["fire"],
        evolutions: [
          { id: 390, name: "Chimchar", level: 1 },
          { id: 391, name: "Monferno", level: 14 },
          { id: 392, name: "Infernape", level: 36 }
        ],
        stats: { hp: 44, attack: 58, defense: 44, spAttack: 58, spDefense: 44, speed: 61 },
        description: "Its fiery rear end is fueled by gas made in its belly."
      },
      {
        id: 393,
        name: "Piplup",
        types: ["water"],
        evolutions: [
          { id: 393, name: "Piplup", level: 1 },
          { id: 394, name: "Prinplup", level: 16 },
          { id: 395, name: "Empoleon", level: 36 }
        ],
        stats: { hp: 53, attack: 51, defense: 53, spAttack: 61, spDefense: 56, speed: 40 },
        description: "It doesn't like to be taken care of. It's difficult to bond with."
      }
    ]
  },
  {
    generation: 5,
    region: "Unova",
    games: ["Black", "White", "Black 2", "White 2"],
    description: "Unova brings a fresh start with new designs",
    starters: [
      {
        id: 495,
        name: "Snivy",
        types: ["grass"],
        evolutions: [
          { id: 495, name: "Snivy", level: 1 },
          { id: 496, name: "Servine", level: 17 },
          { id: 497, name: "Serperior", level: 36 }
        ],
        stats: { hp: 45, attack: 45, defense: 55, spAttack: 45, spDefense: 55, speed: 63 },
        description: "It is very intelligent and calm."
      },
      {
        id: 498,
        name: "Tepig",
        types: ["fire"],
        evolutions: [
          { id: 498, name: "Tepig", level: 1 },
          { id: 499, name: "Pignite", level: 17 },
          { id: 500, name: "Emboar", level: 36 }
        ],
        stats: { hp: 65, attack: 63, defense: 45, spAttack: 45, spDefense: 45, speed: 45 },
        description: "It can deftly dodge its foe's attacks while shooting fireballs."
      },
      {
        id: 501,
        name: "Oshawott",
        types: ["water"],
        evolutions: [
          { id: 501, name: "Oshawott", level: 1 },
          { id: 502, name: "Dewott", level: 17 },
          { id: 503, name: "Samurott", level: 36 }
        ],
        stats: { hp: 55, attack: 55, defense: 45, spAttack: 63, spDefense: 45, speed: 45 },
        description: "It fights using the scalchop on its stomach."
      }
    ]
  },
  {
    generation: 6,
    region: "Kalos",
    games: ["X", "Y"],
    description: "Kalos starters gain unique secondary types",
    starters: [
      {
        id: 650,
        name: "Chespin",
        types: ["grass"],
        evolutions: [
          { id: 650, name: "Chespin", level: 1 },
          { id: 651, name: "Quilladin", level: 16 },
          { id: 652, name: "Chesnaught", level: 36 }
        ],
        stats: { hp: 56, attack: 61, defense: 65, spAttack: 48, spDefense: 45, speed: 38 },
        description: "The quills on its head are usually soft."
      },
      {
        id: 653,
        name: "Fennekin",
        types: ["fire"],
        evolutions: [
          { id: 653, name: "Fennekin", level: 1 },
          { id: 654, name: "Braixen", level: 16 },
          { id: 655, name: "Delphox", level: 36 }
        ],
        stats: { hp: 40, attack: 45, defense: 40, spAttack: 62, spDefense: 60, speed: 60 },
        description: "Eating a twig fills it with energy."
      },
      {
        id: 656,
        name: "Froakie",
        types: ["water"],
        evolutions: [
          { id: 656, name: "Froakie", level: 1 },
          { id: 657, name: "Frogadier", level: 16 },
          { id: 658, name: "Greninja", level: 36 }
        ],
        stats: { hp: 41, attack: 56, defense: 40, spAttack: 62, spDefense: 44, speed: 71 },
        description: "It secretes flexible bubbles from its chest and back."
      }
    ]
  },
  {
    generation: 7,
    region: "Alola",
    games: ["Sun", "Moon", "Ultra Sun", "Ultra Moon"],
    description: "Alola brings tropical-themed starters",
    starters: [
      {
        id: 722,
        name: "Rowlet",
        types: ["grass", "flying"],
        evolutions: [
          { id: 722, name: "Rowlet", level: 1 },
          { id: 723, name: "Dartrix", level: 17 },
          { id: 724, name: "Decidueye", level: 34 }
        ],
        stats: { hp: 68, attack: 55, defense: 55, spAttack: 50, spDefense: 50, speed: 42 },
        description: "This wary Pokémon uses photosynthesis during the day."
      },
      {
        id: 725,
        name: "Litten",
        types: ["fire"],
        evolutions: [
          { id: 725, name: "Litten", level: 1 },
          { id: 726, name: "Torracat", level: 17 },
          { id: 727, name: "Incineroar", level: 34 }
        ],
        stats: { hp: 45, attack: 65, defense: 40, spAttack: 60, spDefense: 40, speed: 70 },
        description: "While grooming itself, it builds up fur inside its stomach."
      },
      {
        id: 728,
        name: "Popplio",
        types: ["water"],
        evolutions: [
          { id: 728, name: "Popplio", level: 1 },
          { id: 729, name: "Brionne", level: 17 },
          { id: 730, name: "Primarina", level: 34 }
        ],
        stats: { hp: 50, attack: 54, defense: 54, spAttack: 66, spDefense: 56, speed: 40 },
        description: "This Pokémon snorts body fluids from its nose."
      }
    ]
  },
  {
    generation: 8,
    region: "Galar",
    games: ["Sword", "Shield"],
    description: "Galar starters with UK-inspired themes",
    starters: [
      {
        id: 810,
        name: "Grookey",
        types: ["grass"],
        evolutions: [
          { id: 810, name: "Grookey", level: 1 },
          { id: 811, name: "Thwackey", level: 16 },
          { id: 812, name: "Rillaboom", level: 35 }
        ],
        stats: { hp: 50, attack: 65, defense: 50, spAttack: 40, spDefense: 40, speed: 65 },
        description: "When it uses its special stick to strike up a beat."
      },
      {
        id: 813,
        name: "Scorbunny",
        types: ["fire"],
        evolutions: [
          { id: 813, name: "Scorbunny", level: 1 },
          { id: 814, name: "Raboot", level: 16 },
          { id: 815, name: "Cinderace", level: 35 }
        ],
        stats: { hp: 50, attack: 71, defense: 40, spAttack: 40, spDefense: 40, speed: 69 },
        description: "It has special pads on the backs of its feet."
      },
      {
        id: 816,
        name: "Sobble",
        types: ["water"],
        evolutions: [
          { id: 816, name: "Sobble", level: 1 },
          { id: 817, name: "Drizzile", level: 16 },
          { id: 818, name: "Inteleon", level: 35 }
        ],
        stats: { hp: 50, attack: 40, defense: 40, spAttack: 70, spDefense: 40, speed: 70 },
        description: "When scared, this Pokémon cries."
      }
    ]
  },
  {
    generation: 9,
    region: "Paldea",
    games: ["Scarlet", "Violet"],
    description: "The newest generation from the Paldea region",
    starters: [
      {
        id: 906,
        name: "Sprigatito",
        types: ["grass"],
        evolutions: [
          { id: 906, name: "Sprigatito", level: 1 },
          { id: 907, name: "Floragato", level: 16 },
          { id: 908, name: "Meowscarada", level: 36 }
        ],
        stats: { hp: 40, attack: 61, defense: 54, spAttack: 45, spDefense: 45, speed: 65 },
        description: "Its fluffy fur is similar in composition to plants."
      },
      {
        id: 909,
        name: "Fuecoco",
        types: ["fire"],
        evolutions: [
          { id: 909, name: "Fuecoco", level: 1 },
          { id: 910, name: "Crocalor", level: 16 },
          { id: 911, name: "Skeledirge", level: 36 }
        ],
        stats: { hp: 67, attack: 45, defense: 59, spAttack: 63, spDefense: 40, speed: 36 },
        description: "It lies on warm rocks and uses the heat absorbed."
      },
      {
        id: 912,
        name: "Quaxly",
        types: ["water"],
        evolutions: [
          { id: 912, name: "Quaxly", level: 1 },
          { id: 913, name: "Quaxwell", level: 16 },
          { id: 914, name: "Quaquaval", level: 36 }
        ],
        stats: { hp: 55, attack: 65, defense: 45, spAttack: 50, spDefense: 45, speed: 50 },
        description: "Its strong legs let it easily swim around."
      }
    ]
  }
];

// Type gradient mappings (local version for starter page)
const STARTER_TYPE_GRADIENTS = {
  grass: 'from-green-400 to-green-600',
  fire: 'from-orange-400 to-red-600',
  water: 'from-blue-400 to-blue-600',
  poison: 'from-purple-400 to-purple-600',
  flying: 'from-sky-300 to-blue-400',
  fighting: 'from-red-600 to-red-800',
  ground: 'from-yellow-600 to-amber-700',
  steel: 'from-gray-400 to-gray-600',
  dark: 'from-gray-700 to-gray-900',
  fairy: 'from-pink-300 to-pink-500',
  psychic: 'from-pink-400 to-purple-500',
  dragon: 'from-indigo-500 to-purple-600'
};

const StartersPage: NextPage = () => {
  const router = useRouter();
  const { theme } = useTheme();
  // TODO: Update when userPreferences is available in context
  const isHighContrast = false;
  const reduceMotion = false;
  const [selectedGen, setSelectedGen] = useState(0);
  const [expandedStarters, setExpandedStarters] = useState<Record<number, boolean>>({});
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const getPokemonImage = (pokemonId: number): string => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  };

  const getStatIcon = (stat: string) => {
    switch(stat) {
      case 'hp': return <GiHearts className="text-red-500" />;
      case 'attack': return <GiSwordWound className="text-orange-500" />;
      case 'defense': return <GiShield className="text-yellow-500" />;
      case 'spAttack': return <GiBrain className="text-blue-500" />;
      case 'spDefense': return <GiEyeShield className="text-green-500" />;
      case 'speed': return <GiSpeedometer className="text-purple-500" />;
      default: return null;
    }
  };

  const getStatPercentage = (stat: number): number => {
    return (stat / 255) * 100;
  };

  const toggleStarterExpansion = (starterId: number) => {
    setExpandedStarters(prev => ({
      ...prev,
      [starterId]: !prev[starterId]
    }));
  };

  const toggleComparison = (starterId: number) => {
    setSelectedForComparison(prev => {
      if (prev.includes(starterId)) {
        return prev.filter(id => id !== starterId);
      }
      if (prev.length < 3) {
        return [...prev, starterId];
      }
      return prev;
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return <PageLoader text="Loading starter Pokémon data..." />;
  }

  return (
    <>
      <Head>
        <title>Starter Pokémon - All Generations | DexTrends</title>
        <meta name="description" content="Explore all starter Pokémon from every generation. Compare stats, evolution chains, and choose your perfect partner." />
      </Head>

      <div className={themeClass(
        'min-h-screen',
        'bg-gradient-to-br from-emerald-50 via-blue-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'
      )}>
        {/* Skip Navigation for Accessibility */}
        <a 
          href="#generation-showcase" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-blue-900/20 to-red-900/20 dark:from-green-900/30 dark:via-blue-900/30 dark:to-red-900/30" />
            {/* Floating Starter Icons */}
            <motion.div
              className="absolute top-20 left-20 text-6xl"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <FaLeaf className="text-green-500/20" />
            </motion.div>
            <motion.div
              className="absolute top-40 right-32 text-8xl"
              animate={{
                y: [0, 20, 0],
                rotate: [0, -10, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <FaFire className="text-red-500/20" />
            </motion.div>
            <motion.div
              className="absolute bottom-32 left-40 text-7xl"
              animate={{
                y: [0, -15, 0],
                x: [0, 10, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            >
              <FaWater className="text-blue-500/20" />
            </motion.div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center px-4">
            <motion.h1 
              className={themeClass(THEME.typography.h1, 'mb-6')}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-red-600 dark:from-green-400 dark:via-blue-400 dark:to-red-400 bg-clip-text text-transparent">
                Starter Pokémon
              </span>
            </motion.h1>
            <motion.p 
              className={themeClass('text-2xl md:text-3xl', THEME.colors.text.secondary, 'mb-12')}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Choose your partner from 9 generations of adventure
            </motion.p>
            
            {/* Quick Navigation */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <button
                onClick={() => scrollToSection('generation-showcase')}
                className={themeClass(
                  'px-8 py-4 rounded-full font-semibold',
                  THEME.colors.background.translucent,
                  THEME.colors.text.primary,
                  THEME.shadows.lg,
                  THEME.interactive.hover,
                  THEME.interactive.focus
                )}
              >
                Browse All Starters
              </button>
              <button
                onClick={() => scrollToSection('comparison')}
                className={themeClass(
                  'px-8 py-4 text-white rounded-full font-semibold',
                  isHighContrast
                    ? 'bg-black border-4 border-white'
                    : 'bg-gradient-to-r from-green-500 via-blue-500 to-red-500',
                  THEME.shadows.lg,
                  THEME.interactive.hover,
                  THEME.interactive.focus
                )}
              >
                Compare Starters
              </button>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <BsChevronDown className={themeClass('text-4xl', THEME.colors.text.secondary)} />
          </motion.div>
        </section>

        {/* Generation Tabs Navigation - Sticky */}
        <div className={themeClass(
          'sticky top-16 z-40 backdrop-blur-lg bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700',
          THEME.shadows.md
        )}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <style jsx>{`
              .generation-tabs::-webkit-scrollbar {
                height: 6px;
              }
              .generation-tabs::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.05);
                border-radius: 3px;
              }
              .generation-tabs::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 3px;
              }
              .generation-tabs::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 0, 0, 0.3);
              }
              .dark .generation-tabs::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
              }
              .dark .generation-tabs::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
              }
              .dark .generation-tabs::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
              }
            `}</style>
            <div className="generation-tabs flex overflow-x-auto gap-2 pb-2">
              {allGenerations.map((gen, index) => (
                <button
                  key={gen.generation}
                  onClick={() => {
                    setSelectedGen(index);
                    // Scroll to showcase section
                    const element = document.getElementById('generation-showcase');
                    if (element) {
                      const yOffset = -100; // Account for sticky header
                      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  className={themeClass(
                    'px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300',
                    selectedGen === index 
                      ? 'bg-gradient-to-r from-green-500 via-blue-500 to-red-500 text-white shadow-lg scale-105' 
                      : themeClass(
                          'bg-gray-100 dark:bg-gray-800',
                          'hover:bg-gray-200 dark:hover:bg-gray-700',
                          'text-gray-700 dark:text-gray-300'
                        )
                  )}
                >
                  Gen {gen.generation} - {gen.region}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generation Showcase Section */}
        <section id="generation-showcase" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedGen}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Generation Header */}
                <div className="text-center mb-12">
                  <h2 className={themeClass(THEME.typography.h2, THEME.colors.text.primary, 'mb-4')}>
                    {allGenerations[selectedGen].region} Region
                  </h2>
                  <p className={themeClass('text-xl', THEME.colors.text.secondary, 'mb-2')}>
                    Generation {allGenerations[selectedGen].generation}
                  </p>
                  {allGenerations[selectedGen].games && (
                    <p className={themeClass(THEME.colors.text.tertiary)}>
                      {allGenerations[selectedGen].games.join(' • ')}
                    </p>
                  )}
                  {allGenerations[selectedGen].description && (
                    <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
                      {allGenerations[selectedGen].description}
                    </p>
                  )}
                </div>

                {/* Starters Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                  {allGenerations[selectedGen].starters.map((starter, index) => (
                    <FadeIn key={starter.id} delay={index * 0.1}>
                      <motion.div
                        className={themeClass(
                          'relative rounded-3xl overflow-hidden cursor-pointer group',
                          THEME.colors.background.translucent,
                          THEME.shadows.xl,
                          expandedStarters[starter.id] ? 'md:col-span-3' : '',
                          'hover:shadow-2xl transition-shadow duration-300'
                        )}
                        layout
                        onClick={() => toggleStarterExpansion(starter.id)}
                      >
                        {/* Starter Header */}
                        <div className={`p-8 bg-gradient-to-br ${getTypeGradient(starter.types[0])}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-3xl font-bold text-white mb-2">
                                {starter.name}
                              </h3>
                              <div className="flex gap-2">
                                {starter.types.map(type => (
                                  <TypeBadge key={type} type={type} size="md" />
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleComparison(starter.id);
                                }}
                                className={themeClass(
                                  'p-3 rounded-full transition-all transform hover:scale-110',
                                  selectedForComparison.includes(starter.id)
                                    ? 'bg-yellow-400 text-yellow-900 shadow-lg'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                )}
                                title="Add to comparison"
                              >
                                {selectedForComparison.includes(starter.id) ? <BsStarFill className="text-lg" /> : <BsStar className="text-lg" />}
                              </button>
                              <div className={themeClass(
                                'p-3 bg-white/20 rounded-full text-white transition-all transform',
                                'group-hover:bg-white/30'
                              )}>
                                {expandedStarters[starter.id] ? <BsChevronUp className="text-lg" /> : <BsChevronDown className="text-lg" />}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Pokemon Image */}
                        <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 group-hover:from-gray-100 group-hover:to-gray-200 dark:group-hover:from-gray-700 dark:group-hover:to-gray-600 transition-all duration-300">
                          <Image
                            src={getPokemonImage(starter.id)}
                            alt={starter.name}
                            layout="fill"
                            objectFit="contain"
                            className="p-8 group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Click indicator */}
                          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                              <span>Click to expand</span>
                              <BsChevronDown className="text-xs" />
                            </div>
                          </div>
                        </div>

                        {/* Basic Info */}
                        <div className="p-6 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 transition-colors duration-300">
                          <p className={themeClass(THEME.colors.text.secondary, 'mb-6')}>{starter.description}</p>

                          {/* Stats Preview */}
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            {Object.entries(starter.stats).slice(0, 3).map(([stat, value]) => (
                              <div key={stat} className="text-center">
                                <div className="flex justify-center mb-1">
                                  {getStatIcon(stat)}
                                </div>
                                <p className={themeClass('text-xs capitalize', THEME.colors.text.tertiary)}>
                                  {stat.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <p className="text-lg font-bold">{value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Evolution Chain Preview */}
                          <div className="flex items-center justify-center gap-2">
                            {starter.evolutions.map((evo, idx) => (
                              <React.Fragment key={evo.id}>
                                <div className="text-center">
                                  <div className="relative w-16 h-16 mx-auto">
                                    <Image
                                      src={getPokemonImage(evo.id)}
                                      alt={evo.name}
                                      layout="fill"
                                      objectFit="contain"
                                    />
                                  </div>
                                  <p className="text-xs mt-1">{evo.name}</p>
                                </div>
                                {idx < starter.evolutions.length - 1 && (
                                  <BsChevronRight className="text-gray-400" />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {expandedStarters[starter.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-gray-200"
                            >
                              <div className="p-8 grid md:grid-cols-2 gap-8">
                                {/* Detailed Stats */}
                                <div>
                                  <h4 className="text-xl font-bold mb-4">Base Stats</h4>
                                  <div className="space-y-3">
                                    {Object.entries(starter.stats).map(([stat, value]) => (
                                      <div key={stat}>
                                        <div className="flex justify-between items-center mb-1">
                                          <div className="flex items-center gap-2">
                                            {getStatIcon(stat)}
                                            <span className="text-sm font-medium capitalize">
                                              {stat.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                          </div>
                                          <span className="text-sm font-bold">{value}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <motion.div 
                                            className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-full h-2"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${getStatPercentage(value)}%` }}
                                            transition={{ duration: 0.8, delay: 0.1 }}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                    <div className="pt-4 border-t border-gray-200">
                                      <div className="flex justify-between items-center">
                                        <span className="font-bold">Total</span>
                                        <span className="text-xl font-bold text-blue-600">
                                          {Object.values(starter.stats).reduce((a, b) => a + b, 0)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Additional Info */}
                                <div className="space-y-6">
                                  {/* Evolution Details */}
                                  <div>
                                    <h4 className="text-xl font-bold mb-4">Evolution Chain</h4>
                                    <div className="space-y-2">
                                      {starter.evolutions.map((evo, idx) => (
                                        <div key={evo.id} className="flex items-center gap-3">
                                          <div className="relative w-12 h-12">
                                            <Image
                                              src={getPokemonImage(evo.id)}
                                              alt={evo.name}
                                              layout="fill"
                                              objectFit="contain"
                                            />
                                          </div>
                                          <div>
                                            <p className="font-semibold">{evo.name}</p>
                                            <p className="text-sm text-gray-500">Level {evo.level}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Abilities if available */}
                                  {starter.abilities && (
                                    <div>
                                      <h4 className="text-xl font-bold mb-4">Abilities</h4>
                                      <div className="space-y-2">
                                        {starter.abilities.map(ability => (
                                          <p key={ability} className="text-gray-700">
                                            • {ability}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Strategy if available */}
                                  {starter.strategy && (
                                    <div>
                                      <h4 className="text-xl font-bold mb-4">Battle Strategy</h4>
                                      <p className="text-gray-700">{starter.strategy}</p>
                                    </div>
                                  )}

                                  {/* Fun Facts if available */}
                                  {starter.funFacts && (
                                    <div>
                                      <h4 className="text-xl font-bold mb-4">Fun Facts</h4>
                                      <ul className="space-y-1">
                                        {starter.funFacts.map((fact, idx) => (
                                          <li key={idx} className="text-gray-700">
                                            • {fact}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="px-8 pb-8 flex gap-4">
                                <Link href={`/pokedex/${starter.id}`}>
                                  <a className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-center hover:from-blue-600 hover:to-blue-700 transition-all">
                                    View in Pokédex
                                  </a>
                                </Link>
                                <Link href={`/pokemon/starters/${allGenerations[selectedGen].region.toLowerCase()}`}>
                                  <a className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold text-center hover:bg-gray-300 transition-all">
                                    {allGenerations[selectedGen].region} Details
                                  </a>
                                </Link>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </FadeIn>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Comparison Section */}
        <section id="comparison" className={themeClass(
          'py-20 px-4',
          'bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800'
        )}>
          <div className="max-w-7xl mx-auto">
            <FadeIn>
              <h2 className={themeClass(THEME.typography.h2, 'text-center', THEME.colors.text.primary, 'mb-4')}>
                Compare Starters
              </h2>
              <p className={themeClass('text-xl text-center', THEME.colors.text.secondary, 'mb-12')}>
                Select up to 3 starters to compare side by side
              </p>
            </FadeIn>

            {selectedForComparison.length > 0 ? (
              <FadeIn delay={0.2}>
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    {selectedForComparison.map(starterId => {
                      const starter = allGenerations
                        .flatMap(gen => gen.starters)
                        .find(s => s.id === starterId);
                      
                      if (!starter) return null;
                      
                      return (
                        <div key={starterId} className="text-center">
                          <div className="relative w-32 h-32 mx-auto mb-4">
                            <Image
                              src={getPokemonImage(starter.id)}
                              alt={starter.name}
                              layout="fill"
                              objectFit="contain"
                            />
                          </div>
                          <h3 className="text-xl font-bold mb-2">{starter.name}</h3>
                          <div className="flex justify-center gap-1 mb-4">
                            {starter.types.map(type => (
                              <TypeBadge key={type} type={type} size="sm" />
                            ))}
                          </div>
                          
                          {/* Stats Comparison */}
                          <div className="space-y-2 text-left">
                            {Object.entries(starter.stats).map(([stat, value]) => (
                              <div key={stat} className="flex justify-between">
                                <span className="text-sm capitalize">
                                  {stat.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="font-bold">{value}</span>
                              </div>
                            ))}
                            <div className="pt-2 border-t border-gray-200">
                              <div className="flex justify-between">
                                <span className="font-bold">Total</span>
                                <span className="font-bold text-blue-600">
                                  {Object.values(starter.stats).reduce((a, b) => a + b, 0)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleComparison(starterId)}
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>
            ) : (
              <FadeIn delay={0.2}>
                <div className="text-center py-20 bg-white/50 rounded-3xl">
                  <p className="text-2xl text-gray-500">
                    Click the star icon on any starter to add them to comparison
                  </p>
                </div>
              </FadeIn>
            )}
          </div>
        </section>

        {/* Advanced Tools Section */}
        <section id="advanced-tools" className={themeClass(THEME.spacing.section, 'px-4')}>
          <div className="max-w-7xl mx-auto">
            <FadeIn>
              <h2 className="text-5xl font-bold text-center text-gray-800 mb-4">
                Starter Insights
              </h2>
              <p className="text-xl text-center text-gray-600 mb-12">
                Deep dive into starter Pokémon statistics and trends
              </p>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Type Distribution */}
              <FadeIn delay={0.2}>
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold mb-6">Type Distribution</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaLeaf className="text-3xl text-green-500" />
                        <span className="font-semibold">Grass Starters</span>
                      </div>
                      <span className="text-2xl font-bold">9</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaFire className="text-3xl text-red-500" />
                        <span className="font-semibold">Fire Starters</span>
                      </div>
                      <span className="text-2xl font-bold">9</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaWater className="text-3xl text-blue-500" />
                        <span className="font-semibold">Water Starters</span>
                      </div>
                      <span className="text-2xl font-bold">9</span>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Popular Choices */}
              <FadeIn delay={0.3}>
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold mb-6">Popular Choices</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <Image
                          src={getPokemonImage(6)}
                          alt="Charizard"
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Charizard</p>
                        <p className="text-sm text-gray-500">Most popular evolution</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <Image
                          src={getPokemonImage(658)}
                          alt="Greninja"
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Greninja</p>
                        <p className="text-sm text-gray-500">Competitive favorite</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <Image
                          src={getPokemonImage(724)}
                          alt="Decidueye"
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Decidueye</p>
                        <p className="text-sm text-gray-500">Unique typing combo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Generation Overview */}
            <FadeIn delay={0.4}>
              <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">All Generations at a Glance</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
                  {allGenerations.map(gen => (
                    <button
                      key={gen.generation}
                      onClick={() => setSelectedGen(gen.generation - 1)}
                      className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                      <p className="font-bold text-lg">Gen {gen.generation}</p>
                      <p className="text-sm text-gray-600">{gen.region}</p>
                    </button>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Quick Navigation */}
        <motion.div 
          className="fixed bottom-8 right-8 flex flex-col gap-2"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={themeClass(
              'p-4 rounded-full',
              THEME.colors.background.translucent,
              THEME.shadows.lg,
              THEME.interactive.hover,
              THEME.interactive.focus
            )}
            title="Back to top"
          >
            <BsChevronUp className={themeClass('text-xl', THEME.colors.text.primary)} />
          </button>
        </motion.div>
      </div>
    </>
  );
};

export default StartersPage;