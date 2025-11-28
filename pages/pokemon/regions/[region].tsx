import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Container from "../../../components/ui/Container";
import { TypeBadge } from "../../../components/ui/TypeBadge";
import { FiChevronLeft, FiChevronRight, FiMapPin, FiMap, FiUsers, FiStar, FiBook, FiInfo } from "react-icons/fi";

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
  gradientFrom: string;
  gradientTo: string;
}

const regionOrder = ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea'];

const regionsData: Record<string, PageRegionData> = {
  kanto: {
    id: "kanto",
    name: "Kanto",
    generation: 1,
    games: ["Red", "Blue", "Yellow", "FireRed", "LeafGreen", "Let's Go Pikachu/Eevee"],
    description: "The region where it all began. Home to the original 151 Pokémon and the starting point for countless trainers' journeys.",
    professor: "Professor Oak",
    starters: ["Bulbasaur", "Charmander", "Squirtle"],
    starterIds: [1, 4, 7],
    starterTypes: [["grass", "poison"], ["fire"], ["water"]],
    legendaries: ["Articuno", "Zapdos", "Moltres", "Mewtwo", "Mew"],
    legendaryIds: [144, 145, 146, 150, 151],
    cities: 10,
    routes: 25,
    pokemonRange: "001-151",
    color: "red",
    bgColor: "from-red-500 to-orange-400",
    map: '/images/scraped/maps/PE_Kanto_Map.png',
    gradientFrom: "from-red-500",
    gradientTo: "to-orange-400",
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
    description: "A region steeped in history and tradition, connected to Kanto. Known for its ancient ruins and legendary beasts.",
    professor: "Professor Elm",
    starters: ["Chikorita", "Cyndaquil", "Totodile"],
    starterIds: [152, 155, 158],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Raikou", "Entei", "Suicune", "Lugia", "Ho-Oh", "Celebi"],
    legendaryIds: [243, 244, 245, 249, 250, 251],
    cities: 10,
    routes: 20,
    pokemonRange: "152-251",
    color: "yellow",
    bgColor: "from-yellow-500 to-amber-400",
    map: '/images/scraped/maps/JohtoMap.png',
    gradientFrom: "from-yellow-500",
    gradientTo: "to-amber-400",
    locations: [
      { name: "New Bark Town", type: "town", description: "The town where winds of new beginnings blow" },
      { name: "Violet City", type: "city", description: "The city of nostalgic scents" },
      { name: "Goldenrod City", type: "city", description: "A happening big city" },
      { name: "Ecruteak City", type: "city", description: "A historical city" },
      { name: "Blackthorn City", type: "city", description: "A quiet mountain retreat" }
    ],
    landmarks: [
      { name: "Sprout Tower", description: "A tower swaying with an enormous pillar" },
      { name: "Ruins of Alph", description: "Ancient ruins with mysterious Unown" },
      { name: "Bell Tower", description: "Ho-Oh once perched atop this tower" },
      { name: "Whirl Islands", description: "Maze-like islands home to Lugia" }
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
      "It was the first region to introduce breeding",
      "The Legendary Beasts were resurrected by Ho-Oh",
      "After beating Johto, players can travel to Kanto"
    ]
  },
  hoenn: {
    id: "hoenn",
    name: "Hoenn",
    generation: 3,
    games: ["Ruby", "Sapphire", "Emerald", "Omega Ruby", "Alpha Sapphire"],
    description: "A tropical region with diverse ecosystems and weather phenomena. The clash between land and sea defines its legend.",
    professor: "Professor Birch",
    starters: ["Treecko", "Torchic", "Mudkip"],
    starterIds: [252, 255, 258],
    starterTypes: [["grass"], ["fire"], ["water", "ground"]],
    legendaries: ["Regirock", "Regice", "Registeel", "Latias", "Latios", "Kyogre", "Groudon", "Rayquaza", "Jirachi", "Deoxys"],
    legendaryIds: [377, 378, 379, 380, 381, 382, 383, 384, 385, 386],
    cities: 16,
    routes: 34,
    pokemonRange: "252-386",
    color: "green",
    bgColor: "from-emerald-500 to-teal-400",
    map: '/images/scraped/maps/Hoenn_ORAS.png',
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-400",
    locations: [
      { name: "Littleroot Town", type: "town", description: "A town that can't be Pokemon-mapped" },
      { name: "Petalburg City", type: "city", description: "Where people mingle with nature" },
      { name: "Rustboro City", type: "city", description: "The city probing the integration of nature and science" },
      { name: "Sootopolis City", type: "city", description: "The mystical city rising from the sea" }
    ],
    landmarks: [
      { name: "Sky Pillar", description: "An ancient tower reaching toward the heavens" },
      { name: "Cave of Origin", description: "A cave where life energy gathers" },
      { name: "Mt. Chimney", description: "A volcano with a cable car to the summit" }
    ],
    gymLeaders: [
      { name: "Roxanne", city: "Rustboro City", type: "rock", badge: "Stone Badge" },
      { name: "Brawly", city: "Dewford Town", type: "fighting", badge: "Knuckle Badge" },
      { name: "Wattson", city: "Mauville City", type: "electric", badge: "Dynamo Badge" },
      { name: "Flannery", city: "Lavaridge Town", type: "fire", badge: "Heat Badge" },
      { name: "Norman", city: "Petalburg City", type: "normal", badge: "Balance Badge" },
      { name: "Winona", city: "Fortree City", type: "flying", badge: "Feather Badge" },
      { name: "Tate & Liza", city: "Mossdeep City", type: "psychic", badge: "Mind Badge" },
      { name: "Wallace/Juan", city: "Sootopolis City", type: "water", badge: "Rain Badge" }
    ],
    eliteFour: [
      { name: "Sidney", type: "dark", signature: "Absol" },
      { name: "Phoebe", type: "ghost", signature: "Dusclops" },
      { name: "Glacia", type: "ice", signature: "Glalie" },
      { name: "Drake", type: "dragon", signature: "Salamence" }
    ],
    champion: { name: "Steven/Wallace", team: "Steel/Water", signature: "Metagross/Milotic" },
    trivia: [
      "Hoenn is based on the Kyushu region of Japan (rotated 90°)",
      "It introduced Double Battles to the series",
      "Weather conditions play a major role in the storyline",
      "The region has the most water routes of any region"
    ]
  },
  sinnoh: {
    id: "sinnoh",
    name: "Sinnoh",
    generation: 4,
    games: ["Diamond", "Pearl", "Platinum", "Brilliant Diamond", "Shining Pearl"],
    description: "A region rich in mythology, featuring Mt. Coronet at its center. Home to the creation trio that shaped the universe.",
    professor: "Professor Rowan",
    starters: ["Turtwig", "Chimchar", "Piplup"],
    starterIds: [387, 390, 393],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Uxie", "Mesprit", "Azelf", "Dialga", "Palkia", "Heatran", "Regigigas", "Giratina", "Cresselia", "Darkrai", "Shaymin", "Arceus"],
    legendaryIds: [480, 481, 482, 483, 484, 485, 486, 487, 488, 491, 492, 493],
    cities: 14,
    routes: 30,
    pokemonRange: "387-493",
    color: "blue",
    bgColor: "from-blue-500 to-indigo-400",
    map: '/images/scraped/maps/Sinnoh_BDSP_artwork.png',
    gradientFrom: "from-blue-500",
    gradientTo: "to-indigo-400",
    locations: [
      { name: "Twinleaf Town", type: "town", description: "Fresh and Pokemon-free" },
      { name: "Jubilife City", type: "city", description: "The city of joy" },
      { name: "Veilstone City", type: "city", description: "Hewn from rock" },
      { name: "Sunyshore City", type: "city", description: "Solar powered" }
    ],
    landmarks: [
      { name: "Mt. Coronet", description: "The sacred mountain dividing Sinnoh" },
      { name: "Spear Pillar", description: "The summit where space-time converges" },
      { name: "Distortion World", description: "A bizarre realm ruled by Giratina" }
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
      { name: "Lucian", type: "psychic", signature: "Gallade" }
    ],
    champion: { name: "Cynthia", team: "Varied", signature: "Garchomp" },
    trivia: [
      "Sinnoh is based on Hokkaido, Japan",
      "Mt. Coronet divides the region climatically",
      "Cynthia is considered one of the strongest Champions",
      "The Underground introduced a new multiplayer experience"
    ]
  },
  unova: {
    id: "unova",
    name: "Unova",
    generation: 5,
    games: ["Black", "White", "Black 2", "White 2"],
    description: "A diverse region inspired by New York City. The first region to feature only new Pokémon until post-game.",
    professor: "Professor Juniper",
    starters: ["Snivy", "Tepig", "Oshawott"],
    starterIds: [495, 498, 501],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Victini", "Cobalion", "Terrakion", "Virizion", "Tornadus", "Thundurus", "Reshiram", "Zekrom", "Landorus", "Kyurem", "Keldeo", "Meloetta", "Genesect"],
    legendaryIds: [494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649],
    cities: 12,
    routes: 23,
    pokemonRange: "494-649",
    color: "gray",
    bgColor: "from-stone-600 to-stone-500",
    map: '/images/scraped/maps/Unova_B2W2_alt.png',
    gradientFrom: "from-stone-600",
    gradientTo: "to-stone-500",
    locations: [
      { name: "Nuvema Town", type: "town", description: "The Pokemon journey begins" },
      { name: "Castelia City", type: "city", description: "A Pokemon metropolis" },
      { name: "Nimbasa City", type: "city", description: "The entertainment capital" },
      { name: "Opelucid City", type: "city", description: "Varies by version" }
    ],
    landmarks: [
      { name: "Dragonspiral Tower", description: "Ancient tower housing a legendary dragon" },
      { name: "Giant Chasm", description: "A mysterious crater" },
      { name: "Liberty Garden", description: "Home of Victini" }
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
      { name: "Grimsley", type: "dark", signature: "Bisharp" },
      { name: "Caitlin", type: "psychic", signature: "Gothitelle" },
      { name: "Marshal", type: "fighting", signature: "Mienshao" }
    ],
    champion: { name: "Alder/Iris", team: "Varied", signature: "Volcarona/Haxorus" },
    trivia: [
      "Unova is the first region based on a location outside Japan (New York City)",
      "It features 156 new Pokémon, the most of any generation",
      "Seasons were introduced for the first time",
      "Black 2 and White 2 were direct sequels"
    ]
  },
  kalos: {
    id: "kalos",
    name: "Kalos",
    generation: 6,
    games: ["X", "Y"],
    description: "A beautiful region inspired by France, introducing Mega Evolution and the Fairy type.",
    professor: "Professor Sycamore",
    starters: ["Chespin", "Fennekin", "Froakie"],
    starterIds: [650, 653, 656],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Xerneas", "Yveltal", "Zygarde", "Diancie", "Hoopa", "Volcanion"],
    legendaryIds: [716, 717, 718, 719, 720, 721],
    cities: 17,
    routes: 22,
    pokemonRange: "650-721",
    color: "pink",
    bgColor: "from-pink-500 to-rose-400",
    map: '/images/scraped/maps/Kalos_map.png',
    gradientFrom: "from-pink-500",
    gradientTo: "to-rose-400",
    locations: [
      { name: "Vaniville Town", type: "town", description: "A Pokemon adventure begins" },
      { name: "Lumiose City", type: "city", description: "The city of light" },
      { name: "Laverre City", type: "city", description: "An ancient fairy tale" },
      { name: "Anistar City", type: "city", description: "The starry sundial" }
    ],
    landmarks: [
      { name: "Prism Tower", description: "The iconic symbol of Lumiose City" },
      { name: "Team Flare Secret HQ", description: "Hidden beneath a café" },
      { name: "Parfum Palace", description: "A grand palace with beautiful gardens" }
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
      "It introduced Mega Evolution and the Fairy type",
      "Lumiose City is based on Paris",
      "The first games to feature full 3D graphics"
    ]
  },
  alola: {
    id: "alola",
    name: "Alola",
    generation: 7,
    games: ["Sun", "Moon", "Ultra Sun", "Ultra Moon"],
    description: "A tropical paradise made up of four natural islands and one artificial island. Features Island Trials instead of gyms.",
    professor: "Professor Kukui",
    starters: ["Rowlet", "Litten", "Popplio"],
    starterIds: [722, 725, 728],
    starterTypes: [["grass", "flying"], ["fire"], ["water"]],
    legendaries: ["Type: Null", "Silvally", "Tapu Koko", "Tapu Lele", "Tapu Bulu", "Tapu Fini", "Cosmog", "Cosmoem", "Solgaleo", "Lunala", "Necrozma", "Magearna", "Marshadow", "Zeraora"],
    legendaryIds: [772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, 801, 802, 807],
    cities: 16,
    routes: 17,
    pokemonRange: "722-809",
    color: "orange",
    bgColor: "from-orange-500 to-amber-400",
    map: '/images/scraped/maps/Alola_USUM_artwork.png',
    gradientFrom: "from-orange-500",
    gradientTo: "to-amber-400",
    locations: [
      { name: "Iki Town", type: "town", description: "A town for worshipping Tapu Koko" },
      { name: "Hau'oli City", type: "city", description: "A beachfront shopping district" },
      { name: "Konikoni City", type: "city", description: "A jewelry city" },
      { name: "Malie City", type: "city", description: "A city with Johto influences" }
    ],
    landmarks: [
      { name: "Altar of the Sunne/Moone", description: "Where the legendary Pokémon can be summoned" },
      { name: "Ultra Wormhole", description: "Portal to Ultra Space" },
      { name: "Aether Paradise", description: "An artificial island for Pokémon conservation" }
    ],
    gymLeaders: [
      { name: "Ilima (Trial)", city: "Melemele Island", type: "normal", badge: "Normalium Z" },
      { name: "Lana (Trial)", city: "Akala Island", type: "water", badge: "Waterium Z" },
      { name: "Kiawe (Trial)", city: "Akala Island", type: "fire", badge: "Firium Z" },
      { name: "Mallow (Trial)", city: "Akala Island", type: "grass", badge: "Grassium Z" },
      { name: "Sophocles (Trial)", city: "Ula'ula Island", type: "electric", badge: "Electrium Z" },
      { name: "Acerola (Trial)", city: "Ula'ula Island", type: "ghost", badge: "Ghostium Z" },
      { name: "Mina (Trial)", city: "Poni Island", type: "fairy", badge: "Fairium Z" }
    ],
    eliteFour: [
      { name: "Hala", type: "fighting", signature: "Crabominable" },
      { name: "Olivia", type: "rock", signature: "Lycanroc" },
      { name: "Acerola", type: "ghost", signature: "Palossand" },
      { name: "Kahili", type: "flying", signature: "Toucannon" }
    ],
    champion: { name: "Professor Kukui", team: "Varied", signature: "Incineroar" },
    trivia: [
      "Alola is based on Hawaii",
      "It replaced gyms with Island Trials",
      "Regional forms were introduced (Alolan Forms)",
      "Z-Moves replaced Mega Evolution as the battle gimmick"
    ]
  },
  galar: {
    id: "galar",
    name: "Galar",
    generation: 8,
    games: ["Sword", "Shield"],
    description: "An industrial region inspired by Great Britain. Features Dynamax battles in massive stadiums.",
    professor: "Professor Magnolia",
    starters: ["Grookey", "Scorbunny", "Sobble"],
    starterIds: [810, 813, 816],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Zacian", "Zamazenta", "Eternatus", "Kubfu", "Urshifu", "Zarude", "Regieleki", "Regidrago", "Glastrier", "Spectrier", "Calyrex"],
    legendaryIds: [888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898],
    cities: 11,
    routes: 10,
    pokemonRange: "810-898",
    color: "purple",
    bgColor: "from-purple-500 to-violet-400",
    map: '/images/scraped/maps/Galar_artwork.png',
    gradientFrom: "from-purple-500",
    gradientTo: "to-violet-400",
    locations: [
      { name: "Postwick", type: "town", description: "A small town with Pokemon research" },
      { name: "Motostoke", type: "city", description: "A steam-powered city" },
      { name: "Hammerlocke", type: "city", description: "A city with a historic castle" },
      { name: "Wyndon", type: "city", description: "The city hosting the Pokemon League" }
    ],
    landmarks: [
      { name: "Hammerlocke Stadium", description: "Home of the Dragon-type gym" },
      { name: "Wild Area", description: "A vast expanse of wilderness" },
      { name: "Crown Tundra", description: "A snowy region full of legends" }
    ],
    gymLeaders: [
      { name: "Milo", city: "Turffield", type: "grass", badge: "Grass Badge" },
      { name: "Nessa", city: "Hulbury", type: "water", badge: "Water Badge" },
      { name: "Kabu", city: "Motostoke", type: "fire", badge: "Fire Badge" },
      { name: "Bea/Allister", city: "Stow-on-Side", type: "fighting/ghost", badge: "Fighting/Ghost Badge" },
      { name: "Opal/Bede", city: "Ballonlea", type: "fairy", badge: "Fairy Badge" },
      { name: "Gordie/Melony", city: "Circhester", type: "rock/ice", badge: "Rock/Ice Badge" },
      { name: "Piers", city: "Spikemuth", type: "dark", badge: "Dark Badge" },
      { name: "Raihan", city: "Hammerlocke", type: "dragon", badge: "Dragon Badge" }
    ],
    eliteFour: [],
    champion: { name: "Leon", team: "Varied", signature: "Charizard" },
    trivia: [
      "Galar is based on the United Kingdom",
      "It introduced the Wild Area and Dynamax",
      "Gym battles are held in large stadiums",
      "There is no traditional Elite Four - just a Champion tournament"
    ]
  },
  paldea: {
    id: "paldea",
    name: "Paldea",
    generation: 9,
    games: ["Scarlet", "Violet"],
    description: "An open-world region inspired by the Iberian Peninsula. Features three intertwining storylines and the Terastal phenomenon.",
    professor: "Professor Sada/Turo",
    starters: ["Sprigatito", "Fuecoco", "Quaxly"],
    starterIds: [906, 909, 912],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Koraidon", "Miraidon", "Wo-Chien", "Chien-Pao", "Ting-Lu", "Chi-Yu", "Ogerpon", "Terapagos"],
    legendaryIds: [1007, 1008, 1001, 1002, 1003, 1004, 1017, 1024],
    cities: 10,
    routes: 0,
    pokemonRange: "906-1025",
    color: "violet",
    bgColor: "from-violet-500 to-purple-400",
    map: '/images/scraped/maps/Paldea_artwork.png',
    gradientFrom: "from-violet-500",
    gradientTo: "to-purple-400",
    locations: [
      { name: "Cabo Poco", type: "town", description: "A small coastal town" },
      { name: "Mesagoza", type: "city", description: "Home of the Naranja/Uva Academy" },
      { name: "Levincia", type: "city", description: "An electric city" },
      { name: "Cascarrafa", type: "city", description: "A water-themed city" }
    ],
    landmarks: [
      { name: "Area Zero", description: "The mysterious Great Crater of Paldea" },
      { name: "Naranja/Uva Academy", description: "The school where your adventure begins" },
      { name: "Titan Pokémon Locations", description: "Where powerful Titan Pokémon dwell" }
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
      "Paldea is based on the Iberian Peninsula (Spain/Portugal)",
      "It's the first fully open-world Pokémon game",
      "Features three storylines: Victory Road, Path of Legends, Starfall Street",
      "The Terastal phenomenon allows Pokémon to change types"
    ]
  }
};

