import initialProjects from '@/data/projects.json';
import initialSkills from '@/data/skills.json';
import initialExperience from '@/data/experience.json';
import initialEducation from '@/data/education.json';
import initialPersonal from '@/data/personal.json';
import type { PortfolioData } from '@/data';

export const PORTFOLIO_CONTENT_ID = 'default';

export const defaultPortfolioData: PortfolioData = {
  projects: initialProjects as PortfolioData['projects'],
  skills: initialSkills as PortfolioData['skills'],
  experience: initialExperience as PortfolioData['experience'],
  education: initialEducation as PortfolioData['education'],
  personal: initialPersonal as PortfolioData['personal'],
};

export function isPortfolioData(value: unknown): value is PortfolioData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<PortfolioData>;
  return Boolean(
    data.projects && Array.isArray(data.projects.projects) &&
    data.skills && Array.isArray(data.skills.categories) &&
    data.experience && Array.isArray(data.experience.experiences) &&
    data.education && Array.isArray(data.education.education) &&
    data.personal && typeof data.personal === 'object',
  );
}

export async function loadPortfolioData(): Promise<PortfolioData> {
  if (!process.env.DATABASE_URL) return defaultPortfolioData;

  try {
    const { sql } = await import('@/lib/db');
    const [row] = await sql`SELECT content FROM portfolio_content WHERE id = ${PORTFOLIO_CONTENT_ID}`;
    return row?.content && isPortfolioData(row.content) ? row.content : defaultPortfolioData;
  } catch {
    return defaultPortfolioData;
  }
}
