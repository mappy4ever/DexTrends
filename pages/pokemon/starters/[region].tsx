import React, { useState } from "react";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/utils/cn";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import StyledBackButton from "@/components/ui/StyledBackButton";

// Type definitions
interface Evolution {
  id: number;
  name: string;
  level: number;
  types: string[];
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
  category: string;
  abilities: string[];
  evolutions: Evolution[];
  stats: Stats;
  description: string;
  strategy: string;
  funFacts: string[];
  signature: string;
  strengths: string[];
  weaknesses: string[];
}

interface RegionData {
  id: string;
  region: string;
  generation: number;
  games: string[];
  description: string;
  gradient: string;
  starters: Starter[];
}

// Type colors for styling
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

// Comprehensive starter data by region
const regionsData: RegionData[] = [
  {
    id: "kanto",
    region: "Kanto",
    generation: 1,
    games: ["Red", "Blue", "Yellow", "FireRed", "LeafGreen"],
    description: "The original trio that started it all. These Pokemon have become iconic symbols of the franchise.",
    gradient: "from-red-500 to-amber-500",
    starters: [
      {
        id: 1,
        name: "Bulbasaur",
        types: ["grass", "poison"],
        category: "Seed Pokemon",
        abilities: ["Overgrow", "Chlorophyll (Hidden)"],
        evolutions: [
          { id: 1, name: "Bulbasaur", level: 1, types: ["grass", "poison"] },
          { id: 2, name: "Ivysaur", level: 16, types: ["grass", "poison"] },
          { id: 3, name: "Venusaur", level: 32, types: ["grass", "poison"] }
        ],
        stats: { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 },
        description: "A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokemon.",
        strategy: "Bulbasaur is excellent for beginners due to type advantages against early gyms. Venusaur excels as a defensive tank with access to status moves like Sleep Powder and Leech Seed.",
        funFacts: [
          "First Pokemon in the National Dex",
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
        category: "Lizard Pokemon",
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
          "Most popular Kanto starter",
          "Has two Mega Evolutions",
          "Leon's ace Pokemon in Sword/Shield"
        ],
        signature: "Blast Burn",
        strengths: ["Grass", "Bug", "Ice", "Steel", "Fighting"],
        weaknesses: ["Water", "Rock", "Electric"]
      },
      {
        id: 7,
        name: "Squirtle",
        types: ["water"],
        category: "Tiny Turtle Pokemon",
        abilities: ["Torrent", "Rain Dish (Hidden)"],
        evolutions: [
          { id: 7, name: "Squirtle", level: 1, types: ["water"] },
          { id: 8, name: "Wartortle", level: 16, types: ["water"] },
          { id: 9, name: "Blastoise", level: 36, types: ["water"] }
        ],
        stats: { hp: 44, attack: 48, defense: 65, spAttack: 50, spDefense: 64, speed: 43 },
        description: "When it retracts its long neck into its shell, it squirts out water with vigorous force.",
        strategy: "Balanced choice with good defenses. Blastoise is a reliable tank that can use both physical and special moves effectively.",
        funFacts: [
          "The Squirtle Squad from the anime",
          "Gary's starter Pokemon",
          "Blastoise has cannons in its shell"
        ],
        signature: "Hydro Cannon",
        strengths: ["Fire", "Ground", "Rock"],
        weaknesses: ["Electric", "Grass"]
      }
    ]
  },
  {
    id: "johto",
    region: "Johto",
    generation: 2,
    games: ["Gold", "Silver", "Crystal", "HeartGold", "SoulSilver"],
    description: "The Johto starters brought new strategic depth with their unique final evolutions.",
    gradient: "from-yellow-500 to-amber-600",
    starters: [
      {
        id: 152,
        name: "Chikorita",
        types: ["grass"],
        category: "Leaf Pokemon",
        abilities: ["Overgrow", "Leaf Guard (Hidden)"],
        evolutions: [
          { id: 152, name: "Chikorita", level: 1, types: ["grass"] },
          { id: 153, name: "Bayleef", level: 16, types: ["grass"] },
          { id: 154, name: "Meganium", level: 32, types: ["grass"] }
        ],
        stats: { hp: 45, attack: 49, defense: 65, spAttack: 49, spDefense: 65, speed: 45 },
        description: "A sweet aroma gently wafts from the leaf on its head. It is docile and loves to soak up sunrays.",
        strategy: "Defensive support Pokemon. Meganium excels at healing and stalling with moves like Aromatherapy and Light Screen.",
        funFacts: [
          "Ash's rival chose Chikorita",
          "Known for its healing abilities",
          "Has the highest defenses of Gen 2 starters"
        ],
        signature: "Frenzy Plant",
        strengths: ["Water", "Electric", "Grass", "Ground"],
        weaknesses: ["Fire", "Flying", "Ice", "Bug", "Poison"]
      },
      {
        id: 155,
        name: "Cyndaquil",
        types: ["fire"],
        category: "Fire Mouse Pokemon",
        abilities: ["Blaze", "Flash Fire (Hidden)"],
        evolutions: [
          { id: 155, name: "Cyndaquil", level: 1, types: ["fire"] },
          { id: 156, name: "Quilava", level: 14, types: ["fire"] },
          { id: 157, name: "Typhlosion", level: 36, types: ["fire"] }
        ],
        stats: { hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 },
        description: "It has a timid nature. If it is startled, the flames on its back burn more vigorously.",
        strategy: "Fast special attacker. Typhlosion has great Speed and Special Attack for sweeping teams.",
        funFacts: [
          "Ash's Johto starter",
          "Has a Hisuian form (Fire/Ghost)",
          "Most popular Johto starter"
        ],
        signature: "Blast Burn",
        strengths: ["Grass", "Bug", "Ice", "Steel"],
        weaknesses: ["Water", "Ground", "Rock"]
      },
      {
        id: 158,
        name: "Totodile",
        types: ["water"],
        category: "Big Jaw Pokemon",
        abilities: ["Torrent", "Sheer Force (Hidden)"],
        evolutions: [
          { id: 158, name: "Totodile", level: 1, types: ["water"] },
          { id: 159, name: "Croconaw", level: 18, types: ["water"] },
          { id: 160, name: "Feraligatr", level: 30, types: ["water"] }
        ],
        stats: { hp: 50, attack: 65, defense: 64, spAttack: 44, spDefense: 48, speed: 43 },
        description: "Its well-developed jaws are powerful and capable of crushing anything. Even its Trainer must be careful.",
        strategy: "Physical attacker with great Attack. Feraligatr can use Dragon Dance to sweep teams.",
        funFacts: [
          "Known for being playful but bitey",
          "Has powerful jaws even as a baby",
          "Can learn Dragon Dance"
        ],
        signature: "Hydro Cannon",
        strengths: ["Fire", "Ground", "Rock"],
        weaknesses: ["Electric", "Grass"]
      }
    ]
  },
  {
    id: "hoenn",
    region: "Hoenn",
    generation: 3,
    games: ["Ruby", "Sapphire", "Emerald", "Omega Ruby", "Alpha Sapphire"],
    description: "Hoenn starters are known for their competitive viability and unique secondary typings.",
    gradient: "from-emerald-500 to-teal-500",
    starters: [
      {
        id: 252,
        name: "Treecko",
        types: ["grass"],
        category: "Wood Gecko Pokemon",
        abilities: ["Overgrow", "Unburden (Hidden)"],
        evolutions: [
          { id: 252, name: "Treecko", level: 1, types: ["grass"] },
          { id: 253, name: "Grovyle", level: 16, types: ["grass"] },
          { id: 254, name: "Sceptile", level: 36, types: ["grass"] }
        ],
        stats: { hp: 40, attack: 45, defense: 35, spAttack: 65, spDefense: 55, speed: 70 },
        description: "The soles of its feet are covered by countless tiny spikes, enabling it to walk on walls and ceilings.",
        strategy: "Fast special attacker. Mega Sceptile gains Dragon type and Lightning Rod ability.",
        funFacts: [
          "Ash's most rebellious Pokemon",
          "Mega Sceptile is Grass/Dragon",
          "Can walk on any surface"
        ],
        signature: "Frenzy Plant",
        strengths: ["Water", "Electric", "Grass", "Ground"],
        weaknesses: ["Fire", "Flying", "Ice", "Bug", "Poison"]
      },
      {
        id: 255,
        name: "Torchic",
        types: ["fire"],
        category: "Chick Pokemon",
        abilities: ["Blaze", "Speed Boost (Hidden)"],
        evolutions: [
          { id: 255, name: "Torchic", level: 1, types: ["fire"] },
          { id: 256, name: "Combusken", level: 16, types: ["fire", "fighting"] },
          { id: 257, name: "Blaziken", level: 36, types: ["fire", "fighting"] }
        ],
        stats: { hp: 45, attack: 60, defense: 40, spAttack: 70, spDefense: 50, speed: 45 },
        description: "A fire burns inside, so it feels very warm to hug. It launches fireballs of 1,800 degrees Fahrenheit.",
        strategy: "Speed Boost Blaziken is banned to Ubers! One of the most powerful starters competitively.",
        funFacts: [
          "First Fire/Fighting starter",
          "Speed Boost is incredibly powerful",
          "May's signature Pokemon"
        ],
        signature: "Blast Burn",
        strengths: ["Grass", "Bug", "Ice", "Steel", "Dark"],
        weaknesses: ["Water", "Ground", "Flying", "Psychic"]
      },
      {
        id: 258,
        name: "Mudkip",
        types: ["water"],
        category: "Mud Fish Pokemon",
        abilities: ["Torrent", "Damp (Hidden)"],
        evolutions: [
          { id: 258, name: "Mudkip", level: 1, types: ["water"] },
          { id: 259, name: "Marshtomp", level: 16, types: ["water", "ground"] },
          { id: 260, name: "Swampert", level: 36, types: ["water", "ground"] }
        ],
        stats: { hp: 50, attack: 70, defense: 50, spAttack: 50, spDefense: 50, speed: 40 },
        description: "The fin on Mudkip's head acts as highly sensitive radar, sensing movements of water and air.",
        strategy: "Only weak to Grass! Mega Swampert with Swift Swim in rain is devastating.",
        funFacts: [
          "Famous 'So I herd u liek Mudkipz' meme",
          "Only one weakness (4x to Grass)",
          "Mega Swampert is incredibly bulky"
        ],
        signature: "Hydro Cannon",
        strengths: ["Fire", "Electric", "Rock", "Poison", "Steel"],
        weaknesses: ["Grass (4x)"]
      }
    ]
  },
  {
    id: "sinnoh",
    region: "Sinnoh",
    generation: 4,
    games: ["Diamond", "Pearl", "Platinum", "Brilliant Diamond", "Shining Pearl"],
    description: "Sinnoh starters are known for their unique secondary typings in their final forms.",
    gradient: "from-indigo-500 to-purple-500",
    starters: [
      {
        id: 387,
        name: "Turtwig",
        types: ["grass"],
        category: "Tiny Leaf Pokemon",
        abilities: ["Overgrow", "Shell Armor (Hidden)"],
        evolutions: [
          { id: 387, name: "Turtwig", level: 1, types: ["grass"] },
          { id: 388, name: "Grotle", level: 18, types: ["grass"] },
          { id: 389, name: "Torterra", level: 32, types: ["grass", "ground"] }
        ],
        stats: { hp: 55, attack: 68, defense: 64, spAttack: 45, spDefense: 55, speed: 31 },
        description: "It undertakes photosynthesis with its body, making oxygen. The leaf on its head wilts if it is thirsty.",
        strategy: "Slow but powerful. Torterra has unique Grass/Ground typing and great physical stats.",
        funFacts: [
          "Has a tree growing on its shell",
          "Ash's Torterra in the anime",
          "Resembles a World Turtle myth"
        ],
        signature: "Frenzy Plant",
        strengths: ["Water", "Electric", "Rock", "Ground"],
        weaknesses: ["Fire", "Flying", "Bug", "Ice (4x)"]
      },
      {
        id: 390,
        name: "Chimchar",
        types: ["fire"],
        category: "Chimp Pokemon",
        abilities: ["Blaze", "Iron Fist (Hidden)"],
        evolutions: [
          { id: 390, name: "Chimchar", level: 1, types: ["fire"] },
          { id: 391, name: "Monferno", level: 14, types: ["fire", "fighting"] },
          { id: 392, name: "Infernape", level: 36, types: ["fire", "fighting"] }
        ],
        stats: { hp: 44, attack: 58, defense: 44, spAttack: 58, spDefense: 44, speed: 61 },
        description: "Its fiery rear end is fueled by gas made in its belly. Even rain can't extinguish the fire.",
        strategy: "Fast mixed attacker. Infernape is versatile with both physical and special movesets.",
        funFacts: [
          "Paul's released Pokemon, Ash caught it",
          "Based on Sun Wukong",
          "Can use both physical and special moves"
        ],
        signature: "Blast Burn",
        strengths: ["Grass", "Bug", "Ice", "Steel", "Dark"],
        weaknesses: ["Water", "Ground", "Flying", "Psychic"]
      },
      {
        id: 393,
        name: "Piplup",
        types: ["water"],
        category: "Penguin Pokemon",
        abilities: ["Torrent", "Defiant (Hidden)"],
        evolutions: [
          { id: 393, name: "Piplup", level: 1, types: ["water"] },
          { id: 394, name: "Prinplup", level: 16, types: ["water"] },
          { id: 395, name: "Empoleon", level: 36, types: ["water", "steel"] }
        ],
        stats: { hp: 53, attack: 51, defense: 53, spAttack: 61, spDefense: 56, speed: 40 },
        description: "Because it is very proud, it hates accepting food from people. Its thick down guards it from cold.",
        strategy: "Unique Water/Steel typing gives 11 resistances! Great defensive pivot.",
        funFacts: [
          "Dawn's signature Pokemon",
          "Only Water/Steel starter",
          "Based on emperor penguin"
        ],
        signature: "Hydro Cannon",
        strengths: ["Fire", "Ice", "Rock", "Steel", "Fairy"],
        weaknesses: ["Electric", "Ground", "Fighting"]
      }
    ]
  },
  {
    id: "unova",
    region: "Unova",
    generation: 5,
    games: ["Black", "White", "Black 2", "White 2"],
    description: "Unova starters represent a fresh start with no previous Pokemon until postgame.",
    gradient: "from-stone-600 to-stone-700",
    starters: [
      {
        id: 495,
        name: "Snivy",
        types: ["grass"],
        category: "Grass Snake Pokemon",
        abilities: ["Overgrow", "Contrary (Hidden)"],
        evolutions: [
          { id: 495, name: "Snivy", level: 1, types: ["grass"] },
          { id: 496, name: "Servine", level: 17, types: ["grass"] },
          { id: 497, name: "Serperior", level: 36, types: ["grass"] }
        ],
        stats: { hp: 45, attack: 45, defense: 55, spAttack: 45, spDefense: 55, speed: 63 },
        description: "They photosynthesize by bathing their tails in sunlight. When not feeling well, their tails droop.",
        strategy: "Contrary + Leaf Storm = +2 Sp.Atk each use! One of the best hidden abilities.",
        funFacts: [
          "Has no legs despite snake design",
          "Trip's starter in the anime",
          "Contrary makes it incredibly strong"
        ],
        signature: "Frenzy Plant",
        strengths: ["Water", "Electric", "Grass", "Ground"],
        weaknesses: ["Fire", "Flying", "Ice", "Bug", "Poison"]
      },
      {
        id: 498,
        name: "Tepig",
        types: ["fire"],
        category: "Fire Pig Pokemon",
        abilities: ["Blaze", "Thick Fat (Hidden)"],
        evolutions: [
          { id: 498, name: "Tepig", level: 1, types: ["fire"] },
          { id: 499, name: "Pignite", level: 17, types: ["fire", "fighting"] },
          { id: 500, name: "Emboar", level: 36, types: ["fire", "fighting"] }
        ],
        stats: { hp: 65, attack: 63, defense: 45, spAttack: 45, spDefense: 45, speed: 45 },
        description: "It can deftly dodge its foe's attacks while shooting fireballs from its nose.",
        strategy: "Third Fire/Fighting in a row. Emboar is bulky but slow, best as wallbreaker.",
        funFacts: [
          "Third Fire/Fighting starter",
          "Based on Chinese zodiac pig",
          "Bianca's starter in the anime"
        ],
        signature: "Blast Burn",
        strengths: ["Grass", "Bug", "Ice", "Steel", "Dark"],
        weaknesses: ["Water", "Ground", "Flying", "Psychic"]
      },
      {
        id: 501,
        name: "Oshawott",
        types: ["water"],
        category: "Sea Otter Pokemon",
        abilities: ["Torrent", "Shell Armor (Hidden)"],
        evolutions: [
          { id: 501, name: "Oshawott", level: 1, types: ["water"] },
          { id: 502, name: "Dewott", level: 17, types: ["water"] },
          { id: 503, name: "Samurott", level: 36, types: ["water"] }
        ],
        stats: { hp: 55, attack: 55, defense: 45, spAttack: 63, spDefense: 45, speed: 45 },
        description: "It fights using the scalchop on its stomach. In response to an attack, it retaliates immediately by slashing.",
        strategy: "Mixed attacker. Hisuian Samurott gains Dark type and is a fast physical attacker.",
        funFacts: [
          "Has a Hisuian form (Water/Dark)",
          "Based on samurai and sea otter",
          "Ash's Unova starter"
        ],
        signature: "Hydro Cannon",
        strengths: ["Fire", "Ground", "Rock"],
        weaknesses: ["Electric", "Grass"]
      }
    ]
  },
  {
    id: "kalos",
    region: "Kalos",
    generation: 6,
    games: ["X", "Y"],
    description: "Kalos starters introduced Mega Evolution potential and modern 3D graphics.",
    gradient: "from-pink-500 to-rose-500",
    starters: [
      {
        id: 650,
        name: "Chespin",
        types: ["grass"],
        category: "Spiny Nut Pokemon",
        abilities: ["Overgrow", "Bulletproof (Hidden)"],
        evolutions: [
          { id: 650, name: "Chespin", level: 1, types: ["grass"] },
          { id: 651, name: "Quilladin", level: 16, types: ["grass"] },
          { id: 652, name: "Chesnaught", level: 36, types: ["grass", "fighting"] }
        ],
        stats: { hp: 56, attack: 61, defense: 65, spAttack: 48, spDefense: 45, speed: 38 },
        description: "The quills on its head are usually soft. When it flexes them, the points become so hard and sharp.",
        strategy: "Defensive fighter. Bulletproof blocks many special moves like Shadow Ball.",
        funFacts: [
          "First Grass/Fighting starter",
          "Clemont's starter in the anime",
          "Bulletproof is excellent defensively"
        ],
        signature: "Frenzy Plant",
        strengths: ["Water", "Electric", "Grass", "Dark", "Rock"],
        weaknesses: ["Fire", "Flying", "Ice", "Poison", "Psychic", "Fairy"]
      },
      {
        id: 653,
        name: "Fennekin",
        types: ["fire"],
        category: "Fox Pokemon",
        abilities: ["Blaze", "Magician (Hidden)"],
        evolutions: [
          { id: 653, name: "Fennekin", level: 1, types: ["fire"] },
          { id: 654, name: "Braixen", level: 16, types: ["fire"] },
          { id: 655, name: "Delphox", level: 36, types: ["fire", "psychic"] }
        ],
        stats: { hp: 40, attack: 45, defense: 40, spAttack: 62, spDefense: 60, speed: 60 },
        description: "Eating a twig fills it with energy, and its roomy ears give vent to air hotter than 390 degrees F.",
        strategy: "Special attacker with Psychic coverage. Delphox is a witch-themed mage Pokemon.",
        funFacts: [
          "First Fire/Psychic starter",
          "Serena's starter in the anime",
          "Based on a witch/mage fox"
        ],
        signature: "Blast Burn",
        strengths: ["Grass", "Bug", "Ice", "Steel", "Fighting"],
        weaknesses: ["Water", "Ground", "Rock", "Ghost", "Dark"]
      },
      {
        id: 656,
        name: "Froakie",
        types: ["water"],
        category: "Bubble Frog Pokemon",
        abilities: ["Torrent", "Protean (Hidden)"],
        evolutions: [
          { id: 656, name: "Froakie", level: 1, types: ["water"] },
          { id: 657, name: "Frogadier", level: 16, types: ["water"] },
          { id: 658, name: "Greninja", level: 36, types: ["water", "dark"] }
        ],
        stats: { hp: 41, attack: 56, defense: 40, spAttack: 62, spDefense: 44, speed: 71 },
        description: "It secretes flexible bubbles from its chest and back that reduce damage when attacked.",
        strategy: "Protean gives STAB on every move! Ash-Greninja has even higher stats.",
        funFacts: [
          "Most popular starter ever (polls)",
          "Ash-Greninja is a unique form",
          "Protean is one of the best abilities"
        ],
        signature: "Water Shuriken",
        strengths: ["Fire", "Ground", "Rock", "Psychic", "Ghost"],
        weaknesses: ["Electric", "Grass", "Fighting", "Bug", "Fairy"]
      }
    ]
  },
  {
    id: "alola",
    region: "Alola",
    generation: 7,
    games: ["Sun", "Moon", "Ultra Sun", "Ultra Moon"],
    description: "Alola starters embrace the tropical island theme with unique final evolutions.",
    gradient: "from-orange-400 to-pink-500",
    starters: [
      {
        id: 722,
        name: "Rowlet",
        types: ["grass", "flying"],
        category: "Grass Quill Pokemon",
        abilities: ["Overgrow", "Long Reach (Hidden)"],
        evolutions: [
          { id: 722, name: "Rowlet", level: 1, types: ["grass", "flying"] },
          { id: 723, name: "Dartrix", level: 17, types: ["grass", "flying"] },
          { id: 724, name: "Decidueye", level: 34, types: ["grass", "ghost"] }
        ],
        stats: { hp: 68, attack: 55, defense: 55, spAttack: 50, spDefense: 50, speed: 42 },
        description: "It sends its feathers, which are as sharp as blades, flying in attack. Its kicks are also formidable.",
        strategy: "Archer Pokemon. Hisuian Decidueye is Grass/Fighting with high Attack.",
        funFacts: [
          "Ash's Alola starter",
          "Has a Hisuian form",
          "Based on an archer owl"
        ],
        signature: "Spirit Shackle",
        strengths: ["Water", "Electric", "Grass", "Fighting", "Ground"],
        weaknesses: ["Fire", "Flying", "Ice", "Ghost", "Dark"]
      },
      {
        id: 725,
        name: "Litten",
        types: ["fire"],
        category: "Fire Cat Pokemon",
        abilities: ["Blaze", "Intimidate (Hidden)"],
        evolutions: [
          { id: 725, name: "Litten", level: 1, types: ["fire"] },
          { id: 726, name: "Torracat", level: 17, types: ["fire"] },
          { id: 727, name: "Incineroar", level: 34, types: ["fire", "dark"] }
        ],
        stats: { hp: 45, attack: 65, defense: 40, spAttack: 60, spDefense: 40, speed: 70 },
        description: "While grooming itself, it builds up fur inside its stomach. It sets the fur alight and spews fiery attacks.",
        strategy: "Intimidate + Fake Out makes Incineroar a top VGC choice. Wrestler theme.",
        funFacts: [
          "Top tier in VGC doubles",
          "Based on a heel wrestler",
          "Has Intimidate as hidden ability"
        ],
        signature: "Darkest Lariat",
        strengths: ["Grass", "Ice", "Ghost", "Steel", "Psychic"],
        weaknesses: ["Water", "Ground", "Rock", "Fighting"]
      },
      {
        id: 728,
        name: "Popplio",
        types: ["water"],
        category: "Sea Lion Pokemon",
        abilities: ["Torrent", "Liquid Voice (Hidden)"],
        evolutions: [
          { id: 728, name: "Popplio", level: 1, types: ["water"] },
          { id: 729, name: "Brionne", level: 17, types: ["water"] },
          { id: 730, name: "Primarina", level: 34, types: ["water", "fairy"] }
        ],
        stats: { hp: 50, attack: 54, defense: 54, spAttack: 66, spDefense: 56, speed: 40 },
        description: "This Pokemon snorts body fluids from its nose, blowing balloons to smash into foes.",
        strategy: "Special attacker with Fairy typing. Sparkling Aria heals burns.",
        funFacts: [
          "Lana's signature Pokemon",
          "Based on a sea lion performer",
          "Water/Fairy is a great typing"
        ],
        signature: "Sparkling Aria",
        strengths: ["Fire", "Water", "Ice", "Fighting", "Dark", "Dragon"],
        weaknesses: ["Electric", "Grass", "Poison"]
      }
    ]
  },
  {
    id: "galar",
    region: "Galar",
    generation: 8,
    games: ["Sword", "Shield"],
    description: "Galar starters can Gigantamax, gaining unique G-Max moves and forms.",
    gradient: "from-purple-500 to-fuchsia-500",
    starters: [
      {
        id: 810,
        name: "Grookey",
        types: ["grass"],
        category: "Chimp Pokemon",
        abilities: ["Overgrow", "Grassy Surge (Hidden)"],
        evolutions: [
          { id: 810, name: "Grookey", level: 1, types: ["grass"] },
          { id: 811, name: "Thwackey", level: 16, types: ["grass"] },
          { id: 812, name: "Rillaboom", level: 35, types: ["grass"] }
        ],
        stats: { hp: 50, attack: 65, defense: 50, spAttack: 40, spDefense: 40, speed: 65 },
        description: "When it uses its special stick to strike up a beat, sound waves revitalize nearby plants.",
        strategy: "Grassy Surge sets Grassy Terrain automatically! Great for Grassy Glide priority.",
        funFacts: [
          "Drummer themed Pokemon",
          "Grassy Surge is very competitive",
          "Has Gigantamax form"
        ],
        signature: "Drum Beating",
        strengths: ["Water", "Electric", "Grass", "Ground"],
        weaknesses: ["Fire", "Flying", "Ice", "Bug", "Poison"]
      },
      {
        id: 813,
        name: "Scorbunny",
        types: ["fire"],
        category: "Rabbit Pokemon",
        abilities: ["Blaze", "Libero (Hidden)"],
        evolutions: [
          { id: 813, name: "Scorbunny", level: 1, types: ["fire"] },
          { id: 814, name: "Raboot", level: 16, types: ["fire"] },
          { id: 815, name: "Cinderace", level: 35, types: ["fire"] }
        ],
        stats: { hp: 50, attack: 71, defense: 40, spAttack: 40, spDefense: 40, speed: 69 },
        description: "It has special pads on its feet and nose that radiate tremendous heat when raring to fight.",
        strategy: "Libero is Protean for Fire! Gives STAB on every move. Soccer/football theme.",
        funFacts: [
          "Soccer player themed",
          "Libero mirrors Protean",
          "Goh's partner in anime"
        ],
        signature: "Pyro Ball",
        strengths: ["Grass", "Bug", "Ice", "Steel"],
        weaknesses: ["Water", "Ground", "Rock"]
      },
      {
        id: 816,
        name: "Sobble",
        types: ["water"],
        category: "Water Lizard Pokemon",
        abilities: ["Torrent", "Sniper (Hidden)"],
        evolutions: [
          { id: 816, name: "Sobble", level: 1, types: ["water"] },
          { id: 817, name: "Drizzile", level: 16, types: ["water"] },
          { id: 818, name: "Inteleon", level: 35, types: ["water"] }
        ],
        stats: { hp: 50, attack: 40, defense: 40, spAttack: 70, spDefense: 40, speed: 70 },
        description: "When it gets wet, its skin changes color, making it invisible like camouflage.",
        strategy: "Sniper + Focus Energy + Scope Lens = guaranteed crits! Special attacker spy.",
        funFacts: [
          "Secret agent/spy themed",
          "Has a Gigantamax form",
          "Sniper build is powerful"
        ],
        signature: "Snipe Shot",
        strengths: ["Fire", "Ground", "Rock"],
        weaknesses: ["Electric", "Grass"]
      }
    ]
  },
  {
    id: "paldea",
    region: "Paldea",
    generation: 9,
    games: ["Scarlet", "Violet"],
    description: "Paldea starters have unique themes and secondary typings in their final forms.",
    gradient: "from-violet-500 to-amber-500",
    starters: [
      {
        id: 906,
        name: "Sprigatito",
        types: ["grass"],
        category: "Grass Cat Pokemon",
        abilities: ["Overgrow", "Protean (Hidden)"],
        evolutions: [
          { id: 906, name: "Sprigatito", level: 1, types: ["grass"] },
          { id: 907, name: "Floragato", level: 16, types: ["grass"] },
          { id: 908, name: "Meowscarada", level: 36, types: ["grass", "dark"] }
        ],
        stats: { hp: 40, attack: 61, defense: 54, spAttack: 45, spDefense: 45, speed: 65 },
        description: "Its fluffy fur is similar in composition to plants. It washes its face to keep it from drying out.",
        strategy: "Magician theme. Meowscarada is fast with Flower Trick that always crits!",
        funFacts: [
          "Magician/trickster theme",
          "Flower Trick always crits",
          "Based on Iberian lynx"
        ],
        signature: "Flower Trick",
        strengths: ["Water", "Ground", "Rock", "Ghost", "Psychic"],
        weaknesses: ["Fire", "Flying", "Ice", "Fighting", "Poison", "Bug", "Fairy"]
      },
      {
        id: 909,
        name: "Fuecoco",
        types: ["fire"],
        category: "Fire Croc Pokemon",
        abilities: ["Blaze", "Unaware (Hidden)"],
        evolutions: [
          { id: 909, name: "Fuecoco", level: 1, types: ["fire"] },
          { id: 910, name: "Crocalor", level: 16, types: ["fire"] },
          { id: 911, name: "Skeledirge", level: 36, types: ["fire", "ghost"] }
        ],
        stats: { hp: 67, attack: 45, defense: 59, spAttack: 63, spDefense: 40, speed: 36 },
        description: "It lies on warm rocks and uses the heat absorbed by its square-shaped scales to create fire energy.",
        strategy: "Singer theme. Skeledirge is bulky special attacker. Torch Song raises Sp.Atk.",
        funFacts: [
          "Based on Day of the Dead",
          "Has a bird companion that helps sing",
          "Torch Song boosts Sp.Atk"
        ],
        signature: "Torch Song",
        strengths: ["Grass", "Ice", "Bug", "Steel", "Psychic", "Normal", "Fighting"],
        weaknesses: ["Water", "Ground", "Rock", "Ghost", "Dark"]
      },
      {
        id: 912,
        name: "Quaxly",
        types: ["water"],
        category: "Duckling Pokemon",
        abilities: ["Torrent", "Moxie (Hidden)"],
        evolutions: [
          { id: 912, name: "Quaxly", level: 1, types: ["water"] },
          { id: 913, name: "Quaxwell", level: 16, types: ["water"] },
          { id: 914, name: "Quaquaval", level: 36, types: ["water", "fighting"] }
        ],
        stats: { hp: 55, attack: 65, defense: 45, spAttack: 50, spDefense: 45, speed: 50 },
        description: "Its strong legs let it easily swim in fast-flowing rivers. It likes to keep things tidy and clean.",
        strategy: "Dancer theme. Quaquaval is physical attacker. Aqua Step raises Speed. Moxie on KO.",
        funFacts: [
          "Based on carnival dancer",
          "Obsessed with its pompadour",
          "Aqua Step boosts Speed"
        ],
        signature: "Aqua Step",
        strengths: ["Fire", "Ground", "Rock", "Dark", "Steel", "Normal", "Ice"],
        weaknesses: ["Electric", "Grass", "Flying", "Psychic", "Fairy"]
      }
    ]
  }
];

