import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../../components/ui/animations/animations";
import { useTheme } from "../../../context/UnifiedAppContext";
import StyledBackButton from "../../../components/ui/StyledBackButton";
import { TypeBadge } from "../../../components/ui/TypeBadge";
import { getGymLeaderImage, getBadgeImage } from "../../../utils/scrapedImageMapping";
import { StandardGlassContainer, SectionHeader } from "../../../components/ui/design-system";

// Import Region Components
import RegionHero from "../../../components/regions/RegionHero";
import GymLeaderCarousel from "../../../components/regions/GymLeaderCarousel";
import EliteFourGallery from "../../../components/regions/EliteFourGallery";
import StarterPokemonShowcase from "../../../components/regions/StarterPokemonShowcase";
import ProfessorShowcase from "../../../components/regions/ProfessorShowcase";
import RegionInfo from "../../../components/regions/RegionInfo";
import GameShowcase from "../../../components/regions/GameShowcase";
import EvilTeamShowcase from "../../../components/regions/EvilTeamShowcase";
import SpecialPokemonShowcase from "../../../components/regions/SpecialPokemonShowcase";

import { BsGlobeEuropeAfrica, BsChevronRight, BsChevronLeft, BsMap, BsController, BsTrophy, BsChevronDown, BsChevronUp, BsGeoAlt, BsCompass } from "react-icons/bs";
import { GiMountainRoad, GiModernCity, GiIsland } from "react-icons/gi";

// Type definitions
interface Location {
  name: string;
  type: string;
  description: string;
}

interface Landmark {
  name: string;
  description: string;
}

interface GymLeader {
  name: string;
  city: string;
  type: string;
  badge: string;
}

interface EliteFourMember {
  name: string;
  type: string;
  signature: string;
}

interface Champion {
  name: string;
  team: string;
  signature: string;
}

interface TrialCaptain {
  name: string;
  trial: string;
  type: string;
  reward: string;
}

interface IslandKahuna {
  name: string;
  island: string;
  type: string;
  signature: string;
}

interface OldPageRegionData {
  id: string;
  name: string;
  generation: number;
  games: string[];
  description: string;
  professor: string;
  starters: string[];
  starterIds: number[];
  starterTypes: string[][];
  legendaries: string[];
  legendaryIds: number[];
  cities: number;
  routes: number;
  pokemonRange: string;
  color: string;
  bgColor: string;
  map: string;
  locations?: Location[];
  landmarks?: Landmark[];
  gymLeaders?: GymLeader[];
  eliteFour?: EliteFourMember[];
  champion?: Champion;
  trivia?: string[];
  trialCaptains?: TrialCaptain[];
  islandKahunas?: IslandKahuna[];
}

// Define region order for navigation
const regionOrder = ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea'];

