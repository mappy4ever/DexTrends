/**
 * Legacy TCG Sets endpoint - redirects to /api/tcgexpansions
 * @deprecated Use /api/tcgexpansions instead
 */
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Extract query params to forward
  const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
  const targetUrl = `/api/tcgexpansions${queryString ? `?${queryString}` : ''}`;

  // Redirect to the canonical endpoint
  res.redirect(307, targetUrl);
}
