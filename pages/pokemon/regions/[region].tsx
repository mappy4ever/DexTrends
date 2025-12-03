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
      { name: "Falkner", city: "Violet City", type: "flying", badge: "Zephyr Badge",
        team: [{ id: 16, name: "Pidgey", level: 7 }, { id: 17, name: "Pidgeotto", level: 9 }],
        strategy: "Rock and Electric types destroy his team. Geodude from Dark Cave is perfect!",
        difficulty: "Easy", funFact: "Falkner's father was the previous Violet City Gym Leader" },
      { name: "Bugsy", city: "Azalea Town", type: "bug", badge: "Hive Badge",
        team: [{ id: 11, name: "Metapod", level: 14 }, { id: 14, name: "Kakuna", level: 14 }, { id: 123, name: "Scyther", level: 16 }],
        strategy: "Fire, Flying, or Rock moves work great. Watch out for Scyther's U-turn!",
        difficulty: "Easy", funFact: "Bugsy is often mistaken for a girl due to his appearance" },
      { name: "Whitney", city: "Goldenrod City", type: "normal", badge: "Plain Badge",
        team: [{ id: 35, name: "Clefairy", level: 17 }, { id: 241, name: "Miltank", level: 19 }],
        strategy: "Fighting types are key! Her Miltank's Rollout can sweep - stop it early or use Protect!",
        difficulty: "Very Hard", funFact: "Whitney cries when she loses and doesn't give the badge at first" },
      { name: "Morty", city: "Ecruteak City", type: "ghost", badge: "Fog Badge",
        team: [{ id: 92, name: "Gastly", level: 21 }, { id: 93, name: "Haunter", level: 21 }, { id: 93, name: "Haunter", level: 23 }, { id: 94, name: "Gengar", level: 25 }],
        strategy: "Normal moves don't work! Use Dark types or Pokemon with Foresight.",
        difficulty: "Medium", funFact: "Morty can see the future and seeks to encounter Ho-Oh" },
      { name: "Chuck", city: "Cianwood City", type: "fighting", badge: "Storm Badge",
        team: [{ id: 57, name: "Primeape", level: 27 }, { id: 62, name: "Poliwrath", level: 30 }],
        strategy: "Flying and Psychic types dominate. His Poliwrath knows Hypnosis - bring Awakenings!",
        difficulty: "Medium", funFact: "Chuck trains under waterfalls and his wife complains he forgets to eat" },
      { name: "Jasmine", city: "Olivine City", type: "steel", badge: "Mineral Badge",
        team: [{ id: 81, name: "Magnemite", level: 30 }, { id: 81, name: "Magnemite", level: 30 }, { id: 208, name: "Steelix", level: 35 }],
        strategy: "Fire, Fighting, and Ground moves are super effective. Her Steelix is bulky!",
        difficulty: "Hard", funFact: "Jasmine appears in Sinnoh at Sunyshore City's contest hall" },
      { name: "Pryce", city: "Mahogany Town", type: "ice", badge: "Glacier Badge",
        team: [{ id: 86, name: "Seel", level: 27 }, { id: 87, name: "Dewgong", level: 29 }, { id: 221, name: "Piloswine", level: 31 }],
        strategy: "Fire, Fighting, Rock, or Steel moves work well. His Piloswine has Ground coverage!",
        difficulty: "Medium", funFact: "Pryce is the oldest gym leader and has been training for 50 years" },
      { name: "Clair", city: "Blackthorn City", type: "dragon", badge: "Rising Badge",
        team: [{ id: 148, name: "Dragonair", level: 37 }, { id: 148, name: "Dragonair", level: 37 }, { id: 148, name: "Dragonair", level: 37 }, { id: 230, name: "Kingdra", level: 40 }],
        strategy: "Ice moves for Dragonair! Kingdra only fears Dragon - use your own Dragon types.",
        difficulty: "Very Hard", funFact: "Clair is Lance's cousin and initially refuses to give you the badge" }
    ],
    eliteFour: [
      { name: "Will", type: "psychic", signature: "Xatu", title: "Psychic Master",
        team: [{ id: 178, name: "Xatu", level: 40 }, { id: 124, name: "Jynx", level: 41 }, { id: 103, name: "Exeggutor", level: 41 }, { id: 80, name: "Slowbro", level: 41 }, { id: 178, name: "Xatu", level: 42 }],
        strategy: "Dark, Bug, and Ghost moves are super effective. His Xatu can be tricky with Confuse Ray!" },
      { name: "Koga", type: "poison", signature: "Crobat", title: "Poison Ninja",
        team: [{ id: 168, name: "Ariados", level: 40 }, { id: 49, name: "Venomoth", level: 41 }, { id: 205, name: "Forretress", level: 43 }, { id: 89, name: "Muk", level: 42 }, { id: 169, name: "Crobat", level: 44 }],
        strategy: "Ground and Psychic moves work well. Bring Antidotes - Toxic is everywhere!" },
      { name: "Bruno", type: "fighting", signature: "Machamp", title: "Fighting Expert",
        team: [{ id: 106, name: "Hitmonlee", level: 42 }, { id: 107, name: "Hitmonchan", level: 42 }, { id: 237, name: "Hitmontop", level: 42 }, { id: 95, name: "Onix", level: 43 }, { id: 68, name: "Machamp", level: 46 }],
        strategy: "Flying and Psychic types sweep! His Onix is weak to Water and Grass instead." },
      { name: "Karen", type: "dark", signature: "Umbreon", title: "Dark Type Master",
        team: [{ id: 197, name: "Umbreon", level: 42 }, { id: 45, name: "Vileplume", level: 42 }, { id: 94, name: "Gengar", level: 45 }, { id: 229, name: "Houndoom", level: 47 }, { id: 198, name: "Murkrow", level: 44 }],
        strategy: "Fighting types dominate. Her team is diverse - bring coverage moves!" }
    ],
    champion: { name: "Lance", team: "Dragon", signature: "Dragonite",
      pokemonTeam: [{ id: 130, name: "Gyarados", level: 46 }, { id: 149, name: "Dragonite", level: 49 }, { id: 149, name: "Dragonite", level: 49 }, { id: 149, name: "Dragonite", level: 49 }, { id: 142, name: "Aerodactyl", level: 48 }, { id: 6, name: "Charizard", level: 48 }],
      catchphrase: "I've been Pokemon Champion for a long time now!", difficulty: "Champion" },
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
      { name: "Roxanne", city: "Rustboro City", type: "rock", badge: "Stone Badge",
        team: [{ id: 74, name: "Geodude", level: 12 }, { id: 74, name: "Geodude", level: 12 }, { id: 299, name: "Nosepass", level: 15 }],
        strategy: "Water, Grass, or Fighting types make this easy. Nosepass has Magnet Pull - watch Steel types!",
        difficulty: "Easy", funFact: "Roxanne is the head of the Pokémon Trainer's School" },
      { name: "Brawly", city: "Dewford Town", type: "fighting", badge: "Knuckle Badge",
        team: [{ id: 66, name: "Machop", level: 16 }, { id: 296, name: "Makuhita", level: 19 }],
        strategy: "Flying and Psychic moves are super effective. Ralts from Route 102 is helpful!",
        difficulty: "Medium", funFact: "Brawly trains in dark caves to strengthen his focus" },
      { name: "Wattson", city: "Mauville City", type: "electric", badge: "Dynamo Badge",
        team: [{ id: 100, name: "Voltorb", level: 20 }, { id: 309, name: "Electrike", level: 20 }, { id: 82, name: "Magneton", level: 22 }, { id: 310, name: "Manectric", level: 24 }],
        strategy: "Ground types are immune to Electric! Marshtomp is perfect for this gym.",
        difficulty: "Medium", funFact: "Wattson loves to laugh and enjoys making people happy with his inventions" },
      { name: "Flannery", city: "Lavaridge Town", type: "fire", badge: "Heat Badge",
        team: [{ id: 218, name: "Slugma", level: 24 }, { id: 218, name: "Slugma", level: 24 }, { id: 323, name: "Camerupt", level: 26 }, { id: 324, name: "Torkoal", level: 28 }],
        strategy: "Water and Ground types dominate. Her Torkoal has Overheat - it gets weaker each use!",
        difficulty: "Medium", funFact: "Flannery is the newest gym leader, inheriting the position from her grandfather" },
      { name: "Norman", city: "Petalburg City", type: "normal", badge: "Balance Badge",
        team: [{ id: 289, name: "Slaking", level: 28 }, { id: 288, name: "Vigoroth", level: 30 }, { id: 289, name: "Slaking", level: 31 }],
        strategy: "Fighting types are key! Slaking loafs every other turn - exploit that with setup moves!",
        difficulty: "Hard", funFact: "Norman is your character's father - the only dad to appear in the main series games" },
      { name: "Winona", city: "Fortree City", type: "flying", badge: "Feather Badge",
        team: [{ id: 333, name: "Swablu", level: 29 }, { id: 357, name: "Tropius", level: 29 }, { id: 279, name: "Pelipper", level: 30 }, { id: 277, name: "Swellow", level: 31 }, { id: 334, name: "Altaria", level: 33 }],
        strategy: "Ice moves are 4x effective on Altaria! Electric types handle most of her team.",
        difficulty: "Hard", funFact: "Winona is known as 'the bird user taking flight into the world'" },
      { name: "Tate & Liza", city: "Mossdeep City", type: "psychic", badge: "Mind Badge",
        team: [{ id: 337, name: "Lunatone", level: 42 }, { id: 338, name: "Solrock", level: 42 }],
        strategy: "This is a Double Battle! Dark, Bug, and Ghost moves are super effective. Target one at a time!",
        difficulty: "Hard", funFact: "Tate & Liza are twins who finish each other's sentences" },
      { name: "Wallace", city: "Sootopolis City", type: "water", badge: "Rain Badge",
        team: [{ id: 370, name: "Luvdisc", level: 40 }, { id: 340, name: "Whiscash", level: 42 }, { id: 119, name: "Seaking", level: 42 }, { id: 364, name: "Sealeo", level: 43 }, { id: 350, name: "Milotic", level: 46 }],
        strategy: "Electric and Grass types work well. Milotic has Recover - hit it hard and fast!",
        difficulty: "Very Hard", funFact: "Wallace was the Champion in Emerald before Steven returned" }
    ],
    eliteFour: [
      { name: "Sidney", type: "dark", signature: "Absol", title: "Dark Type Expert",
        team: [{ id: 274, name: "Mightyena", level: 46 }, { id: 275, name: "Shiftry", level: 48 }, { id: 332, name: "Cacturne", level: 46 }, { id: 319, name: "Sharpedo", level: 48 }, { id: 359, name: "Absol", level: 49 }],
        strategy: "Fighting types dominate! Bug and Fairy also work well. Watch for Sharpedo's Speed Boost!" },
      { name: "Phoebe", type: "ghost", signature: "Dusclops", title: "Ghost Specialist",
        team: [{ id: 354, name: "Banette", level: 48 }, { id: 354, name: "Banette", level: 49 }, { id: 356, name: "Dusclops", level: 51 }, { id: 302, name: "Sableye", level: 50 }, { id: 356, name: "Dusclops", level: 51 }],
        strategy: "Dark types are your best bet. Sableye has no weaknesses - just hit it hard!" },
      { name: "Glacia", type: "ice", signature: "Glalie", title: "Ice Queen",
        team: [{ id: 362, name: "Glalie", level: 50 }, { id: 364, name: "Sealeo", level: 50 }, { id: 364, name: "Sealeo", level: 52 }, { id: 362, name: "Glalie", level: 52 }, { id: 365, name: "Walrein", level: 53 }],
        strategy: "Fire, Fighting, Rock, and Steel moves are super effective. Her Walrein is bulky!" },
      { name: "Drake", type: "dragon", signature: "Salamence", title: "Dragon Master",
        team: [{ id: 372, name: "Shelgon", level: 52 }, { id: 334, name: "Altaria", level: 54 }, { id: 330, name: "Flygon", level: 53 }, { id: 330, name: "Flygon", level: 53 }, { id: 373, name: "Salamence", level: 55 }],
        strategy: "Ice moves are 4x effective on most of his team! Dragon and Fairy also work well." }
    ],
    champion: { name: "Steven", team: "Steel", signature: "Metagross",
      pokemonTeam: [{ id: 227, name: "Skarmory", level: 57 }, { id: 344, name: "Claydol", level: 55 }, { id: 306, name: "Aggron", level: 56 }, { id: 346, name: "Cradily", level: 56 }, { id: 348, name: "Armaldo", level: 56 }, { id: 376, name: "Metagross", level: 58 }],
      catchphrase: "I see... Your Pokemon have gained the trust of their Trainer!", difficulty: "Champion" },
    trivia: [
      "Hoenn is based on the Kyushu region of Japan (rotated 90°)",
      "It introduced Double Battles to the series",
      "Weather conditions play a major role in the storyline",
      "The region has the most water routes of any region",
      "Groudon and Kyogre represent land and sea in ancient conflict",
      "Secret Bases let players create their own hideouts",
      "The Trick House has 8 increasingly difficult puzzles to solve",
      "Rayquaza calms the weather trio from the Sky Pillar"
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
      { name: "Roark", city: "Oreburgh City", type: "rock", badge: "Coal Badge",
        team: [{ id: 74, name: "Geodude", level: 12 }, { id: 95, name: "Onix", level: 12 }, { id: 408, name: "Cranidos", level: 14 }],
        strategy: "Water, Grass, or Fighting types work perfectly. His Cranidos hits hard but is frail!",
        difficulty: "Easy", funFact: "Roark is Byron's son and works in the Oreburgh Mine" },
      { name: "Gardenia", city: "Eterna City", type: "grass", badge: "Forest Badge",
        team: [{ id: 420, name: "Cherubi", level: 19 }, { id: 315, name: "Roserade", level: 19 }, { id: 388, name: "Grotle", level: 22 }],
        strategy: "Fire, Ice, Flying, or Poison types are super effective. Her Roserade can be tricky!",
        difficulty: "Medium", funFact: "Gardenia is afraid of ghosts despite loving Grass types" },
      { name: "Maylene", city: "Veilstone City", type: "fighting", badge: "Cobble Badge",
        team: [{ id: 307, name: "Meditite", level: 27 }, { id: 66, name: "Machoke", level: 27 }, { id: 448, name: "Lucario", level: 30 }],
        strategy: "Flying and Psychic types dominate. Her Lucario has Steel typing - use Ground or Fire!",
        difficulty: "Medium", funFact: "Maylene often trains barefoot and is very young for a gym leader" },
      { name: "Crasher Wake", city: "Pastoria City", type: "water", badge: "Fen Badge",
        team: [{ id: 130, name: "Gyarados", level: 27 }, { id: 195, name: "Quagsire", level: 27 }, { id: 419, name: "Floatzel", level: 30 }],
        strategy: "Electric for Gyarados and Floatzel! Grass for Quagsire. Watch for Gyarados's Intimidate!",
        difficulty: "Medium", funFact: "Crasher Wake is a famous pro wrestler in the Pokemon world" },
      { name: "Fantina", city: "Hearthome City", type: "ghost", badge: "Relic Badge",
        team: [{ id: 426, name: "Drifblim", level: 32 }, { id: 94, name: "Gengar", level: 34 }, { id: 429, name: "Mismagius", level: 36 }],
        strategy: "Dark types are great! Her Gengar has Hypnosis - bring Chesto Berries or Awakenings.",
        difficulty: "Hard", funFact: "Fantina is originally from another region and speaks with an accent" },
      { name: "Byron", city: "Canalave City", type: "steel", badge: "Mine Badge",
        team: [{ id: 82, name: "Magneton", level: 37 }, { id: 208, name: "Steelix", level: 38 }, { id: 411, name: "Bastiodon", level: 41 }],
        strategy: "Fire, Fighting, and Ground moves are key. Bastiodon has massive Defense - use special attacks!",
        difficulty: "Hard", funFact: "Byron is Roark's father and they have a rocky relationship" },
      { name: "Candice", city: "Snowpoint City", type: "ice", badge: "Icicle Badge",
        team: [{ id: 215, name: "Sneasel", level: 40 }, { id: 221, name: "Piloswine", level: 40 }, { id: 460, name: "Abomasnow", level: 42 }, { id: 478, name: "Froslass", level: 44 }],
        strategy: "Fire and Fighting types excel here. Her Abomasnow summons Hail - watch your HP!",
        difficulty: "Hard", funFact: "Candice is best friends with Maylene and helps Platinum in the manga" },
      { name: "Volkner", city: "Sunyshore City", type: "electric", badge: "Beacon Badge",
        team: [{ id: 26, name: "Raichu", level: 46 }, { id: 466, name: "Electivire", level: 48 }, { id: 405, name: "Luxray", level: 48 }, { id: 135, name: "Jolteon", level: 50 }],
        strategy: "Ground types are immune! His Electivire has Motor Drive - don't use Electric moves on it!",
        difficulty: "Very Hard", funFact: "Volkner was bored with weak challengers until you showed up" }
    ],
    eliteFour: [
      { name: "Aaron", type: "bug", signature: "Drapion", title: "Bug Type Master",
        team: [{ id: 267, name: "Dustox", level: 53 }, { id: 269, name: "Beautifly", level: 53 }, { id: 416, name: "Vespiquen", level: 54 }, { id: 214, name: "Heracross", level: 54 }, { id: 452, name: "Drapion", level: 57 }],
        strategy: "Fire and Flying types work well on most. Drapion isn't Bug type - use Ground instead!" },
      { name: "Bertha", type: "ground", signature: "Hippowdon", title: "Ground Specialist",
        team: [{ id: 195, name: "Quagsire", level: 55 }, { id: 76, name: "Golem", level: 56 }, { id: 340, name: "Whiscash", level: 55 }, { id: 464, name: "Rhyperior", level: 57 }, { id: 450, name: "Hippowdon", level: 59 }],
        strategy: "Grass types are 4x effective on most! Water also works. Her Hippowdon sets up Sandstorm." },
      { name: "Flint", type: "fire", signature: "Infernape", title: "Fire Expert",
        team: [{ id: 78, name: "Rapidash", level: 58 }, { id: 208, name: "Steelix", level: 57 }, { id: 426, name: "Drifblim", level: 58 }, { id: 428, name: "Lopunny", level: 57 }, { id: 392, name: "Infernape", level: 61 }],
        strategy: "His team is diverse! Water for Fire types, but bring coverage for his other Pokemon." },
      { name: "Lucian", type: "psychic", signature: "Gallade", title: "Psychic Master",
        team: [{ id: 122, name: "Mr. Mime", level: 59 }, { id: 437, name: "Bronzong", level: 60 }, { id: 65, name: "Alakazam", level: 60 }, { id: 196, name: "Espeon", level: 60 }, { id: 475, name: "Gallade", level: 63 }],
        strategy: "Dark types are ideal! Bug and Ghost also work. Bronzong has Levitate - Ground won't work!" }
    ],
    champion: { name: "Cynthia", team: "Varied", signature: "Garchomp",
      pokemonTeam: [{ id: 442, name: "Spiritomb", level: 61 }, { id: 407, name: "Roserade", level: 60 }, { id: 448, name: "Lucario", level: 63 }, { id: 350, name: "Milotic", level: 63 }, { id: 468, name: "Togekiss", level: 60 }, { id: 445, name: "Garchomp", level: 66 }],
      catchphrase: "When every life meets another life, something will be born!", difficulty: "Champion" },
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
      { name: "Cilan", city: "Striaton City", type: "grass", badge: "Trio Badge",
        team: [{ id: 505, name: "Lillipup", level: 12 }, { id: 511, name: "Pansage", level: 14 }],
        strategy: "Fire types destroy his team! The monkey you receive counters perfectly.",
        difficulty: "Easy", funFact: "Cilan is one of three brothers - you fight the one your starter is weak to" },
      { name: "Lenora", city: "Nacrene City", type: "normal", badge: "Basic Badge",
        team: [{ id: 507, name: "Herdier", level: 18 }, { id: 505, name: "Watchog", level: 20 }],
        strategy: "Fighting types are super effective! Her Watchog has Hypnosis - bring Awakenings!",
        difficulty: "Medium", funFact: "Lenora runs the Nacrene City Museum alongside her gym" },
      { name: "Burgh", city: "Castelia City", type: "bug", badge: "Insect Badge",
        team: [{ id: 540, name: "Swadloon", level: 21 }, { id: 557, name: "Dwebble", level: 21 }, { id: 542, name: "Leavanny", level: 23 }],
        strategy: "Fire and Flying types excel! Rock types also work well against his team.",
        difficulty: "Medium", funFact: "Burgh is a famous artist whose gym looks like a honeycomb" },
      { name: "Elesa", city: "Nimbasa City", type: "electric", badge: "Bolt Badge",
        team: [{ id: 587, name: "Emolga", level: 25 }, { id: 587, name: "Emolga", level: 25 }, { id: 523, name: "Zebstrika", level: 27 }],
        strategy: "Ground types are immune! Her Emolga have Flying - use Ice or Rock moves instead!",
        difficulty: "Hard", funFact: "Elesa is a famous supermodel and fashion icon in Unova" },
      { name: "Clay", city: "Driftveil City", type: "ground", badge: "Quake Badge",
        team: [{ id: 552, name: "Krokorok", level: 29 }, { id: 536, name: "Palpitoad", level: 29 }, { id: 530, name: "Excadrill", level: 31 }],
        strategy: "Water and Grass types are 4x effective on most! His Excadrill has Steel typing.",
        difficulty: "Hard", funFact: "Clay is a successful mining tycoon with a thick accent" },
      { name: "Skyla", city: "Mistralton City", type: "flying", badge: "Jet Badge",
        team: [{ id: 521, name: "Unfezant", level: 33 }, { id: 581, name: "Swanna", level: 33 }, { id: 528, name: "Swoobat", level: 35 }],
        strategy: "Electric and Rock types work great! Ice is also effective on Unfezant and Swanna.",
        difficulty: "Medium", funFact: "Skyla is a cargo pilot who loves flying more than anything" },
      { name: "Brycen", city: "Icirrus City", type: "ice", badge: "Freeze Badge",
        team: [{ id: 615, name: "Cryogonal", level: 37 }, { id: 614, name: "Beartic", level: 37 }, { id: 615, name: "Cryogonal", level: 39 }],
        strategy: "Fire, Fighting, Rock, and Steel moves are super effective. Cryogonal is specially defensive!",
        difficulty: "Hard", funFact: "Brycen was a famous movie star before becoming a gym leader" },
      { name: "Drayden", city: "Opelucid City", type: "dragon", badge: "Legend Badge",
        team: [{ id: 621, name: "Druddigon", level: 41 }, { id: 612, name: "Haxorus", level: 43 }, { id: 621, name: "Druddigon", level: 41 }],
        strategy: "Ice moves are super effective! Dragon and Fairy also work well. His Haxorus hits HARD!",
        difficulty: "Very Hard", funFact: "Drayden is the mayor of Opelucid City and has an impressive beard" }
    ],
    eliteFour: [
      { name: "Shauntal", type: "ghost", signature: "Chandelure", title: "Ghost Writer",
        team: [{ id: 563, name: "Cofagrigus", level: 48 }, { id: 593, name: "Jellicent", level: 48 }, { id: 623, name: "Golurk", level: 48 }, { id: 609, name: "Chandelure", level: 50 }],
        strategy: "Dark types are great! Her Chandelure has insane Special Attack - be careful!" },
      { name: "Grimsley", type: "dark", signature: "Bisharp", title: "Dark Gambler",
        team: [{ id: 510, name: "Liepard", level: 48 }, { id: 553, name: "Krookodile", level: 48 }, { id: 560, name: "Scrafty", level: 48 }, { id: 625, name: "Bisharp", level: 50 }],
        strategy: "Fighting types are 4x effective on Bisharp and Scrafty! Bug and Fairy also work." },
      { name: "Caitlin", type: "psychic", signature: "Gothitelle", title: "Psychic Elite",
        team: [{ id: 518, name: "Musharna", level: 48 }, { id: 576, name: "Gothitelle", level: 50 }, { id: 561, name: "Sigilyph", level: 48 }, { id: 579, name: "Reuniclus", level: 48 }],
        strategy: "Dark, Bug, and Ghost moves are super effective. She appeared in Gen 4's Battle Frontier!" },
      { name: "Marshal", type: "fighting", signature: "Mienshao", title: "Fighting Master",
        team: [{ id: 534, name: "Conkeldurr", level: 48 }, { id: 538, name: "Throh", level: 48 }, { id: 539, name: "Sawk", level: 48 }, { id: 620, name: "Mienshao", level: 50 }],
        strategy: "Flying and Psychic types dominate! His Mienshao is incredibly fast!" }
    ],
    champion: { name: "Alder", team: "Varied", signature: "Volcarona",
      pokemonTeam: [{ id: 617, name: "Accelgor", level: 75 }, { id: 589, name: "Escavalier", level: 75 }, { id: 626, name: "Bouffalant", level: 75 }, { id: 637, name: "Volcarona", level: 77 }, { id: 604, name: "Druddigon", level: 75 }, { id: 612, name: "Vanilluxe", level: 75 }],
      catchphrase: "The Pokemon League exists to train and strengthen Pokemon and Trainers!", difficulty: "Champion" },
    trivia: [
      "Unova is the first region based on a location outside Japan (New York City)",
      "It features 156 new Pokémon, the most of any generation",
      "Seasons were introduced for the first time - some areas change completely!",
      "Black 2 and White 2 were direct sequels set 2 years later",
      "N is one of the most complex rivals - he sees Pokemon as friends, not tools",
      "The Entralink allowed players to visit each other's worlds",
      "Musical performances were a unique feature in Black and White",
      "Castelia City is based on Lower Manhattan and is the largest city in any Pokemon game"
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
      { name: "Viola", city: "Santalune City", type: "bug", badge: "Bug Badge",
        team: [{ id: 283, name: "Surskit", level: 10 }, { id: 666, name: "Vivillon", level: 12 }],
        strategy: "Fire, Flying, and Rock types work great! Her Vivillon's Infestation can trap you.",
        difficulty: "Easy", funFact: "Viola is a professional photographer who loves taking pictures of Bug types" },
      { name: "Grant", city: "Cyllage City", type: "rock", badge: "Cliff Badge",
        team: [{ id: 698, name: "Amaura", level: 25 }, { id: 697, name: "Tyrunt", level: 25 }],
        strategy: "Fighting, Ground, Steel, and Water are 4x effective on both! Easy gym.",
        difficulty: "Easy", funFact: "Grant is an avid rock climber who built his gym on a climbing wall" },
      { name: "Korrina", city: "Shalour City", type: "fighting", badge: "Rumble Badge",
        team: [{ id: 674, name: "Mienfoo", level: 29 }, { id: 701, name: "Hawlucha", level: 32 }, { id: 448, name: "Lucario", level: 30 }],
        strategy: "Flying and Psychic types work! She gives you Mega Lucario after winning.",
        difficulty: "Medium", funFact: "Korrina is the granddaughter of the Mega Evolution guru" },
      { name: "Ramos", city: "Coumarine City", type: "grass", badge: "Plant Badge",
        team: [{ id: 189, name: "Jumpluff", level: 30 }, { id: 673, name: "Gogoat", level: 31 }, { id: 154, name: "Weepinbell", level: 31 }],
        strategy: "Fire, Ice, Flying, and Poison are super effective. His Gogoat is bulky!",
        difficulty: "Medium", funFact: "Ramos is an elderly gardener who tends to a massive garden" },
      { name: "Clemont", city: "Lumiose City", type: "electric", badge: "Voltage Badge",
        team: [{ id: 587, name: "Emolga", level: 35 }, { id: 82, name: "Magneton", level: 35 }, { id: 695, name: "Heliolisk", level: 37 }],
        strategy: "Ground types are immune! His Heliolisk's Dry Skin heals from Water - use Grass instead!",
        difficulty: "Medium", funFact: "Clemont is an inventor who built his own robot gym leader" },
      { name: "Valerie", city: "Laverre City", type: "fairy", badge: "Fairy Badge",
        team: [{ id: 303, name: "Mawile", level: 38 }, { id: 122, name: "Mr. Mime", level: 39 }, { id: 700, name: "Sylveon", level: 42 }],
        strategy: "Poison and Steel types are super effective! Her Sylveon has high Special Defense.",
        difficulty: "Hard", funFact: "Valerie is a famous fashion designer who makes clothes inspired by Pokemon" },
      { name: "Olympia", city: "Anistar City", type: "psychic", badge: "Psychic Badge",
        team: [{ id: 561, name: "Sigilyph", level: 44 }, { id: 80, name: "Slowking", level: 45 }, { id: 678, name: "Meowstic", level: 48 }],
        strategy: "Dark, Bug, and Ghost moves are super effective. Her Meowstic is tricky!",
        difficulty: "Hard", funFact: "Olympia can see the future and speaks in mysterious riddles" },
      { name: "Wulfric", city: "Snowbelle City", type: "ice", badge: "Iceberg Badge",
        team: [{ id: 460, name: "Abomasnow", level: 56 }, { id: 615, name: "Cryogonal", level: 55 }, { id: 713, name: "Avalugg", level: 59 }],
        strategy: "Fire, Fighting, Rock, and Steel are super effective. His Avalugg has huge Defense!",
        difficulty: "Very Hard", funFact: "Wulfric has a warm personality despite specializing in Ice types" }
    ],
    eliteFour: [
      { name: "Malva", type: "fire", signature: "Talonflame", title: "Fire Elite",
        team: [{ id: 668, name: "Pyroar", level: 63 }, { id: 324, name: "Torkoal", level: 63 }, { id: 609, name: "Chandelure", level: 63 }, { id: 663, name: "Talonflame", level: 65 }],
        strategy: "Water, Ground, and Rock moves are super effective. Her Talonflame is fast!" },
      { name: "Siebold", type: "water", signature: "Barbaracle", title: "Water Chef",
        team: [{ id: 121, name: "Starmie", level: 63 }, { id: 130, name: "Gyarados", level: 63 }, { id: 91, name: "Clawitzer", level: 63 }, { id: 689, name: "Barbaracle", level: 65 }],
        strategy: "Electric and Grass types work well! His Barbaracle has Rock typing - Ground works!" },
      { name: "Wikstrom", type: "steel", signature: "Aegislash", title: "Steel Knight",
        team: [{ id: 82, name: "Klefki", level: 63 }, { id: 227, name: "Probopass", level: 63 }, { id: 212, name: "Scizor", level: 63 }, { id: 681, name: "Aegislash", level: 65 }],
        strategy: "Fire, Fighting, and Ground are super effective! Watch Aegislash's Stance Change!" },
      { name: "Drasna", type: "dragon", signature: "Noivern", title: "Dragon Elder",
        team: [{ id: 691, name: "Dragalge", level: 63 }, { id: 334, name: "Altaria", level: 63 }, { id: 715, name: "Noivern", level: 63 }, { id: 621, name: "Druddigon", level: 65 }],
        strategy: "Ice, Dragon, and Fairy moves are super effective. Ice is 4x on Noivern and Altaria!" }
    ],
    champion: { name: "Diantha", team: "Varied", signature: "Gardevoir",
      pokemonTeam: [{ id: 701, name: "Hawlucha", level: 64 }, { id: 699, name: "Aurorus", level: 65 }, { id: 706, name: "Goodra", level: 66 }, { id: 711, name: "Gourgeist", level: 65 }, { id: 697, name: "Tyrantrum", level: 65 }, { id: 282, name: "Gardevoir", level: 68 }],
      catchphrase: "Battling is about expression and communication!", difficulty: "Champion" },
    trivia: [
      "Kalos is based on northern France, especially Paris",
      "It introduced Mega Evolution and the Fairy type",
      "Lumiose City is based on Paris with its own Eiffel Tower",
      "The first games to feature full 3D graphics and character customization",
      "Team Flare's leader Lysandre wanted to create a 'beautiful world' by destroying everything",
      "Pokémon-Amie let you pet and feed your Pokemon for the first time",
      "The ultimate weapon was built 3,000 years ago by King AZ",
      "The famous 'Espurr stare' meme came from this generation"
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
      { name: "Ilima (Trial)", city: "Melemele Island", type: "normal", badge: "Normalium Z",
        team: [{ id: 734, name: "Yungoos", level: 11 }, { id: 735, name: "Gumshoos (Totem)", level: 12 }],
        strategy: "The Totem Gumshoos calls allies! Focus it down fast with Fighting-types before it snowballs.",
        difficulty: "Easy", funFact: "Ilima was once offered a spot in the Elite Four but prefers being a Trial Captain" },
      { name: "Lana (Trial)", city: "Akala Island", type: "water", badge: "Waterium Z",
        team: [{ id: 746, name: "Wishiwashi (Totem)", level: 20 }],
        strategy: "Wishiwashi's School Form is powerful but weak to Grass/Electric. One good hit can break its form!",
        difficulty: "Medium", funFact: "Lana loves to tell tall tales and trick people with her deadpan humor" },
      { name: "Kiawe (Trial)", city: "Akala Island", type: "fire", badge: "Firium Z",
        team: [{ id: 105, name: "Alolan Marowak (Totem)", level: 22 }, { id: 757, name: "Salandit", level: 19 }],
        strategy: "Alolan Marowak is Fire/Ghost - use Water or Dark types! Watch out for its Flame Wheel.",
        difficulty: "Medium", funFact: "Kiawe works at his family's farm and performs traditional Alolan fire dances" },
      { name: "Mallow (Trial)", city: "Akala Island", type: "grass", badge: "Grassium Z",
        team: [{ id: 754, name: "Lurantis (Totem)", level: 24 }, { id: 764, name: "Comfey", level: 22 }],
        strategy: "Lurantis hits hard with Solar Blade in sun! Fire or Flying types work best. Poison is super effective too.",
        difficulty: "Hard", funFact: "Mallow dreams of becoming a great chef like her late mother" },
      { name: "Sophocles (Trial)", city: "Ula'ula Island", type: "electric", badge: "Electrium Z",
        team: [{ id: 737, name: "Charjabug", level: 27 }, { id: 738, name: "Vikavolt (Totem)", level: 29 }],
        strategy: "Vikavolt is Bug/Electric - Ground types are immune to Electric! Rock moves work great too.",
        difficulty: "Medium", funFact: "Sophocles is a tech genius who built the Festival Plaza system" },
      { name: "Acerola (Trial)", city: "Ula'ula Island", type: "ghost", badge: "Ghostium Z",
        team: [{ id: 778, name: "Mimikyu (Totem)", level: 33 }, { id: 355, name: "Duskull", level: 30 }],
        strategy: "Mimikyu's Disguise blocks one hit! Use a weak move to break it, then hit hard with Ghost/Dark.",
        difficulty: "Hard", funFact: "Acerola is a descendant of ancient Alolan royalty and lives in the Aether House" },
      { name: "Mina (Trial)", city: "Poni Island", type: "fairy", badge: "Fairium Z",
        team: [{ id: 743, name: "Ribombee (Totem)", level: 55 }],
        strategy: "Ribombee is fast and hits hard with Pollen Puff. Steel or Poison types are your best counter.",
        difficulty: "Hard", funFact: "Mina is an artist who spaces out often - her trial was added in Ultra Sun/Moon" }
    ],
    eliteFour: [
      { name: "Hala", type: "fighting", signature: "Crabominable", title: "Island Kahuna",
        team: [{ id: 297, name: "Hariyama", level: 54 }, { id: 62, name: "Poliwrath", level: 54 }, { id: 534, name: "Conkeldurr", level: 54 }, { id: 740, name: "Crabominable", level: 55 }],
        strategy: "Hala's team is pure Fighting with some coverage. Psychic and Flying types excel here, but watch Poliwrath!" },
      { name: "Olivia", type: "rock", signature: "Lycanroc", title: "Island Kahuna",
        team: [{ id: 476, name: "Probopass", level: 54 }, { id: 526, name: "Gigalith", level: 54 }, { id: 699, name: "Aurorus", level: 54 }, { id: 745, name: "Lycanroc", level: 55 }],
        strategy: "Rock types have many weaknesses! Water, Grass, Fighting, Ground, and Steel all work. Watch for Aurorus' Ice!" },
      { name: "Acerola", type: "ghost", signature: "Palossand", title: "Trial Captain",
        team: [{ id: 302, name: "Sableye", level: 54 }, { id: 426, name: "Drifblim", level: 54 }, { id: 354, name: "Banette", level: 54 }, { id: 770, name: "Palossand", level: 55 }],
        strategy: "Ghost types are weak to Ghost and Dark. Sableye has no weaknesses unless you have Fairy moves!" },
      { name: "Kahili", type: "flying", signature: "Toucannon", title: "Golf Pro",
        team: [{ id: 227, name: "Skarmory", level: 54 }, { id: 398, name: "Staraptor", level: 54 }, { id: 279, name: "Pelipper", level: 54 }, { id: 733, name: "Toucannon", level: 55 }],
        strategy: "Electric types sweep most of her team! Ice works too, but beware Skarmory's Steel typing and Pelipper's Water." }
    ],
    champion: { name: "Professor Kukui", team: "Varied", signature: "Incineroar",
      pokemonTeam: [{ id: 103, name: "Alolan Exeggutor", level: 56 }, { id: 745, name: "Lycanroc", level: 56 }, { id: 128, name: "Tauros", level: 56 }, { id: 727, name: "Incineroar", level: 58 }, { id: 730, name: "Primarina", level: 58 }, { id: 724, name: "Decidueye", level: 58 }],
      catchphrase: "Get Pokemon in position... then boom! It's your Pokemon's time to shine!", difficulty: "Champion" },
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
      { name: "Milo", city: "Turffield", type: "grass", badge: "Grass Badge",
        team: [{ id: 829, name: "Gossifleur", level: 19 }, { id: 830, name: "Eldegoss", level: 20 }],
        strategy: "Fire, Ice, and Flying crush Milo's team. His Eldegoss will Dynamax - hit it hard and fast!",
        difficulty: "Easy", funFact: "Milo is incredibly strong and carries bales of hay as his daily workout" },
      { name: "Nessa", city: "Hulbury", type: "water", badge: "Water Badge",
        team: [{ id: 833, name: "Chewtle", level: 22 }, { id: 846, name: "Arrokuda", level: 23 }, { id: 834, name: "Drednaw", level: 24 }],
        strategy: "Electric and Grass types excel! Drednaw is Rock/Water, so Grass is 4x effective! Watch for its Dynamax.",
        difficulty: "Medium", funFact: "Nessa is both a Gym Leader and a famous fashion model" },
      { name: "Kabu", city: "Motostoke", type: "fire", badge: "Fire Badge",
        team: [{ id: 758, name: "Salazzle", level: 25 }, { id: 631, name: "Heatmor", level: 25 }, { id: 851, name: "Centiskorch", level: 27 }],
        strategy: "Ground types are ideal - immune to Electric moves from Centiskorch! Water and Rock work great too.",
        difficulty: "Hard", funFact: "Kabu is from Hoenn and is known as the first major wall for new trainers" },
      { name: "Bea", city: "Stow-on-Side", type: "fighting", badge: "Fighting Badge",
        team: [{ id: 107, name: "Hitmontop", level: 34 }, { id: 701, name: "Hawlucha", level: 34 }, { id: 870, name: "Falinks", level: 35 }, { id: 865, name: "Sirfetch'd", level: 36 }],
        strategy: "Flying and Psychic dominate! Hawlucha is Fighting/Flying - use Ice or Fairy. Her Sirfetch'd hits incredibly hard!",
        difficulty: "Hard", funFact: "Bea trains in the mountains and rarely shows emotion, but loves sweets" },
      { name: "Allister", city: "Stow-on-Side", type: "ghost", badge: "Ghost Badge",
        team: [{ id: 778, name: "Mimikyu", level: 34 }, { id: 710, name: "Pumpkaboo", level: 34 }, { id: 711, name: "Gourgeist", level: 35 }, { id: 863, name: "Cursola", level: 36 }],
        strategy: "Dark types are your best bet! Remember Mimikyu's Disguise blocks one hit. Cursola can hit hard!",
        difficulty: "Hard", funFact: "Allister is extremely shy and never removes his mask in public" },
      { name: "Opal", city: "Ballonlea", type: "fairy", badge: "Fairy Badge",
        team: [{ id: 303, name: "Mawile", level: 36 }, { id: 78, name: "Galarian Weezing", level: 36 }, { id: 869, name: "Alcremie", level: 38 }],
        strategy: "Steel types resist Fairy and hit back hard! Poison works too. Watch her quiz - right answers boost your stats!",
        difficulty: "Medium", funFact: "Opal is 88 years old and is looking for a successor - she chose Bede" },
      { name: "Gordie", city: "Circhester", type: "rock", badge: "Rock Badge",
        team: [{ id: 111, name: "Rhyhorn", level: 40 }, { id: 558, name: "Crustle", level: 40 }, { id: 874, name: "Stonjourner", level: 41 }, { id: 839, name: "Coalossal", level: 42 }],
        strategy: "Water and Grass are 4x effective on multiple Pokemon! Fighting, Ground, Steel all work well too.",
        difficulty: "Medium", funFact: "Gordie and his mother Melony don't speak due to their different career paths" },
      { name: "Melony", city: "Circhester", type: "ice", badge: "Ice Badge",
        team: [{ id: 131, name: "Lapras", level: 40 }, { id: 875, name: "Eiscue", level: 40 }, { id: 873, name: "Frosmoth", level: 41 }, { id: 872, name: "Snom", level: 42 }],
        strategy: "Fire and Fighting types excel! Steel is great too. Eiscue's Ice Face blocks physical hits once.",
        difficulty: "Medium", funFact: "Melony has 5 children and is estranged from her son Gordie over their paths" },
      { name: "Piers", city: "Spikemuth", type: "dark", badge: "Dark Badge",
        team: [{ id: 862, name: "Obstagoon", level: 44 }, { id: 510, name: "Liepard", level: 45 }, { id: 435, name: "Skuntank", level: 45 }, { id: 861, name: "Grimmsnarl", level: 46 }],
        strategy: "Fighting types are super effective! Bug and Fairy work too. Piers doesn't Dynamax - no stadium!",
        difficulty: "Medium", funFact: "Piers is also a rock star and is Marnie's older brother - he refuses to Dynamax on principle" },
      { name: "Raihan", city: "Hammerlocke", type: "dragon", badge: "Dragon Badge",
        team: [{ id: 844, name: "Sandaconda", level: 46 }, { id: 526, name: "Gigalith", level: 46 }, { id: 884, name: "Duraludon", level: 48 }, { id: 330, name: "Flygon", level: 47 }],
        strategy: "Ice and Fairy counter his Dragons! Duraludon is Steel/Dragon - Ground is 4x effective! He uses sandstorm!",
        difficulty: "Very Hard", funFact: "Raihan is Leon's self-proclaimed rival and a social media influencer" }
    ],
    eliteFour: [],
    champion: { name: "Leon", team: "Varied", signature: "Charizard",
      pokemonTeam: [{ id: 879, name: "Mr. Rime", level: 62 }, { id: 851, name: "Centiskorch", level: 62 }, { id: 861, name: "Grimmsnarl", level: 62 }, { id: 839, name: "Coalossal", level: 63 }, { id: 887, name: "Dragapult", level: 63 }, { id: 6, name: "Charizard", level: 65 }],
      catchphrase: "Let's have a champion time!", difficulty: "Champion" },
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
      { name: "Katy", city: "Cortondo", type: "bug", badge: "Bug Badge",
        team: [{ id: 963, name: "Nymble", level: 14 }, { id: 917, name: "Tarountula", level: 14 }, { id: 919, name: "Teddiursa", level: 15 }],
        strategy: "Fire, Flying, and Rock types crush Bug! Her Teddiursa will Terastallize to Bug - keep your counters ready!",
        difficulty: "Easy", funFact: "Katy runs a famous bakery and makes Pokemon-themed pastries" },
      { name: "Brassius", city: "Artazon", type: "grass", badge: "Grass Badge",
        team: [{ id: 928, name: "Petilil", level: 16 }, { id: 948, name: "Smoliv", level: 16 }, { id: 950, name: "Sudowoodo", level: 17 }],
        strategy: "Fire and Ice dominate! His Sudowoodo Terastallizes to Grass - it's actually Rock type normally!",
        difficulty: "Easy", funFact: "Brassius is a famous artist whose work is displayed in Artazon's outdoor gallery" },
      { name: "Iono", city: "Levincia", type: "electric", badge: "Electric Badge",
        team: [{ id: 915, name: "Wattrel", level: 23 }, { id: 922, name: "Bellibolt", level: 23 }, { id: 81, name: "Luxio", level: 23 }, { id: 923, name: "Mismagius", level: 24 }],
        strategy: "Ground types are immune to Electric! Her Mismagius Terastallizes to Electric - hit it before it transforms!",
        difficulty: "Medium", funFact: "Iono is a hugely popular streamer and influencer called 'Supercharged Streamer'" },
      { name: "Kofu", city: "Cascarrafa", type: "water", badge: "Water Badge",
        team: [{ id: 771, name: "Veluza", level: 29 }, { id: 961, name: "Wugtrio", level: 29 }, { id: 131, name: "Crabominable", level: 30 }],
        strategy: "Electric and Grass work great! Crabominable Terastallizes to Water - it's Fighting/Ice normally!",
        difficulty: "Medium", funFact: "Kofu is an eccentric chef who gets so passionate about cooking he forgets gym battles" },
      { name: "Larry", city: "Medali", type: "normal", badge: "Normal Badge",
        team: [{ id: 931, name: "Komala", level: 35 }, { id: 938, name: "Dudunsparce", level: 35 }, { id: 189, name: "Staraptor", level: 36 }],
        strategy: "Fighting types are super effective! Staraptor Terastallizes to Normal - it's Flying normally!",
        difficulty: "Medium", funFact: "Larry is the most relatable gym leader - he's just a tired office worker who happens to be strong" },
      { name: "Ryme", city: "Montenevera", type: "ghost", badge: "Ghost Badge",
        team: [{ id: 354, name: "Banette", level: 41 }, { id: 778, name: "Mimikyu", level: 41 }, { id: 711, name: "Houndstone", level: 41 }, { id: 970, name: "Toxtricity", level: 42 }],
        strategy: "Dark types are best! Ghost also works. Her Toxtricity Terastallizes to Ghost - it's Poison/Electric normally!",
        difficulty: "Hard", funFact: "Ryme is a legendary rapper and DJ, and is Tyme's (the math teacher's) grandmother" },
      { name: "Tulip", city: "Alfornada", type: "psychic", badge: "Psychic Badge",
        team: [{ id: 196, name: "Farigiraf", level: 44 }, { id: 678, name: "Espathra", level: 44 }, { id: 518, name: "Gardevoir", level: 44 }, { id: 956, name: "Florges", level: 45 }],
        strategy: "Bug, Ghost, and Dark types counter Psychic! Florges Terastallizes to Psychic - it's Fairy normally!",
        difficulty: "Hard", funFact: "Tulip is a famous makeup artist and model who considers battles as beauty competitions" },
      { name: "Grusha", city: "Glaseado", type: "ice", badge: "Ice Badge",
        team: [{ id: 873, name: "Frosmoth", level: 47 }, { id: 713, name: "Beartic", level: 47 }, { id: 875, name: "Cetitan", level: 47 }, { id: 969, name: "Altaria", level: 48 }],
        strategy: "Fire, Fighting, Rock, Steel all work! Altaria Terastallizes to Ice - it's Dragon/Flying normally!",
        difficulty: "Hard", funFact: "Grusha was a pro snowboarder until an injury, and now battles with the same intensity" }
    ],
    eliteFour: [
      { name: "Rika", type: "ground", signature: "Clodsire", title: "Interview Specialist",
        team: [{ id: 450, name: "Whiscash", level: 57 }, { id: 843, name: "Camerupt", level: 57 }, { id: 968, name: "Donphan", level: 57 }, { id: 530, name: "Dugtrio", level: 57 }, { id: 980, name: "Clodsire", level: 58 }],
        strategy: "Water, Grass, and Ice are super effective! Many of her Pokemon have secondary types - check before attacking!" },
      { name: "Poppy", type: "steel", signature: "Tinkaton", title: "Youngest Elite Four",
        team: [{ id: 205, name: "Copperajah", level: 58 }, { id: 879, name: "Corviknight", level: 58 }, { id: 462, name: "Magnezone", level: 58 }, { id: 884, name: "Bronzong", level: 58 }, { id: 959, name: "Tinkaton", level: 59 }],
        strategy: "Fire, Fighting, and Ground hit Steel hard! Watch for type combos - Corviknight is Steel/Flying!" },
      { name: "Larry", type: "flying", signature: "Flamigo", title: "Normal by Day, Elite by Night",
        team: [{ id: 189, name: "Tropius", level: 59 }, { id: 528, name: "Staraptor", level: 59 }, { id: 468, name: "Altaria", level: 59 }, { id: 923, name: "Oricorio", level: 59 }, { id: 973, name: "Flamigo", level: 60 }],
        strategy: "Electric, Ice, and Rock counter Flying! He's the same Larry from the Normal gym - now using Flying types!" },
      { name: "Hassel", type: "dragon", signature: "Baxcalibur", title: "Art Teacher",
        team: [{ id: 706, name: "Noivern", level: 60 }, { id: 887, name: "Dragalge", level: 60 }, { id: 330, name: "Flapple", level: 60 }, { id: 103, name: "Haxorus", level: 60 }, { id: 998, name: "Baxcalibur", level: 61 }],
        strategy: "Ice and Fairy devastate Dragons! Dragon also works but is risky. Baxcalibur is Dragon/Ice - Fighting is 4x!" }
    ],
    champion: { name: "Geeta", team: "Varied", signature: "Glimmora",
      pokemonTeam: [{ id: 450, name: "Espathra", level: 61 }, { id: 526, name: "Gogoat", level: 61 }, { id: 771, name: "Veluza", level: 61 }, { id: 398, name: "Avalugg", level: 61 }, { id: 530, name: "Kingambit", level: 62 }, { id: 970, name: "Glimmora", level: 62 }],
      catchphrase: "Let's give the audience a pokemon battle worth watching!", difficulty: "Champion" },
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
            <p className="text-sm text-stone-600 dark:text-stone-300">{leader.city}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <TypeBadge type={primaryType} size="sm" />
            <p className="text-xs text-stone-500 dark:text-stone-300 mt-1">{leader.badge}</p>
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
        <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">Ace: {member.signature}</p>
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
                      <span className="text-[10px] text-stone-600 dark:text-stone-300 block truncate">{pokemon.name}</span>
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
            <p className="text-xs text-stone-600 dark:text-stone-300 text-center italic">{member.strategy}</p>
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
          <p className="text-stone-600 dark:text-stone-300 mb-6">The region you're looking for doesn't exist.</p>
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
                <div className="text-stone-500 dark:text-stone-300">Pokédex</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-stone-900 dark:text-stone-100">{region.cities}</div>
                <div className="text-stone-500 dark:text-stone-300">Cities</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-stone-900 dark:text-stone-100">{region.gymLeaders?.length || 0}</div>
                <div className="text-stone-500 dark:text-stone-300">Gyms</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-stone-900 dark:text-stone-100">{region.legendaries.length}</div>
                <div className="text-stone-500 dark:text-stone-300">Legendaries</div>
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
                    <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                      {region.description}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-stone-100 dark:bg-stone-700 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{region.cities}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-300">Cities & Towns</div>
                    </div>
                    <div className="bg-stone-100 dark:bg-stone-700 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{region.routes || 'Open'}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-300">{region.routes > 0 ? 'Routes' : 'World'}</div>
                    </div>
                    <div className="bg-stone-100 dark:bg-stone-700 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{region.gymLeaders?.length || 0}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-300">{region.id === 'alola' ? 'Trials' : 'Gyms'}</div>
                    </div>
                    <div className="bg-stone-100 dark:bg-stone-700 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{region.legendaries.length}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-300">Legendaries</div>
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
              <p className="text-stone-600 dark:text-stone-300 mb-6 text-sm">
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
              <p className="text-stone-600 dark:text-stone-300 mb-6 text-sm">
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
              <p className="text-stone-600 dark:text-stone-300 mb-6 text-sm">
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
                        <span className="text-xs uppercase text-stone-500 dark:text-stone-300">{location.type}</span>
                        <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">{location.description}</p>
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
                    <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">{landmark.description}</p>
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
              <p className="text-stone-600 dark:text-stone-300 mb-6 text-sm">
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
                      <div className="text-xs text-stone-500 dark:text-stone-300">Games</div>
                    </div>
                    <div className="text-center px-6 py-3 bg-stone-100 dark:bg-stone-700 rounded-xl">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <FiUsers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="font-bold text-stone-800 dark:text-stone-100">{region.professor.split(' ')[1]}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-300">Professor</div>
                    </div>
                    <div className="text-center px-6 py-3 bg-stone-100 dark:bg-stone-700 rounded-xl">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <FiAward className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="font-bold text-stone-800 dark:text-stone-100">{region.champion?.name || 'Various'}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-300">Champion</div>
                    </div>
                    <div className="text-center px-6 py-3 bg-stone-100 dark:bg-stone-700 rounded-xl">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <FiStar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="font-bold text-stone-800 dark:text-stone-100">Gen {region.generation}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-300">Generation</div>
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
                  className="flex items-center gap-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
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
                  className="flex items-center gap-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
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
