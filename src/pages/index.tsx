import Head from "next/head";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>Shwetanshu Bhatt — Backend + AI Systems</title>
        <meta name="description" content="Shwetanshu Bhatt is a backend developer and AI systems engineer building reliable products, APIs, and automation." />
        <meta name="author" content="Shwetanshu Bhatt" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Shwetanshu Bhatt — Backend + AI Systems" />
        <meta property="og:description" content="Backend systems and AI integrations built to stay calm under load." />
        <link rel="canonical" href="https://shwetanshubhatt.apsgroupco.com/" />
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
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
