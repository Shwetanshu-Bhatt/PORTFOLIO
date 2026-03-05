import { skills } from '@/data';

export default function Skills() {
  return (
    <section id="Skills" className="py-24 px-6">
      <div className="container">
        <h2 className="section-title mb-2">Skills</h2>
        <p className="text-[var(--text-secondary)] text-center mb-12 max-w-2xl mx-auto">
          A comprehensive toolkit built for building robust, scalable backend systems
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.categories.map((category, index) => (
            <div 
              key={category.id || index} 
              className="card group"
              style={{ 
                borderColor: `${category.color}20`,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4 transition-colors duration-300"
                style={{ color: category.color }}
              >
                {category.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, skillIndex) => (
                  <span 
                    key={skillIndex} 
                    className="skill-tag"
                    style={{ 
                      animationDelay: `${(index * 0.5) + (skillIndex * 0.1)}s`,
                      borderColor: `${category.color}30`
                    }}
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