// Starter Card Component
const StarterCard: React.FC<{ id: number; name: string; types: string[] }> = ({ id, name, types }) => (
  <Link href={`/pokedex/${id}`}>
    <Container variant="elevated" rounded="xl" className="p-4 text-center hover:scale-105 transition-transform cursor-pointer">
      <Image
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
        alt={name}
        width={120}
        height={120}
        className="mx-auto"
      />
      <h4 className="font-bold text-stone-800 dark:text-stone-100 mt-2">{name}</h4>
      <div className="flex justify-center gap-1 mt-2">
        {types.map(type => (
          <TypeBadge key={type} type={type} size="xs" />
        ))}
      </div>
    </Container>
  </Link>
);

// Legendary Card Component
const LegendaryCard: React.FC<{ id: number; name: string }> = ({ id, name }) => (
  <Link href={`/pokedex/${id}`}>
    <Container variant="elevated" rounded="lg" className="p-3 text-center hover:scale-105 transition-transform cursor-pointer">
      <Image
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
        alt={name}
        width={80}
        height={80}
        className="mx-auto"
      />
      <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mt-1 truncate">{name}</p>
    </Container>
  </Link>
);

// Gym Leader Card Component
const GymLeaderCard: React.FC<{ leader: GymLeader }> = ({ leader }) => (
  <Container variant="outline" rounded="lg" className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-bold text-stone-800 dark:text-stone-100">{leader.name}</h4>
        <p className="text-sm text-stone-600 dark:text-stone-400">{leader.city}</p>
      </div>
      <div className="text-right">
        <TypeBadge type={leader.type.split('/')[0]} size="sm" />
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{leader.badge}</p>
      </div>
    </div>
  </Container>
);

