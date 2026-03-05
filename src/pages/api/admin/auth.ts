import type { NextApiRequest, NextApiResponse } from 'next';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const AUTH_COOKIE_NAME = 'admin_auth';
const AUTH_TOKEN = 'portfolio_admin_token_' + Math.random().toString(36).substring(7);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { password } = req.body;
    
    if (password === ADMIN_PASSWORD) {
      // Set HTTP-only cookie
      res.setHeader('Set-Cookie', `${AUTH_COOKIE_NAME}=${AUTH_TOKEN}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
      return res.status(200).json({ success: true });
    }
    
    return res.status(401).json({ success: false, error: 'Invalid password' });
  }
  
  if (req.method === 'DELETE') {
    // Logout
    res.setHeader('Set-Cookie', `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
    return res.status(200).json({ success: true });
  }
  
  if (req.method === 'GET') {
    // Check auth status
    const cookie = req.headers.cookie;
    const isAuthenticated = cookie?.includes(`${AUTH_COOKIE_NAME}=${AUTH_TOKEN}`);
    return res.status(200).json({ authenticated: isAuthenticated });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
