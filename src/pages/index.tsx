import { GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Projects from "@/components/Projects";
import Footer from "@/components/Footer";
import NeuralNetworkBackground from "@/components/NeuralNetworkBackground";

// Lazy load Contact component
const Contact = dynamic(() => import("@/components/Contact"), {
  loading: () => (
    <section className="py-24 px-6">
      <div className="container">
        <div className="text-center">
          <div className="h-8 w-48 bg-[var(--bg-card)] rounded animate-pulse mx-auto mb-3" />
          <div className="h-6 w-64 bg-[var(--bg-card)] rounded animate-pulse mx-auto" />
        </div>
      </div>
    </section>
  ),
  ssr: false,
});

// Lazy load CursorTrail (client-only)
const CursorTrail = dynamic(() => import("@/components/CursorTrail"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Shwetanshu Bhatt | Backend Developer & AI Systems Expert | Dehradun, Uttarakhand</title>
        <meta name="description" content="Professional backend developer and AI systems expert in Dehradun, Uttarakhand. Building production-scale AI-integrated backend systems with Python, PostgreSQL, and Next.js." />
        <meta name="keywords" content="backend developer, AI developer, python developer, web developer dehradun, uttarakhand, full stack developer, nextjs developer" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Shwetanshu Bhatt | Backend Developer & AI Systems Expert" />
        <meta property="og:description" content="Building production-scale AI-integrated backend systems. Reduced operational costs by 95%." />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Shwetanshu Bhatt | Backend Developer & AI Systems Expert" />
        <meta property="twitter:description" content="Building production-scale AI-integrated backend systems. Reduced operational costs by 95%." />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://shwetanshubhatt.apsgroupco.com/" />
        
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
      </Head>
      
      {/* Neural Network Background - Full page coverage */}
      <NeuralNetworkBackground />
      
      {/* Cursor Energy Trail - only in dark mode */}
      <CursorTrail />
      
      <Navbar />
      
      <main className="pt-16 min-h-screen bg-transparent relative z-10">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Education />
        <Projects />
        <Contact />
      </main>
      
      <div className="relative z-10">
        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: 60 // ISR: regenerate page every 60 seconds
  };
};
