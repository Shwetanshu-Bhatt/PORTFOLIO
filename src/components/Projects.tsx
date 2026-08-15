import { projects } from "@/data";

export default function Projects() {
  const [featured, ...rest] = projects.projects;

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
          <div className="featured-project-copy">
            <div>
              <span className="case-number">Case study / 001</span>
              <h3>QA <em>Engine</em></h3>
              <p className="project-description">{featured.description} The interesting part was not the model call — it was making the whole pipeline resumable, validated, and boring to operate.</p>
            </div>
            <div className="project-meta">
              {featured.tech.slice(0, 6).map((tech) => <span key={tech}>{tech}</span>)}
            </div>
          </div>
          <div className="featured-project-visual" aria-label="QA Engine abstract visual">
            <span className="visual-label">Signal / stable</span>
            <span className="visual-code">QUEUE  →  WORKER<br />VALIDATE  →  SHIP<br /><br />STATUS: GREEN</span>
          </div>
        </article>

        <div className="project-list">
          {rest.map((project, index) => {
            const card = (
              <article className="project-card" key={project.id}>
                <span className="case-number">Case study / {String(index + 2).padStart(3, "0")}</span>
                <h4>{project.title}</h4>
                <p>{project.description}</p>
                <div className="project-card-footer"><span>{project.tech.slice(0, 2).join(" / ")}</span><span>↗</span></div>
              </article>
            );

            return project.link !== "#" ? <a className="project-card-link" href={project.link} key={project.id} target="_blank" rel="noreferrer">{card}</a> : card;
          })}
        </div>
      </div>
    </section>
  );
}
