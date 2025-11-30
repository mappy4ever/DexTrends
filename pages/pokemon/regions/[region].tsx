import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Container from "../../../components/ui/Container";
import { TypeBadge } from "../../../components/ui/TypeBadge";
import { FiChevronLeft, FiChevronRight, FiMapPin, FiMap, FiUsers, FiStar, FiBook, FiInfo, FiChevronDown, FiChevronUp, FiTarget, FiZap, FiShield, FiAward } from "react-icons/fi";

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

interface TeamPokemon {
  id: number;
  name: string;
  level?: number;
}

interface GymLeader {
  name: string;
  city: string;
  type: string;
  badge: string;
  team?: TeamPokemon[];
  strategy?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  funFact?: string;
}

interface EliteFourMember {
  name: string;
  type: string;
  signature: string;
  team?: TeamPokemon[];
  strategy?: string;
  title?: string;
}

interface Champion {
  name: string;
  team: string;
  signature: string;
  pokemonTeam?: TeamPokemon[];
  catchphrase?: string;
  difficulty?: string;
}

// Type effectiveness for counter recommendations
const typeWeaknesses: Record<string, string[]> = {
  normal: ['fighting'],
  fire: ['water', 'ground', 'rock'],
  water: ['electric', 'grass'],
  electric: ['ground'],
  grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
  ice: ['fire', 'fighting', 'rock', 'steel'],
  fighting: ['flying', 'psychic', 'fairy'],
  poison: ['ground', 'psychic'],
  ground: ['water', 'grass', 'ice'],
  flying: ['electric', 'ice', 'rock'],
  psychic: ['bug', 'ghost', 'dark'],
  bug: ['fire', 'flying', 'rock'],
  rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
  ghost: ['ghost', 'dark'],
  dragon: ['ice', 'dragon', 'fairy'],
  dark: ['fighting', 'bug', 'fairy'],
  steel: ['fire', 'fighting', 'ground'],
  fairy: ['poison', 'steel']
};

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
      { name: "Brock", city: "Pewter City", type: "rock", badge: "Boulder Badge",
        team: [{ id: 74, name: "Geodude", level: 12 }, { id: 95, name: "Onix", level: 14 }],
        strategy: "His Onix has high Defense. Use Water or Grass moves for super effective damage!",
        difficulty: "Easy", funFact: "Brock dreams of becoming a Pokemon Breeder" },
      { name: "Misty", city: "Cerulean City", type: "water", badge: "Cascade Badge",
        team: [{ id: 120, name: "Staryu", level: 18 }, { id: 121, name: "Starmie", level: 21 }],
        strategy: "Starmie is fast and strong! Electric and Grass types work great here.",
        difficulty: "Medium", funFact: "Misty is known as 'The Tomboyish Mermaid'" },
      { name: "Lt. Surge", city: "Vermilion City", type: "electric", badge: "Thunder Badge",
        team: [{ id: 100, name: "Voltorb", level: 21 }, { id: 25, name: "Pikachu", level: 18 }, { id: 26, name: "Raichu", level: 24 }],
        strategy: "Ground types are immune to Electric! Diglett from Diglett's Cave works perfectly.",
        difficulty: "Medium", funFact: "Lt. Surge is a war veteran from America" },
      { name: "Erika", city: "Celadon City", type: "grass", badge: "Rainbow Badge",
        team: [{ id: 71, name: "Victreebel", level: 29 }, { id: 114, name: "Tangela", level: 24 }, { id: 45, name: "Vileplume", level: 29 }],
        strategy: "Fire, Ice, Flying, or Poison moves demolish her team. Watch out for status moves!",
        difficulty: "Medium", funFact: "Erika often falls asleep during Pokemon battles" },
      { name: "Koga", city: "Fuchsia City", type: "poison", badge: "Soul Badge",
        team: [{ id: 109, name: "Koffing", level: 37 }, { id: 89, name: "Muk", level: 39 }, { id: 109, name: "Koffing", level: 37 }, { id: 110, name: "Weezing", level: 43 }],
        strategy: "Psychic and Ground types are super effective. Bring Antidotes for Toxic!",
        difficulty: "Hard", funFact: "Koga is a ninja master who later joins the Elite Four" },
      { name: "Sabrina", city: "Saffron City", type: "psychic", badge: "Marsh Badge",
        team: [{ id: 64, name: "Kadabra", level: 38 }, { id: 122, name: "Mr. Mime", level: 37 }, { id: 49, name: "Venomoth", level: 38 }, { id: 65, name: "Alakazam", level: 43 }],
        strategy: "Bug, Ghost, and Dark types are your friends. Her Alakazam hits HARD!",
        difficulty: "Very Hard", funFact: "Sabrina has powerful psychic abilities and can teleport" },
      { name: "Blaine", city: "Cinnabar Island", type: "fire", badge: "Volcano Badge",
        team: [{ id: 58, name: "Growlithe", level: 42 }, { id: 77, name: "Ponyta", level: 40 }, { id: 78, name: "Rapidash", level: 42 }, { id: 59, name: "Arcanine", level: 47 }],
        strategy: "Water, Ground, and Rock moves are essential. Surf works wonders here!",
        difficulty: "Hard", funFact: "Blaine is a Pokemon researcher who loves riddles" },
      { name: "Giovanni", city: "Viridian City", type: "ground", badge: "Earth Badge",
        team: [{ id: 111, name: "Rhyhorn", level: 45 }, { id: 51, name: "Dugtrio", level: 42 }, { id: 31, name: "Nidoqueen", level: 44 }, { id: 34, name: "Nidoking", level: 45 }, { id: 112, name: "Rhydon", level: 50 }],
        strategy: "Water and Grass types dominate. His Rhydon is his ace - don't underestimate it!",
        difficulty: "Very Hard", funFact: "Giovanni is the secret leader of Team Rocket" }
    ],
    eliteFour: [
      { name: "Lorelei", type: "ice", signature: "Lapras", title: "Ice Master",
        team: [{ id: 87, name: "Dewgong", level: 54 }, { id: 91, name: "Cloyster", level: 53 }, { id: 80, name: "Slowbro", level: 54 }, { id: 124, name: "Jynx", level: 56 }, { id: 131, name: "Lapras", level: 56 }],
        strategy: "Electric and Fighting moves work well. Watch out for Water moves on your Fire types!" },
      { name: "Bruno", type: "fighting", signature: "Machamp", title: "Fighting Expert",
        team: [{ id: 95, name: "Onix", level: 53 }, { id: 107, name: "Hitmonchan", level: 55 }, { id: 106, name: "Hitmonlee", level: 55 }, { id: 95, name: "Onix", level: 56 }, { id: 68, name: "Machamp", level: 58 }],
        strategy: "Psychic and Flying types are super effective. His Onix are weak to Water and Grass!" },
      { name: "Agatha", type: "ghost", signature: "Gengar", title: "Ghost Specialist",
        team: [{ id: 94, name: "Gengar", level: 56 }, { id: 42, name: "Golbat", level: 56 }, { id: 93, name: "Haunter", level: 55 }, { id: 24, name: "Arbok", level: 58 }, { id: 94, name: "Gengar", level: 60 }],
        strategy: "Ground and Psychic moves are key. Her Gengar can be tricky with Hypnosis!" },
      { name: "Lance", type: "dragon", signature: "Dragonite", title: "Dragon Master",
        team: [{ id: 130, name: "Gyarados", level: 58 }, { id: 148, name: "Dragonair", level: 56 }, { id: 148, name: "Dragonair", level: 56 }, { id: 142, name: "Aerodactyl", level: 60 }, { id: 149, name: "Dragonite", level: 62 }],
        strategy: "Ice moves are 4x effective on Dragonite! Electric works on Gyarados." }
    ],
    champion: { name: "Blue", team: "Varied", signature: "Varied",
      pokemonTeam: [{ id: 18, name: "Pidgeot", level: 61 }, { id: 65, name: "Alakazam", level: 59 }, { id: 112, name: "Rhydon", level: 61 }, { id: 130, name: "Gyarados", level: 61 }, { id: 59, name: "Arcanine", level: 63 }, { id: 103, name: "Exeggutor", level: 61 }],
      catchphrase: "Smell ya later!", difficulty: "Champion" },
    trivia: [
      "Kanto is based on the real Kantō region of Japan, including Tokyo!",
      "It was the first region introduced in the Pokémon series in 1996",
      "The Safari Zone was a unique feature for catching rare Pokémon like Chansey and Tauros",
      "Team Rocket's headquarters is hidden in the Celadon Game Corner",
      "Lavender Town's eerie music became a famous urban legend among fans",
      "Mew was secretly added to the game just two weeks before launch",
      "The S.S. Anne only appears once - miss it and it's gone forever!",
      "Mewtwo was created in the Pokémon Mansion on Cinnabar Island"
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
      "Johto is based on the Kansai region of Japan, including Kyoto and Osaka",
      "It introduced Pokemon breeding, eggs, and baby Pokemon like Pichu and Togepi!",
      "The three Legendary Beasts were revived by Ho-Oh after the Brass Tower fire",
      "After beating Johto, you can travel to Kanto - getting 16 badges total!",
      "Whitney's Miltank is infamous for being one of the hardest gym battles ever",
      "The Ruins of Alph contain mysterious Unown - there are 28 different forms!",
      "The Day/Night cycle was introduced in these games for the first time",
      "Celebi can only be obtained through special events or glitches"
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
      "Sinnoh is based on Hokkaido, Japan's northernmost main island",
      "Mt. Coronet divides the region - some Pokemon only appear on one side!",
      "Cynthia is considered one of the strongest and most beloved Champions ever",
      "The Underground let players dig for fossils and secret treasures together",
      "Arceus, the 'God of Pokemon', was created in this generation",
      "Dialga controls time, Palkia controls space, and Giratina rules the Distortion World",
      "The Sinnoh games introduced online trading with players worldwide via WiFi",
      "The Great Marsh is Sinnoh's Safari Zone, featuring binoculars to spot rare Pokemon"
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

// Difficulty badge colors
const difficultyColors: Record<string, string> = {
  'Easy': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Hard': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Very Hard': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Champion': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
};

// Gym Leader Card Component - Expandable with Pokemon avatar
const GymLeaderCard: React.FC<{ leader: GymLeader; gymNumber: number }> = ({ leader, gymNumber }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const primaryType = leader.type.split('/')[0];
  const weaknesses = typeWeaknesses[primaryType] || [];

  // Get the ace Pokemon (last in team, usually strongest) for the avatar
  const acePokemon = leader.team && leader.team.length > 0
    ? leader.team[leader.team.length - 1]
    : null;

  return (
    <Container
      variant="outline"
      rounded="lg"
      className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${isExpanded ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header - Always visible */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Gym Leader Avatar with Ace Pokemon */}
          <div className="relative">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-${primaryType === 'fire' ? 'orange-400' : primaryType === 'water' ? 'blue-400' : primaryType === 'grass' ? 'green-400' : primaryType === 'electric' ? 'yellow-400' : primaryType === 'psychic' ? 'pink-400' : primaryType === 'fighting' ? 'red-400' : primaryType === 'rock' ? 'amber-600' : primaryType === 'ground' ? 'amber-500' : primaryType === 'poison' ? 'purple-400' : primaryType === 'ghost' ? 'purple-600' : primaryType === 'ice' ? 'cyan-400' : primaryType === 'dragon' ? 'indigo-500' : primaryType === 'dark' ? 'stone-700' : primaryType === 'steel' ? 'slate-400' : primaryType === 'fairy' ? 'pink-400' : primaryType === 'bug' ? 'lime-500' : primaryType === 'flying' ? 'indigo-400' : 'stone-400'} to-white/30 flex items-center justify-center overflow-hidden shadow-md`}>
              {acePokemon ? (
                <Image
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${acePokemon.id}.png`}
                  alt={acePokemon.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <span className="text-white font-bold text-lg">{gymNumber}</span>
              )}
            </div>
            {/* Gym Number Badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white dark:border-stone-800">
              {gymNumber}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-stone-800 dark:text-stone-100">{leader.name}</h4>
            <p className="text-sm text-stone-600 dark:text-stone-400">{leader.city}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <TypeBadge type={primaryType} size="sm" />
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{leader.badge}</p>
          </div>
          {isExpanded ? <FiChevronUp className="text-stone-400" /> : <FiChevronDown className="text-stone-400" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 space-y-4" onClick={(e) => e.stopPropagation()}>
          {/* Difficulty */}
          {leader.difficulty && (
            <div className="flex items-center gap-2">
              <FiTarget className="text-stone-400" />
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColors[leader.difficulty]}`}>
                {leader.difficulty}
              </span>
            </div>
          )}

          {/* Pokemon Team */}
          {leader.team && leader.team.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-2">
                <FiUsers className="text-blue-500" /> Team
              </h5>
              <div className="flex flex-wrap gap-2">
                {leader.team.map((pokemon, idx) => (
                  <Link key={idx} href={`/pokedex/${pokemon.id}`} className="block">
                    <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-700 rounded-lg px-2 py-1 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors">
                      <Image
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                        alt={pokemon.name}
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                      <div>
                        <span className="text-xs font-medium text-stone-800 dark:text-stone-200">{pokemon.name}</span>
                        {pokemon.level && <span className="text-xs text-stone-500 ml-1">Lv.{pokemon.level}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Counter Types */}
          {weaknesses.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-2">
                <FiZap className="text-yellow-500" /> Super Effective Types
              </h5>
              <div className="flex flex-wrap gap-1">
                {weaknesses.map(type => (
                  <TypeBadge key={type} type={type} size="xs" />
                ))}
              </div>
            </div>
          )}

          {/* Strategy */}
          {leader.strategy && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
              <h5 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-2">
                <FiShield className="text-amber-500" /> Battle Strategy
              </h5>
              <p className="text-sm text-amber-700 dark:text-amber-400">{leader.strategy}</p>
            </div>
          )}

          {/* Fun Fact */}
          {leader.funFact && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <h5 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2">
                <FiInfo className="text-blue-500" /> Did You Know?
              </h5>
              <p className="text-sm text-blue-700 dark:text-blue-400">{leader.funFact}</p>
            </div>
          )}
        </div>
      )}
    </Container>
  );
};

// Elite Four Card Component - Expandable with ace Pokemon image
const EliteFourCard: React.FC<{ member: EliteFourMember; position: number }> = ({ member, position }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const weaknesses = typeWeaknesses[member.type] || [];

  // Get the ace Pokemon (last in team) for the avatar
  const acePokemon = member.team && member.team.length > 0
    ? member.team[member.team.length - 1]
    : null;

  return (
    <Container
      variant="elevated"
      rounded="lg"
      className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${isExpanded ? 'ring-2 ring-purple-400 dark:ring-purple-500' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header with Ace Pokemon Image */}
      <div className="text-center">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs text-stone-400 dark:text-stone-500">#{position}</span>
          {isExpanded ? <FiChevronUp className="text-stone-400" /> : <FiChevronDown className="text-stone-400" />}
        </div>

        {/* Ace Pokemon Avatar */}
        {acePokemon && (
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-purple-200 dark:ring-purple-700">
              <Image
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${acePokemon.id}.png`}
                alt={acePokemon.name}
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
          </div>
        )}

        <TypeBadge type={member.type} size="sm" />
        <h4 className="font-bold text-stone-800 dark:text-stone-100 mt-2">{member.name}</h4>
        {member.title && <p className="text-xs text-purple-600 dark:text-purple-400">{member.title}</p>}
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">Ace: {member.signature}</p>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* Pokemon Team */}
          {member.team && member.team.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">Full Team</h5>
              <div className="grid grid-cols-3 gap-1">
                {member.team.map((pokemon, idx) => (
                  <Link key={idx} href={`/pokedex/${pokemon.id}`} className="block text-center">
                    <div className="bg-stone-100 dark:bg-stone-700 rounded-lg p-1 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors">
                      <Image
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                        alt={pokemon.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 mx-auto"
                      />
                      <span className="text-[10px] text-stone-600 dark:text-stone-400 block truncate">{pokemon.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Counter Types */}
          {weaknesses.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Weak To</h5>
              <div className="flex flex-wrap gap-1 justify-center">
                {weaknesses.slice(0, 3).map(type => (
                  <TypeBadge key={type} type={type} size="xs" />
                ))}
              </div>
            </div>
          )}

          {/* Strategy */}
          {member.strategy && (
            <p className="text-xs text-stone-600 dark:text-stone-400 text-center italic">{member.strategy}</p>
          )}
        </div>
      )}
    </Container>
  );
};

