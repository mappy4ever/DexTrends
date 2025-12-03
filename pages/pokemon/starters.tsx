import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { NextPage } from 'next';
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { cn } from "@/utils/cn";

// Types
interface StarterPokemon {
  id: number;
  name: string;
  types: string[];
  finalEvolution: {
    id: number;
    name: string;
    types: string[];
  };
}

interface Region {
  id: string;
  name: string;
  generation: number;
  gradient: string;
  bgGradient: string;
  starters: StarterPokemon[];
  games: string;
  description: string;
}

// Region data
const regions: Region[] = [
  {
    id: "kanto",
    name: "Kanto",
    generation: 1,
    gradient: "from-red-500 to-amber-500",
    bgGradient: "from-red-500/10 to-amber-500/10",
    starters: [
      { id: 1, name: "Bulbasaur", types: ["grass", "poison"], finalEvolution: { id: 3, name: "Venusaur", types: ["grass", "poison"] } },
      { id: 4, name: "Charmander", types: ["fire"], finalEvolution: { id: 6, name: "Charizard", types: ["fire", "flying"] } },
      { id: 7, name: "Squirtle", types: ["water"], finalEvolution: { id: 9, name: "Blastoise", types: ["water"] } }
    ],
    games: "Red • Blue • Yellow",
    description: "Where the adventure began"
  },
  {
    id: "johto",
    name: "Johto",
    generation: 2,
    gradient: "from-yellow-500 to-amber-600",
    bgGradient: "from-yellow-500/10 to-amber-600/10",
    starters: [
      { id: 152, name: "Chikorita", types: ["grass"], finalEvolution: { id: 154, name: "Meganium", types: ["grass"] } },
      { id: 155, name: "Cyndaquil", types: ["fire"], finalEvolution: { id: 157, name: "Typhlosion", types: ["fire"] } },
      { id: 158, name: "Totodile", types: ["water"], finalEvolution: { id: 160, name: "Feraligatr", types: ["water"] } }
    ],
    games: "Gold • Silver • Crystal",
    description: "A land of tradition"
  },
  {
    id: "hoenn",
    name: "Hoenn",
    generation: 3,
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
    starters: [
      { id: 252, name: "Treecko", types: ["grass"], finalEvolution: { id: 254, name: "Sceptile", types: ["grass"] } },
      { id: 255, name: "Torchic", types: ["fire"], finalEvolution: { id: 257, name: "Blaziken", types: ["fire", "fighting"] } },
      { id: 258, name: "Mudkip", types: ["water"], finalEvolution: { id: 260, name: "Swampert", types: ["water", "ground"] } }
    ],
    games: "Ruby • Sapphire • Emerald",
    description: "Tropical paradise"
  },
  {
    id: "sinnoh",
    name: "Sinnoh",
    generation: 4,
    gradient: "from-indigo-500 to-purple-500",
    bgGradient: "from-indigo-500/10 to-purple-500/10",
    starters: [
      { id: 387, name: "Turtwig", types: ["grass"], finalEvolution: { id: 389, name: "Torterra", types: ["grass", "ground"] } },
      { id: 390, name: "Chimchar", types: ["fire"], finalEvolution: { id: 392, name: "Infernape", types: ["fire", "fighting"] } },
      { id: 393, name: "Piplup", types: ["water"], finalEvolution: { id: 395, name: "Empoleon", types: ["water", "steel"] } }
    ],
    games: "Diamond • Pearl • Platinum",
    description: "Land of myths"
  },
  {
    id: "unova",
    name: "Unova",
    generation: 5,
    gradient: "from-stone-600 to-stone-700",
    bgGradient: "from-stone-600/10 to-stone-700/10",
    starters: [
      { id: 495, name: "Snivy", types: ["grass"], finalEvolution: { id: 497, name: "Serperior", types: ["grass"] } },
      { id: 498, name: "Tepig", types: ["fire"], finalEvolution: { id: 500, name: "Emboar", types: ["fire", "fighting"] } },
      { id: 501, name: "Oshawott", types: ["water"], finalEvolution: { id: 503, name: "Samurott", types: ["water"] } }
    ],
    games: "Black • White",
    description: "A fresh start"
  },
  {
    id: "kalos",
    name: "Kalos",
    generation: 6,
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-500/10 to-rose-500/10",
    starters: [
      { id: 650, name: "Chespin", types: ["grass"], finalEvolution: { id: 652, name: "Chesnaught", types: ["grass", "fighting"] } },
      { id: 653, name: "Fennekin", types: ["fire"], finalEvolution: { id: 655, name: "Delphox", types: ["fire", "psychic"] } },
      { id: 656, name: "Froakie", types: ["water"], finalEvolution: { id: 658, name: "Greninja", types: ["water", "dark"] } }
    ],
    games: "X • Y",
    description: "Beauty and elegance"
  },
  {
    id: "alola",
    name: "Alola",
    generation: 7,
    gradient: "from-orange-400 to-pink-500",
    bgGradient: "from-orange-400/10 to-pink-500/10",
    starters: [
      { id: 722, name: "Rowlet", types: ["grass", "flying"], finalEvolution: { id: 724, name: "Decidueye", types: ["grass", "ghost"] } },
      { id: 725, name: "Litten", types: ["fire"], finalEvolution: { id: 727, name: "Incineroar", types: ["fire", "dark"] } },
      { id: 728, name: "Popplio", types: ["water"], finalEvolution: { id: 730, name: "Primarina", types: ["water", "fairy"] } }
    ],
    games: "Sun • Moon",
    description: "Island adventures"
  },
  {
    id: "galar",
    name: "Galar",
    generation: 8,
    gradient: "from-purple-500 to-fuchsia-500",
    bgGradient: "from-purple-500/10 to-fuchsia-500/10",
    starters: [
      { id: 810, name: "Grookey", types: ["grass"], finalEvolution: { id: 812, name: "Rillaboom", types: ["grass"] } },
      { id: 813, name: "Scorbunny", types: ["fire"], finalEvolution: { id: 815, name: "Cinderace", types: ["fire"] } },
      { id: 816, name: "Sobble", types: ["water"], finalEvolution: { id: 818, name: "Inteleon", types: ["water"] } }
    ],
    games: "Sword • Shield",
    description: "Wild adventures"
  },
  {
    id: "paldea",
    name: "Paldea",
    generation: 9,
    gradient: "from-violet-500 to-amber-500",
    bgGradient: "from-violet-500/10 to-amber-500/10",
    starters: [
      { id: 906, name: "Sprigatito", types: ["grass"], finalEvolution: { id: 908, name: "Meowscarada", types: ["grass", "dark"] } },
      { id: 909, name: "Fuecoco", types: ["fire"], finalEvolution: { id: 911, name: "Skeledirge", types: ["fire", "ghost"] } },
      { id: 912, name: "Quaxly", types: ["water"], finalEvolution: { id: 914, name: "Quaquaval", types: ["water", "fighting"] } }
    ],
    games: "Scarlet • Violet",
    description: "Open world freedom"
  }
];

