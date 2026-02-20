export default function Projects() {
  const projects = [
    {
      title: "QA Engine",
      description: "Production-scale backend system to autonomously generate and validate technical MCQs. Reduced question generation cost by 95% and generation time by 90%.",
      tech: ["Python", "PostgreSQL", "Asyncio", "Groq API", "OpenAI API", "Gemini API"],
      link: "#",
      stats: ["95% Cost Reduction", "90% Time Reduction"]
    },
    {
      title: "Portfolio Website",
      description: "Built responsive developer portfolio with modern UI and optimized performance.",
      tech: ["Next.js", "Tailwind CSS", "JavaScript"],
      link: "https://shwetanshubhatt.vercel.app/",
      stats: []
    },
    {
      title: "Hostel Management System",
      description: "Backend system to manage hostels, rooms, and student records. Designed database schema and implemented backend logic.",
      tech: ["Spring Boot", "PostgreSQL", "Thymeleaf"],
      link: "#",
      stats: []
    }
  ];

  return (
    <section id="Projects" className="py-24 px-6 bg-[#12121a]">
      <div className="container">
        <h2 className="section-title mb-2">Projects</h2>
        <p className="text-[#a0a0b0] text-center mb-12 max-w-2xl mx-auto">
          Building scalable solutions with modern technologies
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <a 
              key={index} 
              href={project.link}
              className="card block group h-full"
            >
              <h3 className="text-xl font-semibold text-[#f0f0f5] group-hover:text-[#6366f1] transition-colors">
                {project.title}
              </h3>
              
              <p className="text-[#a0a0b0] mt-3 mb-4 text-sm leading-relaxed">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((t, tIndex) => (
                  <span 
                    key={tIndex}
                    className="text-xs px-2 py-1 bg-[#6366f1]/10 text-[#6366f1] rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
              
              {project.stats.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-[#2a2a3a]">
                  {project.stats.map((stat, sIndex) => (
                    <span 
                      key={sIndex}
                      className="text-xs px-2 py-1 bg-[#ec4899]/10 text-[#ec4899] rounded"
                    >
                      {stat}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex items-center text-[#6366f1] text-sm font-medium">
                View Project 
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
