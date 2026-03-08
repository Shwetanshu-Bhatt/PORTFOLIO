import { projects } from '@/data';

export default function Projects() {
  return (
    <section id="Projects" className="py-24 px-6">
      <div className="container">
        <h2 className="section-title mb-2">Projects</h2>
        <p className="text-[var(--text-secondary)] text-center mb-12 max-w-2xl mx-auto">
          Building scalable solutions with modern technologies
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.projects.map((project, index) => (
            project.link !== "#" ? (
            <a 
              key={project.id || index} 
              href={project.link}
              className="card block group h-full flex flex-col"
            >
              <h3 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors duration-300">
                {project.title}
              </h3>
              
              <p className="text-[var(--text-secondary)] mt-3 mb-4 text-sm leading-relaxed flex-grow">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((t, tIndex) => (
                  <span 
                    key={tIndex}
                    className="text-xs px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-primary)]/50 text-[var(--text-secondary)] transition-all duration-300 group-hover:border-[var(--accent-primary)]/30 group-hover:text-[var(--text-primary)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
              
              {project.stats.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--border-color)]">
                  {project.stats.map((stat, sIndex) => (
                    <span 
                      key={sIndex}
                      className="text-xs px-2 py-1 rounded bg-[var(--accent-tertiary)]/10 text-[var(--accent-tertiary)] border border-[var(--accent-tertiary)]/20"
                    >
                      {stat}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex items-center text-[var(--accent-primary)] text-sm font-medium group-hover:gap-2 transition-all duration-300">
                View Project 
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
            ) : (
            <div 
              key={project.id || index}
              className="card group h-full flex flex-col"
            >
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                {project.title}
              </h3>
              
              <p className="text-[var(--text-secondary)] mt-3 mb-4 text-sm leading-relaxed flex-grow">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((t, tIndex) => (
                  <span 
                    key={tIndex}
                    className="text-xs px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-primary)]/50 text-[var(--text-secondary)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
              
              {project.stats.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--border-color)]">
                  {project.stats.map((stat, sIndex) => (
                    <span 
                      key={sIndex}
                      className="text-xs px-2 py-1 rounded bg-[var(--accent-tertiary)]/10 text-[var(--accent-tertiary)] border border-[var(--accent-tertiary)]/20"
                    >
                      {stat}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-4">
              </div>
            </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
}

