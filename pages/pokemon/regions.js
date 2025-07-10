import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../components/ui/animations";
import { useTheme } from "../../context/themecontext";
import StyledBackButton from "../../components/ui/StyledBackButton";
import { BsGlobeEuropeAfrica, BsChevronRight } from "react-icons/bs";
import { FullBleedWrapper } from "../../components/ui/FullBleedWrapper";

// Comprehensive region data
const regions = [
  {
    id: "kanto",
    name: "Kanto",
    generation: 1,
    games: ["Red", "Blue", "Yellow", "FireRed", "LeafGreen", "Let's Go Pikachu/Eevee"],
    description: "The region where it all began. Home to the original 151 Pokémon.",
    professor: "Professor Oak",
    starters: ["Bulbasaur", "Charmander", "Squirtle"],
    starterIds: [1, 4, 7],
    legendaries: ["Articuno", "Zapdos", "Moltres", "Mewtwo", "Mew"],
    cities: 10,
    routes: 25,
    pokemonRange: "001-151",
    color: "from-red-500 to-blue-500",
    bgColor: "bg-gradient-to-br from-red-100 to-blue-100 dark:from-red-900 dark:to-blue-900"
  },
  {
    id: "johto",
    name: "Johto",
    generation: 2,
    games: ["Gold", "Silver", "Crystal", "HeartGold", "SoulSilver"],
    description: "A region steeped in history and tradition, connected to Kanto.",
    professor: "Professor Elm",
    starters: ["Chikorita", "Cyndaquil", "Totodile"],
    starterIds: [152, 155, 158],
    legendaries: ["Raikou", "Entei", "Suicune", "Lugia", "Ho-Oh", "Celebi"],
    cities: 10,
    routes: 20,
    pokemonRange: "152-251",
    color: "from-yellow-500 to-silver-500",
    bgColor: "bg-gradient-to-br from-yellow-100 to-gray-100 dark:from-yellow-900 dark:to-gray-900"
  },
  {
    id: "hoenn",
    name: "Hoenn",
    generation: 3,
    games: ["Ruby", "Sapphire", "Emerald", "Omega Ruby", "Alpha Sapphire"],
    description: "A tropical region with diverse ecosystems and weather phenomena.",
    professor: "Professor Birch",
    starters: ["Treecko", "Torchic", "Mudkip"],
    starterIds: [252, 255, 258],
    legendaries: ["Kyogre", "Groudon", "Rayquaza", "Regice", "Regirock", "Registeel", "Latias", "Latios"],
    cities: 16,
    routes: 34,
    pokemonRange: "252-386",
    color: "from-emerald-500 to-blue-600",
    bgColor: "bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900"
  },
  {
    id: "sinnoh",
    name: "Sinnoh",
    generation: 4,
    games: ["Diamond", "Pearl", "Platinum", "Brilliant Diamond", "Shining Pearl"],
    description: "A region rich in mythology, featuring Mt. Coronet at its center.",
    professor: "Professor Rowan",
    starters: ["Turtwig", "Chimchar", "Piplup"],
    starterIds: [387, 390, 393],
    legendaries: ["Dialga", "Palkia", "Giratina", "Uxie", "Mesprit", "Azelf", "Cresselia", "Darkrai"],
    cities: 14,
    routes: 30,
    pokemonRange: "387-493",
    color: "from-indigo-500 to-purple-600",
    bgColor: "bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900"
  },
  {
    id: "unova",
    name: "Unova",
    generation: 5,
    games: ["Black", "White", "Black 2", "White 2"],
    description: "A diverse region inspired by New York, featuring only new Pokémon initially.",
    professor: "Professor Juniper",
    starters: ["Snivy", "Tepig", "Oshawott"],
    starterIds: [495, 498, 501],
    legendaries: ["Reshiram", "Zekrom", "Kyurem", "Cobalion", "Terrakion", "Virizion", "Tornadus", "Thundurus", "Landorus"],
    cities: 17,
    routes: 23,
    pokemonRange: "494-649",
    color: "from-gray-600 to-black",
    bgColor: "bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900"
  },
  {
    id: "kalos",
    name: "Kalos",
    generation: 6,
    games: ["X", "Y"],
    description: "A beautiful region inspired by France, introducing Mega Evolution.",
    professor: "Professor Sycamore",
    starters: ["Chespin", "Fennekin", "Froakie"],
    starterIds: [650, 653, 656],
    legendaries: ["Xerneas", "Yveltal", "Zygarde"],
    cities: 16,
    routes: 22,
    pokemonRange: "650-721",
    color: "from-pink-500 to-purple-500",
    bgColor: "bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900"
  },
  {
    id: "alola",
    name: "Alola",
    generation: 7,
    games: ["Sun", "Moon", "Ultra Sun", "Ultra Moon"],
    description: "A tropical paradise of four islands with unique Alolan forms.",
    professor: "Professor Kukui",
    starters: ["Rowlet", "Litten", "Popplio"],
    starterIds: [722, 725, 728],
    legendaries: ["Solgaleo", "Lunala", "Necrozma", "Tapu Koko", "Tapu Lele", "Tapu Bulu", "Tapu Fini"],
    cities: 10,
    routes: 17,
    pokemonRange: "722-809",
    color: "from-orange-500 to-teal-500",
    bgColor: "bg-gradient-to-br from-orange-100 to-teal-100 dark:from-orange-900 dark:to-teal-900"
  },
  {
    id: "galar",
    name: "Galar",
    generation: 8,
    games: ["Sword", "Shield"],
    description: "An industrial region inspired by Great Britain, featuring Dynamax battles.",
    professor: "Professor Magnolia",
    starters: ["Grookey", "Scorbunny", "Sobble"],
    starterIds: [810, 813, 816],
    legendaries: ["Zacian", "Zamazenta", "Eternatus"],
    cities: 13,
    routes: 10,
    pokemonRange: "810-898",
    color: "from-purple-600 to-red-600",
    bgColor: "bg-gradient-to-br from-purple-100 to-red-100 dark:from-purple-900 dark:to-red-900"
  },
  {
    id: "paldea",
    name: "Paldea",
    generation: 9,
    games: ["Scarlet", "Violet"],
    description: "An open-world region inspired by Spain and Portugal.",
    professor: "Professor Sada/Turo",
    starters: ["Sprigatito", "Fuecoco", "Quaxly"],
    starterIds: [906, 909, 912],
    legendaries: ["Koraidon", "Miraidon"],
    cities: 8,
    routes: "Open World",
    pokemonRange: "906-1025",
    color: "from-scarlet-500 to-violet-600",
    bgColor: "bg-gradient-to-br from-red-100 to-violet-100 dark:from-red-900 dark:to-violet-900"
  }
];

