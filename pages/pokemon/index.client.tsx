import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { BsGlobeEuropeAfrica, BsBook } from "react-icons/bs";
import { RiGovernmentFill } from "react-icons/ri";
import { GiPokerHand, GiCardPickup } from "react-icons/gi";
import { FiShoppingBag } from "react-icons/fi";
import { AiOutlineBulb } from "react-icons/ai";
import type { FC } from "react";
import logger from '../../utils/logger';

// Types for dynamic imports
interface AnimationComponents {
  FadeIn: FC<{ children: React.ReactNode; delay?: number }>;
  SlideUp: FC<{ children: React.ReactNode; delay?: number }>;
  CardHover: FC<{ children: React.ReactNode }>;
  StaggeredChildren: FC<{ children: React.ReactNode }>;
}

interface DynamicComponents extends AnimationComponents {
  FullBleedWrapper: FC<{ gradient?: string | object; children: React.ReactNode; className?: string }>;
  useTheme: () => { theme: string };
  pokemonTheme: Record<string, unknown>;
}

type PokemonHubContentProps = DynamicComponents;

interface Section {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  hoverColor: string;
}

// Component that renders after dynamic imports are loaded
const PokemonHubContent: FC<PokemonHubContentProps> = ({ 
  FadeIn, 
  SlideUp, 
  CardHover, 
  StaggeredChildren, 
  FullBleedWrapper, 
  useTheme, 
  pokemonTheme 
}) => {
  const router = useRouter();
  const { theme } = useTheme();

  const sections: Section[] = [
    {
      id: "regions",
      title: "Regions",
      description: "Explore all Pokémon regions from Kanto to Paldea",
      icon: <BsGlobeEuropeAfrica size={40} />,
      href: "/pokemon/regions",
      color: "from-blue-500 to-purple-500",
      hoverColor: "hover:from-blue-600 hover:to-purple-600"
    },
    {
      id: "games",
      title: "Games",
      description: "Discover all Pokémon games across generations",
      icon: <GiPokerHand size={40} />,
      href: "/pokemon/games",
      color: "from-purple-500 to-pink-500",
      hoverColor: "hover:from-purple-600 hover:to-pink-600"
    },
    {
      id: "starters",
      title: "Starters",
      description: "Meet all starter Pokémon from every generation",
      icon: <BsBook size={40} />,
      href: "/pokemon/starters",
      color: "from-green-500 to-blue-500",
      hoverColor: "hover:from-green-600 hover:to-blue-600"
    },
    {
      id: "pokedex",
      title: "Pokédex",
      description: "Browse the complete National Pokédex",
      icon: <RiGovernmentFill size={40} />,
      href: "/pokedex",
      color: "from-red-500 to-orange-500",
      hoverColor: "hover:from-red-600 hover:to-orange-600"
    },
    {
      id: "tcg",
      title: "TCG Cards",
      description: "Explore Pokémon Trading Card Game collection",
      icon: <GiCardPickup size={40} />,
      href: "/",
      color: "from-yellow-500 to-orange-500",
      hoverColor: "hover:from-yellow-600 hover:to-orange-600"
    },
    {
      id: "abilities",
      title: "Abilities",
      description: "Learn about all Pokémon abilities",
      icon: <AiOutlineBulb size={40} />,
      href: "/pokemon/abilities",
      color: "from-purple-500 to-indigo-500",
      hoverColor: "hover:from-purple-600 hover:to-indigo-600"
    },
    {
      id: "moves",
      title: "Moves",
      description: "Discover all Pokémon moves and attacks",
      icon: <AiOutlineBulb size={40} />,
      href: "/pokemon/moves",
      color: "from-orange-500 to-red-500",
      hoverColor: "hover:from-orange-600 hover:to-red-600"
    },
    {
      id: "items",
      title: "Items",
      description: "Browse all items from the Pokémon world",
      icon: <FiShoppingBag size={40} />,
      href: "/pokemon/items",
      color: "from-teal-500 to-green-500",
      hoverColor: "hover:from-teal-600 hover:to-green-600"
    }
  ];

  return (
    <FullBleedWrapper gradient="pokemon">
      <Head>
        <title>Pokémon Hub - DexTrends</title>
        <meta name="description" content="Explore the world of Pokémon - Regions, Games, Starters, and more!" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pokémon Hub
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your gateway to the Pokémon universe
            </p>
          </div>
        </FadeIn>

        <StaggeredChildren>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {sections.map((section, index) => (
              <SlideUp key={section.id} delay={index * 100}>
                <CardHover>
                  <Link
                    href={section.href}
                    className={`block p-6 rounded-2xl shadow-lg bg-white dark:bg-gray-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group`}
                  >
                    <div
                      className={`w-20 h-20 rounded-full bg-gradient-to-r ${section.color} ${section.hoverColor} flex items-center justify-center mb-4 mx-auto text-white transition-all duration-300 group-hover:scale-110`}
                    >
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-white">
                      {section.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-center">
                      {section.description}
                    </p>
                  </Link>
                </CardHover>
              </SlideUp>
            ))}
          </div>
        </StaggeredChildren>

        {/* Recent Activity */}
        <FadeIn delay={600}>
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Popular Sections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Latest Pokémon</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Generation IX Pokémon</li>
                  <li>• Paldea Region Updates</li>
                  <li>• New Forms & Variants</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Featured Games</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Pokémon Scarlet & Violet</li>
                  <li>• Pokémon Legends: Arceus</li>
                  <li>• Pokémon GO Updates</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Type Effectiveness Chart</li>
                  <li>• Evolution Methods</li>
                  <li>• Competitive Guides</li>
                </ul>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </FullBleedWrapper>
  );
};

const PokemonHub: NextPage = () => {
  const [componentsLoaded, setComponentsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dynamicComponents, setDynamicComponents] = useState<DynamicComponents | null>(null);

  useEffect(() => {
    // Load all dynamic imports
    Promise.all([
      import("../../components/ui/animations/animations"),
      import("../../context/UnifiedAppContext"),
      import("../../utils/pokemonTheme"),
      import("../../components/ui/FullBleedWrapper")
    ])
    .then(([animations, context, theme, wrapper]) => {
      setDynamicComponents({
        FadeIn: animations.FadeIn,
        SlideUp: animations.SlideUp,
        CardHover: animations.CardHover,
        StaggeredChildren: animations.StaggeredChildren,
        useTheme: context.useTheme,
        pokemonTheme: theme.default,
        FullBleedWrapper: wrapper.default
      });
      setComponentsLoaded(true);
    })
    .catch(err => {
      logger.error("Failed to load components:", { error: err });
      setLoadError(err.message);
    });
  }, []);

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Error</h1>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!componentsLoaded || !dynamicComponents) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Pokémon Hub...</p>
        </div>
      </div>
    );
  }

  return <PokemonHubContent {...dynamicComponents} />;
};

export default PokemonHub;