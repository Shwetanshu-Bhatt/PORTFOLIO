import Image from "next/image";
import { personal } from "@/data";

export default function Hero() {
  return (
    <section className="site-section hero-section" id="hero">
      <div className="section-inner hero-grid">
        <div>
          <p className="eyebrow">Independent software engineer / Dehradun, IN</p>
          <h1 className="hero-title">
            <span>Build</span>
            <span className="outline">the</span>
            <span className="accent-line">hard part.</span>
          </h1>
          <div className="hero-copy">
            <div className="hero-copy-line" aria-hidden="true" />
            <p>{personal.description} I care about the seams: failure states, useful abstractions, and software that stays calm under load.</p>
          </div>
          <div className="hero-actions">
            <a className="button-primary" href="#projects">Explore selected work <span className="button-arrow">↘</span></a>
            <a className="button-ghost" href={`mailto:${personal.email}`}>Start a conversation</a>
          </div>
        </div>

        <div className="hero-panel" aria-label="Profile card">
          <div className="panel-top"><span>Profile / 001</span><span>Available</span></div>
          <div className="panel-image">
            <Image src="/images/profile.png" alt={personal.name} width={425} height={587} priority />
            <div className="panel-caption">
              <strong>Shwetanshu<br />Bhatt</strong>
              <span>Backend<br />+ AI systems</span>
            </div>
          </div>
          <div className="panel-bottom"><span>Currently building</span><span>Reliable things</span></div>
        </div>
      </div>
      <a className="hero-scroll" href="#about">Scroll to inspect</a>
    </section>
  );
}
