import { education } from "@/data";

export default function Education() {
  return (
    <section className="site-section" id="education">
      <div className="section-inner editorial-grid">
        <div className="section-index" aria-hidden="true">04</div>
        <div>
          <div className="section-mark">The long game</div>
          <h2 className="section-heading">Still <em>learning.</em></h2>
          <div className="education-list">
            {education.education.map((item) => (
              <div className="education-row" key={item.id}>
                <strong>{item.degree}</strong>
                <span>{item.institution}</span>
                <span>{item.duration}</span>
                <span className="education-result">{item.details}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
