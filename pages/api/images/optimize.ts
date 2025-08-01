import type { NextApiRequest, NextApiResponse } from 'next';
import { tcgCache } from '../../../lib/tcg-cache';
import logger from '../../../utils/logger';

interface OptimizeImageRequest extends NextApiRequest {
  query: {
    cardId?: string;
    url?: string;
    size?: 'small' | 'large';
    quality?: string;
    format?: 'webp' | 'jpeg' | 'png';
    width?: string;
    height?: string;
  };
}

export default async function handler(req: OptimizeImageRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cardId, url, size = 'small', quality = '75', format = 'webp', width, height } = req.query;
  
  try {
    let imageUrl = url;
    let cachedImages = null;
    
    // If cardId is provided, try to get cached image URL
    if (cardId && !url) {
      cachedImages = await tcgCache.getImageUrls(cardId);
      if (cachedImages) {
        imageUrl = size === 'large' ? (cachedImages.large || cachedImages.small) : (cachedImages.small || cachedImages.large);
        
        if (imageUrl) {
          logger.debug('[Image Optimize] Using cached image URL', { cardId, size, imageUrl });
        }
      }
    }
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'No image URL found. Provide either cardId or url parameter.' });
    }
    
    // Skip optimization for data URLs or already optimized URLs
    if (imageUrl.startsWith('data:') || imageUrl.includes('/_next/image')) {
      return res.redirect(302, imageUrl);
    }
    
    // Build optimization parameters
    const params = new URLSearchParams();
    params.set('url', imageUrl);
    params.set('q', quality);
    
    if (width) params.set('w', width);
    if (height) params.set('h', height);
    if (format && format !== 'jpeg') params.set('f', format);
    
    const optimizedUrl = `/_next/image?${params.toString()}`;
    
    // Set caching headers
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800'); // 1 day cache, 7 day stale
    res.setHeader('X-Image-Source', imageUrl);
    res.setHeader('X-Cache-Status', cachedImages ? 'hit' : 'miss');
    
    // Redirect to Next.js Image optimization
    res.redirect(302, optimizedUrl);
    
  } catch (error: any) {
    logger.error('[Image Optimize] Failed to optimize image:', error);
    
    res.status(500).json({
      error: 'Failed to optimize image',
      message: error.message
    });
  }
}