// Type colors
const TYPE_COLORS: Record<string, string> = {
  grass: "#78C850",
  fire: "#F08030",
  water: "#6890F0",
  poison: "#A040A0",
  flying: "#A890F0",
  fighting: "#C03028",
  psychic: "#F85888",
  dark: "#705848",
  ghost: "#705898",
  steel: "#B8B8D0",
  ground: "#E0C068",
  fairy: "#EE99AC"
};

// Helper to get Pokemon image
const getPokemonImage = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

// Type Badge Component
const TypeBadge: React.FC<{ type: string; size?: 'sm' | 'md' }> = ({ type, size = 'sm' }) => (
  <span
    className={cn(
      "rounded-full font-medium capitalize",
      size === 'sm' ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
    )}
    style={{
      backgroundColor: TYPE_COLORS[type] || '#A8A878',
      color: 'white',
      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
    }}
  >
    {type}
  </span>
);

// Starter Card Component
const StarterCard: React.FC<{
  starter: StarterPokemon;
  regionGradient: string;
  onClick: () => void;
  showEvolution: boolean;
}> = ({ starter, regionGradient, onClick, showEvolution }) => {
  const displayPokemon = showEvolution ? starter.finalEvolution : starter;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex-shrink-0 w-[140px] sm:w-[160px]",
        "rounded-2xl overflow-hidden",
        "bg-white dark:bg-stone-800",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-200",
        "hover:scale-[1.02] active:scale-[0.98]",
        "touch-manipulation"
      )}
    >
      {/* Gradient header */}
      <div className={cn("h-2 bg-gradient-to-r", regionGradient)} />

      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-700 dark:to-stone-800 p-3">
        <Image
          src={getPokemonImage(displayPokemon.id)}
          alt={displayPokemon.name}
          fill
          className="object-contain p-2"
          sizes="160px"
        />

        {/* Evolution indicator */}
        {showEvolution && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-amber-500/90 text-[9px] font-bold text-white">
            FINAL
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 text-center">
        <p className="font-bold text-sm text-stone-900 dark:text-white truncate">
          {displayPokemon.name}
        </p>
        <div className="flex justify-center gap-1 mt-1.5">
          {displayPokemon.types.map(type => (
            <TypeBadge key={type} type={type} size="sm" />
          ))}
        </div>
        <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1.5">
          #{String(displayPokemon.id).padStart(4, '0')}
        </p>
      </div>
    </button>
  );
};

