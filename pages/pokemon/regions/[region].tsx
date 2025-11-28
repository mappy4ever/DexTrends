import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/UnifiedAppContext";
import { FullBleedWrapper } from "../../../components/ui";
import RouteErrorBoundary from "../../../components/RouteErrorBoundary";
import { SectionHeader, CircularButton } from '../../../components/ui/design-system';
import { Container } from '../../../components/ui/Container';

// Import Region Components
import RegionHero from "../../../components/regions/RegionHero";
import RegionInfo from "../../../components/regions/RegionInfo";
import ProfessorShowcase from "../../../components/regions/ProfessorShowcase";
import StarterShowcaseComplete from "../../../components/regions/StarterShowcaseComplete";
import SpecialPokemonShowcase from "../../../components/regions/SpecialPokemonShowcase";
import GameShowcase from "../../../components/regions/GameShowcase";
import EvilTeamShowcase from "../../../components/regions/EvilTeamShowcase";
import GymLeaderGrid from "../../../components/regions/GymLeaderGrid";
import EliteFourGrid from "../../../components/regions/EliteFourGrid";
import IslandKahunasGrid from "../../../components/regions/IslandKahunasGrid";
import LegendaryPokemonShowcase from "../../../components/regions/LegendaryPokemonShowcase";
import RegionalFormsGallery from "../../../components/regions/RegionalFormsGallery";

import { BsChevronLeft, BsChevronRight, BsGeoAlt, BsCompass, BsStar, BsLightbulb } from "react-icons/bs";

// Type definitions (keeping existing ones)
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

interface PageRegionData {
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
}

// Keep existing region data
const regionOrder = ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea'];