// Helper functions
const getPokemonImage = (pokemonId: number): string => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
};

// Type Badge Component
const TypeBadge: React.FC<{ type: string; size?: 'sm' | 'md' | 'lg' }> = ({ type, size = 'md' }) => {
  const colors = TYPE_COLORS[type] || { bg: '#A8A878', text: '#ffffff', light: '#F5F5F5' };
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm"
  };

  return (
    <span
      className={cn("rounded-full font-semibold capitalize inline-flex items-center", sizeClasses[size])}
      style={{ backgroundColor: colors.bg, color: colors.text, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
    >
      {type}
    </span>
  );
};

// Stat bar component
const StatBar: React.FC<{ label: string; value: number; max?: number; color: string }> = ({
  label, value, max = 150, color
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">
        {label}
      </span>
      <span className="w-8 text-xs font-bold text-stone-700 dark:text-stone-300 text-right">
        {value}
      </span>
      <div className="flex-1 h-2.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// Starter Panel - Shows all details inline (NO POPUP)
const StarterPanel: React.FC<{ starter: Starter; regionData: RegionData }> = ({ starter, regionData }) => {
  const primaryType = starter.types[0];
  const typeColors = TYPE_COLORS[primaryType] || { bg: '#A8A878', text: '#fff', light: '#F5F5F5' };
  const totalStats = Object.values(starter.stats).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div
        className="relative rounded-2xl overflow-hidden p-6"
        style={{ background: `linear-gradient(135deg, ${typeColors.bg}30 0%, ${typeColors.light} 100%)` }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Pokemon Image */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0">
            <Image
              src={getPokemonImage(starter.id)}
              alt={starter.name}
              fill
              className="object-contain drop-shadow-xl"
              priority
              sizes="(max-width: 640px) 160px, 192px"
            />
          </div>

          {/* Basic Info */}
          <div className="text-center sm:text-left flex-1">
            <p className="text-sm text-stone-500 dark:text-stone-400 font-mono">
              #{String(starter.id).padStart(4, '0')}
            </p>
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-1">
              {starter.name}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
              {starter.category}
            </p>
            <div className="flex gap-2 justify-center sm:justify-start mb-4">
              {starter.types.map(type => (
                <TypeBadge key={type} type={type} size="lg" />
              ))}
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 italic leading-relaxed max-w-md">
              "{starter.description}"
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Base Stats */}
          <div className="bg-white dark:bg-stone-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-4 flex items-center justify-between">
              Base Stats
              <span className="text-xs font-normal text-stone-500 dark:text-stone-400">
                Total: {totalStats}
              </span>
            </h3>
            <div className="space-y-3">
              <StatBar label="HP" value={starter.stats.hp} color="#FF5959" />
              <StatBar label="ATK" value={starter.stats.attack} color="#F5AC78" />
              <StatBar label="DEF" value={starter.stats.defense} color="#FAE078" />
              <StatBar label="SpA" value={starter.stats.spAttack} color="#9DB7F5" />
              <StatBar label="SpD" value={starter.stats.spDefense} color="#A7DB8D" />
              <StatBar label="SPD" value={starter.stats.speed} color="#FA92B2" />
            </div>
          </div>

          {/* Abilities */}
          <div className="bg-white dark:bg-stone-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-3">
              Abilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {starter.abilities.map((ability) => (
                <span
                  key={ability}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium",
                    ability.includes("Hidden")
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      : "bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                  )}
                >
                  {ability}
                </span>
              ))}
            </div>
          </div>

          {/* Type Matchups */}
          <div className="bg-white dark:bg-stone-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-3">
              Type Matchups
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1.5">Strong Against</p>
                <div className="flex flex-wrap gap-1.5">
                  {starter.strengths.map(type => (
                    <span key={type} className="px-2 py-0.5 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1.5">Weak Against</p>
                <div className="flex flex-wrap gap-1.5">
                  {starter.weaknesses.map(type => (
                    <span key={type} className="px-2 py-0.5 text-xs rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Evolution Chain */}
          <div className="bg-white dark:bg-stone-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-4">
              Evolution Chain
            </h3>
            <div className="flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto py-2">
              {starter.evolutions.map((evo, index) => (
                <React.Fragment key={evo.id}>
                  <Link
                    href={`/pokedex/${evo.id}`}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-xl transition-all",
                      "hover:bg-stone-100 dark:hover:bg-stone-700",
                      "active:scale-95 touch-manipulation group"
                    )}
                  >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                      <Image
                        src={getPokemonImage(evo.id)}
                        alt={evo.name}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform"
                        sizes="96px"
                      />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mt-2">
                      {evo.name}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {evo.types.map(type => (
                        <TypeBadge key={type} type={type} size="sm" />
                      ))}
                    </div>
                    {evo.level > 1 && (
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                        Level {evo.level}
                      </span>
                    )}
                  </Link>
                  {index < starter.evolutions.length - 1 && (
                    <FiChevronRight className="w-5 h-5 text-stone-400 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Strategy */}
          <div className="bg-white dark:bg-stone-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-3">
              Battle Strategy
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {starter.strategy}
            </p>
            <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Signature Move: {starter.signature}
              </p>
            </div>
          </div>

          {/* Fun Facts */}
          <div className="bg-white dark:bg-stone-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-3">
              Fun Facts
            </h3>
            <ul className="space-y-2">
              {starter.funFacts.map((fact, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
                  <span className="text-amber-500">•</span>
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* View in Pokedex CTA */}
      <div className="text-center">
        <Link
          href={`/pokedex/${starter.id}`}
          className={cn(
            "inline-flex items-center gap-2 px-6 py-3 rounded-xl",
            "bg-stone-900 dark:bg-white text-white dark:text-stone-900",
            "font-semibold text-sm hover:bg-stone-800 dark:hover:bg-stone-100",
            "active:scale-[0.98] transition-all touch-manipulation"
          )}
        >
          View {starter.name} in Pokedex
          <FiChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

interface RegionStarterPageProps {
  regionData: RegionData;
  prevRegion: RegionData | null;
  nextRegion: RegionData | null;
}

const RegionStarterPage: NextPage<RegionStarterPageProps> = ({ regionData, prevRegion, nextRegion }) => {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const activeStarter = regionData.starters[activeTab];
  const primaryType = activeStarter.types[0];
  const typeColors = TYPE_COLORS[primaryType] || { bg: '#A8A878', text: '#fff', light: '#F5F5F5' };

  return (
    <>
      <Head>
        <title>{regionData.region} Starters - Pokemon | DexTrends</title>
        <meta name="description" content={`Explore the starter Pokemon of the ${regionData.region} region: ${regionData.starters.map(s => s.name).join(', ')}. View stats, evolutions, and more.`} />
      </Head>

      <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
        {/* Header */}
        <header className="relative overflow-hidden border-b border-stone-200 dark:border-stone-700">
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: `linear-gradient(135deg, ${typeColors.bg}40 0%, ${typeColors.light} 100%)` }}
          />

          <div className="relative max-w-4xl mx-auto px-4 py-6">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-4">
              <StyledBackButton
                text="All Starters"
                onClick={() => router.push('/pokemon/starters')}
              />

              <div className="flex gap-2">
                {prevRegion && (
                  <Link
                    href={`/pokemon/starters/${prevRegion.id}`}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors touch-manipulation min-h-[44px]"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{prevRegion.region}</span>
                  </Link>
                )}
                {nextRegion && (
                  <Link
                    href={`/pokemon/starters/${nextRegion.id}`}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors touch-manipulation min-h-[44px]"
                  >
                    <span className="hidden sm:inline">{nextRegion.region}</span>
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Region Title */}
            <div className="text-center sm:text-left">
              <span className="inline-block px-2.5 py-1 rounded-full bg-white/80 dark:bg-stone-800/80 text-xs font-bold text-stone-600 dark:text-stone-400 mb-2">
                Generation {regionData.generation}
              </span>
              <h1 className={cn(
                "text-3xl sm:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2",
                regionData.gradient
              )}>
                {regionData.region} Region
              </h1>
              <p className="text-stone-600 dark:text-stone-400">
                {regionData.games.join(", ")}
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">
                {regionData.description}
              </p>
            </div>
          </div>
        </header>

        {/* Starter Tabs */}
        <div className="sticky top-[48px] md:top-[64px] z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-700/50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
              {regionData.starters.map((starter, index) => {
                const starterType = starter.types[0];
                const starterColors = TYPE_COLORS[starterType] || { bg: '#A8A878', text: '#fff', light: '#F5F5F5' };
                const isActive = activeTab === index;

                return (
                  <button
                    key={starter.id}
                    onClick={() => setActiveTab(index)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm",
                      "transition-all duration-200 flex-shrink-0 touch-manipulation min-h-[52px]",
                      isActive
                        ? "text-white shadow-lg"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                    )}
                    style={isActive ? { backgroundColor: starterColors.bg } : undefined}
                  >
                    <div className="relative w-8 h-8">
                      <Image
                        src={getPokemonImage(starter.id)}
                        alt={starter.name}
                        fill
                        className="object-contain"
                        sizes="32px"
                      />
                    </div>
                    <span>{starter.name}</span>
                    <TypeBadge type={starterType} size="sm" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Starter Content - ALL DETAILS INLINE, NO POPUP */}
        <main className="max-w-4xl mx-auto px-4 py-6">
          <StarterPanel starter={activeStarter} regionData={regionData} />
        </main>

        {/* Region Navigation Footer */}
        <footer className="max-w-4xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-2 gap-4">
            {prevRegion ? (
              <Link
                href={`/pokemon/starters/${prevRegion.id}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-stone-800 shadow-sm hover:shadow-md transition-all touch-manipulation group"
              >
                <FiChevronLeft className="w-5 h-5 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors" />
                <div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Previous</p>
                  <p className="font-bold text-stone-900 dark:text-white">{prevRegion.region}</p>
                </div>
              </Link>
            ) : <div />}

            {nextRegion ? (
              <Link
                href={`/pokemon/starters/${nextRegion.id}`}
                className="flex items-center justify-end gap-3 p-4 rounded-xl bg-white dark:bg-stone-800 shadow-sm hover:shadow-md transition-all touch-manipulation group text-right"
              >
                <div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Next</p>
                  <p className="font-bold text-stone-900 dark:text-white">{nextRegion.region}</p>
                </div>
                <FiChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors" />
              </Link>
            ) : <div />}
          </div>
        </footer>
      </div>
    </>
  );
};

// Full bleed layout
(RegionStarterPage as NextPage & { fullBleed?: boolean }).fullBleed = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = regionsData.map(region => ({
    params: { region: region.id }
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<RegionStarterPageProps> = async ({ params }) => {
  const regionId = params?.region as string;
  const regionIndex = regionsData.findIndex(r => r.id === regionId);

  if (regionIndex === -1) {
    return { notFound: true };
  }

  const regionData = regionsData[regionIndex];
  const prevRegion = regionIndex > 0 ? regionsData[regionIndex - 1] : null;
  const nextRegion = regionIndex < regionsData.length - 1 ? regionsData[regionIndex + 1] : null;

  return {
    props: {
      regionData,
      prevRegion,
      nextRegion
    }
  };
};

export default RegionStarterPage;
