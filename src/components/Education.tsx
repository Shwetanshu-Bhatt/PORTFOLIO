export default function Education() {
  const education = [
    {
      degree: "B.Tech in Computer Science Engineering",
      institution: "Graphic Era Hill University, Dehradun",
      duration: "2024 – 2027",
      details: "Currently Pursuing",
      type: "degree"
    },
    {
      degree: "Diploma in Engineering",
      institution: "Government Polytechnic Dehradun",
      duration: "2022 – 2024",
      details: "CGPA: 8",
      type: "diploma"
    },
    {
      degree: "Class 12",
      institution: "Kendriya Vidyalaya Uttarkashi (CBSE)",
      duration: "2021 – 2022",
      details: "78%",
      type: "school"
    },
    {
      degree: "Class 10",
      institution: "Masseeh Dilasa School, Uttarkashi (ICSE)",
      duration: "2019 – 2020",
      details: "90%",
      type: "school"
    }
  ];

  return (
    <section id="Education" className="py-24 px-6">
      <div className="container">
        <h2 className="section-title mb-12">Education</h2>
        
        <div className="max-w-4xl mx-auto space-y-4">
          {education.map((edu, index) => (
            <div 
              key={index} 
              className="card flex flex-col md:flex-row md:items-center gap-4 mt-2"
            >
              <div className="flex-1 ">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    edu.type === 'degree' ? 'bg-[var(--accent-primary)]' :
                    edu.type === 'diploma' ? 'bg-[var(--accent-secondary)]' :
                    'bg-[var(--accent-tertiary)]'
                  }`}></span>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{edu.degree}</h3>
                </div>
                <p className="text-[var(--text-secondary)] ml-6">{edu.institution}</p>
              </div>
              <div className="text-left md:text-right ml-6 md:ml-0">
                <span className="text-[var(--accent-primary)] font-medium block">{edu.duration}</span>
                <p className="text-[var(--text-secondary)] text-sm">{edu.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
