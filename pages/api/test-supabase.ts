import type { NextApiRequest, NextApiResponse } from 'next';
import { testSupabaseConnection } from '../../utils/testSupabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await testSupabaseConnection();
    
    if (result.connected) {
      res.status(200).json({
        status: 'success',
        message: 'Supabase connection is working',
        ...result
      });
    } else {
      res.status(503).json({
        status: 'error',
        message: 'Supabase connection failed',
        ...result
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to test Supabase connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}