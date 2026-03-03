import dynamic from "next/dynamic";
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
