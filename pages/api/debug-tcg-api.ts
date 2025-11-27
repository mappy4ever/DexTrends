import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Debug endpoint to test Pokemon TCG API connectivity
 * Access at: /api/debug-tcg-api
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
    tests: {} as Record<string, unknown>
  };

  // Test 1: Direct API call with API key
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      'https://api.pokemontcg.io/v2/sets?page=1&pageSize=5&orderBy=-releaseDate',
      { headers, signal: controller.signal }
    );

    clearTimeout(timeoutId);

    const data = await response.json();

    results.tests = {
      ...results.tests as Record<string, unknown>,
      directApiCall: {
        success: response.ok,
        status: response.status,
        duration: Date.now() - startTime + 'ms',
        setsReturned: data?.data?.length || 0,
        firstSet: data?.data?.[0] ? {
          id: data.data[0].id,
          name: data.data[0].name,
          releaseDate: data.data[0].releaseDate
        } : null,
        totalCount: data?.totalCount
      }
    };
  } catch (error) {
    results.tests = {
      ...results.tests as Record<string, unknown>,
      directApiCall: {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime + 'ms'
      }
    };
  }

  results.totalDuration = Date.now() - startTime + 'ms';

  res.status(200).json(results);
}