// Region Section Component
const RegionSection: React.FC<{
  region: Region;
  showEvolutions: boolean;
  onStarterClick: (starter: StarterPokemon, region: Region) => void;
}> = ({ region, showEvolutions, onStarterClick }) => {
  return (
    <section className="mb-8">
      {/* Region header */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-3 mb-1">
          <h2 className={cn(
            "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
            region.gradient
          )}>
            {region.name}
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-xs font-medium text-stone-600 dark:text-stone-400">
            Gen {region.generation}
          </span>
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {region.description} • {region.games}
        </p>
      </div>

      {/* Starters horizontal scroll */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 pb-2">
          {region.starters.map(starter => (
            <StarterCard
              key={starter.id}
              starter={starter}
              regionGradient={region.gradient}
              onClick={() => onStarterClick(starter, region)}
              showEvolution={showEvolutions}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Starter Detail Sheet Component
const StarterDetailSheet: React.FC<{
  starter: StarterPokemon | null;
  region: Region | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ starter, region, isOpen, onClose }) => {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !starter || !region) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className={cn(
        "fixed z-50",
        "inset-x-0 bottom-0",
        "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
        "sm:max-w-lg sm:w-full sm:mx-4",
        "animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95",
        "duration-200"
      )}>
        <div className={cn(
          "bg-white dark:bg-stone-900",
          "rounded-t-3xl sm:rounded-2xl",
          "shadow-2xl",
          "max-h-[85vh] sm:max-h-[90vh]",
          "overflow-hidden flex flex-col"
        )}>
          {/* Drag handle - mobile */}
          <div className="sm:hidden flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
          </div>

          {/* Close button - desktop */}
          <button
            onClick={onClose}
            className={cn(
              "hidden sm:flex",
              "absolute top-3 right-3 z-10",
              "w-8 h-8 rounded-full",
              "bg-stone-100 dark:bg-stone-800",
              "items-center justify-center",
              "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300",
              "transition-colors"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Header with gradient */}
            <div className={cn("bg-gradient-to-br p-6", region.bgGradient)}>
              <div className="flex items-start gap-4">
                {/* Pokemon image */}
                <div className="relative w-32 h-32 flex-shrink-0">
                  <Image
                    src={getPokemonImage(starter.id)}
                    alt={starter.name}
                    fill
                    className="object-contain drop-shadow-lg"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pt-2">
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                    #{String(starter.id).padStart(4, '0')}
                  </p>
                  <h2 className="text-2xl font-bold text-stone-900 dark:text-white">
                    {starter.name}
                  </h2>
                  <div className="flex gap-1.5 mt-2">
                    {starter.types.map(type => (
                      <TypeBadge key={type} type={type} size="md" />
                    ))}
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-300 mt-2">
                    {region.name} Region • Gen {region.generation}
                  </p>
                </div>
              </div>
            </div>

            {/* Evolution chain */}
            <div className="p-6 border-b border-stone-200 dark:border-stone-700">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-4 uppercase tracking-wide">
                Evolution Chain
              </h3>
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                {/* Base form */}
                <div
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => router.push(`/pokedex/${starter.id}`)}
                >
                  <div className={cn(
                    "relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl",
                    "bg-stone-100 dark:bg-stone-800",
                    "ring-2 ring-amber-500",
                    "group-hover:ring-4 transition-all"
                  )}>
                    <Image
                      src={getPokemonImage(starter.id)}
                      alt={starter.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <p className="text-xs font-medium text-stone-900 dark:text-white mt-2">
                    {starter.name}
                  </p>
                  <p className="text-[10px] text-stone-500">Base</p>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center text-stone-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Final evolution */}
                <div
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => router.push(`/pokedex/${starter.finalEvolution.id}`)}
                >
                  <div className={cn(
                    "relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl",
                    "bg-gradient-to-br",
                    region.bgGradient,
                    "ring-2 ring-stone-300 dark:ring-stone-600",
                    "group-hover:ring-4 group-hover:ring-amber-500 transition-all"
                  )}>
                    <Image
                      src={getPokemonImage(starter.finalEvolution.id)}
                      alt={starter.finalEvolution.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <p className="text-xs font-medium text-stone-900 dark:text-white mt-2">
                    {starter.finalEvolution.name}
                  </p>
                  <div className="flex gap-0.5 mt-0.5">
                    {starter.finalEvolution.types.map(type => (
                      <span
                        key={type}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: TYPE_COLORS[type] }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 space-y-3">
              <button
                onClick={() => router.push(`/pokedex/${starter.id}`)}
                className={cn(
                  "w-full h-12 rounded-xl",
                  "bg-stone-900 dark:bg-white",
                  "text-white dark:text-stone-900",
                  "font-semibold text-sm",
                  "hover:bg-stone-800 dark:hover:bg-stone-100",
                  "active:scale-[0.98]",
                  "transition-all touch-manipulation"
                )}
              >
                View in Pokédex
              </button>

              <button
                onClick={() => router.push(`/pokemon/starters/${region.id}`)}
                className={cn(
                  "w-full h-12 rounded-xl",
                  "bg-stone-100 dark:bg-stone-800",
                  "text-stone-900 dark:text-white",
                  "font-semibold text-sm",
                  "hover:bg-stone-200 dark:hover:bg-stone-700",
                  "active:scale-[0.98]",
                  "transition-all touch-manipulation"
                )}
              >
                Explore All {region.name} Starters
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Main Page Component
const StartersPage: NextPage = () => {
  const router = useRouter();
  const [showEvolutions, setShowEvolutions] = useState(false);
  const [selectedStarter, setSelectedStarter] = useState<StarterPokemon | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filterGen, setFilterGen] = useState<number | null>(null);

  // Filter regions by generation
  const filteredRegions = useMemo(() => {
    if (filterGen === null) return regions;
    return regions.filter(r => r.generation === filterGen);
  }, [filterGen]);

  // Handle starter click
  const handleStarterClick = useCallback((starter: StarterPokemon, region: Region) => {
    setSelectedStarter(starter);
    setSelectedRegion(region);
    setSheetOpen(true);
  }, []);

  // Close sheet
  const handleCloseSheet = useCallback(() => {
    setSheetOpen(false);
    setTimeout(() => {
      setSelectedStarter(null);
      setSelectedRegion(null);
    }, 200);
  }, []);

  return (
    <>
      <Head>
        <title>Starter Pokémon - All Regions | DexTrends</title>
        <meta name="description" content="Explore all starter Pokémon from every region. Compare Grass, Fire, and Water starters from Kanto to Paldea." />
      </Head>

      <div className="min-h-screen bg-white dark:bg-stone-900">
        {/* Hero Header */}
        <header className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-amber-500/20 to-blue-500/20 dark:from-emerald-500/10 dark:via-amber-500/10 dark:to-blue-500/10" />

          {/* Content */}
          <div className="relative px-4 pt-6 pb-8 sm:pt-10 sm:pb-12">
            {/* Back button */}
            <button
              onClick={() => router.push('/pokedex')}
              className={cn(
                "flex items-center gap-2 mb-6",
                "text-sm font-medium text-stone-600 dark:text-stone-400",
                "hover:text-stone-900 dark:hover:text-white",
                "transition-colors touch-manipulation"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Pokédex
            </button>

            {/* Title */}
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mb-2">
                Starter Pokémon
              </h1>
              <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base">
                Choose your partner from all 9 regions. Every journey begins with a choice between Grass, Fire, and Water.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-6 mt-6">
              <div>
                <p className="text-2xl font-bold text-stone-900 dark:text-white">27</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Starters</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900 dark:text-white">9</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Regions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900 dark:text-white">3</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Types</p>
              </div>
            </div>
          </div>
        </header>

        {/* Sticky controls bar */}
        <div className={cn(
          "sticky top-[48px] md:top-[64px] z-30",
          "bg-white/95 dark:bg-stone-900/95 backdrop-blur-md",
          "border-b border-stone-200/80 dark:border-stone-700/50"
        )}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Generation filter */}
              <div className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setFilterGen(null)}
                    className={cn(
                      "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium",
                      "transition-all touch-manipulation",
                      filterGen === null
                        ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                    )}
                  >
                    All
                  </button>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(gen => (
                    <button
                      key={gen}
                      onClick={() => setFilterGen(filterGen === gen ? null : gen)}
                      className={cn(
                        "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium",
                        "transition-all touch-manipulation",
                        filterGen === gen
                          ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                      )}
                    >
                      Gen {gen}
                    </button>
                  ))}
                </div>
              </div>

              {/* Evolution toggle */}
              <button
                onClick={() => setShowEvolutions(!showEvolutions)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg",
                  "text-xs font-medium transition-all touch-manipulation",
                  showEvolutions
                    ? "bg-amber-500 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                )}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="hidden sm:inline">Final Forms</span>
              </button>
            </div>
          </div>
        </div>

        {/* Regions list */}
        <main className="py-6">
          {filteredRegions.map(region => (
            <RegionSection
              key={region.id}
              region={region}
              showEvolutions={showEvolutions}
              onStarterClick={handleStarterClick}
            />
          ))}
        </main>

        {/* Footer fun facts */}
        <footer className="px-4 pb-8">
          <div className={cn(
            "rounded-2xl p-6",
            "bg-gradient-to-br from-stone-100 to-stone-50",
            "dark:from-stone-800 dark:to-stone-850"
          )}>
            <h3 className="font-bold text-stone-900 dark:text-white mb-4">
              Did You Know?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-stone-900/50">
                <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  87.5%
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Male ratio for all starters
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-stone-900/50">
                <p className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
                  3
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Fire/Fighting starters in a row
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-stone-900/50">
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  #001
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Bulbasaur is first in National Dex
                </p>
              </div>
            </div>
          </div>
        </footer>

        {/* Starter detail sheet */}
        <StarterDetailSheet
          starter={selectedStarter}
          region={selectedRegion}
          isOpen={sheetOpen}
          onClose={handleCloseSheet}
        />
      </div>
    </>
  );
};

// Full bleed layout
(StartersPage as NextPage & { fullBleed?: boolean }).fullBleed = true;

export default StartersPage;
