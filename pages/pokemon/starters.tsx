import React, { useState, useMemo } from "react";
import { NextPage } from 'next';
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { cn } from "@/utils/cn";

// Types
interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  total: number;
}

interface EvolutionStage {
  id: number;
  name: string;
  types: string[];
  level?: number;
  method?: string;
}

interface StarterPokemon {
  id: number;
  name: string;
  types: string[];
  stats: PokemonStats;
  evolutionChain: EvolutionStage[];
  description: string;
  category: string;
  height: string;
  weight: string;
}

interface Region {
  id: string;
  name: string;
  generation: number;
  gradient: string;
  bgGradient: string;
  textGradient: string;
  starters: StarterPokemon[];
  games: string;
  description: string;
  professor: string;
}

// Complete starter data with evolution chains and stats
const regions: Region[] = [
  {
    id: "kanto",
    name: "Kanto",
    generation: 1,
    gradient: "from-red-500 to-amber-500",
    bgGradient: "from-red-500/10 to-amber-500/10",
    textGradient: "from-red-600 to-amber-600",
    professor: "Professor Oak",
    games: "Red • Blue • Yellow",
    description: "Where the adventure began",
    starters: [
      {
        id: 1, name: "Bulbasaur", types: ["grass", "poison"],
        stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45, total: 318 },
        category: "Seed Pokémon", height: "0.7 m", weight: "6.9 kg",
        description: "A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.",
        evolutionChain: [
          { id: 1, name: "Bulbasaur", types: ["grass", "poison"] },
          { id: 2, name: "Ivysaur", types: ["grass", "poison"], level: 16 },
          { id: 3, name: "Venusaur", types: ["grass", "poison"], level: 32 }
        ]
      },
      {
        id: 4, name: "Charmander", types: ["fire"],
        stats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65, total: 309 },
        category: "Lizard Pokémon", height: "0.6 m", weight: "8.5 kg",
        description: "The flame on its tail indicates Charmander's life force. If it is healthy, the flame burns brightly.",
        evolutionChain: [
          { id: 4, name: "Charmander", types: ["fire"] },
          { id: 5, name: "Charmeleon", types: ["fire"], level: 16 },
          { id: 6, name: "Charizard", types: ["fire", "flying"], level: 36 }
        ]
      },
      {
        id: 7, name: "Squirtle", types: ["water"],
        stats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43, total: 314 },
        category: "Tiny Turtle Pokémon", height: "0.5 m", weight: "9.0 kg",
        description: "When it retracts its long neck into its shell, it squirts out water with vigorous force.",
        evolutionChain: [
          { id: 7, name: "Squirtle", types: ["water"] },
          { id: 8, name: "Wartortle", types: ["water"], level: 16 },
          { id: 9, name: "Blastoise", types: ["water"], level: 36 }
        ]
      }
    ]
  },
  {
    id: "johto",
    name: "Johto",
    generation: 2,
    gradient: "from-yellow-500 to-amber-600",
    bgGradient: "from-yellow-500/10 to-amber-600/10",
    textGradient: "from-yellow-600 to-amber-700",
    professor: "Professor Elm",
    games: "Gold • Silver • Crystal",
    description: "A land of tradition",
    starters: [
      {
        id: 152, name: "Chikorita", types: ["grass"],
        stats: { hp: 45, attack: 49, defense: 65, spAtk: 49, spDef: 65, speed: 45, total: 318 },
        category: "Leaf Pokémon", height: "0.9 m", weight: "6.4 kg",
        description: "It uses the leaf on its head to determine the temperature and humidity. It loves to sunbathe.",
        evolutionChain: [
          { id: 152, name: "Chikorita", types: ["grass"] },
          { id: 153, name: "Bayleef", types: ["grass"], level: 16 },
          { id: 154, name: "Meganium", types: ["grass"], level: 32 }
        ]
      },
      {
        id: 155, name: "Cyndaquil", types: ["fire"],
        stats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65, total: 309 },
        category: "Fire Mouse Pokémon", height: "0.5 m", weight: "7.9 kg",
        description: "It is timid, and always curls itself up in a ball. If attacked, it flares up its back for protection.",
        evolutionChain: [
          { id: 155, name: "Cyndaquil", types: ["fire"] },
          { id: 156, name: "Quilava", types: ["fire"], level: 14 },
          { id: 157, name: "Typhlosion", types: ["fire"], level: 36 }
        ]
      },
      {
        id: 158, name: "Totodile", types: ["water"],
        stats: { hp: 50, attack: 65, defense: 64, spAtk: 44, spDef: 48, speed: 43, total: 314 },
        category: "Big Jaw Pokémon", height: "0.6 m", weight: "9.5 kg",
        description: "Its well-developed jaws are powerful and capable of crushing anything. Even its Trainer must be careful.",
        evolutionChain: [
          { id: 158, name: "Totodile", types: ["water"] },
          { id: 159, name: "Croconaw", types: ["water"], level: 18 },
          { id: 160, name: "Feraligatr", types: ["water"], level: 30 }
        ]
      }
    ]
  },
  {
    id: "hoenn",
    name: "Hoenn",
    generation: 3,
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
    textGradient: "from-emerald-600 to-teal-600",
    professor: "Professor Birch",
    games: "Ruby • Sapphire • Emerald",
    description: "Tropical paradise",
    starters: [
      {
        id: 252, name: "Treecko", types: ["grass"],
        stats: { hp: 40, attack: 45, defense: 35, spAtk: 65, spDef: 55, speed: 70, total: 310 },
        category: "Wood Gecko Pokémon", height: "0.5 m", weight: "5.0 kg",
        description: "The soles of its feet are covered by countless tiny spikes, enabling it to walk on walls and ceilings.",
        evolutionChain: [
          { id: 252, name: "Treecko", types: ["grass"] },
          { id: 253, name: "Grovyle", types: ["grass"], level: 16 },
          { id: 254, name: "Sceptile", types: ["grass"], level: 36 }
        ]
      },
      {
        id: 255, name: "Torchic", types: ["fire"],
        stats: { hp: 45, attack: 60, defense: 40, spAtk: 70, spDef: 50, speed: 45, total: 310 },
        category: "Chick Pokémon", height: "0.4 m", weight: "2.5 kg",
        description: "If attacked, it strikes back by spitting balls of fire it forms in its stomach. It has trouble walking.",
        evolutionChain: [
          { id: 255, name: "Torchic", types: ["fire"] },
          { id: 256, name: "Combusken", types: ["fire", "fighting"], level: 16 },
          { id: 257, name: "Blaziken", types: ["fire", "fighting"], level: 36 }
        ]
      },
      {
        id: 258, name: "Mudkip", types: ["water"],
        stats: { hp: 50, attack: 70, defense: 50, spAtk: 50, spDef: 50, speed: 40, total: 310 },
        category: "Mud Fish Pokémon", height: "0.4 m", weight: "7.6 kg",
        description: "The fin on Mudkip's head acts as highly sensitive radar. Using this fin to sense movements of water and air, it can determine what is taking place around it without using its eyes.",
        evolutionChain: [
          { id: 258, name: "Mudkip", types: ["water"] },
          { id: 259, name: "Marshtomp", types: ["water", "ground"], level: 16 },
          { id: 260, name: "Swampert", types: ["water", "ground"], level: 36 }
        ]
      }
    ]
  },
  {
    id: "sinnoh",
    name: "Sinnoh",
    generation: 4,
    gradient: "from-indigo-500 to-purple-500",
    bgGradient: "from-indigo-500/10 to-purple-500/10",
    textGradient: "from-indigo-600 to-purple-600",
    professor: "Professor Rowan",
    games: "Diamond • Pearl • Platinum",
    description: "Land of myths",
    starters: [
      {
        id: 387, name: "Turtwig", types: ["grass"],
        stats: { hp: 55, attack: 68, defense: 64, spAtk: 45, spDef: 55, speed: 31, total: 318 },
        category: "Tiny Leaf Pokémon", height: "0.4 m", weight: "10.2 kg",
        description: "It undertakes photosynthesis with its body, making oxygen. The leaf on its head wilts if it is thirsty.",
        evolutionChain: [
          { id: 387, name: "Turtwig", types: ["grass"] },
          { id: 388, name: "Grotle", types: ["grass"], level: 18 },
          { id: 389, name: "Torterra", types: ["grass", "ground"], level: 32 }
        ]
      },
      {
        id: 390, name: "Chimchar", types: ["fire"],
        stats: { hp: 44, attack: 58, defense: 44, spAtk: 58, spDef: 44, speed: 61, total: 309 },
        category: "Chimp Pokémon", height: "0.5 m", weight: "6.2 kg",
        description: "It agilely scales sheer cliffs to live atop craggy mountains. Its fire is put out when it sleeps.",
        evolutionChain: [
          { id: 390, name: "Chimchar", types: ["fire"] },
          { id: 391, name: "Monferno", types: ["fire", "fighting"], level: 14 },
          { id: 392, name: "Infernape", types: ["fire", "fighting"], level: 36 }
        ]
      },
      {
        id: 393, name: "Piplup", types: ["water"],
        stats: { hp: 53, attack: 51, defense: 53, spAtk: 61, spDef: 56, speed: 40, total: 314 },
        category: "Penguin Pokémon", height: "0.4 m", weight: "5.2 kg",
        description: "It doesn't like to be taken care of. It's difficult to bond with since it won't listen to its Trainer.",
        evolutionChain: [
          { id: 393, name: "Piplup", types: ["water"] },
          { id: 394, name: "Prinplup", types: ["water"], level: 16 },
          { id: 395, name: "Empoleon", types: ["water", "steel"], level: 36 }
        ]
      }
    ]
  },
  {
    id: "unova",
    name: "Unova",
    generation: 5,
    gradient: "from-stone-600 to-stone-700",
    bgGradient: "from-stone-600/10 to-stone-700/10",
    textGradient: "from-stone-700 to-stone-800",
    professor: "Professor Juniper",
    games: "Black • White",
    description: "A fresh start",
    starters: [
      {
        id: 495, name: "Snivy", types: ["grass"],
        stats: { hp: 45, attack: 45, defense: 55, spAtk: 45, spDef: 55, speed: 63, total: 308 },
        category: "Grass Snake Pokémon", height: "0.6 m", weight: "8.1 kg",
        description: "They photosynthesize by bathing their tails in sunlight. When they are not feeling well, their tails droop.",
        evolutionChain: [
          { id: 495, name: "Snivy", types: ["grass"] },
          { id: 496, name: "Servine", types: ["grass"], level: 17 },
          { id: 497, name: "Serperior", types: ["grass"], level: 36 }
        ]
      },
      {
        id: 498, name: "Tepig", types: ["fire"],
        stats: { hp: 65, attack: 63, defense: 45, spAtk: 45, spDef: 45, speed: 45, total: 308 },
        category: "Fire Pig Pokémon", height: "0.5 m", weight: "9.9 kg",
        description: "It can deftly dodge its foe's attacks while shooting fireballs from its nose. It roasts berries before eating them.",
        evolutionChain: [
          { id: 498, name: "Tepig", types: ["fire"] },
          { id: 499, name: "Pignite", types: ["fire", "fighting"], level: 17 },
          { id: 500, name: "Emboar", types: ["fire", "fighting"], level: 36 }
        ]
      },
      {
        id: 501, name: "Oshawott", types: ["water"],
        stats: { hp: 55, attack: 55, defense: 45, spAtk: 63, spDef: 45, speed: 45, total: 308 },
        category: "Sea Otter Pokémon", height: "0.5 m", weight: "5.9 kg",
        description: "It fights using the scalchop on its stomach. In response to an attack, it retaliates immediately by slashing.",
        evolutionChain: [
          { id: 501, name: "Oshawott", types: ["water"] },
          { id: 502, name: "Dewott", types: ["water"], level: 17 },
          { id: 503, name: "Samurott", types: ["water"], level: 36 }
        ]
      }
    ]
  },
  {
    id: "kalos",
    name: "Kalos",
    generation: 6,
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-500/10 to-rose-500/10",
    textGradient: "from-pink-600 to-rose-600",
    professor: "Professor Sycamore",
    games: "X • Y",
    description: "Beauty and elegance",
    starters: [
      {
        id: 650, name: "Chespin", types: ["grass"],
        stats: { hp: 56, attack: 61, defense: 65, spAtk: 48, spDef: 45, speed: 38, total: 313 },
        category: "Spiny Nut Pokémon", height: "0.4 m", weight: "9.0 kg",
        description: "The quills on its head are usually soft. When it flexes them, the points become so hard and sharp that they can pierce rock.",
        evolutionChain: [
          { id: 650, name: "Chespin", types: ["grass"] },
          { id: 651, name: "Quilladin", types: ["grass"], level: 16 },
          { id: 652, name: "Chesnaught", types: ["grass", "fighting"], level: 36 }
        ]
      },
      {
        id: 653, name: "Fennekin", types: ["fire"],
        stats: { hp: 40, attack: 45, defense: 40, spAtk: 62, spDef: 60, speed: 60, total: 307 },
        category: "Fox Pokémon", height: "0.4 m", weight: "9.4 kg",
        description: "Eating a twig fills it with energy, and its roomy ears give vent to air hotter than 390 degrees Fahrenheit.",
        evolutionChain: [
          { id: 653, name: "Fennekin", types: ["fire"] },
          { id: 654, name: "Braixen", types: ["fire"], level: 16 },
          { id: 655, name: "Delphox", types: ["fire", "psychic"], level: 36 }
        ]
      },
      {
        id: 656, name: "Froakie", types: ["water"],
        stats: { hp: 41, attack: 56, defense: 40, spAtk: 62, spDef: 44, speed: 71, total: 314 },
        category: "Bubble Frog Pokémon", height: "0.3 m", weight: "7.0 kg",
        description: "It secretes flexible bubbles from its chest and back. The bubbles reduce the damage it would otherwise take when attacked.",
        evolutionChain: [
          { id: 656, name: "Froakie", types: ["water"] },
          { id: 657, name: "Frogadier", types: ["water"], level: 16 },
          { id: 658, name: "Greninja", types: ["water", "dark"], level: 36 }
        ]
      }
    ]
  },
  {
    id: "alola",
    name: "Alola",
    generation: 7,
    gradient: "from-orange-400 to-pink-500",
    bgGradient: "from-orange-400/10 to-pink-500/10",
    textGradient: "from-orange-500 to-pink-600",
    professor: "Professor Kukui",
    games: "Sun • Moon",
    description: "Island adventures",
    starters: [
      {
        id: 722, name: "Rowlet", types: ["grass", "flying"],
        stats: { hp: 68, attack: 55, defense: 55, spAtk: 50, spDef: 50, speed: 42, total: 320 },
        category: "Grass Quill Pokémon", height: "0.3 m", weight: "1.5 kg",
        description: "It sends its feathers, which are as sharp as blades, flying in attack. Its legs are strong, so its kicks are also formidable.",
        evolutionChain: [
          { id: 722, name: "Rowlet", types: ["grass", "flying"] },
          { id: 723, name: "Dartrix", types: ["grass", "flying"], level: 17 },
          { id: 724, name: "Decidueye", types: ["grass", "ghost"], level: 34 }
        ]
      },
      {
        id: 725, name: "Litten", types: ["fire"],
        stats: { hp: 45, attack: 65, defense: 40, spAtk: 60, spDef: 40, speed: 70, total: 320 },
        category: "Fire Cat Pokémon", height: "0.4 m", weight: "4.3 kg",
        description: "While grooming itself, it builds up fur inside its stomach. It sets the fur alight and spews fiery attacks.",
        evolutionChain: [
          { id: 725, name: "Litten", types: ["fire"] },
          { id: 726, name: "Torracat", types: ["fire"], level: 17 },
          { id: 727, name: "Incineroar", types: ["fire", "dark"], level: 34 }
        ]
      },
      {
        id: 728, name: "Popplio", types: ["water"],
        stats: { hp: 50, attack: 54, defense: 54, spAtk: 66, spDef: 56, speed: 40, total: 320 },
        category: "Sea Lion Pokémon", height: "0.4 m", weight: "7.5 kg",
        description: "This Pokémon snorts body fluids from its nose, blowing balloons to smash into its foes. It's famous for being a hard worker.",
        evolutionChain: [
          { id: 728, name: "Popplio", types: ["water"] },
          { id: 729, name: "Brionne", types: ["water"], level: 17 },
          { id: 730, name: "Primarina", types: ["water", "fairy"], level: 34 }
        ]
      }
    ]
  },
  {
    id: "galar",
    name: "Galar",
    generation: 8,
    gradient: "from-purple-500 to-fuchsia-500",
    bgGradient: "from-purple-500/10 to-fuchsia-500/10",
    textGradient: "from-purple-600 to-fuchsia-600",
    professor: "Professor Magnolia",
    games: "Sword • Shield",
    description: "Wild adventures",
    starters: [
      {
        id: 810, name: "Grookey", types: ["grass"],
        stats: { hp: 50, attack: 65, defense: 50, spAtk: 40, spDef: 40, speed: 65, total: 310 },
        category: "Chimp Pokémon", height: "0.3 m", weight: "5.0 kg",
        description: "When it uses its special stick to strike up a beat, the sound waves produced carry revitalizing energy to the plants and flowers in the area.",
        evolutionChain: [
          { id: 810, name: "Grookey", types: ["grass"] },
          { id: 811, name: "Thwackey", types: ["grass"], level: 16 },
          { id: 812, name: "Rillaboom", types: ["grass"], level: 35 }
        ]
      },
      {
        id: 813, name: "Scorbunny", types: ["fire"],
        stats: { hp: 50, attack: 71, defense: 40, spAtk: 40, spDef: 40, speed: 69, total: 310 },
        category: "Rabbit Pokémon", height: "0.3 m", weight: "4.5 kg",
        description: "It has special pads on the backs of its feet, and one on its nose. Once it's raring to fight, these pads radiate tremendous heat.",
        evolutionChain: [
          { id: 813, name: "Scorbunny", types: ["fire"] },
          { id: 814, name: "Raboot", types: ["fire"], level: 16 },
          { id: 815, name: "Cinderace", types: ["fire"], level: 35 }
        ]
      },
      {
        id: 816, name: "Sobble", types: ["water"],
        stats: { hp: 50, attack: 40, defense: 40, spAtk: 70, spDef: 40, speed: 70, total: 310 },
        category: "Water Lizard Pokémon", height: "0.3 m", weight: "4.0 kg",
        description: "When it gets wet, its skin changes color, and this Pokémon becomes invisible as if it were camouflaged.",
        evolutionChain: [
          { id: 816, name: "Sobble", types: ["water"] },
          { id: 817, name: "Drizzile", types: ["water"], level: 16 },
          { id: 818, name: "Inteleon", types: ["water"], level: 35 }
        ]
      }
    ]
  },
  {
    id: "paldea",
    name: "Paldea",
    generation: 9,
    gradient: "from-violet-500 to-amber-500",
    bgGradient: "from-violet-500/10 to-amber-500/10",
    textGradient: "from-violet-600 to-amber-600",
    professor: "Professor Sada & Turo",
    games: "Scarlet • Violet",
    description: "Open world freedom",
    starters: [
      {
        id: 906, name: "Sprigatito", types: ["grass"],
        stats: { hp: 40, attack: 61, defense: 54, spAtk: 45, spDef: 45, speed: 65, total: 310 },
        category: "Grass Cat Pokémon", height: "0.4 m", weight: "4.1 kg",
        description: "Its fluffy fur is similar in composition to plants. This Pokémon frequently washes its face to keep it from drying out.",
        evolutionChain: [
          { id: 906, name: "Sprigatito", types: ["grass"] },
          { id: 907, name: "Floragato", types: ["grass"], level: 16 },
          { id: 908, name: "Meowscarada", types: ["grass", "dark"], level: 36 }
        ]
      },
      {
        id: 909, name: "Fuecoco", types: ["fire"],
        stats: { hp: 67, attack: 45, defense: 59, spAtk: 63, spDef: 40, speed: 36, total: 310 },
        category: "Fire Croc Pokémon", height: "0.4 m", weight: "9.8 kg",
        description: "It lies on warm rocks and uses the heat absorbed by its square-shaped scales to create fire energy.",
        evolutionChain: [
          { id: 909, name: "Fuecoco", types: ["fire"] },
          { id: 910, name: "Crocalor", types: ["fire"], level: 16 },
          { id: 911, name: "Skeledirge", types: ["fire", "ghost"], level: 36 }
        ]
      },
      {
        id: 912, name: "Quaxly", types: ["water"],
        stats: { hp: 55, attack: 65, defense: 45, spAtk: 50, spDef: 45, speed: 50, total: 310 },
        category: "Duckling Pokémon", height: "0.5 m", weight: "6.1 kg",
        description: "This Pokémon migrated to Paldea from distant lands long ago. The gel secreted by its feathers repels water and grime.",
        evolutionChain: [
          { id: 912, name: "Quaxly", types: ["water"] },
          { id: 913, name: "Quaxwell", types: ["water"], level: 16 },
          { id: 914, name: "Quaquaval", types: ["water", "fighting"], level: 36 }
        ]
      }
    ]
  }
];

