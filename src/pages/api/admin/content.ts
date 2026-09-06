import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from '@/lib/admin-auth';
import { isPortfolioData, loadPortfolioData, PORTFOLIO_CONTENT_ID } from '@/lib/portfolio-content';
import { sql } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await isAdmin(req))) return res.status(401).json({ error: 'Authentication required.' });

  if (req.method === 'GET') {
    return res.status(200).json(await loadPortfolioData());
  }

  if (req.method === 'PUT') {
    if (!isPortfolioData(req.body)) return res.status(400).json({ error: 'Portfolio data is incomplete.' });

    await sql`
      INSERT INTO portfolio_content (id, content, updated_at)
      VALUES (${PORTFOLIO_CONTENT_ID}, ${JSON.stringify(req.body)}::jsonb, now())
      ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = now()
    `;

    return res.status(200).json({ success: true, content: req.body });
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Method not allowed.' });
}
