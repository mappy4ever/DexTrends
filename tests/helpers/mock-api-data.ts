/**
 * Mock API data for testing to prevent hitting actual APIs
 */

export const MOCK_POKEMON_DATA = {
  // Pikachu (#25)
  25: {
    id: 25,
    name: "pikachu",
    height: 4,
    weight: 60,
    types: [{ type: { name: "electric" } }],
    sprites: {
      front_default: "/mock-pikachu.png",
      other: {
        "official-artwork": {
          front_default: "/mock-pikachu-art.png"
        }
      }
    },
    stats: [
      { base_stat: 35, stat: { name: "hp" } },
      { base_stat: 55, stat: { name: "attack" } },
      { base_stat: 40, stat: { name: "defense" } },
      { base_stat: 50, stat: { name: "special-attack" } },
      { base_stat: 50, stat: { name: "special-defense" } },
      { base_stat: 90, stat: { name: "speed" } }
    ],
    abilities: [
      { ability: { name: "static" }, is_hidden: false },
      { ability: { name: "lightning-rod" }, is_hidden: true }
    ],
    species: {
      url: "https://pokeapi.co/api/v2/pokemon-species/25/"
    }
  },
  
  // Charizard (#6)
  6: {
    id: 6,
    name: "charizard",
    height: 17,
    weight: 905,
    types: [
      { type: { name: "fire" } },
      { type: { name: "flying" } }
    ],
    sprites: {
      front_default: "/mock-charizard.png",
      other: {
        "official-artwork": {
          front_default: "/mock-charizard-art.png"
        }
      }
    },
    stats: [
      { base_stat: 78, stat: { name: "hp" } },
      { base_stat: 84, stat: { name: "attack" } },
      { base_stat: 78, stat: { name: "defense" } },
      { base_stat: 109, stat: { name: "special-attack" } },
      { base_stat: 85, stat: { name: "special-defense" } },
      { base_stat: 100, stat: { name: "speed" } }
    ],
    abilities: [
      { ability: { name: "blaze" }, is_hidden: false },
      { ability: { name: "solar-power" }, is_hidden: true }
    ],
    species: {
      url: "https://pokeapi.co/api/v2/pokemon-species/6/"
    }
  },

  // Bulbasaur (#1)
  1: {
    id: 1,
    name: "bulbasaur",
    height: 7,
    weight: 69,
    types: [
      { type: { name: "grass" } },
      { type: { name: "poison" } }
    ],
    sprites: {
      front_default: "/mock-bulbasaur.png",
      other: {
        "official-artwork": {
          front_default: "/mock-bulbasaur-art.png"
        }
      }
    },
    stats: [
      { base_stat: 45, stat: { name: "hp" } },
      { base_stat: 49, stat: { name: "attack" } },
      { base_stat: 49, stat: { name: "defense" } },
      { base_stat: 65, stat: { name: "special-attack" } },
      { base_stat: 65, stat: { name: "special-defense" } },
      { base_stat: 45, stat: { name: "speed" } }
    ],
    abilities: [
      { ability: { name: "overgrow" }, is_hidden: false },
      { ability: { name: "chlorophyll" }, is_hidden: true }
    ],
    species: {
      url: "https://pokeapi.co/api/v2/pokemon-species/1/"
    }
  },

  // Farfetch'd (#83) - Special character test
  83: {
    id: 83,
    name: "farfetchd",
    height: 8,
    weight: 150,
    types: [
      { type: { name: "normal" } },
      { type: { name: "flying" } }
    ],
    sprites: {
      front_default: "/mock-farfetchd.png",
      other: {
        "official-artwork": {
          front_default: "/mock-farfetchd-art.png"
        }
      }
    },
    stats: [
      { base_stat: 52, stat: { name: "hp" } },
      { base_stat: 90, stat: { name: "attack" } },
      { base_stat: 55, stat: { name: "defense" } },
      { base_stat: 58, stat: { name: "special-attack" } },
      { base_stat: 62, stat: { name: "special-defense" } },
      { base_stat: 60, stat: { name: "speed" } }
    ],
    abilities: [
      { ability: { name: "keen-eye" }, is_hidden: false },
      { ability: { name: "inner-focus" }, is_hidden: false },
      { ability: { name: "defiant" }, is_hidden: true }
    ],
    species: {
      url: "https://pokeapi.co/api/v2/pokemon-species/83/"
    }
  },

  // Mr. Mime (#122) - Special character test
  122: {
    id: 122,
    name: "mr-mime",
    height: 13,
    weight: 545,
    types: [
      { type: { name: "psychic" } },
      { type: { name: "fairy" } }
    ],
    sprites: {
      front_default: "/mock-mrmime.png",
      other: {
        "official-artwork": {
          front_default: "/mock-mrmime-art.png"
        }
      }
    },
    stats: [
      { base_stat: 40, stat: { name: "hp" } },
      { base_stat: 45, stat: { name: "attack" } },
      { base_stat: 65, stat: { name: "defense" } },
      { base_stat: 100, stat: { name: "special-attack" } },
      { base_stat: 120, stat: { name: "special-defense" } },
      { base_stat: 90, stat: { name: "speed" } }
    ],
    abilities: [
      { ability: { name: "soundproof" }, is_hidden: false },
      { ability: { name: "filter" }, is_hidden: false },
      { ability: { name: "technician" }, is_hidden: true }
    ],
    species: {
      url: "https://pokeapi.co/api/v2/pokemon-species/122/"
    }
  },

  // Mewtwo (#150) - Common test Pokemon
  150: {
    id: 150,
    name: "mewtwo",
    height: 20,
    weight: 1220,
    types: [
      { type: { name: "psychic" } }
    ],
    sprites: {
      front_default: "/mock-mewtwo.png",
      other: {
        "official-artwork": {
          front_default: "/mock-mewtwo-art.png"
        }
      }
    },
    stats: [
      { base_stat: 106, stat: { name: "hp" } },
      { base_stat: 110, stat: { name: "attack" } },
      { base_stat: 90, stat: { name: "defense" } },
      { base_stat: 154, stat: { name: "special-attack" } },
      { base_stat: 90, stat: { name: "special-defense" } },
      { base_stat: 130, stat: { name: "speed" } }
    ],
    abilities: [
      { ability: { name: "pressure" }, is_hidden: false },
      { ability: { name: "unnerve" }, is_hidden: true }
    ],
    species: {
      url: "https://pokeapi.co/api/v2/pokemon-species/150/"
    }
  },

  // Squirtle (#7)
  7: {
    id: 7,
    name: "squirtle",
    height: 5,
    weight: 90,
    types: [{ type: { name: "water" } }],
    sprites: {
      front_default: "/mock-squirtle.png",
      other: {
        "official-artwork": {
          front_default: "/mock-squirtle-art.png"
        }
      }
    },
    stats: [
      { base_stat: 44, stat: { name: "hp" } },
      { base_stat: 48, stat: { name: "attack" } },
      { base_stat: 65, stat: { name: "defense" } },
      { base_stat: 50, stat: { name: "special-attack" } },
      { base_stat: 64, stat: { name: "special-defense" } },
      { base_stat: 43, stat: { name: "speed" } }
    ],
    abilities: [
      { ability: { name: "torrent" }, is_hidden: false },
      { ability: { name: "rain-dish" }, is_hidden: true }
    ],
    species: {
      url: "https://pokeapi.co/api/v2/pokemon-species/7/"
    }
  },

  // Eevee (#133)
  133: {
    id: 133,
    name: "eevee",
    height: 3,
    weight: 65,
    types: [{ type: { name: "normal" } }],
    sprites: {
      front_default: "/mock-eevee.png",
      other: {
        "official-artwork": {
          front_default: "/mock-eevee-art.png"
        }
      }
    },
    stats: [
      { base_stat: 55, stat: { name: "hp" } },
      { base_stat: 55, stat: { name: "attack" } },
      { base_stat: 50, stat: { name: "defense" } },
      { base_stat: 45, stat: { name: "special-attack" } },
      { base_stat: 65, stat: { name: "special-defense" } },
      { base_stat: 55, stat: { name: "speed" } }
    ],
    abilities: [
      { ability: { name: "run-away" }, is_hidden: false },
      { ability: { name: "adaptability" }, is_hidden: false },
      { ability: { name: "anticipation" }, is_hidden: true }
    ],
    species: {
      url: "https://pokeapi.co/api/v2/pokemon-species/133/"
    }
  }
};

