export default function Experience() {
  const experiences = [
    {
      role: "Software Engineering Intern",
      company: "Neoveda Technologies",
      duration: "Oct 2025 – Feb 2026",
      description: [
        "Built backend systems from scratch using Python and PostgreSQL to support automated workflows",
        "Developed internal QA Engine that automated MCQ generation and validation pipeline",
        "Implemented lease-based locking, crash recovery, deterministic ID generation, and retry pipelines",
        "Integrated multiple AI providers (Groq, OpenAI, Gemini) with validation and correction layers",
        "Designed fault-tolerant, database-driven architecture capable of autonomous long-running execution"
      ],
      highlights: ["95% Cost Reduction", "90% Time Reduction", "Multi-AI Integration"]
    }
  ];

  return (
    <section id="Experience" className="py-24 px-6 bg-[var(--bg-primary)]">
      <div className="container">
        <h2 className="section-title mb-12">Experience</h2>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {experiences.map((exp, index) => (
            <div key={index} className="card">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-2">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)]">{exp.role}</h3>
                  <p className="text-[var(--accent-primary)] font-medium">{exp.company}</p>
                </div>
                <span className="text-[var(--text-secondary)] text-sm whitespace-nowrap">{exp.duration}</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                {exp.description.map((desc, descIndex) => (
                  <li key={descIndex} className="text-[var(--text-secondary)] flex items-start gap-3">
                    <span className="text-[var(--accent-primary)] mt-1.5 flex-shrink-0">▹</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-wrap gap-2">
                {exp.highlights.map((highlight, hlIndex) => (
                  <span 
                    key={hlIndex}
                    className="px-3 py-1 text-sm bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-full border border-[var(--accent-primary)]/30"
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
