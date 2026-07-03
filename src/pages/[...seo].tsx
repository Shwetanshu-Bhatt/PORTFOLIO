import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// SEO page data - defines title, description, and content for each page
const seoPagesData: Record<string, {
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  content: string;
  cta: string;
}> = {
  // Location-based pages - Dehradun
  'web-developer-dehradun': {
    title: 'Web Developer in Dehradun | Best Web Development Services Uttarakhand | Shwetanshu Bhatt',
    description: 'Looking for a professional web developer in Dehradun, Uttarakhand? Shwetanshu Bhatt offers expert web development services including Next.js, React, and full-stack development. Rank #1 developer in Dehradun.',
    keywords: ['web developer dehradun', 'web developer uttarakhand', 'best web developer dehradun', 'website development dehradun', 'freelance web developer dehradun'],
    h1: 'Professional Web Developer in Dehradun, Uttarakhand',
    content: 'I am a professional web developer based in Dehradun, Uttarakhand, specializing in building modern, responsive websites and web applications. With expertise in Next.js, React, and full-stack development, I help businesses in Dehradun and across Uttarakhand establish their online presence.',
    cta: 'Hire Web Developer in Dehradun'
  },
  'full-stack-developer-dehradun': {
    title: 'Full Stack Developer Dehradun | Python, Next.js Expert | Shwetanshu Bhatt',
    description: 'Hire the best full stack developer in Dehradun. Expert in Python, JavaScript, PostgreSQL, Next.js, and AI integration. Building production-scale applications for businesses in Uttarakhand.',
    keywords: ['full stack developer dehradun', 'full stack developer uttarakhand', 'python developer dehradun', 'nextjs developer dehradun'],
    h1: 'Expert Full Stack Developer in Dehradun, Uttarakhand',
    content: 'As a full stack developer from Dehradun, I bring end-to-end development expertise. From backend systems using Python and PostgreSQL to beautiful frontends with Next.js, I deliver complete solutions for businesses in Uttarakhand and beyond.',
    cta: 'Hire Full Stack Developer'
  },
  'backend-developer-dehradun': {
    title: 'Backend Developer Dehradun | Python, PostgreSQL, API Expert | Shwetanshu Bhatt',
    description: 'Expert backend developer in Dehradun specializing in Python, PostgreSQL, REST APIs, and fault-tolerant architectures. Building production-scale backend systems for businesses.',
    keywords: ['backend developer dehradun', 'python developer dehradun', 'api developer dehradun', 'database developer dehradun'],
    h1: 'Professional Backend Developer in Dehradun',
    content: 'Specialized backend development services in Dehradun. I build robust, scalable backend systems using Python, PostgreSQL, and modern API architectures. My fault-tolerant designs have reduced operational costs by 95% for clients.',
    cta: 'Hire Backend Developer'
  },
  'python-developer-dehradun': {
    title: 'Python Developer Dehradun | AI, ML, Backend Expert | Shwetanshu Bhatt',
    description: 'Top Python developer in Dehradun. Expert in AI integration, backend development, automation, and database systems. Building production-scale Python applications.',
    keywords: ['python developer dehradun', 'python programmer dehradun', 'django developer dehradun'],
    h1: 'Best Python Developer in Dehradun, Uttarakhand',
    content: 'Expert Python developer offering services in AI integration, backend development, automation, and system design. Based in Dehradun, serving clients across Uttarakhand with production-grade Python solutions.',
    cta: 'Hire Python Developer'
  },
  'ai-developer-dehradun': {
    title: 'AI Developer Dehradun | AI Integration Expert | OpenAI, Gemini, Groq | Shwetanshu Bhatt',
    description: 'AI developer in Dehradun specializing in OpenAI, Gemini, and Groq API integration. Building AI-powered applications and intelligent systems for businesses in Uttarakhand.',
    keywords: ['ai developer dehradun', 'AI integration dehradun', 'openai developer dehradun', 'chatgpt integration dehradun'],
    h1: 'AI Developer in Dehradun - AI Integration Expert',
    content: 'Specialized AI development services in Dehradun. I integrate OpenAI, Gemini, Groq and other AI providers to build intelligent applications. Expertise in prompt engineering and AI validation layers.',
    cta: 'Build AI Solution'
  },
  'freelance-developer-dehradun': {
    title: 'Freelance Web Developer Dehradun | Hire Best Freelancer Uttarakhand | Shwetanshu Bhatt',
    description: 'Hire a freelance web developer in Dehradun. Professional freelance developer offering web development, backend development, and AI integration services in Uttarakhand.',
    keywords: ['freelance developer dehradun', 'freelance web developer dehradun', 'freelancer dehradun', 'hire developer dehradun'],
    h1: 'Freelance Developer in Dehradun - Available for Hire',
    content: 'Professional freelance developer based in Dehradun, Uttarakhand. Offering flexible engagement models for web development, backend systems, and AI integration projects.',
    cta: 'Hire Freelance Developer'
  },
  
  // Location-based pages - Uttarakhand
  'web-developer-uttarakhand': {
    title: 'Web Developer Uttarakhand | Best Website Development Services | Shwetanshu Bhatt',
    description: 'Professional web developer serving all of Uttarakhand. Expert in Next.js, React, full-stack development. Building websites and web applications for businesses across the state.',
    keywords: ['web developer uttarakhand', 'website development uttarakhand', 'best developer uttarakhand'],
    h1: 'Top Web Developer Serving Uttarakhand',
    content: 'I provide professional web development services to businesses throughout Uttarakhand. From Dehradun to Haridwar, Rishikesh to Haldwani, I help businesses establish their online presence with modern, responsive websites.',
    cta: 'Get Web Development Services'
  },
  'full-stack-developer-uttarakhand': {
    title: 'Full Stack Developer Uttarakhand | Python & JavaScript Expert | Shwetanshu Bhatt',
    description: 'Full stack developer serving Uttarakhand. Expert in Python, JavaScript, Next.js, PostgreSQL, and AI integration. Building complete web solutions for businesses across the state.',
    keywords: ['full stack developer uttarakhand', 'full stack programmer uttarakhand'],
    h1: 'Full Stack Developer Serving Uttarakhand',
    content: 'End-to-end full stack development services for businesses across Uttarakhand. I build complete web applications from database design to frontend implementation.',
    cta: 'Hire Full Stack Developer'
  },
  'python-developer-uttarakhand': {
    title: 'Python Developer Uttarakhand | AI & Backend Expert | Shwetanshu Bhatt',
    description: 'Expert Python developer serving Uttarakhand. Specializing in AI integration, backend development, and automation solutions for businesses across the state.',
    keywords: ['python developer uttarakhand', 'python programmer uttarakhand'],
    h1: 'Python Developer Serving Uttarakhand',
    content: 'Professional Python development services for Uttarakhand businesses. Specializing in AI integration, backend systems, and automation solutions.',
    cta: 'Hire Python Developer'
  },
  
  // Personal Brand Pages
  'shwetanshu-bhatt': {
    title: 'Shwetanshu Bhatt | Backend Developer & AI Systems Expert | Dehradun, Uttarakhand',
    description: 'Shwetanshu Bhatt - Professional backend developer and AI systems expert based in Dehradun, Uttarakhand. Building production-scale AI-integrated backend systems. Reduced operational costs by 95%.',
    keywords: ['shwetanshu bhatt', 'shwetanshu bhatt developer', 'shwetanshu bhatt dehradun', 'shwetanshu bhatt uttarakhand'],
    h1: 'Shwetanshu Bhatt - Backend Developer & AI Systems Expert',
    content: 'Hi, I am Shwetanshu Bhatt, a backend developer and AI systems expert based in Dehradun, Uttarakhand. I specialize in building production-scale AI-integrated backend systems that have reduced operational costs by 95% and generation time by 90%.',
    cta: 'View My Work'
  },
  'shwetanshu-bhatt-developer': {
    title: 'Shwetanshu Bhatt Developer | Python, Next.js, AI Integration Expert',
    description: 'Shwetanshu Bhatt - Full stack developer specializing in Python, Next.js, PostgreSQL, and AI integration. Building production-scale applications.',
    keywords: ['shwetanshu bhatt developer', 'shwetanshu programmer', 'shwetanshu software engineer'],
    h1: 'Shwetanshu Bhatt - Software Developer',
    content: 'I am Shwetanshu Bhatt, a software developer specializing in Python, JavaScript, PostgreSQL, and AI integration. I build production-scale applications with fault-tolerant architectures.',
    cta: 'View My Projects'
  },
  'shwetanshu-bhatt-dehradun': {
    title: 'Shwetanshu Bhatt Dehradun | Web Developer Uttarakhand | Shwetanshu Bhatt',
    description: 'Shwetanshu Bhatt - Professional web and backend developer based in Dehradun, Uttarakhand. Expert in Python, Next.js, AI systems development.',
    keywords: ['shwetanshu bhatt dehradun', 'developer dehradun', 'shwetanshu bhatt uttarakhand developer'],
    h1: 'Shwetanshu Bhatt - Developer in Dehradun, Uttarakhand',
    content: 'I am Shwetanshu Bhatt, a professional developer based in Dehradun, Uttarakhand. I offer web development, backend development, and AI integration services to businesses in Dehradun and across Uttarakhand.',
    cta: 'Contact Shwetanshu'
  },
  
  // Service Pages
  'website-development': {
    title: 'Website Development Services | Professional Web Developer | Shwetanshu Bhatt',
    description: 'Professional website development services. Modern, responsive websites built with Next.js, React, and modern technologies. SEO-friendly and performance-optimized.',
    keywords: ['website development', 'web development services', 'professional website developer'],
    h1: 'Professional Website Development Services',
    content: 'I offer comprehensive website development services including responsive website design, e-commerce solutions, and custom web applications. Every website is built with modern technologies for optimal performance.',
    cta: 'Get a Quote'
  },
  'backend-development': {
    title: 'Backend Development Services | Python, PostgreSQL Expert | Shwetanshu Bhatt',
    description: 'Expert backend development services. Scalable APIs, database design, and server-side applications using Python, PostgreSQL, and modern architectures.',
    keywords: ['backend development', 'backend developer', 'api development', 'server side development'],
    h1: 'Professional Backend Development Services',
    content: 'Specialized backend development services including REST API development, database design, authentication systems, and scalable server architectures. Built with Python, PostgreSQL, and best practices.',
    cta: 'Discuss Your Project'
  },
  'python-development': {
    title: 'Python Development Services | AI, Backend, Automation | Shwetanshu Bhatt',
    description: 'Expert Python development services. AI integration, backend systems, automation scripts, and data processing solutions.',
    keywords: ['python development', 'python programmer', 'python services'],
    h1: 'Professional Python Development Services',
    content: 'Comprehensive Python development services including AI integration, backend development, automation, and custom Python applications. Expertise in OpenAI, Gemini, Groq APIs.',
    cta: 'Hire Python Developer'
  },
  'ai-integration': {
    title: 'AI Integration Services | ChatGPT, GPT-4, Gemini Integration | Shwetanshu Bhatt',
    description: 'Professional AI integration services. Integrate OpenAI, GPT-4, Gemini, and other AI APIs into your applications. Build intelligent, AI-powered solutions.',
    keywords: ['AI integration', 'chatgpt integration', 'openai integration', 'AI API integration'],
    h1: 'Expert AI Integration Services',
    content: 'I specialize in integrating AI capabilities into existing systems. From OpenAI and GPT-4 to Gemini and Groq, I help businesses leverage the power of artificial intelligence.',
    cta: 'Integrate AI Now'
  },
  'api-development': {
    title: 'API Development Services | REST API Expert | Shwetanshu Bhatt',
    description: 'Professional API development services. Design and build scalable REST APIs with proper documentation, authentication, and error handling.',
    keywords: ['API development', 'REST API', 'api developer', 'web API'],
    h1: 'Professional API Development Services',
    content: 'Expert API development services including REST API design, GraphQL APIs, authentication systems, API documentation, and comprehensive testing.',
    cta: 'Develop Your API'
  },
  'database-design': {
    title: 'Database Design Services | PostgreSQL Expert | Shwetanshu Bhatt',
    description: 'Professional database design and optimization services. PostgreSQL, MySQL, database architecture, and performance tuning.',
    keywords: ['database design', 'postgresql developer', 'database optimization'],
    h1: 'Professional Database Design Services',
    content: 'Expert database design services including schema architecture, PostgreSQL development, query optimization, and database performance tuning.',
    cta: 'Design Your Database'
  },
  'freelance-web-developer': {
    title: 'Freelance Web Developer | Hire Expert Freelancer | Shwetanshu Bhatt',
    description: 'Hire a freelance web developer. Professional freelance services for website development, backend systems, and AI integration.',
    keywords: ['freelance web developer', 'hire freelance developer', 'freelance programmer'],
    h1: 'Freelance Web Developer Services',
    content: 'Professional freelance web development services. Flexible engagement models for businesses of all sizes. From small websites to complex web applications.',
    cta: 'Hire Freelance Developer'
  },
  
  // Skill Pages
  'nextjs-developer': {
    title: 'Next.js Developer | React & Next.js Expert | Shwetanshu Bhatt',
    description: 'Expert Next.js developer. Building modern React applications with Next.js, server-side rendering, and optimal performance.',
    keywords: ['nextjs developer', 'next.js developer', 'react developer', 'nextjs expert'],
    h1: 'Professional Next.js Developer',
    content: 'Specialized Next.js development services. Building modern, fast, SEO-friendly web applications with React and Next.js framework.',
    cta: 'Build with Next.js'
  },
  'postgresql-developer': {
    title: 'PostgreSQL Developer | Database Expert | Shwetanshu Bhatt',
    description: 'Expert PostgreSQL developer. Database design, query optimization, and PostgreSQL-based solutions.',
    keywords: ['postgresql developer', 'postgresql expert', 'postgres developer'],
    h1: 'Professional PostgreSQL Developer',
    content: 'Expert PostgreSQL development services including database design, query optimization, stored procedures, and performance tuning.',
    cta: 'Get PostgreSQL Help'
  },
  'docker-developer': {
    title: 'Docker Developer | Containerization Expert | Shwetanshu Bhatt',
    description: 'Docker and containerization services. Dockerize your applications for easy deployment and scaling.',
    keywords: ['docker developer', 'containerization', 'docker expert'],
    h1: 'Docker & Containerization Services',
    content: 'Professional Docker services including containerization, Docker Compose, deployment automation, and infrastructure setup.',
    cta: 'Containerize Your App'
  },
  
  // Contact & Hire Pages
  'hire-me': {
    title: 'Hire Me | Web Developer & AI Expert Available for Work | Shwetanshu Bhatt',
    description: 'Hire Shwetanshu Bhatt for your web development and AI integration projects. Available for freelance work and full-time opportunities.',
    keywords: ['hire me', 'hire developer', 'available for work', 'freelance hire'],
    h1: 'Hire Shwetanshu Bhatt - Available for Projects',
    content: 'I am available for web development, backend development, and AI integration projects. Whether you need a freelance developer for a specific project or ongoing partnership, let us discuss how I can help.',
    cta: 'Get in Touch'
  },
  'contact': {
    title: 'Contact | Get in Touch | Shwetanshu Bhatt',
    description: 'Contact Shwetanshu Bhatt for web development, backend development, and AI integration services in Dehradun and Uttarakhand.',
    keywords: ['contact', 'contact developer', 'get in touch'],
    h1: 'Get in Touch',
    content: 'Feel free to contact me for any web development, backend development, or AI integration projects. I am based in Dehradun, Uttarakhand, and work with clients globally.',
    cta: 'Send a Message'
  },
  'resume': {
    title: 'Resume | Shwetanshu Bhatt - Backend Developer & AI Systems Expert',
    description: 'View the resume of Shwetanshu Bhatt - Backend Developer with expertise in Python, PostgreSQL, Next.js, and AI Integration.',
    keywords: ['resume', 'cv', 'shwetanshu bhatt resume'],
    h1: 'Shwetanshu Bhatt - Resume',
    content: 'Download my resume to learn more about my experience, skills, and achievements in backend development and AI systems.',
    cta: 'Download Resume'
  },
  'blog': {
    title: 'Blog | Technical Articles & Insights | Shwetanshu Bhatt',
    description: 'Technical blog featuring articles on web development, Python, AI integration, and software engineering.',
    keywords: ['blog', 'technical blog', 'articles', 'tutorials'],
    h1: 'Technical Blog & Articles',
    content: 'Read my technical articles on web development, Python programming, AI integration, and software engineering best practices.',
    cta: 'Read Articles'
  }
};

