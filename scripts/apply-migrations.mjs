import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');

const sql = neon(process.env.DATABASE_URL);
const migrations = ['001_reviews.sql', '002_admin_auth.sql', '003_review_contact.sql', '004_review_image.sql'];
for (const name of migrations) {
  const migration = await readFile(new URL(`../migrations/${name}`, import.meta.url), 'utf8');
  for (const statement of migration.split(/;\s*(?:\n|$)/).map(value => value.trim()).filter(Boolean)) {
    await sql.query(statement);
  }
}
console.log('Applied portfolio migrations');
