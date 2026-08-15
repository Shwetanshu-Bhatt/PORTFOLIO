'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { Project, SkillCategory, Experience, Education, Personal } from '@/data';
import initialProjects from '@/data/projects.json';
import initialSkills from '@/data/skills.json';
import initialExperience from '@/data/experience.json';
import initialEducation from '@/data/education.json';
import initialPersonal from '@/data/personal.json';
import ReviewsManager from '@/components/admin/ReviewsManager';

// Type assertions for JSON imports
const typedProjects = initialProjects as { projects: Project[] };
const typedSkills = initialSkills as { categories: SkillCategory[] };
const typedExperience = initialExperience as { experiences: Experience[] };
const typedEducation = initialEducation as { education: Education[] };
const typedPersonal = initialPersonal as Personal;

type Tab = 'projects' | 'skills' | 'experience' | 'education' | 'personal' | 'reviews';
type EducationType = Education['type'];

const tabInfo: Record<Tab, { label: string; description: string; icon: string }> = {
  projects: { label: 'Projects', description: 'Manage the work shown in your portfolio.', icon: '▦' },
  skills: { label: 'Skills', description: 'Group the tools and technologies you work with.', icon: '✦' },
  experience: { label: 'Experience', description: 'Keep your professional timeline up to date.', icon: '◫' },
  education: { label: 'Education', description: 'Manage degrees, diplomas, and education details.', icon: '◇' },
  personal: { label: 'Profile', description: 'Update your headline, links, and contact information.', icon: '○' },
  reviews: { label: 'Reviews', description: 'Invite verified clients and moderate submitted feedback.', icon: '★' },
};

