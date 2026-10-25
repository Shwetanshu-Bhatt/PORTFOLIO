const services = [
  {
    title: "Websites & web applications",
    description: "Fast, responsive websites and web apps, with the flows and details that make them useful.",
  },
  {
    title: "Full-stack development",
    description: "Product work across React, Next.js, TypeScript, Node.js, and Python, from the first screen through production.",
  },
  {
    title: "Backend & API engineering",
    description: "APIs, integrations, background jobs, queues, and webhooks designed to stay observable and recover cleanly.",
  },
  {
    title: "Database development",
    description: "PostgreSQL schema design, migrations, query tuning, and the constraints that keep important data consistent.",
  },
  {
    title: "AI integration & automation",
    description: "Useful model integrations with structured outputs, validation, retries, and human review where it matters.",
  },
  {
    title: "Cloud & product delivery",
    description: "Deployment, performance, accessibility, monitoring, technical SEO, and the practical work around launch.",
  },
];

export default function Services() {
  return (
    <section className="site-section services-section" id="services">
      <div className="section-inner editorial-grid">
        <div className="section-index" aria-hidden="true">02</div>
        <div>
          <div className="services-header">
            <div>
              <div className="section-mark">What I can take off your plate</div>
              <h2 className="section-heading">From the first screen to <em>the last retry.</em></h2>
            </div>
            <p className="services-intro">
              Work directly with an independent software developer in Dehradun. I partner with startups, businesses, and remote teams across India to design, build, and improve dependable digital products.
            </p>
          </div>
          <div className="service-grid">
            {services.map((service, index) => (
              <article className="service-card" key={service.title}>
                <span>0{index + 1}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
