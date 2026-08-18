import Head from "next/head";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Projects from "@/components/Projects";
import Reviews from "@/components/Reviews";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": "https://shwetanshubhatt.sifakalabs.in/#website", "url": "https://shwetanshubhatt.sifakalabs.in/", "name": "Shwetanshu Bhatt — Freelance Software Developer", "inLanguage": "en-IN" },
      { "@type": "Person", "@id": "https://shwetanshubhatt.sifakalabs.in/#person", "name": "Shwetanshu Bhatt", "jobTitle": "Freelance Software Developer", "url": "https://shwetanshubhatt.sifakalabs.in/", "image": "https://shwetanshubhatt.sifakalabs.in/images/profile.png", "email": "shwetanshubhatt@gmail.com", "address": { "@type": "PostalAddress", "addressLocality": "Dehradun", "addressRegion": "Uttarakhand", "addressCountry": "IN" }, "sameAs": ["https://github.com/Shwetanshu-Bhatt", "https://www.linkedin.com/in/shwetanshu-bhatt-082167257/"], "knowsAbout": ["Backend development", "Web development", "Python", "PostgreSQL", "Next.js", "AI integration"] },
      { "@type": "ProfessionalService", "@id": "https://shwetanshubhatt.sifakalabs.in/#business", "name": "Shwetanshu Bhatt — Freelance Software Development", "url": "https://shwetanshubhatt.sifakalabs.in/", "email": "shwetanshubhatt@gmail.com", "founder": { "@id": "https://shwetanshubhatt.sifakalabs.in/#person" }, "address": { "@type": "PostalAddress", "addressLocality": "Dehradun", "addressRegion": "Uttarakhand", "addressCountry": "IN" }, "areaServed": [{ "@type": "City", "name": "Dehradun" }, { "@type": "State", "name": "Uttarakhand" }, { "@type": "Country", "name": "India" }] }
    ]
  };

  return (
    <>
      <span style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", opacity: 0, whiteSpace: "nowrap", border: 0 }}>Impact-Site-Verification: 697ba342-725c-49c3-84b9-7a394c34a897</span>
      <Head>
        <title>Freelance Developer in Dehradun | Shwetanshu Bhatt</title>
        <meta name="description" content="Freelance software developer in Dehradun building responsive websites, backend APIs, PostgreSQL systems, automation, and practical AI integrations." />
        <meta name="keywords" content="freelance developer Dehradun, web developer Dehradun, backend developer Dehradun, full stack developer Dehradun, AI developer Dehradun, software developer Uttarakhand" />
        <meta name="author" content="Shwetanshu Bhatt" />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <meta name="geo.region" content="IN-UK" />
        <meta name="geo.placename" content="Dehradun" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:site_name" content="Shwetanshu Bhatt — Software Developer" />
        <meta property="og:title" content="Freelance Developer in Dehradun | Shwetanshu Bhatt" />
        <meta property="og:description" content="Web development, backend systems, automation, and practical AI integration from Dehradun, Uttarakhand." />
        <meta property="og:url" content="https://shwetanshubhatt.sifakalabs.in/" />
        <meta property="og:image" content="https://shwetanshubhatt.sifakalabs.in/images/profile.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Freelance Developer in Dehradun | Shwetanshu Bhatt" />
        <meta name="twitter:description" content="Web development, backend systems, automation, and practical AI integration." />
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
          <Skills />
          <Experience />
          <Education />
          <Projects />
          <Reviews />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
