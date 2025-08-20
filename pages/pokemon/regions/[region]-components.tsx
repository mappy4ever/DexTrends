import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { FadeIn, SlideUp, CardHover } from "../../../components/ui/animations";
import { useTheme } from "../../../context/UnifiedAppContext";
import { FullBleedWrapper } from "../../../components/ui/FullBleedWrapper";
import StyledBackButton from "../../../components/ui/StyledBackButton";

// Region Components
import RegionHero from "../../../components/regions/RegionHero";
import RegionInfo from "../../../components/regions/RegionInfo";
import GymLeaderCarousel from "../../../components/regions/GymLeaderCarousel";
import EliteFourGallery from "../../../components/regions/EliteFourGallery";
import StarterShowcase from "../../../components/regions/StarterShowcase";
import GameShowcase from "../../../components/regions/GameShowcase";
import BadgeCollection from "../../../components/regions/BadgeCollection";

import { BsMap, BsGeoAlt, BsCompass } from "react-icons/bs";
import { GiModernCity } from "react-icons/gi";

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

interface ComponentsGymLeader {
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
  island: string;
  type: string;
  totem: string;
}

interface Kahuna {
  name: string;
  island: string;
  type: string;
}

interface Region {
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
  routes: number | string;
  pokemonRange: string;
  color: string;
  bgColor: string;
  locations: Location[];
  landmarks: Landmark[];
  gymLeaders?: ComponentsGymLeader[];
  eliteFour?: EliteFourMember[] | null;
  champion?: Champion;
  trialCaptains?: TrialCaptain[];
  kahunas?: Kahuna[];
  trivia: string[];
}

