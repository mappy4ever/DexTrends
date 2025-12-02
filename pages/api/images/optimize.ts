import type { NextApiRequest, NextApiResponse } from 'next';
import { tcgCache } from '../../../lib/tcg-cache';
import logger from '../../../utils/logger';

// Allowed domains for image redirects (security: prevent open redirect attacks)
const ALLOWED_IMAGE_DOMAINS = [
  'images.pokemontcg.io',
  'assets.tcgdex.net',
  'cdn.tcgdex.net',
  'raw.githubusercontent.com',
  'pokeapi.co',
  'assets.pokemon.com',
  'pokeres.bastionbot.org',
];

/**
 * Validates that a URL is safe to redirect to
 * Only allows local paths or URLs from trusted image CDNs
 */
function isAllowedRedirectUrl(url: string): boolean {
  // Allow local Next.js image optimization paths
  if (url.startsWith('/_next/image')) {
    return true;
  }

  // Allow data URLs (already checked before redirect)
  if (url.startsWith('data:')) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return ALLOWED_IMAGE_DOMAINS.some(domain =>
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    // Invalid URL - reject
    return false;
  }
}

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

    // Security: Validate the image URL is from an allowed domain
    if (!isAllowedRedirectUrl(imageUrl)) {
      logger.warn('[Image Optimize] Blocked redirect to untrusted URL', { imageUrl });
      return res.status(400).json({ error: 'Image URL is not from a trusted domain.' });
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
    
  } catch (error: unknown) {
    logger.error('[Image Optimize] Failed to optimize image:', { error: error instanceof Error ? error.message : String(error) });
    
    res.status(500).json({
      error: 'Failed to optimize image',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}