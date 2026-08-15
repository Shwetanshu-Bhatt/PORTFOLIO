import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const password = Buffer.concat(chunks).toString('utf8').trimEnd();
if (password.length < 10) throw new Error('Admin password must be at least 10 characters');

const salt = randomBytes(16);
const hash = await promisify(scryptCallback)(password, salt, 64);
const sql = neon(process.env.DATABASE_URL);
await sql`
  INSERT INTO portfolio_admins (username, password_salt, password_hash)
  VALUES ('admin', ${salt.toString('hex')}, ${hash.toString('hex')})
  ON CONFLICT (username) DO UPDATE
  SET password_salt = EXCLUDED.password_salt, password_hash = EXCLUDED.password_hash, updated_at = now()
`;
await sql`DELETE FROM portfolio_admin_sessions`;
console.log('Admin credential stored; existing sessions revoked');