// Elite Four Card Component
const EliteFourCard: React.FC<{ member: EliteFourMember }> = ({ member }) => (
  <Container variant="elevated" rounded="lg" className="p-4 text-center">
    <TypeBadge type={member.type} size="sm" />
    <h4 className="font-bold text-stone-800 dark:text-stone-100 mt-2">{member.name}</h4>
    <p className="text-sm text-stone-600 dark:text-stone-400">Signature: {member.signature}</p>
  </Container>
);

export default function RegionDetailPage() {
  const router = useRouter();
  const { region: regionId } = router.query;

  const region = regionsData[regionId as string];
  const currentRegionIndex = regionOrder.indexOf(regionId as string);

  if (!region) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
        <Container variant="elevated" className="p-8 text-center">
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4">Region Not Found</h1>
          <p className="text-stone-600 dark:text-stone-400 mb-6">The region you're looking for doesn't exist.</p>
          <Link href="/pokemon/regions" className="text-purple-600 hover:text-purple-700 font-medium">
            ← Back to Regions
          </Link>
        </Container>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{region.name} Region | DexTrends</title>
        <meta name="description" content={region.description} />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950">
        {/* Hero Section */}
        <div className={`relative bg-gradient-to-br ${region.gradientFrom} ${region.gradientTo} py-16 md:py-24`}>
          {/* Map Background */}
          <div className="absolute inset-0 opacity-20">
            <Image src={region.map} alt={`${region.name} Map`} fill className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-8">
              <Link href="/pokemon/regions" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <FiChevronLeft className="w-5 h-5" />
                <span>All Regions</span>
              </Link>

              <div className="flex items-center gap-2">
                {currentRegionIndex > 0 && (
                  <button
                    onClick={() => router.push(`/pokemon/regions/${regionOrder[currentRegionIndex - 1]}`)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <span className="text-white/80 text-sm px-3">
                  {currentRegionIndex + 1} / {regionOrder.length}
                </span>
                {currentRegionIndex < regionOrder.length - 1 && (
                  <button
                    onClick={() => router.push(`/pokemon/regions/${regionOrder[currentRegionIndex + 1]}`)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="text-center">
              <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-white text-sm font-medium mb-4">
                Generation {region.generation}
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                {region.name}
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                {region.description}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm">
              <div className="text-center">
                <div className="font-bold text-stone-900 dark:text-stone-100">{region.pokemonRange}</div>
                <div className="text-stone-500 dark:text-stone-400">Pokédex</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-stone-900 dark:text-stone-100">{region.cities}</div>
                <div className="text-stone-500 dark:text-stone-400">Cities</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-stone-900 dark:text-stone-100">{region.gymLeaders?.length || 0}</div>
                <div className="text-stone-500 dark:text-stone-400">Gyms</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-stone-900 dark:text-stone-100">{region.legendaries.length}</div>
                <div className="text-stone-500 dark:text-stone-400">Legendaries</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Professor & Games */}
          <section>
            <div className="grid md:grid-cols-2 gap-6">
              <Container variant="elevated" rounded="xl" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FiUsers className="w-6 h-6 text-purple-500" />
                  <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Professor</h2>
                </div>
                <p className="text-2xl font-semibold text-stone-700 dark:text-stone-200">{region.professor}</p>
              </Container>

              <Container variant="elevated" rounded="xl" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FiBook className="w-6 h-6 text-blue-500" />
                  <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Games</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {region.games.map(game => (
                    <span key={game} className="px-3 py-1 bg-stone-100 dark:bg-stone-700 rounded-full text-sm text-stone-700 dark:text-stone-300">
                      {game}
                    </span>
                  ))}
                </div>
              </Container>
            </div>
          </section>

          {/* Starters */}
          <section>
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-3">
              <FiStar className="text-amber-500" />
              Starter Pokémon
            </h2>
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              {region.starters.map((starter, index) => (
                <StarterCard
                  key={starter}
                  id={region.starterIds[index]}
                  name={starter}
                  types={region.starterTypes[index]}
                />
              ))}
            </div>
          </section>

          {/* Legendaries */}
          <section>
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-3">
              <FiStar className="text-yellow-500" />
              Legendary Pokémon
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {region.legendaries.map((legendary, index) => (
                <LegendaryCard key={legendary} id={region.legendaryIds[index]} name={legendary} />
              ))}
            </div>
          </section>

          {/* Gym Leaders */}
          {region.gymLeaders && region.gymLeaders.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-3">
                <FiUsers className="text-red-500" />
                {region.id === 'alola' ? 'Trial Captains' : 'Gym Leaders'}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {region.gymLeaders.map(leader => (
                  <GymLeaderCard key={leader.name} leader={leader} />
                ))}
              </div>
            </section>
          )}

          {/* Elite Four */}
          {region.eliteFour && region.eliteFour.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-3">
                <FiStar className="text-purple-500" />
                Elite Four & Champion
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {region.eliteFour.map(member => (
                  <EliteFourCard key={member.name} member={member} />
                ))}
                {region.champion && (
                  <Container variant="featured" rounded="lg" className="p-4 text-center col-span-2 md:col-span-1">
                    <span className="text-xs uppercase tracking-wider text-amber-200">Champion</span>
                    <h4 className="font-bold text-white text-lg mt-1">{region.champion.name}</h4>
                    <p className="text-sm text-amber-200 mt-1">{region.champion.signature}</p>
                  </Container>
                )}
              </div>
            </section>
          )}

          {/* Locations */}
          {region.locations && (
            <section>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-3">
                <FiMapPin className="text-emerald-500" />
                Notable Locations
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {region.locations.map(location => (
                  <Container key={location.name} variant="outline" rounded="lg" className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <FiMapPin className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-800 dark:text-stone-100">{location.name}</h4>
                        <span className="text-xs uppercase text-stone-500 dark:text-stone-400">{location.type}</span>
                        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">{location.description}</p>
                      </div>
                    </div>
                  </Container>
                ))}
              </div>
            </section>
          )}

          {/* Landmarks */}
          {region.landmarks && (
            <section>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-3">
                <FiMap className="text-amber-500" />
                Landmarks
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {region.landmarks.map(landmark => (
                  <Container key={landmark.name} variant="elevated" rounded="lg" className="p-4">
                    <h4 className="font-bold text-stone-800 dark:text-stone-100">{landmark.name}</h4>
                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">{landmark.description}</p>
                  </Container>
                ))}
              </div>
            </section>
          )}

          {/* Trivia */}
          {region.trivia && (
            <section>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-3">
                <FiInfo className="text-blue-500" />
                Did You Know?
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {region.trivia.map((fact, index) => (
                  <Container key={index} variant="outline" rounded="lg" className="p-4">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                        {index + 1}
                      </span>
                      <p className="text-stone-700 dark:text-stone-300">{fact}</p>
                    </div>
                  </Container>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-stone-100 dark:bg-stone-800/50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              {currentRegionIndex > 0 ? (
                <Link
                  href={`/pokemon/regions/${regionOrder[currentRegionIndex - 1]}`}
                  className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                  <span className="capitalize">{regionOrder[currentRegionIndex - 1]}</span>
                </Link>
              ) : <div />}

              <Link
                href="/pokemon/regions"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
              >
                All Regions
              </Link>

              {currentRegionIndex < regionOrder.length - 1 ? (
                <Link
                  href={`/pokemon/regions/${regionOrder[currentRegionIndex + 1]}`}
                  className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                >
                  <span className="capitalize">{regionOrder[currentRegionIndex + 1]}</span>
                  <FiChevronRight className="w-5 h-5" />
                </Link>
              ) : <div />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
