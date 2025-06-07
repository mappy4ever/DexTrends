// API endpoint for Pokémon TCG Pocket top decks
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
    // Sample data for Pokémon TCG Pocket top decks
    // In a production environment, this would likely come from a database or external API
    const pocketDecks = [
      {
        id: 'deck-1',
        name: 'Speed Pikachu',
        creator: 'ElectricMaster',
        winRate: '68%',
        dateCreated: '2024-03-18',
        types: ['electric'],
        keyCards: [
          {
            id: 'swsh4-44',
            name: 'Pikachu V',
            image: 'https://images.pokemontcg.io/swsh4/44.png',
            count: 4
          },
          {
            id: 'swsh1-7',
            name: 'Raichu',
            image: 'https://images.pokemontcg.io/swsh1/7.png',
            count: 3
          },
          {
            id: 'sv1-78',
            name: 'Ampharos',
            image: 'https://images.pokemontcg.io/sv1/78.png',
            count: 2
          }
        ],
        description: 'A fast-paced deck focused on getting Pikachu V into play quickly and dealing high damage.'
      },
      {
        id: 'deck-2',
        name: 'Water Control',
        creator: 'AquaTrainer',
        winRate: '65%',
        dateCreated: '2024-03-05',
        types: ['water'],
        keyCards: [
          {
            id: 'swsh1-5',
            name: 'Squirtle',
            image: 'https://images.pokemontcg.io/swsh1/5.png',
            count: 4
          },
          {
            id: 'sv2-36',
            name: 'Blastoise',
            image: 'https://images.pokemontcg.io/sv2/36.png',
            count: 2
          },
          {
            id: 'sv3-43',
            name: 'Gyarados',
            image: 'https://images.pokemontcg.io/sv3/43.png',
            count: 3
          }
        ],
        description: 'A control deck that uses water Pokémon to disrupt the opponent while building up powerful attackers.'
      },
      {
        id: 'deck-3',
        name: 'Flame Burst',
        creator: 'FireFighter',
        winRate: '72%',
        dateCreated: '2024-02-20',
        types: ['fire'],
        keyCards: [
          {
            id: 'swsh1-4',
            name: 'Charizard',
            image: 'https://images.pokemontcg.io/swsh1/4.png',
            count: 3
          },
          {
            id: 'swsh1-3',
            name: 'Charmeleon',
            image: 'https://images.pokemontcg.io/swsh1/3.png',
            count: 3
          },
          {
            id: 'sv3-22',
            name: 'Arcanine',
            image: 'https://images.pokemontcg.io/sv3/22.png',
            count: 2
          }
        ],
        description: 'A high-damage dealing fire deck that focuses on powering up Charizard quickly.'
      },
      {
        id: 'deck-4',
        name: 'Psychic Friends',
        creator: 'MindBender',
        winRate: '61%',
        dateCreated: '2024-03-10',
        types: ['psychic', 'ghost'],
        keyCards: [
          {
            id: 'swsh1-8',
            name: 'Gengar',
            image: 'https://images.pokemontcg.io/swsh1/8.png',
            count: 3
          },
          {
            id: 'sv4-86',
            name: 'Mewtwo ex',
            image: 'https://images.pokemontcg.io/sv4/86.png',
            count: 2
          },
          {
            id: 'sv1-123',
            name: 'Gardevoir',
            image: 'https://images.pokemontcg.io/sv1/123.png',
            count: 2
          }
        ],
        description: 'A strategically complex deck that uses psychic and ghost Pokémon to control the game flow.'
      },
      {
        id: 'deck-5',
        name: 'Grass Powerhouse',
        creator: 'Naturalist',
        winRate: '59%',
        dateCreated: '2024-03-01',
        types: ['grass'],
        keyCards: [
          {
            id: 'swsh1-1',
            name: 'Celebi V',
            image: 'https://images.pokemontcg.io/swsh1/1.png',
            count: 3
          },
          {
            id: 'swsh1-2',
            name: 'Roselia',
            image: 'https://images.pokemontcg.io/swsh1/2.png',
            count: 4
          },
          {
            id: 'sv2-13',
            name: 'Venusaur',
            image: 'https://images.pokemontcg.io/sv2/13.png',
            count: 2
          }
        ],
        description: 'A grass-type deck that excels at energy acceleration and healing.'
      }
    ];

    res.status(200).json(pocketDecks);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
