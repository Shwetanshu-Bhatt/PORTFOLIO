import Image from 'next/image';
import { projects as staticProjects, type Project } from '@/data';

export default function Projects({ projects = staticProjects.projects }: { projects?: Project[] }) {
  const featured = projects.find(project => project.featured) || projects[0];
  const rest = featured ? projects.filter(project => project.id !== featured.id) : [];
  const featuredStat = featured?.stats[0] || "";
  const metricMatch = featuredStat.match(/^(\d+(?:\.\d+)?%?|\d+×)\s*(.*)$/i);
  const metricValue = metricMatch?.[1] || "";
  const metricLabel = metricMatch?.[2] || featuredStat;

  if (!featured) {
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

        <article className="featured-project">
          <div className="featured-project-copy"><div><span className="case-number">Featured project</span><h3>{featured.title}</h3><p className="project-description">{featured.description}</p></div><div><div className="project-meta">{featured.tech.slice(0, 6).map(tech => <span key={tech}>{tech}</span>)}</div>{featured.link !== '#' && <a className="featured-project-link" href={featured.link} target="_blank" rel="noreferrer">View project <span>↗</span></a>}</div></div>
          {featured.image ? <a className="featured-project-image" href={featured.link !== '#' ? featured.link : undefined} target={featured.link !== '#' ? '_blank' : undefined} rel="noreferrer"><Image src={featured.image} alt={`${featured.title} project preview`} width={900} height={700} unoptimized /></a> : <div className="featured-project-visual case-dashboard" role="img" aria-label={metricValue ? `${featured.title}: ${metricValue} ${metricLabel}` : featured.title}><div className="case-dashboard-top"><span>Project outcome</span></div>{metricValue && <div className="case-dashboard-result"><strong>{metricValue}</strong><small>{metricLabel}</small></div>}</div>}
        </article>

        <div className="project-list">
          {rest.map((project) => {
            const contents = <><h4>{project.title}</h4><p>{project.description}</p><div className="project-card-footer"><span>{project.tech.slice(0, 2).join(' / ')}</span>{project.link !== '#' && <span aria-label="View project">↗</span>}</div></>;
            return project.link !== '#' ? <a className="project-card" href={project.link} key={project.id} target="_blank" rel="noreferrer">{contents}</a> : <article className="project-card" key={project.id}>{contents}</article>;
          })}
        </div>
      </div>
    </section>
  );
}
