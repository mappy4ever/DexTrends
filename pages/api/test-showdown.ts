import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchShowdownItems, fetchShowdownAbilities } from '../../utils/showdownData';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const items = await fetchShowdownItems();
    const abilities = await fetchShowdownAbilities();
    
    res.status(200).json({
      itemsCount: Object.keys(items).length,
      abilitiesCount: Object.keys(abilities).length,
      sampleItems: Object.keys(items).slice(0, 5),
      sampleAbilities: Object.keys(abilities).slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch Showdown data',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}