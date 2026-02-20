export default function Skills() {
  const skillCategories = [
    {
      title: "Languages",
      skills: ["Python", "JavaScript", "C++"],
      color: "#6366f1"
    },
    {
      title: "Backend",
      skills: ["PostgreSQL", "REST APIs", "Database Design", "Concurrency Control"],
      color: "#8b5cf6"
    },
    {
      title: "AI Systems",
      skills: ["OpenAI API", "Groq API", "Gemini API", "Prompt Engineering", "AI Integration"],
      color: "#ec4899"
    },
    {
      title: "Web",
      skills: ["Next.js", "Tailwind CSS"],
      color: "#6366f1"
    },
    {
      title: "Tools",
      skills: ["Git", "Linux", "Docker"],
      color: "#8b5cf6"
    },
    {
      title: "Core CS",
      skills: ["Data Structures", "Algorithms", "System Design"],
      color: "#ec4899"
    }
  ];

  return (
    <section id="Skills" className="py-24 px-6">
      <div className="container">
        <h2 className="section-title mb-2">Skills</h2>
        <p className="text-[#a0a0b0] text-center mb-12 max-w-2xl mx-auto">
          A comprehensive toolkit built for building robust, scalable backend systems
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, index) => (
            <div 
              key={index} 
              className="card"
              style={{ borderColor: `${category.color}30` }}
            >
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: category.color }}
              >
                {category.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, skillIndex) => (
                  <span 
                    key={skillIndex} 
                    className="skill-tag"
                  >
                    {skill}
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