const regionsData: Record<string, PageRegionData> = {
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
    color: "from-red-500 to-amber-500",
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
    champion: { name: "Blue", team: "Varied", signature: "Varied" },
    trivia: [
      "Kanto is based on the real Kantō region of Japan",
      "It was the first region introduced in the Pokémon series",
      "The Safari Zone was a unique feature for catching rare Pokémon",
      "Team Rocket's headquarters is located in Celadon City"
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
      "Only region where you can earn 16 badges"
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
    legendaries: ["Kyogre", "Groudon", "Rayquaza", "Regice", "Regirock", "Registeel"],
    legendaryIds: [382, 383, 384, 378, 377, 379],
    cities: 16,
    routes: 34,
    pokemonRange: "252-386",
    color: "from-emerald-500 to-amber-600",
    bgColor: "bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900",
    map: '/images/scraped/maps/Hoenn_ORAS.png',
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
      "Features two villainous teams: Team Aqua and Team Magma"
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
    legendaries: ["Dialga", "Palkia", "Giratina", "Uxie", "Mesprit", "Azelf"],
    legendaryIds: [483, 484, 487, 480, 481, 482],
    cities: 14,
    routes: 30,
    pokemonRange: "387-493",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900",
    map: '/images/scraped/maps/Sinnoh_BDSP_artwork.png',
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
    legendaries: ["Reshiram", "Zekrom", "Kyurem", "Cobalion", "Terrakion", "Virizion"],
    legendaryIds: [643, 644, 646, 638, 639, 640],
    cities: 17,
    routes: 23,
    pokemonRange: "494-649",
    color: "from-stone-600 to-black",
    bgColor: "bg-gradient-to-br from-stone-100 to-stone-300 dark:from-stone-800 dark:to-stone-900",
    map: '/images/scraped/maps/Unova_B2W2_alt.png',
    gymLeaders: [
      { name: "Cilan", city: "Striaton City", type: "grass", badge: "Trio Badge" },
      { name: "Lenora", city: "Nacrene City", type: "normal", badge: "Basic Badge" },
      { name: "Burgh", city: "Castelia City", type: "bug", badge: "Insect Badge" },
      { name: "Elesa", city: "Nimbasa City", type: "electric", badge: "Bolt Badge" },
      { name: "Clay", city: "Driftveil City", type: "ground", badge: "Quake Badge" },
      { name: "Skyla", city: "Mistralton City", type: "flying", badge: "Jet Badge" },
      { name: "Brycen", city: "Icirrus City", type: "ice", badge: "Freeze Badge" },
      { name: "Drayden", city: "Opelucid City", type: "dragon", badge: "Legend Badge" }
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
    color: "from-pink-500 to-amber-500",
    bgColor: "bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900",
    map: '/images/scraped/maps/Kalos_map.png',
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
    description: "A tropical paradise made up of four natural islands.",
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
    description: "An industrial region inspired by Great Britain with Dynamax battles.",
    professor: "Professor Magnolia",
    starters: ["Grookey", "Scorbunny", "Sobble"],
    starterIds: [810, 813, 816],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Zacian", "Zamazenta", "Eternatus"],
    legendaryIds: [888, 889, 890],
    cities: 13,
    routes: 10,
    pokemonRange: "810-898",
    color: "from-amber-600 to-red-600",
    bgColor: "bg-gradient-to-br from-purple-100 to-red-100 dark:from-purple-900 dark:to-red-900",
    map: '/images/scraped/maps/Galar_artwork.png',
    gymLeaders: [
      { name: "Milo", city: "Turffield", type: "grass", badge: "Grass Badge" },
      { name: "Nessa", city: "Hulbury", type: "water", badge: "Water Badge" },
      { name: "Kabu", city: "Motostoke", type: "fire", badge: "Fire Badge" },
      { name: "Bea", city: "Stow-on-Side", type: "fighting", badge: "Fighting Badge" },
      { name: "Opal", city: "Ballonlea", type: "fairy", badge: "Fairy Badge" },
      { name: "Gordie", city: "Circhester", type: "rock", badge: "Rock Badge" },
      { name: "Piers", city: "Spikemuth", type: "dark", badge: "Dark Badge" },
      { name: "Raihan", city: "Hammerlocke", type: "dragon", badge: "Dragon Badge" }
    ],
    eliteFour: [],
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
    games: ["Scarlet", "Violet"],
    description: "An open-world region inspired by Spain with three storylines to explore.",
    professor: "Professor Sada/Turo",
    starters: ["Sprigatito", "Fuecoco", "Quaxly"],
    starterIds: [906, 909, 912],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Koraidon", "Miraidon"],
    legendaryIds: [1007, 1008],
    cities: 10,
    routes: 15,
    pokemonRange: "906-1025",
    color: "from-red-500 to-amber-600",
    bgColor: "bg-gradient-to-br from-red-100 to-purple-100 dark:from-red-900 dark:to-purple-900",
    map: '/images/scraped/maps/Paldea_artwork.png',
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
  const [activeSection, setActiveSection] = useState('overview');
  const [isNavSticky, setIsNavSticky] = useState(false);
  
  // Handle scroll for sticky navigation (SSR safe)
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const heroHeight = window.innerHeight; // Height of hero section
        const scrollPosition = window.scrollY;
        setIsNavSticky(scrollPosition > heroHeight - 100);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
    return undefined;
  }, []);
  
  // Handle loading state
  if (!regionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Loading...</h1>
        </div>
      </div>
    );
  }

  const region = regionsData[regionId as string];
  const currentRegionIndex = regionOrder.indexOf(regionId as string);

  if (!region) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-stone-900 dark:text-white">Region Not Found</h1>
          <p className="text-stone-600 dark:text-stone-400 mb-8">
            The region "{regionId}" does not exist.
          </p>
          <CircularButton
            onClick={() => router.push('/pokemon/regions')}
            variant="primary"
          >
            Back to Regions
          </CircularButton>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'professor', label: 'Professor' },
    { id: 'starters', label: 'Starters' },
    { id: 'legendaries', label: 'Legendaries' },
    { id: 'leaders', label: region.gymLeaders ? 'Gym Leaders' : 'Trial Captains' },
    { id: 'elite-four', label: 'Elite Four' },
    { id: 'locations', label: 'Locations' },
    { id: 'games', label: 'Games' },
    { id: 'teams', label: 'Evil Teams' },
    { id: 'trivia', label: 'Trivia' }
  ];

  return (
    <RouteErrorBoundary routeName={`Region: ${region.name}`}>
      <Head>
        <title>{region.name} Region | Pokémon | DexTrends</title>
        <meta name="description" content={region.description} />
      </Head>

      <FullBleedWrapper gradient="regions">
        {/* Hero Section with overlapping navigation */}
        <div className="relative">
          <RegionHero region={region} theme={theme} />
          
          {/* Overlapping Navigation Bar */}
          <motion.div 
            className={`${isNavSticky ? 'fixed top-20' : 'absolute bottom-0'} left-0 right-0 z-30 bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-sm border-b border-stone-200/50 dark:border-stone-700/50 transition-all duration-300`}
            style={{ 
              transform: isNavSticky ? 'translateY(0)' : 'translateY(50%)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between py-2">
                {/* Back Button */}
                <CircularButton
                  onClick={() => router.push('/pokemon/regions')}
                  variant="secondary"
                  size="sm"
                  leftIcon={<BsChevronLeft className="w-4 h-4" />}
                >
                  Back to Regions
                </CircularButton>

                {/* Section Navigation */}
                <nav className="hidden md:flex items-center space-x-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        if (typeof document !== 'undefined') {
                          document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                        activeSection === section.id
                          ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                          : 'hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </nav>

                {/* Region Navigation */}
                <div className="flex items-center gap-2">
                  {regionOrder[currentRegionIndex - 1] && (
                    <CircularButton
                      onClick={() => router.push(`/pokemon/regions/${regionOrder[currentRegionIndex - 1]}`)}
                      variant="secondary"
                      size="sm"
                      aria-label="Previous region"
                    >
                      <BsChevronLeft className="w-4 h-4" />
                    </CircularButton>
                  )}
                  
                  <span className="hidden sm:inline text-sm text-stone-600 dark:text-stone-400 font-medium px-3">
                    {currentRegionIndex + 1} / {regionOrder.length}
                  </span>
                  
                  {regionOrder[currentRegionIndex + 1] && (
                    <CircularButton
                      onClick={() => router.push(`/pokemon/regions/${regionOrder[currentRegionIndex + 1]}`)}
                      variant="secondary"
                      size="sm"
                      aria-label="Next region"
                    >
                      <BsChevronRight className="w-4 h-4" />
                    </CircularButton>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <main className="relative bg-gradient-to-br from-stone-50 via-purple-50/30 to-stone-100 dark:from-stone-900 dark:via-purple-900/20 dark:to-stone-900 pt-16 overflow-x-hidden">
          {/* Content Sections */}
          <div className="container mx-auto px-2 sm:px-4 py-8 space-y-16 max-w-full overflow-hidden">
            {/* Overview Section */}
            <motion.section 
              id="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden"
            >
              <Container variant="default" className="max-w-full">
                <RegionInfo region={{
                  ...region,
                  gymLeaders: region.gymLeaders?.map(leader => ({
                    ...leader,
                    type: [leader.type],
                    location: leader.city
                  })),
                  legendaries: region.legendaryIds?.map((id, index) => ({
                    id,
                    name: region.legendaries[index] || `Legendary ${id}`
                  })) || []
                }} theme={theme} />
              </Container>
            </motion.section>

            {/* Professor Section */}
            <motion.section 
              id="professor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="overflow-hidden"
            >
              <Container variant="default" className="max-w-full">
                <ProfessorShowcase region={region} professor={region.professor} theme={theme} />
              </Container>
            </motion.section>

            {/* Unified Starters Section */}
            <motion.section 
              id="starters"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="overflow-hidden"
            >
              <StarterShowcaseComplete 
                region={region.name} 
                starters={region.starters}
                starterIds={region.starterIds}
                theme={theme} 
              />
            </motion.section>

            {/* Legendary Pokémon Section */}
            <motion.section 
              id="legendaries"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="overflow-hidden"
            >
              <LegendaryPokemonShowcase 
                region={region} 
                legendaries={region.legendaries}
                legendaryIds={region.legendaryIds}
                theme={theme} 
              />
            </motion.section>

            {/* Island Kahunas - Only for Alola */}
            {region.id === 'alola' && (
              <motion.section 
                id="island-kahunas"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.26 }}
              >
                <IslandKahunasGrid theme={theme} />
              </motion.section>
            )}

            {/* Regional Forms Gallery - Only for regions with forms */}
            {(region.id === 'alola' || region.id === 'galar' || region.id === 'paldea') && (
              <motion.section 
                id="regional-forms"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.27 }}
              >
                <RegionalFormsGallery 
                  region={region}
                  theme={theme} 
                />
              </motion.section>
            )}

            {/* Gym Leaders / Elite Four Section */}
            <motion.section 
              id="leaders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="backdrop-blur-xl bg-gradient-to-br from-stone-100/90 to-stone-200/80 dark:from-stone-900/50 dark:to-stone-800/50 border border-stone-200 dark:border-stone-700 shadow-xl rounded-2xl p-8">
                <div className="space-y-12">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-2">
                      Your Journey in {region.name}
                    </h2>
                    <p className="text-lg text-stone-600 dark:text-stone-400">
                      Challenge the strongest trainers on your path to becoming Champion
                    </p>
                  </div>

                  {/* Gym Leaders Grid */}
                  {region.gymLeaders && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                          Gym Leaders
                        </h3>
                        <div className="mt-2 h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-stone-400 to-transparent rounded-full"></div>
                      </div>
                      <GymLeaderGrid region={region} gymLeaders={region.gymLeaders} theme={theme} />
                    </div>
                  )}

                  {/* Elite Four Grid */}
                  {region.eliteFour && (
                    <div id="elite-four" className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                          Elite Four & Champion
                        </h3>
                        <div className="mt-2 h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-stone-400 to-transparent rounded-full"></div>
                      </div>
                      <EliteFourGrid 
                        region={region} 
                        eliteFour={region.eliteFour} 
                        champion={region.champion || null} 
                        theme={theme} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Enhanced Locations Section with Glass Cards */}
            <motion.section 
              id="locations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="relative">
                {/* Animated Map Background */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-amber-500 to-pink-500 animate-pulse" />
                </div>
                
                <Container variant="default">
                  <SectionHeader 
                    icon={<BsGeoAlt className="text-2xl text-amber-500" />}
                    title="Explore the Region"
                    subtitle={`Journey through the diverse landscapes of ${region.name}`}
                  />
                  
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Cities & Towns Glass Gallery */}
                    {region.locations && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                            <BsGeoAlt className="text-white text-xl" />
                          </div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-600 bg-clip-text text-transparent">
                            Cities & Towns
                          </h3>
                        </div>
                        
                        <div className="space-y-4">
                          {region.locations.map((location, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, x: 10 }}
                              className="relative group cursor-pointer"
                            >
                              <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/80 via-blue-50/60 to-white/70 dark:from-stone-800/80 dark:via-blue-900/30 dark:to-stone-900/70 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/30 dark:border-stone-700/30">
                                {/* Location Type Badge */}
                                <div className="absolute top-3 right-3 z-10">
                                  <span className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-gradient-to-r from-amber-500/80 to-amber-500/80 text-white shadow-md">
                                    {location.type?.toUpperCase() || 'CITY'}
                                  </span>
                                </div>
                                
                                {/* Glass Content */}
                                <div className="p-6">
                                  <div className="flex items-start gap-4">
                                    {/* Location Icon */}
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow">
                                      <BsGeoAlt className="text-white text-2xl" />
                                    </div>
                                    
                                    {/* Location Info */}
                                    <div className="flex-1">
                                      <h4 className="text-lg font-bold text-stone-800 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-purple-400 transition-colors">
                                        {location.name}
                                      </h4>
                                      <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                                        {location.description}
                                      </p>
                                      
                                      {/* Hover Indicator */}
                                      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs font-medium text-amber-600 dark:text-purple-400">Explore</span>
                                        <BsChevronRight className="text-xs text-amber-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Animated Border Gradient */}
                                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                  <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400 opacity-50 blur-sm" />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Landmarks Glass Gallery */}
                    {region.landmarks && (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-pink-600 flex items-center justify-center shadow-lg">
                            <BsCompass className="text-white text-xl" />
                          </div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-pink-600 bg-clip-text text-transparent">
                            Notable Landmarks
                          </h3>
                        </div>
                        
                        <div className="space-y-4">
                          {region.landmarks.map((landmark, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, x: -10 }}
                              className="relative group cursor-pointer"
                            >
                              <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/80 via-purple-50/60 to-white/70 dark:from-stone-800/80 dark:via-purple-900/30 dark:to-stone-900/70 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/30 dark:border-stone-700/30">
                                {/* Special Location Indicator */}
                                <div className="absolute top-3 right-3 z-10">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md animate-pulse">
                                    <BsStar className="text-white text-sm" />
                                  </div>
                                </div>
                                
                                {/* Glass Content */}
                                <div className="p-6">
                                  <div className="flex items-start gap-4">
                                    {/* Landmark Icon */}
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow">
                                      <BsCompass className="text-white text-2xl" />
                                    </div>
                                    
                                    {/* Landmark Info */}
                                    <div className="flex-1">
                                      <h4 className="text-lg font-bold text-stone-800 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-purple-400 transition-colors">
                                        {landmark.name}
                                      </h4>
                                      <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                                        {landmark.description}
                                      </p>
                                      
                                      {/* Special Features Tags */}
                                      <div className="flex flex-wrap gap-2 mt-3">
                                        {landmark.name.toLowerCase().includes('cave') && (
                                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-stone-200/50 dark:bg-stone-700/50 text-stone-700 dark:text-stone-300">Cave</span>
                                        )}
                                        {landmark.name.toLowerCase().includes('tower') && (
                                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-200/50 dark:bg-purple-700/50 text-purple-700 dark:text-purple-300">Tower</span>
                                        )}
                                        {landmark.name.toLowerCase().includes('forest') && (
                                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-200/50 dark:bg-green-700/50 text-green-700 dark:text-green-300">Forest</span>
                                        )}
                                        {landmark.name.toLowerCase().includes('island') && (
                                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-200/50 dark:bg-blue-700/50 text-blue-700 dark:text-blue-300">Island</span>
                                        )}
                                      </div>
                                      
                                      {/* Hover Indicator */}
                                      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs font-medium text-amber-600 dark:text-purple-400">Discover</span>
                                        <BsChevronRight className="text-xs text-amber-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Animated Border Gradient */}
                                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                  <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 opacity-50 blur-sm" />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Map Preview Card */}
                  {region.map && (
                    <motion.div 
                      className="mt-8 p-6 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-purple-100/60 via-pink-100/40 to-blue-100/60 dark:from-purple-900/30 dark:via-pink-900/20 dark:to-blue-900/30 border border-purple-200/30 dark:border-purple-700/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-pink-500 flex items-center justify-center shadow-md">
                            <BsCompass className="text-white text-lg" />
                          </div>
                          <div>
                            <h4 className="font-bold text-stone-800 dark:text-white">Region Map Available</h4>
                            <p className="text-sm text-stone-600 dark:text-stone-400">Explore the full {region.name} region map</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                          View Map
                        </button>
                      </div>
                    </motion.div>
                  )}
                </Container>
              </div>
            </motion.section>

            {/* Games Section */}
            <motion.section 
              id="games"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Container variant="default">
                <GameShowcase region={region} theme={theme} />
              </Container>
            </motion.section>

            {/* Evil Teams Section */}
            <motion.section 
              id="teams"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Container variant="default">
                <EvilTeamShowcase region={region} theme={theme} />
              </Container>
            </motion.section>

            {/* Enhanced Trivia Section - Glass Knowledge Cards */}
            {region.trivia && (
              <motion.section 
                id="trivia"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <div className="relative">
                  {/* Animated Knowledge Background */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-amber-500 to-pink-500 animate-pulse" />
                  </div>
                  
                  <Container variant="default">
                    <div className="text-center mb-10">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <BsStar className="text-3xl text-yellow-500 animate-pulse" />
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-pink-600 bg-clip-text text-transparent">
                          Did You Know?
                        </h2>
                        <BsStar className="text-3xl text-yellow-500 animate-pulse" />
                      </div>
                      <p className="text-lg text-stone-600 dark:text-stone-400">
                        Fascinating facts and hidden secrets about {region.name}
                      </p>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                      {region.trivia.map((fact, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, rotateY: -180 }}
                          animate={{ opacity: 1, rotateY: 0 }}
                          transition={{ delay: index * 0.15, duration: 0.6 }}
                          whileHover={{ scale: 1.05, rotateY: 5 }}
                          className="relative group"
                        >
                          <div className="relative rounded-3xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/90 via-yellow-50/60 to-white/80 dark:from-stone-800/90 dark:via-yellow-900/20 dark:to-stone-900/80 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/30 dark:border-stone-700/30">
                            {/* Fact Number Badge */}
                            <div className="absolute top-4 left-4 z-10">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-300">
                                <span className="text-white font-bold text-sm">#{index + 1}</span>
                              </div>
                            </div>
                            
                            {/* Decorative Star */}
                            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                              <BsStar className="text-4xl text-yellow-500" />
                            </div>
                            
                            {/* Fact Content */}
                            <div className="p-8 pt-16">
                              <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                                {fact}
                              </p>
                              
                              {/* Category Tags */}
                              <div className="flex flex-wrap gap-2 mt-4">
                                {fact.toLowerCase().includes('based on') && (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-200/50 dark:bg-purple-700/30 text-purple-700 dark:text-purple-300 backdrop-blur-sm">Real World</span>
                                )}
                                {fact.toLowerCase().includes('first') && (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-200/50 dark:bg-green-700/30 text-green-700 dark:text-green-300 backdrop-blur-sm">Pioneer</span>
                                )}
                                {fact.toLowerCase().includes('only') && (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-200/50 dark:bg-blue-700/30 text-blue-700 dark:text-blue-300 backdrop-blur-sm">Unique</span>
                                )}
                                {(fact.toLowerCase().includes('team') || fact.toLowerCase().includes('evil')) && (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-200/50 dark:bg-red-700/30 text-red-700 dark:text-red-300 backdrop-blur-sm">Villains</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Animated Shimmer Effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </div>
                            
                            {/* Bottom Gradient Edge */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-pink-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Fun Fact Footer */}
                    <motion.div 
                      className="mt-10 p-6 rounded-2xl backdrop-blur-md bg-gradient-to-r from-yellow-100/50 via-purple-100/50 to-pink-100/50 dark:from-yellow-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border border-yellow-200/30 dark:border-yellow-700/30 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <BsLightbulb className="text-yellow-500 text-xl" />
                        <span className="font-bold text-stone-800 dark:text-white">Pro Tip:</span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        Share these facts with fellow trainers to become a {region.name} expert!
                      </p>
                    </motion.div>
                  </Container>
                </div>
              </motion.section>
            )}
          </div>
        </main>
      </FullBleedWrapper>
    </RouteErrorBoundary>
  );
}

// Enable full bleed mode
(RegionDetailPage as any).fullBleed = true;