// Comprehensive region data with additional details
const regionsData: Record<string, Region> = {
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
    locations: [
      { name: "Pallet Town", type: "town", description: "Your journey begins here" },
      { name: "Viridian City", type: "city", description: "The eternally green paradise" },
      { name: "Pewter City", type: "city", description: "A stone gray city" },
      { name: "Cerulean City", type: "city", description: "A mysterious blue aura surrounds it" },
      { name: "Vermilion City", type: "city", description: "The port of exquisite sunsets" },
      { name: "Lavender Town", type: "town", description: "The noble purple town" },
      { name: "Celadon City", type: "city", description: "The city of rainbow dreams" },
      { name: "Fuchsia City", type: "city", description: "Behold! It's passion pink!" },
      { name: "Saffron City", type: "city", description: "Shining, golden land of commerce" },
      { name: "Cinnabar Island", type: "island", description: "The fiery town of burning desire" }
    ],
    landmarks: [
      { name: "Mt. Moon", description: "A mystical mountain known for Clefairy" },
      { name: "Rock Tunnel", description: "A pitch-black tunnel requiring Flash" },
      { name: "Power Plant", description: "Home to Electric-type Pokémon and Zapdos" },
      { name: "Seafoam Islands", description: "Twin islands home to Articuno" },
      { name: "Victory Road", description: "The final test before the Pokémon League" },
      { name: "Cerulean Cave", description: "Where the genetic Pokémon Mewtwo awaits" }
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
    color: "from-yellow-500 to-silver-500",
    bgColor: "bg-gradient-to-br from-yellow-100 to-gray-100 dark:from-yellow-900 dark:to-gray-900",
    locations: [
      { name: "New Bark Town", type: "town", description: "The town where the winds of a new beginning blow" },
      { name: "Cherrygrove City", type: "city", description: "The city of cute, fragrant flowers" },
      { name: "Violet City", type: "city", description: "The city of nostalgic scents" },
      { name: "Azalea Town", type: "town", description: "Where people and Pokémon live in happy harmony" },
      { name: "Goldenrod City", type: "city", description: "The festive city of opulent charm" },
      { name: "Ecruteak City", type: "city", description: "A historical city" },
      { name: "Olivine City", type: "city", description: "The port with the sea breeze" },
      { name: "Cianwood City", type: "city", description: "A port surrounded by rough seas" },
      { name: "Mahogany Town", type: "town", description: "Welcome to the home of the ninja" },
      { name: "Blackthorn City", type: "city", description: "A quiet mountain retreat" }
    ],
    landmarks: [
      { name: "Sprout Tower", description: "A tower where monks train with Bellsprout" },
      { name: "Ruins of Alph", description: "Ancient ruins filled with Unown mysteries" },
      { name: "Ilex Forest", description: "A dense forest where Celebi is said to appear" },
      { name: "Burned Tower", description: "A tower burned by lightning 150 years ago" },
      { name: "Bell Tower", description: "A tower where Ho-Oh once perched" },
      { name: "Whirl Islands", description: "Four islands that are home to Lugia" },
      { name: "Mt. Silver", description: "The highest mountain where Red awaits" },
      { name: "Lake of Rage", description: "A lake where the red Gyarados appeared" }
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
    locations: [
      { name: "Littleroot Town", type: "town", description: "A town that can't be shaded any hue" },
      { name: "Oldale Town", type: "town", description: "Where things start off scarce" },
      { name: "Petalburg City", type: "city", description: "Where people mingle with nature" },
      { name: "Rustboro City", type: "city", description: "The city probing the integration of nature and science" },
      { name: "Dewford Town", type: "town", description: "A tiny island in the blue sea" },
      { name: "Slateport City", type: "city", description: "The port where people and Pokémon cross paths" },
      { name: "Mauville City", type: "city", description: "The bright and shiny city of fun" },
      { name: "Verdanturf Town", type: "town", description: "The windswept highlands with the sweet fragrance of grass" },
      { name: "Fallarbor Town", type: "town", description: "A farm community with small gardens" },
      { name: "Lavaridge Town", type: "town", description: "An excellent place for relaxing" },
      { name: "Fortree City", type: "city", description: "The treetop city that frolics with nature" },
      { name: "Lilycove City", type: "city", description: "Where the land ends and the sea begins" },
      { name: "Mossdeep City", type: "city", description: "Our slogan: Cherish Pokémon!" },
      { name: "Sootopolis City", type: "city", description: "The mystical city where history slumbers" },
      { name: "Pacifidlog Town", type: "town", description: "Where the morning sun smiles upon the waters" },
      { name: "Ever Grande City", type: "city", description: "The paradise of flowers, the sea, and Pokémon" }
    ],
    landmarks: [
      { name: "Petalburg Woods", description: "A lush forest teeming with Bug Pokémon" },
      { name: "Granite Cave", description: "A cave where Steven searches for rare stones" },
      { name: "Mt. Chimney", description: "An active volcano and Team Magma/Aqua battleground" },
      { name: "Safari Zone", description: "A preserve for rare Pokémon" },
      { name: "Mt. Pyre", description: "A sacred mountain where Pokémon are laid to rest" },
      { name: "Seafloor Cavern", description: "Where Kyogre or Groudon sleeps" },
      { name: "Sky Pillar", description: "An ancient tower where Rayquaza dwells" },
      { name: "Battle Frontier", description: "The ultimate challenge for trainers (Emerald)" }
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
    locations: [
      { name: "Twinleaf Town", type: "town", description: "Fresh and Free!" },
      { name: "Sandgem Town", type: "town", description: "Town of Sand!" },
      { name: "Jubilife City", type: "city", description: "City of Joy!" },
      { name: "Oreburgh City", type: "city", description: "City of Energy!" },
      { name: "Floaroma Town", type: "town", description: "Vivid and Scented!" },
      { name: "Eterna City", type: "city", description: "History Living!" },
      { name: "Hearthome City", type: "city", description: "Warm & Kind!" },
      { name: "Solaceon Town", type: "town", description: "Free of Worry!" },
      { name: "Veilstone City", type: "city", description: "Hewn from Rock!" },
      { name: "Pastoria City", type: "city", description: "Vista of Marsh!" },
      { name: "Celestic Town", type: "town", description: "Living Happily!" },
      { name: "Canalave City", type: "city", description: "Cargo Port!" },
      { name: "Snowpoint City", type: "city", description: "City of Snow!" },
      { name: "Sunyshore City", type: "city", description: "Solar Powered!" }
    ],
    landmarks: [
      { name: "Mt. Coronet", description: "The sacred mountain dividing Sinnoh" },
      { name: "Great Marsh", description: "Sinnoh's Safari Zone in Pastoria" },
      { name: "Iron Island", description: "An abandoned mine where Riley trains" },
      { name: "Lake Verity", description: "Home to the legendary Mesprit" },
      { name: "Lake Valor", description: "Home to the legendary Azelf" },
      { name: "Lake Acuity", description: "Home to the legendary Uxie" },
      { name: "Spear Pillar", description: "Where time and space converge" },
      { name: "Distortion World", description: "Giratina's reverse dimension (Platinum)" },
      { name: "Battle Zone", description: "Post-game island with Battle Frontier" }
    ],
    gymLeaders: [
      { name: "Roark", city: "Oreburgh City", type: "rock", badge: "Coal Badge" },
      { name: "Gardenia", city: "Eterna City", type: "grass", badge: "Forest Badge" },
      { name: "Fantina", city: "Hearthome City", type: "ghost", badge: "Relic Badge" },
      { name: "Maylene", city: "Veilstone City", type: "fighting", badge: "Cobble Badge" },
      { name: "Crasher Wake", city: "Pastoria City", type: "water", badge: "Fen Badge" },
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
      "Features the creation mythology of the Pokémon universe",
      "First region to have Gym Leader rematches",
      "Mt. Coronet divides the region into east and west",
      "Team Galactic seeks to recreate the universe"
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
    locations: [
      { name: "Nuvema Town", type: "town", description: "The Start of Something Big!" },
      { name: "Accumula Town", type: "town", description: "The Fast-Growing Town" },
      { name: "Striaton City", type: "city", description: "Three Stand Together" },
      { name: "Nacrene City", type: "city", description: "A Pearl of a Place" },
      { name: "Castelia City", type: "city", description: "A City of Grandeur" },
      { name: "Nimbasa City", type: "city", description: "Battle Against Elesa, the Shining Beauty" },
      { name: "Driftveil City", type: "city", description: "A City of Billowing Sails" },
      { name: "Mistralton City", type: "city", description: "Striving for the Sky" },
      { name: "Icirrus City", type: "city", description: "Sky Fluttering with Flowers of Snow" },
      { name: "Opelucid City", type: "city", description: "Know the Past, Seek the Future" },
      { name: "Lacunosa Town", type: "town", description: "The Town Known for its Strange Custom" },
      { name: "Undella Town", type: "town", description: "A Summer Resort" },
      { name: "Black City/White Forest", type: "city", description: "A modern city/natural forest" },
      { name: "Anville Town", type: "town", description: "The Town of a Lost Past" },
      { name: "Aspertia City", type: "city", description: "A City That Reaches for the Sky" },
      { name: "Virbank City", type: "city", description: "City of Falling Fog and Rising Stars" },
      { name: "Humilau City", type: "city", description: "A City of Rippling Waves" }
    ],
    landmarks: [
      { name: "Skyarrow Bridge", description: "The massive bridge connecting to Castelia" },
      { name: "Desert Resort", description: "A vast desert with ancient ruins" },
      { name: "Chargestone Cave", description: "A cave with floating magnetic stones" },
      { name: "Twist Mountain", description: "A mountain that changes with seasons" },
      { name: "Dragonspiral Tower", description: "Where the legendary dragons once rested" },
      { name: "Giant Chasm", description: "A massive crater where Kyurem dwells" },
      { name: "Victory Road", description: "Multiple paths through ancient ruins" },
      { name: "N's Castle", description: "The fortress of Team Plasma's king" }
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
    champion: { name: "Alder/Iris", team: "Varied", signature: "Volcarona/Haxorus" },
    trivia: [
      "Unova is based on New York City and surrounding areas",
      "First region based on a real-world location outside Japan",
      "Black/White featured only new Pokémon until post-game",
      "Has the most Gym Leaders (10 different ones across games)",
      "Features seasonal changes that affect gameplay"
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
    locations: [
      { name: "Vaniville Town", type: "town", description: "A town whose flower is about to bloom" },
      { name: "Aquacorde Town", type: "town", description: "A town that naturally makes a living" },
      { name: "Santalune City", type: "city", description: "A traditional city" },
      { name: "Lumiose City", type: "city", description: "The central city of art and artifice" },
      { name: "Camphrier Town", type: "town", description: "A town of lingering dreams" },
      { name: "Cyllage City", type: "city", description: "The city of peaceful strolls" },
      { name: "Ambrette Town", type: "town", description: "The town chosen by the coast" },
      { name: "Geosenge Town", type: "town", description: "The town of hidden stones" },
      { name: "Shalour City", type: "city", description: "A city of awakening" },
      { name: "Coumarine City", type: "city", description: "The seaside city of calm waves" },
      { name: "Laverre City", type: "city", description: "The city of otherworldly dreams" },
      { name: "Dendemille Town", type: "town", description: "A rural town where Pokémon and windmills work together" },
      { name: "Anistar City", type: "city", description: "The starry city marking the hours" },
      { name: "Couriway Town", type: "town", description: "The town connecting differences" },
      { name: "Snowbelle City", type: "city", description: "The city of everlasting winter" },
      { name: "Kiloude City", type: "city", description: "The city where you arrive after a long journey" }
    ],
    landmarks: [
      { name: "Santalune Forest", description: "A vibrant forest reminiscent of Viridian Forest" },
      { name: "Parfum Palace", description: "A grand palace with beautiful gardens" },
      { name: "Reflection Cave", description: "A cave filled with mirror-like crystals" },
      { name: "Tower of Mastery", description: "Where Mega Evolution's secrets are kept" },
      { name: "Azure Bay", description: "A beautiful bay with Sea Spirit's Den" },
      { name: "Kalos Power Plant", description: "The source of Kalos's electricity" },
      { name: "Pokémon Village", description: "A hidden village for abandoned Pokémon" },
      { name: "Victory Road", description: "The challenging path to the Pokémon League" }
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
      { name: "Malva", type: "fire", signature: "Talonflame" },
      { name: "Siebold", type: "water", signature: "Barbaracle" },
      { name: "Wikstrom", type: "steel", signature: "Aegislash" },
      { name: "Drasna", type: "dragon", signature: "Noivern" }
    ],
    champion: { name: "Diantha", team: "Varied", signature: "Gardevoir" },
    trivia: [
      "Kalos is based on northern France",
      "First region to feature 3D graphics in the main series",
      "Introduced Mega Evolution and Fairy type",
      "Has the largest regional Pokédex (457 Pokémon)",
      "Lumiose City is based on Paris"
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
    locations: [
      { name: "Iki Town", type: "town", description: "A town where all journeys begin" },
      { name: "Hau'oli City", type: "city", description: "The biggest city in Alola" },
      { name: "Heahea City", type: "city", description: "A city by the beach" },
      { name: "Paniola Town", type: "town", description: "A town of ranches" },
      { name: "Konikoni City", type: "city", description: "A city of merchants" },
      { name: "Malie City", type: "city", description: "A city with an Eastern influence" },
      { name: "Tapu Village", type: "village", description: "A village at the foot of Mount Lanakila" },
      { name: "Po Town", type: "town", description: "A town taken over by Team Skull" },
      { name: "Seafolk Village", type: "village", description: "A floating village" },
      { name: "Iki Town", type: "town", description: "Where the kahuna lives" }
    ],
    landmarks: [
      { name: "Melemele Island", description: "The first island, home to the trainer school" },
      { name: "Akala Island", description: "The second island with volcanic activity" },
      { name: "Ula'ula Island", description: "The third and largest island" },
      { name: "Poni Island", description: "The fourth island with ancient ruins" },
      { name: "Aether Paradise", description: "An artificial island for Pokémon conservation" },
      { name: "Ultra Space", description: "Dimensions where Ultra Beasts live" },
      { name: "Mount Lanakila", description: "Alola's highest mountain" },
      { name: "Altar of the Sunne/Moone", description: "Where legendary Pokémon are summoned" }
    ],
    trialCaptains: [
      { name: "Ilima", island: "Melemele", type: "normal", totem: "Gumshoos/Raticate" },
      { name: "Lana", island: "Akala", type: "water", totem: "Wishiwashi" },
      { name: "Kiawe", island: "Akala", type: "fire", totem: "Salazzle" },
      { name: "Mallow", island: "Akala", type: "grass", totem: "Lurantis" },
      { name: "Sophocles", island: "Ula'ula", type: "electric", totem: "Vikavolt" },
      { name: "Acerola", island: "Ula'ula", type: "ghost", totem: "Mimikyu" },
      { name: "Mina", island: "Poni", type: "fairy", totem: "Ribombee" }
    ],
    kahunas: [
      { name: "Hala", island: "Melemele", type: "fighting" },
      { name: "Olivia", island: "Akala", type: "rock" },
      { name: "Nanu", island: "Ula'ula", type: "dark" },
      { name: "Hapu", island: "Poni", type: "ground" }
    ],
    eliteFour: [
      { name: "Molayne", type: "steel", signature: "Alolan Dugtrio" },
      { name: "Olivia", type: "rock", signature: "Lycanroc" },
      { name: "Acerola", type: "ghost", signature: "Palossand" },
      { name: "Kahili", type: "flying", signature: "Toucannon" }
    ],
    champion: { name: "Kukui/Hau", team: "Varied", signature: "Incineroar/Raichu" },
    trivia: [
      "Alola is based on Hawaii",
      "First region without traditional Gym battles",
      "Introduced regional variants (Alolan forms)",
      "Features Island Trials instead of Gyms",
      "Has the Ultra Beast phenomenon"
    ]
  },
  galar: {
    id: "galar",
    name: "Galar",
    generation: 8,
    games: ["Sword", "Shield"],
    description: "An industrial region inspired by Great Britain, featuring Dynamax battles.",
    professor: "Professor Magnolia",
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
    locations: [
      { name: "Postwick", type: "town", description: "A farming town in the southern part of Galar" },
      { name: "Wedgehurst", type: "town", description: "A town where Pokémon research is conducted" },
      { name: "Motostoke", type: "city", description: "A city of steam and industry" },
      { name: "Turffield", type: "town", description: "A town surrounded by farmland" },
      { name: "Hulbury", type: "town", description: "A port town with a lighthouse" },
      { name: "Hammerlocke", type: "city", description: "A city with a medieval castle" },
      { name: "Stow-on-Side", type: "town", description: "A town with ancient history" },
      { name: "Ballonlea", type: "town", description: "A mystical town in the forest" },
      { name: "Circhester", type: "city", description: "A historic city covered in snow" },
      { name: "Spikemuth", type: "town", description: "A gloomy town full of music" },
      { name: "Wyndon", type: "city", description: "The largest city in Galar" }
    ],
    landmarks: [
      { name: "Wild Area", description: "A vast expanse where wild Pokémon roam freely" },
      { name: "Galar Mine", description: "A mine rich with gems and Pokémon" },
      { name: "Glimwood Tangle", description: "A mysterious, glowing forest" },
      { name: "Route 10", description: "A snowy route near Wyndon" },
      { name: "Lake of Outrage", description: "Where powerful Pokémon gather" },
      { name: "Energy Plant", description: "Where Eternatus was kept" },
      { name: "Slumbering Weald", description: "A foggy forest of legend" },
      { name: "Crown Tundra", description: "A frozen wilderness (DLC)" },
      { name: "Isle of Armor", description: "A martial arts island (DLC)" }
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
    eliteFour: null,
    champion: { name: "Leon", team: "Varied", signature: "Charizard" },
    trivia: [
      "Galar is based on Great Britain",
      "First region with version-exclusive Gym Leaders",
      "Introduced Dynamax and Gigantamax phenomena",
      "Features the Wild Area, an open-world section",
      "Has stadiums for Gym battles with audiences"
    ]
  },
  paldea: {
    id: "paldea",
    name: "Paldea",
    generation: 9,
    games: ["Scarlet", "Violet"],
    description: "An open-world region inspired by Spain and Portugal.",
    professor: "Professor Sada/Turo",
    starters: ["Sprigatito", "Fuecoco", "Quaxly"],
    starterIds: [906, 909, 912],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Koraidon", "Miraidon"],
    legendaryIds: [1007, 1008],
    cities: 8,
    routes: "Open World",
    pokemonRange: "906-1025",
    color: "from-scarlet-500 to-violet-600",
    bgColor: "bg-gradient-to-br from-red-100 to-violet-100 dark:from-red-900 dark:to-violet-900",
    locations: [
      { name: "Cabo Poco", type: "town", description: "A small coastal town" },
      { name: "Los Platos", type: "town", description: "Your home town" },
      { name: "Mesagoza", type: "city", description: "The central city with the academy" },
      { name: "Cortondo", type: "town", description: "A town known for its bakery" },
      { name: "Artazon", type: "town", description: "A town of art and flowers" },
      { name: "Levincia", type: "city", description: "A port city of neon lights" },
      { name: "Cascarrafa", type: "city", description: "A city built around water" },
      { name: "Medali", type: "town", description: "A town for food lovers" },
      { name: "Alfornada", type: "town", description: "A town in a cavern" },
      { name: "Porto Marinada", type: "town", description: "A market town by the sea" }
    ],
    landmarks: [
      { name: "Area Zero", description: "The Great Crater of Paldea" },
      { name: "Asado Desert", description: "A vast desert region" },
      { name: "Casseroya Lake", description: "The largest lake in Paldea" },
      { name: "Glaseado Mountain", description: "The highest peak in Paldea" },
      { name: "North Province", description: "A mountainous northern region" },
      { name: "East Province", description: "Coastal eastern areas" },
      { name: "South Province", description: "The starting southern areas" },
      { name: "West Province", description: "Western wilderness" }
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
      "First fully open-world mainline Pokémon game",
      "Features three separate storylines",
      "Introduced Terastallization phenomenon",
      "Has a school-based adventure theme"
    ]
  }
};

const RegionDetailPage: NextPage = () => {
  const router = useRouter();
  const { region: regionId } = router.query;
  const { theme } = useTheme();
  const [scrollProgress, setScrollProgress] = useState(0);

  const region = regionId && typeof regionId === 'string' ? regionsData[regionId] : null;

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <FullBleedWrapper gradient="regions">
      <Head>
        <title>{region.name} Region | Pokémon | DexTrends</title>
        <meta name="description" content={region.description} />
      </Head>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-50">
        <div 
          className={`h-full bg-gradient-to-r ${region.color} transition-all duration-200`}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Back Button - Fixed */}
      <div className="fixed top-4 left-4 z-40">
        <StyledBackButton 
          text="Back" 
          onClick={() => router.push('/pokemon/regions')} 
        />
      </div>

      {/* Hero Section */}
      <RegionHero region={region} theme={theme} />

      {/* Region Info Section */}
      <RegionInfo 
        region={{
          name: region.name,
          description: region.description,
          professor: region.professor,
          generation: region.generation,
          pokemonRange: region.pokemonRange,
          games: region.games,
          color: region.color,
          cities: region.cities,
          routes: typeof region.routes === 'string' ? parseInt(region.routes, 10) : region.routes,
          gymLeaders: region.gymLeaders?.map(gl => ({ name: gl.name, badge: gl.badge, type: [gl.type], location: gl.city })),
          trialCaptains: region.trialCaptains?.map(tc => ({ name: tc.name, type: [tc.type], location: tc.island })),
          islandKahunas: region.kahunas?.map(k => ({ name: k.name, type: [k.type], location: k.island })),
          legendaries: region.legendaryIds.map((id, index) => ({ id, name: region.legendaries[index] || 'Unknown' })),
          starterIds: region.starterIds,
          starters: region.starters,
          starterTypes: region.starterTypes
        }} 
        theme={theme} 
      />

      {/* Starter Pokémon Section */}
      <StarterShowcase region={{
        name: region.name,
        color: region.color,
        games: region.games,
        starters: region.starters,
        starterIds: region.starterIds,
        starterTypes: region.starterTypes,
        professor: region.professor,
        generation: region.generation,
        pokemonRange: region.pokemonRange,
        cities: region.cities,
        routes: typeof region.routes === 'string' ? parseInt(region.routes, 10) : region.routes
      }} theme={theme} />

      {/* Gym Leaders Section */}
      {region.gymLeaders && (
        <>
          <GymLeaderCarousel 
            region={region} 
            gymLeaders={region.gymLeaders} 
            theme={theme} 
          />
          <BadgeCollection
            region={region}
            gymLeaders={region.gymLeaders?.map(leader => ({
              ...leader,
              type: [leader.type]
            })) || []}
            theme={theme}
          />
        </>
      )}

      {/* Elite Four & Champion Section */}
      {(region.eliteFour || region.champion) && (
        <EliteFourGallery 
          region={region} 
          eliteFour={region.eliteFour || []} 
          champion={region.champion || null} 
          theme={theme} 
        />
      )}

      {/* Locations Section */}
      <div className={`py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold mb-4">Explore {region.name}</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Discover the cities, towns, and landmarks of the region
              </p>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Cities Grid */}
            <SlideUp>
              <div className={`rounded-3xl overflow-hidden ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-white'
              } p-8 h-full`}>
                <div className="flex items-center gap-3 mb-6">
                  <GiModernCity className="text-3xl text-pokemon-blue" />
                  <h3 className="text-2xl font-bold">Major Cities</h3>
                </div>
                <div className="space-y-3">
                  {region.locations.filter(loc => loc.type === 'city').slice(0, 5).map((city) => (
                    <div key={city.name} className="flex items-start gap-3">
                      <BsGeoAlt className="text-pokemon-blue mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">{city.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {city.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SlideUp>

            {/* Landmarks Grid */}
            <SlideUp delay={0.1}>
              <div className={`rounded-3xl overflow-hidden ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-white'
              } p-8 h-full`}>
                <div className="flex items-center gap-3 mb-6">
                  <BsCompass className="text-3xl text-pokemon-red" />
                  <h3 className="text-2xl font-bold">Notable Landmarks</h3>
                </div>
                <div className="space-y-3">
                  {region.landmarks.slice(0, 5).map((landmark) => (
                    <div key={landmark.name} className="flex items-start gap-3">
                      <BsMap className="text-pokemon-red mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">{landmark.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {landmark.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SlideUp>
          </div>
        </div>
      </div>

      {/* Games Section */}
      <GameShowcase region={region} theme={theme} />

      {/* Legendary Pokémon Section */}
      <div className={`py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold mb-4">Legendary Pokémon</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                The mythical creatures that shape {region.name}'s legends
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {region.legendaryIds.map((id, idx) => (
              <SlideUp key={id} delay={idx * 0.1}>
                <Link href={`/pokedex/${id}`}>
                  <a className="group">
                    <CardHover>
                      <div className={`relative rounded-2xl overflow-hidden ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                      } p-6 text-center hover:shadow-2xl transition-all`}>
                        <div className="relative w-24 h-24 mx-auto mb-3">
                          <Image
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                            alt={region.legendaries[idx]}
                            layout="fill"
                            objectFit="contain"
                            className="group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <h3 className="font-bold text-sm">
                          {region.legendaries[idx]}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          #{String(id).padStart(3, '0')}
                        </p>
                      </div>
                    </CardHover>
                  </a>
                </Link>
              </SlideUp>
            ))}
          </div>
        </div>
      </div>

      {/* Trivia Section */}
      <div className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold mb-4">Did You Know?</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Fascinating facts about {region.name}
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {region.trivia.map((fact, idx) => (
              <SlideUp key={idx} delay={idx * 0.1}>
                <div className={`relative rounded-2xl overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                } p-8 hover:shadow-xl transition-all`}>
                  <div className={`absolute top-0 left-0 w-16 h-16 bg-gradient-to-br ${region.color} 
                    rounded-br-3xl flex items-center justify-center text-white font-bold text-2xl`}>
                    {idx + 1}
                  </div>
                  <p className="text-lg mt-4">
                    {fact}
                  </p>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className={`py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-8 text-center">
          <FadeIn>
            <h2 className="text-4xl font-bold mb-4">
              Ready to explore {region.name}?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Start your journey in the world of Pokémon
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/pokedex">
                <a className="px-8 py-4 bg-gradient-to-r from-pokemon-red to-pokemon-blue text-white font-semibold rounded-full hover:scale-105 transition-transform">
                  View Pokédex
                </a>
              </Link>
              <Link href="/pokemon/regions">
                <a className="px-8 py-4 bg-gray-200 dark:bg-gray-700 font-semibold rounded-full hover:scale-105 transition-transform">
                  Explore Other Regions
                </a>
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </FullBleedWrapper>
  );
}

export default RegionDetailPage;