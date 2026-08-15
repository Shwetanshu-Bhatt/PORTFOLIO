import { experience } from "@/data";

export default function Experience() {
  return (
    <section className="site-section" id="experience">
      <div className="section-inner editorial-grid">
        <div className="section-index" aria-hidden="true">03</div>
        <div>
          <div className="section-mark">Experience</div>
          <h2 className="section-heading">Proof, not <em>promises.</em></h2>
          <div className="timeline">
            {experience.experiences.map((item) => (
              <article className="timeline-entry" key={item.id}>
                <div className="timeline-meta"><span>{item.duration}</span><span>01 / 01</span></div>
                <h3>{item.role}</h3>
                <p className="timeline-company">{item.company}</p>
                <ul className="timeline-list">
                  {item.description.map((description) => <li key={description}>{description}</li>)}
                </ul>
                <div className="highlight-row">
                  {item.highlights.map((highlight) => <span className="highlight-chip" key={highlight}>{highlight}</span>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
