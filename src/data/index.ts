import projects from './projects.json';
import skills from './skills.json';
import experience from './experience.json';
import education from './education.json';
import personal from './personal.json';

export { projects, skills, experience, education, personal };

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link: string;
  stats: string[];
  featured?: boolean;
  image?: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  skills: string[];
  color: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string[];
  highlights: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  duration: string;
  details: string;
  type: 'degree' | 'diploma' | 'school';
}

export interface Personal {
  name: string;
  title: string;
  subtitle: string;
  description: string;
  email: string;
  github: string;
  linkedin: string;
}

export interface PortfolioData {
  projects: { projects: Project[] };
  skills: { categories: SkillCategory[] };
  experience: { experiences: Experience[] };
  education: { education: Education[] };
  personal: Personal;
}