// Champion Card Component - Expandable with ace Pokemon image
const ChampionCard: React.FC<{ champion: Champion }> = ({ champion }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get the ace Pokemon (last in team) for the avatar
  const acePokemon = champion.pokemonTeam && champion.pokemonTeam.length > 0
    ? champion.pokemonTeam[champion.pokemonTeam.length - 1]
    : null;

  return (
    <Container
      variant="featured"
      rounded="lg"
      className={`p-4 text-center cursor-pointer transition-all duration-300 col-span-2 md:col-span-1 ${isExpanded ? 'ring-2 ring-yellow-400' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <FiAward className="text-yellow-300 w-5 h-5" />
        {isExpanded ? <FiChevronUp className="text-white/70" /> : <FiChevronDown className="text-white/70" />}
      </div>

      {/* Ace Pokemon Avatar */}
      {acePokemon && (
        <div className="flex justify-center my-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-yellow-300/50">
            <Image
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${acePokemon.id}.png`}
              alt={acePokemon.name}
              width={72}
              height={72}
              className="object-contain"
            />
          </div>
        </div>
      )}

      <span className="text-xs uppercase tracking-wider text-amber-200">Champion</span>
      <h4 className="font-bold text-white text-lg mt-1">{champion.name}</h4>
      <p className="text-sm text-amber-200 mt-1">Ace: {champion.signature}</p>
      {champion.catchphrase && (
        <p className="text-xs text-white/70 italic mt-2">&quot;{champion.catchphrase}&quot;</p>
      )}

      {/* Expanded Content */}
      {isExpanded && champion.pokemonTeam && (
        <div className="mt-4 pt-4 border-t border-white/20 space-y-3" onClick={(e) => e.stopPropagation()}>
          <h5 className="text-xs font-semibold text-amber-200">Champion's Team</h5>
          <div className="grid grid-cols-3 gap-2">
            {champion.pokemonTeam.map((pokemon, idx) => (
              <Link key={idx} href={`/pokedex/${pokemon.id}`} className="block">
                <div className="bg-white/10 rounded-lg p-2 hover:bg-white/20 transition-colors">
                  <Image
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                    alt={pokemon.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 mx-auto"
                  />
                  <span className="text-[10px] text-white/80 block truncate">{pokemon.name}</span>
                  {pokemon.level && <span className="text-[9px] text-amber-300">Lv.{pokemon.level}</span>}
                </div>
              </Link>
            ))}
          </div>
          {champion.difficulty && (
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColors[champion.difficulty]}`}>
              {champion.difficulty} Difficulty
            </span>
          )}
        </div>
      )}
    </Container>
  );
};

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

        {/* Quick Stats Bar - positioned below navbar */}
        <div className="bg-[#FFFDF7] dark:bg-stone-900 shadow-sm sticky top-14 md:top-16 z-20">
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

          {/* Region Map Showcase */}
          <section>
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-3">
              <FiMap className="text-emerald-500" />
              Explore {region.name}
            </h2>
            <Container variant="elevated" rounded="xl" className="p-6 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                {/* Map Image */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-inner">
                  <Image
                    src={region.map}
                    alt={`${region.name} Region Map`}
                    fill
                    className="object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>

                {/* Map Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
                      The {region.name} Region
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                      {region.description}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-stone-100 dark:bg-stone-700 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{region.cities}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">Cities & Towns</div>
                    </div>
                    <div className="bg-stone-100 dark:bg-stone-700 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{region.routes || 'Open'}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">{region.routes > 0 ? 'Routes' : 'World'}</div>
                    </div>
                    <div className="bg-stone-100 dark:bg-stone-700 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{region.gymLeaders?.length || 0}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">{region.id === 'alola' ? 'Trials' : 'Gyms'}</div>
                    </div>
                    <div className="bg-stone-100 dark:bg-stone-700 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{region.legendaries.length}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">Legendaries</div>
                    </div>
                  </div>

                  {/* Generation Badge */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${region.gradientFrom} ${region.gradientTo} text-white font-medium`}>
                    <FiStar className="w-4 h-4" />
                    Generation {region.generation} • {region.pokemonRange}
                  </div>
                </div>
              </div>
            </Container>
          </section>

          {/* Gym Leaders */}
          {region.gymLeaders && region.gymLeaders.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2 flex items-center gap-3">
                <FiUsers className="text-red-500" />
                {region.id === 'alola' ? 'Trial Captains' : 'Gym Leaders'}
              </h2>
              <p className="text-stone-600 dark:text-stone-400 mb-6 text-sm">
                Click on any {region.id === 'alola' ? 'Trial Captain' : 'Gym Leader'} to see their team, strategy tips, and fun facts!
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {region.gymLeaders.map((leader, index) => (
                  <GymLeaderCard key={leader.name} leader={leader} gymNumber={index + 1} />
                ))}
              </div>
            </section>
          )}

          {/* Elite Four */}
          {region.eliteFour && region.eliteFour.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2 flex items-center gap-3">
                <FiStar className="text-purple-500" />
                Elite Four & Champion
              </h2>
              <p className="text-stone-600 dark:text-stone-400 mb-6 text-sm">
                Click to reveal their full teams and battle strategies!
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {region.eliteFour.map((member, index) => (
                  <EliteFourCard key={member.name} member={member} position={index + 1} />
                ))}
                {region.champion && (
                  <ChampionCard champion={region.champion} />
                )}
              </div>
            </section>
          )}

          {/* Region without Elite Four but has Champion */}
          {(!region.eliteFour || region.eliteFour.length === 0) && region.champion && (
            <section>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2 flex items-center gap-3">
                <FiAward className="text-amber-500" />
                Champion
              </h2>
              <p className="text-stone-600 dark:text-stone-400 mb-6 text-sm">
                Click to reveal the Champion's full team!
              </p>
              <div className="max-w-sm">
                <ChampionCard champion={region.champion} />
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

          {/* Trivia & Fun Facts */}
          {region.trivia && (
            <section>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2 flex items-center gap-3">
                <FiInfo className="text-blue-500" />
                Fun Facts & Trivia
              </h2>
              <p className="text-stone-600 dark:text-stone-400 mb-6 text-sm">
                Interesting facts every {region.name} trainer should know!
              </p>
              <Container variant="elevated" rounded="xl" className="p-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {region.trivia.map((fact, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-shrink-0">
                        <span className="flex w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 items-center justify-center text-white font-bold shadow-lg">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{fact}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Region Summary Stats */}
                <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-700">
                  <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4 text-center">
                    {region.name} at a Glance
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    <div className="text-center px-6 py-3 bg-stone-100 dark:bg-stone-700 rounded-xl">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <FiBook className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="font-bold text-stone-800 dark:text-stone-100">{region.games.length}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">Games</div>
                    </div>
                    <div className="text-center px-6 py-3 bg-stone-100 dark:bg-stone-700 rounded-xl">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <FiUsers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="font-bold text-stone-800 dark:text-stone-100">{region.professor.split(' ')[1]}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">Professor</div>
                    </div>
                    <div className="text-center px-6 py-3 bg-stone-100 dark:bg-stone-700 rounded-xl">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <FiAward className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="font-bold text-stone-800 dark:text-stone-100">{region.champion?.name || 'Various'}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">Champion</div>
                    </div>
                    <div className="text-center px-6 py-3 bg-stone-100 dark:bg-stone-700 rounded-xl">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <FiStar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="font-bold text-stone-800 dark:text-stone-100">Gen {region.generation}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">Generation</div>
                    </div>
                  </div>
                </div>
              </Container>
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
