import { education } from '@/data';

export default function Education() {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'degree':
        return 'bg-[var(--accent-primary)]';
      case 'diploma':
        return 'bg-[var(--accent-secondary)]';
      default:
        return 'bg-[var(--accent-tertiary)]';
    }
  };

  return (
    <section id="Education" className="py-24 px-6">
      <div className="container">
        <h2 className="section-title mb-12">Education</h2>
        
        <div className="max-w-4xl mx-auto space-y-4">
          {education.education.map((edu, index) => (
            <div 
              key={edu.id || index} 
              className="card flex flex-col md:flex-row md:items-center gap-4 group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getTypeColor(edu.type)} shadow-[0_0_8px_currentColor]`}></span>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors duration-300">
                    {edu.degree}
                  </h3>
                </div>
                <p className="text-[var(--text-secondary)] ml-5.5">{edu.institution}</p>
              </div>
              
              <div className="flex items-center gap-4 md:text-right ml-5.5 md:ml-0">
                <div>
                  <p className="text-sm text-[var(--text-secondary)] whitespace-nowrap">{edu.duration}</p>
                  <p className="text-sm text-[var(--accent-primary)] font-medium">{edu.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
