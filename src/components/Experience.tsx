const experiences = [
    {
      role: "Freelance Developer",
      company: "Upwork",
      duration: "2024 - Present",
      description: "Working on AI, automation, and software development projects.",
    },
    {
      role: "Stock Market Analysis Enthusiast",
      company: "Personal Research",
      duration: "Ongoing",
      description: "Developing AI models for stock prediction using InvestWise.",
    },
  ];
  
  export default function Experience() {
    return (
      <section id="experience" className="theme2 py-20 px-5 text-white text-center">
        <h2 className="text-4xl font-bold">Experience</h2>
        <div className="mt-8 max-w-3xl mx-auto">
          {experiences.map((exp, index) => (
            <div key={index} className="mb-6 p-5 border-2 border-white rounded-lg text-left">
              <h3 className="text-2xl font-semibold">{exp.role}</h3>
              <p className="text-gray-400">{exp.company} • {exp.duration}</p>
              <p className="mt-2">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  