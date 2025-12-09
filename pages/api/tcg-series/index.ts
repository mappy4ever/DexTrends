import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import type { TCGDexSerieBrief } from '../../../types/api/tcgdex';
import { TCGDexEndpoints } from '../../../utils/tcgdex-adapter';
import { TcgCardManager } from '../../../lib/supabase';

/**
 * TCG Series List API
 *
 * Returns all card series (eras) like "Scarlet & Violet", "Sword & Shield", etc.
 * Series group sets together by release era.
 *
 * Query Parameters:
 * - lang: Language code (en, fr, de, it, es, pt-br) - default: en
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  const { lang = 'en' } = req.query;
  const language = Array.isArray(lang) ? lang[0] : lang;

  try {
    // Try Supabase first (local database) - much faster than external API
    const supabaseSeries = await TcgCardManager.getSeries();
    if (supabaseSeries && supabaseSeries.length > 0) {
      logger.debug('Using Supabase data for TCG series', { count: supabaseSeries.length });

      const series = supabaseSeries.map(s => ({
        id: s.id,
        name: s.name,
        logo: s.logo_url || null
      }));

      const responseTime = Date.now() - startTime;

      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.setHeader('X-Data-Source', 'supabase');

      return res.status(200).json({
        data: series,
        meta: {
          count: series.length,
          responseTime,
          language,
          source: 'supabase'
        }
      });
    }

    logger.debug('Supabase returned no series, falling back to TCGDex');

    const apiUrl = TCGDexEndpoints.series(language);
    logger.info('Fetching TCG series from TCGDex', { url: apiUrl, lang: language });

    const seriesData = await fetchJSON<TCGDexSerieBrief[]>(apiUrl, {
      useCache: true,
      cacheTime: 24 * 60 * 60 * 1000, // Cache for 24 hours - series rarely change
      timeout: 15000,
      retries: 2,
      retryDelay: 1000,
      throwOnError: false
    });

    if (!seriesData || !Array.isArray(seriesData)) {
      logger.warn('TCGDex series API unavailable', { lang: language });
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'The TCGDex API is currently unavailable. Please try again later.'
      });
    }

    // Transform to consistent format
    const series = seriesData.map(s => ({
      id: s.id,
      name: s.name,
      logo: s.logo || null
    }));

    const responseTime = Date.now() - startTime;

    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800'); // 1 day cache
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('X-Data-Source', 'tcgdex');

    res.status(200).json({
      data: series,
      meta: {
        count: series.length,
        responseTime,
        language,
        source: 'tcgdex'
      }
    });
  } catch (error) {
    logger.error('Failed to fetch TCG series', {
      error: error instanceof Error ? error.message : String(error),
      lang: language
    });
    res.status(500).json({
      error: 'Failed to fetch TCG series',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
