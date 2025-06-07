// API endpoint for Pokémon TCG Pocket expansions
export default async function handler(req, res) {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }
  
  // Set proper CORS headers for actual request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }
  
  try {
    // Sample data for Pokémon TCG Pocket expansions
    // In a production environment, this would likely come from a database or external API
    const pocketExpansions = [
      {
        id: 'pocket-series-1',
        name: 'Pocket Series 1',
        logoUrl: 'https://images.pokemontcg.io/sv1/symbol.png',
        releaseDate: '2023-09-29',
        cardCount: 162,
        description: 'The first expansion for Pokémon TCG Pocket featuring cards from the Paldea region.',
        featuredPokemon: [
          {
            id: 'pocket-1-1',
            name: 'Koraidon ex',
            imageUrl: 'https://images.pokemontcg.io/sv1/154.png',
            rarity: 'Ultra Rare'
          },
          {
            id: 'pocket-1-2',
            name: 'Miraidon ex',
            imageUrl: 'https://images.pokemontcg.io/sv1/81.png',
            rarity: 'Ultra Rare'
          }
        ]
      },
      {
        id: 'pocket-series-2',
        name: 'Pocket Series 2',
        logoUrl: 'https://images.pokemontcg.io/sv2/symbol.png',
        releaseDate: '2023-11-17',
        cardCount: 183,
        description: 'The second expansion for Pokémon TCG Pocket with more Scarlet & Violet cards.',
        featuredPokemon: [
          {
            id: 'pocket-2-1',
            name: 'Pikachu V',
            imageUrl: 'https://images.pokemontcg.io/swsh4/44.png',
            rarity: 'Rare Holo V'
          },
          {
            id: 'pocket-2-2',
            name: 'Arcanine',
            imageUrl: 'https://images.pokemontcg.io/sv2/29.png',
            rarity: 'Rare'
          }
        ]
      },
      {
        id: 'pocket-series-3',
        name: 'Pocket Series 3',
        logoUrl: 'https://images.pokemontcg.io/sv3/symbol.png',
        releaseDate: '2024-01-26',
        cardCount: 174,
        description: 'The third expansion for Pokémon TCG Pocket featuring Obsidian Flames cards.',
        featuredPokemon: [
          {
            id: 'pocket-3-1',
            name: 'Charizard ex',
            imageUrl: 'https://images.pokemontcg.io/sv3/125.png',
            rarity: 'Ultra Rare'
          },
          {
            id: 'pocket-3-2',
            name: 'Dragonite ex',
            imageUrl: 'https://images.pokemontcg.io/sv3/127.png',
            rarity: 'Ultra Rare'
          }
        ]
      },
      {
        id: 'pocket-series-4',
        name: 'Pocket Series 4',
        logoUrl: 'https://images.pokemontcg.io/sv4/symbol.png',
        releaseDate: '2024-03-22',
        cardCount: 192,
        description: 'The fourth expansion for Pokémon TCG Pocket featuring Paradox Rift cards.',
        featuredPokemon: [
          {
            id: 'pocket-4-1',
            name: 'Mewtwo ex',
            imageUrl: 'https://images.pokemontcg.io/sv4/86.png',
            rarity: 'Ultra Rare'
          },
          {
            id: 'pocket-4-2',
            name: 'Lugia ex',
            imageUrl: 'https://images.pokemontcg.io/sv4/140.png',
            rarity: 'Ultra Rare'
          }
        ]
      },
      {
        id: 'pocket-apex-legends',
        name: 'Apex Legends',
        logoUrl: 'https://images.pokemontcg.io/sv5/symbol.png',
        releaseDate: '2024-05-10',
        cardCount: 210,
        description: 'The Apex Legends expansion brings iconic powerful evolved Pokémon to TCG Pocket with unique abilities and stunning artwork.',
        featuredPokemon: [
          {
            id: 'pocket-apex-1',
            name: 'Tyranitar ex',
            imageUrl: 'https://images.pokemontcg.io/sv5/154.png',
            rarity: 'Ultra Rare'
          },
          {
            id: 'pocket-apex-2',
            name: 'Hydreigon ex',
            imageUrl: 'https://images.pokemontcg.io/sv5/138.png',
            rarity: 'Ultra Rare'
          },
          {
            id: 'pocket-apex-3',
            name: 'Salamence ex',
            imageUrl: 'https://images.pokemontcg.io/sv5/145.png',
            rarity: 'Ultra Rare'
          },
          {
            id: 'pocket-apex-4',
            name: 'Gardevoir ex',
            imageUrl: 'https://images.pokemontcg.io/sv5/112.png',
            rarity: 'Ultra Rare'
          }
        ]
      },
      {
        id: 'pocket-celestial-guardians',
        name: 'Celestial Guardians',
        logoUrl: 'https://images.pokemontcg.io/sv6/symbol.png',
        releaseDate: '2024-07-05',
        cardCount: 198,
        description: 'Celestial Guardians features legendary and mythical Pokémon that watch over the world, with cosmic-themed artwork and special mechanics.',
        featuredPokemon: [
          {
            id: 'pocket-cg-1',
            name: 'Xerneas ex',
            imageUrl: 'https://images.pokemontcg.io/sv6/129.png',
            rarity: 'Ultra Rare'
          },
          {
            id: 'pocket-cg-2',
            name: 'Yveltal ex',
            imageUrl: 'https://images.pokemontcg.io/sv6/135.png',
            rarity: 'Ultra Rare'
          },
          {
            id: 'pocket-cg-3',
            name: 'Lunala ex',
            imageUrl: 'https://images.pokemontcg.io/sv6/118.png',
            rarity: 'Ultra Rare'
          },
          {
            id: 'pocket-cg-4',
            name: 'Solgaleo ex',
            imageUrl: 'https://images.pokemontcg.io/sv6/122.png',
            rarity: 'Ultra Rare'
          }
        ]
      }
    ];

    res.status(200).json(pocketExpansions);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