export default function RegionsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedRegion, setSelectedRegion] = useState(null);

  const getStarterImage = (pokemonId) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  };

  return (
    <FullBleedWrapper gradient="regions">
      <Head>
        <title>Pokémon Regions | DexTrends</title>
        <meta name="description" content="Explore all Pokémon regions from Kanto to Paldea" />
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
            <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <BsGlobeEuropeAfrica className="text-blue-500" />
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Pokémon Regions
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Journey through {regions.length} unique regions across {Math.max(...regions.map(r => r.generation))} generations
            </p>
          </div>

          {/* Regions Grid */}
          <StaggeredChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region) => (
              <CardHover key={region.id}>
                <div 
                  className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } shadow-lg hover:shadow-2xl`}
                  onClick={() => setSelectedRegion(region)}
                >
                  {/* Region Header */}
                  <div className={`h-32 ${region.bgColor} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h2 className="text-3xl font-bold">{region.name}</h2>
                      <p className="text-sm opacity-90">Generation {region.generation}</p>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white text-sm font-semibold">{region.pokemonRange}</span>
                    </div>
                  </div>

                  {/* Region Content */}
                  <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {region.description}
                    </p>

                    {/* Starter Pokemon Preview */}
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Starter Pokémon</h3>
                      <div className="flex gap-2">
                        {region.starterIds.map((id, idx) => (
                          <div key={id} className="relative w-16 h-16">
                            <Image
                              src={getStarterImage(id)}
                              alt={region.starters[idx]}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Professor:</span>
                        <p className="font-semibold">{region.professor}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Cities:</span>
                        <p className="font-semibold">{region.cities}</p>
                      </div>
                    </div>

                    {/* View More Button */}
                    <Link 
                      href={`/pokemon/regions/${region.id}`}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                      Explore {region.name}
                      <BsChevronRight />
                    </Link>
                  </div>
                </div>
              </CardHover>
            ))}
          </StaggeredChildren>

          {/* Region Modal */}
          {selectedRegion && (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedRegion(null)}
            >
              <SlideUp>
                <div 
                  className={`max-w-4xl w-full rounded-2xl overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } max-h-[90vh] overflow-y-auto`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className={`h-48 ${selectedRegion.bgColor} relative`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h2 className="text-4xl font-bold mb-2">{selectedRegion.name} Region</h2>
                      <p className="text-lg opacity-90">Generation {selectedRegion.generation}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedRegion(null)}
                      className="absolute top-4 right-4 text-white bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div>
                        <h3 className="text-2xl font-bold mb-4">Overview</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          {selectedRegion.description}
                        </p>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Games</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedRegion.games.map(game => (
                                <span key={game} className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                                  {game}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Legendary Pokémon</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedRegion.legendaries.map(legendary => (
                                <span key={legendary} className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm">
                                  {legendary}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div>
                        <h3 className="text-2xl font-bold mb-4">Starter Pokémon</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {selectedRegion.starterIds.map((id, idx) => (
                            <div key={id} className="text-center">
                              <div className="relative w-full aspect-square mb-2">
                                <Image
                                  src={getStarterImage(id)}
                                  alt={selectedRegion.starters[idx]}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <p className="font-semibold">{selectedRegion.starters[idx]}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Professor</p>
                            <p className="font-bold">{selectedRegion.professor}</p>
                          </div>
                          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Routes</p>
                            <p className="font-bold">{selectedRegion.routes}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex gap-4">
                      <Link 
                        href={`/pokemon/regions/${selectedRegion.id}`}
                        className="flex-1 text-center py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity"
                      >
                        Explore {selectedRegion.name}
                      </Link>
                      <Link 
                        href="/pokemon/games"
                        className="flex-1 text-center py-3 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-opacity"
                      >
                        View Games
                      </Link>
                    </div>
                  </div>
                </div>
              </SlideUp>
            </div>
          )}
        </div>
      </FadeIn>
    </FullBleedWrapper>
  );
}