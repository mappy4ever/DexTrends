import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../tcg-sets/[setId]/complete';

// Proxy route: /api/tcgexpansions/[setId]/complete -> /api/tcg-sets/[setId]/complete
// This maintains backward compatibility with existing frontend calls
export default function tcgExpansionCompleteHandler(req: NextApiRequest, res: NextApiResponse) {
  return handler(req, res);
}
