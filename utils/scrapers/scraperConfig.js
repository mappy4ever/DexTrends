// Bulbapedia Scraper Configuration
// Centralized configuration for all scraping operations

export const scraperConfig = {
  // Bulbapedia base URLs
  bulbapedia: {
    baseUrl: 'https://bulbapedia.bulbagarden.net',
    wikiUrl: 'https://bulbapedia.bulbagarden.net/wiki',
    apiUrl: 'https://bulbapedia.bulbagarden.net/w/api.php',
    imageUrl: 'https://archives.bulbagarden.net'
  },

  // Local storage paths
  storage: {
    dataDir: '/public/data/scraped',
    imagesDir: '/public/images/scraped',
    gymLeadersDir: '/public/images/scraped/gym-leaders',
    gamesDir: '/public/images/scraped/games',
    pokemonDir: '/public/images/scraped/pokemon',
    badgesDir: '/public/images/scraped/badges',
    eliteFourDir: '/public/images/scraped/elite-four',
    energyDir: '/public/images/scraped/energy',
    mapsDir: '/public/images/scraped/maps',
    cacheDir: '/public/data/cache'
  },

  // Scraper targets
  targets: {
    gymLeaders: {
      kanto: {
        pages: [
          'Brock', 'Misty', 'Lt._Surge', 'Erika', 'Koga', 'Sabrina', 'Blaine', 'Giovanni'
        ]
      },
      johto: {
        pages: [
          'Falkner', 'Bugsy', 'Whitney', 'Morty', 'Chuck', 'Jasmine', 'Pryce', 'Clair'
        ]
      },
      hoenn: {
        pages: [
          'Roxanne', 'Brawly', 'Wattson', 'Flannery', 'Norman', 'Winona', 'Tate_and_Liza', 'Wallace', 'Juan'
        ]
      },
      sinnoh: {
        pages: [
          'Roark', 'Gardenia', 'Fantina', 'Maylene', 'Crasher_Wake', 'Byron', 'Candice', 'Volkner'
        ]
      },
      unova: {
        pages: [
          'Cilan', 'Chili', 'Cress', 'Lenora', 'Burgh', 'Elesa', 'Clay', 'Skyla', 'Brycen', 'Drayden', 'Iris'
        ]
      },
      kalos: {
        pages: [
          'Viola', 'Grant', 'Korrina', 'Ramos', 'Clemont', 'Valerie', 'Olympia', 'Wulfric'
        ]
      },
      alola: {
        pages: [
          'Ilima', 'Lana', 'Kiawe', 'Mallow', 'Sophocles', 'Acerola', 'Mina', 'Nanu'
        ]
      },
      galar: {
        pages: [
          'Milo', 'Nessa', 'Kabu', 'Bea', 'Allister', 'Opal', 'Gordie', 'Melony', 'Piers', 'Raihan'
        ]
      },
      paldea: {
        pages: [
          'Katy', 'Brassius', 'Iono', 'Kofu', 'Larry', 'Ryme', 'Tulip', 'Grusha'
        ]
      }
    },

    games: {
      mainSeries: [
        'Pokémon_Red_and_Blue',
        'Pokémon_Yellow',
        'Pokémon_Gold_and_Silver',
        'Pokémon_Crystal',
        'Pokémon_Ruby_and_Sapphire',
        'Pokémon_Emerald',
        'Pokémon_FireRed_and_LeafGreen',
        'Pokémon_Diamond_and_Pearl',
        'Pokémon_Platinum',
        'Pokémon_HeartGold_and_SoulSilver',
        'Pokémon_Black_and_White',
        'Pokémon_Black_2_and_White_2',
        'Pokémon_X_and_Y',
        'Pokémon_Omega_Ruby_and_Alpha_Sapphire',
        'Pokémon_Sun_and_Moon',
        'Pokémon_Ultra_Sun_and_Ultra_Moon',
        'Pokémon_Let\'s_Go,_Pikachu!_and_Let\'s_Go,_Eevee!',
        'Pokémon_Sword_and_Shield',
        'Pokémon_Brilliant_Diamond_and_Shining_Pearl',
        'Pokémon_Legends:_Arceus',
        'Pokémon_Scarlet_and_Violet'
      ]
    },

    badges: {
      kanto: ['Boulder_Badge', 'Cascade_Badge', 'Thunder_Badge', 'Rainbow_Badge', 'Soul_Badge', 'Marsh_Badge', 'Volcano_Badge', 'Earth_Badge'],
      johto: ['Zephyr_Badge', 'Hive_Badge', 'Plain_Badge', 'Fog_Badge', 'Storm_Badge', 'Mineral_Badge', 'Glacier_Badge', 'Rising_Badge'],
      hoenn: ['Stone_Badge', 'Knuckle_Badge', 'Dynamo_Badge', 'Heat_Badge', 'Balance_Badge', 'Feather_Badge', 'Mind_Badge', 'Rain_Badge'],
      sinnoh: ['Coal_Badge', 'Forest_Badge', 'Cobble_Badge', 'Fen_Badge', 'Relic_Badge', 'Mine_Badge', 'Icicle_Badge', 'Beacon_Badge'],
      unova: ['Trio_Badge', 'Basic_Badge', 'Insect_Badge', 'Bolt_Badge', 'Quake_Badge', 'Jet_Badge', 'Freeze_Badge', 'Legend_Badge'],
      kalos: ['Bug_Badge', 'Cliff_Badge', 'Rumble_Badge', 'Plant_Badge', 'Voltage_Badge', 'Fairy_Badge', 'Psychic_Badge', 'Iceberg_Badge'],
      galar: ['Grass_Badge', 'Water_Badge', 'Fire_Badge', 'Fighting_Badge', 'Ghost_Badge', 'Fairy_Badge', 'Rock_Badge', 'Ice_Badge', 'Dark_Badge', 'Dragon_Badge'],
      paldea: ['Bug_Badge', 'Grass_Badge', 'Electric_Badge', 'Water_Badge', 'Normal_Badge', 'Ghost_Badge', 'Psychic_Badge', 'Ice_Badge']
    },

    eliteFour: {
      kanto: {
        pages: [
          'Lorelei', 'Bruno', 'Agatha', 'Lance'
        ]
      },
      johto: {
        pages: [
          'Will', 'Koga', 'Bruno', 'Karen'
        ]
      },
      hoenn: {
        pages: [
          'Sidney', 'Phoebe', 'Glacia', 'Drake'
        ]
      },
      sinnoh: {
        pages: [
          'Aaron', 'Bertha', 'Flint', 'Lucian'
        ]
      },
      unova: {
        pages: [
          'Shauntal', 'Grimsley', 'Caitlin', 'Marshal'
        ]
      },
      kalos: {
        pages: [
          'Malva', 'Siebold', 'Wikstrom', 'Drasna'
        ]
      },
      alola: {
        pages: [
          'Hala', 'Olivia', 'Acerola', 'Kahili'
        ]
      },
      galar: {
        pages: []  // Galar uses tournament format instead of Elite Four
      },
      paldea: {
        pages: [
          'Rika', 'Poppy', 'Larry', 'Hassel'
        ]
      }
    },

    champions: {
      kanto: ['Blue_(game)', 'Lance', 'Red_(game)'],
      johto: ['Lance'],
      hoenn: ['Steven_Stone', 'Wallace'],
      sinnoh: ['Cynthia'],
      unova: ['Alder', 'Iris'],
      kalos: ['Diantha'],
      alola: ['Professor_Kukui', 'Hau'],
      galar: ['Leon'],
      paldea: ['Nemona', 'Geeta']
    },

    regionMaps: {
      kanto: 'Kanto',
      johto: 'Johto',
      hoenn: 'Hoenn',
      sinnoh: 'Sinnoh',
      unova: 'Unova',
      kalos: 'Kalos',
      alola: 'Alola',
      galar: 'Galar',
      paldea: 'Paldea',
      // Additional regions
      orre: 'Orre',
      sevii: 'Sevii_Islands',
      orange: 'Orange_Archipelago',
      decolore: 'Decolore_Islands'
    },

    pokemon: {
      starters: [
        'Bulbasaur', 'Charmander', 'Squirtle',
        'Chikorita', 'Cyndaquil', 'Totodile',
        'Treecko', 'Torchic', 'Mudkip',
        'Turtwig', 'Chimchar', 'Piplup',
        'Snivy', 'Tepig', 'Oshawott',
        'Chespin', 'Fennekin', 'Froakie',
        'Rowlet', 'Litten', 'Popplio',
        'Grookey', 'Scorbunny', 'Sobble',
        'Sprigatito', 'Fuecoco', 'Quaxly'
      ]
    }
  },

  // Scraping settings
  settings: {
    requestDelay: 1000, // 1 second between requests
    retryAttempts: 3,
    timeout: 30000, // 30 seconds
    userAgent: 'DexTrends-Scraper/1.0 (Educational purposes)',
    imageSizes: {
      thumbnail: 150,
      medium: 300,
      large: 600
    },
    allowedImageTypes: ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
    maxFileSize: 5 * 1024 * 1024 // 5MB
  },

  // Data structure templates
  templates: {
    gymLeader: {
      id: '',
      name: '',
      region: '',
      city: '',
      type: '',
      badge: '',
      image: '',
      team: [],
      quote: '',
      description: '',
      generation: 1
    },

    game: {
      id: '',
      title: '',
      region: '',
      platform: '',
      releaseDate: '',
      generation: 1,
      images: {
        cover: '',
        logo: '',
        artwork: []
      },
      description: '',
      features: []
    },

    pokemon: {
      id: 0,
      name: '',
      types: [],
      stats: {},
      abilities: [],
      image: '',
      generation: 1,
      isStarter: false
    },

    badge: {
      id: '',
      name: '',
      region: '',
      gymLeader: '',
      type: '',
      image: '',
      description: ''
    }
  }
};

export default scraperConfig;