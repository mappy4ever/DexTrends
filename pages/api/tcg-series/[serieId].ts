import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import type { TCGDexSerie } from '../../../types/api/tcgdex';
import { TCGDexEndpoints, transformSetBrief } from '../../../utils/tcgdex-adapter';

/**
 * TCG Series Detail API
 *
 * Returns a specific series with all its sets.
 * Example: /api/tcg-series/sv (Scarlet & Violet series)
 *
 * Query Parameters:
 * - lang: Language code (en, fr, de, it, es, pt-br) - default: en
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  const { serieId, lang = 'en' } = req.query;
  const id = Array.isArray(serieId) ? serieId[0] : serieId;
  const language = Array.isArray(lang) ? lang[0] : lang;

  if (!id) {
    return res.status(400).json({ error: 'Series ID is required' });
  }

  try {
    const apiUrl = TCGDexEndpoints.serie(id, language);
    logger.info('Fetching TCG series detail from TCGDex', { url: apiUrl, serieId: id, lang: language });

    const serieData = await fetchJSON<TCGDexSerie>(apiUrl, {
      useCache: true,
      cacheTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
      timeout: 15000,
      retries: 2,
      retryDelay: 1000,
      throwOnError: false
    });

    if (!serieData || !serieData.id) {
      logger.warn('TCGDex series not found', { serieId: id });
      return res.status(404).json({
        error: 'Series not found',
        serieId: id
      });
    }

    // Transform sets to app format (include series name and release date)
    const sets = serieData.sets?.map(set =>
      transformSetBrief(set, serieData.name, serieData.releaseDate)
    ) || [];

    const responseTime = Date.now() - startTime;

    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('X-Data-Source', 'tcgdex');

    res.status(200).json({
      serie: {
        id: serieData.id,
        name: serieData.name,
        logo: serieData.logo || null
      },
      sets,
      meta: {
        setCount: sets.length,
        responseTime,
        language,
        source: 'tcgdex'
      }
    });
  } catch (error) {
    logger.error('Failed to fetch TCG series detail', {
      serieId: id,
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({
      error: 'Failed to fetch TCG series',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
