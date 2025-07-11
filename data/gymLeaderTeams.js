// Comprehensive Gym Leader Pokemon Teams and Type Effectiveness Data

export const gymLeaderTeams = {
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
      { name: 'Espeon', id: 196, level: 48, types: ['psychic'] },
      { name: 'Mr. Mime', id: 122, level: 48, types: ['psychic', 'fairy'] },
      { name: 'Gardevoir', id: 282, level: 48, types: ['psychic', 'fairy'] },
      { name: 'Jynx', id: 124, level: 48, types: ['ice', 'psychic'] },
      { name: 'Alakazam', id: 65, level: 52, types: ['psychic'] }
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
      { name: 'Magcargo', id: 219, level: 50, types: ['fire', 'rock'] },
      { name: 'Magmortar', id: 467, level: 54, types: ['fire'] },
      { name: 'Rapidash', id: 78, level: 52, types: ['fire'] },
      { name: 'Houndoom', id: 229, level: 52, types: ['dark', 'fire'] },
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
      { name: 'Nidoking', id: 34, level: 60, types: ['poison', 'ground'] },
      { name: 'Nidoqueen', id: 31, level: 60, types: ['poison', 'ground'] },
      { name: 'Garchomp', id: 445, level: 62, types: ['dragon', 'ground'] },
      { name: 'Rhyperior', id: 464, level: 62, types: ['ground', 'rock'] },
      { name: 'Dugtrio', id: 51, level: 58, types: ['ground'] }
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
      { name: 'Pelipper', id: 279, level: 48, types: ['water', 'flying'] },
      { name: 'Swellow', id: 277, level: 48, types: ['normal', 'flying'] },
      { name: 'Pidgeot', id: 18, level: 54, types: ['normal', 'flying'] }
    ],
    weakAgainst: ['electric', 'ice', 'rock'],
    resistantTo: ['grass', 'fighting', 'bug', 'ground']
  },
  
  'Bugsy': {
    badge: 'Hive Badge',
    type: 'bug',
    team: [
      { name: 'Metapod', id: 11, level: 14, types: ['bug'] },
      { name: 'Kakuna', id: 14, level: 14, types: ['bug', 'poison'] },
      { name: 'Scyther', id: 123, level: 16, types: ['bug', 'flying'] }
    ],
    rematchTeam: [
      { name: 'Yanmega', id: 469, level: 52, types: ['bug', 'flying'] },
      { name: 'Shuckle', id: 213, level: 48, types: ['bug', 'rock'] },
      { name: 'Pinsir', id: 127, level: 50, types: ['bug'] },
      { name: 'Heracross', id: 214, level: 52, types: ['bug', 'fighting'] },
      { name: 'Scizor', id: 212, level: 55, types: ['bug', 'steel'] }
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
      { name: 'Girafarig', id: 203, level: 50, types: ['normal', 'psychic'] },
      { name: 'Lickilicky', id: 463, level: 50, types: ['normal'] },
      { name: 'Bibarel', id: 400, level: 48, types: ['normal', 'water'] },
      { name: 'Delcatty', id: 301, level: 48, types: ['normal'] },
      { name: 'Miltank', id: 241, level: 54, types: ['normal'] }
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
      { name: 'Sableye', id: 302, level: 52, types: ['dark', 'ghost'] },
      { name: 'Dusknoir', id: 477, level: 52, types: ['ghost'] },
      { name: 'Mismagius', id: 429, level: 52, types: ['ghost'] },
      { name: 'Gengar', id: 94, level: 57, types: ['ghost', 'poison'] },
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
      { name: 'Hariyama', id: 297, level: 52, types: ['fighting'] },
      { name: 'Hitmontop', id: 237, level: 52, types: ['fighting'] },
      { name: 'Toxicroak', id: 454, level: 52, types: ['poison', 'fighting'] },
      { name: 'Breloom', id: 286, level: 54, types: ['grass', 'fighting'] },
      { name: 'Machamp', id: 68, level: 56, types: ['fighting'] }
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
      { name: 'Bronzong', id: 437, level: 52, types: ['steel', 'psychic'] },
      { name: 'Magnezone', id: 462, level: 52, types: ['electric', 'steel'] },
      { name: 'Empoleon', id: 395, level: 52, types: ['water', 'steel'] },
      { name: 'Metagross', id: 376, level: 52, types: ['steel', 'psychic'] },
      { name: 'Steelix', id: 208, level: 56, types: ['steel', 'ground'] }
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
      { name: 'Abomasnow', id: 460, level: 52, types: ['grass', 'ice'] },
      { name: 'Walrein', id: 365, level: 52, types: ['ice', 'water'] },
      { name: 'Froslass', id: 478, level: 52, types: ['ice', 'ghost'] },
      { name: 'Dewgong', id: 87, level: 54, types: ['water', 'ice'] },
      { name: 'Mamoswine', id: 473, level: 56, types: ['ice', 'ground'] }
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
      { name: 'Dragonite', id: 149, level: 52, types: ['dragon', 'flying'] },
      { name: 'Gyarados', id: 130, level: 52, types: ['water', 'flying'] },
      { name: 'Charizard', id: 6, level: 52, types: ['fire', 'flying'] },
      { name: 'Aerodactyl', id: 142, level: 52, types: ['rock', 'flying'] },
      { name: 'Salamence', id: 373, level: 56, types: ['dragon', 'flying'] },
      { name: 'Kingdra', id: 230, level: 60, types: ['water', 'dragon'] }
    ],
    weakAgainst: ['ice', 'dragon', 'fairy'],
    resistantTo: ['fire', 'water', 'electric', 'grass']
  },
  
  // Hoenn Gym Leaders
  'Roxanne': {
    badge: 'Stone Badge',
    type: 'rock',
    team: [
      { name: 'Geodude', id: 74, level: 14, types: ['rock', 'ground'] },
      { name: 'Nosepass', id: 299, level: 15, types: ['rock'] }
    ],
    rematchTeam: [
      { name: 'Golem', id: 76, level: 37, types: ['rock', 'ground'] },
      { name: 'Kabutops', id: 141, level: 35, types: ['rock', 'water'] },
      { name: 'Omastar', id: 139, level: 35, types: ['rock', 'water'] },
      { name: 'Probopass', id: 476, level: 40, types: ['rock', 'steel'] }
    ],
    weakAgainst: ['water', 'grass', 'fighting', 'ground', 'steel'],
    resistantTo: ['normal', 'fire', 'poison', 'flying']
  },
  
  'Brawly': {
    badge: 'Knuckle Badge',
    type: 'fighting',
    team: [
      { name: 'Machop', id: 66, level: 17, types: ['fighting'] },
      { name: 'Makuhita', id: 296, level: 18, types: ['fighting'] }
    ],
    rematchTeam: [
      { name: 'Hariyama', id: 297, level: 37, types: ['fighting'] },
      { name: 'Hitmontop', id: 237, level: 38, types: ['fighting'] },
      { name: 'Medicham', id: 308, level: 39, types: ['fighting', 'psychic'] },
      { name: 'Machamp', id: 68, level: 40, types: ['fighting'] }
    ],
    weakAgainst: ['flying', 'psychic', 'fairy'],
    resistantTo: ['rock', 'bug', 'dark']
  },
  
  'Wattson': {
    badge: 'Dynamo Badge',
    type: 'electric',
    team: [
      { name: 'Magnemite', id: 81, level: 22, types: ['electric', 'steel'] },
      { name: 'Voltorb', id: 100, level: 20, types: ['electric'] },
      { name: 'Magneton', id: 82, level: 23, types: ['electric', 'steel'] }
    ],
    rematchTeam: [
      { name: 'Electrode', id: 101, level: 38, types: ['electric'] },
      { name: 'Manectric', id: 310, level: 40, types: ['electric'] },
      { name: 'Magnezone', id: 462, level: 41, types: ['electric', 'steel'] },
      { name: 'Electivire', id: 466, level: 44, types: ['electric'] }
    ],
    weakAgainst: ['ground'],
    resistantTo: ['electric', 'flying', 'steel']
  },
  
  'Flannery': {
    badge: 'Heat Badge',
    type: 'fire',
    team: [
      { name: 'Slugma', id: 218, level: 26, types: ['fire'] },
      { name: 'Slugma', id: 218, level: 26, types: ['fire'] },
      { name: 'Torkoal', id: 324, level: 28, types: ['fire'] }
    ],
    rematchTeam: [
      { name: 'Arcanine', id: 59, level: 38, types: ['fire'] },
      { name: 'Magcargo', id: 219, level: 40, types: ['fire', 'rock'] },
      { name: 'Camerupt', id: 323, level: 41, types: ['fire', 'ground'] },
      { name: 'Torkoal', id: 324, level: 43, types: ['fire'] }
    ],
    weakAgainst: ['water', 'ground', 'rock'],
    resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy']
  },
  
  'Norman': {
    badge: 'Balance Badge',
    type: 'normal',
    team: [
      { name: 'Slakoth', id: 287, level: 28, types: ['normal'] },
      { name: 'Vigoroth', id: 288, level: 30, types: ['normal'] },
      { name: 'Slaking', id: 289, level: 31, types: ['normal'] }
    ],
    rematchTeam: [
      { name: 'Spinda', id: 327, level: 42, types: ['normal'] },
      { name: 'Linoone', id: 264, level: 42, types: ['normal'] },
      { name: 'Blissey', id: 242, level: 42, types: ['normal'] },
      { name: 'Slaking', id: 289, level: 45, types: ['normal'] },
      { name: 'Slaking', id: 289, level: 45, types: ['normal'] }
    ],
    weakAgainst: ['fighting'],
    resistantTo: ['ghost']
  },
  
  'Winona': {
    badge: 'Feather Badge',
    type: 'flying',
    team: [
      { name: 'Swellow', id: 277, level: 31, types: ['normal', 'flying'] },
      { name: 'Pelipper', id: 279, level: 30, types: ['water', 'flying'] },
      { name: 'Skarmory', id: 227, level: 32, types: ['steel', 'flying'] },
      { name: 'Altaria', id: 334, level: 33, types: ['dragon', 'flying'] }
    ],
    rematchTeam: [
      { name: 'Dragonite', id: 149, level: 43, types: ['dragon', 'flying'] },
      { name: 'Tropius', id: 357, level: 43, types: ['grass', 'flying'] },
      { name: 'Pelipper', id: 279, level: 45, types: ['water', 'flying'] },
      { name: 'Skarmory', id: 227, level: 43, types: ['steel', 'flying'] },
      { name: 'Altaria', id: 334, level: 45, types: ['dragon', 'flying'] }
    ],
    weakAgainst: ['electric', 'ice', 'rock'],
    resistantTo: ['grass', 'fighting', 'bug', 'ground']
  },
  
  'Tate': {
    badge: 'Mind Badge',
    type: 'psychic',
    team: [
      { name: 'Solrock', id: 338, level: 41, types: ['rock', 'psychic'] },
      { name: 'Claydol', id: 344, level: 42, types: ['ground', 'psychic'] }
    ],
    rematchTeam: [
      { name: 'Solrock', id: 338, level: 50, types: ['rock', 'psychic'] },
      { name: 'Claydol', id: 344, level: 49, types: ['ground', 'psychic'] },
      { name: 'Slowking', id: 199, level: 49, types: ['water', 'psychic'] },
      { name: 'Solrock', id: 338, level: 53, types: ['rock', 'psychic'] }
    ],
    weakAgainst: ['bug', 'ghost', 'dark'],
    resistantTo: ['fighting', 'psychic']
  },
  
  'Liza': {
    badge: 'Mind Badge',
    type: 'psychic',
    team: [
      { name: 'Lunatone', id: 337, level: 41, types: ['rock', 'psychic'] },
      { name: 'Xatu', id: 178, level: 42, types: ['psychic', 'flying'] }
    ],
    rematchTeam: [
      { name: 'Lunatone', id: 337, level: 50, types: ['rock', 'psychic'] },
      { name: 'Xatu', id: 178, level: 49, types: ['psychic', 'flying'] },
      { name: 'Hypno', id: 97, level: 49, types: ['psychic'] },
      { name: 'Lunatone', id: 337, level: 53, types: ['rock', 'psychic'] }
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
    rematchTeam: [
      { name: 'Wailord', id: 321, level: 57, types: ['water'] },
      { name: 'Tentacruel', id: 73, level: 55, types: ['water', 'poison'] },
      { name: 'Whiscash', id: 340, level: 56, types: ['water', 'ground'] },
      { name: 'Ludicolo', id: 272, level: 56, types: ['water', 'grass'] },
      { name: 'Gyarados', id: 130, level: 56, types: ['water', 'flying'] },
      { name: 'Milotic', id: 350, level: 58, types: ['water'] }
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
      { name: 'Walrein', id: 365, level: 56, types: ['ice', 'water'] },
      { name: 'Crawdaunt', id: 342, level: 58, types: ['water', 'dark'] },
      { name: 'Kingdra', id: 230, level: 61, types: ['water', 'dragon'] }
    ],
    weakAgainst: ['electric', 'grass'],
    resistantTo: ['fire', 'water', 'ice', 'steel']
  },

  // Sinnoh Gym Leaders
  'Roark': {
    name: 'Roark',
    city: 'Oreburgh City',
    type: 'rock',
    badge: 'Coal Badge',
    team: [
      { name: 'Geodude', id: 74, level: 12, types: ['rock', 'ground'] },
      { name: 'Onix', id: 95, level: 12, types: ['rock', 'ground'] },
      { name: 'Cranidos', id: 408, level: 14, types: ['rock'] }
    ],
    rematchTeam: [
      { name: 'Golem', id: 76, level: 56, types: ['rock', 'ground'] },
      { name: 'Steelix', id: 208, level: 56, types: ['steel', 'ground'] },
      { name: 'Rampardos', id: 409, level: 58, types: ['rock'] },
      { name: 'Tyranitar', id: 248, level: 58, types: ['rock', 'dark'] },
      { name: 'Rhyperior', id: 464, level: 60, types: ['ground', 'rock'] }
    ],
    weakAgainst: ['water', 'grass', 'fighting', 'ground', 'steel'],
    resistantTo: ['normal', 'fire', 'poison', 'flying']
  },

  'Gardenia': {
    name: 'Gardenia',
    city: 'Eterna City',
    type: 'grass',
    badge: 'Forest Badge',
    team: [
      { name: 'Cherubi', id: 420, level: 19, types: ['grass'] },
      { name: 'Turtwig', id: 387, level: 19, types: ['grass'] },
      { name: 'Roserade', id: 407, level: 22, types: ['grass', 'poison'] }
    ],
    rematchTeam: [
      { name: 'Cherrim', id: 421, level: 58, types: ['grass'] },
      { name: 'Torterra', id: 389, level: 58, types: ['grass', 'ground'] },
      { name: 'Roserade', id: 407, level: 60, types: ['grass', 'poison'] },
      { name: 'Leafeon', id: 470, level: 58, types: ['grass'] },
      { name: 'Shaymin', id: 492, level: 62, types: ['grass'] }
    ],
    weakAgainst: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resistantTo: ['water', 'electric', 'grass', 'ground']
  },

  'Maylene': {
    name: 'Maylene',
    city: 'Veilstone City',
    type: 'fighting',
    badge: 'Cobble Badge',
    team: [
      { name: 'Meditite', id: 307, level: 27, types: ['fighting', 'psychic'] },
      { name: 'Machoke', id: 67, level: 27, types: ['fighting'] },
      { name: 'Lucario', id: 448, level: 30, types: ['fighting', 'steel'] }
    ],
    rematchTeam: [
      { name: 'Medicham', id: 308, level: 58, types: ['fighting', 'psychic'] },
      { name: 'Machamp', id: 68, level: 58, types: ['fighting'] },
      { name: 'Lucario', id: 448, level: 62, types: ['fighting', 'steel'] },
      { name: 'Toxicroak', id: 454, level: 60, types: ['poison', 'fighting'] },
      { name: 'Gallade', id: 475, level: 60, types: ['psychic', 'fighting'] }
    ],
    weakAgainst: ['flying', 'psychic', 'fairy'],
    resistantTo: ['rock', 'bug', 'dark']
  },

  'Crasher Wake': {
    name: 'Crasher Wake',
    city: 'Pastoria City',
    type: 'water',
    badge: 'Fen Badge',
    team: [
      { name: 'Gyarados', id: 130, level: 33, types: ['water', 'flying'] },
      { name: 'Quagsire', id: 195, level: 34, types: ['water', 'ground'] },
      { name: 'Floatzel', id: 419, level: 37, types: ['water'] }
    ],
    rematchTeam: [
      { name: 'Gyarados', id: 130, level: 60, types: ['water', 'flying'] },
      { name: 'Quagsire', id: 195, level: 60, types: ['water', 'ground'] },
      { name: 'Floatzel', id: 419, level: 62, types: ['water'] },
      { name: 'Lapras', id: 131, level: 58, types: ['water', 'ice'] },
      { name: 'Empoleon', id: 395, level: 58, types: ['water', 'steel'] }
    ],
    weakAgainst: ['electric', 'grass'],
    resistantTo: ['fire', 'water', 'ice', 'steel']
  },

  'Fantina': {
    name: 'Fantina',
    city: 'Hearthome City',
    type: 'ghost',
    badge: 'Relic Badge',
    team: [
      { name: 'Duskull', id: 355, level: 32, types: ['ghost'] },
      { name: 'Haunter', id: 93, level: 34, types: ['ghost', 'poison'] },
      { name: 'Mismagius', id: 429, level: 36, types: ['ghost'] }
    ],
    rematchTeam: [
      { name: 'Dusknoir', id: 477, level: 60, types: ['ghost'] },
      { name: 'Gengar', id: 94, level: 60, types: ['ghost', 'poison'] },
      { name: 'Mismagius', id: 429, level: 62, types: ['ghost'] },
      { name: 'Banette', id: 354, level: 58, types: ['ghost'] },
      { name: 'Rotom', id: 479, level: 58, types: ['electric', 'ghost'] }
    ],
    weakAgainst: ['ghost', 'dark'],
    resistantTo: ['poison', 'bug']
  },

  'Byron': {
    name: 'Byron',
    city: 'Canalave City',
    type: 'steel',
    badge: 'Mine Badge',
    team: [
      { name: 'Magneton', id: 82, level: 37, types: ['electric', 'steel'] },
      { name: 'Steelix', id: 208, level: 38, types: ['steel', 'ground'] },
      { name: 'Bastiodon', id: 411, level: 41, types: ['rock', 'steel'] }
    ],
    rematchTeam: [
      { name: 'Magnezone', id: 462, level: 60, types: ['electric', 'steel'] },
      { name: 'Steelix', id: 208, level: 60, types: ['steel', 'ground'] },
      { name: 'Bastiodon', id: 411, level: 62, types: ['rock', 'steel'] },
      { name: 'Lucario', id: 448, level: 58, types: ['fighting', 'steel'] },
      { name: 'Dialga', id: 483, level: 65, types: ['steel', 'dragon'] }
    ],
    weakAgainst: ['fire', 'fighting', 'ground'],
    resistantTo: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy']
  },

  'Candice': {
    name: 'Candice',
    city: 'Snowpoint City',
    type: 'ice',
    badge: 'Icicle Badge',
    team: [
      { name: 'Sneasel', id: 215, level: 40, types: ['dark', 'ice'] },
      { name: 'Piloswine', id: 221, level: 40, types: ['ice', 'ground'] },
      { name: 'Abomasnow', id: 460, level: 42, types: ['grass', 'ice'] },
      { name: 'Froslass', id: 478, level: 44, types: ['ice', 'ghost'] }
    ],
    rematchTeam: [
      { name: 'Weavile', id: 461, level: 62, types: ['dark', 'ice'] },
      { name: 'Mamoswine', id: 473, level: 62, types: ['ice', 'ground'] },
      { name: 'Abomasnow', id: 460, level: 64, types: ['grass', 'ice'] },
      { name: 'Froslass', id: 478, level: 66, types: ['ice', 'ghost'] },
      { name: 'Glaceon', id: 471, level: 64, types: ['ice'] }
    ],
    weakAgainst: ['fire', 'fighting', 'rock', 'steel'],
    resistantTo: ['ice']
  },

  'Volkner': {
    name: 'Volkner',
    city: 'Sunyshore City',
    type: 'electric',
    badge: 'Beacon Badge',
    team: [
      { name: 'Jolteon', id: 135, level: 46, types: ['electric'] },
      { name: 'Raichu', id: 26, level: 46, types: ['electric'] },
      { name: 'Luxray', id: 405, level: 48, types: ['electric'] },
      { name: 'Electivire', id: 466, level: 50, types: ['electric'] }
    ],
    rematchTeam: [
      { name: 'Jolteon', id: 135, level: 66, types: ['electric'] },
      { name: 'Raichu', id: 26, level: 66, types: ['electric'] },
      { name: 'Luxray', id: 405, level: 68, types: ['electric'] },
      { name: 'Electivire', id: 466, level: 70, types: ['electric'] },
      { name: 'Zapdos', id: 145, level: 68, types: ['electric', 'flying'] }
    ],
    weakAgainst: ['ground'],
    resistantTo: ['electric', 'flying', 'steel']
  },

  // Unova Gym Leaders (Black/White)
  'Cilan': {
    name: 'Cilan',
    city: 'Striaton City',
    type: 'grass',
    badge: 'Trio Badge',
    team: [
      { name: 'Pansage', id: 511, level: 12, types: ['grass'] }
    ],
    rematchTeam: [
      { name: 'Simisage', id: 512, level: 65, types: ['grass'] },
      { name: 'Lilligant', id: 549, level: 65, types: ['grass'] },
      { name: 'Leavanny', id: 542, level: 65, types: ['bug', 'grass'] },
      { name: 'Ferrothorn', id: 598, level: 65, types: ['grass', 'steel'] }
    ],
    weakAgainst: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resistantTo: ['water', 'electric', 'grass', 'ground']
  },

  'Chili': {
    name: 'Chili',
    city: 'Striaton City',
    type: 'fire',
    badge: 'Trio Badge',
    team: [
      { name: 'Pansear', id: 513, level: 12, types: ['fire'] }
    ],
    rematchTeam: [
      { name: 'Simisear', id: 514, level: 65, types: ['fire'] },
      { name: 'Chandelure', id: 609, level: 65, types: ['ghost', 'fire'] },
      { name: 'Darmanitan', id: 555, level: 65, types: ['fire'] },
      { name: 'Heatmor', id: 631, level: 65, types: ['fire'] }
    ],
    weakAgainst: ['water', 'ground', 'rock'],
    resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy']
  },

  'Cress': {
    name: 'Cress',
    city: 'Striaton City',
    type: 'water',
    badge: 'Trio Badge',
    team: [
      { name: 'Panpour', id: 515, level: 12, types: ['water'] }
    ],
    rematchTeam: [
      { name: 'Simipour', id: 516, level: 65, types: ['water'] },
      { name: 'Carracosta', id: 565, level: 65, types: ['water', 'rock'] },
      { name: 'Jellicent', id: 593, level: 65, types: ['water', 'ghost'] },
      { name: 'Swanna', id: 581, level: 65, types: ['water', 'flying'] }
    ],
    weakAgainst: ['electric', 'grass'],
    resistantTo: ['fire', 'water', 'ice', 'steel']
  },

  'Lenora': {
    name: 'Lenora',
    city: 'Nacrene City',
    type: 'normal',
    badge: 'Basic Badge',
    team: [
      { name: 'Herdier', id: 506, level: 18, types: ['normal'] },
      { name: 'Watchog', id: 505, level: 20, types: ['normal'] }
    ],
    rematchTeam: [
      { name: 'Stoutland', id: 508, level: 65, types: ['normal'] },
      { name: 'Watchog', id: 505, level: 65, types: ['normal'] },
      { name: 'Cinccino', id: 573, level: 65, types: ['normal'] },
      { name: 'Audino', id: 531, level: 65, types: ['normal'] }
    ],
    weakAgainst: ['fighting'],
    resistantTo: []
  },

  'Burgh': {
    name: 'Burgh',
    city: 'Castelia City',
    type: 'bug',
    badge: 'Insect Badge',
    team: [
      { name: 'Whirlipede', id: 544, level: 21, types: ['bug', 'poison'] },
      { name: 'Dwebble', id: 557, level: 21, types: ['bug', 'rock'] },
      { name: 'Leavanny', id: 542, level: 23, types: ['bug', 'grass'] }
    ],
    rematchTeam: [
      { name: 'Scolipede', id: 545, level: 65, types: ['bug', 'poison'] },
      { name: 'Crustle', id: 558, level: 65, types: ['bug', 'rock'] },
      { name: 'Leavanny', id: 542, level: 65, types: ['bug', 'grass'] },
      { name: 'Galvantula', id: 596, level: 65, types: ['bug', 'electric'] }
    ],
    weakAgainst: ['fire', 'flying', 'rock'],
    resistantTo: ['grass', 'fighting', 'ground']
  },

  'Elesa': {
    name: 'Elesa',
    city: 'Nimbasa City',
    type: 'electric',
    badge: 'Bolt Badge',
    team: [
      { name: 'Emolga', id: 587, level: 25, types: ['electric', 'flying'] },
      { name: 'Emolga', id: 587, level: 25, types: ['electric', 'flying'] },
      { name: 'Zebstrika', id: 523, level: 27, types: ['electric'] }
    ],
    rematchTeam: [
      { name: 'Emolga', id: 587, level: 65, types: ['electric', 'flying'] },
      { name: 'Zebstrika', id: 523, level: 65, types: ['electric'] },
      { name: 'Galvantula', id: 596, level: 65, types: ['bug', 'electric'] },
      { name: 'Eelektross', id: 604, level: 65, types: ['electric'] }
    ],
    weakAgainst: ['ground'],
    resistantTo: ['electric', 'flying', 'steel']
  },

  'Clay': {
    name: 'Clay',
    city: 'Driftveil City',
    type: 'ground',
    badge: 'Quake Badge',
    team: [
      { name: 'Krokorok', id: 552, level: 29, types: ['ground', 'dark'] },
      { name: 'Palpitoad', id: 536, level: 29, types: ['water', 'ground'] },
      { name: 'Excadrill', id: 530, level: 31, types: ['ground', 'steel'] }
    ],
    rematchTeam: [
      { name: 'Krookodile', id: 553, level: 65, types: ['ground', 'dark'] },
      { name: 'Seismitoad', id: 537, level: 65, types: ['water', 'ground'] },
      { name: 'Excadrill', id: 530, level: 65, types: ['ground', 'steel'] },
      { name: 'Golurk', id: 623, level: 65, types: ['ground', 'ghost'] }
    ],
    weakAgainst: ['water', 'grass', 'ice'],
    resistantTo: ['poison', 'rock', 'electric']
  },

  'Skyla': {
    name: 'Skyla',
    city: 'Mistralton City',
    type: 'flying',
    badge: 'Jet Badge',
    team: [
      { name: 'Swoobat', id: 528, level: 33, types: ['psychic', 'flying'] },
      { name: 'Unfezant', id: 521, level: 33, types: ['normal', 'flying'] },
      { name: 'Swanna', id: 581, level: 35, types: ['water', 'flying'] }
    ],
    rematchTeam: [
      { name: 'Swoobat', id: 528, level: 65, types: ['psychic', 'flying'] },
      { name: 'Unfezant', id: 521, level: 65, types: ['normal', 'flying'] },
      { name: 'Swanna', id: 581, level: 65, types: ['water', 'flying'] },
      { name: 'Archeops', id: 567, level: 65, types: ['rock', 'flying'] }
    ],
    weakAgainst: ['electric', 'ice', 'rock'],
    resistantTo: ['grass', 'fighting', 'bug', 'ground']
  },

  'Brycen': {
    name: 'Brycen',
    city: 'Icirrus City',
    type: 'ice',
    badge: 'Freeze Badge',
    team: [
      { name: 'Vanillish', id: 583, level: 37, types: ['ice'] },
      { name: 'Cryogonal', id: 615, level: 37, types: ['ice'] },
      { name: 'Beartic', id: 614, level: 39, types: ['ice'] }
    ],
    rematchTeam: [
      { name: 'Vanilluxe', id: 584, level: 65, types: ['ice'] },
      { name: 'Cryogonal', id: 615, level: 65, types: ['ice'] },
      { name: 'Beartic', id: 614, level: 65, types: ['ice'] },
      { name: 'Lapras', id: 131, level: 65, types: ['water', 'ice'] }
    ],
    weakAgainst: ['fire', 'fighting', 'rock', 'steel'],
    resistantTo: ['ice']
  },

  'Drayden': {
    name: 'Drayden',
    city: 'Opelucid City',
    type: 'dragon',
    badge: 'Legend Badge',
    team: [
      { name: 'Fraxure', id: 611, level: 41, types: ['dragon'] },
      { name: 'Fraxure', id: 611, level: 41, types: ['dragon'] },
      { name: 'Haxorus', id: 612, level: 43, types: ['dragon'] }
    ],
    rematchTeam: [
      { name: 'Haxorus', id: 612, level: 65, types: ['dragon'] },
      { name: 'Flygon', id: 330, level: 65, types: ['ground', 'dragon'] },
      { name: 'Altaria', id: 334, level: 65, types: ['dragon', 'flying'] },
      { name: 'Druddigon', id: 621, level: 65, types: ['dragon'] }
    ],
    weakAgainst: ['ice', 'dragon', 'fairy'],
    resistantTo: ['fire', 'water', 'electric', 'grass']
  },

  'Iris': {
    name: 'Iris',
    city: 'Opelucid City',
    type: 'dragon',
    badge: 'Legend Badge',
    team: [
      { name: 'Fraxure', id: 611, level: 41, types: ['dragon'] },
      { name: 'Fraxure', id: 611, level: 41, types: ['dragon'] },
      { name: 'Haxorus', id: 612, level: 43, types: ['dragon'] }
    ],
    rematchTeam: [
      { name: 'Haxorus', id: 612, level: 65, types: ['dragon'] },
      { name: 'Flygon', id: 330, level: 65, types: ['ground', 'dragon'] },
      { name: 'Altaria', id: 334, level: 65, types: ['dragon', 'flying'] },
      { name: 'Druddigon', id: 621, level: 65, types: ['dragon'] }
    ],
    weakAgainst: ['ice', 'dragon', 'fairy'],
    resistantTo: ['fire', 'water', 'electric', 'grass']
  },

  // Unova Gym Leaders (Black 2/White 2)
  'Cheren': {
    name: 'Cheren',
    city: 'Aspertia City',
    type: 'normal',
    badge: 'Basic Badge',
    team: [
      { name: 'Patrat', id: 504, level: 11, types: ['normal'] },
      { name: 'Lillipup', id: 506, level: 13, types: ['normal'] }
    ],
    rematchTeam: [
      { name: 'Stoutland', id: 508, level: 65, types: ['normal'] },
      { name: 'Watchog', id: 505, level: 65, types: ['normal'] },
      { name: 'Cinccino', id: 573, level: 65, types: ['normal'] },
      { name: 'Bouffalant', id: 626, level: 65, types: ['normal'] }
    ],
    weakAgainst: ['fighting'],
    resistantTo: []
  },

  'Roxie': {
    name: 'Roxie',
    city: 'Virbank City',
    type: 'poison',
    badge: 'Toxic Badge',
    team: [
      { name: 'Koffing', id: 109, level: 16, types: ['poison'] },
      { name: 'Grimer', id: 88, level: 18, types: ['poison'] }
    ],
    rematchTeam: [
      { name: 'Weezing', id: 110, level: 65, types: ['poison'] },
      { name: 'Muk', id: 89, level: 65, types: ['poison'] },
      { name: 'Scolipede', id: 545, level: 65, types: ['bug', 'poison'] },
      { name: 'Garbodor', id: 569, level: 65, types: ['poison'] }
    ],
    weakAgainst: ['ground', 'psychic'],
    resistantTo: ['grass', 'fighting', 'poison', 'bug', 'fairy']
  },

  'Marlon': {
    name: 'Marlon',
    city: 'Humilau City',
    type: 'water',
    badge: 'Wave Badge',
    team: [
      { name: 'Carracosta', id: 565, level: 49, types: ['water', 'rock'] },
      { name: 'Jellicent', id: 593, level: 51, types: ['water', 'ghost'] }
    ],
    rematchTeam: [
      { name: 'Carracosta', id: 565, level: 65, types: ['water', 'rock'] },
      { name: 'Jellicent', id: 593, level: 65, types: ['water', 'ghost'] },
      { name: 'Swanna', id: 581, level: 65, types: ['water', 'flying'] },
      { name: 'Seismitoad', id: 537, level: 65, types: ['water', 'ground'] }
    ],
    weakAgainst: ['electric', 'grass'],
    resistantTo: ['fire', 'water', 'ice', 'steel']
  }
};