// Comprehensive region data with additional details
const regionsData: Record<string, OldPageRegionData> = {
  kanto: {
    id: "kanto",
    name: "Kanto",
    generation: 1,
    games: ["Red", "Blue", "Yellow", "FireRed", "LeafGreen", "Let's Go Pikachu/Eevee"],
    description: "The region where it all began. Home to the original 151 Pokémon.",
    professor: "Professor Oak",
    starters: ["Bulbasaur", "Charmander", "Squirtle"],
    starterIds: [1, 4, 7],
    starterTypes: [["grass", "poison"], ["fire"], ["water"]],
    legendaries: ["Articuno", "Zapdos", "Moltres", "Mewtwo", "Mew"],
    legendaryIds: [144, 145, 146, 150, 151],
    cities: 10,
    routes: 25,
    pokemonRange: "001-151",
    color: "from-red-500 to-blue-500",
    bgColor: "bg-gradient-to-br from-red-100 to-blue-100 dark:from-red-900 dark:to-blue-900",
    map: '/images/scraped/maps/PE_Kanto_Map.png',
    locations: [
      { name: "Pallet Town", type: "town", description: "Your journey begins here" },
      { name: "Viridian City", type: "city", description: "The eternally green paradise" },
      { name: "Pewter City", type: "city", description: "A stone gray city" },
      { name: "Cerulean City", type: "city", description: "A mysterious blue aura surrounds it" },
      { name: "Vermilion City", type: "city", description: "The port of exquisite sunsets" }
    ],
    landmarks: [
      { name: "Mt. Moon", description: "A mystical mountain known for Clefairy" },
      { name: "Rock Tunnel", description: "A pitch-black tunnel requiring Flash" },
      { name: "Power Plant", description: "Home to Electric-type Pokémon and Zapdos" },
      { name: "Seafoam Islands", description: "Twin islands home to Articuno" },
      { name: "Victory Road", description: "The final test before the Pokémon League" }
    ],
    gymLeaders: [
      { name: "Brock", city: "Pewter City", type: "rock", badge: "Boulder Badge" },
      { name: "Misty", city: "Cerulean City", type: "water", badge: "Cascade Badge" },
      { name: "Lt. Surge", city: "Vermilion City", type: "electric", badge: "Thunder Badge" },
      { name: "Erika", city: "Celadon City", type: "grass", badge: "Rainbow Badge" },
      { name: "Koga", city: "Fuchsia City", type: "poison", badge: "Soul Badge" },
      { name: "Sabrina", city: "Saffron City", type: "psychic", badge: "Marsh Badge" },
      { name: "Blaine", city: "Cinnabar Island", type: "fire", badge: "Volcano Badge" },
      { name: "Giovanni", city: "Viridian City", type: "ground", badge: "Earth Badge" }
    ],
    eliteFour: [
      { name: "Lorelei", type: "ice", signature: "Lapras" },
      { name: "Bruno", type: "fighting", signature: "Machamp" },
      { name: "Agatha", type: "ghost", signature: "Gengar" },
      { name: "Lance", type: "dragon", signature: "Dragonite" }
    ],
    champion: { name: "Blue", team: "Varied", signature: "Depends on starter choice" },
    trivia: [
      "Kanto is based on the real Kantō region of Japan",
      "It's the only region to appear in four different generations of games",
      "Team Rocket originated in this region",
      "Features the first Pokémon League ever introduced"
    ]
  },
  johto: {
    id: "johto",
    name: "Johto",
    generation: 2,
    games: ["Gold", "Silver", "Crystal", "HeartGold", "SoulSilver"],
    description: "A region steeped in history and tradition, connected to Kanto.",
    professor: "Professor Elm",
    starters: ["Chikorita", "Cyndaquil", "Totodile"],
    starterIds: [152, 155, 158],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Raikou", "Entei", "Suicune", "Lugia", "Ho-Oh", "Celebi"],
    legendaryIds: [243, 244, 245, 249, 250, 251],
    cities: 10,
    routes: 20,
    pokemonRange: "152-251",
    color: "from-yellow-500 to-gray-500",
    bgColor: "bg-gradient-to-br from-yellow-100 to-gray-100 dark:from-yellow-900 dark:to-gray-900",
    map: '/images/scraped/maps/JohtoMap.png',
    locations: [
      { name: "New Bark Town", type: "town", description: "The town where the winds of a new beginning blow" },
      { name: "Violet City", type: "city", description: "The city of nostalgic scents" },
      { name: "Goldenrod City", type: "city", description: "The festive city of opulent charm" },
      { name: "Ecruteak City", type: "city", description: "A historical city" },
      { name: "Blackthorn City", type: "city", description: "A quiet mountain retreat" }
    ],
    landmarks: [
      { name: "Sprout Tower", description: "A tower where monks train with Bellsprout" },
      { name: "Ruins of Alph", description: "Ancient ruins filled with Unown mysteries" },
      { name: "Bell Tower", description: "A tower where Ho-Oh once perched" },
      { name: "Whirl Islands", description: "Four islands that are home to Lugia" },
      { name: "Mt. Silver", description: "The highest mountain where Red awaits" }
    ],
    gymLeaders: [
      { name: "Falkner", city: "Violet City", type: "flying", badge: "Zephyr Badge" },
      { name: "Bugsy", city: "Azalea Town", type: "bug", badge: "Hive Badge" },
      { name: "Whitney", city: "Goldenrod City", type: "normal", badge: "Plain Badge" },
      { name: "Morty", city: "Ecruteak City", type: "ghost", badge: "Fog Badge" },
      { name: "Chuck", city: "Cianwood City", type: "fighting", badge: "Storm Badge" },
      { name: "Jasmine", city: "Olivine City", type: "steel", badge: "Mineral Badge" },
      { name: "Pryce", city: "Mahogany Town", type: "ice", badge: "Glacier Badge" },
      { name: "Clair", city: "Blackthorn City", type: "dragon", badge: "Rising Badge" }
    ],
    eliteFour: [
      { name: "Will", type: "psychic", signature: "Xatu" },
      { name: "Koga", type: "poison", signature: "Crobat" },
      { name: "Bruno", type: "fighting", signature: "Machamp" },
      { name: "Karen", type: "dark", signature: "Umbreon" }
    ],
    champion: { name: "Lance", team: "Dragon", signature: "Dragonite" },
    trivia: [
      "Johto is based on the Kansai region of Japan",
      "First region to introduce breeding and baby Pokémon",
      "Features two evil teams: Team Rocket's return",
      "Only region where you can earn 16 badges",
      "Home to the legendary Pokémon that represent the sun and moon"
    ]
  },
  hoenn: {
    id: "hoenn",
    name: "Hoenn",
    generation: 3,
    games: ["Ruby", "Sapphire", "Emerald", "Omega Ruby", "Alpha Sapphire"],
    description: "A tropical region with diverse ecosystems and weather phenomena.",
    professor: "Professor Birch",
    starters: ["Treecko", "Torchic", "Mudkip"],
    starterIds: [252, 255, 258],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Kyogre", "Groudon", "Rayquaza", "Regice", "Regirock", "Registeel", "Latias", "Latios"],
    legendaryIds: [382, 383, 384, 378, 377, 379, 380, 381],
    cities: 16,
    routes: 34,
    pokemonRange: "252-386",
    color: "from-emerald-500 to-blue-600",
    bgColor: "bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900",
    map: '/images/scraped/maps/Hoenn_ORAS.png',
    locations: [
      { name: "Littleroot Town", type: "town", description: "A town that can't be shaded any hue" },
      { name: "Rustboro City", type: "city", description: "The city probing the integration of nature and science" },
      { name: "Slateport City", type: "city", description: "The port where people and Pokémon cross paths" },
      { name: "Mauville City", type: "city", description: "The bright and shiny city of fun" },
      { name: "Sootopolis City", type: "city", description: "The mystical city where history slumbers" }
    ],
    landmarks: [
      { name: "Petalburg Woods", description: "A lush forest teeming with Bug Pokémon" },
      { name: "Mt. Chimney", description: "An active volcano and Team Magma/Aqua battleground" },
      { name: "Safari Zone", description: "A preserve for rare Pokémon" },
      { name: "Seafloor Cavern", description: "Where Kyogre or Groudon sleeps" },
      { name: "Sky Pillar", description: "An ancient tower where Rayquaza dwells" }
    ],
    gymLeaders: [
      { name: "Roxanne", city: "Rustboro City", type: "rock", badge: "Stone Badge" },
      { name: "Brawly", city: "Dewford Town", type: "fighting", badge: "Knuckle Badge" },
      { name: "Wattson", city: "Mauville City", type: "electric", badge: "Dynamo Badge" },
      { name: "Flannery", city: "Lavaridge Town", type: "fire", badge: "Heat Badge" },
      { name: "Norman", city: "Petalburg City", type: "normal", badge: "Balance Badge" },
      { name: "Winona", city: "Fortree City", type: "flying", badge: "Feather Badge" },
      { name: "Tate & Liza", city: "Mossdeep City", type: "psychic", badge: "Mind Badge" },
      { name: "Wallace", city: "Sootopolis City", type: "water", badge: "Rain Badge" }
    ],
    eliteFour: [
      { name: "Sidney", type: "dark", signature: "Absol" },
      { name: "Phoebe", type: "ghost", signature: "Dusclops" },
      { name: "Glacia", type: "ice", signature: "Walrein" },
      { name: "Drake", type: "dragon", signature: "Salamence" }
    ],
    champion: { name: "Steven", team: "Steel/Rock", signature: "Metagross" },
    trivia: [
      "Hoenn is based on the Kyushu region of Japan",
      "First region to feature double battles and abilities",
      "Has the most water routes of any region",
      "Features two villainous teams: Team Aqua and Team Magma",
      "Introduced weather-based legendary Pokémon"
    ]
  },
  sinnoh: {
    id: "sinnoh",
    name: "Sinnoh",
    generation: 4,
    games: ["Diamond", "Pearl", "Platinum", "Brilliant Diamond", "Shining Pearl"],
    description: "A region rich in mythology, featuring Mt. Coronet at its center.",
    professor: "Professor Rowan",
    starters: ["Turtwig", "Chimchar", "Piplup"],
    starterIds: [387, 390, 393],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Dialga", "Palkia", "Giratina", "Uxie", "Mesprit", "Azelf", "Cresselia", "Darkrai"],
    legendaryIds: [483, 484, 487, 480, 481, 482, 488, 491],
    cities: 14,
    routes: 30,
    pokemonRange: "387-493",
    color: "from-indigo-500 to-purple-600",
    bgColor: "bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900",
    map: '/images/scraped/maps/Sinnoh_BDSP_artwork.png',
    locations: [
      { name: "Twinleaf Town", type: "town", description: "Fresh and Free!" },
      { name: "Jubilife City", type: "city", description: "City of Joy" },
      { name: "Oreburgh City", type: "city", description: "City of Energy" },
      { name: "Eterna City", type: "city", description: "History Living" },
      { name: "Hearthome City", type: "city", description: "Warm & Kind" }
    ],
    landmarks: [
      { name: "Mt. Coronet", description: "The sacred mountain dividing Sinnoh" },
      { name: "Spear Pillar", description: "Where time and space converge" },
      { name: "Great Marsh", description: "Sinnoh's Safari Zone" },
      { name: "Distortion World", description: "Giratina's reversed dimension" },
      { name: "Fullmoon Island", description: "Where Cresselia resides" }
    ],
    gymLeaders: [
      { name: "Roark", city: "Oreburgh City", type: "rock", badge: "Coal Badge" },
      { name: "Gardenia", city: "Eterna City", type: "grass", badge: "Forest Badge" },
      { name: "Maylene", city: "Veilstone City", type: "fighting", badge: "Cobble Badge" },
      { name: "Crasher Wake", city: "Pastoria City", type: "water", badge: "Fen Badge" },
      { name: "Fantina", city: "Hearthome City", type: "ghost", badge: "Relic Badge" },
      { name: "Byron", city: "Canalave City", type: "steel", badge: "Mine Badge" },
      { name: "Candice", city: "Snowpoint City", type: "ice", badge: "Icicle Badge" },
      { name: "Volkner", city: "Sunyshore City", type: "electric", badge: "Beacon Badge" }
    ],
    eliteFour: [
      { name: "Aaron", type: "bug", signature: "Drapion" },
      { name: "Bertha", type: "ground", signature: "Hippowdon" },
      { name: "Flint", type: "fire", signature: "Infernape" },
      { name: "Lucian", type: "psychic", signature: "Bronzong" }
    ],
    champion: { name: "Cynthia", team: "Varied", signature: "Garchomp" },
    trivia: [
      "Sinnoh is based on the Hokkaido region of Japan",
      "Features the creation trio: Dialga, Palkia, and Giratina",
      "First region to have the Battle Frontier in the initial paired versions",
      "Home to many evolutions of previous generation Pokémon"
    ]
  },
  unova: {
    id: "unova",
    name: "Unova",
    generation: 5,
    games: ["Black", "White", "Black 2", "White 2"],
    description: "A diverse region inspired by New York, featuring only new Pokémon initially.",
    professor: "Professor Juniper",
    starters: ["Snivy", "Tepig", "Oshawott"],
    starterIds: [495, 498, 501],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Reshiram", "Zekrom", "Kyurem", "Cobalion", "Terrakion", "Virizion", "Tornadus", "Thundurus", "Landorus"],
    legendaryIds: [643, 644, 646, 638, 639, 640, 641, 642, 645],
    cities: 17,
    routes: 23,
    pokemonRange: "494-649",
    color: "from-gray-600 to-black",
    bgColor: "bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900",
    map: '/images/scraped/maps/Unova_B2W2_alt.png',
    locations: [
      { name: "Nuvema Town", type: "town", description: "A rural town whose sea breeze smells of flowers" },
      { name: "Castelia City", type: "city", description: "A big city with skyscrapers piercing the clouds" },
      { name: "Nimbasa City", type: "city", description: "A city of entertainment, with many theme parks" },
      { name: "Driftveil City", type: "city", description: "A port town distributing many goods" },
      { name: "Opelucid City", type: "city", description: "A city that respects history and values" }
    ],
    landmarks: [
      { name: "Skyarrow Bridge", description: "The longest bridge in Unova" },
      { name: "Desert Resort", description: "A vast desert with ancient ruins" },
      { name: "Dragonspiral Tower", description: "The oldest structure in Unova" },
      { name: "Giant Chasm", description: "Where Kyurem resides" },
      { name: "N's Castle", description: "Team Plasma's hidden fortress" }
    ],
    gymLeaders: [
      { name: "Cilan/Chili/Cress", city: "Striaton City", type: "grass/fire/water", badge: "Trio Badge" },
      { name: "Lenora", city: "Nacrene City", type: "normal", badge: "Basic Badge" },
      { name: "Burgh", city: "Castelia City", type: "bug", badge: "Insect Badge" },
      { name: "Elesa", city: "Nimbasa City", type: "electric", badge: "Bolt Badge" },
      { name: "Clay", city: "Driftveil City", type: "ground", badge: "Quake Badge" },
      { name: "Skyla", city: "Mistralton City", type: "flying", badge: "Jet Badge" },
      { name: "Brycen", city: "Icirrus City", type: "ice", badge: "Freeze Badge" },
      { name: "Drayden/Iris", city: "Opelucid City", type: "dragon", badge: "Legend Badge" }
    ],
    eliteFour: [
      { name: "Shauntal", type: "ghost", signature: "Chandelure" },
      { name: "Marshal", type: "fighting", signature: "Conkeldurr" },
      { name: "Grimsley", type: "dark", signature: "Bisharp" },
      { name: "Caitlin", type: "psychic", signature: "Gothitelle" }
    ],
    champion: { name: "Alder", team: "Varied", signature: "Volcarona" },
    trivia: [
      "Unova is based on New York City and surrounding areas",
      "First region to have sequels instead of a third version",
      "Features seasons that change monthly",
      "Only region where the first gym depends on your starter"
    ]
  },
  kalos: {
    id: "kalos",
    name: "Kalos",
    generation: 6,
    games: ["X", "Y"],
    description: "A beautiful region inspired by France, introducing Mega Evolution.",
    professor: "Professor Sycamore",
    starters: ["Chespin", "Fennekin", "Froakie"],
    starterIds: [650, 653, 656],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Xerneas", "Yveltal", "Zygarde"],
    legendaryIds: [716, 717, 718],
    cities: 16,
    routes: 22,
    pokemonRange: "650-721",
    color: "from-pink-500 to-purple-500",
    bgColor: "bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900",
    map: '/images/scraped/maps/Kalos_map.png',
    locations: [
      { name: "Vaniville Town", type: "town", description: "A town whose flower is about to bloom" },
      { name: "Lumiose City", type: "city", description: "The central hub of the Kalos region" },
      { name: "Cyllage City", type: "city", description: "A city of peaceful strolls" },
      { name: "Shalour City", type: "city", description: "A city of awakening" },
      { name: "Anistar City", type: "city", description: "The starry city marking the hours" }
    ],
    landmarks: [
      { name: "Prism Tower", description: "Lumiose City's iconic landmark" },
      { name: "Tower of Mastery", description: "Where Mega Evolution secrets are kept" },
      { name: "Parfum Palace", description: "A grand palace with beautiful gardens" },
      { name: "Pokémon Village", description: "A hidden village for abandoned Pokémon" },
      { name: "Victory Road", description: "The final test with castle-like ruins" }
    ],
    gymLeaders: [
      { name: "Viola", city: "Santalune City", type: "bug", badge: "Bug Badge" },
      { name: "Grant", city: "Cyllage City", type: "rock", badge: "Cliff Badge" },
      { name: "Korrina", city: "Shalour City", type: "fighting", badge: "Rumble Badge" },
      { name: "Ramos", city: "Coumarine City", type: "grass", badge: "Plant Badge" },
      { name: "Clemont", city: "Lumiose City", type: "electric", badge: "Voltage Badge" },
      { name: "Valerie", city: "Laverre City", type: "fairy", badge: "Fairy Badge" },
      { name: "Olympia", city: "Anistar City", type: "psychic", badge: "Psychic Badge" },
      { name: "Wulfric", city: "Snowbelle City", type: "ice", badge: "Iceberg Badge" }
    ],
    eliteFour: [
      { name: "Malva", type: "fire", signature: "Chandelure" },
      { name: "Siebold", type: "water", signature: "Barbaracle" },
      { name: "Wikstrom", type: "steel", signature: "Aegislash" },
      { name: "Drasna", type: "dragon", signature: "Noivern" }
    ],
    champion: { name: "Diantha", team: "Varied", signature: "Gardevoir" },
    trivia: [
      "Kalos is based on northern France",
      "First region to introduce Fairy type",
      "Features the smallest number of new Pokémon",
      "Introduced Mega Evolution and horde encounters"
    ]
  },
  alola: {
    id: "alola",
    name: "Alola",
    generation: 7,
    games: ["Sun", "Moon", "Ultra Sun", "Ultra Moon"],
    description: "A tropical paradise of four islands with unique Alolan forms.",
    professor: "Professor Kukui",
    starters: ["Rowlet", "Litten", "Popplio"],
    starterIds: [722, 725, 728],
    starterTypes: [["grass", "flying"], ["fire"], ["water"]],
    legendaries: ["Solgaleo", "Lunala", "Necrozma", "Tapu Koko", "Tapu Lele", "Tapu Bulu", "Tapu Fini"],
    legendaryIds: [791, 792, 800, 785, 786, 787, 788],
    cities: 10,
    routes: 17,
    pokemonRange: "722-809",
    color: "from-orange-500 to-teal-500",
    bgColor: "bg-gradient-to-br from-orange-100 to-teal-100 dark:from-orange-900 dark:to-teal-900",
    map: '/images/scraped/maps/Alola_USUM_artwork.png',
    locations: [
      { name: "Iki Town", type: "town", description: "A town where festivals are held" },
      { name: "Hau'oli City", type: "city", description: "The biggest city in Alola" },
      { name: "Konikoni City", type: "city", description: "A city of merchants" },
      { name: "Malie City", type: "city", description: "A city showing Eastern influence" },
      { name: "Seafolk Village", type: "village", description: "A floating village" }
    ],
    landmarks: [
      { name: "Melemele Island", description: "The first island of your journey" },
      { name: "Akala Island", description: "The island of the fire trial" },
      { name: "Ula'ula Island", description: "The largest island in Alola" },
      { name: "Poni Island", description: "The final island challenge" },
      { name: "Aether Paradise", description: "An artificial island for Pokémon conservation" }
    ],
    trialCaptains: [
      { name: "Ilima", trial: "Melemele Island", type: "normal", reward: "Normalium Z" },
      { name: "Lana", trial: "Akala Island", type: "water", reward: "Waterium Z" },
      { name: "Kiawe", trial: "Akala Island", type: "fire", reward: "Firium Z" },
      { name: "Mallow", trial: "Akala Island", type: "grass", reward: "Grassium Z" },
      { name: "Sophocles", trial: "Ula'ula Island", type: "electric", reward: "Electrium Z" },
      { name: "Acerola", trial: "Ula'ula Island", type: "ghost", reward: "Ghostium Z" },
      { name: "Mina", trial: "Poni Island", type: "fairy", reward: "Fairium Z" }
    ],
    islandKahunas: [
      { name: "Hala", island: "Melemele Island", type: "fighting", signature: "Hariyama" },
      { name: "Olivia", island: "Akala Island", type: "rock", signature: "Lycanroc" },
      { name: "Nanu", island: "Ula'ula Island", type: "dark", signature: "Persian" },
      { name: "Hapu", island: "Poni Island", type: "ground", signature: "Mudsdale" }
    ],
    champion: { name: "Professor Kukui", team: "Varied", signature: "Incineroar" },
    trivia: [
      "Alola is based on Hawaii",
      "First region without traditional gyms",
      "Features regional variants of classic Pokémon",
      "Introduced Z-Moves and Ultra Beasts"
    ]
  },
  galar: {
    id: "galar",
    name: "Galar",
    generation: 8,
    games: ["Sword", "Shield"],
    description: "An industrial region inspired by Great Britain, featuring Dynamax battles.",
    professor: "Professor Magnolia/Sonia",
    starters: ["Grookey", "Scorbunny", "Sobble"],
    starterIds: [810, 813, 816],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Zacian", "Zamazenta", "Eternatus"],
    legendaryIds: [888, 889, 890],
    cities: 13,
    routes: 10,
    pokemonRange: "810-898",
    color: "from-purple-600 to-red-600",
    bgColor: "bg-gradient-to-br from-purple-100 to-red-100 dark:from-purple-900 dark:to-red-900",
    map: '/images/scraped/maps/Galar_artwork.png',
    locations: [
      { name: "Postwick", type: "town", description: "A farming town in the Galar countryside" },
      { name: "Motostoke", type: "city", description: "A city of steam and engines" },
      { name: "Hammerlocke", type: "city", description: "A city with a thousand-year history" },
      { name: "Circhester", type: "city", description: "A historic city covered in snow" },
      { name: "Wyndon", type: "city", description: "The largest city in Galar" }
    ],
    landmarks: [
      { name: "Wild Area", description: "A vast expanse where wild Pokémon roam" },
      { name: "Glimwood Tangle", description: "A mysterious, glowing forest" },
      { name: "Crown Tundra", description: "A snowy wilderness full of legends" },
      { name: "Isle of Armor", description: "A training ground for aspiring champions" },
      { name: "Energy Plant", description: "Where Dynamax energy originates" }
    ],
    gymLeaders: [
      { name: "Milo", city: "Turffield", type: "grass", badge: "Grass Badge" },
      { name: "Nessa", city: "Hulbury", type: "water", badge: "Water Badge" },
      { name: "Kabu", city: "Motostoke", type: "fire", badge: "Fire Badge" },
      { name: "Bea/Allister", city: "Stow-on-Side", type: "fighting/ghost", badge: "Fighting/Ghost Badge" },
      { name: "Opal", city: "Ballonlea", type: "fairy", badge: "Fairy Badge" },
      { name: "Gordie/Melony", city: "Circhester", type: "rock/ice", badge: "Rock/Ice Badge" },
      { name: "Piers", city: "Spikemuth", type: "dark", badge: "Dark Badge" },
      { name: "Raihan", city: "Hammerlocke", type: "dragon", badge: "Dragon Badge" }
    ],
    eliteFour: [
      { name: "Gym Leaders", type: "Tournament", signature: "Various" }
    ],
    champion: { name: "Leon", team: "Varied", signature: "Charizard" },
    trivia: [
      "Galar is based on Great Britain",
      "Features Dynamax and Gigantamax forms",
      "First region with version-exclusive gym leaders",
      "Introduced the Wild Area for open exploration"
    ]
  },
  paldea: {
    id: "paldea",
    name: "Paldea",
    generation: 9,
    games: ["Scarlet", "Violet", "The Hidden Treasure of Area Zero"],
    description: "An open-world region inspired by Spain and Portugal.",
    professor: "Professor Sada/Turo",
    starters: ["Sprigatito", "Fuecoco", "Quaxly"],
    starterIds: [906, 909, 912],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Koraidon", "Miraidon", "Gimmighoul", "Gholdengo", "Walking Wake", "Iron Leaves"],
    legendaryIds: [1007, 1008, 999, 1000, 1009, 1010],
    cities: 10,
    routes: 15,
    pokemonRange: "906-1025",
    color: "from-red-500 to-purple-600",
    bgColor: "bg-gradient-to-br from-red-100 to-purple-100 dark:from-red-900 dark:to-purple-900",
    map: '/images/scraped/maps/Paldea_artwork.png',
    locations: [
      { name: "Cabo Poco", type: "town", description: "A small coastal town where your journey begins" },
      { name: "Mesagoza", type: "city", description: "The largest city and home to Naranja/Uva Academy" },
      { name: "Artazon", type: "town", description: "A town famous for its art and sunflower fields" },
      { name: "Levincia", type: "city", description: "A port city with neon lights and electric energy" },
      { name: "Cascarrafa", type: "city", description: "A desert oasis city with water features" },
      { name: "Medali", type: "town", description: "A peaceful town known for its restaurants" },
      { name: "Montenevera", type: "town", description: "A snowy mountain town with ghostly atmosphere" },
      { name: "Alfornada", type: "town", description: "A town in a basin surrounded by mountains" }
    ],
    landmarks: [
      { name: "Naranja/Uva Academy", description: "The prestigious school at the region's heart" },
      { name: "Great Crater of Paldea", description: "A mysterious crater with a hidden secret" },
      { name: "Area Zero", description: "The deepest part of the Great Crater" },
      { name: "Glaseado Mountain", description: "The highest peak in Paldea covered in snow" },
      { name: "Asado Desert", description: "A vast desert in western Paldea" },
      { name: "Kitakami", description: "A rural land of masks and festivals" },
      { name: "Blueberry Academy", description: "An elite academy in the Unova region" },
      { name: "Poco Path Lighthouse", description: "A guiding light for travelers" }
    ],
    gymLeaders: [
      { name: "Katy", city: "Cortondo", type: "bug", badge: "Bug Badge" },
      { name: "Brassius", city: "Artazon", type: "grass", badge: "Grass Badge" },
      { name: "Iono", city: "Levincia", type: "electric", badge: "Electric Badge" },
      { name: "Kofu", city: "Cascarrafa", type: "water", badge: "Water Badge" },
      { name: "Larry", city: "Medali", type: "normal", badge: "Normal Badge" },
      { name: "Ryme", city: "Montenevera", type: "ghost", badge: "Ghost Badge" },
      { name: "Tulip", city: "Alfornada", type: "psychic", badge: "Psychic Badge" },
      { name: "Grusha", city: "Glaseado", type: "ice", badge: "Ice Badge" }
    ],
    eliteFour: [
      { name: "Rika", type: "ground", signature: "Clodsire" },
      { name: "Poppy", type: "steel", signature: "Tinkaton" },
      { name: "Larry", type: "flying", signature: "Flamigo" },
      { name: "Hassel", type: "dragon", signature: "Baxcalibur" }
    ],
    champion: { name: "Geeta", team: "Varied", signature: "Glimmora" },
    trivia: [
      "Paldea is based on the Iberian Peninsula",
      "First fully open-world main series game",
      "Features three separate storylines",
      "Introduced Terastallization mechanic"
    ]
  }
};

