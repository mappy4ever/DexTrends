import type { NextApiRequest, NextApiResponse } from 'next';
import { tcgCache } from '../../../lib/tcg-cache';
import logger from '../../../utils/logger';

interface PreloadImagesRequest extends NextApiRequest {
  query: {
    setId?: string;
    cardIds?: string;
    limit?: string;
    quality?: string;
    size?: 'small' | 'large' | 'both';
  };
}

export default async function handler(req: PreloadImagesRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { setId, cardIds, limit = '20', quality = '75', size = 'small' } = req.query;

  // ALPHA-005: Input validation
  const limitNum = Math.min(Math.max(1, parseInt(limit as string) || 20), 100); // Cap at 100
  const qualityNum = Math.min(Math.max(1, parseInt(quality as string) || 75), 100); // 1-100

  // Validate size parameter
  const validSizes = ['small', 'large', 'both'];
  const sizeParam = validSizes.includes(size as string) ? size : 'small';

  // Validate setId format (alphanumeric with hyphens)
  if (setId && !/^[a-zA-Z0-9-]+$/.test(setId as string)) {
    return res.status(400).json({ error: 'Invalid setId format' });
  }

  // Validate cardIds format (comma-separated alphanumeric with hyphens)
  if (cardIds && !/^[a-zA-Z0-9-,\s]+$/.test(cardIds as string)) {
    return res.status(400).json({ error: 'Invalid cardIds format' });
  }

  try {
    let imageUrls: string[] = [];
    
    if (setId) {
      // Get images from a complete set
      const cachedSet = await tcgCache.getCompleteSet(setId);
      if (cachedSet?.cards) {
        const cards = cachedSet.cards.slice(0, limitNum);
        
        for (const card of cards) {
          if (card.images) {
            if (sizeParam === 'both') {
              if (card.images.small) imageUrls.push(card.images.small);
              if (card.images.large) imageUrls.push(card.images.large);
            } else if (sizeParam === 'large') {
              imageUrls.push(card.images.large || card.images.small);
            } else {
              imageUrls.push(card.images.small || card.images.large);
            }
          }
        }
        
        logger.info('[Image Preload] Generated image URLs from set', { 
          setId, 
          cardCount: cards.length, 
          imageCount: imageUrls.length 
        });
      }
    } else if (cardIds) {
      // Get images from specific card IDs
      const cardIdArray = (cardIds as string).split(',').slice(0, limitNum);
      
      for (const cardId of cardIdArray) {
        const cachedImages = await tcgCache.getImageUrls(cardId.trim());
        if (cachedImages) {
          if (sizeParam === 'both') {
            if (cachedImages.small) imageUrls.push(cachedImages.small);
            if (cachedImages.large) imageUrls.push(cachedImages.large);
          } else if (sizeParam === 'large') {
            imageUrls.push(cachedImages.large || cachedImages.small || '');
          } else {
            imageUrls.push(cachedImages.small || cachedImages.large || '');
          }
        }
      }
      
      // Filter out empty URLs
      imageUrls = imageUrls.filter(url => url);
      
      logger.info('[Image Preload] Generated image URLs from card IDs', {
        cardIds: cardIdArray.length,
        imageCount: imageUrls.length
      });
    }
    
    if (imageUrls.length === 0) {
      return res.status(404).json({ 
        error: 'No images found',
        message: 'No cached images found for the provided setId or cardIds'
      });
    }
    
    // Generate preload links with optimization
    const preloadLinks = imageUrls.map(url => {
      const params = new URLSearchParams();
      params.set('url', url);
      params.set('q', String(qualityNum));

      // Set standard card dimensions for better caching
      if (sizeParam === 'small' || (sizeParam === 'both' && url.includes('small'))) {
        params.set('w', '245');
        params.set('h', '342');
      } else {
        params.set('w', '734');
        params.set('h', '1024');
      }

      return `/_next/image?${params.toString()}`;
    });
    
    // Set caching headers
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Image-Count', imageUrls.length.toString());
    
    res.status(200).json({
      preloadUrls: preloadLinks,
      originalUrls: imageUrls,
      count: imageUrls.length,
      settings: {
        quality: qualityNum,
        size: sizeParam,
        limit: limitNum
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: unknown) {
    logger.error('[Image Preload] Failed to generate preload URLs:', { error: error instanceof Error ? error.message : String(error) });
    
    res.status(500).json({
      error: 'Failed to generate preload URLs',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}