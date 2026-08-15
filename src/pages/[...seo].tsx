import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { personal, projects } from '@/data';

const SITE_URL = 'https://shwetanshubhatt.sifakalabs.in';

type ServicePage = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  serviceType: string;
  keywords: string[];
  services: { title: string; description: string }[];
  idealFor: string[];
};

const servicePages: Record<string, ServicePage> = {
  'freelance-developer-dehradun': {
    title: 'Freelance Developer in Dehradun | Shwetanshu Bhatt',
    description: 'Freelance software developer in Dehradun building websites, backend APIs, automation, and AI integrations for startups and local businesses.',
    h1: 'Freelance developer in Dehradun for serious software projects.',
    intro: 'I help businesses turn a clear problem into dependable software—from the first technical plan to deployment. Based in Dehradun, I work with clients across Uttarakhand and remotely throughout India.',
    serviceType: 'Freelance software development',
    keywords: ['freelance developer Dehradun', 'freelancer Dehradun', 'software developer Dehradun', 'freelance web developer Dehradun', 'developer for hire Uttarakhand'],
    services: [
      { title: 'Product development', description: 'Responsive web applications with practical user flows, secure APIs, and production deployment.' },
      { title: 'Backend engineering', description: 'Python and Node.js APIs, PostgreSQL data models, authentication, queues, and resilient workers.' },
      { title: 'AI and automation', description: 'Useful AI integrations with validation, retries, provider fallbacks, and human-review boundaries.' },
    ],
    idealFor: ['Startups needing an MVP or production feature', 'Local businesses replacing manual workflows', 'Teams needing focused backend or AI support'],
  },
  'web-developer-dehradun': {
    title: 'Web Developer in Dehradun | Websites & Web Apps',
    description: 'Web developer in Dehradun creating responsive, fast, SEO-ready websites and custom web applications with Next.js and React.',
    h1: 'Web development in Dehradun, built around your business.',
    intro: 'I design and build responsive websites and web applications that are easy to use, fast to load, and straightforward to maintain. Every build starts with the business outcome—not a generic template.',
    serviceType: 'Web development',
    keywords: ['web developer Dehradun', 'website developer Dehradun', 'website development Dehradun', 'freelance web developer Dehradun', 'web development Uttarakhand'],
    services: [
      { title: 'Business websites', description: 'Clear service pages, mobile-first layouts, contact journeys, analytics readiness, and technical SEO.' },
      { title: 'Custom web applications', description: 'Dashboards, portals, booking flows, admin panels, and authenticated user experiences.' },
      { title: 'Modernization', description: 'Performance, responsive design, accessibility, API wiring, and deployment improvements for existing sites.' },
    ],
    idealFor: ['Businesses establishing a credible online presence', 'Founders launching a web product', 'Teams modernizing an existing website'],
  },
  'backend-developer-dehradun': {
    title: 'Backend Developer in Dehradun | APIs & PostgreSQL',
    description: 'Backend developer in Dehradun specializing in Python, Node.js, PostgreSQL, REST APIs, authentication, and reliable production systems.',
    h1: 'Backend systems that stay reliable after launch.',
    intro: 'I build backend software for products that need more than basic CRUD: reliable APIs, careful data models, background processing, integrations, recovery paths, and observable failure states.',
    serviceType: 'Backend development',
    keywords: ['backend developer Dehradun', 'Python developer Dehradun', 'API developer Dehradun', 'PostgreSQL developer Dehradun', 'backend development Uttarakhand'],
    services: [
      { title: 'API engineering', description: 'REST APIs with authentication, authorization, validation, documentation, and predictable errors.' },
      { title: 'Database design', description: 'PostgreSQL schemas, migrations, query design, data integrity, and performance-focused access patterns.' },
      { title: 'Reliable processing', description: 'Queues, scheduled jobs, retries, idempotent workflows, monitoring, and recovery from partial failures.' },
    ],
    idealFor: ['Products outgrowing a fragile backend', 'Teams integrating third-party services', 'Businesses automating data-heavy workflows'],
  },
  'full-stack-developer-dehradun': {
    title: 'Full-Stack Developer in Dehradun | Next.js & Python',
    description: 'Full-stack developer in Dehradun delivering complete web products with Next.js, React, Python, Node.js, and PostgreSQL.',
    h1: 'One developer across product, frontend, backend, and deployment.',
    intro: 'For focused products, a single technical owner can reduce handoffs and keep decisions coherent. I build complete web systems while keeping frontend experience, backend correctness, and deployment constraints aligned.',
    serviceType: 'Full-stack development',
    keywords: ['full stack developer Dehradun', 'Next.js developer Dehradun', 'React developer Dehradun', 'Python full stack developer Dehradun', 'software development Uttarakhand'],
    services: [
      { title: 'Frontend', description: 'Responsive React and Next.js interfaces with accessible components and real API states.' },
      { title: 'Backend', description: 'Secure APIs, PostgreSQL persistence, uploads, integrations, jobs, and administrative workflows.' },
      { title: 'Delivery', description: 'Environment configuration, cloud deployment, production checks, and maintainable handoff.' },
    ],
    idealFor: ['MVPs needing one accountable technical owner', 'Internal tools and business portals', 'Existing products needing end-to-end features'],
  },
  'ai-developer-dehradun': {
    title: 'AI Developer in Dehradun | Practical AI Integration',
    description: 'AI developer in Dehradun integrating OpenAI, Gemini, Groq, and retrieval workflows into reliable business software.',
    h1: 'AI integration that behaves like production software.',
    intro: 'I add AI capabilities where they create measurable value, then engineer the validation, fallbacks, review paths, and data boundaries required to operate them safely.',
    serviceType: 'AI integration and automation',
    keywords: ['AI developer Dehradun', 'AI integration Dehradun', 'OpenAI developer Dehradun', 'automation developer Dehradun', 'AI software developer Uttarakhand'],
    services: [
      { title: 'LLM integration', description: 'Structured model outputs, provider routing, validation, prompt versioning, and cost-aware execution.' },
      { title: 'Knowledge workflows', description: 'Retrieval, document processing, classification, extraction, and human-reviewed recommendations.' },
      { title: 'AI automation', description: 'Background pipelines with checkpoints, retries, monitoring, and explicit handling of uncertain results.' },
    ],
    idealFor: ['Teams adding AI to an existing product', 'Businesses processing repetitive knowledge work', 'Products requiring controlled multi-provider AI'],
  },
};

