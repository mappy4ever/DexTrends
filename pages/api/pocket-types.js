// Sample API endpoint for pocket types
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
    const pocketTypes = [
      {
        id: 'swsh1-1',
        name: 'Celebi V',
        image: 'https://images.pokemontcg.io/swsh1/1.png',
        types: ['grass', 'psychic'],
        rarity: 'Rare Holo V'
      },
    {
      id: 'swsh1-2',
      name: 'Roselia',
      image: 'https://images.pokemontcg.io/swsh1/2.png',
      types: ['grass'],
      rarity: 'Common'
    },
    {
      id: 'swsh1-3',
      name: 'Charmeleon',
      image: 'https://images.pokemontcg.io/swsh1/3.png',
      types: ['fire'],
      rarity: 'Uncommon'
    },
    {
      id: 'swsh1-4',
      name: 'Charizard',
      image: 'https://images.pokemontcg.io/swsh1/4.png',
      types: ['fire'],
      rarity: 'Rare'
    },
    {
      id: 'swsh1-5',
      name: 'Squirtle',
      image: 'https://images.pokemontcg.io/swsh1/5.png',
      types: ['water'],
      rarity: 'Common'
    },
    {
      id: 'swsh1-6',
      name: 'Pikachu',
      image: 'https://images.pokemontcg.io/swsh1/6.png',
      types: ['electric'],
      rarity: 'Common'
    },
    {
      id: 'swsh1-7',
      name: 'Raichu',
      image: 'https://images.pokemontcg.io/swsh1/7.png',
      types: ['electric'],
      rarity: 'Rare'
    },
    {
      id: 'swsh1-8',
      name: 'Gengar',
      image: 'https://images.pokemontcg.io/swsh1/8.png',
      types: ['ghost', 'poison'],
      rarity: 'Rare'
    }
    ];

    res.status(200).json(pocketTypes);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
