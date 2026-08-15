import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import type { NextApiRequest } from 'next';
import { promisify } from 'util';
import { sql } from '@/lib/db';

export const ADMIN_COOKIE_NAME = 'admin_auth';
const scrypt = promisify(scryptCallback);

function tokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function verifyAdminPassword(password: string) {
  const [admin] = await sql`SELECT id, password_salt, password_hash FROM portfolio_admins WHERE username = 'admin'`;
  if (!admin || !password) return null;
  const candidate = await scrypt(password, Buffer.from(admin.password_salt, 'hex'), 64) as Buffer;
  const expected = Buffer.from(admin.password_hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected) ? admin.id as string : null;
}

export async function createAdminSession(adminId: string) {
  const token = randomBytes(32).toString('hex');
  await sql`DELETE FROM portfolio_admin_sessions WHERE expires_at <= now()`;
  await sql`INSERT INTO portfolio_admin_sessions (admin_id, token_hash, expires_at) VALUES (${adminId}, ${tokenHash(token)}, now() + interval '24 hours')`;
  return token;
}

export async function isAdmin(req: NextApiRequest) {
  const token = req.cookies[ADMIN_COOKIE_NAME];
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  const [session] = await sql`SELECT id FROM portfolio_admin_sessions WHERE token_hash = ${tokenHash(token)} AND expires_at > now()`;
  return Boolean(session);
}

export async function destroyAdminSession(req: NextApiRequest) {
  const token = req.cookies[ADMIN_COOKIE_NAME];
  if (token) await sql`DELETE FROM portfolio_admin_sessions WHERE token_hash = ${tokenHash(token)}`;
}