export const typeEffectiveness = {
  normal: {
    weakTo: ['fighting'],
    resistantTo: [],
    immuneTo: ['ghost']
  },
  fire: {
    weakTo: ['water', 'ground', 'rock'],
    resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
    immuneTo: []
  },
  water: {
    weakTo: ['electric', 'grass'],
    resistantTo: ['fire', 'water', 'ice', 'steel'],
    immuneTo: []
  },
  electric: {
    weakTo: ['ground'],
    resistantTo: ['electric', 'flying', 'steel'],
    immuneTo: []
  },
  grass: {
    weakTo: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resistantTo: ['water', 'electric', 'grass', 'ground'],
    immuneTo: []
  },
  ice: {
    weakTo: ['fire', 'fighting', 'rock', 'steel'],
    resistantTo: ['ice'],
    immuneTo: []
  },
  fighting: {
    weakTo: ['flying', 'psychic', 'fairy'],
    resistantTo: ['rock', 'bug', 'dark'],
    immuneTo: []
  },
  poison: {
    weakTo: ['ground', 'psychic'],
    resistantTo: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
    immuneTo: []
  },
  ground: {
    weakTo: ['water', 'grass', 'ice'],
    resistantTo: ['poison', 'rock'],
    immuneTo: ['electric']
  },
  flying: {
    weakTo: ['electric', 'ice', 'rock'],
    resistantTo: ['grass', 'fighting', 'bug'],
    immuneTo: ['ground']
  },
  psychic: {
    weakTo: ['bug', 'ghost', 'dark'],
    resistantTo: ['fighting', 'psychic'],
    immuneTo: []
  },
  bug: {
    weakTo: ['fire', 'flying', 'rock'],
    resistantTo: ['grass', 'fighting', 'ground'],
    immuneTo: []
  },
  rock: {
    weakTo: ['water', 'grass', 'fighting', 'ground', 'steel'],
    resistantTo: ['normal', 'fire', 'poison', 'flying'],
    immuneTo: []
  },
  ghost: {
    weakTo: ['ghost', 'dark'],
    resistantTo: ['poison', 'bug'],
    immuneTo: ['normal', 'fighting']
  },
  dragon: {
    weakTo: ['ice', 'dragon', 'fairy'],
    resistantTo: ['fire', 'water', 'electric', 'grass'],
    immuneTo: []
  },
  dark: {
    weakTo: ['fighting', 'bug', 'fairy'],
    resistantTo: ['ghost', 'dark'],
    immuneTo: ['psychic']
  },
  steel: {
    weakTo: ['fire', 'fighting', 'ground'],
    resistantTo: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'],
    immuneTo: ['poison']
  },
  fairy: {
    weakTo: ['poison', 'steel'],
    resistantTo: ['fighting', 'bug', 'dark'],
    immuneTo: ['dragon']
  }
};