// Default SEO data for unknown pages
const defaultSEO = {
  title: 'Shwetanshu Bhatt | Backend Developer & AI Systems Expert | Dehradun, Uttarakhand',
  description: 'Professional backend developer and AI systems expert in Dehradun, Uttarakhand. Building production-scale AI-integrated backend systems with Python, PostgreSQL, and Next.js.',
  keywords: ['backend developer', 'AI developer', 'python developer', 'web developer dehradun', 'uttarakhand'],
  h1: 'Shwetanshu Bhatt - Backend Developer & AI Systems Expert',
  content: 'I am Shwetanshu Bhatt, a backend developer and AI systems expert based in Dehradun, Uttarakhand. I specialize in building production-scale AI-integrated backend systems using Python, PostgreSQL, and modern technologies.',
  cta: 'Get in Touch'
};

export default function SEOPage() {
  const router = useRouter();
  const { seo } = router.query;
  
  // Get the page key from the URL path
  const pageKey: string = Array.isArray(seo) ? seo.join('/') : (seo || '');
  const pageData = seoPagesData[pageKey] || defaultSEO;
  
  return (
    <>
      <Head>
        <title>{pageData.title}</title>
        <meta name="description" content={pageData.description} />
        <meta name="keywords" content={pageData.keywords.join(', ')} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageData.title} />
        <meta property="og:description" content={pageData.description} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={pageData.title} />
        <meta property="twitter:description" content={pageData.description} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://shwetanshubhatt.apsgroupco.com/${pageKey}/`} />
        
        {/* Additional SEO */}
        <meta name="author" content="Shwetanshu Bhatt" />
        <meta name="robots" content="index, follow" />
        <meta name="geo.region" content="IN-UT" />
        <meta name="geo.placename" content="Dehradun" />
        
        {/* Structured Data - Person */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Shwetanshu Bhatt",
              "jobTitle": "Backend Developer",
              "url": "https://shwetanshubhatt.apsgroupco.com",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Dehradun",
                "addressRegion": "Uttarakhand",
                "addressCountry": "IN"
              },
              "email": "shwetanshubhatt@gmail.com",
              "sameAs": [
                "https://github.com/Shwetanshu-Bhatt",
                "https://linkedin.com/in/shwetanshu-bhatt"
              ]
            })
          }}
        />
        
        {/* Structured Data - LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Shwetanshu Bhatt - Web Developer Dehradun",
              "description": pageData.description,
              "url": `https://shwetanshubhatt.apsgroupco.com/${pageKey}/`,
              "telephone": "+91-9456XXXXXX",
              "email": "shwetanshubhatt@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Dehradun",
                "addressRegion": "Uttarakhand",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "30.3165",
                "longitude": "78.0322"
              },
              "openingHours": "Mo-Fr 09:00-18:00",
              "priceRange": "$$"
            })
          }}
        />
        
        {/* Structured Data - Service */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": pageData.h1,
              "description": pageData.description,
              "provider": {
                "@type": "Person",
                "name": "Shwetanshu Bhatt",
                "url": "https://shwetanshubhatt.apsgroupco.com"
              },
              "areaServed": {
                "@type": "State",
                "name": "Uttarakhand"
              },
              "serviceType": "Web Development"
            })
          }}
        />
      </Head>
      
      <div style={{
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#ffffff'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '3rem 2rem'
        }}>
          {/* Navigation */}
          <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Link href="/" style={{ 
              color: '#fff', 
              textDecoration: 'none',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              Shwetanshu Bhatt
            </Link>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link href="/#about" style={{ color: '#aaa', textDecoration: 'none' }}>About</Link>
              <Link href="/#skills" style={{ color: '#aaa', textDecoration: 'none' }}>Skills</Link>
              <Link href="/#experience" style={{ color: '#aaa', textDecoration: 'none' }}>Experience</Link>
              <Link href="/#contact" style={{ color: '#aaa', textDecoration: 'none' }}>Contact</Link>
            </div>
          </nav>
          
          {/* Main Content */}
          <header style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {pageData.h1}
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#aaa',
              lineHeight: '1.8'
            }}>
              {pageData.content}
            </p>
          </header>
          
          {/* Keywords Section */}
          <section style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#00d4ff' }}>
              Services Offered:
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {pageData.keywords.slice(0, 8).map((keyword: string, index: number) => (
                <span key={index} style={{
                  background: 'rgba(124, 58, 237, 0.3)',
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  fontSize: '0.875rem'
                }}>
                  {keyword}
                </span>
              ))}
            </div>
          </section>
          
          {/* CTA Section */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <Link 
              href="/#contact"
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
                color: '#fff',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block'
              }}
            >
              {pageData.cta}
            </Link>
            <Link 
              href="/#projects"
              style={{
                background: 'transparent',
                border: '2px solid rgba(255,255,255,0.3)',
                color: '#fff',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block'
              }}
            >
              View My Work
            </Link>
          </div>
          
          {/* Contact Info */}
          <section style={{
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Contact Information:</h3>
            <p style={{ color: '#aaa', marginBottom: '0.5rem' }}>📧 shwetanshubhatt@gmail.com</p>
            <p style={{ color: '#aaa', marginBottom: '0.5rem' }}>📍 Dehradun, Uttarakhand, India</p>
            <p style={{ color: '#aaa' }}>🔗 <a href="https://github.com/Shwetanshu-Bhatt" style={{ color: '#00d4ff' }}>GitHub</a> | <a href="https://linkedin.com/in/shwetanshu-bhatt" style={{ color: '#00d4ff' }}>LinkedIn</a></p>
          </section>
          
          {/* Footer */}
          <footer style={{
            marginTop: '4rem',
            textAlign: 'center',
            color: '#666',
            paddingTop: '2rem'
          }}>
            <p>© {new Date().getFullYear()} Shwetanshu Bhatt. All rights reserved.</p>
            <p>Backend Developer | AI Systems | Python | Dehradun, Uttarakhand</p>
          </footer>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Object.keys(seoPagesData).map((key) => ({
    params: { seo: key.split('/') }
  }));
  
  return {
    paths,
    fallback: false // Changed from 'blocking' to false - all pages must be pre-rendered
  };
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: 60 // ISR: regenerate page every 60 seconds
  };
};
