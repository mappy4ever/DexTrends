import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../../components/ui/animations/animations";
import { useTheme } from "../../../context/UnifiedAppContext";
import StyledBackButton from "../../../components/ui/StyledBackButton";
import { TypeBadge } from "../../../components/ui/TypeBadge";
import { GiPokerHand, GiSwordWound, GiShield, GiSpeedometer, GiHearts } from "react-icons/gi";
import { BsChevronRight, BsStar, BsStarFill, BsLightning, BsDroplet, BsEmojiHeartEyes } from "react-icons/bs";
import { FaFire, FaLeaf, FaWater } from "react-icons/fa";

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
  region: string;
  generation: number;
  games: string[];
  description: string;
  starters: Starter[];
}

// Comprehensive starter data by region
const starterDataByRegion: Record<string, RegionData> = {
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
  johto: {
    region: "Johto",
    generation: 2,
    games: ["Gold", "Silver", "Crystal", "HeartGold", "SoulSilver"],
    description: "The Johto starters introduced unique type combinations and continue to be fan favorites.",
    starters: [
      {
        id: 152,
        name: "Chikorita",
        types: ["grass"],
        category: "Leaf Pokémon",
        abilities: ["Overgrow", "Leaf Guard (Hidden)"],
        evolutions: [
          { id: 152, name: "Chikorita", level: 1, types: ["grass"] },
          { id: 153, name: "Bayleef", level: 16, types: ["grass"] },
          { id: 154, name: "Meganium", level: 32, types: ["grass"] }
        ],
        stats: { hp: 45, attack: 49, defense: 65, spAttack: 49, spDefense: 65, speed: 45 },
        description: "A sweet aroma gently wafts from the leaf on its head. It is docile and loves to soak up sunrays.",
        strategy: "Challenging choice for Johto due to type disadvantages. Meganium excels as a support Pokémon with screens and healing moves.",
        funFacts: [
          "Based on a sauropod dinosaur",
          "Its aroma has calming properties",
          "Least chosen Johto starter statistically"
        ],
        signature: "Frenzy Plant",
        strengths: ["Water", "Ground", "Rock"],
        weaknesses: ["Fire", "Flying", "Poison", "Bug", "Ice"]
      },
      {
        id: 155,
        name: "Cyndaquil",
        types: ["fire"],
        category: "Fire Mouse Pokémon",
        abilities: ["Blaze", "Flash Fire (Hidden)"],
        evolutions: [
          { id: 155, name: "Cyndaquil", level: 1, types: ["fire"] },
          { id: 156, name: "Quilava", level: 14, types: ["fire"] },
          { id: 157, name: "Typhlosion", level: 36, types: ["fire"] }
        ],
        stats: { hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 },
        description: "It is timid and always curls itself up in a ball. If attacked, it flares up its back for protection.",
        strategy: "Most popular Johto choice. Typhlosion is a fast special attacker with access to Thunder Punch for coverage against Water types.",
        funFacts: [
          "Based on a honey badger and porcupine",
          "Typhlosion has identical stats to Charizard",
          "Hisuian form gains Ghost typing"
        ],
        signature: "Blast Burn",
        strengths: ["Grass", "Ice", "Bug", "Steel"],
        weaknesses: ["Water", "Ground", "Rock"]
      },
      {
        id: 158,
        name: "Totodile",
        types: ["water"],
        category: "Big Jaw Pokémon",
        abilities: ["Torrent", "Sheer Force (Hidden)"],
        evolutions: [
          { id: 158, name: "Totodile", level: 1, types: ["water"] },
          { id: 159, name: "Croconaw", level: 18, types: ["water"] },
          { id: 160, name: "Feraligatr", level: 30, types: ["water"] }
        ],
        stats: { hp: 50, attack: 65, defense: 64, spAttack: 44, spDefense: 48, speed: 43 },
        description: "Its well-developed jaws are powerful and capable of crushing anything. Even its trainer must be careful.",
        strategy: "Physical powerhouse of Johto starters. Feraligatr benefits from Sheer Force ability and has access to strong physical moves.",
        funFacts: [
          "Based on an alligator",
          "Name was shortened due to character limits",
          "Popular in competitive play after hidden ability release"
        ],
        signature: "Hydro Cannon",
        strengths: ["Fire", "Ground", "Rock"],
        weaknesses: ["Electric", "Grass"]
      }
    ]
  },
  hoenn: {
    region: "Hoenn",
    generation: 3,
    games: ["Ruby", "Sapphire", "Emerald", "Omega Ruby", "Alpha Sapphire"],
    description: "The Hoenn starters feature unique secondary typings in their final evolutions and have powerful Mega Evolutions.",
    starters: [
      {
        id: 252,
        name: "Treecko",
        types: ["grass"],
        category: "Wood Gecko Pokémon",
        abilities: ["Overgrow", "Unburden (Hidden)"],
        evolutions: [
          { id: 252, name: "Treecko", level: 1, types: ["grass"] },
          { id: 253, name: "Grovyle", level: 16, types: ["grass"] },
          { id: 254, name: "Sceptile", level: 36, types: ["grass"] }
        ],
        stats: { hp: 40, attack: 45, defense: 35, spAttack: 65, spDefense: 55, speed: 70 },
        description: "It quickly scales even vertical walls. It senses humidity with its tail to predict the next day's weather.",
        strategy: "Fastest Grass starter. Sceptile is a speedy special attacker with access to Dragon-type moves. Mega Evolution gains Dragon typing.",
        funFacts: [
          "Based on a leaf-tailed gecko",
          "Can regrow its tail if lost",
          "Ash's Sceptile defeated Darkrai in the anime"
        ],
        signature: "Frenzy Plant",
        strengths: ["Water", "Ground", "Rock"],
        weaknesses: ["Fire", "Flying", "Poison", "Bug", "Ice"]
      },
      {
        id: 255,
        name: "Torchic",
        types: ["fire"],
        category: "Chick Pokémon",
        abilities: ["Blaze", "Speed Boost (Hidden)"],
        evolutions: [
          { id: 255, name: "Torchic", level: 1, types: ["fire"] },
          { id: 256, name: "Combusken", level: 16, types: ["fire", "fighting"] },
          { id: 257, name: "Blaziken", level: 36, types: ["fire", "fighting"] }
        ],
        stats: { hp: 45, attack: 60, defense: 40, spAttack: 70, spDefense: 50, speed: 45 },
        description: "It has a flame sac inside its belly that perpetually burns. It feels warm if it is hugged.",
        strategy: "Gains Fighting type upon evolution. Blaziken with Speed Boost is one of the most powerful starters competitively.",
        funFacts: [
          "First Fire/Fighting starter",
          "Speed Boost Blaziken was banned to Ubers",
          "Based on a Shamo chicken"
        ],
        signature: "Blast Burn",
        strengths: ["Grass", "Ice", "Bug", "Steel", "Dark"],
        weaknesses: ["Water", "Ground", "Flying", "Psychic"]
      },
      {
        id: 258,
        name: "Mudkip",
        types: ["water"],
        category: "Mud Fish Pokémon",
        abilities: ["Torrent", "Damp (Hidden)"],
        evolutions: [
          { id: 258, name: "Mudkip", level: 1, types: ["water"] },
          { id: 259, name: "Marshtomp", level: 16, types: ["water", "ground"] },
          { id: 260, name: "Swampert", level: 36, types: ["water", "ground"] }
        ],
        stats: { hp: 50, attack: 70, defense: 50, spAttack: 50, spDefense: 50, speed: 40 },
        description: "The fin on its head is a radar that can sense nearby movements in water.",
        strategy: "Gains Ground typing, leaving only Grass weakness. Swampert is incredibly bulky and hits hard with STAB Earthquake.",
        funFacts: [
          "Based on a mudskipper and axolotl",
          "'So I heard you like Mudkips' meme origin",
          "Only one weakness when fully evolved"
        ],
        signature: "Hydro Cannon",
        strengths: ["Fire", "Poison", "Rock", "Steel", "Electric"],
        weaknesses: ["Grass (4x)"]
      }
    ]
  },
  sinnoh: {
    region: "Sinnoh",
    generation: 4,
    games: ["Diamond", "Pearl", "Platinum", "Brilliant Diamond", "Shining Pearl"],
    description: "The Sinnoh starters feature diverse secondary typings and are known for their competitive viability.",
    starters: [
      {
        id: 387,
        name: "Turtwig",
        types: ["grass"],
        category: "Tiny Leaf Pokémon",
        abilities: ["Overgrow", "Shell Armor (Hidden)"],
        evolutions: [
          { id: 387, name: "Turtwig", level: 1, types: ["grass"] },
          { id: 388, name: "Grotle", level: 18, types: ["grass"] },
          { id: 389, name: "Torterra", level: 32, types: ["grass", "ground"] }
        ],
        stats: { hp: 55, attack: 68, defense: 64, spAttack: 45, spDefense: 55, speed: 31 },
        description: "Made from soil, the shell on its back hardens when it drinks water. It lives along lakes.",
        strategy: "Becomes Grass/Ground type. Torterra is a physical tank with access to Earthquake and Wood Hammer. Excellent for Trick Room teams.",
        funFacts: [
          "Based on the World Turtle myth",
          "Small Pokémon live on Torterra's back",
          "Slowest fully evolved starter"
        ],
        signature: "Frenzy Plant",
        strengths: ["Water", "Ground", "Rock", "Electric"],
        weaknesses: ["Fire", "Flying", "Bug", "Ice (4x)"]
      },
      {
        id: 390,
        name: "Chimchar",
        types: ["fire"],
        category: "Chimp Pokémon",
        abilities: ["Blaze", "Iron Fist (Hidden)"],
        evolutions: [
          { id: 390, name: "Chimchar", level: 1, types: ["fire"] },
          { id: 391, name: "Monferno", level: 14, types: ["fire", "fighting"] },
          { id: 392, name: "Infernape", level: 36, types: ["fire", "fighting"] }
        ],
        stats: { hp: 44, attack: 58, defense: 44, spAttack: 58, spDefense: 44, speed: 61 },
        description: "Its fiery rear end is fueled by gas made in its belly. Even rain can't extinguish the fire.",
        strategy: "Another Fire/Fighting type. Infernape is a fast mixed attacker with great coverage moves. Iron Fist boosts punching moves.",
        funFacts: [
          "Based on Sun Wukong (Monkey King)",
          "Paul's abandoned Chimchar became Ash's ace",
          "Has equal Attack and Special Attack stats"
        ],
        signature: "Blast Burn",
        strengths: ["Grass", "Ice", "Bug", "Steel", "Dark"],
        weaknesses: ["Water", "Ground", "Flying", "Psychic"]
      },
      {
        id: 393,
        name: "Piplup",
        types: ["water"],
        category: "Penguin Pokémon",
        abilities: ["Torrent", "Defiant (Hidden)"],
        evolutions: [
          { id: 393, name: "Piplup", level: 1, types: ["water"] },
          { id: 394, name: "Prinplup", level: 16, types: ["water"] },
          { id: 395, name: "Empoleon", level: 36, types: ["water", "steel"] }
        ],
        stats: { hp: 53, attack: 51, defense: 53, spAttack: 61, spDefense: 56, speed: 40 },
        description: "It doesn't like to be taken care of. It's difficult to bond with since it won't listen to its Trainer.",
        strategy: "Gains Steel typing. Empoleon is a special attacker with great defensive typing and access to Scald and Flash Cannon.",
        funFacts: [
          "Based on an Emperor Penguin and Napoleon",
          "Only Water/Steel type Pokémon",
          "Dawn's Piplup refused to evolve in anime"
        ],
        signature: "Hydro Cannon",
        strengths: ["Fire", "Rock", "Fairy", "Ice", "Steel"],
        weaknesses: ["Electric", "Fighting", "Ground"]
      }
    ]
  },
  unova: {
    region: "Unova",
    generation: 5,
    games: ["Black", "White", "Black 2", "White 2"],
    description: "The Unova starters represent Western-inspired designs and have unique Hidden Abilities.",
    starters: [
      {
        id: 495,
        name: "Snivy",
        types: ["grass"],
        category: "Grass Snake Pokémon",
        abilities: ["Overgrow", "Contrary (Hidden)"],
        evolutions: [
          { id: 495, name: "Snivy", level: 1, types: ["grass"] },
          { id: 496, name: "Servine", level: 17, types: ["grass"] },
          { id: 497, name: "Serperior", level: 36, types: ["grass"] }
        ],
        stats: { hp: 45, attack: 45, defense: 55, spAttack: 45, spDefense: 55, speed: 63 },
        description: "It is very intelligent and calm. Being exposed to lots of sunlight makes its movements swifter.",
        strategy: "Contrary Serperior turns Leaf Storm into a boosting move. Becomes a dangerous sweeper with each attack raising Special Attack.",
        funFacts: [
          "Based on French royalty and serpents",
          "Loses its limbs as it evolves",
          "Contrary makes it unique among starters"
        ],
        signature: "Frenzy Plant",
        strengths: ["Water", "Ground", "Rock"],
        weaknesses: ["Fire", "Flying", "Poison", "Bug", "Ice"]
      },
      {
        id: 498,
        name: "Tepig",
        types: ["fire"],
        category: "Fire Pig Pokémon",
        abilities: ["Blaze", "Thick Fat (Hidden)"],
        evolutions: [
          { id: 498, name: "Tepig", level: 1, types: ["fire"] },
          { id: 499, name: "Pignite", level: 17, types: ["fire", "fighting"] },
          { id: 500, name: "Emboar", level: 36, types: ["fire", "fighting"] }
        ],
        stats: { hp: 65, attack: 63, defense: 45, spAttack: 45, spDefense: 45, speed: 45 },
        description: "It can deftly dodge its foe's attacks while shooting fireballs from its nose.",
        strategy: "Third Fire/Fighting starter. Emboar is a mixed attacker with high HP. Thick Fat reduces Ice and Fire damage.",
        funFacts: [
          "Based on Zhang Fei from Chinese literature",
          "Controversial for being another Fire/Fighting",
          "Has the highest HP of Fire starters"
        ],
        signature: "Blast Burn",
        strengths: ["Grass", "Ice", "Bug", "Steel", "Dark"],
        weaknesses: ["Water", "Ground", "Flying", "Psychic"]
      },
      {
        id: 501,
        name: "Oshawott",
        types: ["water"],
        category: "Sea Otter Pokémon",
        abilities: ["Torrent", "Shell Armor (Hidden)"],
        evolutions: [
          { id: 501, name: "Oshawott", level: 1, types: ["water"] },
          { id: 502, name: "Dewott", level: 17, types: ["water"] },
          { id: 503, name: "Samurott", level: 36, types: ["water"] }
        ],
        stats: { hp: 55, attack: 55, defense: 45, spAttack: 63, spDefense: 45, speed: 45 },
        description: "It fights using the scalchop on its stomach. In response to an attack, it retaliates immediately.",
        strategy: "Samurott is a mixed attacker with samurai theming. Has access to Sacred Sword and other coverage moves.",
        funFacts: [
          "Based on samurai and sea otters",
          "Uses shells as weapons (seamitars)",
          "Hisuian form gains Dark typing"
        ],
        signature: "Hydro Cannon",
        strengths: ["Fire", "Ground", "Rock"],
        weaknesses: ["Electric", "Grass"]
      }
    ]
  },
  kalos: {
    region: "Kalos",
    generation: 6,
    games: ["X", "Y"],
    description: "The Kalos starters are based on classic RPG classes and have unique Hidden Abilities that define their playstyles.",
    starters: [
      {
        id: 650,
        name: "Chespin",
        types: ["grass"],
        category: "Spiny Nut Pokémon",
        abilities: ["Overgrow", "Bulletproof (Hidden)"],
        evolutions: [
          { id: 650, name: "Chespin", level: 1, types: ["grass"] },
          { id: 651, name: "Quilladin", level: 16, types: ["grass"] },
          { id: 652, name: "Chesnaught", level: 36, types: ["grass", "fighting"] }
        ],
        stats: { hp: 56, attack: 61, defense: 65, spAttack: 48, spDefense: 45, speed: 38 },
        description: "The quills on its head are usually soft. When it flexes them, the points become so hard they can pierce rock.",
        strategy: "Tank class starter. Chesnaught has high defense and Bulletproof protects from ball/bomb moves. Access to Spiky Shield.",
        funFacts: [
          "Based on a knight/paladin class",
          "First Grass/Fighting type",
          "Bulletproof blocks moves like Shadow Ball"
        ],
        signature: "Frenzy Plant",
        strengths: ["Water", "Ground", "Rock", "Dark"],
        weaknesses: ["Fire", "Flying", "Poison", "Psychic", "Ice", "Fairy"]
      },
      {
        id: 653,
        name: "Fennekin",
        types: ["fire"],
        category: "Fox Pokémon",
        abilities: ["Blaze", "Magician (Hidden)"],
        evolutions: [
          { id: 653, name: "Fennekin", level: 1, types: ["fire"] },
          { id: 654, name: "Braixen", level: 16, types: ["fire"] },
          { id: 655, name: "Delphox", level: 36, types: ["fire", "psychic"] }
        ],
        stats: { hp: 40, attack: 45, defense: 40, spAttack: 62, spDefense: 60, speed: 60 },
        description: "Eating a twig fills it with energy, and its roomy ears give vent to air hotter than 390 degrees Fahrenheit.",
        strategy: "Mage class starter. Delphox is a special attacker with Psychic typing. Magician steals items when attacking.",
        funFacts: [
          "Based on a mage/witch class",
          "First Fire/Psychic starter",
          "Uses a wand made from wood"
        ],
        signature: "Blast Burn",
        strengths: ["Grass", "Ice", "Bug", "Steel", "Fighting"],
        weaknesses: ["Water", "Ground", "Rock", "Ghost", "Dark"]
      },
      {
        id: 656,
        name: "Froakie",
        types: ["water"],
        category: "Bubble Frog Pokémon",
        abilities: ["Torrent", "Protean (Hidden)"],
        evolutions: [
          { id: 656, name: "Froakie", level: 1, types: ["water"] },
          { id: 657, name: "Frogadier", level: 16, types: ["water"] },
          { id: 658, name: "Greninja", level: 36, types: ["water", "dark"] }
        ],
        stats: { hp: 41, attack: 56, defense: 40, spAttack: 62, spDefense: 44, speed: 71 },
        description: "It secretes flexible bubbles from its chest and back. The bubbles reduce damage from attacks.",
        strategy: "Rogue class starter. Greninja with Protean changes type before attacking. Extremely versatile and popular competitively.",
        funFacts: [
          "Based on a ninja/rogue class",
          "Most popular Gen 6 Pokémon in polls",
          "Has a special Ash-Greninja form"
        ],
        signature: "Hydro Cannon",
        strengths: ["Fire", "Ground", "Rock", "Ghost", "Psychic"],
        weaknesses: ["Electric", "Grass", "Fighting", "Bug", "Fairy"]
      }
    ]
  },
  alola: {
    region: "Alola",
    generation: 7,
    games: ["Sun", "Moon", "Ultra Sun", "Ultra Moon"],
    description: "The Alola starters have unique type combinations and signature Z-Moves that showcase their personalities.",
    starters: [
      {
        id: 722,
        name: "Rowlet",
        types: ["grass", "flying"],
        category: "Grass Quill Pokémon",
        abilities: ["Overgrow", "Long Reach (Hidden)"],
        evolutions: [
          { id: 722, name: "Rowlet", level: 1, types: ["grass", "flying"] },
          { id: 723, name: "Dartrix", level: 17, types: ["grass", "flying"] },
          { id: 724, name: "Decidueye", level: 34, types: ["grass", "ghost"] }
        ],
        stats: { hp: 68, attack: 55, defense: 55, spAttack: 50, spDefense: 50, speed: 42 },
        description: "This wary Pokémon uses photosynthesis to store up energy during the day, while becoming active at night.",
        strategy: "Archer theme. Decidueye gains Ghost typing and is a physical attacker. Long Reach prevents contact move effects.",
        funFacts: [
          "Based on an archer and extinct Hawaiian owls",
          "Only starter to change from Flying to Ghost",
          "Hisuian form is Grass/Fighting"
        ],
        signature: "Frenzy Plant / Sinister Arrow Raid (Z-Move)",
        strengths: ["Water", "Ground", "Rock", "Psychic"],
        weaknesses: ["Fire", "Flying", "Ice", "Ghost", "Dark"]
      },
      {
        id: 725,
        name: "Litten",
        types: ["fire"],
        category: "Fire Cat Pokémon",
        abilities: ["Blaze", "Intimidate (Hidden)"],
        evolutions: [
          { id: 725, name: "Litten", level: 1, types: ["fire"] },
          { id: 726, name: "Torracat", level: 17, types: ["fire"] },
          { id: 727, name: "Incineroar", level: 34, types: ["fire", "dark"] }
        ],
        stats: { hp: 45, attack: 65, defense: 40, spAttack: 60, spDefense: 40, speed: 70 },
        description: "While grooming itself, it builds up fur inside its stomach. It sets the fur alight and spews fiery attacks.",
        strategy: "Wrestler theme. Incineroar is incredibly popular in VGC with Intimidate and Fake Out support. Bulky physical attacker.",
        funFacts: [
          "Based on a heel wrestler and tiger",
          "Most used Pokémon in VGC history",
          "Personality changes from aloof to showoff"
        ],
        signature: "Blast Burn / Malicious Moonsault (Z-Move)",
        strengths: ["Grass", "Ice", "Bug", "Steel", "Ghost", "Psychic"],
        weaknesses: ["Water", "Ground", "Rock", "Fighting"]
      },
      {
        id: 728,
        name: "Popplio",
        types: ["water"],
        category: "Sea Lion Pokémon",
        abilities: ["Torrent", "Liquid Voice (Hidden)"],
        evolutions: [
          { id: 728, name: "Popplio", level: 1, types: ["water"] },
          { id: 729, name: "Brionne", level: 17, types: ["water"] },
          { id: 730, name: "Primarina", level: 34, types: ["water", "fairy"] }
        ],
        stats: { hp: 50, attack: 54, defense: 54, spAttack: 66, spDefense: 56, speed: 40 },
        description: "This Pokémon snorts body fluids from its nose, blowing balloons to smash into its foes.",
        strategy: "Singer theme. Primarina is a special attacker with great bulk. Liquid Voice turns sound moves into Water-type.",
        funFacts: [
          "Based on a sea lion and opera singer",
          "Only Water/Fairy type Pokémon",
          "87.5% male despite feminine appearance"
        ],
        signature: "Hydro Cannon / Oceanic Operetta (Z-Move)",
        strengths: ["Fire", "Ground", "Rock", "Fighting", "Dark", "Dragon"],
        weaknesses: ["Electric", "Grass", "Poison"]
      }
    ]
  },
  galar: {
    region: "Galar",
    generation: 8,
    games: ["Sword", "Shield"],
    description: "The Galar starters are based on British culture and have signature moves that become more powerful with Gigantamax forms.",
    starters: [
      {
        id: 810,
        name: "Grookey",
        types: ["grass"],
        category: "Chimp Pokémon",
        abilities: ["Overgrow", "Grassy Surge (Hidden)"],
        evolutions: [
          { id: 810, name: "Grookey", level: 1, types: ["grass"] },
          { id: 811, name: "Thwackey", level: 16, types: ["grass"] },
          { id: 812, name: "Rillaboom", level: 35, types: ["grass"] }
        ],
        stats: { hp: 50, attack: 65, defense: 50, spAttack: 40, spDefense: 40, speed: 65 },
        description: "When it uses its special stick to strike up a beat, the sound waves produced carry revitalizing energy.",
        strategy: "Drummer theme. Rillaboom is a physical attacker with Grassy Surge setting terrain. Signature move Drum Beating lowers speed.",
        funFacts: [
          "Based on a drummer and gorilla",
          "Carries drumsticks everywhere",
          "Popular in competitive for terrain setting"
        ],
        signature: "Drum Beating",
        strengths: ["Water", "Ground", "Rock"],
        weaknesses: ["Fire", "Flying", "Poison", "Bug", "Ice"]
      },
      {
        id: 813,
        name: "Scorbunny",
        types: ["fire"],
        category: "Rabbit Pokémon",
        abilities: ["Blaze", "Libero (Hidden)"],
        evolutions: [
          { id: 813, name: "Scorbunny", level: 1, types: ["fire"] },
          { id: 814, name: "Raboot", level: 16, types: ["fire"] },
          { id: 815, name: "Cinderace", level: 35, types: ["fire"] }
        ],
        stats: { hp: 50, attack: 71, defense: 40, spAttack: 40, spDefense: 40, speed: 69 },
        description: "It has special pads on the backs of its feet, and one on its nose. Once it's raring to fight, these pads radiate heat.",
        strategy: "Soccer player theme. Cinderace is a fast physical attacker. Libero works like Protean, changing type before attacking.",
        funFacts: [
          "Based on a soccer/football player",
          "Signature move Pyro Ball is a flaming soccer ball",
          "Most popular Galar starter"
        ],
        signature: "Pyro Ball",
        strengths: ["Grass", "Ice", "Bug", "Steel"],
        weaknesses: ["Water", "Ground", "Rock"]
      },
      {
        id: 816,
        name: "Sobble",
        types: ["water"],
        category: "Water Lizard Pokémon",
        abilities: ["Torrent", "Sniper (Hidden)"],
        evolutions: [
          { id: 816, name: "Sobble", level: 1, types: ["water"] },
          { id: 817, name: "Drizzile", level: 16, types: ["water"] },
          { id: 818, name: "Inteleon", level: 35, types: ["water"] }
        ],
        stats: { hp: 50, attack: 40, defense: 40, spAttack: 70, spDefense: 40, speed: 70 },
        description: "When scared, this Pokémon cries. Its tears pack the chemical punch of 100 onions, and attackers won't be able to resist weeping.",
        strategy: "Spy theme. Inteleon is a special attacker sniper. Sniper ability powers up critical hits. Very fast with good coverage.",
        funFacts: [
          "Based on a spy/secret agent and chameleon",
          "Can shoot water from fingertips",
          "Gigantamax form uses a water rifle"
        ],
        signature: "Snipe Shot",
        strengths: ["Fire", "Ground", "Rock"],
        weaknesses: ["Electric", "Grass"]
      }
    ]
  },
  paldea: {
    region: "Paldea",
    generation: 9,
    games: ["Scarlet", "Violet"],
    description: "The Paldea starters are based on Spanish and Latin culture, featuring unique abilities and signature moves.",
    starters: [
      {
        id: 906,
        name: "Sprigatito",
        types: ["grass"],
        category: "Grass Cat Pokémon",
        abilities: ["Overgrow", "Protean (Hidden)"],
        evolutions: [
          { id: 906, name: "Sprigatito", level: 1, types: ["grass"] },
          { id: 907, name: "Floragato", level: 16, types: ["grass"] },
          { id: 908, name: "Meowscarada", level: 36, types: ["grass", "dark"] }
        ],
        stats: { hp: 40, attack: 61, defense: 54, spAttack: 45, spDefense: 45, speed: 65 },
        description: "Its fluffy fur is similar in composition to plants. This Pokémon frequently washes its face to keep it from drying out.",
        strategy: "Magician theme. Meowscarada is a fast physical attacker with signature move Flower Trick that always crits.",
        funFacts: [
          "Based on an Iberian lynx and stage magician",
          "Fans wanted it to stay quadrupedal",
          "Flower Trick never misses and always crits"
        ],
        signature: "Flower Trick",
        strengths: ["Water", "Ground", "Rock", "Ghost", "Psychic"],
        weaknesses: ["Fire", "Flying", "Ice", "Fighting", "Poison", "Bug", "Fairy"]
      },
      {
        id: 909,
        name: "Fuecoco",
        types: ["fire"],
        category: "Fire Croc Pokémon",
        abilities: ["Blaze", "Unaware (Hidden)"],
        evolutions: [
          { id: 909, name: "Fuecoco", level: 1, types: ["fire"] },
          { id: 910, name: "Crocalor", level: 16, types: ["fire"] },
          { id: 911, name: "Skeledirge", level: 36, types: ["fire", "ghost"] }
        ],
        stats: { hp: 67, attack: 45, defense: 59, spAttack: 63, spDefense: 40, speed: 36 },
        description: "It lies on warm rocks and uses the heat absorbed by its square-shaped scales to create fire energy.",
        strategy: "Singer theme. Skeledirge is a bulky special attacker. Signature move Torch Song raises Special Attack.",
        funFacts: [
          "Based on a crocodile and Day of the Dead",
          "Has a bird companion that helps it sing",
          "First Fire/Ghost type Pokémon"
        ],
        signature: "Torch Song",
        strengths: ["Grass", "Ice", "Bug", "Steel", "Psychic"],
        weaknesses: ["Water", "Ground", "Rock", "Ghost", "Dark"]
      },
      {
        id: 912,
        name: "Quaxly",
        types: ["water"],
        category: "Duckling Pokémon",
        abilities: ["Torrent", "Moxie (Hidden)"],
        evolutions: [
          { id: 912, name: "Quaxly", level: 1, types: ["water"] },
          { id: 913, name: "Quaxwell", level: 16, types: ["water"] },
          { id: 914, name: "Quaquaval", level: 36, types: ["water", "fighting"] }
        ],
        stats: { hp: 55, attack: 65, defense: 45, spAttack: 50, spDefense: 45, speed: 50 },
        description: "Its strong legs let it easily swim around in even fast-flowing rivers. It likes to keep things tidy and clean.",
        strategy: "Dancer theme. Quaquaval is a physical attacker. Signature move Aqua Step raises Speed. Moxie boosts Attack on KO.",
        funFacts: [
          "Based on a crested duck and carnival dancer",
          "Obsessed with its pompadour hairstyle",
          "Learns many kicking moves"
        ],
        signature: "Aqua Step",
        strengths: ["Fire", "Ground", "Rock", "Dark", "Steel"],
        weaknesses: ["Electric", "Grass", "Flying", "Psychic", "Fairy"]
      }
    ]
  }
};

