const skills = [
    "Java", "Python", "C++", "JavaScript", "TypeScript",
    "Next.js", "React", "Tailwind CSS", "AI/ML", "Neural Networks",
    "Data Structures & Algorithms", "Stock Market Analysis"
  ];
  
  export default function Skills() {
    return (
      <section id="skills" className="theme2 py-20 px-5 text-center">
        <h2 className="text-4xl font-bold">Skills</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {skills.map((skill, index) => (
            <span key={index} className="px-4 py-2 border-2 border-white rounded-lg">
              {skill}
            </span>
          ))}
        </div>
      </section>
    );
  }
  