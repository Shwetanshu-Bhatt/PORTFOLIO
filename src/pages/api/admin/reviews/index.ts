import { createHash, randomBytes } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from '@/lib/admin-auth';
import { sql } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!await isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const reviews = await sql`SELECT id, client_name, client_email, reviewer_name, public_email, public_phone, image_url, company, project_id, project_title, rating, review_text, status, created_at, submitted_at, published_at FROM portfolio_reviews ORDER BY created_at DESC`;
    return res.status(200).json({ reviews });
  }

  if (req.method === 'POST') {
    const { clientName, clientEmail, company, projectId, projectTitle } = req.body;
    if (!clientName?.trim() || !clientEmail?.trim() || !projectId?.trim() || !projectTitle?.trim()) {
      return res.status(400).json({ error: 'Client, email, and project are required' });
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const [review] = await sql`
      INSERT INTO portfolio_reviews (invite_token_hash, client_name, client_email, company, project_id, project_title)
      VALUES (${tokenHash}, ${clientName.trim()}, ${clientEmail.trim().toLowerCase()}, ${company?.trim() || null}, ${projectId.trim()}, ${projectTitle.trim()})
      RETURNING id
    `;
    return res.status(201).json({ id: review.id, inviteUrl: `/review/${token}` });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