// Type colors
const TYPE_COLORS: Record<string, { bg: string; text: string; light: string }> = {
  grass: { bg: "#78C850", text: "#ffffff", light: "#E8F5E9" },
  fire: { bg: "#F08030", text: "#ffffff", light: "#FFF3E0" },
  water: { bg: "#6890F0", text: "#ffffff", light: "#E3F2FD" },
  poison: { bg: "#A040A0", text: "#ffffff", light: "#F3E5F5" },
  flying: { bg: "#A890F0", text: "#ffffff", light: "#EDE7F6" },
  fighting: { bg: "#C03028", text: "#ffffff", light: "#FFEBEE" },
  psychic: { bg: "#F85888", text: "#ffffff", light: "#FCE4EC" },
  dark: { bg: "#705848", text: "#ffffff", light: "#EFEBE9" },
  ghost: { bg: "#705898", text: "#ffffff", light: "#EDE7F6" },
  steel: { bg: "#B8B8D0", text: "#333333", light: "#ECEFF1" },
  ground: { bg: "#E0C068", text: "#333333", light: "#FFF8E1" },
  fairy: { bg: "#EE99AC", text: "#333333", light: "#FCE4EC" }
};

// Helper to get Pokemon image
const getPokemonImage = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

// Stat bar component
const StatBar: React.FC<{ label: string; value: number; max?: number; color: string }> = ({
  label,
  value,
  max = 150,
  color
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">
        {label}
      </span>
      <span className="w-8 text-xs font-bold text-stone-700 dark:text-stone-300 text-right">
        {value}
      </span>
      <div className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// Type Badge Component
const TypeBadge: React.FC<{ type: string; size?: 'sm' | 'md' | 'lg' }> = ({ type, size = 'sm' }) => {
  const colors = TYPE_COLORS[type] || { bg: '#A8A878', text: '#ffffff', light: '#F5F5F5' };
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm"
  };

  return (
    <span
      className={cn(
        "rounded-full font-semibold capitalize inline-flex items-center",
        sizeClasses[size]
      )}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
      }}
    >
      {type}
    </span>
  );
};

