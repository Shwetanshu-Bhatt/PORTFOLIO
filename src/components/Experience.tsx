import { experience } from '@/data';

export default function Experience() {
  return (
    <section id="Experience" className="py-24 px-6">
      <div className="container">
        <h2 className="section-title mb-12">Experience</h2>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {experience.experiences.map((exp, index) => (
            <div key={exp.id || index} className="card group">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-2">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors duration-300">
                    {exp.role}
                  </h3>
                  <p className="text-[var(--accent-primary)] font-medium">{exp.company}</p>
                </div>
                <span className="text-[var(--text-secondary)] text-sm whitespace-nowrap px-3 py-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)]/30">
                  {exp.duration}
                </span>
              </div>
              
              <ul className="space-y-3 mb-6">
                {exp.description.map((desc, descIndex) => (
                  <li key={descIndex} className="text-[var(--text-secondary)] flex items-start gap-3">
                    <span className="text-[var(--accent-primary)] mt-1.5 flex-shrink-0 text-xs">▹</span>
                    <span className="leading-relaxed">{desc}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-wrap gap-2">
                {exp.highlights.map((highlight, hlIndex) => (
                  <span 
                    key={hlIndex}
                    className="px-3 py-1 text-sm rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] transition-all duration-300 hover:bg-[var(--accent-primary)]/20 hover:scale-105"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