// Helper functions
const getStatColor = (stat: number): string => {
  if (stat >= 100) return 'from-green-400 to-green-600';
  if (stat >= 80) return 'from-blue-400 to-blue-600';
  if (stat >= 60) return 'from-yellow-400 to-yellow-600';
  return 'from-red-400 to-red-600';
};

const getStatPercentage = (stat: number): number => {
  return (stat / 255) * 100;
};

const getPokemonImage = (pokemonId: number): string => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
};

export default function StarterDetailPage() {
  const router = useRouter();
  const { region } = router.query;
  const { theme } = useTheme();
  const [selectedStarter, setSelectedStarter] = useState<Starter | null>(null);
  const [hoveredEvolution, setHoveredEvolution] = useState<string | null>(null);

  const regionData = region ? starterDataByRegion[region.toString().toLowerCase()] : null;

  if (!regionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Region not found</h1>
          <StyledBackButton 
            text="Back to Starters" 
            onClick={() => router.push('/pokemon/starters')} 
          />
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
      grass: <FaLeaf />,
      fire: <FaFire />,
      water: <FaWater />
    };
    return icons[type] || null;
  };

  return (
    <div className="min-h-screen">
      <Head>
        <title>{regionData.region} Starters | DexTrends</title>
        <meta name="description" content={`Meet the starter Pokémon from the ${regionData.region} region`} />
      </Head>

      <FadeIn>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <StyledBackButton 
              text="Back to All Starters" 
              onClick={() => router.push('/pokemon/starters')} 
            />
          </div>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pokemon-red to-pokemon-blue bg-clip-text text-transparent">
                {regionData.region} Starters
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
              Generation {regionData.generation} • {regionData.games.join(", ")}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {regionData.description}
            </p>
          </div>

          {/* Starters Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {regionData.starters.map((starter, index) => (
              <SlideUp key={starter.id} delay={index * 0.1}>
                <CardHover>
                  <div className={`rounded-2xl overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } shadow-xl h-full`}>
                    {/* Header with Type Icon */}
                    <div className={`p-6 bg-gradient-to-r ${
                      starter.types[0] === 'grass' ? 'from-green-500 to-green-600' :
                      starter.types[0] === 'fire' ? 'from-red-500 to-orange-500' :
                      'from-blue-500 to-blue-600'
                    } text-white`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-3xl font-bold">{starter.name}</h2>
                          <p className="text-lg opacity-90">{starter.category}</p>
                        </div>
                        <div className="text-4xl">
                          {getTypeIcon(starter.types[0])}
                        </div>
                      </div>
                    </div>

                    {/* Pokemon Image */}
                    <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-900">
                      <Image
                        src={getPokemonImage(starter.id)}
                        alt={starter.name}
                        layout="fill"
                        objectFit="contain"
                        className="p-4"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        {starter.types.map(type => (
                          <TypeBadge key={type} type={type} size="md" />
                        ))}
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="p-6">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {starter.description}
                      </p>

                      {/* Abilities */}
                      <div className="mb-4">
                        <h3 className="font-bold text-sm mb-2">Abilities</h3>
                        <div className="flex flex-wrap gap-2">
                          {starter.abilities.map((ability) => (
                            <span key={ability} className={`px-3 py-1 rounded-full text-xs ${
                              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                            }`}>
                              {ability}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Evolution Preview */}
                      <div className="mb-4">
                        <h3 className="font-bold text-sm mb-2">Evolution Chain</h3>
                        <div className="flex items-center justify-center gap-2">
                          {starter.evolutions.map((evo, evoIndex) => (
                            <React.Fragment key={evo.id}>
                              <div 
                                className="relative cursor-pointer transition-transform hover:scale-110"
                                onMouseEnter={() => setHoveredEvolution(`${starter.id}-${evo.id}`)}
                                onMouseLeave={() => setHoveredEvolution(null)}
                              >
                                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                                  <Image
                                    src={getPokemonImage(evo.id)}
                                    alt={evo.name}
                                    layout="fill"
                                    objectFit="cover"
                                  />
                                </div>
                                {hoveredEvolution === `${starter.id}-${evo.id}` && (
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap">
                                    {evo.name} (Lv. {evo.level})
                                  </div>
                                )}
                              </div>
                              {evoIndex < starter.evolutions.length - 1 && (
                                <BsChevronRight className="text-gray-400" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => setSelectedStarter(starter)}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-pokemon-red to-pokemon-blue text-white font-semibold hover:opacity-90 transition-opacity"
                      >
                        View Full Details
                      </button>
                    </div>
                  </div>
                </CardHover>
              </SlideUp>
            ))}
          </div>

          {/* Comparison Section */}
          <SlideUp>
            <div className={`rounded-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            } p-8`}>
              <h2 className="text-2xl font-bold mb-6 text-center">Base Stats Comparison</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {regionData.starters.map((starter) => {
                  const totalStats = Object.values(starter.stats).reduce((a, b) => a + b, 0);
                  return (
                    <div key={starter.id} className="text-center">
                      <h3 className="font-bold mb-3">{starter.name}</h3>
                      <div className="relative w-32 h-32 mx-auto mb-3">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold">{totalStats}</span>
                        </div>
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-300 dark:text-gray-600"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(totalStats / 600) * 352} 352`}
                            className={
                              starter.types[0] === 'grass' ? 'text-green-500' :
                              starter.types[0] === 'fire' ? 'text-red-500' :
                              'text-blue-500'
                            }
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Base Stats</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </SlideUp>

          {/* Detailed Modal */}
          {selectedStarter && (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedStarter(null)}
            >
              <SlideUp>
                <div 
                  className={`max-w-6xl w-full rounded-2xl overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } max-h-[90vh] overflow-y-auto`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className={`p-6 bg-gradient-to-r ${
                    selectedStarter.types[0] === 'grass' ? 'from-green-500 to-green-600' :
                    selectedStarter.types[0] === 'fire' ? 'from-red-500 to-orange-500' :
                    'from-blue-500 to-blue-600'
                  } text-white relative`}>
                    <button 
                      onClick={() => setSelectedStarter(null)}
                      className="absolute top-4 right-4 text-white bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                    >
                      ✕
                    </button>
                    <h2 className="text-4xl font-bold mb-2">{selectedStarter.name}</h2>
                    <p className="text-xl opacity-90">{selectedStarter.category}</p>
                  </div>

                  {/* Modal Content */}
                  <div className="p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div>
                        {/* Evolution Chain */}
                        <h3 className="text-2xl font-bold mb-4">Evolution Chain</h3>
                        <div className="space-y-4 mb-8">
                          {selectedStarter.evolutions.map((evo, idx) => (
                            <div key={evo.id} className={`flex items-center gap-4 p-4 rounded-xl ${
                              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              <div className="relative w-24 h-24">
                                <Image
                                  src={getPokemonImage(evo.id)}
                                  alt={evo.name}
                                  layout="fill"
                                  objectFit="contain"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-lg">{evo.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {idx === 0 ? 'Base Form' : `Evolves at Level ${evo.level}`}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  {evo.types.map(type => (
                                    <TypeBadge key={type} type={type} size="sm" />
                                  ))}
                                </div>
                              </div>
                              <Link href={`/pokedex/${evo.id}`} className="px-4 py-2 bg-pokemon-red text-white rounded-lg hover:bg-pokemon-red/90 transition-colors">
                                View in Dex
                              </Link>
                            </div>
                          ))}
                        </div>

                        {/* Fun Facts */}
                        <h3 className="text-2xl font-bold mb-4">Fun Facts</h3>
                        <ul className="space-y-2 mb-8">
                          {selectedStarter.funFacts.map((fact, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <BsStar className="text-yellow-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-400">{fact}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Right Column */}
                      <div>
                        {/* Base Stats */}
                        <h3 className="text-2xl font-bold mb-4">Base Stats</h3>
                        <div className="space-y-3 mb-8">
                          {Object.entries(selectedStarter.stats).map(([stat, value]) => (
                            <div key={stat}>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium capitalize">
                                  {stat.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="text-sm font-bold">{value}</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div 
                                  className={`bg-gradient-to-r ${getStatColor(value)} rounded-full h-3 transition-all duration-500`}
                                  style={{ width: `${getStatPercentage(value)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between">
                              <span className="font-bold">Total</span>
                              <span className="font-bold">
                                {Object.values(selectedStarter.stats).reduce((a, b) => a + b, 0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Strategy */}
                        <h3 className="text-2xl font-bold mb-4">Battle Strategy</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {selectedStarter.strategy}
                        </p>

                        {/* Type Effectiveness */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
                            <h4 className="font-bold mb-2 text-green-600 dark:text-green-400">Strong Against</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedStarter.strengths.map(type => (
                                <TypeBadge key={type} type={type.toLowerCase()} size="sm" />
                              ))}
                            </div>
                          </div>
                          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'}`}>
                            <h4 className="font-bold mb-2 text-red-600 dark:text-red-400">Weak Against</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedStarter.weaknesses.map(type => (
                                <TypeBadge key={type} type={type.toLowerCase().replace(' (4x)', '')} size="sm" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SlideUp>
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}