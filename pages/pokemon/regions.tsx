import React, { useState } from "react";
import { NextPage } from 'next';
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion } from 'framer-motion';
import Container from '../../components/ui/Container';
import { FiChevronLeft, FiMap, FiGlobe } from 'react-icons/fi';

// Type definitions
interface Region {
  id: string;
  name: string;
  generation: number;
  description: string;
  mapImage: string;
  color: string;
  starters: string;
  starterIds: number[];
  gradientFrom: string;
  gradientTo: string;
}

// Region data with cleaner gradient colors
const regions: Region[] = [
  {
    id: "kanto",
    name: "Kanto",
    generation: 1,
    description: "The region where it all began. Home to the original 151 Pokémon.",
    mapImage: "/images/scraped/maps/PE_Kanto_Map.png",
    color: "red",
    starters: "Bulbasaur • Charmander • Squirtle",
    starterIds: [1, 4, 7],
    gradientFrom: "from-red-500",
    gradientTo: "to-orange-400"
  },
  {
    id: "johto",
    name: "Johto",
    generation: 2,
    description: "A region steeped in history and tradition, connected to Kanto.",
    mapImage: "/images/scraped/maps/JohtoMap.png",
    color: "yellow",
    starters: "Chikorita • Cyndaquil • Totodile",
    starterIds: [152, 155, 158],
    gradientFrom: "from-yellow-500",
    gradientTo: "to-amber-400"
  },
  {
    id: "hoenn",
    name: "Hoenn",
    generation: 3,
    description: "A tropical region with diverse ecosystems and weather phenomena.",
    mapImage: "/images/scraped/maps/Hoenn_ORAS.png",
    color: "green",
    starters: "Treecko • Torchic • Mudkip",
    starterIds: [252, 255, 258],
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-400"
  },
  {
    id: "sinnoh",
    name: "Sinnoh",
    generation: 4,
    description: "A region rich in mythology, featuring Mt. Coronet at its center.",
    mapImage: "/images/scraped/maps/Sinnoh_BDSP_artwork.png",
    color: "blue",
    starters: "Turtwig • Chimchar • Piplup",
    starterIds: [387, 390, 393],
    gradientFrom: "from-blue-500",
    gradientTo: "to-indigo-400"
  },
  {
    id: "unova",
    name: "Unova",
    generation: 5,
    description: "A diverse region inspired by New York, featuring only new Pokémon initially.",
    mapImage: "/images/scraped/maps/Unova_B2W2_alt.png",
    color: "gray",
    starters: "Snivy • Tepig • Oshawott",
    starterIds: [495, 498, 501],
    gradientFrom: "from-stone-600",
    gradientTo: "to-stone-500"
  },
  {
    id: "kalos",
    name: "Kalos",
    generation: 6,
    description: "A beautiful region inspired by France, introducing Mega Evolution.",
    mapImage: "/images/scraped/maps/Kalos_map.png",
    color: "pink",
    starters: "Chespin • Fennekin • Froakie",
    starterIds: [650, 653, 656],
    gradientFrom: "from-pink-500",
    gradientTo: "to-rose-400"
  },
  {
    id: "alola",
    name: "Alola",
    generation: 7,
    description: "A tropical paradise made up of four natural islands.",
    mapImage: "/images/scraped/maps/Alola_USUM_artwork.png",
    color: "orange",
    starters: "Rowlet • Litten • Popplio",
    starterIds: [722, 725, 728],
    gradientFrom: "from-orange-500",
    gradientTo: "to-amber-400"
  },
  {
    id: "galar",
    name: "Galar",
    generation: 8,
    description: "An industrial region inspired by Great Britain with Dynamax battles.",
    mapImage: "/images/scraped/maps/Galar_artwork.png",
    color: "purple",
    starters: "Grookey • Scorbunny • Sobble",
    starterIds: [810, 813, 816],
    gradientFrom: "from-purple-500",
    gradientTo: "to-violet-400"
  },
  {
    id: "paldea",
    name: "Paldea",
    generation: 9,
    description: "An open-world region inspired by Spain with three storylines to explore.",
    mapImage: "/images/scraped/maps/Paldea_artwork.png",
    color: "scarlet",
    starters: "Sprigatito • Fuecoco • Quaxly",
    starterIds: [906, 909, 912],
    gradientFrom: "from-rose-600",
    gradientTo: "to-amber-500"
  }
];

// Region Card Component
const RegionCard: React.FC<{ region: Region; index: number }> = ({ region, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/pokemon/regions/${region.id}`}>
        <Container
          variant="elevated"
          rounded="xl"
          className="group relative h-64 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Map Background */}
          <div className="absolute inset-0">
            <Image
              src={region.mapImage}
              alt={`${region.name} Map`}
              fill
              className={`object-cover transition-all duration-500 ${
                isHovered
                  ? 'scale-110 brightness-100'
                  : 'scale-100 brightness-75 grayscale-[50%]'
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${region.gradientFrom} ${region.gradientTo} opacity-60 transition-opacity duration-300 ${
              isHovered ? 'opacity-40' : 'opacity-60'
            }`} />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-end p-6">
            {/* Generation Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-white/90 dark:bg-stone-900/90 rounded-full text-xs font-bold text-stone-800 dark:text-stone-200">
                Gen {region.generation}
              </span>
            </div>

            {/* Region Name */}
            <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {region.name}
            </h3>

            {/* Description - shows on hover */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                height: isHovered ? 'auto' : 0
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-white text-sm mb-2 drop-shadow-md">{region.description}</p>
              <p className="text-white/90 text-xs drop-shadow-md">{region.starters}</p>
            </motion.div>

            {/* Default subtitle - hides on hover */}
            {!isHovered && (
              <p className="text-white text-sm drop-shadow-md">{region.starters}</p>
            )}
          </div>
        </Container>
      </Link>
    </motion.div>
  );
};

const RegionsPage: NextPage = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Pokémon Regions | DexTrends</title>
        <meta name="description" content="Explore all Pokémon regions from Kanto to Paldea. Discover the unique features, Pokémon, and stories of each region." />
        <meta name="keywords" content="Pokemon regions, Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Paldea" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 py-16 md:py-24">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Back Button */}
            <button
              onClick={() => router.push('/pokedex')}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
              <span>Back to Pokédex</span>
            </button>

            {/* Title */}
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <FiGlobe className="w-10 h-10 text-white/80" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  Pokémon Regions
                </h1>
                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                  Explore the diverse regions of the Pokémon world, from Kanto to Paldea
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">9</div>
                <div className="text-sm text-stone-600 dark:text-stone-300">Regions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">1000+</div>
                <div className="text-sm text-stone-600 dark:text-stone-300">Pokémon</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">27</div>
                <div className="text-sm text-stone-600 dark:text-stone-300">Starters</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">9</div>
                <div className="text-sm text-stone-600 dark:text-stone-300">Generations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Regions Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region, index) => (
              <RegionCard key={region.id} region={region} index={index} />
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-stone-100 dark:bg-stone-800/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">
              Ready to explore?
            </h2>
            <p className="text-stone-600 dark:text-stone-300 mb-6">
              Click on any region to discover its unique Pokémon, landmarks, and stories.
            </p>
            <Link
              href="/pokedex"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
            >
              <FiMap className="w-5 h-5" />
              Browse Full Pokédex
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegionsPage;
