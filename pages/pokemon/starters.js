import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../components/ui/animations";
import { useTheme } from "../../context/UnifiedAppContext";
import { pokemonTheme } from "../../utils/pokemonTheme";
import StyledBackButton from "../../components/ui/StyledBackButton";
import { TypeBadge } from "../../components/ui/TypeBadge";
import { GiPokerHand } from "react-icons/gi";
import { BsChevronLeft, BsChevronRight, BsGrid3X3, BsList } from "react-icons/bs";

// Comprehensive starter data
const startersByGeneration = [
  {
    generation: 1,
    region: "Kanto",
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
        description: "A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon."
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
        description: "The flame that burns at the tip of its tail is an indication of its emotions."
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
        description: "After birth, its back swells and hardens into a shell. It powerfully sprays foam from its mouth."
      }
    ]
  },
  {
    generation: 2,
    region: "Johto",
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
        description: "A sweet aroma gently wafts from the leaf on its head. It is docile and loves to soak up sunrays."
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
        description: "It is timid and always curls itself up in a ball. If attacked, it flares up its back for protection."
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
        description: "Its well-developed jaws are powerful and capable of crushing anything. Even its trainer must be careful."
      }
    ]
  },
  {
    generation: 3,
    region: "Hoenn",
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
        description: "It quickly scales even vertical walls. It senses humidity with its tail to predict the next day's weather."
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
        description: "It has a flame sac inside its belly that perpetually burns. It feels warm if it is hugged."
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
        description: "The fin on its head is a radar that can sense nearby movements in water."
      }
    ]
  },
  {
    generation: 4,
    region: "Sinnoh",
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
        description: "Made from soil, the shell on its back hardens when it drinks water. It lives along lakes."
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
        description: "Its fiery rear end is fueled by gas made in its belly. Even rain can't extinguish the fire."
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
        description: "It doesn't like to be taken care of. It's difficult to bond with since it won't listen to its Trainer."
      }
    ]
  },
  {
    generation: 5,
    region: "Unova",
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
        description: "It is very intelligent and calm. Being exposed to lots of sunlight makes its movements swifter."
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
        description: "It can deftly dodge its foe's attacks while shooting fireballs from its nose."
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
        description: "It fights using the scalchop on its stomach. In response to an attack, it retaliates immediately."
      }
    ]
  },
  {
    generation: 6,
    region: "Kalos",
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
        description: "The quills on its head are usually soft. When it flexes them, the points become so hard and sharp that they can pierce rock."
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
        description: "Eating a twig fills it with energy, and its roomy ears give vent to air hotter than 390 degrees Fahrenheit."
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
        description: "It secretes flexible bubbles from its chest and back. The bubbles reduce the damage it would otherwise take when attacked."
      }
    ]
  },
  {
    generation: 7,
    region: "Alola",
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
        description: "This wary Pokémon uses photosynthesis to store up energy during the day, while becoming active at night."
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
        description: "While grooming itself, it builds up fur inside its stomach. It sets the fur alight and spews fiery attacks."
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
        description: "This Pokémon snorts body fluids from its nose, blowing balloons to smash into its foes."
      }
    ]
  },
  {
    generation: 8,
    region: "Galar",
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
        description: "When it uses its special stick to strike up a beat, the sound waves produced carry revitalizing energy."
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
        description: "It has special pads on the backs of its feet, and one on its nose. Once it's raring to fight, these pads radiate heat."
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
        description: "When scared, this Pokémon cries. Its tears pack the chemical punch of 100 onions."
      }
    ]
  },
  {
    generation: 9,
    region: "Paldea",
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
        description: "Its fluffy fur is similar in composition to plants. This Pokémon frequently washes its face to keep it from drying out."
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
        description: "It lies on warm rocks and uses the heat absorbed by its square-shaped scales to create fire energy."
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
        description: "Its strong legs let it easily swim around in even fast-flowing rivers. It likes to keep things tidy."
      }
    ]
  }
];

