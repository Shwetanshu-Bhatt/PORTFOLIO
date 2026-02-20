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
    <section id="Experience" className="py-24 px-6 bg-[#12121a]">
      <div className="container">
        <h2 className="section-title mb-12">Experience</h2>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {experiences.map((exp, index) => (
            <div key={index} className="card">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-2">
                <div>
                  <h3 className="text-xl font-semibold text-[#f0f0f5]">{exp.role}</h3>
                  <p className="text-[#6366f1] font-medium">{exp.company}</p>
                </div>
                <span className="text-[#a0a0b0] text-sm whitespace-nowrap">{exp.duration}</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                {exp.description.map((desc, descIndex) => (
                  <li key={descIndex} className="text-[#a0a0b0] flex items-start gap-3">
                    <span className="text-[#6366f1] mt-1.5 flex-shrink-0">▹</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-wrap gap-2">
                {exp.highlights.map((highlight, hlIndex) => (
                  <span 
                    key={hlIndex}
                    className="px-3 py-1 text-sm bg-[#6366f1]/20 text-[#6366f1] rounded-full border border-[#6366f1]/30"
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
