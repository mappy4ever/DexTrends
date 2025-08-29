import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchShowdownItems, getItemSpriteUrl, getItemCategory } from '../../utils/showdownData';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const items = await fetchShowdownItems();
    const itemKeys = Object.keys(items);
    
    // Get first 10 items with full details
    const sampleItems = itemKeys.slice(0, 10).map(key => {
      const item = items[key];
      return {
        key,
        num: item.num,
        name: item.name,
        displayName: item.name,
        spriteUrl: getItemSpriteUrl(key),
        category: getItemCategory(key, item),
        desc: item.desc?.substring(0, 50) + '...',
        gen: item.gen,
        isChoice: item.isChoice,
        fling: item.fling
      };
    });
    
    res.status(200).json({
      totalItems: itemKeys.length,
      sampleItems,
      categories: [...new Set(itemKeys.map(k => getItemCategory(k, items[k])))],
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to process items',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}