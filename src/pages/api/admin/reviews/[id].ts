import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from '@/lib/admin-auth';
import { sql } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!await isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method === 'DELETE') {
    const [review] = await sql`DELETE FROM portfolio_reviews WHERE id = ${req.query.id as string} RETURNING id`;
    if (!review) return res.status(404).json({ error: 'Review not found' });
    return res.status(200).json({ success: true });
  }

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const status = req.body.status;
  if (!['published', 'hidden'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const [review] = await sql`
    UPDATE portfolio_reviews
    SET status = ${status}, published_at = CASE WHEN ${status} = 'published' THEN now() ELSE published_at END
    WHERE id = ${req.query.id as string} AND status IN ('pending', 'published', 'hidden')
    RETURNING id, status
  `;
  if (!review) return res.status(404).json({ error: 'Review not found' });
  return res.status(200).json({ review });
}
