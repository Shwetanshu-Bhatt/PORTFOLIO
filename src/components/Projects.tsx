import Image from 'next/image';
import { projects as staticProjects, type Project } from '@/data';

export default function Projects({ projects = staticProjects.projects }: { projects?: Project[] }) {
  const featured = projects.find(project => project.featured) || projects[0];
  const rest = featured ? projects.filter(project => project.id !== featured.id) : [];

  if (!featured) {
    return <section className="site-section" id="projects"><div className="section-inner"><div className="projects-heading"><div><div className="section-mark">Selected work</div><h2 className="section-heading">Things <em>shipped.</em></h2></div><p className="projects-intro">Projects will appear here as soon as they are published from the content studio.</p></div></div></section>;
  }

  return (
    <section className="site-section" id="projects">
      <div className="section-inner">
        <div className="projects-heading">
          <div>
            <div className="section-mark">Selected work</div>
            <h2 className="section-heading">Things I&apos;ve <em>shipped.</em></h2>
          </div>
          <p className="projects-intro">A small archive of production-minded builds, experiments, and systems that earned their complexity.</p>
        </div>

        <article className="featured-project">
          <div className="featured-project-copy"><div><span className="case-number">Featured project</span><h3>{featured.title}</h3><p className="project-description">{featured.description}</p></div><div><div className="project-meta">{featured.tech.slice(0, 6).map(tech => <span key={tech}>{tech}</span>)}</div>{featured.link !== '#' && <a className="featured-project-link" href={featured.link} target="_blank" rel="noreferrer">View project <span>↗</span></a>}</div></div>
          {featured.image ? <a className="featured-project-image" href={featured.link !== '#' ? featured.link : undefined} target={featured.link !== '#' ? '_blank' : undefined} rel="noreferrer"><Image src={featured.image} alt={`${featured.title} project preview`} width={900} height={700} unoptimized /></a> : <div className="featured-project-visual" aria-label={`${featured.title} abstract visual`}><span className="visual-label">Featured / selected</span><span className="visual-code">BUILD  →  TEST<br />VALIDATE  →  SHIP<br /><br />STATUS: LIVE</span></div>}
        </article>

        <div className="project-list">
          {rest.map((project, index) => {
            const className = `project-card${rest.length % 2 === 1 && index === rest.length - 1 ? ' is-wide' : ''}`;
            const contents = <><span className="case-number">Case study / {String(index + 1).padStart(3, '0')}</span><h4>{project.title}</h4><p>{project.description}</p><div className="project-card-footer"><span>{project.tech.slice(0, 2).join(' / ')}</span><span>{project.link !== '#' ? '↗' : '—'}</span></div></>;
            return project.link !== '#' ? <a className={className} href={project.link} key={project.id} target="_blank" rel="noreferrer">{contents}</a> : <article className={className} key={project.id}>{contents}</article>;
          })}
        </div>
      </div>
    </section>
  );
}
