import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../tcg-sets/[setId]';

// Proxy route: /api/tcgexpansions/[setId] -> /api/tcg-sets/[setId]
// This maintains backward compatibility with existing frontend calls
export default function tcgExpansionSetHandler(req: NextApiRequest, res: NextApiResponse) {
  return handler(req, res);
}