// Evolution Chain Display
const EvolutionChain: React.FC<{
  chain: EvolutionStage[];
  onSelect: (id: number) => void;
  selectedId?: number;
  gradient: string;
}> = ({ chain, onSelect, selectedId, gradient }) => {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto py-2">
      {chain.map((stage, index) => (
        <React.Fragment key={stage.id}>
          <button
            onClick={() => onSelect(stage.id)}
            className={cn(
              "flex flex-col items-center p-2 rounded-xl transition-all",
              "hover:bg-stone-100 dark:hover:bg-stone-800",
              selectedId === stage.id && "ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-900/20"
            )}
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <Image
                src={getPokemonImage(stage.id)}
                alt={stage.name}
                fill
                className="object-contain"
                sizes="80px"
              />
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-stone-700 dark:text-stone-300 mt-1">
              {stage.name}
            </p>
            {stage.level && (
              <span className="text-[9px] text-stone-500 dark:text-stone-400">
                Lv. {stage.level}
              </span>
            )}
          </button>
          {index < chain.length - 1 && (
            <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Compact Starter Card for grid - now links to dedicated page
const StarterGridCard: React.FC<{
  starter: StarterPokemon;
  region: Region;
}> = ({ starter, region }) => {
  const router = useRouter();
  const primaryType = starter.types[0];
  const typeColors = TYPE_COLORS[primaryType] || { bg: '#A8A878', text: '#fff', light: '#F5F5F5' };

  return (
    <button
      onClick={() => router.push(`/pokemon/starters/${region.id}`)}
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-white dark:bg-stone-800",
        "shadow-md hover:shadow-xl",
        "transition-all duration-200",
        "hover:-translate-y-1 active:scale-[0.98]",
        "touch-manipulation group"
      )}
    >
      {/* Type-colored header */}
      <div
        className="h-24 sm:h-28 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${typeColors.bg}40 0%, ${typeColors.light} 100%)` }}
      >
        {/* Gen badge */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 dark:bg-stone-900/90 text-[10px] font-bold text-stone-600 dark:text-stone-400">
          Gen {region.generation}
        </span>

        {/* Pokemon image */}
        <div className="absolute -bottom-4 right-0 w-24 h-24 sm:w-28 sm:h-28">
          <Image
            src={getPokemonImage(starter.id)}
            alt={starter.name}
            fill
            className="object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
            sizes="112px"
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 text-left">
        <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
          #{String(starter.id).padStart(4, '0')}
        </p>
        <h3 className="font-bold text-stone-900 dark:text-white text-sm">
          {starter.name}
        </h3>
        <div className="flex gap-1 mt-1.5">
          {starter.types.map(type => (
            <TypeBadge key={type} type={type} size="sm" />
          ))}
        </div>

        {/* Mini stats preview */}
        <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-500 dark:text-stone-400">
          <span>BST: {starter.stats.total}</span>
          <span>•</span>
          <span>{starter.evolutionChain.length} forms</span>
        </div>
      </div>
    </button>
  );
};

// Region Section - now links to dedicated region page
const RegionSection: React.FC<{
  region: Region;
}> = ({ region }) => {
  const router = useRouter();

  return (
    <section className="mb-10">
      {/* Region Header - Clickable */}
      <button
        onClick={() => router.push(`/pokemon/starters/${region.id}`)}
        className="w-full px-4 mb-4 text-left group"
      >
        <div className="flex items-center gap-3">
          <h2 className={cn(
            "text-xl sm:text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent group-hover:opacity-80 transition-opacity",
            region.gradient
          )}>
            {region.name}
          </h2>
          <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-xs font-semibold text-stone-600 dark:text-stone-400">
            Gen {region.generation}
          </span>
          <span className="ml-auto text-xs text-stone-400 dark:text-stone-500 group-hover:text-amber-500 transition-colors">
            View Details →
          </span>
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          {region.description} • {region.games}
        </p>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
          Given by {region.professor}
        </p>
      </button>

      {/* Starters Grid */}
      <div className="px-4">
        <div className="grid grid-cols-3 gap-3">
          {region.starters.map(starter => (
            <StarterGridCard
              key={starter.id}
              starter={starter}
              region={region}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Main Page Component - No modal, links to dedicated pages
const StartersPage: NextPage = () => {
  const router = useRouter();
  const [filterGen, setFilterGen] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  // Filter regions
  const filteredRegions = useMemo(() => {
    let result = regions;
    if (filterGen !== null) {
      result = result.filter(r => r.generation === filterGen);
    }
    if (filterType !== null) {
      result = result.map(r => ({
        ...r,
        starters: r.starters.filter(s => s.types.includes(filterType))
      })).filter(r => r.starters.length > 0);
    }
    return result;
  }, [filterGen, filterType]);

  // Stats summary
  const totalStarters = regions.reduce((acc, r) => acc + r.starters.length, 0);
  const totalEvolutions = regions.reduce((acc, r) =>
    acc + r.starters.reduce((a, s) => a + s.evolutionChain.length, 0), 0);

  return (
    <>
      <Head>
        <title>Starter Pokémon - All Regions | DexTrends</title>
        <meta name="description" content="Explore all starter Pokémon from every region with detailed stats, evolution chains, and more. From Bulbasaur to Quaxly." />
      </Head>

      <div className="min-h-screen bg-white dark:bg-stone-900">
        {/* Hero */}
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-amber-500/20 to-blue-500/20 dark:from-emerald-500/10 dark:via-amber-500/10 dark:to-blue-500/10" />

          <div className="relative px-4 pt-6 pb-8 sm:pt-8 sm:pb-10">
            {/* Back button */}
            <button
              onClick={() => router.push('/pokedex')}
              className="flex items-center gap-2 mb-4 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Pokédex
            </button>

            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mb-2">
              Starter Pokémon
            </h1>
            <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base max-w-xl">
              Every adventure begins with a choice. Explore all {totalStarters} starters and their {totalEvolutions} evolutions across 9 generations.
            </p>

            {/* Quick stats */}
            <div className="flex gap-6 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-900 dark:text-white">{totalStarters}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Starters</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-900 dark:text-white">{regions.length}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Regions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-900 dark:text-white">{totalEvolutions}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Total Forms</p>
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="sticky top-[48px] md:top-[64px] z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-700/50">
          <div className="px-4 py-3 space-y-3">
            {/* Generation filter */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilterGen(null)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  filterGen === null
                    ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                )}
              >
                All Gens
              </button>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(gen => (
                <button
                  key={gen}
                  onClick={() => setFilterGen(filterGen === gen ? null : gen)}
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    filterGen === gen
                      ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                  )}
                >
                  Gen {gen}
                </button>
              ))}
            </div>

            {/* Type filter */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilterType(null)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  filterType === null
                    ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                )}
              >
                All Types
              </button>
              {['grass', 'fire', 'water'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(filterType === type ? null : type)}
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all",
                    filterType === type
                      ? "text-white"
                      : "bg-stone-100 dark:bg-stone-800 hover:opacity-80"
                  )}
                  style={filterType === type ? {
                    backgroundColor: TYPE_COLORS[type]?.bg || '#A8A878'
                  } : undefined}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Regions List */}
        <main className="py-6">
          {filteredRegions.map(region => (
            <RegionSection
              key={region.id}
              region={region}
            />
          ))}

          {filteredRegions.length === 0 && (
            <div className="text-center py-12 px-4">
              <p className="text-stone-500 dark:text-stone-400">
                No starters found with current filters.
              </p>
              <button
                onClick={() => { setFilterGen(null); setFilterType(null); }}
                className="mt-3 text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </main>

        {/* Fun Facts Footer */}
        <footer className="px-4 pb-8">
          <div className="rounded-2xl p-6 bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-850">
            <h3 className="font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Did You Know?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-white/60 dark:bg-stone-900/50">
                <p className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  87.5%
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Male ratio for all starters
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/60 dark:bg-stone-900/50">
                <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
                  3 in a row
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Fire/Fighting finals (Gen 3-5)
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/60 dark:bg-stone-900/50">
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  Greninja
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Most popular starter (polls)
                </p>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

// Full bleed layout
(StartersPage as NextPage & { fullBleed?: boolean }).fullBleed = true;

export default StartersPage;
