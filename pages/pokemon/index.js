import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../components/ui/animations";
import { useTheme } from "../../context/themecontext";
import { pokemonTheme } from "../../utils/pokemonTheme";
import { BsGlobeEuropeAfrica, BsBook } from "react-icons/bs";
import { RiGovernmentFill } from "react-icons/ri";
import { GiPokerHand, GiCardPickup } from "react-icons/gi";
import { FiShoppingBag } from "react-icons/fi";
import { AiOutlineBulb } from "react-icons/ai";
import { FullBleedWrapper } from "../../components/ui/FullBleedWrapper";

export default function PokemonHub() {
  const router = useRouter();
  const { theme } = useTheme();

  const sections = [
    {
      id: "regions",
      title: "Regions",
      description: "Explore all Pokémon regions from Kanto to Paldea",
      icon: <BsGlobeEuropeAfrica size={40} />,
      href: "/pokemon/regions",
      color: pokemonTheme.gradients.grass,
      iconBg: "bg-green-50 dark:bg-green-900/20"
    },
    {
      id: "starters",
      title: "Starter Pokémon",
      description: "Meet the starter Pokémon from every generation",
      icon: <GiPokerHand size={40} />,
      href: "/pokemon/starters",
      color: pokemonTheme.gradients.accent,
      iconBg: "bg-pink-50 dark:bg-pink-900/20"
    },
    {
      id: "moves",
      title: "Moves & TMs",
      description: "Complete database of moves, TMs, and HMs",
      icon: <BsBook size={40} />,
      href: "/pokemon/moves",
      color: pokemonTheme.gradients.water,
      iconBg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      id: "games",
      title: "Games",
      description: "Journey through all Pokémon game releases",
      icon: <GiCardPickup size={40} />,
      href: "/pokemon/games",
      color: pokemonTheme.gradients.electric,
      iconBg: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      id: "items",
      title: "Items",
      description: "Browse all items and their effects",
      icon: <FiShoppingBag size={40} />,
      href: "/pokemon/items",
      color: pokemonTheme.gradients.fire,
      iconBg: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      id: "abilities",
      title: "Abilities",
      description: "Discover all Pokémon abilities and their effects",
      icon: <AiOutlineBulb size={40} />,
      href: "/pokemon/abilities",
      color: pokemonTheme.gradients.fairy,
      iconBg: "bg-pink-50 dark:bg-pink-900/20"
    }
  ];

  return (
    <FullBleedWrapper gradient="regions">
      <Head>
        <title>Pokémon Hub | DexTrends</title>
        <meta name="description" content="Explore the world of Pokémon - regions, starters, gym leaders, moves, games, and more" />
      </Head>

      <FadeIn>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Pokémon World
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Your complete guide to the Pokémon universe
            </p>
          </div>

          {/* Feature Cards */}
          <StaggeredChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sections.map((section) => (
              <CardHover key={section.id}>
                <Link href={section.href} className={`block h-full rounded-2xl overflow-hidden transition-all duration-300 ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
                  } shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700`}>
                    {/* Gradient Header */}
                    <div className={`h-32 bg-gradient-to-br ${section.color} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/20" />
                      <div className="absolute -bottom-10 -right-10 opacity-20">
                        {React.cloneElement(section.icon, { size: 120 })}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className={`inline-flex p-3 rounded-xl ${section.iconBg} mb-4`}>
                        {section.icon}
                      </div>
                      <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {section.description}
                      </p>
                    </div>
                </Link>
              </CardHover>
            ))}
          </StaggeredChildren>

          {/* Quick Stats */}
          <SlideUp>
            <div className={`mt-12 p-8 rounded-2xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <h2 className="text-2xl font-bold mb-6 text-center">Pokémon Universe at a Glance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-red-400">1025+</div>
                  <div className="text-gray-600 dark:text-gray-400">Total Pokémon</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-pink-400">9</div>
                  <div className="text-gray-600 dark:text-gray-400">Generations</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-600">18</div>
                  <div className="text-gray-600 dark:text-gray-400">Types</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-500">900+</div>
                  <div className="text-gray-600 dark:text-gray-400">Moves</div>
                </div>
              </div>
            </div>
          </SlideUp>
        </div>
      </FadeIn>
    </FullBleedWrapper>
  );
}