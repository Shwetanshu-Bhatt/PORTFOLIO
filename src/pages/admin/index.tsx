'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { Project, SkillCategory, Experience, Education, Personal } from '@/data';
import initialProjects from '@/data/projects.json';
import initialSkills from '@/data/skills.json';
import initialExperience from '@/data/experience.json';
import initialEducation from '@/data/education.json';
import initialPersonal from '@/data/personal.json';

// Type assertions for JSON imports
const typedProjects = initialProjects as { projects: Project[] };
const typedSkills = initialSkills as { categories: SkillCategory[] };
const typedExperience = initialExperience as { experiences: Experience[] };
const typedEducation = initialEducation as { education: Education[] };
const typedPersonal = initialPersonal as Personal;

type Tab = 'projects' | 'skills' | 'experience' | 'education' | 'personal';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Data states
  const [projects, setProjects] = useState<Project[]>(typedProjects.projects);
  const [skills, setSkills] = useState<SkillCategory[]>(typedSkills.categories);
  const [experiences, setExperiences] = useState<Experience[]>(typedExperience.experiences);
  const [education, setEducation] = useState<Education[]>(typedEducation.education);
  const [personal, setPersonal] = useState<Personal>(typedPersonal);

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
    setMessage('Changes saved to localStorage!');
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
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-3">
              <a href="/" target="_blank" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                View Site →
              </a>
              <button onClick={logout} className="text-sm text-red-400 hover:text-red-300 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {(['projects', 'skills', 'experience', 'education', 'personal'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={saveToLocalStorage}
              className="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--border-color)] transition-colors"
            >
              Save to Browser
            </button>
            <button
              onClick={exportJSON}
              className="px-4 py-2 rounded-lg btn-primary text-sm"
            >
              Export JSON
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
            {message}
          </div>
        )}

        {/* Content Editors */}
        <div className="space-y-6">
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
        </div>
      </div>
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

  const updateProject = (index: number, field: keyof Project, value: any) => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={project.title}
              onChange={(e) => updateProject(index, 'title', e.target.value)}
              placeholder="Project Title"
              className="input-field"
            />
            <input
              type="text"
              value={project.link}
              onChange={(e) => updateProject(index, 'link', e.target.value)}
              placeholder="Project Link"
              className="input-field"
            />
            <textarea
              value={project.description}
              onChange={(e) => updateProject(index, 'description', e.target.value)}
              placeholder="Description"
              rows={3}
              className="input-field md:col-span-2"
            />
            <input
              type="text"
              value={project.tech.join(', ')}
              onChange={(e) => updateProject(index, 'tech', e.target.value.split(',').map(s => s.trim()))}
              placeholder="Technologies (comma separated)"
              className="input-field md:col-span-2"
            />
            <input
              type="text"
              value={project.stats.join(', ')}
              onChange={(e) => updateProject(index, 'stats', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Stats (comma separated, optional)"
              className="input-field md:col-span-2"
            />
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

  const updateCategory = (index: number, field: keyof SkillCategory, value: any) => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={category.title}
              onChange={(e) => updateCategory(index, 'title', e.target.value)}
              placeholder="Category Title"
              className="input-field"
            />
            <select
              value={category.color}
              onChange={(e) => updateCategory(index, 'color', e.target.value)}
              className="input-field"
            >
              <option value="var(--accent-primary)">Primary (Indigo)</option>
              <option value="var(--accent-secondary)">Secondary (Violet)</option>
              <option value="var(--accent-tertiary)">Tertiary (Purple)</option>
            </select>
            <input
              type="text"
              value={category.skills.join(', ')}
              onChange={(e) => updateCategory(index, 'skills', e.target.value.split(',').map(s => s.trim()))}
              placeholder="Skills (comma separated)"
              className="input-field md:col-span-2"
            />
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

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={exp.role}
              onChange={(e) => updateExperience(index, 'role', e.target.value)}
              placeholder="Role"
              className="input-field"
            />
            <input
              type="text"
              value={exp.company}
              onChange={(e) => updateExperience(index, 'company', e.target.value)}
              placeholder="Company"
              className="input-field"
            />
            <input
              type="text"
              value={exp.duration}
              onChange={(e) => updateExperience(index, 'duration', e.target.value)}
              placeholder="Duration"
              className="input-field"
            />
            <textarea
              value={exp.description.join('\n')}
              onChange={(e) => updateExperience(index, 'description', e.target.value.split('\n'))}
              placeholder="Description points (one per line)"
              rows={5}
              className="input-field md:col-span-3"
            />
            <input
              type="text"
              value={exp.highlights.join(', ')}
              onChange={(e) => updateExperience(index, 'highlights', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Highlights (comma separated)"
              className="input-field md:col-span-3"
            />
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

  const updateEducation = (index: number, field: keyof Education, value: any) => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={edu.degree}
              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
              placeholder="Degree"
              className="input-field"
            />
            <input
              type="text"
              value={edu.institution}
              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
              placeholder="Institution"
              className="input-field"
            />
            <input
              type="text"
              value={edu.duration}
              onChange={(e) => updateEducation(index, 'duration', e.target.value)}
              placeholder="Duration"
              className="input-field"
            />
            <select
              value={edu.type}
              onChange={(e) => updateEducation(index, 'type', e.target.value)}
              className="input-field"
            >
              <option value="degree">Degree</option>
              <option value="diploma">Diploma</option>
              <option value="school">School</option>
            </select>
            <input
              type="text"
              value={edu.details}
              onChange={(e) => updateEducation(index, 'details', e.target.value)}
              placeholder="Details (e.g., CGPA: 8.5)"
              className="input-field md:col-span-2"
            />
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
          <input
            type="text"
            value={personal.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Full Name"
            className="input-field"
          />
          <input
            type="text"
            value={personal.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Title"
            className="input-field"
          />
          <input
            type="text"
            value={personal.subtitle}
            onChange={(e) => updateField('subtitle', e.target.value)}
            placeholder="Subtitle"
            className="input-field md:col-span-2"
          />
          <textarea
            value={personal.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Description"
            rows={3}
            className="input-field md:col-span-2"
          />
          <input
            type="email"
            value={personal.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="Email"
            className="input-field"
          />
          <input
            type="text"
            value={personal.github}
            onChange={(e) => updateField('github', e.target.value)}
            placeholder="GitHub URL"
            className="input-field"
          />
          <input
            type="text"
            value={personal.linkedin}
            onChange={(e) => updateField('linkedin', e.target.value)}
            placeholder="LinkedIn URL"
            className="input-field"
          />
          <input
            type="text"
            value={personal.resume}
            onChange={(e) => updateField('resume', e.target.value)}
            placeholder="Resume Path"
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
}