function AdminField({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: ReactNode }) {
  return <label className={`admin-field${wide ? ' admin-field-wide' : ''}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [message, setMessage] = useState('');

  // Data states
  const [projects, setProjects] = useState<Project[]>(typedProjects.projects);
  const [skills, setSkills] = useState<SkillCategory[]>(typedSkills.categories);
  const [experiences, setExperiences] = useState<Experience[]>(typedExperience.experiences);
  const [education, setEducation] = useState<Education[]>(typedEducation.education);
  const [personal, setPersonal] = useState<Personal>(typedPersonal);

  const selectTab = (tab: Tab) => {
    setActiveTab(tab);
    void router.replace({ pathname: '/admin', query: tab === 'projects' ? {} : { section: tab } }, undefined, { shallow: true });
  };

  useEffect(() => {
    if (!router.isReady) return;
    const section = String(router.query.section || 'projects');
    if (section in tabInfo) setActiveTab(section as Tab);
  }, [router.isReady, router.query.section]);

  useEffect(() => {
    // Check authentication
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/admin/login');
        } else {
          setLoading(false);
          // Load from localStorage if available
          const saved = localStorage.getItem('portfolio_admin_data');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.projects) setProjects(parsed.projects);
            if (parsed.skills) setSkills(parsed.skills);
            if (parsed.experiences) setExperiences(parsed.experiences);
            if (parsed.education) setEducation(parsed.education);
            if (parsed.personal) setPersonal(parsed.personal);
          }
        }
      });
  }, [router]);

  const saveToLocalStorage = () => {
    const data = { projects, skills, experiences, education, personal };
    localStorage.setItem('portfolio_admin_data', JSON.stringify(data));
    setMessage('Draft saved in this browser. Export JSON when you are ready to publish it.');
    setTimeout(() => setMessage(''), 3000);
  };

  const exportJSON = () => {
    const data = {
      projects: { projects },
      skills: { categories: skills },
      experience: { experiences },
      education: { education },
      personal
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-data-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setMessage('JSON exported! Update the files in src/data/ folder.');
    setTimeout(() => setMessage(''), 5000);
  };

  const logout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span>SB</span><div><strong>Portfolio</strong><small>Content studio</small></div></div>
        <nav className="admin-nav" aria-label="Portfolio sections">
          <p>Content</p>
          {(['projects', 'skills', 'experience', 'education', 'personal'] as Tab[]).map((tab) => <button key={tab} onClick={() => selectTab(tab)} className={activeTab === tab ? 'is-active' : ''}><span>{tabInfo[tab].icon}</span>{tabInfo[tab].label}</button>)}
          <p>Client work</p>
          <button onClick={() => selectTab('reviews')} className={activeTab === 'reviews' ? 'is-active' : ''}><span>★</span> Reviews</button>
        </nav>
        <div className="admin-sidebar-footer"><Link href="/" target="_blank">View live portfolio <span>↗</span></Link><button onClick={logout}>Log out</button></div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar"><div><span className="admin-eyebrow">{activeTab === 'reviews' ? 'Client proof' : 'Portfolio content'}</span><h1>{tabInfo[activeTab].label}</h1><p>{tabInfo[activeTab].description}</p></div>{activeTab !== 'reviews' && <div className="admin-actions"><button onClick={saveToLocalStorage} className="admin-secondary-button">Save draft</button><button onClick={exportJSON} className="admin-primary-button">Export to publish</button></div>}</header>

        {/* Message */}
        {message && (
          <div className="admin-message"><span>✓</span>{message}</div>
        )}

        {/* Content Editors */}
        <div className="admin-content">
          {activeTab === 'projects' && (
            <ProjectsEditor projects={projects} setProjects={setProjects} />
          )}
          {activeTab === 'skills' && (
            <SkillsEditor skills={skills} setSkills={setSkills} />
          )}
          {activeTab === 'experience' && (
            <ExperienceEditor experiences={experiences} setExperiences={setExperiences} />
          )}
          {activeTab === 'education' && (
            <EducationEditor education={education} setEducation={setEducation} />
          )}
          {activeTab === 'personal' && (
            <PersonalEditor personal={personal} setPersonal={setPersonal} />
          )}
          {activeTab === 'reviews' && <ReviewsManager />}
        </div>
      </main>
    </div>
  );
}

// Projects Editor
function ProjectsEditor({ projects, setProjects }: { projects: Project[]; setProjects: (p: Project[]) => void }) {
  const addProject = () => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      title: 'New Project',
      description: '',
      tech: [],
      link: '#',
      stats: []
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = <K extends keyof Project>(index: number, field: K, value: Project[K]) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Projects</h2>
        <button onClick={addProject} className="btn-primary px-4 py-2 text-sm">
          + Add Project
        </button>
      </div>
      {projects.map((project, index) => (
        <div key={project.id} className="card">
          <div className="admin-card-heading"><span>Project {String(index + 1).padStart(2, '0')}</span><strong>{project.title || 'Untitled project'}</strong></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Project title"><input
              type="text"
              value={project.title}
              onChange={(e) => updateProject(index, 'title', e.target.value)}
              placeholder="Project Title"
              className="input-field"
            /></AdminField>
            <AdminField label="Project link" hint="Use # when there is no public link yet."><input
              type="text"
              value={project.link}
              onChange={(e) => updateProject(index, 'link', e.target.value)}
              placeholder="Project Link"
              className="input-field"
            /></AdminField>
            <AdminField label="Description" wide><textarea
              value={project.description}
              onChange={(e) => updateProject(index, 'description', e.target.value)}
              placeholder="Description"
              rows={3}
              className="input-field md:col-span-2"
            /></AdminField>
            <AdminField label="Technologies" hint="Separate each technology with a comma." wide><input
              type="text"
              value={project.tech.join(', ')}
              onChange={(e) => updateProject(index, 'tech', e.target.value.split(',').map(s => s.trim()))}
              placeholder="Technologies (comma separated)"
              className="input-field md:col-span-2"
            /></AdminField>
            <AdminField label="Results or stats" hint="Optional. Example: 90% faster, 10k users." wide><input
              type="text"
              value={project.stats.join(', ')}
              onChange={(e) => updateProject(index, 'stats', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Stats (comma separated, optional)"
              className="input-field md:col-span-2"
            /></AdminField>
          </div>
          <button
            onClick={() => removeProject(index)}
            className="mt-4 text-red-400 hover:text-red-300 text-sm"
          >
            Remove Project
          </button>
        </div>
      ))}
    </div>
  );
}

// Skills Editor
function SkillsEditor({ skills, setSkills }: { skills: SkillCategory[]; setSkills: (s: SkillCategory[]) => void }) {
  const addCategory = () => {
    const newCategory: SkillCategory = {
      id: `category-${Date.now()}`,
      title: 'New Category',
      skills: [],
      color: 'var(--accent-primary)'
    };
    setSkills([...skills, newCategory]);
  };

  const updateCategory = <K extends keyof SkillCategory>(index: number, field: K, value: SkillCategory[K]) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
  };

  const removeCategory = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Skills</h2>
        <button onClick={addCategory} className="btn-primary px-4 py-2 text-sm">
          + Add Category
        </button>
      </div>
      {skills.map((category, index) => (
        <div key={category.id} className="card">
          <div className="admin-card-heading"><span>Skill group {String(index + 1).padStart(2, '0')}</span><strong>{category.title || 'Untitled category'}</strong></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Category name"><input
              type="text"
              value={category.title}
              onChange={(e) => updateCategory(index, 'title', e.target.value)}
              placeholder="Category Title"
              className="input-field"
            /></AdminField>
            <AdminField label="Accent color"><select
              value={category.color}
              onChange={(e) => updateCategory(index, 'color', e.target.value)}
              className="input-field"
            >
              <option value="var(--accent-primary)">Primary (Indigo)</option>
              <option value="var(--accent-secondary)">Secondary (Violet)</option>
              <option value="var(--accent-tertiary)">Tertiary (Purple)</option>
            </select></AdminField>
            <AdminField label="Skills" hint="Separate each skill with a comma." wide><input
              type="text"
              value={category.skills.join(', ')}
              onChange={(e) => updateCategory(index, 'skills', e.target.value.split(',').map(s => s.trim()))}
              placeholder="Skills (comma separated)"
              className="input-field md:col-span-2"
            /></AdminField>
          </div>
          <button
            onClick={() => removeCategory(index)}
            className="mt-4 text-red-400 hover:text-red-300 text-sm"
          >
            Remove Category
          </button>
        </div>
      ))}
    </div>
  );
}

// Experience Editor
function ExperienceEditor({ experiences, setExperiences }: { experiences: Experience[]; setExperiences: (e: Experience[]) => void }) {
  const addExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      role: 'New Role',
      company: 'Company Name',
      duration: 'Start – End',
      description: [''],
      highlights: []
    };
    setExperiences([...experiences, newExp]);
  };

  const updateExperience = <K extends keyof Experience>(index: number, field: K, value: Experience[K]) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Experience</h2>
        <button onClick={addExperience} className="btn-primary px-4 py-2 text-sm">
          + Add Experience
        </button>
      </div>
      {experiences.map((exp, index) => (
        <div key={exp.id} className="card">
          <div className="admin-card-heading"><span>Experience {String(index + 1).padStart(2, '0')}</span><strong>{exp.role || 'Untitled role'}</strong></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminField label="Role"><input
              type="text"
              value={exp.role}
              onChange={(e) => updateExperience(index, 'role', e.target.value)}
              placeholder="Role"
              className="input-field"
            /></AdminField>
            <AdminField label="Company"><input
              type="text"
              value={exp.company}
              onChange={(e) => updateExperience(index, 'company', e.target.value)}
              placeholder="Company"
              className="input-field"
            /></AdminField>
            <AdminField label="Duration"><input
              type="text"
              value={exp.duration}
              onChange={(e) => updateExperience(index, 'duration', e.target.value)}
              placeholder="Duration"
              className="input-field"
            /></AdminField>
            <AdminField label="Responsibilities" hint="Write one point per line." wide><textarea
              value={exp.description.join('\n')}
              onChange={(e) => updateExperience(index, 'description', e.target.value.split('\n'))}
              placeholder="Description points (one per line)"
              rows={5}
              className="input-field md:col-span-3"
            /></AdminField>
            <AdminField label="Highlights" hint="Separate achievements with a comma." wide><input
              type="text"
              value={exp.highlights.join(', ')}
              onChange={(e) => updateExperience(index, 'highlights', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Highlights (comma separated)"
              className="input-field md:col-span-3"
            /></AdminField>
          </div>
          <button
            onClick={() => removeExperience(index)}
            className="mt-4 text-red-400 hover:text-red-300 text-sm"
          >
            Remove Experience
          </button>
        </div>
      ))}
    </div>
  );
}

// Education Editor
function EducationEditor({ education, setEducation }: { education: Education[]; setEducation: (e: Education[]) => void }) {
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      degree: 'Degree Name',
      institution: 'Institution Name',
      duration: 'Year – Year',
      details: '',
      type: 'degree'
    };
    setEducation([...education, newEdu]);
  };

  const updateEducation = <K extends keyof Education>(index: number, field: K, value: Education[K]) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Education</h2>
        <button onClick={addEducation} className="btn-primary px-4 py-2 text-sm">
          + Add Education
        </button>
      </div>
      {education.map((edu, index) => (
        <div key={edu.id} className="card">
          <div className="admin-card-heading"><span>Education {String(index + 1).padStart(2, '0')}</span><strong>{edu.degree || 'Untitled qualification'}</strong></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Degree or qualification"><input
              type="text"
              value={edu.degree}
              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
              placeholder="Degree"
              className="input-field"
            /></AdminField>
            <AdminField label="Institution"><input
              type="text"
              value={edu.institution}
              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
              placeholder="Institution"
              className="input-field"
            /></AdminField>
            <AdminField label="Duration"><input
              type="text"
              value={edu.duration}
              onChange={(e) => updateEducation(index, 'duration', e.target.value)}
              placeholder="Duration"
              className="input-field"
            /></AdminField>
            <AdminField label="Education type"><select
              value={edu.type}
              onChange={(e) => updateEducation(index, 'type', e.target.value as EducationType)}
              className="input-field"
            >
              <option value="degree">Degree</option>
              <option value="diploma">Diploma</option>
              <option value="school">School</option>
            </select></AdminField>
            <AdminField label="Details" hint="Optional. Example: CGPA 8.5." wide><input
              type="text"
              value={edu.details}
              onChange={(e) => updateEducation(index, 'details', e.target.value)}
              placeholder="Details (e.g., CGPA: 8.5)"
              className="input-field md:col-span-2"
            /></AdminField>
          </div>
          <button
            onClick={() => removeEducation(index)}
            className="mt-4 text-red-400 hover:text-red-300 text-sm"
          >
            Remove Education
          </button>
        </div>
      ))}
    </div>
  );
}

// Personal Editor
function PersonalEditor({ personal, setPersonal }: { personal: Personal; setPersonal: (p: Personal) => void }) {
  const updateField = (field: keyof Personal, value: string) => {
    setPersonal({ ...personal, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">Personal Information</h2>
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminField label="Full name"><input
            type="text"
            value={personal.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Full Name"
            className="input-field"
          /></AdminField>
          <AdminField label="Professional title"><input
            type="text"
            value={personal.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Title"
            className="input-field"
          /></AdminField>
          <AdminField label="Short headline" wide><input
            type="text"
            value={personal.subtitle}
            onChange={(e) => updateField('subtitle', e.target.value)}
            placeholder="Subtitle"
            className="input-field md:col-span-2"
          /></AdminField>
          <AdminField label="About you" wide><textarea
            value={personal.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Description"
            rows={3}
            className="input-field md:col-span-2"
          /></AdminField>
          <AdminField label="Email"><input
            type="email"
            value={personal.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="Email"
            className="input-field"
          /></AdminField>
          <AdminField label="GitHub URL"><input
            type="text"
            value={personal.github}
            onChange={(e) => updateField('github', e.target.value)}
            placeholder="GitHub URL"
            className="input-field"
          /></AdminField>
          <AdminField label="LinkedIn URL"><input
            type="text"
            value={personal.linkedin}
            onChange={(e) => updateField('linkedin', e.target.value)}
            placeholder="LinkedIn URL"
            className="input-field"
          /></AdminField>
          <AdminField label="Resume path"><input
            type="text"
            value={personal.resume}
            onChange={(e) => updateField('resume', e.target.value)}
            placeholder="Resume Path"
            className="input-field"
          /></AdminField>
        </div>
      </div>
    </div>
  );
}
