const projects = [
    {
      title: "InvestWise",
      description: "Stock market analysis using AI.",
      link: "#",
    },
    {
      title: "Haptic Hearing System",
      description: "Converting sound into vibrations for the hearing impaired.",
      link: "#",
    },
    {
      title: "Evolutionary Maze Solver",
      description: "Solving mazes using genetic algorithms with Java Swing GUI.",
      link: "#",
    },
  ];
  
  export default function Projects() {
    return (
      <section id="projects" className="theme py-20 px-5 text-center">
        <h2 className="text-4xl font-bold">Projects</h2>
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {projects.map((project, index) => (
            <a key={index} href={project.link} className="block p-5 border-2 border-white rounded-lg hover:bg-gray-950">
              <h3 className="text-2xl font-semibold">{project.title}</h3>
              <p className="mt-2">{project.description}</p>
            </a>
          ))}
        </div>
      </section>
    );
  }
  