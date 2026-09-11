const services = [
  {
    title: "Websites & web applications",
    description: "Responsive business websites, portfolios, landing pages, dashboards, portals, booking flows, and custom web applications built with modern frontend technology.",
  },
  {
    title: "Full-stack development",
    description: "End-to-end product development with React, Next.js, JavaScript, TypeScript, Node.js, Python, secure authentication, APIs, and production deployment.",
  },
  {
    title: "Backend & API engineering",
    description: "Reliable REST APIs, database design, integrations, background jobs, queues, webhooks, performance improvements, and maintainable server-side systems.",
  },
  {
    title: "Database development",
    description: "PostgreSQL and SQL schema design, migrations, data integrity, query optimization, reporting pipelines, and dependable application persistence.",
  },
  {
    title: "AI integration & automation",
    description: "Practical OpenAI, Gemini, and Groq integrations, document workflows, retrieval, structured outputs, business automation, validation, and human review paths.",
  },
  {
    title: "Cloud & product delivery",
    description: "Docker-based delivery, Linux environments, Git workflows, cloud-ready architecture, technical SEO, performance, accessibility, monitoring, and launch support.",
  },
];

export default function Services() {
  return (
    <section className="site-section services-section" id="services">
      <div className="section-inner editorial-grid">
        <div className="section-index" aria-hidden="true">02</div>
        <div>
          <div className="section-mark">Software development services</div>
          <h2 className="section-heading">Freelance developer in <em>Dehradun.</em></h2>
          <p className="services-intro">
            I&apos;m a freelance software developer, web developer, full-stack developer, backend developer, and AI engineer based in Dehradun, Uttarakhand. I work with startups, businesses, and remote teams across India to design, build, improve, and maintain dependable digital products.
          </p>
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