export const MOCK_SPECIES_DATA = {
  25: {
    id: 25,
    name: "pikachu",
    is_legendary: false,
    is_mythical: false,
    evolution_chain: {
      url: "https://pokeapi.co/api/v2/evolution-chain/10/"
    },
    genera: [
      { genus: "Mouse Pokémon", language: { name: "en" } }
    ]
  },
  
  6: {
    id: 6,
    name: "charizard",
    is_legendary: false,
    is_mythical: false,
    evolution_chain: {
      url: "https://pokeapi.co/api/v2/evolution-chain/2/"
    },
    genera: [
      { genus: "Flame Pokémon", language: { name: "en" } }
    ]
  },

  1: {
    id: 1,
    name: "bulbasaur",
    is_legendary: false,
    is_mythical: false,
    evolution_chain: {
      url: "https://pokeapi.co/api/v2/evolution-chain/1/"
    },
    genera: [
      { genus: "Seed Pokémon", language: { name: "en" } }
    ]
  },

  83: {
    id: 83,
    name: "farfetchd",
    is_legendary: false,
    is_mythical: false,
    evolution_chain: {
      url: "https://pokeapi.co/api/v2/evolution-chain/41/"
    },
    genera: [
      { genus: "Wild Duck Pokémon", language: { name: "en" } }
    ]
  },

  122: {
    id: 122,
    name: "mr-mime",
    is_legendary: false,
    is_mythical: false,
    evolution_chain: {
      url: "https://pokeapi.co/api/v2/evolution-chain/57/"
    },
    genera: [
      { genus: "Barrier Pokémon", language: { name: "en" } }
    ]
  },

  150: {
    id: 150,
    name: "mewtwo",
    is_legendary: true,
    is_mythical: false,
    evolution_chain: {
      url: "https://pokeapi.co/api/v2/evolution-chain/74/"
    },
    genera: [
      { genus: "Genetic Pokémon", language: { name: "en" } }
    ]
  },

  7: {
    id: 7,
    name: "squirtle",
    is_legendary: false,
    is_mythical: false,
    evolution_chain: {
      url: "https://pokeapi.co/api/v2/evolution-chain/3/"
    },
    genera: [
      { genus: "Tiny Turtle Pokémon", language: { name: "en" } }
    ]
  },

  133: {
    id: 133,
    name: "eevee",
    is_legendary: false,
    is_mythical: false,
    evolution_chain: {
      url: "https://pokeapi.co/api/v2/evolution-chain/67/"
    },
    genera: [
      { genus: "Evolution Pokémon", language: { name: "en" } }
    ]
  }
};