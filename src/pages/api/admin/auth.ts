import type { NextApiRequest, NextApiResponse } from 'next';
import { ADMIN_COOKIE_NAME, createAdminSession, destroyAdminSession, isAdmin, verifyAdminPassword } from '@/lib/admin-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { password } = req.body;
    
    const adminId = await verifyAdminPassword(String(password || ''));
    if (adminId) {
      const token = await createAdminSession(adminId);
      // Set HTTP-only cookie
      res.setHeader('Set-Cookie', `${ADMIN_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
      return res.status(200).json({ success: true });
    }
    
    return res.status(401).json({ success: false, error: 'Invalid password' });
  }
  
  if (req.method === 'DELETE') {
    // Logout
    await destroyAdminSession(req);
    res.setHeader('Set-Cookie', `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
    return res.status(200).json({ success: true });
  }
  
  if (req.method === 'GET') {
    // Check auth status
    return res.status(200).json({ authenticated: await isAdmin(req) });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
