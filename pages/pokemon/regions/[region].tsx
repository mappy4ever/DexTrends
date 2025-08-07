import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/UnifiedAppContext";
import { FullBleedWrapper } from "../../../components/ui";
import { StandardGlassContainer, SectionHeader } from "../../../components/ui/design-system";
import { CircularButton } from "../../../components/ui/design-system";

// Import Region Components
import RegionHero from "../../../components/regions/RegionHero";
import RegionInfo from "../../../components/regions/RegionInfo";
import ProfessorShowcase from "../../../components/regions/ProfessorShowcase";
import StarterPokemonShowcase from "../../../components/regions/StarterPokemonShowcase";
import SpecialPokemonShowcase from "../../../components/regions/SpecialPokemonShowcase";
import GameShowcase from "../../../components/regions/GameShowcase";
import EvilTeamShowcase from "../../../components/regions/EvilTeamShowcase";
import GymLeaderGrid from "../../../components/regions/GymLeaderGrid"; // New component
import EliteFourGrid from "../../../components/regions/EliteFourGrid"; // New component

import { BsChevronLeft, BsChevronRight, BsGeoAlt, BsCompass, BsStar } from "react-icons/bs";

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

interface RegionData {
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

const regionsData: Record<string, RegionData> = {
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
    color: "from-emerald-500 to-blue-600",
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
    color: "from-indigo-500 to-purple-600",
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
    color: "from-gray-600 to-black",
    bgColor: "bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900",
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
    color: "from-pink-500 to-purple-500",
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
    color: "from-purple-600 to-red-600",
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
    color: "from-red-500 to-purple-600",
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
  
  // Handle loading state
  if (!regionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loading...</h1>
        </div>
      </div>
    );
  }

  const region = regionsData[regionId as string];
  const currentRegionIndex = regionOrder.indexOf(regionId as string);

  if (!region) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Region Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
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
    { id: 'leaders', label: region.gymLeaders ? 'Gym Leaders' : 'Trial Captains' },
    { id: 'elite-four', label: 'Elite Four' },
    { id: 'locations', label: 'Locations' },
    { id: 'games', label: 'Games' },
    { id: 'teams', label: 'Evil Teams' },
    { id: 'trivia', label: 'Trivia' }
  ];

  return (
    <>
      <Head>
        <title>{region.name} Region | Pokémon | DexTrends</title>
        <meta name="description" content={region.description} />
      </Head>

      <FullBleedWrapper gradient="subtle">
        {/* Hero Section - Keep unchanged */}
        <RegionHero region={region} theme={theme} />

        {/* Main Content */}
        <main className="relative bg-gray-50 dark:bg-gray-900">
          {/* Sticky Navigation */}
          <motion.div 
            className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between py-4">
                {/* Back Button */}
                <CircularButton
                  onClick={() => router.push('/pokemon/regions')}
                  variant="secondary"
                  leftIcon={<BsChevronLeft className="w-5 h-5" />}
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
                        document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeSection === section.id
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
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
                  
                  <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 font-medium px-3">
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

          {/* Content Sections */}
          <div className="container mx-auto px-4 py-8 space-y-16">
            {/* Overview Section */}
            <motion.section 
              id="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StandardGlassContainer>
                <RegionInfo region={region} theme={theme} />
              </StandardGlassContainer>
            </motion.section>

            {/* Professor Section */}
            <motion.section 
              id="professor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <StandardGlassContainer>
                <ProfessorShowcase region={region} professor={region.professor} theme={theme} />
              </StandardGlassContainer>
            </motion.section>

            {/* Starters Section */}
            <motion.section 
              id="starters"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StandardGlassContainer>
                <StarterPokemonShowcase region={region.name} starters={region.starters} theme={theme} />
              </StandardGlassContainer>
            </motion.section>

            {/* Gym Leaders / Elite Four Section */}
            <motion.section 
              id="leaders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <StandardGlassContainer>
                <div className="space-y-12">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Your Journey in {region.name}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Challenge the strongest trainers on your path to becoming Champion
                    </p>
                  </div>

                  {/* Gym Leaders Grid */}
                  {region.gymLeaders && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Gym Leaders
                      </h3>
                      <GymLeaderGrid region={region} gymLeaders={region.gymLeaders} theme={theme} />
                    </div>
                  )}

                  {/* Elite Four Grid */}
                  {region.eliteFour && (
                    <div id="elite-four">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Elite Four & Champion
                      </h3>
                      <EliteFourGrid 
                        region={region} 
                        eliteFour={region.eliteFour} 
                        champion={region.champion} 
                        theme={theme} 
                      />
                    </div>
                  )}
                </div>
              </StandardGlassContainer>
            </motion.section>

            {/* Locations Section */}
            <motion.section 
              id="locations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <StandardGlassContainer>
                <SectionHeader 
                  icon={<BsGeoAlt className="text-xl" />}
                  title="Explore"
                  subtitle={`Discover the cities and landmarks of ${region.name}`}
                />
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Cities */}
                  {region.locations && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BsGeoAlt /> Cities & Towns
                      </h3>
                      <div className="space-y-3">
                        {region.locations.map((location, index) => (
                          <div 
                            key={index} 
                            className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                          >
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {location.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {location.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Landmarks */}
                  {region.landmarks && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BsCompass /> Notable Landmarks
                      </h3>
                      <div className="space-y-3">
                        {region.landmarks.map((landmark, index) => (
                          <div 
                            key={index} 
                            className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                          >
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {landmark.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {landmark.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </StandardGlassContainer>
            </motion.section>

            {/* Games Section */}
            <motion.section 
              id="games"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <StandardGlassContainer>
                <GameShowcase region={region} theme={theme} />
              </StandardGlassContainer>
            </motion.section>

            {/* Evil Teams Section */}
            <motion.section 
              id="teams"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <StandardGlassContainer>
                <EvilTeamShowcase region={region} theme={theme} />
              </StandardGlassContainer>
            </motion.section>

            {/* Trivia Section */}
            {region.trivia && (
              <motion.section 
                id="trivia"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <StandardGlassContainer>
                  <SectionHeader 
                    icon={<BsStar className="text-xl" />}
                    title="Did You Know?"
                    subtitle={`Interesting facts about ${region.name}`}
                  />
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {region.trivia.map((fact, index) => (
                      <div 
                        key={index}
                        className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                      >
                        <p className="text-gray-700 dark:text-gray-300">{fact}</p>
                      </div>
                    ))}
                  </div>
                </StandardGlassContainer>
              </motion.section>
            )}
          </div>
        </main>
      </FullBleedWrapper>
    </>
  );
}

// Enable full bleed mode
(RegionDetailPage as any).fullBleed = true;