// Comprehensive Gym Leader Pokemon Teams and Type Effectiveness Data

export interface Pokemon {
  name: string;
  id: number;
  level: number;
  types: string[];
}

export interface GymLeader {
  badge: string;
  type: string;
  team: Pokemon[];
  rematchTeam?: Pokemon[];
  weakAgainst: string[];
  resistantTo: string[];
}

export interface GymLeaderData {
  [key: string]: GymLeader;
}

export const gymLeaderTeams: GymLeaderData = {
  // Kanto Gym Leaders
  'Brock': {
    badge: 'Boulder Badge',
    type: 'rock',
    team: [
      { name: 'Geodude', id: 74, level: 12, types: ['rock', 'ground'] },
      { name: 'Onix', id: 95, level: 14, types: ['rock', 'ground'] }
    ],
    rematchTeam: [
      { name: 'Graveler', id: 75, level: 41, types: ['rock', 'ground'] },
      { name: 'Rhyhorn', id: 111, level: 41, types: ['ground', 'rock'] },
      { name: 'Omastar', id: 139, level: 42, types: ['rock', 'water'] },
      { name: 'Kabutops', id: 141, level: 42, types: ['rock', 'water'] },
      { name: 'Onix', id: 95, level: 44, types: ['rock', 'ground'] }
    ],
    weakAgainst: ['water', 'grass', 'fighting', 'ground', 'steel'],
    resistantTo: ['normal', 'fire', 'poison', 'flying']
  },
  
  'Misty': {
    badge: 'Cascade Badge',
    type: 'water',
    team: [
      { name: 'Staryu', id: 120, level: 18, types: ['water'] },
      { name: 'Starmie', id: 121, level: 21, types: ['water', 'psychic'] }
    ],
    rematchTeam: [
      { name: 'Golduck', id: 55, level: 42, types: ['water'] },
      { name: 'Quagsire', id: 195, level: 42, types: ['water', 'ground'] },
      { name: 'Lapras', id: 131, level: 44, types: ['water', 'ice'] },
      { name: 'Starmie', id: 121, level: 47, types: ['water', 'psychic'] }
    ],
    weakAgainst: ['electric', 'grass'],
    resistantTo: ['fire', 'water', 'ice', 'steel']
  },
  
  'Lt. Surge': {
    badge: 'Thunder Badge',
    type: 'electric',
    team: [
      { name: 'Voltorb', id: 100, level: 21, types: ['electric'] },
      { name: 'Pikachu', id: 25, level: 18, types: ['electric'] },
      { name: 'Raichu', id: 26, level: 24, types: ['electric'] }
    ],
    rematchTeam: [
      { name: 'Raichu', id: 26, level: 44, types: ['electric'] },
      { name: 'Electrode', id: 101, level: 40, types: ['electric'] },
      { name: 'Magneton', id: 82, level: 40, types: ['electric', 'steel'] },
      { name: 'Pachirisu', id: 417, level: 40, types: ['electric'] },
      { name: 'Electivire', id: 466, level: 46, types: ['electric'] }
    ],
    weakAgainst: ['ground'],
    resistantTo: ['electric', 'flying', 'steel']
  },
  
  'Erika': {
    badge: 'Rainbow Badge',
    type: 'grass',
    team: [
      { name: 'Victreebel', id: 71, level: 29, types: ['grass', 'poison'] },
      { name: 'Tangela', id: 114, level: 24, types: ['grass'] },
      { name: 'Vileplume', id: 45, level: 29, types: ['grass', 'poison'] }
    ],
    rematchTeam: [
      { name: 'Jumpluff', id: 189, level: 42, types: ['grass', 'flying'] },
      { name: 'Tangela', id: 114, level: 41, types: ['grass'] },
      { name: 'Bellossom', id: 182, level: 46, types: ['grass'] },
      { name: 'Victreebel', id: 71, level: 46, types: ['grass', 'poison'] },
      { name: 'Vileplume', id: 45, level: 46, types: ['grass', 'poison'] }
    ],
    weakAgainst: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resistantTo: ['water', 'electric', 'grass', 'ground']
  },
  
  'Koga': {
    badge: 'Soul Badge',
    type: 'poison',
    team: [
      { name: 'Koffing', id: 109, level: 37, types: ['poison'] },
      { name: 'Muk', id: 89, level: 39, types: ['poison'] },
      { name: 'Koffing', id: 109, level: 37, types: ['poison'] },
      { name: 'Weezing', id: 110, level: 43, types: ['poison'] }
    ],
    rematchTeam: [
      { name: 'Crobat', id: 169, level: 46, types: ['poison', 'flying'] },
      { name: 'Swalot', id: 317, level: 44, types: ['poison'] },
      { name: 'Muk', id: 89, level: 46, types: ['poison'] },
      { name: 'Venomoth', id: 49, level: 48, types: ['bug', 'poison'] },
      { name: 'Weezing', id: 110, level: 50, types: ['poison'] }
    ],
    weakAgainst: ['ground', 'psychic'],
    resistantTo: ['grass', 'fighting', 'poison', 'bug', 'fairy']
  },
  
  'Sabrina': {
    badge: 'Marsh Badge',
    type: 'psychic',
    team: [
      { name: 'Kadabra', id: 64, level: 38, types: ['psychic'] },
      { name: 'Mr. Mime', id: 122, level: 37, types: ['psychic', 'fairy'] },
      { name: 'Venomoth', id: 49, level: 38, types: ['bug', 'poison'] },
      { name: 'Alakazam', id: 65, level: 43, types: ['psychic'] }
    ],
    rematchTeam: [
      { name: 'Espeon', id: 196, level: 43, types: ['psychic'] },
      { name: 'Mr. Mime', id: 122, level: 43, types: ['psychic', 'fairy'] },
      { name: 'Alakazam', id: 65, level: 48, types: ['psychic'] }
    ],
    weakAgainst: ['bug', 'ghost', 'dark'],
    resistantTo: ['fighting', 'psychic']
  },
  
  'Blaine': {
    badge: 'Volcano Badge',
    type: 'fire',
    team: [
      { name: 'Growlithe', id: 58, level: 42, types: ['fire'] },
      { name: 'Ponyta', id: 77, level: 40, types: ['fire'] },
      { name: 'Rapidash', id: 78, level: 42, types: ['fire'] },
      { name: 'Arcanine', id: 59, level: 47, types: ['fire'] }
    ],
    rematchTeam: [
      { name: 'Houndoom', id: 229, level: 45, types: ['dark', 'fire'] },
      { name: 'Magcargo', id: 219, level: 50, types: ['fire', 'rock'] },
      { name: 'Rapidash', id: 78, level: 48, types: ['fire'] },
      { name: 'Arcanine', id: 59, level: 54, types: ['fire'] }
    ],
    weakAgainst: ['water', 'ground', 'rock'],
    resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy']
  },
  
  'Giovanni': {
    badge: 'Earth Badge',
    type: 'ground',
    team: [
      { name: 'Rhyhorn', id: 111, level: 45, types: ['ground', 'rock'] },
      { name: 'Dugtrio', id: 51, level: 42, types: ['ground'] },
      { name: 'Nidoqueen', id: 31, level: 44, types: ['poison', 'ground'] },
      { name: 'Nidoking', id: 34, level: 45, types: ['poison', 'ground'] },
      { name: 'Rhydon', id: 112, level: 50, types: ['ground', 'rock'] }
    ],
    rematchTeam: [
      { name: 'Nidoking', id: 34, level: 42, types: ['poison', 'ground'] },
      { name: 'Nidoqueen', id: 31, level: 46, types: ['poison', 'ground'] },
      { name: 'Rhyhorn', id: 111, level: 50, types: ['ground', 'rock'] },
      { name: 'Dugtrio', id: 51, level: 44, types: ['ground'] },
      { name: 'Rhyperior', id: 464, level: 50, types: ['ground', 'rock'] }
    ],
    weakAgainst: ['water', 'grass', 'ice'],
    resistantTo: ['poison', 'rock', 'electric']
  },
  
  // Johto Gym Leaders
  'Falkner': {
    badge: 'Zephyr Badge',
    type: 'flying',
    team: [
      { name: 'Pidgey', id: 16, level: 9, types: ['normal', 'flying'] },
      { name: 'Pidgeotto', id: 17, level: 13, types: ['normal', 'flying'] }
    ],
    rematchTeam: [
      { name: 'Staraptor', id: 398, level: 50, types: ['normal', 'flying'] },
      { name: 'Noctowl', id: 164, level: 52, types: ['normal', 'flying'] },
      { name: 'Swellow', id: 277, level: 52, types: ['normal', 'flying'] },
      { name: 'Honchkrow', id: 430, level: 54, types: ['dark', 'flying'] },
      { name: 'Pelipper', id: 279, level: 48, types: ['water', 'flying'] },
      { name: 'Pidgeot', id: 18, level: 56, types: ['normal', 'flying'] }
    ],
    weakAgainst: ['electric', 'ice', 'rock'],
    resistantTo: ['grass', 'fighting', 'bug', 'ground']
  },
  
  'Bugsy': {
    badge: 'Hive Badge',
    type: 'bug',
    team: [
      { name: 'Metapod', id: 11, level: 15, types: ['bug'] },
      { name: 'Kakuna', id: 14, level: 15, types: ['bug', 'poison'] },
      { name: 'Scyther', id: 123, level: 17, types: ['bug', 'flying'] }
    ],
    rematchTeam: [
      { name: 'Shedinja', id: 292, level: 48, types: ['bug', 'ghost'] },
      { name: 'Vespiquen', id: 416, level: 52, types: ['bug', 'flying'] },
      { name: 'Pinsir', id: 127, level: 52, types: ['bug'] },
      { name: 'Heracross', id: 214, level: 52, types: ['bug', 'fighting'] },
      { name: 'Yanmega', id: 469, level: 52, types: ['bug', 'flying'] },
      { name: 'Scizor', id: 212, level: 56, types: ['bug', 'steel'] }
    ],
    weakAgainst: ['fire', 'flying', 'rock'],
    resistantTo: ['grass', 'fighting', 'ground']
  },
  
  'Whitney': {
    badge: 'Plain Badge',
    type: 'normal',
    team: [
      { name: 'Clefairy', id: 35, level: 18, types: ['fairy'] },
      { name: 'Miltank', id: 241, level: 20, types: ['normal'] }
    ],
    rematchTeam: [
      { name: 'Bibarel', id: 400, level: 52, types: ['normal', 'water'] },
      { name: 'Lickilicky', id: 463, level: 50, types: ['normal'] },
      { name: 'Clefable', id: 36, level: 52, types: ['fairy'] },
      { name: 'Delcatty', id: 301, level: 54, types: ['normal'] },
      { name: 'Miltank', id: 241, level: 58, types: ['normal'] }
    ],
    weakAgainst: ['fighting'],
    resistantTo: ['ghost']
  },
  
  'Morty': {
    badge: 'Fog Badge',
    type: 'ghost',
    team: [
      { name: 'Gastly', id: 92, level: 21, types: ['ghost', 'poison'] },
      { name: 'Haunter', id: 93, level: 21, types: ['ghost', 'poison'] },
      { name: 'Haunter', id: 93, level: 23, types: ['ghost', 'poison'] },
      { name: 'Gengar', id: 94, level: 25, types: ['ghost', 'poison'] }
    ],
    rematchTeam: [
      { name: 'Drifblim', id: 426, level: 52, types: ['ghost', 'flying'] },
      { name: 'Sableye', id: 302, level: 52, types: ['dark', 'ghost'] },
      { name: 'Dusknoir', id: 477, level: 52, types: ['ghost'] },
      { name: 'Mismagius', id: 429, level: 54, types: ['ghost'] },
      { name: 'Gengar', id: 94, level: 57, types: ['ghost', 'poison'] }
    ],
    weakAgainst: ['ghost', 'dark'],
    resistantTo: ['poison', 'bug', 'normal', 'fighting']
  },
  
  'Chuck': {
    badge: 'Storm Badge',
    type: 'fighting',
    team: [
      { name: 'Primeape', id: 57, level: 29, types: ['fighting'] },
      { name: 'Poliwrath', id: 62, level: 31, types: ['water', 'fighting'] }
    ],
    rematchTeam: [
      { name: 'Medicham', id: 308, level: 54, types: ['fighting', 'psychic'] },
      { name: 'Toxicroak', id: 454, level: 52, types: ['poison', 'fighting'] },
      { name: 'Breloom', id: 286, level: 54, types: ['grass', 'fighting'] },
      { name: 'Hitmontop', id: 237, level: 54, types: ['fighting'] },
      { name: 'Machamp', id: 68, level: 56, types: ['fighting'] },
      { name: 'Poliwrath', id: 62, level: 60, types: ['water', 'fighting'] }
    ],
    weakAgainst: ['flying', 'psychic', 'fairy'],
    resistantTo: ['rock', 'bug', 'dark']
  },
  
  'Jasmine': {
    badge: 'Mineral Badge',
    type: 'steel',
    team: [
      { name: 'Magnemite', id: 81, level: 30, types: ['electric', 'steel'] },
      { name: 'Magnemite', id: 81, level: 30, types: ['electric', 'steel'] },
      { name: 'Steelix', id: 208, level: 35, types: ['steel', 'ground'] }
    ],
    rematchTeam: [
      { name: 'Bronzong', id: 437, level: 50, types: ['steel', 'psychic'] },
      { name: 'Empoleon', id: 395, level: 52, types: ['water', 'steel'] },
      { name: 'Magnezone', id: 462, level: 56, types: ['electric', 'steel'] },
      { name: 'Metagross', id: 376, level: 52, types: ['steel', 'psychic'] },
      { name: 'Steelix', id: 208, level: 59, types: ['steel', 'ground'] }
    ],
    weakAgainst: ['fire', 'fighting', 'ground'],
    resistantTo: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy']
  },
  
  'Pryce': {
    badge: 'Glacier Badge',
    type: 'ice',
    team: [
      { name: 'Seel', id: 86, level: 30, types: ['water'] },
      { name: 'Dewgong', id: 87, level: 32, types: ['water', 'ice'] },
      { name: 'Piloswine', id: 221, level: 34, types: ['ice', 'ground'] }
    ],
    rematchTeam: [
      { name: 'Abomasnow', id: 460, level: 56, types: ['grass', 'ice'] },
      { name: 'Dewgong', id: 87, level: 58, types: ['water', 'ice'] },
      { name: 'Froslass', id: 478, level: 52, types: ['ice', 'ghost'] },
      { name: 'Glalie', id: 362, level: 52, types: ['ice'] },
      { name: 'Walrein', id: 365, level: 54, types: ['ice', 'water'] },
      { name: 'Mamoswine', id: 473, level: 60, types: ['ice', 'ground'] }
    ],
    weakAgainst: ['fire', 'fighting', 'rock', 'steel'],
    resistantTo: ['ice']
  },
  
  'Clair': {
    badge: 'Rising Badge',
    type: 'dragon',
    team: [
      { name: 'Dragonair', id: 148, level: 38, types: ['dragon'] },
      { name: 'Dragonair', id: 148, level: 38, types: ['dragon'] },
      { name: 'Dragonair', id: 148, level: 38, types: ['dragon'] },
      { name: 'Kingdra', id: 230, level: 41, types: ['water', 'dragon'] }
    ],
    rematchTeam: [
      { name: 'Salamence', id: 373, level: 52, types: ['dragon', 'flying'] },
      { name: 'Altaria', id: 334, level: 52, types: ['dragon', 'flying'] },
      { name: 'Garchomp', id: 445, level: 52, types: ['dragon', 'ground'] },
      { name: 'Charizard', id: 6, level: 52, types: ['fire', 'flying'] },
      { name: 'Gyarados', id: 130, level: 56, types: ['water', 'flying'] },
      { name: 'Dragonite', id: 149, level: 60, types: ['dragon', 'flying'] }
    ],
    weakAgainst: ['ice', 'dragon', 'fairy'],
    resistantTo: ['fire', 'water', 'electric', 'grass']
  },
  
  // Hoenn Gym Leaders
  'Roxanne': {
    badge: 'Stone Badge',
    type: 'rock',
    team: [
      { name: 'Geodude', id: 74, level: 12, types: ['rock', 'ground'] },
      { name: 'Geodude', id: 74, level: 12, types: ['rock', 'ground'] },
      { name: 'Nosepass', id: 299, level: 15, types: ['rock'] }
    ],
    rematchTeam: [
      { name: 'Aerodactyl', id: 142, level: 32, types: ['rock', 'flying'] },
      { name: 'Golem', id: 76, level: 35, types: ['rock', 'ground'] },
      { name: 'Omastar', id: 139, level: 35, types: ['rock', 'water'] },
      { name: 'Kabutops', id: 141, level: 35, types: ['rock', 'water'] },
      { name: 'Nosepass', id: 299, level: 37, types: ['rock'] }
    ],
    weakAgainst: ['water', 'grass', 'fighting', 'ground', 'steel'],
    resistantTo: ['normal', 'fire', 'poison', 'flying']
  },
  
  'Brawly': {
    badge: 'Knuckle Badge',
    type: 'fighting',
    team: [
      { name: 'Machop', id: 66, level: 16, types: ['fighting'] },
      { name: 'Meditite', id: 307, level: 16, types: ['fighting', 'psychic'] },
      { name: 'Makuhita', id: 296, level: 19, types: ['fighting'] }
    ],
    rematchTeam: [
      { name: 'Heracross', id: 214, level: 33, types: ['bug', 'fighting'] },
      { name: 'Machamp', id: 68, level: 38, types: ['fighting'] },
      { name: 'Medicham', id: 308, level: 38, types: ['fighting', 'psychic'] },
      { name: 'Hitmontop', id: 237, level: 38, types: ['fighting'] },
      { name: 'Hariyama', id: 297, level: 40, types: ['fighting'] }
    ],
    weakAgainst: ['flying', 'psychic', 'fairy'],
    resistantTo: ['rock', 'bug', 'dark']
  },
  
  'Wattson': {
    badge: 'Dynamo Badge',
    type: 'electric',
    team: [
      { name: 'Voltorb', id: 100, level: 20, types: ['electric'] },
      { name: 'Electrike', id: 309, level: 20, types: ['electric'] },
      { name: 'Magneton', id: 82, level: 22, types: ['electric', 'steel'] },
      { name: 'Manectric', id: 310, level: 24, types: ['electric'] }
    ],
    rematchTeam: [
      { name: 'Mareep', id: 179, level: 36, types: ['electric'] },
      { name: 'Electrode', id: 101, level: 40, types: ['electric'] },
      { name: 'Magneton', id: 82, level: 40, types: ['electric', 'steel'] },
      { name: 'Ampharos', id: 181, level: 40, types: ['electric'] },
      { name: 'Manectric', id: 310, level: 44, types: ['electric'] }
    ],
    weakAgainst: ['ground'],
    resistantTo: ['electric', 'flying', 'steel']
  },
  
  'Flannery': {
    badge: 'Heat Badge',
    type: 'fire',
    team: [
      { name: 'Numel', id: 322, level: 24, types: ['fire', 'ground'] },
      { name: 'Slugma', id: 218, level: 24, types: ['fire'] },
      { name: 'Camerupt', id: 323, level: 26, types: ['fire', 'ground'] },
      { name: 'Torkoal', id: 324, level: 29, types: ['fire'] }
    ],
    rematchTeam: [
      { name: 'Houndoom', id: 229, level: 38, types: ['dark', 'fire'] },
      { name: 'Camerupt', id: 323, level: 42, types: ['fire', 'ground'] },
      { name: 'Magcargo', id: 219, level: 40, types: ['fire', 'rock'] },
      { name: 'Rapidash', id: 78, level: 42, types: ['fire'] },
      { name: 'Torkoal', id: 324, level: 46, types: ['fire'] }
    ],
    weakAgainst: ['water', 'ground', 'rock'],
    resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy']
  },
  
  'Norman': {
    badge: 'Balance Badge',
    type: 'normal',
    team: [
      { name: 'Spinda', id: 327, level: 27, types: ['normal'] },
      { name: 'Vigoroth', id: 288, level: 27, types: ['normal'] },
      { name: 'Linoone', id: 264, level: 29, types: ['normal'] },
      { name: 'Slaking', id: 289, level: 31, types: ['normal'] }
    ],
    rematchTeam: [
      { name: 'Blissey', id: 242, level: 42, types: ['normal'] },
      { name: 'Rhyperior', id: 464, level: 42, types: ['ground', 'rock'] },
      { name: 'Slaking', id: 289, level: 45, types: ['normal'] },
      { name: 'Kangaskhan', id: 115, level: 43, types: ['normal'] },
      { name: 'Slaking', id: 289, level: 47, types: ['normal'] }
    ],
    weakAgainst: ['fighting'],
    resistantTo: ['ghost']
  },
  
  'Winona': {
    badge: 'Feather Badge',
    type: 'flying',
    team: [
      { name: 'Swablu', id: 333, level: 29, types: ['normal', 'flying'] },
      { name: 'Tropius', id: 357, level: 29, types: ['grass', 'flying'] },
      { name: 'Pelipper', id: 279, level: 30, types: ['water', 'flying'] },
      { name: 'Skarmory', id: 227, level: 31, types: ['steel', 'flying'] },
      { name: 'Altaria', id: 334, level: 33, types: ['dragon', 'flying'] }
    ],
    rematchTeam: [
      { name: 'Drifblim', id: 426, level: 43, types: ['ghost', 'flying'] },
      { name: 'Tropius', id: 357, level: 45, types: ['grass', 'flying'] },
      { name: 'Pelipper', id: 279, level: 45, types: ['water', 'flying'] },
      { name: 'Skarmory', id: 227, level: 46, types: ['steel', 'flying'] },
      { name: 'Altaria', id: 334, level: 48, types: ['dragon', 'flying'] }
    ],
    weakAgainst: ['electric', 'ice', 'rock'],
    resistantTo: ['grass', 'fighting', 'bug', 'ground']
  },
  
  'Tate and Liza': {
    badge: 'Mind Badge',
    type: 'psychic',
    team: [
      { name: 'Claydol', id: 344, level: 41, types: ['ground', 'psychic'] },
      { name: 'Xatu', id: 178, level: 41, types: ['psychic', 'flying'] },
      { name: 'Lunatone', id: 337, level: 42, types: ['rock', 'psychic'] },
      { name: 'Solrock', id: 338, level: 42, types: ['rock', 'psychic'] }
    ],
    rematchTeam: [
      { name: 'Drowzee', id: 96, level: 53, types: ['psychic'] },
      { name: 'Slowking', id: 199, level: 53, types: ['water', 'psychic'] },
      { name: 'Claydol', id: 344, level: 54, types: ['ground', 'psychic'] },
      { name: 'Xatu', id: 178, level: 54, types: ['psychic', 'flying'] },
      { name: 'Lunatone', id: 337, level: 54, types: ['rock', 'psychic'] },
      { name: 'Solrock', id: 338, level: 54, types: ['rock', 'psychic'] }
    ],
    weakAgainst: ['bug', 'ghost', 'dark'],
    resistantTo: ['fighting', 'psychic']
  },
  
  'Wallace': {
    badge: 'Rain Badge',
    type: 'water',
    team: [
      { name: 'Luvdisc', id: 370, level: 40, types: ['water'] },
      { name: 'Whiscash', id: 340, level: 42, types: ['water', 'ground'] },
      { name: 'Sealeo', id: 364, level: 40, types: ['ice', 'water'] },
      { name: 'Seaking', id: 119, level: 42, types: ['water'] },
      { name: 'Milotic', id: 350, level: 43, types: ['water'] }
    ],
    weakAgainst: ['electric', 'grass'],
    resistantTo: ['fire', 'water', 'ice', 'steel']
  },
  
  'Juan': {
    badge: 'Rain Badge',
    type: 'water',
    team: [
      { name: 'Luvdisc', id: 370, level: 41, types: ['water'] },
      { name: 'Whiscash', id: 340, level: 41, types: ['water', 'ground'] },
      { name: 'Sealeo', id: 364, level: 43, types: ['ice', 'water'] },
      { name: 'Crawdaunt', id: 342, level: 43, types: ['water', 'dark'] },
      { name: 'Kingdra', id: 230, level: 46, types: ['water', 'dragon'] }
    ],
    rematchTeam: [
      { name: 'Lapras', id: 131, level: 56, types: ['water', 'ice'] },
      { name: 'Whiscash', id: 340, level: 58, types: ['water', 'ground'] },
      { name: 'Walrein', id: 365, level: 58, types: ['ice', 'water'] },
      { name: 'Crawdaunt', id: 342, level: 58, types: ['water', 'dark'] },
      { name: 'Kingdra', id: 230, level: 61, types: ['water', 'dragon'] }
    ],
    weakAgainst: ['electric', 'grass'],
    resistantTo: ['fire', 'water', 'ice', 'steel']
  },
  
  // Sinnoh Gym Leaders
  'Roark': {
    badge: 'Coal Badge',
    type: 'rock',
    team: [
      { name: 'Geodude', id: 74, level: 12, types: ['rock', 'ground'] },
      { name: 'Onix', id: 95, level: 12, types: ['rock', 'ground'] },
      { name: 'Cranidos', id: 408, level: 14, types: ['rock'] }
    ],
    rematchTeam: [
      { name: 'Aerodactyl', id: 142, level: 61, types: ['rock', 'flying'] },
      { name: 'Probopass', id: 476, level: 61, types: ['rock', 'steel'] },
      { name: 'Tyranitar', id: 248, level: 61, types: ['rock', 'dark'] },
      { name: 'Golem', id: 76, level: 61, types: ['rock', 'ground'] },
      { name: 'Rampardos', id: 409, level: 65, types: ['rock'] }
    ],
    weakAgainst: ['water', 'grass', 'fighting', 'ground', 'steel'],
    resistantTo: ['normal', 'fire', 'poison', 'flying']
  },
  
  'Gardenia': {
    badge: 'Forest Badge',
    type: 'grass',
    team: [
      { name: 'Cherubi', id: 420, level: 19, types: ['grass'] },
      { name: 'Turtwig', id: 387, level: 19, types: ['grass'] },
      { name: 'Roserade', id: 407, level: 22, types: ['grass', 'poison'] }
    ],
    rematchTeam: [
      { name: 'Jumpluff', id: 189, level: 61, types: ['grass', 'flying'] },
      { name: 'Sunflora', id: 192, level: 61, types: ['grass'] },
      { name: 'Tangrowth', id: 465, level: 61, types: ['grass'] },
      { name: 'Torterra', id: 389, level: 62, types: ['grass', 'ground'] },
      { name: 'Roserade', id: 407, level: 65, types: ['grass', 'poison'] }
    ],
    weakAgainst: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resistantTo: ['water', 'electric', 'grass', 'ground']
  },
  
  'Fantina': {
    badge: 'Relic Badge',
    type: 'ghost',
    team: [
      { name: 'Duskull', id: 355, level: 24, types: ['ghost'] },
      { name: 'Haunter', id: 93, level: 24, types: ['ghost', 'poison'] },
      { name: 'Mismagius', id: 429, level: 26, types: ['ghost'] }
    ],
    rematchTeam: [
      { name: 'Banette', id: 354, level: 61, types: ['ghost'] },
      { name: 'Drifblim', id: 426, level: 61, types: ['ghost', 'flying'] },
      { name: 'Gengar', id: 94, level: 61, types: ['ghost', 'poison'] },
      { name: 'Froslass', id: 478, level: 61, types: ['ice', 'ghost'] },
      { name: 'Mismagius', id: 429, level: 65, types: ['ghost'] }
    ],
    weakAgainst: ['ghost', 'dark'],
    resistantTo: ['poison', 'bug', 'normal', 'fighting']
  },
  
  'Maylene': {
    badge: 'Cobble Badge',
    type: 'fighting',
    team: [
      { name: 'Meditite', id: 307, level: 27, types: ['fighting', 'psychic'] },
      { name: 'Machoke', id: 67, level: 27, types: ['fighting'] },
      { name: 'Lucario', id: 448, level: 30, types: ['fighting', 'steel'] }
    ],
    rematchTeam: [
      { name: 'Hitmonchan', id: 107, level: 62, types: ['fighting'] },
      { name: 'Hitmonlee', id: 106, level: 62, types: ['fighting'] },
      { name: 'Hitmontop', id: 237, level: 62, types: ['fighting'] },
      { name: 'Medicham', id: 308, level: 62, types: ['fighting', 'psychic'] },
      { name: 'Lucario', id: 448, level: 66, types: ['fighting', 'steel'] }
    ],
    weakAgainst: ['flying', 'psychic', 'fairy'],
    resistantTo: ['rock', 'bug', 'dark']
  },
  
  'Crasher Wake': {
    badge: 'Fen Badge',
    type: 'water',
    team: [
      { name: 'Gyarados', id: 130, level: 27, types: ['water', 'flying'] },
      { name: 'Quagsire', id: 195, level: 27, types: ['water', 'ground'] },
      { name: 'Floatzel', id: 419, level: 30, types: ['water'] }
    ],
    rematchTeam: [
      { name: 'Sharpedo', id: 319, level: 61, types: ['water', 'dark'] },
      { name: 'Quagsire', id: 195, level: 61, types: ['water', 'ground'] },
      { name: 'Gyarados', id: 130, level: 62, types: ['water', 'flying'] },
      { name: 'Ludicolo', id: 272, level: 62, types: ['water', 'grass'] },
      { name: 'Floatzel', id: 419, level: 65, types: ['water'] }
    ],
    weakAgainst: ['electric', 'grass'],
    resistantTo: ['fire', 'water', 'ice', 'steel']
  },
  
  'Byron': {
    badge: 'Mine Badge',
    type: 'steel',
    team: [
      { name: 'Bronzor', id: 436, level: 36, types: ['steel', 'psychic'] },
      { name: 'Steelix', id: 208, level: 36, types: ['steel', 'ground'] },
      { name: 'Bastiodon', id: 411, level: 39, types: ['rock', 'steel'] }
    ],
    rematchTeam: [
      { name: 'Magnezone', id: 462, level: 61, types: ['electric', 'steel'] },
      { name: 'Forretress', id: 205, level: 61, types: ['bug', 'steel'] },
      { name: 'Skarmory', id: 227, level: 61, types: ['steel', 'flying'] },
      { name: 'Steelix', id: 208, level: 61, types: ['steel', 'ground'] },
      { name: 'Bastiodon', id: 411, level: 65, types: ['rock', 'steel'] }
    ],
    weakAgainst: ['fire', 'fighting', 'ground'],
    resistantTo: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy']
  },
  
  'Candice': {
    badge: 'Icicle Badge',
    type: 'ice',
    team: [
      { name: 'Sneasel', id: 215, level: 38, types: ['dark', 'ice'] },
      { name: 'Piloswine', id: 221, level: 38, types: ['ice', 'ground'] },
      { name: 'Abomasnow', id: 460, level: 40, types: ['grass', 'ice'] },
      { name: 'Froslass', id: 478, level: 42, types: ['ice', 'ghost'] }
    ],
    rematchTeam: [
      { name: 'Weavile', id: 461, level: 62, types: ['dark', 'ice'] },
      { name: 'Mamoswine', id: 473, level: 61, types: ['ice', 'ground'] },
      { name: 'Abomasnow', id: 460, level: 61, types: ['grass', 'ice'] },
      { name: 'Glaceon', id: 471, level: 61, types: ['ice'] },
      { name: 'Froslass', id: 478, level: 65, types: ['ice', 'ghost'] }
    ],
    weakAgainst: ['fire', 'fighting', 'rock', 'steel'],
    resistantTo: ['ice']
  },
  
  'Volkner': {
    badge: 'Beacon Badge',
    type: 'electric',
    team: [
      { name: 'Raichu', id: 26, level: 46, types: ['electric'] },
      { name: 'Octillery', id: 224, level: 47, types: ['water'] },
      { name: 'Ambipom', id: 424, level: 47, types: ['normal'] },
      { name: 'Luxray', id: 405, level: 49, types: ['electric'] }
    ],
    rematchTeam: [
      { name: 'Jolteon', id: 135, level: 61, types: ['electric'] },
      { name: 'Raichu', id: 26, level: 61, types: ['electric'] },
      { name: 'Luxray', id: 405, level: 65, types: ['electric'] },
      { name: 'Pachirisu', id: 417, level: 61, types: ['electric'] },
      { name: 'Electivire', id: 466, level: 65, types: ['electric'] }
    ],
    weakAgainst: ['ground'],
    resistantTo: ['electric', 'flying', 'steel']
  },
  
  // Unova Gym Leaders
  'Cilan': {
    badge: 'Trio Badge',
    type: 'grass',
    team: [
      { name: 'Lillipup', id: 506, level: 12, types: ['normal'] },
      { name: 'Pansage', id: 511, level: 14, types: ['grass'] }
    ],
    weakAgainst: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resistantTo: ['water', 'electric', 'grass', 'ground']
  },
  
  'Chili': {
    badge: 'Trio Badge',
    type: 'fire',
    team: [
      { name: 'Lillipup', id: 506, level: 12, types: ['normal'] },
      { name: 'Pansear', id: 513, level: 14, types: ['fire'] }
    ],
    weakAgainst: ['water', 'ground', 'rock'],
    resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy']
  },
  
  'Cress': {
    badge: 'Trio Badge',
    type: 'water',
    team: [
      { name: 'Lillipup', id: 506, level: 12, types: ['normal'] },
      { name: 'Panpour', id: 515, level: 14, types: ['water'] }
    ],
    weakAgainst: ['electric', 'grass'],
    resistantTo: ['fire', 'water', 'ice', 'steel']
  },
  
  'Lenora': {
    badge: 'Basic Badge',
    type: 'normal',
    team: [
      { name: 'Herdier', id: 507, level: 18, types: ['normal'] },
      { name: 'Watchog', id: 505, level: 20, types: ['normal'] }
    ],
    rematchTeam: [
      { name: 'Stoutland', id: 508, level: 25, types: ['normal'] },
      { name: 'Watchog', id: 505, level: 25, types: ['normal'] },
      { name: 'Kangaskhan', id: 115, level: 25, types: ['normal'] }
    ],
    weakAgainst: ['fighting'],
    resistantTo: ['ghost']
  },
  
  'Burgh': {
    badge: 'Insect Badge',
    type: 'bug',
    team: [
      { name: 'Whirlipede', id: 544, level: 21, types: ['bug', 'poison'] },
      { name: 'Dwebble', id: 557, level: 21, types: ['bug', 'rock'] },
      { name: 'Leavanny', id: 542, level: 23, types: ['bug', 'grass'] }
    ],
    rematchTeam: [
      { name: 'Swadloon', id: 541, level: 25, types: ['bug', 'grass'] },
      { name: 'Whirlipede', id: 544, level: 25, types: ['bug', 'poison'] },
      { name: 'Leavanny', id: 542, level: 27, types: ['bug', 'grass'] },
      { name: 'Escavalier', id: 589, level: 25, types: ['bug', 'steel'] }
    ],
    weakAgainst: ['fire', 'flying', 'rock'],
    resistantTo: ['grass', 'fighting', 'ground']
  },
  
  'Elesa': {
    badge: 'Bolt Badge',
    type: 'electric',
    team: [
      { name: 'Emolga', id: 587, level: 25, types: ['electric', 'flying'] },
      { name: 'Flaaffy', id: 180, level: 25, types: ['electric'] },
      { name: 'Zebstrika', id: 523, level: 27, types: ['electric'] }
    ],
    rematchTeam: [
      { name: 'Emolga', id: 587, level: 28, types: ['electric', 'flying'] },
      { name: 'Flaaffy', id: 180, level: 28, types: ['electric'] },
      { name: 'Joltik', id: 595, level: 28, types: ['bug', 'electric'] },
      { name: 'Zebstrika', id: 523, level: 30, types: ['electric'] }
    ],
    weakAgainst: ['ground'],
    resistantTo: ['electric', 'flying', 'steel']
  },
  
  'Clay': {
    badge: 'Quake Badge',
    type: 'ground',
    team: [
      { name: 'Krokorok', id: 552, level: 29, types: ['ground', 'dark'] },
      { name: 'Palpitoad', id: 536, level: 29, types: ['water', 'ground'] },
      { name: 'Excadrill', id: 530, level: 31, types: ['ground', 'steel'] }
    ],
    rematchTeam: [
      { name: 'Krokorok', id: 552, level: 31, types: ['ground', 'dark'] },
      { name: 'Sandslash', id: 28, level: 31, types: ['ground'] },
      { name: 'Onix', id: 95, level: 31, types: ['rock', 'ground'] },
      { name: 'Palpitoad', id: 536, level: 31, types: ['water', 'ground'] },
      { name: 'Excadrill', id: 530, level: 33, types: ['ground', 'steel'] }
    ],
    weakAgainst: ['water', 'grass', 'ice'],
    resistantTo: ['poison', 'rock', 'electric']
  },
  
  'Skyla': {
    badge: 'Jet Badge',
    type: 'flying',
    team: [
      { name: 'Swoobat', id: 528, level: 33, types: ['psychic', 'flying'] },
      { name: 'Unfezant', id: 521, level: 33, types: ['normal', 'flying'] },
      { name: 'Swanna', id: 581, level: 35, types: ['water', 'flying'] }
    ],
    rematchTeam: [
      { name: 'Swoobat', id: 528, level: 37, types: ['psychic', 'flying'] },
      { name: 'Skarmory', id: 227, level: 37, types: ['steel', 'flying'] },
      { name: 'Unfezant', id: 521, level: 37, types: ['normal', 'flying'] },
      { name: 'Swanna', id: 581, level: 39, types: ['water', 'flying'] }
    ],
    weakAgainst: ['electric', 'ice', 'rock'],
    resistantTo: ['grass', 'fighting', 'bug', 'ground']
  },
  
  'Brycen': {
    badge: 'Freeze Badge',
    type: 'ice',
    team: [
      { name: 'Vanillish', id: 583, level: 37, types: ['ice'] },
      { name: 'Cryogonal', id: 615, level: 37, types: ['ice'] },
      { name: 'Beartic', id: 614, level: 39, types: ['ice'] }
    ],
    rematchTeam: [
      { name: 'Vanillish', id: 583, level: 37, types: ['ice'] },
      { name: 'Cryogonal', id: 615, level: 39, types: ['ice'] },
      { name: 'Beartic', id: 614, level: 39, types: ['ice'] }
    ],
    weakAgainst: ['fire', 'fighting', 'rock', 'steel'],
    resistantTo: ['ice']
  },
  
  'Drayden': {
    badge: 'Legend Badge',
    type: 'dragon',
    team: [
      { name: 'Druddigon', id: 621, level: 41, types: ['dragon'] },
      { name: 'Flygon', id: 330, level: 41, types: ['ground', 'dragon'] },
      { name: 'Haxorus', id: 612, level: 43, types: ['dragon'] }
    ],
    rematchTeam: [
      { name: 'Druddigon', id: 621, level: 46, types: ['dragon'] },
      { name: 'Flygon', id: 330, level: 46, types: ['ground', 'dragon'] },
      { name: 'Haxorus', id: 612, level: 48, types: ['dragon'] }
    ],
    weakAgainst: ['ice', 'dragon', 'fairy'],
    resistantTo: ['fire', 'water', 'electric', 'grass']
  },
  
  'Iris': {
    badge: 'Legend Badge',
    type: 'dragon',
    team: [
      { name: 'Fraxure', id: 611, level: 41, types: ['dragon'] },
      { name: 'Druddigon', id: 621, level: 41, types: ['dragon'] },
      { name: 'Haxorus', id: 612, level: 43, types: ['dragon'] }
    ],
    rematchTeam: [
      { name: 'Druddigon', id: 621, level: 46, types: ['dragon'] },
      { name: 'Fraxure', id: 611, level: 46, types: ['dragon'] },
      { name: 'Haxorus', id: 612, level: 48, types: ['dragon'] }
    ],
    weakAgainst: ['ice', 'dragon', 'fairy'],
    resistantTo: ['fire', 'water', 'electric', 'grass']
  },
  
  'Cheren': {
    badge: 'Basic Badge',
    type: 'normal',
    team: [
      { name: 'Patrat', id: 504, level: 11, types: ['normal'] },
      { name: 'Lillipup', id: 506, level: 13, types: ['normal'] }
    ],
    weakAgainst: ['fighting'],
    resistantTo: ['ghost']
  },
  
  'Roxie': {
    badge: 'Toxic Badge',
    type: 'poison',
    team: [
      { name: 'Koffing', id: 109, level: 16, types: ['poison'] },
      { name: 'Whirlipede', id: 544, level: 18, types: ['bug', 'poison'] }
    ],
    weakAgainst: ['ground', 'psychic'],
    resistantTo: ['grass', 'fighting', 'poison', 'bug', 'fairy']
  },
  
  'Marlon': {
    badge: 'Wave Badge',
    type: 'water',
    team: [
      { name: 'Wailord', id: 321, level: 49, types: ['water'] },
      { name: 'Mantine', id: 226, level: 49, types: ['water', 'flying'] },
      { name: 'Jellicent', id: 593, level: 51, types: ['water', 'ghost'] }
    ],
    weakAgainst: ['electric', 'grass'],
    resistantTo: ['fire', 'water', 'ice', 'steel']
  },
  
  // Kalos Gym Leaders
  'Viola': {
    badge: 'Bug Badge',
    type: 'bug',
    team: [
      { name: 'Surskit', id: 283, level: 10, types: ['bug', 'water'] },
      { name: 'Vivillon', id: 666, level: 12, types: ['bug', 'flying'] }
    ],
    weakAgainst: ['fire', 'flying', 'rock'],
    resistantTo: ['grass', 'fighting', 'ground']
  },
  
  'Grant': {
    badge: 'Cliff Badge',
    type: 'rock',
    team: [
      { name: 'Amaura', id: 698, level: 25, types: ['rock', 'ice'] },
      { name: 'Tyrunt', id: 696, level: 25, types: ['rock', 'dragon'] }
    ],
    weakAgainst: ['water', 'grass', 'fighting', 'ground', 'steel'],
    resistantTo: ['normal', 'fire', 'poison', 'flying']
  },
  
  'Korrina': {
    badge: 'Rumble Badge',
    type: 'fighting',
    team: [
      { name: 'Mienfoo', id: 619, level: 29, types: ['fighting'] },
      { name: 'Machoke', id: 67, level: 28, types: ['fighting'] },
      { name: 'Hawlucha', id: 701, level: 32, types: ['fighting', 'flying'] }
    ],
    weakAgainst: ['flying', 'psychic', 'fairy'],
    resistantTo: ['rock', 'bug', 'dark']
  },
  
  'Ramos': {
    badge: 'Plant Badge',
    type: 'grass',
    team: [
      { name: 'Jumpluff', id: 189, level: 30, types: ['grass', 'flying'] },
      { name: 'Weepinbell', id: 70, level: 31, types: ['grass', 'poison'] },
      { name: 'Gogoat', id: 673, level: 34, types: ['grass'] }
    ],
    weakAgainst: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resistantTo: ['water', 'electric', 'grass', 'ground']
  },
  
  'Clemont': {
    badge: 'Voltage Badge',
    type: 'electric',
    team: [
      { name: 'Emolga', id: 587, level: 35, types: ['electric', 'flying'] },
      { name: 'Magneton', id: 82, level: 35, types: ['electric', 'steel'] },
      { name: 'Heliolisk', id: 695, level: 37, types: ['electric', 'normal'] }
    ],
    weakAgainst: ['ground'],
    resistantTo: ['electric', 'flying', 'steel']
  },
  
  'Valerie': {
    badge: 'Fairy Badge',
    type: 'fairy',
    team: [
      { name: 'Mawile', id: 303, level: 38, types: ['steel', 'fairy'] },
      { name: 'Mr. Mime', id: 122, level: 39, types: ['psychic', 'fairy'] },
      { name: 'Sylveon', id: 700, level: 42, types: ['fairy'] }
    ],
    weakAgainst: ['poison', 'steel'],
    resistantTo: ['fighting', 'bug', 'dark', 'dragon']
  },
  
  'Olympia': {
    badge: 'Psychic Badge',
    type: 'psychic',
    team: [
      { name: 'Sigilyph', id: 561, level: 44, types: ['psychic', 'flying'] },
      { name: 'Slowking', id: 199, level: 45, types: ['water', 'psychic'] },
      { name: 'Meowstic', id: 678, level: 48, types: ['psychic'] }
    ],
    weakAgainst: ['bug', 'ghost', 'dark'],
    resistantTo: ['fighting', 'psychic']
  },
  
  'Wulfric': {
    badge: 'Iceberg Badge',
    type: 'ice',
    team: [
      { name: 'Abomasnow', id: 460, level: 56, types: ['grass', 'ice'] },
      { name: 'Cryogonal', id: 615, level: 55, types: ['ice'] },
      { name: 'Avalugg', id: 713, level: 59, types: ['ice'] }
    ],
    weakAgainst: ['fire', 'fighting', 'rock', 'steel'],
    resistantTo: ['ice']
  },
  
  // Alola Trial Captains (included as pseudo-gym leaders)
  'Ilima': {
    badge: 'Normalium Z',
    type: 'normal',
    team: [
      { name: 'Yungoos', id: 734, level: 9, types: ['normal'] },
      { name: 'Smeargle', id: 235, level: 10, types: ['normal'] }
    ],
    weakAgainst: ['fighting'],
    resistantTo: ['ghost']
  },
  
  'Lana': {
    badge: 'Waterium Z',
    type: 'water',
    team: [
      { name: 'Wishiwashi', id: 746, level: 20, types: ['water'] }
    ],
    weakAgainst: ['electric', 'grass'],
    resistantTo: ['fire', 'water', 'ice', 'steel']
  },
  
  'Kiawe': {
    badge: 'Firium Z',
    type: 'fire',
    team: [
      { name: 'Salazzle', id: 758, level: 22, types: ['poison', 'fire'] }
    ],
    weakAgainst: ['water', 'ground', 'rock'],
    resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy']
  },
  
  'Mallow': {
    badge: 'Grassium Z',
    type: 'grass',
    team: [
      { name: 'Lurantis', id: 754, level: 24, types: ['grass'] }
    ],
    weakAgainst: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resistantTo: ['water', 'electric', 'grass', 'ground']
  },
  
  'Sophocles': {
    badge: 'Electrium Z',
    type: 'electric',
    team: [
      { name: 'Vikavolt', id: 738, level: 29, types: ['bug', 'electric'] }
    ],
    weakAgainst: ['ground'],
    resistantTo: ['electric', 'flying', 'steel']
  },
  
  'Acerola': {
    badge: 'Ghostium Z',
    type: 'ghost',
    team: [
      { name: 'Mimikyu', id: 778, level: 33, types: ['ghost', 'fairy'] }
    ],
    weakAgainst: ['ghost', 'dark'],
    resistantTo: ['poison', 'bug', 'normal', 'fighting']
  },
  
  'Mina': {
    badge: 'Fairium Z',
    type: 'fairy',
    team: [
      { name: 'Granbull', id: 210, level: 51, types: ['fairy'] },
      { name: 'Wigglytuff', id: 40, level: 51, types: ['normal', 'fairy'] },
      { name: 'Ribombee', id: 743, level: 51, types: ['bug', 'fairy'] }
    ],
    weakAgainst: ['poison', 'steel'],
    resistantTo: ['fighting', 'bug', 'dark', 'dragon']
  },
  
  // Galar Gym Leaders
  'Milo': {
    badge: 'Grass Badge',
    type: 'grass',
    team: [
      { name: 'Gossifleur', id: 829, level: 19, types: ['grass'] },
      { name: 'Eldegoss', id: 830, level: 20, types: ['grass'] }
    ],
    weakAgainst: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resistantTo: ['water', 'electric', 'grass', 'ground']
  },
  
  'Nessa': {
    badge: 'Water Badge',
    type: 'water',
    team: [
      { name: 'Goldeen', id: 118, level: 22, types: ['water'] },
      { name: 'Arrokuda', id: 846, level: 23, types: ['water'] },
      { name: 'Drednaw', id: 834, level: 24, types: ['water', 'rock'] }
    ],
    weakAgainst: ['electric', 'grass'],
    resistantTo: ['fire', 'water', 'ice', 'steel']
  },
  
  'Kabu': {
    badge: 'Fire Badge',
    type: 'fire',
    team: [
      { name: 'Ninetales', id: 38, level: 25, types: ['fire'] },
      { name: 'Arcanine', id: 59, level: 25, types: ['fire'] },
      { name: 'Centiskorch', id: 851, level: 27, types: ['fire', 'bug'] }
    ],
    weakAgainst: ['water', 'ground', 'rock'],
    resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy']
  },
  
  'Bea': {
    badge: 'Fighting Badge',
    type: 'fighting',
    team: [
      { name: 'Hitmontop', id: 237, level: 34, types: ['fighting'] },
      { name: 'Pangoro', id: 675, level: 34, types: ['fighting', 'dark'] },
      { name: 'Sirfetch\'d', id: 865, level: 35, types: ['fighting'] },
      { name: 'Machamp', id: 68, level: 36, types: ['fighting'] }
    ],
    weakAgainst: ['flying', 'psychic', 'fairy'],
    resistantTo: ['rock', 'bug', 'dark']
  },
  
  'Allister': {
    badge: 'Ghost Badge',
    type: 'ghost',
    team: [
      { name: 'Yamask', id: 562, level: 34, types: ['ghost'] },
      { name: 'Mimikyu', id: 778, level: 34, types: ['ghost', 'fairy'] },
      { name: 'Cursola', id: 864, level: 35, types: ['ghost'] },
      { name: 'Gengar', id: 94, level: 36, types: ['ghost', 'poison'] }
    ],
    weakAgainst: ['ghost', 'dark'],
    resistantTo: ['poison', 'bug', 'normal', 'fighting']
  },
  
  'Opal': {
    badge: 'Fairy Badge',
    type: 'fairy',
    team: [
      { name: 'Weezing', id: 110, level: 36, types: ['poison'] },
      { name: 'Mawile', id: 303, level: 36, types: ['steel', 'fairy'] },
      { name: 'Togekiss', id: 468, level: 37, types: ['fairy', 'flying'] },
      { name: 'Alcremie', id: 869, level: 38, types: ['fairy'] }
    ],
    weakAgainst: ['poison', 'steel'],
    resistantTo: ['fighting', 'bug', 'dark', 'dragon']
  },
  
  'Bede': {
    badge: 'Fairy Badge',
    type: 'fairy',
    team: [
      { name: 'Mawile', id: 303, level: 51, types: ['steel', 'fairy'] },
      { name: 'Gardevoir', id: 282, level: 51, types: ['psychic', 'fairy'] },
      { name: 'Rapidash', id: 78, level: 52, types: ['psychic', 'fairy'] },
      { name: 'Hatterene', id: 858, level: 53, types: ['psychic', 'fairy'] }
    ],
    weakAgainst: ['poison', 'steel'],
    resistantTo: ['fighting', 'bug', 'dark', 'dragon']
  },
  
  'Gordie': {
    badge: 'Rock Badge',
    type: 'rock',
    team: [
      { name: 'Barbaracle', id: 689, level: 40, types: ['rock', 'water'] },
      { name: 'Shuckle', id: 213, level: 40, types: ['bug', 'rock'] },
      { name: 'Stonjourner', id: 874, level: 41, types: ['rock'] },
      { name: 'Coalossal', id: 839, level: 42, types: ['rock', 'fire'] }
    ],
    weakAgainst: ['water', 'grass', 'fighting', 'ground', 'steel'],
    resistantTo: ['normal', 'fire', 'poison', 'flying']
  },
  
  'Melony': {
    badge: 'Ice Badge',
    type: 'ice',
    team: [
      { name: 'Frosmoth', id: 873, level: 40, types: ['ice', 'bug'] },
      { name: 'Darmanitan', id: 555, level: 40, types: ['ice'] },
      { name: 'Eiscue', id: 875, level: 41, types: ['ice'] },
      { name: 'Lapras', id: 131, level: 42, types: ['water', 'ice'] }
    ],
    weakAgainst: ['fire', 'fighting', 'rock', 'steel'],
    resistantTo: ['ice']
  },
  
  'Piers': {
    badge: 'Dark Badge',
    type: 'dark',
    team: [
      { name: 'Scrafty', id: 560, level: 44, types: ['dark', 'fighting'] },
      { name: 'Malamar', id: 687, level: 45, types: ['dark', 'psychic'] },
      { name: 'Skuntank', id: 435, level: 45, types: ['poison', 'dark'] },
      { name: 'Obstagoon', id: 862, level: 46, types: ['dark', 'normal'] }
    ],
    weakAgainst: ['fighting', 'bug', 'fairy'],
    resistantTo: ['ghost', 'dark', 'psychic']
  },
  
  'Marnie': {
    badge: 'Dark Badge',
    type: 'dark',
    team: [
      { name: 'Liepard', id: 510, level: 47, types: ['dark'] },
      { name: 'Toxicroak', id: 454, level: 47, types: ['poison', 'fighting'] },
      { name: 'Scrafty', id: 560, level: 47, types: ['dark', 'fighting'] },
      { name: 'Morpeko', id: 877, level: 48, types: ['electric', 'dark'] },
      { name: 'Grimmsnarl', id: 861, level: 49, types: ['dark', 'fairy'] }
    ],
    weakAgainst: ['fighting', 'bug', 'fairy'],
    resistantTo: ['ghost', 'dark', 'psychic']
  },
  
  'Raihan': {
    badge: 'Dragon Badge',
    type: 'dragon',
    team: [
      { name: 'Gigalith', id: 526, level: 46, types: ['rock'] },
      { name: 'Flygon', id: 330, level: 47, types: ['ground', 'dragon'] },
      { name: 'Sandaconda', id: 844, level: 46, types: ['ground'] },
      { name: 'Duraludon', id: 884, level: 48, types: ['steel', 'dragon'] }
    ],
    weakAgainst: ['ice', 'dragon', 'fairy'],
    resistantTo: ['fire', 'water', 'electric', 'grass']
  },
  
  // Paldea Gym Leaders
  'Katy': {
    badge: 'Bug Badge',
    type: 'bug',
    team: [
      { name: 'Nymble', id: 919, level: 14, types: ['bug'] },
      { name: 'Tarountula', id: 917, level: 14, types: ['bug'] },
      { name: 'Teddiursa', id: 216, level: 15, types: ['normal'] }
    ],
    weakAgainst: ['fire', 'flying', 'rock'],
    resistantTo: ['grass', 'fighting', 'ground']
  },
  
  'Brassius': {
    badge: 'Grass Badge',
    type: 'grass',
    team: [
      { name: 'Petilil', id: 548, level: 16, types: ['grass'] },
      { name: 'Smoliv', id: 928, level: 16, types: ['grass', 'normal'] },
      { name: 'Sudowoodo', id: 185, level: 17, types: ['rock'] }
    ],
    weakAgainst: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resistantTo: ['water', 'electric', 'grass', 'ground']
  },
  
  'Iono': {
    badge: 'Electric Badge',
    type: 'electric',
    team: [
      { name: 'Wattrel', id: 940, level: 23, types: ['electric', 'flying'] },
      { name: 'Bellibolt', id: 939, level: 23, types: ['electric'] },
      { name: 'Luxio', id: 404, level: 23, types: ['electric'] },
      { name: 'Mismagius', id: 429, level: 24, types: ['ghost'] }
    ],
    weakAgainst: ['ground'],
    resistantTo: ['electric', 'flying', 'steel']
  },
  
  'Kofu': {
    badge: 'Water Badge',
    type: 'water',
    team: [
      { name: 'Veluza', id: 976, level: 29, types: ['water', 'psychic'] },
      { name: 'Wugtrio', id: 961, level: 29, types: ['water'] },
      { name: 'Crabominable', id: 740, level: 30, types: ['fighting', 'ice'] }
    ],
    weakAgainst: ['electric', 'grass'],
    resistantTo: ['fire', 'water', 'ice', 'steel']
  },
  
  'Larry': {
    badge: 'Normal Badge',
    type: 'normal',
    team: [
      { name: 'Komala', id: 775, level: 35, types: ['normal'] },
      { name: 'Dudunsparce', id: 982, level: 35, types: ['normal'] },
      { name: 'Staraptor', id: 398, level: 36, types: ['normal', 'flying'] }
    ],
    weakAgainst: ['fighting'],
    resistantTo: ['ghost']
  },
  
  'Ryme': {
    badge: 'Ghost Badge',
    type: 'ghost',
    team: [
      { name: 'Banette', id: 354, level: 41, types: ['ghost'] },
      { name: 'Mimikyu', id: 778, level: 41, types: ['ghost', 'fairy'] },
      { name: 'Houndstone', id: 972, level: 41, types: ['ghost'] },
      { name: 'Toxtricity', id: 849, level: 42, types: ['electric', 'poison'] }
    ],
    weakAgainst: ['ghost', 'dark'],
    resistantTo: ['poison', 'bug', 'normal', 'fighting']
  },
  
  'Tulip': {
    badge: 'Psychic Badge',
    type: 'psychic',
    team: [
      { name: 'Farigiraf', id: 981, level: 44, types: ['normal', 'psychic'] },
      { name: 'Gardevoir', id: 282, level: 44, types: ['psychic', 'fairy'] },
      { name: 'Espathra', id: 956, level: 44, types: ['psychic'] },
      { name: 'Florges', id: 671, level: 45, types: ['fairy'] }
    ],
    weakAgainst: ['bug', 'ghost', 'dark'],
    resistantTo: ['fighting', 'psychic']
  },
  
  'Grusha': {
    badge: 'Ice Badge',
    type: 'ice',
    team: [
      { name: 'Frosmoth', id: 873, level: 47, types: ['ice', 'bug'] },
      { name: 'Beartic', id: 614, level: 47, types: ['ice'] },
      { name: 'Cetitan', id: 975, level: 47, types: ['ice'] },
      { name: 'Altaria', id: 334, level: 48, types: ['dragon', 'flying'] }
    ],
    weakAgainst: ['fire', 'fighting', 'rock', 'steel'],
    resistantTo: ['ice']
  }
};