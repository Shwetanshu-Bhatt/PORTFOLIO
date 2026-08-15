import { createHash } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from '@/lib/admin-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!await isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const imageData = String(req.body.imageData || '');
  const folder = req.body.folder === 'portfolio/projects' ? 'portfolio/projects' : 'portfolio/uploads';
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(imageData)) return res.status(400).json({ error: 'Choose a JPG, PNG, or WebP image.' });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return res.status(503).json({ error: 'Image uploads are not configured.' });

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest('hex');
  const body = new FormData();
  body.append('file', imageData);
  body.append('api_key', apiKey);
  body.append('timestamp', timestamp);
  body.append('folder', folder);
  body.append('signature', signature);
  const upload = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body });
  const uploaded = await upload.json();
  if (!upload.ok || !uploaded.secure_url) return res.status(502).json({ error: 'Image upload failed.' });
  return res.status(200).json({ url: uploaded.secure_url });
}

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };
