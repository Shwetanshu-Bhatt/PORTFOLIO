import { skills } from "@/data";

export default function Skills() {
  return (
    <section className="site-section skills-section" id="skills">
      <div className="section-inner editorial-grid">
        <div className="section-index" aria-hidden="true">02</div>
        <div>
          <div className="section-mark">Working stack</div>
          <h2 className="section-heading">A stack for the <em>messy parts.</em></h2>
          <div className="skill-matrix">
            {skills.categories.map((category) => (
              <div className="skill-block" key={category.id}>
                <h3>{category.title}</h3>
                <div className="skill-tags">
                  {category.skills.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
