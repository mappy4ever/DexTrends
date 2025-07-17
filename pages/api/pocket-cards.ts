import type { NextApiRequest, NextApiResponse } from 'next';

interface PocketCard {
  id?: string;
  name: string;
  rarity?: string;
  [key: string]: any;
}

interface ErrorResponse {
  error: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PocketCard[] | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name } = req.query;
  const nameStr = Array.isArray(name) ? name[0] : name;

  if (!nameStr) {
    return res.status(400).json({ error: 'Pokemon name is required' });
  }

  try {
    // Fetch pocket cards data from the external API
    const response = await fetch('https://raw.githubusercontent.com/chase-manning/pokemon-tcg-pocket-cards/refs/heads/main/v4.json');
    
    if (!response.ok) {
      throw new Error(`External API returned ${response.status}`);
    }

    const allCards = await response.json();
    
    if (!Array.isArray(allCards)) {
      throw new Error('Invalid data format from external API');
    }

    // Clean the Pokemon name for matching
    const cleanPokemonName = nameStr.toLowerCase()
      .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric characters

    // Filter cards by Pokemon name with intelligent matching
    const filteredCards = allCards.filter((card: PocketCard) => {
      if (!card || !card.name) return false;
      
      // Clean the card name for comparison
      const cardBaseName = card.name.toLowerCase()
        .replace(/\s+(ex|gx|v|vmax|vstar)$/i, '') // Remove TCG suffixes
        .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric
      
      // Also check first word only for complex names
      const cardFirstWord = card.name.split(' ')[0].toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      
      return cardBaseName === cleanPokemonName || 
             cardFirstWord === cleanPokemonName ||
             cardBaseName.includes(cleanPokemonName) ||
             cleanPokemonName.includes(cardBaseName);
    });

    // Sort cards by rarity (if available) and then by name
    const rarityOrder: Record<string, number> = {
      'Common': 1,
      'Uncommon': 2,
      'Rare': 3,
      'Rare Holo': 4,
      'Ultra Rare': 5,
      'Secret Rare': 6
    };

    filteredCards.sort((a: PocketCard, b: PocketCard) => {
      // Sort by rarity first
      const rarityA = rarityOrder[a.rarity || ''] || 0;
      const rarityB = rarityOrder[b.rarity || ''] || 0;
      
      if (rarityA !== rarityB) {
        return rarityA - rarityB;
      }
      
      // Then sort by name
      return (a.name || '').localeCompare(b.name || '');
    });

    res.status(200).json(filteredCards);
  } catch (error) {
    console.error('Error fetching pocket cards:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pocket cards',
      message: error.message 
    });
  }
}