export default function StartersPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedGen, setSelectedGen] = useState(0);
  const [viewMode, setViewMode] = useState("single"); // single or comparison
  const [typeFilter, setTypeFilter] = useState("all");

  const getPokemonImage = (pokemonId) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  };

  const getStatPercentage = (stat) => {
    return (stat / 255) * 100;
  };

  const getStatColor = (stat) => {
    if (stat >= 100) return pokemonTheme.gradients.grass;
    if (stat >= 80) return pokemonTheme.gradients.water;
    if (stat >= 60) return pokemonTheme.gradients.electric;
    return pokemonTheme.gradients.fire;
  };

  const allTypes = ["all", "grass", "fire", "water", "poison", "flying"];

  const filteredGenerations = startersByGeneration.filter(gen => {
    if (typeFilter === "all") return true;
    return gen.starters.some(starter => 
      starter.types.includes(typeFilter)
    );
  });

  const currentGen = filteredGenerations[selectedGen];

  const handlePrevGen = () => {
    setSelectedGen(prev => Math.max(0, prev - 1));
  };

  const handleNextGen = () => {
    setSelectedGen(prev => Math.min(filteredGenerations.length - 1, prev + 1));
  };

  return (
    <div className="min-h-screen">
      <Head>
        <title>Starter Pokémon | DexTrends</title>
        <meta name="description" content="Meet all starter Pokémon from every generation" />
      </Head>

      <FadeIn>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <StyledBackButton 
              text="Back to Pokémon Hub" 
              onClick={() => router.push('/pokemon')} 
            />
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <GiPokerHand className="text-red-400" />
              <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Starter Pokémon
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Choose your partner from {startersByGeneration.length} generations of starters
            </p>
          </div>

          {/* Controls */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              {allTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    typeFilter === type
                      ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("single")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  viewMode === "single"
                    ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <BsList /> Single View
              </button>
              <button
                onClick={() => setViewMode("comparison")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  viewMode === "comparison"
                    ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <BsGrid3X3 /> Comparison
              </button>
            </div>
          </div>

          {/* Navigation */}
          {viewMode === "single" && currentGen && (
            <div className="mb-8 flex items-center justify-between">
              <button
                onClick={handlePrevGen}
                disabled={selectedGen === 0}
                className={`p-3 rounded-full transition-all ${
                  selectedGen === 0
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                } shadow-md`}
              >
                <BsChevronLeft size={24} />
              </button>

              <div className="text-center">
                <Link 
                  href={`/pokemon/regions/${currentGen.region.toLowerCase()}`}
                  className="group"
                >
                  <h2 className="text-3xl font-bold group-hover:text-pokemon-blue transition-colors">{currentGen.region} Region</h2>
                </Link>
                <p className="text-lg text-gray-600 dark:text-gray-400">Generation {currentGen.generation}</p>
              </div>

              <button
                onClick={handleNextGen}
                disabled={selectedGen === filteredGenerations.length - 1}
                className={`p-3 rounded-full transition-all ${
                  selectedGen === filteredGenerations.length - 1
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                } shadow-md`}
              >
                <BsChevronRight size={24} />
              </button>
            </div>
          )}

          {/* Content */}
          {viewMode === "single" && currentGen ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {currentGen.starters.map((starter) => (
                <StarterCard key={starter.id} starter={starter} theme={theme} />
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {filteredGenerations.map((gen) => (
                <div key={gen.generation}>
                  <h2 className="text-2xl font-bold mb-6">
                    Generation {gen.generation} - 
                    <Link 
                      href={`/pokemon/regions/${gen.region.toLowerCase()}`}
                      className="text-pokemon-blue hover:text-pokemon-red transition-colors ml-2"
                    >
                      {gen.region}
                    </Link>
                  </h2>
                  {/* Comparison Table */}
                  <div className={`rounded-xl overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            <th className="p-4 text-left font-bold">Pokémon</th>
                            <th className="p-4 text-center">Type</th>
                            <th className="p-4 text-center">HP</th>
                            <th className="p-4 text-center">Attack</th>
                            <th className="p-4 text-center">Defense</th>
                            <th className="p-4 text-center">Sp. Atk</th>
                            <th className="p-4 text-center">Sp. Def</th>
                            <th className="p-4 text-center">Speed</th>
                            <th className="p-4 text-center">Total</th>
                            <th className="p-4 text-center">Final Evolution</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gen.starters.map((starter, idx) => (
                            <tr key={starter.id} className={`border-t ${
                              theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                            } ${idx % 2 === 0 ? (
                              theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
                            ) : ''}`}>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-16 h-16">
                                    <Image
                                      src={getPokemonImage(starter.id)}
                                      alt={starter.name}
                                      layout="fill"
                                      objectFit="contain"
                                    />
                                  </div>
                                  <div>
                                    <Link href={`/pokedex/${starter.id}`} className="font-bold hover:text-pink-400 transition-colors">
                                      {starter.name}
                                    </Link>
                                    <div className="text-sm text-gray-500">#{starter.id.toString().padStart(3, '0')}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex gap-1 justify-center">
                                  {starter.types.map(type => (
                                    <TypeBadge key={type} type={type} size="sm" />
                                  ))}
                                </div>
                              </td>
                              <td className="p-4 text-center font-medium">{starter.stats.hp}</td>
                              <td className="p-4 text-center font-medium">{starter.stats.attack}</td>
                              <td className="p-4 text-center font-medium">{starter.stats.defense}</td>
                              <td className="p-4 text-center font-medium">{starter.stats.spAttack}</td>
                              <td className="p-4 text-center font-medium">{starter.stats.spDefense}</td>
                              <td className="p-4 text-center font-medium">{starter.stats.speed}</td>
                              <td className="p-4 text-center font-bold text-pink-400">
                                {Object.values(starter.stats).reduce((a, b) => a + b, 0)}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2 justify-center">
                                  {starter.evolutions.slice(-1).map(evo => (
                                    <div key={evo.id} className="text-center">
                                      <div className="relative w-12 h-12 mx-auto">
                                        <Image
                                          src={getPokemonImage(evo.id)}
                                          alt={evo.name}
                                          layout="fill"
                                          objectFit="contain"
                                        />
                                      </div>
                                      <div className="text-xs">{evo.name}</div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Region Navigation Links */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6 text-center">Explore by Region</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {startersByGeneration.map((gen) => (
                <Link
                  key={gen.generation}
                  href={`/pokemon/starters/${gen.region.toLowerCase()}`}
                  className={`p-4 rounded-xl text-center transition-all ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  } hover:shadow-md border border-transparent hover:border-pink-200`}
                >
                  <div className="text-lg font-bold">{gen.region}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Gen {gen.generation}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

// Starter Card Component
function StarterCard({ starter, theme, compact = false }) {
  const getPokemonImage = (pokemonId) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  };

  const getStatPercentage = (stat) => {
    return (stat / 255) * 100;
  };

  return (
    <CardHover>
      <div className={`rounded-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
      } shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700`}>
        {/* Header */}
        <div className={`p-6 bg-gradient-to-br ${
          starter.types[0] === 'grass' ? pokemonTheme.gradients.grass :
          starter.types[0] === 'fire' ? pokemonTheme.gradients.fire :
          pokemonTheme.gradients.water
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-white">{starter.name}</h3>
              <div className="flex gap-2 mt-2">
                {starter.types.map(type => (
                  <TypeBadge key={type} type={type} size="sm" />
                ))}
              </div>
            </div>
            <div className="text-white/80 text-sm">#{starter.id.toString().padStart(3, '0')}</div>
          </div>
        </div>

        {/* Pokemon Image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
          <Image
            src={getPokemonImage(starter.id)}
            alt={starter.name}
            layout="fill"
            objectFit="contain"
            className="p-4"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {starter.description}
          </p>

          {/* Evolution Chain */}
          <div className="mb-4">
            <h4 className="font-bold text-sm mb-2">Evolution Chain</h4>
            <div className="flex items-center justify-between">
              {starter.evolutions.map((evo, idx) => (
                <React.Fragment key={evo.id}>
                  <Link href={`/pokedex/${evo.id}`} className="text-center group">
                    <div className="relative w-16 h-16 mx-auto mb-1">
                      <Image
                        src={getPokemonImage(evo.id)}
                        alt={evo.name}
                        layout="fill"
                        objectFit="contain"
                        className="group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <p className="text-xs font-medium">{evo.name}</p>
                    <p className="text-xs text-gray-500">Lv. {evo.level}</p>
                  </Link>
                  {idx < starter.evolutions.length - 1 && (
                    <BsChevronRight className="text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Stats - Always Visible */}
          {
            <div className="mt-4 space-y-2">
              {Object.entries(starter.stats).map(([stat, value]) => (
                <div key={stat}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium capitalize">
                      {stat.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-xs font-bold">{value}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${pokemonTheme.gradients.accent} rounded-full h-2 transition-all duration-500`}
                      style={{ width: `${getStatPercentage(value)}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-xs font-bold">Total</span>
                  <span className="text-xs font-bold">
                    {Object.values(starter.stats).reduce((a, b) => a + b, 0)}
                  </span>
                </div>
              </div>
            </div>
          }

          {/* Link to Region Starters */}
          <Link
            href={`/pokedex/${starter.id}`}
            className="mt-4 block w-full py-2 rounded-lg bg-gradient-to-r from-red-400 to-pink-400 text-white text-center font-semibold hover:opacity-90 transition-opacity"
          >
            View in Pokédex
          </Link>
        </div>
      </div>
    </CardHover>
  );
}