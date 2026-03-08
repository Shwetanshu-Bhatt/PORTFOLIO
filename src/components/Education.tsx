import { education } from '@/data';

export default function Education() {
  const getTypeColor = (type?: string) => {
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
          {education?.education?.map((edu: any, index: number) => (
            <div
              key={edu?.id ?? index}
              className="card flex flex-col md:flex-row md:items-center gap-2 md:gap-6 group mb-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-1">

                  <div>
                    <h3 className="text-lg font-semibold text-center text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors duration-300">
                      {edu?.degree}
                    </h3>

                    <p className="text-[var(--text-secondary)] text-center text-sm">
                      {edu?.institution}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-0 md:min-w-[140px] pl-7 md:pl-0">
                <p className="text-sm text-[var(--text-secondary)] whitespace-nowrap">
                  {edu?.duration}
                </p>

                {edu?.details && (
                  <p className="text-sm text-[var(--accent-primary)] font-medium">
                    {edu.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}