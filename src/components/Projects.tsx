import { useState } from 'react';
import { projects as staticProjects, type Project } from '@/data';

export default function Projects({ projects = staticProjects.projects }: { projects?: Project[] }) {
  const [showAllProjects, setShowAllProjects] = useState(false);
  const orderedProjects = [...projects].sort((a, b) => a.title.localeCompare(b.title));
  const visibleProjects = showAllProjects ? orderedProjects : orderedProjects.slice(0, 4);

  if (!orderedProjects.length) {
    return null;
  }

  return (
    <section className="site-section" id="projects">
      <div className="section-inner">
        <div className="projects-heading">
          <div>
            <div className="section-mark">Selected work</div>
            <h2 className="section-heading">Projects with <em>purpose.</em></h2>
          </div>
          <p className="projects-intro">Software systems, web products, and an assistive technology prototype.</p>
        </div>

        <div className="project-list" id="project-list">
          {visibleProjects.map((project) => {
            const contents = <><h3>{project.title}</h3><p>{project.description}</p><div className="project-card-footer"><span className="project-card-tech">{project.tech.slice(0, 2).join(' / ')}</span>{project.link !== '#' && <span className="project-card-arrow" aria-hidden="true">↗</span>}</div></>;
            return project.link !== '#' ? <a className="project-card" href={project.link} key={project.id} target="_blank" rel="noreferrer">{contents}</a> : <article className="project-card" key={project.id}>{contents}</article>;
          })}
        </div>
        {orderedProjects.length > 4 && <button className="projects-toggle" type="button" aria-expanded={showAllProjects} aria-controls="project-list" onClick={() => setShowAllProjects((show) => !show)}>
          {showAllProjects ? 'Show less' : 'Show more'} <span aria-hidden="true">{showAllProjects ? '↑' : '↓'}</span>
        </button>}
      </div>
    </section>
  );
}
