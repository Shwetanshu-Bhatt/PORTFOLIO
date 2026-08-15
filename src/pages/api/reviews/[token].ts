import { createHash } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = String(req.query.token || '');
  if (!/^[a-f0-9]{64}$/.test(token)) return res.status(404).json({ error: 'Invitation not found' });
  const tokenHash = createHash('sha256').update(token).digest('hex');

  if (req.method === 'GET') {
    const [invite] = await sql`SELECT client_name, client_email, company, project_title, status FROM portfolio_reviews WHERE invite_token_hash = ${tokenHash}`;
    if (!invite) return res.status(404).json({ error: 'Invitation not found' });
    return res.status(200).json({ invite });
  }

  if (req.method === 'POST') {
    const rating = Number(req.body.rating);
    const reviewText = String(req.body.reviewText || '').trim();
    const reviewerName = String(req.body.reviewerName || '').trim();
    const publicEmail = String(req.body.publicEmail || '').trim().toLowerCase();
    const publicPhone = String(req.body.publicPhone || '').trim();
    const imageData = String(req.body.imageData || '');
    const contactConsent = req.body.contactConsent === true;
    const emailValid = !publicEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publicEmail);
    const phoneValid = !publicPhone || /^[+\d][\d\s()-]{6,24}$/.test(publicPhone);
    if (!reviewerName || !Number.isInteger(rating) || rating < 1 || rating > 5 || reviewText.length < 20 || reviewText.length > 2000) {
      return res.status(400).json({ error: 'Add your name, choose a rating, and write 20–2000 characters.' });
    }
    if ((!publicEmail && !publicPhone) || !emailValid || !phoneValid || !contactConsent) {
      return res.status(400).json({ error: 'Add a valid public email or phone number and confirm it may be displayed.' });
    }
    if (imageData && !/^data:image\/(jpeg|png|webp);base64,/.test(imageData)) {
      return res.status(400).json({ error: 'Optional image must be a JPG, PNG, or WebP file.' });
    }
    const [available] = await sql`SELECT id FROM portfolio_reviews WHERE invite_token_hash = ${tokenHash} AND status = 'invited'`;
    if (!available) return res.status(409).json({ error: 'This invitation has already been used' });

    let imageUrl: string | null = null;
    if (imageData) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      if (!cloudName || !apiKey || !apiSecret) return res.status(503).json({ error: 'Image uploads are temporarily unavailable.' });
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const folder = 'portfolio/client-reviews';
      const signature = createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest('hex');
      const uploadBody = new FormData();
      uploadBody.append('file', imageData);
      uploadBody.append('api_key', apiKey);
      uploadBody.append('timestamp', timestamp);
      uploadBody.append('folder', folder);
      uploadBody.append('signature', signature);
      const upload = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: uploadBody });
      const uploaded = await upload.json();
      if (!upload.ok || !uploaded.secure_url) return res.status(502).json({ error: 'Image upload failed. Try again without the image.' });
      imageUrl = uploaded.secure_url;
    }
    const [review] = await sql`
      UPDATE portfolio_reviews SET reviewer_name = ${reviewerName}, public_email = ${publicEmail || null}, public_phone = ${publicPhone || null}, image_url = ${imageUrl}, contact_consent = true, rating = ${rating}, review_text = ${reviewText}, status = 'pending', submitted_at = now()
      WHERE invite_token_hash = ${tokenHash} AND status = 'invited'
      RETURNING id
    `;
    if (!review) return res.status(409).json({ error: 'This invitation has already been used' });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
