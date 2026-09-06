import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db';
import { loadPortfolioData } from '@/lib/portfolio-content';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const rows = await sql`SELECT id, reviewer_name, company, project_id, project_title, rating, review_text, public_email, public_phone, image_url, published_at FROM portfolio_reviews WHERE status = 'published' AND contact_consent = true ORDER BY published_at DESC`;
  const projectData = await loadPortfolioData();
  const reviews = rows.map(review => {
    const project = projectData.projects.projects.find(item => item.id === review.project_id);
    return { ...review, project_link: project?.link && project.link !== '#' ? project.link : null };
  });
  return res.status(200).json({ reviews });
}
