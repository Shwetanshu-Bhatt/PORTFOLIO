'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
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
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Data states
  const [projects, setProjects] = useState<Project[]>(typedProjects.projects);
  const [skills, setSkills] = useState<SkillCategory[]>(typedSkills.categories);
  const [experiences, setExperiences] = useState<Experience[]>(typedExperience.experiences);
  const [education, setEducation] = useState<Education[]>(typedEducation.education);
  const [personal, setPersonal] = useState<Personal>(typedPersonal);

  const updateProjects = (next: Project[]) => { setProjects(next); setHasUnsavedChanges(true); };
  const updateSkills = (next: SkillCategory[]) => { setSkills(next); setHasUnsavedChanges(true); };
  const updateExperiences = (next: Experience[]) => { setExperiences(next); setHasUnsavedChanges(true); };
  const updateEducation = (next: Education[]) => { setEducation(next); setHasUnsavedChanges(true); };
  const updatePersonal = (next: Personal) => { setPersonal(next); setHasUnsavedChanges(true); };

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
    let cancelled = false;

    async function loadContent() {
      try {
        const authResponse = await fetch('/api/admin/auth');
        const auth = await authResponse.json();
        if (!auth.authenticated) {
          await router.push('/admin/login');
          return;
        }

        const contentResponse = await fetch('/api/admin/content');
        const content = await contentResponse.json();
        if (!contentResponse.ok) throw new Error(content.error || 'Could not load portfolio content.');
        if (cancelled) return;

        setProjects(content.projects.projects);
        setSkills(content.skills.categories);
        setExperiences(content.experience.experiences);
        setEducation(content.education.education);
        setPersonal(content.personal);
        setHasUnsavedChanges(false);
        setLoading(false);
      } catch (error) {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : 'Could not load portfolio content.');
        setLoading(false);
      }
    }

    void loadContent();
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const saveChanges = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projects: { projects },
          skills: { categories: skills },
          experience: { experiences },
          education: { education },
          personal,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save changes.');
      setHasUnsavedChanges(false);
      setMessage('Changes saved. Open the live portfolio to verify them.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save changes.');
    } finally {
      setIsSaving(false);
    }
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
    
    setMessage('Backup JSON exported.');
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

  if (loadError) {
    return <div className="admin-load-error"><strong>Could not load your portfolio content.</strong><p>{loadError}</p><button className="admin-primary-button" onClick={() => window.location.reload()}>Try again</button></div>;
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
        <header className="admin-topbar"><div><span className="admin-eyebrow">{activeTab === 'reviews' ? 'Client proof' : 'Portfolio content'}</span><h1>{tabInfo[activeTab].label}</h1><p>{tabInfo[activeTab].description}</p></div>{activeTab !== 'reviews' && <div className="admin-actions"><span className={`admin-save-status${hasUnsavedChanges ? ' is-dirty' : ''}`}>{hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}</span><button onClick={saveChanges} className="admin-primary-button" disabled={isSaving || !hasUnsavedChanges}>{isSaving ? 'Saving…' : 'Save changes'}</button><button onClick={exportJSON} className="admin-secondary-button">Export backup</button></div>}</header>

        {/* Message */}
        {message && (
          <div className="admin-message"><span>✓</span>{message}</div>
        )}

        {/* Content Editors */}
        <div className="admin-content">
          {activeTab === 'projects' && (
            <ProjectsEditor projects={projects} setProjects={updateProjects} />
          )}
          {activeTab === 'skills' && (
            <SkillsEditor skills={skills} setSkills={updateSkills} />
          )}
          {activeTab === 'experience' && (
            <ExperienceEditor experiences={experiences} setExperiences={updateExperiences} />
          )}
          {activeTab === 'education' && (
            <EducationEditor education={education} setEducation={updateEducation} />
          )}
          {activeTab === 'personal' && (
            <PersonalEditor personal={personal} setPersonal={updatePersonal} />
          )}
          {activeTab === 'reviews' && <ReviewsManager projects={projects} />}
        </div>
      </main>
    </div>
  );
}

// Projects Editor
function ProjectsEditor({ projects, setProjects }: { projects: Project[]; setProjects: (p: Project[]) => void }) {
  const [uploadingProjectId, setUploadingProjectId] = useState<string | null>(null);

  const addProject = () => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      title: 'New Project',
      description: '',
      tech: [],
      link: '#',
      stats: [],
      featured: projects.length === 0,
      image: ''
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

  const setFeatured = (index: number) => {
    setProjects(projects.map((project, projectIndex) => ({ ...project, featured: projectIndex === index })));
  };

  const uploadProjectImage = async (index: number, file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
      window.alert('Choose a JPG, PNG, or WebP image smaller than 3 MB.');
      return;
    }
    setUploadingProjectId(projects[index].id);
    try {
      const imageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read that image.'));
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/admin/upload-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageData, folder: 'portfolio/projects' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image upload failed.');
      updateProject(index, 'image', data.url);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Image upload failed.');
    } finally {
      setUploadingProjectId(null);
    }
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
          <div className="admin-project-feature"><div><strong>{project.featured ? 'Featured project' : 'Standard project'}</strong><span>{project.featured ? 'Shown in the large highlighted layout.' : 'Shown in the regular project grid.'}</span></div><button type="button" className={project.featured ? 'is-featured' : ''} onClick={() => setFeatured(index)}>{project.featured ? 'Currently featured' : 'Make featured'}</button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Project title"><input
              type="text"
              value={project.title}
              onChange={(e) => updateProject(index, 'title', e.target.value)}
              placeholder="Project Title"
              className="input-field"
            /></AdminField>
          <AdminField label="Project image" hint="Optional. Upload first, then save changes to publish this project." wide><div className="admin-project-image-control"><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingProjectId === project.id} onChange={e => uploadProjectImage(index, e.target.files?.[0])} />{uploadingProjectId === project.id && <small className="admin-upload-status">Uploading image…</small>}{project.image && <><Image src={project.image} alt="Project preview" width={640} height={360} unoptimized /><button type="button" onClick={() => updateProject(index, 'image', '')}>Remove image</button></>}</div></AdminField>
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
        </div>
      </div>
    </div>
  );
}