export default function ServicePage({ slug }: { slug: string }) {
  const page = servicePages[slug];
  const canonical = `${SITE_URL}/${slug}/`;
  const relatedPages = Object.entries(servicePages).filter(([key]) => key !== slug).slice(0, 3);
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: page.title, description: page.description, inLanguage: 'en-IN', isPartOf: { '@id': `${SITE_URL}/#website` }, about: { '@id': `${SITE_URL}/#person` } },
      { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: personal.name, jobTitle: 'Freelance Software Developer', url: SITE_URL, image: `${SITE_URL}/images/profile.png`, email: personal.email, knowsAbout: ['Backend development', 'Web development', 'Python', 'PostgreSQL', 'Next.js', 'AI integration'], address: { '@type': 'PostalAddress', addressLocality: 'Dehradun', addressRegion: 'Uttarakhand', addressCountry: 'IN' }, sameAs: [personal.github, personal.linkedin] },
      { '@type': 'ProfessionalService', '@id': `${SITE_URL}/#business`, name: `${personal.name} — Freelance Software Development`, url: SITE_URL, email: personal.email, image: `${SITE_URL}/images/profile.png`, founder: { '@id': `${SITE_URL}/#person` }, address: { '@type': 'PostalAddress', addressLocality: 'Dehradun', addressRegion: 'Uttarakhand', addressCountry: 'IN' }, areaServed: [{ '@type': 'City', name: 'Dehradun' }, { '@type': 'State', name: 'Uttarakhand' }, { '@type': 'Country', name: 'India' }] },
      { '@type': 'Service', name: page.serviceType, description: page.description, provider: { '@id': `${SITE_URL}/#business` }, areaServed: [{ '@type': 'City', name: 'Dehradun' }, { '@type': 'State', name: 'Uttarakhand' }], url: canonical },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: page.serviceType, item: canonical }] },
    ],
  };

  return <>
    <Head>
      <title>{page.title}</title>
      <meta name="description" content={page.description} />
      <meta name="keywords" content={page.keywords.join(', ')} />
      <meta name="author" content={personal.name} />
      <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      <meta name="geo.region" content="IN-UK" />
      <meta name="geo.placename" content="Dehradun" />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="en-IN" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:site_name" content={`${personal.name} — Software Developer`} />
      <meta property="og:title" content={page.title} />
      <meta property="og:description" content={page.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={`${SITE_URL}/images/profile.png`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={page.title} />
      <meta name="twitter:description" content={page.description} />
      <meta name="twitter:image" content={`${SITE_URL}/images/profile.png`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </Head>

    <main className="seo-page">
      <nav className="seo-nav"><Link href="/">SB / Portfolio</Link><Link href="/#contact">Discuss a project →</Link></nav>
      <header className="seo-hero"><span>Based in Dehradun · Working across India</span><h1>{page.h1}</h1><p>{page.intro}</p><div className="seo-actions"><a href={`mailto:${personal.email}?subject=${encodeURIComponent(page.serviceType)}`}>Start a conversation</a><Link href="/#projects">See selected work</Link></div></header>
      <section className="seo-services"><div className="seo-section-title"><span>What I deliver</span><h2>Focused engineering, end to end.</h2></div><div className="seo-service-grid">{page.services.map((service, index) => <article key={service.title}><span>0{index + 1}</span><h3>{service.title}</h3><p>{service.description}</p></article>)}</div></section>
      <section className="seo-fit"><div><span>Good fit for</span><h2>Projects where reliability matters.</h2></div><ul>{page.idealFor.map(item => <li key={item}>{item}</li>)}</ul></section>
      <section className="seo-proof"><span>Selected proof</span><div>{projects.projects.slice(0, 3).map(project => <article key={project.id}><h3>{project.title}</h3><p>{project.description}</p>{project.link !== '#' && <a href={project.link} target="_blank" rel="noreferrer">View project ↗</a>}</article>)}</div></section>
      <section className="seo-related"><span>Related services in Dehradun</span><div>{relatedPages.map(([key, related]) => <Link key={key} href={`/${key}/`}>{related.serviceType}<span>→</span></Link>)}</div></section>
      <footer className="seo-footer"><div><strong>{personal.name}</strong><span>Freelance software developer · Dehradun, Uttarakhand</span></div><a href={`mailto:${personal.email}`}>{personal.email}</a></footer>
    </main>
  </>;
}

export const getStaticPaths: GetStaticPaths = async () => ({ paths: Object.keys(servicePages).map(slug => ({ params: { seo: [slug] } })), fallback: false });
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const seo = params?.seo;
  const slug = Array.isArray(seo) ? seo.join('/') : String(seo || '');
  return servicePages[slug] ? { props: { slug } } : { notFound: true };
};