export default function RegionDetailPage() {
  const router = useRouter();
  const { region: regionId } = router.query;
  const { theme } = useTheme();
  
  // Handle page transition zoom effect
  useEffect(() => {
    // Clean up the zoom transition class when the page loads
    const timer = setTimeout(() => {
      document.body.classList.remove('region-zoom-transition');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle loading state
  if (!regionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  const region = regionsData[regionId as string];
  const currentRegionIndex = regionOrder.indexOf(regionId as string);

  if (!region) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Region Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The region "{regionId}" does not exist.
          </p>
          <StyledBackButton 
            text="Back to Regions" 
            onClick={() => router.push('/pokemon/regions')} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg page-zoom-enter">
      <Head>
        <title>{region.name} Region | Pokémon | DexTrends</title>
        <meta name="description" content={region.description} />
      </Head>


      {/* Navigation */}
      <div className="fixed top-4 left-4 right-4 z-40 flex justify-between items-center">
        <StyledBackButton 
          text="Back to Regions" 
          onClick={() => router.push('/pokemon/regions')} 
          className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 hover:bg-white/90 dark:hover:bg-gray-900/90 transition-all duration-300 hover:scale-105 hover:shadow-xl"
        />
        
        {/* Region Navigation Arrows */}
        <div className="flex items-center gap-4">
          {regionOrder[currentRegionIndex - 1] && (
            <div className="relative group">
              <button
                onClick={() => router.push(`/pokemon/regions/${regionOrder[currentRegionIndex - 1]}`)}
                className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                aria-label="Previous region"
              >
                <BsChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
              {/* Hover Tooltip */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl">
                  {regionsData[regionOrder[currentRegionIndex - 1]]?.name || regionOrder[currentRegionIndex - 1]}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
                </div>
              </div>
            </div>
          )}
          
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-full px-6 py-3 shadow-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Region {currentRegionIndex + 1} of {regionOrder.length}</span>
          </div>
          
          {regionOrder[currentRegionIndex + 1] && (
            <div className="relative group">
              <button
                onClick={() => router.push(`/pokemon/regions/${regionOrder[currentRegionIndex + 1]}`)}
                className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                aria-label="Next region"
              >
                <BsChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
              {/* Hover Tooltip */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl">
                  {regionsData[regionOrder[currentRegionIndex + 1]]?.name || regionOrder[currentRegionIndex + 1]}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Hero Section with Parallax */}
      <RegionHero region={region} theme={theme} />

      {/* Sticky Section Navigation */}
      <div className="sticky top-16 z-30 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 shadow-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-1 sm:space-x-2 py-3 overflow-x-auto scrollbar-hide">
            <button onClick={() => document.getElementById('region-info')?.scrollIntoView({ behavior: 'smooth' })} 
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Overview
            </button>
            <button onClick={() => document.getElementById('professor')?.scrollIntoView({ behavior: 'smooth' })} 
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Professor
            </button>
            <button onClick={() => document.getElementById('starters')?.scrollIntoView({ behavior: 'smooth' })} 
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Starters
            </button>
            <button onClick={() => document.getElementById('special-pokemon')?.scrollIntoView({ behavior: 'smooth' })} 
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Special Pokémon
            </button>
            <button onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })} 
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              {region.gymLeaders ? 'Gym Leaders' : region.trialCaptains ? 'Island Challenge' : 'Leaders'}
            </button>
            <button onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })} 
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Locations
            </button>
            <button onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })} 
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Games
            </button>
            <button onClick={() => document.getElementById('evil-teams')?.scrollIntoView({ behavior: 'smooth' })} 
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Villains
            </button>
            {region.trivia && (
              <button onClick={() => document.getElementById('trivia')?.scrollIntoView({ behavior: 'smooth' })} 
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Trivia
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Container with Consistent Spacing */}
      <div className="relative z-10">
        {/* Region Info Section - Clean Overview */}
        <section id="region-info" className="relative">
          <RegionInfo region={{
            ...region,
            gymLeaders: region.gymLeaders?.map(leader => ({
              ...leader,
              type: [leader.type],
              location: leader.city
            })),
            trialCaptains: region.trialCaptains?.map(captain => ({
              name: captain.name,
              type: [captain.type],
              location: captain.trial
            })),
            islandKahunas: region.islandKahunas?.map(kahuna => ({
              name: kahuna.name,
              type: [kahuna.type],
              location: kahuna.island
            })),
            legendaries: region.legendaryIds?.map((id, index) => ({
              id,
              name: region.legendaries[index] || `Legendary ${id}`
            })) || []
          }} theme={theme} />
        </section>

        {/* Professor Section - New Enhanced */}
        <section id="professor" className="py-16 px-4">
          <StandardGlassContainer className="max-w-7xl mx-auto">
            <ProfessorShowcase region={region} professor={region.professor} theme={theme} />
          </StandardGlassContainer>
        </section>

        {/* Starter Pokémon Section - Well Organized */}
        <section id="starters" className="py-16 px-4">
          <StandardGlassContainer className="max-w-7xl mx-auto">
            <StarterPokemonShowcase region={region.name} starters={region.starters} theme={theme} />
          </StandardGlassContainer>
        </section>

        {/* Special Pokémon Section (Variants & Legendaries) */}
        <section id="special-pokemon" className="py-16 px-4">
          <StandardGlassContainer className="max-w-7xl mx-auto">
            <SpecialPokemonShowcase region={region} theme={theme} />
          </StandardGlassContainer>
        </section>

        {/* Journey Section - Gym Leaders & Elite Four */}
        <section id="journey" className="py-16 px-4">
          <StandardGlassContainer className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Your Journey in {region.name}</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {region.trialCaptains 
                  ? 'Complete trials and face Island Kahunas to become Champion'
                  : 'Challenge the strongest trainers on your path to becoming Champion'
                }
              </p>
            </div>
            
            {/* Gym Leaders / Trial Captains */}
            <div className="mb-16">
              {region.gymLeaders ? (
                <GymLeaderCarousel 
                  region={region} 
                  gymLeaders={region.gymLeaders} 
                  theme={theme} 
                />
              ) : region.trialCaptains ? (
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Trial Captains</h3>
                  <p className="text-gray-600">This region features Trial Captains instead of Gym Leaders.</p>
                </div>
              ) : null}
            </div>
            
            {/* Elite Four & Champion / Island Kahunas */}
            <div>
              {region.eliteFour ? (
                <EliteFourGallery 
                  region={region} 
                  eliteFour={region.eliteFour} 
                  champion={region.champion || null} 
                  theme={theme} 
                />
              ) : region.islandKahunas ? (
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Island Kahunas</h3>
                  <p className="text-gray-600">This region features Island Kahunas instead of the Elite Four.</p>
                </div>
              ) : null}
            </div>
          </StandardGlassContainer>
        </section>

        {/* Explore Section - Locations & Landmarks */}
        <section id="explore" className="py-16 px-4">
          <StandardGlassContainer className="max-w-7xl mx-auto">
            <FadeIn>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Explore {region.name}</h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Discover the diverse cities, towns, and landmarks
                </p>
              </div>
            </FadeIn>

            {/* Two Column Layout for Better Organization */}
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Cities & Towns Column */}
              {region.locations && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <BsGeoAlt className="text-3xl" />
                    Cities & Towns
                  </h3>
                  <div className="space-y-4">
                    {region.locations.map((location, index) => (
                      <CardHover key={index}>
                        <div className={`card hover:hover-lift ${
                          theme === 'dark' ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
                        } shadow-md hover:shadow-xl transition-all duration-300 border ${
                          theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
                        } hover:border-gray-400/30 dark:hover:border-gray-600/30`}>
                          <div className="flex items-start gap-4">
                            <div className={`p-2.5 rounded-lg bg-gradient-to-br ${region.color} text-white flex-shrink-0 shadow-lg`}>
                              {location.type === 'city' ? <GiModernCity size={20} /> : 
                               location.type === 'island' ? <GiIsland size={20} /> :
                               <BsGeoAlt size={20} />}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-base mb-1 text-gray-900 dark:text-white">{location.name}</h4>
                              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                {location.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardHover>
                    ))}
                  </div>
                </div>
              )}

              {/* Landmarks Column */}
              {region.landmarks && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <BsCompass className="text-3xl" />
                    Notable Landmarks
                  </h3>
                  <div className="space-y-4">
                    {region.landmarks.map((landmark, index) => (
                      <SlideUp key={index} delay={index * 0.05}>
                        <div className={`card hover:hover-lift ${
                          theme === 'dark' ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
                        } shadow-md hover:shadow-xl transition-all duration-300 border-l-4 ${
                          index % 3 === 0 ? 'border-l-red-500' :
                          index % 3 === 1 ? 'border-l-blue-500' :
                          'border-l-green-500'
                        } hover:border-gray-400/30 dark:hover:border-gray-600/30`}>
                          <h4 className="font-bold text-base mb-1 text-gray-900 dark:text-white">{landmark.name}</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            {landmark.description}
                          </p>
                        </div>
                      </SlideUp>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </StandardGlassContainer>
        </section>

        {/* Games Section */}
        <section id="games" className="py-16 px-4">
          <StandardGlassContainer className="max-w-7xl mx-auto">
            <GameShowcase region={region} theme={theme} />
          </StandardGlassContainer>
        </section>

        {/* Evil Teams Section */}
        <section id="evil-teams" className="py-16 px-4">
          <StandardGlassContainer className="max-w-7xl mx-auto">
            <EvilTeamShowcase region={region} theme={theme} />
          </StandardGlassContainer>
        </section>


        {/* Trivia Section - More Compact */}
        {region.trivia && (
          <section id="trivia" className="py-16 px-4">
            <StandardGlassContainer className="max-w-7xl mx-auto">
              <FadeIn>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Did You Know?</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Interesting facts about {region.name}
                  </p>
                </div>
              </FadeIn>
              
              <StaggeredChildren className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                {region.trivia.map((fact, index) => (
                  <CardHover key={index}>
                    <div className={`card hover:hover-lift ${
                      theme === 'dark' ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
                    } shadow-md hover:shadow-xl transition-all duration-300 border ${
                      theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
                    } hover:border-gray-400/30 dark:hover:border-gray-600/30`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${region.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{fact}</p>
                      </div>
                    </div>
                  </CardHover>
                ))}
              </StaggeredChildren>
            </StandardGlassContainer>
          </section>
        )}
      </div>
      
      <style jsx global>{`
        /* Page entrance zoom effect */
        .page-zoom-enter {
          animation: pageZoomIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        @keyframes pageZoomIn {
          from {
            opacity: 0.8;
            transform: scale(1.1);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* Clean up transition effect */
        .region-zoom-transition {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}