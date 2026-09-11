import Head from "next/head";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Projects from "@/components/Projects";
import Reviews from "@/components/Reviews";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import type { GetServerSideProps } from 'next';
import type { Project } from '@/data';
import { loadPortfolioData } from '@/lib/portfolio-content';

export default function Home({ projects }: { projects: Project[] }) {
  const siteUrl = "https://shwetanshubhatt.sifakalabs.in/";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${siteUrl}#website`, "url": siteUrl, "name": "Shwetanshu Bhatt — Freelance Software Developer", "inLanguage": "en-IN" },
      { "@type": "WebPage", "@id": `${siteUrl}#webpage`, "url": siteUrl, "name": "Freelance Software Developer in Dehradun | Shwetanshu Bhatt", "description": "Freelance software developer in Dehradun for websites, web apps, backend APIs, AI automation, databases, and cloud-ready systems.", "isPartOf": { "@id": `${siteUrl}#website` }, "about": { "@id": `${siteUrl}#person` }, "inLanguage": "en-IN" },
      { "@type": "Person", "@id": `${siteUrl}#person`, "name": "Shwetanshu Bhatt", "jobTitle": "Freelance Software Developer", "url": siteUrl, "image": `${siteUrl}images/profile.png`, "email": "shwetanshubhatt@gmail.com", "address": { "@type": "PostalAddress", "addressLocality": "Dehradun", "addressRegion": "Uttarakhand", "addressCountry": "IN" }, "sameAs": ["https://github.com/Shwetanshu-Bhatt", "https://www.linkedin.com/in/shwetanshu-bhatt-082167257/"], "knowsAbout": ["Full-stack development", "Backend development", "Web development", "API development", "Python", "JavaScript", "Next.js", "React", "Node.js", "PostgreSQL", "Docker", "Cloud deployment", "AI integration", "Automation"] },
      { "@type": "ProfessionalService", "@id": `${siteUrl}#business`, "name": "Shwetanshu Bhatt — Freelance Software Development", "url": siteUrl, "email": "shwetanshubhatt@gmail.com", "image": `${siteUrl}images/profile.png`, "founder": { "@id": `${siteUrl}#person` }, "address": { "@type": "PostalAddress", "addressLocality": "Dehradun", "addressRegion": "Uttarakhand", "addressCountry": "IN" }, "areaServed": [{ "@type": "City", "name": "Dehradun" }, { "@type": "State", "name": "Uttarakhand" }, { "@type": "Country", "name": "India" }], "hasOfferCatalog": { "@type": "OfferCatalog", "name": "Software development services", "itemListElement": ["Website and web application development", "Full-stack development", "Backend and API development", "Python and Node.js development", "PostgreSQL database development", "AI integration and business automation"].map(name => ({ "@type": "Offer", "url": siteUrl, "itemOffered": { "@type": "Service", name, "provider": { "@id": `${siteUrl}#business` }, "areaServed": "India" } })) } }
    ]
  };

  return (
    <>
      <span style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", opacity: 0, whiteSpace: "nowrap", border: 0 }}>Impact-Site-Verification: 697ba342-725c-49c3-84b9-7a394c34a897</span>
      <Head>
        <title>Freelance Software Developer in Dehradun | Shwetanshu Bhatt</title>
        <meta name="description" content="Hire a freelance software developer in Dehradun for websites, web apps, backend APIs, Python, Next.js, PostgreSQL, AI automation, and cloud systems." />
        <meta name="keywords" content="freelance developer in Dehradun, software developer Dehradun, web developer Dehradun, website developer Dehradun, full stack developer Dehradun, backend developer Dehradun, app developer Dehradun, Python developer Dehradun, Next.js developer Dehradun, React developer Dehradun, Node.js developer Dehradun, API developer Dehradun, PostgreSQL developer Dehradun, AI developer Dehradun, automation developer Dehradun, freelance programmer Uttarakhand, software engineer India" />
        <meta name="author" content="Shwetanshu Bhatt" />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <meta name="geo.region" content="IN-UK" />
        <meta name="geo.placename" content="Dehradun" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:site_name" content="Shwetanshu Bhatt — Software Developer" />
        <meta property="og:title" content="Freelance Software Developer in Dehradun | Shwetanshu Bhatt" />
        <meta property="og:description" content="Websites, web apps, backend APIs, databases, automation, and practical AI integration from Dehradun, Uttarakhand." />
        <meta property="og:url" content="https://shwetanshubhatt.sifakalabs.in/" />
        <meta property="og:image" content="https://shwetanshubhatt.sifakalabs.in/images/profile.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Freelance Software Developer in Dehradun | Shwetanshu Bhatt" />
        <meta name="twitter:description" content="Websites, web apps, backend APIs, databases, automation, and practical AI integration." />
        <meta name="twitter:image" content="https://shwetanshubhatt.sifakalabs.in/images/profile.png" />
        <link rel="canonical" href="https://shwetanshubhatt.sifakalabs.in/" />
        <link rel="alternate" hrefLang="en-IN" href="https://shwetanshubhatt.sifakalabs.in/" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </Head>

      <div className="site-shell">
        <Navbar />
        <main className="site-main">
          <Hero />
          <About />
          <Services />
          <Skills />
          <Experience />
          <Education />
          <Projects projects={projects} />
          <Reviews />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{ projects: Project[] }> = async () => {
  const content = await loadPortfolioData();
  return { props: { projects: content.projects.projects } };
};
